import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const exclusionsPath = path.join(rootDir, 'public/config/limited_testing_exclusions.json')
const workflowsPath = path.join(rootDir, 'public/data/clinical_workflows.json')
const exclusionsPayload = JSON.parse(await readFile(exclusionsPath, 'utf8'))
const workflows = JSON.parse(await readFile(workflowsPath, 'utf8'))
const workflowIds = new Set(workflows.map((workflow) => workflow.workflow_id))

assert(Array.isArray(exclusionsPayload.exclusions), 'Exclusion config must contain an exclusions array.')
assert(exclusionsPayload.exclusions.length > 0, 'At least one limited-testing exclusion is expected.')
assert.equal(new Set(exclusionsPayload.exclusions.map((entry) => entry.workflow_id)).size, exclusionsPayload.exclusions.length, 'Excluded workflow IDs must be unique.')
for (const entry of exclusionsPayload.exclusions) {
  assert(workflowIds.has(entry.workflow_id), `Unknown excluded workflow: ${entry.workflow_id}`)
  assert(['requires_doctor_review', 'remove_or_redesign_recommended'].includes(entry.category), `${entry.workflow_id}: invalid exclusion category.`)
  assert.equal(entry.testing_status, 'excluded_from_limited_testing', `${entry.workflow_id}: invalid testing status.`)
  assert(entry.exclusion_reason.trim(), `${entry.workflow_id}: exclusion reason is required.`)
}

const configuredIds = new Set(exclusionsPayload.exclusions.map((entry) => entry.workflow_id))
const dynamicWorkflow = workflows.find((workflow) => !configuredIds.has(workflow.workflow_id))
assert(dynamicWorkflow, 'A non-excluded workflow is required for the dynamic config test.')
const dynamicExclusion = {
  workflow_id: dynamicWorkflow.workflow_id,
  exclusion_reason: 'Synthetic test-only exclusion.',
  category: 'requires_doctor_review',
  testing_status: 'excluded_from_limited_testing',
}
const servedExclusions = {
  ...exclusionsPayload,
  exclusions: [...exclusionsPayload.exclusions, dynamicExclusion],
}

const originalFetch = globalThis.fetch
globalThis.fetch = async (input) => {
  const url = typeof input === 'string' ? input : input.url
  const relativePath = new URL(url, 'http://local.test').pathname.replace(/^\/+/, '')
  let payload
  try {
    payload = relativePath === 'config/limited_testing_exclusions.json'
      ? servedExclusions
      : JSON.parse(await readFile(path.join(rootDir, 'public', relativePath), 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return new Response('', { status: 404 })
    throw error
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

const server = await createServer({
  root: rootDir,
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const { clinicnoteDataAdapter } = await server.ssrLoadModule('/src/lib/dataAdapter.ts')
  const safeCatalog = await clinicnoteDataAdapter.loadCatalog()
  const fullCatalog = await clinicnoteDataAdapter.loadCatalog(true)

  assert.equal(fullCatalog.length, workflows.length, 'Full catalog must retain every workflow.')
  assert.equal(safeCatalog.length, workflows.length - servedExclusions.exclusions.length, 'Safe catalog must derive its size from config.')
  assert(!safeCatalog.some((entry) => entry.workflowId === dynamicWorkflow.workflow_id), 'Dynamic exclusion remained visible in the safe catalog.')

  for (const exclusion of servedExclusions.exclusions) {
    const workflowId = exclusion.workflow_id
    assert.equal(await clinicnoteDataAdapter.isWorkflowExcluded(workflowId), true, `${workflowId}: exclusion lookup failed.`)
    assert.equal(await clinicnoteDataAdapter.getWorkflowSummaryById(workflowId), null, `${workflowId}: safe summary access was not blocked.`)
    assert.equal(await clinicnoteDataAdapter.getWorkflowDetails(workflowId), null, `${workflowId}: safe detail access was not blocked.`)
    assert.equal((await clinicnoteDataAdapter.getWorkflowSummaryById(workflowId, true))?.exclusion?.workflow_id, workflowId, `${workflowId}: internal exclusion metadata is unavailable.`)
    assert.equal((await clinicnoteDataAdapter.getWorkflowDetails(workflowId, true))?.summary.exclusion?.workflow_id, workflowId, `${workflowId}: internal detail inspection failed.`)
  }

  const visibleWorkflow = workflows.find((workflow) => !servedExclusions.exclusions.some((entry) => entry.workflow_id === workflow.workflow_id))
  assert(visibleWorkflow, 'A visible workflow is required.')
  assert.equal(await clinicnoteDataAdapter.isWorkflowExcluded(visibleWorkflow.workflow_id), false)
  assert(await clinicnoteDataAdapter.getWorkflowDetails(visibleWorkflow.workflow_id), 'Visible workflow details should remain accessible.')

  console.log(JSON.stringify({
    status: 'PASS',
    configured_exclusions_checked: exclusionsPayload.exclusions.length,
    dynamic_exclusion_checked: dynamicWorkflow.workflow_id,
    full_catalog_count: fullCatalog.length,
    safe_catalog_count: safeCatalog.length,
  }, null, 2))
} finally {
  await server.close()
  globalThis.fetch = originalFetch
}

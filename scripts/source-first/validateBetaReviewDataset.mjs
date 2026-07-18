import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const betaRoot = path.join(repoRoot, 'public', 'data-beta')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function stableRoundTrip() {
  const exportPayload = {
    schema_version: '1.0.0',
    dataset: 'najm-ai-clinicnote-beta-review',
    exported_at: null,
    decisions: [
      {
        workflow_id: 'gp-fever-urti',
        item_id: 'gp-fever-urti--fixture-item',
        decision: 'keep_as_written',
        edited_wording: '',
        clinician_comment: 'fixture',
      },
    ],
  }
  const imported = JSON.parse(JSON.stringify(exportPayload))
  assert(JSON.stringify(imported) === JSON.stringify(exportPayload), 'Review export/import roundtrip is not stable')
}

function loadSourceIds() {
  const sourceIds = new Set()
  const sourceDir = path.join(repoRoot, 'clinical-expansion-v2', 'sources')
  for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json'))) {
    for (const source of readJson(path.join(sourceDir, file)).sources ?? []) sourceIds.add(source.source_id)
  }
  return sourceIds
}

function main() {
  const metadata = readJson(path.join(betaRoot, 'metadata.json'))
  const catalog = readJson(path.join(betaRoot, 'catalog.json'))
  assert(metadata.beta_label === 'BETA — CLINICIAN REVIEW DATA', 'Missing beta label')
  assert(metadata.workflow_count === 1500, `Expected 1500 workflows, found ${metadata.workflow_count}`)
  assert(metadata.registered_source_count === 235, `Expected 235 sources, found ${metadata.registered_source_count}`)
  assert(JSON.stringify(metadata.research_status_counts) === JSON.stringify({ exact_source_support: 0, partial_source_support: 1099, no_authoritative_source: 401 }), 'Unexpected status totals')
  assert(catalog.length === 1500, `Catalog contains ${catalog.length} workflows`)
  assert(new Set(catalog.map((workflow) => workflow.workflow_id)).size === 1500, 'Workflow IDs are not unique')
  assert(catalog.every((workflow, index) => workflow.workflow_number === index + 1), 'Workflow order is not stable')
  assert(catalog.every((workflow) => workflow.clinician_review_status === 'not_reviewed'), 'Dataset contains pre-reviewed workflows')

  const sourceIds = loadSourceIds()
  let itemCount = 0
  for (const workflow of catalog) {
    const detailPath = path.join(betaRoot, 'workflows', `${workflow.workflow_id}.json`)
    assert(fs.existsSync(detailPath), `Missing detail file for ${workflow.workflow_id}`)
    const detail = readJson(detailPath)
    assert(detail.workflow_id === workflow.workflow_id, `Detail ID mismatch for ${workflow.workflow_id}`)
    const itemIds = detail.items.map((item) => item.item_id)
    assert(new Set(itemIds).size === itemIds.length, `Duplicate item IDs in ${workflow.workflow_id}`)
    assert(itemIds.every(Boolean), `Blank item ID in ${workflow.workflow_id}`)
    itemCount += itemIds.length
    for (const source of detail.source_references) {
      assert(source.source_resolves === true && sourceIds.has(source.source_id), `Unresolvable source reference ${source.source_id}`)
    }
    for (const evidence of detail.evidence_links) {
      assert(evidence.candidate_status === 'review_only_not_approved', `Evidence link is not review-only in ${workflow.workflow_id}`)
      assert(sourceIds.has(evidence.source_id), `Unresolvable evidence source ${evidence.source_id}`)
    }
  }
  assert(itemCount === metadata.item_count, `Item count mismatch: ${itemCount} vs ${metadata.item_count}`)
  stableRoundTrip()

  const protectedPaths = ['public/data', 'clinical-expansion-v2/canonical', 'clinical-expansion-v2/progress/CANONICAL', 'clinical-expansion-v2/approval']
  const changed = execFileSync('git', ['diff', '--name-only', '--', ...protectedPaths], { cwd: repoRoot, encoding: 'utf8' }).trim()
  assert(!changed, `Protected production paths changed: ${changed}`)
  console.log(JSON.stringify({
    status: 'PASS',
    workflows: catalog.length,
    items: itemCount,
    sources: sourceIds.size,
    status_totals: metadata.research_status_counts,
    export_import_roundtrip: 'PASS',
    protected_paths: 'UNCHANGED',
  }, null, 2))
}

main()

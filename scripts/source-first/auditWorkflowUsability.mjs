import fs from 'node:fs'
import path from 'node:path'
import { normalise } from './compactClinicianFacingItems.mjs'
const root = process.cwd(); const beta = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'beta')
const catalog = JSON.parse(fs.readFileSync(path.join(beta, 'catalog.json'), 'utf8'))
const readiness = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'WORKFLOW_READINESS.json'), 'utf8'))
const archetypes = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'WORKFLOW_ARCHETYPE_MANIFEST.json'), 'utf8')).profiles
const readyById = new Map(readiness.records.map((record) => [record.workflow_id, record]))
const counts = catalog.workflows.map((summary) => summary.user_facing_item_count).sort((a, b) => a - b)
const percentile = (p) => counts[Math.min(counts.length - 1, Math.floor(counts.length * p))]
const errors = []; const sectionsByWorkflow = {}; let evidenceProseWorkflows = 0; let nearDuplicateItems = 0; const workflowsOver50 = []; const workflowsOver100 = []; const workflowsUnder3 = []
for (const summary of catalog.workflows) {
  const detail = JSON.parse(fs.readFileSync(path.join(beta, 'workflows', `${summary.workflow_id}.json`), 'utf8'))
  const sectionCounts = {}
  const seen = []
  for (const item of detail.user_facing_items) { sectionCounts[item.section] = (sectionCounts[item.section] ?? 0) + 1; seen.push(normalise(item.final_wording)) }
  sectionsByWorkflow[summary.workflow_id] = sectionCounts
  const required = archetypes[summary.archetype]?.required_core ?? []
  const missing = required.filter((section) => section !== 'scope' && !sectionCounts[section])
  if (missing.length) errors.push(`${summary.workflow_id}: missing required sections ${missing.join(',')}`)
  if (summary.user_facing_item_count > 50) workflowsOver50.push(summary.workflow_id)
  if (summary.user_facing_item_count > 100) workflowsOver100.push(summary.workflow_id)
  if (summary.user_facing_item_count < 3) workflowsUnder3.push(summary.workflow_id)
  for (let i = 0; i < seen.length; i++) for (let j = i + 1; j < seen.length; j++) { const a = new Set(seen[i].split(' ')); const b = new Set(seen[j].split(' ')); const overlap = [...a].filter((token) => b.has(token)).length / Math.max(1, new Set([...a, ...b]).size); if (overlap >= 0.85) nearDuplicateItems += 1 }
  if (detail.user_facing_items.some((item) => !item.documentation_scaffold && /(electronic copy|document control|footer navigation|survey findings|information security code|^sign in|^patient:|page \d+ of \d+)/i.test(item.final_wording))) evidenceProseWorkflows += 1
}
const result = { status: errors.length ? 'FAIL' : 'PASS', workflow_count: catalog.usable_workflow_count, clinician_facing_item_distribution: { minimum: counts[0], median: percentile(0.5), mean: counts.reduce((sum, value) => sum + value, 0) / counts.length, p90: percentile(0.9), p95: percentile(0.95), maximum: counts.at(-1) }, workflows_over_50: workflowsOver50.length, workflows_over_100: workflowsOver100.length, workflows_under_3: workflowsUnder3.length, workflows_containing_evidence_prose: evidenceProseWorkflows, near_duplicate_items: nearDuplicateItems, sections_by_workflow: sectionsByWorkflow, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

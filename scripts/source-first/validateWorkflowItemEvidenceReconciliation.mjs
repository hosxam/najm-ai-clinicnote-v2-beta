import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const resolution = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2')
const state = JSON.parse(fs.readFileSync(path.join(resolution, 'WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
const errors = []
for (const workflowId of state.resolved_workflow_ids) {
  const file = path.join(resolution, 'reconstructed-workflows', `${workflowId}.json`)
  if (!fs.existsSync(file)) { errors.push(`${workflowId}: output missing`); continue }
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (value.legacy_item_accounting.original_count !== value.item_level_comparisons.length) errors.push(`${workflowId}: legacy accounting mismatch`)
  for (const comparison of value.item_level_comparisons) if (comparison.action === 'remove' && (!comparison.previous_item_id || !comparison.previous_wording || !comparison.removal_category || !comparison.reason || !comparison.evidence_pack_ids_assessed?.length)) errors.push(`${workflowId}: removed item lacks comparison record`)
  for (const item of value.active_items) if (!item.evidence_statement_id || !item.source_id || !item.exact_locator) errors.push(`${workflowId}: active item lacks exact evidence`)
}
const result = { status: errors.length ? 'FAIL' : 'PASS', workflows_checked: state.resolved_workflow_ids.length, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

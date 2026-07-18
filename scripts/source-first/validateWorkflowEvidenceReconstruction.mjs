import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const resolution = path.join(expansion, 'guideline-workflow-resolution-v2')
const state = JSON.parse(fs.readFileSync(path.join(resolution, 'WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
const readiness = JSON.parse(fs.readFileSync(path.join(resolution, 'WORKFLOW_READINESS.json'), 'utf8'))
const errors = []
if (state.workflow_count !== 1500) errors.push(`workflow_count=${state.workflow_count}`)
if (state.resolved_count + state.pending_count !== state.workflow_count) errors.push('resolved and pending counts do not reconcile')
if (state.resolved_workflow_ids.length !== state.resolved_count) errors.push('resolved ID count mismatch')
if (state.pending_workflow_ids.length !== state.pending_count) errors.push('pending ID count mismatch')
if (readiness.workflow_count !== state.workflow_count) errors.push('readiness workflow count mismatch')
const outputRoot = path.join(resolution, 'reconstructed-workflows')
for (const workflowId of state.resolved_workflow_ids) {
  const file = path.join(outputRoot, `${workflowId}.json`)
  if (!fs.existsSync(file)) { errors.push(`${workflowId}: reconstructed output missing`); continue }
  const output = JSON.parse(fs.readFileSync(file, 'utf8'))
  const activeStatus = ['reconstructed_complete', 'reconstructed_with_noncritical_documented_limitations'].includes(output.final_status)
  const inactiveStatus = ['retired_no_authoritative_basis', 'retired_duplicate_or_overlapping', 'retired_out_of_scope_or_unsafe', 'blocked_source_access', 'merged_into_supported_workflow'].includes(output.final_status)
  if (!activeStatus && !inactiveStatus) errors.push(`${workflowId}: invalid final status`)
  if (activeStatus && !output.active_items.length) errors.push(`${workflowId}: no active exact-evidence items`)
  for (const item of output.active_items) for (const field of ['workflow_id', 'stable_item_id', 'archetype', 'section', 'final_wording', 'action', 'normalised_evidence_pack_id', 'evidence_statement_id', 'source_id', 'official_source_url', 'exact_locator', 'population', 'setting', 'jurisdiction', 'rationale', 'source_fingerprint', 'locator_fingerprint']) if (!item[field]) errors.push(`${workflowId}: active item missing ${field}`)
  if (output.item_level_comparisons.some((item) => !item.previous_item_id || !item.previous_wording || !item.removal_category || !item.reason || !Array.isArray(item.evidence_pack_ids_assessed))) errors.push(`${workflowId}: malformed removed-item comparison`)
}
const result = { status: errors.length ? 'FAIL' : 'PASS', workflow_count: state.workflow_count, resolved: state.resolved_count, pending: state.pending_count, readiness_counts: readiness.counts, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

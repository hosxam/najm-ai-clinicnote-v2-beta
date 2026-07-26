import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const errors = []
const manifest = read('manifest.json')
const catalog = read('catalog.json')
const inactive = read('inactive-inventory.json')
const metadata = read('metadata.json')
const expected = manifest.counts

const activeIds = new Set(catalog.workflows.map((workflow) => workflow.workflow_id))
const inactiveIds = new Set(inactive.workflows.map((workflow) => workflow.workflow_id))
if (manifest.source_commit !== '58be2e806dd364d571ffe168a9a64f1fc2048141') errors.push('manifest source commit is not the validated catalogue commit')
if (manifest.counts.original_workflows !== 1500 || metadata.workflow_count !== 1500) errors.push('manifest original workflow count is incorrect')
if (metadata.usable_workflow_count !== expected.active_workflows || metadata.inactive_workflow_count !== expected.inactive_workflows || metadata.user_facing_item_count !== expected.clinician_facing_items || metadata.internal_evidence_record_count !== expected.internal_evidence_records) errors.push('metadata counts are incorrect')
if (catalog.workflows.length !== expected.active_workflows || inactive.workflows.length !== expected.inactive_workflows || activeIds.size !== expected.active_workflows || inactiveIds.size !== expected.inactive_workflows) errors.push('active/inactive cardinality is incorrect')
if ([...activeIds].some((id) => inactiveIds.has(id))) errors.push('inactive workflow appears in active catalogue')

let itemCount = 0
let evidenceCount = 0
for (const workflow of catalog.workflows) {
  if (!workflow.usable) errors.push(`${workflow.workflow_id} is not usable`) 
  const detailPath = path.join(dir, 'workflows', `${workflow.workflow_id}.json`)
  if (!fs.existsSync(detailPath)) { errors.push(`missing detail ${workflow.workflow_id}`); continue }
  const detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'))
  if (detail.workflow_id !== workflow.workflow_id || !Array.isArray(detail.user_facing_items) || !Array.isArray(detail.evidence_records)) errors.push(`invalid detail schema ${workflow.workflow_id}`)
  const itemIds = new Set()
  for (const item of detail.user_facing_items ?? []) {
    itemCount += 1
    if (itemIds.has(item.stable_item_id)) errors.push(`duplicate clinician item ${workflow.workflow_id}/${item.stable_item_id}`)
    itemIds.add(item.stable_item_id)
    if (!activeIds.has(item.workflow_id) || inactiveIds.has(item.workflow_id)) errors.push(`item references inactive/missing workflow ${item.stable_item_id}`)
    if (!Array.isArray(item.evidence_statement_ids) || item.evidence_statement_ids.length === 0) errors.push(`item has no evidence references ${item.stable_item_id}`)
    if ('evidence' in item) errors.push(`evidence duplicated into clinician-facing item ${item.stable_item_id}`)
    if (JSON.stringify(item).match(/[A-Za-z]:\\|\\Users\\|\\OpenClaw_Workspaces\\/)) errors.push(`local path exposed in item ${item.stable_item_id}`)
  }
  evidenceCount += detail.evidence_records.length
  const evidenceIds = new Set(detail.evidence_records.map((record) => record.evidence_statement_id ?? record.evidence_record_id))
  for (const item of detail.user_facing_items ?? []) for (const id of item.evidence_statement_ids ?? []) if (!evidenceIds.has(id)) errors.push(`unresolved evidence reference ${workflow.workflow_id}/${id}`)
}
if (itemCount !== expected.clinician_facing_items) errors.push(`clinician item total is ${itemCount}, expected ${expected.clinician_facing_items}`)
if (evidenceCount !== expected.internal_evidence_records) errors.push(`evidence record total is ${evidenceCount}, expected ${expected.internal_evidence_records}`)
const result = { status: errors.length ? 'FAIL' : 'PASS', original_workflows: expected.original_workflows, active_workflows: expected.active_workflows, inactive_workflows: expected.inactive_workflows, clinician_facing_items: itemCount, internal_evidence_records: evidenceCount, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

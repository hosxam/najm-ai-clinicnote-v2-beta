import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const p = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const activation = JSON.parse(fs.readFileSync(path.join(p, 'WORKFLOW_ACTIVATION_RESULTS_WAVE8.json'), 'utf8'))
const active = activation.results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence')
const errors = []
let fields = 0
let options = 0
for (const row of active) {
  const workflow = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/interactive-workflows/workflows', `${row.workflow_id}.json`), 'utf8'))
  const ids = workflow.fields.map(field => field.field_id)
  if (new Set(ids).size !== ids.length) errors.push(`${row.workflow_id}: duplicate field IDs`)
  if (workflow.fields.length < 8) errors.push(`${row.workflow_id}: insufficient structured fields`)
  if (!workflow.fields.some(field => field.soap_destination === 'assessment') || !workflow.fields.some(field => field.soap_destination === 'plan')) errors.push(`${row.workflow_id}: missing SOAP destination`)
  for (const field of workflow.fields) {
    fields += 1
    options += field.options?.length ?? 0
    if (!field.provenance?.source_ids?.length || !field.provenance?.evidence_statement_ids?.length) errors.push(`${row.workflow_id}/${field.field_id}: incomplete provenance`)
    if (field.default_value !== undefined || field.preselected === true) errors.push(`${row.workflow_id}/${field.field_id}: preselected fact`)
  }
  const detail = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/workflows', `${row.workflow_id}.json`), 'utf8'))
  if (!detail.user_facing_items.length || detail.user_facing_items.some(item => !item.evidence_statement_ids?.length)) errors.push(`${row.workflow_id}: missing evidence-backed output`) 
}
const result = { status: errors.length ? 'FAIL' : 'PASS', activated_workflows: active.length, fields, selectable_options: options, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

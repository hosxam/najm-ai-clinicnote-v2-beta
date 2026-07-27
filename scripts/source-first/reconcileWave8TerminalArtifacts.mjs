import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = file => JSON.parse(fs.readFileSync(path.join(progress, file), 'utf8'))
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targetsFile = read('WAVE8_WORKFLOW_TARGETS.json')
const targets = targetsFile.targets
const activation = read('WORKFLOW_ACTIVATION_RESULTS_WAVE8.json')
const byId = new Map(activation.results.map(row => [row.workflow_id, row]))
const sourceById = new Map(read('FAMILY_SOURCE_INGESTION_WAVE8.json').records.map(row => [row.workflow_id, row]))
const active = id => byId.get(id)?.final_state === 'activated_with_complete_authoritative_evidence'

for (const target of targets) {
  const result = byId.get(target.workflow_id)
  const source = sourceById.get(target.workflow_id)
  target.current_terminal_state = result.final_state
  target.activation_feasibility = active(target.workflow_id) ? 'complete_named_source_reuse' : 'fail_closed_named_gap'
  target.required_source_ids = source?.source_ids ?? []
  target.exact_missing_evidence = active(target.workflow_id) ? [] : ['workflow-specific authoritative section']
}
targetsFile.fingerprint = hash(targets)
fs.writeFileSync(path.join(progress, 'WAVE8_WORKFLOW_TARGETS.json'), `${JSON.stringify(targetsFile, null, 2)}\n`)

const completeness = read('WORKFLOW_COMPLETENESS_MATRIX_WAVE8.json')
for (const row of completeness.records) {
  const result = byId.get(row.workflow_id)
  const ok = active(row.workflow_id)
  row.final_terminal_state = result?.final_state ?? 'remains_inactive_missing_named_critical_evidence'
  row.activation_ready = ok
  row.named_critical_gaps = ok ? [] : ['workflow-specific authoritative section']
  row.provenance_completeness = ok ? 'complete' : 'named_gap'
  row.schema_feasibility = ok ? 'feasible' : 'fail_closed'
  row.output_feasibility = ok ? 'feasible' : 'fail_closed'
}
completeness.fingerprint = hash(completeness.records)
fs.writeFileSync(path.join(progress, 'WORKFLOW_COMPLETENESS_MATRIX_WAVE8.json'), `${JSON.stringify(completeness, null, 2)}\n`)

const schema = read('SCHEMA_DIFFERENTIATION_MATRIX_WAVE8.json')
for (const row of schema.records) {
  const id = row.workflow_id
  const interactivePath = path.join(root, 'public/data-beta/interactive-workflows/workflows', `${id}.json`)
  const finalPath = path.join(root, 'public/data-beta/final-catalogue/workflows', `${id}.json`)
  const interactive = fs.existsSync(interactivePath) ? JSON.parse(fs.readFileSync(interactivePath, 'utf8')) : { fields: [] }
  const detail = fs.existsSync(finalPath) ? JSON.parse(fs.readFileSync(finalPath, 'utf8')) : { user_facing_items: [] }
  const fields = interactive.fields ?? []
  const outputs = detail.user_facing_items ?? []
  row.schema_fingerprint = hash(fields.map(field => ({ field_id: field.field_id, type: field.field_type, section: field.section, options: field.options ?? [] })))
  row.output_fingerprint = hash(outputs.map(item => item.final_wording))
  row.shared_fields = fields.filter(field => !field.field_id.includes('__specific_')).map(field => field.field_id)
  row.unique_fields = fields.filter(field => field.field_id.includes('__specific_')).map(field => field.field_id)
  row.unique_options = fields.filter(field => field.options?.length).flatMap(field => field.options)
  row.evidence_differences = sourceById.get(id)?.source_ids ?? []
  row.final_distinctness_decision = active(id) ? 'clinically_distinct_and_source_grounded' : 'remains_inactive_named_gap'
}
schema.fingerprint = hash(schema.records)
fs.writeFileSync(path.join(progress, 'SCHEMA_DIFFERENTIATION_MATRIX_WAVE8.json'), `${JSON.stringify(schema, null, 2)}\n`)

const provenance = { schema_version: '1.0.0', field_count: 0, rows: [] }
for (const id of activation.results.filter(row => active(row.workflow_id)).map(row => row.workflow_id)) {
  const workflow = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/interactive-workflows/workflows', `${id}.json`), 'utf8'))
  for (const field of workflow.fields) {
    provenance.rows.push({ workflow_id: id, field_id: field.field_id, evidence_pack_id: field.provenance.evidence_pack_ids[0], source_ids: field.provenance.source_ids, evidence_statement_ids: field.provenance.evidence_statement_ids, population: field.provenance.population, setting: field.provenance.setting, transformation_explanation: field.provenance.transformation_explanation })
  }
}
provenance.field_count = provenance.rows.length
provenance.fingerprint = hash(provenance.rows)
fs.writeFileSync(path.join(progress, 'FIELD_PROVENANCE_WAVE8.json'), `${JSON.stringify(provenance, null, 2)}\n`)
console.log(JSON.stringify({ targets: targets.length, activated: activation.activated_count, field_count: provenance.field_count }, null, 2))

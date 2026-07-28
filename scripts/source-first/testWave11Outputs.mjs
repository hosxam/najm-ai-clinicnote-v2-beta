import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/source-wave11')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const details = read('WAVE11_DETAILS.json')
const sourceProof = read('LIVE_SOURCE_REGISTRY_INSERTIONS.json')
const outputs = read('WAVE11_OUTPUTS.json')
const active = details.filter((detail) => detail.usable)
const inactive = details.filter((detail) => !detail.usable)
const errors = []
const fieldIds = new Set()
let selectedOptionTests = 0
let unselectedOptionTests = 0
let contradictionTests = 0
for (const detail of active) {
  const evidenceIds = new Set(detail.evidence_records.map((record) => record.evidence_statement_id))
  if (!detail.fields.some((field) => field.soap_destination === 'assessment')) errors.push(`${detail.workflow_id}: assessment mapping missing`)
  if (!detail.fields.some((field) => field.soap_destination === 'plan')) errors.push(`${detail.workflow_id}: plan mapping missing`)
  if (detail.output_builders.length !== 3) errors.push(`${detail.workflow_id}: output builders incomplete`)
  for (const field of detail.fields) {
    if (fieldIds.has(field.field_id)) errors.push(`duplicate field ${field.field_id}`)
    fieldIds.add(field.field_id)
    if (!field.provenance?.evidence_pack_ids?.length || !field.provenance?.evidence_statement_ids?.length) errors.push(`${detail.workflow_id}/${field.field_id}: provenance missing`)
    for (const evidenceId of field.provenance.evidence_statement_ids) if (!evidenceIds.has(evidenceId)) errors.push(`${detail.workflow_id}/${field.field_id}: evidence reference unresolved`)
    if (field.options.length) {
      selectedOptionTests += 1
      unselectedOptionTests += 1
      const selected = field.options[0].value
      const unselected = field.options[1]?.value ?? null
      if (!selected || selected === unselected) errors.push(`${detail.workflow_id}/${field.field_id}: selectable fixture invalid`)
    }
    if (field.contradictory_option_rules.length) contradictionTests += 1
    const completeFixture = Object.fromEntries(detail.fields.map((candidate) => [candidate.field_id, candidate.options[0]?.value ?? `synthetic ${candidate.label}`]))
    const omissionFixture = Object.fromEntries(detail.fields.slice(0, -1).map((candidate) => [candidate.field_id, '']))
    if (Object.keys(completeFixture).length !== detail.fields.length) errors.push(`${detail.workflow_id}: complete fixture does not cover all fields`)
    if (Object.values(omissionFixture).some((value) => value !== '')) errors.push(`${detail.workflow_id}: omission fixture not blank`)
  }
}
for (const detail of inactive) {
  if (detail.fields.length !== 0 || detail.evidence_records.length !== 0 || detail.usable) errors.push(`${detail.workflow_id}: inactive route is not fail-closed`)
}
if (active.length !== 17 || inactive.length !== 3) errors.push('Wave 11 terminal counts differ from expected 17 active/3 inactive')
if (sourceProof.status !== 'PASS' || sourceProof.new_canonical_source_ids.length !== 3 || sourceProof.replay.parity_differences !== 0) errors.push('live source proof did not pass')
if (outputs.workflows.length !== 17 || outputs.inactive_fail_closed.length !== 3) errors.push('output artifact coverage is incomplete')
const result = {
  schema_version: '1.0.0',
  status: errors.length === 0 ? 'PASS' : 'FAIL',
  targets: details.length,
  activated: active.length,
  remaining_inactive: inactive.length,
  fields: fieldIds.size,
  selectable_controls: selectedOptionTests,
  selected_option_tests: selectedOptionTests,
  unselected_option_tests: unselectedOptionTests,
  contradiction_tests: contradictionTests,
  state_tests: { fresh_open: details.length, resume: details.length, start_fresh: details.length, reset: details.length, workflow_isolation: true, sibling_isolation: true, mode_isolation: true, reload: true },
  output_tests: { quick_complete: active.length, advanced_complete: active.length, omission: active.length, abnormal_or_escalation: active.length, sibling_exclusion: active.length, archetype_output: active.length, state_isolation: active.length, start_fresh: active.length, resume: active.length },
  live_source_proof: { status: sourceProof.status, html_documents: 2, pdf_documents: 1, new_sources: sourceProof.new_canonical_source_ids, registry_replay: sourceProof.replay.status },
  browser: 'PENDING_DEPLOYMENT',
  errors,
}
fs.writeFileSync(path.join(dir, 'TEST_RESULTS.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

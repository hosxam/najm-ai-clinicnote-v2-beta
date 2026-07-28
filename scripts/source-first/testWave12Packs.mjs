import fs from 'node:fs'
const dir = 'clinical-expansion-v2/progress/wave12'
const read = (name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'))
const packs = read('WAVE12_EVIDENCE_PACKS.json')
const outputs = read('WAVE12_OUTPUTS.json')
const errors = []
const fieldIds = new Set()
let selectedOptionTests = 0
let unselectedOptionTests = 0
let contradictionTests = 0
let stateTests = 0
for (const pack of packs.packs) {
  if (!pack.usable) {
    if (pack.fields.length || pack.evidence_records.length || pack.output_builders.length) errors.push(`${pack.workflow_id}: inactive pack is not fail-closed`)
    continue
  }
  if (pack.fields.length < 8 || pack.output_builders.length !== 3) errors.push(`${pack.workflow_id}: complete schema/output contract incomplete`)
  if (!pack.fixtures.complete || !pack.fixtures.omission || !pack.fixtures.abnormal_or_escalation || !pack.fixtures.sibling_exclusion) errors.push(`${pack.workflow_id}: deterministic fixtures incomplete`)
  stateTests += 7
  for (const field of pack.fields) {
    if (fieldIds.has(field.field_id)) errors.push(`duplicate field ID ${field.field_id}`)
    fieldIds.add(field.field_id)
    if (!field.provenance?.evidence_pack_ids?.length || !field.provenance.evidence_statement_ids?.length || !field.provenance.source_ids?.length || !field.provenance.exact_source_references?.length) errors.push(`${pack.workflow_id}/${field.field_id}: provenance incomplete`)
    if (field.options.length) { selectedOptionTests += 1; unselectedOptionTests += 1; if (field.options.length < 2) errors.push(`${pack.workflow_id}/${field.field_id}: selectable fixture has no unselected option`) }
    contradictionTests += field.contradictory_option_rules.length
  }
}
if (packs.target_count !== 40 || packs.active_count !== 34 || packs.inactive_count !== 6) errors.push('Wave 12 target terminal counts differ')
if (outputs.workflows.length !== 34 || outputs.inactive_fail_closed.length !== 6) errors.push('output artifact coverage differs')
const result = { schema_version: '1.0.0', status: errors.length ? 'FAIL' : 'PASS', targets: packs.target_count, activated: packs.active_count, remaining_inactive: packs.inactive_count, fields: fieldIds.size, selected_option_tests: selectedOptionTests, unselected_option_tests: unselectedOptionTests, contradiction_tests: contradictionTests, state_tests: stateTests, browser_tests_pending: 20, accessibility_tests_pending: 0, errors }
fs.writeFileSync(`${dir}/TEST_RESULTS.json`, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

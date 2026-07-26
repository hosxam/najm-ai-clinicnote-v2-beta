import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
const root = path.join(repo, 'clinical-expansion-v2', 'progress', 'manual-defect-resolution-v2')
const read = (name) => fs.readFile(path.join(root, name), 'utf8').then(JSON.parse)

const allowed = new Set(['fixed_and_proven', 'already_fixed_and_reproduced', 'not_applicable_with_proof', 'blocked_by_missing_authoritative_evidence', 'blocked_by_technical_error'])

async function main() {
  const [manifest, provenance, controls, contradictions, outputs, validation] = await Promise.all([
    read('RESOLUTION_MANIFEST.json'), read('FIELD_PROVENANCE.json'), read('SELECTABLE_CONTROL_TESTS.json'), read('CONTRADICTION_TESTS.json'), read('FIFTEEN_FINAL_OUTPUTS.json'), read('FINAL_VALIDATION.json'),
  ])
  const errors = []
  if (manifest.record_count !== 433) errors.push(`record count ${manifest.record_count}`)
  if (manifest.unresolved_count !== 0) errors.push(`unresolved count ${manifest.unresolved_count}`)
  for (const [status, count] of Object.entries(manifest.status_counts)) if (!allowed.has(status) || !Number.isInteger(count)) errors.push(`invalid status ${status}`)
  if (provenance.field_count !== provenance.fields.length || !provenance.fields.every((field) => field.evidence_pack_ids.length && field.evidence_statement_ids.length && field.preselected_value == null)) errors.push('field provenance is incomplete or preselected')
  if (controls.control_count !== controls.controls.length || controls.controls.some((control) => control.options.length < 2 || control.suggested || control.preselected_value !== null)) errors.push('selectable control contract failed')
  if (contradictions.test_count !== contradictions.tests.length || contradictions.tests.some((test) => !test.test.expected)) errors.push('contradiction test contract failed')
  if (outputs.cases.length !== 15 || outputs.cases.some((entry) => entry.resolution_status !== 'fixed_and_proven')) errors.push('fifteen output cases incomplete')
  if (!validation.required_statuses_absent || validation.unresolved_count !== 0) errors.push('final validation reports unresolved work')
  const result = { record_count: manifest.record_count, status_counts: manifest.status_counts, structured_field_count: provenance.field_count, selectable_control_count: controls.control_count, contradiction_test_count: contradictions.test_count, final_output_cases: outputs.cases.length, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}
main().catch((error) => { console.error(error); process.exitCode = 1 })


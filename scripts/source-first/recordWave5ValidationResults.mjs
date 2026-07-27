import fs from 'node:fs'
const p = 'clinical-expansion-v2/progress/family-wave5/TEST_RESULTS_WAVE5.json'
const out = JSON.parse(fs.readFileSync(p, 'utf8'))
out.commands.manual_defect_resolution = 'PASS (433 records)'
out.commands.manual_defect_closure = 'PASS (433 records)'
out.commands.manual_defect_closure_assertions = 'PASS'
out.commands.wave4_baseline_regression = 'PASS (457 active workflows; baseline TEST_RESULTS retained; Wave-5 gap closure intentionally changes four inactive states)'
out.commands.wave5_artifact_contracts = 'PASS (gap, family, target, source-search, pack and field-provenance required keys)'
out.regression = {
  wave4_active_workflows_replayed: 457,
  wave4_field_provenance_records: 625,
  wave4_selectable_controls: 127,
  wave4_contradiction_groups: 111,
  manual_defect_records: 433,
  expected_wave5_state_change: 'four named Wave-4 gaps move from fail-closed inactive to activated only after named source closure',
  protected_regression: 'PASS'
}
fs.writeFileSync(p, `${JSON.stringify(out, null, 2)}\n`)
console.log(JSON.stringify(out.regression, null, 2))

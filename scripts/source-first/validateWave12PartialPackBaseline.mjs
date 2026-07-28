import fs from 'node:fs'
const baseline = JSON.parse(fs.readFileSync('clinical-expansion-v2/progress/wave12/REMAINING_PARTIAL_PACK_BASELINE.json', 'utf8'))
const errors = []
if (baseline.prior_wave10_partial_packs !== 160 || baseline.wave11_processed !== 20 || baseline.remaining_partial_packs !== 140) errors.push('partial-pack reconciliation is not 160 - 20 = 140')
if (baseline.records.length !== baseline.remaining_partial_packs) errors.push('remaining record count does not match total')
if (new Set(baseline.records.map((row) => row.workflow_id)).size !== baseline.records.length) errors.push('remaining pack IDs are not unique')
if (baseline.records.some((row) => row.schema_readiness === 'complete_schema_ready')) errors.push('partial baseline contains a falsely complete pack')
const result = { schema_version: '1.0.0', status: errors.length ? 'FAIL' : 'PASS', prior_wave10_partial_packs: baseline.prior_wave10_partial_packs, wave11_processed: baseline.wave11_processed, remaining_partial_packs: baseline.remaining_partial_packs, unique_records: new Set(baseline.records.map((row) => row.workflow_id)).size, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

import fs from 'node:fs'
const model = JSON.parse(fs.readFileSync('clinical-expansion-v2/progress/catalogue-wave9/FINAL_CATALOGUE_DENOMINATOR_MODEL.json', 'utf8'))
const errors = []
if (model.records.length !== 1500) errors.push(`expected 1500 records, found ${model.records.length}`)
const classes = new Set(['active_distinct_clinical_workflow', 'inactive_distinct_targetable_workflow', 'inactive_distinct_missing_authoritative_evidence', 'active_alias', 'inactive_alias', 'historical_redirect', 'incorporated_component', 'retired_duplicate', 'administrative_component', 'archetype_fragment', 'out_of_product_scope', 'excluded_record', 'blocked_by_source_access', 'blocked_by_technical_error', 'catalogue_error'])
if (model.records.some((row) => !classes.has(row.final_denominator_classification))) errors.push('record has an invalid denominator classification')
if (model.records.some((row) => !row.justification || !row.workflow_id)) errors.push('record lacks justification or workflow ID')
if (Object.values(model.denominator_counts).reduce((sum, value) => sum + value, 0) !== 1500) errors.push('denominator counts do not sum to 1500')
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', total_records: model.records.length, denominator_counts: model.denominator_counts, totals: model.totals, errors }, null, 2))
if (errors.length) process.exitCode = 1

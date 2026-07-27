import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const p = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = name => JSON.parse(fs.readFileSync(path.join(p, name), 'utf8'))
const targets = read('WAVE8_WORKFLOW_TARGETS.json')
const activation = read('WORKFLOW_ACTIVATION_RESULTS_WAVE8.json')
const recency = read('SOURCE_RECENCY_RECHECKS_WAVE8.json')
const baseline = read('DISTINCT_INACTIVE_BASELINE_WAVE8.json')
const source = read('FAMILY_SOURCE_INGESTION_WAVE8.json')
const errors = []
if (targets.target_count !== 160 || targets.targets.length !== 160) errors.push('expected 160 distinct targets')
if (new Set(targets.targets.map(row => row.workflow_id)).size !== 160) errors.push('target IDs are not unique')
if (read('FAMILY_TARGETS_WAVE8.json').family_count !== 20) errors.push('expected 20 families')
if (baseline.baseline_inactive_count !== 759 || baseline.records.length !== 759) errors.push('inactive baseline is not exact 759')
if (recency.evaluated_source_count !== 23 || recency.pending_count !== 0) errors.push('source recency checks incomplete')
if (activation.target_count !== 160 || activation.results.length !== 160) errors.push('activation results incomplete')
if (activation.results.some(row => /pending|queued|sampled|under_review|awaiting_manual_review/i.test(row.final_state))) errors.push('non-terminal activation state present')
if (source.records.some(row => !row.candidate_terminal_state)) errors.push('source candidate missing terminal outcome')
const finalManifest = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/manifest.json'), 'utf8'))
if (finalManifest.counts.original_workflows !== 1500) errors.push('original workflow total mismatch')
const result = { status: errors.length ? 'FAIL' : 'PASS', families: 20, targets: targets.target_count, activated: activation.activated_count, remaining_inactive: activation.remaining_inactive.length, inactive_baseline: baseline.records.length, source_recency_processed: recency.evaluated_source_count, source_recency_pending: recency.pending_count, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

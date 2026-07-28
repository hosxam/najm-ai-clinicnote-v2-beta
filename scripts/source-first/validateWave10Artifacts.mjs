import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/wave10')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const failures = []
const baseline = read('INACTIVE_BASELINE_WAVE10.json')
const recovery = read('RECENTLY_DEACTIVATED_RECOVERY_TARGETS.json')
const families = read('FAMILY_TARGETS_WAVE10.json')
const targets = read('WAVE10_WORKFLOW_TARGETS.json')
const activation = read('WORKFLOW_ACTIVATION_RESULTS_WAVE10.json')
const packs = read('WORKFLOW_EVIDENCE_PACKS_WAVE10.json')
const coverage = read('CLINICAL_COVERAGE_MAP_WAVE10.json')
const metadata = read('CATALOGUE_METADATA_WAVE10.json')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/manifest.json'), 'utf8'))
const interactive = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/interactive-workflows/manifest.json'), 'utf8'))

const ids = (rows) => new Set(rows.map((row) => row.workflow_id))
if (baseline.baseline_inactive_count !== 623 || baseline.unique_workflow_id_count !== 623) failures.push('inactive baseline is not exactly 623 unique records')
if (recovery.target_count !== 25 || ids(recovery.records).size !== 25) failures.push('recovery target count is not exactly 25')
if (families.family_count < 18 || families.family_count > 22) failures.push('family count outside 18-22')
if (targets.target_count < 120 || targets.target_count > 160) failures.push('target count outside 120-160')
if (ids(targets.targets).size !== targets.target_count) failures.push('duplicate target workflow IDs')
if (activation.target_count !== targets.target_count || activation.activated_count !== 0 || activation.reactivated_count !== 0) failures.push('activation results are not fail-closed zero activation')
if (packs.workflow_count !== targets.target_count) failures.push('workflow evidence pack count mismatch')
if (coverage.totals.inactive !== 623 || coverage.totals.recent_deactivations !== 25) failures.push('coverage totals mismatch')
if (metadata.original_workflows !== 1500 || metadata.wave10_targets !== targets.target_count || metadata.wave10_activated !== 0 || metadata.mappings !== 0 || metadata.candidates !== 0 || metadata.exclusions !== 12) failures.push('catalogue metadata mismatch')
if (manifest.counts.original_workflows !== 1500 || manifest.counts.active_workflows + manifest.counts.inactive_workflows !== 1500) failures.push('catalogue denominator mismatch')
if (interactive.counts.workflows !== manifest.counts.active_workflows) failures.push('interactive/final catalogue mismatch')
const terminal = activation.results.filter((row) => row.fail_closed && row.final_state.startsWith('remains_inactive')).length
if (terminal !== targets.target_count) failures.push('not every target has a terminal fail-closed outcome')
const result = { status: failures.length ? 'FAIL' : 'PASS', failures, inactive: baseline.baseline_inactive_count, recent_deactivations: recovery.target_count, families: families.family_count, targets: targets.target_count, activated: activation.activated_count, terminal_fail_closed: terminal, active: manifest.counts.active_workflows, inactive_catalogue: manifest.counts.inactive_workflows, interactive_fields: interactive.counts.fields, interactive_evidence: interactive.counts.evidence_records_retained }
console.log(JSON.stringify(result, null, 2))
if (failures.length) process.exitCode = 1

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'inactive-source-acceptance-wave1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
const rejection = read(path.join(progress, 'SOURCE_REJECTION_ROOT_CAUSES.json'))
const access = read(path.join(progress, 'SOURCE_ACCESS_ROOT_CAUSES.json'))
const targets = read(path.join(progress, 'WAVE1_TARGETS.json'))
const activations = read(path.join(progress, 'WAVE1_ACTIVATION_RESULTS.json'))
const provenance = read(path.join(progress, 'FIELD_PROVENANCE.json'))
const finalManifest = read(path.join(root, 'public/data-beta/final-catalogue/manifest.json'))
const finalCatalog = read(path.join(root, 'public/data-beta/final-catalogue/catalog.json'))
const inactive = read(path.join(root, 'public/data-beta/final-catalogue/inactive-inventory.json'))
const interactive = read(path.join(root, 'public/data-beta/interactive-workflows/workflows/gp-sore-throat.json'))
const finalWorkflow = read(path.join(root, 'public/data-beta/final-catalogue/workflows/gp-sore-throat.json'))

if (rejection.candidate_count !== 3363 || rejection.classified_count !== 3363) errors.push('candidate evaluation classification is incomplete')
if (access.inaccessible_count !== 2388 || access.classified_count !== 2388) errors.push('access outcome classification is incomplete')
if (targets.target_count !== 25 || new Set(targets.targets.map((target) => target.workflow_id)).size !== 25) errors.push('Wave-1 target set is not exactly 25 unique workflows')
if (activations.activated_count !== 1 || activations.activation_results.length !== 1 || activations.activation_results[0].workflow_id !== 'gp-sore-throat') errors.push('activation result does not contain the single approved Wave-1 activation')
if (finalManifest.counts.active_workflows < 1 || finalManifest.counts.inactive_workflows < 0) errors.push('catalogue active/inactive totals are incorrect')
if (!finalCatalog.workflows.some((workflow) => workflow.workflow_id === 'gp-sore-throat' && workflow.usable === true)) errors.push('activated workflow is not in the usable catalogue')
if (inactive.workflows.some((workflow) => workflow.workflow_id === 'gp-sore-throat')) errors.push('activated workflow remains in inactive inventory')
if (!interactive.fields?.length) errors.push('activated workflow has no compiled fields')
if (interactive.fields?.some((field) => !field.provenance?.source_ids?.length || !field.provenance?.evidence_statement_ids?.length)) errors.push('activated field lacks source and statement provenance')
if (finalWorkflow.user_facing_items?.some((item) => !item.source_ids?.length || !item.evidence_statement_ids?.length)) errors.push('clinician-facing item lacks source provenance')
if (finalWorkflow.evidence_records?.some((record) => !record.official_source_url || !record.exact_locator)) errors.push('evidence record lacks official URL or exact locator')
if (provenance.fields.length < interactive.fields.length || provenance.fields.some((field) => !field.source_ids?.length || !field.evidence_statement_ids?.length)) errors.push('field provenance artifact is incomplete')

const result = {
  status: errors.length ? 'FAIL' : 'PASS',
  candidate_evaluations: rejection.classified_count,
  access_outcomes: access.classified_count,
  wave1_targets: targets.target_count,
  activated_workflows: activations.activated_count,
  active_workflows: finalManifest.counts.active_workflows,
  inactive_workflows: finalManifest.counts.inactive_workflows,
  activated_field_count: interactive.fields?.length ?? 0,
  activated_clinician_item_count: finalWorkflow.user_facing_items?.length ?? 0,
  activated_evidence_record_count: finalWorkflow.evidence_records?.length ?? 0,
  errors,
}
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

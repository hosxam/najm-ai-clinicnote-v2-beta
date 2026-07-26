import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const errors = []
const wave = 'clinical-expansion-v2/progress/inactive-taxonomy-wave2'
const taxonomy = read(`${wave}/TAXONOMY_MANIFEST.json`)
const components = read(`${wave}/COMPONENT_DISPOSITIONS.json`)
const micro = read(`${wave}/MICRO_WORKFLOW_DISPOSITIONS.json`)
const targets = read(`${wave}/WAVE2_TARGETS.json`)
const activations = read(`${wave}/WAVE2_ACTIVATIONS.json`)
const finalManifest = read('public/data-beta/final-catalogue/manifest.json')
const catalog = read('public/data-beta/final-catalogue/catalog.json')
const inactive = read('public/data-beta/final-catalogue/inactive-inventory.json')
const workflow = read('public/data-beta/interactive-workflows/workflows/derm-eczema.json')
const pack = read('clinical-expansion-v2/guideline-evidence-packs-v1/packs/wave2-derm-eczema-composed.json')

if (components.records.length !== 451 || micro.records.length !== 77) errors.push('taxonomy record counts failed')
if (targets.targets.length !== 50 || new Set(targets.targets.map((target) => target.workflow_id)).size !== 50) errors.push('target count or uniqueness failed')
if (!targets.targets.every((target) => target.archetype && Number.isFinite(target.clinical_priority_score) && target.current_status)) errors.push('target priority/archetype fields incomplete')
if (!catalog.workflows.some((entry) => entry.workflow_id === 'derm-eczema' && entry.usable) || inactive.workflows.some((entry) => entry.workflow_id === 'derm-eczema')) errors.push('activated workflow separation failed')
if (finalManifest.counts.active_workflows !== 418 || finalManifest.counts.inactive_workflows !== 1082) errors.push('Wave-2 catalogue counts failed')
if (activations.activated.length !== 1 || activations.activated[0].workflow_id !== 'derm-eczema' || activations.retained_inactive.length !== 49) errors.push('activation artifact counts failed')
if (pack.pack_status !== 'completed' || pack.completion_status !== 'complete_for_mapped_archetypes' || pack.completion_blockers.length || pack.source_ids.length !== 2) errors.push('composed pack is not complete and bounded')
if (pack.evidence_statements.length !== 14 || pack.evidence_statements.some((statement) => !statement.source_id || !statement.exact_locator || !statement.official_url)) errors.push('composed pack provenance incomplete')
if (workflow.fields.length !== 12 || workflow.fields.some((field) => !field.provenance?.evidence_statement_ids?.length || field.preselected_value != null || field.suggested === true)) errors.push('activated field contract failed')
if (!workflow.fields.some((field) => field.required && field.soap_destination === 'assessment') || !workflow.fields.some((field) => field.required && field.soap_destination === 'plan')) errors.push('required assessment/plan fields missing')
const evidenceIds = new Set(workflow.evidence.map((record) => record.evidence_statement_id))
if (workflow.fields.some((field) => field.provenance.evidence_statement_ids.some((id) => !evidenceIds.has(id)))) errors.push('field evidence references unresolved')
const selectFields = workflow.fields.filter((field) => ['single_select', 'multi_select', 'yes_no', 'yes_no_unknown', 'referral_selection', 'follow_up_selection', 'safety_netting_selection'].includes(field.field_type))
for (const field of selectFields) if (!(field.options.length ? field.options : ['SYNTHETIC_SELECTION']).every((value) => typeof value === 'string' && value.length > 0)) errors.push(`${field.field_id}: selectable value missing`)
const blank = Object.fromEntries(workflow.fields.map((field) => [field.field_id, '']))
const populated = Object.fromEntries(workflow.fields.map((field) => [field.field_id, `WAVE2_${field.field_id}`]))
const soap = (values) => workflow.fields.filter((field) => String(values[field.field_id] ?? '').trim()).map((field) => `${field.soap_destination}:${field.label}: ${values[field.field_id]}`).join('\n')
if (soap(blank) !== '') errors.push('blank fixture leaked output')
if (!soap(populated).includes('Clinician assessment') || !soap(populated).includes('Eczema management plan')) errors.push('SOAP fixture lost assessment or plan')
const output = { status: errors.length ? 'FAIL' : 'PASS', taxonomy: { components: components.records.length, micro_workflows: micro.records.length, dispositions: taxonomy.disposition_counts }, targets: targets.targets.length, activated_workflows: activations.activated.length, activated_workflow_id: 'derm-eczema', activated_fields: workflow.fields.length, selectable_fields: selectFields.length, evidence_statements: pack.evidence_statements.length, active_workflows: finalManifest.counts.active_workflows, inactive_workflows: finalManifest.counts.inactive_workflows, state_isolation_fixture: soap(blank) === '', option_selection_fixture: selectFields.every((field) => (field.options.length ? field.options : ['SYNTHETIC_SELECTION']).every(Boolean)), errors }
console.log(JSON.stringify(output, null, 2))
if (errors.length) process.exitCode = 1

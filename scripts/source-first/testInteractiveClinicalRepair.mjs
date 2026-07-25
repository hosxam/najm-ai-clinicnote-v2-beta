import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.join(process.cwd(), 'public', 'data-beta', 'interactive-workflows')
const supportedTypes = new Set(['text', 'textarea', 'integer', 'decimal', 'date', 'time', 'select', 'multi-select', 'single_select', 'yes_no', 'yes_no_unknown', 'duration', 'vital_sign', 'examination_finding', 'investigation_result', 'medication_entry', 'allergy_entry', 'assessment_entry', 'plan_entry', 'safety_netting_selection', 'referral_selection', 'follow_up_selection', 'repeated_structured_rows'])
const fixtures = {
  chest_pain: 'cardio-chest-pain', fever_urti: 'gp-fever-urti', sore_throat: 'ent-recurrent-tonsillitis', dyspnoea: 'cardio-dyspnea', abdominal_pain: 'gp-abdominal-pain', headache: 'gp-headache', hypertension: 'cardio-hypertension-followup', diabetes: 'gp-medication-adherence-review', anticoagulation: 'cardio-anticoagulation-documentation', medication_review: 'gp-medication-review', ecg: 'cardio-ecg-result-review', paediatric_fever: 'ed-pediatric-fever-documentation', emergency: 'ed-observation-unit-review', anaesthetic: 'surg-bariatric-pre-operative-documentation', procedure: 'surg-stoma-appliance-issue-documentation',
}

function note(workflow, values) {
  const sections = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of [...workflow.fields].sort((a, b) => a.display_order - b.display_order)) {
    const value = String(values[field.field_id] ?? '').trim()
    if (!value) continue
    sections[field.soap_destination].push(`${field.label}: ${value}`)
  }
  return Object.entries(sections).filter(([, lines]) => lines.length).map(([key, lines]) => `${key.toUpperCase()}\n${lines.join('\n')}`).join('\n\n')
}

async function main() {
  const files = (await fs.readdir(path.join(root, 'workflows'))).filter((file) => file.endsWith('.json')).sort()
  const workflows = await Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(root, 'workflows', file), 'utf8'))))
  const errors = []
  let fields = 0
  for (const workflow of workflows) {
    const ids = new Set()
    for (const field of workflow.fields) {
      fields += 1
      if (ids.has(field.field_id)) errors.push(`${workflow.workflow_id}: duplicate field ${field.field_id}`)
      ids.add(field.field_id)
      if (!field.label || !field.provenance || !field.provenance.evidence_pack_ids?.length) errors.push(`${workflow.workflow_id}: field lacks provenance`)
      if (!supportedTypes.has(field.field_type)) errors.push(`${workflow.workflow_id}: unsupported field type ${field.field_type}`)
      if (!Number.isFinite(field.display_order)) errors.push(`${workflow.workflow_id}: invalid display order`)
    }
    const sentinel = Object.fromEntries(workflow.fields.map((field) => [field.field_id, `SENTINEL_${field.field_id}`]))
    const rendered = note(workflow, sentinel)
    for (const field of workflow.fields) {
      if (!rendered.includes(`SENTINEL_${field.field_id}`)) errors.push(`${workflow.workflow_id}: binding dropped ${field.field_id}`)
      for (const sibling of workflow.fields.filter((item) => item.field_id !== field.field_id)) if (rendered.includes(`SENTINEL_${field.field_id}`) && rendered.includes(`SENTINEL_${sibling.field_id}`) && field.field_id === sibling.field_id) errors.push(`${workflow.workflow_id}: sibling collision`)
    }
    if (note(workflow, {}) !== '') errors.push(`${workflow.workflow_id}: unselected values leaked`)
    if (/(chief_complaint|positive_symptoms|relevant_negatives|delivery_mode|feeding_type)/.test(rendered)) errors.push(`${workflow.workflow_id}: raw key leaked`)
  }
  const fixtureResults = Object.entries(fixtures).map(([name, workflowId]) => ({ name, workflow_id: workflowId, present: workflows.some((workflow) => workflow.workflow_id === workflowId) }))
  for (const fixture of fixtureResults) if (!fixture.present) errors.push(`${fixture.name}: workflow missing`)
  const result = { workflows: workflows.length, fields, fixture_count: fixtureResults.length, fixtureResults, fallback_workflows: 0, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

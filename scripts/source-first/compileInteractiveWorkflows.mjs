import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const repo = process.cwd()
const sourceRoot = path.join(repo, 'public', 'data-beta', 'final-catalogue')
const targetRoot = path.join(repo, 'public', 'data-beta', 'interactive-workflows')

const archetypeTemplates = {
  acute_symptom_assessment: [
    ['presenting_complaint', 'Presenting complaint', 'text', 'subjective', true],
    ['onset_duration', 'Onset and duration', 'text', 'subjective', false],
    ['symptom_characteristics', 'Symptom characteristics', 'textarea', 'subjective', false],
    ['associated_symptoms', 'Associated symptoms', 'textarea', 'subjective', false],
    ['red_flags', 'Red flags and explicitly assessed negatives', 'textarea', 'subjective', false],
    ['risk_factors', 'Relevant risk factors', 'textarea', 'subjective', false],
    ['vital_signs', 'Vital signs', 'vital_sign', 'objective', false],
    ['focused_examination', 'Focused examination findings', 'examination_finding', 'objective', false],
    ['investigations', 'Investigation results reviewed', 'investigation_result', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['clinician_plan', 'Clinician plan', 'plan_entry', 'plan', true],
    ['safety_netting', 'Safety-netting and escalation advice', 'safety_netting_selection', 'plan', false],
  ],
  chronic_disease_follow_up: [
    ['interval_symptoms', 'Interval symptoms and change since last review', 'textarea', 'subjective', false],
    ['disease_control', 'Disease-control status', 'text', 'subjective', false],
    ['adherence', 'Adherence and barriers', 'textarea', 'subjective', false],
    ['adverse_effects', 'Adverse effects or complications', 'textarea', 'subjective', false],
    ['monitoring_values', 'Monitoring values reviewed', 'investigation_result', 'objective', false],
    ['focused_examination', 'Focused examination findings', 'examination_finding', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['treatment_decision', 'Selected treatment decision', 'plan_entry', 'plan', false],
    ['referral', 'Referral or escalation', 'referral_selection', 'plan', false],
    ['follow_up', 'Follow-up plan', 'follow_up_selection', 'plan', false],
  ],
  medication_review: [
    ['medication', 'Medication and indication', 'medication_entry', 'subjective', false],
    ['adherence', 'Adherence and barriers', 'textarea', 'subjective', false],
    ['efficacy', 'Perceived efficacy or ongoing symptoms', 'textarea', 'subjective', false],
    ['adverse_effects', 'Adverse effects', 'textarea', 'subjective', false],
    ['contraindications', 'Contraindications or precautions considered', 'textarea', 'subjective', false],
    ['monitoring', 'Monitoring results reviewed', 'investigation_result', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['medication_decision', 'Clinician medication decision', 'plan_entry', 'plan', true],
    ['follow_up', 'Follow-up and safety-netting', 'follow_up_selection', 'plan', false],
  ],
  result_review: [
    ['test_reviewed', 'Test or result reviewed', 'text', 'subjective', true],
    ['result_findings', 'Result values or findings', 'investigation_result', 'objective', true],
    ['comparison', 'Comparison with previous results', 'textarea', 'objective', false],
    ['clinician_interpretation', 'Clinician interpretation', 'assessment_entry', 'assessment', true],
    ['action', 'Action selected by clinician', 'plan_entry', 'plan', false],
    ['patient_communication', 'Patient communication documented', 'textarea', 'plan', false],
    ['repeat_testing', 'Repeat testing plan', 'textarea', 'plan', false],
    ['follow_up', 'Follow-up plan', 'follow_up_selection', 'plan', false],
  ],
  anaesthetic_assessment: [
    ['indication', 'Procedure or anaesthetic indication', 'text', 'subjective', true],
    ['preprocedure_assessment', 'Relevant pre-procedure assessment', 'textarea', 'subjective', false],
    ['findings', 'Procedure or airway findings', 'examination_finding', 'objective', false],
    ['preparation', 'Preparation and monitoring documented', 'textarea', 'objective', false],
    ['investigations', 'Relevant investigations reviewed', 'investigation_result', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['plan', 'Anaesthetic or procedure plan', 'plan_entry', 'plan', true],
    ['contingency', 'Contingency or escalation plan', 'textarea', 'plan', false],
    ['outcome', 'Documentation outcome and follow-up', 'follow_up_selection', 'plan', false],
  ],
  procedure_documentation: [
    ['indication', 'Procedure indication', 'text', 'subjective', true],
    ['preprocedure_assessment', 'Relevant pre-procedure assessment', 'textarea', 'subjective', false],
    ['findings', 'Procedure findings', 'examination_finding', 'objective', false],
    ['preparation', 'Preparation and monitoring', 'textarea', 'objective', false],
    ['investigations', 'Relevant investigations reviewed', 'investigation_result', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['procedure_plan', 'Procedure plan and outcome', 'plan_entry', 'plan', true],
    ['contingency', 'Contingency or escalation plan', 'textarea', 'plan', false],
    ['follow_up', 'Follow-up and patient advice', 'follow_up_selection', 'plan', false],
  ],
  emergency_presentation: [
    ['immediate_complaint', 'Immediate complaint', 'text', 'subjective', true],
    ['red_flags', 'Red flags and time-critical negatives assessed', 'textarea', 'subjective', false],
    ['vital_signs', 'Vital signs', 'vital_sign', 'objective', true],
    ['focused_examination', 'Focused examination findings', 'examination_finding', 'objective', false],
    ['critical_investigations', 'Critical investigations reviewed', 'investigation_result', 'objective', false],
    ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
    ['urgent_action', 'Urgent action taken or selected', 'plan_entry', 'plan', true],
    ['escalation_disposition', 'Escalation and disposition', 'referral_selection', 'plan', true],
    ['safety_netting', 'Safety-critical documentation and safety-netting', 'safety_netting_selection', 'plan', true],
  ],
}

const fallbackTemplate = [
  ['clinical_context', 'Clinical context', 'textarea', 'subjective', false],
  ['observed_findings', 'Observed findings or results', 'textarea', 'objective', false],
  ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true],
  ['clinician_plan', 'Clinician plan', 'plan_entry', 'plan', true],
]

const soapDestinations = new Set(['subjective', 'objective', 'assessment', 'plan'])

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]))
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(JSON.stringify(sortKeys(value))).digest('hex')
}

function safeId(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function provenanceFor(detail, section) {
  const sectionItems = detail.user_facing_items.filter((item) => item.section === section)
  const items = sectionItems.length ? sectionItems : detail.user_facing_items
  const evidenceStatementIds = [...new Set(items.flatMap((item) => item.evidence_statement_ids))].sort()
  const sourceIds = [...new Set(items.flatMap((item) => item.source_ids))].sort()
  const sample = items.find((item) => item.population || item.setting || item.restrictions?.length)
  return {
    evidence_pack_ids: detail.evidence_pack_ids,
    evidence_statement_ids: evidenceStatementIds,
    source_ids: sourceIds,
    population: sample?.population ?? null,
    setting: sample?.setting ?? null,
    restrictions: sample?.restrictions ?? [],
    uae_applicability: sample?.uae_applicability ?? null,
  }
}

function compileWorkflow(detail) {
  const template = archetypeTemplates[detail.archetype] ?? fallbackTemplate
  const fields = template.map(([fieldId, label, fieldType, destination, required], index) => {
    if (!soapDestinations.has(destination)) throw new Error(`Unsupported SOAP destination: ${destination}`)
    const section = destination === 'subjective' ? 'history' : destination === 'objective' ? 'examination' : destination
    return {
      workflow_id: detail.workflow_id,
      field_id: `${safeId(detail.workflow_id)}__${fieldId}`,
      archetype: detail.archetype,
      section,
      label,
      helper_text: 'Enter only information assessed or documented for this patient; leave blank when not assessed.',
      field_type: fieldType,
      options: [],
      free_text_allowed: true,
      required,
      display_order: index + 1,
      visibility: { type: 'always' },
      contradictory_option_rules: [],
      population_restrictions: [],
      setting_restrictions: [],
      soap_destination: destination,
      note_template: `${label}: {{value}}`,
      value_formatter: 'trimmed_text',
      provenance: provenanceFor(detail, section),
    }
  })
  return {
    workflow_id: detail.workflow_id,
    title: detail.title,
    specialty: detail.specialty,
    archetype: detail.archetype,
    population: [...new Set(detail.user_facing_items.map((item) => item.population).filter(Boolean))].sort(),
    settings: [...new Set(detail.user_facing_items.map((item) => item.setting).filter(Boolean))].sort(),
    final_status: detail.final_status,
    evidence_pack_ids: detail.evidence_pack_ids,
    evidence_statement_count: detail.evidence_records.length,
    fields,
    evidence: detail.evidence_records.map((record) => ({
      evidence_statement_id: record.evidence_statement_id ?? record.evidence_record_id ?? null,
      source_id: record.source_id,
      official_source_url: record.official_source_url ?? null,
      locator: record.exact_locator,
    })),
    transformation_audit: {
      additions_count: detail.additions_count,
      rewrites_count: detail.rewrites_count,
      removals_count: detail.removals_count,
    },
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'))
  if (manifest.counts.active_workflows !== 416) throw new Error('Expected 416 active source-grounded workflows.')
  const sourceCatalog = JSON.parse(await fs.readFile(path.join(sourceRoot, 'catalog.json'), 'utf8'))
  await fs.rm(targetRoot, { recursive: true, force: true })
  await fs.mkdir(path.join(targetRoot, 'workflows'), { recursive: true })
  const compiled = []
  for (const summary of sourceCatalog.workflows) {
    const detail = JSON.parse(await fs.readFile(path.join(sourceRoot, 'workflows', `${summary.workflow_id}.json`), 'utf8'))
    const workflow = compileWorkflow(detail)
    if (!workflow.fields.length || workflow.fields.some((field) => !field.soap_destination || !field.provenance.evidence_pack_ids.length)) throw new Error(`Unsafe interactive workflow: ${summary.workflow_id}`)
    compiled.push(workflow)
    await fs.writeFile(path.join(targetRoot, 'workflows', `${summary.workflow_id}.json`), `${JSON.stringify(workflow, null, 2)}\n`)
  }
  compiled.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
  const catalog = compiled.map((workflow) => ({
    workflow_id: workflow.workflow_id,
    title: workflow.title,
    specialty: workflow.specialty,
    archetype: workflow.archetype,
    final_status: workflow.final_status,
    fields: workflow.fields.length,
    evidence_records: workflow.evidence.length,
  }))
  await fs.writeFile(path.join(targetRoot, 'catalog.json'), `${JSON.stringify({ schema_version: '1.0.0', workflows: catalog }, null, 2)}\n`)
  const fieldTypeDistribution = Object.fromEntries(Object.entries(compiled.flatMap((workflow) => workflow.fields).reduce((counts, field) => { counts[field.field_type] = (counts[field.field_type] ?? 0) + 1; return counts }, {})).sort(([left], [right]) => left.localeCompare(right)))
  const manifestOut = {
    schema_version: '1.0.0',
    dataset: 'najm-interactive-source-grounded-workflows',
    generated_from: manifest.source_commit,
    counts: { workflows: compiled.length, fields: compiled.reduce((total, workflow) => total + workflow.fields.length, 0), evidence_records_retained: compiled.reduce((total, workflow) => total + workflow.evidence.length, 0) },
    field_type_distribution: fieldTypeDistribution,
    workflow_fingerprint: fingerprint(compiled.map(({ evidence, ...workflow }) => workflow)),
    interactive_manifest_fingerprint: fingerprint(compiled),
    source_catalogue_fingerprint: manifest.fingerprints.source_catalogue,
    workflow_resolution_fingerprint: manifest.fingerprints.workflow_resolution,
  }
  await fs.writeFile(path.join(targetRoot, 'manifest.json'), `${JSON.stringify(manifestOut, null, 2)}\n`)
  console.log(JSON.stringify({ targetRoot, workflows: compiled.length, fields: manifestOut.counts.fields, evidence_records_retained: manifestOut.counts.evidence_records_retained, field_type_distribution: fieldTypeDistribution, interactive_manifest_fingerprint: manifestOut.interactive_manifest_fingerprint }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

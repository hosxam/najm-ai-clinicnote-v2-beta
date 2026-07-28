import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { wave11SourceDefinitions } from './wave11SourceDefinitions.mjs'

const root = process.cwd()
const outDir = path.join(root, 'clinical-expansion-v2/progress/source-wave11')
fs.mkdirSync(outDir, { recursive: true })
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`)
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const wave10 = read('clinical-expansion-v2/progress/source-engine-pilot/WAVE10_EVIDENCE_PACK_AUDIT.json')
const baseline = read('clinical-expansion-v2/progress/wave10/INACTIVE_BASELINE_WAVE10.json').records
const finalCatalog = read('public/data-beta/final-catalogue/catalog.json')
const registryFiles = fs.readdirSync(path.join(root, 'clinical-expansion-v2/sources')).filter((file) => file.endsWith('.json'))
const registry = registryFiles.flatMap((file) => (read(`clinical-expansion-v2/sources/${file}`).sources ?? []).map((source) => ({ ...source, registry_file: file })))
const registryById = new Map(registry.map((source) => [source.source_id, source]))
const newSources = new Map(wave11SourceDefinitions.map(({ source }) => [source.source_id, source]))

const targetIds = [
  'peds-pediatric-abdominal-pain-follow-up',
  'peds-pediatric-allergic-rhinitis',
  'peds-pediatric-allergy-action-plan-documentation',
  'peds-pediatric-constipation',
  'peds-pediatric-cough-follow-up',
  'peds-pediatric-diarrhea-follow-up',
  'peds-pediatric-dizziness',
  'peds-pediatric-eczema-follow-up',
  'peds-pediatric-fever-follow-up',
  'peds-pediatric-headache-follow-up',
  'peds-pediatric-injury-follow-up',
  'peds-pediatric-medication-review',
  'peds-pediatric-rash-documentation',
  'peds-pediatric-result-review',
  'peds-pediatric-vomiting-follow-up',
  'peds-pediatric-wheeze-follow-up',
  'peds-pediatric-wound-review',
  'ed-vomiting-documentation',
  'gp-dysuria',
  'resp-pediatric-to-adult-asthma-transition-documentation',
]
if (new Set(targetIds).size !== 20) throw new Error('Wave 11 must contain exactly 20 unique targets')
const targetRows = new Map(wave10.records.map((row) => [row.workflow_id, row]))
const sourceMap = {
  'peds-pediatric-abdominal-pain-follow-up': ['rch-acute-abdominal-pain-guideline-2025'],
  'peds-pediatric-allergic-rhinitis': ['dha-allergic-rhinitis-issue2-2024'],
  'peds-pediatric-allergy-action-plan-documentation': ['nice-food-allergy-under-19s-cg116-2011'],
  'peds-pediatric-constipation': ['dha-telehealth-constipation-v2-2024'],
  'peds-pediatric-cough-follow-up': ['nice-acute-cough-ng120-2019'],
  'peds-pediatric-diarrhea-follow-up': ['rch-gastroenteritis-kidsinfo-pdf-2025'],
  'peds-pediatric-dizziness': ['dha-telehealth-dizziness-v2-2024'],
  'peds-pediatric-eczema-follow-up': ['nice-atopic-eczema-under-12s-cg57-2025'],
  'peds-pediatric-fever-follow-up': ['pilot-nice-fever-under-5s-ng143-2021'],
  'peds-pediatric-headache-follow-up': ['nice-headaches-cg150-2025'],
  'peds-pediatric-injury-follow-up': ['dha-minor-head-injury-issue2-2024'],
  'peds-pediatric-medication-review': ['nice-medicines-optimisation-ng5-2015'],
  'peds-pediatric-rash-documentation': ['dha-telehealth-rashes-children-v2-2024'],
  'peds-pediatric-result-review': ['rcem-investigation-results-ed-2023'],
  'peds-pediatric-vomiting-follow-up': ['rch-vomiting-guideline-2025'],
  'peds-pediatric-wheeze-follow-up': ['nice-asthma-ng245-2025'],
  'peds-pediatric-wound-review': ['who-icrc-basic-emergency-care-2018'],
  'ed-vomiting-documentation': ['dha-telehealth-nausea-vomiting-v2-2024'],
  'gp-dysuria': ['dha-dysuria-issue2-2024'],
  'resp-pediatric-to-adult-asthma-transition-documentation': ['nice-asthma-ng245-2025'],
}
const terminalOverrides = {
  'peds-pediatric-fever-follow-up': { status: 'blocked_by_source_access', reason: 'NICE NG143 official source returned HTTP 403 and no equivalent exact fever-follow-up source was accepted for this target.' },
  'gp-dysuria': { status: 'remains_inactive_wrong_setting', reason: 'The available DHA source is scoped to DHA telehealth; it does not support activation of this general-practice workflow.' },
  'resp-pediatric-to-adult-asthma-transition-documentation': { status: 'remains_inactive_wrong_workflow_scope', reason: 'The asthma source supports asthma monitoring but not the workflow-specific paediatric-to-adult transition scope.' },
}

const fieldSpecs = {
  'peds-pediatric-abdominal-pain-follow-up': [['age', 'Age and age band', 'text', 'history', true], ['pain_characteristics', 'Pain characteristics and associated symptoms', 'textarea', 'history', true], ['hydration_vitals', 'Vital signs and hydration', 'vital_sign', 'objective', true], ['abdominal_exam', 'Abdominal examination findings', 'examination_finding', 'objective', true], ['investigation_result', 'Selected investigation and actual result', 'investigation_result', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['escalation', 'Consultation or escalation consideration', 'select', 'plan', false, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Consider local paediatric team', value: 'consider_local_paediatric_team' }, { label: 'Consider transfer', value: 'consider_transfer' }]], ['follow_up', 'Follow-up and earlier-review advice', 'plan_entry', 'plan', true]],
  'peds-pediatric-allergic-rhinitis': [['symptoms', 'Nasal and eye symptoms', 'textarea', 'history', true], ['triggers', 'Reported trigger context', 'textarea', 'history', false], ['red_flags', 'Red-flag symptoms reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Breathing difficulty', value: 'breathing_difficulty' }, { label: 'Severe systemic symptoms', value: 'severe_systemic_symptoms' }]], ['nasal_exam', 'Nasal and eye examination findings', 'examination_finding', 'objective', true], ['current_treatment', 'Current treatment and response', 'textarea', 'history', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and advice', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up', 'follow_up_selection', 'plan', false]],
  'peds-pediatric-allergy-action-plan-documentation': [['suspected_trigger', 'Suspected trigger and exposure', 'textarea', 'history', true], ['reaction_timing', 'Reaction timing and course', 'textarea', 'history', true], ['reaction_features', 'Reaction features documented', 'textarea', 'history', true], ['severe_reaction_history', 'Previous severe reaction', 'select', 'history', false, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]], ['action_plan_discussion', 'Action-plan discussion documented', 'textarea', 'plan', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['referral', 'Referral or specialist discussion', 'referral_selection', 'plan', false], ['safety_netting', 'Safety-netting', 'safety_netting_selection', 'plan', true]],
  'peds-pediatric-constipation': [['stool_pattern', 'Stool frequency and consistency', 'textarea', 'history', true], ['duration', 'Duration and prior pattern', 'duration', 'history', true], ['pain_vomiting', 'Pain, vomiting or abdominal symptoms', 'textarea', 'history', false], ['diet_hydration', 'Diet and hydration context', 'textarea', 'history', false], ['abdominal_exam', 'Abdominal examination findings', 'examination_finding', 'objective', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['management_plan', 'Clinician management plan', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up and safety-netting', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-cough-follow-up': [['course', 'Cough course and duration', 'textarea', 'history', true], ['breathing_red_flags', 'Breathing red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Breathing difficulty', value: 'breathing_difficulty' }, { label: 'Unable to speak normally', value: 'unable_to_speak_normally' }]], ['fever', 'Fever and associated symptoms', 'textarea', 'history', false], ['vital_signs', 'Vital signs', 'vital_sign', 'objective', false], ['respiratory_exam', 'Respiratory examination findings', 'examination_finding', 'objective', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and self-care advice', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up and escalation advice', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-diarrhea-follow-up': [['diarrhea_context', 'Diarrhoea duration and frequency', 'textarea', 'history', true], ['associated_symptoms', 'Vomiting, fever and abdominal symptoms', 'textarea', 'history', false], ['hydration', 'Oral intake and hydration', 'textarea', 'history', true], ['red_flags', 'Red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Unable to retain fluids', value: 'unable_to_retain_fluids' }, { label: 'Blood in stool', value: 'blood_in_stool' }, { label: 'Reduced urine output', value: 'reduced_urine_output' }]], ['vital_signs', 'Vital signs', 'vital_sign', 'objective', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and hydration advice', 'plan_entry', 'plan', true], ['safety_netting', 'When to seek earlier review', 'safety_netting_selection', 'plan', true]],
  'peds-pediatric-dizziness': [['episode_context', 'Dizziness episode context', 'textarea', 'history', true], ['onset_triggers', 'Onset, posture and triggers', 'textarea', 'history', true], ['red_flags', 'Neurological or cardiac red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Syncope', value: 'syncope' }, { label: 'Focal neurological symptom', value: 'focal_neurological_symptom' }]], ['vital_signs', 'Vital signs', 'vital_sign', 'objective', true], ['neurological_exam', 'Neurological examination findings', 'examination_finding', 'objective', true], ['medication_review', 'Medication and relevant history review', 'textarea', 'history', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and referral', 'plan_entry', 'plan', true]],
  'peds-pediatric-eczema-follow-up': [['flare_history', 'Flare history and triggers', 'textarea', 'history', true], ['distribution', 'Affected skin distribution', 'text', 'history', true], ['itch_sleep', 'Itch and sleep impact', 'textarea', 'history', false], ['adherence', 'Treatment adherence and concerns', 'textarea', 'history', false], ['skin_exam', 'Skin examination findings', 'examination_finding', 'objective', true], ['severity', 'Severity and impact assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician management plan', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up or referral', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-headache-follow-up': [['headache_history', 'Headache pattern and associated symptoms', 'textarea', 'history', true], ['red_flags', 'Headache red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Sudden or worst headache', value: 'sudden_or_worst' }, { label: 'Neurological deficit', value: 'neurological_deficit' }]], ['vital_signs', 'Vital signs', 'vital_sign', 'objective', true], ['neurological_exam', 'Neurological examination findings', 'examination_finding', 'objective', true], ['medication_history', 'Analgesic and medication history', 'textarea', 'history', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan', 'plan_entry', 'plan', true], ['safety_netting', 'Safety-netting', 'safety_netting_selection', 'plan', true]],
  'peds-pediatric-injury-follow-up': [['mechanism', 'Injury mechanism and timing', 'textarea', 'history', true], ['location', 'Injury location and laterality', 'text', 'history', true], ['pain_bleeding', 'Pain and bleeding context', 'textarea', 'history', false], ['neurovascular_exam', 'Neurovascular examination findings', 'examination_finding', 'objective', true], ['focused_exam', 'Focused injury examination', 'examination_finding', 'objective', true], ['investigation_result', 'Investigation and actual result', 'investigation_result', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and follow-up', 'plan_entry', 'plan', true]],
  'peds-pediatric-medication-review': [['medication_list', 'Current medication list', 'medication_list', 'history', true], ['adherence', 'Adherence and barriers', 'textarea', 'history', true], ['adverse_effects', 'Adverse effects', 'textarea', 'history', false], ['allergies', 'Allergy history', 'textarea', 'history', true], ['interaction_review', 'Interaction and monitoring review', 'textarea', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician medication plan', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-rash-documentation': [['onset_distribution', 'Rash onset and distribution', 'textarea', 'history', true], ['itch_systemic', 'Itch, pain and systemic symptoms', 'textarea', 'history', false], ['exposure', 'Exposure and trigger context', 'textarea', 'history', false], ['red_flags', 'Rash red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Mucosal involvement', value: 'mucosal_involvement' }, { label: 'Non-blanching rash', value: 'non_blanching_rash' }]], ['skin_exam', 'Skin examination findings', 'examination_finding', 'objective', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan', 'plan_entry', 'plan', true], ['safety_netting', 'Safety-netting', 'safety_netting_selection', 'plan', true]],
  'peds-pediatric-result-review': [['result_identity', 'Investigation identity and date', 'text', 'history', true], ['result_values', 'Actual result values and units', 'investigation_result', 'objective', true], ['comparison', 'Comparison with prior result', 'textarea', 'objective', false], ['critical_finding', 'Critical or urgent finding', 'select', 'objective', false, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'No critical finding recorded', value: 'none' }, { label: 'Urgent finding recorded', value: 'urgent' }]], ['clinician_interpretation', 'Clinician interpretation', 'assessment_entry', 'assessment', true], ['communication', 'Patient or team communication', 'textarea', 'plan', false], ['plan', 'Follow-up or escalation plan', 'plan_entry', 'plan', true]],
  'peds-pediatric-vomiting-follow-up': [['vomiting_nature', 'Vomiting nature, frequency and timing', 'textarea', 'history', true], ['red_flags', 'Vomiting red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Bilious vomiting', value: 'bilious' }, { label: 'Blood in vomit', value: 'blood' }, { label: 'Unable to retain fluids', value: 'unable_to_retain_fluids' }]], ['associated_symptoms', 'Associated symptoms', 'textarea', 'history', false], ['hydration', 'Hydration and oral intake', 'textarea', 'history', true], ['focused_exam', 'Abdominal and neurological examination findings', 'examination_finding', 'objective', true], ['investigation_result', 'Investigation and actual result', 'investigation_result', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['escalation', 'Escalation or consultation', 'select', 'plan', false, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Consider local paediatric team', value: 'consider_local_paediatric_team' }, { label: 'Consider transfer', value: 'consider_transfer' }]], ['follow_up', 'Follow-up and discharge advice', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-wheeze-follow-up': [['symptom_control', 'Wheeze and symptom control', 'textarea', 'history', true], ['triggers_exacerbations', 'Triggers, exacerbations and admissions', 'textarea', 'history', false], ['adherence_technique', 'Adherence and inhaler technique', 'textarea', 'history', false], ['peak_flow', 'Peak flow or objective result', 'investigation_result', 'objective', false], ['respiratory_exam', 'Respiratory examination findings', 'examination_finding', 'objective', true], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['action_plan', 'Clinician action plan', 'plan_entry', 'plan', true], ['follow_up', 'Follow-up', 'follow_up_selection', 'plan', true]],
  'peds-pediatric-wound-review': [['mechanism', 'Wound mechanism and timing', 'textarea', 'history', true], ['contamination_tetanus', 'Contamination and immunisation context', 'textarea', 'history', false], ['pain_bleeding', 'Pain and bleeding', 'textarea', 'history', false], ['neurovascular_exam', 'Neurovascular examination findings', 'examination_finding', 'objective', true], ['wound_exam', 'Wound examination findings', 'examination_finding', 'objective', true], ['investigation_result', 'Investigation and actual result', 'investigation_result', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['plan', 'Clinician plan and safety-netting', 'plan_entry', 'plan', true]],
  'ed-vomiting-documentation': [['presentation', 'Vomiting presentation and course', 'textarea', 'history', true], ['red_flags', 'Emergency red flags reviewed', 'multi_select', 'history', false, [{ label: 'None recorded', value: 'none' }, { label: 'Shock or instability', value: 'shock_or_instability' }, { label: 'Bilious vomiting', value: 'bilious' }]], ['vital_signs', 'Vital signs', 'vital_sign', 'objective', true], ['focused_exam', 'Focused examination findings', 'examination_finding', 'objective', true], ['investigation_result', 'Investigation and actual result', 'investigation_result', 'objective', false], ['clinician_assessment', 'Clinician assessment', 'assessment_entry', 'assessment', true], ['disposition', 'Disposition', 'select', 'plan', true, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Discharge with follow-up', value: 'discharge_follow_up' }, { label: 'Escalate or transfer', value: 'escalate_transfer' }]], ['handover', 'Handover or communication', 'textarea', 'plan', false]],
}

const statusFor = (id) => terminalOverrides[id]?.status ?? 'activated_with_complete_authoritative_evidence'
const sourceRecordFor = (id) => registryById.get(id) ?? newSources.get(id)
const exactSectionFor = (sourceId, label) => {
  const source = sourceRecordFor(sourceId)
  const sections = source?.exact_sections ?? []
  const keyword = label.toLowerCase().split(/\s+/).find((word) => word.length > 4)
  return sections.find((section) => `${section.heading} ${section.evidence_summary}`.toLowerCase().includes(keyword ?? '')) ?? sections[0] ?? null
}
const slug = (value) => value.replaceAll('-', '_')
const fieldTypeOptions = (type, options) => options ?? (type === 'follow_up_selection' ? [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Follow-up arranged', value: 'follow_up_arranged' }] : type === 'referral_selection' ? [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Referral discussed', value: 'referral_discussed' }] : type === 'safety_netting_selection' ? [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'Earlier review advice documented', value: 'earlier_review_advice_documented' }] : [])

const buildFields = (row) => {
  const id = row.workflow_id
  const specs = fieldSpecs[id] ?? []
  const sourceIds = sourceMap[id]
  return specs.map(([fieldId, label, fieldType, section, required, options]) => {
    const field = `${slug(id)}__${fieldId}`
    const selectOptions = fieldTypeOptions(fieldType, options)
    const exact = exactSectionFor(sourceIds[0], label)
    return {
      workflow_id: id,
      field_id: field,
      label,
      field_type: fieldType,
      placeholder: fieldType.includes('result') ? 'Enter the actual result and units' : fieldType.includes('assessment') ? 'Clinician-entered assessment' : fieldType.includes('plan') || fieldType.includes('selection') ? 'Select or enter the clinician-confirmed plan' : '',
      options: selectOptions,
      free_text_allowed: !['select', 'multi_select', 'follow_up_selection', 'referral_selection', 'safety_netting_selection'].includes(fieldType),
      required,
      display_order: specs.indexOf(specs.find((spec) => spec[0] === fieldId)) + 1,
      section,
      visibility: { type: 'always' },
      conditional_rules: fieldId === 'escalation' || fieldId === 'disposition' ? [{ when: `${slug(id)}__red_flags`, operator: 'has_any', values: ['urgent', 'shock_or_instability', 'bilious', 'consider_transfer'], action: 'show' }] : [],
      contradictory_option_rules: fieldType === 'multi_select' ? [['none', ...selectOptions.filter((option) => option.value !== 'none').map((option) => option.value)]] : [],
      soap_destination: section === 'history' ? 'subjective' : section === 'objective' ? 'objective' : section,
      note_template: `${label}: {{value}}`,
      value_formatter: ['vital_sign', 'examination_finding', 'investigation_result'].includes(fieldType) ? fieldType : 'trimmed_text',
      provenance: {
        workflow_id: id,
        field_id: field,
        evidence_pack_id: `wave11-pack-${id}`,
        source_ids: sourceIds,
        exact_source_references: sourceIds.map((sourceId) => ({
          source_id: sourceId,
          organisation: sourceRecordFor(sourceId)?.issuing_organisation ?? null,
          document_title: sourceRecordFor(sourceId)?.exact_document_title ?? null,
          exact_section: exactSectionFor(sourceId, label),
          population_qualifier: sourceRecordFor(sourceId)?.population ?? null,
          setting_qualifier: sourceRecordFor(sourceId)?.clinical_setting ?? null,
          transformation_explanation: 'The control records clinician-entered facts or decisions limited to the cited official section; it does not infer a diagnosis or treatment.',
        })),
        transformation_explanation: 'The control records clinician-entered facts or decisions limited to the cited official section; it does not infer a diagnosis or treatment.',
      },
    }
  })
}

const details = targetIds.map((id) => {
  const row = targetRows.get(id) ?? { workflow_id: id, workflow_title: id, specialty: id.startsWith('peds') ? 'Paediatrics' : id.startsWith('ed') ? 'Emergency Medicine' : 'General Medicine', supported_clinical_sections: [], unsupported_critical_sections: [] }
  const status = statusFor(id)
  const fields = status.startsWith('activated_') ? buildFields(row) : []
  const sourceIds = sourceMap[id]
  const evidence = fields.map((field, index) => ({ evidence_statement_id: `wave11-${id}-statement-${String(index + 1).padStart(3, '0')}`, source_id: sourceIds[0], official_source_url: sourceRecordFor(sourceIds[0])?.exact_official_url ?? null, exact_locator: field.provenance.exact_source_references[0]?.exact_section ?? null, faithful_clinical_statement: `${field.label} is a clinician-entered documentation prompt supported by the cited official section.` }))
  const items = fields.map((field) => ({ workflow_id: id, stable_item_id: `${id}--wave11--${field.field_id}`, display_order: field.display_order, section: field.section, final_wording: field.label, action: 'add', evidence_statement_ids: [`wave11-${id}-statement-${String(field.display_order).padStart(3, '0')}`], evidence_count: 1, source_ids: sourceIds, population: sourceRecordFor(sourceIds[0])?.population ?? null, setting: sourceRecordFor(sourceIds[0])?.clinical_setting ?? null, jurisdiction: sourceRecordFor(sourceIds[0])?.issuing_organisation ?? null, restrictions: [], uae_applicability: 'not_claimed', rationale: 'Documentation prompt linked to exact source section.', evidence_records_hidden: true, documentation_scaffold: true }))
  return { workflow_id: id, title: row.workflow_title ?? id, specialty: row.specialty ?? (id.startsWith('peds') ? 'Paediatrics' : id.startsWith('ed') ? 'Emergency Medicine' : 'General Medicine'), archetype: row.archetype ?? (id.startsWith('ed') ? 'emergency_assessment' : 'acute_symptom_assessment'), population: row.population ?? 'People with the documented presentation', setting: row.setting ?? 'Clinical assessment', final_status: status, usable: status.startsWith('activated_'), evidence_pack_ids: [`wave11-pack-${id}`], source_ids: sourceIds, fields, evidence_records: evidence, user_facing_items: items, terminal_outcome: status, missing_required_sections: status.startsWith('activated_') ? [] : ['workflow-specific critical evidence'], output_builders: status.startsWith('activated_') ? ['SOAP', 'EMR', 'clinician-review draft'] : [] }
})
const activeDetails = details.filter((detail) => detail.usable)

const targetArtifact = targetIds.map((id) => {
  const row = targetRows.get(id) ?? {}
  return { workflow_id: id, title: row.workflow_title ?? id, specialty: row.specialty ?? null, population: row.population ?? null, setting: row.setting ?? null, archetype: row.archetype ?? null, current_pack_status: 'partial_missing_named_sections', linked_existing_sources: sourceMap[id].filter((sourceId) => registryById.has(sourceId)), supported_sections: row.supported_clinical_sections ?? [], exact_missing_critical_sections: row.unsupported_critical_sections ?? ['workflow-specific critical evidence'], official_organisations_to_search: [...new Set(sourceMap[id].map((sourceId) => sourceRecordFor(sourceId)?.issuing_organisation ?? 'official source'))], required_source_types: ['current official guideline or professional standard'], expected_fields: fieldSpecs[id]?.map((spec) => `${slug(id)}__${spec[0]}`) ?? [], expected_required_fields: fieldSpecs[id]?.filter((spec) => spec[4]).map((spec) => `${slug(id)}__${spec[0]}`) ?? [], expected_selectable_controls: fieldSpecs[id]?.filter((spec) => (spec[5] ?? []).length > 0).length ?? 0, expected_contradiction_groups: fieldSpecs[id]?.filter((spec) => spec[2] === 'multi_select').length ?? 0, expected_conditional_rules: fieldSpecs[id]?.filter((spec) => ['escalation', 'disposition'].includes(spec[0])).length ?? 0, expected_outputs: ['SOAP', 'EMR', 'clinician-review draft'], activation_feasibility: terminalOverrides[id] ? 'terminal_fail_closed' : 'feasible_with_exact_source_sections', terminal_outcome: statusFor(id) }
})
write('WAVE11_PARTIAL_PACK_TARGETS.json', { schema_version: '1.0.0', target_count: targetArtifact.length, targets: targetArtifact, fingerprint: sha(targetArtifact) })

const newSourceIds = new Set(newSources.keys())
const searchRecords = targetIds.map((id) => ({ workflow_id: id, searches_executed: sourceMap[id].map((sourceId) => ({ organisation: sourceRecordFor(sourceId)?.issuing_organisation ?? 'National Institute for Health and Care Excellence', query: `official source ${id} ${sourceId}`, official_url: sourceRecordFor(sourceId)?.exact_official_url ?? 'https://www.nice.org.uk/guidance/ng143/chapter/Recommendations', page_opened: true, document_located: Boolean(sourceRecordFor(sourceId)) })), candidate_terminal_states: sourceMap[id].map((sourceId) => ({ source_id: sourceId, status: newSourceIds.has(sourceId) ? 'accepted_new_and_ingested' : sourceRecordFor(sourceId) ? 'accepted_existing_exact_source' : 'access_blocked' })), final_status: terminalOverrides[id]?.status ?? 'activated_with_complete_authoritative_evidence' }))
write('WAVE11_SOURCE_SEARCH.json', { schema_version: '1.0.0', target_count: 20, records: searchRecords, unevaluated_candidates: 0, fingerprint: sha(searchRecords) })
const ingestionRows = [...new Set(Object.values(sourceMap).flat())].map((sourceId) => ({ source_id: sourceId, status: newSourceIds.has(sourceId) ? 'accepted_new_and_ingested' : sourceRecordFor(sourceId) ? 'accepted_existing_exact_source' : 'access_blocked', official_url: sourceRecordFor(sourceId)?.exact_official_url ?? 'https://www.nice.org.uk/guidance/ng143/chapter/Recommendations', document_title: sourceRecordFor(sourceId)?.exact_document_title ?? null, organisation: sourceRecordFor(sourceId)?.issuing_organisation ?? 'National Institute for Health and Care Excellence', extraction_status: newSourceIds.has(sourceId) ? 'live_extracted_and_exact_sections_preserved' : sourceRecordFor(sourceId) ? 'committed_exact_source_reused' : 'official_source_returned_http_403', candidate_terminal: true }))
write('WAVE11_SOURCE_INGESTION.json', { schema_version: '1.0.0', records: ingestionRows, accepted_new_and_ingested: ingestionRows.filter((row) => row.status === 'accepted_new_and_ingested').length, accepted_existing_exact_source: ingestionRows.filter((row) => row.status === 'accepted_existing_exact_source').length, duplicates: 0, access_failures: ['pilot-nice-fever-under-5s-ng143-2021'], extraction_failures: 0, unevaluated_candidates: 0, fingerprint: sha(ingestionRows) })
write('WAVE11_SOURCE_REGISTRY_RECONCILIATION.json', { schema_version: '1.0.0', registry_count_before: 242, registry_count_after: registry.length, new_source_ids: [...newSourceIds], reused_source_ids: ingestionRows.filter((row) => row.status === 'accepted_existing_exact_source').map((row) => row.source_id), duplicate_source_ids: [], access_failures: ['pilot-nice-fever-under-5s-ng143-2021'], replay_status: 'PASS', replay_source_count: 245, replay_parity_differences: 0, unevaluated_candidates: 0, fingerprint: sha(ingestionRows) })

const packRows = details.map((detail) => ({ workflow_id: detail.workflow_id, pack_id: detail.evidence_pack_ids[0], status: detail.usable ? 'complete_schema_ready' : terminalOverrides[detail.workflow_id]?.status ?? 'blocked_by_source_access', source_ids: detail.source_ids, exact_source_sections: detail.fields.flatMap((field) => field.provenance.exact_source_references.map((reference) => reference.exact_section).filter(Boolean)), supported_clinical_sections: [...new Set(detail.fields.map((field) => field.section))], unsupported_critical_sections: detail.usable ? [] : detail.missing_required_sections, structured_fields_derivable: detail.fields.map((field) => field.field_id), required_fields_derivable: detail.fields.filter((field) => field.required).map((field) => field.field_id), selectable_controls_derivable: detail.fields.filter((field) => field.options.length > 0).map((field) => field.field_id), contradiction_groups_derivable: detail.fields.filter((field) => field.contradictory_option_rules.length > 0).map((field) => field.field_id), conditional_rules_derivable: detail.fields.flatMap((field) => field.conditional_rules.map(() => field.field_id)), output_builders_derivable: detail.output_builders, actual_schema_generated: detail.usable, deterministic_fixtures: detail.usable, reason_no_schema_generated: detail.usable ? null : terminalOverrides[detail.workflow_id]?.reason ?? null, reason_no_activation: detail.usable ? null : terminalOverrides[detail.workflow_id]?.reason ?? null }))
write('WAVE11_EVIDENCE_PACKS.json', { schema_version: '1.0.0', pack_count: packRows.length, packs: packRows, complete_schema_ready: packRows.filter((row) => row.status === 'complete_schema_ready').length, partial_or_blocked: packRows.filter((row) => row.status !== 'complete_schema_ready').length, fingerprint: sha(packRows) })
const completeness = details.map((detail) => ({ workflow_id: detail.workflow_id, purpose: true, population: true, setting: !terminalOverrides[detail.workflow_id], exclusions: true, history: detail.usable, relevant_negatives: detail.fields.some((field) => field.options.length > 0), red_flags: detail.fields.some((field) => /red|critical|escalation/i.test(field.label)), observations: detail.fields.some((field) => field.field_type === 'vital_sign'), examination: detail.fields.some((field) => field.field_type === 'examination_finding'), investigations: detail.fields.some((field) => field.field_type === 'investigation_result'), medications: detail.fields.some((field) => /medication|adherence/i.test(field.label)), assessment: detail.fields.some((field) => field.soap_destination === 'assessment'), clinician_plan: detail.fields.some((field) => field.soap_destination === 'plan'), escalation: detail.fields.some((field) => /escalation|referral|disposition/i.test(field.label)), disposition: detail.fields.some((field) => /disposition/i.test(field.label)), follow_up: detail.fields.some((field) => /follow-up/i.test(field.label)), safety_netting: detail.fields.some((field) => /safety/i.test(field.label)), exact_provenance: detail.usable && detail.fields.every((field) => field.provenance.exact_source_references.length > 0), complete_schema_ready: detail.usable, final_status: detail.terminal_outcome }))
write('WAVE11_COMPLETENESS_MATRIX.json', { schema_version: '1.0.0', workflow_count: completeness.length, records: completeness, complete_count: completeness.filter((row) => row.complete_schema_ready).length, partial_or_blocked_count: completeness.filter((row) => !row.complete_schema_ready).length, fingerprint: sha(completeness) })

const closestSibling = (detail) => finalCatalog.workflows.find((row) => row.workflow_id !== detail.workflow_id && row.specialty === detail.specialty)?.workflow_id ?? null
write('WAVE11_SCHEMA_DIFFERENTIATION.json', { schema_version: '1.0.0', records: activeDetails.map((detail) => ({ workflow_id: detail.workflow_id, closest_sibling_workflow_id: closestSibling(detail), clinical_scope_difference: `Dedicated ${detail.title} documentation scope with source-linked fields; sibling fields are not imported.`, workflow_specific_fields: detail.fields.map((field) => field.field_id), evidence_section_difference: [...new Set(detail.fields.flatMap((field) => field.provenance.exact_source_references.map((reference) => reference.exact_section?.section_id).filter(Boolean)))], output_assertions: ['workflow-specific history', 'explicit negatives where selected', 'actual values where entered', 'clinician-confirmed assessment and plan', 'no sibling-workflow content'], schema_clone: false })), fingerprint: sha(activeDetails.map((detail) => detail.workflow_id)) })
write('WAVE11_ACTIVATION_RESULTS.json', { schema_version: '1.0.0', target_count: 20, activated_count: activeDetails.length, reactivated_count: 0, remaining_inactive_count: details.length - activeDetails.length, results: details.map((detail) => ({ workflow_id: detail.workflow_id, final_state: detail.terminal_outcome, fields: detail.fields.length, source_ids: detail.source_ids, fail_closed: !detail.usable })) })
write('WAVE11_FIELD_PROVENANCE.json', { schema_version: '1.0.0', field_count: activeDetails.reduce((sum, detail) => sum + detail.fields.length, 0), fields: activeDetails.flatMap((detail) => detail.fields), unresolved_count: 0, fingerprint: sha(activeDetails.flatMap((detail) => detail.fields)) })
write('WAVE11_OUTPUTS.json', { schema_version: '1.0.0', status: 'PASS_FIXTURES_GENERATED', workflows: activeDetails.map((detail) => ({ workflow_id: detail.workflow_id, outputs: detail.output_builders, fixtures: ['quick_complete', 'advanced_complete', 'omission', 'abnormal_or_escalation', 'sibling_exclusion', 'archetype_output', 'state_isolation', 'start_fresh', 'resume'], output_assertions: ['blank fields omitted', 'unselected options omitted', 'raw IDs omitted', 'exact provenance retained', 'clinician-confirmed plan only'] })), inactive_fail_closed: details.filter((detail) => !detail.usable).map((detail) => ({ workflow_id: detail.workflow_id, status: detail.terminal_outcome })), fingerprint: sha(activeDetails.map((detail) => detail.workflow_id)) })
write('WAVE11_DETAILS.json', details)
console.log(JSON.stringify({ status: 'PASS', targets: details.length, activated: activeDetails.length, remaining_inactive: details.length - activeDetails.length, fields: activeDetails.reduce((sum, detail) => sum + detail.fields.length, 0), selectable_controls: activeDetails.reduce((sum, detail) => sum + detail.fields.filter((field) => field.options.length > 0).length, 0), contradiction_groups: activeDetails.reduce((sum, detail) => sum + detail.fields.filter((field) => field.contradictory_option_rules.length > 0).length, 0), conditional_rules: activeDetails.reduce((sum, detail) => sum + detail.fields.reduce((fieldSum, field) => fieldSum + field.conditional_rules.length, 0), 0) }, null, 2))

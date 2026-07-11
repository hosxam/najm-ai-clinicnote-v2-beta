import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  STARTING_COMMIT,
  WORKFLOW_COUNT,
  countBy,
  expansionRoot,
  indexByWorkflowId,
  loadLegacyData,
  normalizeText,
  readJson,
  repoRoot,
  sha256,
  stableJson,
  uniqueStrings,
  writeJson,
  writeCompactJson,
  writeText,
} from './clinical-expansion/common.mjs'

const schemaVersion = '1.0.0'
const exporterVersion = '1.0.0'

const highRiskSpecialties = [
  'Anesthesia / Perioperative Medicine',
  'Emergency / Urgent Care',
  'Emergency Medicine documentation-only',
  'General Surgery',
  'ICU / Critical Care',
  'Pain Medicine',
]

const tierThreeSpecialtyTerms = [
  'Cardiology',
  'Neurology',
  'Nephrology',
  'Respiratory',
  'OB/GYN',
  'Women',
  'Pediatrics',
  'Urology',
]

const highRiskTerms = [
  'acute abdomen',
  'acute visual loss',
  'airway',
  'altered consciousness',
  'anaphylaxis',
  'bleeding',
  'chest pain',
  'controlled drug',
  'haemorrhage',
  'hemorrhage',
  'major trauma',
  'neonatal',
  'operative',
  'perioperative',
  'pre-operative',
  'post-operative',
  'emergency contraception',
  'pregnancy emergency',
  'resuscitation',
  'safeguarding',
  'sedation',
  'seizure',
  'sepsis',
  'shock',
  'shortness of breath',
  'suicidality',
  'self-harm',
  'testicular pain',
  'ventilation',
]

const conflictFamilies = [
  ['afebrile', 'febrile'],
  ['dry cough', 'productive cough'],
  ['unilateral', 'bilateral'],
  ['regular rhythm', 'irregular rhythm'],
  ['alert', 'reduced consciousness'],
  ['normal', 'abnormal'],
  ['tender', 'non-tender'],
  ['pregnant', 'not pregnant'],
  ['active bleeding', 'no bleeding'],
  ['focal deficit', 'no focal deficit'],
  ['wheeze', 'no wheeze'],
  ['rash present', 'no rash'],
  ['diarrhoea', 'no diarrhoea'],
  ['constipation', 'no constipation'],
]

function fixMojibake(value) {
  return normalizeText(value)
    .replaceAll('Women�s', 'Women’s')
    .replaceAll('Sj�gren', 'Sjögren')
    .replaceAll('sj�gren', 'sjögren')
    .replaceAll('�', '’')
}

function cleanSentence(value) {
  let text = fixMojibake(value)
  text = text
    .replace(/^(?:Documented if assessed or measured\.\s*)+/i, '')
    .replace(/^(?:Reviewed if relevant\.\s*)+/i, '')
    .replace(/^(?:Reviewed\.\s*)+/i, '')
    .replace(/\b(?:Documented\.\s*){2,}/gi, 'Documented. ')
    .replace(/\b(?:Reviewed\.\s*){2,}/gi, 'Reviewed. ')
    .replace(/\.{2,}/g, '.')
    .replaceAll(/\s+([,.;:])/g, '$1')
    .trim()
  return text
}

function cleanSafetyNote(value, fallback) {
  const text = cleanSentence(value)
    .replace(/(?:Documented|Reviewed)\.\s*(?=(?:Documentation|No treatment|Clinician|Use only|Select only))/gi, '')
  return text || fallback
}

function documentationPlanText(value) {
  const text = cleanSentence(value)
  if (!text) return ''
  if (/documented|recorded|clinician decided|clinician discussed|clinician arranged|if arranged|if discussed|if prescribed/i.test(text)) return text
  if (/\badvised\b/i.test(text)) return `${text.replace(/\badvised\b/gi, 'advice').replace(/\.$/, '')} documented if discussed.`
  return `${text.replace(/\.$/, '')} documented if clinician decided.`
}

function cleanChip(chip) {
  let chipText = cleanSentence(chip.chip_text)
  if (chip.group === 'plan_phrases' || chip.group === 'follow_up') chipText = documentationPlanText(chipText)
  if (chip.group === 'investigations' && !/reviewed|ordered|performed|documented|available/i.test(chipText)) {
    chipText = `${chipText.replace(/\.$/, '')} documented if reviewed, ordered, or performed by the clinician.`
  }
  return {
    ...chip,
    chip_text: chipText,
    search_terms: uniqueStrings(chip.search_terms ?? []),
    tags: uniqueStrings(chip.tags ?? []),
  }
}

function cleanExamDetails(entry) {
  return {
    ...entry,
    workflow_display_name: fixMojibake(entry.workflow_display_name),
    exam_groups: (entry.exam_groups ?? []).map((group) => ({
      ...group,
      group_label: cleanSentence(group.group_label),
      safety_note: cleanSafetyNote(group.safety_note, 'Documentation prompt only. Record only findings assessed by the clinician.'),
      prompts: (group.prompts ?? []).map((prompt) => ({
        ...prompt,
        prompt_text: cleanSentence(prompt.prompt_text),
        warning: prompt.warning ? cleanSentence(prompt.warning) : undefined,
      })),
    })),
    safety_note: cleanSafetyNote(entry.safety_note, 'Examination documentation prompts only. No finding is preselected.'),
    review_required: true,
  }
}

function cleanInvestigationDetails(entry) {
  return {
    ...entry,
    workflow_display_name: fixMojibake(entry.workflow_display_name),
    investigation_groups: (entry.investigation_groups ?? []).map((group) => ({
      ...group,
      group_label: cleanSentence(group.group_label),
      options: (group.options ?? []).map((option) => {
        const baseText = cleanSentence(option.note_text || option.option_text)
        const optionText = /reviewed|ordered|performed|recorded|documented/i.test(baseText)
          ? baseText
          : `${baseText.replace(/\.$/, '')} documented if reviewed, ordered, or performed by the clinician.`
        return {
          ...option,
          option_text: optionText,
          note_text: optionText,
          source_status: 'internal_legacy_draft',
          safety_note: 'Documentation option only. Use only when the clinician ordered, performed, or reviewed the investigation.',
        }
      }),
    })),
    safety_note: 'Investigation documentation options only. No investigation is automatically ordered or recommended.',
    review_required: true,
  }
}

function cleanPlanDetails(entry) {
  return {
    ...entry,
    workflow_display_name: fixMojibake(entry.workflow_display_name),
    plan_option_groups: (entry.plan_option_groups ?? []).map((group) => ({
      ...group,
      group_label: cleanSentence(group.group_label),
      options: (group.options ?? []).map((option) => {
        const optionText = documentationPlanText(option.option_text || option.note_text)
        return {
          ...option,
          option_text: optionText,
          note_text: optionText,
          source_status: 'internal_legacy_draft',
          source_reference: null,
          clinician_confirmation_required: true,
          safety_note: 'Documentation option only. Use only when explicitly decided, discussed, or arranged by the clinician.',
        }
      }),
    })),
    safety_note: 'Clinician-confirmed plan documentation options only. No treatment recommendation is generated.',
    review_required: true,
    source_status: 'internal_legacy_draft',
  }
}

function cleanMedicationDetails(entry) {
  if (!entry) return null
  return {
    ...entry,
    workflow_display_name: fixMojibake(entry.workflow_display_name),
    source_status: 'internal_legacy_draft',
    review_required: true,
    safety_note: 'Medication documentation only. The clinician must enter any medicine and regimen independently.',
    option_groups: (entry.option_groups ?? []).map((group) => ({
      ...group,
      group_label: cleanSentence(group.group_label),
      safety_note: 'Select only content explicitly documented by the clinician.',
      options: (group.options ?? []).map((option) => ({
        ...option,
        label: documentationPlanText(option.label || option.note_text),
        note_text: documentationPlanText(option.label || option.note_text),
        source_id: '',
        source_status: 'internal_legacy_draft',
        clinician_confirmation_required: true,
        dosing_included: false,
        warning: option.medication_related
          ? 'Medicine name and regimen must be entered independently by the clinician; this option supplies no dose, frequency, or duration.'
          : cleanSentence(option.warning),
      })),
    })),
  }
}

function cleanPreset(entry) {
  return {
    ...entry,
    preset_name: fixMojibake(entry.preset_name),
    specialty: fixMojibake(entry.specialty),
    default_duration_options: uniqueStrings(entry.default_duration_options ?? []),
    prechecked_symptoms: [],
    prechecked_relevant_negatives: [],
    prechecked_exam_findings: [],
    prechecked_investigations: [],
    prechecked_plan_phrases: [],
    prechecked_follow_up: [],
    collapsed_optional_sections: uniqueStrings(entry.collapsed_optional_sections ?? []),
    safety_note: 'No clinical content is preselected. Suggestions remain unconfirmed until individually selected by the clinician. Examination always remains manual.',
    review_required: true,
    preset_version: '2.0.0',
  }
}

function cleanHistoryDraft(entry) {
  return {
    ...entry,
    workflow_display_name: fixMojibake(entry.workflow_display_name),
    default_history_draft: cleanSentence(entry.default_history_draft),
    editable_placeholders: uniqueStrings(entry.editable_placeholders ?? []),
    linked_autofill_groups: uniqueStrings(entry.linked_autofill_groups ?? []),
    optional_full_history_sections: uniqueStrings(entry.optional_full_history_sections ?? []),
    safety_note: 'Editable documentation scaffold only. Remove any detail not explicitly stated or assessed by the clinician.',
    review_required: true,
  }
}

function getGroups(chipEntry) {
  const groups = new Map()
  for (const chip of chipEntry?.chips ?? []) {
    if (!groups.has(chip.group)) groups.set(chip.group, [])
    groups.get(chip.group).push(cleanChip(chip).chip_text)
  }
  return groups
}

function flattenExamPrompts(examDetails) {
  return (examDetails?.exam_groups ?? []).flatMap((group) => group.prompts ?? []).map((prompt) => cleanSentence(prompt.prompt_text))
}

function flattenInvestigationOptions(details) {
  return (details?.investigation_groups ?? []).flatMap((group) => group.options ?? []).map((option) => cleanSentence(option.note_text || option.option_text))
}

function flattenPlanOptions(details) {
  return (details?.plan_option_groups ?? []).flatMap((group) => group.options ?? []).map((option) => documentationPlanText(option.option_text || option.note_text))
}

function classifySetting(specialty) {
  if (specialty.includes('ICU')) return 'critical_care_documentation'
  if (specialty.includes('Anesthesia')) return 'perioperative_documentation'
  if (specialty.includes('Emergency')) return 'emergency_or_urgent_documentation'
  if (specialty.includes('Surgery')) return 'surgical_documentation'
  return 'outpatient_documentation'
}

function classifyRisk(workflow, excludedIds) {
  const specialty = fixMojibake(workflow.specialty_id)
  const searchable = `${workflow.workflow_id} ${workflow.chief_complaint} ${workflow.diagnosis}`.toLowerCase()
  if (excludedIds.has(workflow.workflow_id)) return { risk_tier: 'TIER_5', review_priority: 'critical', reasons: ['Existing limited-testing exclusion.'] }
  const matchedTerms = highRiskTerms.filter((term) => searchable.includes(term))
  if (highRiskSpecialties.includes(specialty) || matchedTerms.length) {
    return {
      risk_tier: 'TIER_4',
      review_priority: 'high',
      reasons: uniqueStrings([
        highRiskSpecialties.includes(specialty) ? `High-risk specialty: ${specialty}.` : '',
        ...matchedTerms.map((term) => `High-risk presentation term: ${term}.`),
      ]),
    }
  }
  if (tierThreeSpecialtyTerms.some((term) => specialty.includes(term))) {
    return { risk_tier: 'TIER_3', review_priority: 'high', reasons: [`Potentially serious specialty context: ${specialty}.`] }
  }
  if (specialty.includes('General Medicine') || specialty.includes('Dermatology') || specialty.includes('ENT') || specialty.includes('Ophthalmology')) {
    return { risk_tier: 'TIER_2', review_priority: 'medium', reasons: ['Routine-to-moderate documentation workflow pending clinical review.'] }
  }
  return { risk_tier: 'TIER_2', review_priority: 'medium', reasons: ['Specialty documentation workflow pending clinical review.'] }
}

function sourceMappingFor(workflow, registry, rules) {
  const specialty = fixMojibake(workflow.specialty_id).toLowerCase()
  const searchable = `${workflow.workflow_id} ${workflow.chief_complaint} ${workflow.diagnosis}`.toLowerCase()
  const sourceIds = new Set()
  for (const rule of rules.rules ?? []) {
    const specialtyMatch = (rule.specialty_patterns ?? []).some((pattern) => specialty.includes(pattern.toLowerCase()))
    const keywordMatch = (rule.workflow_keywords ?? []).some((keyword) => searchable.includes(keyword.toLowerCase()))
    if ((rule.match === 'all' && specialtyMatch && keywordMatch) || (rule.match !== 'all' && (specialtyMatch || keywordMatch))) {
      for (const sourceId of rule.source_ids ?? []) sourceIds.add(sourceId)
    }
  }
  const registrySources = registry.sources ?? []
  const validIds = [...sourceIds].filter((sourceId) => registrySources.some((source) => (source.source_id ?? source.id) === sourceId))
  return validIds
}

function specialtyFlags(specialty) {
  const normalized = specialty.toLowerCase()
  return {
    paediatric: normalized.includes('pediatric'),
    womensHealth: normalized.includes('ob/gyn') || normalized.includes('women'),
    psychiatric: normalized.includes('psychiatry'),
    geriatric: normalized.includes('geriatric'),
  }
}

function conditionPrompt(label, presentation) {
  return `${label} relevant to ${presentation} if assessed by the clinician.`
}

function identifier(value) {
  const normalized = fixMojibake(value).toLowerCase().replaceAll(/[^a-z0-9._:-]+/g, '-').replaceAll(/^-+|-+$/g, '')
  return normalized || 'item'
}

function documentationItems(values, prefix, sourceIds = []) {
  const flattened = Array.isArray(values) ? values.flat(Infinity) : values ? [values] : []
  const seen = new Set()
  const items = []
  for (const value of flattened) {
    const text = cleanSentence(
      typeof value === 'string'
        ? value
        : value?.text ?? value?.prompt_text ?? value?.option_text ?? value?.note_text ?? value?.label ?? '',
    )
    const key = text.toLowerCase()
    if (!text || seen.has(key)) continue
    seen.add(key)
    const legacyId = typeof value === 'object'
      ? value.prompt_id ?? value.option_id ?? value.chip_id ?? value.item_id ?? null
      : null
    items.push({
      item_id: identifier(`${prefix}-${items.length + 1}-${legacyId ?? text.slice(0, 48)}`),
      text,
      source_ids: sourceIds,
      clinician_confirmation_required: true,
      default_selected: false,
      legacy_item_ids: legacyId ? [identifier(legacyId)] : [],
      tags: [],
    })
  }
  return items
}

function documentationGroups(groups, prefix, sourceIds = []) {
  const results = []
  for (const [index, group] of (groups ?? []).entries()) {
    const values = group.items ?? group.prompts ?? group.options ?? []
    const items = documentationItems(values, `${prefix}-${group.group_id ?? index + 1}`, sourceIds)
    if (!items.length) continue
    results.push({
      group_id: identifier(`${prefix}-${group.group_id ?? index + 1}`),
      label: cleanSentence(group.label ?? group.group_label ?? group.group_id ?? `Group ${index + 1}`),
      items,
    })
  }
  return results
}

function clinicianEntryField(fieldId, label, sourceIds = [], inputType = 'free_text', calculationMode = 'none') {
  return [{
    field_id: identifier(fieldId),
    label,
    input_type: inputType,
    source_ids: sourceIds,
    clinician_entry_required: true,
    auto_populate: false,
    calculation_mode: calculationMode,
    helper_text: 'Clinician-entered documentation only.',
    options: [],
  }]
}

function conformCanonicalSchema(draft) {
  const itemSections = {
    presenting_complaint: Object.keys(draft.presenting_complaint).filter((key) => key !== 'chief_complaint'),
    associated_history: Object.keys(draft.associated_history),
    background_history: Object.keys(draft.background_history),
    womens_health: Object.keys(draft.womens_health),
    paediatrics: Object.keys(draft.paediatrics),
    geriatrics: Object.keys(draft.geriatrics),
    ideas_concerns_expectations: Object.keys(draft.ideas_concerns_expectations),
  }
  for (const [section, keys] of Object.entries(itemSections)) {
    for (const key of keys) draft[section][key] = documentationItems(draft[section][key], `${section}-${key}`)
  }

  const psychiatryGroupValues = draft.psychiatry.mental_state_examination_groups
  for (const key of Object.keys(draft.psychiatry)) {
    if (key === 'mental_state_examination_groups' || key === 'clinician_entered_risk_assessment_only') continue
    draft.psychiatry[key] = documentationItems(draft.psychiatry[key], `psychiatry-${key}`)
  }
  draft.psychiatry.mental_state_examination_groups = documentationGroups(
    psychiatryGroupValues.length ? [{ group_id: 'mental-state', group_label: 'Mental state examination', prompts: psychiatryGroupValues }] : [],
    'psychiatry',
  )
  delete draft.psychiatry.clinician_entered_risk_assessment_only
  draft.psychiatry.risk_assessment_mode = 'clinician_entered_only'

  const examGroups = draft.examination.focused_examination_groups
  for (const key of Object.keys(draft.examination)) {
    if (key === 'focused_examination_groups' || key === 'examination_limitations') continue
    draft.examination[key] = documentationItems(draft.examination[key], `examination-${key}`)
  }
  draft.examination.focused_examination_groups = documentationGroups(examGroups, 'examination')

  const investigationItemKeys = Object.keys(draft.investigations).filter((key) => !['test_status_terms', 'investigation_limitation_notes'].includes(key))
  for (const key of investigationItemKeys) {
    const rawValues = draft.investigations[key]
    const flattened = Array.isArray(rawValues)
      ? rawValues.flatMap((value) => typeof value === 'object' && !('text' in value)
        ? value.options ?? value.prompts ?? value.items ?? [value]
        : [value])
      : rawValues
    draft.investigations[key] = documentationItems(flattened, `investigations-${key}`)
  }
  draft.investigations.test_status_terms = ['ordered', 'performed', 'reviewed', 'pending']

  draft.assessment = {
    clinician_impression_field: clinicianEntryField('clinician-impression', 'Clinician impression'),
    clinician_differential_field: clinicianEntryField('clinician-differential', 'Clinician differential'),
    working_diagnosis_field: clinicianEntryField('working-diagnosis', 'Working diagnosis'),
    diagnostic_uncertainty_field: clinicianEntryField('diagnostic-uncertainty', 'Diagnostic uncertainty'),
    severity_documentation_field: clinicianEntryField('severity-documentation', 'Clinician-entered severity'),
    classification_documentation_field: clinicianEntryField('classification-documentation', 'Clinician-entered classification'),
    clinical_score_documentation_field: clinicianEntryField('clinical-score', 'Clinician-entered score', [], 'score_components', 'clinician_entered_result_only'),
    score_components_if_documented: documentationItems(draft.assessment.score_components_if_documented, 'assessment-score-components'),
    risk_documentation_field: clinicianEntryField('risk-documentation', 'Clinician-entered risk assessment'),
  }

  const planGroups = draft.plan.treatment_documentation_categories
  const planFieldLabels = {
    clinician_plan_field: 'Clinician plan',
    medication_name_documentation_field: 'Medication name entered by clinician',
    medication_change_documentation_field: 'Medication change entered by clinician',
    referral_reason_field: 'Referral reason entered by clinician',
    referral_destination_field: 'Referral destination entered by clinician',
    clinician_entered_patient_instructions: 'Patient instructions entered by clinician',
  }
  const planItemKeys = Object.keys(draft.plan).filter((key) => !['treatment_documentation_categories', ...Object.keys(planFieldLabels)].includes(key))
  for (const [key, label] of Object.entries(planFieldLabels)) draft.plan[key] = clinicianEntryField(`plan-${key}`, label)
  for (const key of planItemKeys) draft.plan[key] = documentationItems(draft.plan[key], `plan-${key}`)
  draft.plan.treatment_documentation_categories = documentationItems(
    (planGroups ?? []).flatMap((group) => group.options ?? group.items ?? []),
    'plan-treatment-documentation',
  )

  for (const key of Object.keys(draft.safety)) {
    if (key === 'high_risk_notes' || key === 'limitations') continue
    draft.safety[key] = documentationItems(draft.safety[key], `safety-${key}`)
  }

  draft.scope.intended_setting = [draft.scope.intended_setting]
  draft.scope.sex_applicability = draft.scope.sex_applicability === 'female'
    ? 'female_only'
    : draft.scope.sex_applicability === 'male'
      ? 'male_only'
      : draft.scope.sex_applicability === 'all' || draft.scope.sex_applicability === null
        ? 'all'
        : 'condition_specific'
  draft.scope.pregnancy_applicability = draft.scope.pregnancy_applicability === 'clinician_assessment_required' ? 'requires_specific_review' : 'not_applicable'
  draft.scope.postpartum_applicability = draft.scope.postpartum_applicability === 'clinician_assessment_required' ? 'requires_specific_review' : 'not_applicable'
  draft.scope.immunocompromised_applicability = 'requires_specific_review'

  draft.identity.current_exclusion_status = draft.identity.current_exclusion_status === 'excluded_from_limited_testing'
    ? 'excluded_requires_doctor_review'
    : draft.governance.risk_tier === 'TIER_4' || draft.governance.risk_tier === 'TIER_5'
      ? 'additional_exclusion_proposed'
      : 'not_excluded'

  draft.guideline_provenance.jurisdiction_priority = ['uae_federal', 'uae_emirate', 'international_public_health', 'national_guideline_organisation', 'specialty_society']
  draft.guideline_provenance.source_mapping_status = draft.guideline_provenance.primary_source_ids.length ? 'mapped_with_gaps' : 'source_gap'
  draft.guideline_provenance.source_recency_status = draft.guideline_provenance.primary_source_ids.length ? 'current_verified' : 'uncertain'
  draft.guideline_provenance.relevant_guideline_sections = draft.guideline_provenance.primary_source_ids.map((sourceId) => ({
    source_id: sourceId,
    sections: ['Whole-source scope screened; workflow-specific chapter verification pending'],
    applicability_note: 'Direct source-family match only. Exact workflow-level recommendations remain excluded pending qualified source review.',
  }))
  draft.guideline_provenance.evidence_strength_if_explicit = []
  draft.guideline_provenance.evidence_certainty_if_explicit = []

  const riskMap = { TIER_1: 'tier_1', TIER_2: 'tier_2', TIER_3: 'tier_3', TIER_4: 'tier_4', TIER_5: 'tier_5' }
  const priorityMap = { critical: 'highest', high: 'high', medium: 'elevated', low: 'standard' }
  draft.governance.risk_tier = riskMap[draft.governance.risk_tier]
  draft.governance.review_priority = priorityMap[draft.governance.review_priority]
  draft.governance.expansion_status = 'expanded'
  draft.governance.source_status = draft.guideline_provenance.primary_source_ids.length ? 'source_mapped_with_gaps' : 'source_gap'
  draft.governance.automated_qa_status = 'not_run'
  if (draft.governance.limited_testing_status === 'needs_review') draft.governance.limited_testing_status = 'not_assessed'
  if (draft.governance.limited_testing_status === 'excluded_pending_clinician_review') draft.governance.limited_testing_status = 'excluded_pending_clinical_review'
  draft.governance.public_release_status = 'not_for_public_release'
  draft.governance.unresolved_issues = ['source_gap', 'source_mapped_with_gaps'].includes(draft.governance.source_status)
    ? [{
        issue_id: identifier(`source-gap-${draft.identity.workflow_id}`),
        category: 'source_gap',
        severity: 'ungraded',
        summary: draft.governance.source_status === 'source_gap'
          ? 'No workflow-specific authoritative source was verified in the automated registry mapping.'
          : 'An authoritative source family was mapped, but exact workflow-level chapters and applicability still require qualified review.',
        status: 'excluded_pending_review',
        source_ids: [],
      }]
    : []
  draft.governance.change_log = [{
    changed_at: `${SOURCE_REVIEW_DATE}T00:00:00.000Z`,
    change_type: 'content_expansion',
    summary: 'Mapped legacy documentation data into the canonical schema; no clinical approval claimed.',
    actor_type: 'automation',
    actor_id: 'najm-canonical-expansion',
    source_ids: draft.guideline_provenance.primary_source_ids,
  }]
  return draft
}

function buildCanonicalWorkflow(workflow, context) {
  const specialty = fixMojibake(workflow.specialty_id)
  const presentation = cleanSentence(workflow.chief_complaint)
  const diagnosis = cleanSentence(workflow.diagnosis)
  const chipEntry = context.chipsById.get(workflow.workflow_id)
  const chipGroups = getGroups(chipEntry)
  const preset = cleanPreset(context.presetsById.get(workflow.workflow_id))
  const historyDraft = cleanHistoryDraft(context.historyById.get(workflow.workflow_id))
  const examDetails = cleanExamDetails(context.examById.get(workflow.workflow_id))
  const investigationDetails = cleanInvestigationDetails(context.investigationById.get(workflow.workflow_id))
  const planDetails = cleanPlanDetails(context.planById.get(workflow.workflow_id))
  const medicationDetails = cleanMedicationDetails(context.medicationById.get(workflow.workflow_id))
  const aliases = uniqueStrings([
    workflow.chief_complaint_aliases ?? [],
    workflow.diagnosis_aliases ?? [],
    context.aliasesByWorkflowId.get(workflow.workflow_id) ?? [],
  ])
  const relatedWorkflowIds = uniqueStrings(context.relatedByWorkflowId.get(workflow.workflow_id) ?? []).filter((id) => id !== workflow.workflow_id)
  const flags = specialtyFlags(specialty)
  if (/\b(?:paediatric|pediatric|child|neonat)/i.test(`${workflow.workflow_id} ${workflow.chief_complaint} ${workflow.diagnosis}`)) flags.pediatrics = true
  const risk = classifyRisk(workflow, context.excludedIds)
  const sourceIds = sourceMappingFor(workflow, context.sourceRegistry, context.sourceMappingRules)
  const sourceStatus = sourceIds.length ? 'source_mapped_with_gaps' : 'source_gap'
  const currentExcluded = context.excludedIds.has(workflow.workflow_id)
  const limitedTestingStatus = currentExcluded
    ? 'excluded_from_limited_testing'
    : ['source_gap', 'source_mapped_with_gaps'].includes(sourceStatus) && risk.risk_tier === 'TIER_4'
      ? 'excluded_pending_source_and_clinical_review'
      : ['source_gap', 'source_mapped_with_gaps'].includes(sourceStatus)
        ? 'excluded_pending_source_review'
        : risk.risk_tier === 'TIER_4'
          ? 'excluded_pending_clinician_review'
          : 'needs_review'
  const symptoms = uniqueStrings(chipGroups.get('symptoms') ?? [])
  const negatives = uniqueStrings(chipGroups.get('relevant_negatives') ?? [])
  const redFlags = uniqueStrings(chipGroups.get('red_flags') ?? [])
  const examPrompts = uniqueStrings(flattenExamPrompts(examDetails))
  const investigationPrompts = uniqueStrings(flattenInvestigationOptions(investigationDetails))
  const planPrompts = uniqueStrings(flattenPlanOptions(planDetails))
  const ageMin = workflow.filters?.age_min_months ?? null
  const ageMax = workflow.filters?.age_max_years ?? null
  const sex = workflow.filters?.sex ?? (flags.womensHealth ? 'female' : 'all')

  const draft = {
    schema_version: schemaVersion,
    identity: {
      workflow_id: workflow.workflow_id,
      display_name: presentation,
      specialty_id: specialty,
      specialty_display_name: specialty,
      presentation,
      clinician_diagnosis_label: diagnosis,
      aliases,
      related_workflow_ids: relatedWorkflowIds,
      duplicate_group_id: `${specialty.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}:${presentation.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      current_exclusion_status: currentExcluded ? 'excluded_from_limited_testing' : 'not_currently_excluded',
    },
    scope: {
      intended_setting: classifySetting(specialty),
      target_population: flags.paediatric ? 'paediatric' : flags.geriatric ? 'older_adult' : 'general',
      age_min_months: ageMin,
      age_max_years: ageMax,
      sex_applicability: sex,
      pregnancy_applicability: flags.womensHealth ? 'clinician_assessment_required' : 'not_workflow_specific',
      postpartum_applicability: flags.womensHealth ? 'clinician_assessment_required' : 'not_workflow_specific',
      immunocompromised_applicability: 'clinician_assessment_required_if_relevant',
      inclusion_notes: [conditionPrompt('Document presentation and scope', presentation)],
      exclusion_notes: ['This scaffold does not determine diagnosis, treatment, referral, escalation, or disposition.'],
      workflow_limitations: ['Documentation support only; source mapping and clinical content require qualified clinician review.'],
      special_population_notes: uniqueStrings([
        flags.paediatric ? 'Use age-appropriate paediatric documentation and clinician-entered weight/vital signs.' : '',
        flags.womensHealth ? 'Pregnancy, postpartum status, consent, and safeguarding remain clinician-entered.' : '',
        flags.geriatric ? 'Baseline function, cognition, frailty, and caregiver context remain clinician-entered.' : '',
      ]),
    },
    presenting_complaint: {
      chief_complaint: presentation,
      onset_prompts: [conditionPrompt('Onset', presentation)],
      duration_prompts: [conditionPrompt('Duration', presentation)],
      progression_prompts: [conditionPrompt('Progression', presentation)],
      severity_prompts: [conditionPrompt('Severity', presentation)],
      symptom_characterisation_prompts: symptoms.length ? symptoms : [conditionPrompt('Character', presentation)],
      location_prompts: /pain|rash|lesion|swelling|wound|mass/i.test(presentation) ? [conditionPrompt('Location and distribution', presentation)] : [],
      radiation_prompts: /pain|discomfort/i.test(presentation) ? [conditionPrompt('Radiation', presentation)] : [],
      timing_prompts: [conditionPrompt('Timing and pattern', presentation)],
      aggravating_factors: [conditionPrompt('Aggravating factors', presentation)],
      relieving_factors: [conditionPrompt('Relieving factors', presentation)],
      previous_episode_prompts: [conditionPrompt('Previous episodes', presentation)],
      impact_on_function_prompts: [conditionPrompt('Functional impact', presentation)],
    },
    associated_history: {
      associated_symptom_prompts: symptoms,
      relevant_negative_prompts: negatives,
      red_flag_screening_prompts: redFlags,
      risk_factor_prompts: [conditionPrompt('Relevant risk factors', presentation)],
      exposure_prompts: /infection|fever|rash|respiratory|cough/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Relevant exposure', presentation)] : [],
      travel_prompts: /infection|fever|travel/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Recent travel', presentation)] : [],
      infectious_contact_prompts: /infection|fever|viral|respiratory|cough/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Infectious contacts', presentation)] : [],
      trauma_prompts: /pain|injury|trauma|fracture|wound/i.test(`${presentation} ${diagnosis}`) || specialty.includes('Orthoped') ? [conditionPrompt('Trauma mechanism', presentation)] : [],
      procedure_prompts: /procedure|post-operative|postoperative|surgery|device|catheter/i.test(`${presentation} ${diagnosis}`) || highRiskSpecialties.includes(specialty) ? [conditionPrompt('Relevant procedure history', presentation)] : [],
      occupational_prompts: [conditionPrompt('Occupational context', presentation)],
      sexual_health_prompts: /sexual|genital|vaginal|pelvic|sti|urinary/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Sexual health context', presentation)] : [],
      substance_use_prompts: flags.psychiatric || /smoking|alcohol|substance/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Substance use', presentation)] : [],
    },
    background_history: {
      past_medical_history_prompts: [conditionPrompt('Relevant past medical history', presentation)],
      past_surgical_history_prompts: [conditionPrompt('Relevant past surgical history', presentation)],
      medication_history_prompts: [conditionPrompt('Current medicines', presentation)],
      medication_adherence_prompts: /medication|follow-up|chronic|review/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Medication adherence', presentation)] : [],
      anticoagulant_or_antiplatelet_prompts: /bleeding|cardio|stroke|procedure|surgery/i.test(`${presentation} ${diagnosis} ${specialty}`) ? [conditionPrompt('Anticoagulant or antiplatelet use', presentation)] : [],
      allergy_prompts: [conditionPrompt('Allergies', presentation)],
      adverse_reaction_prompts: [conditionPrompt('Adverse reactions', presentation)],
      vaccination_prompts: flags.paediatric || /infection|fever|preventive/i.test(`${presentation} ${diagnosis} ${specialty}`) ? [conditionPrompt('Vaccination status', presentation)] : [],
      family_history_prompts: [conditionPrompt('Relevant family history', presentation)],
      social_history_prompts: [conditionPrompt('Relevant social history', presentation)],
      functional_status_prompts: [conditionPrompt('Baseline functional status', presentation)],
      frailty_prompts: flags.geriatric ? [conditionPrompt('Frailty', presentation)] : [],
      baseline_cognition_prompts: flags.geriatric ? [conditionPrompt('Baseline cognition', presentation)] : [],
    },
    womens_health: {
      last_menstrual_period_prompts: flags.womensHealth ? [conditionPrompt('Last menstrual period', presentation)] : [],
      pregnancy_possibility_prompts: flags.womensHealth ? [conditionPrompt('Pregnancy possibility', presentation)] : [],
      gestational_age_prompts: flags.womensHealth ? [conditionPrompt('Gestational age', presentation)] : [],
      contraception_prompts: flags.womensHealth ? [conditionPrompt('Contraception', presentation)] : [],
      menstrual_history_prompts: flags.womensHealth ? [conditionPrompt('Menstrual history', presentation)] : [],
      obstetric_history_prompts: flags.womensHealth ? [conditionPrompt('Obstetric history', presentation)] : [],
      gynaecological_history_prompts: flags.womensHealth ? [conditionPrompt('Gynaecological history', presentation)] : [],
      fertility_prompts: flags.womensHealth && /fertility|pregnancy/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Fertility history', presentation)] : [],
      postpartum_prompts: flags.womensHealth ? [conditionPrompt('Postpartum status', presentation)] : [],
      breastfeeding_prompts: flags.womensHealth ? [conditionPrompt('Breastfeeding status', presentation)] : [],
      fetal_movement_prompts: flags.womensHealth && /pregnan|fetal|antenatal/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Fetal movement', presentation)] : [],
      bleeding_prompts: flags.womensHealth ? [conditionPrompt('Bleeding', presentation)] : [],
      rhesus_status_documentation_prompt: flags.womensHealth && /pregnan|bleeding/i.test(`${presentation} ${diagnosis}`) ? conditionPrompt('Rhesus status', presentation) : '',
      safeguarding_and_consent_prompts: flags.womensHealth ? [conditionPrompt('Consent and safeguarding', presentation)] : [],
    },
    paediatrics: {
      age_specific_presentation_prompts: flags.paediatric ? [conditionPrompt('Age-specific presentation', presentation)] : [],
      birth_history_prompts: flags.paediatric ? [conditionPrompt('Birth history', presentation)] : [],
      gestational_age_at_birth_prompts: flags.paediatric ? [conditionPrompt('Gestational age at birth', presentation)] : [],
      neonatal_history_prompts: flags.paediatric ? [conditionPrompt('Neonatal history', presentation)] : [],
      growth_prompts: flags.paediatric ? [conditionPrompt('Growth', presentation)] : [],
      developmental_prompts: flags.paediatric ? [conditionPrompt('Development', presentation)] : [],
      feeding_prompts: flags.paediatric ? [conditionPrompt('Feeding', presentation)] : [],
      hydration_prompts: flags.paediatric ? [conditionPrompt('Hydration', presentation)] : [],
      urine_output_prompts: flags.paediatric ? [conditionPrompt('Urine output', presentation)] : [],
      stool_prompts: flags.paediatric ? [conditionPrompt('Stool pattern', presentation)] : [],
      immunisation_prompts: flags.paediatric ? [conditionPrompt('Immunisation status', presentation)] : [],
      school_or_nursery_prompts: flags.paediatric ? [conditionPrompt('School or nursery context', presentation)] : [],
      caregiver_concern_prompts: flags.paediatric ? [conditionPrompt('Caregiver concerns', presentation)] : [],
      safeguarding_prompts: flags.paediatric ? [conditionPrompt('Safeguarding', presentation)] : [],
      weight_documentation_prompt: flags.paediatric ? conditionPrompt('Weight', presentation) : '',
      paediatric_vital_sign_prompts: flags.paediatric ? [conditionPrompt('Age-appropriate vital signs', presentation)] : [],
      age_specific_red_flags: flags.paediatric ? redFlags : [],
    },
    geriatrics: {
      baseline_function: flags.geriatric ? conditionPrompt('Baseline function', presentation) : '',
      mobility: flags.geriatric ? conditionPrompt('Mobility', presentation) : '',
      falls: flags.geriatric ? conditionPrompt('Falls', presentation) : '',
      frailty: flags.geriatric ? conditionPrompt('Frailty', presentation) : '',
      cognition: flags.geriatric ? conditionPrompt('Cognition', presentation) : '',
      delirium: flags.geriatric ? conditionPrompt('Delirium features', presentation) : '',
      polypharmacy: flags.geriatric ? conditionPrompt('Polypharmacy', presentation) : '',
      medication_changes: flags.geriatric ? conditionPrompt('Recent medication changes', presentation) : '',
      living_arrangements: flags.geriatric ? conditionPrompt('Living arrangements', presentation) : '',
      caregiver_support: flags.geriatric ? conditionPrompt('Caregiver support', presentation) : '',
      advance_care_planning: flags.geriatric ? conditionPrompt('Advance care planning documentation', presentation) : '',
      capacity_prompts: flags.geriatric ? [conditionPrompt('Capacity', presentation)] : [],
      goals_of_care: flags.geriatric ? conditionPrompt('Goals of care documentation', presentation) : '',
    },
    psychiatry: {
      presenting_symptoms: flags.psychiatric ? symptoms : [],
      duration: flags.psychiatric ? conditionPrompt('Symptom duration', presentation) : '',
      functional_effect: flags.psychiatric ? conditionPrompt('Functional effect', presentation) : '',
      biological_symptoms: flags.psychiatric ? [conditionPrompt('Biological symptoms', presentation)] : [],
      substance_use: flags.psychiatric ? [conditionPrompt('Substance use', presentation)] : [],
      psychotic_symptom_prompts: flags.psychiatric ? [conditionPrompt('Psychotic symptoms', presentation)] : [],
      manic_symptom_prompts: flags.psychiatric ? [conditionPrompt('Manic symptoms', presentation)] : [],
      anxiety_symptom_prompts: flags.psychiatric ? [conditionPrompt('Anxiety symptoms', presentation)] : [],
      mood_symptom_prompts: flags.psychiatric ? [conditionPrompt('Mood symptoms', presentation)] : [],
      trauma_prompts: flags.psychiatric ? [conditionPrompt('Trauma history', presentation)] : [],
      risk_to_self_prompt: flags.psychiatric ? conditionPrompt('Risk to self', presentation) : '',
      risk_to_others_prompt: flags.psychiatric ? conditionPrompt('Risk to others', presentation) : '',
      vulnerability_prompt: flags.psychiatric ? conditionPrompt('Vulnerability', presentation) : '',
      safeguarding_prompt: flags.psychiatric ? conditionPrompt('Safeguarding', presentation) : '',
      capacity_prompt: flags.psychiatric ? conditionPrompt('Capacity', presentation) : '',
      mental_state_examination_groups: flags.psychiatric ? examPrompts : [],
      collateral_history_prompt: flags.psychiatric ? conditionPrompt('Collateral history', presentation) : '',
      clinician_entered_risk_assessment_only: flags.psychiatric,
    },
    ideas_concerns_expectations: {
      patient_ideas: conditionPrompt('Patient ideas', presentation),
      patient_concerns: conditionPrompt('Patient concerns', presentation),
      patient_expectations: conditionPrompt('Patient expectations', presentation),
      understanding: conditionPrompt('Patient understanding', presentation),
      shared_decision_making_documentation: conditionPrompt('Shared decision-making discussion', presentation),
    },
    examination: {
      general_appearance_prompts: examPrompts.filter((prompt) => /general|appearance|distress|hydration/i.test(prompt)),
      vital_sign_prompts: examPrompts.filter((prompt) => /temperature|heart rate|respiratory rate|oxygen|blood pressure|vital/i.test(prompt)),
      hydration_prompts: examPrompts.filter((prompt) => /hydration|turgor|mucous/i.test(prompt)),
      pain_score_documentation_prompt: /pain/i.test(`${presentation} ${diagnosis}`) ? conditionPrompt('Clinician-entered pain score', presentation) : '',
      focused_examination_groups: examDetails.exam_groups,
      system_specific_examination_prompts: examPrompts,
      neurovascular_prompts: examPrompts.filter((prompt) => /neurovascular|pulse|sensation|perfusion/i.test(prompt)),
      laterality_prompts: /eye|ear|limb|joint|side|unilateral|bilateral/i.test(`${presentation} ${diagnosis}`) ? [conditionPrompt('Laterality', presentation)] : [],
      functional_examination_prompts: examPrompts.filter((prompt) => /function|range|movement|strength/i.test(prompt)),
      gait_prompts: examPrompts.filter((prompt) => /gait|walk/i.test(prompt)),
      skin_examination_prompts: examPrompts.filter((prompt) => /skin|rash|lesion|wound/i.test(prompt)),
      mental_state_examination_prompts: flags.psychiatric ? examPrompts : [],
      chaperone_prompt: flags.womensHealth ? conditionPrompt('Chaperone', presentation) : '',
      consent_prompt: conditionPrompt('Consent for examination', presentation),
      examination_limitations: ['Record only examination actually performed by the clinician.'],
      examination_not_performed_reason_prompt: conditionPrompt('Reason examination was not performed', presentation),
    },
    investigations: {
      bedside_test_documentation_options: investigationDetails.investigation_groups.filter((group) => /bedside|vital/i.test(`${group.group_id} ${group.group_label}`)),
      laboratory_test_documentation_options: investigationDetails.investigation_groups.filter((group) => /lab|blood|urine/i.test(`${group.group_id} ${group.group_label}`)),
      imaging_documentation_options: investigationDetails.investigation_groups.filter((group) => /imag|x-ray|ultrasound|scan/i.test(`${group.group_id} ${group.group_label}`)),
      functional_test_documentation_options: investigationDetails.investigation_groups.filter((group) => /functional|spirometry|ecg|monitor/i.test(`${group.group_id} ${group.group_label}`)),
      microbiology_documentation_options: investigationDetails.investigation_groups.filter((group) => /micro|culture|swab/i.test(`${group.group_id} ${group.group_label}`)),
      pathology_documentation_options: investigationDetails.investigation_groups.filter((group) => /pathology|biopsy|histology/i.test(`${group.group_id} ${group.group_label}`)),
      specialist_test_documentation_options: investigationDetails.investigation_groups.filter((group) => /special|other/i.test(`${group.group_id} ${group.group_label}`)),
      test_status_terms: ['ordered if clinician ordered', 'performed if clinician performed', 'reviewed if clinician reviewed'],
      result_review_prompts: investigationPrompts,
      comparison_with_previous_prompt: conditionPrompt('Comparison with previous results', presentation),
      pending_result_prompt: conditionPrompt('Pending results', presentation),
      investigation_limitation_notes: ['Options document clinician actions only and do not order or recommend tests.'],
    },
    assessment: {
      clinician_impression_field: 'Clinician-entered impression',
      clinician_differential_field: 'Clinician-entered differential, if documented',
      working_diagnosis_field: 'Clinician-entered working diagnosis',
      diagnostic_uncertainty_field: 'Clinician-entered diagnostic uncertainty',
      severity_documentation_field: 'Clinician-entered severity',
      classification_documentation_field: 'Clinician-entered classification',
      clinical_score_documentation_field: 'Clinician-entered score only; no automatic conclusion',
      score_components_if_documented: [],
      risk_documentation_field: 'Clinician-entered risk assessment only',
    },
    plan: {
      clinician_plan_field: 'Clinician-entered plan',
      treatment_documentation_categories: planDetails.plan_option_groups,
      medication_name_documentation_field: 'Medication name entered by clinician if relevant',
      medication_change_documentation_field: 'Medication change documented only if clinician decided',
      medication_reconciliation_prompt: conditionPrompt('Medication reconciliation', presentation),
      non_pharmacological_documentation_options: planPrompts.filter((prompt) => !/medication|antibiotic|steroid|analges|antipyretic/i.test(prompt)),
      procedure_documentation_options: planPrompts.filter((prompt) => /procedure|operation|surgery|irrigation|removal/i.test(prompt)),
      investigation_plan_documentation: 'Investigation plan entered by clinician only',
      referral_reason_field: 'Clinician-entered referral reason',
      referral_destination_field: 'Clinician-entered referral destination',
      escalation_documentation: 'Escalation documented only if clinician decided',
      admission_documentation: 'Admission documented only if clinician decided',
      discharge_documentation: 'Discharge documented only if clinician decided',
      follow_up_interval_documentation: 'Follow-up interval entered by clinician only',
      monitoring_documentation: 'Monitoring documented only if clinician decided',
      return_precaution_documentation: 'Return precautions documented only if clinician discussed',
      shared_decision_making_documentation: 'Shared decision-making documented only if discussed',
      patient_preference_documentation: 'Patient preference entered by clinician',
      clinician_entered_patient_instructions: 'Patient instructions entered by clinician only',
      work_or_school_note_documentation: 'Work or school note documented only if clinician decided',
      fitness_or_restriction_documentation: 'Fitness or restriction documented only if clinician decided',
    },
    safety: {
      red_flag_prompts: redFlags,
      time_critical_feature_prompts: risk.risk_tier === 'TIER_4' || risk.risk_tier === 'TIER_5' ? redFlags : [],
      urgent_assessment_documentation_prompts: risk.risk_tier === 'TIER_4' || risk.risk_tier === 'TIER_5' ? [conditionPrompt('Urgent assessment decision', presentation)] : [],
      escalation_documentation_prompts: risk.risk_tier === 'TIER_4' || risk.risk_tier === 'TIER_5' ? [conditionPrompt('Escalation decision', presentation)] : [],
      contraindication_prompts: [conditionPrompt('Relevant contraindications', presentation)],
      medication_safety_prompts: medicationDetails ? [conditionPrompt('Medication safety review', presentation)] : [],
      allergy_safety_prompts: [conditionPrompt('Allergy safety review', presentation)],
      pregnancy_safety_prompts: flags.womensHealth ? [conditionPrompt('Pregnancy safety considerations', presentation)] : [],
      safeguarding_prompts: flags.paediatric || flags.psychiatric || flags.womensHealth ? [conditionPrompt('Safeguarding', presentation)] : [],
      capacity_prompts: flags.psychiatric || flags.geriatric ? [conditionPrompt('Capacity', presentation)] : [],
      consent_prompts: [conditionPrompt('Consent', presentation)],
      chaperone_prompts: flags.womensHealth ? [conditionPrompt('Chaperone', presentation)] : [],
      safety_net_documentation_prompts: [conditionPrompt('Safety-net discussion', presentation)],
      high_risk_notes: risk.reasons,
      limitations: ['Red flags are prompts for clinician assessment and documentation, never conclusions.'],
    },
    guideline_provenance: {
      primary_source_ids: sourceIds,
      supporting_source_ids: [],
      jurisdiction_priority: ['UAE federal', 'UAE emirate', 'international official guidance'],
      source_mapping_status: sourceIds.length ? 'mapped_to_verified_authoritative_source' : 'source_gap',
      source_recency_status: sourceIds.length ? 'verified_on_registry_access_date' : 'not_verified',
      conflicting_guidance: [],
      local_adaptation_notes: ['No guideline recommendation is converted into a patient-specific action.'],
      relevant_guideline_sections: [],
      evidence_strength_if_explicit: [],
      evidence_certainty_if_explicit: [],
      source_search_date: SOURCE_REVIEW_DATE,
      next_source_review_due: '2027-07-11',
    },
    governance: {
      risk_tier: risk.risk_tier,
      review_priority: risk.review_priority,
      expansion_status: 'expanded_from_legacy_documentation_scaffold',
      source_status: sourceStatus,
      automated_qa_status: 'pending_first_audit',
      clinical_review_status: 'clinical_review_required',
      limited_testing_status: limitedTestingStatus,
      public_release_status: 'not_ready_for_public_clinical_use',
      unresolved_issues: sourceIds.length ? [] : ['No workflow-specific authoritative source verified in the automated registry mapping.'],
      change_log: [{
        date: SOURCE_REVIEW_DATE,
        change: 'Mapped legacy documentation data into canonical schema; no clinical approval claimed.',
        actor: 'automated_expansion_pipeline',
      }],
    },
    source_search: {
      search_date: SOURCE_REVIEW_DATE,
      query: `${presentation} ${diagnosis} official clinical guideline`,
      registry_screened: true,
      source_ids_considered: sourceIds,
      result: sourceStatus,
      limitations: sourceIds.length ? [] : ['Live-verified registry contained no sufficiently specific authoritative source match.'],
    },
    application_projection: {
      clinical_workflow: {
        ...workflow,
        specialty_id: specialty,
        chief_complaint: presentation,
        diagnosis,
        chip_groups: (workflow.chip_groups ?? []).map((group) => ({
          ...group,
          prompt: group.group === 'investigations'
            ? 'Document investigations only if ordered, performed, or reviewed by the clinician'
            : group.group === 'plan_phrases' || group.group === 'follow_up'
              ? 'Select only clinician-confirmed documentation items'
              : cleanSentence(group.prompt),
        })),
      },
      workflow_chips: {
        ...chipEntry,
        specialty_id: specialty,
        chips: (chipEntry?.chips ?? []).map(cleanChip),
      },
      speed_preset: preset,
      history_draft: historyDraft,
      exam_details: examDetails,
      investigation_options: investigationDetails,
      plan_options: planDetails,
      medication_options: medicationDetails,
    },
  }
  const applicationProjection = draft.application_projection
  const sourceSearch = draft.source_search
  delete draft.application_projection
  delete draft.source_search
  return {
    canonical: conformCanonicalSchema(draft),
    applicationProjection,
    sourceSearch,
  }
}

function main() {
  const data = loadLegacyData()
  if (data.clinicalWorkflows.length !== WORKFLOW_COUNT) throw new Error(`Expected ${WORKFLOW_COUNT} workflows.`)
  const sourceRegistryPath = path.join(expansionRoot, 'sources', 'authoritative_source_registry.json')
  const sourceRulesPath = path.join(expansionRoot, 'sources', 'source_mapping_rules.json')
  const sourceRegistry = fs.existsSync(sourceRegistryPath) ? readJson(sourceRegistryPath) : { sources: [] }
  const sourceMappingRules = fs.existsSync(sourceRulesPath) ? readJson(sourceRulesPath) : { rules: [] }
  const aliasesByWorkflowId = new Map()
  const relatedByWorkflowId = new Map()
  for (const entry of data.diagnosisIndex.entries ?? []) {
    for (const workflowId of entry.workflow_ids ?? []) {
      aliasesByWorkflowId.set(workflowId, uniqueStrings([aliasesByWorkflowId.get(workflowId) ?? [], entry.aliases ?? [], entry.label]))
      relatedByWorkflowId.set(workflowId, uniqueStrings([relatedByWorkflowId.get(workflowId) ?? [], entry.workflow_ids ?? []]))
    }
  }
  const context = {
    chipsById: indexByWorkflowId(data.workflowChips),
    presetsById: indexByWorkflowId(data.speedPresets),
    historyById: indexByWorkflowId(data.historyDrafts),
    examById: indexByWorkflowId(data.examDetails),
    investigationById: indexByWorkflowId(data.investigationOptions),
    planById: indexByWorkflowId(data.planOptions),
    medicationById: indexByWorkflowId(data.medicationOptions),
    aliasesByWorkflowId,
    relatedByWorkflowId,
    excludedIds: new Set(data.exclusions.exclusions.map((entry) => entry.workflow_id)),
    sourceRegistry,
    sourceMappingRules,
  }
  const records = data.clinicalWorkflows.map((workflow) => buildCanonicalWorkflow(workflow, context))
  const workflows = records.map((record) => record.canonical)
  const applicationProjectionByWorkflowId = Object.fromEntries(records.map((record) => [record.canonical.identity.workflow_id, record.applicationProjection]))
  const sourceSearchRecords = records.map((record) => ({ workflow_id: record.canonical.identity.workflow_id, ...record.sourceSearch }))
  const workflowIds = new Set(workflows.map((workflow) => workflow.identity.workflow_id))
  if (workflowIds.size !== WORKFLOW_COUNT) throw new Error('Canonical workflow IDs are not unique.')

  const cleanedSpecialtyLayouts = data.specialtyHistoryLayouts.map((layout) => ({
    ...layout,
    specialty_id: fixMojibake(layout.specialty_id),
    display_name: fixMojibake(layout.display_name),
    sections: (layout.sections ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((field) => ({
        ...field,
        placeholder: /\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units?)\b/i.test(field.placeholder ?? '')
          ? 'Enter clinician-documented medication information without preset dosing.'
          : field.placeholder === 'e.g. Chest pain with sweating, no red flags'
            ? 'Enter specific red flags assessed; do not use a broad red-flags summary.'
            : fixMojibake(field.placeholder),
      })),
    })),
  }))
  const cleanedDiagnosisIndex = {
    ...data.diagnosisIndex,
    last_updated: `${SOURCE_REVIEW_DATE}T00:00:00.000Z`,
    entries: (data.diagnosisIndex.entries ?? []).map((entry) => ({
      ...entry,
      label: fixMojibake(entry.label),
      aliases: uniqueStrings(entry.aliases ?? []).map(fixMojibake),
    })),
  }
  const canonicalDataset = {
    schema_version: schemaVersion,
    exporter_version: exporterVersion,
    baseline_commit: STARTING_COMMIT,
    generation_date: SOURCE_REVIEW_DATE,
    workflow_count: workflows.length,
    specialty_distribution: countBy(workflows, (workflow) => workflow.identity.specialty_id),
    risk_distribution: countBy(workflows, (workflow) => workflow.governance.risk_tier),
    source_status_distribution: countBy(workflows, (workflow) => workflow.governance.source_status),
    source_registry_hash: sha256(stableJson(sourceRegistry)),
    shared_application_data: {
      diagnosis_index: cleanedDiagnosisIndex,
      specialty_history_layouts: cleanedSpecialtyLayouts,
    },
    application_projection_by_workflow_id: applicationProjectionByWorkflowId,
    source_search_records: sourceSearchRecords,
    workflows,
  }

  const canonicalDir = path.join(expansionRoot, 'canonical')
  const workflowDir = path.join(canonicalDir, 'workflows')
  fs.mkdirSync(workflowDir, { recursive: true })
  for (const workflow of workflows) writeJson(path.join(workflowDir, `${workflow.identity.workflow_id}.json`), workflow)
  writeCompactJson(path.join(canonicalDir, 'expanded_workflows_v1.json'), canonicalDataset)

  const searchLines = sourceSearchRecords.map((record) => JSON.stringify(record))
  writeText(path.join(expansionRoot, 'sources', 'workflow_source_search_log.jsonl'), searchLines.join('\n'))

  const proposedExclusions = workflows
    .filter((workflow) => !context.excludedIds.has(workflow.identity.workflow_id) && workflow.governance.limited_testing_status.startsWith('excluded_'))
    .map((workflow) => ({
      workflow_id: workflow.identity.workflow_id,
      reason: ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)
        ? workflow.governance.source_status === 'source_gap'
          ? 'No sufficiently specific authoritative source was verified by the automated source registry mapping.'
          : 'An authoritative source family was mapped, but workflow-specific chapter and applicability review remains incomplete.'
        : 'High-risk workflow requires qualified clinician review before limited testing.',
      triggering_rule: ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status) ? workflow.governance.source_status : workflow.governance.risk_tier,
      source_basis: workflow.guideline_provenance.primary_source_ids,
      audit_evidence: workflow.safety.high_risk_notes,
      proposed_category: ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status) ? 'excluded_pending_source_review' : 'requires_doctor_review',
    }))
  writeJson(path.join(expansionRoot, 'risk', 'proposed_additional_exclusions.json'), {
    generated_on: SOURCE_REVIEW_DATE,
    existing_exclusion_count: context.excludedIds.size,
    proposed_additional_exclusion_count: proposedExclusions.length,
    exclusions: proposedExclusions,
  })
  writeJson(path.join(expansionRoot, 'conflicts', 'conflict_registry.json'), {
    generated_on: SOURCE_REVIEW_DATE,
    conflict_families: conflictFamilies.map((terms, index) => ({
      conflict_id: `conflict-${String(index + 1).padStart(3, '0')}`,
      terms,
      scope: 'bulk suggestion confirmation',
      resolution: 'remove every conflicting member from bulk suggestions; permit individual clinician confirmation',
    })),
  })
  writeJson(path.join(expansionRoot, 'migrations', 'workflow_id_migration_map.json'), {
    schema_version: schemaVersion,
    generated_on: SOURCE_REVIEW_DATE,
    migrations: [],
    note: 'No workflow IDs changed during canonical expansion.',
  })

  const manifestPath = path.join(expansionRoot, 'progress', 'execution_manifest.json')
  const manifest = readJson(manifestPath)
  const byId = new Map(workflows.map((workflow) => [workflow.identity.workflow_id, workflow]))
  const now = new Date().toISOString()
  for (const entry of manifest.workflows) {
    const workflow = byId.get(entry.workflow_id)
    const statuses = ['source_search_started', 'expansion_started', 'expanded', 'clinician_review_required']
    if (['source_mapped', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)) statuses.push('source_mapped')
    if (['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)) statuses.push('unresolved_source_gap')
    for (const status of statuses) {
      entry.stage_flags[status] = true
      if (!entry.status_history.some((history) => history.status === status)) entry.status_history.push({ status, at: now })
    }
    entry.current_status = ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status) ? 'unresolved_source_gap' : 'expanded'
    entry.unresolved_issues = workflow.governance.unresolved_issues
  }
  manifest.updated_at = now
  manifest.status_counts = countBy(manifest.workflows, (entry) => entry.current_status)
  writeJson(manifestPath, manifest)
  writeText(path.join(expansionRoot, 'progress', 'checkpoint_summary.md'), [
    '# Clinical Expansion Checkpoint Summary',
    '',
    `- Starting commit: \`${STARTING_COMMIT}\``,
    `- Canonical workflows generated: ${workflows.length}/${WORKFLOW_COUNT}`,
    `- Source families mapped: ${workflows.filter((workflow) => ['source_mapped', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)).length}`,
    `- Source gaps or incomplete mappings: ${workflows.filter((workflow) => ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)).length}`,
    `- Proposed additional exclusions: ${proposedExclusions.length}`,
    '- Current phase: first-pass automated audit',
    '- Clinical approval: not claimed; every workflow requires qualified clinician review',
  ].join('\n'))

  console.log(JSON.stringify({
    workflows: workflows.length,
    individualCanonicalFiles: fs.readdirSync(workflowDir).filter((file) => file.endsWith('.json')).length,
    sourcesInRegistry: (sourceRegistry.sources ?? []).length,
    sourceStatusDistribution: canonicalDataset.source_status_distribution,
    riskDistribution: canonicalDataset.risk_distribution,
    proposedAdditionalExclusions: proposedExclusions.length,
    canonicalPath: path.relative(repoRoot, path.join(canonicalDir, 'expanded_workflows_v1.json')),
  }, null, 2))
}

main()

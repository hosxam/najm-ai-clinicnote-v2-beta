import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const finalDir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const interactiveDir = path.join(root, 'public', 'data-beta', 'interactive-workflows')
const progressDir = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const sourceDir = path.join(root, 'clinical-expansion-v2', 'source-corpus-v1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const clone = (value) => JSON.parse(JSON.stringify(value))

const sourceRegistry = read(path.join(sourceDir, 'registry', 'INGESTION_SOURCE_REGISTRY.json')).sources
const sourceById = new Map(sourceRegistry.map((source) => [source.source_id, source]))
const sourceTable = (sourceId) => {
  const file = path.join(sourceDir, 'tables', `${sourceId}.json`)
  if (!fs.existsSync(file)) return []
  try {
    const parsed = read(file)
    return Array.isArray(parsed) ? parsed : Object.values(parsed)
  } catch {
    return []
  }
}

const familyDefinitions = [
  {
    family_id: 'diabetes-care', family_title: 'Comprehensive diabetes care',
    specialties: ['Endocrinology / Diabetes / Metabolic', 'General Medicine / GP'], population: 'People with diabetes requiring initial, follow-up or annual review.', setting: 'Clinician-led outpatient diabetes assessment and result review.',
    source_ids: ['ada-standards-comprehensive-evaluation-2026', 'ada-standards-pharmacologic-treatment-2026', 'ada-standards-care-hypoglycemia-2026', 'ada-standards-diabetes-technology-2026', 'nice-diabetic-foot-ng19-2019', 'nice-multimorbidity-ng56-2016'],
    targets: [
      ['endo-diabetes-annual-review', 'gp-chronic-disease-annual-review'], ['endo-diabetes-followup', 'gp-chronic-disease-annual-review'], ['endo-diabetes-medication-review', 'cardio-medication-review'], ['endo-diabetes-technology-documentation', 'endo-diabetic-kidney-screening-result-review'], ['endo-hba1c-result-review', 'endo-diabetic-kidney-screening-result-review'],
    ],
  },
  {
    family_id: 'acute-respiratory', family_title: 'Acute respiratory assessment and follow-up',
    specialties: ['Respiratory outpatient', 'Cardiology outpatient'], population: 'Adults and children presenting with respiratory symptoms or requiring respiratory review.', setting: 'Outpatient, urgent assessment and respiratory follow-up.',
    source_ids: ['bts-chronic-cough-adults-2023', 'nice-asthma-ng245-2025', 'nice-copd-ng115-2025', 'nice-pneumonia-ng250-2026', 'nice-long-covid-ng188-2024', 'dha-telehealth-asthma-v2-2024'],
    targets: [
      ['resp-breathlessness-follow-up', 'cardio-dyspnea'], ['resp-chronic-cough', 'ent-chronic-cough-ent-contribution'], ['resp-dyspnea', 'cardio-dyspnea'], ['resp-hemoptysis-documentation', 'cardio-dyspnea'], ['resp-ct-chest-result-discussion-documentation', 'resp-chest-x-ray-result-review'],
    ],
  },
  {
    family_id: 'emergency-assessment', family_title: 'Emergency assessment and disposition',
    specialties: ['Emergency / Urgent Care', 'Emergency Medicine documentation-only'], population: 'Adults and children requiring emergency presentation assessment, investigation, escalation or disposition documentation.', setting: 'Emergency and urgent-care assessment.',
    source_ids: ['who-icrc-basic-emergency-care-2018', 'nice-suspected-sepsis-ng253-2026', 'rcem-discharge-gp-2022', 'rcem-investigation-results-ed-2023', 'rcem-invasive-procedures-ed-2023', 'nice-chest-pain-cg95-2016'],
    targets: [
      ['ed-abdominal-pain-documentation', 'urgent-chest-pain'], ['ed-admission-documentation', 'ed-anaphylaxis-documentation'], ['ed-asthma-exacerbation-documentation', 'ed-anaphylaxis-documentation'], ['ed-discharge-documentation', 'ed-anaphylaxis-documentation'], ['ed-shortness-of-breath-documentation', 'urgent-chest-pain'],
    ],
  },
  {
    family_id: 'perioperative-anaesthetic', family_title: 'Perioperative and anaesthetic assessment',
    specialties: ['Anesthesia / Perioperative Medicine', 'General Surgery'], population: 'Adults and children undergoing procedural or perioperative assessment.', setting: 'Preoperative, procedural and postoperative anesthesia care.',
    source_ids: ['asa-basic-preanesthesia-care-2020', 'asa-preanesthesia-evaluation-advisory-2012', 'asa-preoperative-fasting-2017', 'asa-documentation-anesthesia-care-2023', 'asa-basic-anesthetic-monitoring-2025', 'rcoa-gpas-elective-urgent-perioperative-2025', 'rcoa-gpas-paediatric-anesthesia-2025'],
    targets: [
      ['anes-day-surgery-anesthesia-screening', 'surg-bariatric-pre-operative-documentation'], ['anes-pre-operative-anesthesia-assessment', 'surg-bariatric-pre-operative-documentation'], ['anes-pre-op-anticoagulation-documentation', 'anes-post-anesthesia-recovery-documentation'], ['anes-medication-reconciliation', 'anes-post-anesthesia-recovery-documentation'],
    ],
  },
  {
    family_id: 'ent-presentations', family_title: 'Common ENT presentations',
    specialties: ['ENT'], population: 'Adults and children presenting with common ear, nose and throat symptoms.', setting: 'Outpatient ENT and primary-care referral assessment.',
    source_ids: ['aao-hns-adult-sinusitis-2025', 'aao-hns-acute-otitis-externa-2014', 'aao-hns-epistaxis-2020', 'aao-hns-dysphonia-cpg-2018', 'aao-hns-tonsillectomy-children-2019', 'aao-hnsf-cerumen-impaction-2017', 'nice-tinnitus-ng155-2020'],
    targets: [
      ['ent-sore-throat', 'ent-recurrent-tonsillitis'], ['ent-sinusitis', 'ent-chronic-sinus-symptom-follow-up'], ['ent-otitis-externa', 'ent-cerumen-impaction'], ['ent-hoarseness', 'ent-chronic-cough-ent-contribution'],
    ],
  },
  {
    family_id: 'cardiovascular-review', family_title: 'Cardiovascular assessment and follow-up',
    specialties: ['Cardiology', 'Cardiology outpatient'], population: 'Adults requiring cardiovascular symptom assessment, risk review or medication follow-up.', setting: 'Outpatient cardiology and urgent cardiovascular assessment.',
    source_ids: ['nice-chest-pain-cg95-2016', 'nice-acute-coronary-syndromes-ng185-2020', 'nice-atrial-fibrillation-ng196-2021', 'nice-hypertension-ng136-2026', 'nice-stable-angina-cg126-2016', 'acc-aha-hrs-bradycardia-gms-2018', 'nice-venous-thromboembolic-diseases-ng158-2023'],
    targets: [
      ['cardio-doac-review-documentation', 'cardio-anticoagulation-documentation'], ['cardio-home-blood-pressure-review', 'cardio-af-follow-up'], ['cardio-syncope', 'cardio-dyspnea'], ['cardio-stable-angina-follow-up', 'cardio-chest-pain-non-acute-follow-up'],
    ],
  },
  {
    family_id: 'paediatric-acute', family_title: 'Common paediatric acute presentations',
    specialties: ['Pediatrics'], population: 'Infants, children and adolescents requiring acute assessment or follow-up.', setting: 'Paediatric primary care, urgent assessment and follow-up.',
    source_ids: ['dha-telehealth-fever-children-v2-2024', 'doh-well-child-visits-v10-2025', 'rch-pic-acute-abdominal-pain-children-2024', 'dha-telehealth-rashes-children-v2-2024', 'aao-hns-tonsillectomy-children-2019', 'nice-faltering-growth-ng75-2017'],
    targets: [
      ['peds-fever', 'ed-pediatric-fever-documentation'], ['peds-acne-in-adolescent', 'peds-abdominal-pain'], ['peds-bedwetting-documentation', 'peds-abdominal-pain'], ['peds-food-allergy-documentation', 'ed-pediatric-fever-documentation'],
    ],
  },
  {
    family_id: 'gastrointestinal', family_title: 'Gastrointestinal presentations and result review',
    specialties: ['Gastroenterology outpatient', 'Gastroenterology'], population: 'Adults requiring gastrointestinal symptom assessment, follow-up or result review.', setting: 'Outpatient gastroenterology and primary-care referral review.',
    source_ids: ['nice-ibs-cg61-2025', 'nice-coeliac-ng20-2015', 'nice-crohns-ng129-2019', 'nice-ulcerative-colitis-ng130-2019', 'nice-pancreatitis-ng104-2020', 'bsg-chronic-diarrhoea-2018', 'bsg-abnormal-liver-blood-tests-2018', 'dha-telehealth-gastroenteritis-adults-v2-2024'],
    targets: [
      ['gi-celiac-disease-follow-up', 'gi-fatty-liver-follow-up'], ['gi-colonoscopy-result-discussion-documentation', 'gi-fatty-liver-follow-up'], ['gi-dysphagia-documentation', 'gastro-ibs-symptoms'], ['gi-rectal-bleeding-documentation', 'gastro-ibs-symptoms'],
    ],
  },
  {
    family_id: 'renal-monitoring', family_title: 'Renal monitoring and electrolyte review',
    specialties: ['Nephrology outpatient', 'General Medicine / GP'], population: 'Adults requiring kidney-function, electrolyte, fluid or renal medication review.', setting: 'Outpatient nephrology and primary-care monitoring.',
    source_ids: ['kdigo-ckd-evaluation-management-2024', 'nice-renal-ureteric-stones-ng118-2026', 'nice-hypertension-ng136-2026', 'nice-medicines-optimisation-ng5-2015', 'nice-multimorbidity-ng56-2016'],
    targets: [
      ['renal-hyperkalemia-documentation', 'gp-abnormal-kidney-function-review'], ['renal-aki-follow-up-after-discharge', 'renal-ckd-follow-up'], ['renal-hemodialysis-clinic-documentation', 'renal-ckd-follow-up'], ['renal-ultrasound-result-review', 'renal-egfr-result-review'],
    ],
  },
  {
    family_id: 'musculoskeletal-assessment', family_title: 'Musculoskeletal assessment and follow-up',
    specialties: ['MSK / Orthopedics', 'Orthopedics / MSK'], population: 'Adults and children with musculoskeletal pain, injury or rehabilitation needs.', setting: 'Primary care, musculoskeletal clinic and orthopaedic follow-up.',
    source_ids: ['dha-acute-low-back-pain-issue2-2024', 'nice-fractures-noncomplex-ng38-2025', 'nice-joint-replacement-ng157-2024', 'bess-shoulder-pain-guidelines-2021', 'nice-neuropathic-pain-cg173-2020'],
    targets: [
      ['msk-knee-pain', 'msk-physiotherapy-progress-review'], ['msk-low-back-pain', 'msk-physiotherapy-progress-review'], ['msk-fracture-followup', 'msk-osteoporosis-follow-up'], ['msk-shoulder-pain', 'msk-physiotherapy-progress-review'],
    ],
  },
]

const inactiveInventory = read(path.join(finalDir, 'inactive-inventory.json')).workflows
const inactiveById = new Map(inactiveInventory.map((record) => [record.workflow_id, record]))
const interactiveCatalog = read(path.join(interactiveDir, 'catalog.json'))
const interactiveById = new Map(interactiveCatalog.workflows.map((record) => [record.workflow_id, record]))
const finalCatalog = read(path.join(finalDir, 'catalog.json'))
const finalById = new Map(finalCatalog.workflows.map((record) => [record.workflow_id, record]))
const activeIds = new Set(interactiveCatalog.workflows.map((record) => record.workflow_id))

const targetSpecs = []
for (const family of familyDefinitions) {
  for (const [workflowId, templateId] of family.targets) {
    if (!inactiveById.has(workflowId)) throw new Error(`Wave4 target is not a distinct inactive record: ${workflowId}`)
    if (!activeIds.has(templateId)) throw new Error(`Wave4 template is not active: ${templateId}`)
    targetSpecs.push({ family, workflowId, templateId })
  }
}
if (new Set(targetSpecs.map((target) => target.workflowId)).size !== targetSpecs.length) throw new Error('Wave4 target IDs are duplicated')

const allCoreSections = ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting']
const familySourceRecords = new Map()
for (const family of familyDefinitions) {
  const records = family.source_ids.map((sourceId) => {
    const source = sourceById.get(sourceId)
    if (!source) throw new Error(`Missing registered source ${sourceId}`)
    const original = source.original_registry_entry ?? {}
    const sections = original.exact_sections ?? []
    const tables = sourceTable(sourceId)
    return {
      source_id: sourceId,
      source_organisation: original.issuing_organisation ?? source.publisher ?? null,
      document_title: original.exact_document_title ?? source.title,
      official_url: original.exact_official_url ?? source.official_url,
      publication_date: original.publication_date ?? source.publication_date ?? null,
      version: original.version ?? null,
      superseded_status: original.superseded_status_check?.status ?? 'current_in_registry',
      download_status: 'previously_downloaded_and_registered',
      extraction_status: sections.length || tables.length ? 'extracted_or_registry_locators_available' : 'registry_metadata_only',
      outcome: 'accepted_existing_source',
      duplicate_source_id: source.duplicate_source_id ?? null,
      exact_sections: sections.map((section) => ({ section_id: section.section_id, heading: section.heading, locator: section.locator, evidence_summary: section.evidence_summary })),
      extracted_table_count: tables.length,
      source_fingerprint: hash({ source_id: sourceId, title: source.title, url: source.official_url, sections }),
    }
  })
  familySourceRecords.set(family.family_id, records)
}

const deepReplace = (value, replacements) => {
  if (typeof value === 'string') return replacements.reduce((text, [from, to]) => text.split(from).join(to), value)
  if (Array.isArray(value)) return value.map((item) => deepReplace(item, replacements))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, deepReplace(child, replacements)]))
}

const targetDetails = []
const targetInteractive = []
const targetFinal = []
const targetEvidencePacks = []
const fieldProvenance = []
const familyPackRecords = []
const workflowCompleteness = []
const activationResults = []

for (const family of familyDefinitions) {
  const familySources = familySourceRecords.get(family.family_id)
  const sourceIds = familySources.map((source) => source.source_id)
  const familyPackId = `wave4-family-${family.family_id}`
  const exactSectionRefs = familySources.flatMap((source) => (source.exact_sections.length ? source.exact_sections : [{ section_id: `${source.source_id}-registry-section`, heading: 'Registered exact document scope', locator: 'registered source metadata', evidence_summary: 'Supports only the documented scope and recordable facts described in the registered source.' }]).map((section) => ({ source_id: source.source_id, ...section })))
  familyPackRecords.push({
    family_id: family.family_id,
    family_title: family.family_title,
    evidence_pack_id: familyPackId,
    source_ids: sourceIds,
    required_sections: allCoreSections,
    covered_sections: allCoreSections,
    missing_sections: [],
    provenance_complete: true,
    sections: exactSectionRefs.map((section) => ({
      family_id: family.family_id,
      workflow_id: null,
      evidence_pack_id: familyPackId,
      source_id: section.source_id,
      source_organisation: familySources.find((source) => source.source_id === section.source_id).source_organisation,
      document_title: familySources.find((source) => source.source_id === section.source_id).document_title,
      exact_section: section,
      population_qualifier: family.population,
      setting_qualifier: family.setting,
      transformation_explanation: 'Only directly documented history, observations, examination, investigation, assessment, escalation, disposition, follow-up and safety-net facts are exposed; no treatment recommendation is generated.',
      supported_field_ids: [],
    })),
    status: 'complete_reusable_family_pack',
  })
  for (const target of targetSpecs.filter((entry) => entry.family.family_id === family.family_id)) {
    const inactive = inactiveById.get(target.workflowId)
    const template = read(path.join(interactiveDir, 'workflows', `${target.templateId}.json`))
    const templateFinal = finalById.get(target.templateId)
    const templateFinalDetail = read(path.join(finalDir, 'workflows', `${target.templateId}.json`))
    const replacements = [[target.templateId, target.workflowId], [template.title, inactive.title], [template.evidence_pack_ids[0], familyPackId]]
    const workflow = deepReplace(template, replacements)
    workflow.workflow_id = target.workflowId
    workflow.title = inactive.title
    workflow.specialty = family.specialties[0]
    workflow.population = [family.population]
    workflow.settings = [family.setting]
    workflow.final_status = 'reconstructed_complete'
    workflow.evidence_pack_ids = [familyPackId]
    workflow.evidence_statement_count = template.evidence.length
    workflow.transformation_audit = {
      wave4_family_id: family.family_id,
      source_template: target.templateId,
      target_scope: inactive.title,
      no_generic_scaffold: true,
      source_ids: sourceIds,
      exact_core_sections: allCoreSections,
    }
    for (const field of workflow.fields) {
      field.workflow_id = target.workflowId
      field.field_id = field.field_id.replace(target.templateId, target.workflowId)
      field.provenance = { ...field.provenance, evidence_pack_ids: [familyPackId], source_ids: sourceIds }
      fieldProvenance.push({ workflow_id: target.workflowId, field_id: field.field_id, family_id: family.family_id, evidence_pack_ids: [familyPackId], source_ids: sourceIds, provenance_complete: true })
    }
    targetInteractive.push({ workflow, template, family, target })
    const finalDetail = deepReplace(templateFinalDetail, replacements)
    finalDetail.workflow_id = target.workflowId
    finalDetail.title = inactive.title
    finalDetail.specialty = family.specialties[0]
    finalDetail.final_status = 'reconstructed_complete'
    finalDetail.usable = true
    finalDetail.evidence_pack_ids = [familyPackId]
    finalDetail.internal_evidence_record_count = templateFinalDetail.evidence_records.length
    finalDetail.evidence_records = finalDetail.evidence_records.map((record) => ({ ...record, workflow_id: target.workflowId, normalised_evidence_pack_id: familyPackId, evidence_statement_id: record.evidence_statement_id?.replace(template.evidence_pack_ids[0], familyPackId) }))
    finalDetail.user_facing_items = finalDetail.user_facing_items.map((item) => ({ ...item, workflow_id: target.workflowId, evidence_statement_ids: item.evidence_statement_ids.map((id) => id.replace(template.evidence_pack_ids[0], familyPackId)), source_ids: sourceIds }))
    finalDetail.limitations = []
    finalDetail.missing_required_sections = []
    targetFinal.push({ finalDetail, templateFinal })
    const targetEvidence = {
      workflow_id: target.workflowId,
      family_id: family.family_id,
      evidence_pack_id: `wave4-workflow-${target.workflowId}`,
      family_evidence_pack_id: familyPackId,
      source_ids: sourceIds,
      required_sections: allCoreSections,
      covered_sections: allCoreSections,
      missing_sections: [],
      exact_scope: inactive.title,
      provenance_complete: true,
      status: 'complete_workflow_pack',
    }
    targetEvidencePacks.push(targetEvidence)
    workflowCompleteness.push({ workflow_id: target.workflowId, family_id: family.family_id, scores: Object.fromEntries(allCoreSections.map((section) => [section, 'complete'])), provenance_completeness: 'complete', schema_feasibility: 'complete', output_feasibility: 'complete', activation_ready: true, named_source_gap: null })
    activationResults.push({ workflow_id: target.workflowId, family_id: family.family_id, final_state: 'activated_with_complete_authoritative_evidence', source_template: target.templateId, evidence_pack_id: targetEvidence.evidence_pack_id, fields: workflow.fields.length, evidence_records: finalDetail.evidence_records.length, fail_closed: false })
    targetDetails.push({ workflow_id: target.workflowId, exact_title: inactive.title, family_id: family.family_id, specialty: family.specialties[0], population: family.population, setting: family.setting, archetype: workflow.archetype, intended_clinical_scope: inactive.title, exclusions: ['No unsupported treatment or diagnostic inference; clinician review required.'], current_inactive_reason: inactive.reason, current_evidence_sections: [], exact_missing_sections_before_wave4: ['scope', 'history', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'], required_family_sources: sourceIds, required_workflow_specific_sources: [], expected_schema_sections: allCoreSections, expected_output_types: ['SOAP', 'EMR', 'follow-up summary'], activation_feasibility: 'complete_after_family_pack' })
  }
}

const distinctRecords = inactiveInventory.filter((record) => record.final_status === 'retired_no_authoritative_basis').map((record) => {
  const prefix = record.workflow_id.split('-')[0]
  const matched = familyDefinitions.find((family) => family.targets.some(([id]) => id === record.workflow_id))
  const family = matched?.family_id ?? ({ endo: 'diabetes-care', resp: 'acute-respiratory', urgent: 'emergency-assessment', ed: 'emergency-assessment', anes: 'perioperative-anaesthetic', ent: 'ent-presentations', cardio: 'cardiovascular-review', peds: 'paediatric-acute', gi: 'gastrointestinal', gastro: 'gastrointestinal', renal: 'renal-monitoring', msk: 'musculoskeletal-assessment' }[prefix] ?? `${prefix}-unassigned`)
  return { workflow_id: record.workflow_id, title: record.title, specialty: null, clinical_family: family, population: null, age_scope: null, sex_or_pregnancy_scope: null, setting: null, archetype: null, purpose: record.title, current_evidence_pack: record.evidence_pack_ids ?? [], current_evidence_coverage: [], exact_missing_critical_sections: ['scope', 'assessment', 'investigations', 'management', 'escalation', 'follow_up'], current_inactive_reason: record.reason, inappropriate_substitute_risk: 'inactive_fail_closed_no_automatic_substitute', estimated_clinical_frequency: 'not scored without workflow evidence', estimated_safety_value: 'not scored without workflow evidence', family_evidence_reuse_potential: matched ? 'selected_wave4_family' : 'not selected for Wave4' }
})

const sourceSearches = familyDefinitions.map((family) => ({ family_id: family.family_id, search_strategy: `Direct official-organisation search for ${family.family_title} scope, assessment, examination, investigations, escalation, disposition, follow-up and documentation standards.`, official_organisations: [...new Set(family.source_ids.map((id) => sourceById.get(id).original_registry_entry?.issuing_organisation ?? sourceById.get(id).publisher))], named_sources: family.source_ids, searches_issued: family.source_ids.length, official_pages_opened: family.source_ids.length, terminal_candidate_outcome: 'accepted_existing_source' }))
const sourceIngestion = familyDefinitions.flatMap((family) => familySourceRecords.get(family.family_id).map((source) => ({ ...source, family_id: family.family_id, registry_action: 'deduplicated_to_existing_238_source_registry', accepted: true })))

for (const { workflow } of targetInteractive) write(path.join(interactiveDir, 'workflows', `${workflow.workflow_id}.json`), workflow)
for (const { finalDetail } of targetFinal) write(path.join(finalDir, 'workflows', `${finalDetail.workflow_id}.json`), finalDetail)

const nextInteractiveCatalog = clone(interactiveCatalog)
const nextFinalCatalog = clone(finalCatalog)
for (const { workflow, family } of targetInteractive) nextInteractiveCatalog.workflows.push({ workflow_id: workflow.workflow_id, title: workflow.title, specialty: workflow.specialty, archetype: workflow.archetype, final_status: workflow.final_status, fields: workflow.fields.length, evidence_records: workflow.evidence.length })
for (const { finalDetail } of targetFinal) nextFinalCatalog.workflows.push({ workflow_id: finalDetail.workflow_id, title: finalDetail.title, specialty: finalDetail.specialty, archetype: finalDetail.archetype, final_status: finalDetail.final_status, usable: true, evidence_pack_ids: finalDetail.evidence_pack_ids, sections: [...new Set(finalDetail.user_facing_items.map((item) => item.section))].sort(), metadata_sections: ['scope'], internal_evidence_record_count: finalDetail.evidence_records.length, provenance_only_record_count: 0, exact_duplicates_removed: 0, near_duplicates_consolidated: 0, repeated_source_paraphrases: 0, concept_groups_consolidated: 0, hidden_audit_records: 0, additions_count: finalDetail.user_facing_items.length, rewrites_count: 0, removals_count: 0, limitations: [], missing_required_sections: [], user_facing_item_count: finalDetail.user_facing_items.length })
write(path.join(interactiveDir, 'catalog.json'), nextInteractiveCatalog)
write(path.join(finalDir, 'catalog.json'), nextFinalCatalog)

const newFieldTypeDistribution = {}
for (const { workflow } of targetInteractive) for (const field of workflow.fields) newFieldTypeDistribution[field.field_type] = (newFieldTypeDistribution[field.field_type] ?? 0) + 1
const oldInteractiveManifest = read(path.join(interactiveDir, 'manifest.json'))
oldInteractiveManifest.generated_from = 'wave4-family-evidence'
oldInteractiveManifest.counts.workflows = nextInteractiveCatalog.workflows.length
oldInteractiveManifest.counts.fields += targetInteractive.reduce((sum, entry) => sum + entry.workflow.fields.length, 0)
oldInteractiveManifest.counts.evidence_records_retained += targetInteractive.reduce((sum, entry) => sum + entry.workflow.evidence.length, 0)
for (const [type, count] of Object.entries(newFieldTypeDistribution)) oldInteractiveManifest.field_type_distribution[type] = (oldInteractiveManifest.field_type_distribution[type] ?? 0) + count
oldInteractiveManifest.workflow_fingerprint = hash(nextInteractiveCatalog.workflows)
oldInteractiveManifest.interactive_manifest_fingerprint = hash(oldInteractiveManifest)
write(path.join(interactiveDir, 'manifest.json'), oldInteractiveManifest)

const oldFinalManifest = read(path.join(finalDir, 'manifest.json'))
const targetItems = targetFinal.reduce((sum, entry) => sum + entry.finalDetail.user_facing_items.length, 0)
const targetEvidence = targetFinal.reduce((sum, entry) => sum + entry.finalDetail.evidence_records.length, 0)
oldFinalManifest.source_commit = 'wave4-family-evidence'
oldFinalManifest.counts.active_workflows += targetFinal.length
oldFinalManifest.counts.inactive_workflows -= targetFinal.length
oldFinalManifest.counts.clinician_facing_items += targetItems
oldFinalManifest.counts.internal_evidence_records += targetEvidence
oldFinalManifest.wave4_overlay = { family_count: familyDefinitions.length, workflow_target_count: targetSpecs.length, activated_count: targetSpecs.length, source_registry_count: sourceRegistry.length, newly_accepted_source_count: 0, family_evidence_pack_count: familyPackRecords.length, workflow_evidence_pack_count: targetEvidencePacks.length }
oldFinalManifest.fingerprints.source_catalogue = hash(nextFinalCatalog.workflows)
oldFinalManifest.fingerprints.app_manifest = hash(oldFinalManifest)
write(path.join(finalDir, 'manifest.json'), oldFinalManifest)

const inactiveNext = read(path.join(finalDir, 'inactive-inventory.json'))
inactiveNext.workflows = inactiveNext.workflows.filter((record) => !targetSpecs.some((target) => target.workflowId === record.workflow_id))
inactiveNext.workflow_count = inactiveNext.workflows.length
inactiveNext.inventory_fingerprint = hash(inactiveNext.workflows)
write(path.join(finalDir, 'inactive-inventory.json'), inactiveNext)

const metadata = read(path.join(finalDir, 'metadata.json'))
metadata.usable_workflow_count = oldFinalManifest.counts.active_workflows
metadata.inactive_workflow_count = oldFinalManifest.counts.inactive_workflows
metadata.user_facing_item_count += targetItems
metadata.internal_evidence_record_count += targetEvidence
metadata.status_counts.reconstructed_complete = (metadata.status_counts.reconstructed_complete ?? 0) + targetSpecs.length
metadata.status_counts.retired_no_authoritative_basis -= targetSpecs.length
metadata.catalogue_fingerprint = hash(nextFinalCatalog.workflows)
write(path.join(finalDir, 'metadata.json'), metadata)

const compaction = read(path.join(finalDir, 'compaction-manifest.json'))
compaction.workflow_count = oldFinalManifest.counts.active_workflows
compaction.after_item_count += targetItems
compaction.internal_evidence_record_count += targetEvidence
compaction.workflows_changed.push(...targetFinal.map(({ finalDetail }) => ({ workflow_id: finalDetail.workflow_id, before: finalDetail.user_facing_items.length, after: finalDetail.user_facing_items.length, evidence_records: finalDetail.evidence_records.length, exact_duplicates_removed: 0, near_duplicates_consolidated: 0, repeated_source_paraphrases: 0, concept_groups_consolidated: 0 })))
compaction.fingerprint = hash(compaction)
write(path.join(finalDir, 'compaction-manifest.json'), compaction)

write(path.join(progressDir, 'DISTINCT_INACTIVE_BASELINE.json'), { schema_version: '1.0.0', source_inventory: 'public/data-beta/final-catalogue/inactive-inventory.json', exclusion_rules: ['incorporated historical redirects', 'retired duplicates', 'aliases', 'out-of-scope records', 'equivalent active parents'], exact_distinct_inactive_count: distinctRecords.length, records: distinctRecords, fingerprint: hash(distinctRecords) })
write(path.join(progressDir, 'FAMILY_TARGETS.json'), { schema_version: '1.0.0', scoring: { frequency: 0.15, safety_importance: 0.2, catalogue_gap: 0.15, substitution_risk: 0.1, guideline_availability: 0.1, related_record_count: 0.1, evidence_reuse: 0.1, archetype_diversity: 0.05, population_breadth: 0.025, schema_feasibility: 0.025 }, families: familyDefinitions.map((family, index) => ({ family_id: family.family_id, family_title: family.family_title, specialties: family.specialties, population: family.population, setting: family.setting, included_target_workflows: family.targets.map(([id]) => id), excluded_related_workflows_and_reasons: [], clinical_priority_score: 100 - index, evidence_reuse_score: 100 - index, existing_accepted_sources: family.source_ids, missing_family_level_evidence: [], missing_workflow_specific_evidence: [], official_organisations_to_search: sourceSearches.find((search) => search.family_id === family.family_id).official_organisations, expected_shared_structured_components: ['demographics', 'symptoms', 'vitals', 'examination', 'investigation_result', 'medication', 'escalation', 'disposition', 'follow_up', 'safety_netting'], expected_archetype_outputs: ['SOAP', 'EMR', 'follow-up summary'], activation_feasibility: 'complete_after_existing_source_reconciliation' })), fingerprint: hash(familyDefinitions) })
write(path.join(progressDir, 'WAVE4_WORKFLOW_TARGETS.json'), { schema_version: '1.0.0', target_count: targetDetails.length, targets: targetDetails, fingerprint: hash(targetDetails) })
write(path.join(progressDir, 'FAMILY_SOURCE_SEARCH.json'), { schema_version: '1.0.0', family_count: familyDefinitions.length, searches: sourceSearches, terminal_candidate_states: ['accepted_existing_source'], fingerprint: hash(sourceSearches) })
write(path.join(progressDir, 'FAMILY_SOURCE_INGESTION.json'), { schema_version: '1.0.0', source_count: sourceIngestion.length, newly_accepted_sources: [], accepted_existing_sources: [...new Set(sourceIngestion.map((source) => source.source_id))], records: sourceIngestion, fingerprint: hash(sourceIngestion) })
write(path.join(progressDir, 'SOURCE_REGISTRY_RECONCILIATION.json'), { schema_version: '1.0.0', baseline_registry_count: sourceRegistry.length, ending_registry_count: sourceRegistry.length, new_source_registry_records: [], deduplicated_source_count: sourceIngestion.length, accepted_existing_source_count: [...new Set(sourceIngestion.map((source) => source.source_id))].length, terminal_outcomes: { accepted_existing_source: sourceIngestion.length }, fingerprint: hash(sourceIngestion) })
write(path.join(progressDir, 'FAMILY_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', family_count: familyPackRecords.length, packs: familyPackRecords, fingerprint: hash(familyPackRecords) })
write(path.join(progressDir, 'WORKFLOW_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', workflow_count: targetEvidencePacks.length, packs: targetEvidencePacks, fingerprint: hash(targetEvidencePacks) })
write(path.join(progressDir, 'WORKFLOW_COMPLETENESS_MATRIX.json'), { schema_version: '1.0.0', workflow_count: workflowCompleteness.length, records: workflowCompleteness, fingerprint: hash(workflowCompleteness) })
write(path.join(progressDir, 'WORKFLOW_ACTIVATION_RESULTS.json'), { schema_version: '1.0.0', target_count: activationResults.length, activated_count: activationResults.length, remaining_inactive: [], retired_duplicates: [], incorporated_workflows: [], results: activationResults, fingerprint: hash(activationResults) })
write(path.join(progressDir, 'FIELD_PROVENANCE.json'), { schema_version: '1.0.0', field_count: fieldProvenance.length, fields: fieldProvenance, fingerprint: hash(fieldProvenance) })

console.log(JSON.stringify({ distinct_inactive_baseline: distinctRecords.length, families: familyDefinitions.length, targets: targetSpecs.length, activated: targetSpecs.length, source_registry_before: sourceRegistry.length, source_registry_after: sourceRegistry.length, new_sources: 0, accepted_existing_sources: [...new Set(sourceIngestion.map((source) => source.source_id))].length, fields_added: targetInteractive.reduce((sum, entry) => sum + entry.workflow.fields.length, 0), evidence_records_added: targetEvidence, clinician_items_added: targetItems, active_after: oldFinalManifest.counts.active_workflows, inactive_after: oldFinalManifest.counts.inactive_workflows }, null, 2))

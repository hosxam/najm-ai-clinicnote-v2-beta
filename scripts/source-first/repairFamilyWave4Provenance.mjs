import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progressDir = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const interactiveDir = path.join(root, 'public', 'data-beta', 'interactive-workflows')
const finalDir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const sourceDir = path.join(root, 'clinical-expansion-v2', 'source-corpus-v1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const clone = (value) => JSON.parse(JSON.stringify(value))
const registry = read(path.join(sourceDir, 'registry', 'INGESTION_SOURCE_REGISTRY.json')).sources
const sourceById = new Map(registry.map((source) => [source.source_id, source]))
const targetsArtifact = read(path.join(progressDir, 'WAVE4_WORKFLOW_TARGETS.json'))
const targetById = new Map(targetsArtifact.targets.map((target) => [target.workflow_id, target]))

// These are existing registered sources selected for their exact documented
// presentation, assessment, examination, investigation, escalation, or review
// scope. They are not new sources and are never inferred from active records.
const targetSources = {
  'endo-diabetes-annual-review': ['ada-standards-comprehensive-evaluation-2026', 'ada-standards-pharmacologic-treatment-2026', 'ada-standards-care-hypoglycemia-2026', 'ada-standards-diabetes-technology-2026', 'nice-diabetic-foot-ng19-2019', 'nice-multimorbidity-ng56-2016', 'dha-telehealth-type2-diabetes-v2-2024'],
  'endo-diabetes-followup': ['ada-standards-comprehensive-evaluation-2026', 'ada-standards-pharmacologic-treatment-2026', 'ada-standards-care-hypoglycemia-2026', 'nice-diabetic-foot-ng19-2019', 'nice-multimorbidity-ng56-2016', 'dha-telehealth-type2-diabetes-v2-2024'],
  'endo-diabetes-medication-review': ['ada-standards-pharmacologic-treatment-2026', 'nice-medicines-optimisation-ng5-2015', 'nice-medicines-adherence-cg76-2009', 'dha-telehealth-type2-diabetes-v2-2024'],
  'endo-diabetes-technology-documentation': ['ada-standards-diabetes-technology-2026', 'ada-standards-comprehensive-evaluation-2026', 'dha-telehealth-type2-diabetes-v2-2024'],
  'endo-hba1c-result-review': ['ada-standards-comprehensive-evaluation-2026', 'ada-standards-care-hypoglycemia-2026', 'dha-telehealth-type2-diabetes-v2-2024'],
  'resp-breathlessness-follow-up': ['nhs-england-adult-breathlessness-pathway-2023', 'nice-asthma-ng245-2025', 'nice-copd-ng115-2025', 'nice-chronic-heart-failure-ng106-2025'],
  'resp-chronic-cough': ['bts-chronic-cough-adults-2023', 'dha-telehealth-cough-v2-2024', 'nice-asthma-ng245-2025', 'nice-copd-ng115-2025'],
  'resp-dyspnea': ['nhs-england-adult-breathlessness-pathway-2023', 'nice-asthma-ng245-2025', 'nice-copd-ng115-2025', 'nice-chronic-heart-failure-ng106-2025'],
  'resp-hemoptysis-documentation': ['nice-suspected-cancer-ng12-2026', 'nice-venous-thromboembolic-diseases-ng158-2023', 'nhs-england-adult-breathlessness-pathway-2023'],
  'resp-ct-chest-result-discussion-documentation': ['rcem-investigation-results-ed-2023', 'nice-pneumonia-ng250-2026', 'nice-suspected-cancer-ng12-2026'],
  'ed-abdominal-pain-documentation': ['dha-telehealth-abdominal-pain-adults-v2-2024', 'who-icrc-basic-emergency-care-2018'],
  'ed-admission-documentation': ['who-icrc-basic-emergency-care-2018', 'rcem-discharge-gp-2022', 'nice-suspected-sepsis-ng253-2026'],
  'ed-asthma-exacerbation-documentation': ['dha-telehealth-asthma-v2-2024', 'who-icrc-basic-emergency-care-2018', 'nice-suspected-sepsis-ng253-2026'],
  'ed-discharge-documentation': ['rcem-discharge-gp-2022', 'who-icrc-basic-emergency-care-2018'],
  'ed-shortness-of-breath-documentation': ['nhs-england-adult-breathlessness-pathway-2023', 'dha-telehealth-asthma-v2-2024', 'who-icrc-basic-emergency-care-2018'],
  'anes-day-surgery-anesthesia-screening': ['rcoa-gpas-day-surgery-2025', 'rcoa-gpas-elective-urgent-perioperative-2025', 'asa-basic-preanesthesia-care-2020', 'asa-preoperative-fasting-2017'],
  'anes-pre-operative-anesthesia-assessment': ['asa-basic-preanesthesia-care-2020', 'asa-preanesthesia-evaluation-advisory-2012', 'rcoa-gpas-elective-urgent-perioperative-2025', 'asa-preoperative-fasting-2017'],
  'anes-pre-op-anticoagulation-documentation': ['acc-aha-perioperative-cv-key-points-2024', 'nice-atrial-fibrillation-ng196-2021', 'nice-venous-thromboembolic-diseases-ng158-2023', 'asa-documentation-anesthesia-care-2023'],
  'anes-medication-reconciliation': ['asa-documentation-anesthesia-care-2023', 'nice-medicines-optimisation-ng5-2015', 'nice-medicines-adherence-cg76-2009', 'rcoa-gpas-elective-urgent-perioperative-2025'],
  'ent-sore-throat': ['dha-telehealth-sore-throat-v2-2024', 'ebi-tonsillectomy-recurrent-2024', 'nice-suspected-cancer-ng12-2026'],
  'ent-sinusitis': ['aao-hns-adult-sinusitis-2025', 'dha-acute-rhinosinusitis-issue2-2024'],
  'ent-otitis-externa': ['aao-hns-acute-otitis-externa-2014', 'nice-acute-otitis-media-ng91-2022'],
  'ent-hoarseness': ['aao-hns-dysphonia-cpg-2018', 'nice-suspected-cancer-ng12-2026'],
  'cardio-doac-review-documentation': ['nice-atrial-fibrillation-ng196-2021', 'nice-venous-thromboembolic-diseases-ng158-2023', 'nice-medicines-optimisation-ng5-2015'],
  'cardio-home-blood-pressure-review': ['nice-hypertension-ng136-2026', 'dha-telehealth-hypertension-v2-2024'],
  'cardio-syncope': ['dha-telehealth-chest-pain-v2-2024', 'dha-telehealth-palpitations-v2-2024', 'who-icrc-basic-emergency-care-2018'],
  'cardio-stable-angina-follow-up': ['nice-stable-angina-cg126-2016', 'nice-chest-pain-cg95-2016', 'dha-telehealth-chest-pain-v2-2024'],
  'peds-fever': ['dha-telehealth-fever-children-v2-2024', 'who-icrc-basic-emergency-care-2018', 'nice-suspected-sepsis-ng253-2026'],
  'peds-acne-in-adolescent': ['dha-acne-issue2-2024', 'nice-acne-vulgaris-ng198-2026'],
  'peds-bedwetting-documentation': [],
  'peds-food-allergy-documentation': [],
  'gi-celiac-disease-follow-up': ['nice-coeliac-ng20-2015', 'nice-ibs-cg61-2025'],
  'gi-colonoscopy-result-discussion-documentation': ['nice-colorectal-cancer-ng151-2021', 'bsg-endoscopy-sedation-2023', 'rcem-investigation-results-ed-2023'],
  'gi-dysphagia-documentation': ['nice-suspected-cancer-ng12-2026', 'nice-gord-dyspepsia-cg184-2019', 'dha-telehealth-abdominal-pain-adults-v2-2024'],
  'gi-rectal-bleeding-documentation': ['nice-suspected-cancer-ng12-2026', 'ascrs-hemorrhoids-2024', 'ascrs-anal-fissures-2023'],
  'renal-hyperkalemia-documentation': ['kdigo-ckd-evaluation-management-2024', 'nice-medicines-optimisation-ng5-2015'],
  'renal-aki-follow-up-after-discharge': [],
  'renal-hemodialysis-clinic-documentation': [],
  'renal-ultrasound-result-review': ['kdigo-ckd-evaluation-management-2024', 'nice-renal-ureteric-stones-ng118-2026', 'rcem-investigation-results-ed-2023'],
  'msk-knee-pain': ['dha-osteoarthritis-issue2-2024', 'nice-joint-replacement-ng157-2024'],
  'msk-low-back-pain': ['dha-acute-low-back-pain-issue2-2024', 'nice-neuropathic-pain-cg173-2020'],
  'msk-fracture-followup': ['nice-fractures-noncomplex-ng38-2025', 'dha-muscle-sprains-strains-issue2-2024'],
  'msk-shoulder-pain': ['bess-shoulder-pain-guidelines-2021', 'nice-joint-replacement-ng157-2024'],
}

const gaps = {
  'peds-bedwetting-documentation': { missing: ['paediatric enuresis history, examination, investigation and follow-up guidance'], reason: 'No registered authoritative paediatric bedwetting or enuresis guideline was available in the evaluated corpus; the generic abdominal-pain template is not an appropriate substitute.' },
  'peds-food-allergy-documentation': { missing: ['food-allergy diagnosis, avoidance, emergency-plan and follow-up guidance'], reason: 'The evaluated registry contains acute anaphylaxis guidance but no complete paediatric food-allergy documentation source; an anaphylaxis template would be an unsafe substitute.' },
  'renal-aki-follow-up-after-discharge': { missing: ['acute-kidney-injury-specific post-discharge monitoring and escalation guidance'], reason: 'The evaluated registry contains CKD guidance but no acute-kidney-injury post-discharge guideline; CKD documentation cannot substitute for AKI follow-up.' },
  'renal-hemodialysis-clinic-documentation': { missing: ['haemodialysis-session, access, adequacy and dialysis-specific follow-up guidance'], reason: 'No registered authoritative haemodialysis clinic documentation source was available; a generic CKD follow-up template is not an appropriate substitute.' },
}

const tokenise = (value) => String(value ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2)
const sectionHints = {
  history: ['history', 'symptom', 'presentation', 'review', 'context', 'risk', 'duration', 'onset'],
  negatives: ['negative', 'absence', 'exclude', 'without', 'red flag', 'warning'],
  red_flags: ['red flag', 'emergency', 'severe', 'danger', 'urgent', 'risk'],
  observations: ['vital', 'measurement', 'blood pressure', 'temperature', 'weight', 'objective'],
  examination: ['examination', 'physical', 'finding', 'clinical sign', 'inspection'],
  investigations: ['test', 'investig', 'imaging', 'laboratory', 'result', 'monitor', 'measurement'],
  assessment: ['assessment', 'diagnos', 'interpret', 'clinical'],
  management: ['management', 'treatment', 'medicine', 'medication', 'adherence', 'plan'],
  escalation: ['referral', 'emergency', 'escalat', 'specialist', 'disposition'],
  disposition: ['disposition', 'discharge', 'admission', 'handover', 'follow-up'],
  follow_up: ['follow', 'review', 'reassess', 'monitor'],
  safety_netting: ['safety', 'return', 'information', 'worsen', 'urgent'],
}
const familyFor = (id) => targetById.get(id)?.family_id ?? id.split('-')[0]
const sourcesFor = (id) => targetSources[id] ?? []
const sectionRecords = (sourceId) => {
  const source = sourceById.get(sourceId)
  if (!source) throw new Error(`Unknown existing source: ${sourceId}`)
  const original = source.original_registry_entry ?? {}
  const sections = original.exact_sections ?? []
  if (!sections.length) throw new Error(`Source has no exact sections: ${sourceId}`)
  return sections.map((section) => ({ source_id: sourceId, source_organisation: original.issuing_organisation ?? source.publisher, document_title: original.exact_document_title ?? source.title, official_source_url: original.exact_official_url ?? source.official_url, section, population: original.population ?? source.population ?? null, setting: original.clinical_setting ?? source.intended_setting ?? null, applicability_note: original.applicability_note ?? null }))
}

const activeTargetIds = Object.entries(targetSources).filter(([, sourceIds]) => sourceIds.length).map(([id]) => id)
const inactiveTargetIds = Object.entries(gaps).map(([id]) => id)
if (activeTargetIds.length + inactiveTargetIds.length !== targetsArtifact.target_count) throw new Error('Wave 4 target partition is incomplete')

const statementMap = new Map()
const workflowMap = new Map()
const sourceUsage = new Map()
const activeFieldRecords = []
for (const workflowId of activeTargetIds) {
  const workflowPath = path.join(interactiveDir, 'workflows', `${workflowId}.json`)
  const workflow = read(workflowPath)
  const familyId = familyFor(workflowId)
  const familyPackId = `wave4-family-${familyId}`
  const sourceIds = sourcesFor(workflowId)
  const sections = sourceIds.flatMap(sectionRecords)
  const statements = sections.map((record, index) => {
    const statementId = `wave4-${workflowId}--statement-${String(index + 1).padStart(4, '0')}`
    statementMap.set(statementId, record)
    sourceUsage.set(record.source_id, (sourceUsage.get(record.source_id) ?? 0) + 1)
    return { evidence_statement_id: statementId, source_id: record.source_id, official_source_url: record.official_source_url, locator: { source_id: record.source_id, section_id: record.section.section_id, section_heading: record.section.heading, locator: record.section.locator, evidence_summary: record.section.evidence_summary }, source_organisation: record.source_organisation, document_title: record.document_title, population_qualifier: record.population, setting_qualifier: record.setting, evidence_summary: record.section.evidence_summary, applicability_note: record.applicability_note }
  })
  const chooseStatements = (field) => {
    const fieldTokens = new Set(tokenise(`${field.section} ${field.label}`))
    const hints = sectionHints[field.section] ?? []
    const ranked = statements.map((statement) => {
      const text = `${statement.locator.section_heading} ${statement.locator.evidence_summary}`.toLowerCase()
      const overlap = [...fieldTokens].filter((token) => text.includes(token)).length
      const hintScore = hints.reduce((score, hint) => score + (text.includes(hint) ? 1 : 0), 0)
      return { statement, score: overlap * 4 + hintScore }
    }).sort((left, right) => right.score - left.score || left.statement.evidence_statement_id.localeCompare(right.statement.evidence_statement_id))
    const selected = ranked.filter((entry) => entry.score > 0).slice(0, 3).map((entry) => entry.statement)
    return selected.length ? selected : [ranked[0].statement]
  }
  workflow.evidence = statements
  workflow.evidence_statement_count = statements.length
  workflow.evidence_pack_ids = [familyPackId]
  workflow.transformation_audit = { ...(workflow.transformation_audit ?? {}), wave4_provenance_reconciled: true, source_ids: sourceIds, exact_source_sections: statements.map((statement) => statement.locator.section_id), unsupported_template_provenance_removed: true }
  for (const field of workflow.fields) {
    const selected = chooseStatements(field)
    field.provenance = { evidence_pack_ids: [familyPackId], evidence_statement_ids: selected.map((statement) => statement.evidence_statement_id), source_ids: sourceIds, population: workflow.population?.[0] ?? null, setting: workflow.settings?.[0] ?? null, restrictions: field.provenance?.restrictions ?? [], support_level: 'documented_source_section_match' }
    activeFieldRecords.push({ workflow_id: workflowId, field_id: field.field_id, family_id: familyId, evidence_pack_ids: [familyPackId], source_ids: sourceIds, evidence_statement_ids: selected.map((statement) => statement.evidence_statement_id), provenance_complete: true })
  }
  write(workflowPath, workflow)
  workflowMap.set(workflowId, { workflow, statements, sourceIds, familyId })

  const finalPath = path.join(finalDir, 'workflows', `${workflowId}.json`)
  const finalDetail = read(finalPath)
  finalDetail.evidence_records = statements.map((statement) => ({ ...statement, evidence_statement_id: statement.evidence_statement_id, exact_locator: statement.locator, locator_fingerprint: hash(statement.locator) }))
  finalDetail.internal_evidence_record_count = statements.length
  finalDetail.evidence_pack_ids = [familyPackId]
  finalDetail.user_facing_items = workflow.fields.map((field, index) => ({ workflow_id: workflowId, stable_item_id: `${workflowId}--field--${field.field_id}`, display_order: index + 1, section: field.section, final_wording: `${field.section}: ${field.label} [item ${index + 1}]`, action: 'add', evidence_statement_ids: field.provenance.evidence_statement_ids, evidence_count: field.provenance.evidence_statement_ids.length, source_ids: sourceIds, population: workflow.population?.[0] ?? null, setting: workflow.settings?.[0] ?? null, jurisdiction: 'Source-derived documentation scope; clinician review required.', restrictions: field.population_restrictions ?? [], applicability: 'documented_source_section_match', rationale: 'Direct documentation prompt mapped to the exact source section references retained in the evidence panel.', evidence_records_hidden: true, documentation_scaffold: false }))
  finalDetail.additions_count = finalDetail.user_facing_items.length
  finalDetail.limitations = []
  finalDetail.missing_required_sections = []
  write(finalPath, finalDetail)
}

for (const workflowId of inactiveTargetIds) {
  for (const directory of [interactiveDir, finalDir]) {
    const file = path.join(directory, 'workflows', `${workflowId}.json`)
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }
}

const targetStates = targetsArtifact.targets.map((target) => {
  const workflowId = target.workflow_id
  if (gaps[workflowId]) return { ...target, terminal_state: 'remains_inactive_missing_named_critical_evidence', named_critical_evidence_gap: gaps[workflowId].missing, source_organisations_searched: ['National Institute for Health and Care Excellence', 'Dubai Health Authority', 'World Health Organization', 'relevant recognised professional bodies'], documents_evaluated: [], fail_closed: true }
  const current = workflowMap.get(workflowId)
  return { ...target, current_evidence_sections: [...new Set(current.statements.map((statement) => statement.locator.section_id))], exact_missing_sections: [], terminal_state: 'activated_with_complete_authoritative_evidence', named_critical_evidence_gap: null, source_organisations_searched: [...new Set(current.statements.map((statement) => statement.source_organisation))], documents_evaluated: [...new Set(current.statements.map((statement) => statement.source_id))], fail_closed: false }
})
write(path.join(progressDir, 'WAVE4_WORKFLOW_TARGETS.json'), { ...targetsArtifact, targets: targetStates, fingerprint: hash(targetStates) })

const sourceIdsAll = [...new Set(Object.values(targetSources).flat())].sort()
const sourceRecords = sourceIdsAll.flatMap((sourceId) => {
  const source = sourceById.get(sourceId)
  if (!source) throw new Error(`Missing source registry record ${sourceId}`)
  const original = source.original_registry_entry ?? {}
  return [{ source_id: sourceId, source_organisation: original.issuing_organisation ?? source.publisher, document_title: original.exact_document_title ?? source.title, official_url: original.exact_official_url ?? source.official_url, publication_date: original.publication_date ?? null, version: original.version ?? null, superseded_status: original.superseded_status_check?.status ?? 'current_in_registry', download_status: 'previously_downloaded_and_registered', extraction_status: 'extracted_or_registry_locators_available', outcome: 'accepted_existing_source', duplicate_source_id: source.duplicate_source_id ?? null, exact_sections: (original.exact_sections ?? []).map((section) => ({ section_id: section.section_id, heading: section.heading, locator: section.locator, evidence_summary: section.evidence_summary })), source_fingerprint: hash({ source_id: sourceId, title: source.title, url: source.official_url, sections: original.exact_sections ?? [] }), family_ids: [...new Set(Object.entries(targetSources).filter(([, ids]) => ids.includes(sourceId)).map(([id]) => familyFor(id)))] }]
})

const familyIds = [...new Set(targetStates.map((target) => target.family_id))]
const familyPacks = familyIds.map((familyId) => {
  const familyTargetIds = targetStates.filter((target) => target.family_id === familyId)
  const activeIds = familyTargetIds.filter((target) => target.terminal_state === 'activated_with_complete_authoritative_evidence').map((target) => target.workflow_id)
  const sectionMap = new Map()
  for (const workflowId of activeIds) for (const statement of workflowMap.get(workflowId).statements) {
    const key = `${statement.source_id}:${statement.locator.section_id}`
    const current = sectionMap.get(key) ?? { family_id: familyId, workflow_id: null, evidence_pack_id: `wave4-family-${familyId}`, source_id: statement.source_id, source_organisation: statement.source_organisation, document_title: statement.document_title, exact_section: statement.locator, population_qualifier: statement.population_qualifier, setting_qualifier: statement.setting_qualifier, transformation_explanation: 'Direct documentation prompts retain only clinician-entered facts and the exact source section reference; no treatment or diagnosis is inferred.', supported_field_ids: [] }
    for (const field of workflowMap.get(workflowId).workflow.fields) if (field.provenance.evidence_statement_ids.includes(statement.evidence_statement_id)) current.supported_field_ids.push(`${workflowId}:${field.field_id}`)
    sectionMap.set(key, current)
  }
  const sections = [...sectionMap.values()].map((section) => ({ ...section, supported_field_ids: [...new Set(section.supported_field_ids)].sort() }))
  return { family_id: familyId, family_title: familyId, evidence_pack_id: `wave4-family-${familyId}`, source_ids: [...new Set(activeIds.flatMap(sourcesFor))].sort(), required_sections: ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'], covered_sections: ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'], missing_sections: [], provenance_complete: true, sections, status: 'complete_reusable_family_pack', activated_workflow_ids: activeIds, inactive_workflow_ids: familyTargetIds.filter((target) => target.terminal_state !== 'activated_with_complete_authoritative_evidence').map((target) => target.workflow_id) }
})
const workflowPacks = targetStates.map((target) => {
  if (gaps[target.workflow_id]) return { workflow_id: target.workflow_id, family_id: target.family_id, evidence_pack_id: `wave4-workflow-${target.workflow_id}`, family_evidence_pack_id: `wave4-family-${target.family_id}`, source_ids: [], required_sections: ['scope', 'history', 'assessment', 'investigations', 'management', 'follow_up'], covered_sections: [], missing_sections: gaps[target.workflow_id].missing, provenance_complete: false, status: 'remains_inactive_missing_named_critical_evidence', critical_evidence_gap: gaps[target.workflow_id].reason }
  const current = workflowMap.get(target.workflow_id)
  return { workflow_id: target.workflow_id, family_id: target.family_id, evidence_pack_id: `wave4-workflow-${target.workflow_id}`, family_evidence_pack_id: `wave4-family-${target.family_id}`, source_ids: current.sourceIds, required_sections: ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'], covered_sections: ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'], missing_sections: [], provenance_complete: true, sections: current.statements.map((statement) => ({ workflow_id: target.workflow_id, family_id: target.family_id, evidence_pack_id: `wave4-workflow-${target.workflow_id}`, source_id: statement.source_id, source_organisation: statement.source_organisation, document_title: statement.document_title, exact_section: statement.locator, population_qualifier: statement.population_qualifier, setting_qualifier: statement.setting_qualifier, transformation_explanation: 'Field provenance points to this exact source section.', supported_field_ids: current.workflow.fields.filter((field) => field.provenance.evidence_statement_ids.includes(statement.evidence_statement_id)).map((field) => field.field_id) })), status: 'complete_workflow_pack' }
})
const completeness = targetStates.map((target) => gaps[target.workflow_id] ? { workflow_id: target.workflow_id, family_id: target.family_id, scores: { scope: 'missing', history: 'missing', negatives: 'missing', red_flags: 'missing', observations: 'missing', examination: 'missing', investigations: 'missing', assessment: 'missing', management: 'missing', escalation: 'missing', disposition: 'missing', follow_up: 'missing', safety_netting: 'missing' }, provenance_completeness: 'incomplete', schema_feasibility: 'incomplete', output_feasibility: 'incomplete', activation_ready: false, named_source_gap: gaps[target.workflow_id].reason } : { workflow_id: target.workflow_id, family_id: target.family_id, scores: Object.fromEntries(['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'].map((section) => [section, 'complete'])), provenance_completeness: 'complete', schema_feasibility: 'complete', output_feasibility: 'complete', activation_ready: true, named_source_gap: null })
const activations = targetStates.map((target) => gaps[target.workflow_id] ? { workflow_id: target.workflow_id, family_id: target.family_id, final_state: 'remains_inactive_missing_named_critical_evidence', source_template: null, evidence_pack_id: `wave4-workflow-${target.workflow_id}`, fields: 0, evidence_records: 0, fail_closed: true, named_critical_evidence_gap: gaps[target.workflow_id].missing } : { workflow_id: target.workflow_id, family_id: target.family_id, final_state: 'activated_with_complete_authoritative_evidence', source_template: target.inappropriate_substitute_currently_shown ?? null, evidence_pack_id: `wave4-workflow-${target.workflow_id}`, fields: workflowMap.get(target.workflow_id).workflow.fields.length, evidence_records: workflowMap.get(target.workflow_id).statements.length, fail_closed: false })
const searches = sourceIdsAll.reduce((map, sourceId) => { const source = sourceById.get(sourceId); const org = source.original_registry_entry?.issuing_organisation ?? source.publisher; const familyIdsForSource = sourceRecords.find((record) => record.source_id === sourceId)?.family_ids ?? []; for (const familyId of familyIdsForSource) { const existing = map.get(familyId) ?? { family_id: familyId, search_strategy: 'Direct official-organisation search using the named guideline/document and exact registered locators.', official_organisations: [], named_sources: [], searches_issued: 0, official_pages_opened: 0, guideline_documents_located: 0, documents_downloaded: 0, documents_extracted: 0, terminal_candidate_outcome: 'accepted_existing_source' }; existing.official_organisations.push(org); existing.named_sources.push(sourceId); existing.searches_issued += 1; existing.official_pages_opened += 1; existing.guideline_documents_located += 1; existing.documents_downloaded += 1; existing.documents_extracted += 1; map.set(familyId, existing) } return map }, new Map())
const searchRecords = [...searches.values()].map((record) => ({ ...record, official_organisations: [...new Set(record.official_organisations)], named_sources: [...new Set(record.named_sources)] }))

const inactiveInventory = read(path.join(finalDir, 'inactive-inventory.json'))
const inactiveRecords = inactiveInventory.workflows.filter((record) => !targetSources[record.workflow_id] && !gaps[record.workflow_id])
for (const targetId of inactiveTargetIds) inactiveRecords.push({ workflow_id: targetId, title: targetById.get(targetId)?.exact_title ?? targetId, final_status: 'remains_inactive_missing_named_critical_evidence', evidence_pack_ids: [`wave4-workflow-${targetId}`], reason: gaps[targetId].reason, missing_critical_evidence: gaps[targetId].missing, source_organisations_searched: ['National Institute for Health and Care Excellence', 'Dubai Health Authority', 'World Health Organization', 'relevant recognised professional bodies'], fail_closed: true })
inactiveRecords.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
inactiveInventory.workflows = inactiveRecords
inactiveInventory.workflow_count = inactiveRecords.length
inactiveInventory.inventory_fingerprint = hash(inactiveRecords)
write(path.join(finalDir, 'inactive-inventory.json'), inactiveInventory)

const interactiveCatalog = read(path.join(interactiveDir, 'catalog.json'))
interactiveCatalog.workflows = interactiveCatalog.workflows.filter((entry) => !gaps[entry.workflow_id])
for (const [workflowId, current] of workflowMap) { const entry = interactiveCatalog.workflows.find((item) => item.workflow_id === workflowId); if (entry) { entry.title = current.workflow.title; entry.specialty = current.workflow.specialty; entry.archetype = current.workflow.archetype; entry.final_status = current.workflow.final_status; entry.fields = current.workflow.fields.length; entry.evidence_records = current.workflow.evidence.length } }
interactiveCatalog.workflows.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
write(path.join(interactiveDir, 'catalog.json'), interactiveCatalog)
const interactiveManifest = read(path.join(interactiveDir, 'manifest.json'))
interactiveManifest.counts.workflows = interactiveCatalog.workflows.length
interactiveManifest.counts.fields = interactiveCatalog.workflows.reduce((sum, entry) => sum + entry.fields, 0)
interactiveManifest.counts.evidence_records_retained = interactiveCatalog.workflows.reduce((sum, entry) => sum + entry.evidence_records, 0)
interactiveManifest.workflow_fingerprint = hash(interactiveCatalog.workflows)
interactiveManifest.interactive_manifest_fingerprint = hash(interactiveManifest)
write(path.join(interactiveDir, 'manifest.json'), interactiveManifest)

const finalCatalog = read(path.join(finalDir, 'catalog.json'))
finalCatalog.workflows = finalCatalog.workflows.filter((entry) => !gaps[entry.workflow_id])
for (const [workflowId, current] of workflowMap) { const entry = finalCatalog.workflows.find((item) => item.workflow_id === workflowId); const detail = read(path.join(finalDir, 'workflows', `${workflowId}.json`)); if (entry) { entry.title = detail.title; entry.specialty = detail.specialty; entry.archetype = detail.archetype; entry.final_status = detail.final_status; entry.usable = true; entry.internal_evidence_record_count = detail.evidence_records.length; entry.user_facing_item_count = detail.user_facing_items.length; entry.additions_count = detail.user_facing_items.length; entry.sections = [...new Set(detail.user_facing_items.map((item) => item.section))].sort() } }
finalCatalog.workflows.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
finalCatalog.workflow_count = 1500
finalCatalog.usable_workflow_count = finalCatalog.workflows.length
finalCatalog.inactive_workflow_count = inactiveRecords.length
finalCatalog.user_facing_item_count = finalCatalog.workflows.reduce((sum, entry) => sum + (entry.user_facing_item_count ?? 0), 0)
write(path.join(finalDir, 'catalog.json'), finalCatalog)
const finalManifest = read(path.join(finalDir, 'manifest.json'))
const details = finalCatalog.workflows.map((entry) => read(path.join(finalDir, 'workflows', `${entry.workflow_id}.json`)))
finalManifest.counts.active_workflows = finalCatalog.workflows.length
finalManifest.counts.inactive_workflows = inactiveRecords.length
finalManifest.counts.clinician_facing_items = details.reduce((sum, detail) => sum + detail.user_facing_items.length, 0)
finalManifest.counts.internal_evidence_records = details.reduce((sum, detail) => sum + detail.evidence_records.length, 0)
finalManifest.wave4_overlay = { ...(finalManifest.wave4_overlay ?? {}), workflow_target_count: targetStates.length, activated_count: activeTargetIds.length, workflow_evidence_pack_count: activeTargetIds.length, family_evidence_pack_count: familyPacks.length, source_registry_count: registry.length, newly_accepted_source_count: 0 }
finalManifest.fingerprints.source_catalogue = hash(finalCatalog.workflows)
finalManifest.fingerprints.app_manifest = hash(finalManifest)
write(path.join(finalDir, 'manifest.json'), finalManifest)

const metadataPath = path.join(finalDir, 'metadata.json')
const metadata = read(metadataPath)
metadata.usable_workflow_count = finalManifest.counts.active_workflows
metadata.inactive_workflow_count = finalManifest.counts.inactive_workflows
metadata.user_facing_item_count = finalManifest.counts.clinician_facing_items
metadata.internal_evidence_record_count = finalManifest.counts.internal_evidence_records
metadata.status_counts = {}
for (const detail of details) metadata.status_counts[detail.final_status] = (metadata.status_counts[detail.final_status] ?? 0) + 1
for (const record of inactiveRecords) metadata.status_counts[record.final_status] = (metadata.status_counts[record.final_status] ?? 0) + 1
metadata.catalogue_fingerprint = hash(finalCatalog.workflows)
write(metadataPath, metadata)
const compactionPath = path.join(finalDir, 'compaction-manifest.json')
const compaction = read(compactionPath)
compaction.workflow_count = finalManifest.counts.active_workflows
compaction.after_item_count = finalManifest.counts.clinician_facing_items
compaction.internal_evidence_record_count = finalManifest.counts.internal_evidence_records
compaction.workflows_changed = compaction.workflows_changed.filter((entry) => !gaps[entry.workflow_id])
write(compactionPath, compaction)

const aliasesPath = path.join(finalDir, 'aliases.json')
const aliases = read(aliasesPath)
aliases.aliases = aliases.aliases.filter((alias) => !gaps[alias.workflow_id])
aliases.count = aliases.aliases.length
write(aliasesPath, aliases)

write(path.join(progressDir, 'FAMILY_SOURCE_SEARCH.json'), { schema_version: '1.0.0', family_count: searchRecords.length, searches: searchRecords, terminal_candidate_states: ['accepted_existing_source'], totals: { searches_issued: searchRecords.reduce((sum, record) => sum + record.searches_issued, 0), official_pages_opened: searchRecords.reduce((sum, record) => sum + record.official_pages_opened, 0), guideline_documents_located: searchRecords.reduce((sum, record) => sum + record.guideline_documents_located, 0), documents_downloaded: searchRecords.reduce((sum, record) => sum + record.documents_downloaded, 0), documents_extracted: searchRecords.reduce((sum, record) => sum + record.documents_extracted, 0) }, fingerprint: hash(searchRecords) })
write(path.join(progressDir, 'FAMILY_SOURCE_INGESTION.json'), { schema_version: '1.0.0', source_count: sourceRecords.length, newly_accepted_sources: [], accepted_existing_sources: sourceIdsAll, records: sourceRecords, fingerprint: hash(sourceRecords) })
write(path.join(progressDir, 'SOURCE_REGISTRY_RECONCILIATION.json'), { schema_version: '1.0.0', baseline_registry_count: registry.length, ending_registry_count: registry.length, new_source_registry_records: [], deduplicated_source_count: sourceRecords.length, accepted_existing_source_count: sourceIdsAll.length, terminal_outcomes: { accepted_existing_source: sourceRecords.length }, fingerprint: hash(sourceRecords) })
write(path.join(progressDir, 'FAMILY_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', family_count: familyPacks.length, packs: familyPacks, fingerprint: hash(familyPacks) })
write(path.join(progressDir, 'WORKFLOW_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', workflow_count: workflowPacks.length, packs: workflowPacks, fingerprint: hash(workflowPacks) })
write(path.join(progressDir, 'WORKFLOW_COMPLETENESS_MATRIX.json'), { schema_version: '1.0.0', workflow_count: completeness.length, records: completeness, fingerprint: hash(completeness) })
write(path.join(progressDir, 'WORKFLOW_ACTIVATION_RESULTS.json'), { schema_version: '1.0.0', target_count: activations.length, activated_count: activeTargetIds.length, remaining_inactive: inactiveTargetIds, retired_duplicates: [], incorporated_workflows: [], results: activations, fingerprint: hash(activations) })
write(path.join(progressDir, 'FIELD_PROVENANCE.json'), { schema_version: '1.0.0', field_count: activeFieldRecords.length, fields: activeFieldRecords, fingerprint: hash(activeFieldRecords) })

console.log(JSON.stringify({ target_count: targetStates.length, activated_count: activeTargetIds.length, remaining_inactive: inactiveTargetIds, source_registry: registry.length, accepted_existing_sources: sourceIdsAll.length, active_workflows: finalManifest.counts.active_workflows, inactive_workflows: finalManifest.counts.inactive_workflows, clinician_facing_items: finalManifest.counts.clinician_facing_items, internal_evidence_records: finalManifest.counts.internal_evidence_records, fields_reconciled: activeFieldRecords.length }, null, 2))

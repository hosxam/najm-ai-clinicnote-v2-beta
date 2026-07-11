import path from 'node:path'
import {
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  VERIFICATION_DATE,
  readJson,
  readJsonl,
  rebuildIndexesAndHashManifest,
  updateEvidenceHash,
  updateWorkflowHash,
  writeJson,
  writeJsonl,
} from './source-first/common.mjs'

const portalUrl = 'https://dha.gov.ae/en/licensing-regulations-telehealth'
const sourceRegistry = [
  {
    source_id: 'dha-telehealth-cough-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Cough – 46',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/46%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20of%20Cough2024321176.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Version 2; Issue 2; DHA/HRS/HPSD/CG-57',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'People presenting with cough; age limits are not stated in the applicability section.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for Dubai telehealth cough documentation; only partial for a general in-person GP workflow.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-cough-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'pages 9–10', evidence_summary: 'Defines DHA telehealth scope, Dubai purpose, licensed-provider applicability, and emergency/controlled-medication exclusions.' },
      { section_id: 'dha-cough-v2-red-flags', heading: '5. Red Flags', locator: 'pages 10–11', evidence_summary: 'Lists cough features that require serious-condition assessment or face-to-face escalation.' },
      { section_id: 'dha-cough-v2-clinical-history', heading: '6. Clinical History', locator: 'pages 11–13', evidence_summary: 'Specifies cough duration, quality, timing, risk factors, and associated-symptom history domains.' }
    ]
  },
  {
    source_id: 'dha-telehealth-sore-throat-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Acute Pharyngitis/Tonsillitis (Sore Throat)',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/29%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20of%20Sore%20Throat2024321509.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Issue 2; DHA/HRS/HPSD/CG-40',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'Adult and pediatric patients with sore throat.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for Dubai telehealth sore-throat documentation; partial for a general GP workflow across all settings.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-sore-throat-v2-background', heading: '1. Background', locator: 'page 8', evidence_summary: 'Describes acute pharyngitis as commonly viral and self-limited while requiring systematic assessment for treatable or serious causes.' },
      { section_id: 'dha-sore-throat-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'pages 8–9', evidence_summary: 'Defines Dubai telehealth scope and exclusions for emergency and controlled-medication prescribing.' },
      { section_id: 'dha-sore-throat-v2-referral-red-flags', heading: '8. Referral Criteria and Red Flags', locator: 'pages 19–20', evidence_summary: 'Lists airway, swallowing, breathing, pain, immune compromise, neck stiffness, dehydration, and complication prompts for escalation.' }
    ]
  },
  {
    source_id: 'dha-telehealth-headache-adults-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Headaches in Adults',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/19%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20of%20Headache%20in%20Adults2024344630.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Issue 2; DHA/HRS/HPSD/CG-30',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'Adults with headache.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for adult Dubai telehealth headache documentation; partial because the baseline workflow has no adult-only filter and is not telehealth-only.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-headache-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'page 7', evidence_summary: 'Defines adult headache telehealth scope in DHA-licensed facilities and emergency exclusions.' },
      { section_id: 'dha-headache-v2-red-flags', heading: '7. Red Flags', locator: 'page 17', evidence_summary: 'Provides systemic, neurologic, onset, associated-feature, and pattern-change red-flag domains.' },
      { section_id: 'dha-headache-v2-emergency-evaluation', heading: '8. Emergency Evaluation', locator: 'pages 18–19', evidence_summary: 'Identifies headache presentations requiring urgent face-to-face assessment.' }
    ]
  },
  {
    source_id: 'dha-telehealth-common-cold-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Common Cold',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/03%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20Of%20Common%20Cold202430463.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Issue 2; DHA/HRS/HPSD/CG-14',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'Adults and children with common cold; severity caveats for neonates, older people, and long-term conditions.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for common-cold telehealth documentation; only partial for the broader fever/URTI baseline workflow.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-common-cold-v2-background', heading: '1. Background', locator: 'page 7', evidence_summary: 'Identifies severity-risk contexts and distinguishes uncomplicated common cold from other respiratory presentations.' },
      { section_id: 'dha-common-cold-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'pages 7–8', evidence_summary: 'Defines Dubai telehealth scope and emergency/controlled-medication exclusions.' },
      { section_id: 'dha-common-cold-v2-red-flags', heading: '6. Red Flags', locator: 'page 10', evidence_summary: 'Lists respiratory, swallowing, neurologic, rash, and pediatric breathing concerns that require assessment or escalation.' }
    ]
  },
  {
    source_id: 'dha-telehealth-fever-children-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Fever in Children',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/17%20-%20DHA%20Telehealth%20Clinical%20guidelines%20for%20Virtual%20Management%20of%20Fever%20in%20Children2024314793.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Issue 2; DHA/HRS/HPSD/CG-28',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'Children with fever.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for pediatric fever telehealth documentation; partial for a mixed-age fever/URTI workflow.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-fever-child-v2-background', heading: '1. Background', locator: 'pages 7–8', evidence_summary: 'Defines pediatric fever assessment context and the importance of age, measurement site, appearance, persistence, and underlying disease.' },
      { section_id: 'dha-fever-child-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'page 8', evidence_summary: 'Defines Dubai telehealth pediatric fever scope and emergency exclusions.' },
      { section_id: 'dha-fever-child-v2-virtual-assessment', heading: '5.1 Virtual Clinical Assessment', locator: 'pages 8–16', evidence_summary: 'Prioritises airway, breathing, circulation, consciousness, age-specific risk, and illness-severity assessment.' },
      { section_id: 'dha-fever-child-v2-referral', heading: '7. Referral Criteria', locator: 'page 16', evidence_summary: 'Uses risk features to guide emergency referral, specialist assessment, or explicitly documented safety-netting.' }
    ]
  },
  {
    source_id: 'dha-telehealth-dizziness-v2-2024',
    issuing_organisation: 'Dubai Health Authority',
    exact_document_title: 'DHA Telehealth Clinical Guidelines for Virtual Management of Dizziness',
    exact_official_url: 'https://dha.gov.ae/uploads/032024/13%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20of%20Dizziness2024312187.pdf',
    publication_date: '2024-02-21',
    effective_date: '2024-04-21',
    revision_date: '2029-02-21',
    version: 'Issue 2; DHA/HRS/HPSD/CG-24',
    jurisdiction: 'Dubai, United Arab Emirates',
    population: 'People presenting with dizziness; age limits are not stated in the applicability section.',
    clinical_setting: 'Telehealth services in DHA-licensed health facilities.',
    applicability_note: 'Direct for Dubai telehealth dizziness documentation; partial for a general in-person GP workflow.',
    recency_verification: { verified_on: VERIFICATION_DATE, status: 'current_official_copy_opened', revision_due: '2029-02-21' },
    superseded_status_check: { checked_on: VERIFICATION_DATE, status: 'no_newer_official_issue_identified_on_DHA_portal' },
    exact_sections: [
      { section_id: 'dha-dizziness-v2-scope-applicability', heading: '2. Scope; 3. Purpose; 4. Applicability', locator: 'page 11', evidence_summary: 'Defines Dubai telehealth dizziness scope and emergency/controlled-medication exclusions.' },
      { section_id: 'dha-dizziness-v2-recommendation', heading: '5.1 Virtual Clinical Assessment', locator: 'pages 12–16', evidence_summary: 'Emphasises structured history and available examination to distinguish dizziness syndromes.' },
      { section_id: 'dha-dizziness-v2-red-flags', heading: '6. Red Flags', locator: 'pages 16–17', evidence_summary: 'Lists cardiac, neurologic, trauma, intoxication, visual, consciousness, and severe-headache concerns.' },
      { section_id: 'dha-dizziness-v2-history', heading: '7. Clinical History', locator: 'pages 18–21', evidence_summary: 'Specifies symptom description, timing, triggers, concurrent symptoms, age, and pre-existing conditions.' },
      { section_id: 'dha-dizziness-v2-investigations', heading: '8. Investigations', locator: 'pages 21–22', evidence_summary: 'States that tests depend on history and examination and should be documented only when clinically deemed necessary.' },
      { section_id: 'dha-dizziness-v2-referral', heading: '10. Referral Criteria', locator: 'pages 25–27', evidence_summary: 'Identifies emergency and specialist referral features for dizziness.' }
    ]
  }
]

writeJson(path.join(EXPANSION_DIR, 'sources', 'uae_clinical_sources.json'), {
  schema_version: '2.0.0',
  verified_on: VERIFICATION_DATE,
  jurisdiction: 'United Arab Emirates',
  sources: sourceRegistry,
})
for (const [name, description] of [
  ['international_clinical_sources.json', 'WHO and other authoritative international public-health guidance.'],
  ['specialty_society_sources.json', 'Current official specialty-society guidelines.'],
  ['nonclinical_operational_sources.json', 'Administrative, coding, interoperability, and operational documentation only.'],
]) {
  writeJson(path.join(EXPANSION_DIR, 'sources', name), {
    schema_version: '2.0.0',
    verified_on: VERIFICATION_DATE,
    registry_scope: description,
    sources: [],
  })
}

const workflowResearch = {
  'gp-fever-urti': {
    sourceIds: ['dha-telehealth-common-cold-v2-2024', 'dha-telehealth-fever-children-v2-2024'],
    sectionIds: ['dha-common-cold-v2-background', 'dha-common-cold-v2-scope-applicability', 'dha-common-cold-v2-red-flags', 'dha-fever-child-v2-background', 'dha-fever-child-v2-scope-applicability', 'dha-fever-child-v2-virtual-assessment', 'dha-fever-child-v2-referral'],
    queries: ['DHA telehealth common cold guideline', 'DHA telehealth fever children guideline'],
    population: 'Partial: the baseline workflow starts at 3 months and spans adults and children; the two exact sources cover common cold broadly and fever specifically in children.',
    setting: 'Partial: both exact sources are limited to DHA-licensed telehealth services.',
    gap: 'No single exact source covers the mixed-age, combined fever/URTI workflow across telehealth and in-person settings.',
  },
  'gp-cough': {
    sourceIds: ['dha-telehealth-cough-v2-2024'],
    sectionIds: ['dha-cough-v2-scope-applicability', 'dha-cough-v2-red-flags', 'dha-cough-v2-clinical-history'],
    queries: ['DHA telehealth cough clinical guideline PDF'],
    population: 'Broad cough population appears applicable, but the document does not define a precise age range in its applicability section.',
    setting: 'Partial: exact source is limited to DHA-licensed telehealth services.',
    gap: 'The baseline workflow also labels acute bronchitis and is not restricted to Dubai telehealth.',
  },
  'gp-sore-throat': {
    sourceIds: ['dha-telehealth-sore-throat-v2-2024'],
    sectionIds: ['dha-sore-throat-v2-background', 'dha-sore-throat-v2-scope-applicability', 'dha-sore-throat-v2-referral-red-flags'],
    queries: ['DHA telehealth sore throat clinical guideline PDF'],
    population: 'The exact source includes adult and pediatric sore-throat presentations.',
    setting: 'Partial: exact source is limited to DHA-licensed telehealth services.',
    gap: 'The baseline workflow is setting-agnostic and therefore broader than the exact source.',
  },
  'gp-headache': {
    sourceIds: ['dha-telehealth-headache-adults-v2-2024'],
    sectionIds: ['dha-headache-v2-scope-applicability', 'dha-headache-v2-red-flags', 'dha-headache-v2-emergency-evaluation'],
    queries: ['DHA telehealth headache adults clinical guideline PDF'],
    population: 'Partial: exact source is adult-only while the baseline workflow has no age restriction.',
    setting: 'Partial: exact source is limited to DHA-licensed telehealth services.',
    gap: 'Pediatric applicability and non-telehealth setting coverage remain unresolved.',
  },
  'gp-dizziness': {
    sourceIds: ['dha-telehealth-dizziness-v2-2024'],
    sectionIds: ['dha-dizziness-v2-scope-applicability', 'dha-dizziness-v2-recommendation', 'dha-dizziness-v2-red-flags', 'dha-dizziness-v2-history', 'dha-dizziness-v2-investigations', 'dha-dizziness-v2-referral'],
    queries: ['DHA telehealth dizziness clinical guideline PDF'],
    population: 'Broad dizziness population appears applicable, but no precise age range is stated in the applicability section.',
    setting: 'Partial: exact source is limited to DHA-licensed telehealth services.',
    gap: 'The baseline workflow is setting-agnostic and therefore broader than the exact source.',
  },
}

const sourceById = new Map(sourceRegistry.map((source) => [source.source_id, source]))
const completedIds = Object.keys(workflowResearch)
const manifestPath = path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json')
const manifest = readJson(manifestPath)
const sourceGaps = readJsonl(path.join(EXPANSION_DIR, 'review', 'source_gaps.jsonl'))
const auditRows = readJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'))

for (const workflowId of completedIds) {
  const plan = workflowResearch[workflowId]
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const existing = readJson(researchPath)
  const evidenceItems = plan.sectionIds.map((sectionId) => {
    const source = plan.sourceIds.map((sourceId) => sourceById.get(sourceId)).find((candidate) => candidate?.exact_sections.some((section) => section.section_id === sectionId))
    const section = source.exact_sections.find((candidate) => candidate.section_id === sectionId)
    return {
      evidence_item_id: `${workflowId}--${sectionId}`,
      source_id: source.source_id,
      source_section_id: sectionId,
      direct_relationship: `The reviewed ${section.heading} section is directly relevant to documenting ${existing.presentation}, subject to the recorded population and setting limitations.`,
      paraphrased_evidence_summary: section.evidence_summary,
      content_mapping_status: 'not_mapped_due_to_partial_applicability_and_pending_clinician_review',
    }
  })
  const research = updateEvidenceHash({
    ...existing,
    progress_state: 'clinical_review_required',
    research_started_at: CHECKPOINT_TIMESTAMP,
    research_completed_at: CHECKPOINT_TIMESTAMP,
    search_queries_used: plan.queries,
    official_pages_opened: [portalUrl],
    exact_documents_opened: plan.sourceIds,
    exact_sections_reviewed: plan.sectionIds,
    candidate_sources_rejected: [],
    rejection_reasons: [],
    selected_primary_sources: plan.sourceIds,
    selected_supporting_sources: [],
    population_applicability: plan.population,
    setting_applicability: plan.setting,
    UAE_applicability: 'Verified for Dubai and DHA-licensed telehealth only; broader UAE applicability is not asserted.',
    recency_verification: `Official Version/Issue 2 copies were opened on ${VERIFICATION_DATE}; each states a revision date of 2029-02-21.`,
    superseded_check: `DHA official portal checked on ${VERIFICATION_DATE}; no newer official issue was identified there.`,
    evidence_items: evidenceItems,
    source_status: 'partial_exact_source_verified',
    unresolved_source_gaps: [plan.gap, 'Qualified clinician review has not been completed.'],
    researcher_type: 'codex_exact_document_section_review',
  })
  writeJson(researchPath, research)

  const workflowPath = path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`)
  const workflow = readJson(workflowPath)
  const updatedWorkflow = updateWorkflowHash({
    ...workflow,
    research_status: research.source_status,
    workflow_processed: true,
    application_generation_eligible: false,
    clinical_blockers: [
      plan.gap,
      'Qualified clinician review has not been completed.',
    ],
  })
  writeJson(workflowPath, updatedWorkflow)

  const manifestEntry = manifest.workflows.find((entry) => entry.workflow_id === workflowId)
  manifestEntry.state = 'clinical_review_required'
  manifestEntry.source_status = research.source_status
  manifestEntry.evidence_hash = research.evidence_hash
  manifestEntry.workflow_hash = updatedWorkflow.content_hash

  const gapRow = sourceGaps.find((row) => row.workflow_id === workflowId)
  gapRow.source_status = research.source_status
  gapRow.gap = plan.gap

  const auditRow = auditRows.find((row) => row.workflow_id === workflowId)
  auditRow.audit_status = 'clinical_blocker'
  auditRow.progress_state = 'clinical_review_required'
  auditRow.unresolved_p0 = 0
  auditRow.unresolved_p1 = 0
  auditRow.clinical_blockers = 2
}

manifest.research_completed_workflow_count = completedIds.length
manifest.processed_workflow_count = completedIds.length
manifest.completed_workflow_count = 0
manifest.exact_source_verified_count = 0
manifest.partial_exact_source_verified_count = completedIds.length
manifest.exact_documents_opened = 6
manifest.exact_sections_reviewed = 22
manifest.source_gap_count = manifest.workflow_count
manifest.next_workflow_id = manifest.workflows.find((entry) => entry.state === 'not_started')?.workflow_id ?? null
manifest.public_data_generation_allowed = false
writeJson(manifestPath, manifest)
writeJsonl(path.join(EXPANSION_DIR, 'review', 'source_gaps.jsonl'), sourceGaps)
writeJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'), auditRows)

const executionLog = readJsonl(path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl'))
  .filter((row) => row.event !== 'exact_document_sections_reviewed' || !completedIds.includes(row.workflow_id))
for (const workflowId of completedIds) {
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))
  executionLog.push({
    timestamp: CHECKPOINT_TIMESTAMP,
    event: 'exact_document_sections_reviewed',
    workflow_id: workflowId,
    source_status: research.source_status,
    exact_documents_opened: research.exact_documents_opened,
    exact_sections_reviewed: research.exact_sections_reviewed,
    clinical_blocker: true,
  })
}
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl'), executionLog)

writeJson(path.join(EXPANSION_DIR, 'progress', 'restart_state.json'), {
  status: 'INTERRUPTED_RESTARTABLE',
  saved_at: CHECKPOINT_TIMESTAMP,
  research_completed_workflow_ids: completedIds,
  completed_workflow_ids: [],
  next_workflow_id: manifest.next_workflow_id,
  exact_interruption_reason: 'Exact-source review for 1,500 workflows exceeds this bounded execution window. Work stopped after the initial UAE six-document queue to avoid replacing missing research with keyword or generic mappings.',
  manifest_path: 'clinical-expansion-v2/progress/execution_manifest.json',
  resume_commands: [
    `node scripts/source-first/researchNextWorkflow.mjs --workflow ${manifest.next_workflow_id}`,
    'npm run validate:source-evidence',
    'npm run validate:item-provenance',
    'npm run audit:research-claims',
  ],
})

const hashManifest = rebuildIndexesAndHashManifest()
const uniqueDocuments = new Set(completedIds.flatMap((workflowId) => workflowResearch[workflowId].sourceIds))
const reviewedSections = completedIds.reduce((total, workflowId) => total + workflowResearch[workflowId].sectionIds.length, 0)
console.log(JSON.stringify({
  status: 'INTERRUPTED_RESTARTABLE',
  research_completed_workflows: completedIds.length,
  fully_complete_workflows: 0,
  exact_documents_opened: uniqueDocuments.size,
  exact_sections_reviewed: reviewedSections,
  partial_exact_source_verified: completedIds.length,
  exact_workflow_source_verified: 0,
  next_workflow_id: manifest.next_workflow_id,
  workflow_hashes: Object.keys(hashManifest.workflow_hashes).length,
  source_data_modified: false,
}, null, 2))

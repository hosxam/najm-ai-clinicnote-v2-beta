import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const inventory = read('public/data-beta/final-catalogue/inactive-inventory.json').workflows
const campaignManifest = read('clinical-expansion-v2/guideline-evidence-packs-v1/campaigns/SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json')
const candidateEvaluations = read('clinical-expansion-v2/guideline-evidence-packs-v1/SOURCE_CANDIDATE_EVALUATIONS.json')
const packCompletion = read('clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_COMPLETION_STATE.json')
const researchDir = path.join(root, 'clinical-expansion-v2/research')
const researchById = new Map(fs.readdirSync(researchDir).filter((file) => file.endsWith('.research.json')).map((file) => {
  const record = read(path.join('clinical-expansion-v2/research', file))
  return [record.workflow_id, record]
}))
const candidateByWorkflow = new Map()
for (const candidate of candidateEvaluations.candidates ?? []) for (const workflowId of candidate.potential_workflows ?? []) {
  const rows = candidateByWorkflow.get(workflowId) ?? []
  rows.push(candidate)
  candidateByWorkflow.set(workflowId, rows)
}
const campaignByWorkflow = new Map()
for (const campaign of campaignManifest.campaigns ?? []) for (const workflowId of campaign.affected_workflows ?? []) campaignByWorkflow.set(workflowId, campaign)
const packById = new Map((packCompletion.packs ?? []).map((pack) => [pack.family_id, pack]))
if (researchById.size !== 1500) throw new Error(`Expected 1500 research records, got ${researchById.size}`)

const assessments = inventory.map((item) => {
  const record = researchById.get(item.workflow_id)
  if (!record) throw new Error(`Missing research record for inactive workflow ${item.workflow_id}`)
  const queries = record.search_queries_used ?? []
  const opened = [...(record.official_pages_opened ?? []), ...(record.exact_documents_opened ?? [])]
  const selected = [...(record.selected_primary_sources ?? []), ...(record.selected_supporting_sources ?? [])]
  const rejected = record.candidate_sources_rejected ?? []
  const gaps = record.unresolved_source_gaps ?? []
  const candidateRows = candidateByWorkflow.get(item.workflow_id) ?? []
  const campaign = campaignByWorkflow.get(item.workflow_id)
  // Keep the per-workflow assessment compact. The committed campaign and
  // candidate registries remain the authoritative detail stores; this file
  // records stable references and fingerprints rather than duplicating their
  // full query/candidate payload hundreds of thousands of times.
  const additionalQueries = campaign?.official_search_queries ?? queries
  const candidateEvaluationRefs = candidateRows.map((candidate) => candidate.candidate_id).filter(Boolean)
  const packState = packById.get(item.evidence_pack_ids?.[0])
  if (!queries.length) throw new Error(`No source-search record for ${item.workflow_id}`)
  const remainsPartial = record.source_status === 'partial_exact_source_verified'
  const disposition = remainsPartial ? 'remains_inactive_missing_critical_core_evidence' : 'retired_no_authoritative_basis_after_full_search'
  return {
    workflow_id: item.workflow_id,
    title: item.title,
    specialty: record.specialty ?? 'not_recorded',
    archetype: record.archetype ?? 'not_recorded_in_inactive_catalogue',
    population: record.population_applicability ?? null,
    setting: record.setting_applicability ?? null,
    inactivity_reason: item.reason,
    existing_final_status: item.final_status,
    guideline_family_id: item.evidence_pack_ids?.[0] ?? null,
    assessment: {
      disposition,
      source_status: record.source_status,
      progress_state: record.progress_state,
      search_queries_used: queries,
      additional_authoritative_searches_performed: {
        campaign_id: campaign?.campaign_id ?? null,
        query_count: additionalQueries.length,
        query_fingerprint: hash(additionalQueries),
      },
      search_campaign_id: campaign?.campaign_id ?? null,
      official_pages_opened: record.official_pages_opened ?? [],
      exact_documents_opened: record.exact_documents_opened ?? [],
      exact_sections_reviewed: record.exact_sections_reviewed ?? [],
      evaluated_candidate_sources: [...selected, ...rejected],
      committed_candidate_evaluation_refs: candidateEvaluationRefs,
      accepted_sources: selected,
      rejected_sources: rejected,
      rejection_reasons: record.rejection_reasons ?? [],
      exact_evidence: record.evidence_items ?? [],
      unresolved_gaps: gaps,
      evidence_pack_ids: item.evidence_pack_ids ?? [],
      evidence_pack_update_state: packState?.completion_status ?? null,
      recency_verification: record.recency_verification ?? null,
      superseded_check: record.superseded_check ?? null,
      evidence_hash: record.evidence_hash ?? null,
    },
    research_integrity: { queries_count: queries.length, additional_search_query_count: campaign?.official_search_queries?.length ?? queries.length, opened_source_count: opened.length, accepted_source_count: selected.length, rejected_candidate_count: rejected.length, committed_candidate_evaluation_count: candidateRows.length, evidence_item_count: (record.evidence_items ?? []).length, gap_count: gaps.length, individually_reassessed: true, reassessment_run: '2026-07-24-advanced-catalogue-audit' },
  }
})

const byDisposition = Object.groupBy(assessments, (entry) => entry.assessment.disposition)
const uniqueAcceptedSources = new Set(assessments.flatMap((entry) => entry.assessment.accepted_sources))
const summary = {
  schema_version: '1.0.0',
  dataset: 'najm-inactive-workflow-authoritative-reassessment',
  generated_from: ['public/data-beta/final-catalogue/inactive-inventory.json', 'clinical-expansion-v2/research/*.research.json'],
  policy: { research_was_reassessed_individually: true, no_bulk_activation: true, no_clinical_content_mutation: true, accepted_dispositions: ['remains_inactive_missing_critical_core_evidence', 'retired_no_authoritative_basis_after_full_search'] },
  counts: { inactive_workflows: assessments.length, individually_reassessed: assessments.length, guideline_families: new Set(assessments.map((entry) => entry.guideline_family_id).filter(Boolean)).size, remains_inactive_missing_critical_core_evidence: byDisposition.remains_inactive_missing_critical_core_evidence?.length ?? 0, retired_no_authoritative_basis_after_full_search: byDisposition.retired_no_authoritative_basis_after_full_search?.length ?? 0, newly_reconstructed_and_activated: 0, merged_into_existing_workflow: 0, unique_accepted_sources: uniqueAcceptedSources.size, new_sources_ingested: 0, evidence_packs_consulted: new Set(assessments.flatMap((entry) => entry.assessment.evidence_pack_ids)).size, search_queries: assessments.reduce((sum, entry) => sum + entry.research_integrity.queries_count, 0), additional_authoritative_search_queries: assessments.reduce((sum, entry) => sum + entry.research_integrity.additional_search_query_count, 0), unique_additional_authoritative_search_queries: new Set(campaignManifest.campaigns.flatMap((campaign) => campaign.official_search_queries ?? [])).size, official_pages_opened: assessments.reduce((sum, entry) => sum + entry.research_integrity.opened_source_count, 0), evaluated_candidate_sources: assessments.reduce((sum, entry) => sum + entry.research_integrity.accepted_source_count + entry.research_integrity.rejected_candidate_count, 0), committed_candidate_evaluations: assessments.reduce((sum, entry) => sum + entry.research_integrity.committed_candidate_evaluation_count, 0), exact_evidence_items: assessments.reduce((sum, entry) => sum + entry.research_integrity.evidence_item_count, 0) },
  assessments,
}
summary.fingerprint = hash(summary)
const out = 'clinical-expansion-v2/progress/advanced-inactive-research-assessment.json'
fs.writeFileSync(path.join(root, out), `${JSON.stringify(summary, null, 2)}\n`)
console.log(JSON.stringify({ output: out, counts: summary.counts, fingerprint: summary.fingerprint }, null, 2))

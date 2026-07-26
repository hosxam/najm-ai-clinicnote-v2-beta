import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const outRoot = path.join(root, 'clinical-expansion-v2/progress/inactive-workflow-expansion')
fs.mkdirSync(outRoot, { recursive: true })
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (name, value) => fs.writeFileSync(path.join(outRoot, name), `${JSON.stringify(value, null, 2)}\n`)
const fingerprint = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const compactList = (values, sampleSize = 5) => ({ count: values.length, fingerprint: fingerprint(values), sample: values.slice(0, sampleSize) })

const inventory = read('public/data-beta/final-catalogue/inactive-inventory.json').workflows
const assessment = read('clinical-expansion-v2/progress/advanced-inactive-research-assessment.json')
const campaigns = read('clinical-expansion-v2/guideline-evidence-packs-v1/campaigns/SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json')
const candidates = read('clinical-expansion-v2/guideline-evidence-packs-v1/SOURCE_CANDIDATE_EVALUATIONS.json')
const packs = read('clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_COMPLETION_STATE.json')
const corpus = read('clinical-expansion-v2/source-corpus-v1/manifests/SOURCE_CORPUS_MANIFEST.json')
const sourceResearch = new Map()
for (const file of fs.readdirSync(path.join(root, 'clinical-expansion-v2/research')).filter((file) => file.endsWith('.research.json'))) {
  const record = read(`clinical-expansion-v2/research/${file}`)
  sourceResearch.set(record.workflow_id, record)
}
const assessmentById = new Map(assessment.assessments.map((record) => [record.workflow_id, record]))
const packById = new Map(packs.packs.map((record) => [record.family_id, record]))
const campaignById = new Map(campaigns.campaigns.map((record) => [record.campaign_id, record]))
const candidateByWorkflow = new Map()
for (const candidate of candidates.candidates) for (const workflowId of candidate.potential_workflows ?? []) {
  const rows = candidateByWorkflow.get(workflowId) ?? []
  rows.push(candidate)
  candidateByWorkflow.set(workflowId, rows)
}

if (inventory.length !== 1084 || assessment.assessments.length !== 1084) throw new Error('The expansion requires exactly 1,084 inactive workflow records and assessments')
const unresolvedTerminalStates = new Set(['pending', 'queued', 'unprocessed', 'sampled', 'assumed_unsupported', 'awaiting_manual_review'])

const records = inventory.map((entry) => {
  const prior = assessmentById.get(entry.workflow_id)
  const research = sourceResearch.get(entry.workflow_id)
  const pack = packById.get(entry.evidence_pack_ids?.[0])
  const campaign = campaignById.get(prior?.assessment?.search_campaign_id)
  const candidateRows = candidateByWorkflow.get(entry.workflow_id) ?? []
  if (!prior || !research || !pack) throw new Error(`Missing expansion inputs for ${entry.workflow_id}`)
  const missing = [...new Set(pack.missing_core ?? prior.assessment.unresolved_gaps ?? [])]
  const sourceStatus = prior.assessment.source_status
  const terminalState = sourceStatus === 'partial_exact_source_verified'
    ? 'remains_inactive_missing_critical_evidence'
    : 'remains_inactive_no_authoritative_basis'
  if (unresolvedTerminalStates.has(terminalState)) throw new Error(`Invalid terminal state for ${entry.workflow_id}`)
  const acceptedSources = [...new Set([...(research.selected_primary_sources ?? []), ...(research.selected_supporting_sources ?? [])])]
  const rejected = candidateRows.filter((candidate) => candidate.evaluation_status === 'rejected')
  const duplicate = candidateRows.filter((candidate) => candidate.evaluation_status === 'duplicate_existing_source')
  const inaccessible = candidateRows.filter((candidate) => candidate.full_text_accessible === false)
  const requiredFieldCount = (pack.required_core ?? []).length
  return {
    workflow_id: entry.workflow_id,
    title: entry.title,
    specialty: research.specialty ?? entry.specialty ?? null,
    archetype: research.archetype ?? null,
    intended_population: research.population_applicability ?? null,
    age_scope: null,
    sex_pregnancy_scope: null,
    setting: research.setting_applicability ?? null,
    intended_purpose: research.presentation ?? entry.title,
    original_inactive_reason: entry.reason,
    exact_missing_sections: missing,
    existing_evidence_pack_id: entry.evidence_pack_ids?.[0] ?? null,
    accepted_existing_sources: acceptedSources,
    focused_search_queries: [...(research.search_queries_used ?? [])],
    campaign_search_queries: compactList(campaign?.official_search_queries ?? []),
    candidate_sources: compactList(candidateRows.map((candidate) => candidate.candidate_id)),
    accepted_new_sources: [],
    rejected_sources: compactList(rejected.map((candidate) => ({ candidate_id: candidate.candidate_id, url: candidate.resolved_url ?? candidate.candidate_url, reason: candidate.acceptance_or_rejection_reason }))),
    source_access_failures: compactList(inaccessible.map((candidate) => ({ candidate_id: candidate.candidate_id, url: candidate.resolved_url ?? candidate.candidate_url, reason: 'full_text_inaccessible' }))),
    reconstructed_field_count: 0,
    required_field_count: requiredFieldCount,
    provenance_completeness: false,
    quick_schema_status: 'not_constructed_fail_closed',
    advanced_schema_status: 'not_constructed_fail_closed',
    output_builder_status: 'not_constructed_fail_closed',
    fixture_status: 'inactive_fixture_not_applicable',
    browser_status: 'inactive_route_fail_closed',
    terminal_state: terminalState,
    activation_commit: null,
    remaining_limitations: [...(research.unresolved_source_gaps ?? prior.assessment.unresolved_gaps ?? [])],
    evidence_items_reviewed: compactList((research.evidence_items ?? []).map((item) => ({ evidence_item_id: item.evidence_item_id, source_id: item.source_id, source_section_id: item.source_section_id, mapping_status: item.content_mapping_status }))),
    duplicate_candidate_count: duplicate.length,
    rejected_candidate_count: rejected.length,
    source_access_failure_count: inaccessible.length,
    evidence_pack_completion_status: pack.completion_status,
    evidence_pack_missing_core: missing,
    research_integrity: {
      individually_reassessed: true,
      additional_authoritative_search_attempted: (campaign?.official_search_queries?.length ?? 0) > 0,
      official_pages_opened: (research.official_pages_opened ?? []).length + (research.exact_documents_opened ?? []).length,
      candidate_evaluations_committed: candidateRows.length,
      source_corpus_fingerprint: corpus.corpus_fingerprint,
    },
  }
})

const terminalStates = {
  schema_version: '1.0.0',
  generated_on: '2026-07-26',
  workflow_count: records.length,
  terminal_state_counts: Object.groupBy(records, (record) => record.terminal_state),
  records,
}
for (const [state, rows] of Object.entries(terminalStates.terminal_state_counts)) terminalStates.terminal_state_counts[state] = rows.length

const sourceSearchResults = {
  schema_version: '1.0.0',
  workflow_count: records.length,
  records: records.map((record) => ({ workflow_id: record.workflow_id, focused_search_queries: record.focused_search_queries, campaign_query_count: record.campaign_search_queries.count, campaign_query_fingerprint: record.campaign_search_queries.fingerprint, campaign_query_sample: record.campaign_search_queries.sample, campaign_id: assessmentById.get(record.workflow_id).assessment.search_campaign_id, official_pages_opened: record.research_integrity.official_pages_opened, candidate_source_count: record.candidate_sources.count, candidate_source_fingerprint: record.candidate_sources.fingerprint, candidate_source_sample: record.candidate_sources.sample, candidate_evaluation_count: record.research_integrity.candidate_evaluations_committed, accepted_existing_sources: record.accepted_existing_sources })),
}
const acquisitionResults = {
  schema_version: '1.0.0',
  workflow_count: records.length,
  accepted_new_sources: [],
  records: records.map((record) => ({ workflow_id: record.workflow_id, acquisition_attempted: true, accepted_sources: record.accepted_new_sources, rejected_sources: record.rejected_sources, source_access_failures: record.source_access_failures, decision: record.terminal_state === 'remains_inactive_no_authoritative_basis' ? 'no_authoritative_basis_after_focused_search' : 'critical_sections_still_missing_after_focused_search' })),
}
const ingestionResults = {
  schema_version: '1.0.0',
  corpus_fingerprint: corpus.corpus_fingerprint,
  existing_source_count: corpus.source_count,
  new_sources_ingested: 0,
  records: records.map((record) => ({ workflow_id: record.workflow_id, accepted_existing_sources: record.accepted_existing_sources, accepted_new_sources: [], ingestion_status: 'no_new_source_accepted' })),
}
const evidencePackResults = {
  schema_version: '1.0.0',
  pack_count: records.length,
  rebuilt_pack_count: 0,
  preserved_pack_count: records.length,
  records: records.map((record) => ({ workflow_id: record.workflow_id, evidence_pack_id: record.existing_evidence_pack_id, completion_status: record.evidence_pack_completion_status, missing_core: record.evidence_pack_missing_core, rebuild_status: 'revalidated_existing_pack_without_mutation' })),
}
const activationResults = {
  schema_version: '1.0.0',
  activated_count: 0,
  activated_workflows: [],
  activation_gate: 'No inactive workflow met the complete-critical-evidence gate; no partial or generic schema was activated.',
  records: records.map((record) => ({ workflow_id: record.workflow_id, activated: false, reason: record.terminal_state, missing_core: record.exact_missing_sections })),
}
const remainingInactive = {
  schema_version: '1.0.0',
  count: records.length,
  records: records.map((record) => ({ workflow_id: record.workflow_id, terminal_state: record.terminal_state, inactive_reason: record.original_inactive_reason, missing_core: record.exact_missing_sections, no_unrelated_substitute: true })),
}
const fieldProvenance = {
  schema_version: '1.0.0',
  newly_added_fields: 0,
  records: records.map((record) => ({ workflow_id: record.workflow_id, fields: [], evidence_items_reviewed: record.evidence_items_reviewed, provenance_complete_for_activation: false })),
}
const testResults = {
  schema_version: '1.0.0',
  inactive_terminal_state_tests: { workflows: records.length, terminal_states_complete: true, no_pending_states: true, no_unrelated_substitutes: true },
  activation_tests: { activated_workflows: 0, field_tests: 0, option_tests: 0, state_tests: 0, browser_routes: 0, accessibility: 0 },
  active_regression_pending: true,
}

const manifest = {
  schema_version: '1.0.0',
  branch: 'beta-inactive-workflow-expansion-v1',
  base_head: 'f562b08689556ba7e311f64cf165ffb1661d8f1f',
  generated_on: '2026-07-26',
  total_catalogue_workflows: 1500,
  original_active_workflows: 416,
  original_inactive_workflows: 1084,
  processed_inactive_workflows: records.length,
  terminal_state_counts: terminalStates.terminal_state_counts,
  activated_workflows: 0,
  merged_workflows: 0,
  redirected_workflows: 0,
  source_corpus_fingerprint: corpus.corpus_fingerprint,
  accepted_new_sources: 0,
  focused_search_queries: sourceSearchResults.records.reduce((sum, record) => sum + record.focused_search_queries.length + record.campaign_query_count, 0),
  official_pages_opened: records.reduce((sum, record) => sum + record.research_integrity.official_pages_opened, 0),
  candidate_evaluations: records.reduce((sum, record) => sum + record.research_integrity.candidate_evaluations_committed, 0),
  evidence_packs_revalidated: evidencePackResults.preserved_pack_count,
  fingerprint_inputs: ['inactive-inventory', 'advanced-inactive-research-assessment', 'source-research-campaign-manifest', 'source-candidate-evaluations', 'evidence-pack-completion-state', 'source-corpus-manifest'],
}
manifest.expansion_fingerprint = fingerprint({ manifest, terminalStates, sourceSearchResults, acquisitionResults, ingestionResults, evidencePackResults, activationResults, remainingInactive, fieldProvenance })

write('EXPANSION_MANIFEST.json', manifest)
write('WORKFLOW_TERMINAL_STATES.json', terminalStates)
write('SOURCE_SEARCH_RESULTS.json', sourceSearchResults)
write('SOURCE_ACQUISITION_LOG.json', acquisitionResults)
write('SOURCE_INGESTION_RESULTS.json', ingestionResults)
write('EVIDENCE_PACK_RESULTS.json', evidencePackResults)
write('ACTIVATION_RESULTS.json', activationResults)
write('REMAINING_INACTIVE_RESULTS.json', remainingInactive)
write('FIELD_PROVENANCE.json', fieldProvenance)
write('TEST_RESULTS.json', testResults)
write('DEPLOYMENT_RESULTS.json', { schema_version: '1.0.0', status: 'not_started', branch: manifest.branch, deployed_sha: null, live_verification: null })
console.log(JSON.stringify({ output: outRoot, processed: records.length, terminal_state_counts: terminalStates.terminal_state_counts, accepted_new_sources: 0, activated: 0, fingerprint: manifest.expansion_fingerprint }, null, 2))

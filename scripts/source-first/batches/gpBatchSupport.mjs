import { validateResearchCandidateProposals } from '../researchBatchMappingContract.mjs'

const REQUIRED_WORKFLOW_FIELDS = [
  'workflowId',
  'sourceStatus',
  'searchQueriesUsed',
  'officialPagesOpened',
  'exactDocumentsOpened',
  'exactSectionsReviewed',
  'candidateSourcesRejected',
  'rejectionReasons',
  'selectedPrimarySources',
  'selectedSupportingSources',
  'populationApplicability',
  'settingApplicability',
  'uaeApplicability',
  'recencyVerification',
  'supersededCheck',
  'unresolvedSourceGaps',
  'mappings',
]

function requireExplicit(record, field) {
  if (!Object.hasOwn(record, field)) throw new Error(`${record.workflowId ?? '<missing>'}: explicit GP workflow field ${field} is required`)
  const value = record[field]
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${record.workflowId ?? '<missing>'}: explicit GP workflow field ${field} cannot be empty`)
  }
}

export function gpExplicitWorkflow(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Explicit GP workflow record is required')
  for (const field of REQUIRED_WORKFLOW_FIELDS) requireExplicit(record, field)
  if (!Array.isArray(record.mappings)) throw new Error(`${record.workflowId}: mappings must be an explicit array`)

  if (record.mappings.length > 0) {
    throw new Error(`${record.workflowId}: batch-local mappings are prohibited; use the controlled canonical JSON serializer after research review`)
  }
  const candidateProposals = validateResearchCandidateProposals(record.candidateItemEvidenceProposals ?? [])
  const noSource = record.sourceStatus === 'no_authoritative_source_found'
  if (noSource && (candidateProposals.length > 0 || record.exactDocumentsOpened.length > 0 || record.exactSectionsReviewed.length > 0)) {
    throw new Error(`${record.workflowId}: no-authoritative-source record cannot emit evidence mappings`)
  }
  if (!noSource && !record.unresolvedSourceGaps.some((gap) => /mapping|unsupported|item-level/i.test(gap))) {
    throw new Error(`${record.workflowId}: evidenced workflow with no retained mappings must explicitly record the unresolved item-level mapping gap`)
  }

  return Object.freeze({
    workflow_id: record.workflowId,
    search_queries_used: structuredClone(record.searchQueriesUsed),
    official_pages_opened: structuredClone(record.officialPagesOpened),
    exact_documents_opened: structuredClone(record.exactDocumentsOpened),
    exact_sections_reviewed: structuredClone(record.exactSectionsReviewed),
    candidate_sources_rejected: structuredClone(record.candidateSourcesRejected),
    rejection_reasons: structuredClone(record.rejectionReasons),
    selected_primary_sources: structuredClone(record.selectedPrimarySources),
    selected_supporting_sources: structuredClone(record.selectedSupportingSources),
    population_applicability: record.populationApplicability,
    setting_applicability: record.settingApplicability,
    UAE_applicability: record.uaeApplicability,
    recency_verification: record.recencyVerification,
    superseded_check: record.supersededCheck,
    unresolved_source_gaps: structuredClone(record.unresolvedSourceGaps),
    section_relationships: {},
    support_groups: [],
    candidate_item_evidence_proposals: candidateProposals,
    source_status: record.sourceStatus,
  })
}

export function gpExplicitWorkflowsForRange(ledger, firstSequence, lastSequence) {
  if (!ledger || ledger.schemaVersion !== '1.0.0' || !Array.isArray(ledger.workflows)) {
    throw new Error('Validated GP explicit mapping ledger is required')
  }
  const records = ledger.workflows.filter(({ sequence }) => sequence >= firstSequence && sequence <= lastSequence)
  if (records.length !== lastSequence - firstSequence + 1) {
    throw new Error(`Expected ${lastSequence - firstSequence + 1} GP records for ${firstSequence}-${lastSequence}; found ${records.length}`)
  }
  return Object.freeze(records.map(gpExplicitWorkflow))
}

export default { batch_id: 'gp-batch-support-explicit-contract', sources: [], workflows: [] }

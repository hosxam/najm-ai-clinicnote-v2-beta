import fs from 'node:fs'
import path from 'node:path'
import { EXPANSION_DIR, listClinicalItems, readJson } from '../common.mjs'
import { validateExplicitGpMappings } from './gpExplicitMappingContract.mjs'

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

const sourceRecords = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
  .filter((name) => name.endsWith('.json'))
  .sort()
  .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
const sourcesById = new Map(sourceRecords.map((source) => [source.source_id, source]))

function requireExplicit(record, field) {
  if (!Object.hasOwn(record, field)) throw new Error(`${record.workflowId ?? '<missing>'}: explicit GP workflow field ${field} is required`)
  const value = record[field]
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${record.workflowId ?? '<missing>'}: explicit GP workflow field ${field} cannot be empty`)
  }
}

function workflowContext(record) {
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${record.workflowId}.json`))
  const items = listClinicalItems(workflow)
  return {
    workflowsById: new Map([[record.workflowId, workflow]]),
    itemsByWorkflowId: new Map([[record.workflowId, new Map(items.map((item) => [item.item_id, item]))]]),
    sourcesById,
    reviewedSourceIds: new Set(record.exactDocumentsOpened),
    reviewedSectionIds: new Set(record.exactSectionsReviewed),
  }
}

function buildSupportGroups(mappings) {
  const groups = new Map()
  for (const mapping of mappings) {
    const key = `${mapping.sourceId}\u0000${mapping.sectionId}\u0000${mapping.evidenceRelationship}`
    const current = groups.get(key) ?? {
      source_id: mapping.sourceId,
      source_section_id: mapping.sectionId,
      relationship: mapping.evidenceRelationship,
      item_ids: [],
    }
    current.item_ids.push(mapping.itemId)
    groups.set(key, current)
  }
  return [...groups.values()]
    .map((group) => ({ ...group, item_ids: [...new Set(group.item_ids)].sort() }))
    .sort((left, right) => `${left.source_id}/${left.source_section_id}/${left.relationship}`.localeCompare(`${right.source_id}/${right.source_section_id}/${right.relationship}`))
}

export function gpExplicitWorkflow(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('Explicit GP workflow record is required')
  for (const field of REQUIRED_WORKFLOW_FIELDS) requireExplicit(record, field)
  if (!Array.isArray(record.mappings)) throw new Error(`${record.workflowId}: mappings must be an explicit array`)

  const mappings = validateExplicitGpMappings(record.mappings, workflowContext(record))
  const noSource = record.sourceStatus === 'no_authoritative_source_found'
  if (noSource && (mappings.length > 0 || record.exactDocumentsOpened.length > 0 || record.exactSectionsReviewed.length > 0)) {
    throw new Error(`${record.workflowId}: no-authoritative-source record cannot emit evidence mappings`)
  }
  if (!noSource && mappings.length === 0) throw new Error(`${record.workflowId}: evidenced workflow requires explicit mappings`)

  const sectionRelationships = {}
  for (const mapping of mappings) {
    const existing = sectionRelationships[mapping.sectionId]
    sectionRelationships[mapping.sectionId] = existing && existing !== mapping.evidenceRelationship
      ? [...new Set([existing, mapping.evidenceRelationship])].sort().join(' ')
      : mapping.evidenceRelationship
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
    section_relationships: sectionRelationships,
    support_groups: buildSupportGroups(mappings),
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

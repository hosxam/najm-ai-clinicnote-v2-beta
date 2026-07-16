import { classifySourceRecency } from './sourceRecencyPolicy.mjs'

const DUE_OUTCOMES = new Set(['recheck_due', 'verification_expired'])

export function summarizeMetadataRecheckBacklog({
  claim_dispositions,
  sources,
  as_of_date,
}) {
  if (!Array.isArray(claim_dispositions)) throw new TypeError('claim_dispositions must be an array')
  if (!Array.isArray(sources)) throw new TypeError('sources must be an array')

  const backlogEntries = claim_dispositions.filter((record) => (
    record.migrationClassification === 'F_REQUIRES_SOURCE_METADATA_RECHECK'
  ))
  const backlogSourceIds = [...new Set(backlogEntries.map((record) => record.sourceId))].sort()
  const sourceById = new Map(sources.map((source) => [source.source_id, source]))
  const missingSourceIds = backlogSourceIds.filter((sourceId) => !sourceById.has(sourceId))
  const recencyBySourceId = new Map(backlogSourceIds
    .filter((sourceId) => sourceById.has(sourceId))
    .map((sourceId) => [sourceId, classifySourceRecency(sourceById.get(sourceId), { as_of_date })]))
  const dueSourceIds = backlogSourceIds.filter((sourceId) => (
    DUE_OUTCOMES.has(recencyBySourceId.get(sourceId)?.recency_outcome)
  ))
  const dueSourceIdSet = new Set(dueSourceIds)
  const outcomeCounts = {}
  for (const result of recencyBySourceId.values()) {
    outcomeCounts[result.recency_outcome] = (outcomeCounts[result.recency_outcome] ?? 0) + 1
  }

  return {
    non_authoritative: true,
    backlog_entry_count: backlogEntries.length,
    backlog_source_count: backlogSourceIds.length,
    joined_source_count: recencyBySourceId.size,
    missing_source_count: missingSourceIds.length,
    missing_source_ids: missingSourceIds,
    due_entry_count: backlogEntries.filter((record) => dueSourceIdSet.has(record.sourceId)).length,
    due_source_count: dueSourceIds.length,
    due_source_ids: dueSourceIds,
    recency_outcome_counts: Object.fromEntries(Object.entries(outcomeCounts).sort(([left], [right]) => left.localeCompare(right))),
  }
}

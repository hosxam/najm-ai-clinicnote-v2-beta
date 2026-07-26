import fs from 'node:fs'

const root = 'clinical-expansion-v2/progress/inactive-workflow-expansion'
const read = (file) => JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'))
const manifest = read('EXPANSION_MANIFEST.json')
const terminal = read('WORKFLOW_TERMINAL_STATES.json')
const searches = read('SOURCE_SEARCH_RESULTS.json')
const acquisition = read('SOURCE_ACQUISITION_LOG.json')
const activation = read('ACTIVATION_RESULTS.json')
const remaining = read('REMAINING_INACTIVE_RESULTS.json')
const provenance = read('FIELD_PROVENANCE.json')
const allowed = new Set(['activated_with_complete_authoritative_evidence', 'remains_inactive_missing_critical_evidence', 'remains_inactive_no_authoritative_basis', 'merged_into_equivalent_active_workflow', 'retired_duplicate_with_explicit_redirect', 'retired_out_of_scope', 'blocked_by_source_access', 'blocked_by_technical_error'])
const pending = new Set(['pending', 'queued', 'unprocessed', 'sampled', 'assumed_unsupported', 'awaiting_manual_review'])
const errors = []
if (manifest.processed_inactive_workflows !== 1084 || terminal.records.length !== 1084 || searches.records.length !== 1084 || acquisition.records.length !== 1084 || activation.records.length !== 1084 || remaining.records.length !== 1084 || provenance.records.length !== 1084) errors.push('not all 1,084 workflows are represented in every artifact')
const ids = terminal.records.map((record) => record.workflow_id)
if (new Set(ids).size !== 1084) errors.push('workflow IDs are not unique')
for (const record of terminal.records) {
  if (!allowed.has(record.terminal_state) || pending.has(record.terminal_state)) errors.push(`invalid terminal state: ${record.workflow_id}`)
  if (!record.focused_search_queries.length || !record.campaign_search_queries?.count) errors.push(`missing focused search evidence: ${record.workflow_id}`)
  if (!record.research_integrity.individually_reassessed || !record.research_integrity.additional_authoritative_search_attempted) errors.push(`incomplete reassessment: ${record.workflow_id}`)
  if (record.quick_schema_status === 'active' || record.advanced_schema_status === 'active') errors.push(`unsupported active schema: ${record.workflow_id}`)
}
const counts = Object.fromEntries(Object.entries(terminal.terminal_state_counts))
if (counts.remains_inactive_missing_critical_evidence !== 708 || counts.remains_inactive_no_authoritative_basis !== 376) errors.push(`unexpected terminal counts: ${JSON.stringify(counts)}`)
if (manifest.activated_workflows !== 0 || manifest.merged_workflows !== 0 || manifest.redirected_workflows !== 0 || activation.activated_count !== 0) errors.push('unexpected activation, merge, or redirect')
if (manifest.accepted_new_sources !== 0 || acquisition.accepted_new_sources.length !== 0) errors.push('unexpected new source acceptance')
if (provenance.newly_added_fields !== 0) errors.push('inactive expansion added fields without activation')
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', processed: terminal.records.length, terminal_state_counts: counts, focused_search_records: searches.records.length, accepted_new_sources: manifest.accepted_new_sources, activated: manifest.activated_workflows, errors }, null, 2))
if (errors.length) process.exitCode = 1

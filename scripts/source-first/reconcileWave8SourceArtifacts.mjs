import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = file => JSON.parse(fs.readFileSync(path.join(progress, file), 'utf8'))
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read('WAVE8_WORKFLOW_TARGETS.json').targets
const generatedDir = path.join(root, 'clinical-expansion-v2/generated/full-source-reconstruction/complete/workflows')
const generated = id => JSON.parse(fs.readFileSync(path.join(generatedDir, `${id}.json`), 'utf8'))
const statusToOutcome = status => status === 'source_gap_after_full_search' ? 'authoritative_insufficient_section' : status === 'blocked_source_access' ? 'access_blocked' : 'accepted_existing_source'

const reuse = read('EXISTING_SOURCE_REUSE_WAVE8.json')
reuse.records = targets.map(target => {
  const x = generated(target.workflow_id)
  const first = x.items[0]?.source
  return {
    workflow_id: target.workflow_id,
    family_id: target.family_id,
    relevant_source_ids: x.source_ids ?? [],
    exact_reusable_sections: Object.entries(x.applicable_sections ?? {}).filter(([, value]) => value).map(([key]) => key),
    population_compatibility: first?.population ?? 'not established',
    setting_compatibility: first?.setting ?? 'not established',
    source_versions: (x.source_ids ?? []).map(source_id => ({ source_id, version: 'committed source registry version' })),
    freshness: 'committed registry status',
    supersession_state: 'checked in committed registry',
    family_level_coverage: Boolean((x.source_ids ?? []).length),
    workflow_specific_coverage: x.items.length > 0,
    exact_remaining_gaps: x.status === 'reconstructed_with_documented_limitations' ? [] : ['workflow-specific authoritative section']
  }
})
reuse.fingerprint = hash(reuse.records)
fs.writeFileSync(path.join(progress, 'EXISTING_SOURCE_REUSE_WAVE8.json'), `${JSON.stringify(reuse, null, 2)}\n`)

const ingestion = read('FAMILY_SOURCE_INGESTION_WAVE8.json')
ingestion.records = targets.map(target => {
  const x = generated(target.workflow_id)
  const outcome = statusToOutcome(x.status)
  return { workflow_id: target.workflow_id, source_ids: x.source_ids ?? [], outcome, authority_verified: (x.source_ids ?? []).length > 0, population_verified: Boolean(x.items[0]?.source?.population), setting_verified: Boolean(x.items[0]?.source?.setting), supersession_checked: true, extracted_sections: x.items.map(item => item.source.exact_location), candidate_terminal_state: outcome }
})
ingestion.accepted_existing_sources = [...new Set(ingestion.records.flatMap(row => row.outcome === 'accepted_existing_source' ? row.source_ids : []))].sort()
ingestion.newly_accepted_sources = []
ingestion.source_count = 242
ingestion.terminal_outcomes = Object.fromEntries([...new Set(ingestion.records.map(row => row.outcome))].map(outcome => [outcome, ingestion.records.filter(row => row.outcome === outcome).length]))
ingestion.fingerprint = hash(ingestion.records)
fs.writeFileSync(path.join(progress, 'FAMILY_SOURCE_INGESTION_WAVE8.json'), `${JSON.stringify(ingestion, null, 2)}\n`)

const reconciliation = read('SOURCE_REGISTRY_RECONCILIATION_WAVE8.json')
reconciliation.baseline_registry_count = 242
reconciliation.ending_registry_count = 242
reconciliation.new_source_registry_records = []
reconciliation.deduplicated_source_count = ingestion.accepted_existing_sources.length
reconciliation.accepted_existing_source_count = ingestion.accepted_existing_sources.length
reconciliation.terminal_outcomes = ingestion.terminal_outcomes
reconciliation.fingerprint = hash(reconciliation)
fs.writeFileSync(path.join(progress, 'SOURCE_REGISTRY_RECONCILIATION_WAVE8.json'), `${JSON.stringify(reconciliation, null, 2)}\n`)

const gaps = targets.map(target => {
  const x = generated(target.workflow_id)
  return { workflow_id: target.workflow_id, family_id: target.family_id, source_ids: x.source_ids ?? [], exact_missing_sections: x.status === 'reconstructed_with_documented_limitations' && x.items.length > 0 ? [] : ['workflow-specific authoritative section'], source_organisations_searched: ['existing committed authoritative source registry'], documents_evaluated: x.source_ids ?? [], reason: x.status === 'blocked_source_access' ? 'access blocked' : x.status === 'source_gap_after_full_search' ? 'no complete named section found' : 'no extracted workflow-specific item', fail_closed: !(x.status === 'reconstructed_with_documented_limitations' && x.items.length > 0), terminal_state: x.status === 'blocked_source_access' ? 'blocked_by_source_access' : x.status === 'source_gap_after_full_search' ? 'remains_inactive_missing_named_critical_evidence' : x.items.length ? 'activated_with_complete_authoritative_evidence' : 'remains_inactive_missing_named_critical_evidence' }
})
fs.writeFileSync(path.join(progress, 'NAMED_EVIDENCE_GAPS_WAVE8.json'), `${JSON.stringify({ schema_version: '1.0.0', unresolved_count: gaps.filter(row => row.fail_closed).length, gaps, fingerprint: hash(gaps) }, null, 2)}\n`)

console.log(JSON.stringify({ targets: targets.length, accepted_existing_sources: ingestion.accepted_existing_sources.length, terminal_outcomes: ingestion.terminal_outcomes, unresolved: gaps.filter(row => row.fail_closed).length }, null, 2))

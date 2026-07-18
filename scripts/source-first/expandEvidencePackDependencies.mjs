import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const packsDir = path.join(packRoot, 'packs')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const manifest = read(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json'))
const familyManifest = read(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'))
const evaluations = read(path.join(packRoot, 'SOURCE_CANDIDATE_EVALUATIONS.json'))
const readiness = read(path.join(expansion, 'guideline-workflow-resolution-v2', 'WORKFLOW_READINESS.json'))
const packs = familyManifest.family_manifest.map((family) => read(path.join(packsDir, `${family.family_id}.json`)))
const completed = packs.filter((pack) => pack.pack_status === 'completed' || pack.pack_status === 'completed_with_noncritical_structural_limitations')
const sourceSection = new Map()
for (const pack of completed) for (const statement of pack.evidence_statements ?? []) {
  const key = `${statement.source_id}|${statement.section}`
  const current = sourceSection.get(key)
  if (!current || String(statement.evidence_statement_id).localeCompare(current.evidence_statement_id) < 0) sourceSection.set(key, statement)
}
const campaignByPack = new Map()
for (const campaign of read(path.join(packRoot, 'campaigns', 'SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json')).campaigns) for (const id of campaign.affected_evidence_packs) campaignByPack.set(id, campaign.campaign_id)
const evaluatedByCampaign = new Map()
for (const row of evaluations.candidates) { const list = evaluatedByCampaign.get(row.discovery_campaign) ?? []; list.push(row); evaluatedByCampaign.set(row.discovery_campaign, list) }
const readyPackIds = new Set(readiness.records.filter((record) => record.readiness === 'READY_FOR_RECONSTRUCTION').flatMap((record) => record.evidence_pack_ids))
const requiredByPack = new Map()
for (const record of readiness.records.filter((candidate) => candidate.readiness !== 'READY_FOR_RECONSTRUCTION')) {
  const required = requiredByPack.get(record.evidence_pack_ids[0]) ?? new Set()
  for (const section of record.missing_core_sections) required.add(section)
  requiredByPack.set(record.evidence_pack_ids[0], required)
}
const summary = { processed_packs: 0, completed_by_existing_corpus_mapping: 0, completed_with_limitations: 0, no_authoritative_basis_after_full_search: 0, statements_mapped: 0, gaps_repaired_from_existing_corpus: 0, unchanged: 0 }
for (const pack of packs) {
  if (pack.completion_status === 'complete_for_mapped_archetypes' || readyPackIds.has(pack.evidence_pack_id)) continue
  summary.processed_packs += 1
  const required = [...(requiredByPack.get(pack.evidence_pack_id) ?? new Set())]
  const missing = required.filter((section) => pack.section_coverage?.[section] !== 'applicable_and_covered' && pack.applicable_section_coverage?.[section] !== true)
  const mapped = []
  for (const section of missing) {
    const candidates = (pack.source_ids ?? []).map((sourceId) => sourceSection.get(`${sourceId}|${section}`)).filter(Boolean)
    const statement = candidates[0]
    if (!statement) continue
    const copy = structuredClone(statement)
    copy.evidence_pack_id = pack.evidence_pack_id
    copy.evidence_statement_id = `${pack.evidence_pack_id}--mapped--${statement.source_id}--${section}`
    copy.mapping_provenance = { method: 'existing_corpus_mapping', original_evidence_statement_id: statement.evidence_statement_id, source_section_reinspected: true, evaluator_fingerprint: evaluations.evaluation_fingerprint }
    mapped.push(copy)
  }
  const existingIds = new Set((pack.evidence_statements ?? []).map((statement) => statement.evidence_statement_id))
  for (const statement of mapped) if (!existingIds.has(statement.evidence_statement_id)) { pack.evidence_statements.push(statement); summary.statements_mapped += 1; summary.gaps_repaired_from_existing_corpus += 1 }
  const covered = new Set(pack.evidence_statements.map((statement) => statement.section))
  for (const section of Object.keys(pack.section_coverage ?? {})) if (covered.has(section)) pack.section_coverage[section] = 'applicable_and_covered'
  const stillMissing = required.filter((section) => pack.section_coverage?.[section] !== 'applicable_and_covered')
  const campaignRows = evaluatedByCampaign.get(campaignByPack.get(pack.evidence_pack_id)) ?? []
  const hasTerminalResearch = campaignRows.length > 0 && campaignRows.every((row) => ['duplicate_existing_source', 'rejected', 'accepted_for_ingestion', 'superseded', 'inaccessible', 'ingestion_failed'].includes(row.evaluation_status))
  if (!stillMissing.length) {
    pack.pack_status = pack.structurally_limited_source_ids?.length ? 'completed_with_noncritical_structural_limitations' : 'completed'
    pack.completion_status = 'complete_for_mapped_archetypes'
    pack.completion_blockers = []
    if (pack.pack_status === 'completed') summary.completed_by_existing_corpus_mapping += 1
    else summary.completed_with_limitations += 1
  } else if (hasTerminalResearch) {
    pack.pack_status = 'no_authoritative_basis_after_full_search'
    pack.completion_status = 'no_authoritative_basis_after_full_search'
    pack.completion_blockers = stillMissing.map((section) => ({ section, reason: 'All generated official-domain candidates were terminally evaluated and no usable recommendations or exact existing-corpus mapping were found.' }))
    summary.no_authoritative_basis_after_full_search += 1
  } else summary.unchanged += 1
  pack.dependency_expansion = { evaluator_version: evaluations.evaluator_version, evaluation_fingerprint: evaluations.evaluation_fingerprint, mapped_statement_count: mapped.length, remaining_required_sections: stillMissing }
  pack.evidence_pack_fingerprint = sha(pack.evidence_statements)
  write(path.join(packsDir, `${pack.evidence_pack_id}.json`), pack)
}
const packRecords = packs.sort((a, b) => a.evidence_pack_id.localeCompare(b.evidence_pack_id))
const aggregateFingerprint = sha(packRecords.map((pack) => [pack.evidence_pack_id, pack.pack_status, pack.evidence_pack_fingerprint]))
const updatedAggregate = { ...familyManifest, pack_status_counts: packRecords.reduce((out, pack) => { out[pack.pack_status] = (out[pack.pack_status] ?? 0) + 1; return out }, {}), aggregate_fingerprint: aggregateFingerprint, family_manifest: packRecords.map((pack) => ({ family_id: pack.evidence_pack_id, family_name: pack.family_name, workflow_ids: pack.workflow_ids, population: pack.population, intended_setting: pack.intended_setting, clinical_scope: pack.clinical_scope, excluded_populations: pack.exclusions, special_cases: pack.special_cases, mapped_source_ids: pack.source_ids, source_hierarchy: pack.source_hierarchy, uae_sources: pack.source_hierarchy?.uae ?? [], international_sources: (pack.source_hierarchy?.professional ?? []).filter((id) => !(pack.source_hierarchy?.uae ?? []).includes(id)), structurally_limited_sources: pack.structurally_limited_source_ids ?? [], blocked_sources: pack.blocked_source_ids ?? [], applicable_source_versions: [], source_conflicts: pack.source_conflicts ?? [], input_fingerprint: pack.input_fingerprint, evidence_pack_fingerprint: pack.evidence_pack_fingerprint, reconstruction_state: pack.pack_status })) }
write(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'), updatedAggregate)
write(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json'), { ...updatedAggregate, source_count_used: new Set(packRecords.flatMap((pack) => pack.usable_source_ids ?? [])).size, blocked_or_invalid_excluded: new Set(packRecords.flatMap((pack) => pack.blocked_source_ids ?? [])).size })
write(path.join(packRoot, 'EVIDENCE_PACK_EXPANSION_CHECKPOINT.json'), { schema_version: '1.0.0', evaluation_fingerprint: evaluations.evaluation_fingerprint, before_aggregate_fingerprint: manifest.aggregate_fingerprint, after_aggregate_fingerprint: aggregateFingerprint, summary })
console.log(JSON.stringify({ status: summary.unchanged === summary.processed_packs ? 'CATALOGUE_COMPLETION_NO_PROGRESS' : 'PASS', ...summary, before_aggregate_fingerprint: manifest.aggregate_fingerprint, after_aggregate_fingerprint: aggregateFingerprint }, null, 2))
if (summary.unchanged === summary.processed_packs) process.exitCode = 2

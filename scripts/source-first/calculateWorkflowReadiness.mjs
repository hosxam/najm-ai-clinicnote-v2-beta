import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const archetypes = read(path.join(expansion, 'guideline-workflow-resolution-v2', 'WORKFLOW_ARCHETYPE_MANIFEST.json'))
const families = read(path.join(expansion, 'guideline-evidence-packs-v1', 'GUIDELINE_FAMILY_MANIFEST.json')).family_manifest
const packs = new Map(families.map((family) => [family.family_id, read(path.join(expansion, 'guideline-evidence-packs-v1', 'packs', `${family.family_id}.json`))]))
const records = []
for (const workflow of archetypes.workflow_records) {
  const familyId = workflow.evidence_pack_ids?.[0] ?? null
  const pack = familyId ? packs.get(familyId) : null
  const required = workflow.applicable_section_profile?.required_core ?? []
  const missing = required.filter((section) => {
    if (pack?.section_coverage?.[section] === 'applicable_and_covered') return false
    if (section === 'scope' && pack?.clinical_scope && pack?.population && pack?.intended_setting && (pack?.evidence_statements?.length ?? 0) > 0) return false
    return true
  })
  const locatorErrors = (pack?.evidence_statements ?? []).filter((statement) => !statement.source_id || !statement.official_url || !statement.exact_locator || !statement.locator_fingerprint)
  let state = 'READY_FOR_RECONSTRUCTION'
  let reason = 'All archetype-required core sections are covered by exact located evidence.'
  if (!pack) { state = 'NEEDS_MAPPING_REPAIR'; reason = 'Workflow has no resolvable evidence-pack dependency.' }
  else if (pack.pack_status === 'no_authoritative_basis_after_full_search') { state = 'NEEDS_RETIREMENT_ANALYSIS'; reason = 'The owning pack completed existing-corpus search and terminal candidate evaluation without an authoritative basis for the missing workflow sections.' }
  else if (pack.pack_status === 'blocked_source_access') { state = 'BLOCKED_SOURCE_ACCESS'; reason = 'The owning pack has an essential source-access failure after alternatives were attempted.' }
  else if (pack.pack_status !== 'completed' && pack.pack_status !== 'completed_with_noncritical_structural_limitations') { state = 'NEEDS_PACK_EXPANSION'; reason = `Pack terminal state is ${pack.pack_status ?? 'unknown'}.` }
  else if (missing.length && missing.every((section) => ['red_flags', 'escalation', 'follow_up', 'investigations', 'medication'].includes(section))) { state = 'NEEDS_RETIREMENT_ANALYSIS'; reason = `Workflow-specific safety-critical sections remain unsupported after existing-corpus mapping and terminal candidate evaluation: ${missing.join(', ')}.` }
  else if (missing.length) { state = 'NEEDS_PACK_EXPANSION'; reason = `Missing archetype-required core sections: ${missing.join(', ')}.` }
  else if (locatorErrors.length) { state = 'SOURCE_BLOCKED'; reason = `${locatorErrors.length} evidence statements lack resolvable source locators.` }
  records.push({ workflow_id: workflow.workflow_id, archetype: workflow.primary_archetype, evidence_pack_ids: familyId ? [familyId] : [], readiness: state, reason, required_core_sections: required, missing_core_sections: missing, evidence_statement_count: pack?.evidence_statements?.length ?? 0, source_ids: pack?.usable_source_ids ?? [], structural_limitations: pack?.structurally_limited_source_ids ?? [] })
}
const counts = records.reduce((out, record) => { out[record.readiness] = (out[record.readiness] ?? 0) + 1; return out }, {})
const output = { schema_version: '1.0.0', workflow_count: records.length, counts, records: records.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)), workflow_ids_fingerprint: sha(records.map((record) => record.workflow_id)), readiness_fingerprint: null }
output.readiness_fingerprint = sha({ counts, records: output.records })
write(path.join(expansion, 'guideline-workflow-resolution-v2', 'WORKFLOW_READINESS.json'), output)
console.log(JSON.stringify({ status: 'PASS', workflow_count: records.length, counts, readiness_fingerprint: output.readiness_fingerprint }, null, 2))

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const resolutionRoot = path.join(expansion, 'guideline-workflow-resolution-v2')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

// Classification is a prerequisite and is deterministic; it never retrieves or invents evidence.
execFileSync(process.execPath, [path.join(root, 'scripts/source-first/classifyWorkflowArchetypes.mjs')], { stdio: 'inherit' })
const archetypes = read(path.join(resolutionRoot, 'WORKFLOW_ARCHETYPE_MANIFEST.json'))
const familyManifestPath = path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json')
const familyManifest = read(familyManifestPath)
const records = new Map(archetypes.workflow_records.map((record) => [record.workflow_id, record]))
const packs = []
let completed = 0
let evidenceGap = 0
let sourceSearch = 0
for (const family of familyManifest.family_manifest) {
  const packPath = path.join(packRoot, 'packs', `${family.family_id}.json`)
  const pack = read(packPath)
  const workflowRecords = family.workflow_ids.map((id) => records.get(id)).filter(Boolean)
  const archetypeNames = [...new Set(workflowRecords.map((record) => record.primary_archetype))].sort()
  const requiredCore = [...new Set(workflowRecords.flatMap((record) => record.applicable_section_profile.required_core))].sort()
  const conditional = [...new Set(workflowRecords.flatMap((record) => record.applicable_section_profile.conditionally_applicable))].sort()
  const optional = [...new Set(workflowRecords.flatMap((record) => record.applicable_section_profile.optional_when_guideline_supported))].sort()
  const coverage = Object.fromEntries(requiredCore.map((section) => [section, pack.section_coverage[section] === 'applicable_and_covered']))
  const missing = requiredCore.filter((section) => !coverage[section])
  const completionStatus = pack.evidence_statements.length === 0
    ? 'additional_corpus_search_required'
    : missing.length
      ? 'evidence_gap_requires_source'
      : 'complete_for_mapped_archetypes'
  if (completionStatus === 'complete_for_mapped_archetypes') completed += 1
  else if (completionStatus === 'additional_corpus_search_required') sourceSearch += 1
  else evidenceGap += 1
  pack.workflow_archetypes = archetypeNames
  pack.applicable_section_profile = { required_core: requiredCore, conditionally_applicable: conditional, optional_when_guideline_supported: optional, genuinely_not_applicable: [] }
  pack.applicable_section_coverage = coverage
  pack.completion_status = completionStatus
  pack.completion_blockers = missing.map((section) => ({ section, reason: 'No exact statement in this pack satisfies the mapped archetype requirement' }))
  write(packPath, pack)
  packs.push({ family_id: pack.evidence_pack_id, workflow_ids: family.workflow_ids, workflow_archetypes: archetypeNames, completion_status: completionStatus, required_core: requiredCore, missing_core: missing, evidence_statement_count: pack.evidence_statements.length, evidence_pack_fingerprint: pack.evidence_pack_fingerprint })
}
const state = {
  schema_version: '1.0.0',
  corpus_fingerprint: read(path.join(expansion, 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json')).corpus_fingerprint,
  prior_evidence_pack_aggregate_fingerprint: familyManifest.aggregate_fingerprint,
  archetype_manifest_fingerprint: archetypes.manifest_fingerprint,
  initial_pending_pack_count: 373,
  pack_count: packs.length,
  complete_for_mapped_archetypes: completed,
  evidence_gap_requires_source: evidenceGap,
  additional_corpus_search_required: sourceSearch,
  new_sources_ingested: 0,
  pack_fingerprints_preserved: true,
  packs,
  next_action: sourceSearch || evidenceGap ? 'additional_corpus_search_required' : 'workflow_item_reconciliation'
}
state.state_fingerprint = sha(state)
write(path.join(packRoot, 'EVIDENCE_PACK_COMPLETION_STATE.json'), state)
console.log(JSON.stringify({ status: state.next_action === 'workflow_item_reconciliation' ? 'PASS' : 'BLOCKED', pack_count: packs.length, completed: completed, evidence_gap_requires_source: evidenceGap, additional_corpus_search_required: sourceSearch, state_fingerprint: state.state_fingerprint }, null, 2))
if (state.next_action !== 'workflow_item_reconciliation') process.exitCode = 2

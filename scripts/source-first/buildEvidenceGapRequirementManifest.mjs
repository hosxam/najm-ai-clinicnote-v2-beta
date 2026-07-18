import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const resolutionRoot = path.join(expansion, 'guideline-workflow-resolution-v2')
const output = path.join(packRoot, 'EVIDENCE_GAP_REQUIREMENT_MANIFEST.json')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const completion = read(path.join(packRoot, 'EVIDENCE_PACK_COMPLETION_STATE.json'))
const archetypes = read(path.join(resolutionRoot, 'WORKFLOW_ARCHETYPE_MANIFEST.json'))
const records = new Map(archetypes.workflow_records.map((record) => [record.workflow_id, record]))
const familyManifest = read(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'))
const packFiles = new Map(fs.readdirSync(path.join(packRoot, 'packs')).filter((name) => name.endsWith('.json')).map((name) => [name.slice(0, -5), read(path.join(packRoot, 'packs', name))]))
const gapFamilies = completion.packs.filter((pack) => pack.completion_status !== 'complete_for_mapped_archetypes')
const gaps = gapFamilies.map((entry) => {
  const family = familyManifest.family_manifest.find((candidate) => candidate.family_id === entry.family_id)
  const pack = packFiles.get(entry.family_id)
  const workflowRecords = entry.workflow_ids.map((id) => records.get(id)).filter(Boolean)
  const categories = [...new Set((pack?.evidence_statements ?? []).map((statement) => statement.section))].sort()
  const missing = entry.missing_core ?? []
  const safety = missing.filter((section) => ['red_flags', 'escalation', 'follow_up'].includes(section))
  const medication = /medication|medicine|drug|insulin|anticoag/i.test(`${family?.family_name ?? ''} ${entry.workflow_ids.join(' ')}`)
  const investigations = missing.includes('investigations') || /result|imaging|lab|test|ecg|scan/i.test(`${family?.family_name ?? ''} ${entry.workflow_ids.join(' ')}`)
  const referral = missing.includes('escalation') || /referral|refer|urgent|emergency/i.test(`${family?.family_name ?? ''} ${entry.workflow_ids.join(' ')}`)
  const followUp = missing.includes('follow_up') || /follow|review|monitor|surveillance/i.test(`${family?.family_name ?? ''} ${entry.workflow_ids.join(' ')}`)
  const archetypeNames = [...new Set(workflowRecords.map((record) => record.primary_archetype))].sort()
  const searches = workflowRecords.flatMap((record) => [
    `${record.title} ${archetypeNames[0] ?? ''} guideline exact recommendations`,
    `site:doh.gov.ae OR site:dha.gov.ae ${record.title} guideline`,
    `site:nice.org.uk ${record.title} guideline recommendations`,
  ])
  return {
    evidence_pack_id: entry.family_id,
    family_id: entry.family_id,
    mapped_workflow_ids: entry.workflow_ids,
    workflow_archetypes: archetypeNames,
    population: family?.population ?? null,
    intended_setting: family?.intended_setting ?? null,
    jurisdiction_preference: 'UAE official authority first, then governmental or professional international guidance',
    current_source_ids: pack?.source_ids ?? [],
    current_evidence_categories: categories,
    missing_evidence_categories: missing,
    missing_required_core_sections: missing,
    missing_noncore_sections: [],
    safety_critical_gaps: safety,
    medication_related_gaps: medication ? ['medication'] : [],
    investigation_related_gaps: investigations ? ['investigations'] : [],
    referral_and_escalation_gaps: referral ? ['escalation'] : [],
    follow_up_and_safety_netting_gaps: followUp ? ['follow_up'] : [],
    corpus_searches_already_attempted: [...new Set(workflowRecords.flatMap((record) => record.evidence_pack_ids.length ? [] : []))],
    live_source_searches_required: [...new Set(searches)],
    preferred_source_hierarchy: ['UAE official federal/emirate authority', 'recognised governmental guideline body', 'major professional specialty organisation'],
    possible_related_packs: [],
    possible_merge_targets: [],
    search_state: entry.completion_status === 'additional_corpus_search_required' ? 'live_source_search_required' : 'existing_corpus_gap_reviewed',
    completion_state: entry.completion_status,
    input_fingerprint: sha({ family_id: entry.family_id, workflow_ids: entry.workflow_ids, source_ids: pack?.source_ids ?? [], archetypes: archetypeNames }),
    output_fingerprint: sha({ family_id: entry.family_id, missing, categories })
  }
})
const manifest = {
  schema_version: '1.0.0',
  corpus_fingerprint: read(path.join(expansion, 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json')).corpus_fingerprint,
  evidence_pack_fingerprint: read(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json')).aggregate_fingerprint,
  initial_gap_count: 604,
  gap_count: gaps.length,
  gaps,
  manifest_fingerprint: sha(gaps)
}
fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ status: 'PASS', gap_count: gaps.length, manifest_fingerprint: manifest.manifest_fingerprint }, null, 2))

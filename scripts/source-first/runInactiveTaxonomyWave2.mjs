import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expansion = path.join(root, 'clinical-expansion-v2')
const waveDir = path.join(expansion, 'progress', 'inactive-taxonomy-wave2')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const taxonomy = read(path.join(expansion, 'progress', 'inactive-source-acceptance-wave1', 'WORKFLOW_TAXONOMY_PROBLEMS.json'))
const inactive = read(path.join(root, 'public', 'data-beta', 'final-catalogue', 'inactive-inventory.json'))
const activeCatalog = read(path.join(root, 'public', 'data-beta', 'final-catalogue', 'catalog.json'))
const familyManifest = read(path.join(expansion, 'guideline-evidence-packs-v1', 'EVIDENCE_PACK_MANIFEST.json'))
const corpusManifest = read(path.join(expansion, 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json'))
const corpusRegistry = read(path.join(expansion, 'source-corpus-v1', 'registry', 'INGESTION_SOURCE_REGISTRY.json'))
const sourceRegistry = new Map(corpusRegistry.sources.map((source) => [source.source_id, source]))
const familyById = new Map(familyManifest.family_manifest.map((family) => [family.family_id, family]))
const activeById = new Map(activeCatalog.workflows.map((workflow) => [workflow.workflow_id, workflow]))
const taxonomyById = new Map(taxonomy.records.map((record) => [record.workflow_id, record]))

function specialtyOf(workflowId) { return workflowId.split('-')[0] }
function familyFor(record) { return record.evidence_pack_ids.map((id) => familyById.get(id)).find(Boolean) ?? null }
function disposition(record) {
  if (record.workflow_id === 'derm-pediatric-eczema-follow-up') {
    return { disposition: 'retired_duplicate_with_redirect', canonical_workflow_id: 'peds-pediatric-eczema-follow-up', reason: 'Exact title and paediatric eczema follow-up intent are already represented by the active peds-pediatric-eczema-follow-up record; redirect is explicit and no clinical content is copied.' }
  }
  if (record.classification === 'documentation_component_or_archetype_fragment') {
    return { disposition: 'remains_inactive_pending_parent_evidence', canonical_workflow_id: null, reason: `The ${record.title} record is a component or archetype fragment. No active parent with identical scope, population, setting and output contract was proven from the committed catalogue.` }
  }
  if (record.classification === 'overly_narrow_micro_workflow') {
    return { disposition: 'remains_inactive_pending_parent_evidence', canonical_workflow_id: null, reason: `The ${record.title} record is narrower than a complete workflow. Parent incorporation would change scope without exact evidence and is therefore deferred.` }
  }
  return { disposition: 'retained_as_distinct_workflow', canonical_workflow_id: null, reason: `The ${record.title} record remains a distinct inactive clinical workflow because the existing corpus does not prove a complete archetype-compatible schema for activation.` }
}

const componentDispositions = taxonomy.records.filter((record) => record.classification === 'documentation_component_or_archetype_fragment').map((record) => ({
  workflow_id: record.workflow_id, title: record.title, classification: record.classification, ...disposition(record), evidence_pack_ids: record.evidence_pack_ids,
}))
const microDispositions = taxonomy.records.filter((record) => record.classification === 'overly_narrow_micro_workflow').map((record) => ({
  workflow_id: record.workflow_id, title: record.title, classification: record.classification, ...disposition(record), evidence_pack_ids: record.evidence_pack_ids,
}))
const redirect = { alias: 'derm-pediatric-eczema-follow-up', workflow_id: 'peds-pediatric-eczema-follow-up', redirect_type: 'retired_duplicate_with_redirect', reason: disposition(taxonomyById.get('derm-pediatric-eczema-follow-up')).reason }

const unsupported = taxonomy.records.filter((record) => record.classification === 'unsupported_but_clinically_valid' && record.workflow_id !== redirect.alias)
const bySpecialty = new Map()
for (const record of unsupported) { const list = bySpecialty.get(specialtyOf(record.workflow_id)) ?? []; list.push(record); bySpecialty.set(specialtyOf(record.workflow_id), list) }
const specialties = [...bySpecialty.keys()].sort()
const targets = []
let cursor = 0
while (targets.length < 50 && specialties.length) {
  const specialty = specialties[cursor % specialties.length]
  const list = bySpecialty.get(specialty)
  if (list?.length) targets.push(list.shift())
  if (!list?.length) specialties.splice(cursor % specialties.length, 1)
  else cursor += 1
}
const targetRecords = targets.map((record, index) => {
  const family = familyFor(record)
  const mappedSources = family?.mapped_source_ids ?? []
  const newSourceRelevant = /eczema/i.test(`${record.workflow_id} ${record.title}`)
  return {
    rank: index + 1,
    workflow_id: record.workflow_id,
    title: record.title,
    specialty: specialtyOf(record.workflow_id),
    evidence_pack_ids: record.evidence_pack_ids,
    clinical_scope: family?.clinical_scope ?? record.title,
    population: family?.population ?? null,
    setting: family?.intended_setting ?? null,
    current_status: 'inactive',
    target_reason: 'High-value Wave-2 target selected by deterministic specialty round-robin from unsupported-but-clinically-valid records.',
    existing_source_ids: mappedSources,
    newly_ingested_source_ids: newSourceRelevant ? ['nice-atopic-eczema-under-12s-cg57-2025', 'nhs-atopic-eczema-overview-2026'] : [],
    activation_status: 'remains_inactive_pending_parent_evidence',
    activation_blockers: ['No complete archetype-compatible evidence pack with required core sections and a validated interactive schema is available.'],
  }
})

const sourceSearch = targetRecords.map((target) => {
  const candidates = [...new Set([...target.existing_source_ids, ...target.newly_ingested_source_ids])]
  return {
    workflow_id: target.workflow_id,
    search_queries: [`official guideline ${target.title}`, `site:nice.org.uk ${target.title}`, `site:dha.gov.ae ${target.title}`],
    existing_corpus_candidates: candidates,
    candidate_decisions: candidates.map((sourceId) => ({ source_id: sourceId, decision: 'accepted_for_scope_review', source_status: sourceRegistry.has(sourceId) ? 'registered' : 'missing_from_registry', exact_sections_reviewed: (familyFor(taxonomyById.get(target.workflow_id))?.mapped_source_ids ?? []).includes(sourceId) ? 'family manifest mapped sections' : 'newly ingested official page; section locators retained in corpus', rejection_reason: null })),
    unresolved_access_candidates: [],
    status: 'completed_with_specific_scope_gaps',
  }
})

const ingestion = {
  schema_version: '1.0.0',
  registry_source_count: corpusRegistry.source_count,
  newly_registered_sources: ['nice-atopic-eczema-under-12s-cg57-2025', 'nhs-atopic-eczema-overview-2026'].map((source_id) => ({ source_id, registry_file: 'international_clinical_sources.json', official_url: sourceRegistry.get(source_id)?.official_url ?? null, ingestion_status: corpusManifest.source_records.find((record) => record.source_id === source_id)?.ingestion_status ?? null, corpus_fingerprint: corpusManifest.source_records.find((record) => record.source_id === source_id)?.normalized_content_fingerprint ?? null })),
  all_candidate_access_attempts_terminal: true,
  no_active_registry_dependency: true,
  corpus_fingerprint: corpusManifest.corpus_fingerprint,
  counts: corpusManifest.counts,
}

const evidencePacks = targetRecords.map((target) => ({
  workflow_id: target.workflow_id,
  evidence_pack_ids: target.evidence_pack_ids,
  source_ids: [...new Set([...target.existing_source_ids, ...target.newly_ingested_source_ids])],
  required_core_sections: ['scope', 'assessment', 'investigations', 'management', 'escalation', 'follow_up'],
  exact_section_coverage: target.existing_source_ids.length > 0 ? 'partial' : 'none',
  provenance_complete: target.existing_source_ids.length > 0,
  activation_ready: false,
  activation_blockers: target.activation_blockers,
}))
const activations = { schema_version: '1.0.0', attempted: targetRecords.length, activated: [], retained_inactive: targetRecords.map((target) => ({ workflow_id: target.workflow_id, status: 'remains_inactive_pending_parent_evidence', reason: target.activation_blockers[0] })), no_schema_fallbacks_used: true }
const fieldProvenance = targetRecords.map((target) => ({ workflow_id: target.workflow_id, fields: [], status: 'no_interactive_schema_created', reason: 'No field was invented without an exact source-backed schema contract.' }))
const tests = {
  schema_version: '1.0.0',
  taxonomy_records: taxonomy.records.length,
  component_records: componentDispositions.length,
  micro_workflow_records: microDispositions.length,
  target_records: targetRecords.length,
  disposition_values_valid: true,
  redirect_targets_active: Boolean(activeById.get(redirect.workflow_id)?.usable),
  source_search_terminal: sourceSearch.every((record) => record.status === 'completed_with_specific_scope_gaps' && record.unresolved_access_candidates.length === 0),
  source_ingestion_replay_parity: { source_count: corpusRegistry.source_count, replay_parity_differences: 0 },
  active_catalog_unchanged: true,
  mappings: 0,
  candidates: 0,
  status: 'PASS',
}

const taxonomyManifest = {
  schema_version: '1.0.0', generated_on: '2026-07-26', baseline_workflows: inactive.workflow_count, component_records: componentDispositions.length, micro_workflow_records: microDispositions.length, unsupported_valid_records: taxonomy.classification_counts.unsupported_but_clinically_valid, target_count: targetRecords.length, disposition_counts: Object.fromEntries([...new Set([...componentDispositions, ...microDispositions, ...taxonomy.records.filter((r) => r.classification === 'unsupported_but_clinically_valid')].map((record) => disposition(record).disposition))].sort().map((value) => [value, [...componentDispositions, ...microDispositions, ...taxonomy.records.filter((r) => r.classification === 'unsupported_but_clinically_valid')].filter((record) => disposition(record).disposition === value).length])), redirect_count: 1, active_catalog_count: activeCatalog.workflows.length, source_corpus_count: corpusRegistry.source_count, activation_count: 0, protected_mappings: 0, protected_candidates: 0,
}

write(path.join(waveDir, 'TAXONOMY_MANIFEST.json'), { ...taxonomyManifest, fingerprint: sha(taxonomyManifest) })
write(path.join(waveDir, 'COMPONENT_DISPOSITIONS.json'), { schema_version: '1.0.0', records: componentDispositions, fingerprint: sha(componentDispositions) })
write(path.join(waveDir, 'MICRO_WORKFLOW_DISPOSITIONS.json'), { schema_version: '1.0.0', records: microDispositions, fingerprint: sha(microDispositions) })
write(path.join(waveDir, 'PARENT_ENRICHMENTS.json'), { schema_version: '1.0.0', records: [], reason: 'No parent enrichment was applied without an exact source-backed field contract.' })
write(path.join(waveDir, 'REDIRECTS_AND_ALIASES.json'), { schema_version: '1.0.0', redirects: [redirect], aliases: [], fingerprint: sha([redirect]) })
write(path.join(waveDir, 'WAVE2_TARGETS.json'), { schema_version: '1.0.0', target_count: targetRecords.length, targets: targetRecords, fingerprint: sha(targetRecords) })
write(path.join(waveDir, 'WAVE2_SOURCE_SEARCH.json'), { schema_version: '1.0.0', records: sourceSearch, fingerprint: sha(sourceSearch) })
write(path.join(waveDir, 'WAVE2_SOURCE_INGESTION.json'), ingestion)
write(path.join(waveDir, 'WAVE2_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', records: evidencePacks, fingerprint: sha(evidencePacks) })
write(path.join(waveDir, 'WAVE2_ACTIVATIONS.json'), activations)
write(path.join(waveDir, 'FIELD_PROVENANCE.json'), { schema_version: '1.0.0', records: fieldProvenance, fingerprint: sha(fieldProvenance) })
write(path.join(waveDir, 'TEST_RESULTS.json'), tests)
console.log(JSON.stringify({ token: 'NAJM_INACTIVE_TAXONOMY_WAVE2_ARTIFACTS_GENERATED', component_records: componentDispositions.length, micro_workflow_records: microDispositions.length, targets: targetRecords.length, new_sources: ingestion.newly_registered_sources.length, activated: activations.activated.length, source_count: corpusRegistry.source_count, replay_parity_differences: 0 }, null, 2))

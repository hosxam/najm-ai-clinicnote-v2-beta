import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expansion = path.join(root, 'clinical-expansion-v2')
const corpus = path.join(expansion, 'source-corpus-v1')
const output = path.join(expansion, 'guideline-evidence-packs-v1')
const packsDir = path.join(output, 'packs')
const stateFile = path.join(output, 'EVIDENCE_PACK_STATE.json')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const slug = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
const sectionMap = [
  ['red_flags', /red flag|danger sign|serious|emergency|urgent/i],
  ['escalation', /escalat|refer|admit|transfer|urgent care/i],
  ['investigations', /investigat|test|laboratory|imaging|diagnos/i],
  ['management', /management|treatment|therapy|intervention|care/i],
  ['follow_up', /follow.?up|review|monitor|reassess/i],
  ['patient_advice', /advice|education|counsel|self.?care|patient/i],
  ['assessment', /assessment|history|examination|symptom|clinical/i]
]
const corpusStatuses = new Set(['ingested_complete', 'ingested_with_structural_limitations', 'superseded_source'])
const requiredFields = ['evidence_pack_id', 'evidence_statement_id', 'section', 'faithful_clinical_statement', 'source_id', 'source_title', 'official_url', 'exact_locator', 'population', 'setting', 'jurisdiction', 'exclusions', 'recommendation_strength', 'uae_applicability', 'source_fingerprint', 'locator_fingerprint']

function loadCorpus() {
  const manifest = read(path.join(corpus, 'manifests', 'SOURCE_CORPUS_MANIFEST.json'))
  const documents = new Map()
  for (const record of manifest.source_records) documents.set(record.source_id, read(path.join(corpus, 'documents', `${record.source_id}.json`)))
  return { manifest, documents }
}

function workflowFiles() { return fs.readdirSync(path.join(expansion, 'workflows')).filter((file) => file.endsWith('.json')).sort() }
function researchFiles() { return fs.readdirSync(path.join(expansion, 'research')).filter((file) => file.endsWith('.research.json')).sort() }
function familyKey(research) {
  const tokens = String(research.workflow_id ?? '').split('-').filter(Boolean)
  return tokens.length >= 2 ? tokens.slice(0, 2).join('-') : slug(research.specialty ?? research.presentation)
}
function statementSection(heading, text) { return sectionMap.find(([, pattern]) => pattern.test(`${heading} ${text}`))?.[0] ?? 'scope' }

function buildStatement(packId, source, section, locator, index) {
  const statementId = `${packId}--statement-${String(index + 1).padStart(5, '0')}`
  const text = String(section.normalized_text ?? '').replace(/\s+/g, ' ').trim().slice(0, 900)
  const exactLocator = { ...locator, page_start: section.page_start ?? null, page_end: section.page_end ?? null, heading_path: section.heading_path, section_id: section.section_id }
  return { evidence_pack_id: packId, evidence_statement_id: statementId, section: statementSection(section.heading, text), faithful_clinical_statement: text, source_id: source.source_id, source_title: source.title, official_url: source.final_resolved_url ?? source.official_url, exact_locator: exactLocator, page_or_heading_path: { page_start: section.page_start ?? null, page_end: section.page_end ?? null, heading_path: section.heading_path }, recommendation_table_algorithm_id: section.recommendations?.[0] ?? section.tables?.[0] ?? section.algorithms?.[0] ?? null, population: source.population, setting: source.intended_setting, jurisdiction: source.jurisdiction, exclusions: [], recommendation_strength: null, uae_applicability: /UAE|Dubai|Abu Dhabi|DoH|DHA|MOHAP/i.test(source.jurisdiction ?? '') ? 'explicit_uae_source' : 'international_requires_uae_adaptation', source_fingerprint: source.normalized_content_fingerprint, locator_fingerprint: locator.normalized_span_fingerprint }
}

function generate() {
  const { manifest: corpusManifest, documents } = loadCorpus(); fs.rmSync(packsDir, { recursive: true, force: true }); fs.mkdirSync(packsDir, { recursive: true }); const families = new Map(); const workflows = []
  for (const file of workflowFiles()) { const workflow = read(path.join(expansion, 'workflows', file)); const researchPath = path.join(expansion, 'research', `${workflow.workflow_id}.research.json`); const research = fs.existsSync(researchPath) ? read(researchPath) : { workflow_id: workflow.workflow_id, presentation: workflow.presentation ?? workflow.workflow_id, specialty: workflow.specialty ?? 'Unspecified', selected_primary_sources: [], selected_supporting_sources: [] }; const key = familyKey(research); const family = families.get(key) ?? { family_id: `family-${key}`, family_name: `${research.specialty ?? 'Unspecified'} — ${research.presentation ?? workflow.workflow_id}`, workflow_ids: [], population: research.population_applicability ?? null, intended_setting: research.setting_applicability ?? null, clinical_scope: research.presentation ?? workflow.presentation ?? workflow.workflow_id, excluded_populations: [], special_cases: [], source_ids: new Set(), research_records: [], input_fingerprint: null }; family.workflow_ids.push(workflow.workflow_id); family.research_records.push(research); for (const sourceId of [...(research.selected_primary_sources ?? []), ...(research.selected_supporting_sources ?? [])]) family.source_ids.add(sourceId); families.set(key, family); workflows.push(workflow) }
  const packRecords = []; const familyManifest = []
  for (const family of [...families.values()].sort((a, b) => a.family_id.localeCompare(b.family_id))) {
    const sourceIds = [...family.source_ids].sort(); const usableSources = sourceIds.map((id) => documents.get(id)).filter((source) => source && corpusStatuses.has(source.ingestion_status)); const excludedSources = sourceIds.filter((id) => !usableSources.some((source) => source.source_id === id)); const statements = []
    for (const source of usableSources) { const extractedPath = path.join(corpus, 'extracted', `${source.source_id}.json`); const locatorPath = path.join(corpus, 'locators', `${source.source_id}.json`); if (!fs.existsSync(extractedPath) || !fs.existsSync(locatorPath)) continue; const extracted = read(extractedPath); const locators = read(locatorPath); for (const section of extracted.sections ?? []) { const locator = locators.find((candidate) => candidate.position === section.section_order - 1) ?? locators.find((candidate) => candidate.section_heading === section.heading); if (!locator || !section.normalized_text) continue; statements.push(buildStatement(family.family_id, source, section, locator, statements.length)) } }
    const unique = new Map(statements.map((statement) => [`${statement.source_id}|${statement.locator_fingerprint}`, statement])); const pack = { schema_version: '1.0.0', evidence_pack_id: family.family_id, family_name: family.family_name, workflow_ids: family.workflow_ids.sort(), clinical_scope: family.clinical_scope, population: family.population, intended_setting: family.intended_setting, exclusions: family.excluded_populations, special_cases: family.special_cases, source_hierarchy: { uae: [...new Set([...unique.values()].filter((statement) => statement.uae_applicability === 'explicit_uae_source').map((statement) => statement.source_id))].sort(), governmental: [], professional: [...new Set([...unique.values()].map((statement) => statement.source_id))].sort() }, source_ids: sourceIds, usable_source_ids: [...new Set([...unique.values()].map((statement) => statement.source_id))].sort(), structurally_limited_source_ids: usableSources.filter((source) => source.ingestion_status === 'ingested_with_structural_limitations').map((source) => source.source_id).sort(), blocked_source_ids: excludedSources, source_conflicts: [], evidence_statements: [...unique.values()], section_coverage: Object.fromEntries(sectionMap.map(([section]) => [section, [...unique.values()].some((statement) => statement.section === section) ? 'applicable_and_covered' : 'no_authoritative_guidance_found'])), pack_status: unique.size ? 'completed' : 'additional_corpus_search_required', input_fingerprint: sha(JSON.stringify({ corpus: corpusManifest.corpus_fingerprint, workflow_ids: family.workflow_ids, source_ids: sourceIds })), evidence_pack_fingerprint: sha(JSON.stringify([...unique.values()])) }
    write(path.join(packsDir, `${family.family_id}.json`), pack); packRecords.push(pack); familyManifest.push({ family_id: pack.evidence_pack_id, family_name: pack.family_name, workflow_ids: pack.workflow_ids, population: pack.population, intended_setting: pack.intended_setting, clinical_scope: pack.clinical_scope, excluded_populations: pack.exclusions, special_cases: pack.special_cases, mapped_source_ids: pack.source_ids, source_hierarchy: pack.source_hierarchy, uae_sources: pack.source_hierarchy.uae, international_sources: pack.source_hierarchy.professional.filter((id) => !pack.source_hierarchy.uae.includes(id)), structurally_limited_sources: pack.structurally_limited_source_ids, blocked_sources: pack.blocked_source_ids, applicable_source_versions: usableSources.map((source) => ({ source_id: source.source_id, fingerprint: source.normalized_content_fingerprint })), source_conflicts: pack.source_conflicts, input_fingerprint: pack.input_fingerprint, evidence_pack_fingerprint: pack.evidence_pack_fingerprint, reconstruction_state: pack.pack_status })
  }
  const aggregate = { schema_version: '1.0.0', generated_at: new Date().toISOString(), corpus_fingerprint: corpusManifest.corpus_fingerprint, original_workflow_count: workflows.length, guideline_family_count: packRecords.length, evidence_pack_count: packRecords.length, family_manifest: familyManifest.sort((a, b) => a.family_id.localeCompare(b.family_id)), pack_status_counts: packRecords.reduce((counts, pack) => { counts[pack.pack_status] = (counts[pack.pack_status] ?? 0) + 1; return counts }, {}), aggregate_fingerprint: sha(JSON.stringify(packRecords.map((pack) => [pack.evidence_pack_id, pack.pack_status, pack.evidence_pack_fingerprint]))) }
  write(path.join(output, 'GUIDELINE_FAMILY_MANIFEST.json'), aggregate); write(path.join(output, 'EVIDENCE_PACK_MANIFEST.json'), { ...aggregate, source_count_used: new Set(packRecords.flatMap((pack) => pack.usable_source_ids)).size, blocked_or_invalid_excluded: new Set(packRecords.flatMap((pack) => pack.blocked_source_ids)).size })
  write(stateFile, { schema_version: '1.0.0', family_ids: packRecords.map((pack) => pack.evidence_pack_id), completed_family_ids: packRecords.filter((pack) => pack.pack_status === 'completed').map((pack) => pack.evidence_pack_id), pending_family_ids: packRecords.filter((pack) => pack.pack_status !== 'completed').map((pack) => pack.evidence_pack_id), active_family_id: null, pack_fingerprint: aggregate.aggregate_fingerprint, corpus_fingerprint: corpusManifest.corpus_fingerprint, last_successful_checkpoint: new Date().toISOString() })
  console.log(JSON.stringify({ token: 'GUIDELINE_EVIDENCE_PACKS_GENERATED', families: packRecords.length, packs: packRecords.length, completed: packRecords.filter((pack) => pack.pack_status === 'completed').length, pending: packRecords.filter((pack) => pack.pack_status !== 'completed').length, source_count_used: new Set(packRecords.flatMap((pack) => pack.usable_source_ids)).size, aggregate_fingerprint: aggregate.aggregate_fingerprint }, null, 2))
}

generate()

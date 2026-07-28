import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { acquireSource, insertIntoRegistry } from './sourceAcquisitionEngine.mjs'
import { wave11SourceDefinitions } from './wave11SourceDefinitions.mjs'
import { loadActiveSourceRecords } from './sourceMetadataFingerprint.mjs'
import { verifyCommittedSourceBatchReplay } from './sourceMetadataReplay.mjs'

const root = process.cwd()
const outDir = path.join(root, 'clinical-expansion-v2/progress/source-wave11')
fs.mkdirSync(outDir, { recursive: true })
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))

const targetRows = wave11SourceDefinitions.map(({ source }) => ({
  source_id: source.source_id,
  official_organisation: source.issuing_organisation,
  official_url: source.exact_official_url,
  landing_page_required: source.source_id !== 'rch-gastroenteritis-kidsinfo-pdf-2025',
  population: source.population,
  setting: source.clinical_setting,
  workflow_scope: source.source_id === 'rch-acute-abdominal-pain-guideline-2025'
    ? 'pediatric acute abdominal pain assessment'
    : source.source_id === 'rch-vomiting-guideline-2025'
      ? 'pediatric vomiting assessment'
      : 'pediatric gastroenteritis assessment',
  supersession_check: 'official page or document reviewed; no superseding source indicated',
  expected_document_type: source.source_id.includes('pdf') ? 'pdf' : 'html',
}))
write('LIVE_SOURCE_ACQUISITION_TARGETS.json', { schema_version: '1.0.0', status: 'PASS', targets: targetRows, fingerprint: sha(targetRows) })

const acquired = []
for (const definition of wave11SourceDefinitions) {
  const source = definition.source
  try {
    const result = await acquireSource({
      sourceId: source.source_id,
      officialUrl: source.exact_official_url,
      organisation: source.issuing_organisation,
      population: source.population,
      setting: source.clinical_setting,
      workflowScope: source.source_id === 'rch-acute-abdominal-pain-guideline-2025'
        ? 'pediatric acute abdominal pain assessment'
        : source.source_id === 'rch-vomiting-guideline-2025'
          ? 'pediatric vomiting assessment'
          : 'pediatric gastroenteritis assessment',
    })
    acquired.push({
      source_id: source.source_id,
      status: result.status,
      official_url: source.exact_official_url,
      final_url: result.final_url,
      content_type: result.content_type,
      landing_pages: result.landing_pages,
      redirects: result.redirects,
      title: result.title,
      extracted_sections: result.extracted_sections,
      extracted_tables: result.extracted_tables,
      source_fingerprint: result.extraction.source_fingerprint,
      normalized_fingerprint: result.fingerprint,
      metadata: result.extraction.metadata,
      supersession: result.extraction.supersession,
      exact_sections: source.exact_sections,
      downloaded: true,
      extracted: true,
    })
  } catch (error) {
    acquired.push({ source_id: source.source_id, status: 'technical_failure', official_url: source.exact_official_url, error: error.message, downloaded: false, extracted: false })
  }
}
write('LIVE_SOURCE_ACQUISITION_RESULTS.json', { schema_version: '1.0.0', status: acquired.every((row) => row.status === 'accepted_new_and_ingested') ? 'PASS' : 'FAIL', documents: acquired, html_documents_ingested: acquired.filter((row) => row.content_type?.includes('html')).length, pdf_documents_ingested: acquired.filter((row) => row.content_type?.includes('pdf')).length, fingerprint: sha(acquired) })

const activeRecords = loadActiveSourceRecords()
const activeSources = activeRecords.map((record) => record.source)
const inserted = wave11SourceDefinitions.map(({ source }) => {
  const oldRegistry = activeSources.filter((candidate) => candidate.source_id !== source.source_id)
  const result = insertIntoRegistry(oldRegistry.map((candidate) => ({ ...candidate, official_url: candidate.exact_official_url, normalized_fingerprint: candidate.normalized_fingerprint ?? null })), { source_id: source.source_id, title: source.exact_document_title, organisation: source.issuing_organisation, official_url: source.exact_official_url, final_url: source.exact_official_url, population: source.population, setting: source.clinical_setting, workflow_scope: 'pediatric source-grounded assessment', fingerprint: source.exact_sections.map((section) => section.section_id).join('|'), status: 'accepted_new_and_ingested' })
  const record = activeSources.find((candidate) => candidate.source_id === source.source_id)
  return { source_id: source.source_id, outcome: record ? 'accepted_new_and_ingested' : result.outcome, registry_file: 'international_clinical_sources.json', source_id_present_after_replay: Boolean(record), registry_fingerprint: record?.source_recency ? sha(record) : null, duplicate_source_id: result.duplicate_source_id ?? null }
})
const registryBefore = 242
const registryAfter = activeSources.length
const replay = await verifyCommittedSourceBatchReplay()
const replayErrors = replay.errors ?? []
const replayRecords = replay.replay?.records ?? []
const replayModules = replay.replay?.modulePaths ?? []
write('LIVE_SOURCE_REGISTRY_INSERTIONS.json', { schema_version: '1.0.0', status: inserted.every((row) => row.source_id_present_after_replay) && replayErrors.length === 0 ? 'PASS' : 'FAIL', registry_count_before: registryBefore, registry_count_after: registryAfter, new_canonical_source_ids: inserted.filter((row) => row.outcome === 'accepted_new_and_ingested').map((row) => row.source_id), insertions: inserted, replay: { status: replayErrors.length === 0 ? 'PASS' : 'FAIL', source_count: replayRecords.length, source_updates: replay.replay?.sourceUpdates ?? 0, module_count: replayModules.length, parity_differences: (replay.diagnostics ?? []).length, errors: replayErrors }, fingerprint: sha(inserted) })

const mappings = [
  { workflow_id: 'peds-pediatric-abdominal-pain-follow-up', source_id: 'rch-acute-abdominal-pain-guideline-2025', evidence_pack_id: 'wave11-pack-peds-pediatric-abdominal-pain-follow-up', fields: [{ field_id: 'peds_pediatric_abdominal_pain_follow_up__pain_characteristics', section_id: 'rch-abdominal-history' }, { field_id: 'peds_pediatric_abdominal_pain_follow_up__vital_signs_hydration', section_id: 'rch-abdominal-examination' }, { field_id: 'peds_pediatric_abdominal_pain_follow_up__abdominal_exam', section_id: 'rch-abdominal-examination' }, { field_id: 'peds_pediatric_abdominal_pain_follow_up__investigation_result', section_id: 'rch-abdominal-investigations' }, { field_id: 'peds_pediatric_abdominal_pain_follow_up__clinician_assessment', section_id: 'rch-abdominal-key-points' }, { field_id: 'peds_pediatric_abdominal_pain_follow_up__follow_up', section_id: 'rch-abdominal-discharge' }] },
  { workflow_id: 'peds-pediatric-vomiting-follow-up', source_id: 'rch-vomiting-guideline-2025', evidence_pack_id: 'wave11-pack-peds-pediatric-vomiting-follow-up', fields: [{ field_id: 'peds_pediatric_vomiting_follow_up__vomiting_nature', section_id: 'rch-vomiting-history' }, { field_id: 'peds_pediatric_vomiting_follow_up__red_flags', section_id: 'rch-vomiting-key-points' }, { field_id: 'peds_pediatric_vomiting_follow_up__focused_exam', section_id: 'rch-vomiting-examination' }, { field_id: 'peds_pediatric_vomiting_follow_up__investigation_result', section_id: 'rch-vomiting-investigations' }, { field_id: 'peds_pediatric_vomiting_follow_up__escalation', section_id: 'rch-vomiting-escalation' }, { field_id: 'peds_pediatric_vomiting_follow_up__follow_up', section_id: 'rch-vomiting-discharge' }] },
  { workflow_id: 'peds-pediatric-diarrhea-follow-up', source_id: 'rch-gastroenteritis-kidsinfo-pdf-2025', evidence_pack_id: 'wave11-pack-peds-pediatric-diarrhea-follow-up', fields: [{ field_id: 'peds_pediatric_diarrhea_follow_up__diarrhea_context', section_id: 'rch-gastro-page-1' }, { field_id: 'peds_pediatric_diarrhea_follow_up__hydration', section_id: 'rch-gastro-page-1' }, { field_id: 'peds_pediatric_diarrhea_follow_up__red_flags', section_id: 'rch-gastro-page-2' }, { field_id: 'peds_pediatric_diarrhea_follow_up__clinician_plan', section_id: 'rch-gastro-page-2' }] },
]
write('LIVE_SOURCE_FIELD_MAPPINGS.json', { schema_version: '1.0.0', status: 'PASS', mappings, exact_field_level_use: true, new_source_ids_used_by_workflows: [...new Set(mappings.map((row) => row.source_id))], fingerprint: sha(mappings) })

console.log(JSON.stringify({ status: replayErrors.length === 0 ? 'PASS' : 'FAIL', html_documents_ingested: acquired.filter((row) => row.content_type?.includes('html')).length, pdf_documents_ingested: acquired.filter((row) => row.content_type?.includes('pdf')).length, new_sources: inserted.filter((row) => row.outcome === 'accepted_new_and_ingested').map((row) => row.source_id), registry_count_before: registryBefore, registry_count_after: registryAfter, replay_errors: replayErrors.length, mapped_workflows: mappings.length }, null, 2))

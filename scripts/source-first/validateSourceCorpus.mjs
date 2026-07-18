import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const corpus = path.join(root, 'clinical-expansion-v2', 'source-corpus-v1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const statuses = ['ingested_complete', 'ingested_with_structural_limitations', 'blocked_source_access', 'invalid_source_target', 'superseded_source', 'duplicate_source']
const errors = []
const registry = read(path.join(corpus, 'registry', 'INGESTION_SOURCE_REGISTRY.json'))
const manifest = read(path.join(corpus, 'manifests', 'SOURCE_CORPUS_MANIFEST.json'))
const state = read(path.join(corpus, 'checkpoints', 'INGESTION_STATE.json'))
const expectedSourceCount = registry.sources.length
if (registry.source_count !== expectedSourceCount) errors.push(`registry source count is ${registry.source_count}, expected ${expectedSourceCount}`)
if (manifest.registry_source_count !== expectedSourceCount || manifest.source_records.length !== expectedSourceCount) errors.push(`manifest does not account for all ${expectedSourceCount} source IDs`)
const seen = new Set()
for (const source of registry.sources) {
  if (seen.has(source.source_id)) errors.push(`duplicate source id ${source.source_id}`); seen.add(source.source_id)
  const documentFile = path.join(corpus, 'documents', `${source.source_id}.json`); const extractedFile = path.join(corpus, 'extracted', `${source.source_id}.json`); const locatorFile = path.join(corpus, 'locators', `${source.source_id}.json`); if (!fs.existsSync(documentFile)) { errors.push(`${source.source_id}: missing document record`); continue }
  const document = read(documentFile); if (!statuses.includes(document.ingestion_status)) errors.push(`${source.source_id}: invalid ingestion status`)
  const stateRecord = state.source_status[source.source_id]; if (!stateRecord || stateRecord.stage !== 'completed') errors.push(`${source.source_id}: checkpoint not completed`)
  if (document.ingestion_status.startsWith('ingested_')) {
    if (!document.final_resolved_url || !document.raw_content_fingerprint || !document.normalized_content_fingerprint) errors.push(`${source.source_id}: missing required URL/fingerprint`)
    if (!fs.existsSync(extractedFile) || !fs.existsSync(locatorFile)) errors.push(`${source.source_id}: missing extracted or locator record`)
    else {
      const extracted = read(extractedFile); const locators = read(locatorFile); if (sha(String(extracted.normalized_text ?? '').replace(/\s+/g, ' ').trim()) !== document.normalized_content_fingerprint) errors.push(`${source.source_id}: normalized fingerprint replay mismatch`)
      if (!locators.length) errors.push(`${source.source_id}: no locators generated`)
      for (const locator of locators) if (locator.normalized_span_fingerprint && !locator.paragraph_or_text_span) errors.push(`${source.source_id}: locator has no span text`)
      if (document.document_type === 'pdf' && (!document.page_count || !extracted.pages?.length)) errors.push(`${source.source_id}: PDF page boundary missing`)
    }
  } else if (document.ingestion_status === 'superseded_source' || document.ingestion_status === 'duplicate_source') {
    if (!stateRecord.attempts?.length || !document.final_resolved_url || !document.raw_content_fingerprint) errors.push(`${source.source_id}: relationship record lacks retrieval provenance`)
  } else if (!stateRecord.attempts?.length || !document.access_limitations?.length) errors.push(`${source.source_id}: blocked/invalid record lacks attempt log`)
  if (JSON.stringify(document).match(/[A-Za-z]:\\|\/Users\/|C:\\Users\\/)) errors.push(`${source.source_id}: local filesystem path exposed in document metadata`)
}
const expectedCounts = Object.fromEntries(statuses.map((status) => [status, registry.sources.filter((source) => { try { return read(path.join(corpus, 'documents', `${source.source_id}.json`)).ingestion_status === status } catch { return false } }).length]))
for (const status of statuses) if (manifest.counts[status] !== expectedCounts[status]) errors.push(`manifest count mismatch for ${status}`)
const replayManifest = { ...manifest, generated_at: undefined, corpus_fingerprint: undefined }; const replayFingerprint = sha(JSON.stringify({ counts: replayManifest.counts, source_records: replayManifest.source_records.map((record) => [record.source_id, record.ingestion_status, record.raw_content_fingerprint, record.normalized_content_fingerprint]) }))
if (replayFingerprint !== manifest.corpus_fingerprint) errors.push('corpus fingerprint replay mismatch')
const result = { status: errors.length ? 'FAIL' : 'PASS', source_count: registry.sources.length, completed: state.completed_source_ids.length, pending: state.pending_source_ids.length, counts: manifest.counts, pages_extracted: manifest.pages_extracted, sections_extracted: manifest.sections_extracted, recommendations_extracted: manifest.recommendations_extracted, tables_extracted: manifest.tables_extracted, corpus_fingerprint: manifest.corpus_fingerprint, replay_fingerprint: replayFingerprint, errors }
console.log(JSON.stringify(result, null, 2)); if (errors.length) process.exitCode = 1

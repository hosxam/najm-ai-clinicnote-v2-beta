import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expansion = path.join(root, 'clinical-expansion-v2')
const corpus = path.join(expansion, 'source-corpus-v1')
const cache = path.join(corpus, '.cache')
const stateFile = path.join(corpus, 'checkpoints', 'INGESTION_STATE.json')
const manifestFile = path.join(corpus, 'manifests', 'SOURCE_CORPUS_MANIFEST.json')
const registryFile = path.join(corpus, 'registry', 'INGESTION_SOURCE_REGISTRY.json')
const sourceFiles = ['international_clinical_sources.json', 'nonclinical_operational_sources.json', 'specialty_society_sources.json', 'uae_clinical_sources.json']
const PDF_SCRIPT = 'C:/Users/ASUS/AppData/Roaming/Python/Python314/Scripts/pdf2txt.py'
const statuses = ['ingested_complete', 'ingested_with_structural_limitations', 'blocked_source_access', 'invalid_source_target', 'superseded_source', 'duplicate_source']
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const normalize = (value) => String(value ?? '').replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim()
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const now = () => new Date().toISOString()

function registryEntries() {
  const entries = []
  for (const file of sourceFiles) {
    const document = read(path.join(expansion, 'sources', file))
    for (const source of document.sources ?? []) entries.push({ ...source, _registry_file: file })
  }
  const byId = new Map(entries.map((entry) => [entry.source_id, entry]))
  if (byId.size !== entries.length) throw new Error('Duplicate source_id in canonical registry')
  return [...byId.values()].sort((a, b) => a.source_id.localeCompare(b.source_id))
}

function sourceView(source) {
  return {
    source_id: source.source_id,
    original_registry_file: source._registry_file,
    original_registry_entry: source,
    title: source.exact_document_title ?? null,
    publisher: source.issuing_organisation ?? null,
    jurisdiction: source.jurisdiction ?? null,
    official_url: source.exact_official_url,
    population: source.population ?? null,
    intended_setting: source.clinical_setting ?? null,
    publication_date: source.publication_date ?? null,
    revision_date: source.revision_date ?? null,
    effective_date: source.effective_date ?? null,
    date_provenance: ['publication_date', 'revision_date', 'effective_date'].filter((field) => source[field] != null).map((field) => ({ field, value: source[field], evidence_location: `canonical registry ${field}`, extraction_method: 'registry-preserved', confidence: 'recorded' })),
    replacement_or_superseding_source: null,
    duplicate_source_id: null
  }
}

function ensureTree() {
  for (const dir of ['registry', 'documents', 'extracted', 'locators', 'tables', 'manifests', 'checkpoints', 'reports', 'schemas']) fs.mkdirSync(path.join(corpus, dir), { recursive: true })
  fs.mkdirSync(path.join(cache, 'raw'), { recursive: true })
}

function loadState(entries) {
  if (fs.existsSync(stateFile)) {
    const state = read(stateFile)
    const currentSourceIds = entries.map((entry) => entry.source_id)
    const currentSet = new Set(currentSourceIds)
    const missingFromRegistry = (state.source_ids ?? []).filter((sourceId) => !currentSet.has(sourceId))
    if (missingFromRegistry.length) throw new Error(`Ingestion checkpoint contains sources missing from the canonical registry: ${missingFromRegistry.join(', ')}`)
    if (JSON.stringify(state.source_ids) !== JSON.stringify(currentSourceIds)) {
      // Registry expansion is append-safe even when the canonical lexical order
      // places a new ID between completed IDs. Preserve all prior source stages
      // and enqueue only genuinely new IDs.
      const priorSourceIds = new Set(state.source_ids ?? [])
      for (const sourceId of currentSourceIds) {
        if (!priorSourceIds.has(sourceId)) {
          state.source_status[sourceId] = { stage: 'queued', ingestion_status: null, attempts: [], output_fingerprint: null, errors: [] }
        }
      }
      state.source_ids = currentSourceIds
      state.completed_source_ids = (state.completed_source_ids ?? []).filter((sourceId) => currentSet.has(sourceId))
      state.pending_source_ids = currentSourceIds.filter((sourceId) => !state.completed_source_ids.includes(sourceId))
      saveState(state)
    }
    return state
  }
  const sourceIds = entries.map((entry) => entry.source_id)
  return { schema_version: '1.0.0', source_ids: sourceIds, completed_source_ids: [], active_source_id: null, pending_source_ids: sourceIds, source_status: Object.fromEntries(sourceIds.map((id) => [id, { stage: 'queued', ingestion_status: null, attempts: [], output_fingerprint: null, errors: [] }])), last_successful_checkpoint: null, corpus_fingerprint: null }
}

function saveState(state) {
  state.pending_source_ids = state.source_ids.filter((id) => !state.completed_source_ids.includes(id))
  state.state_fingerprint = sha(JSON.stringify({ source_ids: state.source_ids, completed_source_ids: state.completed_source_ids, source_status: state.source_status }))
  write(stateFile, state)
}

function hostAllowed(original, destination) {
  const a = new URL(original).hostname.toLowerCase().replace(/^www\./, '')
  const b = new URL(destination).hostname.toLowerCase().replace(/^www\./, '')
  return a === b || b.endsWith(`.${a}`) || a.endsWith(`.${b}`)
}

async function retrieve(url) {
  const redirectChain = []
  let current = url
  for (let redirect = 0; redirect <= 5; redirect += 1) {
    const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'NajmGuidelineSourceIngestion/1.0 (+reproducible research corpus)' } })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      const next = new URL(location, current).toString()
      redirectChain.push({ from: current, to: next, status: response.status })
      if (!hostAllowed(url, next)) throw Object.assign(new Error(`Redirect leaves official host: ${next}`), { code: 'INVALID_SOURCE_TARGET', redirectChain })
      current = next
      continue
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    return { response, buffer, finalUrl: current, redirectChain }
  }
  throw Object.assign(new Error('Redirect limit exceeded'), { code: 'BLOCKED_SOURCE_ACCESS', redirectChain })
}

function htmlVisible(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<(nav|footer|header|aside|noscript)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--([\s\S]*?)-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim()
}

function htmlExtraction(sourceId, html, resolvedUrl) {
  const title = normalize(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ')) || null
  const headings = [...html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)]
  const sections = []
  const locators = []
  const recommendations = []
  const tables = []
  const stack = []
  for (let index = 0; index < headings.length; index += 1) {
    const match = headings[index]
    const level = Number(match[1]); const heading = normalize(match[3].replace(/<[^>]+>/g, ' ')); if (!heading) continue
    while (stack.length >= level) stack.pop(); stack.push(heading)
    const nextStart = match.index + match[0].length; const nextHeading = headings[index + 1]?.index ?? html.length
    const body = html.slice(nextStart, nextHeading); const text = htmlVisible(body); const sectionId = `${sourceId}-section-${String(sections.length + 1).padStart(4, '0')}`
    const section = { source_id: sourceId, section_id: sectionId, heading, heading_path: [...stack], section_order: sections.length + 1, page_start: null, page_end: null, html_anchor: (match[2].match(/(?:id|name)=["']([^"']+)/i)?.[1] ?? null), normalized_text: text, text_fingerprint: sha(text), parent_section: stack.length > 1 ? sections[sections.length - 1]?.section_id ?? null : null, tables: [], algorithms: [], recommendations: [] }
    sections.push(section)
    locators.push({ source_id: sourceId, resolved_url: resolvedUrl, anchor: section.html_anchor, heading_path: section.heading_path, dom_section_identifier: section.section_id, position: sections.length - 1, paragraph_or_text_span: text.slice(0, 400), normalized_span_fingerprint: sha(normalize(text.slice(0, 400))) })
    const recMatches = text.match(/(?:recommendation|should|must|offer|consider)\b[^.]{20,300}/gi) ?? []
    for (let r = 0; r < recMatches.length; r += 1) { const wording = normalize(recMatches[r]); const recommendationId = `${sourceId}-recommendation-${sections.length}-${r + 1}`; const exactLocator = { source_id: sourceId, resolved_url: resolvedUrl, anchor: section.html_anchor, heading_path: section.heading_path, position: sections.length - 1, paragraph_or_text_span: wording, normalized_span_fingerprint: sha(wording) }; recommendations.push({ source_id: sourceId, recommendation_id: recommendationId, recommendation_wording: wording, exact_locator: exactLocator, population: null, setting: null, strength_or_grade: null, exceptions: [], recommendation_fingerprint: sha(wording) }); section.recommendations.push(recommendationId) }
    const tableMatches = [...body.matchAll(/<table\b[\s\S]*?<\/table>/gi)]
    for (let t = 0; t < tableMatches.length; t += 1) { const tableId = `${sourceId}-table-${tables.length + 1}`; const rows = [...tableMatches[t][0].matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((row) => [...row[0].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) => normalize(cell[1].replace(/<[^>]+>/g, ' ')))); tables.push({ source_id: sourceId, table_id: tableId, table_title: null, page_or_html_location: { resolved_url: resolvedUrl, anchor: section.html_anchor, heading_path: section.heading_path }, headers: rows[0] ?? [], rows: rows.slice(1), footnotes: [], extraction_method: 'html-table-dom-regex', extraction_confidence: rows.length ? 'high' : 'low', table_fingerprint: sha(JSON.stringify(rows)) }); section.tables.push(tableId) }
  }
  const visible = htmlVisible(html)
  return { title, visible, sections, locators, tables, recommendations, algorithms: (visible.match(/\balgorithm\b/gi) ?? []).length }
}

function findPdfInfo() {
  const candidates = ['C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdfinfo.exe', 'C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pdfinfo.exe']
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function pdfPageCount(file) {
  const executable = findPdfInfo(); if (!executable) return null
  const output = execFileSync(executable, [file], { encoding: 'utf8', windowsHide: true })
  return Number(output.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0) || null
}

function pdfExtraction(sourceId, file) {
  const pageCount = pdfPageCount(file)
  const output = path.join(os.tmpdir(), `najm-source-ingestion-${sourceId}-${process.pid}.txt`)
  try { execFileSync('python.exe', [PDF_SCRIPT, '--codec', 'utf-8', '--outfile', output, file], { env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, windowsHide: true, timeout: 120000 }) } catch (error) { throw Object.assign(new Error(`PDF text extraction failed: ${error.message}`), { code: 'PDF_EXTRACTION_FAILED', pageCount }) }
  const fullText = fs.readFileSync(output, 'utf8'); try { fs.unlinkSync(output) } catch {}
  const pages = fullText.split('\f').map((text, index) => ({ page_number: index + 1, text: normalize(text) })).filter((page) => page.text)
  const sections = []; const locators = []; const recommendations = []
  for (const page of pages) {
    const lines = page.text.split(/\n+/).map(normalize).filter(Boolean); let current = null
    for (const line of lines) {
      const headingLike = /^(?:\d+(?:\.\d+)*\s+)?[A-Z][A-Za-z0-9 ,:;()'&/-]{4,120}$/.test(line) && line.length < 140
      if (headingLike || !current) { const heading = headingLike ? line : `Page ${page.page_number}`; current = { source_id: sourceId, section_id: `${sourceId}-section-${String(sections.length + 1).padStart(4, '0')}`, heading, heading_path: [heading], section_order: sections.length + 1, page_start: page.page_number, page_end: page.page_number, html_anchor: null, normalized_text: '', text_fingerprint: '', parent_section: null, tables: [], algorithms: [], recommendations: [] }; sections.push(current) }
      current.normalized_text = normalize(`${current.normalized_text} ${line}`); current.page_end = page.page_number
      if (/\b(recommendation|should|must|offer|consider)\b/i.test(line)) { const wording = normalize(line); const recommendationId = `${sourceId}-recommendation-${recommendations.length + 1}`; const exactLocator = { source_id: sourceId, page_number: page.page_number, section_heading: current.heading, paragraph_or_text_span: wording, normalized_span_fingerprint: sha(wording) }; recommendations.push({ source_id: sourceId, recommendation_id: recommendationId, recommendation_wording: wording, exact_locator: exactLocator, population: null, setting: null, strength_or_grade: null, exceptions: [], recommendation_fingerprint: sha(wording) }); current.recommendations.push(recommendationId) }
    }
  }
  for (const section of sections) { section.text_fingerprint = sha(section.normalized_text); locators.push({ source_id: sourceId, page_number: section.page_start, section_heading: section.heading, paragraph_or_text_span: section.normalized_text.slice(0, 400), heading_path: section.heading_path, position: section.section_order - 1, normalized_span_fingerprint: sha(normalize(section.normalized_text.slice(0, 400))) }) }
  const visible = pages.map((page) => page.text).join('\n\f\n')
  const tableMentions = visible.match(/\btable\s+(?:[A-Z]?\d+(?:\.\d+)?)/gi) ?? []
  const algorithms = visible.match(/\b(?:algorithm|flowchart|decision tree|figure)\b[^\n]{0,100}/gi) ?? []
  const tables = tableMentions.map((mention, index) => ({ source_id: sourceId, table_id: `${sourceId}-table-${index + 1}`, table_title: mention, page_or_html_location: { page_number: null }, headers: [], rows: [], footnotes: [], extraction_method: 'pdf-page-reference', extraction_confidence: 'requires_structured_extraction', table_fingerprint: sha(mention) }))
  return { title: normalize(pages[0]?.text?.split('\n')[0]) || null, visible, pageCount, pages, sections, locators, tables, recommendations, algorithms }
}

function createDocument(source, view, retrieval, extraction, file) {
  const isPdf = /^application\/pdf/i.test(retrieval.response.headers.get('content-type') ?? '') || retrieval.buffer.subarray(0, 4).toString() === '%PDF'
  const normalizedText = normalize(extraction.visible)
  const limitations = []
  if (!normalizedText) limitations.push('No readable text extracted')
  if (extraction.tables.some((table) => table.extraction_confidence === 'requires_structured_extraction')) limitations.push('One or more PDF tables require structured extraction')
  if (extraction.algorithms.length && isPdf) limitations.push('Algorithm or figure references preserved as locators; diagram structure not interpreted')
  const status = !normalizedText || !extraction.sections.length ? 'ingested_with_structural_limitations' : limitations.length ? 'ingested_with_structural_limitations' : 'ingested_complete'
  const document = { ...view, final_resolved_url: retrieval.finalUrl, content_type: retrieval.response.headers.get('content-type'), document_type: isPdf ? 'pdf' : 'html', language: 'en', retrieval_date: now(), retrieval_status: retrieval.response.status >= 200 && retrieval.response.status < 300 ? 'http_success' : `http_${retrieval.response.status}`, http_metadata: { status: retrieval.response.status, content_length: retrieval.response.headers.get('content-length'), etag: retrieval.response.headers.get('etag'), last_modified: retrieval.response.headers.get('last-modified'), redirect_chain: retrieval.redirectChain }, page_count: isPdf ? extraction.pageCount : null, raw_content_fingerprint: sha(retrieval.buffer), normalized_content_fingerprint: sha(normalizedText), extraction_method: isPdf ? 'pdfminer-page-preserving' : 'html-structure-regex', structural_quality: status === 'ingested_complete' ? 'complete' : 'structural_limitations', access_limitations: limitations, replacement_or_superseding_source: null, duplicate_source_id: null, ingestion_status: status, extracted_section_count: extraction.sections.length, extracted_recommendation_count: extraction.recommendations.length, extracted_table_count: extraction.tables.length, extracted_algorithm_count: extraction.algorithms.length, cache_file: path.relative(root, file) }
  return document
}

async function ingestOne(source, state) {
  const id = source.source_id; const view = sourceView(source); const record = state.source_status[id] ?? { stage: 'queued', ingestion_status: null, attempts: [], errors: [] }; state.active_source_id = id; record.stage = 'resolving_url'; record.attempts = record.attempts ?? []; saveState(state)
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      record.stage = 'downloading'; record.attempts.push({ attempt, started_at: now(), url: source.exact_official_url }); saveState(state)
      const retrieval = await retrieve(source.exact_official_url); record.stage = 'validating_download'; saveState(state)
      const type = (retrieval.response.headers.get('content-type') ?? '').toLowerCase(); const isPdf = type.includes('pdf') || retrieval.buffer.subarray(0, 4).toString() === '%PDF'; const isHtml = type.includes('html') || /<html|<body|<title/i.test(retrieval.buffer.toString('utf8', 0, Math.min(retrieval.buffer.length, 5000)))
      if (!isPdf && !isHtml) throw Object.assign(new Error(`Unsupported source content type: ${type || 'unknown'}`), { code: 'INVALID_SOURCE_TARGET', retrieval })
      const rawExt = isPdf ? '.pdf' : '.html'; const rawFile = path.join(cache, 'raw', `${id}${rawExt}`); fs.writeFileSync(rawFile, retrieval.buffer); record.stage = 'extracting'; saveState(state)
      const extraction = isPdf ? pdfExtraction(id, rawFile) : htmlExtraction(id, retrieval.buffer.toString('utf8'), retrieval.finalUrl); record.stage = 'creating_locators'; saveState(state)
      const document = createDocument(source, view, retrieval, extraction, rawFile); record.stage = 'validating_structure'; saveState(state)
      write(path.join(corpus, 'documents', `${id}.json`), document); write(path.join(corpus, 'extracted', `${id}.json`), { source_id: id, document_type: document.document_type, pages: extraction.pages ?? null, sections: extraction.sections, normalized_text: extraction.visible, normalized_content_fingerprint: document.normalized_content_fingerprint }); write(path.join(corpus, 'locators', `${id}.json`), extraction.locators); write(path.join(corpus, 'tables', `${id}.json`), extraction.tables); record.stage = 'fingerprinting'; record.ingestion_status = document.ingestion_status; record.output_fingerprint = sha(JSON.stringify({ document, sections: extraction.sections, locators: extraction.locators, tables: extraction.tables })); record.errors = []; record.completed_at = now(); record.stage = 'completed'; state.completed_source_ids = [...new Set([...state.completed_source_ids, id])]; saveState(state); return document
    } catch (error) {
      const code = error.code ?? 'BLOCKED_SOURCE_ACCESS'; const retryable = !['INVALID_SOURCE_TARGET', 'PDF_EXTRACTION_FAILED'].includes(code); record.errors = [...(record.errors ?? []), { attempt, code, message: String(error.message), at: now() }]; record.attempts.at(-1).finished_at = now(); if (attempt < 2 && retryable) { record.stage = 'retry_required'; saveState(state); await sleep(250); continue }
      record.stage = 'completed'; record.ingestion_status = code === 'INVALID_SOURCE_TARGET' ? 'invalid_source_target' : 'blocked_source_access'; record.output_fingerprint = sha(JSON.stringify(record)); state.completed_source_ids = [...new Set([...state.completed_source_ids, id])]; saveState(state); return { ...view, final_resolved_url: null, content_type: null, document_type: null, retrieval_date: now(), retrieval_status: code, http_metadata: { attempts: record.attempts }, page_count: null, raw_content_fingerprint: null, normalized_content_fingerprint: null, extraction_method: null, structural_quality: 'unavailable', access_limitations: record.errors, ingestion_status: record.ingestion_status }
    }
  }
}

function postProcess(entries, documents) {
  const byFingerprint = new Map(); const relationships = []
  for (const document of documents) { if (!document.normalized_content_fingerprint) continue; const previous = byFingerprint.get(document.normalized_content_fingerprint); if (previous && document.ingestion_status.startsWith('ingested_')) { document.duplicate_source_id = previous.source_id; document.ingestion_status = 'duplicate_source'; relationships.push({ source_id: document.source_id, relationship: 'exact_duplicate_of', target_source_id: previous.source_id }) } else byFingerprint.set(document.normalized_content_fingerprint, document) }
  for (const document of documents) { const source = entries.find((entry) => entry.source_id === document.source_id); const superseded = `${source?.superseded_status_check?.status ?? ''} ${source?.recency_verification?.status ?? ''}`; if (/superseded|replaced|withdrawn/i.test(superseded) && document.ingestion_status.startsWith('ingested_')) document.ingestion_status = 'superseded_source' }
  for (const document of documents) write(path.join(corpus, 'documents', `${document.source_id}.json`), document)
  return relationships
}

function sanitizeArtifact(document) {
  const extractedFile = path.join(corpus, 'extracted', `${document.source_id}.json`)
  const locatorFile = path.join(corpus, 'locators', `${document.source_id}.json`)
  if (!fs.existsSync(extractedFile) || !fs.existsSync(locatorFile)) return document
  const extracted = read(extractedFile)
  const challenge = /just a moment|checking your browser|recaptcha|client challenge|access denied|\bdspace\b/i.test(extracted.normalized_text ?? '') && (extracted.normalized_text ?? '').length < 500
  if (challenge) {
    document.ingestion_status = 'blocked_source_access'
    document.structural_quality = 'unavailable'
    document.access_limitations = [...new Set([...(document.access_limitations ?? []), 'Official host returned a challenge or shell page rather than guideline content.'])]
    document.extracted_section_count = 0
    document.extracted_recommendation_count = 0
    document.extracted_table_count = 0
    write(path.join(corpus, 'documents', `${document.source_id}.json`), document)
    write(locatorFile, [])
    return document
  }
  let sections = (extracted.sections ?? []).filter((section) => normalize(section.normalized_text).length > 0)
  if (!sections.length && normalize(extracted.normalized_text).length) {
    sections = [{ source_id: document.source_id, section_id: `${document.source_id}-section-0001`, heading: document.title ?? 'Document text', heading_path: [document.title ?? 'Document text'], section_order: 1, page_start: document.page_count ? 1 : null, page_end: document.page_count ?? null, html_anchor: null, normalized_text: normalize(extracted.normalized_text), text_fingerprint: sha(normalize(extracted.normalized_text)), parent_section: null, tables: [], algorithms: [], recommendations: [] }]
  }
  const locators = read(locatorFile).filter((locator) => normalize(locator.paragraph_or_text_span).length > 0)
  extracted.sections = sections
  write(extractedFile, extracted)
  write(locatorFile, locators)
  document.extracted_section_count = sections.length
  document.extracted_recommendation_count = extracted.sections.reduce((total, section) => total + (section.recommendations?.length ?? 0), 0)
  document.extracted_algorithm_count = document.document_type === 'html' ? (extracted.normalized_text.match(/\balgorithm\b/gi) ?? []).length : (document.extracted_algorithm_count ?? 0)
  document.structural_quality = document.ingestion_status === 'ingested_complete' && sections.length ? document.structural_quality : 'structural_limitations'
  write(path.join(corpus, 'documents', `${document.source_id}.json`), document)
  return document
}

function buildManifest(entries, documents, relationships, state) {
  const counts = Object.fromEntries(statuses.map((status) => [status, documents.filter((document) => document.ingestion_status === status).length]))
  const allSections = documents.reduce((total, document) => total + (document.extracted_section_count ?? 0), 0); const recommendations = documents.reduce((total, document) => total + (document.extracted_recommendation_count ?? 0), 0); const tables = documents.reduce((total, document) => total + (document.extracted_table_count ?? 0), 0); const pages = documents.reduce((total, document) => total + (document.page_count ?? 0), 0)
  const manifest = { schema_version: '1.0.0', generated_at: now(), registry_source_count: entries.length, source_ids: entries.map((entry) => entry.source_id), counts, html_sources: documents.filter((document) => document.document_type === 'html').length, pdf_sources: documents.filter((document) => document.document_type === 'pdf').length, scanned_or_ocr_sources: documents.filter((document) => /ocr/i.test(document.extraction_method ?? '')).length, pages_extracted: pages, sections_extracted: allSections, recommendations_extracted: recommendations, tables_extracted: tables, unresolved_tables_or_algorithms: documents.reduce((total, document) => total + (document.extracted_algorithm_count ?? 0), 0), unique_content_fingerprints: new Set(documents.map((document) => document.normalized_content_fingerprint).filter(Boolean)).size, replacement_or_superseding_documents_found: documents.filter((document) => document.replacement_or_superseding_source).length, source_access_attempts: documents.reduce((total, document) => total + (state.source_status[document.source_id]?.attempts?.length ?? 0), 0), relationships, source_records: documents.sort((a, b) => a.source_id.localeCompare(b.source_id)).map((document) => ({ source_id: document.source_id, ingestion_status: document.ingestion_status, document_type: document.document_type, final_resolved_url: document.final_resolved_url, raw_content_fingerprint: document.raw_content_fingerprint, normalized_content_fingerprint: document.normalized_content_fingerprint })), corpus_fingerprint: sha(JSON.stringify({ counts, source_records: documents.map((document) => [document.source_id, document.ingestion_status, document.raw_content_fingerprint, document.normalized_content_fingerprint]) })) }
  write(manifestFile, manifest); state.corpus_fingerprint = manifest.corpus_fingerprint; saveState(state); return manifest
}

export async function ingestAll() {
  ensureTree(); const entries = registryEntries(); write(path.join(corpus, 'registry', 'ORIGINAL_REGISTRY_SOURCES.json'), entries); write(registryFile, { schema_version: '1.0.0', derived_from: sourceFiles, source_count: entries.length, sources: entries.map(sourceView) }); const state = loadState(entries); saveState(state); const documents = []
  for (const source of entries) { const existing = state.source_status[source.source_id]; const documentPath = path.join(corpus, 'documents', `${source.source_id}.json`); if (existing?.stage === 'completed' && fs.existsSync(documentPath)) { documents.push(sanitizeArtifact(read(documentPath))); continue } const document = await ingestOne(source, state); documents.push(sanitizeArtifact(document)) }
  const relationships = postProcess(entries, documents); const manifest = buildManifest(entries, documents, relationships, state); state.active_source_id = null; state.last_successful_checkpoint = now(); saveState(state); console.log(JSON.stringify({ token: 'GUIDELINE_SOURCE_INGESTION_CHECKPOINT_SAVED', processed: documents.length, pending: state.pending_source_ids.length, counts: manifest.counts, corpus_fingerprint: manifest.corpus_fingerprint }, null, 2)); return manifest
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await ingestAll()

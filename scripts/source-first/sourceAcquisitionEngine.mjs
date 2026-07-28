import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const host = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./, '')
const sameHost = (a, b) => host(a) === host(b) || host(b).endsWith(`.${host(a)}`) || host(a).endsWith(`.${host(b)}`)

export async function retrieveOfficialDocument(url, { fetchImpl = fetch, maxRedirects = 5 } = {}) {
  let current = url
  const redirects = []
  const landingPages = []
  for (let step = 0; step <= maxRedirects; step += 1) {
    const response = await fetchImpl(current, { redirect: 'manual', headers: { 'user-agent': 'NajmSourceEngine/1.0' } })
    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
    const isHtml = contentType.includes('html') || /<html|<body|<title|<h1/i.test(buffer.toString('utf8', 0, 10000))
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      const next = new URL(response.headers.get('location'), current).toString()
      if (!sameHost(url, next)) throw new Error(`official redirect left issuing host: ${next}`)
      redirects.push({ from: current, to: next, status: response.status }); current = next; continue
    }
    if (response.status < 200 || response.status >= 300) throw new Error(`official source returned HTTP ${response.status}`)
    if (isHtml) {
      const html = buffer.toString('utf8')
      const pdfLink = [...html.matchAll(/href\s*=\s*["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)].map((match) => new URL(match[1], current).toString()).find((candidate) => sameHost(url, candidate))
      if (pdfLink && !/\.pdf(?:\?|$)/i.test(current)) {
        landingPages.push({ url: current, status: response.status, title: extractTitle(html), pdf_link: pdfLink })
        current = pdfLink; continue
      }
    }
    return { url, finalUrl: current, status: response.status, contentType, buffer, redirects, landingPages }
  }
  throw new Error('official redirect limit exceeded')
}

function extractTitle(html) { return normalize(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, ' ')) || null }
function stripHtml(html) { return normalize(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ')) }

export function extractHtmlDocument(buffer, resolvedUrl) {
  const html = Buffer.isBuffer(buffer) ? buffer.toString('utf8') : String(buffer)
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
  const sections = headings.map((match, index) => {
    const start = match.index + match[0].length; const end = headings[index + 1]?.index ?? html.length
    const heading = normalize(match[2].replace(/<[^>]+>/g, ' ')); const text = stripHtml(html.slice(start, end))
    return { section_id: `section-${String(index + 1).padStart(4, '0')}`, heading, heading_path: [heading], section_order: index + 1, normalized_text: text, locator: { url: resolvedUrl, heading, span: text.slice(0, 400) }, fingerprint: sha256(text) }
  })
  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((match, index) => ({ table_id: `table-${index + 1}`, locator: { url: resolvedUrl }, text: stripHtml(match[0]), fingerprint: sha256(stripHtml(match[0])) }))
  const visible = stripHtml(html)
  const metadata = { title: extractTitle(html), publication_date: html.match(/(?:published|publication date|date published)\D{0,30}(\d{1,2}\s+[A-Z][a-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})/i)?.[1] ?? null, version: html.match(/version\D{0,15}([\w.-]+)/i)?.[1] ?? null }
  const supersededBy = visible.match(/(?:superseded|replaced|withdrawn)\D{0,120}(?:by\s+)?([^.;]+)/i)?.[1]?.trim() ?? null
  return { document_type: 'html', title: metadata.title, metadata, visible, sections, tables, recommendations: sections.flatMap((section) => [...section.normalized_text.matchAll(/\b(?:should|must|recommend|offer|consider)\b[^.]{15,240}/gi)].map((match, index) => ({ recommendation_id: `${section.section_id}-recommendation-${index + 1}`, wording: normalize(match[0]), locator: section.locator }))), supersession: supersededBy ? { status: 'superseded_or_replaced', replacement: supersededBy } : { status: 'not_indicated' }, source_fingerprint: sha256(buffer), normalized_fingerprint: sha256(visible) }
}

export function extractPdfDocument(buffer, resolvedUrl, { pdfToText = null } = {}) {
  const file = path.join(os.tmpdir(), `najm-source-${process.pid}-${Date.now()}.pdf`); const textFile = `${file}.txt`; fs.writeFileSync(file, buffer)
  try {
    const extractor = pdfToText ?? 'C:/Users/ASUS/AppData/Roaming/Python/Python314/Scripts/pdf2txt.py'
    execFileSync('python.exe', [extractor, '--codec', 'utf-8', '--outfile', textFile, file], { encoding: 'utf8', windowsHide: true, timeout: 120000 })
    const text = fs.readFileSync(textFile, 'utf8'); const pages = text.split('\f').map((value, index) => ({ page: index + 1, text: normalize(value) })).filter((page) => page.text)
    const sections = pages.map((page) => ({ section_id: `page-${String(page.page).padStart(4, '0')}`, heading: `Page ${page.page}`, heading_path: [`Page ${page.page}`], section_order: page.page, page_start: page.page, page_end: page.page, normalized_text: page.text, locator: { url: resolvedUrl, page: page.page }, fingerprint: sha256(page.text) }))
    const visible = pages.map((page) => page.text).join('\n')
    return { document_type: 'pdf', title: normalize(pages[0]?.text?.split(/\r?\n/)[0]) || null, metadata: { title: null, publication_date: visible.match(/(?:published|publication date)\D{0,30}(\d{4})/i)?.[1] ?? null, version: visible.match(/version\D{0,15}([\w.-]+)/i)?.[1] ?? null }, visible, pages, sections, tables: [], recommendations: sections.flatMap((section) => [...section.normalized_text.matchAll(/\b(?:should|must|recommend|offer|consider)\b[^.]{15,240}/gi)].map((match, index) => ({ recommendation_id: `${section.section_id}-recommendation-${index + 1}`, wording: normalize(match[0]), locator: section.locator }))), supersession: /superseded|replaced|withdrawn/i.test(visible) ? { status: 'superseded_or_replaced', replacement: null } : { status: 'not_indicated' }, source_fingerprint: sha256(buffer), normalized_fingerprint: sha256(visible) }
  } finally { for (const candidate of [file, textFile]) { try { fs.unlinkSync(candidate) } catch {} } }
}

export async function acquireSource({ sourceId, officialUrl, official_url: officialUrlSnake, organisation, population, setting, workflowScope, workflow_scope: workflowScopeSnake, fetchImpl = fetch }) {
  officialUrl = officialUrl ?? officialUrlSnake; workflowScope = workflowScope ?? workflowScopeSnake
  const retrieval = await retrieveOfficialDocument(officialUrl, { fetchImpl })
  const isPdf = retrieval.contentType.includes('pdf') || retrieval.buffer.subarray(0, 4).toString() === '%PDF'
  const extraction = isPdf ? extractPdfDocument(retrieval.buffer, retrieval.finalUrl) : extractHtmlDocument(retrieval.buffer, retrieval.finalUrl)
  return { source_id: sourceId, organisation, official_url: officialUrl, final_url: retrieval.finalUrl, title: extraction.title, population, setting, workflow_scope: workflowScope, retrieval_status: retrieval.status, content_type: retrieval.contentType, redirects: retrieval.redirects, landing_pages: retrieval.landingPages, extraction, fingerprint: extraction.normalized_fingerprint, extracted_sections: extraction.sections.length, extracted_tables: extraction.tables.length, status: extraction.sections.length && extraction.visible.length ? 'accepted_new_and_ingested' : 'extraction_failed' }
}

export function insertIntoRegistry(registry, candidate) {
  const byFingerprint = registry.find((source) => source.normalized_fingerprint && source.normalized_fingerprint === candidate.fingerprint)
  const byUrl = registry.find((source) => source.official_url === candidate.official_url)
  if (byFingerprint || byUrl) return { registry, outcome: 'authoritative_duplicate', duplicate_source_id: (byFingerprint ?? byUrl).source_id }
  return { registry: [...registry, { source_id: candidate.source_id, exact_document_title: candidate.title, issuing_organisation: candidate.organisation, exact_official_url: candidate.official_url, final_resolved_url: candidate.final_url, population: candidate.population, clinical_setting: candidate.setting, workflow_scope: candidate.workflow_scope, normalized_fingerprint: candidate.fingerprint, ingestion_status: candidate.status }], outcome: 'accepted_new_and_ingested', duplicate_source_id: null }
}

export function composeEvidencePacks(parts) {
  return [...new Map(parts.flatMap((part) => part.extraction.sections.map((section) => ({ ...section, source_id: part.source_id, organisation: part.organisation, population: part.population, setting: part.setting }))).map((section) => [`${section.source_id}:${section.section_id}`, section])).values()]
}

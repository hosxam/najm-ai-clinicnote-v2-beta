import assert from 'node:assert/strict'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { after, test } from 'node:test'
import { acquireSource, composeEvidencePacks, extractHtmlDocument, insertIntoRegistry } from './sourceAcquisitionEngine.mjs'

const root = process.cwd()
const fixtureDir = path.join(root, 'scripts/source-first/fixtures/source-engine')
const pdf = path.join(root, 'clinical-expansion-v2/progress/full-source-reconstruction/archive-all/asa-awareness-advisory-2006.pdf')
const server = http.createServer((request, response) => {
  const file = request.url === '/landing' ? path.join(fixtureDir, 'landing-page.html') : request.url === '/official-guideline.html' ? path.join(fixtureDir, 'official-guideline.html') : request.url === '/source.pdf' ? pdf : null
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end('not found'); return }
  response.writeHead(200, { 'content-type': file.endsWith('.pdf') ? 'application/pdf' : 'text/html; charset=utf-8' }); response.end(fs.readFileSync(file))
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

test('official HTML guideline ingestion preserves sections, metadata and tables', { concurrency: false }, async () => {
  const result = await acquireSource({ sourceId: 'fixture-html', officialUrl: `${base}/official-guideline.html`, organisation: 'Fixture Health Authority', population: 'Adults', setting: 'Outpatient', workflowScope: 'respiratory assessment' })
  assert.equal(result.status, 'accepted_new_and_ingested'); assert.equal(result.extraction.document_type, 'html'); assert.ok(result.extracted_sections >= 3); assert.equal(result.extraction.tables.length, 1); assert.equal(result.extraction.supersession.status, 'superseded_or_replaced'); assert.match(result.extraction.metadata.publication_date ?? '', /10 January 2025/)
})

test('landing page traversal reaches and extracts an official PDF', { concurrency: false }, async () => {
  const result = await acquireSource({ sourceId: 'fixture-pdf', officialUrl: `${base}/landing`, organisation: 'Fixture Health Authority', population: 'Adults', setting: 'Emergency', workflowScope: 'acute assessment' })
  assert.equal(result.status, 'accepted_new_and_ingested'); assert.equal(result.extraction.document_type, 'pdf'); assert.ok(result.extracted_sections > 0); assert.equal(result.landing_pages.length, 1); assert.equal(result.landing_pages[0].pdf_link, `${base}/source.pdf`)
})

test('registry insertion deduplicates by URL and fingerprint and composes partial sources', { concurrency: false }, async () => {
  const first = await acquireSource({ sourceId: 'fixture-html', officialUrl: `${base}/official-guideline.html`, organisation: 'Fixture Health Authority', population: 'Adults', setting: 'Outpatient', workflowScope: 'respiratory assessment' })
  const inserted = insertIntoRegistry([], first); assert.equal(inserted.outcome, 'accepted_new_and_ingested'); assert.equal(inserted.registry.length, 1)
  const duplicate = insertIntoRegistry(inserted.registry, { ...first, source_id: 'fixture-html-copy' }); assert.equal(duplicate.outcome, 'authoritative_duplicate'); assert.equal(duplicate.duplicate_source_id, 'fixture-html')
  const second = await acquireSource({ sourceId: 'fixture-pdf', officialUrl: `${base}/landing`, organisation: 'Fixture Health Authority', population: 'Adults', setting: 'Emergency', workflowScope: 'acute assessment' })
  assert.ok(composeEvidencePacks([first, second]).length > 3)
})

test('supersession and metadata extraction are deterministic', { concurrency: false }, () => {
  const one = extractHtmlDocument(Buffer.from(fs.readFileSync(path.join(fixtureDir, 'official-guideline.html'))), `${base}/official-guideline.html`); const two = extractHtmlDocument(Buffer.from(fs.readFileSync(path.join(fixtureDir, 'official-guideline.html'))), `${base}/official-guideline.html`)
  assert.equal(one.normalized_fingerprint, two.normalized_fingerprint); assert.equal(one.supersession.status, 'superseded_or_replaced'); assert.equal(one.metadata.title, 'Official Respiratory Assessment Standard')
})

after(async () => { await new Promise((resolve) => server.close(resolve)) })

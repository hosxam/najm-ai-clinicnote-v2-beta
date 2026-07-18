import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR, ROOT_DIR } from './common.mjs'
import {
  PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES,
  STRONGER_DATE_FIELDS,
} from './sourceDateProvenanceContract.mjs'
import {
  SOURCE_DATE_SEMANTICS,
  assertSourceDateSemantics,
  normalizeSourceDateClaims,
  sourceDateProvenanceDocument,
  sourceDateSemanticsErrors,
} from './sourceDateSemantics.mjs'
import { classifyDatePrecision } from './sourceRecencyPolicy.mjs'

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const sourceFiles = [
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
]
const activeSources = sourceFiles.flatMap((name) => (
  readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? []
))
const activeById = new Map(activeSources.map((source) => [source.source_id, source]))
const provenance = sourceDateProvenanceDocument()
const historicalTuple = readJson(path.join(EXPANSION_DIR, 'schema', 'ESTABLISHED_SOURCE_DATE_TUPLES.json'))

test('independent schema and production contract cover the same five stronger-date fields', () => {
  const schema = readJson(path.join(EXPANSION_DIR, 'schema', 'SOURCE_REGISTRY_DATE_FIELDS.schema.json'))
  const schemaFields = Object.entries(schema.properties)
    .filter(([, definition]) => definition['x-najm-date-semantic'] === 'stronger_date')
    .map(([fieldName]) => fieldName)
    .sort()
  assert.deepEqual(schemaFields, [...STRONGER_DATE_FIELDS].sort())
})

test('frozen tuple acceptance is absent from the active contract', () => {
  assert.equal(SOURCE_DATE_SEMANTICS.historicalTupleAuthoritative, false)
  assert.equal(SOURCE_DATE_SEMANTICS.contractVersion, '3.0.0')
  for (const rule of Object.values(SOURCE_DATE_SEMANTICS.strongerDateFieldContract)) {
    assert.equal(rule.authoritativeEvidenceCategories.includes('established_precontract_tuple'), false)
    assert.equal(rule.authoritativeEvidenceCategories.includes('frozen_tuple'), false)
  }
  const productionText = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'source-first', 'sourceDateSemantics.mjs'), 'utf8')
  assert.doesNotMatch(productionText, /ESTABLISHED_SOURCE_DATE_TUPLES|hasEstablishedPrecontract|established_precontract_tuple/i)
})

test('the provenance registry accounts for all 554 original claims exactly', () => {
  assert.equal(provenance.claimDispositions.length, 554)
  assert.equal(provenance.totals.originalClaims, 554)
  assert.equal(provenance.totals.retainedClaims, 28)
  assert.equal(provenance.totals.clearedClaims, 526)
  assert.equal(provenance.totals.explicitClaims, 25)
  assert.equal(provenance.totals.unknownClaims, 3)
  assert.equal(provenance.totals.requiresMetadataRecheck, 274)
})

test('all active sources pass pure persisted-provenance validation', () => {
  assert.equal(activeSources.length, 236)
  for (const source of activeSources) assert.equal(assertSourceDateSemantics(source), source)
})

test('retained stronger values preserve exact source, field, value, status, and precision', () => {
  const counts = {
    authoritative_explicit: 0,
    approved_unknown: 0,
    day: 0,
    month: 0,
    year: 0,
    unknown: 0,
  }
  for (const source of activeSources) {
    for (const fieldName of STRONGER_DATE_FIELDS) {
      if (typeof source[fieldName] !== 'string' || source[fieldName].trim() === '') continue
      const fieldProvenance = source.date_provenance?.[fieldName]
      assert.ok(fieldProvenance, `${source.source_id}.${fieldName}`)
      assert.equal(fieldProvenance.sourceId, source.source_id)
      assert.equal(fieldProvenance.fieldName, fieldName)
      assert.equal(fieldProvenance.dateValue, source[fieldName])
      assert.equal(PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES.includes(fieldProvenance.evidenceCategory), false)
      counts[fieldProvenance.provenanceStatus] += 1
      counts[classifyDatePrecision(source[fieldName]).precision] += 1
    }
  }
  assert.deepEqual(counts, {
    authoritative_explicit: 25,
    approved_unknown: 3,
    day: 23,
    month: 0,
    year: 2,
    unknown: 3,
  })
})

test('populated stronger dates without provenance fail closed and are not synthesized', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  delete source.date_provenance.publication_date
  const before = structuredClone(source)
  assert.throws(() => normalizeSourceDateClaims(source), /no field-specific provenance/)
  assert.deepEqual(source, before)
})

test('historical replay values fail rather than being cleared or assigned provenance', () => {
  const active = activeById.get('bad-hidradenitis-suppurativa-guideline-2018')
  const tuple = historicalTuple.source_tuples.find((record) => record.source_id === active.source_id)
  const replay = structuredClone(active)
  delete replay.date_provenance
  for (const [fieldName, value] of Object.entries(tuple.stronger_dates)) replay[fieldName] = value
  const before = structuredClone(replay)
  assert.throws(() => normalizeSourceDateClaims(replay), /no field-specific provenance/)
  assert.deepEqual(replay, before)
})

test('provenance cannot be shared across fields, sources, or date values', () => {
  const wrongField = structuredClone(activeById.get('gmc-decision-making-consent-2024'))
  wrongField.revision_date = wrongField.effective_date
  wrongField.date_provenance.revision_date = structuredClone(wrongField.date_provenance.effective_date)
  assert.match(sourceDateSemanticsErrors(wrongField).join('\n'), /another field|cannot establish revision_date/)

  const wrongSource = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  wrongSource.source_id = 'another-source'
  assert.match(sourceDateSemanticsErrors(wrongSource).join('\n'), /another source|no authoritative/)

  const wrongDate = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  wrongDate.publication_date = '2020-11-19'
  assert.match(sourceDateSemanticsErrors(wrongDate).join('\n'), /another date value|another final date/)
})

test('provenance reviewedOn rejects impossible calendar days', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  source.date_provenance.publication_date.reviewedOn = '2026-02-30'
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /provenance reviewedOn is invalid/)
})

test('weaker or webpage metadata cannot establish a stronger date', () => {
  const webpage = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  webpage.date_provenance.publication_date.evidenceCategory = 'webpage_update_only'
  assert.match(sourceDateSemanticsErrors(webpage).join('\n'), /cannot establish publication_date/)

  const access = structuredClone(activeById.get('asa-basic-anesthetic-monitoring-2025'))
  access.date_provenance.revision_date.evidenceCategory = 'access_or_review_date_only'
  assert.match(sourceDateSemanticsErrors(access).join('\n'), /cannot establish revision_date/)
})

test('all five stronger fields reject a novel unregistered claim', () => {
  for (const fieldName of STRONGER_DATE_FIELDS) {
    const source = {
      source_id: `fixture-${fieldName}`,
      issuing_organisation: 'Fixture issuer',
      exact_document_title: 'Fixture document',
      exact_official_url: 'https://example.test/fixture',
      [fieldName]: '2026-07-10',
    }
    assert.match(sourceDateSemanticsErrors(source).join('\n'), /no field-specific provenance/)
  }
})

test('copying a historical tuple does not authorize a new source', () => {
  const tuple = historicalTuple.source_tuples[0]
  const source = {
    source_id: `copied-${tuple.source_id}`,
    issuing_organisation: tuple.issuing_organisation,
    exact_document_title: tuple.exact_document_title,
    exact_official_url: tuple.exact_official_url,
    ...tuple.stronger_dates,
  }
  assert.notEqual(sourceDateSemanticsErrors(source).length, 0)
})

test('month-precision weaker metadata remains valid without inventing a day', () => {
  const source = activeById.get('rch-pic-acute-abdominal-pain-children-2024')
  assert.equal(source.last_updated_date, '2024-04')
  assert.equal(classifyDatePrecision(source.last_updated_date).precision, 'month')
  assert.doesNotThrow(() => assertSourceDateSemantics(source))

  const invalid = structuredClone(source)
  invalid.last_updated_date = '2024-13'
  invalid.date_metadata_provenance.last_updated_date.dateValue = '2024-13'
  assert.match(sourceDateSemanticsErrors(invalid).join('\n'), /explicit day, month, or year/)
})

test('valid normalization returns a detached unchanged record', () => {
  const source = activeById.get('nice-acute-coronary-syndromes-ng185-2020')
  const normalized = normalizeSourceDateClaims(source)
  assert.deepEqual(normalized, source)
  assert.notEqual(normalized, source)
})

test('MOHAP unknown publication and webpage update retain distinct semantics', () => {
  const source = activeById.get('mohap-medical-leave-attestation-2026')
  assert.equal(source.publication_date, 'undated_on_official_page')
  assert.equal(source.effective_date, null)
  assert.equal(source.revision_date, null)
  assert.equal(source.webpage_last_updated_date, '2026-07-10')
  assert.equal(source.recency_verification.verified_on, '2026-07-15')
  assert.equal(source.superseded_status_check.checked_on, '2026-07-15')
  assert.equal(source.date_provenance.publication_date.provenanceStatus, 'approved_unknown')
  assert.equal(source.date_metadata_provenance.webpage_last_updated_date.evidenceCategory, 'webpage_update_only')
  assert.equal(Object.values(source.date_provenance).some((record) => record.dateValue === '2026-07-10'), false)
  assert.doesNotThrow(() => assertSourceDateSemantics(source))
})

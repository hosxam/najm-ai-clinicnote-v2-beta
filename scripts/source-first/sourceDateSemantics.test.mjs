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
  assignLabeledSourceDate,
  normalizeSourceDateClaims,
  sourceDateProvenanceDocument,
  sourceDateSemanticsErrors,
  sourceRecencyProvenanceBasis,
} from './sourceDateSemantics.mjs'
import {
  normalizeAndValidateReplaySource,
  validateActiveRegistrySource,
} from './sourceDateRegistryGate.mjs'

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
  assert.deepEqual(schemaFields, [
    'effective_date',
    'legal_effective_date',
    'publication_date',
    'revision_date',
    'service_commencement_date',
  ])
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

test('all active sources pass the same executable registry gate', () => {
  assert.equal(activeSources.length, 235)
  for (const source of activeSources) assert.equal(validateActiveRegistrySource(source), source)
})

test('every retained stronger date has exact field-specific inline provenance', () => {
  let count = 0
  for (const source of activeSources) {
    for (const fieldName of STRONGER_DATE_FIELDS) {
      if (typeof source[fieldName] !== 'string' || source[fieldName].trim() === '') continue
      count += 1
      const fieldProvenance = source.date_provenance?.[fieldName]
      assert.ok(fieldProvenance, `${source.source_id}.${fieldName}`)
      assert.equal(fieldProvenance.sourceId, source.source_id)
      assert.equal(fieldProvenance.fieldName, fieldName)
      assert.equal(fieldProvenance.dateValue, source[fieldName])
      assert.equal(PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES.includes(fieldProvenance.evidenceCategory), false)
    }
  }
  assert.equal(count, 28)
})

test('populated stronger dates without provenance fail closed', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  delete source.date_provenance.publication_date
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /no field-specific provenance/)
})

test('provenance cannot be shared across fields', () => {
  const source = structuredClone(activeById.get('gmc-decision-making-consent-2024'))
  source.revision_date = source.effective_date
  source.date_provenance.revision_date = structuredClone(source.date_provenance.effective_date)
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /another field|cannot establish revision_date/)
})

test('provenance cannot be shared across source IDs', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  source.source_id = 'another-source'
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /another source|no authoritative/)
})

test('provenance cannot be shared across date values', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  source.publication_date = '2020-11-19'
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /another date value|another final date/)
})

test('webpage-update provenance cannot establish a stronger date', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  source.date_provenance.publication_date.evidenceCategory = 'webpage_update_only'
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /cannot establish publication_date/)
})

test('access or review provenance cannot establish revision_date', () => {
  const source = structuredClone(activeById.get('asa-basic-anesthetic-monitoring-2025'))
  source.date_provenance.revision_date.evidenceCategory = 'access_or_review_date_only'
  assert.match(sourceDateSemanticsErrors(source).join('\n'), /cannot establish revision_date/)
})

test('all five stronger-date fields reject a novel unregistered claim', () => {
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

test('copying a historical tuple no longer validates a new source', () => {
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

test('legacy replay normalization cannot recreate removed stronger dates', () => {
  const active = activeById.get('bad-hidradenitis-suppurativa-guideline-2018')
  const tuple = historicalTuple.source_tuples.find((record) => record.source_id === active.source_id)
  const replay = structuredClone(active)
  delete replay.date_provenance
  for (const [fieldName, value] of Object.entries(tuple.stronger_dates)) replay[fieldName] = value
  const normalized = normalizeAndValidateReplaySource(replay)
  assert.equal(normalized.publication_date, null)
  assert.equal(normalized.effective_date, null)
})

test('duplicated publication and effective values require independent effective provenance', () => {
  const record = provenance.claimDispositions.find((candidate) => (
    candidate.fieldName === 'effective_date'
    && candidate.migrationClassification === 'D_DERIVED_OR_DUPLICATED_CLAIM'
  ))
  const active = activeById.get(record.sourceId)
  const replay = structuredClone(active)
  replay.effective_date = record.dateValue
  delete replay.date_provenance
  const normalized = normalizeSourceDateClaims(replay)
  assert.equal(normalized.effective_date, null)
})

test('replay normalization is deterministic', () => {
  const active = activeById.get('nice-acne-vulgaris-ng198-2026')
  const tuple = historicalTuple.source_tuples.find((record) => record.source_id === active.source_id)
  const replay = { ...structuredClone(active), ...tuple.stronger_dates }
  delete replay.date_provenance
  delete replay.date_metadata_provenance
  assert.deepEqual(normalizeSourceDateClaims(replay), normalizeSourceDateClaims(replay))
})

test('webpage update assignment remains a distinct weaker field', () => {
  const result = assignLabeledSourceDate({}, {
    label: 'Last updated',
    date: '2026-07-10',
    targetField: 'webpage_last_updated_date',
  })
  assert.equal(result.webpage_last_updated_date, '2026-07-10')
  assert.equal(result.revision_date, undefined)
})

test('stronger-date assignment requires a reviewed authoritative registry record', () => {
  assert.throws(
    () => assignLabeledSourceDate({ source_id: 'fixture' }, {
      label: 'Published',
      date: '2026-07-10',
      targetField: 'publication_date',
    }),
    /reviewed authoritative provenance registry entry/,
  )
})

test('source recency uses valid provenance without relabelling verification dates', () => {
  const counts = {
    explicit_stronger_date_provenance: 0,
    explicit_weaker_metadata_provenance: 0,
    source_access_and_verification_only: 0,
  }
  for (const source of activeSources) {
    const result = sourceRecencyProvenanceBasis(source)
    assert.equal(result.valid, true, source.source_id)
    counts[result.basis] += 1
  }
  assert.deepEqual(counts, {
    explicit_stronger_date_provenance: 28,
    explicit_weaker_metadata_provenance: 69,
    source_access_and_verification_only: 138,
  })
})

test('MOHAP webpage update remains weaker metadata only', () => {
  const source = activeById.get('mohap-medical-leave-attestation-2026')
  assert.equal(source.publication_date, 'undated_on_official_page')
  assert.equal(source.effective_date, null)
  assert.equal(source.revision_date, null)
  assert.equal(source.webpage_last_updated_date, '2026-07-10')
  assert.equal(source.recency_verification.verified_on, '2026-07-15')
  assert.equal(source.superseded_status_check.checked_on, '2026-07-15')
  assert.equal(source.date_metadata_provenance.webpage_last_updated_date.evidenceCategory, 'webpage_update_only')
  assert.equal(Object.values(source.date_provenance).some((record) => record.dateValue === '2026-07-10'), false)
  assert.doesNotThrow(() => assertSourceDateSemantics(source))
})

test('production replay gate rejects a source identity mismatch', () => {
  const source = structuredClone(activeById.get('nice-acute-coronary-syndromes-ng185-2020'))
  source.exact_official_url = 'https://example.test/wrong-source'
  assert.throws(() => normalizeAndValidateReplaySource(source), /identity mismatch/)
})

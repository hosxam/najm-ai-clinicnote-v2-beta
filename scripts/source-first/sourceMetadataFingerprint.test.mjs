import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canonicalizeSourceMetadataValue,
  fingerprintSourceMetadata,
  storedSourceMetadataFingerprint,
  verifyStoredSourceMetadataFingerprint,
} from './sourceMetadataFingerprint.mjs'

const OPTIONS = Object.freeze({
  fingerprintSchemaVersion: '1.0.0',
  provenanceMigrationVersion: '1.0.0',
})

function fixtureRecord(sourceId, registryFile = 'international_clinical_sources.json') {
  return {
    registryFile,
    registrySchemaVersion: '2.0.0',
    source: {
      source_id: sourceId,
      issuing_organisation: 'Example Authority',
      exact_document_title: `Example document ${sourceId}`,
      exact_official_url: `https://example.test/${sourceId}`,
      jurisdiction: 'Example jurisdiction',
      publication_date: '2024-07-15',
      effective_date: null,
      revision_date: null,
      version: 'Edition 2',
      webpage_last_updated_date: '2025-01-02',
      recency_verification: {
        verified_on: '2026-07-15',
        revision_due: '2026-10',
        status: 'current_official_page_opened',
      },
      superseded_status_check: {
        checked_on: '2026-07-15',
        status: 'current_no_superseding_source_identified',
      },
      date_provenance: {
        publication_date: {
          sourceId,
          fieldName: 'publication_date',
          dateValue: '2024-07-15',
          provenanceStatus: 'authoritative_explicit',
          evidenceCategory: 'explicit_publication_label',
          displayedLabel: 'published',
          exactEvidenceLocation: 'version',
          registeredSourceReference: `registry#${sourceId}`,
          sectionReference: null,
          reviewedOn: '2026-07-16',
          migrationVersion: '1.0.0',
        },
      },
      date_metadata_provenance: {
        webpage_last_updated_date: {
          sourceId,
          fieldName: 'webpage_last_updated_date',
          dateValue: '2025-01-02',
          evidenceCategory: 'webpage_update_only',
        },
      },
      source_recency: {
        schema_version: '1.0.0',
        policy_version: '1.0.0',
        evaluated_on: '2026-07-16',
        recency_basis: 'explicit_stronger_date',
        recency_outcome: 'explicit_stronger_date_current',
        basis_field: 'publication_date',
        basis_value: '2024-07-15',
        basis_precision: 'day',
        basis_comparison_date: '2024-07-15',
        verification_date: '2026-07-15',
        verification_age_days: 1,
        maximum_verification_age_days: 30,
        routine_recheck_due_on: '2026-08-14',
        recheck_warning_starts_on: '2026-08-07',
        next_required_recheck_date: '2026-08-14',
        remains_available: true,
        appears_superseded: false,
        recorded_recency_gap: false,
      },
      source_metadata_replay_ref: {
        manifest_path: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json',
        manifest_version: '2.0.0',
        source_id: sourceId,
        entry_digest: (sourceId === 'source-a' ? 'a' : 'b').repeat(64),
      },
    },
  }
}

function boundRecords() {
  return [fixtureRecord('source-b'), fixtureRecord('source-a', 'uae_clinical_sources.json')]
}

function reverseObjectKeys(value) {
  if (Array.isArray(value)) return value.map(reverseObjectKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).reverse().map((key) => [key, reverseObjectKeys(value[key])]))
  }
  return value
}

test('recursive canonicalization and source ordering are deterministic', () => {
  const records = boundRecords()
  const expected = fingerprintSourceMetadata(records, OPTIONS)
  const reordered = records.map(reverseObjectKeys).reverse()
  const actual = fingerprintSourceMetadata(reordered, OPTIONS)
  assert.equal(actual.fingerprint, expected.fingerprint)
  assert.deepEqual(actual.sourceFingerprints, expected.sourceFingerprints)
  assert.deepEqual(canonicalizeSourceMetadataValue({ z: 1, a: { y: 2, b: 3 } }), {
    a: { b: 3, y: 2 },
    z: 1,
  })
})

test('absent, null, approved unknown, and concrete date precision remain distinct', () => {
  const records = boundRecords()
  const absent = structuredClone(records)
  delete absent[0].source.publication_date
  const nullValue = structuredClone(records)
  nullValue[0].source.publication_date = null
  const approvedUnknown = structuredClone(records)
  approvedUnknown[0].source.publication_date = 'undated_on_official_page'
  const concrete = fingerprintSourceMetadata(records, OPTIONS)
  const values = [
    fingerprintSourceMetadata(absent, OPTIONS).fingerprint,
    fingerprintSourceMetadata(nullValue, OPTIONS).fingerprint,
    fingerprintSourceMetadata(approvedUnknown, OPTIONS).fingerprint,
    concrete.fingerprint,
  ]
  assert.equal(new Set(values).size, 4)
  const unknownRecord = fingerprintSourceMetadata(approvedUnknown, OPTIONS).canonicalRecords
    .find((record) => record.sourceId === 'source-b')
  assert.equal(unknownRecord.strongerDateFields.publication_date.state, 'approved_unknown')
  assert.equal(unknownRecord.datePrecision.publication_date.kind, 'approved_unknown')
  const concreteRecord = concrete.canonicalRecords.find((record) => record.sourceId === 'source-b')
  assert.equal(concreteRecord.datePrecision.publication_date.precision, 'day')
})

test('every authoritative metadata family changes the aggregate fingerprint', () => {
  const records = boundRecords()
  const baseline = fingerprintSourceMetadata(records, OPTIONS).fingerprint
  const mutations = [
    ['official URL', (value) => { value[0].source.exact_official_url = 'https://example.test/changed' }],
    ['source type', (value) => { value[0].registryFile = 'specialty_society_sources.json' }],
    ['jurisdiction', (value) => { value[0].source.jurisdiction = 'Changed jurisdiction' }],
    ['stronger date', (value) => { value[0].source.publication_date = '2024' }],
    ['webpage update metadata', (value) => { value[0].source.webpage_last_updated_date = '2025-02-03' }],
    ['version', (value) => { value[0].source.version = 'Edition 3' }],
    ['verification date', (value) => { value[0].source.recency_verification.verified_on = '2026-07-14' }],
    ['persisted provenance', (value) => { value[0].source.date_provenance.publication_date.displayedLabel = 'document dated' }],
    ['recency outcome', (value) => { value[0].source.source_recency.recency_outcome = 'recheck_due' }],
    ['next recheck', (value) => { value[0].source.source_recency.next_required_recheck_date = '2026-08-13' }],
    ['recency policy schema', (value) => { value[0].source.source_recency.policy_version = '2.0.0' }],
    ['registry schema', (value) => { value[0].registrySchemaVersion = '3.0.0' }],
    ['replay reference', (value) => { value[0].source.source_metadata_replay_ref.manifest_path = 'changed-manifest.json' }],
  ]
  for (const [label, mutate] of mutations) {
    const changed = structuredClone(records)
    mutate(changed)
    assert.notEqual(fingerprintSourceMetadata(changed, OPTIONS).fingerprint, baseline, label)
  }
  assert.notEqual(fingerprintSourceMetadata(records, {
    ...OPTIONS,
    provenanceMigrationVersion: '2.0.0',
  }).fingerprint, baseline)
})

test('the exact manifest-derived replay reference participates in each source fingerprint', () => {
  const records = boundRecords()
  const baseline = fingerprintSourceMetadata(records, OPTIONS)
  const changed = structuredClone(records)
  changed[0].source.source_metadata_replay_ref.entry_digest = 'c'.repeat(64)
  const mutated = fingerprintSourceMetadata(changed, OPTIONS)
  assert.notEqual(mutated.sourceFingerprints['source-b'], baseline.sourceFingerprints['source-b'])
  assert.notEqual(mutated.fingerprint, baseline.fingerprint)
})

test('nested weaker revision-due metadata retains raw value and precision', () => {
  const records = boundRecords()
  const baseline = fingerprintSourceMetadata(records, OPTIONS)
  const record = baseline.canonicalRecords.find((entry) => entry.sourceId === 'source-b')
  assert.deepEqual(record.weakerDateFields['recency_verification.revision_due'], {
    state: 'value',
    value: '2026-10',
  })
  assert.equal(record.datePrecision['recency_verification.revision_due'].precision, 'month')

  const changed = structuredClone(records)
  changed[0].source.recency_verification.revision_due = '2027'
  assert.notEqual(fingerprintSourceMetadata(changed, OPTIONS).fingerprint, baseline.fingerprint)
})

test('volatile runtime timestamps are recursively excluded', () => {
  const records = boundRecords()
  const baseline = fingerprintSourceMetadata(records, OPTIONS)
  const changed = structuredClone(records)
  changed[0].source.date_provenance.publication_date.runtime_timestamp = '2099-01-01T00:00:00Z'
  changed[0].source.source_recency.generatedAt = '2099-01-01T00:00:00Z'
  const actual = fingerprintSourceMetadata(changed, OPTIONS)
  assert.equal(actual.fingerprint, baseline.fingerprint)
})

test('stored verification returns structured aggregate and per-source findings', () => {
  const records = boundRecords()
  const stored = storedSourceMetadataFingerprint(records, OPTIONS)
  const valid = verifyStoredSourceMetadataFingerprint(records, stored)
  assert.equal(valid.status, 'PASS')
  assert.deepEqual(valid.issues, [])

  const corrupted = structuredClone(stored)
  corrupted.fingerprint = '0'.repeat(64)
  corrupted.sourceFingerprints['source-a'] = '1'.repeat(64)
  const invalid = verifyStoredSourceMetadataFingerprint(records, corrupted)
  assert.equal(invalid.status, 'FAIL')
  assert(invalid.issues.some((entry) => entry.code === 'stored_aggregate_fingerprint_mismatch'))
  assert(invalid.issues.some((entry) => entry.code === 'stored_source_fingerprint_mismatch' && entry.sourceId === 'source-a'))
})

test('stored verification rejects stale or missing contract bindings', () => {
  const records = boundRecords()
  const stored = storedSourceMetadataFingerprint(records, OPTIONS)
  const stale = structuredClone(stored)
  stale.schemaVersion = '0.9.0'
  stale.provenanceMigrationVersion = '0.9.0'
  stale.recencyPolicyVersion = null
  stale.schemaBindings.replayManifestVersions = ['1.0.0']
  const result = verifyStoredSourceMetadataFingerprint(records, stale)
  assert.equal(result.status, 'FAIL')
  assert(result.issues.some((entry) => entry.code === 'stored_schema_version_mismatch'))
  assert(result.issues.some((entry) => entry.code === 'stored_migration_version_mismatch'))
  assert(result.issues.some((entry) => entry.code === 'recency_policy_version_mismatch'))
  assert(result.issues.some((entry) => entry.code === 'stored_schema_bindings_mismatch'))
})

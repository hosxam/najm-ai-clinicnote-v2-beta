import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fingerprintSourceMetadata,
  storedSourceMetadataFingerprint,
} from './sourceMetadataFingerprint.mjs'
import {
  validatePersistedSourceMetadata,
  verifySourceMetadataReproducibility,
} from './sourceMetadataReproducibility.mjs'

const OPTIONS = Object.freeze({
  fingerprintSchemaVersion: '1.0.0',
  provenanceMigrationVersion: '1.0.0',
})

function fixtureRecord(sourceId) {
  return {
    registryFile: 'international_clinical_sources.json',
    registrySchemaVersion: '2.0.0',
    source: {
      source_id: sourceId,
      issuing_organisation: 'Example Authority',
      exact_document_title: `Example ${sourceId}`,
      exact_official_url: `https://example.test/${sourceId}`,
      jurisdiction: 'Example jurisdiction',
      publication_date: null,
      effective_date: null,
      revision_date: null,
      version: 'Current page',
      recency_verification: {
        verified_on: '2026-07-15',
        status: 'current_official_page_opened',
      },
      superseded_status_check: {
        checked_on: '2026-07-15',
        status: 'current_no_superseding_source_identified',
      },
      source_recency: {
        schema_version: '1.0.0',
        policy_version: '1.0.0',
        evaluated_on: '2026-07-16',
        recency_basis: 'access_verification_only',
        recency_outcome: 'access_verification_current',
        basis_field: 'recency_verification.verified_on',
        basis_value: '2026-07-15',
        basis_precision: 'day',
        basis_comparison_date: '2026-07-15',
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

function fixture() {
  const records = [fixtureRecord('source-a'), fixtureRecord('source-b')]
  const fingerprint = fingerprintSourceMetadata(records, OPTIONS)
  const storedRecord = storedSourceMetadataFingerprint(records, OPTIONS)
  const replayVerification = {
    errors: [],
    manifest: { manifestFingerprint: 'c'.repeat(64) },
    replay: {
      records: structuredClone(records),
      modulePaths: ['scripts/source-first/batches/example.mjs'],
      fingerprint,
    },
  }
  const independentManifestBuild = {
    manifest: structuredClone(replayVerification.manifest),
  }
  return { records, storedRecord, replayVerification, independentManifestBuild }
}

test('aggregate reproducibility passes when provenance, recomputed manifest, replay, and all fingerprints agree', async () => {
  const { records, storedRecord, replayVerification, independentManifestBuild } = fixture()
  const result = await verifySourceMetadataReproducibility({
    activeRecords: records,
    storedRecord,
    replayVerification,
    independentManifestBuild,
    validateRecords: () => [],
  })
  assert.equal(result.status, 'PASS')
  assert.deepEqual(result.issues, [])
  assert.deepEqual(result.checks, {
    persistedDateProvenanceAndRecency: true,
    storedFingerprint: true,
    independentReplayManifest: true,
    committedBatchReplay: true,
    activeReplayFingerprintParity: true,
  })
  assert.equal(result.fingerprints.active, result.fingerprints.stored)
  assert.equal(result.fingerprints.active, result.fingerprints.replay)
  assert.equal(result.fingerprints.replayManifest, 'c'.repeat(64))
})

test('aggregate reproducibility reports exact replay fingerprint drift', async () => {
  const { records, storedRecord, replayVerification, independentManifestBuild } = fixture()
  const replayRecords = structuredClone(replayVerification.replay.records)
  replayRecords[0].source.exact_official_url = 'https://example.test/changed'
  replayVerification.replay.records = replayRecords
  replayVerification.replay.fingerprint = fingerprintSourceMetadata(replayRecords, OPTIONS)
  const result = await verifySourceMetadataReproducibility({
    activeRecords: records,
    storedRecord,
    replayVerification,
    independentManifestBuild,
    validateRecords: () => [],
  })
  assert.equal(result.status, 'FAIL')
  assert(result.issues.some((entry) => (
    entry.phase === 'active_replay_fingerprint'
    && entry.code === 'source_fingerprint_mismatch'
    && entry.sourceId === 'source-a'
  )))
})

test('aggregate reproducibility rejects a committed manifest that differs from independent reconstruction', async () => {
  const { records, storedRecord, replayVerification, independentManifestBuild } = fixture()
  replayVerification.manifest.manifestFingerprint = 'd'.repeat(64)
  const result = await verifySourceMetadataReproducibility({
    activeRecords: records,
    storedRecord,
    replayVerification,
    independentManifestBuild,
    validateRecords: () => [],
  })
  assert.equal(result.status, 'FAIL')
  assert(result.issues.some((entry) => (
    entry.phase === 'replay_manifest'
    && entry.code === 'replay_manifest_mismatch'
    && entry.fieldPath === '/manifestFingerprint'
  )))
  assert.equal(result.checks.independentReplayManifest, false)
})

test('aggregate reproducibility keeps provenance and recency failures structured', async () => {
  const { records, storedRecord, replayVerification, independentManifestBuild } = fixture()
  const result = await verifySourceMetadataReproducibility({
    activeRecords: records,
    storedRecord,
    replayVerification,
    independentManifestBuild,
    validateRecords: () => [{
      code: 'persisted_date_provenance_invalid',
      message: 'source-a.publication_date lacks persisted provenance',
      sourceId: 'source-a',
    }],
  })
  assert.equal(result.status, 'FAIL')
  assert(result.issues.some((entry) => (
    entry.phase === 'active_metadata'
    && entry.code === 'persisted_date_provenance_invalid'
    && entry.sourceId === 'source-a'
  )))
  assert.equal(result.checks.persistedDateProvenanceAndRecency, false)
})

test('default persisted metadata validation rejects missing recency state', () => {
  const record = fixtureRecord('source-missing-recency')
  delete record.source.source_recency
  const issues = validatePersistedSourceMetadata([record])
  assert(issues.some((entry) => entry.code === 'source_recency_parity_mismatch'))
})

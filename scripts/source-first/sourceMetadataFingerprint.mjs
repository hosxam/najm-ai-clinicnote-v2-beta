import fs from 'node:fs'
import path from 'node:path'
import { EXPANSION_DIR, sha256 } from './common.mjs'
import { STRONGER_DATE_MIGRATION_VERSION } from './sourceDateProvenanceContract.mjs'
import { classifyDatePrecision, sourceRecencyPolicy } from './sourceRecencyPolicy.mjs'

export const SOURCE_METADATA_FINGERPRINT_SCHEMA_VERSION = '1.0.0'
export const SOURCE_METADATA_REPLAY_MANIFEST_VERSION = '2.0.0'
export const SOURCE_METADATA_REPLAY_MANIFEST_REFERENCE = 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json'

export const SOURCE_REGISTRY_FILES = Object.freeze([
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
])

export const SOURCE_METADATA_FINGERPRINT_PATH = path.join(
  EXPANSION_DIR,
  'progress',
  'SOURCE_METADATA_FINGERPRINT.json',
)

const SOURCE_TYPES = Object.freeze({
  'international_clinical_sources.json': 'official_international_clinical_source',
  'nonclinical_operational_sources.json': 'official_nonclinical_operational_source',
  'specialty_society_sources.json': 'official_specialty_society_source',
  'uae_clinical_sources.json': 'official_uae_clinical_source',
})

const STRONGER_DATE_FIELDS = Object.freeze([
  'publication_date',
  'effective_date',
  'revision_date',
  'service_commencement_date',
  'legal_effective_date',
])

const WEAKER_DATE_FIELDS = Object.freeze([
  'webpage_last_updated_date',
  'last_updated_date',
  'source_modified_date',
  'source_reviewed_date',
])

export const VOLATILE_SOURCE_METADATA_KEYS = Object.freeze(new Set([
  'generatedAt',
  'generated_at',
  'runtimeTimestamp',
  'runtime_timestamp',
  'runtimeGeneratedAt',
  'runtime_generated_at',
]))

export function canonicalizeSourceMetadataValue(value) {
  if (Array.isArray(value)) return value.map(canonicalizeSourceMetadataValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => !VOLATILE_SOURCE_METADATA_KEYS.has(key))
        .sort()
        .map((key) => [key, canonicalizeSourceMetadataValue(value[key])]),
    )
  }
  return value
}

function fieldState(value, present, { classifyApprovedUnknown = false } = {}) {
  if (!present) return { state: 'absent' }
  if (value === null) return { state: 'null' }
  if (classifyApprovedUnknown && classifyDatePrecision(value).kind === 'approved_unknown') {
    return { state: 'approved_unknown', value }
  }
  return { state: 'value', value: canonicalizeSourceMetadataValue(value) }
}

function ownFieldState(record, fieldName, options) {
  return fieldState(record?.[fieldName], Object.hasOwn(record ?? {}, fieldName), options)
}

function nestedFieldState(record, pathParts) {
  let current = record
  for (const part of pathParts.slice(0, -1)) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, part)) return { state: 'absent' }
    current = current[part]
  }
  return ownFieldState(current, pathParts.at(-1))
}

function datePrecision(value, present) {
  return canonicalizeSourceMetadataValue(classifyDatePrecision(value, { present }))
}

function ownDatePrecision(record, fieldName) {
  return datePrecision(record?.[fieldName], Object.hasOwn(record ?? {}, fieldName))
}

function nestedDatePrecision(record, pathParts) {
  let current = record
  for (const part of pathParts.slice(0, -1)) {
    if (!current || typeof current !== 'object' || !Object.hasOwn(current, part)) return { state: 'absent' }
    current = current[part]
  }
  const fieldName = pathParts.at(-1)
  return datePrecision(current?.[fieldName], Object.hasOwn(current ?? {}, fieldName))
}

function issue(code, message, details = {}) {
  return { code, message, ...details }
}

function sortedUnique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))].sort()
}

export function loadActiveSourceRecords() {
  return SOURCE_REGISTRY_FILES.flatMap((registryFile) => {
    const registry = JSON.parse(fs.readFileSync(path.join(EXPANSION_DIR, 'sources', registryFile), 'utf8'))
    return (registry.sources ?? []).map((source) => ({
      registryFile,
      registrySchemaVersion: registry.schema_version,
      source,
    }))
  }).sort((left, right) => (
    left.source.source_id.localeCompare(right.source.source_id)
      || left.registryFile.localeCompare(right.registryFile)
  ))
}

export function canonicalSourceMetadataRecord({
  registryFile,
  registrySchemaVersion,
  source,
  provenanceMigrationVersion,
}) {
  const strongerDateFields = Object.fromEntries(STRONGER_DATE_FIELDS.map((fieldName) => [
    fieldName,
    ownFieldState(source, fieldName, { classifyApprovedUnknown: true }),
  ]))
  const weakerDateFields = Object.fromEntries(WEAKER_DATE_FIELDS.map((fieldName) => [
    fieldName,
    ownFieldState(source, fieldName),
  ]))
  weakerDateFields['recency_verification.revision_due'] = nestedFieldState(
    source,
    ['recency_verification', 'revision_due'],
  )
  const precision = Object.fromEntries([
    ...STRONGER_DATE_FIELDS.map((fieldName) => [fieldName, ownDatePrecision(source, fieldName)]),
    ...WEAKER_DATE_FIELDS.map((fieldName) => [fieldName, ownDatePrecision(source, fieldName)]),
    ['recency_verification.revision_due', nestedDatePrecision(source, ['recency_verification', 'revision_due'])],
    ['recency_verification.verified_on', nestedDatePrecision(source, ['recency_verification', 'verified_on'])],
    ['superseded_status_check.checked_on', nestedDatePrecision(source, ['superseded_status_check', 'checked_on'])],
    ['source_recency.basis_value', nestedDatePrecision(source, ['source_recency', 'basis_value'])],
    ['source_recency.verification_date', nestedDatePrecision(source, ['source_recency', 'verification_date'])],
    ['source_recency.routine_recheck_due_on', nestedDatePrecision(source, ['source_recency', 'routine_recheck_due_on'])],
    ['source_recency.next_required_recheck_date', nestedDatePrecision(source, ['source_recency', 'next_required_recheck_date'])],
  ])

  return canonicalizeSourceMetadataValue({
    sourceId: source.source_id,
    sourceType: SOURCE_TYPES[registryFile] ?? 'unknown_source_type',
    registryFile,
    registrySchemaVersion,
    provenanceMigrationVersion,
    issuingOrganisation: ownFieldState(source, 'issuing_organisation'),
    exactDocumentTitle: ownFieldState(source, 'exact_document_title'),
    exactOfficialUrl: ownFieldState(source, 'exact_official_url'),
    jurisdiction: ownFieldState(source, 'jurisdiction'),
    strongerDateFields,
    weakerDateFields,
    datePrecision: precision,
    versionOrEdition: ownFieldState(source, 'version'),
    recencyVerification: ownFieldState(source, 'recency_verification'),
    supersededStatusCheck: ownFieldState(source, 'superseded_status_check'),
    persistedDateProvenance: ownFieldState(source, 'date_provenance'),
    persistedWeakerDateProvenance: ownFieldState(source, 'date_metadata_provenance'),
    sourceRecency: ownFieldState(source, 'source_recency'),
    recencyOutcome: nestedFieldState(source, ['source_recency', 'recency_outcome']),
    nextRecheckDate: nestedFieldState(source, ['source_recency', 'next_required_recheck_date']),
    recencyPolicyVersion: nestedFieldState(source, ['source_recency', 'policy_version']),
    sourceMetadataReplayReference: ownFieldState(source, 'source_metadata_replay_ref'),
  })
}

export function fingerprintSourceMetadata(records, {
  provenanceMigrationVersion = STRONGER_DATE_MIGRATION_VERSION,
  fingerprintSchemaVersion = SOURCE_METADATA_FINGERPRINT_SCHEMA_VERSION,
} = {}) {
  const canonicalRecords = records
    .map((record) => canonicalSourceMetadataRecord({ ...record, provenanceMigrationVersion }))
    .sort((left, right) => left.sourceId.localeCompare(right.sourceId) || left.registryFile.localeCompare(right.registryFile))
  const duplicateSourceIds = canonicalRecords
    .filter((record, index) => index > 0 && record.sourceId === canonicalRecords[index - 1].sourceId)
    .map((record) => record.sourceId)
  if (duplicateSourceIds.length > 0) {
    throw new Error(`Duplicate source IDs cannot be fingerprinted: ${sortedUnique(duplicateSourceIds).join(', ')}`)
  }

  const sourceFingerprints = Object.fromEntries(canonicalRecords.map((record) => [
    record.sourceId,
    sha256(record),
  ]))
  const schemaBindings = canonicalizeSourceMetadataValue({
    fingerprintSchemaVersion,
    provenanceMigrationVersion,
    registrySchemaVersions: sortedUnique(canonicalRecords.map((record) => record.registrySchemaVersion)),
    recencyPolicyVersions: sortedUnique(canonicalRecords
      .filter((record) => record.recencyPolicyVersion.state === 'value')
      .map((record) => record.recencyPolicyVersion.value)),
    replayManifestVersions: sortedUnique(canonicalRecords
      .filter((record) => record.sourceMetadataReplayReference.state === 'value')
      .map((record) => record.sourceMetadataReplayReference.value?.manifest_version)),
  })
  const fingerprintInput = canonicalizeSourceMetadataValue({
    fingerprintSchemaVersion,
    provenanceMigrationVersion,
    schemaBindings,
    sourceCount: canonicalRecords.length,
    sourceFingerprints,
    canonicalRecords,
  })
  return {
    fingerprintSchemaVersion,
    provenanceMigrationVersion,
    schemaBindings,
    sourceCount: canonicalRecords.length,
    sourceFingerprints,
    fingerprint: sha256(fingerprintInput),
    canonicalRecords,
  }
}

export function storedSourceMetadataFingerprint(records, options = {}) {
  const result = fingerprintSourceMetadata(records, options)
  const recencyPolicyVersion = result.schemaBindings.recencyPolicyVersions.length === 1
    ? result.schemaBindings.recencyPolicyVersions[0]
    : null
  return {
    schemaVersion: result.fingerprintSchemaVersion,
    provenanceMigrationVersion: result.provenanceMigrationVersion,
    recencyPolicyVersion,
    schemaBindings: result.schemaBindings,
    sourceCount: result.sourceCount,
    sourceFingerprints: result.sourceFingerprints,
    fingerprint: result.fingerprint,
    volatileRuntimeTimestampsIncluded: false,
    coveredMetadata: [
      'source identity, official URL, source type, jurisdiction, and registry schema',
      'all stronger date fields with absent, null, approved-unknown, and precision distinction',
      'weaker webpage update, modification, and review metadata with precision',
      'version or edition metadata and access/superseded verification dates',
      'persisted stronger and weaker date provenance',
      'recency basis, operational outcome, and next required recheck date',
      'exact source-metadata replay manifest path, version, source ID, and entry digest reference',
      'fingerprint, recency-policy, replay-manifest, registry, and provenance-migration schemas',
    ],
  }
}

export function compareSourceMetadataFingerprintResults(left, right, {
  leftLabel = 'left',
  rightLabel = 'right',
} = {}) {
  const issues = []
  if (left.fingerprintSchemaVersion !== right.fingerprintSchemaVersion) {
    issues.push(issue('fingerprint_schema_mismatch', `${leftLabel} and ${rightLabel} fingerprint schema versions differ`, {
      expected: left.fingerprintSchemaVersion,
      actual: right.fingerprintSchemaVersion,
    }))
  }
  if (left.provenanceMigrationVersion !== right.provenanceMigrationVersion) {
    issues.push(issue('provenance_migration_version_mismatch', `${leftLabel} and ${rightLabel} provenance migration versions differ`, {
      expected: left.provenanceMigrationVersion,
      actual: right.provenanceMigrationVersion,
    }))
  }
  if (left.sourceCount !== right.sourceCount) {
    issues.push(issue('source_count_mismatch', `${leftLabel} and ${rightLabel} source counts differ`, {
      expected: left.sourceCount,
      actual: right.sourceCount,
    }))
  }
  if (left.fingerprint !== right.fingerprint) {
    issues.push(issue('aggregate_fingerprint_mismatch', `${leftLabel} and ${rightLabel} aggregate source-metadata fingerprints differ`, {
      expected: left.fingerprint,
      actual: right.fingerprint,
    }))
  }
  for (const [sourceId, expected] of Object.entries(left.sourceFingerprints ?? {})) {
    if (!Object.hasOwn(right.sourceFingerprints ?? {}, sourceId)) {
      issues.push(issue('source_missing', `${sourceId}: missing from ${rightLabel} fingerprint set`, { sourceId }))
    } else if (right.sourceFingerprints[sourceId] !== expected) {
      issues.push(issue('source_fingerprint_mismatch', `${sourceId}: ${leftLabel} and ${rightLabel} source-metadata fingerprints differ`, {
        sourceId,
        expected,
        actual: right.sourceFingerprints[sourceId],
      }))
    }
  }
  for (const sourceId of Object.keys(right.sourceFingerprints ?? {})) {
    if (!Object.hasOwn(left.sourceFingerprints ?? {}, sourceId)) {
      issues.push(issue('unexpected_source', `${sourceId}: present only in ${rightLabel} fingerprint set`, { sourceId }))
    }
  }
  return issues
}

export function verifyStoredSourceMetadataFingerprint(records, storedRecord, {
  fingerprintSchemaVersion = SOURCE_METADATA_FINGERPRINT_SCHEMA_VERSION,
  provenanceMigrationVersion = STRONGER_DATE_MIGRATION_VERSION,
  recencyPolicyVersion = sourceRecencyPolicy().policy_version,
  replayManifestVersion = SOURCE_METADATA_REPLAY_MANIFEST_VERSION,
  replayManifestPath = SOURCE_METADATA_REPLAY_MANIFEST_REFERENCE,
} = {}) {
  const actual = fingerprintSourceMetadata(records, {
    provenanceMigrationVersion,
    fingerprintSchemaVersion,
  })
  const issues = []
  if (storedRecord.schemaVersion !== fingerprintSchemaVersion) {
    issues.push(issue('stored_schema_version_mismatch', 'stored fingerprint schema version differs', {
      expected: fingerprintSchemaVersion,
      actual: storedRecord.schemaVersion,
    }))
  }
  if (storedRecord.provenanceMigrationVersion !== provenanceMigrationVersion) {
    issues.push(issue('stored_migration_version_mismatch', 'stored provenance migration version differs', {
      expected: provenanceMigrationVersion,
      actual: storedRecord.provenanceMigrationVersion,
    }))
  }
  if (storedRecord.sourceCount !== actual.sourceCount) {
    issues.push(issue('stored_source_count_mismatch', `source count differs: ${storedRecord.sourceCount} != ${actual.sourceCount}`, {
      expected: actual.sourceCount,
      actual: storedRecord.sourceCount,
    }))
  }
  if (storedRecord.fingerprint !== actual.fingerprint) {
    issues.push(issue('stored_aggregate_fingerprint_mismatch', 'aggregate source-metadata fingerprint differs', {
      expected: actual.fingerprint,
      actual: storedRecord.fingerprint,
    }))
  }
  if (storedRecord.volatileRuntimeTimestampsIncluded !== false) {
    issues.push(issue('volatile_timestamp_contract_mismatch', 'stored fingerprint must explicitly exclude volatile runtime timestamps'))
  }
  if (storedRecord.recencyPolicyVersion !== recencyPolicyVersion) {
    issues.push(issue('recency_policy_version_mismatch', 'stored recency policy version differs from the committed policy', {
      expected: recencyPolicyVersion,
      actual: storedRecord.recencyPolicyVersion,
    }))
  }
  const expectedBindings = canonicalizeSourceMetadataValue({
    ...actual.schemaBindings,
    recencyPolicyVersions: [recencyPolicyVersion],
    replayManifestVersions: [replayManifestVersion],
  })
  if (JSON.stringify(canonicalizeSourceMetadataValue(storedRecord.schemaBindings))
    !== JSON.stringify(expectedBindings)) {
    issues.push(issue('stored_schema_bindings_mismatch', 'stored schema bindings differ from current committed contracts', {
      expected: expectedBindings,
      actual: storedRecord.schemaBindings,
    }))
  }

  const activeById = new Map(records.map((record) => [record.source.source_id, record.source]))
  for (const [sourceId, expected] of Object.entries(actual.sourceFingerprints)) {
    if (!Object.hasOwn(storedRecord.sourceFingerprints ?? {}, sourceId)) {
      issues.push(issue('stored_source_missing', `${sourceId}: stored fingerprint is missing`, { sourceId }))
    } else if (storedRecord.sourceFingerprints[sourceId] !== expected) {
      issues.push(issue('stored_source_fingerprint_mismatch', `${sourceId}: source-metadata fingerprint differs`, {
        sourceId,
        expected,
        actual: storedRecord.sourceFingerprints[sourceId],
      }))
    }
    const replayReference = activeById.get(sourceId)?.source_metadata_replay_ref
    if (!replayReference) {
      issues.push(issue('replay_reference_missing', `${sourceId}: source_metadata_replay_ref is required`, { sourceId }))
    } else if (replayReference.source_id !== sourceId) {
      issues.push(issue('replay_reference_source_mismatch', `${sourceId}: replay reference source_id differs`, {
        sourceId,
        expected: sourceId,
        actual: replayReference.source_id,
      }))
    }
    if (replayReference && replayReference.manifest_path !== replayManifestPath) {
      issues.push(issue('replay_reference_manifest_path_mismatch', `${sourceId}: replay reference manifest_path differs from the committed manifest`, {
        sourceId,
        expected: replayManifestPath,
        actual: replayReference.manifest_path,
      }))
    }
    if (replayReference && replayReference.manifest_version !== replayManifestVersion) {
      issues.push(issue('replay_reference_manifest_version_mismatch', `${sourceId}: replay reference manifest_version differs from the committed contract`, {
        sourceId,
        expected: replayManifestVersion,
        actual: replayReference.manifest_version,
      }))
    }
    if (replayReference && !/^[0-9a-f]{64}$/.test(replayReference.entry_digest ?? '')) {
      issues.push(issue('replay_reference_entry_digest_invalid', `${sourceId}: replay reference entry_digest must be a SHA-256 digest`, {
        sourceId,
        actual: replayReference.entry_digest,
      }))
    }
  }
  for (const sourceId of Object.keys(storedRecord.sourceFingerprints ?? {})) {
    if (!Object.hasOwn(actual.sourceFingerprints, sourceId)) {
      issues.push(issue('stored_source_unexpected', `${sourceId}: stored fingerprint has no active source`, { sourceId }))
    }
  }
  return {
    status: issues.length === 0 ? 'PASS' : 'FAIL',
    errors: issues.map((entry) => entry.message),
    issues,
    actual,
  }
}

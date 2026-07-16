import path from 'node:path'
import { ROOT_DIR, sha256 } from './common.mjs'
import {
  resolveSourceUpdateAgainstState,
  sourceUpdateIdentity,
} from './sourceApplicationEngine.mjs'
import {
  assertSourceDateSemantics,
  sourceDateProvenanceDocument,
} from './sourceDateSemantics.mjs'
import {
  classifySourceRecency,
  sourceRecencyPolicy,
  validatePersistedSourceRecency,
} from './sourceRecencyPolicy.mjs'
import { STRONGER_DATE_FIELDS } from './sourceDateProvenanceContract.mjs'

export const SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE = 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json'

const AUTHORITATIVE_PROVENANCE_STATUSES = new Set(['authoritative_explicit', 'approved_unknown'])

export const SOURCE_METADATA_DATE_STATE_FIELDS = Object.freeze([
  ...STRONGER_DATE_FIELDS,
  'webpage_last_updated_date',
  'last_updated_date',
  'source_modified_date',
  'source_reviewed_date',
  'recency_verification.verified_on',
  'recency_verification.revision_due',
  'superseded_status_check.checked_on',
])

function relativeModulePath(modulePath) {
  if (!modulePath) return null
  return path.relative(ROOT_DIR, modulePath).replaceAll('\\', '/')
}

function inlineProvenanceRecord(record, fieldName = record.fieldName, dateValue = record.finalDateValue) {
  return {
    sourceId: record.sourceId,
    fieldName,
    dateValue,
    provenanceStatus: record.provenanceStatus,
    evidenceCategory: record.evidenceCategory,
    displayedLabel: record.displayedLabel,
    exactEvidenceLocation: record.exactEvidenceLocation,
    registeredSourceReference: record.registeredSourceReference,
    sectionReference: record.sectionReference,
    reviewedOn: record.reviewedOn,
    verificationMethod: record.verificationMethod,
    migrationVersion: record.migrationVersion,
  }
}

function setNestedDateMetadata(source, fieldName, value) {
  if (fieldName === 'recency_verification.revision_due') {
    source.recency_verification = {
      ...(source.recency_verification ?? {}),
      revision_due: value,
    }
    return
  }
  source[fieldName] = value
}

function reviewedProvenanceForSource(provenanceDocument, sourceId) {
  return {
    claims: (provenanceDocument.claimDispositions ?? []).filter((record) => record.sourceId === sourceId),
    weakerMetadata: (provenanceDocument.weakerMetadataRecords ?? []).filter((record) => record.sourceId === sourceId),
  }
}

function fieldState(source, fieldName) {
  const pathParts = fieldName.split('.')
  let record = source
  for (const part of pathParts.slice(0, -1)) {
    if (!record || typeof record !== 'object' || !Object.hasOwn(record, part)) return { state: 'absent' }
    record = record[part]
  }
  const leaf = pathParts.at(-1)
  if (!record || typeof record !== 'object' || !Object.hasOwn(record, leaf)) return { state: 'absent' }
  if (record[leaf] === null) return { state: 'null' }
  return { state: 'value', value: record[leaf] }
}

export function dateProvenanceIndexForSource(provenanceDocument, source) {
  const sourceId = source.source_id
  const { claims, weakerMetadata } = reviewedProvenanceForSource(provenanceDocument, sourceId)
  return {
    dateFieldStates: SOURCE_METADATA_DATE_STATE_FIELDS.map((fieldName) => ({
      fieldName,
      ...fieldState(source, fieldName),
    })),
    retainedProvenanceRefs: claims.filter((record) => (
      record.finalDateValue !== null
      && record.finalDateValue !== undefined
      && AUTHORITATIVE_PROVENANCE_STATUSES.has(record.provenanceStatus)
    )).map((record) => ({
      recordKey: `${record.sourceId}::${record.fieldName}`,
      fieldName: record.fieldName,
    })).sort((left, right) => left.recordKey.localeCompare(right.recordKey)),
    weakerMetadataRefs: weakerMetadata.map((record) => ({
      recordKey: `${record.sourceId}::${record.fieldName}::${record.dateValue}`,
      fieldName: record.fieldName,
      dateValue: record.dateValue,
    })).sort((left, right) => left.recordKey.localeCompare(right.recordKey)),
  }
}

function materializeReviewedDateMetadata(source, provenanceDocument) {
  const normalized = structuredClone(source)
  delete normalized.date_provenance
  delete normalized.date_metadata_provenance
  delete normalized.source_recency
  delete normalized.source_metadata_replay_ref

  const { claims, weakerMetadata } = reviewedProvenanceForSource(provenanceDocument, normalized.source_id)
  const dateProvenance = {}
  for (const record of claims) {
    normalized[record.fieldName] = record.finalDateValue
    if (record.finalDateValue !== null
      && record.finalDateValue !== undefined
      && AUTHORITATIVE_PROVENANCE_STATUSES.has(record.provenanceStatus)) {
      dateProvenance[record.fieldName] = inlineProvenanceRecord(record)
    }
  }
  if (Object.keys(dateProvenance).length > 0) normalized.date_provenance = dateProvenance

  const weakerProvenance = {}
  for (const record of weakerMetadata) {
    setNestedDateMetadata(normalized, record.fieldName, record.dateValue)
    weakerProvenance[record.fieldName] = inlineProvenanceRecord(record, record.fieldName, record.dateValue)
  }
  if (Object.keys(weakerProvenance).length > 0) normalized.date_metadata_provenance = weakerProvenance
  return normalized
}

function manifestSourceEntry({ manifest, sourceUpdate, sourceId, registryFile, modulePath, batch }) {
  if (!manifest) return null
  const moduleReference = relativeModulePath(modulePath)
  const batchEntry = manifest.batches?.find((entry) => entry.modulePath === moduleReference)
  if (!batchEntry || batchEntry.batchId !== batch?.batch_id) {
    throw new Error(`[source-date-registry] ${moduleReference}: batch is absent from the replay manifest`)
  }
  const updateIdentity = sourceUpdateIdentity(sourceUpdate)
  const operationDigest = sha256(sourceUpdate)
  const operation = batchEntry.operations?.find((entry) => (
    entry.sourceId === sourceId
    && entry.registryFile === registryFile
    && entry.operation === updateIdentity.operation
    && entry.operationDigest === operationDigest
  ))
  if (!operation) {
    throw new Error(`[source-date-registry] ${moduleReference}: ${sourceId} exact operation type/digest is absent from the replay manifest`)
  }
  const sourceEntry = manifest.sources?.find((entry) => entry.sourceId === sourceId)
  if (!sourceEntry || sourceEntry.registryFile !== registryFile) {
    throw new Error(`[source-date-registry] ${sourceId}: registry ownership differs from the replay manifest`)
  }
  const expectedHistoryOperation = {
    modulePath: moduleReference,
    batchId: batch.batch_id,
    operation: updateIdentity.operation,
    operationDigest,
  }
  if (!(sourceEntry.operationHistory ?? []).some((entry) => sha256(entry) === sha256(expectedHistoryOperation))) {
    throw new Error(`[source-date-registry] ${sourceId}: operation is absent from source ownership history`)
  }
  if (!sourceEntry.owner || sha256(sourceEntry.owner) !== sha256(sourceEntry.operationHistory[0])) {
    throw new Error(`[source-date-registry] ${sourceId}: source owner is not the first operation history entry`)
  }
  return sourceEntry
}

function nestedDateMetadata(source, fieldName) {
  return fieldName === 'recency_verification.revision_due'
    ? source?.recency_verification?.revision_due
    : source?.[fieldName]
}

export function validateManifestDateProvenanceIndex({
  source,
  sourceEntry,
  provenanceDocument,
  finalState = false,
}) {
  const expectedIndex = dateProvenanceIndexForSource(provenanceDocument, source)
  const referencesMatch = sha256({
    retainedProvenanceRefs: sourceEntry.dateProvenanceIndex.retainedProvenanceRefs,
    weakerMetadataRefs: sourceEntry.dateProvenanceIndex.weakerMetadataRefs,
  }) === sha256({
    retainedProvenanceRefs: expectedIndex.retainedProvenanceRefs,
    weakerMetadataRefs: expectedIndex.weakerMetadataRefs,
  })
  if (!referencesMatch || (finalState && sha256(sourceEntry.dateProvenanceIndex) !== sha256(expectedIndex))) {
    throw new Error(`[source-date-registry] ${source.source_id}: manifest date-provenance index differs from the authoritative provenance document`)
  }
  const statesToValidate = finalState
    ? sourceEntry.dateProvenanceIndex.dateFieldStates
    : sourceEntry.dateProvenanceIndex.dateFieldStates.filter((state) => STRONGER_DATE_FIELDS.includes(state.fieldName))
  for (const state of statesToValidate) {
    if (sha256(fieldState(source, state.fieldName)) !== sha256({
      state: state.state,
      ...(state.state === 'value' ? { value: state.value } : {}),
    })) {
      throw new Error(`[source-date-registry] ${source.source_id}.${state.fieldName}: materialized date state differs from the manifest`)
    }
  }
  for (const reference of sourceEntry.dateProvenanceIndex.retainedProvenanceRefs) {
    const inline = source.date_provenance?.[reference.fieldName]
    if (!inline || `${inline.sourceId}::${inline.fieldName}` !== reference.recordKey) {
      throw new Error(`[source-date-registry] ${source.source_id}.${reference.fieldName}: materialized date state differs from the manifest`)
    }
  }
  for (const reference of sourceEntry.dateProvenanceIndex.weakerMetadataRefs) {
    if (nestedDateMetadata(source, reference.fieldName) !== reference.dateValue) {
      throw new Error(`[source-date-registry] ${source.source_id}.${reference.fieldName}: materialized weaker metadata differs from the manifest`)
    }
    const inline = source.date_metadata_provenance?.[reference.fieldName]
    if (!inline || inline.dateValue !== reference.dateValue
      || `${inline.sourceId}::${inline.fieldName}::${inline.dateValue}` !== reference.recordKey) {
      throw new Error(`[source-date-registry] ${source.source_id}.${reference.fieldName}: inline weaker provenance differs from the manifest`)
    }
  }
}

export function normalizeAndValidateReplaySource({
  sourceUpdate,
  modulePath,
  batch,
  registryState,
  manifest,
  provenanceDocument = sourceDateProvenanceDocument(),
  asOfDate = sourceRecencyPolicy().evaluation_date,
  deferValidation = false,
}) {
  if (batch?.source_metadata_manifest_ref !== SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE) {
    throw new Error(`[source-date-registry] ${batch?.batch_id ?? 'unknown_batch'} lacks the committed replay-manifest reference`)
  }
  const identity = sourceUpdateIdentity(sourceUpdate)
  const resolved = resolveSourceUpdateAgainstState({ registryState, sourceUpdate })
  if (resolved.source.source_id !== identity.sourceId) {
    throw new Error('[source-date-registry] resolved source identity differs from the declared update')
  }
  const sourceEntry = manifestSourceEntry({
    manifest,
    sourceUpdate,
    sourceId: identity.sourceId,
    registryFile: resolved.registryFile,
    modulePath,
    batch,
  })
  const source = materializeReviewedDateMetadata(resolved.source, provenanceDocument)
  source.source_recency = classifySourceRecency(source, {
    as_of_date: asOfDate,
  })
  if (sourceEntry) {
    const { entryDigest, ...entryDigestInput } = sourceEntry
    if (!entryDigest || sha256(entryDigestInput) !== entryDigest) {
      throw new Error(`[source-date-registry] ${source.source_id}: replay-manifest entry digest is invalid`)
    }
    validateManifestDateProvenanceIndex({ source, sourceEntry, provenanceDocument })
    source.source_metadata_replay_ref = {
      manifest_path: SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE,
      manifest_version: manifest.schemaVersion,
      source_id: source.source_id,
      entry_digest: entryDigest,
    }
  }
  if (!deferValidation) {
    assertSourceDateSemantics(source)
    const recencyErrors = validatePersistedSourceRecency(source, { as_of_date: asOfDate })
    if (recencyErrors.length > 0) {
      throw new Error(`[source-date-registry] ${recencyErrors.join('; ')}`)
    }
  }
  return source
}

export function validateActiveRegistrySource(source) {
  assertSourceDateSemantics(source)
  const recencyErrors = validatePersistedSourceRecency(source, {
    as_of_date: source?.source_recency?.evaluated_on ?? sourceRecencyPolicy().evaluation_date,
  })
  if (recencyErrors.length > 0) {
    throw new Error(`[source-date-registry] ${recencyErrors.join('; ')}`)
  }
  return source
}

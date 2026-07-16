import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  sha256,
  writeJson,
} from './common.mjs'
import {
  PAGE_UPDATE_LABELS,
  PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES,
  SOURCE_DATE_EVIDENCE_CATEGORIES,
  STRONGER_DATE_FIELDS,
  STRONGER_DATE_MIGRATION_REVIEW_DATE,
  STRONGER_DATE_MIGRATION_VERSION,
  STRONGER_DATE_SOURCE_BASELINE_COMMIT,
  STRONGER_DATE_TUPLE_BASELINE_COMMIT,
  chooseWeakerMetadataField,
  classifyLegacyStrongerDateClaim,
  findExactLabeledDateEvidence,
  sourceIdentitySnapshot,
} from './sourceDateProvenanceContract.mjs'

const SOURCE_FILES = Object.freeze([
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
])
const TUPLE_PATH = path.join(EXPANSION_DIR, 'schema', 'ESTABLISHED_SOURCE_DATE_TUPLES.json')
const PROVENANCE_PATH = path.join(EXPANSION_DIR, 'schema', 'STRONGER_DATE_PROVENANCE.json')
const INVENTORY_PATH = path.join(EXPANSION_DIR, 'progress', 'stronger_date_claim_inventory.json')
const LEDGER_PATH = path.join(EXPANSION_DIR, 'progress', 'stronger_date_provenance_migration.json')
const HISTORICAL_TUPLE_REFERENCE = 'clinical-expansion-v2/schema/ESTABLISHED_SOURCE_DATE_TUPLES.json'
const LEGACY_DIRECT_ACCEPTANCE_KEYS = new Set([
  'nice-b12-deficiency-ng239-2024::publication_date',
  'nice-child-abuse-neglect-ng76-2017::publication_date',
  'nice-falls-ng249-2025::publication_date',
  'nice-hyperparathyroidism-ng132-2019::publication_date',
  'nice-self-harm-ng225-2022::publication_date',
  'nice-violence-aggression-ng10-2015::publication_date',
  'college-optometrists-eye-referral-annex4-current::publication_date',
  'college-optometrists-flashes-floaters-guidance-current::publication_date',
  'hrs-ishne-ambulatory-ecg-2017::publication_date',
  'hrs-remote-device-clinic-2023::publication_date',
  'mohap-medical-leave-attestation-2026::publication_date',
])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function sourceTypeForRegistry(registryFile, source) {
  if (source.source_type) return source.source_type
  return {
    'uae_clinical_sources.json': 'uae_official_clinical_or_regulatory_source',
    'international_clinical_sources.json': 'international_official_clinical_source',
    'specialty_society_sources.json': 'official_specialty_society_source',
    'nonclinical_operational_sources.json': 'official_nonclinical_operational_source',
  }[registryFile]
}

function replayLocations(sourceId) {
  const candidateFiles = [
    path.join(ROOT_DIR, 'scripts', 'recordInitialSourceResearch.mjs'),
    ...fs.readdirSync(path.join(ROOT_DIR, 'scripts', 'source-first', 'batches'))
      .filter((name) => name.endsWith('.mjs'))
      .sort()
      .map((name) => path.join(ROOT_DIR, 'scripts', 'source-first', 'batches', name)),
  ]
  const quotedPatterns = [`'${sourceId}'`, `"${sourceId}"`, `\`${sourceId}\``]
  return candidateFiles
    .filter((filePath) => quotedPatterns.some((pattern) => fs.readFileSync(filePath, 'utf8').includes(pattern)))
    .map((filePath) => path.relative(ROOT_DIR, filePath).replaceAll('\\', '/'))
}

function classificationCounts(records) {
  return Object.fromEntries([
    'A_EXPLICITLY_SUPPORTED',
    'B_WEBPAGE_UPDATE_ONLY',
    'C_ACCESS_OR_REVIEW_DATE_ONLY',
    'D_DERIVED_OR_DUPLICATED_CLAIM',
    'E_UNKNOWN_ON_OFFICIAL_SOURCE',
    'F_REQUIRES_SOURCE_METADATA_RECHECK',
  ].map((classification) => [
    classification,
    records.filter((record) => record.migrationClassification === classification).length,
  ]))
}

function countsByField(records) {
  return Object.fromEntries(STRONGER_DATE_FIELDS.map((fieldName) => [
    fieldName,
    {
      original: records.filter((record) => record.fieldName === fieldName).length,
      retained: records.filter((record) => record.fieldName === fieldName && record.finalDateValue !== null).length,
      cleared: records.filter((record) => record.fieldName === fieldName && record.finalDateValue === null).length,
    },
  ]))
}

function setNestedMetadata(source, targetField, value) {
  if (!targetField) return
  if (targetField === 'recency_verification.revision_due') {
    source.recency_verification = {
      ...(source.recency_verification ?? {}),
      revision_due: value,
    }
    return
  }
  source[targetField] = value
}

function actualNestedMetadata(source, targetField) {
  if (targetField === 'recency_verification.revision_due') {
    return source.recency_verification?.revision_due
  }
  return source[targetField]
}

function inlineProvenance(record, fieldName = record.fieldName, dateValue = record.finalDateValue) {
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

const tupleDocument = readJson(TUPLE_PATH)
if (
  tupleDocument.schema_version !== '1.0.0'
  || tupleDocument.baseline_commit !== STRONGER_DATE_TUPLE_BASELINE_COMMIT
) throw new Error('Unexpected historical stronger-date tuple baseline')

const registryDocuments = new Map()
const activeSourceById = new Map()
for (const registryFile of SOURCE_FILES) {
  const registryPath = path.join(EXPANSION_DIR, 'sources', registryFile)
  const document = readJson(registryPath)
  registryDocuments.set(registryFile, { registryPath, document })
  for (const [sourceIndex, source] of (document.sources ?? []).entries()) {
    if (activeSourceById.has(source.source_id)) throw new Error(`Duplicate active source ${source.source_id}`)
    activeSourceById.set(source.source_id, { registryFile, sourceIndex, source })
  }
}

if (activeSourceById.size !== 235 || tupleDocument.source_tuples.length !== 235) {
  throw new Error(`Expected 235 active sources and tuples, found ${activeSourceById.size}/${tupleDocument.source_tuples.length}`)
}

const inventoryClaims = []
const dispositionRecords = []
const migrationLedgerClaims = []

for (const tuple of [...tupleDocument.source_tuples].sort((left, right) => left.source_id.localeCompare(right.source_id))) {
  const active = activeSourceById.get(tuple.source_id)
  if (!active) throw new Error(`Historical tuple has no active source ${tuple.source_id}`)
  const { registryFile, sourceIndex, source } = active
  const identity = sourceIdentitySnapshot(source)
  if (
    tuple.issuing_organisation !== identity.issuingOrganisation
    || tuple.exact_document_title !== identity.exactDocumentTitle
    || tuple.exact_official_url !== identity.exactOfficialUrl
  ) throw new Error(`Historical tuple identity differs from active source ${tuple.source_id}`)

  const registeredSourceReference = `clinical-expansion-v2/sources/${registryFile}#/sources/${sourceIndex}`
  const sourceReplayLocations = replayLocations(tuple.source_id)

  for (const [fieldName, originalValue] of Object.entries(tuple.stronger_dates)) {
    const originalValues = tuple.stronger_dates
    const disposition = classifyLegacyStrongerDateClaim(source, fieldName, originalValue, originalValues)
    disposition.originalValue = originalValue
    disposition.targetMetadataField = chooseWeakerMetadataField(source, disposition)
    const legacyKey = `${tuple.source_id}::${fieldName}`
    const legacyDirectAcceptance = LEGACY_DIRECT_ACCEPTANCE_KEYS.has(legacyKey)
    const duplicateFields = Object.entries(originalValues)
      .filter(([otherField, otherValue]) => otherField !== fieldName && otherValue === originalValue)
      .map(([otherField]) => otherField)
      .sort()
    const sourceReference = `${registeredSourceReference} (${tuple.source_id})`
    const baseRecord = {
      sourceId: tuple.source_id,
      sourceTitle: source.exact_document_title,
      sourceType: sourceTypeForRegistry(registryFile, source),
      officialUrl: source.exact_official_url,
      fieldName,
      dateValue: originalValue,
      finalDateValue: disposition.finalValue,
      provenanceStatus: disposition.provenanceStatus,
      evidenceCategory: disposition.evidenceCategory,
      displayedLabel: disposition.evidence?.displayedLabel ?? null,
      exactEvidenceLocation: disposition.evidence?.exactEvidenceLocation ?? null,
      evidenceText: disposition.evidence?.evidenceText ?? null,
      registeredSourceReference: sourceReference,
      sectionReference: disposition.evidence?.sectionReference ?? null,
      reviewedOn: STRONGER_DATE_MIGRATION_REVIEW_DATE,
      verificationMethod: 'deterministic_registered_source_metadata_reconciliation',
      migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
      migrationClassification: disposition.migrationClassification,
      targetMetadataField: disposition.targetMetadataField,
      sourceIdentity: identity,
      replayableBatchLocations: sourceReplayLocations,
      replayStatus: sourceReplayLocations.length > 0
        ? 'legacy_replay_location_recorded'
        : 'registry_only_no_replay_definition_registered',
      migrationAction: disposition.migrationAction,
      migrationReason: disposition.migrationReason,
    }
    dispositionRecords.push(baseRecord)
    inventoryClaims.push({
      sourceId: tuple.source_id,
      sourceTitle: source.exact_document_title,
      sourceType: sourceTypeForRegistry(registryFile, source),
      officialUrl: source.exact_official_url,
      fieldName,
      currentFieldValue: originalValue,
      currentValidationBasis: legacyDirectAcceptance
        ? 'explicit_metadata_or_approved_unknown_with_tuple_fallback'
        : 'established_precontract_tuple_only',
      currentFrozenTupleEntry: {
        historicalFile: HISTORICAL_TUPLE_REFERENCE,
        baselineCommit: tupleDocument.baseline_commit,
        tupleValue: originalValue,
      },
      recordedSourceLabel: disposition.evidence?.displayedLabel ?? null,
      recordedExactSectionOrMetadataLocation: disposition.evidence?.exactEvidenceLocation ?? null,
      registeredDocumentOrSourceRecord: sourceReference,
      replayableBatchLocations: sourceReplayLocations,
      sameDateAppearsInOtherFields: duplicateFields,
      currentlyHasExplicitFieldSpecificProvenance: legacyDirectAcceptance,
      inventoryHash: sha256({ sourceId: tuple.source_id, fieldName, originalValue, sourceReference }),
    })
    migrationLedgerClaims.push({
      sourceId: tuple.source_id,
      fieldName,
      originalValue,
      finalValue: disposition.finalValue,
      originalAcceptanceBasis: legacyDirectAcceptance
        ? 'explicit_metadata_or_approved_unknown_with_tuple_fallback'
        : 'established_precontract_tuple_only',
      finalProvenanceStatus: disposition.provenanceStatus,
      finalEvidenceCategory: disposition.evidenceCategory,
      finalEvidenceReference: disposition.evidence
        ? `${sourceReference}#${disposition.evidence.exactEvidenceLocation}`
        : null,
      migrationClassification: disposition.migrationClassification,
      migrationAction: disposition.migrationAction,
      migrationReason: disposition.migrationReason,
      affectedActiveFile: `clinical-expansion-v2/sources/${registryFile}`,
      affectedReplayableBatches: sourceReplayLocations,
      reviewedByProcess: 'source-first-stronger-date-provenance-migration',
      migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
    })
  }
}

if (dispositionRecords.length !== 554) {
  throw new Error(`Expected 554 original stronger-date claims, found ${dispositionRecords.length}`)
}

const weakerMetadataByKey = new Map()
for (const record of dispositionRecords.filter((candidate) => candidate.targetMetadataField)) {
  const key = `${record.sourceId}::${record.targetMetadataField}::${record.dateValue}`
  const existing = weakerMetadataByKey.get(key)
  if (existing) {
    existing.derivedFromOriginalClaims.push(`${record.fieldName}:${record.dateValue}`)
    continue
  }
  weakerMetadataByKey.set(key, {
    sourceId: record.sourceId,
    fieldName: record.targetMetadataField,
    dateValue: record.dateValue,
    provenanceStatus: 'weaker_metadata_only',
    evidenceCategory: record.evidenceCategory,
    displayedLabel: record.displayedLabel,
    exactEvidenceLocation: record.exactEvidenceLocation,
    registeredSourceReference: record.registeredSourceReference,
    sectionReference: record.sectionReference,
    reviewedOn: record.reviewedOn,
    verificationMethod: record.verificationMethod,
    migrationVersion: record.migrationVersion,
    sourceIdentity: record.sourceIdentity,
    evidenceText: record.evidenceText,
    derivedFromOriginalClaims: [`${record.fieldName}:${record.dateValue}`],
  })
}

const mohapSource = activeSourceById.get('mohap-medical-leave-attestation-2026')?.source
const mohapUpdateEvidence = findExactLabeledDateEvidence(mohapSource, '2026-07-10', PAGE_UPDATE_LABELS)
if (!mohapUpdateEvidence) throw new Error('MOHAP webpage update evidence was not found in registered metadata')
const mohapReference = dispositionRecords.find((record) => record.sourceId === 'mohap-medical-leave-attestation-2026')
weakerMetadataByKey.set('mohap-medical-leave-attestation-2026::webpage_last_updated_date::2026-07-10', {
  sourceId: 'mohap-medical-leave-attestation-2026',
  fieldName: 'webpage_last_updated_date',
  dateValue: '2026-07-10',
  provenanceStatus: 'weaker_metadata_only',
  evidenceCategory: 'webpage_update_only',
  displayedLabel: mohapUpdateEvidence.displayedLabel,
  exactEvidenceLocation: mohapUpdateEvidence.exactEvidenceLocation,
  registeredSourceReference: mohapReference.registeredSourceReference,
  sectionReference: mohapUpdateEvidence.sectionReference,
  reviewedOn: STRONGER_DATE_MIGRATION_REVIEW_DATE,
  verificationMethod: 'deterministic_registered_source_metadata_reconciliation',
  migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
  sourceIdentity: mohapReference.sourceIdentity,
  evidenceText: mohapUpdateEvidence.evidenceText,
  derivedFromOriginalClaims: [],
})

const weakerMetadataRecords = [...weakerMetadataByKey.values()]
  .map((record) => ({ ...record, derivedFromOriginalClaims: record.derivedFromOriginalClaims.sort() }))
  .sort((left, right) => (
    left.sourceId.localeCompare(right.sourceId)
    || left.fieldName.localeCompare(right.fieldName)
    || left.dateValue.localeCompare(right.dateValue)
  ))

const dispositionsBySource = new Map()
for (const record of dispositionRecords) {
  if (!dispositionsBySource.has(record.sourceId)) dispositionsBySource.set(record.sourceId, [])
  dispositionsBySource.get(record.sourceId).push(record)
}
const weakerBySource = new Map()
for (const record of weakerMetadataRecords) {
  if (!weakerBySource.has(record.sourceId)) weakerBySource.set(record.sourceId, [])
  weakerBySource.get(record.sourceId).push(record)
}

for (const [registryFile, { registryPath, document }] of registryDocuments.entries()) {
  document.sources = document.sources.map((originalSource) => {
    const source = structuredClone(originalSource)
    const records = dispositionsBySource.get(source.source_id) ?? []
    const inlineStronger = {}
    for (const record of records) {
      source[record.fieldName] = record.finalDateValue
      if (record.finalDateValue !== null) {
        inlineStronger[record.fieldName] = inlineProvenance(record)
      }
    }
    if (Object.keys(inlineStronger).length > 0) source.date_provenance = inlineStronger
    else delete source.date_provenance

    const inlineWeaker = {}
    for (const record of weakerBySource.get(source.source_id) ?? []) {
      const currentValue = actualNestedMetadata(source, record.fieldName)
      if (currentValue != null && currentValue !== record.dateValue) {
        throw new Error(`${source.source_id}: weaker metadata conflict at ${record.fieldName}`)
      }
      setNestedMetadata(source, record.fieldName, record.dateValue)
      inlineWeaker[record.fieldName] = inlineProvenance(record, record.fieldName, record.dateValue)
    }
    if (Object.keys(inlineWeaker).length > 0) source.date_metadata_provenance = inlineWeaker
    else delete source.date_metadata_provenance
    return source
  })
  writeJson(registryPath, document)
  registryDocuments.set(registryFile, { registryPath, document })
}

const sortedDispositionRecords = [...dispositionRecords].sort((left, right) => (
  left.sourceId.localeCompare(right.sourceId)
  || left.fieldName.localeCompare(right.fieldName)
))
const totals = {
  originalClaims: sortedDispositionRecords.length,
  retainedClaims: sortedDispositionRecords.filter((record) => record.finalDateValue !== null).length,
  clearedClaims: sortedDispositionRecords.filter((record) => record.finalDateValue === null).length,
  explicitClaims: sortedDispositionRecords.filter((record) => record.provenanceStatus === 'authoritative_explicit').length,
  unknownClaims: sortedDispositionRecords.filter((record) => record.provenanceStatus === 'approved_unknown').length,
  requiresMetadataRecheck: sortedDispositionRecords.filter((record) => record.provenanceStatus === 'requires_source_metadata_recheck').length,
  duplicatedEffectiveDates: sortedDispositionRecords.filter((record) => (
    record.fieldName === 'effective_date'
    && record.dateValue === dispositionRecords.find((candidate) => (
      candidate.sourceId === record.sourceId && candidate.fieldName === 'publication_date'
    ))?.dateValue
  )).length,
}

writeJson(PROVENANCE_PATH, {
  schemaVersion: '1.0.0',
  migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
  sourceBaselineCommit: STRONGER_DATE_SOURCE_BASELINE_COMMIT,
  historicalTupleBaselineCommit: STRONGER_DATE_TUPLE_BASELINE_COMMIT,
  reviewedOn: STRONGER_DATE_MIGRATION_REVIEW_DATE,
  authoritativePurpose: 'Per-field source-date provenance and deterministic legacy replay normalization.',
  historicalTupleAuthoritative: false,
  evidenceCategories: SOURCE_DATE_EVIDENCE_CATEGORIES,
  prohibitedEvidenceCategories: PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES,
  totals,
  classificationCounts: classificationCounts(sortedDispositionRecords),
  countsByField: countsByField(sortedDispositionRecords),
  claimDispositions: sortedDispositionRecords,
  weakerMetadataRecords,
})

writeJson(INVENTORY_PATH, {
  schemaVersion: '1.0.0',
  sourceBaselineCommit: STRONGER_DATE_SOURCE_BASELINE_COMMIT,
  historicalTupleBaselineCommit: STRONGER_DATE_TUPLE_BASELINE_COMMIT,
  generatedOn: STRONGER_DATE_MIGRATION_REVIEW_DATE,
  totalClaims: inventoryClaims.length,
  totalsByField: Object.fromEntries(STRONGER_DATE_FIELDS.map((fieldName) => [
    fieldName,
    inventoryClaims.filter((claim) => claim.fieldName === fieldName).length,
  ])),
  claims: inventoryClaims.sort((left, right) => (
    left.sourceId.localeCompare(right.sourceId)
    || left.fieldName.localeCompare(right.fieldName)
  )),
})

writeJson(LEDGER_PATH, {
  schemaVersion: '1.0.0',
  migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
  nonAuthoritative: true,
  historicalTupleAuthoritative: false,
  mustNotBeConsumedBy: [
    'source_validation',
    'source_recency',
    'runtime_application_data',
    'clinical_mapping_context',
    'workflow_support',
    'candidate_support',
    'canonical_mapping_approval',
  ],
  totals,
  classificationCounts: classificationCounts(sortedDispositionRecords),
  countsByField: countsByField(sortedDispositionRecords),
  claims: migrationLedgerClaims.sort((left, right) => (
    left.sourceId.localeCompare(right.sourceId)
    || left.fieldName.localeCompare(right.fieldName)
  )),
})

const currentHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT_DIR, encoding: 'utf8' }).trim()
console.log(JSON.stringify({
  status: 'PASS',
  currentHead,
  sourceBaselineCommit: STRONGER_DATE_SOURCE_BASELINE_COMMIT,
  registeredSources: activeSourceById.size,
  totals,
  classificationCounts: classificationCounts(sortedDispositionRecords),
  countsByField: countsByField(sortedDispositionRecords),
  weakerMetadataRecords: weakerMetadataRecords.length,
  outputFiles: [
    path.relative(ROOT_DIR, PROVENANCE_PATH).replaceAll('\\', '/'),
    path.relative(ROOT_DIR, INVENTORY_PATH).replaceAll('\\', '/'),
    path.relative(ROOT_DIR, LEDGER_PATH).replaceAll('\\', '/'),
    ...SOURCE_FILES.map((name) => `clinical-expansion-v2/sources/${name}`),
  ],
}, null, 2))

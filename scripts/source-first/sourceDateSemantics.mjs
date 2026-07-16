import fs from 'node:fs'
import path from 'node:path'
import { EXPANSION_DIR } from './common.mjs'
import {
  PAGE_UPDATE_FIELDS,
  PAGE_UPDATE_LABELS,
  PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES,
  SOURCE_DATE_EVIDENCE_CATEGORIES,
  STRONGER_DATE_FIELD_CONTRACT,
  STRONGER_DATE_FIELDS,
  STRONGER_DATE_MIGRATION_VERSION,
  normalizedDateEvidenceText,
  sourceIdentitySnapshot,
} from './sourceDateProvenanceContract.mjs'

const PROVENANCE_PATH = path.join(EXPANSION_DIR, 'schema', 'STRONGER_DATE_PROVENANCE.json')
const AUTHORITATIVE_STATUSES = new Set(['authoritative_explicit', 'approved_unknown'])
const WEAKER_METADATA_CATEGORIES = new Set(['webpage_update_only', 'access_or_review_date_only'])
const REQUIRED_PROVENANCE_FIELDS = Object.freeze([
  'sourceId',
  'fieldName',
  'dateValue',
  'provenanceStatus',
  'evidenceCategory',
  'displayedLabel',
  'exactEvidenceLocation',
  'registeredSourceReference',
  'reviewedOn',
  'verificationMethod',
  'migrationVersion',
])

function loadProvenanceDocument() {
  const document = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'))
  if (document.schemaVersion !== '1.0.0' || document.migrationVersion !== STRONGER_DATE_MIGRATION_VERSION) {
    throw new Error('[source-date-semantics] stronger-date provenance registry version mismatch')
  }
  if (document.historicalTupleAuthoritative !== false) {
    throw new Error('[source-date-semantics] historical tuples must be non-authoritative')
  }
  if (!Array.isArray(document.claimDispositions) || document.claimDispositions.length !== 554) {
    throw new Error('[source-date-semantics] provenance registry must account for all 554 original claims')
  }
  if (!Array.isArray(document.weakerMetadataRecords)) {
    throw new Error('[source-date-semantics] weaker metadata records are required')
  }
  return document
}

const PROVENANCE_DOCUMENT = loadProvenanceDocument()
const CLAIM_DISPOSITION_BY_KEY = new Map(PROVENANCE_DOCUMENT.claimDispositions.map((record) => [
  `${record.sourceId}::${record.fieldName}`,
  Object.freeze(record),
]))
const CLAIM_DISPOSITIONS_BY_SOURCE = new Map()
for (const record of PROVENANCE_DOCUMENT.claimDispositions) {
  const records = CLAIM_DISPOSITIONS_BY_SOURCE.get(record.sourceId) ?? []
  records.push(record)
  CLAIM_DISPOSITIONS_BY_SOURCE.set(record.sourceId, records)
}
const WEAKER_METADATA_BY_KEY = new Map(PROVENANCE_DOCUMENT.weakerMetadataRecords.map((record) => [
  `${record.sourceId}::${record.fieldName}::${record.dateValue}`,
  Object.freeze(record),
]))
const WEAKER_METADATA_BY_SOURCE = new Map()
for (const record of PROVENANCE_DOCUMENT.weakerMetadataRecords) {
  const records = WEAKER_METADATA_BY_SOURCE.get(record.sourceId) ?? []
  records.push(record)
  WEAKER_METADATA_BY_SOURCE.set(record.sourceId, records)
}

export const SOURCE_DATE_SEMANTICS = Object.freeze({
  contractVersion: '3.0.0',
  migrationVersion: STRONGER_DATE_MIGRATION_VERSION,
  pageUpdateLabels: PAGE_UPDATE_LABELS,
  pageUpdateFields: PAGE_UPDATE_FIELDS,
  strongerDateFieldContract: STRONGER_DATE_FIELD_CONTRACT,
  protectedStrongerDateFields: STRONGER_DATE_FIELDS,
  evidenceCategories: SOURCE_DATE_EVIDENCE_CATEGORIES,
  prohibitedEvidenceCategories: PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES,
  historicalTupleAuthoritative: false,
})

function provenanceError(source, fieldName, message) {
  return `${source?.source_id ?? 'unknown_source'}.${fieldName}: ${message}`
}

function exactIdentityMatches(source, record) {
  const identity = sourceIdentitySnapshot(source)
  return identity.sourceId === record.sourceIdentity?.sourceId
    && identity.issuingOrganisation === record.sourceIdentity?.issuingOrganisation
    && identity.exactDocumentTitle === record.sourceIdentity?.exactDocumentTitle
    && identity.exactOfficialUrl === record.sourceIdentity?.exactOfficialUrl
}

function inlineRecord(record, fieldName = record.fieldName, dateValue = record.finalDateValue) {
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

function setNestedMetadata(source, fieldName, value) {
  if (fieldName === 'recency_verification.revision_due') {
    source.recency_verification = {
      ...(source.recency_verification ?? {}),
      revision_due: value,
    }
    return
  }
  source[fieldName] = value
}

function nestedMetadata(source, fieldName) {
  if (fieldName === 'recency_verification.revision_due') {
    return source?.recency_verification?.revision_due
  }
  return source?.[fieldName]
}

function fieldLabelMatches(record, fieldName) {
  if (record.evidenceCategory === 'unknown_on_official_source') return fieldName === 'publication_date'
  const normalizedLabel = normalizedDateEvidenceText(record.displayedLabel)
  return STRONGER_DATE_FIELD_CONTRACT[fieldName].acceptedExplicitEvidenceLabels
    .some((label) => normalizedLabel === label || normalizedLabel.startsWith(`${label} `))
}

function validateProvenanceShape(provenance, source, fieldName, dateValue, authoritativeRecord) {
  const errors = []
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    return [provenanceError(source, fieldName, 'populated stronger date has no field-specific provenance')]
  }
  for (const key of REQUIRED_PROVENANCE_FIELDS) {
    if (provenance[key] === undefined || provenance[key] === null || provenance[key] === '') {
      errors.push(provenanceError(source, fieldName, `provenance.${key} is required`))
    }
  }
  if (provenance.sourceId !== source.source_id) {
    errors.push(provenanceError(source, fieldName, 'provenance belongs to another source'))
  }
  if (provenance.fieldName !== fieldName) {
    errors.push(provenanceError(source, fieldName, 'provenance belongs to another field'))
  }
  if (provenance.dateValue !== dateValue) {
    errors.push(provenanceError(source, fieldName, 'provenance belongs to another date value'))
  }
  if (PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES.includes(provenance.evidenceCategory)) {
    errors.push(provenanceError(source, fieldName, `prohibited evidence category ${provenance.evidenceCategory}`))
  }
  if (!STRONGER_DATE_FIELD_CONTRACT[fieldName].authoritativeEvidenceCategories.includes(provenance.evidenceCategory)) {
    errors.push(provenanceError(source, fieldName, `${provenance.evidenceCategory} cannot establish ${fieldName}`))
  }
  if (!fieldLabelMatches(provenance, fieldName)) {
    errors.push(provenanceError(source, fieldName, 'displayed label does not establish this field meaning'))
  }
  if (!AUTHORITATIVE_STATUSES.has(provenance.provenanceStatus)) {
    errors.push(provenanceError(source, fieldName, `non-authoritative provenance status ${provenance.provenanceStatus}`))
  }
  if (provenance.migrationVersion !== STRONGER_DATE_MIGRATION_VERSION) {
    errors.push(provenanceError(source, fieldName, 'provenance migration version mismatch'))
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(provenance.reviewedOn ?? '')) {
    errors.push(provenanceError(source, fieldName, 'provenance reviewedOn is invalid'))
  }
  if (!authoritativeRecord) {
    errors.push(provenanceError(source, fieldName, 'no authoritative per-field provenance registry record exists'))
    return errors
  }
  if (!exactIdentityMatches(source, authoritativeRecord)) {
    errors.push(provenanceError(source, fieldName, 'registered source identity differs from authoritative provenance'))
  }
  if (authoritativeRecord.finalDateValue !== dateValue) {
    errors.push(provenanceError(source, fieldName, 'authoritative provenance records another final date value'))
  }
  if (!AUTHORITATIVE_STATUSES.has(authoritativeRecord.provenanceStatus)) {
    errors.push(provenanceError(source, fieldName, 'claim disposition is non-authoritative'))
  }
  const expectedInline = inlineRecord(authoritativeRecord)
  if (JSON.stringify(provenance) !== JSON.stringify(expectedInline)) {
    errors.push(provenanceError(source, fieldName, 'inline provenance does not match the authoritative registry record'))
  }
  return errors
}

function weakerMetadataErrors(source) {
  const errors = []
  for (const [fieldName, provenance] of Object.entries(source?.date_metadata_provenance ?? {})) {
    const dateValue = nestedMetadata(source, fieldName)
    const record = WEAKER_METADATA_BY_KEY.get(`${source.source_id}::${fieldName}::${dateValue}`)
    if (!record) {
      errors.push(provenanceError(source, fieldName, 'weaker metadata has no authoritative provenance record'))
      continue
    }
    if (!WEAKER_METADATA_CATEGORIES.has(provenance?.evidenceCategory)) {
      errors.push(provenanceError(source, fieldName, 'weaker metadata uses an invalid evidence category'))
    }
    if (PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES.includes(provenance?.evidenceCategory)) {
      errors.push(provenanceError(source, fieldName, 'weaker metadata uses a prohibited evidence category'))
    }
    if (!exactIdentityMatches(source, record)) {
      errors.push(provenanceError(source, fieldName, 'weaker metadata source identity mismatch'))
    }
    if (JSON.stringify(provenance) !== JSON.stringify(inlineRecord(record, fieldName, dateValue))) {
      errors.push(provenanceError(source, fieldName, 'inline weaker metadata provenance does not match the registry'))
    }
  }
  return errors
}

export function sourceDateSemanticsErrors(source) {
  const errors = []
  const sourceDispositions = CLAIM_DISPOSITIONS_BY_SOURCE.get(source?.source_id) ?? []
  if (sourceDispositions.length > 0 && !exactIdentityMatches(source, sourceDispositions[0])) {
    errors.push(provenanceError(source, 'source_identity', 'source identity differs from the reviewed provenance registry'))
  }

  for (const fieldName of STRONGER_DATE_FIELDS) {
    const value = source?.[fieldName]
    const provenance = source?.date_provenance?.[fieldName]
    if (value === null || value === undefined) {
      if (provenance !== undefined) {
        errors.push(provenanceError(source, fieldName, 'null stronger date must not retain active provenance'))
      }
      continue
    }
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(provenanceError(source, fieldName, 'stronger date must be null, approved unknown, or a non-empty string'))
      continue
    }
    const authoritativeRecord = CLAIM_DISPOSITION_BY_KEY.get(`${source.source_id}::${fieldName}`)
    errors.push(...validateProvenanceShape(provenance, source, fieldName, value, authoritativeRecord))
  }

  for (const fieldName of Object.keys(source?.date_provenance ?? {})) {
    if (!STRONGER_DATE_FIELDS.includes(fieldName)) {
      errors.push(provenanceError(source, fieldName, 'unrecognized stronger-date provenance field'))
    }
  }
  errors.push(...weakerMetadataErrors(source))
  return errors
}

export function assertSourceDateSemantics(source) {
  const errors = sourceDateSemanticsErrors(source)
  if (errors.length > 0) throw new Error(`[source-date-semantics] ${errors.join('; ')}`)
  return source
}

export function normalizeSourceDateClaims(source) {
  const dispositions = CLAIM_DISPOSITIONS_BY_SOURCE.get(source?.source_id)
  if (!dispositions) return structuredClone(source)
  if (!exactIdentityMatches(source, dispositions[0])) {
    throw new Error(`[source-date-semantics] ${source.source_id}: replay source identity mismatch`)
  }
  const normalized = structuredClone(source)
  const inlineStronger = {}
  for (const record of dispositions) {
    normalized[record.fieldName] = record.finalDateValue
    if (record.finalDateValue !== null && AUTHORITATIVE_STATUSES.has(record.provenanceStatus)) {
      inlineStronger[record.fieldName] = inlineRecord(record)
    }
  }
  if (Object.keys(inlineStronger).length > 0) normalized.date_provenance = inlineStronger
  else delete normalized.date_provenance

  const inlineWeaker = {}
  for (const record of WEAKER_METADATA_BY_SOURCE.get(source.source_id) ?? []) {
    setNestedMetadata(normalized, record.fieldName, record.dateValue)
    inlineWeaker[record.fieldName] = inlineRecord(record, record.fieldName, record.dateValue)
  }
  if (Object.keys(inlineWeaker).length > 0) normalized.date_metadata_provenance = inlineWeaker
  else delete normalized.date_metadata_provenance
  return normalized
}

export function assignLabeledSourceDate(source, { label, date, targetField }) {
  if (typeof date !== 'string' || date.trim() === '') {
    throw new Error('[source-date-semantics] date must be a non-empty string')
  }
  if (STRONGER_DATE_FIELDS.includes(targetField)) {
    const record = CLAIM_DISPOSITION_BY_KEY.get(`${source?.source_id}::${targetField}`)
    if (!record || record.finalDateValue !== date || !AUTHORITATIVE_STATUSES.has(record.provenanceStatus)) {
      throw new Error('[source-date-semantics] stronger-date assignment requires a reviewed authoritative provenance registry entry')
    }
    const normalizedLabel = normalizedDateEvidenceText(label)
    if (!STRONGER_DATE_FIELD_CONTRACT[targetField].acceptedExplicitEvidenceLabels.includes(normalizedLabel)) {
      throw new Error(`[source-date-semantics] ${label} is not explicit evidence for ${targetField}`)
    }
    const next = {
      ...source,
      [targetField]: date,
      date_provenance: {
        ...(source.date_provenance ?? {}),
        [targetField]: inlineRecord(record),
      },
    }
    return assertSourceDateSemantics(next)
  }
  if (!PAGE_UPDATE_FIELDS.includes(targetField)) {
    throw new Error(`[source-date-semantics] unsupported date metadata field ${targetField}`)
  }
  if (!PAGE_UPDATE_LABELS.includes(normalizedDateEvidenceText(label))) {
    throw new Error(`[source-date-semantics] ${label} is not an approved webpage-update label`)
  }
  return { ...source, [targetField]: date }
}

export function sourceRecencyProvenanceBasis(source) {
  const errors = sourceDateSemanticsErrors(source)
  if (errors.length > 0) return { valid: false, errors, basis: null }
  const strongerCount = Object.keys(source?.date_provenance ?? {}).length
  const weakerCount = Object.keys(source?.date_metadata_provenance ?? {}).length
  const verifiedOn = source?.recency_verification?.verified_on
  return {
    valid: strongerCount > 0 || weakerCount > 0 || /^\d{4}-\d{2}-\d{2}$/.test(verifiedOn ?? ''),
    errors: [],
    basis: strongerCount > 0
      ? 'explicit_stronger_date_provenance'
      : weakerCount > 0
        ? 'explicit_weaker_metadata_provenance'
        : 'source_access_and_verification_only',
  }
}

export function sourceDateProvenanceDocument() {
  return structuredClone(PROVENANCE_DOCUMENT)
}

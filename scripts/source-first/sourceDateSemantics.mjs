import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PAGE_UPDATE_LABELS = Object.freeze([
  'last updated',
  'last updated on',
  'modified',
  'page updated',
  'content updated',
  'webpage updated',
  'source modified',
])

const PAGE_UPDATE_FIELDS = Object.freeze([
  'last_updated_date',
  'webpage_last_updated_date',
  'source_modified_date',
])

const STRONGER_DATE_FIELD_CONTRACT = Object.freeze({
  publication_date: Object.freeze({
    evidenceCategory: 'publication',
    acceptedExplicitEvidenceLabels: Object.freeze([
      'published',
      'publication date',
      'first published',
      'issued on',
      'page dated',
      'document dated',
      'produced',
    ]),
    prohibitedEvidenceCategories: Object.freeze(['generic_webpage_update']),
    permittedNull: true,
    permittedUnknownValues: Object.freeze(['undated_on_official_page']),
    acceptedEvidenceCategories: Object.freeze(['explicit_field_label', 'established_precontract_tuple']),
  }),
  effective_date: Object.freeze({
    evidenceCategory: 'effective date',
    acceptedExplicitEvidenceLabels: Object.freeze([
      'effective date',
      'effective from',
      'takes effect',
      'comes into force',
    ]),
    prohibitedEvidenceCategories: Object.freeze(['generic_webpage_update']),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    acceptedEvidenceCategories: Object.freeze(['explicit_field_label', 'established_precontract_tuple']),
  }),
  revision_date: Object.freeze({
    evidenceCategory: 'revision',
    acceptedExplicitEvidenceLabels: Object.freeze([
      'revision date',
      'revised on',
      'formally revised',
      'revision effective from',
      'edition revision date',
      'edition revised',
      'last revised',
      'last amended',
    ]),
    prohibitedEvidenceCategories: Object.freeze(['generic_webpage_update']),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    acceptedEvidenceCategories: Object.freeze(['explicit_field_label', 'established_precontract_tuple']),
  }),
  service_commencement_date: Object.freeze({
    evidenceCategory: 'service commencement',
    acceptedExplicitEvidenceLabels: Object.freeze([
      'service commenced',
      'service launched',
      'available from',
      'service start date',
    ]),
    prohibitedEvidenceCategories: Object.freeze(['generic_webpage_update']),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    acceptedEvidenceCategories: Object.freeze(['explicit_field_label', 'established_precontract_tuple']),
  }),
  legal_effective_date: Object.freeze({
    evidenceCategory: 'legal commencement',
    acceptedExplicitEvidenceLabels: Object.freeze([
      'law effective from',
      'regulation effective date',
      'entered into force',
      'legal commencement date',
    ]),
    prohibitedEvidenceCategories: Object.freeze(['generic_webpage_update']),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    acceptedEvidenceCategories: Object.freeze(['explicit_field_label', 'established_precontract_tuple']),
  }),
})

export const SOURCE_DATE_SEMANTICS = Object.freeze({
  contractVersion: '2.0.0',
  pageUpdateLabels: PAGE_UPDATE_LABELS,
  pageUpdateFields: PAGE_UPDATE_FIELDS,
  genericPageUpdateEvidenceCategory: 'generic_webpage_update',
  strongerDateFieldContract: STRONGER_DATE_FIELD_CONTRACT,
  protectedStrongerDateFields: Object.freeze(Object.keys(STRONGER_DATE_FIELD_CONTRACT)),
})

const PAGE_UPDATE_LABEL_SET = new Set(PAGE_UPDATE_LABELS)
const PAGE_UPDATE_FIELD_SET = new Set(PAGE_UPDATE_FIELDS)
const PROTECTED_DATE_FIELD_SET = new Set(SOURCE_DATE_SEMANTICS.protectedStrongerDateFields)
const MODULE_DIRECTORY = path.dirname(fileURLToPath(import.meta.url))
const ESTABLISHED_SOURCE_DATE_TUPLES_PATH = path.resolve(
  MODULE_DIRECTORY,
  '../../clinical-expansion-v2/schema/ESTABLISHED_SOURCE_DATE_TUPLES.json',
)

function loadEstablishedSourceDateTuples() {
  const document = JSON.parse(fs.readFileSync(ESTABLISHED_SOURCE_DATE_TUPLES_PATH, 'utf8'))
  if (document.schema_version !== '1.0.0' || document.baseline_commit !== '0610e1def1b82bb46d9296b91a54f1ab4a80238d') {
    throw new Error('[source-date-semantics] established source-date tuple contract has an unexpected baseline')
  }
  if (!Array.isArray(document.source_tuples)) {
    throw new TypeError('[source-date-semantics] established source-date tuple contract must contain source_tuples')
  }

  const tuples = new Map()
  for (const tuple of document.source_tuples) {
    const requiredIdentityFields = [
      'source_id',
      'issuing_organisation',
      'exact_document_title',
      'exact_official_url',
    ]
    for (const field of requiredIdentityFields) {
      if (typeof tuple?.[field] !== 'string' || tuple[field].trim() === '') {
        throw new TypeError(`[source-date-semantics] established tuple requires ${field}`)
      }
    }
    if (tuples.has(tuple.source_id)) {
      throw new Error(`[source-date-semantics] duplicate established tuple ${tuple.source_id}`)
    }
    if (!tuple.stronger_dates || typeof tuple.stronger_dates !== 'object' || Array.isArray(tuple.stronger_dates)) {
      throw new TypeError(`[source-date-semantics] ${tuple.source_id} requires stronger_dates`)
    }
    for (const [field, value] of Object.entries(tuple.stronger_dates)) {
      if (!PROTECTED_DATE_FIELD_SET.has(field)) {
        throw new Error(`[source-date-semantics] ${tuple.source_id} has unclassified stronger-date field ${field}`)
      }
      if (typeof value !== 'string' || value.trim() === '') {
        throw new TypeError(`[source-date-semantics] ${tuple.source_id}.${field} requires a non-empty value`)
      }
    }
    tuples.set(tuple.source_id, Object.freeze({
      ...tuple,
      stronger_dates: Object.freeze({ ...tuple.stronger_dates }),
    }))
  }
  return tuples
}

const ESTABLISHED_SOURCE_DATE_TUPLES = loadEstablishedSourceDateTuples()

const MONTH_NUMBERS = Object.freeze({
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
})
const METADATA_DATE_TOKEN_PATTERN = String.raw`(?:\d{4}-\d{2}-\d{2}|\d{1,2}(?:st|nd|rd|th)?\s+[a-z]{3,9}\.?,?\s+\d{4})`
const PAGE_UPDATE_NEGATION_TOKENS = new Set(['never', 'non', 'not'])

function normalizedLabel(label) {
  return String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/:$/, '')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function phraseMatches(value, phrase) {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase).replace(/\\ /g, '\\s+')}(?=$|[^a-z0-9])`, 'g')
  const matches = []
  for (const match of value.matchAll(pattern)) {
    const prefixLength = match[1]?.length ?? 0
    matches.push({ start: match.index + prefixLength, end: match.index + prefixLength + phrase.length })
  }
  return matches
}

function explicitEvidenceMatches(label) {
  const normalized = normalizedLabel(label)
  const candidates = []
  for (const [field, rule] of Object.entries(STRONGER_DATE_FIELD_CONTRACT)) {
    for (const phrase of rule.acceptedExplicitEvidenceLabels) {
      for (const match of phraseMatches(normalized, phrase)) candidates.push({ ...match, field, phrase })
    }
  }
  candidates.sort((left, right) => (right.phrase.length - left.phrase.length) || (left.start - right.start))
  const selected = []
  for (const candidate of candidates) {
    if (selected.some((entry) => candidate.start < entry.end && candidate.end > entry.start)) continue
    selected.push(candidate)
  }
  return selected.sort((left, right) => left.start - right.start)
}

function isExplicitEvidenceLabelForField(label, field) {
  return explicitEvidenceMatches(label).some((match) => match.field === field)
}

function pageUpdateLabelPattern() {
  return [...PAGE_UPDATE_LABEL_SET]
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|')
}

function hasNegatedPageUpdateLabel(value, labelIndex) {
  const priorToken = value.slice(0, labelIndex).match(/([a-z]+)\s*$/)?.[1]
  return PAGE_UPDATE_NEGATION_TOKENS.has(priorToken)
}

function isPageUpdateLabel(label) {
  const normalized = normalizedLabel(label)
  const pattern = new RegExp(`\\b(?:${pageUpdateLabelPattern()})\\b`, 'g')
  return [...normalized.matchAll(pattern)].some((match) => !hasNegatedPageUpdateLabel(normalized, match.index))
}

function sourceMetadataValues(source) {
  return [
    source?.version,
    source?.recency_verification?.status,
    source?.superseded_status_check?.status,
  ].filter((value) => typeof value === 'string')
}

function normalizedMetadataDate(dateToken) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateToken)) return dateToken
  const match = dateToken.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})$/)
  if (!match) return null
  const month = MONTH_NUMBERS[match[2].slice(0, 3)]
  const day = Number(match[1])
  if (!month || day < 1 || day > 31) return null
  return `${match[3]}-${month}-${String(day).padStart(2, '0')}`
}

function metadataDates(value) {
  const normalized = normalizedLabel(value)
  const dates = new Set()
  const pattern = new RegExp(`\\b(${METADATA_DATE_TOKEN_PATTERN})\\b`, 'g')
  for (const match of normalized.matchAll(pattern)) {
    const date = normalizedMetadataDate(match[1])
    if (date) dates.add(date)
  }
  return dates
}

function explicitEvidenceSegments(value, field) {
  const normalized = normalizedLabel(value)
  const explicitMatches = explicitEvidenceMatches(normalized)
  const segments = []
  for (const match of explicitMatches) {
    if (match.field !== field) continue
    const nextExplicitMatch = explicitMatches.find((candidate) => candidate.start > match.start)
    let end = nextExplicitMatch?.start ?? normalized.length
    const delimiterOffset = normalized.slice(match.end, end).search(/[;|\n]/)
    if (delimiterOffset >= 0) end = match.end + delimiterOffset
    segments.push(normalized.slice(match.start, Math.min(end, match.end + 120)))
  }
  return segments
}

function metadataHasExplicitDateEvidence(source, field) {
  const value = source?.[field]
  if (typeof value !== 'string') return false
  for (const metadata of sourceMetadataValues(source)) {
    for (const evidenceSegment of explicitEvidenceSegments(metadata, field)) {
      if (metadataDates(evidenceSegment).has(value) || evidenceSegment.includes(value.toLowerCase())) return true
    }
  }
  return false
}

function hasIndependentFieldProvenance(source, field) {
  const provenance = source.date_provenance?.[field]
  if (!provenance || provenance.independent_from_webpage_update !== true) return false
  return isExplicitEvidenceLabelForField(provenance.official_label, field)
}

function hasEstablishedPrecontractStrongerDate(source, field) {
  const established = ESTABLISHED_SOURCE_DATE_TUPLES.get(source?.source_id)
  return Boolean(established)
    && established.issuing_organisation === source?.issuing_organisation
    && established.exact_document_title === source?.exact_document_title
    && established.exact_official_url === source?.exact_official_url
    && established.stronger_dates[field] === source?.[field]
}

function hasGenericPageUpdateEvidence(source) {
  if (PAGE_UPDATE_FIELDS.some((field) => typeof source?.[field] === 'string' && source[field].trim() !== '')) return true
  if (sourceMetadataValues(source).some(isPageUpdateLabel)) return true
  return Object.values(source?.date_provenance ?? {}).some((provenance) => isPageUpdateLabel(provenance?.official_label))
}

function isPermittedNullOrUnknown(source, field) {
  const value = source?.[field]
  const rule = STRONGER_DATE_FIELD_CONTRACT[field]
  return (rule.permittedNull && (value === null || value === undefined))
    || rule.permittedUnknownValues.includes(value)
}

function fieldEvidenceError(field, genericPageUpdateEvidence) {
  const category = STRONGER_DATE_FIELD_CONTRACT[field].evidenceCategory
  if (genericPageUpdateEvidence) {
    return `${field} lacks explicit ${category} evidence; generic webpage-update evidence cannot establish it`
  }
  return `${field} lacks explicit ${category} evidence`
}

export function assignLabeledSourceDate(source, { label, date, targetField }) {
  const normalized = normalizedLabel(label)
  const isPageUpdate = isPageUpdateLabel(normalized)

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('[source-date-semantics] date must use YYYY-MM-DD')
  }
  if (typeof targetField !== 'string' || targetField.trim() === '') {
    throw new Error('[source-date-semantics] targetField is required')
  }
  if (isPageUpdate && PROTECTED_DATE_FIELD_SET.has(targetField)) {
    throw new Error(`[source-date-semantics] ${label} cannot establish ${targetField}`)
  }
  if (isPageUpdate && !PAGE_UPDATE_FIELD_SET.has(targetField)) {
    throw new Error(`[source-date-semantics] ${label} requires a clearly labelled webpage-update field`)
  }
  if (PROTECTED_DATE_FIELD_SET.has(targetField) && !isExplicitEvidenceLabelForField(normalized, targetField)) {
    const category = STRONGER_DATE_FIELD_CONTRACT[targetField].evidenceCategory
    throw new Error(`[source-date-semantics] ${label} is not explicit ${category} evidence for ${targetField}`)
  }
  if (!PROTECTED_DATE_FIELD_SET.has(targetField)) return { ...source, [targetField]: date }
  return {
    ...source,
    [targetField]: date,
    date_provenance: {
      ...(source.date_provenance ?? {}),
      [targetField]: {
        official_label: label,
        independent_from_webpage_update: true,
      },
    },
  }
}

export function sourceDateSemanticsErrors(source) {
  const genericPageUpdateEvidence = hasGenericPageUpdateEvidence(source)
  const errors = []
  for (const field of SOURCE_DATE_SEMANTICS.protectedStrongerDateFields) {
    if (isPermittedNullOrUnknown(source, field)) continue
    if (hasIndependentFieldProvenance(source, field)) continue
    if (metadataHasExplicitDateEvidence(source, field)) continue
    if (hasEstablishedPrecontractStrongerDate(source, field)) continue
    errors.push(fieldEvidenceError(field, genericPageUpdateEvidence))
  }
  return errors
}

export function assertSourceDateSemantics(source) {
  const errors = sourceDateSemanticsErrors(source)
  if (errors.length > 0) throw new Error(`[source-date-semantics] ${errors.join('; ')}`)
  return source
}

export const SOURCE_DATE_SEMANTICS = Object.freeze({
  pageUpdateLabels: Object.freeze([
    'last updated',
    'last updated on',
    'modified',
    'page updated',
    'content updated',
    'webpage updated',
    'source modified',
  ]),
  pageUpdateFields: Object.freeze([
    'last_updated_date',
    'webpage_last_updated_date',
    'source_modified_date',
  ]),
  protectedStrongerDateFields: Object.freeze([
    'publication_date',
    'effective_date',
    'revision_date',
    'service_commencement_date',
    'legal_effective_date',
  ]),
})

const PAGE_UPDATE_LABELS = new Set(SOURCE_DATE_SEMANTICS.pageUpdateLabels)
const PAGE_UPDATE_FIELDS = new Set(SOURCE_DATE_SEMANTICS.pageUpdateFields)
const PROTECTED_DATE_FIELDS = new Set(SOURCE_DATE_SEMANTICS.protectedStrongerDateFields)
const LEGACY_NICE_FORMAL_REVISION_DATES = new Map([
  ['nice-acne-vulgaris-ng198-2026', '2026-04-30'],
  ['nice-atrial-fibrillation-ng196-2021', '2021-06-30'],
  ['nice-chest-pain-cg95-2016', '2016-11-30'],
  ['nice-delirium-cg103-2023', '2023-01-18'],
  ['nice-diabetic-foot-ng19-2019', '2019-10-11'],
  ['nice-hypertension-ng136-2026', '2026-02-26'],
  ['nice-long-covid-ng188-2024', '2024-01-25'],
  ['nice-luts-men-cg97-2015', '2015-06-03'],
  ['nice-melanoma-ng14-2022', '2022-07-27'],
  ['nice-nutrition-support-cg32-2017', '2017-08-04'],
  ['nice-psoriasis-cg153-2017', '2017-09-01'],
  ['nice-stable-angina-cg126-2016', '2016-08-25'],
  ['nice-tloc-cg109-2023', '2023-11-21'],
  ['nice-venous-thromboembolic-diseases-ng158-2023', '2023-08-02'],
  ['nice-vitamin-d-ph56-2017', '2017-08-30'],
])
const LEGACY_NHS_EFFECTIVE_DATES = new Map([
  ['nhs-england-adult-breathlessness-pathway-2023', '2023-05-04'],
])
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
const METADATA_WEEKDAY_PATTERN = String.raw`(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)`
const PAGE_UPDATE_NEGATION_TOKENS = new Set(['never', 'non', 'not'])

function normalizedLabel(label) {
  return String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/:$/, '')
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
  if (isPageUpdate && PROTECTED_DATE_FIELDS.has(targetField)) {
    throw new Error(`[source-date-semantics] ${label} cannot establish ${targetField}`)
  }
  if (isPageUpdate && !PAGE_UPDATE_FIELDS.has(targetField)) {
    throw new Error(`[source-date-semantics] ${label} requires a clearly labelled webpage-update field`)
  }

  return { ...source, [targetField]: date }
}

function hasIndependentDateProvenance(source, field) {
  const provenance = source.date_provenance?.[field]
  if (!provenance || provenance.independent_from_webpage_update !== true) return false
  const officialLabel = normalizedLabel(provenance.official_label)
  return officialLabel !== '' && !isPageUpdateLabel(officialLabel)
}

function isPageUpdateLabel(label) {
  const normalized = normalizedLabel(label)
  const pattern = new RegExp(`\\b(?:${pageUpdateLabelPattern()})\\b`, 'g')
  return [...normalized.matchAll(pattern)].some((match) => !hasNegatedPageUpdateLabel(normalized, match.index))
}

function hasEstablishedLegacyStrongerDate(source, field) {
  if (field === 'revision_date'
    && source?.issuing_organisation === 'National Institute for Health and Care Excellence'
    && LEGACY_NICE_FORMAL_REVISION_DATES.get(source?.source_id) === source?.revision_date) return true
  return field === 'effective_date'
    && source?.issuing_organisation === 'NHS England'
    && LEGACY_NHS_EFFECTIVE_DATES.get(source?.source_id) === source?.effective_date
}

function hasAcceptedDateProvenance(source, field) {
  return hasIndependentDateProvenance(source, field)
    || hasEstablishedLegacyStrongerDate(source, field)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function pageUpdateLabelPattern() {
  return [...PAGE_UPDATE_LABELS]
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|')
}

function hasNegatedPageUpdateLabel(value, labelIndex) {
  const priorToken = value.slice(0, labelIndex).match(/([a-z]+)\s*$/)?.[1]
  return PAGE_UPDATE_NEGATION_TOKENS.has(priorToken)
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

function pageUpdateDatesFromMetadata(source) {
  const metadataValues = [
    source?.version,
    source?.recency_verification?.status,
    source?.superseded_status_check?.status,
  ]
  const dates = new Set()
  for (const value of metadataValues) {
    if (typeof value !== 'string') continue
    const normalized = value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/([a-z])-(?=[a-z])/g, '$1 ')
      .replace(/\s+/g, ' ')
    const labelPattern = pageUpdateLabelPattern()
    const pageUpdateDatePattern = new RegExp(
      `\\b(?:${labelPattern})\\b`
        + `(?:\\s+|[:;,()–—-]|(?:on|at|date|as\\s+of|${METADATA_WEEKDAY_PATTERN})\\b){0,12}`
        + `(${METADATA_DATE_TOKEN_PATTERN})\\b`,
      'g',
    )
    for (const match of normalized.matchAll(pageUpdateDatePattern)) {
      if (hasNegatedPageUpdateLabel(normalized, match.index)) continue
      const date = normalizedMetadataDate(match[1])
      if (date) dates.add(date)
    }
  }
  return dates
}

export function sourceDateSemanticsErrors(source) {
  const pageUpdateDates = new Set(
    [...PAGE_UPDATE_FIELDS]
      .map((field) => source?.[field])
      .filter((value) => typeof value === 'string' && value !== ''),
  )
  const errors = []
  for (const field of PROTECTED_DATE_FIELDS) {
    if (!pageUpdateDates.has(source?.[field])) continue
    if (hasAcceptedDateProvenance(source, field)) continue
    errors.push(`${field} duplicates a webpage-update date without independent explicit provenance`)
  }

  const metadataPageUpdateDates = pageUpdateDatesFromMetadata(source)
  for (const field of PROTECTED_DATE_FIELDS) {
    if (!metadataPageUpdateDates.has(source?.[field])) continue
    if (hasAcceptedDateProvenance(source, field)) continue
    if (errors.some((error) => error.startsWith(`${field} `))) continue
    errors.push(`${field} duplicates a webpage-update date without independent explicit provenance`)
  }
  return errors
}

export function assertSourceDateSemantics(source) {
  const errors = sourceDateSemanticsErrors(source)
  if (errors.length > 0) throw new Error(`[source-date-semantics] ${errors.join('; ')}`)
  return source
}

const PAGE_UPDATE_LABELS = new Set([
  'last updated',
  'last updated on',
  'modified',
  'page updated',
  'content updated',
])

const PAGE_UPDATE_FIELDS = new Set([
  'last_updated_date',
  'webpage_last_updated_date',
  'source_modified_date',
])

const PROTECTED_DATE_FIELDS = new Set([
  'publication_date',
  'effective_date',
  'service_commencement_date',
  'legal_effective_date',
])

function normalizedLabel(label) {
  return String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/:$/, '')
}

export function assignLabeledSourceDate(source, { label, date, targetField }) {
  const normalized = normalizedLabel(label)
  const isPageUpdate = PAGE_UPDATE_LABELS.has(normalized)

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
  return officialLabel !== '' && !PAGE_UPDATE_LABELS.has(officialLabel)
}

export function sourceDateSemanticsErrors(source) {
  const pageUpdateDates = new Set(
    [...PAGE_UPDATE_FIELDS]
      .map((field) => source?.[field])
      .filter((value) => typeof value === 'string' && value !== ''),
  )
  if (pageUpdateDates.size === 0) return []

  const errors = []
  for (const field of PROTECTED_DATE_FIELDS) {
    if (!pageUpdateDates.has(source?.[field])) continue
    if (hasIndependentDateProvenance(source, field)) continue
    errors.push(`${field} duplicates a webpage-update date without independent explicit provenance`)
  }
  return errors
}

export function assertSourceDateSemantics(source) {
  const errors = sourceDateSemanticsErrors(source)
  if (errors.length > 0) throw new Error(`[source-date-semantics] ${errors.join('; ')}`)
  return source
}

import fs from 'node:fs'
import path from 'node:path'
import { EXPANSION_DIR } from './common.mjs'

const POLICY_PATH = path.join(EXPANSION_DIR, 'schema', 'SOURCE_RECENCY_POLICY.json')
const policy = Object.freeze(JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8')))
const DAY_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const MONTH_PATTERN = /^[0-9]{4}-[0-9]{2}$/
const YEAR_PATTERN = /^[0-9]{4}$/
const MILLISECONDS_PER_DAY = 86_400_000

const CURRENT_OUTCOME_BY_BASIS = Object.freeze({
  explicit_stronger_date: 'explicit_stronger_date_current',
  approved_unknown: 'approved_unknown_current_by_verification',
  weaker_metadata: 'weaker_metadata_current',
  access_verification_only: 'access_verification_current',
})

const WEAKER_EVIDENCE_CATEGORIES = new Set([
  'webpage_update_only',
  'access_or_review_date_only',
])

function utcDay(value) {
  if (!DAY_PATTERN.test(value ?? '')) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) return null
  return parsed
}

function validMonth(value) {
  if (!MONTH_PATTERN.test(value ?? '')) return false
  const month = Number(value.slice(5, 7))
  return month >= 1 && month <= 12
}

function formatUtcDay(value) {
  return value.toISOString().slice(0, 10)
}

function addDays(value, days) {
  const parsed = utcDay(value)
  if (!parsed) return null
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return formatUtcDay(parsed)
}

function dayDifference(later, earlier) {
  const laterDate = utcDay(later)
  const earlierDate = utcDay(earlier)
  if (!laterDate || !earlierDate) return null
  return Math.floor((laterDate.valueOf() - earlierDate.valueOf()) / MILLISECONDS_PER_DAY)
}

function nestedValue(source, fieldName) {
  if (fieldName === 'recency_verification.revision_due') {
    return source?.recency_verification?.revision_due
  }
  return source?.[fieldName]
}

function persistedStrongerEntry(source, provenanceStatus) {
  for (const fieldName of policy.stronger_field_precedence) {
    const provenance = source?.date_provenance?.[fieldName]
    if (provenance?.provenanceStatus !== provenanceStatus) continue
    if (provenance.sourceId !== source?.source_id
      || provenance.fieldName !== fieldName
      || provenance.dateValue !== source?.[fieldName]) continue
    const precision = classifyDatePrecision(provenance.dateValue)
    if (provenanceStatus === 'authoritative_explicit' && precision.kind !== 'date') continue
    if (provenanceStatus === 'approved_unknown' && precision.kind !== 'approved_unknown') continue
    return { field_name: fieldName, provenance, precision }
  }
  return null
}

function persistedWeakerEntry(source) {
  const entries = []
  for (const [fieldName, provenance] of Object.entries(source?.date_metadata_provenance ?? {})) {
    const rawValue = nestedValue(source, fieldName)
    const precision = classifyDatePrecision(rawValue)
    if (precision.kind !== 'date'
      || provenance?.provenanceStatus !== 'weaker_metadata_only'
      || !WEAKER_EVIDENCE_CATEGORIES.has(provenance.evidenceCategory)
      || provenance.sourceId !== source?.source_id
      || provenance.fieldName !== fieldName
      || provenance.dateValue !== rawValue) continue
    const fieldRank = policy.weaker_field_precedence.indexOf(fieldName)
    entries.push({
      field_name: fieldName,
      field_rank: fieldRank === -1 ? Number.MAX_SAFE_INTEGER : fieldRank,
      provenance,
      precision,
    })
  }
  entries.sort((left, right) => left.field_rank - right.field_rank
    || String(right.precision.comparison_date ?? '').localeCompare(String(left.precision.comparison_date ?? ''))
    || left.field_name.localeCompare(right.field_name))
  return entries[0] ?? null
}

function recencyBasis(source) {
  const explicit = persistedStrongerEntry(source, 'authoritative_explicit')
  if (explicit) return { recency_basis: 'explicit_stronger_date', ...explicit }

  const unknown = persistedStrongerEntry(source, 'approved_unknown')
  if (unknown) return { recency_basis: 'approved_unknown', ...unknown }

  const weaker = persistedWeakerEntry(source)
  if (weaker) return { recency_basis: 'weaker_metadata', ...weaker }

  const verificationPrecision = classifyDatePrecision(source?.recency_verification?.verified_on)
  return {
    recency_basis: 'access_verification_only',
    field_name: 'recency_verification.verified_on',
    precision: verificationPrecision,
    provenance: null,
  }
}

function availabilityState(source) {
  const verificationStatus = String(source?.recency_verification?.status ?? '').toLowerCase()
  const supersededStatus = String(source?.superseded_status_check?.status ?? '').toLowerCase()
  const unavailable = /(^|_)(unavailable|inaccessible|access_failed|access_failure|not_found|withdrawn)(_|$)/.test(verificationStatus)
  const superseded = /^(superseded|withdrawn|replaced)(_|\b)/.test(supersededStatus)
  return {
    unavailable,
    superseded,
    remains_available: !unavailable
      && /^https:\/\//.test(source?.exact_official_url ?? '')
      && verificationStatus.length > 0,
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]))
  }
  return value
}

export function sourceRecencyPolicy() {
  return structuredClone(policy)
}

export function classifyDatePrecision(value, { present = true } = {}) {
  if (!present || value === undefined) {
    return { kind: 'absent', precision: 'unknown', raw_value: null, comparison_date: null }
  }
  if (value === null) {
    return { kind: 'null', precision: 'unknown', raw_value: null, comparison_date: null }
  }
  if (policy.approved_unknown_values.includes(value)) {
    return { kind: 'approved_unknown', precision: 'unknown', raw_value: value, comparison_date: null }
  }
  if (typeof value !== 'string') {
    return { kind: 'invalid', precision: 'unknown', raw_value: value, comparison_date: null }
  }
  if (utcDay(value)) {
    return { kind: 'date', precision: 'day', raw_value: value, comparison_date: value }
  }
  if (validMonth(value)) {
    return { kind: 'date', precision: 'month', raw_value: value, comparison_date: `${value}-01` }
  }
  if (YEAR_PATTERN.test(value)) {
    return { kind: 'date', precision: 'year', raw_value: value, comparison_date: null }
  }
  return { kind: 'invalid', precision: 'unknown', raw_value: value, comparison_date: null }
}

export function classifySourceRecency(source, { as_of_date = policy.evaluation_date } = {}) {
  const basis = recencyBasis(source)
  const verificationDate = source?.recency_verification?.verified_on ?? null
  const checkedOn = source?.superseded_status_check?.checked_on ?? null
  const verificationPrecision = classifyDatePrecision(verificationDate)
  const checkedPrecision = classifyDatePrecision(checkedOn)
  const evaluationPrecision = classifyDatePrecision(as_of_date)
  const verificationAgeDays = verificationPrecision.kind === 'date' && verificationPrecision.precision === 'day'
    ? dayDifference(as_of_date, verificationDate)
    : null
  const routineRecheckDueOn = verificationPrecision.kind === 'date' && verificationPrecision.precision === 'day'
    ? addDays(verificationDate, policy.access_verification_maximum_age_days)
    : null
  const recheckWarningStartsOn = routineRecheckDueOn
    ? addDays(routineRecheckDueOn, -policy.recheck_warning_window_days)
    : null
  const recordedRecencyGap = /recency_gap/i.test(source?.recency_verification?.status ?? '')
  const availability = availabilityState(source)
  const incomplete = evaluationPrecision.kind !== 'date' || evaluationPrecision.precision !== 'day'
    || verificationPrecision.kind !== 'date' || verificationPrecision.precision !== 'day'
    || checkedPrecision.kind !== 'date' || checkedPrecision.precision !== 'day'
    || verificationDate > as_of_date
    || checkedOn > as_of_date
    || !source?.recency_verification?.status
    || !source?.superseded_status_check?.status
    || !/^https:\/\//.test(source?.exact_official_url ?? '')
  const expired = !incomplete && as_of_date > routineRecheckDueOn
  const dueByWindow = !incomplete && as_of_date >= recheckWarningStartsOn
  const dueByGap = !incomplete && policy.recency_gap_requires_immediate_recheck && recordedRecencyGap

  let recencyOutcome = CURRENT_OUTCOME_BY_BASIS[basis.recency_basis]
  if (availability.unavailable) recencyOutcome = 'unavailable'
  else if (availability.superseded) recencyOutcome = 'superseded'
  else if (incomplete) recencyOutcome = 'incomplete_recency_metadata'
  else if (expired) recencyOutcome = 'verification_expired'
  else if (dueByWindow || dueByGap) recencyOutcome = 'recheck_due'

  const nextRequiredRecheckDate = ['unavailable', 'superseded', 'incomplete_recency_metadata'].includes(recencyOutcome)
    ? as_of_date
    : dueByGap && !expired
      ? as_of_date
      : routineRecheckDueOn

  return {
    schema_version: policy.schema_version,
    policy_version: policy.policy_version,
    evaluated_on: as_of_date,
    recency_basis: basis.recency_basis,
    recency_outcome: recencyOutcome,
    basis_field: basis.field_name,
    basis_value: basis.precision.raw_value,
    basis_precision: basis.precision.precision,
    basis_comparison_date: basis.precision.comparison_date,
    verification_date: verificationDate,
    verification_age_days: verificationAgeDays,
    maximum_verification_age_days: policy.access_verification_maximum_age_days,
    routine_recheck_due_on: routineRecheckDueOn,
    recheck_warning_starts_on: recheckWarningStartsOn,
    next_required_recheck_date: nextRequiredRecheckDate,
    remains_available: availability.remains_available,
    appears_superseded: availability.superseded,
    recorded_recency_gap: recordedRecencyGap,
  }
}

export function validatePersistedSourceRecency(source, options = {}) {
  const expected = classifySourceRecency(source, options)
  const persisted = source?.source_recency
  const sourceId = source?.source_id ?? 'unknown_source'
  if (!persisted || typeof persisted !== 'object' || Array.isArray(persisted)) {
    return [`${sourceId}: persisted source_recency is required`]
  }

  const errors = []
  const expectedKeys = new Set(Object.keys(expected))
  for (const key of Object.keys(expected)) {
    if (!Object.hasOwn(persisted, key)) errors.push(`${sourceId}: source_recency.${key} is required`)
    else if (JSON.stringify(stableValue(persisted[key])) !== JSON.stringify(stableValue(expected[key]))) {
      errors.push(`${sourceId}: source_recency.${key} differs from the deterministic policy result`)
    }
  }
  for (const key of Object.keys(persisted)) {
    if (!expectedKeys.has(key)) errors.push(`${sourceId}: source_recency.${key} is not part of the persisted schema`)
  }
  return errors
}

export function summarizeSourceRecency(sources, options = {}) {
  const recencyBasisCounts = Object.fromEntries(policy.recency_basis_precedence.map((value) => [value, 0]))
  const recencyOutcomeCounts = Object.fromEntries(policy.recency_outcome_precedence.map((value) => [value, 0]))
  const datePrecisionCounts = Object.fromEntries(policy.basis_precision_values.map((value) => [value, 0]))

  for (const source of sources) {
    const result = classifySourceRecency(source, options)
    recencyBasisCounts[result.recency_basis] += 1
    recencyOutcomeCounts[result.recency_outcome] += 1
    datePrecisionCounts[result.basis_precision] += 1
  }

  return {
    total_sources: sources.length,
    recency_basis_counts: recencyBasisCounts,
    recency_outcome_counts: recencyOutcomeCounts,
    date_precision_counts: datePrecisionCounts,
  }
}

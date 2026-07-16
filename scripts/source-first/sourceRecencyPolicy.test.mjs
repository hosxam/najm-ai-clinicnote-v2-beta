import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR } from './common.mjs'
import { validateActiveRegistrySource } from './sourceDateRegistryGate.mjs'
import {
  classifySourceRecency,
  sourceRecencyPolicy,
  summarizeSourceRecency,
  validatePersistedSourceRecency,
} from './sourceRecencyPolicy.mjs'

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const sourceFiles = [
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
]
const activeSources = sourceFiles.flatMap((name) => (
  readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? []
))
const activeById = new Map(activeSources.map((source) => [source.source_id, source]))

function accessFixture(overrides = {}) {
  return {
    source_id: 'fixture-source',
    exact_official_url: 'https://example.test/source',
    recency_verification: {
      verified_on: '2026-07-15',
      status: 'current_official_source_opened',
    },
    superseded_status_check: {
      checked_on: '2026-07-15',
      status: 'current_source_not_superseded',
    },
    ...overrides,
  }
}

test('policy exposes exact snake-case basis and outcome precedence', () => {
  const policy = sourceRecencyPolicy()
  assert.deepEqual(policy.recency_basis_precedence, [
    'explicit_stronger_date',
    'approved_unknown',
    'weaker_metadata',
    'access_verification_only',
  ])
  assert.deepEqual(policy.recency_outcome_precedence, [
    'unavailable',
    'superseded',
    'incomplete_recency_metadata',
    'verification_expired',
    'recheck_due',
    'explicit_stronger_date_current',
    'approved_unknown_current_by_verification',
    'weaker_metadata_current',
    'access_verification_current',
  ])
  assert.equal(policy.evaluation_date, '2026-07-16')
  assert.equal(policy.access_verification_maximum_age_days, 30)
  assert.equal(policy.recheck_warning_window_days, 7)
})

test('all 235 sources reconcile to mutually exclusive basis and outcome totals', () => {
  const summary = summarizeSourceRecency(activeSources)
  assert.deepEqual(summary, {
    total_sources: 235,
    recency_basis_counts: {
      explicit_stronger_date: 25,
      approved_unknown: 3,
      weaker_metadata: 69,
      access_verification_only: 138,
    },
    recency_outcome_counts: {
      unavailable: 0,
      superseded: 0,
      incomplete_recency_metadata: 0,
      verification_expired: 0,
      recheck_due: 23,
      explicit_stronger_date_current: 24,
      approved_unknown_current_by_verification: 3,
      weaker_metadata_current: 65,
      access_verification_current: 120,
    },
    date_precision_counts: {
      day: 226,
      month: 4,
      year: 2,
      unknown: 3,
    },
  })
})

test('month and year precision remain explicit in source classification', () => {
  const monthSources = [
    'doh-antenatal-care-standard-v1-2024',
    'doh-postnatal-care-program-v1-2025',
    'doh-well-child-visits-v10-2025',
    'rch-pic-acute-abdominal-pain-children-2024',
  ]
  for (const sourceId of monthSources) {
    const result = classifySourceRecency(activeById.get(sourceId))
    assert.equal(result.recency_basis, 'weaker_metadata', sourceId)
    assert.equal(result.basis_precision, 'month', sourceId)
    assert.match(result.basis_comparison_date, /^[0-9]{4}-[0-9]{2}-01$/)
  }

  for (const sourceId of ['hrs-ishne-ambulatory-ecg-2017', 'hrs-remote-device-clinic-2023']) {
    const result = classifySourceRecency(activeById.get(sourceId))
    assert.equal(result.recency_basis, 'explicit_stronger_date', sourceId)
    assert.equal(result.basis_precision, 'year', sourceId)
    assert.equal(result.basis_comparison_date, null)
  }
})

test('MOHAP unknown publication is not a concrete date or webpage-update relabelling', () => {
  const result = classifySourceRecency(activeById.get('mohap-medical-leave-attestation-2026'))
  assert.equal(result.recency_basis, 'approved_unknown')
  assert.equal(result.recency_outcome, 'approved_unknown_current_by_verification')
  assert.equal(result.basis_field, 'publication_date')
  assert.equal(result.basis_value, 'undated_on_official_page')
  assert.equal(result.basis_precision, 'unknown')
  assert.equal(result.basis_comparison_date, null)
})

test('verification expiry and warning-window calculations use fixed policy dates', () => {
  const expired = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: '2026-06-15', status: 'current_official_source_opened' },
  }))
  assert.equal(expired.routine_recheck_due_on, '2026-07-15')
  assert.equal(expired.recency_outcome, 'verification_expired')

  const due = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: '2026-06-23', status: 'current_official_source_opened' },
  }))
  assert.equal(due.routine_recheck_due_on, '2026-07-23')
  assert.equal(due.recheck_warning_starts_on, '2026-07-16')
  assert.equal(due.recency_outcome, 'recheck_due')

  const dayThirty = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: '2026-06-16', status: 'current_official_source_opened' },
  }))
  assert.equal(dayThirty.verification_age_days, 30)
  assert.equal(dayThirty.routine_recheck_due_on, '2026-07-16')
  assert.equal(dayThirty.recency_outcome, 'recheck_due')

  const current = classifySourceRecency(accessFixture())
  assert.equal(current.recency_outcome, 'access_verification_current')
  assert.equal(current.next_required_recheck_date, '2026-08-14')
})

test('recorded recency gaps require an immediate recheck without backlog coupling', () => {
  const result = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: '2026-07-15', status: 'current_recency_gap_requires_review' },
  }))
  assert.equal(result.recency_outcome, 'recheck_due')
  assert.equal(result.next_required_recheck_date, '2026-07-16')
  assert.equal(result.recorded_recency_gap, true)
  assert.equal(Object.keys(result).some((key) => /backlog|manual/i.test(key)), false)
})

test('outcome precedence is unavailable, superseded, incomplete, expired, then due', () => {
  const unavailable = classifySourceRecency(accessFixture({
    exact_official_url: null,
    recency_verification: { verified_on: null, status: 'unavailable' },
    superseded_status_check: { checked_on: null, status: 'superseded' },
  }))
  assert.equal(unavailable.recency_outcome, 'unavailable')

  const superseded = classifySourceRecency(accessFixture({
    exact_official_url: null,
    recency_verification: { verified_on: null, status: 'current_source' },
    superseded_status_check: { checked_on: null, status: 'superseded' },
  }))
  assert.equal(superseded.recency_outcome, 'superseded')

  const incomplete = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: null, status: 'current_source' },
  }))
  assert.equal(incomplete.recency_outcome, 'incomplete_recency_metadata')

  const futureDated = classifySourceRecency(accessFixture({
    recency_verification: { verified_on: '2026-07-17', status: 'current_source' },
    superseded_status_check: { checked_on: '2026-07-17', status: 'current_source_not_superseded' },
  }))
  assert.equal(futureDated.recency_outcome, 'incomplete_recency_metadata')
  assert.equal(futureDated.next_required_recheck_date, '2026-07-16')
})

test('persisted recency validation requires the exact snake-case schema', () => {
  const source = accessFixture()
  source.source_recency = classifySourceRecency(source)
  assert.deepEqual(validatePersistedSourceRecency(source), [])

  source.source_recency.recency_outcome = 'recheck_due'
  assert.match(validatePersistedSourceRecency(source).join('\n'), /recency_outcome differs/)

  source.source_recency = classifySourceRecency(source)
  source.source_recency.policyVersion = source.source_recency.policy_version
  assert.match(validatePersistedSourceRecency(source).join('\n'), /policyVersion is not part/)
})

test('active registry validation rejects a stale self-selected evaluation date', () => {
  const source = accessFixture({
    recency_verification: {
      verified_on: '2026-06-20',
      status: 'current_official_source_opened',
    },
    superseded_status_check: {
      checked_on: '2026-06-20',
      status: 'current_source_not_superseded',
    },
  })
  source.source_recency = classifySourceRecency(source, { as_of_date: '2026-07-01' })

  assert.equal(source.source_recency.evaluated_on, '2026-07-01')
  assert.equal(source.source_recency.verification_age_days, 11)
  assert.equal(source.source_recency.recency_outcome, 'access_verification_current')
  assert.equal(classifySourceRecency(source).verification_age_days, 26)
  assert.equal(classifySourceRecency(source).recency_outcome, 'recheck_due')
  assert.throws(() => validateActiveRegistrySource(source), (error) => {
    assert.match(error.message, /source_recency\.evaluated_on differs/)
    assert.match(error.message, /source_recency\.recency_outcome differs/)
    assert.match(error.message, /source_recency\.verification_age_days differs/)
    return true
  })
})

test('active registry validation accepts recency persisted for the committed policy date', () => {
  const source = accessFixture({
    recency_verification: {
      verified_on: '2026-06-20',
      status: 'current_official_source_opened',
    },
    superseded_status_check: {
      checked_on: '2026-06-20',
      status: 'current_source_not_superseded',
    },
  })
  source.source_recency = classifySourceRecency(source)

  assert.equal(source.source_recency.evaluated_on, sourceRecencyPolicy().evaluation_date)
  assert.equal(source.source_recency.verification_age_days, 26)
  assert.equal(source.source_recency.recency_outcome, 'recheck_due')
  assert.equal(validateActiveRegistrySource(source), source)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyDatePrecision } from './sourceRecencyPolicy.mjs'

test('date precision distinguishes absent, null, approved unknown, and invalid values', () => {
  assert.deepEqual(classifyDatePrecision(undefined), {
    kind: 'absent',
    precision: 'unknown',
    raw_value: null,
    comparison_date: null,
  })
  assert.deepEqual(classifyDatePrecision('2026-07-16', { present: false }), {
    kind: 'absent',
    precision: 'unknown',
    raw_value: null,
    comparison_date: null,
  })
  assert.deepEqual(classifyDatePrecision(null), {
    kind: 'null',
    precision: 'unknown',
    raw_value: null,
    comparison_date: null,
  })
  assert.deepEqual(classifyDatePrecision('undated_on_official_page'), {
    kind: 'approved_unknown',
    precision: 'unknown',
    raw_value: 'undated_on_official_page',
    comparison_date: null,
  })
  assert.equal(classifyDatePrecision('not-a-date').kind, 'invalid')
  assert.equal(classifyDatePrecision(2026).kind, 'invalid')
})

test('day precision validates the calendar and compares on the exact day', () => {
  assert.deepEqual(classifyDatePrecision('2024-02-29'), {
    kind: 'date',
    precision: 'day',
    raw_value: '2024-02-29',
    comparison_date: '2024-02-29',
  })
  assert.equal(classifyDatePrecision('2023-02-29').kind, 'invalid')
  assert.equal(classifyDatePrecision('2026-13-01').kind, 'invalid')
})

test('month precision compares on the first day without changing the raw value', () => {
  assert.deepEqual(classifyDatePrecision('2024-04'), {
    kind: 'date',
    precision: 'month',
    raw_value: '2024-04',
    comparison_date: '2024-04-01',
  })
  assert.equal(classifyDatePrecision('2024-00').kind, 'invalid')
  assert.equal(classifyDatePrecision('2024-13').kind, 'invalid')
})

test('year precision remains intentionally non-comparable', () => {
  assert.deepEqual(classifyDatePrecision('2017'), {
    kind: 'date',
    precision: 'year',
    raw_value: '2017',
    comparison_date: null,
  })
})

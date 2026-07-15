import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR } from './common.mjs'
import batch0726 from './batches/batch-0726-0735.mjs'
import {
  SOURCE_DATE_SEMANTICS,
  assertSourceDateSemantics,
  assignLabeledSourceDate,
  sourceDateSemanticsErrors,
} from './sourceDateSemantics.mjs'

const {
  pageUpdateFields,
  pageUpdateLabels,
  protectedStrongerDateFields,
} = SOURCE_DATE_SEMANTICS

test('page-update labels cannot establish protected stronger dates', () => {
  for (const label of pageUpdateLabels) {
    for (const targetField of protectedStrongerDateFields) {
      assert.throws(
        () => assignLabeledSourceDate({}, { label, date: '2026-07-10', targetField }),
        new RegExp(`cannot establish ${targetField}`),
      )
    }
  }
})

test('last-updated wording cannot establish a revision date', () => {
  assert.throws(
    () => assignLabeledSourceDate(
      { source_id: 'fixture' },
      { label: 'Last updated on', date: '2026-07-10', targetField: 'revision_date' },
    ),
    { message: '[source-date-semantics] Last updated on cannot establish revision_date' },
  )
})

test('wrapped webpage-update wording cannot establish or prove a revision date', () => {
  for (const label of [
    'Last updated on 10th Jul, 2026',
    'last-updated',
    'current_page_last_updated',
    'UN last updated',
    'UN modified',
    'webpage last updated',
    'current page last updated',
    'MOHAP page last updated',
    'source modified on',
  ]) {
    assert.throws(
      () => assignLabeledSourceDate(
        { source_id: 'fixture' },
        { label, date: '2026-07-10', targetField: 'revision_date' },
      ),
      { message: `[source-date-semantics] ${label} cannot establish revision_date` },
    )

    const source = {
      source_id: 'fixture',
      webpage_last_updated_date: '2026-07-10',
      revision_date: '2026-07-10',
      date_provenance: {
        revision_date: {
          official_label: label,
          independent_from_webpage_update: true,
        },
      },
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [
      'revision_date duplicates a webpage-update date without independent explicit provenance',
    ])
  }
})

test('negated modification wording is not misclassified as a webpage update', () => {
  for (const wording of [
    'Document remains unmodified on 2026-07-10',
    'Document unmodified: 2026-07-10',
    'Document non-modified: 2026-07-10',
    'Document not modified on 2026-07-10',
  ]) {
    assert.deepEqual(sourceDateSemanticsErrors({
      source_id: 'fixture',
      revision_date: '2026-07-10',
      version: wording,
    }), [])
    assert.deepEqual(
      assignLabeledSourceDate(
        { source_id: 'fixture' },
        { label: wording, date: '2026-07-10', targetField: 'revision_date' },
      ),
      { source_id: 'fixture', revision_date: '2026-07-10' },
    )
  }

  assert.deepEqual(sourceDateSemanticsErrors({
    source_id: 'fixture',
    revision_date: '2026-07-10',
    version: 'Last updated 2026-07-100',
  }), [])
})

test('page-update labels populate only clearly labelled page-update fields', () => {
  for (const label of pageUpdateLabels) {
    for (const targetField of pageUpdateFields) {
      assert.deepEqual(
        assignLabeledSourceDate({ source_id: 'fixture' }, { label, date: '2026-07-10', targetField }),
        { source_id: 'fixture', [targetField]: '2026-07-10' },
      )
    }
  }
})

test('explicit publication wording is not rejected as a page-update label', () => {
  assert.deepEqual(
    assignLabeledSourceDate({ source_id: 'fixture' }, { label: 'Published', date: '2026-07-10', targetField: 'publication_date' }),
    { source_id: 'fixture', publication_date: '2026-07-10' },
  )
})

test('explicit revision evidence permits a genuine revision date', () => {
  for (const label of [
    'Revision date',
    'Revised on',
    'Formally revised',
    'Revision effective from',
    'Edition revision date',
  ]) {
    assert.deepEqual(
      assignLabeledSourceDate(
        { source_id: 'fixture' },
        { label, date: '2026-07-10', targetField: 'revision_date' },
      ),
      { source_id: 'fixture', revision_date: '2026-07-10' },
    )
  }

  const source = {
    source_id: 'fixture',
    webpage_last_updated_date: '2026-07-10',
    revision_date: '2026-07-10',
    date_provenance: {
      revision_date: {
        official_label: 'Revision date',
        independent_from_webpage_update: true,
      },
    },
  }
  assert.deepEqual(sourceDateSemanticsErrors(source), [])
  assert.doesNotThrow(() => assertSourceDateSemantics(source))
})

test('legacy NICE revision compatibility is limited to the exact established tuple', () => {
  const revisionError = 'revision_date duplicates a webpage-update date without independent explicit provenance'
  const source = {
    source_id: 'nice-atrial-fibrillation-ng196-2021',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    revision_date: '2021-06-30',
    version: 'NICE NG196; last updated 2021-06-30',
  }

  assert.deepEqual(sourceDateSemanticsErrors(source), [])
  assert.deepEqual(sourceDateSemanticsErrors({
    ...source,
    webpage_last_updated_date: '2021-06-30',
  }), [])

  for (const changedSource of [
    { ...source, source_id: 'nice-unlisted-guideline-2021' },
    { ...source, issuing_organisation: 'NICE' },
    {
      ...source,
      revision_date: '2021-07-01',
      version: 'NICE NG196; last updated 2021-07-01',
    },
  ]) {
    assert.deepEqual(sourceDateSemanticsErrors(changedSource), [revisionError])
  }
})

test('legacy NHS effective-date compatibility is limited to the exact established tuple', () => {
  const effectiveError = 'effective_date duplicates a webpage-update date without independent explicit provenance'
  const source = {
    source_id: 'nhs-england-adult-breathlessness-pathway-2023',
    issuing_organisation: 'NHS England',
    publication_date: '2023-04-26',
    effective_date: '2023-05-04',
    version: 'Published 2023-04-26; last updated 2023-05-04',
  }

  assert.deepEqual(sourceDateSemanticsErrors(source), [])
  for (const changedSource of [
    { ...source, source_id: 'nhs-england-unlisted-pathway-2023' },
    { ...source, issuing_organisation: 'NHS' },
    {
      ...source,
      effective_date: '2023-05-05',
      version: 'Published 2023-04-26; last updated 2023-05-05',
    },
  ]) {
    assert.deepEqual(sourceDateSemanticsErrors(changedSource), [effectiveError])
  }
})

test('active source validation rejects protected fields copied from page-update fields', () => {
  for (const pageUpdateField of pageUpdateFields) {
    for (const protectedField of protectedStrongerDateFields) {
      const source = {
        source_id: 'fixture',
        [pageUpdateField]: '2026-07-10',
        [protectedField]: '2026-07-10',
      }
      assert.throws(
        () => assertSourceDateSemantics(source),
        new RegExp(`${protectedField} duplicates a webpage-update date`),
      )
    }
  }
})

test('structured webpage-update metadata cannot establish a revision date', () => {
  const source = {
    source_id: 'fixture',
    webpage_last_updated_date: '2026-07-10',
    revision_date: '2026-07-10',
  }
  const error = 'revision_date duplicates a webpage-update date without independent explicit provenance'
  assert.deepEqual(sourceDateSemanticsErrors(source), [error])
  assert.throws(
    () => assertSourceDateSemantics(source),
    { message: `[source-date-semantics] ${error}` },
  )
})

test('raw replay metadata cannot omit the webpage-update field to promote stronger dates', () => {
  const source = {
    source_id: 'mohap-date-regression-fixture',
    publication_date: '2026-07-10',
    effective_date: '2026-07-10',
    revision_date: '2026-07-10',
    version: 'MOHAP service page; current page version last updated 10 July 2026',
    recency_verification: {
      status: 'current_official_page_opened_last_updated_2026-07-10',
    },
  }
  const expectedErrors = [
    'publication_date duplicates a webpage-update date without independent explicit provenance',
    'effective_date duplicates a webpage-update date without independent explicit provenance',
    'revision_date duplicates a webpage-update date without independent explicit provenance',
  ]
  assert.deepEqual(sourceDateSemanticsErrors(source), expectedErrors)
  assert.throws(
    () => assertSourceDateSemantics(source),
    { message: `[source-date-semantics] ${expectedErrors.join('; ')}` },
  )
})

test('human-only page-update wording cannot establish a raw revision date', () => {
  const source = {
    source_id: 'fixture',
    publication_date: '2020-01-01',
    effective_date: '2020-01-01',
    revision_date: '2026-07-10',
    version: 'Last updated on 10th Jul, 2026',
  }
  const error = 'revision_date duplicates a webpage-update date without independent explicit provenance'
  assert.deepEqual(sourceDateSemanticsErrors(source), [error])
  assert.throws(
    () => assertSourceDateSemantics(source),
    { message: `[source-date-semantics] ${error}` },
  )
})

test('common update connectors and separators cannot bypass raw revision validation', () => {
  for (const version of [
    'Last updated as of 2026-07-10',
    'Last updated (2026-07-10)',
    'Last updated on Friday, 10 July 2026',
    'Last updated at 2026-07-10',
    'Last updated date: 2026-07-10',
    'Last updated as of: 2026-07-10',
    'Last updated at: 2026-07-10',
    'Last updated (Friday, 10 July 2026)',
    'Last updated on (Friday, 10 July 2026)',
    'UN last updated 2026-07-10',
    'UN modified: 2026-07-10',
    'last-updated 2026-07-10',
    'current_page_last_updated_2026-07-10',
  ]) {
    assert.deepEqual(sourceDateSemanticsErrors({
      source_id: 'fixture',
      revision_date: '2026-07-10',
      version,
    }), [
      'revision_date duplicates a webpage-update date without independent explicit provenance',
    ])
  }
})

test('a different structured webpage-update date cannot suppress raw revision validation', () => {
  const source = {
    source_id: 'fixture',
    publication_date: '2020-01-01',
    effective_date: '2020-01-01',
    revision_date: '2026-07-10',
    webpage_last_updated_date: '2025-01-01',
    recency_verification: {
      status: 'page_last_updated_2026-07-10',
    },
  }
  const error = 'revision_date duplicates a webpage-update date without independent explicit provenance'
  assert.deepEqual(sourceDateSemanticsErrors(source), [error])
  assert.throws(
    () => assertSourceDateSemantics(source),
    { message: `[source-date-semantics] ${error}` },
  )
})

test('every active source date field and authoritative protected field is covered', () => {
  const sourceDirectory = path.join(EXPANSION_DIR, 'sources')
  const activeSources = fs.readdirSync(sourceDirectory)
    .filter((name) => name.endsWith('.json'))
    .flatMap((name) => JSON.parse(fs.readFileSync(path.join(sourceDirectory, name), 'utf8')).sources ?? [])
  const activeSourceDateFields = new Set(activeSources.flatMap((source) => (
    Object.keys(source).filter((field) => field.endsWith('_date'))
  )))
  const governedDateFields = new Set([...pageUpdateFields, ...protectedStrongerDateFields])

  assert.ok(protectedStrongerDateFields.includes('revision_date'))
  assert.equal(new Set(protectedStrongerDateFields).size, protectedStrongerDateFields.length)
  assert.deepEqual(
    [...activeSourceDateFields].filter((field) => !governedDateFields.has(field)).sort(),
    [],
  )

  const source = {
    source_id: 'fixture',
    webpage_last_updated_date: '2026-07-10',
    ...Object.fromEntries(protectedStrongerDateFields.map((field) => [field, '2026-07-10'])),
  }
  assert.deepEqual(
    sourceDateSemanticsErrors(source),
    protectedStrongerDateFields.map(
      (field) => `${field} duplicates a webpage-update date without independent explicit provenance`,
    ),
  )
  for (const targetField of protectedStrongerDateFields) {
    assert.throws(
      () => assignLabeledSourceDate({}, {
        label: 'last updated',
        date: '2026-07-10',
        targetField,
      }),
      { message: `[source-date-semantics] last updated cannot establish ${targetField}` },
    )
    assert.deepEqual(
      sourceDateSemanticsErrors({
        source_id: 'fixture',
        [targetField]: '2026-07-10',
        version: 'Last updated on 10th Jul, 2026',
      }),
      [`${targetField} duplicates a webpage-update date without independent explicit provenance`],
    )
  }
})

test('independently labelled same-day publication evidence is not rejected', () => {
  const source = {
    source_id: 'fixture',
    webpage_last_updated_date: '2026-07-10',
    publication_date: '2026-07-10',
    date_provenance: {
      publication_date: {
        official_label: 'Published',
        independent_from_webpage_update: true,
      },
    },
  }
  assert.deepEqual(sourceDateSemanticsErrors(source), [])
})

test('active and replayable MOHAP records preserve distinct date semantics', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(EXPANSION_DIR, 'sources', 'uae_clinical_sources.json'), 'utf8'))
  const active = registry.sources.find((source) => source.source_id === 'mohap-medical-leave-attestation-2026')
  const replayable = batch0726.sources
    .map((entry) => entry.source)
    .find((source) => source.source_id === 'mohap-medical-leave-attestation-2026')

  for (const source of [active, replayable]) {
    assert.ok(source)
    assert.equal(source.publication_date, 'undated_on_official_page')
    assert.equal(source.effective_date, null)
    assert.equal(source.revision_date, null)
    assert.equal(source.webpage_last_updated_date, '2026-07-10')
    assert.equal(source.recency_verification.verified_on, '2026-07-15')
    assert.equal(source.superseded_status_check.checked_on, '2026-07-15')
    assert.doesNotThrow(() => assertSourceDateSemantics(source))
  }
})

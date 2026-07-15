import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR } from './common.mjs'
import batch0726 from './batches/batch-0726-0735.mjs'
import {
  assertSourceDateSemantics,
  assignLabeledSourceDate,
  sourceDateSemanticsErrors,
} from './sourceDateSemantics.mjs'

const pageUpdateLabels = ['last updated', 'last updated on', 'modified', 'page updated', 'content updated']
const protectedFields = ['publication_date', 'effective_date', 'service_commencement_date', 'legal_effective_date']
const pageUpdateFields = ['last_updated_date', 'webpage_last_updated_date', 'source_modified_date']

test('page-update labels cannot establish publication, commencement, or legal-effective dates', () => {
  for (const label of pageUpdateLabels) {
    for (const targetField of protectedFields) {
      assert.throws(
        () => assignLabeledSourceDate({}, { label, date: '2026-07-10', targetField }),
        new RegExp(`cannot establish ${targetField}`),
      )
    }
  }
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

test('active source validation rejects protected fields copied from page-update fields', () => {
  for (const pageUpdateField of pageUpdateFields) {
    for (const protectedField of protectedFields) {
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
    assert.doesNotThrow(() => assertSourceDateSemantics(source))
  }
})

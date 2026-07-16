import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR, ROOT_DIR } from './common.mjs'
import batch0726 from './batches/batch-0726-0735.mjs'
import {
  SOURCE_DATE_SEMANTICS,
  assertSourceDateSemantics,
  assignLabeledSourceDate,
  sourceDateSemanticsErrors,
} from './sourceDateSemantics.mjs'

const dateFieldSchemaPath = path.join(
  EXPANSION_DIR,
  'schema',
  'SOURCE_REGISTRY_DATE_FIELDS.schema.json',
)
const dateFieldSchema = JSON.parse(fs.readFileSync(dateFieldSchemaPath, 'utf8'))
const establishedSourceDateTuplePath = path.join(
  EXPANSION_DIR,
  'schema',
  'ESTABLISHED_SOURCE_DATE_TUPLES.json',
)
const establishedSourceDateTupleDocument = JSON.parse(
  fs.readFileSync(establishedSourceDateTuplePath, 'utf8'),
)
const establishedSourceDateTupleById = new Map(
  establishedSourceDateTupleDocument.source_tuples.map((tuple) => [tuple.source_id, tuple]),
)
const schemaStrongerDateFields = Object.entries(dateFieldSchema.properties)
  .filter(([, definition]) => definition['x-najm-date-semantic'] === 'stronger_date')
  .map(([field]) => field)
  .sort()
const schemaPageUpdateFields = Object.entries(dateFieldSchema.properties)
  .filter(([, definition]) => definition['x-najm-date-semantic'] === 'webpage_update_date')
  .map(([field]) => field)
  .sort()
const {
  pageUpdateFields,
  pageUpdateLabels,
  protectedStrongerDateFields,
  strongerDateFieldContract,
} = SOURCE_DATE_SEMANTICS

function genericEvidenceError(field) {
  const category = dateFieldSchema.properties[field]['x-najm-evidence-category']
  return `${field} lacks explicit ${category} evidence; generic webpage-update evidence cannot establish it`
}

function missingEvidenceError(field) {
  const category = dateFieldSchema.properties[field]['x-najm-evidence-category']
  return `${field} lacks explicit ${category} evidence`
}

function explicitEvidenceExample(field) {
  return dateFieldSchema.properties[field]['x-najm-explicit-evidence-example']
}

function contractCoverageErrors(contract, expectedFields = schemaStrongerDateFields) {
  const errors = []
  for (const field of expectedFields) {
    const rule = contract[field]
    if (!rule) {
      errors.push(`${field}: semantic rule missing`)
      continue
    }
    const genericLabels = rule.acceptedExplicitEvidenceLabels.filter((label) => pageUpdateLabels.includes(label))
    if (!rule.acceptedExplicitEvidenceLabels.some((label) => !pageUpdateLabels.includes(label))) {
      errors.push(`${field}: has only generic webpage-update evidence`)
    } else if (genericLabels.length > 0) {
      errors.push(`${field}: accepts prohibited generic webpage-update evidence`)
    }
  }
  return errors
}

function activeSources() {
  const sourceDirectory = path.join(EXPANSION_DIR, 'sources')
  return fs.readdirSync(sourceDirectory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => JSON.parse(fs.readFileSync(path.join(sourceDirectory, name), 'utf8')).sources ?? [])
}

function establishedFieldFixture(sourceId, field, extra = {}) {
  const tuple = establishedSourceDateTupleById.get(sourceId)
  assert.ok(tuple, `Missing established source-date tuple ${sourceId}`)
  assert.ok(Object.hasOwn(tuple.stronger_dates, field), `${sourceId} has no ${field} tuple`)
  return {
    source_id: tuple.source_id,
    issuing_organisation: tuple.issuing_organisation,
    exact_document_title: tuple.exact_document_title,
    exact_official_url: tuple.exact_official_url,
    [field]: tuple.stronger_dates[field],
    ...extra,
  }
}

test('independent schema classification and production contract cover the same five stronger-date fields', () => {
  assert.deepEqual(schemaStrongerDateFields, [
    'effective_date',
    'legal_effective_date',
    'publication_date',
    'revision_date',
    'service_commencement_date',
  ])
  assert.deepEqual([...protectedStrongerDateFields].sort(), schemaStrongerDateFields)
  assert.deepEqual([...pageUpdateFields].sort(), schemaPageUpdateFields)
  assert.deepEqual(contractCoverageErrors(strongerDateFieldContract), [])

  for (const field of schemaStrongerDateFields) {
    const schemaRule = dateFieldSchema.properties[field]
    const productionRule = strongerDateFieldContract[field]
    assert.equal(productionRule.evidenceCategory, schemaRule['x-najm-evidence-category'])
    assert.equal(productionRule.permittedNull, schemaRule['x-najm-null-permitted'])
    assert.deepEqual(productionRule.permittedUnknownValues, schemaRule['x-najm-approved-unknown-values'])
    assert.ok(productionRule.acceptedExplicitEvidenceLabels.includes(
      schemaRule['x-najm-explicit-evidence-example'].toLowerCase(),
    ))
    assert.deepEqual(
      productionRule.prohibitedEvidenceCategories,
      schemaRule['x-najm-prohibited-evidence-categories'],
    )
    assert.deepEqual(
      productionRule.acceptedEvidenceCategories,
      schemaRule['x-najm-accepted-evidence-categories'],
    )
  }
})

test('the frozen pre-contract tuple file exactly binds the active 235-source baseline', () => {
  assert.equal(establishedSourceDateTupleDocument.schema_version, '1.0.0')
  assert.equal(
    establishedSourceDateTupleDocument.baseline_commit,
    '0610e1def1b82bb46d9296b91a54f1ab4a80238d',
  )
  const sources = activeSources()
  assert.equal(sources.length, 235)
  assert.equal(establishedSourceDateTupleById.size, sources.length)

  for (const source of sources) {
    const tuple = establishedSourceDateTupleById.get(source.source_id)
    assert.ok(tuple, `Missing established tuple ${source.source_id}`)
    assert.equal(tuple.issuing_organisation, source.issuing_organisation)
    assert.equal(tuple.exact_document_title, source.exact_document_title)
    assert.equal(tuple.exact_official_url, source.exact_official_url)
    assert.deepEqual(tuple.stronger_dates, Object.fromEntries(
      schemaStrongerDateFields
        .filter((field) => source[field] !== null && source[field] !== undefined)
        .map((field) => [field, source[field]]),
    ))
  }
})

test('removing any protected field is independently detected by the schema-derived completeness check', () => {
  for (const omittedField of schemaStrongerDateFields) {
    const mutatedContract = Object.fromEntries(
      Object.entries(strongerDateFieldContract).filter(([field]) => field !== omittedField),
    )
    assert.deepEqual(contractCoverageErrors(mutatedContract), [`${omittedField}: semantic rule missing`])
  }
  assert.deepEqual(
    contractCoverageErrors(strongerDateFieldContract, [...schemaStrongerDateFields, 'future_stronger_date']),
    ['future_stronger_date: semantic rule missing'],
  )
})

test('a stronger-date rule containing only generic webpage-update labels fails completeness', () => {
  for (const field of schemaStrongerDateFields) {
    const mutatedContract = {
      ...strongerDateFieldContract,
      [field]: {
        ...strongerDateFieldContract[field],
        acceptedExplicitEvidenceLabels: [...pageUpdateLabels],
      },
    }
    assert.deepEqual(contractCoverageErrors(mutatedContract), [
      `${field}: has only generic webpage-update evidence`,
    ])
  }
})

test('a stronger-date rule cannot mix a generic webpage-update label into explicit evidence', () => {
  for (const field of schemaStrongerDateFields) {
    const mutatedContract = {
      ...strongerDateFieldContract,
      [field]: {
        ...strongerDateFieldContract[field],
        acceptedExplicitEvidenceLabels: [
          ...strongerDateFieldContract[field].acceptedExplicitEvidenceLabels,
          'last updated',
        ],
      },
    }
    assert.deepEqual(contractCoverageErrors(mutatedContract), [
      `${field}: accepts prohibited generic webpage-update evidence`,
    ])
  }
})

test('all production registry and replay paths retain the central date-semantics guard', () => {
  const paths = {
    initial: 'scripts/recordInitialSourceResearch.mjs',
    batch: 'scripts/source-first/applyResearchBatch.mjs',
    checks: 'scripts/source-first/runCheck.mjs',
    canonical: 'scripts/source-first/canonicalMappingStore.mjs',
  }
  const sources = Object.fromEntries(Object.entries(paths).map(([name, relative]) => [
    name,
    fs.readFileSync(path.join(ROOT_DIR, relative), 'utf8'),
  ]))

  assert.match(sources.initial, /import \{ assertSourceDateSemantics \} from '.\/source-first\/sourceDateSemantics\.mjs'/)
  assert.match(sources.initial, /for \(const source of sourceRegistry\) assertSourceDateSemantics\(source\)/)
  assert.match(sources.batch, /import \{ assertSourceDateSemantics \} from '.\/sourceDateSemantics\.mjs'/)
  assert.ok((sources.batch.match(/assertSourceDateSemantics\(/g) ?? []).length >= 3)
  assert.match(sources.checks, /import \{ sourceDateSemanticsErrors \} from '.\/sourceDateSemantics\.mjs'/)
  assert.match(sources.checks, /for \(const dateError of sourceDateSemanticsErrors\(source\)\)/)
  assert.match(sources.checks, /function sourceRecencyCheck\(\)[\s\S]*?const sources = loadSourceRegistry\(\)/)
  assert.match(sources.canonical, /import \{ assertSourceDateSemantics \} from '.\/sourceDateSemantics\.mjs'/)
  assert.match(sources.canonical, /for \(const source of sources\) assertSourceDateSemantics\(source\)/)
})

test('generic page-update labels cannot assign any stronger-date field', () => {
  for (const label of pageUpdateLabels) {
    for (const targetField of schemaStrongerDateFields) {
      assert.throws(
        () => assignLabeledSourceDate({}, { label, date: '2026-07-10', targetField }),
        new RegExp(`cannot establish ${targetField}`),
      )
    }
  }
})

test('field-appropriate labels assign structured provenance for every stronger-date field', () => {
  for (const targetField of schemaStrongerDateFields) {
    const label = explicitEvidenceExample(targetField)
    assert.deepEqual(
      assignLabeledSourceDate({}, { label, date: '2026-07-10', targetField }),
      {
        [targetField]: '2026-07-10',
        date_provenance: {
          [targetField]: {
            official_label: label,
            independent_from_webpage_update: true,
          },
        },
      },
    )
  }
})

test('unrelated or wrong-field labels cannot assign a stronger date', () => {
  for (const targetField of schemaStrongerDateFields) {
    assert.throws(
      () => assignLabeledSourceDate({}, { label: 'Document date', date: '2026-07-10', targetField }),
      new RegExp(`is not explicit .* evidence for ${targetField}`),
    )
    const wrongField = schemaStrongerDateFields.find((field) => field !== targetField)
    assert.throws(
      () => assignLabeledSourceDate({}, {
        label: explicitEvidenceExample(wrongField),
        date: '2026-07-10',
        targetField,
      }),
      new RegExp(`is not explicit .* evidence for ${targetField}`),
    )
  }
})

test('generic webpage-update evidence with the same date is rejected field by field', () => {
  for (const field of schemaStrongerDateFields) {
    const source = {
      source_id: 'fixture',
      webpage_last_updated_date: '2026-07-10',
      [field]: '2026-07-10',
      version: 'Last updated on 10 July 2026',
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [genericEvidenceError(field)])
    assert.throws(
      () => assertSourceDateSemantics(source),
      { message: `[source-date-semantics] ${genericEvidenceError(field)}` },
    )
  }
})

test('generic webpage-update evidence with a different date is rejected field by field', () => {
  for (const field of schemaStrongerDateFields) {
    const source = {
      source_id: 'fixture',
      webpage_last_updated_date: '2026-07-10',
      [field]: '2025-11-01',
      version: 'Last updated on 10 July 2026',
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [genericEvidenceError(field)])
    assert.throws(
      () => assertSourceDateSemantics(source),
      { message: `[source-date-semantics] ${genericEvidenceError(field)}` },
    )
  }
})

test('a bare non-null stronger date without any evidence is rejected field by field', () => {
  for (const field of schemaStrongerDateFields) {
    const source = {
      source_id: 'fixture',
      [field]: '2025-11-01',
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [missingEvidenceError(field)])
    assert.throws(
      () => assertSourceDateSemantics(source),
      { message: `[source-date-semantics] ${missingEvidenceError(field)}` },
    )
  }
})

test('the required different-date revision regression is rejected for the semantic reason', () => {
  const source = {
    source_id: 'fixture',
    webpage_last_updated_date: '2026-07-10',
    revision_date: '2025-11-01',
    version: 'Last updated on 10 July 2026',
  }
  assert.deepEqual(sourceDateSemanticsErrors(source), [genericEvidenceError('revision_date')])
})

test('field-specific structured provenance overrides unrelated generic page metadata', () => {
  for (const field of schemaStrongerDateFields) {
    const source = {
      source_id: 'fixture',
      webpage_last_updated_date: '2026-07-10',
      [field]: '2025-11-01',
      version: 'Last updated on 10 July 2026',
      date_provenance: {
        [field]: {
          official_label: explicitEvidenceExample(field),
          independent_from_webpage_update: true,
        },
      },
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [])
    assert.doesNotThrow(() => assertSourceDateSemantics(source))
  }
})

test('field-appropriate source wording with the matching date is accepted', () => {
  for (const field of schemaStrongerDateFields) {
    const source = {
      source_id: 'fixture',
      [field]: '2026-07-10',
      version: `${explicitEvidenceExample(field)}: 10 July 2026`,
    }
    assert.deepEqual(sourceDateSemanticsErrors(source), [])
  }
})

test('an explicit label cannot borrow an unrelated date from another metadata segment', () => {
  const source = {
    source_id: 'fixture',
    revision_date: '2025-11-01',
    version: 'Revision date: 10 July 2026; verified on 1 November 2025',
  }
  assert.deepEqual(sourceDateSemanticsErrors(source), [missingEvidenceError('revision_date')])
  assert.deepEqual(sourceDateSemanticsErrors({
    ...source,
    revision_date: '2026-07-10',
  }), [])
})

test('generic or wrong-field provenance is rejected even when marked independent', () => {
  for (const field of schemaStrongerDateFields) {
    const generic = {
      source_id: 'fixture',
      [field]: '2025-11-01',
      date_provenance: {
        [field]: {
          official_label: 'Last updated',
          independent_from_webpage_update: true,
        },
      },
    }
    assert.deepEqual(sourceDateSemanticsErrors(generic), [genericEvidenceError(field)])

    const wrongField = schemaStrongerDateFields.find((candidate) => candidate !== field)
    const wrong = {
      source_id: 'fixture',
      [field]: '2025-11-01',
      date_provenance: {
        [field]: {
          official_label: explicitEvidenceExample(wrongField),
          independent_from_webpage_update: true,
        },
      },
    }
    assert.deepEqual(sourceDateSemanticsErrors(wrong), [
      `${field} lacks explicit ${dateFieldSchema.properties[field]['x-najm-evidence-category']} evidence`,
    ])
  }
})

test('null values and the approved publication unknown remain valid', () => {
  const nullSource = {
    source_id: 'fixture',
    version: 'Last updated on 10 July 2026',
    webpage_last_updated_date: '2026-07-10',
    ...Object.fromEntries(schemaStrongerDateFields.map((field) => [field, null])),
  }
  assert.deepEqual(sourceDateSemanticsErrors(nullSource), [])
  assert.deepEqual(sourceDateSemanticsErrors({
    ...nullSource,
    publication_date: 'undated_on_official_page',
  }), [])
})

test('page-update labels populate only independently classified page-update fields', () => {
  for (const label of pageUpdateLabels) {
    for (const targetField of schemaPageUpdateFields) {
      assert.deepEqual(
        assignLabeledSourceDate({ source_id: 'fixture' }, { label, date: '2026-07-10', targetField }),
        { source_id: 'fixture', [targetField]: '2026-07-10' },
      )
    }
  }
})

test('negated modification wording is not generic evidence and cannot establish a stronger date', () => {
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
    }), [missingEvidenceError('revision_date')])
  }
})

test('common update connectors cannot bypass same-date or different-date revision protection', () => {
  for (const version of [
    'Last updated as of 2026-07-10',
    'Last updated (2026-07-10)',
    'Last updated on Friday, 10 July 2026',
    'Last updated at 2026-07-10',
    'Last updated date: 2026-07-10',
    'UN modified: 2026-07-10',
    'last-updated 2026-07-10',
    'current_page_last_updated_2026-07-10',
  ]) {
    for (const revisionDate of ['2026-07-10', '2025-11-01']) {
      assert.deepEqual(sourceDateSemanticsErrors({
        source_id: 'fixture',
        revision_date: revisionDate,
        version,
      }), [genericEvidenceError('revision_date')])
    }
  }
})

test('established pre-contract tuples require exact source identity and date values', () => {
  const nice = establishedFieldFixture('nice-atrial-fibrillation-ng196-2021', 'revision_date', {
    version: 'NICE NG196; last updated 2021-06-30',
  })
  assert.deepEqual(sourceDateSemanticsErrors(nice), [])
  for (const changed of [
    { ...nice, source_id: 'nice-unlisted-guideline-2021' },
    { ...nice, issuing_organisation: 'NICE' },
    { ...nice, exact_document_title: `${nice.exact_document_title} changed` },
    { ...nice, exact_official_url: `${nice.exact_official_url}?changed=1` },
    { ...nice, revision_date: '2021-07-01' },
  ]) assert.deepEqual(sourceDateSemanticsErrors(changed), [genericEvidenceError('revision_date')])

  const nhs = establishedFieldFixture('nhs-england-adult-breathlessness-pathway-2023', 'effective_date', {
    version: 'Published 2023-04-26; last updated 2023-05-04',
  })
  assert.deepEqual(sourceDateSemanticsErrors(nhs), [])
  assert.deepEqual(sourceDateSemanticsErrors({ ...nhs, effective_date: '2023-05-05' }), [
    genericEvidenceError('effective_date'),
  ])
})

test('raw metadata cannot promote several stronger dates from one generic update', () => {
  const source = {
    source_id: 'mohap-date-regression-fixture',
    publication_date: '2025-11-01',
    effective_date: '2025-11-02',
    revision_date: '2025-11-03',
    version: 'MOHAP service page; current page version last updated 10 July 2026',
    recency_verification: {
      status: 'current_official_page_opened_last_updated_2026-07-10',
    },
  }
  assert.deepEqual(sourceDateSemanticsErrors(source), [
    genericEvidenceError('publication_date'),
    genericEvidenceError('effective_date'),
    genericEvidenceError('revision_date'),
  ])
})

test('all active source date fields are schema-classified and all active records pass semantics', () => {
  const sources = activeSources()
  const governedDateFields = new Set([...schemaStrongerDateFields, ...schemaPageUpdateFields])
  const activeSourceDateFields = new Set(sources.flatMap((source) => (
    Object.keys(source).filter((field) => field.endsWith('_date'))
  )))
  assert.deepEqual(
    [...activeSourceDateFields].filter((field) => !governedDateFields.has(field)).sort(),
    [],
  )
  for (const source of sources) assert.doesNotThrow(() => assertSourceDateSemantics(source), source.source_id)
})

test('source-recency keeps webpage, access, and review dates separate from stronger dates', () => {
  const sourceText = fs.readFileSync(path.join(ROOT_DIR, 'scripts/source-first/runCheck.mjs'), 'utf8')
  const recencyBody = sourceText.match(/function sourceRecencyCheck\(\) \{([\s\S]*?)\n\}/)?.[1] ?? ''
  assert.match(recencyBody, /const sources = loadSourceRegistry\(\)/)
  assert.match(recencyBody, /recency_verification\?\.verified_on/)
  assert.doesNotMatch(recencyBody, /effective_date\s*[<>]=?|revision_date\s*[<>]=?|service_commencement_date\s*[<>]=?|legal_effective_date\s*[<>]=?/)
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

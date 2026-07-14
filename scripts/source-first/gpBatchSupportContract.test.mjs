import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  assertNoTextMappingRequest,
  sectionObjectHash,
  sourceObjectHash,
  validateExplicitGpMapping,
  validateExplicitGpMappings,
} from './batches/gpExplicitMappingContract.mjs'
import { ROOT_DIR, fileSha256 } from './common.mjs'

const workflow = { workflow_id: 'gp-contract-test', content_sections: {} }
const otherWorkflow = { workflow_id: 'gp-contract-other', content_sections: {} }
const item = { item_id: 'item-gp-contract-test-1', origin: 'legacy_exact' }
const otherItem = { item_id: 'item-gp-contract-other-1', origin: 'legacy_exact' }
const section = { section_id: 'section-contract-1', heading: 'Exact section', locator: 'page 1', evidence_summary: 'Exact evidence.' }
const source = { source_id: 'source-contract-1', exact_document_title: 'Exact source', exact_sections: [section] }

function context() {
  return {
    workflowsById: new Map([[workflow.workflow_id, workflow], [otherWorkflow.workflow_id, otherWorkflow]]),
    itemsByWorkflowId: new Map([
      [workflow.workflow_id, new Map([[item.item_id, item]])],
      [otherWorkflow.workflow_id, new Map([[otherItem.item_id, otherItem]])],
    ]),
    sourcesById: new Map([[source.source_id, source]]),
    reviewedSourceIds: new Set([source.source_id]),
    reviewedSectionIds: new Set([section.section_id]),
  }
}

function validMapping() {
  return {
    workflowId: workflow.workflow_id,
    itemId: item.item_id,
    sourceId: source.source_id,
    sectionId: section.section_id,
    sourceHash: sourceObjectHash(source),
    sectionHash: sectionObjectHash(section),
    evidenceRelationship: 'The exact section directly supports this exact legacy documentation item.',
    populationApplicability: 'Adults represented by the exact source population.',
    settingApplicability: 'Primary-care documentation in the exact reviewed setting.',
    jurisdictionApplicability: 'International guidance requiring explicit local jurisdiction review.',
    uaeApplicability: 'Requires explicit UAE pathway and jurisdiction review.',
    applicabilityRationale: 'gp-contract-test uses this exact section only for its workflow-owned documentation item.',
    supportStatus: 'exact_section_supported',
    origin: 'legacy_exact',
  }
}

test('valid explicit mapping succeeds and is immutable', () => {
  const result = validateExplicitGpMapping(validMapping(), context())
  assert.equal(result.itemId, item.item_id)
  assert.equal(Object.isFrozen(result), true)
})

for (const field of [
  'itemId',
  'workflowId',
  'sourceId',
  'sectionId',
  'populationApplicability',
  'settingApplicability',
  'jurisdictionApplicability',
  'uaeApplicability',
  'applicabilityRationale',
  'evidenceRelationship',
  'supportStatus',
  'origin',
  'sourceHash',
  'sectionHash',
]) {
  test(`omitted ${field} fails closed`, () => {
    const mapping = validMapping()
    delete mapping[field]
    assert.throws(() => validateExplicitGpMapping(mapping, context()), new RegExp(`required-${field}`))
  })
}

test('item ID from another workflow fails', () => {
  const mapping = { ...validMapping(), itemId: otherItem.item_id }
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /item-owned-by-workflow/)
})

test('nonexistent item ID fails', () => {
  const mapping = { ...validMapping(), itemId: 'missing-item' }
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /item-exists/)
})

test('nonexistent source fails', () => {
  const mapping = { ...validMapping(), sourceId: 'missing-source' }
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /source-exists/)
})

test('section not belonging to source fails', () => {
  const mapping = { ...validMapping(), sectionId: 'missing-section' }
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /section-belongs-to-source/)
})

test('unreviewed section fails', () => {
  const value = context()
  value.reviewedSectionIds.clear()
  assert.throws(() => validateExplicitGpMapping(validMapping(), value), /section-reviewed/)
})

test('unreviewed source fails', () => {
  const value = context()
  value.reviewedSourceIds.clear()
  assert.throws(() => validateExplicitGpMapping(validMapping(), value), /source-opened/)
})

test('duplicate item ID fails', () => {
  assert.throws(() => validateExplicitGpMappings([validMapping(), validMapping()], context()), /unique-item-within-workflow/)
})

for (const field of ['text', 'label', 'fuzzy']) {
  test(`${field} matching is unavailable`, () => {
    assert.throws(() => assertNoTextMappingRequest({ ...validMapping(), [field]: 'clinical wording' }), /text-matching-unavailable/)
  })
}

test('no default setting, jurisdiction, UAE applicability, or population exists', () => {
  for (const field of ['settingApplicability', 'jurisdictionApplicability', 'uaeApplicability', 'populationApplicability']) {
    const mapping = validMapping()
    mapping[field] = ''
    assert.throws(() => validateExplicitGpMapping(mapping, context()), new RegExp(`nonempty-${field}`))
  }
})

test('invalid support status fails', () => {
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), supportStatus: 'supported' }, context()), /permitted-support-status/)
})

test('invalid source and section hashes fail', () => {
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), sourceHash: '0'.repeat(64) }, context()), /valid-source-hash/)
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), sectionHash: '0'.repeat(64) }, context()), /valid-section-hash/)
})

test('generic applicability rationale fails', () => {
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), applicabilityRationale: 'Applicable.' }, context()), /workflow-specific-applicability-rationale/)
})

test('legacy item cannot be relabelled source derived', () => {
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), origin: 'source_derived' }, context()), /permitted-origin/)
})

test('deterministic output is reproducible', () => {
  assert.deepEqual(validateExplicitGpMapping(validMapping(), context()), validateExplicitGpMapping(validMapping(), context()))
})

test('helper cannot mutate workflow context', () => {
  const value = context()
  const before = JSON.stringify([...value.itemsByWorkflowId.entries()].map(([id, items]) => [id, [...items.entries()]]))
  validateExplicitGpMapping(validMapping(), value)
  assert.equal(JSON.stringify([...value.itemsByWorkflowId.entries()].map(([id, items]) => [id, [...items.entries()]])), before)
})

test('helper cannot modify frozen application files', () => {
  const files = [
    path.join(ROOT_DIR, 'public', 'data', 'clinical_workflows.json'),
    path.join(ROOT_DIR, 'public', 'config', 'limited_testing_exclusions.json'),
  ]
  const before = files.map(fileSha256)
  validateExplicitGpMapping(validMapping(), context())
  assert.deepEqual(files.map(fileSha256), before)
  assert.equal(files.every((filePath) => fs.existsSync(filePath)), true)
})

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
import { CANONICAL_MAPPING_VERSION } from './canonicalMappingLedger.mjs'
import { scanStaticClinicalMappingSource } from './auditExplicitMappingContract.mjs'
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
  const identity = `${workflow.workflow_id} ${item.item_id} ${source.source_id} ${section.section_id}`
  return {
    workflowId: workflow.workflow_id,
    itemId: item.item_id,
    sourceId: source.source_id,
    sectionId: section.section_id,
    sourceHash: sourceObjectHash(source),
    sectionHash: sectionObjectHash(section),
    evidenceRelationship: 'The exact section directly supports this exact legacy documentation item.',
    populationApplicability: `${identity}: the source population is limited to adults represented by the reviewed section; children, pregnancy, and unmatched populations are excluded.`,
    settingApplicability: `${identity}: transfer from the source setting to the test workflow is direct only for documentation; management and referral decisions are excluded.`,
    jurisdictionApplicability: `${identity}: the source jurisdiction is non-UAE and transfers indirectly; local pathways, regulation, and scope remain excluded pending review.`,
    uaeApplicability: `${identity}: applicable_with_local_review because the source is non-UAE; UAE pathways, prescribing, referral, and scope require separate confirmation.`,
    applicabilityRationale: `${identity}: the exact reviewed section directly describes the same documentation element for the stated adult population in the reviewed outpatient setting. UAE-local pathway transfer is limited, and all clinical management, prescribing, investigation, escalation, and referral decisions remain excluded.`,
    supportStatus: 'exact_section_supported',
    origin: 'legacy_exact',
    mappingVersion: CANONICAL_MAPPING_VERSION,
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
  'mappingVersion',
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

test('conflicting mappings for the same workflow item fail', () => {
  const conflicting = validMapping()
  conflicting.sourceId = 'different-source'
  conflicting.sectionId = 'different-section'
  assert.throws(
    () => validateExplicitGpMappings([validMapping(), conflicting], context()),
    /unique-item-within-workflow/,
  )
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

test('previous generic remediation rationale fails even when workflow ID is present', () => {
  const mapping = validMapping()
  mapping.applicabilityRationale = `${mapping.workflowId}: the exact reviewed source section is retained only for this workflow-owned documentation item; its recorded population, setting, source jurisdiction, and UAE limitations remain explicit and require clinician review.`
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /workflow-specific-applicability-rationale|generic-applicability-rationale/)
})

test('generic rationale with all IDs but no substantive applicability dimensions fails', () => {
  const mapping = validMapping()
  mapping.applicabilityRationale = `${mapping.workflowId} ${mapping.itemId} ${mapping.sourceId} ${mapping.sectionId}: documentation correspondence is recorded for these identifiers and no decision is made by this mapping.`
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /workflow-specific-applicability-rationale/)
})

test('unchanged rationale reused across unrelated workflows fails', () => {
  const shared = `${workflow.workflow_id} ${item.item_id} ${otherWorkflow.workflow_id} ${otherItem.item_id} ${source.source_id} ${section.section_id}: adult population limits, outpatient setting limits, UAE local pathway limits, and excluded management scope are recorded identically for both unrelated mappings.`
  const first = validMapping()
  const second = validMapping()
  second.workflowId = otherWorkflow.workflow_id
  second.itemId = otherItem.item_id
  for (const mapping of [first, second]) {
    mapping.populationApplicability = shared
    mapping.settingApplicability = shared
    mapping.jurisdictionApplicability = shared
    mapping.uaeApplicability = shared
    mapping.applicabilityRationale = shared
  }
  assert.throws(() => validateExplicitGpMappings([first, second], context()), /no-cross-workflow-shared-clinical-prose/)
})

test('generic shared applicability supplied through object spread fails', () => {
  const sharedApplicability = {
    populationApplicability: 'Adults represented by the exact source population.',
    settingApplicability: 'Primary-care documentation in the exact reviewed setting.',
    jurisdictionApplicability: 'International guidance requiring explicit local jurisdiction review.',
    uaeApplicability: 'Requires explicit UAE pathway and jurisdiction review.',
  }
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), ...sharedApplicability }, context()), /mapping-specific-/)
})

test('generic shared applicability constant fails', () => {
  const mapping = validMapping()
  mapping.settingApplicability = 'Primary-care documentation in the exact reviewed setting.'
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /mapping-specific-settingApplicability/)
})

test('valid-looking shared applicability spread is rejected at the source boundary', () => {
  const sourceText = `
    const shared = {
      populationApplicability: 'gp-contract-test item-gp-contract-test-1 source-contract-1 section-contract-1 adult population applicability with explicit exclusions and limitations',
      settingApplicability: 'gp-contract-test item-gp-contract-test-1 source-contract-1 section-contract-1 outpatient setting applicability with explicit exclusions and limitations'
    }
    export const mapping = { ...shared, workflowId: 'gp-contract-test', itemId: 'item-gp-contract-test-1' }
  `
  assert.notEqual(scanStaticClinicalMappingSource('alternate/shared-spread.mjs', sourceText).length, 0)
})

test('unexpected mapping property fails', () => {
  assert.throws(() => validateExplicitGpMapping({ ...validMapping(), defaultUaeApplicability: 'shared' }, context()), /no-unexpected-properties/)
})

test('prototype-derived mapping fails', () => {
  const mapping = Object.create(validMapping())
  assert.throws(() => validateExplicitGpMapping(mapping, context()), /plain-schema-owned-object/)
})

test('whitespace-only required fields fail', () => {
  for (const field of ['workflowId', 'itemId', 'sourceId', 'sectionId', 'applicabilityRationale']) {
    const mapping = validMapping()
    mapping[field] = '   '
    assert.throws(() => validateExplicitGpMapping(mapping, context()), new RegExp(`nonempty-${field}`))
  }
})

test('validated output cannot be mutated', () => {
  const result = validateExplicitGpMapping(validMapping(), context())
  assert.throws(() => { result.itemId = 'changed' }, TypeError)
  assert.equal(result.itemId, item.item_id)
})

test('caller mapping object is cloned', () => {
  const mapping = validMapping()
  const result = validateExplicitGpMapping(mapping, context())
  mapping.itemId = 'changed-after-validation'
  assert.equal(result.itemId, item.item_id)
})

test('caller mapping array is cloned and immutable', () => {
  const mappings = [validMapping()]
  const result = validateExplicitGpMappings(mappings, context())
  mappings.push(validMapping())
  assert.equal(result.length, 1)
  assert.equal(Object.isFrozen(result), true)
  assert.throws(() => result.push(validMapping()), TypeError)
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

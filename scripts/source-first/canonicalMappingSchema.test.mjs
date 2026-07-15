import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_SCHEMA_PATH,
} from './canonicalMappingContract.mjs'
import {
  loadCanonicalMappings,
  parseStrictJsonText,
  validateCanonicalMappingDocument,
} from './canonicalMappingStore.mjs'
import { readJson } from './common.mjs'
import { createSyntheticCanonicalFixture } from './canonicalMappingFixture.test.mjs'

function documentFor(mapping) {
  return { schemaVersion: '1.0.0', workflowId: mapping.workflowId, mappings: [mapping] }
}

test('canonical JSON Schema is strict and declares every canonical mapping field', () => {
  const schema = readJson(CANONICAL_MAPPING_SCHEMA_PATH)
  assert.equal(schema.additionalProperties, false)
  assert.equal(schema.$defs.mapping.additionalProperties, false)
  assert.deepEqual(schema.$defs.mapping.required, [...CANONICAL_MAPPING_FIELDS])
})

test('strict JSON parser rejects malformed JSON and duplicate properties', () => {
  assert.throws(() => parseStrictJsonText('{"workflowId":', 'malformed.json'), /malformed strict JSON/)
  assert.throws(() => parseStrictJsonText('{"workflowId":"a","workflowId":"b"}', 'duplicate.json'), /duplicate JSON properties/)
})

test('valid synthetic canonical document passes', () => {
  const fixture = createSyntheticCanonicalFixture()
  const result = validateCanonicalMappingDocument(documentFor(fixture.mapping), { context: fixture.context })
  assert.equal(result.mappings.length, 1)
  assert.equal(Object.isFrozen(result), true)
})

test('unknown document and mapping properties fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument({ ...documentFor(fixture.mapping), unexpected: true }, { context: fixture.context }), /unexpected properties/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, unexpected: 'x' }), { context: fixture.context }), /unexpected properties/)
})

test('missing applicability and generic rationale fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  const missing = { ...fixture.mapping }
  delete missing.uaeApplicability
  assert.throws(() => validateCanonicalMappingDocument(documentFor(missing), { context: fixture.context }), /missing required properties/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, applicabilityRationale: 'Applicable to this workflow' }), { context: fixture.context }), /workflow-specific-applicability-rationale/)
})

test('wrong hashes and cross-workflow items fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, sectionHash: '0'.repeat(64) }), { context: fixture.context }), /valid-section-hash/)
  const other = createSyntheticCanonicalFixture({ workflowId: 'synthetic-other', itemId: 'synthetic-other--item-1' })
  const crossContext = {
    ...fixture.context,
    workflowsById: new Map([...fixture.context.workflowsById, ...other.context.workflowsById]),
    itemsByWorkflowId: new Map([...fixture.context.itemsByWorkflowId, ...other.context.itemsByWorkflowId]),
  }
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, itemId: other.item.item_id }), { context: crossContext }), /item-owned-by-workflow/)
})

test('computed-looking textual placeholders fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, evidenceRelationship: 'Supports ${itemId}' }), { context: fixture.context }), /computed-looking placeholder/)
})

test('filename must match workflow and duplicate mapping keys fail', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument(documentFor(fixture.mapping), { fileName: 'wrong.json', context: fixture.context }), /filename must equal/)
  assert.throws(() => validateCanonicalMappingDocument({ ...documentFor(fixture.mapping), mappings: [fixture.mapping, fixture.mapping] }, { context: fixture.context }), /duplicate itemId|duplicate canonical mapping/)
})

test('loader rejects noncanonical directory entries and leaves production store empty', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-canonical-schema-'))
  fs.writeFileSync(path.join(directory, 'README.md'), 'not allowed')
  assert.throws(() => loadCanonicalMappings({ directory, context: fixture.context }), /noncanonical entries/)
  fs.rmSync(directory, { recursive: true, force: true })
  assert.equal(loadCanonicalMappings().length, 0)
})

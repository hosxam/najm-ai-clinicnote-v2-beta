import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  CANONICAL_APPROVAL_MANIFEST_SCHEMA_PATH,
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

test('canonical and manifest schemas are strict and bounded', () => {
  const schema = readJson(CANONICAL_MAPPING_SCHEMA_PATH)
  const manifest = readJson(CANONICAL_APPROVAL_MANIFEST_SCHEMA_PATH)
  assert.equal(schema.additionalProperties, false)
  assert.equal(schema.$defs.mapping.additionalProperties, false)
  assert.deepEqual(schema.$defs.mapping.required, [...CANONICAL_MAPPING_FIELDS])
  assert.equal(schema.properties.mappings.maxItems, 5000)
  assert.equal(manifest.additionalProperties, false)
  assert.equal(manifest.properties.files.maxItems, 1500)
  assert.equal(manifest.properties.mappingKeys.maxItems, 100000)
})

test('strict JSON parser rejects malformed, duplicate, and Unicode-equivalent properties', () => {
  assert.throws(() => parseStrictJsonText('{"workflowId":', 'malformed.json'), /malformed (?:strict JSON|JSON structure)/)
  assert.throws(() => parseStrictJsonText('{"workflowId":"a","workflowId":"b"}', 'duplicate.json'), /duplicate or canonically equivalent/)
  assert.throws(() => parseStrictJsonText('{"é":1,"é":2}', 'unicode-duplicate.json'), /canonically equivalent/)
})

test('valid synthetic canonical document is immutable', () => {
  const fixture = createSyntheticCanonicalFixture()
  const result = validateCanonicalMappingDocument(documentFor(fixture.mapping), { context: fixture.context })
  assert.equal(result.mappings.length, 1)
  assert.equal(Object.isFrozen(result), true)
  assert.equal(Object.isFrozen(result.mappings[0]), true)
})

test('unknown, missing, generic, and placeholder values fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument({ ...documentFor(fixture.mapping), unexpected: true }, { context: fixture.context }), /unexpected properties/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, unexpected: 'x' }), { context: fixture.context }), /unexpected properties/)
  const missing = { ...fixture.mapping }
  delete missing.uaeApplicability
  assert.throws(() => validateCanonicalMappingDocument(documentFor(missing), { context: fixture.context }), /missing required properties/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, applicabilityRationale: 'Applicable to this workflow' }), { context: fixture.context }), /workflow-specific-applicability-rationale/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, evidenceRelationship: 'Supports ${itemId}' }), { context: fixture.context }), /computed-looking placeholder/)
})

test('wrong hashes, cross-workflow items, filenames, and duplicate mappings fail closed', () => {
  const fixture = createSyntheticCanonicalFixture()
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, sectionHash: '0'.repeat(64) }), { context: fixture.context }), /valid-section-hash/)
  const other = createSyntheticCanonicalFixture({ workflowId: 'synthetic-other', itemId: 'synthetic-other--item-1' })
  const crossContext = {
    ...fixture.context,
    workflowsById: new Map([...fixture.context.workflowsById, ...other.context.workflowsById]),
    itemsByWorkflowId: new Map([...fixture.context.itemsByWorkflowId, ...other.context.itemsByWorkflowId]),
  }
  assert.throws(() => validateCanonicalMappingDocument(documentFor({ ...fixture.mapping, itemId: other.item.item_id }), { context: crossContext }), /item-owned-by-workflow/)
  assert.throws(() => validateCanonicalMappingDocument(documentFor(fixture.mapping), { fileName: 'wrong.json', context: fixture.context }), /filename must equal/)
  assert.throws(() => validateCanonicalMappingDocument({ ...documentFor(fixture.mapping), mappings: [fixture.mapping, fixture.mapping] }, { context: fixture.context }), /duplicate itemId|duplicate canonical mapping/)
})

test('loader rejects noncanonical directory entries and production signed store remains empty', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-canonical-schema-'))
  fs.writeFileSync(path.join(directory, 'README.md'), 'not allowed')
  assert.throws(() => loadCanonicalMappings({
    directory,
    expectedDirectory: directory,
    context: fixture.context,
    allowTestDirectory: true,
    publicKeyPath: path.join(directory, 'missing.pem'),
  }), /noncanonical entries|manifest is missing/)
  fs.rmSync(directory, { recursive: true, force: true })
  assert.equal(loadCanonicalMappings().length, 0)
})

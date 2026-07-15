import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { CANONICAL_MAPPING_FIELDS, CANONICAL_RESOURCE_LIMITS } from './canonicalMappingContract.mjs'
import { parseStrictJsonBytes, parseStrictJsonText } from './canonicalJson.mjs'
import { approveRawCanonicalMapping } from './canonicalMappingTransaction.mjs'
import { createSignedTestHarness, rawMappingBytes } from './canonicalMappingTestHarness.mjs'

test('strict raw JSON rejects malformed syntax, comments, trailing commas, BOM, and invalid UTF-8', () => {
  assert.throws(() => parseStrictJsonText('{"a":'), /malformed (?:strict JSON|JSON structure)/)
  assert.throws(() => parseStrictJsonText('{/*x*/"a":1}'), /malformed strict JSON/)
  assert.throws(() => parseStrictJsonText('{"a":1,}'), /malformed strict JSON/)
  assert.throws(() => parseStrictJsonBytes(Buffer.from([0xef, 0xbb, 0xbf, 0x7b, 0x7d])), /BOM is prohibited/)
  assert.throws(() => parseStrictJsonBytes(Buffer.from([0xc3, 0x28])), /malformed UTF-8/)
})

test('strict raw JSON rejects exact, Unicode-normalized, and prototype-related duplicate keys', () => {
  assert.throws(() => parseStrictJsonText('{"a":1,"a":2}'), /duplicate or canonically equivalent/)
  assert.throws(() => parseStrictJsonText('{"a":1,"a":1}'), /duplicate or canonically equivalent/)
  assert.throws(() => parseStrictJsonText('{"é":1,"é":2}'), /canonically equivalent/)
  assert.throws(() => parseStrictJsonText('{"workflowId":"a","\\u0077orkflowId":"a"}'), /duplicate or canonically equivalent/)
  for (const field of [
    'workflowId', 'itemId', 'sourceId', 'sectionId',
    'populationApplicability', 'settingApplicability', 'jurisdictionApplicability', 'uaeApplicability',
  ]) {
    assert.throws(
      () => parseStrictJsonText(`{"${field}":"first","${field}":"second"}`),
      /duplicate or canonically equivalent/,
    )
  }
  for (const name of ['__proto__', 'constructor', 'prototype']) {
    assert.throws(() => parseStrictJsonText(`{"${name}":1}`), /forbidden prototype-related property/)
  }
})

test('raw JSON resource bounds reject over-limit bytes, arrays, depth, and strings', () => {
  assert.throws(() => parseStrictJsonBytes(Buffer.alloc(CANONICAL_RESOURCE_LIMITS.maxInputBytes + 1, 0x20)), /input exceeds/)
  const arrayAtLimit = `[${'0,'.repeat(CANONICAL_RESOURCE_LIMITS.maxArrayLength - 1)}0]`
  assert.equal(parseStrictJsonText(arrayAtLimit, '<array-at-limit>', { maxBytes: 1024 * 1024 }).length, CANONICAL_RESOURCE_LIMITS.maxArrayLength)
  assert.throws(() => parseStrictJsonText(`[${'0,'.repeat(CANONICAL_RESOURCE_LIMITS.maxArrayLength)}0]`, '<array>', { maxBytes: 1024 * 1024 }), /input exceeds|array exceeds/)
  assert.doesNotThrow(() => parseStrictJsonText(`${'['.repeat(CANONICAL_RESOURCE_LIMITS.maxJsonDepth)}0${']'.repeat(CANONICAL_RESOURCE_LIMITS.maxJsonDepth)}`))
  assert.throws(() => parseStrictJsonText(`${'['.repeat(CANONICAL_RESOURCE_LIMITS.maxJsonDepth + 1)}0${']'.repeat(CANONICAL_RESOURCE_LIMITS.maxJsonDepth + 1)}`), /nesting exceeds/)
  assert.equal(parseStrictJsonText(JSON.stringify('x'.repeat(CANONICAL_RESOURCE_LIMITS.maxStringLength - 1))).length, CANONICAL_RESOURCE_LIMITS.maxStringLength - 1)
  assert.equal(parseStrictJsonText(JSON.stringify('x'.repeat(CANONICAL_RESOURCE_LIMITS.maxStringLength))).length, CANONICAL_RESOURCE_LIMITS.maxStringLength)
  assert.throws(() => parseStrictJsonText(JSON.stringify('x'.repeat(CANONICAL_RESOURCE_LIMITS.maxStringLength + 1))), /string exceeds/)
})

test('field-specific rationale limit accepts the boundary and rejects one character above it', (t) => {
  const harness = createSignedTestHarness(t)
  const prefix = harness.fixture.mapping.applicabilityRationale
  const atLimit = { ...harness.fixture.mapping, applicabilityRationale: `${prefix}${' x'.repeat(Math.floor((CANONICAL_RESOURCE_LIMITS.maxRationaleLength - prefix.length) / 2))}` }
  atLimit.applicabilityRationale = atLimit.applicabilityRationale.padEnd(CANONICAL_RESOURCE_LIMITS.maxRationaleLength, 'x')
  assert.equal(atLimit.applicabilityRationale.length, CANONICAL_RESOURCE_LIMITS.maxRationaleLength)
  assert.equal(approveRawCanonicalMapping(rawMappingBytes(atLimit), harness.environment).active.mappings.length, 1)
  const second = createSignedTestHarness(t, { fixture: { workflowId: 'synthetic-over-limit', itemId: 'synthetic-over-limit--history--item-1' } })
  const over = { ...second.fixture.mapping, applicabilityRationale: `${second.fixture.mapping.applicabilityRationale}${'x'.repeat(CANONICAL_RESOURCE_LIMITS.maxRationaleLength)}` }
  assert.throws(() => approveRawCanonicalMapping(rawMappingBytes(over), second.environment), /bounded-applicabilityRationale|string exceeds|input exceeds/)
})

test('canonical file uses fixed document and mapping field order', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping, { reverseFields: true }), harness.environment)
  const document = JSON.parse(fs.readFileSync(path.join(harness.directory, `${harness.fixture.mapping.workflowId}.json`), 'utf8'))
  assert.deepEqual(Object.keys(document), ['schemaVersion', 'workflowId', 'mappings'])
  assert.deepEqual(Object.keys(document.mappings[0]), [...CANONICAL_MAPPING_FIELDS])
})

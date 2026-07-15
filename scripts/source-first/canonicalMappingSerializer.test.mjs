import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { loadCanonicalMappings, parseStrictJsonText } from './canonicalMappingStore.mjs'
import {
  removeSyntheticCanonicalMappingFile,
  writeCanonicalMapping,
} from './writeCanonicalMapping.mjs'
import { createSyntheticCanonicalFixture } from './canonicalMappingFixture.test.mjs'

function temporaryStore() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'najm-canonical-serializer-'))
}

test('serializer writes one complete mapping atomically and revalidates it', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = temporaryStore()
  const result = writeCanonicalMapping(fixture.mapping, { directory, context: fixture.context, allowTestDirectory: true })
  assert.equal(path.basename(result.filePath), `${fixture.mapping.workflowId}.json`)
  assert.equal(loadCanonicalMappings({ directory, context: fixture.context }).length, 1)
  assert.equal(fs.readdirSync(directory).some((name) => name.endsWith('.tmp')), false)
  removeSyntheticCanonicalMappingFile(fixture.mapping.workflowId, { directory, allowTestDirectory: true })
  assert.equal(loadCanonicalMappings({ directory, context: fixture.context }).length, 0)
  fs.rmSync(directory, { recursive: true, force: true })
})

test('serializer rejects inherited, partial, unexpected, and conflicting caller values', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = temporaryStore()
  assert.throws(() => writeCanonicalMapping(Object.create(fixture.mapping), { directory, context: fixture.context, allowTestDirectory: true }), /plain schema-owned object/)
  const partial = { ...fixture.mapping }
  delete partial.settingApplicability
  assert.throws(() => writeCanonicalMapping(partial, { directory, context: fixture.context, allowTestDirectory: true }), /missing required properties/)
  assert.throws(() => writeCanonicalMapping({ ...fixture.mapping, extra: 'not allowed' }, { directory, context: fixture.context, allowTestDirectory: true }), /unexpected properties/)
  writeCanonicalMapping(fixture.mapping, { directory, context: fixture.context, allowTestDirectory: true })
  assert.throws(() => writeCanonicalMapping(fixture.mapping, { directory, context: fixture.context, allowTestDirectory: true }), /already exists/)
  fs.rmSync(directory, { recursive: true, force: true })
})

test('serializer cannot target an arbitrary directory without explicit synthetic-test permission', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = temporaryStore()
  assert.throws(() => writeCanonicalMapping(fixture.mapping, { directory, context: fixture.context }), /synthetic tests/)
  fs.rmSync(directory, { recursive: true, force: true })
})

test('controlled CLI input parser rejects duplicate or assembled fragments', () => {
  assert.throws(() => parseStrictJsonText('{"workflowId":"a","workflowId":"b"}', 'caller.json'), /duplicate JSON properties/)
  const fixture = createSyntheticCanonicalFixture()
  const directory = temporaryStore()
  assert.throws(() => writeCanonicalMapping([fixture.mapping], { directory, context: fixture.context, allowTestDirectory: true }), /mapping must be/)
  fs.rmSync(directory, { recursive: true, force: true })
})

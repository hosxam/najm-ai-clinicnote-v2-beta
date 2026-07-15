import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { approveRawCanonicalMapping } from './canonicalMappingTransaction.mjs'
import { loadSignedCanonicalState } from './canonicalMappingStore.mjs'
import { createSignedTestHarness, rawMappingBytes } from './canonicalMappingTestHarness.mjs'

function load(harness, overrides = {}) {
  return loadSignedCanonicalState({ ...harness.environment, ...overrides })
}

test('copy, asynchronous copy, rename, and stream writes cannot activate unsigned files', async (t) => {
  const harness = createSignedTestHarness(t)
  const outside = path.join(harness.root, 'unsigned-workflow.json')
  fs.writeFileSync(outside, '{}\n')
  const target = path.join(harness.directory, 'unsigned-workflow.json')
  fs.copyFileSync(outside, target)
  assert.throws(() => load(harness), /file mismatch/)
  fs.rmSync(target)
  await fs.promises.copyFile(outside, target)
  assert.throws(() => load(harness), /file mismatch/)
  fs.rmSync(target)
  await fs.promises.rename(outside, target)
  assert.throws(() => load(harness), /file mismatch/)
  fs.rmSync(target)
  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(target)
    stream.on('error', reject)
    stream.on('finish', resolve)
    stream.end('{}\n')
  })
  assert.throws(() => load(harness), /file mismatch/)
})

test('hard-linked approved canonical file is rejected', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const activePath = path.join(harness.directory, `${harness.fixture.mapping.workflowId}.json`)
  const outside = path.join(harness.root, 'hardlink-source.json')
  fs.copyFileSync(activePath, outside)
  fs.rmSync(activePath)
  fs.linkSync(outside, activePath)
  assert.throws(() => load(harness), /hard-linked files are prohibited/)
})

test('symbolic-linked approved canonical file is rejected where link creation is available', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const activePath = path.join(harness.directory, `${harness.fixture.mapping.workflowId}.json`)
  const outside = path.join(harness.root, 'symlink-source.json')
  fs.copyFileSync(activePath, outside)
  fs.rmSync(activePath)
  try {
    fs.symlinkSync(outside, activePath, 'file')
  } catch (error) {
    t.diagnostic(`platform denied symlink creation; denial is fail-closed: ${error.code ?? error.message}`)
    return
  }
  assert.throws(() => load(harness), /normal regular file/)
})

test('junction or symlink canonical-root substitution is rejected where creation is available', (t) => {
  const harness = createSignedTestHarness(t)
  const realDirectory = `${harness.directory}-real`
  fs.renameSync(harness.directory, realDirectory)
  try {
    fs.symlinkSync(realDirectory, harness.directory, process.platform === 'win32' ? 'junction' : 'dir')
  } catch (error) {
    fs.renameSync(realDirectory, harness.directory)
    t.diagnostic(`platform denied junction creation; denial is fail-closed: ${error.code ?? error.message}`)
    return
  }
  assert.throws(() => load(harness), /canonical root must be a normal directory/)
})

test('unexpected real root, transaction lock, hidden, backup, and temporary entries fail closed', (t) => {
  const rootMismatch = createSignedTestHarness(t)
  const otherRoot = path.join(rootMismatch.root, 'other')
  fs.mkdirSync(otherRoot)
  assert.throws(() => load(rootMismatch, { expectedDirectory: otherRoot }), /real path does not match/)

  const locked = createSignedTestHarness(t)
  fs.writeFileSync(`${locked.directory}.lock`, 'stale\n')
  assert.throws(() => load(locked), /transaction lock is present/)

  for (const name of ['.hidden.json', 'workflow.json.bak', 'workflow.json.tmp']) {
    const harness = createSignedTestHarness(t)
    fs.writeFileSync(path.join(harness.directory, name), '{}\n')
    assert.throws(() => load(harness), /noncanonical entries/)
  }
})

test('signed manifest without its listed files and signed files without their manifest fail closed', (t) => {
  const positive = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(positive.fixture.mapping), positive.environment)

  const manifestOnly = createSignedTestHarness(t)
  for (const name of ['APPROVED_MANIFEST.json', 'APPROVED_MANIFEST.sig']) {
    fs.copyFileSync(path.join(positive.directory, name), path.join(manifestOnly.directory, name))
  }
  fs.copyFileSync(positive.publicKeyPath, manifestOnly.publicKeyPath)
  assert.throws(() => load(manifestOnly), /file mismatch|approval checkpoint|previous-manifest linkage/)

  const fileOnly = createSignedTestHarness(t)
  fs.copyFileSync(
    path.join(positive.directory, `${positive.fixture.mapping.workflowId}.json`),
    path.join(fileOnly.directory, `${positive.fixture.mapping.workflowId}.json`),
  )
  assert.throws(() => load(fileOnly), /file mismatch/)
})

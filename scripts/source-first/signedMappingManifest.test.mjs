import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createPrivateKey, generateKeyPairSync, sign } from 'node:crypto'
import test from 'node:test'
import {
  CANONICAL_APPROVAL_MANIFEST_FILE,
  CANONICAL_APPROVAL_SIGNATURE_FILE,
} from './canonicalMappingContract.mjs'
import { approveRawCanonicalMapping } from './canonicalMappingTransaction.mjs'
import { loadSignedCanonicalState } from './canonicalMappingStore.mjs'
import { createSignedTestHarness, rawMappingBytes } from './canonicalMappingTestHarness.mjs'
import {
  canonicalApprovalManifestBytes,
  computeManifestAggregateHash,
} from './canonicalJson.mjs'

function load(harness, overrides = {}) {
  return loadSignedCanonicalState({ ...harness.environment, ...overrides })
}

function rewriteAndSignManifest(harness, mutate, { recomputeAggregate = true } = {}) {
  const manifestPath = path.join(harness.directory, CANONICAL_APPROVAL_MANIFEST_FILE)
  const signaturePath = path.join(harness.directory, CANONICAL_APPROVAL_SIGNATURE_FILE)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  mutate(manifest)
  if (recomputeAggregate) manifest.aggregateHash = computeManifestAggregateHash(manifest)
  const bytes = canonicalApprovalManifestBytes(manifest)
  const signature = sign(null, bytes, createPrivateKey(fs.readFileSync(harness.privateKeyPath)))
  fs.writeFileSync(manifestPath, bytes)
  fs.writeFileSync(signaturePath, `${signature.toString('base64')}\n`)
}

test('explicit signed empty manifest is valid and activates zero support', (t) => {
  const harness = createSignedTestHarness(t)
  const state = load(harness)
  assert.equal(state.signatureVerified, true)
  assert.equal(state.manifest.approvalSequence, 1)
  assert.equal(state.mappings.length, 0)
  assert.equal(state.manifest.files.length, 0)
})

test('missing or modified detached signature fails closed', (t) => {
  const missing = createSignedTestHarness(t)
  fs.rmSync(path.join(missing.directory, CANONICAL_APPROVAL_SIGNATURE_FILE))
  assert.throws(() => load(missing), /signature is missing/)

  const modified = createSignedTestHarness(t)
  fs.writeFileSync(path.join(modified.directory, CANONICAL_APPROVAL_SIGNATURE_FILE), `${Buffer.alloc(64).toString('base64')}\n`)
  assert.throws(() => load(modified), /signature verification failed/)
})

test('wrong public key and modified manifest fail closed', (t) => {
  const wrong = createSignedTestHarness(t)
  const replacement = generateKeyPairSync('ed25519').publicKey.export({ type: 'spki', format: 'pem' })
  const wrongPublic = path.join(wrong.root, 'wrong-public.pem')
  fs.writeFileSync(wrongPublic, replacement)
  assert.throws(() => load(wrong, { publicKeyPath: wrongPublic }), /signature verification failed/)

  const modified = createSignedTestHarness(t)
  const manifestPath = path.join(modified.directory, CANONICAL_APPROVAL_MANIFEST_FILE)
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.repositoryNamespace = 'different/repository'
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  assert.throws(() => load(modified), /repository namespace mismatch|signature verification failed/)
})

test('modified, missing, or extra canonical files fail exact manifest reconciliation', (t) => {
  const modified = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(modified.fixture.mapping), modified.environment)
  const canonicalPath = path.join(modified.directory, `${modified.fixture.mapping.workflowId}.json`)
  fs.appendFileSync(canonicalPath, ' ')
  assert.throws(() => load(modified), /byte length mismatch|SHA-256 mismatch|deterministic/)

  const missing = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(missing.fixture.mapping), missing.environment)
  fs.rmSync(path.join(missing.directory, `${missing.fixture.mapping.workflowId}.json`))
  assert.throws(() => load(missing), /file mismatch/)

  const extra = createSignedTestHarness(t)
  fs.writeFileSync(path.join(extra.directory, 'unsigned-workflow.json'), '{}\n')
  assert.throws(() => load(extra), /file mismatch/)
})

test('external approval checkpoint detects sequence rollback', (t) => {
  const harness = createSignedTestHarness(t)
  const snapshot = Object.fromEntries(fs.readdirSync(harness.directory).map((name) => [name, fs.readFileSync(path.join(harness.directory, name))]))
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  for (const name of fs.readdirSync(harness.directory)) fs.rmSync(path.join(harness.directory, name), { force: true })
  for (const [name, bytes] of Object.entries(snapshot)) fs.writeFileSync(path.join(harness.directory, name), bytes)
  assert.throws(() => load(harness), /approval-sequence rollback/)
})

test('unsafe approval sequences and broken previous-manifest linkage fail closed', (t) => {
  const linked = createSignedTestHarness(t, { withoutApprovalState: true })
  const initial = load(linked)
  approveRawCanonicalMapping(rawMappingBytes(linked.fixture.mapping), linked.environment)
  rewriteAndSignManifest(linked, (manifest) => { manifest.previousManifestHash = 'a'.repeat(64) })
  assert.throws(() => load(linked, {
    approvalState: {
      approvalSequence: initial.manifest.approvalSequence,
      manifestHash: initial.manifestHash,
      aggregateHash: initial.aggregateHash,
    },
  }), /previous-manifest linkage mismatch/)

  const unsafeSequence = createSignedTestHarness(t, { withoutApprovalState: true })
  rewriteAndSignManifest(unsafeSequence, (manifest) => {
    manifest.approvalSequence = Number.MAX_SAFE_INTEGER + 1
    manifest.previousManifestHash = 'a'.repeat(64)
  })
  assert.throws(() => load(unsafeSequence), /approvalSequence must be a positive integer/)
})

test('signed duplicate paths, unsafe paths, and duplicate mapping keys fail manifest validation', (t) => {
  const duplicatePath = createSignedTestHarness(t, { withoutApprovalState: true })
  approveRawCanonicalMapping(rawMappingBytes(duplicatePath.fixture.mapping), duplicatePath.environment)
  rewriteAndSignManifest(duplicatePath, (manifest) => manifest.files.push(structuredClone(manifest.files[0])))
  assert.throws(() => load(duplicatePath), /duplicate manifest path/)

  const unsafePath = createSignedTestHarness(t, { withoutApprovalState: true })
  approveRawCanonicalMapping(rawMappingBytes(unsafePath.fixture.mapping), unsafePath.environment)
  rewriteAndSignManifest(unsafePath, (manifest) => { manifest.files[0].path = '../escape.json' })
  assert.throws(() => load(unsafePath), /unsafe or mismatching canonical path/)

  const duplicateKey = createSignedTestHarness(t, { withoutApprovalState: true })
  approveRawCanonicalMapping(rawMappingBytes(duplicateKey.fixture.mapping), duplicateKey.environment)
  rewriteAndSignManifest(duplicateKey, (manifest) => manifest.mappingKeys.push(structuredClone(manifest.mappingKeys[0])))
  assert.throws(() => load(duplicateKey), /duplicate top-level mapping key|do not equal file mapping keys/)
})

test('signed equal-count key mismatch, byte-length mismatch, and aggregate mismatch fail closed', (t) => {
  const keyMismatch = createSignedTestHarness(t, { withoutApprovalState: true })
  approveRawCanonicalMapping(rawMappingBytes(keyMismatch.fixture.mapping), keyMismatch.environment)
  rewriteAndSignManifest(keyMismatch, (manifest) => {
    manifest.files[0].mappingKeys[0].itemId = 'different-item'
    manifest.mappingKeys[0].itemId = 'different-item'
  })
  assert.throws(() => load(keyMismatch), /exact mapping-key mismatch/)

  const lengthMismatch = createSignedTestHarness(t, { withoutApprovalState: true })
  approveRawCanonicalMapping(rawMappingBytes(lengthMismatch.fixture.mapping), lengthMismatch.environment)
  rewriteAndSignManifest(lengthMismatch, (manifest) => { manifest.files[0].byteLength += 1 })
  assert.throws(() => load(lengthMismatch), /byte length mismatch/)

  const aggregateMismatch = createSignedTestHarness(t, { withoutApprovalState: true })
  rewriteAndSignManifest(aggregateMismatch, (manifest) => { manifest.aggregateHash = 'f'.repeat(64) }, { recomputeAggregate: false })
  assert.throws(() => load(aggregateMismatch), /aggregate hash mismatch/)
})

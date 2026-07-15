import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateKeyPairSync } from 'node:crypto'
import { initializeSignedCanonicalStore } from './canonicalMappingTransaction.mjs'
import { createSyntheticCanonicalFixture } from './canonicalMappingFixture.test.mjs'

function contextDocument(fixture) {
  return {
    workflows: [fixture.workflow],
    sources: [fixture.source],
    research: [fixture.research],
    unsupportedRows: [fixture.unsupportedRow],
  }
}

export function rawMappingBytes(mapping, { reverseFields = false, trailingNewline = true } = {}) {
  const entries = Object.entries(mapping)
  if (reverseFields) entries.reverse()
  return Buffer.from(`${JSON.stringify(Object.fromEntries(entries), null, reverseFields ? 0 : 2)}${trailingNewline ? '\n' : ''}`, 'utf8')
}

export function exactRemovalBytes(mapping) {
  return Buffer.from(`${JSON.stringify({
    workflowId: mapping.workflowId,
    itemId: mapping.itemId,
    sourceId: mapping.sourceId,
    sectionId: mapping.sectionId,
  }, null, 2)}\n`, 'utf8')
}

export function createSignedTestHarness(testContext, options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-signed-canonical-'))
  const directory = path.join(root, 'canonical-mappings')
  const privateKeyPath = path.join(root, 'approval-private.pem')
  const publicKeyPath = path.join(root, 'approval-public.pem')
  const contextPath = path.join(root, 'context.json')
  const approvalStatePath = path.join(root, 'approval-state.json')
  const fixture = createSyntheticCanonicalFixture(options.fixture)
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  fs.mkdirSync(directory)
  fs.writeFileSync(path.join(directory, '.gitkeep'), '\n')
  fs.writeFileSync(privateKeyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 })
  fs.writeFileSync(publicKeyPath, publicKey.export({ type: 'spki', format: 'pem' }), { mode: 0o600 })
  fs.writeFileSync(contextPath, `${JSON.stringify(contextDocument(fixture), null, 2)}\n`)
  const environment = {
    testMode: true,
    directory,
    expectedDirectory: directory,
    publicKeyPath,
    signingKeyPath: privateKeyPath,
    context: fixture.context,
    contextPath,
    approvalStatePath: options.withoutApprovalState ? null : approvalStatePath,
    allowTestDirectory: true,
  }
  const initialized = initializeSignedCanonicalStore(environment)
  const processEnvironment = {
    ...process.env,
    NAJM_MAPPING_TEST_MODE: '1',
    NAJM_MAPPING_CANONICAL_DIRECTORY: directory,
    NAJM_MAPPING_PUBLIC_KEY_PATH: publicKeyPath,
    NAJM_MAPPING_CONTEXT_PATH: contextPath,
    NAJM_MAPPING_SIGNING_KEY_PATH: privateKeyPath,
  }
  if (environment.approvalStatePath) processEnvironment.NAJM_MAPPING_APPROVAL_STATE_PATH = environment.approvalStatePath
  if (testContext?.after) testContext.after(() => fs.rmSync(root, { recursive: true, force: true }))
  return Object.freeze({
    root,
    directory,
    privateKeyPath,
    publicKeyPath,
    contextPath,
    approvalStatePath: environment.approvalStatePath,
    fixture,
    environment,
    processEnvironment,
    initialized,
  })
}

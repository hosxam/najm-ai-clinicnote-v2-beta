import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deriveUnsupportedLegacyRows,
  readIndependentMappingConsumers,
  reconcileIndependentMappingConsumers,
} from './canonicalMappingReconciliation.mjs'
import {
  approveRawCanonicalMapping,
  removeRawCanonicalMapping,
} from './canonicalMappingTransaction.mjs'
import {
  createSignedTestHarness,
  exactRemovalBytes,
  rawMappingBytes,
} from './canonicalMappingTestHarness.mjs'

function counts(result) {
  return [result.canonicalFiles, result.approvalManifest, result.persistedSupport, result.runtimeEmission, result.supportAccounting]
}

test('five separate consumer processes reconcile 0, then 1, then 0', (t) => {
  const harness = createSignedTestHarness(t)
  const zeroViews = readIndependentMappingConsumers({ environment: harness.processEnvironment })
  assert.equal(new Set(Object.values(zeroViews).map((view) => view.processId)).size, 5)
  assert.deepEqual(counts(reconcileIndependentMappingConsumers({ views: zeroViews })), [0, 0, 0, 0, 0])

  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const one = reconcileIndependentMappingConsumers({ environment: harness.processEnvironment })
  assert.deepEqual(counts(one), [1, 1, 1, 1, 1])
  assert.equal(deriveUnsupportedLegacyRows([harness.fixture.unsupportedRow], [harness.fixture.mapping]).length, 0)

  removeRawCanonicalMapping(exactRemovalBytes(harness.fixture.mapping), harness.environment)
  const cleaned = reconcileIndependentMappingConsumers({ environment: harness.processEnvironment })
  assert.deepEqual(counts(cleaned), [0, 0, 0, 0, 0])
  assert.equal(deriveUnsupportedLegacyRows([harness.fixture.unsupportedRow], []).length, 1)
})

test('equal counts with unequal exact keys or hashes fail reconciliation', () => {
  const base = { consumer: 'canonicalFiles', processId: 1, count: 1, mappingKeys: ['a'], keySetHash: 'a'.repeat(64) }
  const different = { consumer: 'approvalManifest', processId: 2, count: 1, mappingKeys: ['b'], keySetHash: 'b'.repeat(64) }
  assert.throws(() => reconcileIndependentMappingConsumers({
    views: {
      canonicalFiles: base,
      approvalManifest: different,
      persistedSupport: { ...base, consumer: 'persistedSupport' },
      runtimeEmission: { ...base, consumer: 'runtimeEmission' },
      supportAccounting: { ...base, consumer: 'supportAccounting' },
    },
  }), /exact key set differs|key-set hash differs/)
})

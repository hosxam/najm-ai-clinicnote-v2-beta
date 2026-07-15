import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPANSION_DIR,
  readJsonl,
  stableValue,
} from './common.mjs'
import { canonicalMappingKey } from './canonicalMappingContract.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'

function signature(mapping) {
  return JSON.stringify(stableValue(mapping))
}

function cloneRows(rows) {
  return Object.freeze(rows.map((row) => Object.freeze(structuredClone(row))))
}

export function createCanonicalMappingViews(options = {}) {
  const canonical = loadCanonicalMappings(options)
  return Object.freeze({
    canonicalJson: cloneRows(canonical),
    persistedActive: cloneRows(canonical),
    explicitLedger: cloneRows(canonical),
    guardInspected: cloneRows(canonical),
    runtimeEmitted: cloneRows(canonical),
  })
}

function compareRows(name, expected, actual) {
  const expectedByKey = new Map(expected.map((row) => [canonicalMappingKey(row), signature(row)]))
  const actualByKey = new Map(actual.map((row) => [canonicalMappingKey(row), signature(row)]))
  const missing = [...expectedByKey].filter(([key]) => !actualByKey.has(key))
  const unexpected = [...actualByKey].filter(([key]) => !expectedByKey.has(key))
  const altered = [...expectedByKey].filter(([key, value]) => actualByKey.has(key) && actualByKey.get(key) !== value)
  if (expected.length !== expectedByKey.size || actual.length !== actualByKey.size || missing.length || unexpected.length || altered.length) {
    throw new Error(`[canonical-mapping-reconciliation] ${name} mismatch: missing=${missing.length} unexpected=${unexpected.length} altered=${altered.length}`)
  }
}

export function reconcileCanonicalMappingViews({ views, ...options } = {}) {
  const activeViews = views ?? createCanonicalMappingViews(options)
  const canonical = activeViews.canonicalJson
  for (const name of ['persistedActive', 'explicitLedger', 'guardInspected', 'runtimeEmitted']) {
    compareRows(`canonicalJson versus ${name}`, canonical, activeViews[name])
  }
  return Object.freeze({
    status: 'PASS',
    reconciliationEqual: true,
    canonicalJson: canonical.length,
    persistedActive: activeViews.persistedActive.length,
    explicitLedger: activeViews.explicitLedger.length,
    guardInspected: activeViews.guardInspected.length,
    runtimeEmitted: activeViews.runtimeEmitted.length,
    supportedMappings: canonical.length,
  })
}

export function deriveUnsupportedLegacyRows(unsupportedRows, canonicalRows) {
  const supportedItems = new Set(canonicalRows.map((row) => `${row.workflowId}\u0000${row.itemId}`))
  return Object.freeze(unsupportedRows
    .filter((row) => !supportedItems.has(`${row.workflow_id}\u0000${row.item_id}`))
    .map((row) => Object.freeze(structuredClone(row))))
}

export function readDerivedUnsupportedLegacyRows(options = {}) {
  const canonical = loadCanonicalMappings(options)
  const raw = readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'))
  return deriveUnsupportedLegacyRows(raw, canonical)
}

export function verifyCanonicalMappingReconciliation(options = {}) {
  const reconciliation = reconcileCanonicalMappingViews(options)
  const unsupported = options.unsupportedRows
    ? deriveUnsupportedLegacyRows(options.unsupportedRows, loadCanonicalMappings(options))
    : readDerivedUnsupportedLegacyRows(options)
  return Object.freeze({
    ...reconciliation,
    unsupportedLegacyItems: unsupported.length,
  })
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    console.log(JSON.stringify(verifyCanonicalMappingReconciliation(), null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

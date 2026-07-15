import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPANSION_DIR, readJsonl } from './common.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CONSUMERS = Object.freeze([
  ['canonicalFiles', 'inspectCanonicalFiles.mjs'],
  ['approvalManifest', 'inspectApprovalManifest.mjs'],
  ['persistedSupport', 'inspectPersistedSupport.mjs'],
  ['runtimeEmission', 'inspectRuntimeMappings.mjs'],
  ['supportAccounting', 'inspectSupportAccounting.mjs'],
])

function runConsumer(expectedName, scriptName, environment = process.env) {
  const result = spawnSync(process.execPath, [path.join(HERE, scriptName)], {
    cwd: path.resolve(HERE, '../..'),
    env: environment,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(`[canonical-mapping-reconciliation] ${expectedName} failed: ${(result.stderr || result.stdout).trim()}`)
  }
  let parsed
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    throw new Error(`[canonical-mapping-reconciliation] ${expectedName} emitted invalid JSON`)
  }
  if (parsed.consumer !== expectedName
    || !Number.isInteger(parsed.count)
    || !Array.isArray(parsed.mappingKeys)
    || parsed.count !== parsed.mappingKeys.length
    || !/^[a-f0-9]{64}$/.test(parsed.keySetHash ?? '')) {
    throw new Error(`[canonical-mapping-reconciliation] ${expectedName} emitted an invalid reconciliation payload`)
  }
  return parsed
}
export function readIndependentMappingConsumers({ environment = process.env } = {}) {
  return Object.freeze(Object.fromEntries(
    CONSUMERS.map(([name, script]) => [name, Object.freeze(runConsumer(name, script, environment))]),
  ))
}

export function reconcileIndependentMappingConsumers(options = {}) {
  const views = options.views ?? readIndependentMappingConsumers(options)
  const canonical = views.canonicalFiles
  const diagnostics = []
  for (const [name] of CONSUMERS.slice(1)) {
    const view = views[name]
    if (view.count !== canonical.count) diagnostics.push(`${name}: count ${view.count} != ${canonical.count}`)
    if (view.keySetHash !== canonical.keySetHash) diagnostics.push(`${name}: key-set hash differs`)
    if (JSON.stringify(view.mappingKeys) !== JSON.stringify(canonical.mappingKeys)) diagnostics.push(`${name}: exact key set differs`)
  }
  if (diagnostics.length) throw new Error(`[canonical-mapping-reconciliation] independent view mismatch: ${diagnostics.join('; ')}`)
  return Object.freeze({
    status: 'PASS',
    reconciliationEqual: true,
    canonicalFiles: canonical.count,
    approvalManifest: views.approvalManifest.count,
    persistedSupport: views.persistedSupport.count,
    runtimeEmission: views.runtimeEmission.count,
    supportAccounting: views.supportAccounting.count,
    supportedMappings: canonical.count,
    keySetHash: canonical.keySetHash,
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
  const reconciliation = reconcileIndependentMappingConsumers(options)
  const unsupported = options.unsupportedRows
    ? deriveUnsupportedLegacyRows(options.unsupportedRows, loadCanonicalMappings(options.storeOptions ?? {}))
    : readDerivedUnsupportedLegacyRows(options.storeOptions ?? {})
  return Object.freeze({ ...reconciliation, unsupportedLegacyItems: unsupported.length })
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

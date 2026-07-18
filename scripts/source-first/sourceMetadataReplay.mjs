import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { EXPANSION_DIR, ROOT_DIR, readJson, sha256 } from './common.mjs'
import { discoverBatchModuleFiles } from './researchQueue.mjs'
import {
  SOURCE_REGISTRY_FILES,
  SOURCE_REGISTRY_HEADER_TEMPLATES,
  SOURCE_REGISTRY_SCHEMA_VERSIONS,
  createEmptySourceRegistryState,
  sourceRecordsFromRegistryState,
  sourceUpdateIdentity,
  upsertSourceInRegistryState,
} from './sourceApplicationEngine.mjs'
import {
  SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE,
  SOURCE_METADATA_DATE_STATE_FIELDS,
  normalizeAndValidateReplaySource,
  validateManifestDateProvenanceIndex,
  validateActiveRegistrySource,
} from './sourceDateRegistryGate.mjs'
import { sourceDateProvenanceDocument } from './sourceDateSemantics.mjs'
import { sourceRecencyPolicy } from './sourceRecencyPolicy.mjs'
import {
  fingerprintSourceMetadata,
} from './sourceMetadataFingerprint.mjs'

export { SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE }
export const SOURCE_METADATA_REPLAY_MANIFEST_PATH = path.join(ROOT_DIR, SOURCE_METADATA_REPLAY_MANIFEST_RELATIVE)
export const INITIAL_SOURCE_MODULE_PATH = path.join(ROOT_DIR, 'scripts', 'recordInitialSourceResearch.mjs')
export const EXPECTED_NUMBERED_BATCH_COUNT = 150
export const EXPECTED_NUMBERED_WORKFLOW_COUNT = 1495
export const EXPECTED_REPLAY_SOURCE_COUNT = 236

export const MANAGED_SOURCE_METADATA_FIELDS = Object.freeze([
  'publication_date',
  'effective_date',
  'revision_date',
  'service_commencement_date',
  'legal_effective_date',
  'webpage_last_updated_date',
  'last_updated_date',
  'source_modified_date',
  'source_reviewed_date',
  'version',
  'recency_verification',
  'superseded_status_check',
  'date_provenance',
  'date_metadata_provenance',
  'source_recency',
])

export function relativeSourceModulePath(modulePath) {
  return path.relative(ROOT_DIR, modulePath).replaceAll('\\', '/')
}

function assertUniqueValues(values, label) {
  if (new Set(values).size !== values.length) {
    throw new Error(`[source-metadata-replay] duplicate ${label} in replay manifest`)
  }
}

export function validateReplayManifestDocument(manifest) {
  if (manifest.schemaVersion !== '2.0.0') {
    throw new Error('[source-metadata-replay] replay manifest schema version mismatch')
  }
  if (!Array.isArray(manifest.sources) || !Array.isArray(manifest.batches)) {
    throw new Error('[source-metadata-replay] malformed replay manifest')
  }
  const { manifestFingerprint, ...fingerprintInput } = manifest
  if (!/^[a-f0-9]{64}$/.test(manifestFingerprint ?? '') || sha256(fingerprintInput) !== manifestFingerprint) {
    throw new Error('[source-metadata-replay] replay manifest fingerprint mismatch')
  }
  if (manifest.sourceCount !== EXPECTED_REPLAY_SOURCE_COUNT || manifest.sources.length !== manifest.sourceCount) {
    throw new Error('[source-metadata-replay] replay manifest source count mismatch')
  }
  if (manifest.numberedBatchCount !== EXPECTED_NUMBERED_BATCH_COUNT) {
    throw new Error('[source-metadata-replay] manifest does not index all numbered production batches')
  }
  if (manifest.batches.length !== EXPECTED_NUMBERED_BATCH_COUNT + 1) {
    throw new Error('[source-metadata-replay] replay manifest batch count mismatch')
  }
  if (manifest.initialModuleApplied !== true
    || manifest.supplementReplayAllowed !== false
    || manifest.historicalLedgerAuthoritative !== false
    || manifest.originalInventoryAuthoritative !== false) {
    throw new Error('[source-metadata-replay] replay manifest authority or initial/supplement flags are invalid')
  }
  if (Object.hasOwn(manifest, 'sourceMetadataFingerprint')) {
    throw new Error('[source-metadata-replay] active-derived source fingerprint is prohibited in the replay manifest')
  }
  if (sha256(manifest.registryHeaders) !== sha256(SOURCE_REGISTRY_HEADER_TEMPLATES)) {
    throw new Error('[source-metadata-replay] manifest registry headers differ from the independent contract')
  }
  if (sha256(manifest.registrySchemaVersions) !== sha256(SOURCE_REGISTRY_SCHEMA_VERSIONS)) {
    throw new Error('[source-metadata-replay] manifest registry schema versions differ from the independent contract')
  }

  assertUniqueValues(manifest.sources.map((entry) => entry.sourceId), 'source ID')
  assertUniqueValues(manifest.batches.map((entry) => entry.modulePath), 'batch module path')
  assertUniqueValues(manifest.batches.map((entry) => entry.batchId), 'batch ID')
  const initialBatches = manifest.batches.filter((entry) => entry.modulePath === relativeSourceModulePath(INITIAL_SOURCE_MODULE_PATH)
    && entry.batchId === 'initial-source-research')
  if (initialBatches.length !== 1) {
    throw new Error('[source-metadata-replay] initial source module entry is missing or duplicated')
  }
  if (manifest.batches.some((entry) => /supplement/i.test(path.basename(entry.modulePath)))) {
    throw new Error('[source-metadata-replay] supplement module entry is prohibited')
  }
  const numberedBatches = manifest.batches.filter((entry) => /\/batch-\d{4}-\d{4}\.mjs$/.test(entry.modulePath))
  if (numberedBatches.length !== EXPECTED_NUMBERED_BATCH_COUNT) {
    throw new Error('[source-metadata-replay] numbered batch index is incomplete')
  }

  const sourceEntryById = new Map(manifest.sources.map((entry) => [entry.sourceId, entry]))
  const historyBySource = new Map()
  for (const batchEntry of manifest.batches) {
    if (!Array.isArray(batchEntry.operations)) {
      throw new Error(`[source-metadata-replay] ${batchEntry.modulePath}: operations must be an array`)
    }
    const operationKeys = []
    for (const operation of batchEntry.operations) {
      if (!sourceEntryById.has(operation.sourceId)
        || !SOURCE_REGISTRY_FILES.includes(operation.registryFile)
        || !['full_source', 'declarative_patch'].includes(operation.operation)
        || !/^[a-f0-9]{64}$/.test(operation.operationDigest ?? '')) {
        throw new Error(`[source-metadata-replay] ${batchEntry.modulePath}: malformed source operation`)
      }
      if (sourceEntryById.get(operation.sourceId).registryFile !== operation.registryFile) {
        throw new Error(`[source-metadata-replay] ${operation.sourceId}: operation registry differs from source ownership`)
      }
      operationKeys.push(`${operation.sourceId}::${operation.registryFile}::${operation.operation}::${operation.operationDigest}`)
      const history = historyBySource.get(operation.sourceId) ?? []
      history.push({
        modulePath: batchEntry.modulePath,
        batchId: batchEntry.batchId,
        operation: operation.operation,
        operationDigest: operation.operationDigest,
      })
      historyBySource.set(operation.sourceId, history)
    }
    assertUniqueValues(operationKeys, `${batchEntry.modulePath} operation`)
  }

  if (historyBySource.size !== manifest.sourceCount) {
    throw new Error('[source-metadata-replay] source ownership history count mismatch')
  }
  for (const sourceEntry of manifest.sources) {
    if (!SOURCE_REGISTRY_FILES.includes(sourceEntry.registryFile)
      || Object.hasOwn(sourceEntry, 'metadataFingerprint')) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: invalid source ownership entry`)
    }
    const { entryDigest, ...entryDigestInput } = sourceEntry
    if (!/^[a-f0-9]{64}$/.test(entryDigest ?? '') || sha256(entryDigestInput) !== entryDigest) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: entry digest mismatch`)
    }
    const expectedHistory = historyBySource.get(sourceEntry.sourceId)
    if (!expectedHistory || sha256(sourceEntry.operationHistory) !== sha256(expectedHistory)) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: operation history differs from batch index`)
    }
    if (sourceEntry.operationHistory.length === 0
      || sourceEntry.operationHistory[0].operation !== 'full_source'
      || sha256(sourceEntry.owner) !== sha256(sourceEntry.operationHistory[0])) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: owner must be the first full source operation`)
    }
    const dateIndex = sourceEntry.dateProvenanceIndex
    if (!dateIndex
      || !Array.isArray(dateIndex.dateFieldStates)
      || !Array.isArray(dateIndex.retainedProvenanceRefs)
      || !Array.isArray(dateIndex.weakerMetadataRefs)) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: malformed date-provenance index`)
    }
    if (sha256(dateIndex.dateFieldStates.map((state) => state.fieldName)) !== sha256(SOURCE_METADATA_DATE_STATE_FIELDS)) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: date-field state index is incomplete`)
    }
    assertUniqueValues(dateIndex.retainedProvenanceRefs.map((reference) => reference.recordKey), `${sourceEntry.sourceId} retained provenance key`)
    assertUniqueValues(dateIndex.weakerMetadataRefs.map((reference) => reference.recordKey), `${sourceEntry.sourceId} weaker metadata key`)
    if (/"(?:migrationClassification|evidenceCategory|provenanceStatus)":/.test(JSON.stringify(dateIndex))) {
      throw new Error(`[source-metadata-replay] ${sourceEntry.sourceId}: historical backlog metadata is prohibited in manifest refs`)
    }
  }
  return manifest
}

export function loadReplayManifest() {
  return validateReplayManifestDocument(readJson(SOURCE_METADATA_REPLAY_MANIFEST_PATH))
}

export function productionDiscoveredNumberedBatchPaths() {
  const executionManifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
  const firstNumberedSequence = 6
  const productionEntries = executionManifest.workflows.filter((entry) => (
    entry.sequence >= firstNumberedSequence
  ))
  if (productionEntries.length !== EXPECTED_NUMBERED_WORKFLOW_COUNT) {
    throw new Error(
      `[source-metadata-replay] expected ${EXPECTED_NUMBERED_WORKFLOW_COUNT} indexed workflow entries for numbered batch discovery, found ${productionEntries.length}`,
    )
  }
  const modulePaths = discoverBatchModuleFiles(productionEntries)
  if (modulePaths.length !== EXPECTED_NUMBERED_BATCH_COUNT) {
    throw new Error(`[source-metadata-replay] expected ${EXPECTED_NUMBERED_BATCH_COUNT} numbered batch modules, found ${modulePaths.length}`)
  }
  return modulePaths
}

function escapeJsonPointer(value) {
  return String(value).replaceAll('~', '~0').replaceAll('/', '~1')
}

function valueType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value === 'object' ? 'object' : typeof value
}

export function structuredJsonPointerDiffs(expected, actual, pointer = '') {
  const expectedType = valueType(expected)
  const actualType = valueType(actual)
  if (expectedType !== actualType) {
    return [{ field_path: pointer || '/', expected, replayed: actual }]
  }
  if (expectedType === 'array') {
    const diffs = []
    const length = Math.max(expected.length, actual.length)
    for (let index = 0; index < length; index += 1) {
      const childPointer = `${pointer}/${index}`
      if (index >= expected.length) {
        diffs.push({ field_path: childPointer, expected: undefined, replayed: actual[index] })
      } else if (index >= actual.length) {
        diffs.push({ field_path: childPointer, expected: expected[index], replayed: undefined })
      } else {
        diffs.push(...structuredJsonPointerDiffs(expected[index], actual[index], childPointer))
      }
    }
    return diffs
  }
  if (expectedType === 'object') {
    const diffs = []
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort()
    for (const key of keys) {
      const childPointer = `${pointer}/${escapeJsonPointer(key)}`
      if (!Object.hasOwn(actual, key)) {
        diffs.push({ field_path: childPointer, expected: expected[key], replayed: undefined })
      } else if (!Object.hasOwn(expected, key)) {
        diffs.push({ field_path: childPointer, expected: undefined, replayed: actual[key] })
      } else {
        diffs.push(...structuredJsonPointerDiffs(expected[key], actual[key], childPointer))
      }
    }
    return diffs
  }
  return Object.is(expected, actual)
    ? []
    : [{ field_path: pointer || '/', expected, replayed: actual }]
}

function recordMap(records) {
  return new Map(records.map((record) => [record.source.source_id, record]))
}

export function exactSourceRecordParityDiagnostics(activeRecords, replayRecords) {
  const active = recordMap(activeRecords)
  const replay = recordMap(replayRecords)
  const diffs = []
  const sourceIds = [...new Set([...active.keys(), ...replay.keys()])].sort()
  for (const sourceId of sourceIds) {
    const pointer = `/sources/${escapeJsonPointer(sourceId)}`
    if (!replay.has(sourceId)) {
      diffs.push({ source_id: sourceId, field_path: pointer, expected: active.get(sourceId), replayed: undefined })
      continue
    }
    if (!active.has(sourceId)) {
      diffs.push({ source_id: sourceId, field_path: pointer, expected: undefined, replayed: replay.get(sourceId) })
      continue
    }
    diffs.push(...structuredJsonPointerDiffs(active.get(sourceId), replay.get(sourceId), pointer)
      .map((diff) => ({ source_id: sourceId, ...diff })))
  }
  return diffs
}

function conciseDiffValue(value) {
  const serialized = JSON.stringify(value)
  if (serialized === undefined) return 'undefined'
  return serialized.length > 240 ? `${serialized.slice(0, 237)}...` : serialized
}

export function formatSourceParityDiff(diff) {
  if (diff.replayed === undefined) return `${diff.source_id} ${diff.field_path}: missing; expected ${conciseDiffValue(diff.expected)}`
  if (diff.expected === undefined) return `${diff.source_id} ${diff.field_path}: unexpected ${conciseDiffValue(diff.replayed)}`
  return `${diff.source_id} ${diff.field_path}: differs; expected ${conciseDiffValue(diff.expected)}, replayed ${conciseDiffValue(diff.replayed)}`
}

export function exactSourceRecordParity(activeRecords, replayRecords) {
  return exactSourceRecordParityDiagnostics(activeRecords, replayRecords).map(formatSourceParityDiff)
}

function registryHeader(registry) {
  const header = structuredClone(registry)
  delete header.sources
  return header
}

export function registryHeaderParityDiagnostics(activeRegistryState, replayRegistryState) {
  const diagnostics = []
  for (const registryFile of SOURCE_REGISTRY_FILES) {
    const fieldPath = `/registries/${escapeJsonPointer(registryFile)}`
    const active = activeRegistryState.get(registryFile)
    const replayed = replayRegistryState.get(registryFile)
    if (!active) {
      diagnostics.push({ source_id: null, field_path: fieldPath, expected: undefined, replayed: registryHeader(replayed) })
      continue
    }
    if (!replayed) {
      diagnostics.push({ source_id: null, field_path: fieldPath, expected: registryHeader(active), replayed: undefined })
      continue
    }
    diagnostics.push(...structuredJsonPointerDiffs(registryHeader(active), registryHeader(replayed), fieldPath)
      .map((diff) => ({ source_id: null, ...diff })))
  }
  return diagnostics
}

export function loadActiveSourceRegistryState() {
  return new Map(SOURCE_REGISTRY_FILES.map((registryFile) => [
    registryFile,
    readJson(path.join(EXPANSION_DIR, 'sources', registryFile)),
  ]))
}

async function defaultImportBatch(modulePath, cacheKey) {
  return import(`${pathToFileURL(modulePath).href}?source-metadata-replay=${encodeURIComponent(cacheKey)}`)
}

export async function replayCommittedSourceBatches({
  manifest = loadReplayManifest(),
  provenanceDocument = sourceDateProvenanceDocument(),
  asOfDate = sourceRecencyPolicy().evaluation_date,
  numberedModulePaths = productionDiscoveredNumberedBatchPaths(),
  initialModulePath = INITIAL_SOURCE_MODULE_PATH,
  importBatch = defaultImportBatch,
} = {}) {
  if (numberedModulePaths.length !== EXPECTED_NUMBERED_BATCH_COUNT) {
    throw new Error(`[source-metadata-replay] replay requires exactly ${EXPECTED_NUMBERED_BATCH_COUNT} numbered modules`)
  }
  if (numberedModulePaths.some((modulePath) => /supplement/i.test(path.basename(modulePath)))) {
    throw new Error('[source-metadata-replay] supplement modules are prohibited')
  }
  const registryState = createEmptySourceRegistryState({
    schemaVersions: manifest?.registrySchemaVersions ?? SOURCE_REGISTRY_SCHEMA_VERSIONS,
  })
  const modulePaths = [initialModulePath, ...numberedModulePaths]
  const modules = []
  let sourceUpdates = 0
  const previousReplayDiscovery = process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY
  process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY = '1'
  try {
    for (let index = 0; index < modulePaths.length; index += 1) {
      const modulePath = modulePaths[index]
      const loaded = await importBatch(modulePath, `${manifest?.manifestFingerprint ?? 'manifest-build'}-${index}`)
      const batch = loaded.default
      if (!batch?.batch_id || !Array.isArray(batch.sources)) {
        throw new Error(`[source-metadata-replay] ${relativeSourceModulePath(modulePath)} is not an import-safe source batch`)
      }
      const operations = []
      for (const sourceUpdate of batch.sources) {
        const identity = sourceUpdateIdentity(sourceUpdate)
        let source
        try {
          source = normalizeAndValidateReplaySource({
            sourceUpdate,
            modulePath,
            batch,
            registryState,
            manifest,
            provenanceDocument,
            asOfDate,
            deferValidation: true,
          })
        } catch (error) {
          throw new Error(`[source-metadata-replay] ${relativeSourceModulePath(modulePath)} ${identity.sourceId ?? 'unknown_source'}: ${error.message}`, { cause: error })
        }
        upsertSourceInRegistryState({
          registryState,
          registryFile: identity.registryFile,
          source,
        })
        operations.push({ ...identity, operationDigest: sha256(sourceUpdate) })
        sourceUpdates += 1
      }
      modules.push({
        modulePath: relativeSourceModulePath(modulePath),
        batchId: batch.batch_id,
        operations,
      })
    }
  } finally {
    if (previousReplayDiscovery === undefined) delete process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY
    else process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY = previousReplayDiscovery
  }

  const records = sourceRecordsFromRegistryState(registryState)
  for (const { source } of records) {
    try {
      if (manifest) {
        const sourceEntry = manifest.sources.find((entry) => entry.sourceId === source.source_id)
        if (!sourceEntry) throw new Error('source is absent from the replay manifest')
        validateManifestDateProvenanceIndex({
          source,
          sourceEntry,
          provenanceDocument,
          finalState: true,
        })
      }
      validateActiveRegistrySource(source)
    } catch (error) {
      throw new Error(`[source-metadata-replay] final source ${source.source_id}: ${error.message}`, { cause: error })
    }
  }
  const fingerprint = fingerprintSourceMetadata(records, {
    provenanceMigrationVersion: provenanceDocument.migrationVersion,
    fingerprintSchemaVersion: manifest?.fingerprintSchemaVersion ?? '1.0.0',
  })
  return {
    modulePaths: modules.map((entry) => entry.modulePath),
    numberedModuleCount: numberedModulePaths.length,
    initialModuleApplied: modules[0]?.modulePath === relativeSourceModulePath(initialModulePath),
    supplementApplied: false,
    sourceUpdates,
    modules,
    registryState,
    records,
    fingerprint,
  }
}

export async function verifyCommittedSourceBatchReplay({
  manifest = loadReplayManifest(),
  loadActiveRegistryState = loadActiveSourceRegistryState,
  ...replayOptions
} = {}) {
  const replay = await replayCommittedSourceBatches({ manifest, ...replayOptions })
  const activeRegistryState = loadActiveRegistryState()
  const activeRecords = sourceRecordsFromRegistryState(activeRegistryState)
  const diagnostics = [
    ...registryHeaderParityDiagnostics(activeRegistryState, replay.registryState),
    ...exactSourceRecordParityDiagnostics(activeRecords, replay.records),
  ]
  const errors = diagnostics.map(formatSourceParityDiff)
  return {
    errors,
    diagnostics,
    manifest,
    activeRegistryState,
    activeRecords,
    replay,
  }
}

async function main() {
  const result = await verifyCommittedSourceBatchReplay()
  const output = {
    status: result.errors.length === 0 ? 'PASS' : 'FAIL',
    initialModuleApplied: result.replay.initialModuleApplied,
    numberedModuleCount: result.replay.numberedModuleCount,
    supplementApplied: result.replay.supplementApplied,
    sourceCount: result.replay.records.length,
    sourceUpdates: result.replay.sourceUpdates,
    sourceMetadataFingerprint: result.replay.fingerprint.fingerprint,
    errors: result.errors,
  }
  console.log(JSON.stringify(output, null, 2))
  if (result.errors.length > 0) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}

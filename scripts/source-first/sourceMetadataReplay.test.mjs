import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { sha256 } from './common.mjs'
import { SOURCE_REGISTRY_HEADER_TEMPLATES } from './sourceApplicationEngine.mjs'
import {
  EXPECTED_NUMBERED_BATCH_COUNT,
  INITIAL_SOURCE_MODULE_PATH,
  exactSourceRecordParityDiagnostics,
  loadActiveSourceRegistryState,
  loadReplayManifest,
  productionDiscoveredNumberedBatchPaths,
  replayCommittedSourceBatches,
  registryHeaderParityDiagnostics,
  validateReplayManifestDocument,
  verifyCommittedSourceBatchReplay,
} from './sourceMetadataReplay.mjs'

const PROHIBITED_REPLAY_INPUT_PATTERN = /(?:clinical-expansion-v2[\\/]sources[\\/](?:international_clinical_sources|nonclinical_operational_sources|specialty_society_sources|uae_clinical_sources)\.json|gp_explicit_mapping_ledger_0626_0675\.json)$/

test('independent source replay applies initial plus 77 numbered batches before exact active parity', async () => {
  const numberedModulePaths = productionDiscoveredNumberedBatchPaths()
  assert.equal(numberedModulePaths.length, EXPECTED_NUMBERED_BATCH_COUNT)
  assert.equal(numberedModulePaths.some((modulePath) => /supplement/i.test(path.basename(modulePath))), false)

  const importedModulePaths = []
  let replayComplete = false
  let activeReadsDuringReplay = 0
  const originalReadFileSync = fs.readFileSync
  const originalReplayDiscovery = process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY
  process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY = 'caller-supplied-value'
  fs.readFileSync = function guardedReadFileSync(filePath, ...args) {
    if (!replayComplete && PROHIBITED_REPLAY_INPUT_PATTERN.test(path.resolve(String(filePath)))) {
      activeReadsDuringReplay += 1
      throw new Error(`active source registry read during replay: ${filePath}`)
    }
    return originalReadFileSync.call(this, filePath, ...args)
  }

  let verification
  let replayDiscoveryAfterReplay
  try {
    verification = await verifyCommittedSourceBatchReplay({
      numberedModulePaths,
      importBatch: async (modulePath, cacheKey) => {
        importedModulePaths.push(modulePath)
        return import(`${pathToFileURL(modulePath).href}?source-metadata-replay-test=${encodeURIComponent(cacheKey)}`)
      },
      loadActiveRegistryState: () => {
        replayComplete = true
        return loadActiveSourceRegistryState()
      },
    })
  } finally {
    fs.readFileSync = originalReadFileSync
    replayDiscoveryAfterReplay = process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY
    if (originalReplayDiscovery === undefined) delete process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY
    else process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY = originalReplayDiscovery
  }

  assert.equal(activeReadsDuringReplay, 0)
  assert.equal(replayDiscoveryAfterReplay, 'caller-supplied-value')
  assert.equal(path.resolve(importedModulePaths[0]), path.resolve(INITIAL_SOURCE_MODULE_PATH))
  assert.equal(importedModulePaths.length, EXPECTED_NUMBERED_BATCH_COUNT + 1)
  assert.equal(importedModulePaths.some((modulePath) => /supplement/i.test(path.basename(modulePath))), false)
  assert.equal(verification.replay.initialModuleApplied, true)
  assert.equal(verification.replay.numberedModuleCount, EXPECTED_NUMBERED_BATCH_COUNT)
  assert.equal(verification.replay.supplementApplied, false)
  const gadPatchModule = verification.replay.modules.find((entry) => entry.modulePath.endsWith('/batch-0076-0085.mjs'))
  const gadPatchOperation = gadPatchModule.operations.find((entry) => entry.sourceId === 'nice-gad-cg113-2020')
  assert.equal(gadPatchOperation.operation, 'declarative_patch')
  assert.deepEqual(verification.diagnostics, [])
  assert.deepEqual(verification.errors, [])

  for (const [registryFile, expectedHeader] of Object.entries(SOURCE_REGISTRY_HEADER_TEMPLATES)) {
    const replayedHeader = structuredClone(verification.replay.registryState.get(registryFile))
    delete replayedHeader.sources
    assert.deepEqual(replayedHeader, expectedHeader)
  }

  const monthPrecisionCases = [
    ['doh-antenatal-care-standard-v1-2024', 'recency_verification.revision_due', '2027-07'],
    ['doh-postnatal-care-program-v1-2025', 'recency_verification.revision_due', '2028-05'],
    ['doh-well-child-visits-v10-2025', 'recency_verification.revision_due', '2029-12'],
    ['rch-pic-acute-abdominal-pain-children-2024', 'last_updated_date', '2024-04'],
  ]
  const replayedSourceById = new Map(verification.replay.records.map(({ source }) => [source.source_id, source]))
  for (const [sourceId, fieldName, value] of monthPrecisionCases) {
    const source = replayedSourceById.get(sourceId)
    assert.equal(source.source_recency.recency_basis, 'weaker_metadata')
    assert.equal(source.source_recency.basis_field, fieldName)
    assert.equal(source.source_recency.basis_value, value)
    assert.equal(source.source_recency.basis_precision, 'month')
    assert.equal(source.date_metadata_provenance[fieldName].dateValue, value)
  }

  const changedRecords = structuredClone(verification.replay.records)
  changedRecords[0].source.population = 'intentional parity diagnostic mutation'
  const sourceDiffs = exactSourceRecordParityDiagnostics(verification.replay.records, changedRecords)
  assert.equal(sourceDiffs.length, 1)
  assert.deepEqual(
    Object.keys(sourceDiffs[0]).sort(),
    ['expected', 'field_path', 'replayed', 'source_id'].sort(),
  )
  assert.equal(sourceDiffs[0].source_id, changedRecords[0].source.source_id)
  assert.match(sourceDiffs[0].field_path, /\/source\/population$/)
  assert.equal(sourceDiffs[0].expected, verification.replay.records[0].source.population)
  assert.equal(sourceDiffs[0].replayed, 'intentional parity diagnostic mutation')

  const changedRegistryState = new Map([...verification.replay.registryState].map(([registryFile, registry]) => [
    registryFile,
    structuredClone(registry),
  ]))
  changedRegistryState.get('uae_clinical_sources.json').verified_on = '2099-01-01'
  const headerDiffs = registryHeaderParityDiagnostics(verification.replay.registryState, changedRegistryState)
  assert.equal(headerDiffs.length, 1)
  assert.equal(headerDiffs[0].source_id, null)
  assert.match(headerDiffs[0].field_path, /\/uae_clinical_sources\.json\/verified_on$/)
  assert.equal(headerDiffs[0].expected, '2026-07-11')
  assert.equal(headerDiffs[0].replayed, '2099-01-01')
})

function refreshEntryDigest(entry) {
  const { entryDigest: _oldDigest, ...digestInput } = entry
  entry.entryDigest = sha256(digestInput)
}

function refreshManifestFingerprint(manifest) {
  delete manifest.manifestFingerprint
  manifest.manifestFingerprint = sha256(manifest)
}

test('manifest validation binds flags, ownership, raw operation digests, and provenance states', async () => {
  const manifest = loadReplayManifest()
  const manifestDateIndexes = JSON.stringify(manifest.sources.map((entry) => entry.dateProvenanceIndex))
  assert.doesNotMatch(manifestDateIndexes, /migrationClassification|evidenceCategory|provenanceStatus/)

  const invalidAuthority = structuredClone(manifest)
  invalidAuthority.historicalLedgerAuthoritative = true
  refreshManifestFingerprint(invalidAuthority)
  assert.throws(
    () => validateReplayManifestDocument(invalidAuthority),
    /authority or initial\/supplement flags/,
  )

  const invalidHeaders = structuredClone(manifest)
  invalidHeaders.registryHeaders['uae_clinical_sources.json'].verified_on = '2099-01-01'
  refreshManifestFingerprint(invalidHeaders)
  assert.throws(
    () => validateReplayManifestDocument(invalidHeaders),
    /registry headers differ/,
  )

  const duplicateSource = structuredClone(manifest)
  duplicateSource.sources[1] = structuredClone(duplicateSource.sources[0])
  refreshManifestFingerprint(duplicateSource)
  assert.throws(
    () => validateReplayManifestDocument(duplicateSource),
    /duplicate source ID/,
  )

  const operationTamper = structuredClone(manifest)
  const batchEntry = operationTamper.batches.find((entry) => entry.operations.length > 0)
  const operation = batchEntry.operations[0]
  const sourceEntry = operationTamper.sources.find((entry) => entry.sourceId === operation.sourceId)
  const changedOperationDigest = '0'.repeat(64)
  operation.operationDigest = changedOperationDigest
  const historyEntry = sourceEntry.operationHistory.find((entry) => (
    entry.modulePath === batchEntry.modulePath
    && entry.batchId === batchEntry.batchId
    && entry.operation === operation.operation
  ))
  historyEntry.operationDigest = changedOperationDigest
  if (sourceEntry.owner.modulePath === historyEntry.modulePath
    && sourceEntry.owner.batchId === historyEntry.batchId
    && sourceEntry.owner.operation === historyEntry.operation) {
    sourceEntry.owner.operationDigest = changedOperationDigest
  }
  refreshEntryDigest(sourceEntry)
  refreshManifestFingerprint(operationTamper)
  validateReplayManifestDocument(operationTamper)
  await assert.rejects(
    () => replayCommittedSourceBatches({ manifest: operationTamper }),
    /exact operation type\/digest is absent/,
  )

  const provenanceTamper = structuredClone(manifest)
  const provenanceEntry = provenanceTamper.sources[0]
  const reference = provenanceEntry.dateProvenanceIndex.dateFieldStates[0]
  reference.state = 'value'
  reference.value = '2099-01-01'
  refreshEntryDigest(provenanceEntry)
  refreshManifestFingerprint(provenanceTamper)
  validateReplayManifestDocument(provenanceTamper)
  await assert.rejects(
    () => replayCommittedSourceBatches({ manifest: provenanceTamper }),
    /materialized date state differs from the manifest/,
  )
})

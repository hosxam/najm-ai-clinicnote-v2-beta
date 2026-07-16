import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPANSION_DIR, sha256, writeJson } from './common.mjs'
import {
  EXPECTED_NUMBERED_BATCH_COUNT,
  SOURCE_METADATA_REPLAY_MANIFEST_PATH,
  replayCommittedSourceBatches,
  verifyCommittedSourceBatchReplay,
} from './sourceMetadataReplay.mjs'
import {
  SOURCE_REGISTRY_HEADER_TEMPLATES,
  SOURCE_REGISTRY_FILES,
  SOURCE_REGISTRY_SCHEMA_VERSIONS,
} from './sourceApplicationEngine.mjs'
import { sourceDateProvenanceDocument } from './sourceDateSemantics.mjs'
import { dateProvenanceIndexForSource } from './sourceDateRegistryGate.mjs'
import {
  SOURCE_METADATA_FINGERPRINT_PATH,
  storedSourceMetadataFingerprint,
} from './sourceMetadataFingerprint.mjs'
import { sourceRecencyPolicy } from './sourceRecencyPolicy.mjs'

const EXPECTED_SOURCE_COUNT = 235

function operationHistoryBySource(modules) {
  const histories = new Map()
  for (const module of modules) {
    for (const operation of module.operations) {
      const history = histories.get(operation.sourceId) ?? []
      history.push({
        modulePath: module.modulePath,
        batchId: module.batchId,
        operation: operation.operation,
        operationDigest: operation.operationDigest,
      })
      histories.set(operation.sourceId, history)
    }
  }
  return histories
}

function buildSourceEntries(replay, provenanceDocument) {
  const histories = operationHistoryBySource(replay.modules)
  return replay.records.map(({ registryFile, source }) => {
    const history = histories.get(source.source_id) ?? []
    if (history.length === 0 || history[0].operation !== 'full_source') {
      throw new Error(`${source.source_id}: independent replay ownership must begin with a full source definition`)
    }
    const entry = {
      sourceId: source.source_id,
      registryFile,
      owner: history[0],
      operationHistory: history,
      dateProvenanceIndex: dateProvenanceIndexForSource(provenanceDocument, source),
    }
    return { ...entry, entryDigest: sha256(entry) }
  }).sort((left, right) => left.sourceId.localeCompare(right.sourceId))
}

export async function buildIndependentReplayManifest({
  provenanceDocument = sourceDateProvenanceDocument(),
  recencyPolicy = sourceRecencyPolicy(),
} = {}) {
  const replay = await replayCommittedSourceBatches({
    manifest: null,
    provenanceDocument,
    asOfDate: recencyPolicy.evaluation_date,
  })
  if (!replay.initialModuleApplied) throw new Error('Initial source module was not applied')
  if (replay.numberedModuleCount !== EXPECTED_NUMBERED_BATCH_COUNT) {
    throw new Error(`Expected ${EXPECTED_NUMBERED_BATCH_COUNT} numbered modules, found ${replay.numberedModuleCount}`)
  }
  if (replay.supplementApplied) throw new Error('Supplement replay is prohibited')
  if (replay.records.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Expected ${EXPECTED_SOURCE_COUNT} independently replayed sources, found ${replay.records.length}`)
  }

  const sources = buildSourceEntries(replay, provenanceDocument)
  const manifest = {
    schemaVersion: '2.0.0',
    provenanceMigrationVersion: provenanceDocument.migrationVersion,
    recencyPolicyVersion: recencyPolicy.policy_version,
    recencyEvaluationDate: recencyPolicy.evaluation_date,
    fingerprintSchemaVersion: '1.0.0',
    registrySchemaVersions: SOURCE_REGISTRY_SCHEMA_VERSIONS,
    registryHeaders: SOURCE_REGISTRY_HEADER_TEMPLATES,
    sourceCount: sources.length,
    numberedBatchCount: replay.numberedModuleCount,
    initialModuleApplied: true,
    supplementReplayAllowed: false,
    historicalLedgerAuthoritative: false,
    originalInventoryAuthoritative: false,
    sources,
    batches: replay.modules.map((module) => ({
      modulePath: module.modulePath,
      batchId: module.batchId,
      operations: module.operations,
    })),
  }
  manifest.manifestFingerprint = sha256(manifest)
  return { manifest, replay, provenanceDocument, recencyPolicy }
}

export async function writeIndependentReplayManifest() {
  const result = await buildIndependentReplayManifest()
  writeJson(SOURCE_METADATA_REPLAY_MANIFEST_PATH, result.manifest)
  return result
}

export async function writeIndependentReplayArtifacts() {
  const built = await buildIndependentReplayManifest()
  const replay = await replayCommittedSourceBatches({
    manifest: built.manifest,
    provenanceDocument: built.provenanceDocument,
    asOfDate: built.recencyPolicy.evaluation_date,
  })
  if (replay.records.length !== built.manifest.sourceCount) {
    throw new Error('Manifest-bearing replay source count differs from the independent manifest build')
  }

  writeJson(SOURCE_METADATA_REPLAY_MANIFEST_PATH, built.manifest)
  for (const registryFile of SOURCE_REGISTRY_FILES) {
    writeJson(
      path.join(EXPANSION_DIR, 'sources', registryFile),
      replay.registryState.get(registryFile),
    )
  }
  const parity = await verifyCommittedSourceBatchReplay({
    manifest: built.manifest,
    provenanceDocument: built.provenanceDocument,
    asOfDate: built.recencyPolicy.evaluation_date,
  })
  if (parity.errors.length > 0) {
    throw new Error(`Generated registry parity failed: ${parity.errors.slice(0, 5).join('; ')}`)
  }

  const fingerprintRecord = storedSourceMetadataFingerprint(replay.records, {
    provenanceMigrationVersion: built.provenanceDocument.migrationVersion,
    fingerprintSchemaVersion: built.manifest.fingerprintSchemaVersion,
  })
  writeJson(SOURCE_METADATA_FINGERPRINT_PATH, fingerprintRecord)
  return { ...built, replay, parity, fingerprintRecord }
}

async function main() {
  const { manifest, replay, parity, fingerprintRecord } = await writeIndependentReplayArtifacts()
  console.log(JSON.stringify({
    status: 'PASS',
    sourceCount: manifest.sourceCount,
    initialModuleApplied: manifest.initialModuleApplied,
    numberedBatchCount: manifest.numberedBatchCount,
    sourceUpdates: replay.sourceUpdates,
    supplementApplied: replay.supplementApplied,
    replayManifestFingerprint: manifest.manifestFingerprint,
    replayParityDifferences: parity.diagnostics.length,
    sourceMetadataFingerprint: fingerprintRecord.fingerprint,
  }, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}

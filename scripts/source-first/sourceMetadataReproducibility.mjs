import fs from 'node:fs'
import {
  SOURCE_METADATA_FINGERPRINT_PATH,
  compareSourceMetadataFingerprintResults,
  fingerprintSourceMetadata,
  loadActiveSourceRecords,
  verifyStoredSourceMetadataFingerprint,
} from './sourceMetadataFingerprint.mjs'
import { buildIndependentReplayManifest } from './migrateSourceMetadataReproducibility.mjs'
import {
  loadReplayManifest,
  structuredJsonPointerDiffs,
  verifyCommittedSourceBatchReplay,
} from './sourceMetadataReplay.mjs'
import { sourceDateSemanticsErrors } from './sourceDateSemantics.mjs'
import { summarizeSourceRecency, validatePersistedSourceRecency } from './sourceRecencyPolicy.mjs'

function issue(code, message, details = {}) {
  return { code, message, ...details }
}

export function validatePersistedSourceMetadata(records) {
  const issues = []
  for (const { source } of records) {
    for (const message of sourceDateSemanticsErrors(source)) {
      issues.push(issue('persisted_date_provenance_invalid', `${source.source_id}: ${message}`, {
        sourceId: source.source_id,
      }))
    }
    for (const message of validatePersistedSourceRecency(source)) {
      issues.push(issue('source_recency_parity_mismatch', message, {
        sourceId: source.source_id,
      }))
    }
  }
  return issues
}

function prefixIssues(issues, phase) {
  return issues.map((entry) => ({ ...entry, phase }))
}

export async function verifySourceMetadataReproducibility({
  activeRecords,
  storedRecord,
  replayVerification,
  independentManifestBuild,
  loadRecords = loadActiveSourceRecords,
  loadStoredRecord = () => JSON.parse(fs.readFileSync(SOURCE_METADATA_FINGERPRINT_PATH, 'utf8')),
  loadCommittedManifest = loadReplayManifest,
  buildManifest = buildIndependentReplayManifest,
  verifyReplay = verifyCommittedSourceBatchReplay,
  validateRecords = validatePersistedSourceMetadata,
} = {}) {
  const issues = []
  let resolvedActiveRecords = activeRecords
  let resolvedStoredRecord = storedRecord
  let resolvedReplayVerification = replayVerification
  let resolvedIndependentManifestBuild = independentManifestBuild

  // Recompute replay ownership from initial definitions, numbered batches,
  // committed provenance and policy before reading active registry records.
  if (resolvedIndependentManifestBuild === undefined) {
    try {
      resolvedIndependentManifestBuild = await buildManifest()
    } catch (error) {
      issues.push(issue('independent_replay_manifest_build_failed', `independent replay manifest build failed: ${error.message}`, {
        phase: 'replay_manifest',
      }))
      resolvedIndependentManifestBuild = null
    }
  }
  const independentManifest = resolvedIndependentManifestBuild?.manifest ?? null

  let committedManifest = resolvedReplayVerification?.manifest ?? null
  if (!committedManifest) {
    try {
      committedManifest = loadCommittedManifest()
    } catch (error) {
      issues.push(issue('committed_replay_manifest_load_failed', `committed replay manifest loading failed: ${error.message}`, {
        phase: 'replay_manifest',
      }))
    }
  }
  if (independentManifest && committedManifest) {
    for (const difference of structuredJsonPointerDiffs(independentManifest, committedManifest)) {
      issues.push(issue('replay_manifest_mismatch', `committed replay manifest differs at ${difference.field_path}`, {
        phase: 'replay_manifest',
        fieldPath: difference.field_path,
        expected: difference.expected,
        replayed: difference.replayed,
      }))
    }
  }

  // Replay must be constructed independently before active state is loaded for comparison.
  if (resolvedReplayVerification === undefined) {
    try {
      resolvedReplayVerification = await verifyReplay({
        manifest: independentManifest ?? committedManifest,
      })
    } catch (error) {
      issues.push(issue('committed_batch_replay_failed', `committed source-batch replay failed: ${error.message}`, {
        phase: 'committed_batch_replay',
      }))
      resolvedReplayVerification = null
    }
  }

  try {
    resolvedActiveRecords ??= resolvedReplayVerification?.activeRecords ?? loadRecords()
  } catch (error) {
    issues.push(issue('active_registry_load_failed', `active source registry loading failed: ${error.message}`, {
      phase: 'active_registry',
    }))
    resolvedActiveRecords = []
  }

  try {
    resolvedStoredRecord ??= loadStoredRecord()
  } catch (error) {
    issues.push(issue('stored_fingerprint_load_failed', `stored source-metadata fingerprint loading failed: ${error.message}`, {
      phase: 'stored_fingerprint',
    }))
    resolvedStoredRecord = null
  }

  try {
    issues.push(...prefixIssues(validateRecords(resolvedActiveRecords), 'active_metadata'))
  } catch (error) {
    issues.push(issue('active_metadata_validation_failed', `active source metadata validation failed: ${error.message}`, {
      phase: 'active_metadata',
    }))
  }

  let activeFingerprint
  try {
    activeFingerprint = fingerprintSourceMetadata(resolvedActiveRecords)
  } catch (error) {
    issues.push(issue('active_fingerprint_failed', `active source-metadata fingerprinting failed: ${error.message}`, {
      phase: 'active_fingerprint',
    }))
  }

  if (resolvedStoredRecord && activeFingerprint) {
    try {
      const storedVerification = verifyStoredSourceMetadataFingerprint(resolvedActiveRecords, resolvedStoredRecord)
      issues.push(...prefixIssues(storedVerification.issues, 'stored_fingerprint'))
      activeFingerprint = storedVerification.actual
    } catch (error) {
      issues.push(issue('stored_fingerprint_verification_failed', `stored source-metadata fingerprint verification failed: ${error.message}`, {
        phase: 'stored_fingerprint',
      }))
    }
  }

  if (resolvedReplayVerification) {
    for (const message of resolvedReplayVerification.errors ?? []) {
      issues.push(issue('committed_batch_replay_parity_error', message, {
        phase: 'committed_batch_replay',
      }))
    }
  }

  const replayFingerprint = resolvedReplayVerification?.replay?.fingerprint
    ?? (resolvedReplayVerification?.replay?.records && activeFingerprint
      ? fingerprintSourceMetadata(resolvedReplayVerification.replay.records)
      : null)
  if (activeFingerprint && replayFingerprint) {
    issues.push(...prefixIssues(compareSourceMetadataFingerprintResults(activeFingerprint, replayFingerprint, {
      leftLabel: 'active registry',
      rightLabel: 'committed batch replay',
    }), 'active_replay_fingerprint'))
  } else if (resolvedReplayVerification && !replayFingerprint) {
    issues.push(issue('replay_fingerprint_missing', 'committed source-batch replay did not produce a source-metadata fingerprint', {
      phase: 'committed_batch_replay',
    }))
  }

  const status = issues.length === 0 ? 'PASS' : 'FAIL'
  const sources = resolvedActiveRecords.map((record) => record.source)
  return {
    status,
    errors: issues.map((entry) => entry.message),
    issues,
    checks: {
      persistedDateProvenanceAndRecency: !issues.some((entry) => entry.phase === 'active_metadata'),
      storedFingerprint: !issues.some((entry) => entry.phase === 'stored_fingerprint'),
      independentReplayManifest: !issues.some((entry) => entry.phase === 'replay_manifest'),
      committedBatchReplay: !issues.some((entry) => entry.phase === 'committed_batch_replay'),
      activeReplayFingerprintParity: !issues.some((entry) => entry.phase === 'active_replay_fingerprint'),
    },
    sourceCount: resolvedActiveRecords.length,
    replaySourceCount: resolvedReplayVerification?.replay?.records?.length ?? null,
    replayModuleCount: resolvedReplayVerification?.replay?.modulePaths?.length ?? null,
    recencyCounts: summarizeSourceRecency(sources),
    fingerprints: {
      stored: resolvedStoredRecord?.fingerprint ?? null,
      active: activeFingerprint?.fingerprint ?? null,
      replay: replayFingerprint?.fingerprint ?? null,
      replayManifest: independentManifest?.manifestFingerprint ?? null,
    },
  }
}

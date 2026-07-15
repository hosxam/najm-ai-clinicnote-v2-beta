import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {
  CANONICAL_APPROVAL_MANIFEST_FILE,
  CANONICAL_APPROVAL_SIGNATURE_FILE,
  CANONICAL_GENESIS_MANIFEST_HASH,
  CANONICAL_MAPPING_SCHEMA_VERSION,
  CANONICAL_RESOURCE_LIMITS,
  canonicalMappingFileName,
  canonicalMappingKey,
  canonicalWorkflowItemKey,
} from './canonicalMappingContract.mjs'
import {
  canonicalApprovalManifestBytes,
  canonicalMappingDocumentBytes,
  canonicalMappingKeyObject,
  canonicalMappingObject,
  parseStrictJsonBytes,
  sha256Bytes,
} from './canonicalJson.mjs'
import { buildApprovalManifest } from './canonicalMappingManifest.mjs'
import {
  loadSignedCanonicalState,
  validateCanonicalMappingRecords,
} from './canonicalMappingStore.mjs'

const REMOVAL_FIELDS = Object.freeze(['workflowId', 'itemId', 'sourceId', 'sectionId'])

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true })
}

function writeAndSync(filePath, bytes) {
  const descriptor = fs.openSync(filePath, 'wx', 0o600)
  try {
    fs.writeFileSync(descriptor, bytes)
    fs.fsyncSync(descriptor)
  } finally {
    fs.closeSync(descriptor)
  }
}

function syncDirectory(directory) {
  try {
    const descriptor = fs.openSync(directory, fs.constants.O_RDONLY)
    try {
      fs.fsyncSync(descriptor)
    } finally {
      fs.closeSync(descriptor)
    }
  } catch (error) {
    if (process.platform !== 'win32') throw error
  }
}

function readPrivateKey(signingKeyPath) {
  const stat = fs.lstatSync(signingKeyPath, { bigint: true })
  if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink !== 1n) {
    throw new Error('[canonical-transaction] signing key path must be a normal, non-linked regular file')
  }
  const privateKey = crypto.createPrivateKey(fs.readFileSync(signingKeyPath))
  if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('[canonical-transaction] signing key must be Ed25519')
  return privateKey
}

function readApprovalState(approvalStatePath) {
  if (!approvalStatePath || !fs.existsSync(approvalStatePath)) return null
  const parsed = parseStrictJsonBytes(fs.readFileSync(approvalStatePath), {
    fileName: approvalStatePath,
    maxBytes: 4096,
  })
  const keys = Object.keys(parsed).sort()
  if (JSON.stringify(keys) !== JSON.stringify(['aggregateHash', 'approvalSequence', 'manifestHash'].sort())
    || !Number.isInteger(parsed.approvalSequence)
    || !/^[a-f0-9]{64}$/.test(parsed.manifestHash ?? '')
    || !/^[a-f0-9]{64}$/.test(parsed.aggregateHash ?? '')) {
    throw new Error('[canonical-transaction] approval checkpoint file is invalid')
  }
  return parsed
}

function writeApprovalState(approvalStatePath, state) {
  if (!approvalStatePath) return
  ensureDirectory(path.dirname(approvalStatePath))
  const temporaryPath = `${approvalStatePath}.${process.pid}.${crypto.randomUUID()}.tmp`
  try {
    writeAndSync(temporaryPath, Buffer.from(`${JSON.stringify(state, null, 2)}\n`, 'utf8'))
    fs.renameSync(temporaryPath, approvalStatePath)
  } finally {
    fs.rmSync(temporaryPath, { force: true })
  }
}

function acquireLock(lockPath) {
  const descriptor = fs.openSync(lockPath, 'wx', 0o600)
  try {
    fs.writeFileSync(descriptor, `${JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() })}\n`)
    fs.fsyncSync(descriptor)
  } catch (error) {
    fs.closeSync(descriptor)
    fs.rmSync(lockPath, { force: true })
    throw error
  }
  fs.closeSync(descriptor)
}

function normalizedDocuments(state) {
  return new Map(state.documents.map((document) => [document.workflowId, structuredClone(document)]))
}

function documentEntries(documents) {
  return [...documents.values()]
    .filter((document) => document.mappings.length > 0)
    .sort((left, right) => left.workflowId.localeCompare(right.workflowId))
}

function semanticBytes(value) {
  return Buffer.from(JSON.stringify(value), 'utf8')
}

function sameMapping(left, right) {
  return semanticBytes(canonicalMappingObject(left)).equals(semanticBytes(canonicalMappingObject(right)))
}

function validateRemovalRequest(rawBytes) {
  const request = parseStrictJsonBytes(rawBytes, {
    fileName: '<canonical-removal-request>',
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxInputBytes,
  })
  if (!request || typeof request !== 'object' || Array.isArray(request) || Object.getPrototypeOf(request) !== Object.prototype) {
    throw new Error('[canonical-transaction] removal request must be a plain JSON object')
  }
  const keys = Object.keys(request)
  const unknown = keys.filter((key) => !REMOVAL_FIELDS.includes(key))
  const missing = REMOVAL_FIELDS.filter((key) => !Object.hasOwn(request, key))
  if (unknown.length || missing.length) throw new Error('[canonical-transaction] removal request must contain the exact mapping key fields')
  for (const field of REMOVAL_FIELDS) {
    if (typeof request[field] !== 'string' || request[field].length === 0 || request[field].length > CANONICAL_RESOURCE_LIMITS.maxIdentifierLength) {
      throw new Error(`[canonical-transaction] invalid removal ${field}`)
    }
  }
  return request
}

function stageSignedState({ documents, currentState, environment, privateKey }) {
  const parent = path.dirname(environment.directory)
  const stage = path.join(parent, `${path.basename(environment.directory)}.stage.${process.pid}.${crypto.randomUUID()}`)
  ensureDirectory(stage)
  writeAndSync(path.join(stage, '.gitkeep'), Buffer.from('\n', 'utf8'))
  const files = []
  for (const document of documentEntries(documents)) {
    const canonicalDocument = {
      schemaVersion: CANONICAL_MAPPING_SCHEMA_VERSION,
      workflowId: document.workflowId,
      mappings: [...document.mappings].sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right))),
    }
    const bytes = canonicalMappingDocumentBytes(canonicalDocument)
    if (bytes.length > CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes) {
      throw new Error(`[canonical-transaction] ${document.workflowId}: canonical file exceeds resource limit`)
    }
    const fileName = canonicalMappingFileName(document.workflowId)
    writeAndSync(path.join(stage, fileName), bytes)
    files.push({
      path: fileName,
      workflowId: document.workflowId,
      sha256: sha256Bytes(bytes),
      byteLength: bytes.length,
      mappingCount: canonicalDocument.mappings.length,
      mappingKeys: canonicalDocument.mappings.map(canonicalMappingKeyObject),
    })
  }
  const manifest = buildApprovalManifest({
    createdAt: new Date().toISOString(),
    approvalSequence: currentState ? currentState.manifest.approvalSequence + 1 : 1,
    previousManifestHash: currentState ? currentState.manifestHash : CANONICAL_GENESIS_MANIFEST_HASH,
    files,
  })
  const manifestBytes = canonicalApprovalManifestBytes(manifest)
  if (manifestBytes.length > CANONICAL_RESOURCE_LIMITS.maxManifestBytes) {
    throw new Error('[canonical-transaction] manifest exceeds resource limit')
  }
  const signature = crypto.sign(null, manifestBytes, privateKey)
  writeAndSync(path.join(stage, CANONICAL_APPROVAL_MANIFEST_FILE), manifestBytes)
  writeAndSync(path.join(stage, CANONICAL_APPROVAL_SIGNATURE_FILE), Buffer.from(`${signature.toString('base64')}\n`, 'ascii'))
  syncDirectory(stage)
  return { stage, manifest, manifestBytes }
}

function commitStagedState({ staged, currentState, environment }) {
  const backup = `${environment.directory}.backup.${process.pid}.${crypto.randomUUID()}`
  const approvalState = currentState
    ? { approvalSequence: currentState.manifest.approvalSequence, manifestHash: currentState.manifestHash }
    : null
  let movedOriginal = false
  let activatedStage = false
  try {
    loadSignedCanonicalState({
      directory: staged.stage,
      expectedDirectory: staged.stage,
      publicKeyPath: environment.publicKeyPath,
      context: environment.context,
      allowTestDirectory: true,
      allowTransactionLock: true,
      approvalState,
    })
    if (fs.existsSync(environment.directory)) {
      fs.renameSync(environment.directory, backup)
      movedOriginal = true
    }
    fs.renameSync(staged.stage, environment.directory)
    activatedStage = true
    syncDirectory(path.dirname(environment.directory))
    const active = loadSignedCanonicalState({
      directory: environment.directory,
      expectedDirectory: environment.directory,
      publicKeyPath: environment.publicKeyPath,
      context: environment.context,
      allowTestDirectory: environment.allowTestDirectory,
      allowTransactionLock: true,
      approvalState,
    })
    writeApprovalState(environment.approvalStatePath, {
      approvalSequence: active.manifest.approvalSequence,
      manifestHash: active.manifestHash,
      aggregateHash: active.aggregateHash,
    })
    if (movedOriginal) fs.rmSync(backup, { recursive: true, force: true })
    return active
  } catch (error) {
    if (activatedStage && fs.existsSync(environment.directory)) fs.rmSync(environment.directory, { recursive: true, force: true })
    if (movedOriginal && fs.existsSync(backup)) fs.renameSync(backup, environment.directory)
    throw error
  } finally {
    if (fs.existsSync(staged.stage)) fs.rmSync(staged.stage, { recursive: true, force: true })
    if (fs.existsSync(backup) && fs.existsSync(environment.directory)) fs.rmSync(backup, { recursive: true, force: true })
  }
}

function runTransaction(environment, mutate) {
  ensureDirectory(path.dirname(environment.directory))
  const lockPath = `${environment.directory}.lock`
  acquireLock(lockPath)
  try {
    const approvalState = readApprovalState(environment.approvalStatePath)
    const manifestExists = fs.existsSync(path.join(environment.directory, CANONICAL_APPROVAL_MANIFEST_FILE))
    if (!manifestExists && fs.existsSync(environment.directory)) {
      const bootstrapEntries = fs.readdirSync(environment.directory).filter((name) => name !== '.gitkeep')
      if (bootstrapEntries.length) {
        throw new Error(`[canonical-transaction] unsigned bootstrap directory is not empty: ${bootstrapEntries.join(', ')}`)
      }
    }
    const currentState = manifestExists
      ? loadSignedCanonicalState({
          directory: environment.directory,
          expectedDirectory: environment.expectedDirectory,
          publicKeyPath: environment.publicKeyPath,
          context: environment.context,
          allowTestDirectory: environment.allowTestDirectory,
          allowTransactionLock: true,
          approvalState,
        })
      : null
    const documents = currentState ? normalizedDocuments(currentState) : new Map()
    const outcome = mutate(documents, currentState)
    if (outcome.noOp) return outcome
    const privateKey = readPrivateKey(environment.signingKeyPath)
    let staged
    try {
      staged = stageSignedState({ documents, currentState, environment, privateKey })
      const active = commitStagedState({ staged, currentState, environment })
      return { ...outcome, noOp: false, active }
    } finally {
      if (staged?.stage && fs.existsSync(staged.stage)) fs.rmSync(staged.stage, { recursive: true, force: true })
    }
  } finally {
    fs.rmSync(lockPath, { force: true })
  }
}

export function initializeSignedCanonicalStore(environment) {
  return runTransaction(environment, (documents, currentState) => {
    if (currentState) return { noOp: true, action: 'already-initialized', active: currentState }
    if (documents.size !== 0) throw new Error('[canonical-transaction] bootstrap documents must be empty')
    return { noOp: false, action: 'initialized-empty' }
  })
}

export function approveRawCanonicalMapping(rawBytes, environment) {
  if (!Buffer.isBuffer(rawBytes) && !(rawBytes instanceof Uint8Array)) {
    throw new Error('[canonical-transaction] approval accepts raw JSON bytes only')
  }
  const parsed = parseStrictJsonBytes(rawBytes, {
    fileName: '<canonical-approval-input>',
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxInputBytes,
  })
  const mapping = validateCanonicalMappingRecords([parsed], environment.context)[0]
  return runTransaction(environment, (documents, currentState) => {
    if (!currentState) throw new Error('[canonical-transaction] initialize the signed empty store before approving a mapping')
    const existingByExactKey = currentState.mappings.find((row) => canonicalMappingKey(row) === canonicalMappingKey(mapping))
    if (existingByExactKey) {
      if (sameMapping(existingByExactKey, mapping)) {
        return { noOp: true, action: 'identical-replay', mapping: existingByExactKey, active: currentState }
      }
      throw new Error(`[canonical-transaction] conflicting mapping replay for ${canonicalMappingKey(mapping)}`)
    }
    const itemKey = canonicalWorkflowItemKey(mapping)
    if (currentState.mappings.some((row) => canonicalWorkflowItemKey(row) === itemKey)) {
      throw new Error(`[canonical-transaction] conflicting mapping already exists for ${itemKey}`)
    }
    const document = documents.get(mapping.workflowId) ?? {
      schemaVersion: CANONICAL_MAPPING_SCHEMA_VERSION,
      workflowId: mapping.workflowId,
      mappings: [],
    }
    document.mappings.push(structuredClone(mapping))
    documents.set(mapping.workflowId, document)
    return { action: 'approved', mapping }
  })
}

export function removeRawCanonicalMapping(rawBytes, environment) {
  const request = validateRemovalRequest(rawBytes)
  return runTransaction(environment, (documents, currentState) => {
    if (!currentState) throw new Error('[canonical-transaction] signed canonical store is not initialized')
    const key = canonicalMappingKey(request)
    const existing = currentState.mappings.find((mapping) => canonicalMappingKey(mapping) === key)
    if (!existing) throw new Error(`[canonical-transaction] exact mapping does not exist: ${key}`)
    const document = documents.get(request.workflowId)
    document.mappings = document.mappings.filter((mapping) => canonicalMappingKey(mapping) !== key)
    if (document.mappings.length === 0) documents.delete(request.workflowId)
    return { action: 'removed', mapping: existing }
  })
}

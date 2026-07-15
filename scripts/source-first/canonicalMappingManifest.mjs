import { createPublicKey, verify } from 'node:crypto'
import path from 'node:path'
import {
  CANONICAL_APPROVAL_FILE_FIELDS,
  CANONICAL_APPROVAL_MANIFEST_FIELDS,
  CANONICAL_APPROVAL_MANIFEST_SCHEMA_VERSION,
  CANONICAL_GENESIS_MANIFEST_HASH,
  CANONICAL_MAPPING_KEY_FIELDS,
  CANONICAL_MAPPING_SCHEMA_VERSION,
  CANONICAL_REPOSITORY_NAMESPACE,
  CANONICAL_RESOURCE_LIMITS,
  canonicalMappingFileName,
  canonicalMappingKey,
} from './canonicalMappingContract.mjs'
import {
  canonicalApprovalManifestBytes,
  canonicalMappingKeyObject,
  computeManifestAggregateHash,
  deepFreeze,
  parseStrictJsonBytes,
  projectFields,
} from './canonicalJson.mjs'

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const WORKFLOW_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[canonical-manifest] ${label} must be a plain object`)
  }
}

function exactFields(value, fields, label) {
  plainObject(value, label)
  const allowed = new Set(fields)
  const unknown = Object.keys(value).filter((field) => !allowed.has(field))
  const missing = fields.filter((field) => !Object.hasOwn(value, field))
  if (unknown.length) throw new Error(`[canonical-manifest] ${label} has unexpected properties: ${unknown.join(', ')}`)
  if (missing.length) throw new Error(`[canonical-manifest] ${label} is missing properties: ${missing.join(', ')}`)
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field)
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new Error(`[canonical-manifest] ${label}.${field} must be an own data property`)
    }
  }
}

function exactString(value, label, { pattern, max = CANONICAL_RESOURCE_LIMITS.maxStringLength } = {}) {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0 || value.length > max) {
    throw new Error(`[canonical-manifest] ${label} must be a bounded non-empty exact string`)
  }
  if (pattern && !pattern.test(value)) throw new Error(`[canonical-manifest] ${label} has invalid format`)
}

function validateMappingKeyEntry(entry, label) {
  exactFields(entry, CANONICAL_MAPPING_KEY_FIELDS, label)
  for (const field of CANONICAL_MAPPING_KEY_FIELDS) {
    exactString(entry[field], `${label}.${field}`, { max: CANONICAL_RESOURCE_LIMITS.maxIdentifierLength })
  }
  if (!WORKFLOW_ID_PATTERN.test(entry.workflowId)) throw new Error(`[canonical-manifest] ${label}.workflowId has invalid format`)
  return projectFields(entry, CANONICAL_MAPPING_KEY_FIELDS)
}

function validateRelativeCanonicalPath(relativePath, workflowId) {
  exactString(relativePath, 'manifest file path', { max: CANONICAL_RESOURCE_LIMITS.maxIdentifierLength + 5 })
  if (path.isAbsolute(relativePath)
    || relativePath.includes('/')
    || relativePath.includes('\\')
    || relativePath.includes(':')
    || relativePath.includes('%')
    || relativePath.startsWith('.')
    || relativePath !== canonicalMappingFileName(workflowId)) {
    throw new Error(`[canonical-manifest] unsafe or mismatching canonical path ${relativePath}`)
  }
}

function sortedKeyStrings(entries) {
  return entries.map(canonicalMappingKey).sort((left, right) => left.localeCompare(right))
}

export function validateApprovalManifest(manifest) {
  exactFields(manifest, CANONICAL_APPROVAL_MANIFEST_FIELDS, 'approval manifest')
  if (manifest.manifestSchemaVersion !== CANONICAL_APPROVAL_MANIFEST_SCHEMA_VERSION) {
    throw new Error('[canonical-manifest] unsupported manifest schema version')
  }
  if (manifest.repositoryNamespace !== CANONICAL_REPOSITORY_NAMESPACE) {
    throw new Error('[canonical-manifest] repository namespace mismatch')
  }
  if (manifest.canonicalSchemaVersion !== CANONICAL_MAPPING_SCHEMA_VERSION) {
    throw new Error('[canonical-manifest] canonical schema version mismatch')
  }
  exactString(manifest.createdAt, 'createdAt', { max: 64 })
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(manifest.createdAt)
    || Number.isNaN(Date.parse(manifest.createdAt))) {
    throw new Error('[canonical-manifest] createdAt must be a canonical UTC ISO timestamp')
  }
  if (!Number.isSafeInteger(manifest.approvalSequence) || manifest.approvalSequence < 1) {
    throw new Error('[canonical-manifest] approvalSequence must be a positive integer')
  }
  exactString(manifest.previousManifestHash, 'previousManifestHash', { pattern: SHA256_PATTERN, max: 64 })
  if (manifest.approvalSequence === 1 && manifest.previousManifestHash !== CANONICAL_GENESIS_MANIFEST_HASH) {
    throw new Error('[canonical-manifest] genesis manifest has invalid previousManifestHash')
  }
  if (manifest.approvalSequence > 1 && manifest.previousManifestHash === CANONICAL_GENESIS_MANIFEST_HASH) {
    throw new Error('[canonical-manifest] non-genesis manifest lacks previous-manifest linkage')
  }
  if (!Array.isArray(manifest.files) || manifest.files.length > CANONICAL_RESOURCE_LIMITS.maxCanonicalFiles) {
    throw new Error('[canonical-manifest] files must be a bounded array')
  }
  if (!Array.isArray(manifest.mappingKeys) || manifest.mappingKeys.length > CANONICAL_RESOURCE_LIMITS.maxTotalMappings) {
    throw new Error('[canonical-manifest] mappingKeys must be a bounded array')
  }

  const pathSet = new Set()
  const casePathSet = new Set()
  const fileWorkflowSet = new Set()
  const validatedFiles = manifest.files.map((file, fileIndex) => {
    exactFields(file, CANONICAL_APPROVAL_FILE_FIELDS, `files[${fileIndex}]`)
    exactString(file.workflowId, `files[${fileIndex}].workflowId`, { pattern: WORKFLOW_ID_PATTERN, max: CANONICAL_RESOURCE_LIMITS.maxIdentifierLength })
    validateRelativeCanonicalPath(file.path, file.workflowId)
    if (pathSet.has(file.path)) throw new Error(`[canonical-manifest] duplicate manifest path ${file.path}`)
    if (casePathSet.has(file.path.toLowerCase())) throw new Error(`[canonical-manifest] case-collision manifest path ${file.path}`)
    if (fileWorkflowSet.has(file.workflowId)) throw new Error(`[canonical-manifest] duplicate workflow file ${file.workflowId}`)
    pathSet.add(file.path)
    casePathSet.add(file.path.toLowerCase())
    fileWorkflowSet.add(file.workflowId)
    exactString(file.sha256, `files[${fileIndex}].sha256`, { pattern: SHA256_PATTERN, max: 64 })
    if (!Number.isSafeInteger(file.byteLength) || file.byteLength < 1 || file.byteLength > CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes) {
      throw new Error(`[canonical-manifest] files[${fileIndex}].byteLength is invalid`)
    }
    if (!Number.isSafeInteger(file.mappingCount)
      || file.mappingCount < 1
      || file.mappingCount > CANONICAL_RESOURCE_LIMITS.maxMappingsPerWorkflow) {
      throw new Error(`[canonical-manifest] files[${fileIndex}].mappingCount is invalid`)
    }
    if (!Array.isArray(file.mappingKeys) || file.mappingKeys.length !== file.mappingCount) {
      throw new Error(`[canonical-manifest] files[${fileIndex}] mapping count mismatch`)
    }
    const keys = file.mappingKeys.map((entry, keyIndex) => validateMappingKeyEntry(entry, `files[${fileIndex}].mappingKeys[${keyIndex}]`))
    if (keys.some((entry) => entry.workflowId !== file.workflowId)) {
      throw new Error(`[canonical-manifest] files[${fileIndex}] contains a mapping key for another workflow`)
    }
    const keyStrings = sortedKeyStrings(keys)
    if (new Set(keyStrings).size !== keyStrings.length) throw new Error(`[canonical-manifest] files[${fileIndex}] has duplicate mapping keys`)
    if (JSON.stringify(keyStrings) !== JSON.stringify(keys.map(canonicalMappingKey))) {
      throw new Error(`[canonical-manifest] files[${fileIndex}] mapping keys are not sorted`)
    }
    return {
      ...projectFields(file, CANONICAL_APPROVAL_FILE_FIELDS),
      mappingKeys: keys,
    }
  })
  const filePaths = validatedFiles.map((file) => file.path)
  if (JSON.stringify(filePaths) !== JSON.stringify([...filePaths].sort((left, right) => left.localeCompare(right)))) {
    throw new Error('[canonical-manifest] files are not sorted by exact path')
  }

  const mappingKeys = manifest.mappingKeys.map((entry, index) => validateMappingKeyEntry(entry, `mappingKeys[${index}]`))
  const mappingKeyStrings = mappingKeys.map(canonicalMappingKey)
  if (new Set(mappingKeyStrings).size !== mappingKeyStrings.length) throw new Error('[canonical-manifest] duplicate top-level mapping key')
  if (JSON.stringify(mappingKeyStrings) !== JSON.stringify([...mappingKeyStrings].sort((left, right) => left.localeCompare(right)))) {
    throw new Error('[canonical-manifest] top-level mapping keys are not sorted')
  }
  const fileKeyStrings = validatedFiles.flatMap((file) => file.mappingKeys.map(canonicalMappingKey)).sort((left, right) => left.localeCompare(right))
  if (JSON.stringify(mappingKeyStrings) !== JSON.stringify(fileKeyStrings)) {
    throw new Error('[canonical-manifest] top-level mapping keys do not equal file mapping keys')
  }
  exactString(manifest.aggregateHash, 'aggregateHash', { pattern: SHA256_PATTERN, max: 64 })
  const normalized = {
    ...projectFields(manifest, CANONICAL_APPROVAL_MANIFEST_FIELDS),
    files: validatedFiles,
    mappingKeys,
  }
  const expectedAggregate = computeManifestAggregateHash(normalized)
  if (manifest.aggregateHash !== expectedAggregate) throw new Error('[canonical-manifest] aggregate hash mismatch')
  return deepFreeze(normalized)
}

export function parseAndValidateApprovalManifest(manifestBytes, fileName = 'APPROVED_MANIFEST.json') {
  const parsed = parseStrictJsonBytes(manifestBytes, {
    fileName,
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxManifestBytes,
  })
  const manifest = validateApprovalManifest(parsed)
  const canonicalBytes = canonicalApprovalManifestBytes(manifest)
  if (!Buffer.from(manifestBytes).equals(canonicalBytes)) {
    throw new Error('[canonical-manifest] manifest bytes are not canonical')
  }
  return manifest
}

export function decodeDetachedSignature(signatureBytes) {
  const text = Buffer.from(signatureBytes).toString('ascii')
  if (!/^[A-Za-z0-9+/]+={0,2}\n$/.test(text)) throw new Error('[canonical-manifest] detached signature encoding is invalid')
  const encoded = text.trim()
  const signature = Buffer.from(encoded, 'base64')
  if (signature.toString('base64') !== encoded || signature.length !== 64) {
    throw new Error('[canonical-manifest] detached Ed25519 signature is invalid')
  }
  return signature
}

export function verifyApprovalManifestSignature(manifestBytes, signatureBytes, publicKeyBytes) {
  const publicKey = createPublicKey(publicKeyBytes)
  if (publicKey.asymmetricKeyType !== 'ed25519') throw new Error('[canonical-manifest] public key must be Ed25519')
  const signature = decodeDetachedSignature(signatureBytes)
  if (!verify(null, manifestBytes, publicKey, signature)) {
    throw new Error('[canonical-manifest] approval manifest signature verification failed')
  }
  return true
}

export function buildApprovalManifest({
  createdAt,
  approvalSequence,
  previousManifestHash,
  files,
}) {
  const sortedFiles = [...files].sort((left, right) => left.path.localeCompare(right.path)).map((file) => ({
    ...file,
    mappingKeys: [...file.mappingKeys]
      .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right)))
      .map(canonicalMappingKeyObject),
  }))
  const manifest = {
    manifestSchemaVersion: CANONICAL_APPROVAL_MANIFEST_SCHEMA_VERSION,
    repositoryNamespace: CANONICAL_REPOSITORY_NAMESPACE,
    canonicalSchemaVersion: CANONICAL_MAPPING_SCHEMA_VERSION,
    createdAt,
    approvalSequence,
    previousManifestHash,
    files: sortedFiles,
    mappingKeys: sortedFiles.flatMap((file) => file.mappingKeys)
      .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right))),
    aggregateHash: '',
  }
  manifest.aggregateHash = computeManifestAggregateHash(manifest)
  return validateApprovalManifest(manifest)
}

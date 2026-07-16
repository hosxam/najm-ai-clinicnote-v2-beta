import fs from 'node:fs'
import path from 'node:path'
import {
  EXPANSION_DIR,
  getResearchPaths,
  getWorkflowPaths,
  listClinicalItems,
  readJson,
} from './common.mjs'
import {
  CANONICAL_APPROVAL_MANIFEST_FILE,
  CANONICAL_APPROVAL_SIGNATURE_FILE,
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_DOCUMENT_FIELDS,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_LOCK_PATH,
  CANONICAL_MAPPING_PUBLIC_KEY_PATH,
  CANONICAL_MAPPING_SCHEMA_VERSION,
  CANONICAL_RESOURCE_LIMITS,
  canonicalMappingKey,
  canonicalWorkflowItemKey,
} from './canonicalMappingContract.mjs'
import {
  canonicalMappingDocumentBytes,
  canonicalMappingKeyObject,
  deepFreeze,
  parseStrictJsonBytes,
  parseStrictJsonText,
  sha256Bytes,
} from './canonicalJson.mjs'
import {
  parseAndValidateApprovalManifest,
  verifyApprovalManifestSignature,
} from './canonicalMappingManifest.mjs'
import { validateExplicitGpMappings } from './batches/gpExplicitMappingContract.mjs'
import { validateActiveRegistrySource } from './sourceDateRegistryGate.mjs'

export { parseStrictJsonBytes, parseStrictJsonText }

const DOCUMENT_FIELD_SET = new Set(CANONICAL_MAPPING_DOCUMENT_FIELDS)
const MAPPING_FIELD_SET = new Set(CANONICAL_MAPPING_FIELDS)
const PLACEHOLDER_PATTERN = /\$\{|\{\{|\}\}|<[^>]+>|\[(?:placeholder|todo|tbd|[A-Z][A-Z0-9_-]{2,})\]|\b(?:placeholder|todo|tbd|undefined)\b/i
const WORKFLOW_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FIXED_CANONICAL_ENTRIES = new Set([
  '.gitkeep',
  CANONICAL_APPROVAL_MANIFEST_FILE,
  CANONICAL_APPROVAL_SIGNATURE_FILE,
])

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[canonical-mapping-store] ${label} must be a plain schema-owned object`)
  }
}

function validateExactFields(value, requiredFields, allowedFields, label) {
  plainObject(value, label)
  const ownKeys = Object.keys(value)
  const unknown = ownKeys.filter((field) => !allowedFields.has(field))
  const missing = requiredFields.filter((field) => !Object.hasOwn(value, field))
  if (unknown.length) throw new Error(`[canonical-mapping-store] ${label} has unexpected properties: ${unknown.sort().join(', ')}`)
  if (missing.length) throw new Error(`[canonical-mapping-store] ${label} is missing required properties: ${missing.join(', ')}`)
  if (Object.getOwnPropertySymbols(value).length) throw new Error(`[canonical-mapping-store] ${label} must not contain symbol properties`)
  for (const field of ownKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field)
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new Error(`[canonical-mapping-store] ${label}.${field} must be an own data property`)
    }
  }
}

function rejectPlaceholders(mapping) {
  for (const field of CANONICAL_MAPPING_FIELDS) {
    const value = mapping[field]
    if (typeof value === 'string' && PLACEHOLDER_PATTERN.test(value)) {
      throw new Error(`[canonical-mapping-store] ${mapping.workflowId}/${mapping.itemId}: ${field} contains a computed-looking placeholder`)
    }
  }
}

export function createCanonicalMappingContextFromDocument(document) {
  plainObject(document, 'synthetic context document')
  const workflows = document.workflows ?? []
  const sources = document.sources ?? []
  const research = document.research ?? []
  if (!Array.isArray(workflows) || !Array.isArray(sources) || !Array.isArray(research)) {
    throw new Error('[canonical-mapping-store] synthetic context arrays are required')
  }
  return {
    workflowsById: new Map(workflows.map((workflow) => [workflow.workflow_id, workflow])),
    itemsByWorkflowId: new Map(workflows.map((workflow) => [
      workflow.workflow_id,
      new Map(listClinicalItems(workflow).map((item) => [item.item_id, item])),
    ])),
    sourcesById: new Map(sources.map((source) => [source.source_id, source])),
    researchByWorkflowId: new Map(research.map((record) => [record.workflow_id, record])),
    reviewedSourceIds: new Set(research.flatMap((record) => record.exact_documents_opened ?? [])),
    reviewedSectionIds: new Set(research.flatMap((record) => record.exact_sections_reviewed ?? [])),
    unsupportedRows: Array.isArray(document.unsupportedRows) ? structuredClone(document.unsupportedRows) : [],
  }
}

export function createRepositoryCanonicalMappingContext() {
  const workflows = getWorkflowPaths().map(readJson)
  const research = getResearchPaths().map(readJson)
  const sources = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
  for (const source of sources) validateActiveRegistrySource(source)
  return createCanonicalMappingContextFromDocument({ workflows, research, sources })
}

export function validateCanonicalMappingRecords(mappings, context) {
  if (!Array.isArray(mappings)) throw new Error('[canonical-mapping-store] mappings must be an explicit array')
  if (mappings.length > CANONICAL_RESOURCE_LIMITS.maxTotalMappings) {
    throw new Error('[canonical-mapping-store] total mapping limit exceeded')
  }
  for (const mapping of mappings) {
    validateExactFields(mapping, CANONICAL_MAPPING_FIELDS, MAPPING_FIELD_SET, 'canonical mapping')
    rejectPlaceholders(mapping)
  }
  const validated = validateExplicitGpMappings(mappings, context)
  const seenKeys = new Set()
  const seenItems = new Set()
  for (const mapping of validated) {
    const research = context.researchByWorkflowId?.get(mapping.workflowId)
    if (!research) throw new Error(`[canonical-mapping-store] ${mapping.workflowId}: research record is required`)
    if (!(research.exact_documents_opened ?? []).includes(mapping.sourceId)) {
      throw new Error(`[canonical-mapping-store] ${canonicalMappingKey(mapping)}: source was not opened for this workflow`)
    }
    if (!(research.exact_sections_reviewed ?? []).includes(mapping.sectionId)) {
      throw new Error(`[canonical-mapping-store] ${canonicalMappingKey(mapping)}: section was not reviewed for this workflow`)
    }
    const key = canonicalMappingKey(mapping)
    const itemKey = canonicalWorkflowItemKey(mapping)
    if (seenKeys.has(key)) throw new Error(`[canonical-mapping-store] duplicate canonical mapping key ${key}`)
    if (seenItems.has(itemKey)) throw new Error(`[canonical-mapping-store] conflicting canonical mappings for workflow item ${itemKey}`)
    seenKeys.add(key)
    seenItems.add(itemKey)
  }
  return deepFreeze(validated.map((mapping) => structuredClone(mapping)))
}

export function validateCanonicalMappingDocument(document, {
  fileName = '<canonical-document>',
  context,
} = {}) {
  validateExactFields(document, CANONICAL_MAPPING_DOCUMENT_FIELDS, DOCUMENT_FIELD_SET, 'canonical mapping document')
  if (document.schemaVersion !== CANONICAL_MAPPING_SCHEMA_VERSION) {
    throw new Error(`[canonical-mapping-store] ${fileName}: schemaVersion must equal ${CANONICAL_MAPPING_SCHEMA_VERSION}`)
  }
  if (typeof document.workflowId !== 'string' || !WORKFLOW_ID_PATTERN.test(document.workflowId)) {
    throw new Error(`[canonical-mapping-store] ${fileName}: invalid workflowId`)
  }
  if (!Array.isArray(document.mappings)) throw new Error(`[canonical-mapping-store] ${fileName}: mappings must be an array`)
  if (document.mappings.length > CANONICAL_RESOURCE_LIMITS.maxMappingsPerWorkflow) {
    throw new Error(`[canonical-mapping-store] ${fileName}: workflow mapping limit exceeded`)
  }
  const expectedName = `${document.workflowId}.json`
  if (path.basename(fileName) !== '<canonical-document>' && path.basename(fileName) !== expectedName) {
    throw new Error(`[canonical-mapping-store] ${fileName}: filename must equal ${expectedName}`)
  }
  if (document.mappings.some((mapping) => mapping?.workflowId !== document.workflowId)) {
    throw new Error(`[canonical-mapping-store] ${fileName}: every mapping workflowId must match the document workflowId`)
  }
  const validated = validateCanonicalMappingRecords(document.mappings, context)
  return deepFreeze({
    schemaVersion: document.schemaVersion,
    workflowId: document.workflowId,
    mappings: validated.map((mapping) => structuredClone(mapping)),
  })
}

function resolvedInside(root, candidate) {
  const relative = path.relative(root, candidate)
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)
}

function assertCanonicalRoot(directory, expectedDirectory, allowTestDirectory, allowTransactionLock) {
  const resolvedDirectory = path.resolve(directory)
  const resolvedExpected = path.resolve(expectedDirectory)
  if (resolvedDirectory !== path.resolve(CANONICAL_MAPPING_DIRECTORY) && !allowTestDirectory) {
    throw new Error('[canonical-mapping-store] noncanonical directory is permitted only for isolated tests')
  }
  if (fs.existsSync(`${resolvedDirectory}.lock`) && !allowTransactionLock) {
    throw new Error('[canonical-mapping-store] canonical transaction lock is present; active state is unavailable')
  }
  let rootStat
  try {
    rootStat = fs.lstatSync(resolvedDirectory)
  } catch (error) {
    throw new Error(`[canonical-mapping-store] canonical directory is unavailable: ${error.message}`)
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error('[canonical-mapping-store] canonical root must be a normal directory, not a link or reparse-point substitute')
  }
  const realDirectory = fs.realpathSync.native(resolvedDirectory)
  const realExpected = fs.realpathSync.native(resolvedExpected)
  if (path.normalize(realDirectory) !== path.normalize(realExpected)) {
    throw new Error('[canonical-mapping-store] canonical root real path does not match the expected repository path')
  }
  return { resolvedDirectory, realDirectory }
}

function statIdentity(stat) {
  return [
    stat.dev,
    stat.ino,
    stat.size,
    stat.nlink,
    stat.mtimeNs ?? BigInt(Math.trunc(Number(stat.mtimeMs) * 1e6)),
    stat.ctimeNs ?? BigInt(Math.trunc(Number(stat.ctimeMs) * 1e6)),
  ].map(String).join(':')
}

export function readStableRegularFile(filePath, {
  rootDirectory,
  maxBytes,
  label = filePath,
} = {}) {
  const resolvedPath = path.resolve(filePath)
  const resolvedRoot = path.resolve(rootDirectory ?? path.dirname(resolvedPath))
  if (resolvedPath !== resolvedRoot && !resolvedInside(resolvedRoot, resolvedPath)) {
    throw new Error(`[canonical-mapping-store] ${label}: path escapes expected root`)
  }
  const parentReal = fs.realpathSync.native(path.dirname(resolvedPath))
  const rootReal = fs.realpathSync.native(resolvedRoot)
  if (path.normalize(parentReal) !== path.normalize(rootReal)
    && !resolvedInside(path.normalize(rootReal), path.normalize(parentReal))) {
    throw new Error(`[canonical-mapping-store] ${label}: parent real path escapes expected root`)
  }
  const pathStat = fs.lstatSync(resolvedPath, { bigint: true })
  if (pathStat.isSymbolicLink() || !pathStat.isFile()) {
    throw new Error(`[canonical-mapping-store] ${label}: expected a normal regular file`)
  }
  if (pathStat.nlink !== 1n) throw new Error(`[canonical-mapping-store] ${label}: hard-linked files are prohibited`)
  if (pathStat.size > BigInt(maxBytes)) throw new Error(`[canonical-mapping-store] ${label}: file exceeds ${maxBytes} bytes`)
  const realPath = fs.realpathSync.native(resolvedPath)
  if (path.normalize(realPath) !== path.normalize(resolvedPath)) {
    throw new Error(`[canonical-mapping-store] ${label}: file real path mismatch`)
  }
  const noFollow = fs.constants.O_NOFOLLOW ?? 0
  const descriptor = fs.openSync(resolvedPath, fs.constants.O_RDONLY | noFollow)
  try {
    const before = fs.fstatSync(descriptor, { bigint: true })
    if (!before.isFile() || before.nlink !== 1n || before.size > BigInt(maxBytes)) {
      throw new Error(`[canonical-mapping-store] ${label}: opened file identity is unsafe`)
    }
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor, { bigint: true })
    if (statIdentity(before) !== statIdentity(after) || bytes.length !== Number(after.size)) {
      throw new Error(`[canonical-mapping-store] ${label}: file changed during verified read`)
    }
    return bytes
  } finally {
    fs.closeSync(descriptor)
  }
}

function readPublicKey(publicKeyPath) {
  const resolved = path.resolve(publicKeyPath)
  return readStableRegularFile(resolved, {
    rootDirectory: path.dirname(resolved),
    maxBytes: 16 * 1024,
    label: 'canonical approval public key',
  })
}

function validateApprovalCheckpoint(manifest, manifestHash, approvalState) {
  if (!approvalState) return
  if (!Number.isInteger(approvalState.approvalSequence) || !/^[a-f0-9]{64}$/.test(approvalState.manifestHash ?? '')) {
    throw new Error('[canonical-mapping-store] approval checkpoint is invalid')
  }
  if (manifest.approvalSequence < approvalState.approvalSequence) {
    throw new Error('[canonical-mapping-store] approval-sequence rollback detected')
  }
  if (manifest.approvalSequence === approvalState.approvalSequence && manifestHash !== approvalState.manifestHash) {
    throw new Error('[canonical-mapping-store] approval checkpoint hash mismatch')
  }
  if (manifest.approvalSequence === approvalState.approvalSequence + 1
    && manifest.previousManifestHash !== approvalState.manifestHash) {
    throw new Error('[canonical-mapping-store] previous-manifest linkage mismatch')
  }
  if (manifest.approvalSequence > approvalState.approvalSequence + 1) {
    throw new Error('[canonical-mapping-store] approval sequence skipped checkpoint state')
  }
}

function readApprovalCheckpoint(approvalStatePath) {
  if (!approvalStatePath) return null
  const resolved = path.resolve(approvalStatePath)
  const bytes = readStableRegularFile(resolved, {
    rootDirectory: path.dirname(resolved),
    maxBytes: 4096,
    label: 'canonical approval checkpoint',
  })
  const checkpoint = parseStrictJsonBytes(bytes, { fileName: resolved, maxBytes: 4096 })
  const keys = Object.keys(checkpoint).sort()
  if (JSON.stringify(keys) !== JSON.stringify(['aggregateHash', 'approvalSequence', 'manifestHash'].sort())
    || !Number.isInteger(checkpoint.approvalSequence)
    || !/^[a-f0-9]{64}$/.test(checkpoint.manifestHash ?? '')
    || !/^[a-f0-9]{64}$/.test(checkpoint.aggregateHash ?? '')) {
    throw new Error('[canonical-mapping-store] approval checkpoint file is invalid')
  }
  return checkpoint
}

function canonicalDirectoryEntries(resolvedDirectory) {
  const entries = fs.readdirSync(resolvedDirectory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
  const unexpected = []
  const caseNames = new Set()
  for (const entry of entries) {
    const lower = entry.name.toLowerCase()
    if (caseNames.has(lower)) unexpected.push(`${entry.name} (case collision)`)
    caseNames.add(lower)
    if (!entry.isFile()) unexpected.push(entry.name)
    else if (FIXED_CANONICAL_ENTRIES.has(entry.name)) continue
    else if (!WORKFLOW_ID_PATTERN.test(entry.name.slice(0, -5)) || !entry.name.endsWith('.json')) unexpected.push(entry.name)
  }
  if (unexpected.length) {
    throw new Error(`[canonical-mapping-store] canonical directory contains noncanonical entries: ${unexpected.join(', ')}`)
  }
  return entries.map((entry) => entry.name)
}

function readApprovalEnvelope({
  directory,
  expectedDirectory,
  publicKeyPath,
  allowTestDirectory,
  allowTransactionLock,
  approvalState,
  approvalStatePath,
}) {
  const { resolvedDirectory } = assertCanonicalRoot(
    directory,
    expectedDirectory,
    allowTestDirectory,
    allowTransactionLock,
  )
  const entries = canonicalDirectoryEntries(resolvedDirectory)
  if (!entries.includes(CANONICAL_APPROVAL_MANIFEST_FILE)) throw new Error('[canonical-mapping-store] signed approval manifest is missing')
  if (!entries.includes(CANONICAL_APPROVAL_SIGNATURE_FILE)) throw new Error('[canonical-mapping-store] detached approval signature is missing')
  const manifestPath = path.join(resolvedDirectory, CANONICAL_APPROVAL_MANIFEST_FILE)
  const signaturePath = path.join(resolvedDirectory, CANONICAL_APPROVAL_SIGNATURE_FILE)
  const manifestBytes = readStableRegularFile(manifestPath, {
    rootDirectory: resolvedDirectory,
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxManifestBytes,
    label: CANONICAL_APPROVAL_MANIFEST_FILE,
  })
  const signatureBytes = readStableRegularFile(signaturePath, {
    rootDirectory: resolvedDirectory,
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxSignatureBytes,
    label: CANONICAL_APPROVAL_SIGNATURE_FILE,
  })
  const manifest = parseAndValidateApprovalManifest(manifestBytes, manifestPath)
  verifyApprovalManifestSignature(manifestBytes, signatureBytes, readPublicKey(publicKeyPath))
  const manifestHash = sha256Bytes(manifestBytes)
  validateApprovalCheckpoint(manifest, manifestHash, approvalState ?? readApprovalCheckpoint(approvalStatePath))
  return { resolvedDirectory, entries, manifest, manifestBytes, manifestHash, signatureBytes }
}

export function inspectSignedApprovalManifest({
  directory = CANONICAL_MAPPING_DIRECTORY,
  expectedDirectory = directory,
  publicKeyPath = CANONICAL_MAPPING_PUBLIC_KEY_PATH,
  allowTestDirectory = false,
  allowTransactionLock = false,
  approvalState,
  approvalStatePath,
} = {}) {
  const envelope = readApprovalEnvelope({
    directory,
    expectedDirectory,
    publicKeyPath,
    allowTestDirectory,
    allowTransactionLock,
    approvalState,
    approvalStatePath,
  })
  return deepFreeze({
    manifest: structuredClone(envelope.manifest),
    manifestHash: envelope.manifestHash,
    signatureVerified: true,
  })
}

export function readCanonicalMappingDocumentBytes(rawBytes, filePath, { context } = {}) {
  const parsed = parseStrictJsonBytes(rawBytes, {
    fileName: filePath,
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes,
  })
  const document = validateCanonicalMappingDocument(parsed, { fileName: filePath, context })
  const canonicalBytes = canonicalMappingDocumentBytes(document)
  if (!Buffer.from(rawBytes).equals(canonicalBytes)) {
    throw new Error(`[canonical-mapping-store] ${filePath}: canonical file bytes are not deterministic`)
  }
  return document
}

export function readCanonicalMappingDocument(filePath, { context } = {}) {
  const rawBytes = readStableRegularFile(filePath, {
    rootDirectory: path.dirname(filePath),
    maxBytes: CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes,
    label: filePath,
  })
  return readCanonicalMappingDocumentBytes(rawBytes, filePath, { context })
}

export function loadSignedCanonicalState({
  directory = CANONICAL_MAPPING_DIRECTORY,
  expectedDirectory = directory,
  publicKeyPath = CANONICAL_MAPPING_PUBLIC_KEY_PATH,
  context = createRepositoryCanonicalMappingContext(),
  allowTestDirectory = false,
  allowTransactionLock = false,
  approvalState,
  approvalStatePath,
} = {}) {
  const envelope = readApprovalEnvelope({
    directory,
    expectedDirectory,
    publicKeyPath,
    allowTestDirectory,
    allowTransactionLock,
    approvalState,
    approvalStatePath,
  })
  const expectedNames = new Set(envelope.manifest.files.map((file) => file.path))
  const actualNames = envelope.entries.filter((name) => name.endsWith('.json') && name !== CANONICAL_APPROVAL_MANIFEST_FILE)
  const unlisted = actualNames.filter((name) => !expectedNames.has(name))
  const missing = [...expectedNames].filter((name) => !actualNames.includes(name))
  if (unlisted.length || missing.length) {
    throw new Error(`[canonical-mapping-store] signed manifest file mismatch: unlisted=${unlisted.join(',')} missing=${missing.join(',')}`)
  }
  const documents = []
  const allMappings = []
  for (const approvedFile of envelope.manifest.files) {
    const filePath = path.join(envelope.resolvedDirectory, approvedFile.path)
    const rawBytes = readStableRegularFile(filePath, {
      rootDirectory: envelope.resolvedDirectory,
      maxBytes: CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes,
      label: approvedFile.path,
    })
    if (rawBytes.length !== approvedFile.byteLength) throw new Error(`[canonical-mapping-store] ${approvedFile.path}: byte length mismatch`)
    if (sha256Bytes(rawBytes) !== approvedFile.sha256) throw new Error(`[canonical-mapping-store] ${approvedFile.path}: SHA-256 mismatch`)
    const document = readCanonicalMappingDocumentBytes(rawBytes, filePath, { context })
    if (document.workflowId !== approvedFile.workflowId) throw new Error(`[canonical-mapping-store] ${approvedFile.path}: workflow mismatch`)
    if (document.mappings.length !== approvedFile.mappingCount) throw new Error(`[canonical-mapping-store] ${approvedFile.path}: mapping count mismatch`)
    const documentKeys = document.mappings.map(canonicalMappingKeyObject)
    if (JSON.stringify(documentKeys) !== JSON.stringify(approvedFile.mappingKeys)) {
      throw new Error(`[canonical-mapping-store] ${approvedFile.path}: exact mapping-key mismatch`)
    }
    documents.push(document)
    allMappings.push(...document.mappings)
  }
  const validatedMappings = validateCanonicalMappingRecords(allMappings, context)
  const exactKeys = validatedMappings.map(canonicalMappingKeyObject)
  if (JSON.stringify(exactKeys) !== JSON.stringify(envelope.manifest.mappingKeys)) {
    throw new Error('[canonical-mapping-store] aggregate exact mapping keys do not match signed manifest')
  }
  return deepFreeze({
    manifest: structuredClone(envelope.manifest),
    manifestHash: envelope.manifestHash,
    signatureVerified: true,
    documents: documents.map((document) => structuredClone(document)),
    mappings: validatedMappings.map((mapping) => structuredClone(mapping)),
    mappingKeys: exactKeys.map((entry) => structuredClone(entry)),
    aggregateHash: envelope.manifest.aggregateHash,
  })
}

export function loadCanonicalMappingDocuments(options = {}) {
  return loadSignedCanonicalState(options).documents
}

export function loadCanonicalMappings(options = {}) {
  return loadSignedCanonicalState(options).mappings
}

export function canonicalProductionStorePaths() {
  return Object.freeze({
    directory: CANONICAL_MAPPING_DIRECTORY,
    lockPath: CANONICAL_MAPPING_LOCK_PATH,
    publicKeyPath: CANONICAL_MAPPING_PUBLIC_KEY_PATH,
  })
}

import { createHash } from 'node:crypto'
import ts from 'typescript'
import {
  CANONICAL_APPROVAL_FILE_FIELDS,
  CANONICAL_APPROVAL_MANIFEST_FIELDS,
  CANONICAL_MAPPING_DOCUMENT_FIELDS,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_KEY_FIELDS,
  CANONICAL_RESOURCE_LIMITS,
  canonicalMappingKey,
} from './canonicalMappingContract.mjs'

const FORBIDDEN_PROPERTY_NAMES = new Set(['__proto__', 'constructor', 'prototype'])

function strictUtf8Decoder() {
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false })
}

function parserFileName(fileName) {
  return String(fileName).replaceAll('\\', '/')
}

function preflightJsonDepth(sourceText, fileName, maxDepth) {
  let depth = 0
  let inString = false
  let escaped = false
  for (let index = 0; index < sourceText.length; index += 1) {
    const character = sourceText[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character === '{' || character === '[') {
      depth += 1
      if (depth > maxDepth) throw new Error(`[canonical-json] ${fileName}: JSON nesting exceeds ${maxDepth}`)
    } else if (character === '}' || character === ']') {
      depth -= 1
      if (depth < 0) throw new Error(`[canonical-json] ${fileName}: malformed JSON nesting`)
    }
  }
  if (depth !== 0 || inString) throw new Error(`[canonical-json] ${fileName}: malformed JSON structure`)
}

function propertyName(property) {
  if (!property?.name) return null
  if (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name)) {
    return property.name.text
  }
  return null
}

function assertNoDuplicateRawProperties(sourceFile, fileName) {
  const duplicates = []
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const exact = new Set()
      const normalized = new Map()
      for (const property of node.properties) {
        const name = propertyName(property)
        if (name === null) continue
        const normalizedName = name.normalize('NFC')
        if (exact.has(name)) duplicates.push(name)
        if (normalized.has(normalizedName) && normalized.get(normalizedName) !== name) {
          duplicates.push(`${normalized.get(normalizedName)}~${name}`)
        }
        exact.add(name)
        normalized.set(normalizedName, name)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (duplicates.length) {
    throw new Error(`[canonical-json] ${fileName}: duplicate or canonically equivalent JSON properties: ${[...new Set(duplicates)].sort().join(', ')}`)
  }
}

function validateParsedResources(value, fileName, depth = 0) {
  if (depth > CANONICAL_RESOURCE_LIMITS.maxJsonDepth) {
    throw new Error(`[canonical-json] ${fileName}: parsed JSON nesting exceeds ${CANONICAL_RESOURCE_LIMITS.maxJsonDepth}`)
  }
  if (typeof value === 'string') {
    if (value.length > CANONICAL_RESOURCE_LIMITS.maxStringLength) {
      throw new Error(`[canonical-json] ${fileName}: string exceeds ${CANONICAL_RESOURCE_LIMITS.maxStringLength} characters`)
    }
    return
  }
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    if (value.length > CANONICAL_RESOURCE_LIMITS.maxArrayLength) {
      throw new Error(`[canonical-json] ${fileName}: array exceeds ${CANONICAL_RESOURCE_LIMITS.maxArrayLength} entries`)
    }
    for (const child of value) validateParsedResources(child, fileName, depth + 1)
    return
  }
  for (const [name, child] of Object.entries(value)) {
    if (FORBIDDEN_PROPERTY_NAMES.has(name)) {
      throw new Error(`[canonical-json] ${fileName}: forbidden prototype-related property ${name}`)
    }
    validateParsedResources(child, fileName, depth + 1)
  }
}

export function decodeStrictUtf8(rawBytes, fileName = '<raw-json>') {
  if (!Buffer.isBuffer(rawBytes) && !(rawBytes instanceof Uint8Array)) {
    throw new Error(`[canonical-json] ${fileName}: raw input must be bytes`)
  }
  const bytes = Buffer.from(rawBytes)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    throw new Error(`[canonical-json] ${fileName}: UTF-8 BOM is prohibited`)
  }
  try {
    return strictUtf8Decoder().decode(bytes)
  } catch {
    throw new Error(`[canonical-json] ${fileName}: malformed UTF-8`)
  }
}

export function parseStrictJsonBytes(rawBytes, {
  fileName = '<raw-json>',
  maxBytes = CANONICAL_RESOURCE_LIMITS.maxInputBytes,
} = {}) {
  const bytes = Buffer.from(rawBytes)
  if (bytes.length > maxBytes) throw new Error(`[canonical-json] ${fileName}: input exceeds ${maxBytes} bytes`)
  const sourceText = decodeStrictUtf8(bytes, fileName)
  preflightJsonDepth(sourceText, fileName, CANONICAL_RESOURCE_LIMITS.maxJsonDepth)
  const sourceFile = ts.parseJsonText(parserFileName(fileName), sourceText)
  if (sourceFile.parseDiagnostics.length) {
    const details = sourceFile.parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '))
    throw new Error(`[canonical-json] ${fileName}: malformed strict JSON: ${details.join('; ')}`)
  }
  assertNoDuplicateRawProperties(sourceFile, fileName)
  let parsed
  try {
    parsed = JSON.parse(sourceText)
  } catch (error) {
    throw new Error(`[canonical-json] ${fileName}: malformed strict JSON: ${error.message}`)
  }
  validateParsedResources(parsed, fileName)
  return parsed
}

export function parseStrictJsonText(sourceText, fileName = '<raw-json>', options = {}) {
  if (typeof sourceText !== 'string') throw new Error(`[canonical-json] ${fileName}: JSON source must be text`)
  return parseStrictJsonBytes(Buffer.from(sourceText, 'utf8'), { fileName, ...options })
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

export function projectFields(value, fields) {
  return Object.fromEntries(fields.map((field) => [field, value[field]]))
}

export function canonicalMappingObject(mapping) {
  return projectFields(mapping, CANONICAL_MAPPING_FIELDS)
}

export function canonicalMappingKeyObject(mapping) {
  return projectFields(mapping, CANONICAL_MAPPING_KEY_FIELDS)
}

export function sortedMappingKeyObjects(mappings) {
  return mappings
    .map(canonicalMappingKeyObject)
    .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right)))
}

export function canonicalMappingDocumentObject(document) {
  return projectFields({
    schemaVersion: document.schemaVersion,
    workflowId: document.workflowId,
    mappings: [...document.mappings]
      .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right)))
      .map(canonicalMappingObject),
  }, CANONICAL_MAPPING_DOCUMENT_FIELDS)
}

function canonicalApprovalFileObject(file) {
  return projectFields({
    ...file,
    mappingKeys: file.mappingKeys.map(canonicalMappingKeyObject),
  }, CANONICAL_APPROVAL_FILE_FIELDS)
}

export function canonicalApprovalManifestObject(manifest) {
  return projectFields({
    ...manifest,
    files: manifest.files.map(canonicalApprovalFileObject),
    mappingKeys: manifest.mappingKeys.map(canonicalMappingKeyObject),
  }, CANONICAL_APPROVAL_MANIFEST_FIELDS)
}

export function canonicalJsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function canonicalMappingDocumentBytes(document) {
  return canonicalJsonBytes(canonicalMappingDocumentObject(document))
}

export function canonicalApprovalManifestBytes(manifest) {
  return canonicalJsonBytes(canonicalApprovalManifestObject(manifest))
}

export function canonicalManifestAggregatePayload(manifest) {
  return {
    repositoryNamespace: manifest.repositoryNamespace,
    manifestSchemaVersion: manifest.manifestSchemaVersion,
    canonicalSchemaVersion: manifest.canonicalSchemaVersion,
    approvalSequence: manifest.approvalSequence,
    previousManifestHash: manifest.previousManifestHash,
    files: manifest.files.map(canonicalApprovalFileObject),
    mappingKeys: manifest.mappingKeys.map(canonicalMappingKeyObject),
  }
}

export function computeManifestAggregateHash(manifest) {
  return sha256Bytes(canonicalJsonBytes(canonicalManifestAggregatePayload(manifest)))
}

export function computeMappingKeySetHash(mappingKeys) {
  const normalized = [...mappingKeys].sort((left, right) => left.localeCompare(right))
  return sha256Bytes(Buffer.from(`${JSON.stringify(normalized)}\n`, 'utf8'))
}

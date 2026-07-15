import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import {
  EXPANSION_DIR,
  getResearchPaths,
  getWorkflowPaths,
  listClinicalItems,
  readJson,
} from './common.mjs'
import {
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_DOCUMENT_FIELDS,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_SCHEMA_VERSION,
  canonicalMappingKey,
  canonicalWorkflowItemKey,
} from './canonicalMappingContract.mjs'
import { validateExplicitGpMappings } from './batches/gpExplicitMappingContract.mjs'

const DOCUMENT_FIELD_SET = new Set(CANONICAL_MAPPING_DOCUMENT_FIELDS)
const MAPPING_FIELD_SET = new Set(CANONICAL_MAPPING_FIELDS)
const PLACEHOLDER_PATTERN = /\$\{|\{\{|\}\}|<[^>]+>|\[(?:placeholder|todo|tbd|[A-Z][A-Z0-9_-]{2,})\]|\b(?:placeholder|todo|tbd|undefined)\b/i
const WORKFLOW_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[canonical-mapping-store] ${label} must be a plain schema-owned object`)
  }
}

function propertyName(property) {
  if (!property?.name) return null
  if (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) || ts.isNumericLiteral(property.name)) {
    return property.name.text
  }
  return null
}

export function parseStrictJsonText(sourceText, fileName = '<canonical-json>') {
  if (typeof sourceText !== 'string') throw new Error(`[canonical-mapping-store] ${fileName}: JSON source must be text`)
  const sourceFile = ts.parseJsonText(fileName, sourceText)
  if (sourceFile.parseDiagnostics.length) {
    const details = sourceFile.parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '))
    throw new Error(`[canonical-mapping-store] ${fileName}: malformed strict JSON: ${details.join('; ')}`)
  }
  const duplicateProperties = []
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const seen = new Set()
      for (const property of node.properties) {
        const name = propertyName(property)
        if (name !== null && seen.has(name)) duplicateProperties.push(name)
        if (name !== null) seen.add(name)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (duplicateProperties.length) {
    throw new Error(`[canonical-mapping-store] ${fileName}: duplicate JSON properties: ${[...new Set(duplicateProperties)].sort().join(', ')}`)
  }
  try {
    return JSON.parse(sourceText)
  } catch (error) {
    throw new Error(`[canonical-mapping-store] ${fileName}: malformed strict JSON: ${error.message}`)
  }
}

export function createRepositoryCanonicalMappingContext() {
  const workflows = getWorkflowPaths().map(readJson)
  const research = getResearchPaths().map(readJson)
  const sources = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
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
}

function rejectPlaceholders(mapping) {
  for (const field of CANONICAL_MAPPING_FIELDS) {
    const value = mapping[field]
    if (typeof value === 'string' && PLACEHOLDER_PATTERN.test(value)) {
      throw new Error(`[canonical-mapping-store] ${mapping.workflowId}/${mapping.itemId}: ${field} contains a computed-looking placeholder`)
    }
  }
}

export function validateCanonicalMappingRecords(mappings, context) {
  if (!Array.isArray(mappings)) throw new Error('[canonical-mapping-store] mappings must be an explicit array')
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

export function readCanonicalMappingDocument(filePath, { context } = {}) {
  const document = parseStrictJsonText(fs.readFileSync(filePath, 'utf8'), filePath)
  return validateCanonicalMappingDocument(document, { fileName: filePath, context })
}

export function loadCanonicalMappingDocuments({
  directory = CANONICAL_MAPPING_DIRECTORY,
  context = createRepositoryCanonicalMappingContext(),
} = {}) {
  if (!fs.existsSync(directory)) throw new Error(`[canonical-mapping-store] canonical directory does not exist: ${directory}`)
  const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))
  const unexpected = entries.filter((entry) => entry.name !== '.gitkeep' && (!entry.isFile() || !entry.name.endsWith('.json')))
  if (unexpected.length) {
    throw new Error(`[canonical-mapping-store] canonical directory contains noncanonical entries: ${unexpected.map((entry) => entry.name).join(', ')}`)
  }
  const documents = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => readCanonicalMappingDocument(path.join(directory, entry.name), { context }))
  const workflowIds = documents.map((document) => document.workflowId)
  if (workflowIds.length !== new Set(workflowIds).size) throw new Error('[canonical-mapping-store] duplicate workflow mapping documents')
  validateCanonicalMappingRecords(documents.flatMap((document) => document.mappings), context)
  return deepFreeze(documents.map((document) => structuredClone(document)))
}

export function loadCanonicalMappings(options = {}) {
  const documents = loadCanonicalMappingDocuments(options)
  const mappings = documents
    .flatMap((document) => document.mappings)
    .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right)))
  return deepFreeze(mappings.map((mapping) => structuredClone(mapping)))
}

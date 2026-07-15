import path from 'node:path'
import { EXPANSION_DIR } from './common.mjs'

export const CANONICAL_MAPPING_SCHEMA_VERSION = '1.0.0'
export const CANONICAL_MAPPING_VERSION = '1.0.0'
export const CANONICAL_APPROVAL_MANIFEST_SCHEMA_VERSION = '1.0.0'
export const CANONICAL_REPOSITORY_NAMESPACE = 'najm-ai-clinicnote-v2/source-first-canonical-mappings'
export const CANONICAL_GENESIS_MANIFEST_HASH = '0'.repeat(64)
export const CANONICAL_MAPPING_DIRECTORY = path.join(EXPANSION_DIR, 'canonical-mappings')
export const CANONICAL_APPROVAL_MANIFEST_FILE = 'APPROVED_MANIFEST.json'
export const CANONICAL_APPROVAL_SIGNATURE_FILE = 'APPROVED_MANIFEST.sig'
export const CANONICAL_APPROVAL_MANIFEST_PATH = path.join(
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_APPROVAL_MANIFEST_FILE,
)
export const CANONICAL_APPROVAL_SIGNATURE_PATH = path.join(
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_APPROVAL_SIGNATURE_FILE,
)
export const CANONICAL_MAPPING_PUBLIC_KEY_PATH = path.join(
  EXPANSION_DIR,
  'config',
  'CANONICAL_MAPPING_APPROVAL_PUBLIC_KEY.pem',
)
export const CANONICAL_MAPPING_LOCK_PATH = `${CANONICAL_MAPPING_DIRECTORY}.lock`
export const CANONICAL_MAPPING_SCHEMA_PATH = path.join(
  EXPANSION_DIR,
  'schema',
  'CANONICAL_MAPPING_FILE_SCHEMA.json',
)
export const CANONICAL_APPROVAL_MANIFEST_SCHEMA_PATH = path.join(
  EXPANSION_DIR,
  'schema',
  'CANONICAL_MAPPING_APPROVAL_MANIFEST_SCHEMA.json',
)
export const CANDIDATE_MAPPING_PROPOSAL_DIRECTORY = path.join(EXPANSION_DIR, 'candidate-mapping-proposals')
export const CANDIDATE_MAPPING_PROPOSAL_SCHEMA_PATH = path.join(
  EXPANSION_DIR,
  'schema',
  'CANDIDATE_MAPPING_PROPOSAL_SCHEMA.json',
)
export const CANONICAL_MAPPING_DOCUMENT_FIELDS = Object.freeze([
  'schemaVersion',
  'workflowId',
  'mappings',
])
export const CANONICAL_MAPPING_FIELDS = Object.freeze([
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
  'sourceHash',
  'sectionHash',
  'evidenceRelationship',
  'populationApplicability',
  'settingApplicability',
  'jurisdictionApplicability',
  'uaeApplicability',
  'applicabilityRationale',
  'supportStatus',
  'origin',
  'mappingVersion',
])
export const CANONICAL_MAPPING_KEY_FIELDS = Object.freeze([
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
])
export const CANONICAL_APPROVAL_MANIFEST_FIELDS = Object.freeze([
  'manifestSchemaVersion',
  'repositoryNamespace',
  'canonicalSchemaVersion',
  'createdAt',
  'approvalSequence',
  'previousManifestHash',
  'files',
  'mappingKeys',
  'aggregateHash',
])
export const CANONICAL_APPROVAL_FILE_FIELDS = Object.freeze([
  'path',
  'workflowId',
  'sha256',
  'byteLength',
  'mappingCount',
  'mappingKeys',
])
export const CANONICAL_RESOURCE_LIMITS = Object.freeze({
  maxInputBytes: 64 * 1024,
  maxCanonicalFileBytes: 32 * 1024 * 1024,
  maxManifestBytes: 64 * 1024 * 1024,
  maxSignatureBytes: 1024,
  maxMappingsPerWorkflow: 5000,
  maxTotalMappings: 100000,
  maxCanonicalFiles: 1500,
  maxIdentifierLength: 256,
  maxStringLength: 8192,
  maxEvidenceRelationshipLength: 4096,
  maxApplicabilityLength: 4096,
  maxRationaleLength: 4096,
  maxJsonDepth: 20,
  maxArrayLength: 100000,
})

export function canonicalMappingKey(mapping) {
  return [mapping.workflowId, mapping.itemId, mapping.sourceId, mapping.sectionId].join('\u0000')
}

export function canonicalWorkflowItemKey(mapping) {
  return [mapping.workflowId, mapping.itemId].join('\u0000')
}

export function canonicalMappingFileName(workflowId) {
  return `${workflowId}.json`
}

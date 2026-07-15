import path from 'node:path'
import { EXPANSION_DIR } from './common.mjs'

export const CANONICAL_MAPPING_SCHEMA_VERSION = '1.0.0'
export const CANONICAL_MAPPING_VERSION = '1.0.0'
export const CANONICAL_MAPPING_DIRECTORY = path.join(EXPANSION_DIR, 'canonical-mappings')
export const CANONICAL_MAPPING_SCHEMA_PATH = path.join(
  EXPANSION_DIR,
  'schema',
  'CANONICAL_MAPPING_FILE_SCHEMA.json',
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

export function canonicalMappingKey(mapping) {
  return [mapping.workflowId, mapping.itemId, mapping.sourceId, mapping.sectionId].join('\u0000')
}

export function canonicalWorkflowItemKey(mapping) {
  return [mapping.workflowId, mapping.itemId].join('\u0000')
}

import path from 'node:path'
import {
  EXPANSION_DIR,
  readJsonl,
} from './common.mjs'

export const CANONICAL_MAPPING_VERSION = '1.0.0'
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

export const CANONICAL_LEDGER_PATH = path.join(
  EXPANSION_DIR,
  'progress',
  'CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl',
)

export function canonicalMappingKey(mapping) {
  return [mapping.workflowId, mapping.itemId, mapping.sourceId, mapping.sectionId].join('\u0000')
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

export function readCanonicalMappings() {
  return deepFreeze(readJsonl(CANONICAL_LEDGER_PATH).map((mapping) => structuredClone(mapping)))
}

export function emitCanonicalMappings() {
  return readCanonicalMappings()
}

export function canonicalMappingsForWorkflow(workflowId) {
  return Object.freeze(emitCanonicalMappings().filter((mapping) => mapping.workflowId === workflowId))
}

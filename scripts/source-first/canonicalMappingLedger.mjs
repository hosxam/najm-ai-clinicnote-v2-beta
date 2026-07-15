import {
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_VERSION,
  canonicalMappingKey,
} from './canonicalMappingContract.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'

export {
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_VERSION,
  canonicalMappingKey,
}

export const CANONICAL_LEDGER_PATH = CANONICAL_MAPPING_DIRECTORY

export function readCanonicalMappings(options = {}) {
  return loadCanonicalMappings(options)
}

export function emitCanonicalMappings(options = {}) {
  return loadCanonicalMappings(options)
}

export function canonicalMappingsForWorkflow(workflowId, options = {}) {
  return Object.freeze(loadCanonicalMappings(options).filter((mapping) => mapping.workflowId === workflowId))
}

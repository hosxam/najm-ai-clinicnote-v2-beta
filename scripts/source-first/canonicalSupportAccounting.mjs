import { canonicalMappingKey, canonicalWorkflowItemKey } from './canonicalMappingContract.mjs'
import { deepFreeze } from './canonicalJson.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'

export function deriveCanonicalSupportAccounting(mappings) {
  const mappingKeys = mappings.map(canonicalMappingKey).sort((left, right) => left.localeCompare(right))
  const supportedItemKeys = [...new Set(mappings.map(canonicalWorkflowItemKey))].sort((left, right) => left.localeCompare(right))
  return deepFreeze({
    mappingCount: mappingKeys.length,
    supportedItemCount: supportedItemKeys.length,
    mappingKeys,
    supportedItemKeys,
  })
}

export function readCanonicalSupportAccounting(options = {}) {
  return deriveCanonicalSupportAccounting(loadCanonicalMappings(options))
}

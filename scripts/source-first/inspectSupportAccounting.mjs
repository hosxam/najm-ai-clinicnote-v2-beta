import { canonicalMappingRuntimeEnvironment } from './canonicalMappingEnvironment.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'
import { deriveCanonicalSupportAccounting } from './canonicalSupportAccounting.mjs'
import { mappingConsumerOutput, printMappingConsumerOutput } from './mappingConsumerOutput.mjs'

const environment = canonicalMappingRuntimeEnvironment()
const mappings = loadCanonicalMappings(environment)
const accounting = deriveCanonicalSupportAccounting(mappings)
printMappingConsumerOutput(mappingConsumerOutput('supportAccounting', accounting.mappingKeys, {
  supportedItemCount: accounting.supportedItemCount,
  supportedItemKeys: accounting.supportedItemKeys,
}))

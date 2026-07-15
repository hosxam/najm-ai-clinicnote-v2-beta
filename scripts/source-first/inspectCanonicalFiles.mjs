import { canonicalMappingKey } from './canonicalMappingContract.mjs'
import { canonicalMappingRuntimeEnvironment } from './canonicalMappingEnvironment.mjs'
import { loadSignedCanonicalState } from './canonicalMappingStore.mjs'
import { mappingConsumerOutput, printMappingConsumerOutput } from './mappingConsumerOutput.mjs'

const environment = canonicalMappingRuntimeEnvironment()
const state = loadSignedCanonicalState(environment)
printMappingConsumerOutput(mappingConsumerOutput('canonicalFiles', state.mappings.map(canonicalMappingKey), {
  manifestHash: state.manifestHash,
  aggregateHash: state.aggregateHash,
}))

import { canonicalMappingKey } from './canonicalMappingContract.mjs'
import { canonicalMappingRuntimeEnvironment } from './canonicalMappingEnvironment.mjs'
import { emitCanonicalMappings } from './canonicalMappingLedger.mjs'
import { mappingConsumerOutput, printMappingConsumerOutput } from './mappingConsumerOutput.mjs'

const environment = canonicalMappingRuntimeEnvironment()
const runtimeMappings = emitCanonicalMappings(environment)
printMappingConsumerOutput(mappingConsumerOutput('runtimeEmission', runtimeMappings.map(canonicalMappingKey)))

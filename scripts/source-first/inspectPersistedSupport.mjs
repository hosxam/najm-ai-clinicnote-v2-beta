import { canonicalMappingKey } from './canonicalMappingContract.mjs'
import { canonicalMappingRuntimeEnvironment } from './canonicalMappingEnvironment.mjs'
import { loadCanonicalMappingDocuments } from './canonicalMappingStore.mjs'
import { mappingConsumerOutput, printMappingConsumerOutput } from './mappingConsumerOutput.mjs'

const environment = canonicalMappingRuntimeEnvironment()
const mappings = loadCanonicalMappingDocuments(environment).flatMap((document) => document.mappings)
printMappingConsumerOutput(mappingConsumerOutput('persistedSupport', mappings.map(canonicalMappingKey)))

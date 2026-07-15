import { canonicalMappingKey } from './canonicalMappingContract.mjs'
import { canonicalMappingRuntimeEnvironment } from './canonicalMappingEnvironment.mjs'
import { inspectSignedApprovalManifest } from './canonicalMappingStore.mjs'
import { mappingConsumerOutput, printMappingConsumerOutput } from './mappingConsumerOutput.mjs'

const environment = canonicalMappingRuntimeEnvironment()
const state = inspectSignedApprovalManifest(environment)
printMappingConsumerOutput(mappingConsumerOutput('approvalManifest', state.manifest.mappingKeys.map(canonicalMappingKey), {
  manifestHash: state.manifestHash,
  aggregateHash: state.manifest.aggregateHash,
}))

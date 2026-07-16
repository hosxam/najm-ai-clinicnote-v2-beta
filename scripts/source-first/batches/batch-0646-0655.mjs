import path from 'node:path'
import { EXPANSION_DIR, readJson } from '../common.mjs'
import { gpExplicitWorkflowsForRange } from './gpBatchSupport.mjs'

const replayDiscovery = process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY === '1'
const ledger = replayDiscovery
  ? null
  : readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json',
  batch_id: 'source-first-0646-0655',
  sources: [],
  workflows: replayDiscovery ? [] : gpExplicitWorkflowsForRange(ledger, 646, 655),
}

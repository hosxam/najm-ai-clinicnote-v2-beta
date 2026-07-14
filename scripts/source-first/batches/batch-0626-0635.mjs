import { EXPANSION_DIR, readJson } from '../common.mjs'
import { gpExplicitWorkflowsForRange } from './gpBatchSupport.mjs'
import path from 'node:path'

const ledger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))

export default {
  batch_id: 'source-first-0626-0635',
  sources: [],
  workflows: gpExplicitWorkflowsForRange(ledger, 626, 635),
}

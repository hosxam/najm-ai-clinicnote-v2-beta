import path from 'node:path'
import { EXPANSION_DIR, readJson } from '../common.mjs'
import { gpExplicitWorkflowsForRange } from './gpBatchSupport.mjs'

const ledger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))

export default {
  batch_id: 'source-first-0636-0645',
  sources: [],
  workflows: gpExplicitWorkflowsForRange(ledger, 636, 645),
}

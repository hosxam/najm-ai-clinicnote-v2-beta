import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const root = process.cwd()
const run = (script, allowBlocked = false) => {
  try { execFileSync(process.execPath, [path.join(root, 'scripts/source-first', script)], { stdio: 'inherit' }) }
  catch (error) { if (!allowBlocked) throw error }
}
run('normaliseEvidencePacks.mjs')
run('calculateWorkflowReadiness.mjs')
run('reconstructWorkflowsFromEvidencePacks.mjs')
run('validateEvidencePackNormalisation.mjs')
run('validateWorkflowReadiness.mjs')
run('validateWorkflowEvidenceReconstruction.mjs')
const state = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
const result = { status: state.pending_count ? 'PARTIAL' : 'PASS', resolved: state.resolved_count, pending: state.pending_count, next_workflow: state.exact_next_workflow, readiness_counts: state.readiness_counts, output_fingerprint: state.output_fingerprint, required_next_action: state.pending_count ? 'Continue authoritative source expansion for NEEDS_PACK_EXPANSION workflows; reconstruct each newly ready workflow immediately.' : null }
console.log(JSON.stringify(result, null, 2))
if (!state.resolved_count && state.pending_count) { console.error('READY_WORKFLOW_RECONSTRUCTION_BROKEN'); process.exitCode = 2 }

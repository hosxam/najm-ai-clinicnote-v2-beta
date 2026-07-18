import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const root = process.cwd()
test('worker refuses successful no-progress exits and selects the first pending workflow', () => {
  const script = path.join(root, 'scripts/source-first/resolveGuidelineWorkflowCatalogue.mjs')
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  const diagnostic = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_BLOCK.json'), 'utf8'))
  assert.equal(diagnostic.result, 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS')
  assert.equal(diagnostic.selected_workflow, 'gp-fever-urti')
  assert.equal(diagnostic.resolved_before, diagnostic.resolved_after)
  assert.equal(diagnostic.state_fingerprint_before, diagnostic.state_fingerprint_after)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const root = process.cwd()
test('gap repair updates the family pack and advances the queue', () => {
  const script = path.join(root, 'scripts/source-first/resolveGuidelineWorkflowCatalogue.mjs')
  const state = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
  const repair = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/gap-repairs/gp-fever-urti.json'), 'utf8'))
  assert.equal(state.exact_next_workflow, 'gp-cough')
  assert.equal(state.reconstruction_totals.resolved, 453)
  assert.equal(repair.source_attempts[0].full_document_inspected, true)
  assert.ok(repair.sections_still_missing.length > 0)
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  const diagnostic = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_BLOCK.json'), 'utf8'))
  assert.equal(diagnostic.result, 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS')
  assert.equal(diagnostic.selected_workflow, 'gp-cough')
  assert.equal(diagnostic.resolved_before, diagnostic.resolved_after)
  assert.equal(diagnostic.state_fingerprint_before, diagnostic.state_fingerprint_after)
})

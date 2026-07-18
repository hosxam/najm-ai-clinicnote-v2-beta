import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const root = process.cwd()
test('incomplete gp-fever evidence is requeued and cannot be retired', () => {
  const script = path.join(root, 'scripts/source-first/resolveGuidelineWorkflowCatalogue.mjs')
  const state = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
  const repair = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/gap-repairs/gp-fever-urti.json'), 'utf8'))
  assert.equal(state.exact_next_workflow, 'gp-fever-urti')
  assert.equal(state.reconstruction_totals.resolved, 452)
  assert.equal(state.reconstruction_totals.pending, 1048)
  assert.equal(state.final_status_by_workflow['gp-fever-urti'], undefined)
  assert.equal(state.worker_states['gp-fever-urti'], 'evidence_gap_research_required')
  assert.deepEqual(repair.source_attempts.map((attempt) => attempt.source_id), [
    'dha-telehealth-common-cold-v2-2024',
    'dha-telehealth-fever-children-v2-2024',
    'dha-telehealth-cough-v2-2024'
  ])
  assert.ok(repair.source_attempts.every((attempt) => attempt.full_document_inspected))
  assert.equal(repair.intermediate_state, 'evidence_gap_research_required')
  assert.equal(repair.final_status, null)
  assert.ok(repair.sections_still_missing.length > 0)
  assert.equal(repair.pharmacological_management.applicable, false)
  const fingerprint = state.output_fingerprint
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 2)
  const diagnostic = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_BLOCK.json'), 'utf8'))
  assert.equal(diagnostic.result, 'GUIDELINE_RESOLUTION_WORKER_EVIDENCE_GAP_RESEARCH_REQUIRED')
  assert.equal(diagnostic.selected_workflow, 'gp-fever-urti')
  assert.equal(diagnostic.final_status_assigned, null)
  assert.equal(diagnostic.next_after, 'gp-fever-urti')
  assert.equal(diagnostic.state_fingerprint_before, fingerprint)
  assert.equal(diagnostic.state_fingerprint_after, fingerprint)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const statePath = path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_STATE.json')
const repairPath = path.join(root, 'clinical-expansion-v2/full-source-reconstruction/gap-repairs/gp-fever-urti.json')

test('true-completion audit reopens workflows with critical gaps instead of exposing them', () => {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  const repair = JSON.parse(fs.readFileSync(repairPath, 'utf8'))
  assert.equal(state.reconstruction_totals.resolved, 0)
  assert.equal(state.reconstruction_totals.pending, 1500)
  assert.equal(state.exact_next_workflow, 'gp-fever-urti')
  assert.equal(state.final_status_by_workflow['gp-fever-urti'], undefined)
  assert.equal(state.worker_states['gp-fever-urti'], 'evidence_gap_research_required')
  assert.equal(repair.source_attempts.length, 3)
  assert.ok(repair.source_attempts.every((attempt) => attempt.full_document_inspected))
  assert.ok(state.research_iterations['gp-fever-urti'])
})

test('research progress changes the persisted fingerprint without creating review work', () => {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  assert.ok(state.output_fingerprint)
  assert.equal(Object.keys(state.research_iterations ?? {}).length, 1048)
  assert.equal(fs.existsSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/OWNER_REVIEW_QUEUE.json')), false)
  assert.equal(fs.existsSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/CLINICIAN_REVIEW_QUEUE.json')), false)
})

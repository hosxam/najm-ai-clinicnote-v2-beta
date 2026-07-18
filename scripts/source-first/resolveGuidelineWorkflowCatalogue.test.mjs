import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const statePath = path.join(root, 'clinical-expansion-v2/full-source-reconstruction/WORKFLOW_RESOLUTION_STATE.json')
const repairPath = path.join(root, 'clinical-expansion-v2/full-source-reconstruction/gap-repairs/gp-fever-urti.json')

test('evidence-gap research is internal and the worker advances after gp-fever validation', () => {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  const repair = JSON.parse(fs.readFileSync(repairPath, 'utf8'))
  const gpFever = state.final_status_by_workflow['gp-fever-urti']

  assert.ok(state.reconstruction_totals.resolved > 452)
  assert.ok(state.reconstruction_totals.pending < 1048)
  assert.notEqual(state.exact_next_workflow, 'gp-fever-urti')
  assert.equal(gpFever.final_status, 'reconstructed_with_noncritical_documented_limitations')
  assert.equal(state.worker_states['gp-fever-urti'], 'reconstructed_with_noncritical_documented_limitations')
  assert.equal(repair.source_attempts.length, 3)
  assert.ok(repair.source_attempts.every((attempt) => attempt.full_document_inspected))
  assert.equal(repair.section_determinations.relevant_negative_symptoms.status, 'genuinely_not_applicable')
  assert.equal(repair.section_determinations.safety_netting.status, 'applicable_and_covered')
  assert.equal(repair.final_status, 'reconstructed_with_noncritical_documented_limitations')
  assert.ok(state.research_iterations['gp-fever-urti'])
})

test('research progress changes the persisted fingerprint without creating review work', () => {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  assert.ok(state.output_fingerprint)
  assert.ok(Object.keys(state.research_iterations ?? {}).length > 0)
  assert.equal(fs.existsSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/OWNER_REVIEW_QUEUE.json')), false)
  assert.equal(fs.existsSync(path.join(root, 'clinical-expansion-v2/full-source-reconstruction/CLINICIAN_REVIEW_QUEUE.json')), false)
})

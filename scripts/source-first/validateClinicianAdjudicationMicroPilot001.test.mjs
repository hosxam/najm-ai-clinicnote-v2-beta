import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { readJson } from './common.mjs'
import {
  MICRO_DECISIONS_CSV_PATH,
  MICRO_DECISIONS_JSON_PATH,
  MICRO_MANIFEST_PATH,
  MICRO_WORKFLOW_IDS,
  buildMicroPilot,
} from './prepareClinicianAdjudicationMicroPilot001.mjs'
import {
  parseDecisionCsv,
  validateDecisionDocument,
  validateStoredMicroPilot,
} from './validateClinicianAdjudicationMicroPilot001.mjs'

function completedRecord(decision = 'approve_candidate') {
  const document = structuredClone(readJson(MICRO_DECISIONS_JSON_PATH))
  const record = document.records.find((entry) => entry.candidate_id && entry.safety_review_required)
  record.clinician_decision = decision
  record.reviewer_name = 'Test Reviewer'
  record.reviewer_professional_role = 'Test Clinician'
  record.review_date = '2026-07-18'
  record.decision_status = 'clinician_decision_recorded'
  return { document, record }
}

test('stored micro-pilot is deterministic, blank, and protected', () => {
  const result = validateStoredMicroPilot()
  assert.equal(result.status, 'PASS')
  assert.equal(result.workflows, 5)
  assert.equal(result.total_items, 559)
  assert.deepEqual(result.decision_counts, { pending: 559, approved: 0, rejected: 0, recorded: 0 })
})

test('manifest contains exactly the five required workflow IDs', () => {
  const manifest = readJson(MICRO_MANIFEST_PATH)
  assert.equal(manifest.workflow_count, 5)
  assert.deepEqual(manifest.workflows.map((entry) => entry.workflow_id), [...MICRO_WORKFLOW_IDS])
})

test('CSV and JSON templates are equivalent', () => {
  const json = readJson(MICRO_DECISIONS_JSON_PATH)
  const csv = parseDecisionCsv(fs.readFileSync(MICRO_DECISIONS_CSV_PATH, 'utf8'), buildMicroPilot().decisions)
  assert.deepEqual(csv, json)
})

test('future completed approval requires and accepts clinician identity, role, and date', () => {
  const { document } = completedRecord()
  const counts = validateDecisionDocument(document)
  assert.equal(counts.approved, 1)
  const missingIdentity = structuredClone(document)
  missingIdentity.records.find((entry) => entry.clinician_decision).reviewer_name = ''
  assert.throws(() => validateDecisionDocument(missingIdentity), /reviewer name required/)
})

test('narrower wording and source-recheck decisions enforce their required detail', () => {
  const narrower = completedRecord('approve_with_narrower_wording')
  assert.throws(() => validateDecisionDocument(narrower.document), /narrower wording is required/)
  narrower.record.revised_item_wording = 'Narrow test wording limited to the cited evidence.'
  validateDecisionDocument(narrower.document)

  const recheck = completedRecord('request_source_recheck')
  recheck.record.source_recheck_required = true
  assert.throws(() => validateDecisionDocument(recheck.document), /source-recheck reason is required/)
  recheck.record.clinician_comment = 'The cited locator needs confirmation.'
  validateDecisionDocument(recheck.document)
})

test('safety escalation retains safety status and rejects an invalid non-safety escalation', () => {
  const escalation = completedRecord('escalate_safety_review')
  escalation.record.safety_escalation_required = true
  escalation.record.clinician_comment = 'Specialist safety review required.'
  validateDecisionDocument(escalation.document)
  escalation.record.safety_review_required = false
  assert.throws(() => validateDecisionDocument(escalation.document), /immutable safety_review_required changed|retain the safety flag/)
})

test('unknown candidate references and promotion fields fail closed', () => {
  const invalidCandidate = completedRecord()
  invalidCandidate.record.candidate_id = 'cand-000000000000000000000000'
  assert.throws(() => validateDecisionDocument(invalidCandidate.document), /does not exist/)
  const promotion = completedRecord()
  promotion.record.promotion_status = 'active'
  assert.throws(() => validateDecisionDocument(promotion.document), /unexpected decision fields/)
})

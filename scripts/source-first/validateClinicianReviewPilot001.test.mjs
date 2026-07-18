import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { ROOT_DIR, readJson } from './common.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'
import {
  PILOT_ACCOUNTING_PATH,
  PILOT_ITEMS_JSON_PATH,
  PILOT_MANIFEST_PATH,
  PILOT_WORKFLOW_DIRECTORY,
  buildPilotArtifacts,
} from './prepareClinicianReviewPilot001.mjs'
import { validatePilot } from './validateClinicianReviewPilot001.mjs'

test('pilot selects exactly the first 25 eligible partial exact-source workflows', async () => {
  const rebuilt = await buildPilotArtifacts()
  const manifest = readJson(PILOT_MANIFEST_PATH)
  assert.equal(manifest.workflows.length, 25)
  assert.deepEqual(manifest, rebuilt.manifest)
  assert.ok(manifest.workflows.every((entry) => entry.current_research_status === 'partial_exact_source_verified'))
  assert.deepEqual(manifest.workflows.map((entry) => entry.workflow_number), Array.from({ length: 25 }, (_, index) => index + 1))
})

test('every review item and evidence candidate resolves to committed source-first records', async () => {
  const result = await validatePilot()
  assert.equal(result.status, 'PASS')
  assert.equal(result.workflow_count, 25)
  assert.equal(result.item_count, 2425)
})

test('unsupported items receive no direct-support candidate', () => {
  const document = readJson(PILOT_ITEMS_JSON_PATH)
  const unsupported = document.items.filter((item) => item.evidence_candidates.length === 0)
  assert.equal(unsupported.length, readJson(PILOT_ACCOUNTING_PATH).totals.unsupported_items)
  assert.ok(unsupported.every((item) => item.current_evidence_status === 'unsupported_legacy_review_required'))
  assert.ok(unsupported.every((item) => !item.evidence_candidates.some((candidate) => candidate.support_classification === 'direct_support')))
})

test('candidate authority remains review-only and supported mappings remain zero', () => {
  const document = readJson(PILOT_ITEMS_JSON_PATH)
  const candidates = document.items.flatMap((item) => item.evidence_candidates)
  assert.ok(candidates.length > 0)
  assert.ok(candidates.every((candidate) => candidate.candidate_status === 'clinician_review_required'))
  assert.ok(candidates.every((candidate) => candidate.authority.approval_status === 'not_approved'))
  assert.ok(candidates.every((candidate) => candidate.authority.autonomous_treatment_recommendation === false))
  assert.equal(loadCanonicalMappings().length, 0)
})

test('all 25 packets require an explicit unselected clinician decision', () => {
  const manifest = readJson(PILOT_MANIFEST_PATH)
  for (const entry of manifest.workflows) {
    const text = fs.readFileSync(path.join(PILOT_WORKFLOW_DIRECTORY, `${entry.workflow_id}.md`), 'utf8')
    assert.match(text, /approve candidate/)
    assert.match(text, /reject candidate/)
    assert.match(text, /request narrower wording/)
    assert.match(text, /request source recheck/)
    assert.match(text, /mark item unsupported/)
    assert.match(text, /escalate safety review/)
    assert.match(text, /not preselected/)
  }
})

test('public data, workflows, exclusions, and signed canonical state are outside the pilot diff', () => {
  const output = fs.readFileSync(path.join(ROOT_DIR, '.git', 'HEAD'), 'utf8')
  assert.match(output, /clinician-review-item-mapping-pilot-v1/)
  const result = readJson(PILOT_ACCOUNTING_PATH)
  assert.equal(result.totals.supported_mappings_created, 0)
})

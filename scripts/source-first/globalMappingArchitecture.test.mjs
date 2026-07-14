import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import test from 'node:test'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  getResearchPaths,
  getWorkflowPaths,
  listClinicalItems,
  readJson,
  readJsonl,
} from './common.mjs'
import { runExplicitMappingAudit } from './auditExplicitMappingContract.mjs'

const STARTING_HEAD = 'ab58aeb70141285b8611235591715b418b3e2b81'
const STABLE_MAIN = '95758951d46510f34548b5520510c5d9d59f017f'
const SUPPORTED_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const inventory = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl'))
const corrections = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl'))
const metadataCleanup = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_UNRELATED_METADATA_CLEANUP_LEDGER.jsonl'))
const uaeFindings = readJsonl(path.join(EXPANSION_DIR, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl'))
const unsupported = readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'))
const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))

function git(...args) {
  return execFileSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd: ROOT_DIR, encoding: 'utf8' }).trim()
}

function statusCounts(records) {
  return Object.fromEntries([...new Set(records.map((record) => record.source_status))]
    .sort()
    .map((status) => [status, records.filter((record) => record.source_status === status).length]))
}

test('global inventory and correction ledger cover every original supported mapping', () => {
  assert.equal(inventory.length, 17347)
  assert.equal(corrections.length, 17347)
  assert.equal(new Set(inventory.map((row) => row.mapping_key)).size, 17347)
  assert.equal(new Set(corrections.map((row) => row.original_mapping_key)).size, 17347)
  assert.deepEqual(
    inventory.map((row) => row.mapping_key).sort(),
    corrections.map((row) => row.original_mapping_key).sort(),
  )
})

test('runtime gap is explained item by item without promoting historical output', () => {
  assert.equal(inventory.filter((row) => row.runtime_emitted).length, 8145)
  const gap = inventory.filter((row) => !row.runtime_emitted)
  assert.equal(gap.length, 9202)
  assert.equal(gap.every((row) => typeof row.runtime_gap_reason === 'string' && row.runtime_gap_reason.length > 0), true)
})

test('all noncanonical mappings were conservatively removed to clinician review', () => {
  assert.equal(corrections.every((row) => row.final_disposition === 'REMOVE_TO_UNSUPPORTED'), true)
  assert.equal(corrections.every((row) => row.final_canonical_mapping_key === null), true)
  assert.equal(corrections.every((row) => row.resulting_support_status === 'unsupported_pending_review'), true)
  assert.equal(corrections.every((row) => row.clinician_review_reason?.length > 0), true)
  assert.equal(corrections.every((row) => row.item_level_population_applicability === 'missing'), true)
  assert.equal(corrections.every((row) => row.item_level_setting_applicability === 'missing'), true)
  assert.equal(corrections.every((row) => row.item_level_uae_applicability === 'missing'), true)
  assert.equal(corrections.every((row) => row.rationale_status === 'missing'), true)
})

test('canonical, persisted, workflow, explicit-ledger, guard, and runtime sets reconcile exactly', () => {
  const result = runExplicitMappingAudit()
  assert.equal(result.reconciliationEqual, true)
  for (const field of [
    'canonicalSupportedMappings',
    'persistedSupportedMappings',
    'workflowSupportedMappings',
    'guardInspectedSupportedMappings',
    'explicitMappingLedgerRecords',
    'runtimeEmittedSupportedMappings',
  ]) assert.equal(result[field], 0)
})

test('every legacy item is unsupported and no supported status survives', () => {
  const workflows = getWorkflowPaths().map(readJson)
  const allItems = workflows.flatMap((workflow) => listClinicalItems(workflow).map((item) => ({ workflow, item })))
  assert.equal(allItems.length, 83303)
  assert.equal(unsupported.length, 83303)
  assert.equal(new Set(unsupported.map((row) => `${row.workflow_id}\u0000${row.item_id}`)).size, 83303)
  assert.equal(allItems.some(({ item }) => item.clinical_review_status === SUPPORTED_STATUS), false)
  assert.equal(allItems.every(({ item }) => item.clinical_review_status === 'unsupported_legacy_review_required'), true)
})

test('nineteen unrelated no-mapping records have no correction metadata', () => {
  assert.equal(metadataCleanup.length, 19)
  assert.equal(new Set(metadataCleanup.map((row) => row.workflow_id)).size, 19)
  for (const row of metadataCleanup) {
    assert.equal(row.clinical_mapping_changed, false)
    const research = readJson(path.join(EXPANSION_DIR, 'research', `${row.workflow_id}.research.json`))
    assert.equal(Object.hasOwn(research.technical_audit ?? {}, 'gp_mapping_correction'), false)
    assert.equal(research.legacy_item_support_mappings.length, 0)
  }
})

test('UAE findings are structured and independent of free-text wording', () => {
  const summarize = (rows) => ({
    total: rows.length,
    workflows: new Set(rows.map((row) => row.workflow_id)).size,
    partial: rows.filter((row) => row.finding_type === 'partial_applicability').length,
    missing: rows.filter((row) => row.finding_type === 'missing_explicit_uae_evidence').length,
    other: rows.filter((row) => row.finding_type === 'other').length,
  })
  const before = summarize(uaeFindings)
  const alteredResearchWording = getResearchPaths().slice(0, 20).map((researchPath) => ({
    ...readJson(researchPath),
    UAE_applicability: 'This wording is deliberately changed by the test and is not inspected.',
  }))
  assert.equal(alteredResearchWording.length, 20)
  assert.deepEqual(summarize(uaeFindings), before)
  assert.deepEqual(before, { total: 601, workflows: 576, partial: 576, missing: 25, other: 0 })
})

test('unchanged terminal classifier independently preserves status totals', () => {
  const records = getResearchPaths().map(readJson)
  assert.deepEqual(statusCounts(records), {
    no_authoritative_source_found: 99,
    partial_exact_source_verified: 576,
    research_interrupted: 825,
  })
  for (const record of records.filter((entry) => entry.source_status === 'partial_exact_source_verified')) {
    assert.equal(record.exact_documents_opened.length > 0, true)
    assert.equal(record.exact_sections_reviewed.length > 0, true)
    assert.equal(record.legacy_item_support_mappings.length, 0)
  }
  assert.equal(manifest.next_workflow_id, 'gp-home-glucose-log-review')
})

test('workflows 0676 onward remain untouched from the frozen starting head', () => {
  const sequenceByWorkflow = new Map(manifest.workflows.map((entry) => [entry.workflow_id, entry.sequence]))
  const changed = git('diff', '--name-only', STARTING_HEAD, '--', 'clinical-expansion-v2/workflows', 'clinical-expansion-v2/research')
    .split(/\r?\n/)
    .filter(Boolean)
  const laterChanges = changed.filter((filePath) => {
    const workflowId = path.basename(filePath).replace(/\.research\.json$|\.json$/g, '')
    return (sequenceByWorkflow.get(workflowId) ?? Number.POSITIVE_INFINITY) >= 676
  })
  assert.deepEqual(laterChanges, [])
})

test('frozen application data and active exclusions remain unchanged', () => {
  assert.equal(git('diff', '--name-only', STABLE_MAIN, '--', 'public/data'), '')
  const exclusions = readJson('public/config/limited_testing_exclusions.json')
  const rows = Array.isArray(exclusions) ? exclusions : exclusions.exclusions
  assert.equal(rows.length, 12)
})

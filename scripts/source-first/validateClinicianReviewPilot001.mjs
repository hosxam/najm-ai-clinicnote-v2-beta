import assert from 'node:assert/strict'
import childProcess from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROOT_DIR, listClinicalItems, readJson } from './common.mjs'
import { CANDIDATE_MAPPING_PROPOSAL_DIRECTORY, CANONICAL_MAPPING_DIRECTORY } from './canonicalMappingContract.mjs'
import { candidateProposalDocument, readCandidateProposalDocument } from './candidateMappingProposalStore.mjs'
import {
  PILOT_ACCOUNTING_PATH,
  PILOT_ITEMS_CSV_PATH,
  PILOT_ITEMS_JSON_PATH,
  PILOT_MANIFEST_PATH,
  PILOT_SIZE,
  PILOT_WORKFLOW_DIRECTORY,
  buildPilotArtifacts,
} from './prepareClinicianReviewPilot001.mjs'

export const PILOT_BASELINE_HEAD = '07eb099512f976a329c40b1b59a8f963b16d7b87'

function proposalPaths() {
  return fs.readdirSync(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY)
    .filter((name) => name.endsWith('.candidate.json'))
    .sort()
    .map((name) => path.join(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY, name))
}

function recursivelyInspect(value, visit, pointer = '') {
  visit(value, pointer)
  if (Array.isArray(value)) value.forEach((entry, index) => recursivelyInspect(entry, visit, `${pointer}/${index}`))
  else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) recursivelyInspect(entry, visit, `${pointer}/${key}`)
  }
}

function changedPaths() {
  return childProcess.execFileSync('git', ['diff', '--name-only', `${PILOT_BASELINE_HEAD}..HEAD`], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean).map((value) => value.replaceAll('\\', '/'))
}

export async function validatePilot() {
  const rebuilt = await buildPilotArtifacts()
  const manifest = readJson(PILOT_MANIFEST_PATH)
  const itemsDocument = readJson(PILOT_ITEMS_JSON_PATH)
  const accounting = readJson(PILOT_ACCOUNTING_PATH)
  assert.deepEqual(manifest, rebuilt.manifest, 'stored manifest differs from deterministic selection')
  assert.deepEqual(itemsDocument, rebuilt.itemsDocument, 'stored item records differ from deterministic derivation')
  assert.deepEqual(accounting, rebuilt.accounting, 'stored accounting differs from item records')

  assert.equal(manifest.workflow_count, PILOT_SIZE)
  assert.equal(manifest.workflows.length, PILOT_SIZE)
  assert.deepEqual(manifest.workflows.map((entry) => entry.pilot_position), Array.from({ length: PILOT_SIZE }, (_, index) => index + 1))
  assert.ok(manifest.workflows.every((entry) => entry.current_research_status === 'partial_exact_source_verified'))
  assert.equal(new Set(manifest.workflows.map((entry) => entry.workflow_id)).size, PILOT_SIZE)

  const workflowItemIds = new Map(manifest.workflows.map((entry) => {
    const workflow = readJson(path.join(ROOT_DIR, 'clinical-expansion-v2', 'workflows', `${entry.workflow_id}.json`))
    return [entry.workflow_id, new Set(listClinicalItems(workflow).map((item) => item.item_id))]
  }))
  const sources = new Map(fs.readdirSync(path.join(ROOT_DIR, 'clinical-expansion-v2', 'sources'))
    .filter((name) => name.endsWith('.json')).sort()
    .flatMap((name) => readJson(path.join(ROOT_DIR, 'clinical-expansion-v2', 'sources', name)).sources ?? [])
    .map((source) => [source.source_id, source]))
  const itemKeys = new Set()
  let candidateCount = 0
  for (const item of itemsDocument.items) {
    assert.ok(workflowItemIds.get(item.workflow_id)?.has(item.item_id), `invalid workflow item ${item.workflow_id}/${item.item_id}`)
    const itemKey = `${item.workflow_id}\u0000${item.item_id}`
    assert.ok(!itemKeys.has(itemKey), `duplicate item ${itemKey}`)
    itemKeys.add(itemKey)
    assert.equal(item.clinician_review_required, true)
    if (item.evidence_candidates.length === 0) assert.equal(item.current_evidence_status, 'unsupported_legacy_review_required')
    for (const candidate of item.evidence_candidates) {
      candidateCount += 1
      assert.equal(candidate.workflow_id, item.workflow_id)
      assert.equal(candidate.item_id, item.item_id)
      const source = sources.get(candidate.source_id)
      assert.ok(source, `unregistered source ${candidate.source_id}`)
      assert.ok((source.exact_sections ?? []).some((section) => section.section_id === candidate.evidence_location.section_id), `invalid evidence location ${candidate.source_id}/${candidate.evidence_location.section_id}`)
      assert.ok(candidate.evidence_location.heading && candidate.evidence_location.locator)
      assert.match(candidate.exact_relationship, /\S/)
      assert.ok(['direct_support', 'partial_support', 'contextual_support'].includes(candidate.support_classification))
      assert.equal(candidate.reviewer_required, true)
      assert.equal(candidate.candidate_status, 'clinician_review_required')
      assert.equal(candidate.authority.approval_status, 'not_approved')
    }
  }
  assert.equal(itemsDocument.item_count, itemKeys.size)
  assert.equal(candidateCount, accounting.totals.candidate_proposals_created)
  assert.equal(itemsDocument.items.filter((item) => item.evidence_candidates.length === 0).length, accounting.totals.unsupported_items)
  assert.ok(itemsDocument.items.filter((item) => item.evidence_candidates.length === 0)
    .every((item) => !item.evidence_candidates.some((candidate) => candidate.support_classification === 'direct_support')))

  const actualProposalPaths = proposalPaths()
  const expectedProposalWorkflowIds = [...rebuilt.proposalsByWorkflow.entries()]
    .filter(([, proposals]) => proposals.length)
    .map(([workflowId]) => workflowId).sort()
  assert.deepEqual(actualProposalPaths.map((filePath) => path.basename(filePath, '.candidate.json')), expectedProposalWorkflowIds)
  let proposalCount = 0
  for (const filePath of actualProposalPaths) {
    const document = readCandidateProposalDocument(filePath)
    assert.deepEqual(document.proposals, candidateProposalDocument(document.workflowId, rebuilt.proposalsByWorkflow.get(document.workflowId)).proposals)
    assert.ok(document.proposals.every((proposal) => proposal.proposalStatus === 'clinician_review_required'))
    recursivelyInspect(document, (_value, pointer) => {
      assert.doesNotMatch(pointer, /\/(?:signature|signed|approvedBy|approved_by|approvalDate|approval_date|clinicianIdentity|clinician_identity)$/)
    })
    proposalCount += document.proposals.length
  }
  assert.equal(proposalCount, accounting.totals.candidate_proposals_created)
  const approvalManifest = readJson(path.join(CANONICAL_MAPPING_DIRECTORY, 'APPROVED_MANIFEST.json'))
  assert.equal(approvalManifest.files.length, 0, 'approved canonical files must remain zero')
  assert.equal(approvalManifest.mappingKeys.length, 0, 'supported mappings must remain zero')
  assert.deepEqual(fs.readdirSync(CANONICAL_MAPPING_DIRECTORY).sort(), ['.gitkeep', 'APPROVED_MANIFEST.json', 'APPROVED_MANIFEST.sig'])
  assert.equal(accounting.totals.supported_mappings_created, 0)

  const packets = fs.readdirSync(PILOT_WORKFLOW_DIRECTORY).filter((name) => name.endsWith('.md')).sort()
  assert.deepEqual(packets, manifest.workflows.map((entry) => `${entry.workflow_id}.md`).sort())
  for (const packet of packets) {
    const text = fs.readFileSync(path.join(PILOT_WORKFLOW_DIRECTORY, packet), 'utf8')
    assert.match(text, /generated for qualified-clinician review/i)
    assert.match(text, /not approved/i)
    assert.match(text, /Approval is deliberately not preselected/i)
  }
  const csvLines = fs.readFileSync(PILOT_ITEMS_CSV_PATH, 'utf8').split(/\r?\n/).filter(Boolean)
  assert.equal(csvLines.length, itemsDocument.item_count + 1)

  const changes = changedPaths()
  const allowed = changes.every((filePath) =>
    filePath === 'package.json'
    || filePath.startsWith('scripts/source-first/prepareClinicianReviewPilot001.')
    || filePath.startsWith('scripts/source-first/validateClinicianReviewPilot001.')
    || filePath.startsWith('clinical-expansion-v2/clinician-review/pilot-001/')
    || filePath.startsWith('clinical-expansion-v2/candidate-mapping-proposals/')
    || filePath === 'clinical-expansion-v2/progress/CLINICIAN_REVIEW_ITEM_MAPPING_PILOT_001.md')
  assert.equal(allowed, true, `out-of-scope changes: ${changes.join(', ')}`)
  assert.ok(!changes.some((filePath) => filePath.startsWith('public/data/')))
  assert.ok(!changes.some((filePath) => filePath.startsWith('clinical-expansion-v2/workflows/')))
  assert.ok(!changes.some((filePath) => filePath.startsWith('clinical-expansion-v2/canonical-mappings/')))
  assert.ok(!changes.some((filePath) => /exclusion/i.test(filePath)))

  return {
    status: 'PASS',
    workflow_count: manifest.workflow_count,
    item_count: itemsDocument.item_count,
    candidate_proposal_files: actualProposalPaths.length,
    candidate_proposals: proposalCount,
    supported_mappings: 0,
    accounting: accounting.totals,
    protected_paths_unchanged: true,
  }
}

export async function main() {
  console.log(JSON.stringify(await validatePilot(), null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()

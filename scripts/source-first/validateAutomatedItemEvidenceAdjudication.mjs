import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const betaRoot = path.join(repoRoot, 'public', 'data-beta')
const adjudicationRoot = path.join(betaRoot, 'adjudication')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function main() {
  const metadata = readJson(path.join(adjudicationRoot, 'metadata.json'))
  const catalog = readJson(path.join(adjudicationRoot, 'catalog.json'))
  const betaMetadata = readJson(path.join(betaRoot, 'metadata.json'))
  assert(metadata.workflow_count === 1500, 'Adjudication workflow count is not 1,500')
  assert(metadata.item_count === 83303, 'Adjudication item count is not 83,303')
  assert(metadata.registered_source_count === 235, 'Adjudication source count is not 235')
  assert(betaMetadata.workflow_count === 1500 && betaMetadata.item_count === 83303, 'Base beta dataset changed unexpectedly')
  assert(catalog.length === 1500, 'Adjudication catalog does not cover all workflows')
  assert(new Set(catalog.map((workflow) => workflow.workflow_id)).size === 1500, 'Duplicate adjudication workflow IDs')

  const sourceIds = new Set()
  for (const file of fs.readdirSync(path.join(repoRoot, 'clinical-expansion-v2', 'sources')).filter((name) => name.endsWith('.json'))) {
    for (const source of readJson(path.join(repoRoot, 'clinical-expansion-v2', 'sources', file)).sources ?? []) sourceIds.add(source.source_id)
  }
  const totals = {
    fully_supported: 0,
    partially_supported: 0,
    contextual_only: 0,
    not_supported: 0,
    conflicting_evidence: 0,
    source_inaccessible: 0,
    no_evidence_link: 0,
    high_confidence: 0,
    low_confidence: 0,
    human_review_required: 0,
    safety_review_required: 0,
  }
  const itemIds = new Set()
  let detailCount = 0
  for (const entry of catalog) {
    const filePath = path.join(adjudicationRoot, 'workflows', `${entry.workflow_id}.json`)
    assert(fs.existsSync(filePath), `Missing adjudication detail: ${entry.workflow_id}`)
    const detail = readJson(filePath)
    detailCount += detail.items.length
    for (const item of detail.items) {
      assert(item.workflow_id === detail.workflow_id, `Item workflow mismatch: ${item.item_id}`)
      assert(!itemIds.has(item.item_id), `Duplicate item adjudication: ${item.item_id}`)
      itemIds.add(item.item_id)
      assert(['fully_supported', 'partially_supported', 'contextual_only', 'not_supported', 'conflicting_evidence', 'source_inaccessible', 'no_evidence_link'].includes(item.support_classification), `Invalid classification: ${item.item_id}`)
      totals[item.support_classification] += 1
      if (item.confidence_score >= 0.9) totals.high_confidence += 1
      else totals.low_confidence += 1
      if (item.human_review_required) totals.human_review_required += 1
      if (item.safety_critical) totals.safety_review_required += 1
      for (const evidence of item.evidence_links) assert(sourceIds.has(evidence.source_id) && evidence.source_registered, `Unregistered source on ${item.item_id}`)
      if (item.support_classification === 'fully_supported') {
        assert(item.exact_evidence_location && item.evidence_text, `Fully supported item lacks exact evidence: ${item.item_id}`)
      }
      if (item.support_classification === 'partially_supported') {
        assert(item.support_rationale && item.wording_scope_difference && item.suggested_narrower_wording, `Partial item lacks scope explanation: ${item.item_id}`)
      }
      if (item.support_classification === 'contextual_only') assert(item.verification_state !== 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL', `Contextual item marked verified: ${item.item_id}`)
      if (item.support_classification !== 'fully_supported') assert(item.verification_state !== 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL', `Non-full item marked verified: ${item.item_id}`)
      if (item.safety_critical) assert(item.human_review_required, `Safety item bypasses human review: ${item.item_id}`)
      assert(item.clinician_approval_status === 'not_approved' && item.clinician_decision === null, `Fabricated approval state: ${item.item_id}`)
    }
  }
  assert(detailCount === 83303 && itemIds.size === 83303, `Adjudication reconciliation failed: ${detailCount}/${itemIds.size}`)
  for (const key of Object.keys(totals)) assert(totals[key] === metadata.totals[key], `Total mismatch for ${key}`)
  assert(metadata.clinician_approval_count === 0 && metadata.canonical_mapping_count === 0 && metadata.candidate_approval_count === 0, 'Approval or mapping count is non-zero')

  const protectedDiff = execFileSync('git', ['diff', '--name-only', 'b9c525fd37806f92c45f67afb86a832cb3680a6f', '--', 'public/data', 'clinical-expansion-v2/canonical', 'clinical-expansion-v2/approval'], { cwd: repoRoot, encoding: 'utf8' }).trim()
  assert(!protectedDiff, `Protected production paths changed: ${protectedDiff}`)
  console.log(JSON.stringify({ status: 'PASS', workflows: metadata.workflow_count, items: detailCount, sources: sourceIds.size, totals, mappings: 0, clinician_approvals: 0, protected_paths: 'UNCHANGED' }, null, 2))
}

main()

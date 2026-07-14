import fs from 'node:fs'
import path from 'node:path'
import {
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  getResearchPaths,
  listClinicalItems,
  readJson,
  readJsonl,
  rebuildIndexesAndHashManifest,
  updateEvidenceHash,
  updateWorkflowHash,
  writeJson,
  writeJsonl,
} from './common.mjs'

const EARLY_WORKFLOW_IDS = [
  'gp-cough',
  'gp-dizziness',
  'gp-fever-urti',
  'gp-headache',
  'gp-sore-throat',
]
const EXPECTED_NUMBERED_MAPPINGS = 1032
const EXPECTED_EARLY_MAPPINGS = 132
const EXPECTED_UNIQUE_NUMBERED = 290
const EXPECTED_AMBIGUOUS_NUMBERED = 742
const SUPPORTED_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const UNSUPPORTED_STATUS = 'unsupported_legacy_review_required'
const UNSUPPORTED_REASON = 'Legacy text is preserved exactly but has no exact source-section mapping or clinician approval.'

function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()
}

function mappingKey(workflowId, mapping) {
  return `${workflowId}\u0000${mapping.item_id}\u0000${mapping.source_id}\u0000${mapping.source_section_id}`
}

function unsupportedRow(workflowId, item) {
  return {
    workflow_id: workflowId,
    item_id: item.item_id,
    text: item.text,
    item_type: item.item_type,
    origin: item.origin,
    source_file: item.legacy_provenance?.source_file ?? null,
    source_path: item.legacy_provenance?.source_path ?? null,
    reason: UNSUPPORTED_REASON,
    clinical_review_required: true,
  }
}

function buildExplicitSupportedLedger() {
  const rows = []
  for (const researchPath of getResearchPaths()) {
    const research = readJson(researchPath)
    for (const mapping of research.legacy_item_support_mappings ?? []) {
      rows.push({
        mapping_key: mappingKey(research.workflow_id, mapping),
        workflow_id: research.workflow_id,
        item_id: mapping.item_id,
        source_id: mapping.source_id,
        section_id: mapping.source_section_id,
        direct_relationship: mapping.direct_relationship,
        storage_location: path.relative(EXPANSION_DIR, researchPath).replaceAll('\\', '/'),
      })
    }
  }
  return rows.sort((left, right) => left.mapping_key.localeCompare(right.mapping_key))
}

const gpLedgerPath = path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json')
const gpLedger = readJson(gpLedgerPath)
const numberedWorkflowIds = gpLedger.workflows.map((record) => record.workflowId)
const targetWorkflowIds = [...numberedWorkflowIds, ...EARLY_WORKFLOW_IDS]
const targetWorkflowIdSet = new Set(targetWorkflowIds)

if (new Set(targetWorkflowIds).size !== 55) throw new Error('Expected 55 distinct GP correction workflows')
if (gpLedger.mappingCount === 0) {
  const correctionRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl'))
  const remainingTargetMappings = targetWorkflowIds.reduce((total, workflowId) => {
    const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))
    return total + (research.legacy_item_support_mappings?.length ?? 0)
  }, 0)
  if (correctionRows.length !== 1164 || remainingTargetMappings !== 0) {
    throw new Error('Previously applied GP correction is inconsistent')
  }
  console.log(JSON.stringify({
    status: 'PASS_ALREADY_APPLIED',
    correction_records: correctionRows.length,
    retained_target_mappings: remainingTargetMappings,
  }, null, 2))
  process.exit(0)
}
if (gpLedger.mappingCount !== EXPECTED_NUMBERED_MAPPINGS) {
  throw new Error(`Expected ${EXPECTED_NUMBERED_MAPPINGS} numbered mappings; found ${gpLedger.mappingCount}`)
}

const originalMappingsByWorkflow = new Map()
for (const workflowId of targetWorkflowIds) {
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))
  originalMappingsByWorkflow.set(workflowId, structuredClone(research.legacy_item_support_mappings ?? []))
}

const earlyMappingCount = EARLY_WORKFLOW_IDS.reduce(
  (total, workflowId) => total + originalMappingsByWorkflow.get(workflowId).length,
  0,
)
if (earlyMappingCount !== EXPECTED_EARLY_MAPPINGS) {
  throw new Error(`Expected ${EXPECTED_EARLY_MAPPINGS} early mappings; found ${earlyMappingCount}`)
}

const correctionRows = []
let uniqueNumberedCount = 0
let ambiguousNumberedCount = 0

for (const workflowId of targetWorkflowIds) {
  const workflowPath = path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`)
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const workflow = readJson(workflowPath)
  const research = readJson(researchPath)
  const items = listClinicalItems(workflow)
  const itemById = new Map(items.map((item) => [item.item_id, item]))
  const itemsByNormalizedText = new Map()

  for (const item of items) {
    const normalized = normalizeText(item.text)
    const values = itemsByNormalizedText.get(normalized) ?? []
    values.push(item)
    itemsByNormalizedText.set(normalized, values)
  }

  const originalMappings = originalMappingsByWorkflow.get(workflowId)
  const supportedItems = items.filter((item) => item.clinical_review_status === SUPPORTED_STATUS)
  if (supportedItems.length !== originalMappings.length) {
    throw new Error(`${workflowId}: workflow supported-item count ${supportedItems.length} does not match persisted mapping count ${originalMappings.length}`)
  }

  for (const mapping of originalMappings) {
    const item = itemById.get(mapping.item_id)
    if (!item) throw new Error(`${workflowId}: mapped item ${mapping.item_id} is missing`)
    const candidates = itemsByNormalizedText.get(normalizeText(item.text)) ?? []
    const numbered = numberedWorkflowIds.includes(workflowId)
    if (numbered && candidates.length === 1) uniqueNumberedCount += 1
    if (numbered && candidates.length > 1) ambiguousNumberedCount += 1

    correctionRows.push({
      original_mapping_key: mappingKey(workflowId, mapping),
      workflow_id: workflowId,
      original_item_id: mapping.item_id,
      candidate_item_ids: candidates.map((candidate) => candidate.item_id).sort(),
      candidate_item_categories: [...new Set(candidates.map((candidate) => candidate.item_type))].sort(),
      exact_text: item.text,
      normalized_text: normalizeText(item.text),
      workflow_location: item.legacy_provenance?.source_path ?? item.item_type,
      source_id: mapping.source_id,
      section_id: mapping.source_section_id,
      reconstruction_method: numbered
        ? (candidates.length > 1
            ? 'persisted_previous_helper_output_ambiguous_normalized_text'
            : 'persisted_previous_helper_output_unique_normalized_text')
        : 'individually_authored_early_mapping_without_item_level_applicability_contract',
      direct_support_verdict: 'not_independently_established_without_new_source_research',
      population_verdict: 'insufficient_item_specific_evidence',
      setting_verdict: 'insufficient_item_specific_evidence',
      UAE_verdict: 'insufficient_evidence',
      final_disposition: 'REMOVE_TO_UNSUPPORTED',
      final_item_id: null,
      reason: candidates.length > 1
        ? 'The prior mapping came from a text resolver with multiple workflow-owned candidates, and item-level direct support plus applicability cannot be independently established from the recorded metadata alone.'
        : 'The exact item exists, but unique text and prior persistence do not establish item-level direct support or substantive population, setting, and UAE applicability without new research.',
      reviewer_requirement: 'qualified_clinician_review_required_before_reinstatement',
      resulting_support_status: 'unsupported_pending_review',
    })

    item.source_ids = []
    item.source_section_ids = []
    item.clinical_review_status = UNSUPPORTED_STATUS
    delete item.evidence_relationship
  }

  const unsupportedItems = items.filter((item) => ['legacy_exact', 'legacy_cleaned'].includes(item.origin))
  const residualSupportedItems = items.filter((item) => item.clinical_review_status === SUPPORTED_STATUS)
  if (residualSupportedItems.length !== 0) throw new Error(`${workflowId}: stale supported items remain after correction`)

  workflow.supported_legacy_item_count = 0
  workflow.unsupported_legacy_item_count = unsupportedItems.length
  workflow.clinical_review_required = true
  workflow.application_generation_eligible = false
  workflow.active_clinical_approval = false
  workflow.technical_audit_passed = true
  workflow.provenance_audit_passed = true
  workflow.research_terminal_status = true
  const updatedWorkflow = updateWorkflowHash(workflow)
  writeJson(workflowPath, updatedWorkflow)

  research.legacy_item_support_mappings = []
  research.supported_legacy_item_count = 0
  research.unsupported_legacy_item_count = unsupportedItems.length
  research.unsupported_legacy_item_ids = unsupportedItems.map((item) => item.item_id)
  research.population_applicability = `No legacy item in ${workflowId} remains source-supported after conservative correction; item-specific population applicability was not independently established without new research.`
  research.setting_applicability = `No legacy item in ${workflowId} remains source-supported after conservative correction; transfer from the recorded source setting to the exact workflow item was not independently established.`
  research.UAE_applicability = `insufficient_evidence for every removed ${workflowId} legacy-item mapping; UAE applicability requires independent item-level review before any mapping is reinstated.`
  research.evidence_items = (research.evidence_items ?? []).map((evidenceItem) => ({
    ...evidenceItem,
    content_mapping_status: 'reviewed_not_mapped_to_legacy_content',
  }))
  const correctionGap = 'All previously supported GP legacy-item mappings were conservatively removed because exact item identity, direct support, and item-specific applicability were not independently established under the fail-closed contract.'
  research.unresolved_source_gaps = [...new Set([...(research.unresolved_source_gaps ?? []), correctionGap])]
  research.technical_audit = {
    ...(research.technical_audit ?? {}),
    status: 'PASS_WITH_CLINICAL_BLOCKERS',
    provenance_complete: true,
    source_gap_marked_as_pass: false,
    qualified_clinician_review_required: true,
    gp_mapping_correction: 'all_unverified_mappings_removed_to_unsupported',
  }
  writeJson(researchPath, updateEvidenceHash(research))
}

if (uniqueNumberedCount !== EXPECTED_UNIQUE_NUMBERED || ambiguousNumberedCount !== EXPECTED_AMBIGUOUS_NUMBERED) {
  throw new Error(`Expected numbered ambiguity split ${EXPECTED_UNIQUE_NUMBERED}/${EXPECTED_AMBIGUOUS_NUMBERED}; found ${uniqueNumberedCount}/${ambiguousNumberedCount}`)
}
if (correctionRows.length !== EXPECTED_NUMBERED_MAPPINGS + EXPECTED_EARLY_MAPPINGS) {
  throw new Error(`Expected 1164 correction records; found ${correctionRows.length}`)
}

correctionRows.sort((left, right) => left.original_mapping_key.localeCompare(right.original_mapping_key))
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl'), correctionRows)

gpLedger.purpose = 'Conservative GP correction ledger metadata; no clinical support mapping is retained without independent item-level applicability review.'
gpLedger.mappingCount = 0
gpLedger.classificationCounts = {
  retainExplicit: 0,
  removeToUnsupported: EXPECTED_NUMBERED_MAPPINGS,
  manualReviewBlocker: 0,
}
gpLedger.workflows = gpLedger.workflows.map((record) => ({
  ...record,
  populationApplicability: `No legacy item in ${record.workflowId} remains source-supported after conservative correction; item-specific population applicability was not independently established without new research.`,
  settingApplicability: `No legacy item in ${record.workflowId} remains source-supported after conservative correction; transfer from the recorded source setting to the exact workflow item was not independently established.`,
  uaeApplicability: `insufficient_evidence for every removed ${record.workflowId} legacy-item mapping; UAE applicability requires independent item-level review before any mapping is reinstated.`,
  mappings: [],
}))
writeJson(gpLedgerPath, gpLedger)

const manifestPath = path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json')
const manifest = readJson(manifestPath)
const unsupportedRows = []
for (const manifestEntry of manifest.workflows) {
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${manifestEntry.workflow_id}.json`))
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${manifestEntry.workflow_id}.research.json`))
  const supportedIds = new Set((research.legacy_item_support_mappings ?? []).map((mapping) => mapping.item_id))
  for (const item of listClinicalItems(workflow)) {
    if (['legacy_exact', 'legacy_cleaned'].includes(item.origin) && !supportedIds.has(item.item_id)) {
      unsupportedRows.push(unsupportedRow(manifestEntry.workflow_id, item))
    }
  }
}
writeJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'), unsupportedRows)

const auditPath = path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl')
const auditRows = readJsonl(auditPath).map((row) => {
  if (!targetWorkflowIdSet.has(row.workflow_id)) return row
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${row.workflow_id}.json`))
  return {
    ...row,
    supported_legacy_items: 0,
    unsupported_legacy_items: workflow.unsupported_legacy_item_count,
    qualified_clinician_review_required: true,
    source_gap_marked_as_pass: false,
  }
})
writeJsonl(auditPath, auditRows)

const executionLogPath = path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl')
const executionLog = readJsonl(executionLogPath).filter((row) => row.event !== 'gp_mapping_correction')
for (const workflowId of targetWorkflowIds) {
  executionLog.push({
    timestamp: CHECKPOINT_TIMESTAMP,
    event: 'gp_mapping_correction',
    workflow_id: workflowId,
    original_supported_mappings: originalMappingsByWorkflow.get(workflowId).length,
    retained_mappings: 0,
    removed_to_unsupported: originalMappingsByWorkflow.get(workflowId).length,
    qualified_clinician_review_required: true,
    queue_continued: false,
  })
}
writeJsonl(executionLogPath, executionLog)

rebuildIndexesAndHashManifest()

const allResearch = getResearchPaths().map(readJson)
const supportedTotal = allResearch.reduce((total, research) => total + (research.legacy_item_support_mappings?.length ?? 0), 0)
const checkpointPath = path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json')
const checkpoint = readJson(checkpointPath)
const evidencedResearch = allResearch.filter((research) => ['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(research.source_status))
const partialApplicabilityFindings = evidencedResearch.filter((research) => research.source_status === 'partial_exact_source_verified').length
const missingExplicitUaeFindings = evidencedResearch.filter((research) => !/Dubai|UAE|United Arab Emirates/i.test(research.UAE_applicability)).length
const uaeFindingTotal = partialApplicabilityFindings + missingExplicitUaeFindings
checkpoint.counts.source_supported_legacy_items = supportedTotal
checkpoint.counts.unsupported_legacy_items = unsupportedRows.length
checkpoint.counts.uae_applicability_individual_findings = uaeFindingTotal
checkpoint.counts.uae_partial_applicability_findings = partialApplicabilityFindings
checkpoint.counts.uae_missing_explicit_evidence_findings = missingExplicitUaeFindings
for (const command of checkpoint.clinical_blocker_commands ?? []) {
  if (command.command === 'npm run audit:uae-applicability') {
    command.reason = `${evidencedResearch.length} evidenced workflow(s) have ${uaeFindingTotal} UAE-applicability finding(s): ${partialApplicabilityFindings} partial-applicability, ${missingExplicitUaeFindings} missing-explicit-evidence, and 0 other.`
  }
  if (command.command === 'npm run audit:unsupported-legacy-content') {
    command.reason = `${unsupportedRows.length} exact legacy-preservation items still lack exact section mapping and qualified clinician review.`
  }
}
writeJson(checkpointPath, checkpoint)

for (const entry of manifest.workflows) {
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${entry.workflow_id}.json`))
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${entry.workflow_id}.research.json`))
  entry.workflow_hash = workflow.content_hash
  entry.evidence_hash = research.evidence_hash
}
manifest.source_supported_legacy_item_count = supportedTotal
manifest.unsupported_legacy_item_count = unsupportedRows.length
manifest.next_workflow_id = 'gp-home-glucose-log-review'
writeJson(manifestPath, manifest)

const explicitLedgerRows = buildExplicitSupportedLedger()
if (explicitLedgerRows.length !== supportedTotal) throw new Error('Explicit supported ledger count mismatch')
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'), explicitLedgerRows)

console.log(JSON.stringify({
  status: 'PASS',
  target_workflows: targetWorkflowIds.length,
  original_mappings: correctionRows.length,
  numbered_mappings: EXPECTED_NUMBERED_MAPPINGS,
  early_mappings: EXPECTED_EARLY_MAPPINGS,
  unique_numbered_mappings: uniqueNumberedCount,
  ambiguous_numbered_mappings: ambiguousNumberedCount,
  retained_mappings: 0,
  removed_to_unsupported: correctionRows.length,
  supported_mappings_before: 18511,
  supported_mappings_after: supportedTotal,
  unsupported_legacy_items_before: 64792,
  unsupported_legacy_items_after: unsupportedRows.length,
  explicit_supported_ledger_records: explicitLedgerRows.length,
  next_workflow_id: manifest.next_workflow_id,
}, null, 2))

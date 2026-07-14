import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import {
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  ROOT_DIR,
  getResearchPaths,
  getWorkflowPaths,
  listClinicalItems,
  readJson,
  readJsonl,
  rebuildIndexesAndHashManifest,
  sha256,
  updateEvidenceHash,
  updateWorkflowHash,
  writeJson,
  writeJsonl,
} from './common.mjs'
const EXPECTED_SUPPORTED_BEFORE = 17347
const EXPECTED_UNSUPPORTED_BEFORE = 65956
const EXPECTED_TOTAL_ITEMS = 83303
const PRE_CORRECTION_HEAD = '225ef377c632c679514a1092f6058a93b4408de5'
const UNSUPPORTED_STATUS = 'unsupported_legacy_review_required'
const UNSUPPORTED_REASON = 'Legacy text is preserved exactly but has no canonical item-level evidence mapping or clinician approval.'
const GLOBAL_GAP = 'All prior supported legacy-item mappings were removed because canonical item-level applicability and workflow-specific rationale were not present in explicit repository records.'

function oldMappingKey(workflowId, mapping) {
  return [workflowId, mapping.item_id, mapping.source_id, mapping.source_section_id].join('\u0000')
}

function readHistoricalResearch(workflowId) {
  return JSON.parse(execFileSync('git', [
    'show',
    `${PRE_CORRECTION_HEAD}:clinical-expansion-v2/research/${workflowId}.research.json`,
  ], { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }))
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

function sourceRegistry() {
  const directory = path.join(EXPANSION_DIR, 'sources')
  return new Map(fs.readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => readJson(path.join(directory, name)).sources ?? [])
    .map((source) => [source.source_id, source]))
}

async function historicalRuntimeKeys() {
  const directory = path.join(ROOT_DIR, 'scripts', 'source-first', 'batches')
  const keys = new Set()
  const failedBatches = []
  for (const name of fs.readdirSync(directory).filter((entry) => /^batch-\d{4}-\d{4}\.mjs$/.test(entry)).sort()) {
    try {
      const batch = (await import(`${pathToFileURL(path.join(directory, name)).href}?global-inventory=${name}`)).default
      for (const workflow of batch.workflows ?? []) {
        for (const group of workflow.support_groups ?? []) {
          for (const itemId of group.item_ids ?? []) {
            keys.add([workflow.workflow_id, itemId, group.source_id, group.source_section_id].join('\u0000'))
          }
        }
      }
    } catch (error) {
      failedBatches.push({ batch: name, error: String(error.message).split('\n')[0] })
    }
  }
  return { keys, failedBatches }
}

function generationPath(sequence) {
  if (sequence < 6 || sequence > 675) return 'direct_or_not_yet_researched'
  const first = Math.floor((sequence - 6) / 10) * 10 + 6
  const last = Math.min(first + 9, 675)
  return `scripts/source-first/batches/batch-${String(first).padStart(4, '0')}-${String(last).padStart(4, '0')}.mjs`
}

function uaeFindingRows(researchRecords) {
  const rows = []
  for (const record of researchRecords) {
    if (!['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(record.source_status)) continue
    if (record.source_status === 'partial_exact_source_verified') {
      rows.push({
        workflow_id: record.workflow_id,
        finding_type: 'partial_applicability',
        source_status: record.source_status,
        evidence_basis: 'Structured source status remains partial_exact_source_verified.',
      })
    }
    if (!/Dubai|UAE|United Arab Emirates/i.test(record.UAE_applicability)) {
      rows.push({
        workflow_id: record.workflow_id,
        finding_type: 'missing_explicit_uae_evidence',
        source_status: record.source_status,
        evidence_basis: 'The recorded evidence contains no explicit UAE, United Arab Emirates, or Dubai applicability statement.',
      })
    }
  }
  return rows.sort((left, right) => `${left.workflow_id}/${left.finding_type}`.localeCompare(`${right.workflow_id}/${right.finding_type}`))
}

const existingGlobalRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl'))
const currentSupported = getResearchPaths().flatMap((researchPath) => {
  const research = readJson(researchPath)
  return (research.legacy_item_support_mappings ?? []).map((mapping) => ({ workflowId: research.workflow_id, mapping, researchPath }))
})
if (currentSupported.length === 0 && existingGlobalRows.length === EXPECTED_SUPPORTED_BEFORE) {
  console.log(JSON.stringify({ status: 'PASS_ALREADY_APPLIED', correction_records: existingGlobalRows.length }, null, 2))
  process.exit(0)
}
if (currentSupported.length !== EXPECTED_SUPPORTED_BEFORE) {
  throw new Error(`Expected ${EXPECTED_SUPPORTED_BEFORE} supported mappings before correction; found ${currentSupported.length}`)
}

const manifestPath = path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json')
const manifest = readJson(manifestPath)
const sequenceByWorkflow = new Map(manifest.workflows.map((entry) => [entry.workflow_id, entry.sequence]))
const sourcesById = sourceRegistry()
const explicitBefore = new Set(readJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'))
  .map((row) => [row.workflow_id, row.item_id, row.source_id, row.section_id].join('\u0000')))
const unsupportedBefore = new Set(readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'))
  .map((row) => `${row.workflow_id}\u0000${row.item_id}`))
if (unsupportedBefore.size !== EXPECTED_UNSUPPORTED_BEFORE) throw new Error('Unexpected unsupported baseline')
const { keys: runtimeBefore, failedBatches } = await historicalRuntimeKeys()

const workflowsById = new Map(getWorkflowPaths().map((workflowPath) => {
  const workflow = readJson(workflowPath)
  return [workflow.workflow_id, { workflow, workflowPath }]
}))
const mappingCounts = new Map()
for (const { workflowId, mapping } of currentSupported) {
  const key = oldMappingKey(workflowId, mapping)
  mappingCounts.set(key, (mappingCounts.get(key) ?? 0) + 1)
}

const inventoryRows = []
const correctionRows = []
const affectedWorkflowIds = new Set()
for (const { workflowId, mapping, researchPath } of currentSupported) {
  const key = oldMappingKey(workflowId, mapping)
  const { workflow } = workflowsById.get(workflowId)
  const item = listClinicalItems(workflow).find((candidate) => candidate.item_id === mapping.item_id)
  const source = sourcesById.get(mapping.source_id)
  const section = source?.exact_sections?.find((candidate) => candidate.section_id === mapping.source_section_id)
  const runtimeEmitted = runtimeBefore.has(key)
  const sourceHash = source ? sha256(source) : null
  const sectionHash = section ? sha256(section) : null
  const runtimeGapReason = runtimeEmitted
    ? null
    : 'Persisted support originated from a retired historical batch path that cannot emit canonical mappings.'
  inventoryRows.push({
    mapping_key: key,
    workflow_id: workflowId,
    item_id: mapping.item_id,
    source_id: mapping.source_id,
    section_id: mapping.source_section_id,
    current_storage_location: path.relative(ROOT_DIR, researchPath).replaceAll('\\', '/'),
    current_generation_path: generationPath(sequenceByWorkflow.get(workflowId)),
    runtime_emitted: runtimeEmitted,
    runtime_gap_reason: runtimeGapReason,
    represented_in_explicit_ledger: explicitBefore.has(key),
    item_level_population_applicability_persisted: false,
    item_level_setting_applicability_persisted: false,
    item_level_uae_applicability_persisted: false,
    workflow_specific_rationale_persisted: false,
    source_hash_persisted: false,
    section_hash_persisted: false,
    computed_source_hash: sourceHash,
    computed_section_hash: sectionHash,
    exact_source_and_section_exist: Boolean(source && section),
    exact_item_exists: Boolean(item),
    item_also_marked_unsupported: unsupportedBefore.has(`${workflowId}\u0000${mapping.item_id}`),
    duplicate_or_conflicting: mappingCounts.get(key) !== 1,
  })
  correctionRows.push({
    original_mapping_key: key,
    workflow_id: workflowId,
    item_id: mapping.item_id,
    source_id: mapping.source_id,
    section_id: mapping.source_section_id,
    prior_storage_location: path.relative(ROOT_DIR, researchPath).replaceAll('\\', '/'),
    prior_runtime_emission_status: runtimeEmitted ? 'runtime_emitted' : 'not_runtime_emitted',
    item_level_population_applicability: 'missing',
    item_level_setting_applicability: 'missing',
    item_level_uae_applicability: 'missing',
    rationale_status: 'missing',
    evidence_hash_verdict: source && section ? 'computable_but_not_persisted_at_mapping_level' : 'invalid_source_or_section',
    direct_support_verdict: typeof mapping.direct_relationship === 'string' && mapping.direct_relationship.trim()
      ? 'recorded_but_requires_clinician_review_without_canonical_applicability'
      : 'missing',
    final_disposition: 'REMOVE_TO_UNSUPPORTED',
    final_canonical_mapping_key: null,
    removal_reason: 'Required item-level population, setting, UAE applicability, source/section hashes, mapping version, and substantive workflow-specific rationale were not persisted and may not be fabricated.',
    clinician_review_reason: 'Qualified clinician review and explicit canonical item-level mapping authorship are required before reinstatement.',
    resulting_support_status: 'unsupported_pending_review',
  })
  affectedWorkflowIds.add(workflowId)
}
inventoryRows.sort((left, right) => left.mapping_key.localeCompare(right.mapping_key))
correctionRows.sort((left, right) => left.original_mapping_key.localeCompare(right.original_mapping_key))
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl'), inventoryRows)
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl'), correctionRows)

const gpLedger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))
const gpCorrectionWorkflowIds = new Set(readJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl')).map((row) => row.workflow_id))
const allGpCorrectionWorkflowIds = new Set([
  ...gpLedger.workflows.map((record) => record.workflowId),
  'gp-cough', 'gp-dizziness', 'gp-fever-urti', 'gp-headache', 'gp-sore-throat',
])
const unrelatedGpIds = [...allGpCorrectionWorkflowIds].filter((workflowId) => !gpCorrectionWorkflowIds.has(workflowId)).sort()
if (unrelatedGpIds.length !== 19) throw new Error(`Expected 19 unrelated GP metadata records; found ${unrelatedGpIds.length}`)
const metadataCleanupRows = []
for (const workflowId of unrelatedGpIds) {
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const current = readJson(researchPath)
  const historical = readHistoricalResearch(workflowId)
  metadataCleanupRows.push({
    workflow_id: workflowId,
    metadata_added_incorrectly: [
      'population_applicability', 'setting_applicability', 'UAE_applicability',
      'unresolved_source_gaps correction entry', 'technical_audit.gp_mapping_correction', 'evidence_hash',
    ],
    metadata_removed: 'Inapplicable GP mapping-correction text restored to the pre-correction research record.',
    clinical_mapping_changed: false,
  })
  writeJson(researchPath, historical)
  if ((current.legacy_item_support_mappings ?? []).length !== 0 || (historical.legacy_item_support_mappings ?? []).length !== 0) {
    throw new Error(`${workflowId}: unrelated metadata cleanup unexpectedly encountered a mapping`)
  }
}
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_UNRELATED_METADATA_CLEANUP_LEDGER.jsonl'), metadataCleanupRows)

for (const workflowId of gpCorrectionWorkflowIds) {
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const current = readJson(researchPath)
  const historical = readHistoricalResearch(workflowId)
  current.population_applicability = historical.population_applicability
  current.setting_applicability = historical.setting_applicability
  current.UAE_applicability = historical.UAE_applicability
  writeJson(researchPath, updateEvidenceHash(current))
}

for (const workflowId of affectedWorkflowIds) {
  const { workflow, workflowPath } = workflowsById.get(workflowId)
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const research = readJson(researchPath)
  const items = listClinicalItems(workflow)
  const mappedIds = new Set((research.legacy_item_support_mappings ?? []).map((mapping) => mapping.item_id))
  for (const item of items) {
    if (!mappedIds.has(item.item_id)) continue
    item.source_ids = []
    item.source_section_ids = []
    item.clinical_review_status = UNSUPPORTED_STATUS
    delete item.evidence_relationship
  }
  const legacyItems = items.filter((item) => ['legacy_exact', 'legacy_cleaned'].includes(item.origin))
  workflow.supported_legacy_item_count = 0
  workflow.unsupported_legacy_item_count = legacyItems.length
  workflow.application_generation_eligible = false
  workflow.clinical_review_required = true
  workflow.active_clinical_approval = false
  workflow.technical_audit_passed = true
  workflow.provenance_audit_passed = true
  writeJson(workflowPath, updateWorkflowHash(workflow))

  research.legacy_item_support_mappings = []
  research.supported_legacy_item_count = 0
  research.unsupported_legacy_item_count = legacyItems.length
  research.unsupported_legacy_item_ids = legacyItems.map((item) => item.item_id)
  research.evidence_items = (research.evidence_items ?? []).map((evidenceItem) => ({
    ...evidenceItem,
    content_mapping_status: 'reviewed_not_mapped_to_legacy_content',
  }))
  research.unresolved_source_gaps = [...new Set([...(research.unresolved_source_gaps ?? []), GLOBAL_GAP])]
  research.technical_audit = {
    ...(research.technical_audit ?? {}),
    status: 'PASS_WITH_CLINICAL_BLOCKERS',
    provenance_complete: true,
    source_gap_marked_as_pass: false,
    qualified_clinician_review_required: true,
    global_mapping_correction: 'all_noncanonical_supported_mappings_removed',
  }
  writeJson(researchPath, updateEvidenceHash(research))
}

writeJsonl(path.join(EXPANSION_DIR, 'progress', 'CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl'), [])
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'), [])

const allWorkflows = getWorkflowPaths().map((workflowPath) => readJson(workflowPath))
const unsupportedRows = allWorkflows.flatMap((workflow) => listClinicalItems(workflow)
  .filter((item) => ['legacy_exact', 'legacy_cleaned'].includes(item.origin))
  .map((item) => unsupportedRow(workflow.workflow_id, item)))
  .sort((left, right) => `${left.workflow_id}/${left.item_id}`.localeCompare(`${right.workflow_id}/${right.item_id}`))
if (unsupportedRows.length !== EXPECTED_TOTAL_ITEMS) throw new Error(`Expected ${EXPECTED_TOTAL_ITEMS} unsupported items; found ${unsupportedRows.length}`)
writeJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'), unsupportedRows)

const auditPath = path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl')
const auditRows = readJsonl(auditPath)
for (const row of auditRows) {
  if (!affectedWorkflowIds.has(row.workflow_id)) continue
  row.supported_legacy_items = 0
  row.unsupported_legacy_items = listClinicalItems(readJson(path.join(EXPANSION_DIR, 'workflows', `${row.workflow_id}.json`))).length
  row.mapping_correction = 'all_noncanonical_supported_mappings_removed'
}
writeJsonl(auditPath, auditRows)

const executionLogPath = path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl')
const executionRows = readJsonl(executionLogPath)
for (const row of executionRows) {
  if (!affectedWorkflowIds.has(row.workflow_id) || !Object.hasOwn(row, 'supported_legacy_items')) continue
  row.original_supported_legacy_items ??= row.supported_legacy_items
  row.supported_legacy_items = 0
  row.unsupported_legacy_items = listClinicalItems(readJson(path.join(EXPANSION_DIR, 'workflows', `${row.workflow_id}.json`))).length
  row.mapping_correction = 'all_noncanonical_supported_mappings_removed'
}
executionRows.push({
  timestamp: CHECKPOINT_TIMESTAMP,
  event: 'global_mapping_architecture_corrected',
  mappings_audited: EXPECTED_SUPPORTED_BEFORE,
  mappings_retained: 0,
  mappings_removed_to_unsupported: EXPECTED_SUPPORTED_BEFORE,
  canonical_supported_mappings: 0,
  unsupported_legacy_items: unsupportedRows.length,
  failed_historical_runtime_batches: failedBatches.length,
})
writeJsonl(executionLogPath, executionRows)

rebuildIndexesAndHashManifest()
const finalResearch = getResearchPaths().map((researchPath) => readJson(researchPath))
const finalWorkflows = new Map(getWorkflowPaths().map((workflowPath) => {
  const workflow = readJson(workflowPath)
  return [workflow.workflow_id, workflow]
}))
for (const entry of manifest.workflows) {
  const workflow = finalWorkflows.get(entry.workflow_id)
  const research = finalResearch.find((record) => record.workflow_id === entry.workflow_id)
  entry.workflow_hash = workflow.content_hash
  entry.evidence_hash = research.evidence_hash
}
const statusCount = (status) => finalResearch.filter((record) => record.source_status === status).length
manifest.exact_source_verified_count = statusCount('exact_workflow_source_verified')
manifest.partial_exact_source_verified_count = statusCount('partial_exact_source_verified')
manifest.no_authoritative_source_count = statusCount('no_authoritative_source_found')
manifest.conflicting_authoritative_source_count = statusCount('conflicting_authoritative_sources')
manifest.source_access_failed_count = statusCount('source_access_failed')
manifest.research_interrupted_count = statusCount('research_interrupted')
manifest.research_completed_workflow_count = finalResearch.length - manifest.research_interrupted_count
manifest.processed_workflow_count = manifest.research_completed_workflow_count
manifest.terminal_research_workflow_count = manifest.research_completed_workflow_count
manifest.source_supported_legacy_item_count = 0
manifest.unsupported_legacy_item_count = unsupportedRows.length
manifest.canonical_supported_mapping_count = 0
manifest.runtime_emitted_supported_mapping_count = 0
writeJson(manifestPath, manifest)

const uaeRows = uaeFindingRows(finalResearch)
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl'), uaeRows)
const uaeAffected = new Set(uaeRows.map((row) => row.workflow_id))
const uaePartial = uaeRows.filter((row) => row.finding_type === 'partial_applicability').length
const uaeMissing = uaeRows.filter((row) => row.finding_type === 'missing_explicit_uae_evidence').length

const checkpointPath = path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json')
const checkpoint = readJson(checkpointPath)
Object.assign(checkpoint.counts, {
  source_supported_legacy_items: 0,
  unsupported_legacy_items: unsupportedRows.length,
  uae_applicability_affected_workflows: uaeAffected.size,
  uae_applicability_individual_findings: uaeRows.length,
  uae_partial_applicability_findings: uaePartial,
  uae_missing_explicit_evidence_findings: uaeMissing,
  uae_other_applicability_findings: 0,
})
checkpoint.clinical_blocker_commands = checkpoint.clinical_blocker_commands.map((entry) => {
  if (entry.command === 'npm run audit:uae-applicability') return { ...entry, reason: `${uaeAffected.size} evidenced workflow(s) have ${uaeRows.length} structured UAE-applicability finding(s): ${uaePartial} partial-applicability, ${uaeMissing} missing-explicit-evidence, and 0 other.` }
  if (entry.command === 'npm run audit:unsupported-legacy-content') return { ...entry, reason: `${unsupportedRows.length} exact legacy-preservation items lack canonical item-level mapping and qualified clinician review.` }
  return entry
})
writeJson(checkpointPath, checkpoint)

console.log(JSON.stringify({
  status: 'PASS_WITH_CLINICAL_BLOCKERS',
  inventory_records: inventoryRows.length,
  correction_records: correctionRows.length,
  mappings_retained: 0,
  mappings_removed: correctionRows.length,
  runtime_mappings_before: runtimeBefore.size,
  runtime_gap_before: inventoryRows.filter((row) => !row.runtime_emitted).length,
  failed_historical_runtime_batches: failedBatches.length,
  canonical_mappings_after: 0,
  unsupported_items_after: unsupportedRows.length,
  affected_workflows: affectedWorkflowIds.size,
  unrelated_metadata_records_corrected: metadataCleanupRows.length,
  uae_affected_workflows: uaeAffected.size,
  uae_findings: uaeRows.length,
  next_workflow_id: manifest.next_workflow_id,
}, null, 2))

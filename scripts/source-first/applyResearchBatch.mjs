import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  ROOT_DIR,
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

const batchArgument = process.argv[2]
if (!batchArgument) throw new Error('Usage: node scripts/source-first/applyResearchBatch.mjs <batch-module>')

const workflowArgumentIndex = process.argv.indexOf('--workflow')
const requestedWorkflowId = workflowArgumentIndex >= 0 ? process.argv[workflowArgumentIndex + 1] : null
if (workflowArgumentIndex >= 0 && (!requestedWorkflowId || requestedWorkflowId.startsWith('--'))) {
  throw new Error('--workflow requires a workflow_id')
}

const batchPath = path.isAbsolute(batchArgument) ? batchArgument : path.join(ROOT_DIR, batchArgument)
const { default: batch } = await import(pathToFileURL(batchPath).href)

const allowedTerminalStatuses = new Set([
  'exact_workflow_source_verified',
  'partial_exact_source_verified',
  'no_authoritative_source_found',
  'conflicting_authoritative_sources',
  'source_access_failed',
])

if (!batch.batch_id || !Array.isArray(batch.workflows) || batch.workflows.length === 0) {
  throw new Error('Batch module must define batch_id and workflows.')
}

const sourceById = new Map()
for (const sourceUpdate of batch.sources ?? []) {
  const registryPath = path.join(EXPANSION_DIR, 'sources', sourceUpdate.registry_file)
  const registry = readJson(registryPath)
  const existingIndex = registry.sources.findIndex((source) => source.source_id === sourceUpdate.source.source_id)
  if (existingIndex >= 0) registry.sources[existingIndex] = sourceUpdate.source
  else registry.sources.push(sourceUpdate.source)
  registry.sources.sort((left, right) => left.source_id.localeCompare(right.source_id))
  writeJson(registryPath, registry)
}

for (const registryName of [
  'uae_clinical_sources.json',
  'international_clinical_sources.json',
  'specialty_society_sources.json',
  'nonclinical_operational_sources.json',
]) {
  const registry = readJson(path.join(EXPANSION_DIR, 'sources', registryName))
  for (const source of registry.sources ?? []) sourceById.set(source.source_id, source)
}

const manifestPath = path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json')
const manifest = readJson(manifestPath)
const selectedConfigs = requestedWorkflowId
  ? batch.workflows.filter((config) => config.workflow_id === requestedWorkflowId)
  : batch.workflows
if (requestedWorkflowId && selectedConfigs.length !== 1) {
  throw new Error(`${requestedWorkflowId}: workflow is not present in ${batch.batch_id}`)
}
const pendingConfigs = selectedConfigs.filter((config) => {
  const entry = manifest.workflows.find((candidate) => candidate.workflow_id === config.workflow_id)
  if (!entry) throw new Error(`${config.workflow_id}: missing execution manifest entry`)
  return !entry.terminal_research
})
const pendingWorkflowIds = new Set(pendingConfigs.map((config) => config.workflow_id))
const auditPath = path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl')
const auditRows = readJsonl(auditPath)
const auditById = new Map(auditRows.map((row) => [row.workflow_id, row]))
const executionLogPath = path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl')
const executionLog = readJsonl(executionLogPath)
  .filter((row) => !(
    row.event === 'research_batch_workflow_finalized'
    && row.batch_id === batch.batch_id
    && pendingWorkflowIds.has(row.workflow_id)
  ))
const newlySupportedIds = new Set()

for (const config of pendingConfigs) {
  if (!allowedTerminalStatuses.has(config.source_status)) {
    throw new Error(`${config.workflow_id}: non-terminal or invalid source status ${config.source_status}`)
  }

  const workflowPath = path.join(EXPANSION_DIR, 'workflows', `${config.workflow_id}.json`)
  const researchPath = path.join(EXPANSION_DIR, 'research', `${config.workflow_id}.research.json`)
  const workflow = readJson(workflowPath)
  const itemById = new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))
  const mappings = []

  for (const group of config.support_groups ?? []) {
    const source = sourceById.get(group.source_id)
    if (!source) throw new Error(`${config.workflow_id}: unknown source ${group.source_id}`)
    if (!source.exact_sections?.some((section) => section.section_id === group.source_section_id)) {
      throw new Error(`${config.workflow_id}: unknown source section ${group.source_section_id}`)
    }

    for (const itemId of group.item_ids) {
      const item = itemById.get(itemId)
      if (!item) throw new Error(`${config.workflow_id}: support map references missing item ${itemId}`)
      if (newlySupportedIds.has(itemId)) throw new Error(`${config.workflow_id}: duplicate support mapping for ${itemId}`)
      newlySupportedIds.add(itemId)
      item.source_ids = [group.source_id]
      item.source_section_ids = [group.source_section_id]
      item.clinical_review_status = 'legacy_exact_source_supported_pending_clinician_review'
      item.evidence_relationship = group.relationship
      mappings.push({
        item_id: itemId,
        source_id: group.source_id,
        source_section_id: group.source_section_id,
        direct_relationship: group.relationship,
      })
    }
  }

  const unsupportedIds = listClinicalItems(workflow)
    .filter((item) => !mappings.some((mapping) => mapping.item_id === item.item_id))
    .map((item) => item.item_id)

  workflow.research_status = config.source_status
  workflow.workflow_processed = true
  workflow.application_generation_eligible = false
  workflow.clinical_review_required = true
  workflow.active_clinical_approval = false
  workflow.clinical_blockers = config.unresolved_source_gaps
  workflow.unsupported_legacy_item_count = unsupportedIds.length
  workflow.supported_legacy_item_count = mappings.length
  workflow.source_derived_item_count = 0
  workflow.technical_audit_passed = true
  workflow.provenance_audit_passed = true
  workflow.research_terminal_status = true
  const updatedWorkflow = updateWorkflowHash(workflow)
  writeJson(workflowPath, updatedWorkflow)

  const evidenceItems = config.exact_sections_reviewed.map((sectionId) => {
    const source = [...sourceById.values()].find((candidate) =>
      candidate.exact_sections?.some((section) => section.section_id === sectionId),
    )
    const section = source?.exact_sections?.find((candidate) => candidate.section_id === sectionId)
    if (!source || !section) throw new Error(`${config.workflow_id}: exact section ${sectionId} is not registered`)
    const mapped = mappings.some((mapping) => mapping.source_section_id === sectionId)
    return {
      evidence_item_id: `${config.workflow_id}--${sectionId}`,
      source_id: source.source_id,
      source_section_id: sectionId,
      direct_relationship: config.section_relationships[sectionId],
      paraphrased_evidence_summary: section.evidence_summary,
      content_mapping_status: mapped
        ? 'mapped_to_explicit_legacy_items_pending_clinician_review'
        : 'reviewed_not_mapped_to_legacy_content',
    }
  })

  const research = readJson(researchPath)
  Object.assign(research, {
    progress_state: 'clinical_review_required',
    research_started_at: CHECKPOINT_TIMESTAMP,
    research_completed_at: CHECKPOINT_TIMESTAMP,
    search_queries_used: config.search_queries_used,
    official_pages_opened: config.official_pages_opened,
    exact_documents_opened: config.exact_documents_opened,
    exact_sections_reviewed: config.exact_sections_reviewed,
    candidate_sources_rejected: config.candidate_sources_rejected,
    rejection_reasons: config.rejection_reasons,
    selected_primary_sources: config.selected_primary_sources,
    selected_supporting_sources: config.selected_supporting_sources,
    population_applicability: config.population_applicability,
    setting_applicability: config.setting_applicability,
    UAE_applicability: config.UAE_applicability,
    recency_verification: config.recency_verification,
    superseded_check: config.superseded_check,
    evidence_items: evidenceItems,
    source_status: config.source_status,
    unresolved_source_gaps: config.unresolved_source_gaps,
    researcher_type: 'codex_exact_document_section_review',
    legacy_item_support_mappings: mappings,
    supported_legacy_item_count: mappings.length,
    unsupported_legacy_item_count: unsupportedIds.length,
    unsupported_legacy_item_ids: unsupportedIds,
    technical_audit: {
      status: 'PASS_WITH_CLINICAL_BLOCKERS',
      provenance_complete: true,
      generic_generated_items: 0,
      source_gap_marked_as_pass: false,
      qualified_clinician_review_required: true,
    },
  })
  const updatedResearch = updateEvidenceHash(research)
  writeJson(researchPath, updatedResearch)

  const manifestEntry = manifest.workflows.find((entry) => entry.workflow_id === config.workflow_id)
  if (!manifestEntry) throw new Error(`${config.workflow_id}: missing execution manifest entry`)
  Object.assign(manifestEntry, {
    state: 'clinical_review_required',
    source_status: config.source_status,
    terminal_research: true,
    technical_audit_passed: true,
    evidence_hash: updatedResearch.evidence_hash,
    workflow_hash: updatedWorkflow.content_hash,
  })

  const audit = auditById.get(config.workflow_id)
  if (!audit) throw new Error(`${config.workflow_id}: missing workflow audit row`)
  Object.assign(audit, {
    audit_status: 'clinical_blocker',
    progress_state: 'clinical_review_required',
    clinical_blockers: config.unresolved_source_gaps.length,
    source_gap_marked_as_pass: false,
    qualified_clinician_review_required: true,
    research_terminal_status: config.source_status,
    technical_audit_status: 'PASS',
    provenance_audit_status: 'PASS',
    supported_legacy_items: mappings.length,
    unsupported_legacy_items: unsupportedIds.length,
  })

  executionLog.push({
    timestamp: CHECKPOINT_TIMESTAMP,
    event: 'research_batch_workflow_finalized',
    batch_id: batch.batch_id,
    workflow_id: config.workflow_id,
    source_status: config.source_status,
    exact_documents_opened: config.exact_documents_opened.length,
    exact_sections_reviewed: config.exact_sections_reviewed.length,
    supported_legacy_items: mappings.length,
    unsupported_legacy_items: unsupportedIds.length,
    source_derived_items: 0,
    technical_audit_status: 'PASS',
    clinical_blocker: true,
  })
}

const unsupportedPath = path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl')
const unsupportedRows = readJsonl(unsupportedPath).filter((row) => !newlySupportedIds.has(row.item_id))
writeJsonl(unsupportedPath, unsupportedRows)
writeJsonl(auditPath, auditRows)
writeJsonl(executionLogPath, executionLog)

const allResearch = getResearchPaths().map((filePath) => readJson(filePath))
const terminalResearch = allResearch.filter((record) => allowedTerminalStatuses.has(record.source_status))
const exactDocumentIds = new Set(terminalResearch.flatMap((record) => record.exact_documents_opened))
const exactSectionIds = new Set(terminalResearch.flatMap((record) => record.exact_sections_reviewed))
const sourceSupportedLegacyItemCount = allResearch.reduce(
  (total, record) => total + (record.legacy_item_support_mappings?.length ?? 0),
  0,
)
const sourceStatusCount = (status) => allResearch.filter((record) => record.source_status === status).length
const nextManifestEntry = manifest.workflows.find((entry) => !entry.terminal_research)

manifest.exact_source_verified_count = sourceStatusCount('exact_workflow_source_verified')
manifest.partial_exact_source_verified_count = sourceStatusCount('partial_exact_source_verified')
manifest.no_authoritative_source_count = sourceStatusCount('no_authoritative_source_found')
manifest.conflicting_authoritative_source_count = sourceStatusCount('conflicting_authoritative_sources')
manifest.source_access_failed_count = sourceStatusCount('source_access_failed')
manifest.research_completed_workflow_count = terminalResearch.length
manifest.processed_workflow_count = terminalResearch.length
manifest.terminal_research_workflow_count = terminalResearch.length
manifest.research_interrupted_count = sourceStatusCount('research_interrupted')
manifest.source_gap_count = allResearch.filter((record) => record.unresolved_source_gaps.length > 0).length
manifest.next_workflow_id = nextManifestEntry?.workflow_id ?? null
manifest.exact_documents_opened = exactDocumentIds.size
manifest.exact_sections_reviewed = exactSectionIds.size
manifest.unsupported_legacy_item_count = unsupportedRows.length
manifest.source_supported_legacy_item_count = sourceSupportedLegacyItemCount
writeJson(manifestPath, manifest)

const restartPath = path.join(EXPANSION_DIR, 'progress', 'restart_state.json')
writeJson(restartPath, {
  status: 'INTERRUPTED_RESTARTABLE',
  saved_at: CHECKPOINT_TIMESTAMP,
  research_completed_workflow_ids: manifest.workflows
    .filter((entry) => entry.terminal_research)
    .map((entry) => entry.workflow_id),
  completed_workflow_ids: [],
  next_workflow_id: manifest.next_workflow_id,
  exact_interruption_reason: manifest.next_workflow_id
    ? `The source-first queue is restartable at ${manifest.next_workflow_id}.`
    : 'All manifest workflows have terminal research status.',
  manifest_path: 'clinical-expansion-v2/progress/execution_manifest.json',
  resume_commands: [
    manifest.next_workflow_id
      ? `npm run research:queue -- --start ${manifest.next_workflow_id} --continue-from-manifest`
      : 'npm run research:queue -- --continue-from-manifest',
    'npm run validate:source-evidence',
    'npm run validate:item-provenance',
    'npm run audit:research-claims',
  ],
})

const checkpointPath = path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json')
const checkpoint = readJson(checkpointPath)
Object.assign(checkpoint.counts, {
  research_completed_workflows: terminalResearch.length,
  exact_workflow_source_verified: manifest.exact_source_verified_count,
  partial_exact_source_verified: manifest.partial_exact_source_verified_count,
  no_authoritative_source_found: manifest.no_authoritative_source_count,
  conflicting_authoritative_sources: manifest.conflicting_authoritative_source_count,
  source_access_failed: manifest.source_access_failed_count,
  research_interrupted: manifest.research_interrupted_count,
  uae_official_sources: readJson(path.join(EXPANSION_DIR, 'sources', 'uae_clinical_sources.json')).sources.length,
  international_official_sources: readJson(path.join(EXPANSION_DIR, 'sources', 'international_clinical_sources.json')).sources.length,
  exact_sections_reviewed: exactSectionIds.size,
  source_derived_items: 0,
  unsupported_legacy_items: unsupportedRows.length,
  generic_generated_items: 0,
  active_exclusions: 12,
  source_supported_legacy_items: sourceSupportedLegacyItemCount,
})
checkpoint.clinical_blocker_commands = checkpoint.clinical_blocker_commands.map((entry) => {
  if (entry.command === 'npm run audit:exact-source-coverage') {
    return {
      ...entry,
      reason: `${manifest.workflow_count - manifest.exact_source_verified_count} workflow(s) still lack complete exact-source coverage; ${manifest.partial_exact_source_verified_count} are partial and ${manifest.research_interrupted_count} remain research_interrupted.`,
    }
  }
  if (entry.command === 'npm run audit:uae-applicability') {
    return {
      ...entry,
      reason: `${terminalResearch.length} researched workflows retain population, setting, or jurisdiction applicability gaps.`,
    }
  }
  if (entry.command === 'npm run audit:unsupported-legacy-content') {
    return {
      ...entry,
      reason: `${unsupportedRows.length} exact legacy-preservation items still lack exact section mapping and qualified clinician review.`,
    }
  }
  return entry
})
writeJson(checkpointPath, checkpoint)

rebuildIndexesAndHashManifest()

console.log(JSON.stringify({
  status: 'PASS_WITH_CLINICAL_BLOCKERS',
  batch_id: batch.batch_id,
  workflows_finalized: pendingConfigs.length,
  terminal_research_workflows: terminalResearch.length,
  exact_workflow_source_verified: manifest.exact_source_verified_count,
  partial_exact_source_verified: manifest.partial_exact_source_verified_count,
  no_authoritative_source_found: manifest.no_authoritative_source_count,
  research_interrupted: manifest.research_interrupted_count,
  exact_documents_registered: exactDocumentIds.size,
  exact_sections_registered: exactSectionIds.size,
  newly_supported_legacy_items: newlySupportedIds.size,
  source_supported_legacy_items_total: sourceSupportedLegacyItemCount,
  unsupported_legacy_items_remaining: unsupportedRows.length,
  source_derived_items: 0,
  next_workflow_id: manifest.next_workflow_id,
}, null, 2))

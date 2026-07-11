import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  expansionRoot,
  readJson,
  sha256,
  stableJson,
  writeJson,
} from './common.mjs'

export const generatedDataFileMap = {
  'clinical_workflows.json': (dataset) => dataset.workflows.map((workflow) => ({
    ...dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].clinical_workflow,
    risk_tier: workflow.governance.risk_tier,
    review_priority: workflow.governance.review_priority,
    source_status: workflow.governance.source_status,
    automated_qa_status: workflow.governance.automated_qa_status,
    clinical_review_status: workflow.governance.clinical_review_status,
    limited_testing_status: workflow.governance.limited_testing_status,
    public_release_status: workflow.governance.public_release_status,
  })),
  'workflow_chips.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].workflow_chips),
  'diagnosis_index.json': (dataset) => dataset.shared_application_data.diagnosis_index,
  'speed_presets.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].speed_preset),
  'specialty_history_layouts.json': (dataset) => dataset.shared_application_data.specialty_history_layouts,
  'v4_workflow_history_drafts.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].history_draft),
  'v4_workflow_exam_details.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].exam_details),
  'v4_investigation_options.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].investigation_options),
  'v4_plan_options.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].plan_options),
  'v4_plan_medication_options.json': (dataset) => dataset.workflows.map((workflow) => dataset.application_projection_by_workflow_id[workflow.identity.workflow_id].medication_options).filter(Boolean),
  'workflow_review_metadata.json': (dataset) => dataset.workflows.map((workflow) => ({
    workflow_id: workflow.identity.workflow_id,
    risk_tier: workflow.governance.risk_tier,
    review_priority: workflow.governance.review_priority,
    source_status: workflow.governance.source_status,
    source_mapping_status: workflow.guideline_provenance.source_mapping_status,
    source_recency_status: workflow.guideline_provenance.source_recency_status,
    primary_source_ids: workflow.guideline_provenance.primary_source_ids,
    automated_qa_status: workflow.governance.automated_qa_status,
    clinical_review_status: workflow.governance.clinical_review_status,
    limited_testing_status: workflow.governance.limited_testing_status,
    public_release_status: workflow.governance.public_release_status,
  })),
}

export function loadCanonicalDataset() {
  return readJson(path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json'))
}

export function buildGeneratedPayloads(dataset) {
  return Object.fromEntries(Object.entries(generatedDataFileMap).map(([filename, build]) => [filename, build(dataset)]))
}

export function buildExclusionConfig(dataset, existingConfig) {
  const existingById = new Map((existingConfig.exclusions ?? []).map((entry) => [entry.workflow_id, entry]))
  for (const workflow of dataset.workflows) {
    if (workflow.governance.risk_tier !== 'tier_4' && workflow.governance.risk_tier !== 'tier_5') continue
    const workflowId = workflow.identity.workflow_id
    if (existingById.has(workflowId)) continue
    existingById.set(workflowId, {
      workflow_id: workflowId,
      exclusion_reason: 'High-risk documentation workflow requires qualified clinician review before limited internal testing.',
      category: 'requires_doctor_review',
      testing_status: 'excluded_from_limited_testing',
    })
  }
  return {
    updated_at: SOURCE_REVIEW_DATE,
    exclusions: [...existingById.values()].sort((left, right) => left.workflow_id.localeCompare(right.workflow_id)),
  }
}

export function writeGeneratedPayloads({ dataset, dataDirectory, configDirectory, existingExclusionConfig }) {
  const payloads = buildGeneratedPayloads(dataset)
  for (const [filename, payload] of Object.entries(payloads)) writeJson(path.join(dataDirectory, filename), payload)
  const exclusions = buildExclusionConfig(dataset, existingExclusionConfig)
  writeJson(path.join(configDirectory, 'limited_testing_exclusions.json'), exclusions)
  return { payloads, exclusions }
}

export function buildGenerationManifest(dataset, payloads, exclusions) {
  const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')
  const generatedFileHashes = Object.fromEntries(
    Object.entries(payloads).map(([filename, payload]) => [`public/data/${filename}`, sha256(stableJson(payload))]),
  )
  generatedFileHashes['public/config/limited_testing_exclusions.json'] = sha256(stableJson(exclusions))
  return {
    schema_version: dataset.schema_version,
    exporter_version: dataset.exporter_version,
    generation_date: SOURCE_REVIEW_DATE,
    canonical_file: 'clinical-expansion/canonical/expanded_workflows_v1.json',
    canonical_file_hash: sha256(fs.readFileSync(canonicalPath)),
    workflow_count: dataset.workflows.length,
    per_file_entry_count: Object.fromEntries(Object.entries(payloads).map(([filename, payload]) => [
      `public/data/${filename}`,
      Array.isArray(payload) ? payload.length : Array.isArray(payload.entries) ? payload.entries.length : Object.keys(payload).length,
    ])),
    generated_file_hashes: generatedFileHashes,
    exclusion_count: exclusions.exclusions.length,
  }
}

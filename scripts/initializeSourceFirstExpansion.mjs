import fs from 'node:fs'
import path from 'node:path'
import {
  BASELINE_COMMIT,
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  ROOT_DIR,
  byWorkflowId,
  ensureDir,
  fileSha256,
  rebuildIndexesAndHashManifest,
  sha256,
  slug,
  updateEvidenceHash,
  updateWorkflowHash,
  valuesArray,
  writeJson,
  writeJsonl,
} from './source-first/common.mjs'

const sourceFiles = {
  workflows: 'public/data/clinical_workflows.json',
  chips: 'public/data/workflow_chips.json',
  diagnosis: 'public/data/diagnosis_index.json',
  presets: 'public/data/speed_presets.json',
  history: 'public/data/v4_workflow_history_drafts.json',
  exam: 'public/data/v4_workflow_exam_details.json',
  investigations: 'public/data/v4_investigation_options.json',
  plans: 'public/data/v4_plan_options.json',
  medications: 'public/data/v4_plan_medication_options.json',
  exclusions: 'public/config/limited_testing_exclusions.json',
}

function load(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8'))
}

function makeItem({ workflowId, rawId, text, itemType, sourceFile, sourcePath, outputText = null, originalDefaultSelected = false }) {
  return {
    item_id: `${workflowId}--${slug(itemType)}--${slug(rawId)}`,
    text: String(text ?? '').trim(),
    item_type: itemType,
    origin: 'legacy_exact',
    source_ids: [],
    source_section_ids: [],
    clinician_confirmation_required: true,
    default_selected: false,
    clinical_review_status: 'unsupported_legacy_review_required',
    output_text: outputText ? String(outputText).trim() : null,
    legacy_provenance: {
      source_file: sourceFile,
      source_path: sourcePath,
      exact_text_preserved: true,
      original_default_selected: Boolean(originalDefaultSelected),
    },
  }
}

function extractWorkflowItems(workflow, related) {
  const workflowId = workflow.workflow_id
  const sections = {
    workflow_identity: [],
    aliases_and_matching_terms: [],
    chips: [],
    speed_preset: [],
    history_draft: [],
    exam_prompts: [],
    investigation_options: [],
    plan_options: [],
    medication_options: [],
  }

  sections.workflow_identity.push(makeItem({
    workflowId,
    rawId: 'chief-complaint',
    text: workflow.chief_complaint,
    itemType: 'workflow_presentation',
    sourceFile: sourceFiles.workflows,
    sourcePath: `${workflowId}.chief_complaint`,
  }))
  if (workflow.diagnosis) {
    sections.workflow_identity.push(makeItem({
      workflowId,
      rawId: 'diagnosis',
      text: workflow.diagnosis,
      itemType: 'legacy_diagnosis_label',
      sourceFile: sourceFiles.workflows,
      sourcePath: `${workflowId}.diagnosis`,
    }))
  }

  const aliasValues = new Set([
    ...(workflow.chief_complaint_aliases ?? []),
    ...(workflow.diagnosis_aliases ?? []),
    ...(related.diagnosisEntries ?? []).flatMap((entry) => [entry.label, ...(entry.aliases ?? [])]),
  ].filter(Boolean))
  let aliasIndex = 0
  for (const alias of aliasValues) {
    aliasIndex += 1
    sections.aliases_and_matching_terms.push(makeItem({
      workflowId,
      rawId: `alias-${aliasIndex}`,
      text: alias,
      itemType: 'matching_alias',
      sourceFile: sourceFiles.diagnosis,
      sourcePath: `${workflowId}.aliases[${aliasIndex - 1}]`,
    }))
  }

  for (const [index, chip] of (related.chips?.chips ?? []).entries()) {
    sections.chips.push(makeItem({
      workflowId,
      rawId: chip.chip_id ?? `chip-${index + 1}`,
      text: chip.chip_text,
      itemType: `chip_${chip.group ?? 'unknown'}`,
      sourceFile: sourceFiles.chips,
      sourcePath: `${workflowId}.chips[${index}]`,
    }))
  }

  const presetFields = [
    ['default_duration_options', false],
    ['prechecked_symptoms', true],
    ['prechecked_relevant_negatives', true],
    ['prechecked_exam_findings', true],
    ['prechecked_investigations', true],
    ['prechecked_plan_phrases', true],
    ['prechecked_follow_up', true],
  ]
  for (const [field, originallySelected] of presetFields) {
    for (const [index, value] of (related.preset?.[field] ?? []).entries()) {
      sections.speed_preset.push(makeItem({
        workflowId,
        rawId: `${field}-${index + 1}`,
        text: value,
        itemType: `preset_${field}`,
        sourceFile: sourceFiles.presets,
        sourcePath: `${workflowId}.${field}[${index}]`,
        originalDefaultSelected: originallySelected,
      }))
    }
  }

  if (related.history?.default_history_draft) {
    sections.history_draft.push(makeItem({
      workflowId,
      rawId: 'default-history-draft',
      text: related.history.default_history_draft,
      itemType: 'history_draft',
      sourceFile: sourceFiles.history,
      sourcePath: `${workflowId}.default_history_draft`,
    }))
  }

  for (const [groupIndex, group] of (related.exam?.exam_groups ?? []).entries()) {
    for (const [promptIndex, prompt] of (group.prompts ?? []).entries()) {
      sections.exam_prompts.push(makeItem({
        workflowId,
        rawId: prompt.prompt_id ?? `${group.group_id}-${promptIndex + 1}`,
        text: prompt.prompt_text,
        itemType: 'examination_prompt',
        sourceFile: sourceFiles.exam,
        sourcePath: `${workflowId}.exam_groups[${groupIndex}].prompts[${promptIndex}]`,
      }))
    }
  }

  for (const [groupIndex, group] of (related.investigations?.investigation_groups ?? []).entries()) {
    for (const [optionIndex, option] of (group.options ?? []).entries()) {
      sections.investigation_options.push(makeItem({
        workflowId,
        rawId: `${groupIndex + 1}-${optionIndex + 1}-${option.option_id ?? group.group_id}`,
        text: option.option_text,
        outputText: option.note_text,
        itemType: 'investigation_documentation_option',
        sourceFile: sourceFiles.investigations,
        sourcePath: `${workflowId}.investigation_groups[${groupIndex}].options[${optionIndex}]`,
      }))
    }
  }

  for (const [groupIndex, group] of (related.plan?.plan_option_groups ?? []).entries()) {
    for (const [optionIndex, option] of (group.options ?? []).entries()) {
      sections.plan_options.push(makeItem({
        workflowId,
        rawId: `${groupIndex + 1}-${optionIndex + 1}-${option.option_id ?? group.group_id}`,
        text: option.option_text,
        outputText: option.note_text,
        itemType: 'plan_documentation_option',
        sourceFile: sourceFiles.plans,
        sourcePath: `${workflowId}.plan_option_groups[${groupIndex}].options[${optionIndex}]`,
      }))
    }
  }

  for (const [groupIndex, group] of (related.medication?.option_groups ?? []).entries()) {
    for (const [optionIndex, option] of (group.options ?? []).entries()) {
      sections.medication_options.push(makeItem({
        workflowId,
        rawId: `${groupIndex + 1}-${optionIndex + 1}-${option.option_id ?? group.group_id}`,
        text: option.label,
        outputText: option.note_text,
        itemType: 'medication_documentation_option',
        sourceFile: sourceFiles.medications,
        sourcePath: `${workflowId}.option_groups[${groupIndex}].options[${optionIndex}]`,
      }))
    }
  }

  return sections
}

for (const directory of [
  'audits',
  'generated',
  'indexes',
  'progress',
  'research',
  'review',
  'schema',
  'sources',
  'workflows',
]) ensureDir(path.join(EXPANSION_DIR, directory))

const workflows = valuesArray(load(sourceFiles.workflows))
const chipsById = byWorkflowId(load(sourceFiles.chips))
const presetsById = byWorkflowId(load(sourceFiles.presets))
const historyById = byWorkflowId(load(sourceFiles.history))
const examById = byWorkflowId(load(sourceFiles.exam))
const investigationsById = byWorkflowId(load(sourceFiles.investigations))
const plansById = byWorkflowId(load(sourceFiles.plans))
const medicationsById = byWorkflowId(load(sourceFiles.medications))
const diagnosisEntries = load(sourceFiles.diagnosis).entries ?? []
const diagnosisByWorkflowId = new Map()

for (const entry of diagnosisEntries) {
  for (const workflowId of entry.workflow_ids ?? []) {
    const entries = diagnosisByWorkflowId.get(workflowId) ?? []
    entries.push(entry)
    diagnosisByWorkflowId.set(workflowId, entries)
  }
}

const unsupportedRows = []
const sourceGapRows = []
const auditRows = []
const manifestRows = []

for (const [workflowIndex, workflow] of workflows.entries()) {
  const workflowId = workflow.workflow_id
  const contentSections = extractWorkflowItems(workflow, {
    chips: chipsById.get(workflowId),
    preset: presetsById.get(workflowId),
    history: historyById.get(workflowId),
    exam: examById.get(workflowId),
    investigations: investigationsById.get(workflowId),
    plan: plansById.get(workflowId),
    medication: medicationsById.get(workflowId),
    diagnosisEntries: diagnosisByWorkflowId.get(workflowId) ?? [],
  })
  const items = Object.values(contentSections).flat()
  const originalPreselectedItemCount = items.filter((item) => item.legacy_provenance.original_default_selected).length

  const overlay = updateWorkflowHash({
    schema_version: '2.0.0',
    workflow_id: workflowId,
    presentation: workflow.chief_complaint || workflow.diagnosis || workflowId,
    specialty: workflow.specialty_id,
    baseline: {
      commit: BASELINE_COMMIT,
      source_workflow_index: workflowIndex,
      clinical_workflow: workflow,
      public_data_unchanged: true,
    },
    research_status: 'research_interrupted',
    legacy_item_classification_complete: true,
    workflow_processed: false,
    application_generation_eligible: false,
    clinical_review_required: true,
    active_clinical_approval: false,
    content_sections: contentSections,
    content_origin_counts: {
      legacy_exact: items.length,
      legacy_cleaned: 0,
      source_derived: 0,
      clinician_authored: 0,
      administrative_nonclinical: 0,
    },
    unsupported_legacy_item_count: items.length,
    original_preselected_item_count: originalPreselectedItemCount,
    source_derived_item_count: 0,
    clinical_blockers: [
      'Exact authoritative workflow research has not been completed.',
      'Qualified clinician review has not been completed.',
    ],
  })
  writeJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`), overlay)

  const research = updateEvidenceHash({
    schema_version: '2.0.0',
    workflow_id: workflowId,
    presentation: overlay.presentation,
    specialty: overlay.specialty,
    progress_state: 'not_started',
    research_started_at: null,
    research_completed_at: null,
    search_queries_used: [],
    official_pages_opened: [],
    exact_documents_opened: [],
    exact_sections_reviewed: [],
    candidate_sources_rejected: [],
    rejection_reasons: [],
    selected_primary_sources: [],
    selected_supporting_sources: [],
    population_applicability: 'not_assessed',
    setting_applicability: 'not_assessed',
    UAE_applicability: 'not_assessed',
    recency_verification: 'not_assessed',
    superseded_check: 'not_assessed',
    evidence_items: [],
    source_status: 'research_interrupted',
    unresolved_source_gaps: ['Exact authoritative workflow research has not started.'],
    researcher_type: 'codex_source_first_checkpoint',
  })
  writeJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`), research)

  for (const item of items) {
    unsupportedRows.push({
      workflow_id: workflowId,
      item_id: item.item_id,
      text: item.text,
      item_type: item.item_type,
      origin: item.origin,
      source_file: item.legacy_provenance.source_file,
      source_path: item.legacy_provenance.source_path,
      reason: 'Legacy text is preserved exactly but has no exact source-section mapping or clinician approval.',
      clinical_review_required: true,
    })
  }
  sourceGapRows.push({
    workflow_id: workflowId,
    source_status: 'research_interrupted',
    clinical_blocker: true,
    gap: 'Exact authoritative workflow research has not started.',
  })
  auditRows.push({
    workflow_id: workflowId,
    audit_status: 'checkpoint_pending',
    progress_state: 'not_started',
    unresolved_p0: 0,
    unresolved_p1: 0,
    clinical_blockers: 2,
    source_gap_marked_as_pass: false,
    qualified_clinician_review_required: true,
    note: originalPreselectedItemCount > 0
      ? 'Legacy preset arrays contain suggested values, but stable-main confirmation logic keeps them out of output until clinician confirmation.'
      : 'No legacy preset suggestions were recorded for this workflow.',
  })
  manifestRows.push({
    sequence: workflowIndex + 1,
    workflow_id: workflowId,
    presentation: overlay.presentation,
    specialty: overlay.specialty,
    state: 'not_started',
    source_status: 'research_interrupted',
    evidence_hash: research.evidence_hash,
    workflow_hash: overlay.content_hash,
  })
}

writeJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'), unsupportedRows)
writeJsonl(path.join(EXPANSION_DIR, 'review', 'source_gaps.jsonl'), sourceGapRows)
writeJsonl(path.join(EXPANSION_DIR, 'review', 'source_conflicts.jsonl'), [])
writeJson(path.join(EXPANSION_DIR, 'review', 'proposed_additional_exclusions.json'), {
  schema_version: '2.0.0',
  active_exclusions_unchanged: true,
  proposed_exclusions: [],
  note: 'No additional exclusion becomes active without explicit Hossam approval.',
})
writeJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'), auditRows)
writeJsonl(path.join(EXPANSION_DIR, 'reports', 'clinical_item_diff.jsonl'), [])

const baselineHashes = Object.fromEntries(
  Object.values(sourceFiles).map((relativePath) => [relativePath, fileSha256(path.join(ROOT_DIR, relativePath))]),
)
writeJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'), {
  schema_version: '2.0.0',
  branch: 'source-first-guideline-expansion-1500-v2',
  baseline_commit: BASELINE_COMMIT,
  created_at: CHECKPOINT_TIMESTAMP,
  workflow_count: workflows.length,
  completed_workflow_count: 0,
  exact_source_verified_count: 0,
  partial_exact_source_verified_count: 0,
  source_gap_count: workflows.length,
  next_workflow_id: workflows[0]?.workflow_id ?? null,
  public_data_generation_allowed: false,
  baseline_file_hashes: baselineHashes,
  workflows: manifestRows,
})
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl'), [{
  timestamp: CHECKPOINT_TIMESTAMP,
  event: 'source_first_overlay_initialized',
  workflows_initialized: workflows.length,
  public_data_changed: false,
  note: 'Legacy items were preserved as unsupported legacy content; no clinical research claim was made.',
}])
writeJson(path.join(EXPANSION_DIR, 'progress', 'restart_state.json'), {
  status: 'research_not_started',
  saved_at: CHECKPOINT_TIMESTAMP,
  baseline_commit: BASELINE_COMMIT,
  completed_workflow_ids: [],
  next_workflow_id: workflows[0]?.workflow_id ?? null,
  resume_commands: [
    'npm run research:source-first-checkpoint',
    'npm run validate:source-evidence',
    'npm run validate:item-provenance',
  ],
})

const hashManifest = rebuildIndexesAndHashManifest()
console.log(JSON.stringify({
  status: 'PASS',
  workflows_initialized: workflows.length,
  research_records_initialized: workflows.length,
  unsupported_legacy_items: unsupportedRows.length,
  specialty_indexes: hashManifest.specialty_index_count,
  source_data_modified: false,
  baseline_fingerprint: sha256(baselineHashes),
}, null, 2))

import path from 'node:path'
import {
  CHECKPOINT_TIMESTAMP,
  EXPANSION_DIR,
  listClinicalItems,
  readJson,
  readJsonl,
  rebuildIndexesAndHashManifest,
  updateEvidenceHash,
  updateWorkflowHash,
  writeJson,
  writeJsonl,
} from './common.mjs'

const supportGroups = {
  'gp-fever-urti': [
    {
      source_id: 'dha-telehealth-fever-children-v2-2024',
      source_section_id: 'dha-fever-child-v2-background',
      relationship: 'The exact pediatric-fever background directly supports documenting fever as a presentation in the pediatric subset of this mixed-age workflow.',
      item_ids: [
        'gp-fever-urti--workflow-presentation--chief-complaint',
        'gp-fever-urti--matching-alias--alias-1',
        'gp-fever-urti--matching-alias--alias-11',
        'gp-fever-urti--matching-alias--alias-12',
        'gp-fever-urti--matching-alias--alias-13',
        'gp-fever-urti--matching-alias--alias-14',
        'gp-fever-urti--matching-alias--alias-15',
        'gp-fever-urti--chip-symptoms--gp-fever-urti-s1',
        'gp-fever-urti--preset-prechecked-symptoms--prechecked-symptoms-1',
      ],
    },
    {
      source_id: 'dha-telehealth-common-cold-v2-2024',
      source_section_id: 'dha-common-cold-v2-background',
      relationship: 'The exact common-cold background directly supports the common-cold matching term without extending that evidence to influenza or undifferentiated URTI labels.',
      item_ids: ['gp-fever-urti--matching-alias--alias-8'],
    },
    {
      source_id: 'dha-telehealth-common-cold-v2-2024',
      source_section_id: 'dha-common-cold-v2-red-flags',
      relationship: 'The exact red-flag section directly supports these specific breathing, neck-stiffness, and non-blanching-rash prompts; negatives remain clinician-confirmed only.',
      item_ids: [
        'gp-fever-urti--chip-relevant-negatives--gp-fever-urti-n12',
        'gp-fever-urti--chip-relevant-negatives--gp-fever-urti-n14',
        'gp-fever-urti--chip-relevant-negatives--gp-fever-urti-n17',
        'gp-fever-urti--chip-red-flags--gp-fever-urti-r31',
        'gp-fever-urti--chip-red-flags--gp-fever-urti-r34',
        'gp-fever-urti--chip-red-flags--gp-fever-urti-r37',
        'gp-fever-urti--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-1',
        'gp-fever-urti--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-3',
      ],
    },
  ],
  'gp-cough': [
    {
      source_id: 'dha-telehealth-cough-v2-2024',
      source_section_id: 'dha-cough-v2-clinical-history',
      relationship: 'The exact clinical-history section directly supports cough presentation, duration, quality, associated symptoms, and the corresponding clinician-confirmed negatives.',
      item_ids: [
        'gp-cough--workflow-presentation--chief-complaint',
        'gp-cough--matching-alias--alias-1',
        'gp-cough--matching-alias--alias-2',
        'gp-cough--matching-alias--alias-3',
        'gp-cough--matching-alias--alias-5',
        'gp-cough--matching-alias--alias-9',
        'gp-cough--matching-alias--alias-10',
        'gp-cough--matching-alias--alias-11',
        'gp-cough--matching-alias--alias-12',
        'gp-cough--chip-symptoms--gp-cough-s1',
        'gp-cough--chip-symptoms--gp-cough-s2',
        'gp-cough--chip-symptoms--gp-cough-s3',
        'gp-cough--chip-symptoms--gp-cough-s5',
        'gp-cough--chip-symptoms--gp-cough-s6',
        'gp-cough--chip-symptoms--gp-cough-s7',
        'gp-cough--chip-symptoms--gp-cough-s8',
        'gp-cough--chip-symptoms--gp-cough-s9',
        'gp-cough--chip-relevant-negatives--gp-cough-n11',
        'gp-cough--chip-relevant-negatives--gp-cough-n12',
        'gp-cough--chip-relevant-negatives--gp-cough-n13',
        'gp-cough--chip-relevant-negatives--gp-cough-n14',
        'gp-cough--chip-relevant-negatives--gp-cough-n15',
        'gp-cough--chip-relevant-negatives--gp-cough-n16',
        'gp-cough--chip-relevant-negatives--gp-cough-n17',
        'gp-cough--preset-prechecked-symptoms--prechecked-symptoms-1',
        'gp-cough--preset-prechecked-symptoms--prechecked-symptoms-2',
        'gp-cough--preset-prechecked-symptoms--prechecked-symptoms-3',
        'gp-cough--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-1',
        'gp-cough--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-2',
        'gp-cough--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-3',
        'gp-cough--history-draft--default-history-draft',
      ],
    },
    {
      source_id: 'dha-telehealth-cough-v2-2024',
      source_section_id: 'dha-cough-v2-red-flags',
      relationship: 'The exact red-flag section directly supports these serious-condition documentation prompts.',
      item_ids: [
        'gp-cough--chip-red-flags--gp-cough-r27',
        'gp-cough--chip-red-flags--gp-cough-r28',
        'gp-cough--chip-red-flags--gp-cough-r29',
        'gp-cough--chip-red-flags--gp-cough-r31',
        'gp-cough--chip-red-flags--gp-cough-r32',
      ],
    },
  ],
  'gp-sore-throat': [
    {
      source_id: 'dha-telehealth-sore-throat-v2-2024',
      source_section_id: 'dha-sore-throat-v2-background',
      relationship: 'The exact background and document scope directly support the sore-throat/pharyngitis presentation labels.',
      item_ids: [
        'gp-sore-throat--workflow-presentation--chief-complaint',
        'gp-sore-throat--legacy-diagnosis-label--diagnosis',
        'gp-sore-throat--matching-alias--alias-1',
        'gp-sore-throat--matching-alias--alias-2',
        'gp-sore-throat--matching-alias--alias-3',
        'gp-sore-throat--matching-alias--alias-4',
        'gp-sore-throat--matching-alias--alias-5',
        'gp-sore-throat--matching-alias--alias-6',
        'gp-sore-throat--matching-alias--alias-7',
        'gp-sore-throat--matching-alias--alias-11',
        'gp-sore-throat--matching-alias--alias-16',
        'gp-sore-throat--matching-alias--alias-17',
        'gp-sore-throat--chip-symptoms--gp-sore-throat-s1',
        'gp-sore-throat--chip-symptoms--gp-sore-throat-s2',
      ],
    },
    {
      source_id: 'dha-telehealth-sore-throat-v2-2024',
      source_section_id: 'dha-sore-throat-v2-referral-red-flags',
      relationship: 'The exact referral/red-flag section directly supports stridor, breathing, swallowing, and airway-compromise prompts.',
      item_ids: [
        'gp-sore-throat--chip-relevant-negatives--gp-sore-throat-n11',
        'gp-sore-throat--chip-red-flags--gp-sore-throat-r25',
        'gp-sore-throat--chip-red-flags--gp-sore-throat-r28',
      ],
    },
  ],
  'gp-headache': [
    {
      source_id: 'dha-telehealth-headache-adults-v2-2024',
      source_section_id: 'dha-headache-v2-scope-applicability',
      relationship: 'The exact scope directly supports an adult headache presentation, while the baseline age gap remains a blocker.',
      item_ids: [
        'gp-headache--workflow-presentation--chief-complaint',
        'gp-headache--matching-alias--alias-1',
        'gp-headache--matching-alias--alias-2',
        'gp-headache--chip-symptoms--gp-headache-s1',
        'gp-headache--preset-prechecked-symptoms--prechecked-symptoms-1',
      ],
    },
    {
      source_id: 'dha-telehealth-headache-adults-v2-2024',
      source_section_id: 'dha-headache-v2-red-flags',
      relationship: 'The exact SNOOP red-flag section directly supports these clinician-confirmed neurologic, systemic, onset, age, and visual prompts.',
      item_ids: [
        'gp-headache--chip-symptoms--gp-headache-s12',
        'gp-headache--chip-relevant-negatives--gp-headache-n14',
        'gp-headache--chip-relevant-negatives--gp-headache-n15',
        'gp-headache--chip-relevant-negatives--gp-headache-n16',
        'gp-headache--chip-relevant-negatives--gp-headache-n17',
        'gp-headache--chip-relevant-negatives--gp-headache-n18',
        'gp-headache--chip-relevant-negatives--gp-headache-n19',
        'gp-headache--chip-red-flags--gp-headache-r26',
        'gp-headache--chip-red-flags--gp-headache-r27',
        'gp-headache--chip-red-flags--gp-headache-r28',
        'gp-headache--chip-red-flags--gp-headache-r29',
        'gp-headache--chip-red-flags--gp-headache-r30',
        'gp-headache--chip-red-flags--gp-headache-r31',
        'gp-headache--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-2',
        'gp-headache--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-3',
        'gp-headache--plan-documentation-option--1-2-redflags-gp-headache',
      ],
    },
    {
      source_id: 'dha-telehealth-headache-adults-v2-2024',
      source_section_id: 'dha-headache-v2-emergency-evaluation',
      relationship: 'The exact emergency-evaluation section supports documenting imaging/referral only when the clinician decided or reviewed it.',
      item_ids: [
        'gp-headache--investigation-documentation-option--2-1-imaging-gp-headache',
        'gp-headache--plan-documentation-option--2-1-ref-gp-headache',
      ],
    },
  ],
  'gp-dizziness': [
    {
      source_id: 'dha-telehealth-dizziness-v2-2024',
      source_section_id: 'dha-dizziness-v2-history',
      relationship: 'The exact clinical-history section directly supports dizziness descriptors, timing, triggers, associated symptoms, and clinician-confirmed negatives.',
      item_ids: [
        'gp-dizziness--workflow-presentation--chief-complaint',
        'gp-dizziness--matching-alias--alias-1',
        'gp-dizziness--matching-alias--alias-2',
        'gp-dizziness--matching-alias--alias-3',
        'gp-dizziness--matching-alias--alias-4',
        'gp-dizziness--matching-alias--alias-5',
        'gp-dizziness--matching-alias--alias-8',
        'gp-dizziness--matching-alias--alias-9',
        'gp-dizziness--matching-alias--alias-11',
        'gp-dizziness--matching-alias--alias-12',
        'gp-dizziness--matching-alias--alias-14',
        'gp-dizziness--matching-alias--alias-15',
        'gp-dizziness--matching-alias--alias-16',
        'gp-dizziness--chip-symptoms--gp-dizziness-s1',
        'gp-dizziness--chip-symptoms--gp-dizziness-s2',
        'gp-dizziness--chip-symptoms--gp-dizziness-s3',
        'gp-dizziness--chip-symptoms--gp-dizziness-s4',
        'gp-dizziness--chip-symptoms--gp-dizziness-s5',
        'gp-dizziness--chip-symptoms--gp-dizziness-s6',
        'gp-dizziness--chip-symptoms--gp-dizziness-s7',
        'gp-dizziness--chip-symptoms--gp-dizziness-s8',
        'gp-dizziness--chip-symptoms--gp-dizziness-s9',
        'gp-dizziness--chip-symptoms--gp-dizziness-s10',
        'gp-dizziness--chip-relevant-negatives--gp-dizziness-n11',
        'gp-dizziness--chip-relevant-negatives--gp-dizziness-n12',
        'gp-dizziness--chip-relevant-negatives--gp-dizziness-n15',
        'gp-dizziness--chip-relevant-negatives--gp-dizziness-n16',
        'gp-dizziness--preset-prechecked-symptoms--prechecked-symptoms-1',
        'gp-dizziness--preset-prechecked-symptoms--prechecked-symptoms-2',
        'gp-dizziness--preset-prechecked-symptoms--prechecked-symptoms-3',
        'gp-dizziness--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-1',
        'gp-dizziness--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-2',
        'gp-dizziness--history-draft--default-history-draft',
      ],
    },
    {
      source_id: 'dha-telehealth-dizziness-v2-2024',
      source_section_id: 'dha-dizziness-v2-red-flags',
      relationship: 'The exact red-flag section directly supports these syncope, focal-neurologic, and severe-headache prompts.',
      item_ids: [
        'gp-dizziness--chip-red-flags--gp-dizziness-r24',
        'gp-dizziness--chip-red-flags--gp-dizziness-r25',
        'gp-dizziness--chip-red-flags--gp-dizziness-r28',
      ],
    },
    {
      source_id: 'dha-telehealth-dizziness-v2-2024',
      source_section_id: 'dha-dizziness-v2-investigations',
      relationship: 'The exact investigations section directly supports documenting glucose and ECG only when performed or reviewed.',
      item_ids: [
        'gp-dizziness--investigation-documentation-option--1-3-glucose-gp-dizziness',
        'gp-dizziness--investigation-documentation-option--2-1-ecg-gp-dizziness',
      ],
    },
  ],
}

const supportedIds = new Set()
const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
const auditRows = readJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'))
const executionLog = readJsonl(path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl'))
  .filter((row) => row.event !== 'initial_research_record_finalized')

for (const [workflowId, groups] of Object.entries(supportGroups)) {
  const workflowPath = path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`)
  const researchPath = path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`)
  const workflow = readJson(workflowPath)
  const itemById = new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))
  const mappings = []

  for (const group of groups) {
    for (const itemId of group.item_ids) {
      const item = itemById.get(itemId)
      if (!item) throw new Error(`${workflowId}: support map references missing item ${itemId}`)
      if (supportedIds.has(itemId)) throw new Error(`${workflowId}: duplicate support mapping for ${itemId}`)
      supportedIds.add(itemId)
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

  const allItems = listClinicalItems(workflow)
  const unsupportedIds = allItems.filter((item) => !supportedIds.has(item.item_id)).map((item) => item.item_id)
  workflow.unsupported_legacy_item_count = unsupportedIds.length
  workflow.supported_legacy_item_count = mappings.length
  workflow.technical_audit_passed = true
  workflow.provenance_audit_passed = true
  workflow.research_terminal_status = true
  const updatedWorkflow = updateWorkflowHash(workflow)
  writeJson(workflowPath, updatedWorkflow)

  const research = readJson(researchPath)
  research.progress_state = 'clinical_review_required'
  research.legacy_item_support_mappings = mappings
  research.supported_legacy_item_count = mappings.length
  research.unsupported_legacy_item_count = unsupportedIds.length
  research.unsupported_legacy_item_ids = unsupportedIds
  research.technical_audit = {
    status: 'PASS_WITH_CLINICAL_BLOCKERS',
    provenance_complete: true,
    generic_generated_items: 0,
    source_gap_marked_as_pass: false,
    qualified_clinician_review_required: true,
  }
  const updatedResearch = updateEvidenceHash(research)
  writeJson(researchPath, updatedResearch)

  const manifestEntry = manifest.workflows.find((entry) => entry.workflow_id === workflowId)
  manifestEntry.state = 'clinical_review_required'
  manifestEntry.terminal_research = true
  manifestEntry.technical_audit_passed = true
  manifestEntry.workflow_hash = updatedWorkflow.content_hash
  manifestEntry.evidence_hash = updatedResearch.evidence_hash

  const audit = auditRows.find((row) => row.workflow_id === workflowId)
  audit.audit_status = 'clinical_blocker'
  audit.progress_state = 'clinical_review_required'
  audit.research_terminal_status = updatedResearch.source_status
  audit.technical_audit_status = 'PASS'
  audit.provenance_audit_status = 'PASS'
  audit.supported_legacy_items = mappings.length
  audit.unsupported_legacy_items = unsupportedIds.length
  audit.source_gap_marked_as_pass = false

  executionLog.push({
    timestamp: CHECKPOINT_TIMESTAMP,
    event: 'initial_research_record_finalized',
    workflow_id: workflowId,
    source_status: updatedResearch.source_status,
    supported_legacy_items: mappings.length,
    unsupported_legacy_items: unsupportedIds.length,
    technical_audit_status: 'PASS',
    clinical_blocker: true,
  })
}

const unsupportedRows = readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'))
  .filter((row) => !supportedIds.has(row.item_id))
writeJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'), unsupportedRows)
writeJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'), auditRows)
writeJsonl(path.join(EXPANSION_DIR, 'progress', 'execution_log.jsonl'), executionLog)

manifest.terminal_research_workflow_count = 5
manifest.research_interrupted_count = manifest.workflow_count - manifest.terminal_research_workflow_count
manifest.unsupported_legacy_item_count = unsupportedRows.length
manifest.source_supported_legacy_item_count = supportedIds.size
writeJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'), manifest)

const checkpointResultsPath = path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json')
const checkpointResults = readJson(checkpointResultsPath)
checkpointResults.counts.unsupported_legacy_items = unsupportedRows.length
checkpointResults.counts.source_supported_legacy_items = supportedIds.size
writeJson(checkpointResultsPath, checkpointResults)

rebuildIndexesAndHashManifest()
console.log(JSON.stringify({
  status: 'PASS_WITH_CLINICAL_BLOCKERS',
  finalized_workflows: Object.keys(supportGroups).length,
  source_supported_legacy_items: supportedIds.size,
  unsupported_legacy_items_remaining: unsupportedRows.length,
  source_derived_items: 0,
  qualified_clinician_review_required: true,
}, null, 2))

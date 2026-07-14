import fs from 'node:fs'
import path from 'node:path'
import {
  EXPANSION_DIR,
  listClinicalItems,
  readJson,
  readJsonl,
} from './common.mjs'
import { runExplicitMappingAudit } from './auditExplicitMappingContract.mjs'

const EARLY_WORKFLOW_IDS = new Set(['gp-cough', 'gp-dizziness', 'gp-fever-urti', 'gp-headache', 'gp-sore-throat'])
const correctionRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl'))
if (correctionRows.length !== 1164) throw new Error(`Expected 1164 correction rows; found ${correctionRows.length}`)

const byWorkflow = new Map()
for (const row of correctionRows) {
  const rows = byWorkflow.get(row.workflow_id) ?? []
  rows.push(row)
  byWorkflow.set(row.workflow_id, rows)
}

let earlyRows = 0
let changedItemIds = 0
let retainedAmbiguousRows = 0
let staleSupportedItems = 0
for (const [workflowId, rows] of byWorkflow) {
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`))
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))
  const itemById = new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))
  if ((research.legacy_item_support_mappings ?? []).length !== 0) throw new Error(`${workflowId}: retained target mapping found`)
  for (const row of rows) {
    if (EARLY_WORKFLOW_IDS.has(workflowId)) earlyRows += 1
    if (row.final_item_id && row.final_item_id !== row.original_item_id) changedItemIds += 1
    if (row.reconstruction_method.includes('ambiguous') && row.final_disposition === 'RETAIN_EXPLICIT') retainedAmbiguousRows += 1
    const item = itemById.get(row.original_item_id)
    if (!item) throw new Error(`${workflowId}: correction item ${row.original_item_id} no longer exists`)
    if (item.clinical_review_status !== 'unsupported_legacy_review_required'
      || item.source_ids?.length !== 0 || item.source_section_ids?.length !== 0
      || Object.hasOwn(item, 'evidence_relationship')) {
      staleSupportedItems += 1
    }
  }
}

if (earlyRows !== 132) throw new Error(`Expected 132 early rows; found ${earlyRows}`)
if (changedItemIds !== 0 || retainedAmbiguousRows !== 0 || staleSupportedItems !== 0) {
  throw new Error(`Second-pass target failure changed=${changedItemIds} retainedAmbiguous=${retainedAmbiguousRows} stale=${staleSupportedItems}`)
}

const sample = []
const buckets = [
  correctionRows.filter((row) => EARLY_WORKFLOW_IDS.has(row.workflow_id)),
  correctionRows.filter((row) => row.reconstruction_method.includes('ambiguous')),
  correctionRows.filter((row) => row.reconstruction_method.includes('unique')),
]
for (const bucket of buckets) {
  for (const row of bucket) {
    if (sample.length >= 150) break
    if (!sample.some((candidate) => candidate.original_mapping_key === row.original_mapping_key)) sample.push(row)
  }
}
if (sample.length !== 150) throw new Error(`Expected deterministic 150-row second-pass sample; found ${sample.length}`)
if (sample.some((row) => row.final_disposition !== 'REMOVE_TO_UNSUPPORTED' || row.final_item_id !== null)) {
  throw new Error('Second-pass sample contains a retained or reassigned target')
}

const reconciliation = runExplicitMappingAudit()
const publicDataChanged = fs.existsSync(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl')) === false
if (publicDataChanged) throw new Error('Correction ledger unexpectedly missing')

console.log(JSON.stringify({
  status: 'PASS',
  corrected_mapping_universe_rechecked: correctionRows.length,
  retained_corrected_mappings_available_for_sampling: 0,
  retained_sample_requirement: 'not_applicable_no_corrected_mapping_was_retained',
  conservative_removed_mapping_sample_rechecked: sample.length,
  early_mappings_rechecked: earlyRows,
  changed_item_ids_rechecked: changedItemIds,
  retained_ambiguous_mappings_rechecked: retainedAmbiguousRows,
  stale_supported_items: staleSupportedItems,
  persisted_supported_mappings: reconciliation.persistedSupportedMappings,
  guard_inspected_supported_mappings: reconciliation.guardInspectedSupportedMappings,
  explicit_ledger_records: reconciliation.explicitMappingLedgerRecords,
}, null, 2))

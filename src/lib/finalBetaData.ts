import { publicPath } from './publicPath'

export type FinalBetaManifest = {
  schema_version: string
  dataset: string
  source_commit: string
  source_artifacts: { active_workflow_catalog: string; inactive_workflow_inventory: string; workflow_details: string; evidence_records: string; metadata: string; compaction_manifest: string; aliases: string }
  counts: { original_workflows: number; active_workflows: number; inactive_workflows: number; clinician_facing_items: number; internal_evidence_records: number; missing_required_core_sections: number }
  fingerprints: { source_catalogue: string; workflow_resolution: string; compaction: string; app_manifest: string }
}

export type FinalBetaWorkflowSummary = {
  workflow_id: string
  title: string
  specialty: string
  archetype: string
  final_status: string
  usable: boolean
  sections: string[]
  metadata_sections: string[]
  internal_evidence_record_count: number
  user_facing_item_count: number
  additions_count: number
  rewrites_count: number
  removals_count: number
  limitations: string[]
  missing_required_sections: string[]
}

export type FinalBetaEvidenceRecord = {
  evidence_statement_id?: string
  evidence_record_id?: string
  source_id: string
  official_source_url?: string
  exact_locator: { section_heading?: string; heading_path?: string[]; page_number?: number; paragraph_or_text_span?: string; [key: string]: unknown }
  final_wording?: string
  rationale?: string
  source_fingerprint?: string
  locator_fingerprint?: string
  [key: string]: unknown
}

export type FinalBetaItem = {
  workflow_id: string
  stable_item_id: string
  display_order: number
  section: string
  final_wording: string
  action: string
  evidence_statement_ids: string[]
  evidence_count: number
  source_ids: string[]
  population?: string
  setting?: string
  jurisdiction?: string
  restrictions?: string[]
  uae_applicability?: string
  rationale?: string
  documentation_scaffold?: boolean
}

export type FinalBetaWorkflowDetail = FinalBetaWorkflowSummary & { user_facing_items: FinalBetaItem[]; evidence_records: FinalBetaEvidenceRecord[] }
export type FinalBetaInactive = { workflow_id: string; title: string; final_status: string; reason: string; evidence_pack_ids?: string[] }

const base = 'data-beta/final-catalogue/'
const cache = new Map<string, Promise<unknown>>()
function load<T>(relativePath: string): Promise<T> {
  if (!cache.has(relativePath)) cache.set(relativePath, fetch(publicPath(`${base}${relativePath}`)).then(async (response) => { if (!response.ok) throw new Error(`Final beta catalogue asset failed: ${relativePath} (${response.status})`); return response.json() }))
  return cache.get(relativePath) as Promise<T>
}

let manifestPromise: Promise<FinalBetaManifest> | null = null
export function loadFinalBetaManifest() {
  if (!manifestPromise) manifestPromise = load<FinalBetaManifest>('manifest.json').then((manifest) => {
    if (manifest.source_commit !== '58be2e806dd364d571ffe168a9a64f1fc2048141') throw new Error('Final beta catalogue source commit mismatch.')
    if (manifest.counts.original_workflows !== 1500 || manifest.counts.active_workflows !== 416 || manifest.counts.inactive_workflows !== 1084 || manifest.counts.clinician_facing_items !== 6290 || manifest.counts.internal_evidence_records !== 75484) throw new Error('Final beta catalogue count contract failed.')
    return manifest
  })
  return manifestPromise
}

let datasetPromise: Promise<{ manifest: FinalBetaManifest; catalog: FinalBetaWorkflowSummary[]; inactive: FinalBetaInactive[]; aliases: { aliases: Array<{ alias: string; workflow_id: string }> } }> | null = null
export const finalBetaData = {
  loadDataset() {
    if (!datasetPromise) datasetPromise = Promise.all([loadFinalBetaManifest(), load<{ workflows: FinalBetaWorkflowSummary[] }>('catalog.json'), load<{ workflows: FinalBetaInactive[] }>('inactive-inventory.json'), load<{ aliases: Array<{ alias: string; workflow_id: string }> }>('aliases.json')]).then(([manifest, catalogPayload, inactive, aliases]) => {
      if (catalogPayload.workflows.length !== manifest.counts.active_workflows || inactive.workflows.length !== manifest.counts.inactive_workflows) throw new Error('Final beta active/inactive catalogue contract failed.')
      return { manifest, catalog: catalogPayload.workflows, inactive: inactive.workflows, aliases }
    })
    return datasetPromise
  },
  getWorkflow(workflowId: string) { return loadFinalBetaManifest().then(() => load<FinalBetaWorkflowDetail>(`workflows/${encodeURIComponent(workflowId)}.json`)) },
}

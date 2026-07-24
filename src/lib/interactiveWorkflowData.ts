import { publicPath } from './publicPath'

export type InteractiveManifest = {
  schema_version: string
  dataset: string
  generated_from: string
  counts: { workflows: number; fields: number; evidence_records_retained: number }
  field_type_distribution: Record<string, number>
  workflow_fingerprint: string
  interactive_manifest_fingerprint: string
  source_catalogue_fingerprint: string
  workflow_resolution_fingerprint: string
}

export type InteractiveProvenance = {
  evidence_pack_ids: string[]
  evidence_statement_ids: string[]
  source_ids: string[]
  population: string | null
  setting: string | null
  restrictions: string[]
  uae_applicability: string | null
}

export type InteractiveField = {
  workflow_id: string
  field_id: string
  archetype: string
  section: string
  label: string
  helper_text: string
  field_type: string
  options: string[]
  free_text_allowed: boolean
  required: boolean
  display_order: number
  visibility: { type: 'always' }
  contradictory_option_rules: string[]
  population_restrictions: string[]
  setting_restrictions: string[]
  soap_destination: 'subjective' | 'objective' | 'assessment' | 'plan'
  note_template: string
  value_formatter: string
  provenance: InteractiveProvenance
}

export type InteractiveEvidence = {
  evidence_statement_id: string | null
  source_id: string
  official_source_url: string | null
  locator: Record<string, unknown>
}

export type InteractiveWorkflowSummary = {
  workflow_id: string
  title: string
  specialty: string
  archetype: string
  final_status: string
  fields: number
  evidence_records: number
}

export type InteractiveWorkflow = InteractiveWorkflowSummary & {
  population: string[]
  settings: string[]
  evidence_pack_ids: string[]
  fields: InteractiveField[]
  evidence: InteractiveEvidence[]
  transformation_audit: { additions_count: number; rewrites_count: number; removals_count: number }
}

export type InteractiveInactive = { workflow_id: string; title: string; final_status: string; reason: string }

const base = 'data-beta/interactive-workflows/'
const cache = new Map<string, Promise<unknown>>()
function load<T>(relative: string) {
  if (!cache.has(relative)) cache.set(relative, fetch(publicPath(`${base}${relative}`)).then(async (response) => { if (!response.ok) throw new Error(`Interactive workflow asset failed: ${relative} (${response.status})`); return response.json() }))
  return cache.get(relative) as Promise<T>
}

let datasetPromise: Promise<{ manifest: InteractiveManifest; workflows: InteractiveWorkflowSummary[] }> | null = null
export const interactiveWorkflowData = {
  loadDataset() {
    if (!datasetPromise) datasetPromise = Promise.all([load<InteractiveManifest>('manifest.json'), load<{ workflows: InteractiveWorkflowSummary[] }>('catalog.json')]).then(([manifest, catalog]) => {
      if (manifest.counts.workflows !== 416) throw new Error('Interactive workflow count contract failed.')
      return { manifest, workflows: catalog.workflows }
    })
    return datasetPromise
  },
  getWorkflow(workflowId: string) {
    return load<InteractiveWorkflow>(`workflows/${encodeURIComponent(workflowId)}.json`)
  },
}

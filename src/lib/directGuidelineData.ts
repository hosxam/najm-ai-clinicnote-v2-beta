import { publicPath } from './publicPath'

export type CuratedSource = { source_id: string; title: string | null; url: string | null; jurisdiction: string | null }
export type CuratedItem = { item_id: string; section_id?: string; section?: string; text?: string; final_wording?: string; action: 'add' | 'retain' | 'rewrite'; rationale: string; evidence_extract?: string | null; source: CuratedSource & { exact_section?: { section_id: string; heading: string; locator: string } | null; exact_location?: { section_id: string; heading: string; locator: string } | null; evidence_paraphrase?: string | null } }
export type RemovedItem = { item_id: string; previous_wording: string; action: 'remove'; removal_reason: string; source_comparison: string }
export type CuratedSectionCoverage = { applicable: boolean; status: 'intentionally_inapplicable' | 'covered_by_committed_evidence' | 'missing_full_source_review' | 'documented_limitation' | 'covered_by_full_source_item'; evidence_item_count: number }
export type CuratedDetail = { workflow_number: number; workflow_id: string; title: string; specialty: string; diagnosis?: string; source_status: string; source_grounded: boolean; source_review_basis: string; full_guideline_documents_inspected: boolean | number; fully_reconstructed: boolean; completeness_status: string; applicable_sections: string[]; section_coverage: Record<string, CuratedSectionCoverage>; content: Record<string, CuratedItem[]>; sources_used: CuratedSource[]; additions: CuratedItem[]; rewrites: CuratedItem[]; removals: RemovedItem[]; source_limitations: string[]; curation_policy: string }
export type CuratedCatalogEntry = Pick<CuratedDetail, 'workflow_number' | 'workflow_id' | 'title' | 'specialty' | 'diagnosis' | 'source_status' | 'source_grounded' | 'fully_reconstructed' | 'completeness_status'> & { incomplete_section_count: number; sources_used: number; retained_count: number; rewritten_count: number; removed_count: number; added_count: number; unresolved_source_gap_count: number }
export type CuratedMetadata = { schema_version: string; dataset: string; generated_from?: string; source_review_basis: string; full_guideline_documents_inspected: boolean | number; workflow_count: number; usable_workflow_count: number; unavailable_workflow_count: number; item_count: number; workflows_with_guideline_evidence?: number; workflows_without_guideline_evidence?: number; fully_reconstructed_workflows: number; incomplete_workflows: number; workflows_with_documented_limitations?: number; source_gap_workflows: number; blocked_source_workflows: number; counts: { retained: number; rewritten: number; removed: number; added: number }; source_count: number; newly_registered_sources?: number; production_data_path: string; clinician_review_queue: false; output_fingerprint?: string }

const cache = new Map<string, Promise<unknown>>()
function load<T>(relativePath: string): Promise<T> {
  if (!cache.has(relativePath)) cache.set(relativePath, fetch(publicPath(relativePath)).then(async (response) => { if (!response.ok) throw new Error(`Failed to load ${relativePath}`); return response.json() }))
  return cache.get(relativePath) as Promise<T>
}
let datasetPromise: Promise<{ metadata: CuratedMetadata; catalog: CuratedCatalogEntry[] }> | null = null
export const directGuidelineData = {
  loadDataset() { if (!datasetPromise) datasetPromise = Promise.all([load<CuratedMetadata>('data-beta/curated-workflows/metadata.json'), load<CuratedCatalogEntry[]>('data-beta/curated-workflows/catalog.json')]).then(([metadata, catalog]) => ({ metadata, catalog })); return datasetPromise },
  getWorkflow(workflowId: string) { return load<CuratedDetail>(`data-beta/curated-workflows/workflows/${workflowId}.json`) },
}

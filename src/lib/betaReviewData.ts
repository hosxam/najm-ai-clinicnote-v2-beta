import { publicPath } from './publicPath'

export type BetaResearchStatus = 'exact_source_support' | 'partial_source_support' | 'no_authoritative_source'

export type BetaReviewDecision =
  | 'keep_as_written'
  | 'edit_wording'
  | 'remove_item'
  | 'source_supports_item'
  | 'source_partially_supports_item'
  | 'source_does_not_support_item'
  | 'needs_source_recheck'
  | 'needs_safety_review'
  | 'defer'

export type BetaReviewRecord = {
  workflow_id: string
  item_id: string
  decision: BetaReviewDecision
  edited_wording: string
  clinician_comment: string
  reviewed_at: string
}

export type BetaReviewExport = {
  schema_version: '1.0.0'
  dataset: 'najm-ai-clinicnote-beta-review'
  exported_at: string
  decisions: BetaReviewRecord[]
}

export type BetaCatalogEntry = {
  workflow_number: number
  workflow_id: string
  title: string
  specialty: string
  diagnosis: string
  research_status: BetaResearchStatus
  research_status_label: string
  uae_applicability: string
  uae_finding_types: string[]
  item_count: number
  unsupported_item_count: number
  safety_review_required_count: number
  source_count: number
  evidence_link_count: number
  clinician_review_status: 'not_reviewed'
}

export type BetaReviewItem = {
  item_id: string
  section_id: string
  section_label: string
  text: string
  item_type: string
  origin: string
  source_ids: string[]
  source_section_ids: string[]
  clinical_review_status: string
  unsupported: boolean
  safety_review_required: boolean
}

export type BetaSourceReference = {
  source_id: string
  title: string | null
  issuing_organisation?: string
  official_url: string | null
  jurisdiction?: string
  source_resolves: boolean
  sections: Array<{ section_id: string; heading: string; locator: string; evidence_summary: string }>
}

export type BetaEvidenceLink = {
  evidence_item_id: string
  source_id: string
  source_section_id: string
  direct_relationship: string
  paraphrased_evidence_summary: string
  content_mapping_status: string
  candidate_status: 'review_only_not_approved'
  source_resolves: boolean
}

export type BetaWorkflowDetail = BetaCatalogEntry & {
  uae_findings: Array<{ finding_type: string; evidence_basis: string }>
  source_references: BetaSourceReference[]
  evidence_links: BetaEvidenceLink[]
  unresolved_source_gaps: string[]
  clinical_review_required: boolean
  active_clinical_approval: false
  items: BetaReviewItem[]
}

export type BetaReviewMetadata = {
  schema_version: '1.0.0'
  beta_label: 'BETA — CLINICIAN REVIEW DATA'
  notice: string
  generated_from: string
  workflow_count: number
  item_count: number
  registered_source_count: number
  research_status_counts: Record<BetaResearchStatus, number>
  unsupported_item_count: number
  safety_review_required_item_count: number
  clinician_reviewed_workflow_count: 0
  candidate_approved_count: 0
  production_data_path: 'public/data (unchanged)'
}

const cache = new Map<string, Promise<unknown>>()

function loadJson<T>(relativePath: string) {
  if (!cache.has(relativePath)) {
    cache.set(relativePath, fetch(publicPath(relativePath)).then(async (response) => {
      if (!response.ok) throw new Error(`Failed to load ${relativePath}: ${response.status}`)
      return response.json() as Promise<T>
    }))
  }
  return cache.get(relativePath) as Promise<T>
}

let datasetPromise: Promise<{ metadata: BetaReviewMetadata; catalog: BetaCatalogEntry[] }> | null = null

export const betaReviewDataAdapter = {
  async loadDataset() {
    if (!datasetPromise) {
      datasetPromise = Promise.all([
        loadJson<BetaReviewMetadata>('data-beta/metadata.json'),
        loadJson<BetaCatalogEntry[]>('data-beta/catalog.json'),
      ]).then(([metadata, catalog]) => ({ metadata, catalog }))
    }
    return datasetPromise
  },

  async getWorkflowDetail(workflowId: string) {
    return loadJson<BetaWorkflowDetail>(`data-beta/workflows/${workflowId}.json`)
  },
}

export const BETA_REVIEW_STORAGE_KEY = 'najm-clinicnote-v2:beta-review-decisions'

export function readBetaReviewRecords(): Record<string, BetaReviewRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BETA_REVIEW_STORAGE_KEY) ?? '{}') as Record<string, BetaReviewRecord>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeBetaReviewRecords(records: Record<string, BetaReviewRecord>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BETA_REVIEW_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage quota and privacy-mode failures; the UI remains usable in memory.
  }
}

export function reviewRecordKey(workflowId: string, itemId: string) {
  return `${workflowId}::${itemId}`
}

export function createBetaReviewExport(records: Record<string, BetaReviewRecord>): BetaReviewExport {
  return {
    schema_version: '1.0.0',
    dataset: 'najm-ai-clinicnote-beta-review',
    exported_at: new Date().toISOString(),
    decisions: Object.values(records).sort((a, b) => `${a.workflow_id}:${a.item_id}`.localeCompare(`${b.workflow_id}:${b.item_id}`)),
  }
}

import { publicPath } from './publicPath'

export type BetaResearchStatus = 'exact_source_support' | 'partial_source_support' | 'no_authoritative_source'

export type BetaAdjudicationClassification =
  | 'fully_supported'
  | 'partially_supported'
  | 'contextual_only'
  | 'not_supported'
  | 'conflicting_evidence'
  | 'source_inaccessible'
  | 'no_evidence_link'

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
  adjudication_item_count?: number
  support_classification_counts?: Record<BetaAdjudicationClassification, number>
  low_confidence_count?: number
  human_review_required_count?: number
  adjudication_safety_review_required_count?: number
  ai_verified_pending_clinical_approval_count?: number
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

export type BetaAdjudicationItem = {
  workflow_id: string
  item_id: string
  item_category: string
  current_item_text: string
  source_id: string | null
  source_title: string | null
  source_url: string | null
  exact_evidence_location: { section_id: string; heading: string; locator: string } | null
  evidence_text: string | null
  evidence_links: Array<{
    source_id: string
    source_title: string | null
    source_url: string | null
    source_section_id: string | null
    exact_evidence_location: { section_id: string; heading: string; locator: string } | null
    evidence_text: string | null
    direct_relationship: string | null
    candidate_proposal_status: string | null
    source_registered: boolean
  }>
  support_classification: BetaAdjudicationClassification
  support_rationale: string
  wording_scope_difference: string
  suggested_narrower_wording: string | null
  confidence_score: number
  human_review_required: boolean
  review_reason: string
  safety_critical: boolean
  verification_state: 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL' | 'HUMAN_REVIEW_REQUIRED'
  UAE_applicability: { classification: string; statement: string; finding_types: string[] }
  model_version: string
  adjudication_schema_version: string
  existing_candidate_proposal: string | null
  clinician_decision: null
  clinician_approval_status: 'not_approved'
}

export type BetaAdjudicationDetail = {
  workflow_id: string
  workflow_number: number
  items: BetaAdjudicationItem[]
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
        loadJson<Array<Pick<BetaCatalogEntry, 'workflow_id' | 'adjudication_item_count' | 'support_classification_counts' | 'low_confidence_count' | 'human_review_required_count' | 'adjudication_safety_review_required_count' | 'ai_verified_pending_clinical_approval_count'>>>('data-beta/adjudication/catalog.json'),
      ]).then(([metadata, catalog, adjudicationCatalog]) => {
        const adjudicationById = new Map(adjudicationCatalog.map((entry) => [entry.workflow_id, entry]))
        return { metadata, catalog: catalog.map((entry) => ({ ...entry, ...(adjudicationById.get(entry.workflow_id) ?? {}) })) }
      })
    }
    return datasetPromise
  },

  async getWorkflowDetail(workflowId: string) {
    return loadJson<BetaWorkflowDetail>(`data-beta/workflows/${workflowId}.json`)
  },

  async getAdjudicationDetail(workflowId: string) {
    return loadJson<BetaAdjudicationDetail>(`data-beta/adjudication/workflows/${workflowId}.json`)
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

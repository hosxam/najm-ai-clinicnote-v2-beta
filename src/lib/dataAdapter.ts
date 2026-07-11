import type {
  ClinicalWorkflow,
  DiagnosisIndexEntry,
  ExamDetails,
  HistoryDraft,
  InvestigationDetails,
  LimitedTestingExclusion,
  MedicationDetails,
  PlanDetails,
  SpecialtyLayout,
  SpeedPreset,
  WorkflowChipCollection,
  WorkflowDetails,
  WorkflowSummary,
} from '../types/clinicnote'
import { dedupeStrings } from './labelUtils'
import { publicPath } from './publicPath'
import { COMMON_WORKFLOW_IDS } from './commonWorkflows'

const jsonCache = new Map<string, Promise<unknown>>()

function loadJson<T>(relativePath: string): Promise<T> {
  if (!jsonCache.has(relativePath)) {
    const request = fetch(publicPath(relativePath)).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${relativePath}: ${response.status}`)
      }
      return response.json() as Promise<T>
    })
    jsonCache.set(relativePath, request)
  }
  return jsonCache.get(relativePath) as Promise<T>
}

function valuesArray<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[]
  if (input && typeof input === 'object') {
    return Object.values(input as Record<string, T>).filter(Boolean)
  }
  return []
}

type CoreCache = {
  workflows: ClinicalWorkflow[]
  diagnosisEntries: DiagnosisIndexEntry[]
  exclusions: LimitedTestingExclusion[]
  summaries: WorkflowSummary[]
  specialties: string[]
  workflowById: Map<string, ClinicalWorkflow>
}

let coreCachePromise: Promise<CoreCache> | null = null

async function buildCoreCache(): Promise<CoreCache> {
  const [workflowPayload, diagnosisPayload, exclusionPayload] = await Promise.all([
    loadJson<unknown>('data/clinical_workflows.json'),
    loadJson<{ entries?: DiagnosisIndexEntry[] }>('data/diagnosis_index.json'),
    loadJson<{ exclusions?: LimitedTestingExclusion[] }>('config/limited_testing_exclusions.json'),
  ])

  const workflows = valuesArray<ClinicalWorkflow>(workflowPayload)
  const diagnosisEntries = diagnosisPayload.entries ?? []
  const exclusions = exclusionPayload.exclusions ?? []
  const workflowById = new Map(workflows.map((workflow) => [workflow.workflow_id, workflow]))
  const exclusionMap = new Map(exclusions.map((item) => [item.workflow_id, item]))
  const aliasMap = new Map<string, string[]>()

  for (const entry of diagnosisEntries) {
    for (const workflowId of entry.workflow_ids ?? []) {
      const existing = aliasMap.get(workflowId) ?? []
      existing.push(entry.label, ...(entry.aliases ?? []))
      aliasMap.set(workflowId, existing)
    }
  }

  const summaries = workflows.map<WorkflowSummary>((workflow) => {
    const aliases = dedupeStrings([
      workflow.chief_complaint,
      workflow.diagnosis,
      ...(workflow.chief_complaint_aliases ?? []),
      ...(workflow.diagnosis_aliases ?? []),
      ...(aliasMap.get(workflow.workflow_id) ?? []),
    ])

    const searchParts = [
      workflow.workflow_id,
      workflow.specialty_id,
      workflow.chief_complaint,
      workflow.diagnosis,
      ...aliases,
    ].join(' ')

    return {
      workflowId: workflow.workflow_id,
      title: workflow.chief_complaint || workflow.diagnosis || workflow.workflow_id,
      specialty: workflow.specialty_id,
      diagnosis: workflow.diagnosis,
      aliases,
      searchText: searchParts.toLowerCase(),
      exclusion: exclusionMap.get(workflow.workflow_id),
    }
  })

  const specialties = Array.from(new Set(summaries.map((summary) => summary.specialty))).sort()

  return { workflows, diagnosisEntries, exclusions, summaries, specialties, workflowById }
}

function getCoreCache() {
  if (!coreCachePromise) coreCachePromise = buildCoreCache()
  return coreCachePromise
}

function findByWorkflowId<T extends { workflow_id: string }>(payload: unknown, workflowId: string): T | null {
  return valuesArray<T>(payload).find((entry) => entry.workflow_id === workflowId) ?? null
}

function findBySpecialtyId<T extends { specialty_id: string }>(payload: unknown, specialtyId: string): T | null {
  return valuesArray<T>(payload).find((entry) => entry.specialty_id === specialtyId) ?? null
}

const detailCache = new Map<string, Promise<WorkflowDetails | null>>()

export const clinicnoteDataAdapter = {
  async loadCatalog(includeExcluded = false) {
    const core = await getCoreCache()
    return includeExcluded
      ? core.summaries
      : core.summaries.filter((summary) => !summary.exclusion)
  },

  async loadSpecialties() {
    const core = await getCoreCache()
    return core.specialties
  },

  async getCommonWorkflows() {
    const catalog = await this.loadCatalog(false)
    const byId = new Map(catalog.map((item) => [item.workflowId, item]))
    return COMMON_WORKFLOW_IDS.map((id) => byId.get(id)).filter(Boolean) as WorkflowSummary[]
  },

  async searchWorkflows(query: string, specialty = 'all', includeExcluded = false) {
    const catalog = await this.loadCatalog(includeExcluded)
    const trimmed = query.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesSpecialty = specialty === 'all' || item.specialty === specialty
      const matchesQuery = !trimmed || item.searchText.includes(trimmed)
      return matchesSpecialty && matchesQuery
    })
  },

  async getWorkflowSummaryById(workflowId: string, includeExcluded = false) {
    const catalog = await this.loadCatalog(true)
    const summary = catalog.find((item) => item.workflowId === workflowId) ?? null
    if (!summary) return null
    if (!includeExcluded && summary.exclusion) return null
    return summary
  },

  async isWorkflowExcluded(workflowId: string) {
    const summary = await this.getWorkflowSummaryById(workflowId, true)
    return Boolean(summary?.exclusion)
  },

  async getWorkflowDetails(workflowId: string, includeExcluded = false) {
    const cacheKey = `${workflowId}:${includeExcluded ? 'all' : 'safe'}`
    if (!detailCache.has(cacheKey)) {
      detailCache.set(
        cacheKey,
        (async () => {
          const core = await getCoreCache()
          const summary = await this.getWorkflowSummaryById(workflowId, true)
          if (!summary) return null
          if (!includeExcluded && summary.exclusion) return null

          const clinical = core.workflowById.get(workflowId)
          if (!clinical) return null

          const [
            chipsPayload,
            presetsPayload,
            historyPayload,
            examPayload,
            investigationPayload,
            planPayload,
            medicationPayload,
            layoutPayload,
          ] = await Promise.all([
            loadJson<unknown>('data/workflow_chips.json'),
            loadJson<unknown>('data/speed_presets.json'),
            loadJson<unknown>('data/v4_workflow_history_drafts.json'),
            loadJson<unknown>('data/v4_workflow_exam_details.json'),
            loadJson<unknown>('data/v4_investigation_options.json'),
            loadJson<unknown>('data/v4_plan_options.json'),
            loadJson<unknown>('data/v4_plan_medication_options.json'),
            loadJson<unknown>('data/specialty_history_layouts.json'),
          ])

          return {
            summary,
            clinical,
            chips: findByWorkflowId<WorkflowChipCollection>(chipsPayload, workflowId),
            preset: findByWorkflowId<SpeedPreset>(presetsPayload, workflowId),
            historyDraft: findByWorkflowId<HistoryDraft>(historyPayload, workflowId),
            examDetails: findByWorkflowId<ExamDetails>(examPayload, workflowId),
            investigationDetails: findByWorkflowId<InvestigationDetails>(investigationPayload, workflowId),
            planDetails: findByWorkflowId<PlanDetails>(planPayload, workflowId),
            medicationDetails: findByWorkflowId<MedicationDetails>(medicationPayload, workflowId),
            specialtyLayout: findBySpecialtyId<SpecialtyLayout>(layoutPayload, clinical.specialty_id),
          } satisfies WorkflowDetails
        })(),
      )
    }

    return detailCache.get(cacheKey) ?? Promise.resolve(null)
  },
}

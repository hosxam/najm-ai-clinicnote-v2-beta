import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChipSelector } from '../components/ChipSelector'
import { OutputPanel } from '../components/OutputPanel'
import { SectionCard } from '../components/SectionCard'
import { StateNotice } from '../components/StateNotice'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { clearLocalDraft, loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildQuickSoapDraft } from '../lib/outputBuilders'
import { displayGroupLabel, normalizeDisplayText } from '../lib/labelUtils'
import type { WorkflowChipItem, WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

type QuickNoteDraft = {
  workflowId: string
  duration: string
  additionalHistory: string
  assessment: string
  plan: string
  selectedSymptoms: string[]
  selectedNegatives: string[]
  selectedExam: string[]
  selectedPlanItems: string[]
}

const QUICK_NOTE_STORAGE_KEY = 'quick-note-draft'

function getQuickNoteDefaults(details: WorkflowDetails | null): QuickNoteDraft {
  return {
    workflowId: details?.summary.workflowId ?? '',
    duration: '',
    additionalHistory: '',
    assessment: '',
    plan: '',
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExam: [],
    selectedPlanItems: [],
  }
}

export function QuickNotePage() {
  const navigate = useNavigate()
  const { workflowId } = useParams()
  const [catalog, setCatalog] = useState<WorkflowSummary[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [details, setDetails] = useState<WorkflowDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState('')
  const [additionalHistory, setAdditionalHistory] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState<string[]>([])
  const [selectedPlanItems, setSelectedPlanItems] = useState<string[]>([])

  useEffect(() => {
    Promise.all([clinicnoteDataAdapter.loadCatalog(), clinicnoteDataAdapter.loadSpecialties()])
      .then(([loadedCatalog, loadedSpecialties]) => {
        setCatalog(loadedCatalog)
        setSpecialties(loadedSpecialties)
      })
      .catch((caughtError: unknown) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Workflow data could not be loaded. Please refresh the page and try again.',
        )
      })
  }, [])

  useEffect(() => {
    let active = true
    if (!workflowId) {
      const savedDraft = loadLocalDraft<QuickNoteDraft>(QUICK_NOTE_STORAGE_KEY)
      if (savedDraft?.workflowId) {
        navigate(`/quick-note/${savedDraft.workflowId}`, { replace: true })
        return
      }
      setDetails(null)
      setBlockedMessage(null)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      clinicnoteDataAdapter.getWorkflowSummaryById(workflowId, true),
      clinicnoteDataAdapter.getWorkflowDetails(workflowId, true),
    ]).then(([summary, loadedDetails]) => {
      if (!active) return
      if (summary?.exclusion) {
        setBlockedMessage('This workflow is excluded from limited internal testing pending medical review.')
        setDetails(null)
        setLoading(false)
        return
      }

      setBlockedMessage(null)
      setDetails(loadedDetails)
      const defaults = getQuickNoteDefaults(loadedDetails)
      const savedDraft = loadLocalDraft<QuickNoteDraft>(QUICK_NOTE_STORAGE_KEY)
      const restoredDraft =
        savedDraft && savedDraft.workflowId === workflowId
          ? { ...defaults, ...savedDraft, workflowId }
          : defaults

      setDuration(restoredDraft.duration)
      setSelectedSymptoms(restoredDraft.selectedSymptoms)
      setSelectedNegatives(restoredDraft.selectedNegatives)
      setSelectedExam(restoredDraft.selectedExam)
      setSelectedPlanItems(restoredDraft.selectedPlanItems)
      setAssessment(restoredDraft.assessment)
      setPlan(restoredDraft.plan)
      setAdditionalHistory(restoredDraft.additionalHistory)
      setError(null)
      pushRecentWorkflow(workflowId)
      setLoading(false)
    }).catch((caughtError: unknown) => {
      if (!active) return
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'This workflow could not be loaded. Please try another workflow.',
      )
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [navigate, workflowId])

  useEffect(() => {
    if (!workflowId || blockedMessage || !details) return

    saveLocalDraft<QuickNoteDraft>(QUICK_NOTE_STORAGE_KEY, {
      workflowId,
      duration,
      additionalHistory,
      assessment,
      plan,
      selectedSymptoms,
      selectedNegatives,
      selectedExam,
      selectedPlanItems,
    })
  }, [
    workflowId,
    blockedMessage,
    details,
    duration,
    additionalHistory,
    assessment,
    plan,
    selectedSymptoms,
    selectedNegatives,
    selectedExam,
    selectedPlanItems,
  ])

  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesQuery = !lowered || item.searchText.includes(lowered)
      const matchesSpecialty = specialty === 'all' || item.specialty === specialty
      return matchesQuery && matchesSpecialty
    })
  }, [catalog, search, specialty])

  function resetCurrentDraft() {
    if (!window.confirm('Reset the current Quick Note draft for this workflow?')) return
    const defaults = getQuickNoteDefaults(details)
    setDuration(defaults.duration)
    setAdditionalHistory(defaults.additionalHistory)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedExam(defaults.selectedExam)
    setSelectedPlanItems(defaults.selectedPlanItems)
  }

  function clearSavedDraft() {
    if (!window.confirm('Clear the saved Quick Note draft from this browser?')) return
    clearLocalDraft(QUICK_NOTE_STORAGE_KEY)
    const defaults = getQuickNoteDefaults(details)
    setDuration(defaults.duration)
    setAdditionalHistory(defaults.additionalHistory)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedExam(defaults.selectedExam)
    setSelectedPlanItems(defaults.selectedPlanItems)
  }

  const chipsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    for (const chip of details?.chips?.chips ?? []) {
      const item = chip as WorkflowChipItem
      grouped[item.group] = [...(grouped[item.group] ?? []), item.chip_text]
    }
    return grouped
  }, [details])

  const output = useMemo(() => {
    if (!details) return ''
    return buildQuickSoapDraft({
      workflow: details,
      duration,
      selectedSymptoms,
      selectedNegatives,
      selectedExam,
      selectedPlanItems,
      additionalHistory,
      assessment,
      plan,
    })
  }, [details, duration, selectedSymptoms, selectedNegatives, selectedExam, selectedPlanItems, additionalHistory, assessment, plan])

  return (
    <div className="space-y-6 lg:space-y-7">
      <SectionCard
        title="Quick Note"
        description="Fast OPD documentation for a selected workflow. Choose only what the clinician actually assessed or discussed."
      >
        <WorkflowChooser
          search={search}
          specialty={specialty}
          specialties={specialties}
          workflows={filtered.slice(0, 12)}
          loading={loading && !workflowId}
          error={!workflowId ? error : null}
          selectedWorkflowId={workflowId}
          emptyTitle="No quick-note workflows match that search"
          emptyDescription="Try a broader term or switch to all specialties."
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(id) => navigate(`/quick-note/${id}`)}
        />
      </SectionCard>

      <StateNotice
        title="Local draft only"
        description="Draft selections are saved in this browser for convenience. Do not enter patient identifiers."
        tone="warning"
      />

      {blockedMessage ? (
        <SectionCard title="Workflow blocked">
          <p className="text-sm text-amber-200">{blockedMessage}</p>
        </SectionCard>
      ) : null}

      {!workflowId && !loading ? (
        <SectionCard title="Choose a workflow first">
          <p className="text-sm text-slate-300">
            Start from the search above, or return to the home page to pick a common workflow for limited testing.
          </p>
        </SectionCard>
      ) : null}

      {error && workflowId ? (
        <SectionCard title="Workflow load problem">
          <p className="text-sm text-rose-200">{error}</p>
        </SectionCard>
      ) : null}

      {details ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              title={details.summary.title}
              description={`${normalizeDisplayText(details.summary.specialty)} · ${details.summary.diagnosis}`}
              actions={
                <Link to={`/encounter/${details.summary.workflowId}`} className="text-sm text-cyan-300">
                  Open detailed encounter
                </Link>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2.5 text-sm">
                  <span className="field-label">Duration</span>
                  <input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="field-input"
                    placeholder="e.g. 3 days"
                  />
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="field-label">Clinician impression</span>
                  <input
                    value={assessment}
                    onChange={(event) => setAssessment(event.target.value)}
                    className="field-input"
                    placeholder="Enter clinician-stated impression only"
                  />
                </label>
              </div>

              <label className="mt-5 block space-y-2.5 text-sm">
                <span className="field-label">Additional history</span>
                <textarea
                  value={additionalHistory}
                  onChange={(event) => setAdditionalHistory(event.target.value)}
                  rows={4}
                  className="field-textarea"
                  placeholder="Add any clinician-confirmed history details."
                />
              </label>

              <label className="mt-5 block space-y-2.5 text-sm">
                <span className="field-label">Clinician plan</span>
                <textarea
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  rows={4}
                  className="field-textarea"
                  placeholder="Enter only the clinician-stated plan."
                />
              </label>
            </SectionCard>

            <SectionCard title="Suggested findings" description="Use workflow-specific selections to speed up documentation.">
              <div className="space-y-6">
                <ChipSelector
                  label={displayGroupLabel('symptoms')}
                  items={chipsByGroup.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('relevant_negatives')}
                  items={chipsByGroup.relevant_negatives ?? []}
                  selectedItems={selectedNegatives}
                  onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('exam_findings')}
                  items={chipsByGroup.exam_findings ?? []}
                  selectedItems={selectedExam}
                  onToggle={(value) => setSelectedExam((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('plan_phrases')}
                  items={chipsByGroup.plan_phrases ?? []}
                  selectedItems={selectedPlanItems}
                  onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                />
              </div>
            </SectionCard>
          </div>

          <OutputPanel
            title="Output"
            description="Quick Note generates a SOAP draft only."
            tabs={[{ key: 'soap', label: 'SOAP note', content: output }]}
            onResetDraft={resetCurrentDraft}
            onClearSavedDraft={clearSavedDraft}
          />
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-400">Preparing the workflow-specific quick note view...</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

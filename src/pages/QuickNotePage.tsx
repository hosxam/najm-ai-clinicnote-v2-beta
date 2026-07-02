import { RefreshCcw, Sparkles, Wand2 } from 'lucide-react'
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
import { getQuickNoteSuggestedSelections } from '../lib/presetDefaults'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
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
  const suggested = getQuickNoteSuggestedSelections(details)
  return {
    workflowId: details?.summary.workflowId ?? '',
    duration: '',
    additionalHistory: '',
    assessment: '',
    plan: '',
    selectedSymptoms: suggested.symptoms,
    selectedNegatives: suggested.relevantNegatives,
    selectedExam: [],
    selectedPlanItems: suggested.planPhrases,
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

  function applySuggestedDefaults() {
    const defaults = getQuickNoteDefaults(details)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedPlanItems(defaults.selectedPlanItems)
  }

  function clearSelections() {
    setSelectedSymptoms([])
    setSelectedNegatives([])
    setSelectedExam([])
    setSelectedPlanItems([])
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

  const suggestedSelections = useMemo(() => getQuickNoteSuggestedSelections(details), [details])
  const totalSuggestedSelections =
    suggestedSelections.symptoms.length +
    suggestedSelections.relevantNegatives.length +
    suggestedSelections.planPhrases.length

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/84 p-6 shadow-[0_28px_90px_-42px_rgba(2,6,23,0.95)] sm:p-7">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Primary drafting workflow
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white text-wrap-pretty sm:text-4xl lg:text-[3rem] lg:leading-[1.04]">
            Quick Note is the fastest path from workflow selection to a clinician-review SOAP draft.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Suggested defaults are loaded from the existing workflow preset for safer chip groups only. Examination remains manual so the draft stays clinically reviewable and contradiction-safe.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.35rem] border border-slate-800/90 bg-slate-900/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Suggested groups</div>
              <div className="mt-2 text-2xl font-semibold text-white">3</div>
              <div className="mt-1 text-sm text-slate-400">Symptoms, negatives, plan phrases</div>
            </div>
            <div className="rounded-[1.35rem] border border-slate-800/90 bg-slate-900/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Manual group</div>
              <div className="mt-2 text-2xl font-semibold text-white">1</div>
              <div className="mt-1 text-sm text-slate-400">Exam findings stay manual</div>
            </div>
            <div className="rounded-[1.35rem] border border-amber-400/18 bg-amber-300/8 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Reminder</div>
              <div className="mt-2 text-2xl font-semibold text-white">Local</div>
              <div className="mt-1 text-sm text-amber-50/80">Drafts persist only in this browser</div>
            </div>
          </div>
        </div>

        <SectionCard
          title="Choose workflow"
          description="Search and select a workflow before drafting. Excluded workflows remain hidden."
        >
          <WorkflowChooser
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered.slice(0, 9)}
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
      </section>

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
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="rounded-[1.95rem] border border-slate-800/90 bg-slate-950/82 p-6 shadow-[0_30px_90px_-42px_rgba(2,6,23,0.96)] sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="workflow-meta">{details.summary.workflowId}</div>
                    <div className="workflow-meta">Quick Note workflow</div>
                    <div className="workflow-meta">{normalizeDisplayText(details.summary.specialty)}</div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white text-wrap-pretty sm:text-[2rem]">
                      {details.summary.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {details.summary.diagnosis}
                    </p>
                  </div>
                </div>
                <Link to={`/encounter/${details.summary.workflowId}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/90 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:border-slate-500 hover:bg-slate-900">
                  Open detailed encounter
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] border border-slate-800/85 bg-slate-900/60 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Suggested defaults</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{totalSuggestedSelections}</div>
                  <div className="mt-1 text-sm text-slate-400">Loaded from workflow preset</div>
                </div>
                <div className="rounded-[1.3rem] border border-slate-800/85 bg-slate-900/60 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Manual exam</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{chipsByGroup.exam_findings?.length ?? 0}</div>
                  <div className="mt-1 text-sm text-slate-400">Exam findings remain manual</div>
                </div>
                <div className="rounded-[1.3rem] border border-amber-400/18 bg-amber-300/8 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Review status</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Draft</div>
                  <div className="mt-1 text-sm text-amber-50/80">Review before export or copy</div>
                </div>
              </div>
            </div>

            <SectionCard
              title="Suggested defaults and selected findings"
              description="Suggested defaults loaded from workflow preset. Review every selected item before generating output."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applySuggestedDefaults}
                    disabled={!totalSuggestedSelections}
                  >
                    <Wand2 className="h-4 w-4" />
                    Use suggested defaults
                  </Button>
                  <Button variant="secondary" size="sm" onClick={clearSelections}>
                    <RefreshCcw className="h-4 w-4" />
                    Clear selections
                  </Button>
                </div>
              }
            >
              <div className="mb-5 rounded-[1.3rem] border border-sky-400/16 bg-sky-300/8 px-4 py-3 text-sm leading-6 text-sky-50/90">
                Suggested defaults are loaded from workflow preset data for symptoms, important negatives, and documentation-only plan phrases. Exam findings remain manual by design.
              </div>
              <div className="space-y-6">
                <ChipSelector
                  label={displayGroupLabel('symptoms')}
                  items={chipsByGroup.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  suggestedItems={suggestedSelections.symptoms}
                  description="Workflow-specific symptoms or history points suggested from speed presets."
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('relevant_negatives')}
                  items={chipsByGroup.relevant_negatives ?? []}
                  selectedItems={selectedNegatives}
                  suggestedItems={suggestedSelections.relevantNegatives}
                  description="Important negatives suggested from existing preset metadata."
                  onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('exam_findings')}
                  items={chipsByGroup.exam_findings ?? []}
                  selectedItems={selectedExam}
                  description="Left manual in Quick Note because imported presets do not include contradiction-safe exam rules."
                  onToggle={(value) => setSelectedExam((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('plan_phrases')}
                  items={chipsByGroup.plan_phrases ?? []}
                  selectedItems={selectedPlanItems}
                  suggestedItems={suggestedSelections.planPhrases}
                  description="Documentation-only plan phrases suggested from existing presets."
                  onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                />
              </div>
              {totalSuggestedSelections ? (
                <div className="mt-5 rounded-[1.2rem] border border-slate-800/90 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-400">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    {totalSuggestedSelections} suggested chip defaults available for this workflow
                  </div>
                  <div className="mt-1.5">
                    These suggestions come from imported speed presets only. Review and remove any item the clinician did not state or assess.
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Clinician free-text fields"
              description="Use free-text only for clinician-confirmed details that should appear in the draft."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2.5 text-sm">
                  <span className="field-label">Duration</span>
                  <Input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    placeholder="e.g. 3 days"
                  />
                </label>
                <label className="space-y-2.5 text-sm">
                  <span className="field-label">Clinician impression</span>
                  <Input
                    value={assessment}
                    onChange={(event) => setAssessment(event.target.value)}
                    placeholder="Enter clinician-stated impression only"
                  />
                </label>
              </div>

              <label className="mt-5 block space-y-2.5 text-sm">
                <span className="field-label">Additional history</span>
                <Textarea
                  value={additionalHistory}
                  onChange={(event) => setAdditionalHistory(event.target.value)}
                  rows={4}
                  placeholder="Add any clinician-confirmed history details."
                />
              </label>

              <label className="mt-5 block space-y-2.5 text-sm">
                <span className="field-label">Clinician plan</span>
                <Textarea
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  rows={4}
                  placeholder="Enter only the clinician-stated plan."
                />
              </label>
            </SectionCard>
          </div>

          <div className="xl:sticky xl:top-6">
            <OutputPanel
              title="Output"
              description="Quick Note generates a SOAP draft only."
              tabs={[{ key: 'soap', label: 'SOAP note', content: output }]}
              onResetDraft={resetCurrentDraft}
              onClearSavedDraft={clearSavedDraft}
            />
          </div>
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-400">Preparing the workflow-specific quick note view...</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

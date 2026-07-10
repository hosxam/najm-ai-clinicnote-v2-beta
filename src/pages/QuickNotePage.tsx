import { ArrowRight, FilePlus2, RefreshCcw, Search, Wand2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChipSelector } from '../components/ChipSelector'
import { OutputPanel } from '../components/OutputPanel'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { clearLocalDraft, loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildQuickSoapDraft } from '../lib/outputBuilders'
import { normalizeDisplayText } from '../lib/labelUtils'
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
  const [showWorkflowChooser, setShowWorkflowChooser] = useState(!workflowId)
  const outputRef = useRef<HTMLDivElement | null>(null)

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
      setShowWorkflowChooser(true)
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
      setShowWorkflowChooser(false)
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

  function handleGenerateNote() {
    outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.3)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-800 text-white">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">Document</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Quick Note</h1>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review workflow defaults, add clinician-confirmed details, then review the draft.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {details ? (
              <Button variant="secondary" size="sm" onClick={() => setShowWorkflowChooser((current) => !current)}>
                <Search className="h-4 w-4" />
                {showWorkflowChooser ? 'Hide workflow search' : 'Change workflow'}
              </Button>
            ) : null}
            {details ? (
              <Button asChild variant="ghost" size="sm">
                <Link to={`/encounter/${details.summary.workflowId}`}>Open detailed note</Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <span>Saved locally in this browser</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <span>Do not enter patient identifiers</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <span>Clinician review required</span>
        </div>
      </section>

      {showWorkflowChooser || !details ? (
        <SectionCard title="Choose workflow" description="Search by symptom, diagnosis, or workflow name.">
          <WorkflowChooser
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered.slice(0, 9)}
            loading={loading && !workflowId}
            error={!workflowId ? error : null}
            selectedWorkflowId={workflowId}
            title="Search symptom, diagnosis, or workflow"
            emptyTitle="No quick-note workflows match that search"
            emptyDescription="Try a broader term or switch to all specialties."
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(id) => {
              setShowWorkflowChooser(false)
              navigate(`/quick-note/${id}`)
            }}
          />
        </SectionCard>
      ) : null}

      {blockedMessage ? (
        <SectionCard title="Workflow blocked">
          <p className="text-sm text-amber-800">{blockedMessage}</p>
        </SectionCard>
      ) : null}

      {!workflowId && !loading ? (
        <SectionCard title="Choose a workflow first">
          <p className="text-sm text-slate-700">
            Start from the search above, or return to the home page to pick a common workflow for limited testing.
          </p>
        </SectionCard>
      ) : null}

      {error && workflowId ? (
        <SectionCard title="Workflow load problem">
          <p className="text-sm text-rose-800">{error}</p>
        </SectionCard>
      ) : null}

      {details ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.3)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="workflow-meta">{details.summary.workflowId}</div>
                    <div className="workflow-meta">Quick Note</div>
                    <div className="workflow-meta">{normalizeDisplayText(details.summary.specialty)}</div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 text-wrap-pretty">
                      {details.summary.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{details.summary.diagnosis}</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/encounter/${details.summary.workflowId}`}>Open detailed note</Link>
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="workflow-meta">{totalSuggestedSelections} suggested defaults</span>
                <span className="workflow-meta">{chipsByGroup.exam_findings?.length ?? 0} exam options stay manual</span>
                <span className="workflow-meta">Clinician review draft</span>
              </div>
            </div>

            <SectionCard
              title="Suggested defaults"
              description="Review the preselected items, then add or remove what the clinician actually documented."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
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
              <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900">
                Suggested defaults are loaded from this workflow preset. Exam findings remain manual.
              </div>
              <div className="space-y-6">
                <ChipSelector
                  label="Symptoms"
                  items={chipsByGroup.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  suggestedItems={suggestedSelections.symptoms}
                  description="Suggested symptoms and history points."
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label="Negatives"
                  items={chipsByGroup.relevant_negatives ?? []}
                  selectedItems={selectedNegatives}
                  suggestedItems={suggestedSelections.relevantNegatives}
                  description="Important negatives suggested from existing data."
                  onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label="Exam findings"
                  items={chipsByGroup.exam_findings ?? []}
                  selectedItems={selectedExam}
                  description="Kept manual in Quick Note."
                  onToggle={(value) => setSelectedExam((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label="Plan phrases"
                  items={chipsByGroup.plan_phrases ?? []}
                  selectedItems={selectedPlanItems}
                  suggestedItems={suggestedSelections.planPhrases}
                  description="Documentation-only plan phrases."
                  onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                />
              </div>
              {totalSuggestedSelections ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    {totalSuggestedSelections} suggested chip defaults available for this workflow
                  </div>
                  <div className="mt-1.5">
                    Review and remove anything the clinician did not state or assess.
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Add clinician details"
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

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="primary" onClick={handleGenerateNote}>
                  Generate note
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={resetCurrentDraft}>
                  <RefreshCcw className="h-4 w-4" />
                  Reset draft
                </Button>
                <Button variant="warning" onClick={clearSavedDraft}>
                  Clear saved draft
                </Button>
              </div>
            </SectionCard>
          </div>

          <div ref={outputRef} className="xl:sticky xl:top-6">
            <OutputPanel
              title="Draft"
              description="Review the draft before copying, printing, or using it elsewhere."
              tabs={[{ key: 'soap', label: 'SOAP note', content: output }]}
            />
          </div>
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-600">Preparing the workflow-specific quick note view...</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

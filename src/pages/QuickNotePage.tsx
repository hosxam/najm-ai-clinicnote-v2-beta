import { ArrowDown, ArrowRight, FilePlus2, RefreshCcw, RotateCcw, Sparkles, Wand2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChipSelector } from '../components/ChipSelector'
import { DocumentationSection } from '../components/DocumentationSection'
import { OutputPanel } from '../components/OutputPanel'
import { SelectedWorkflowBar } from '../components/SelectedWorkflowBar'
import { WorkflowCommand } from '../components/WorkflowCommand'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildQuickOutputs } from '../lib/outputBuilders'
import { getQuickNoteSuggestedSelections } from '../lib/presetDefaults'
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
  const [activeOutputKey, setActiveOutputKey] = useState('soap')
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
  }, [workflowId, blockedMessage, details, duration, additionalHistory, assessment, plan, selectedSymptoms, selectedNegatives, selectedExam, selectedPlanItems])

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

  function clearEnteredContent() {
    if (!window.confirm('Clear entered content and restore the workflow defaults? Autosave will continue.')) return
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
    if (!details) return { soap: '', emr: '' }
    return buildQuickOutputs({
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

  function handleReviewNote() {
    setActiveOutputKey('soap')
    outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const quickTabs = [
    { key: 'soap', label: 'SOAP', content: output.soap },
    { key: 'emr', label: 'EMR', content: output.emr },
    {
      key: 'referral',
      label: 'Referral',
      content: 'Referral drafting is not available in Quick Note. Open Detailed Note and enter a clinician-stated referral reason.',
    },
    {
      key: 'instructions',
      label: 'Instructions',
      content: 'Patient-instruction drafting is not available in Quick Note. Open Detailed Note and enter clinician-stated instructions.',
    },
  ]

  return (
    <div className="space-y-5">
      {details ? (
        <SelectedWorkflowBar
          workflow={details.summary}
          modeLabel="Quick Note"
          helperText="Suggested defaults are preselected. Remove anything you did not assess."
          suggestedCount={totalSuggestedSelections}
          onChangeWorkflow={() => setShowWorkflowChooser((current) => !current)}
        />
      ) : (
        <div className="page-title-row">
          <div>
            <div className="page-kicker"><FilePlus2 className="h-4 w-4" /> Quick Note</div>
            <h1 className="page-title">Choose a workflow to start</h1>
            <p className="page-description">Search a presentation, then review only the details documented by the clinician.</p>
          </div>
        </div>
      )}

      {showWorkflowChooser || !details ? (
        <section className="command-drawer">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{details ? 'Change workflow' : 'Select workflow'}</h2>
              <p className="mt-1 text-xs text-slate-500">Search symptom, diagnosis, or workflow name.</p>
            </div>
            {details ? <Button variant="ghost" size="sm" onClick={() => setShowWorkflowChooser(false)}>Close</Button> : null}
          </div>
          <WorkflowCommand
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered}
            loading={loading && !workflowId}
            error={!workflowId ? error : null}
            selectedWorkflowId={workflowId}
            compact
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(id) => {
              setShowWorkflowChooser(false)
              navigate(`/quick-note/${id}`)
            }}
          />
        </section>
      ) : null}

      {blockedMessage ? <div className="state-panel state-panel-warning">{blockedMessage}</div> : null}
      {error && workflowId ? <div className="state-panel state-panel-error">{error}</div> : null}

      {details ? (
        <div className="quick-workspace-grid">
          <div className="guided-workspace">
            <div className="guided-workspace-toolbar">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Sparkles className="h-4 w-4 text-cyan-800" /> Guided input
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">The clinician-review draft updates live and is saved locally. Do not enter patient identifiers.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={applySuggestedDefaults} disabled={!totalSuggestedSelections}>
                  <Wand2 className="h-4 w-4" /> Use defaults
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelections}>
                  <RefreshCcw className="h-4 w-4" /> Clear selections
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 text-xs leading-5 text-cyan-900">
              Suggested defaults are preselected. Remove anything you did not assess. Examination choices stay manual.
            </div>

            <DocumentationSection title="Patient context" description="Add only context explicitly documented in this encounter.">
              <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <label className="space-y-2 text-sm">
                  <span className="field-label">Duration</span>
                  <Input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="e.g. 3 days" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="field-label">Additional history</span>
                  <Textarea value={additionalHistory} onChange={(event) => setAdditionalHistory(event.target.value)} rows={3} placeholder="Clinician-confirmed history only." />
                </label>
              </div>
            </DocumentationSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <DocumentationSection title="Symptoms" description="Select only symptoms stated in the encounter." className="min-w-0">
                <ChipSelector
                  label="Symptoms"
                  items={chipsByGroup.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  suggestedItems={suggestedSelections.symptoms}
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                  variant="plain"
                  showHeader={false}
                />
              </DocumentationSection>
              <DocumentationSection title="Relevant negatives" description="Keep only negatives actually assessed or denied." className="min-w-0">
                <ChipSelector
                  label="Negatives"
                  items={chipsByGroup.relevant_negatives ?? []}
                  selectedItems={selectedNegatives}
                  suggestedItems={suggestedSelections.relevantNegatives}
                  onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))}
                  variant="plain"
                  showHeader={false}
                />
              </DocumentationSection>
            </div>

            <DocumentationSection title="Examination" description="No examination finding is preselected; choose only what was documented.">
              <ChipSelector
                label="Exam findings"
                items={chipsByGroup.exam_findings ?? []}
                selectedItems={selectedExam}
                onToggle={(value) => setSelectedExam((current) => toggleValue(current, value))}
                variant="plain"
                showHeader={false}
              />
            </DocumentationSection>

            <DocumentationSection title="Plan phrases" description="Documentation-only options from the selected workflow.">
              <ChipSelector
                label="Plan phrases"
                items={chipsByGroup.plan_phrases ?? []}
                selectedItems={selectedPlanItems}
                suggestedItems={suggestedSelections.planPhrases}
                onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                variant="plain"
                showHeader={false}
              />
            </DocumentationSection>

            <DocumentationSection title="Optional doctor note" description="Assessment and plan appear only from clinician-entered text or selected documentation phrases.">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="field-label">Clinician impression</span>
                  <Textarea value={assessment} onChange={(event) => setAssessment(event.target.value)} rows={3} placeholder="Clinician-stated impression only." />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="field-label">Clinician plan</span>
                  <Textarea value={plan} onChange={(event) => setPlan(event.target.value)} rows={3} placeholder="Clinician-stated plan only." />
                </label>
              </div>
            </DocumentationSection>

            <div className="guided-workspace-footer">
              <div className="flex flex-wrap gap-1.5">
                <Button variant="ghost" size="sm" onClick={resetCurrentDraft}><RotateCcw className="h-4 w-4" /> Reset</Button>
                <Button variant="warning" size="sm" onClick={clearEnteredContent}>Clear entered content</Button>
                <Button asChild variant="ghost" size="sm"><Link to={`/encounter/${details.summary.workflowId}`}>Detailed Note</Link></Button>
              </div>
              <Button variant="primary" size="lg" onClick={handleReviewNote}>
                Review note <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={outputRef} className="min-w-0 xl:sticky xl:top-20 xl:self-start">
            <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 xl:hidden">
              Draft review below <ArrowDown className="h-3.5 w-3.5" />
            </div>
            <OutputPanel
              title="Draft review"
              description="Live draft from selected chips and clinician-entered text."
              tabs={quickTabs}
              activeKey={activeOutputKey}
              onActiveKeyChange={setActiveOutputKey}
            />
          </div>
        </div>
      ) : workflowId && loading ? (
        <div className="state-panel">Preparing the workflow-specific Quick Note workspace…</div>
      ) : null}
    </div>
  )
}

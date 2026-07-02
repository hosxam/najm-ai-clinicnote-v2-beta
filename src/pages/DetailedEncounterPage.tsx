import { HeartPulse } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChecklistGroups } from '../components/ChecklistGroups'
import { ChipSelector } from '../components/ChipSelector'
import { OutputPanel } from '../components/OutputPanel'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { clearLocalDraft, loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildDetailedOutputs } from '../lib/outputBuilders'
import { cleanPlaceholderLabel, normalizeDisplayText, normalizeDocumentationText } from '../lib/labelUtils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import type { WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function getDisplayWarning(label: string, warning?: string) {
  if (!warning) return undefined
  return label.toLowerCase().includes(warning.toLowerCase()) ? undefined : warning
}

type DetailedEncounterDraft = {
  workflowId: string
  historyValues: Record<string, string>
  selectedSymptoms: string[]
  selectedNegatives: string[]
  selectedExamPrompts: string[]
  selectedInvestigations: string[]
  assessment: string
  plan: string
  selectedPlanItems: string[]
  referralReason: string
  patientInstructions: string
  activeTab: 'soap' | 'emr' | 'referral' | 'instructions'
}

const DETAILED_ENCOUNTER_STORAGE_KEY = 'detailed-encounter-draft'

function getDetailedEncounterDefaults(details: WorkflowDetails | null): DetailedEncounterDraft {
  return {
    workflowId: details?.summary.workflowId ?? '',
    historyValues: {},
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExamPrompts: [],
    selectedInvestigations: [],
    assessment: '',
    plan: '',
    selectedPlanItems: [],
    referralReason: '',
    patientInstructions: '',
    activeTab: 'soap',
  }
}

export function DetailedEncounterPage() {
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
  const [historyValues, setHistoryValues] = useState<Record<string, string>>({})
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>([])
  const [selectedExamPrompts, setSelectedExamPrompts] = useState<string[]>([])
  const [selectedInvestigations, setSelectedInvestigations] = useState<string[]>([])
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [selectedPlanItems, setSelectedPlanItems] = useState<string[]>([])
  const [referralReason, setReferralReason] = useState('')
  const [patientInstructions, setPatientInstructions] = useState('')
  const [activeTab, setActiveTab] = useState<'soap' | 'emr' | 'referral' | 'instructions'>('soap')

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
      const savedDraft = loadLocalDraft<DetailedEncounterDraft>(DETAILED_ENCOUNTER_STORAGE_KEY)
      if (savedDraft?.workflowId) {
        navigate(`/encounter/${savedDraft.workflowId}`, { replace: true })
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
      const defaults = getDetailedEncounterDefaults(loadedDetails)
      const savedDraft = loadLocalDraft<DetailedEncounterDraft>(DETAILED_ENCOUNTER_STORAGE_KEY)
      const restoredDraft =
        savedDraft && savedDraft.workflowId === workflowId
          ? { ...defaults, ...savedDraft, workflowId }
          : defaults

      setHistoryValues(restoredDraft.historyValues)
      setSelectedSymptoms(restoredDraft.selectedSymptoms)
      setSelectedNegatives(restoredDraft.selectedNegatives)
      setSelectedExamPrompts(restoredDraft.selectedExamPrompts)
      setSelectedInvestigations(restoredDraft.selectedInvestigations)
      setAssessment(restoredDraft.assessment)
      setPlan(restoredDraft.plan)
      setSelectedPlanItems(restoredDraft.selectedPlanItems)
      setReferralReason(restoredDraft.referralReason)
      setPatientInstructions(restoredDraft.patientInstructions)
      setActiveTab(restoredDraft.activeTab)
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

    saveLocalDraft<DetailedEncounterDraft>(DETAILED_ENCOUNTER_STORAGE_KEY, {
      workflowId,
      historyValues,
      selectedSymptoms,
      selectedNegatives,
      selectedExamPrompts,
      selectedInvestigations,
      assessment,
      plan,
      selectedPlanItems,
      referralReason,
      patientInstructions,
      activeTab,
    })
  }, [
    workflowId,
    blockedMessage,
    details,
    historyValues,
    selectedSymptoms,
    selectedNegatives,
    selectedExamPrompts,
    selectedInvestigations,
    assessment,
    plan,
    selectedPlanItems,
    referralReason,
    patientInstructions,
    activeTab,
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
    if (!window.confirm('Reset the current detailed encounter draft for this workflow?')) return
    const defaults = getDetailedEncounterDefaults(details)
    setHistoryValues(defaults.historyValues)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedExamPrompts(defaults.selectedExamPrompts)
    setSelectedInvestigations(defaults.selectedInvestigations)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedPlanItems(defaults.selectedPlanItems)
    setReferralReason(defaults.referralReason)
    setPatientInstructions(defaults.patientInstructions)
    setActiveTab(defaults.activeTab)
  }

  function clearSavedDraft() {
    if (!window.confirm('Clear the saved detailed encounter draft from this browser?')) return
    clearLocalDraft(DETAILED_ENCOUNTER_STORAGE_KEY)
    const defaults = getDetailedEncounterDefaults(details)
    setHistoryValues(defaults.historyValues)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedExamPrompts(defaults.selectedExamPrompts)
    setSelectedInvestigations(defaults.selectedInvestigations)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedPlanItems(defaults.selectedPlanItems)
    setReferralReason(defaults.referralReason)
    setPatientInstructions(defaults.patientInstructions)
    setActiveTab(defaults.activeTab)
  }

  const chipGroups = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    for (const chip of details?.chips?.chips ?? []) {
      grouped[chip.group] = [...(grouped[chip.group] ?? []), chip.chip_text]
    }
    return grouped
  }, [details])

  const output = useMemo(() => {
    if (!details) {
      return {
        soap: '',
        emr: '',
        referral: '',
        patientInstructions: '',
      }
    }
    return buildDetailedOutputs({
      workflow: details,
      historyValues,
      selectedSymptoms,
      selectedNegatives,
      selectedExamPrompts,
      selectedInvestigations,
      assessment,
      plan,
      selectedPlanItems,
      referralReason,
      patientInstructions,
    })
  }, [details, historyValues, selectedSymptoms, selectedNegatives, selectedExamPrompts, selectedInvestigations, assessment, plan, selectedPlanItems, referralReason, patientInstructions])

  const historyFields = useMemo(() => {
    if (!details) return []

    const layoutFields =
      details.specialtyLayout?.sections
        .slice(0, 3)
        .flatMap((section) =>
          section.fields.slice(0, 2).map((field) => ({
            id: field.field_id,
            label: field.prompt,
            placeholder: field.placeholder ?? '',
          })),
        ) ?? []

    if (layoutFields.length) return layoutFields

    return (details.historyDraft?.editable_placeholders ?? []).map((placeholder) => ({
      id: placeholder,
      label: cleanPlaceholderLabel(placeholder),
      placeholder: '',
    }))
  }, [details])

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <SectionCard
          title="Detailed note"
          description="Use this only when the case needs more structure than Quick Note."
          actions={
            workflowId ? (
              <Button asChild variant="ghost" size="sm">
                <Link to={`/quick-note/${workflowId}`}>Back to Quick Note</Link>
              </Button>
            ) : undefined
          }
        >
          <div className="flex items-start gap-3 rounded-[1.2rem] border border-slate-800/80 bg-slate-900/55 px-4 py-3 text-sm leading-6 text-slate-300">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            Detailed note stays manual by design. It is intentionally more structured and should feel secondary to Quick Note.
          </div>
        </SectionCard>
        <SectionCard
          title="Choose workflow"
          description="Search for a workflow to open the structured editor."
        >
          <WorkflowChooser
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered.slice(0, 9)}
            loading={loading && !workflowId}
            error={!workflowId ? error : null}
            selectedWorkflowId={workflowId}
            emptyTitle="No detailed-encounter workflows match that search"
            emptyDescription="Try a broader term or switch to all specialties."
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(id) => navigate(`/encounter/${id}`)}
          />
        </SectionCard>
      </section>

      {blockedMessage ? (
        <SectionCard title="Workflow blocked">
          <p className="text-sm text-amber-200">{blockedMessage}</p>
        </SectionCard>
      ) : null}

      {!workflowId && !loading ? (
        <SectionCard title="Choose a workflow first">
          <p className="text-sm text-slate-300">
            Search above to start a structured encounter, or begin from the home page with a common workflow.
          </p>
        </SectionCard>
      ) : null}

      {error && workflowId ? (
        <SectionCard title="Workflow load problem">
          <p className="text-sm text-rose-200">{error}</p>
        </SectionCard>
      ) : null}

      {details ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <SectionCard
              title={`${details.summary.title} detailed note`}
              description={`${normalizeDisplayText(details.summary.specialty)} · ${details.summary.diagnosis}`}
            >
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <div className="workflow-meta">{details.summary.workflowId}</div>
                <div className="workflow-meta">Manual detailed drafting</div>
              </div>
              <div className="mb-5 rounded-[1.2rem] border border-slate-800/80 bg-slate-900/55 px-4 py-3 text-xs leading-5 text-slate-400">
                Suggested defaults are intentionally not auto-applied here. Use this page when you need more structure and more manual control.
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {historyFields.map((field) => (
                  <label key={field.id} className="space-y-2.5 text-sm">
                    <span className="field-label">{field.label}</span>
                    <Input
                      value={historyValues[field.id] ?? ''}
                      onChange={(event) =>
                        setHistoryValues((current) => ({ ...current, [field.id]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Symptoms and negatives">
              <div className="space-y-6">
                <ChipSelector
                  label="Symptoms"
                  items={chipGroups.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label="Negatives"
                  items={chipGroups.relevant_negatives ?? []}
                  selectedItems={selectedNegatives}
                  onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))}
                />
              </div>
            </SectionCard>

            <SectionCard title="Examination">
              <ChecklistGroups
                groups={
                  details.examDetails?.exam_groups.map((group) => ({
                    id: group.group_id,
                    label: group.group_label,
                    safetyNote: group.safety_note,
                    options: group.prompts.map((prompt) => ({
                      id: prompt.prompt_id,
                      label: normalizeDocumentationText(prompt.prompt_text),
                      warning: getDisplayWarning(
                        normalizeDocumentationText(prompt.prompt_text),
                        prompt.warning ? normalizeDocumentationText(prompt.warning) : undefined,
                      ),
                    })),
                  })) ?? []
                }
                selectedValues={selectedExamPrompts}
                onToggle={(value) => setSelectedExamPrompts((current) => toggleValue(current, value))}
              />
            </SectionCard>

            <SectionCard title="Investigations">
              <ChecklistGroups
                groups={
                  details.investigationDetails?.investigation_groups.map((group) => ({
                    id: group.group_id,
                    label: group.group_label,
                    safetyNote: undefined,
                    options: group.options.map((option) => ({
                      id: option.option_id,
                      label: normalizeDocumentationText(option.option_text),
                      noteText: normalizeDocumentationText(option.note_text || option.option_text),
                      warning: getDisplayWarning(
                        normalizeDocumentationText(option.option_text),
                        option.safety_note ? normalizeDocumentationText(option.safety_note) : undefined,
                      ),
                    })),
                  })) ?? []
                }
                selectedValues={selectedInvestigations}
                onToggle={(value) => setSelectedInvestigations((current) => toggleValue(current, value))}
              />
            </SectionCard>

            <SectionCard title="Assessment and plan">
              <div className="space-y-4">
                <label className="block space-y-2.5 text-sm">
                  <span className="field-label">Clinician impression</span>
                  <Textarea
                    value={assessment}
                    onChange={(event) => setAssessment(event.target.value)}
                    rows={3}
                    placeholder="Enter clinician-stated impression only."
                  />
                </label>
                <label className="block space-y-2.5 text-sm">
                  <span className="field-label">Clinician plan</span>
                  <Textarea
                    value={plan}
                    onChange={(event) => setPlan(event.target.value)}
                    rows={4}
                    placeholder="Enter clinician-stated plan only."
                  />
                </label>
                <ChecklistGroups
                  groups={
                    details.planDetails?.plan_option_groups.map((group) => ({
                      id: group.group_id,
                      label: group.group_label,
                      safetyNote: undefined,
                    options: group.options.map((option) => ({
                      id: option.option_id,
                      label: normalizeDocumentationText(option.option_text),
                      noteText: normalizeDocumentationText(option.note_text || option.option_text),
                      warning: getDisplayWarning(
                        normalizeDocumentationText(option.option_text),
                        option.safety_note ? normalizeDocumentationText(option.safety_note) : undefined,
                      ),
                    })),
                  })) ?? []
                  }
                  selectedValues={selectedPlanItems}
                  onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                />
              </div>
            </SectionCard>

            <SectionCard title="Optional outputs">
              <div className="space-y-4">
                <label className="block space-y-2.5 text-sm">
                  <span className="field-label">Referral reason</span>
                  <Textarea
                    value={referralReason}
                    onChange={(event) => setReferralReason(event.target.value)}
                    rows={3}
                    placeholder="Enter only if the clinician requested a referral letter."
                  />
                </label>
                <label className="block space-y-2.5 text-sm">
                  <span className="field-label">Patient instructions</span>
                  <Textarea
                    value={patientInstructions}
                    onChange={(event) => setPatientInstructions(event.target.value)}
                    rows={3}
                    placeholder="Only enter explicit clinician-stated patient instructions."
                  />
                </label>
              </div>
            </SectionCard>
          </div>

          <div className="xl:sticky xl:top-6">
            <OutputPanel
              title="Draft"
              tabs={[
                { key: 'soap', label: 'SOAP note', content: output.soap },
                { key: 'emr', label: 'EMR note', content: output.emr },
                { key: 'referral', label: 'Referral letter', content: output.referral },
                { key: 'instructions', label: 'Patient instructions', content: output.patientInstructions },
              ]}
              activeKey={activeTab}
              onActiveKeyChange={(key) => setActiveTab(key as typeof activeTab)}
              onResetDraft={resetCurrentDraft}
              onClearSavedDraft={clearSavedDraft}
            />
          </div>
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-400">Preparing the structured encounter editor...</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

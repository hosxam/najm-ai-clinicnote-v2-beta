import { ArrowLeft, ArrowRight, ClipboardList, FileSearch2, FlaskConical, ListChecks, ShieldAlert, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChecklistGroups } from '../components/ChecklistGroups'
import { ChipSelector } from '../components/ChipSelector'
import { DocumentationSection } from '../components/DocumentationSection'
import { OutputPanel } from '../components/OutputPanel'
import { SelectedWorkflowBar } from '../components/SelectedWorkflowBar'
import { WorkflowCommand } from '../components/WorkflowCommand'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { cleanPlaceholderLabel, normalizeDocumentationText } from '../lib/labelUtils'
import { loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildDetailedOutputs } from '../lib/outputBuilders'
import type { WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function getDisplayWarning(label: string, warning?: string) {
  if (!warning) return undefined
  return label.toLowerCase().includes(warning.toLowerCase()) ? undefined : warning
}

function groupLabel(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

type DetailedSectionKey = 'history' | 'examination' | 'investigations' | 'impression' | 'plan'

const detailedSections: Array<{
  key: DetailedSectionKey
  label: string
  shortLabel: string
  icon: typeof ClipboardList
}> = [
  { key: 'history', label: 'History', shortLabel: 'History', icon: ClipboardList },
  { key: 'examination', label: 'Examination', shortLabel: 'Exam', icon: Stethoscope },
  { key: 'investigations', label: 'Investigations', shortLabel: 'Tests', icon: FlaskConical },
  { key: 'impression', label: 'Impression', shortLabel: 'Impression', icon: FileSearch2 },
  { key: 'plan', label: 'Plan & outputs', shortLabel: 'Plan', icon: ListChecks },
]

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
  selectedRedFlags: string[]
  selectedFollowUp: string[]
  selectedAdditionalContext: string[]
  selectedMedications: string[]
  vitalValues: Record<string, string>
  safetyNetting: string
  activeTab: 'soap' | 'emr' | 'referral' | 'instructions'
}

const DETAILED_ENCOUNTER_SCHEMA_VERSION = '1'
const detailedEncounterStorageKey = (workflowId: string) => `draft:${DETAILED_ENCOUNTER_SCHEMA_VERSION}:${workflowId}:advanced`

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
    selectedRedFlags: [],
    selectedFollowUp: [],
    selectedAdditionalContext: [],
    selectedMedications: [],
    vitalValues: {},
    safetyNetting: '',
    activeTab: 'soap',
  }
}

export function DetailedEncounterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { workflowId } = useParams()
  const betaRoute = location.pathname.startsWith('/beta')
  const quickRoute = (id: string) => betaRoute ? `/beta/workflows/${encodeURIComponent(id)}?mode=quick` : `/quick-note/${id}`
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
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([])
  const [selectedFollowUp, setSelectedFollowUp] = useState<string[]>([])
  const [selectedAdditionalContext, setSelectedAdditionalContext] = useState<string[]>([])
  const [selectedMedications, setSelectedMedications] = useState<string[]>([])
  const [vitalValues, setVitalValues] = useState<Record<string, string>>({})
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [selectedPlanItems, setSelectedPlanItems] = useState<string[]>([])
  const [referralReason, setReferralReason] = useState('')
  const [patientInstructions, setPatientInstructions] = useState('')
  const [safetyNetting, setSafetyNetting] = useState('')
  const [activeTab, setActiveTab] = useState<'soap' | 'emr' | 'referral' | 'instructions'>('soap')
  const [activeSection, setActiveSection] = useState<DetailedSectionKey>('history')
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
      // See the corresponding Quick Note guard: beta routes are admitted by
      // BetaWorkflowModePage only after an active-catalogue membership check.
      // Keep exclusions fail-closed on the main site, but do not make the
      // beta's active 416-workflow release unable to open seven protected
      // records that are intentionally present in that release catalogue.
      if (summary?.exclusion && !betaRoute) {
        setBlockedMessage('This workflow is excluded from limited internal testing pending medical review.')
        setDetails(null)
        setLoading(false)
        return
      }

      setBlockedMessage(null)
      setDetails(loadedDetails)
      setShowWorkflowChooser(false)
      const defaults = getDetailedEncounterDefaults(loadedDetails)
      const savedDraft = loadLocalDraft<DetailedEncounterDraft>(detailedEncounterStorageKey(workflowId))
      const restoredDraft =
        savedDraft && savedDraft.workflowId === workflowId
          ? { ...defaults, ...savedDraft, workflowId }
          : defaults

      setHistoryValues(restoredDraft.historyValues)
      setSelectedSymptoms(restoredDraft.selectedSymptoms)
      setSelectedNegatives(restoredDraft.selectedNegatives)
      setSelectedExamPrompts(restoredDraft.selectedExamPrompts)
      setSelectedInvestigations(restoredDraft.selectedInvestigations)
      setSelectedRedFlags(restoredDraft.selectedRedFlags)
      setSelectedFollowUp(restoredDraft.selectedFollowUp)
      setSelectedAdditionalContext(restoredDraft.selectedAdditionalContext)
      setSelectedMedications(restoredDraft.selectedMedications)
      setVitalValues(restoredDraft.vitalValues)
      setAssessment(restoredDraft.assessment)
      setPlan(restoredDraft.plan)
      setSelectedPlanItems(restoredDraft.selectedPlanItems)
      setReferralReason(restoredDraft.referralReason)
      setPatientInstructions(restoredDraft.patientInstructions)
      setSafetyNetting(restoredDraft.safetyNetting)
      setActiveTab(restoredDraft.activeTab)
      setActiveSection('history')
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
  }, [betaRoute, navigate, workflowId])

  useEffect(() => {
    if (!workflowId || blockedMessage || !details) return

    saveLocalDraft<DetailedEncounterDraft>(detailedEncounterStorageKey(workflowId), {
      workflowId,
      historyValues,
      selectedSymptoms,
      selectedNegatives,
      selectedExamPrompts,
      selectedInvestigations,
      selectedRedFlags,
      selectedFollowUp,
      selectedAdditionalContext,
      selectedMedications,
      vitalValues,
      assessment,
      plan,
      selectedPlanItems,
      referralReason,
      patientInstructions,
      safetyNetting,
      activeTab,
    })
  }, [workflowId, blockedMessage, details, historyValues, selectedSymptoms, selectedNegatives, selectedExamPrompts, selectedInvestigations, selectedRedFlags, selectedFollowUp, selectedAdditionalContext, selectedMedications, vitalValues, assessment, plan, selectedPlanItems, referralReason, patientInstructions, safetyNetting, activeTab])

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
    setSelectedRedFlags(defaults.selectedRedFlags)
    setSelectedFollowUp(defaults.selectedFollowUp)
    setSelectedAdditionalContext(defaults.selectedAdditionalContext)
    setSelectedMedications(defaults.selectedMedications)
    setVitalValues(defaults.vitalValues)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedPlanItems(defaults.selectedPlanItems)
    setReferralReason(defaults.referralReason)
    setPatientInstructions(defaults.patientInstructions)
    setSafetyNetting(defaults.safetyNetting)
    setActiveTab(defaults.activeTab)
    setActiveSection('history')
  }

  function clearEnteredContent() {
    if (!window.confirm('Clear entered content from this detailed encounter? Autosave will continue with an empty draft.')) return
    const defaults = getDetailedEncounterDefaults(details)
    setHistoryValues(defaults.historyValues)
    setSelectedSymptoms(defaults.selectedSymptoms)
    setSelectedNegatives(defaults.selectedNegatives)
    setSelectedExamPrompts(defaults.selectedExamPrompts)
    setSelectedInvestigations(defaults.selectedInvestigations)
    setSelectedRedFlags(defaults.selectedRedFlags)
    setSelectedFollowUp(defaults.selectedFollowUp)
    setSelectedAdditionalContext(defaults.selectedAdditionalContext)
    setSelectedMedications(defaults.selectedMedications)
    setVitalValues(defaults.vitalValues)
    setAssessment(defaults.assessment)
    setPlan(defaults.plan)
    setSelectedPlanItems(defaults.selectedPlanItems)
    setReferralReason(defaults.referralReason)
    setPatientInstructions(defaults.patientInstructions)
    setSafetyNetting(defaults.safetyNetting)
    setActiveTab(defaults.activeTab)
    setActiveSection('history')
  }

  const chipGroups = useMemo(() => {
    const grouped: Record<string, string[]> = {}
    for (const chip of details?.chips?.chips ?? []) {
      grouped[chip.group] = [...(grouped[chip.group] ?? []), chip.chip_text]
    }
    return grouped
  }, [details])

  const additionalChipGroups = useMemo(() => {
    const excluded = new Set(['symptoms', 'relevant_negatives', 'exam_findings', 'investigations', 'plan_phrases', 'red_flags', 'follow_up', 'medications'])
    return Object.entries(chipGroups).filter(([group, items]) => !excluded.has(group) && items.length)
  }, [chipGroups])

  const toggleAdditionalContext = (value: string) => setSelectedAdditionalContext((current) => toggleValue(current, value))
  const vitalPrompts = useMemo(() => details?.examDetails?.exam_groups.find((group) => group.group_id === 'vitals')?.prompts ?? [], [details])
  const nonVitalExamGroups = useMemo(() => details?.examDetails?.exam_groups.filter((group) => group.group_id !== 'vitals') ?? [], [details])

  const output = useMemo(() => {
    if (!details) {
      return {
        soap: '',
        emr: '',
        referral: '',
        patientInstructions: '',
        hasMeaningfulContent: false,
        hasReferralContent: false,
        hasPatientInstructionsContent: false,
      }
    }
    return buildDetailedOutputs({
      workflow: details,
      historyValues,
      selectedSymptoms,
      selectedNegatives,
      selectedExamPrompts,
      selectedInvestigations,
      selectedRedFlags,
      selectedFollowUp,
      selectedAdditionalContext,
      selectedMedications,
      safetyNetting,
      assessment,
      plan,
      selectedPlanItems,
      referralReason,
      patientInstructions,
    })
  }, [details, historyValues, selectedSymptoms, selectedNegatives, selectedExamPrompts, selectedInvestigations, selectedRedFlags, selectedFollowUp, selectedAdditionalContext, selectedMedications, safetyNetting, assessment, plan, selectedPlanItems, referralReason, patientInstructions])

  const historyFields = useMemo(() => {
    if (!details) return []
    const layoutFields =
      details.specialtyLayout?.sections
        .flatMap((section) => section.fields.map((field) => ({
          id: field.field_id,
          label: field.prompt,
          placeholder: field.placeholder ?? '',
        }))) ?? []

    if (layoutFields.length) return layoutFields
    return (details.historyDraft?.editable_placeholders ?? []).map((placeholder) => ({
      id: placeholder,
      label: cleanPlaceholderLabel(placeholder),
      placeholder: '',
    }))
  }, [details])

  const activeSectionIndex = detailedSections.findIndex((section) => section.key === activeSection)
  const previousSection = detailedSections[activeSectionIndex - 1]
  const nextSection = detailedSections[activeSectionIndex + 1]

  return (
    <div className="space-y-5">
      {details ? (
        <SelectedWorkflowBar
          workflow={details.summary}
          modeLabel="Detailed Note"
          helperText="Manual section-by-section drafting with a persistent review pane."
          onChangeWorkflow={() => setShowWorkflowChooser((current) => !current)}
        />
      ) : (
        <div className="page-title-row">
          <div>
            <div className="page-kicker"><ClipboardList className="h-4 w-4" /> Detailed Note</div>
            <h1 className="page-title">Choose a workflow for structured drafting</h1>
            <p className="page-description">Use this secondary mode when an encounter needs more manual documentation structure.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/quick-note">Back to Quick Note</Link></Button>
        </div>
      )}

      {showWorkflowChooser || !details ? (
        <section className="command-drawer">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{details ? 'Change workflow' : 'Select workflow'}</h2>
              <p className="mt-1 text-xs text-slate-500">Search for a workflow to open the structured editor.</p>
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
              navigate(betaRoute ? `/beta/workflows/${encodeURIComponent(id)}?mode=advanced` : `/encounter/${id}`)
            }}
          />
        </section>
      ) : null}

      {blockedMessage ? <div className="state-panel state-panel-warning">{blockedMessage}</div> : null}
      {error && workflowId ? <div className="state-panel state-panel-error">{error}</div> : null}

      {details ? (
        <div className="detailed-workspace-grid">
          <div className="structured-editor">
            <div className="structured-editor-header">
              <div>
                <div className="text-sm font-semibold text-slate-950">Structured encounter</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Defaults stay manual in Detailed Note. Focus on one section at a time.</p>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to={quickRoute(details.summary.workflowId)}>Switch to Quick Note</Link></Button>
            </div>

            <div className="structured-editor-body">
              <nav className="section-rail" aria-label="Detailed note sections">
                {detailedSections.map((section, index) => {
                  const Icon = section.icon
                  const active = section.key === activeSection
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setActiveSection(section.key)}
                      className={`section-rail-item ${active ? 'section-rail-item-active' : ''}`}
                    >
                      <span className="section-rail-index">{index + 1}</span>
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{section.label}</span>
                      <span className="lg:hidden">{section.shortLabel}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="min-w-0 p-4 sm:p-6 lg:p-7">
                {activeSection === 'history' ? (
                  <div className="space-y-7">
                    <DocumentationSection title="History" description="Enter explicit history details and select only documented symptoms, chronology, risks, and negatives.">
                      <div className="grid gap-4 md:grid-cols-2">
                        {historyFields.map((field) => (
                          <label key={field.id} className="space-y-2 text-sm">
                            <span className="field-label">{field.label}</span>
                            <Input
                              value={historyValues[field.id] ?? ''}
                              onChange={(event) => setHistoryValues((current) => ({ ...current, [field.id]: event.target.value }))}
                              placeholder={field.placeholder}
                            />
                          </label>
                        ))}
                      </div>
                    </DocumentationSection>
                    <div className="grid gap-6 xl:grid-cols-2">
                      <ChipSelector label="Symptoms" items={chipGroups.symptoms ?? []} selectedItems={selectedSymptoms} onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))} variant="plain" />
                      <ChipSelector label="Relevant negatives" items={chipGroups.relevant_negatives ?? []} selectedItems={selectedNegatives} onToggle={(value) => setSelectedNegatives((current) => toggleValue(current, value))} variant="plain" />
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                      <ChipSelector label="Red flags assessed" items={chipGroups.red_flags ?? []} selectedItems={selectedRedFlags} onToggle={(value) => setSelectedRedFlags((current) => toggleValue(current, value))} variant="plain" />
                      <ChipSelector label="Follow-up context" items={chipGroups.follow_up ?? []} selectedItems={selectedFollowUp} onToggle={(value) => setSelectedFollowUp((current) => toggleValue(current, value))} variant="plain" />
                    </div>
                    {additionalChipGroups.length ? (
                      <div className="grid gap-6 xl:grid-cols-2">
                        {additionalChipGroups.map(([group, items]) => <ChipSelector key={group} label={groupLabel(group)} items={items} selectedItems={selectedAdditionalContext} onToggle={toggleAdditionalContext} variant="plain" />)}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {activeSection === 'examination' ? (
                  <DocumentationSection title="Examination" description="Select only examination findings explicitly assessed and documented.">
                    {vitalPrompts.length ? <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4">
                      <div className="mb-3"><h3 className="text-sm font-semibold text-cyan-950">Vital signs</h3><p className="mt-1 text-xs leading-5 text-cyan-900">Enter values only when measured or explicitly documented. Blank means not recorded, not normal.</p></div>
                      <div className="grid gap-4 sm:grid-cols-2">{vitalPrompts.map((prompt) => <label key={prompt.prompt_id} className="space-y-2 text-sm"><span className="field-label">{groupLabel(prompt.prompt_id)}</span><Input value={vitalValues[prompt.prompt_id] ?? ''} onChange={(event) => { const value = event.target.value; setVitalValues((current) => ({ ...current, [prompt.prompt_id]: value })); setSelectedExamPrompts((current) => { const prefix = `${groupLabel(prompt.prompt_id)}:`; const without = current.filter((item) => !item.startsWith(prefix)); return value.trim() ? [...without, `${prefix} ${value.trim()}`] : without }) }} placeholder="Enter if measured" inputMode="decimal" /></label>)}</div>
                    </div> : null}
                    <ChecklistGroups
                      variant="plain"
                      groups={nonVitalExamGroups.map((group) => ({
                        id: group.group_id,
                        label: group.group_label,
                        safetyNote: group.safety_note,
                        options: group.prompts.map((prompt) => ({
                          id: prompt.prompt_id,
                          label: normalizeDocumentationText(prompt.prompt_text),
                          warning: getDisplayWarning(normalizeDocumentationText(prompt.prompt_text), prompt.warning ? normalizeDocumentationText(prompt.warning) : undefined),
                        })),
                      })) ?? []}
                      selectedValues={selectedExamPrompts}
                      onToggle={(value) => setSelectedExamPrompts((current) => toggleValue(current, value))}
                    />
                  </DocumentationSection>
                ) : null}

                {activeSection === 'investigations' ? (
                  <DocumentationSection title="Investigations" description="Record investigations only when reviewed, ordered, or discussed by the clinician.">
                    <ChecklistGroups
                      variant="plain"
                      groups={details.investigationDetails?.investigation_groups.map((group) => ({
                        id: group.group_id,
                        label: group.group_label,
                        options: group.options.map((option) => ({
                          id: option.option_id,
                          label: normalizeDocumentationText(option.option_text),
                          noteText: normalizeDocumentationText(option.note_text || option.option_text),
                          warning: getDisplayWarning(normalizeDocumentationText(option.option_text), option.safety_note ? normalizeDocumentationText(option.safety_note) : undefined),
                        })),
                      })) ?? []}
                      selectedValues={selectedInvestigations}
                      onToggle={(value) => setSelectedInvestigations((current) => toggleValue(current, value))}
                    />
                  </DocumentationSection>
                ) : null}

                {activeSection === 'impression' ? (
                  <DocumentationSection title="Clinician impression" description="Do not infer or add a diagnosis. Enter only the clinician-stated impression.">
                    <label className="block space-y-2 text-sm">
                      <span className="field-label">Assessment / impression</span>
                      <Textarea value={assessment} onChange={(event) => setAssessment(event.target.value)} rows={8} placeholder="Clinician-stated impression only." />
                    </label>
                  </DocumentationSection>
                ) : null}

                {activeSection === 'plan' ? (
                  <div className="space-y-7">
                    <DocumentationSection title="Plan" description="Use only clinician-stated plan text and clinician-selected documentation options.">
                      <label className="block space-y-2 text-sm">
                        <span className="field-label">Clinician plan</span>
                        <Textarea value={plan} onChange={(event) => setPlan(event.target.value)} rows={5} placeholder="Clinician-stated plan only." />
                      </label>
                      <div className="mt-6">
                        <ChecklistGroups
                          variant="plain"
                          groups={details.planDetails?.plan_option_groups.map((group) => ({
                            id: group.group_id,
                            label: group.group_label,
                            options: group.options.map((option) => ({
                              id: option.option_id,
                              label: normalizeDocumentationText(option.option_text),
                              noteText: normalizeDocumentationText(option.note_text || option.option_text),
                              warning: getDisplayWarning(normalizeDocumentationText(option.option_text), option.safety_note ? normalizeDocumentationText(option.safety_note) : undefined),
                            })),
                          })) ?? []}
                          selectedValues={selectedPlanItems}
                          onToggle={(value) => setSelectedPlanItems((current) => toggleValue(current, value))}
                        />
                      </div>
                      <div className="mt-6">
                        <ChecklistGroups
                          variant="plain"
                          groups={details.medicationDetails?.option_groups.map((group) => ({ id: group.group_id, label: group.group_label, safetyNote: group.safety_note, options: group.options.map((option) => ({ id: option.option_id, label: normalizeDocumentationText(option.label), noteText: normalizeDocumentationText(option.note_text || option.label), warning: option.warning ? normalizeDocumentationText(option.warning) : undefined })) })) ?? []}
                          selectedValues={selectedMedications}
                          onToggle={(value) => setSelectedMedications((current) => toggleValue(current, value))}
                        />
                      </div>
                      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-950"><ShieldAlert className="h-4 w-4" /> Safety-netting and follow-up</div>
                        <p className="mt-1 text-xs leading-5 text-amber-900">Select only clinician-discussed follow-up or safety-netting. No escalation or treatment is inferred from an unanswered field.</p>
                        <div className="mt-4"><ChipSelector label="Follow-up / safety-net options" items={chipGroups.follow_up ?? []} selectedItems={selectedFollowUp} onToggle={(value) => setSelectedFollowUp((current) => toggleValue(current, value))} variant="plain" /></div>
                        {selectedRedFlags.length ? <label className="mt-5 block space-y-2 text-sm"><span className="field-label">Clinician-stated escalation detail</span><Textarea value={safetyNetting} onChange={(event) => setSafetyNetting(event.target.value)} rows={3} placeholder="Enter only the clinician-stated escalation or safety-netting detail." /></label> : null}
                      </div>
                    </DocumentationSection>
                    <DocumentationSection title="Optional outputs" description="Complete only when explicitly requested and stated by the clinician.">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm">
                          <span className="field-label">Referral reason</span>
                          <Textarea value={referralReason} onChange={(event) => setReferralReason(event.target.value)} rows={4} placeholder="Clinician-stated referral reason only." />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="field-label">Patient instructions</span>
                          <Textarea value={patientInstructions} onChange={(event) => setPatientInstructions(event.target.value)} rows={4} placeholder="Clinician-stated instructions only." />
                        </label>
                      </div>
                    </DocumentationSection>
                  </div>
                ) : null}

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  <Button variant="ghost" size="sm" disabled={!previousSection} onClick={() => previousSection && setActiveSection(previousSection.key)}>
                    <ArrowLeft className="h-4 w-4" /> Previous
                  </Button>
                  {nextSection ? (
                    <Button variant="primary" size="sm" onClick={() => setActiveSection(nextSection.key)}>
                      Next: {nextSection.shortLabel} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                      Review draft <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div ref={outputRef} className="min-w-0 xl:sticky xl:top-20 xl:self-start">
            <OutputPanel
              title="Detailed draft"
              description="Live review of the structured documentation entered across each step."
              tabs={[
                {
                  key: 'soap',
                  label: 'SOAP',
                  content: output.soap,
                  hasMeaningfulContent: output.hasMeaningfulContent,
                  emptyPrompt: 'Enter clinician-confirmed encounter details before copying or printing a SOAP draft.',
                },
                {
                  key: 'emr',
                  label: 'EMR',
                  content: output.emr,
                  hasMeaningfulContent: output.hasMeaningfulContent,
                  emptyPrompt: 'Enter clinician-confirmed encounter details before copying or printing an EMR draft.',
                },
                {
                  key: 'referral',
                  label: 'Referral',
                  content: output.referral,
                  hasMeaningfulContent: output.hasReferralContent,
                  emptyPrompt: 'Enter a clinician-stated referral reason before preparing a referral draft.',
                },
                {
                  key: 'instructions',
                  label: 'Instructions',
                  content: output.patientInstructions,
                  hasMeaningfulContent: output.hasPatientInstructionsContent,
                  emptyPrompt: 'Enter explicit clinician-stated patient instructions before preparing this draft.',
                },
              ]}
              activeKey={activeTab}
              onActiveKeyChange={(key) => setActiveTab(key as typeof activeTab)}
              onResetDraft={resetCurrentDraft}
              onClearContent={clearEnteredContent}
              clearContentLabel="Clear entered content"
            />
          </div>
        </div>
      ) : workflowId && loading ? (
        <div className="state-panel">Preparing the structured encounter workspace…</div>
      ) : null}
    </div>
  )
}

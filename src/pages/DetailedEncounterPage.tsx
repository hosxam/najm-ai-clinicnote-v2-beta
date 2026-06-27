import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChecklistGroups } from '../components/ChecklistGroups'
import { ChipSelector } from '../components/ChipSelector'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { buildDetailedOutputs } from '../lib/outputBuilders'
import { cleanPlaceholderLabel, displayGroupLabel } from '../lib/labelUtils'
import type { WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
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
    clinicnoteDataAdapter.loadCatalog().then(setCatalog)
    clinicnoteDataAdapter.loadSpecialties().then(setSpecialties)
  }, [])

  useEffect(() => {
    let active = true
    if (!workflowId) {
      setDetails(null)
      setBlockedMessage(null)
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
      setHistoryValues({})
      setSelectedSymptoms([])
      setSelectedNegatives([])
      setSelectedExamPrompts([])
      setSelectedInvestigations([])
      setAssessment('')
      setPlan('')
      setSelectedPlanItems([])
      setReferralReason('')
      setPatientInstructions('')
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [workflowId])

  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesQuery = !lowered || item.searchText.includes(lowered)
      const matchesSpecialty = specialty === 'all' || item.specialty === specialty
      return matchesQuery && matchesSpecialty
    })
  }, [catalog, search, specialty])

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
    <div className="space-y-6">
      <SectionCard
        title="Detailed Encounter"
        description="Structured encounter drafting with workflow-specific prompts for history, examination, investigations, assessment, and plan."
      >
        <WorkflowChooser
          search={search}
          specialty={specialty}
          specialties={specialties}
          workflows={filtered.slice(0, 12)}
          loading={loading && !workflowId}
          selectedWorkflowId={workflowId}
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(id) => navigate(`/encounter/${id}`)}
        />
      </SectionCard>

      {blockedMessage ? (
        <SectionCard title="Workflow blocked">
          <p className="text-sm text-amber-200">{blockedMessage}</p>
        </SectionCard>
      ) : null}

      {details ? (
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <SectionCard
              title={`${details.summary.title} encounter`}
              description={`${details.summary.specialty} · ${details.summary.diagnosis}`}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {historyFields.map((field) => (
                  <label key={field.id} className="space-y-2 text-sm">
                    <span className="text-slate-300">{field.label}</span>
                    <input
                      value={historyValues[field.id] ?? ''}
                      onChange={(event) =>
                        setHistoryValues((current) => ({ ...current, [field.id]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Symptoms / History prompts">
              <div className="space-y-6">
                <ChipSelector
                  label={displayGroupLabel('symptoms')}
                  items={chipGroups.symptoms ?? []}
                  selectedItems={selectedSymptoms}
                  onToggle={(value) => setSelectedSymptoms((current) => toggleValue(current, value))}
                />
                <ChipSelector
                  label={displayGroupLabel('relevant_negatives')}
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
                      label: prompt.prompt_text,
                      warning: prompt.warning,
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
                      label: option.option_text,
                      noteText: option.note_text || option.option_text,
                      warning: option.safety_note,
                    })),
                  })) ?? []
                }
                selectedValues={selectedInvestigations}
                onToggle={(value) => setSelectedInvestigations((current) => toggleValue(current, value))}
              />
            </SectionCard>

            <SectionCard title="Assessment and plan">
              <div className="space-y-4">
                <label className="block space-y-2 text-sm">
                  <span className="text-slate-300">Clinician impression</span>
                  <textarea
                    value={assessment}
                    onChange={(event) => setAssessment(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="Enter clinician-stated impression only."
                  />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-slate-300">Clinician plan</span>
                  <textarea
                    value={plan}
                    onChange={(event) => setPlan(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
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
                        label: option.option_text,
                        noteText: option.note_text || option.option_text,
                        warning: option.safety_note,
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
                <label className="block space-y-2 text-sm">
                  <span className="text-slate-300">Referral reason</span>
                  <textarea
                    value={referralReason}
                    onChange={(event) => setReferralReason(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="Enter only if the clinician requested a referral letter."
                  />
                </label>
                <label className="block space-y-2 text-sm">
                  <span className="text-slate-300">Patient instructions</span>
                  <textarea
                    value={patientInstructions}
                    onChange={(event) => setPatientInstructions(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="Only enter explicit clinician-stated patient instructions."
                  />
                </label>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Output">
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                ['soap', 'SOAP note'],
                ['emr', 'EMR note'],
                ['referral', 'Referral letter'],
                ['instructions', 'Patient instructions'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value as typeof activeTab)}
                  className={`rounded-full border px-3 py-2 text-sm ${
                    activeTab === value
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100'
                      : 'border-slate-700 bg-slate-950 text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <pre className="min-h-[32rem] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {activeTab === 'soap'
                ? output.soap
                : activeTab === 'emr'
                  ? output.emr
                  : activeTab === 'referral'
                    ? output.referral
                    : output.patientInstructions}
            </pre>
          </SectionCard>
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-400">Preparing the structured encounter editor…</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

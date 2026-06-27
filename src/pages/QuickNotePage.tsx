import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChipSelector } from '../components/ChipSelector'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { buildQuickSoapDraft } from '../lib/outputBuilders'
import { displayGroupLabel } from '../lib/labelUtils'
import type { WorkflowChipItem, WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
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
  const [duration, setDuration] = useState('')
  const [additionalHistory, setAdditionalHistory] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [selectedNegatives, setSelectedNegatives] = useState<string[]>([])
  const [selectedExam, setSelectedExam] = useState<string[]>([])
  const [selectedPlanItems, setSelectedPlanItems] = useState<string[]>([])

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
      setDuration(loadedDetails?.preset?.default_duration_options?.[0] ?? '')
      setSelectedSymptoms(loadedDetails?.preset?.prechecked_symptoms ?? [])
      setSelectedNegatives(loadedDetails?.preset?.prechecked_relevant_negatives ?? [])
      setSelectedExam(loadedDetails?.preset?.prechecked_exam_findings ?? [])
      setSelectedPlanItems(loadedDetails?.preset?.prechecked_plan_phrases ?? [])
      setAssessment('')
      setPlan('')
      setAdditionalHistory('')
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
    <div className="space-y-6">
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
          selectedWorkflowId={workflowId}
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(id) => navigate(`/quick-note/${id}`)}
        />
      </SectionCard>

      {blockedMessage ? (
        <SectionCard title="Workflow blocked">
          <p className="text-sm text-amber-200">{blockedMessage}</p>
        </SectionCard>
      ) : null}

      {details ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard
              title={details.summary.title}
              description={`${details.summary.specialty} · ${details.summary.diagnosis}`}
              actions={
                <Link to={`/encounter/${details.summary.workflowId}`} className="text-sm text-cyan-300">
                  Open detailed encounter
                </Link>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Duration</span>
                  <input
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="e.g. 3 days"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Clinician impression</span>
                  <input
                    value={assessment}
                    onChange={(event) => setAssessment(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    placeholder="Enter clinician-stated impression only"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2 text-sm">
                <span className="text-slate-300">Additional history</span>
                <textarea
                  value={additionalHistory}
                  onChange={(event) => setAdditionalHistory(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder="Add any clinician-confirmed history details."
                />
              </label>

              <label className="mt-4 block space-y-2 text-sm">
                <span className="text-slate-300">Clinician plan</span>
                <textarea
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
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

          <SectionCard title="Output" description="Quick Note generates a SOAP draft only.">
            <pre className="min-h-[28rem] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {output}
            </pre>
          </SectionCard>
        </div>
      ) : workflowId && loading ? (
        <SectionCard title="Loading workflow">
          <p className="text-sm text-slate-400">Preparing the workflow-specific quick note view…</p>
        </SectionCard>
      ) : null}
    </div>
  )
}

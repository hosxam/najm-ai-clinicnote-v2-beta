import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { OutputPanel } from '../components/OutputPanel'
import { SectionCard } from '../components/SectionCard'
import { StateNotice } from '../components/StateNotice'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { clearLocalDraft, loadLocalDraft, pushRecentWorkflow, saveLocalDraft } from '../lib/localDrafts'
import { buildMedicalReportDraft } from '../lib/outputBuilders'
import { Textarea } from '../components/ui/textarea'
import type { WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

type MedicalReportDraft = {
  workflowId: string
  values: Record<string, string>
}

const MEDICAL_REPORT_STORAGE_KEY = 'medical-report-draft'

export function MedicalReportPage() {
  const navigate = useNavigate()
  const { workflowId } = useParams()
  const [catalog, setCatalog] = useState<WorkflowSummary[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [details, setDetails] = useState<WorkflowDetails | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({
    reportPurpose: '',
    summary: '',
    findings: '',
    assessment: '',
    plan: '',
    requestedAction: '',
  })

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
      const savedDraft = loadLocalDraft<MedicalReportDraft>(MEDICAL_REPORT_STORAGE_KEY)
      if (savedDraft?.workflowId) {
        navigate(`/report/${savedDraft.workflowId}`, { replace: true })
        return
      }
      setDetails(null)
      setBlockedMessage(null)
      setError(null)
      return
    }
    Promise.all([
      clinicnoteDataAdapter.getWorkflowSummaryById(workflowId, true),
      clinicnoteDataAdapter.getWorkflowDetails(workflowId, true),
    ]).then(([summary, loadedDetails]) => {
      if (!active) return
      if (summary?.exclusion) {
        setBlockedMessage('This workflow is excluded from limited internal testing pending medical review.')
        setDetails(null)
        return
      }
      setBlockedMessage(null)
      setDetails(loadedDetails)
      const savedDraft = loadLocalDraft<MedicalReportDraft>(MEDICAL_REPORT_STORAGE_KEY)
      if (savedDraft?.workflowId === workflowId) {
        setValues(savedDraft.values)
      } else {
        setValues({
          reportPurpose: '',
          summary: '',
          findings: '',
          assessment: '',
          plan: '',
          requestedAction: '',
        })
      }
      setError(null)
      pushRecentWorkflow(workflowId)
    }).catch((caughtError: unknown) => {
      if (!active) return
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'This workflow could not be loaded. Please try another workflow.',
      )
    })
    return () => {
      active = false
    }
  }, [navigate, workflowId])

  useEffect(() => {
    if (!workflowId || blockedMessage || !details) return

    saveLocalDraft<MedicalReportDraft>(MEDICAL_REPORT_STORAGE_KEY, {
      workflowId,
      values,
    })
  }, [workflowId, blockedMessage, details, values])

  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesQuery = !lowered || item.searchText.includes(lowered)
      const matchesSpecialty = specialty === 'all' || item.specialty === specialty
      return matchesQuery && matchesSpecialty
    })
  }, [catalog, search, specialty])

  const output = useMemo(() => buildMedicalReportDraft(details, values), [details, values])

  function resetCurrentDraft() {
    if (!window.confirm('Reset the current medical report draft for this workflow?')) return
    setValues({
      reportPurpose: '',
      summary: '',
      findings: '',
      assessment: '',
      plan: '',
      requestedAction: '',
    })
  }

  function clearSavedDraft() {
    if (!window.confirm('Clear the saved medical report draft from this browser?')) return
    clearLocalDraft(MEDICAL_REPORT_STORAGE_KEY)
    setValues({
      reportPurpose: '',
      summary: '',
      findings: '',
      assessment: '',
      plan: '',
      requestedAction: '',
    })
  }

  return (
    <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <SectionCard
          title="Medical Report / Letter"
          description="Simple structured medical report drafting. No autonomous recommendations are added."
        >
          <WorkflowChooser
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered.slice(0, 12)}
            error={!workflowId ? error : null}
            selectedWorkflowId={workflowId}
            emptyTitle="No report workflows match that search"
            emptyDescription="Try a broader term or switch to all specialties."
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(id) => navigate(`/report/${id}`)}
          />
        </SectionCard>

        <StateNotice
          title="Local draft only"
          description="Medical report entries are saved only in this browser. Do not enter patient identifiers."
          tone="warning"
        />

        {blockedMessage ? (
          <SectionCard title="Workflow blocked">
            <p className="text-sm text-amber-200">{blockedMessage}</p>
          </SectionCard>
        ) : null}

        {!workflowId ? (
          <SectionCard title="Choose a workflow first">
            <p className="text-sm text-slate-300">
              Select a workflow to draft a simple clinician-review report or letter.
            </p>
          </SectionCard>
        ) : null}

        {error && workflowId ? (
          <SectionCard title="Workflow load problem">
            <p className="text-sm text-rose-200">{error}</p>
          </SectionCard>
        ) : null}

        <SectionCard
          title={details ? `Draft a report for ${details.summary.title}` : 'Draft a medical report'}
          description="Use clinician-stated information only."
        >
          {details ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="workflow-meta">{details.summary.workflowId}</div>
              <div className="workflow-meta">Documentation-only report drafting</div>
            </div>
          ) : null}
          <div className="space-y-4.5">
            {[
              ['reportPurpose', 'Purpose of report'],
              ['summary', 'Clinical summary'],
              ['findings', 'Findings / results reviewed'],
              ['assessment', 'Clinician impression'],
              ['plan', 'Clinician plan'],
              ['requestedAction', 'Requested action'],
            ].map(([key, label]) => (
              <label key={key} className="block space-y-2.5 text-sm">
                <span className="field-label">{label}</span>
                <Textarea
                  value={values[key] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                  rows={key === 'reportPurpose' ? 2 : 4}
                  placeholder={`Enter ${label.toLowerCase()}.`}
                />
              </label>
            ))}
          </div>
        </SectionCard>
      </div>

      <OutputPanel
        title="Output"
        tabs={[{ key: 'report', label: 'Medical report', content: output }]}
        onResetDraft={resetCurrentDraft}
        onClearSavedDraft={clearSavedDraft}
      />
    </div>
  )
}

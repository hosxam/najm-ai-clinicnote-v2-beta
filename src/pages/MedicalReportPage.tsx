import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { buildMedicalReportDraft } from '../lib/outputBuilders'
import type { WorkflowDetails, WorkflowSummary } from '../types/clinicnote'

export function MedicalReportPage() {
  const navigate = useNavigate()
  const { workflowId } = useParams()
  const [catalog, setCatalog] = useState<WorkflowSummary[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [details, setDetails] = useState<WorkflowDetails | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({
    reportPurpose: '',
    summary: '',
    findings: '',
    assessment: '',
    plan: '',
    requestedAction: '',
  })

  useEffect(() => {
    clinicnoteDataAdapter.loadCatalog().then(setCatalog)
    clinicnoteDataAdapter.loadSpecialties().then(setSpecialties)
  }, [])

  useEffect(() => {
    let active = true
    if (!workflowId) {
      setDetails(null)
      setBlockedMessage(null)
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

  const output = useMemo(() => buildMedicalReportDraft(details, values), [details, values])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
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
            selectedWorkflowId={workflowId}
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(id) => navigate(`/report/${id}`)}
          />
        </SectionCard>

        {blockedMessage ? (
          <SectionCard title="Workflow blocked">
            <p className="text-sm text-amber-200">{blockedMessage}</p>
          </SectionCard>
        ) : null}

        <SectionCard
          title={details ? `Draft a report for ${details.summary.title}` : 'Draft a medical report'}
          description="Use clinician-stated information only."
        >
          <div className="space-y-4">
            {[
              ['reportPurpose', 'Purpose of report'],
              ['summary', 'Clinical summary'],
              ['findings', 'Findings / results reviewed'],
              ['assessment', 'Clinician impression'],
              ['plan', 'Clinician plan'],
              ['requestedAction', 'Requested action'],
            ].map(([key, label]) => (
              <label key={key} className="block space-y-2 text-sm">
                <span className="text-slate-300">{label}</span>
                <textarea
                  value={values[key] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                  rows={key === 'reportPurpose' ? 2 : 4}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                  placeholder={`Enter ${label.toLowerCase()}.`}
                />
              </label>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Output">
        <pre className="min-h-[36rem] whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
          {output}
        </pre>
      </SectionCard>
    </div>
  )
}

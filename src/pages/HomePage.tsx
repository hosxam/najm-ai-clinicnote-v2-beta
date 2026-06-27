import { ArrowRight, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { normalizeDisplayText } from '../lib/labelUtils'
import { getRecentWorkflowIds } from '../lib/localDrafts'
import type { WorkflowSummary } from '../types/clinicnote'

export function HomePage() {
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState<WorkflowSummary[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [commonWorkflows, setCommonWorkflows] = useState<WorkflowSummary[]>([])
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowSummary[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      clinicnoteDataAdapter.loadCatalog(),
      clinicnoteDataAdapter.loadSpecialties(),
      clinicnoteDataAdapter.getCommonWorkflows(),
    ])
      .then(([loadedCatalog, loadedSpecialties, loadedCommon]) => {
        if (!active) return
        setCatalog(loadedCatalog)
        setSpecialties(loadedSpecialties)
        setCommonWorkflows(loadedCommon)
        const recentIds = getRecentWorkflowIds()
        const byId = new Map(loadedCatalog.map((workflow) => [workflow.workflowId, workflow]))
        setRecentWorkflows(recentIds.map((id) => byId.get(id)).filter(Boolean) as WorkflowSummary[])
        setError(null)
        setLoading(false)
      })
      .catch((caughtError: unknown) => {
        if (!active) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Workflow data could not be loaded. Please refresh the page or confirm the data files are present.',
        )
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return catalog.filter((item) => {
      const matchesQuery = !lowered || item.searchText.includes(lowered)
      const matchesSpecialty = specialty === 'all' || item.specialty === specialty
      return matchesQuery && matchesSpecialty
    })
  }, [catalog, search, specialty])

  return (
    <div className="grid gap-6 lg:gap-7 xl:grid-cols-[1.38fr_0.92fr]">
      <SectionCard
        title="Find a workflow"
        description="Search by symptom, diagnosis, or workflow title. Excluded workflows are hidden during limited testing."
      >
        <WorkflowChooser
          search={search}
          specialty={specialty}
          specialties={specialties}
          workflows={filtered.slice(0, 18)}
          loading={loading}
          error={error}
          emptyTitle="No workflows match that search yet"
          emptyDescription="Try a broader symptom, diagnosis, or workflow term. You can also switch back to all specialties."
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(workflowId) => navigate(`/quick-note/${workflowId}`)}
        />
      </SectionCard>

      <div className="space-y-6">
        <SectionCard
          title="Suggested common workflows"
          description="Start with common outpatient workflows to keep limited testing focused and practical."
        >
          <div className="space-y-4">
            {commonWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="rounded-[1.5rem] border border-slate-800/90 bg-slate-900/72 p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.9)]">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  {normalizeDisplayText(workflow.specialty)}
                </div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-white">{workflow.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    to={`/quick-note/${workflow.workflowId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-sm font-medium text-cyan-100"
                  >
                    Quick Note <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/encounter/${workflow.workflowId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-200"
                  >
                    Detailed Encounter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recently used on this device"
          description="Helpful for repeat testing. Saved locally in your browser only."
        >
          {recentWorkflows.length ? (
            <div className="space-y-4">
              {recentWorkflows.map((workflow) => (
                <div key={workflow.workflowId} className="rounded-[1.5rem] border border-slate-800/90 bg-slate-900/72 p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.9)]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      {normalizeDisplayText(workflow.specialty)}
                    </div>
                    <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400">
                      {workflow.workflowId}
                    </div>
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-tight text-white">{workflow.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      to={`/quick-note/${workflow.workflowId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-sm font-medium text-cyan-100"
                    >
                      Quick Note <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/encounter/${workflow.workflowId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-200"
                    >
                      Detailed Encounter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              No recent workflows yet. Open a workflow once and it will appear here on this device.
            </p>
          )}
        </SectionCard>

        <SectionCard
          title="Testing guardrails"
          description="Keep limited internal testing aligned with safety expectations."
        >
          <ul className="space-y-3.5 text-sm leading-6 text-slate-300">
            <li className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/55 px-3.5 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              Use mock or anonymized cases only. Do not enter patient identifiers.
            </li>
            <li className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/55 px-3.5 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              Generated text is a clinician-review draft only. No diagnosis or treatment should be invented.
            </li>
            <li className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/55 px-3.5 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              The 12 limited-testing exclusions remain hidden or blocked pending medical review.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}

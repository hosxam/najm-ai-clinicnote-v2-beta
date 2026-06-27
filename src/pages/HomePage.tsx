import { ArrowRight, Clock3, Search, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { normalizeDisplayText } from '../lib/labelUtils'
import { getRecentWorkflowIds } from '../lib/localDrafts'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
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
        description="Search by symptom, diagnosis, or workflow title. Excluded workflows stay hidden during limited testing."
      >
        <div className="mb-5 grid gap-3 rounded-[1.5rem] border border-slate-800/90 bg-slate-900/50 p-4 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-slate-800/80 bg-slate-950/78 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Search className="h-4 w-4 text-cyan-300" />
              Start with workflow search
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use common symptoms, diagnoses, or workflow IDs to jump in quickly.</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-800/80 bg-slate-950/78 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Keep testing practical
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use low-risk mock cases first and focus on readability, safety, and workflow fit.</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-800/80 bg-slate-950/78 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldAlert className="h-4 w-4 text-amber-300" />
              Review-first output
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Generated text stays a clinician-review draft and should never be used unreviewed.</p>
          </div>
        </div>
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
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="accent" className="uppercase tracking-[0.16em]">
                    {normalizeDisplayText(workflow.specialty)}
                  </Badge>
                  <Badge variant="muted">{workflow.workflowId}</Badge>
                </div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-white">{workflow.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button asChild variant="primary" size="sm">
                    <Link to={`/quick-note/${workflow.workflowId}`}>
                    Quick Note <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/encounter/${workflow.workflowId}`}>
                    Detailed Encounter
                    </Link>
                  </Button>
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
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      <Clock3 className="h-3.5 w-3.5" />
                      {normalizeDisplayText(workflow.specialty)}
                    </div>
                    <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400">
                      {workflow.workflowId}
                    </div>
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-tight text-white">{workflow.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button asChild variant="primary" size="sm">
                      <Link to={`/quick-note/${workflow.workflowId}`}>
                        Quick Note <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/encounter/${workflow.workflowId}`}>Detailed Encounter</Link>
                    </Button>
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

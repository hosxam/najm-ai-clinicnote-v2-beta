import { ArrowRight, Clock3, FilePlus2, FileText, Layers3, ShieldAlert } from 'lucide-react'
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
  const [totalWorkflowCount, setTotalWorkflowCount] = useState(1500)

  useEffect(() => {
    let active = true
    Promise.all([
      clinicnoteDataAdapter.loadCatalog(),
      clinicnoteDataAdapter.loadCatalog(true),
      clinicnoteDataAdapter.loadSpecialties(),
      clinicnoteDataAdapter.getCommonWorkflows(),
    ])
      .then(([loadedCatalog, allCatalog, loadedSpecialties, loadedCommon]) => {
        if (!active) return
        setCatalog(loadedCatalog)
        setTotalWorkflowCount(allCatalog.length)
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

  const visibleWorkflowCount = catalog.length
  const excludedWorkflowCount = Math.max(totalWorkflowCount - visibleWorkflowCount, 0)
  const firstSuggestedWorkflow = filtered[0] ?? recentWorkflows[0] ?? commonWorkflows[0]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_26px_70px_-44px_rgba(15,23,42,0.35)]">
        <div className="grid gap-6 border-b border-slate-200 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-8">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">Clinical documentation workspace</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              What are you documenting?
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Find the right workflow, review its suggested defaults, and create a clinician-review note.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="font-semibold text-slate-950">{totalWorkflowCount.toLocaleString()}</div>
              <div className="mt-0.5 text-slate-500">workflows</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="font-semibold text-slate-950">{visibleWorkflowCount.toLocaleString()}</div>
              <div className="mt-0.5 text-slate-500">available</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <div className="font-semibold text-amber-900">{excludedWorkflowCount.toLocaleString()}</div>
              <div className="mt-0.5 text-amber-700">excluded</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-7 lg:px-8">
          <WorkflowChooser
            search={search}
            specialty={specialty}
            specialties={specialties}
            workflows={filtered.slice(0, 9)}
            loading={loading}
            error={error}
            title="Search symptom, diagnosis, or workflow"
            emptyTitle="No workflows match that search"
            emptyDescription="Try a broader symptom, diagnosis, or workflow term."
            onSearchChange={setSearch}
            onSpecialtyChange={setSpecialty}
            onSelect={(workflowId) => navigate(`/quick-note/${workflowId}`)}
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Link
              to={firstSuggestedWorkflow ? `/quick-note/${firstSuggestedWorkflow.workflowId}` : '/quick-note'}
              className="group flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100/70"
            >
              <FilePlus2 className="h-5 w-5 text-cyan-800" />
              <div className="min-w-0 flex-1"><div className="font-semibold">Quick Note</div><div className="text-xs text-cyan-800/75">Fastest path</div></div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={firstSuggestedWorkflow ? `/encounter/${firstSuggestedWorkflow.workflowId}` : '/encounter'}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Layers3 className="h-5 w-5 text-slate-600" />
              <div className="min-w-0 flex-1"><div className="font-semibold">Detailed note</div><div className="text-xs text-slate-500">More structure</div></div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/report"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <FileText className="h-5 w-5 text-slate-600" />
              <div className="min-w-0 flex-1"><div className="font-semibold">Reports</div><div className="text-xs text-slate-500">Letters and reports</div></div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            Use mock or anonymized cases only. Every generated note remains a clinician-review draft.
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title="Common workflows"
          description="Start from a common low-risk documentation flow."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {commonWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" className="uppercase tracking-[0.14em]">
                    {normalizeDisplayText(workflow.specialty)}
                  </Badge>
                  <Badge variant="muted">{workflow.workflowId}</Badge>
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight text-slate-950 text-wrap-pretty">{workflow.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{workflow.diagnosis}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild variant="primary" size="sm">
                    <Link to={`/quick-note/${workflow.workflowId}`}>
                      Start Quick Note <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/encounter/${workflow.workflowId}`}>
                      Detailed note
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Recent on this device"
            description="Saved locally in this browser only."
          >
            {recentWorkflows.length ? (
              <div className="space-y-3">
                {recentWorkflows.map((workflow) => (
                  <div key={workflow.workflowId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">
                        <Clock3 className="h-3.5 w-3.5" />
                        {normalizeDisplayText(workflow.specialty)}
                      </div>
                      <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                        {workflow.workflowId}
                      </div>
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950 text-wrap-pretty">{workflow.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{workflow.diagnosis}</div>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Button asChild variant="primary" size="sm">
                        <Link to={`/quick-note/${workflow.workflowId}`}>
                          Start Quick Note <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                No recent workflows yet. Open a workflow once and it will appear here on this device.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Need more structure later?" description="Quick Note is the default. Detailed note is there when the case needs more structure.">
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <p>Start with Quick Note for most testing. Use Detailed note only when you need fuller structure.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link to="/encounter">Open Detailed note</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/report">Open Reports</Link>
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

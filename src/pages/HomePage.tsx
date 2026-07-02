import { ArrowRight, Clock3, ShieldAlert } from 'lucide-react'
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
      <SectionCard
        title="What are you documenting today?"
        description="Search for a workflow, then start a quick clinician-review draft."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="primary" size="sm">
              <Link to={firstSuggestedWorkflow ? `/quick-note/${firstSuggestedWorkflow.workflowId}` : '/quick-note'}>
                Start Quick Note
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to={firstSuggestedWorkflow ? `/encounter/${firstSuggestedWorkflow.workflowId}` : '/encounter'}>
                Detailed note
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/report">Reports</Link>
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <span className="workflow-meta">{totalWorkflowCount.toLocaleString()} workflows</span>
          <span className="workflow-meta">{visibleWorkflowCount.toLocaleString()} available for testing</span>
          <span className="workflow-meta">{excludedWorkflowCount.toLocaleString()} excluded pending review</span>
        </div>

        <WorkflowChooser
          search={search}
          specialty={specialty}
          specialties={specialties}
          workflows={filtered.slice(0, 9)}
          loading={loading}
          error={error}
          title="What are you documenting today?"
          emptyTitle="No workflows match that search"
          emptyDescription="Try a broader symptom, diagnosis, or workflow term."
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(workflowId) => navigate(`/quick-note/${workflowId}`)}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[1.2rem] border border-amber-400/16 bg-amber-300/8 px-4 py-3 text-sm leading-6 text-amber-50/90">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          Use mock or anonymized cases only. Generated text remains a clinician-review draft.
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <SectionCard
          title="Common workflows"
          description="Start from a common low-risk documentation flow."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {commonWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="rounded-[1.25rem] border border-slate-800/90 bg-slate-950/66 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent" className="uppercase tracking-[0.14em]">
                    {normalizeDisplayText(workflow.specialty)}
                  </Badge>
                  <Badge variant="muted">{workflow.workflowId}</Badge>
                </div>
                <div className="mt-3 text-lg font-semibold tracking-tight text-white text-wrap-pretty">{workflow.title}</div>
                <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
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
                  <div key={workflow.workflowId} className="rounded-[1.2rem] border border-slate-800/90 bg-slate-950/68 p-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                        <Clock3 className="h-3.5 w-3.5" />
                        {normalizeDisplayText(workflow.specialty)}
                      </div>
                      <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400">
                        {workflow.workflowId}
                      </div>
                    </div>
                    <div className="mt-2 text-lg font-semibold tracking-tight text-white text-wrap-pretty">{workflow.title}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
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
              <p className="text-sm text-slate-400">
                No recent workflows yet. Open a workflow once and it will appear here on this device.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Need more structure later?" description="Quick Note is the default. Detailed note is there when the case needs more structure.">
            <div className="space-y-3 text-sm leading-6 text-slate-300">
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

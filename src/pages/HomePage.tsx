import { ArrowRight, FilePlus2, FileText, Layers3, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DocumentationModeCard } from '../components/DocumentationModeCard'
import { RecentWorkflowItem } from '../components/RecentWorkflowItem'
import { SafetyBanner } from '../components/SafetyBanner'
import { TestingStatusStrip } from '../components/TestingStatusStrip'
import { WorkflowCommand } from '../components/WorkflowCommand'
import { Button } from '../components/ui/button'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { getRecentWorkflowIds } from '../lib/localDrafts'
import { selectHomeModeWorkflow } from '../lib/workflowSelection'
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

  const commandWorkflows = search.trim() || specialty !== 'all' ? filtered : commonWorkflows
  const visibleWorkflowCount = catalog.length
  const excludedWorkflowCount = Math.max(totalWorkflowCount - visibleWorkflowCount, 0)
  const hasActiveFilter = Boolean(search.trim()) || specialty !== 'all'
  const selectedModeWorkflow = selectHomeModeWorkflow({
    hasActiveFilter,
    matchingWorkflows: filtered,
    commonWorkflows,
    recentWorkflows,
  })
  const modeSelectionBlocked = hasActiveFilter && !selectedModeWorkflow
  const quickNoteTarget = selectedModeWorkflow ? `/quick-note/${selectedModeWorkflow.workflowId}` : '/quick-note'
  const detailedTarget = selectedModeWorkflow ? `/encounter/${selectedModeWorkflow.workflowId}` : '/encounter'
  const compactWorkflows = commonWorkflows.slice(0, 5)

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="grid gap-6 border-b border-slate-200 pb-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-800">
            <Search className="h-3.5 w-3.5" />
            Document start
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
            Start with the clinical workflow, not a blank page.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Search a presentation, choose the right documentation mode, and review a structured clinician draft.
          </p>
        </div>
        <SafetyBanner />
      </section>

      <section aria-labelledby="workflow-search-heading">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="workflow-search-heading" className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
              Find a workflow
            </h2>
            <p className="mt-1 text-sm text-slate-500">Search symptoms, diagnoses, or workflow names.</p>
          </div>
          <span className="text-xs font-medium text-slate-400">{visibleWorkflowCount.toLocaleString()} available for limited testing</span>
        </div>
        <WorkflowCommand
          search={search}
          specialty={specialty}
          specialties={specialties}
          workflows={commandWorkflows}
          loading={loading}
          error={error}
          resultLimit={search.trim() || specialty !== 'all' ? 5 : 1}
          onSearchChange={setSearch}
          onSpecialtyChange={setSpecialty}
          onSelect={(workflowId) => navigate(`/quick-note/${workflowId}`)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-900">BETA — FULL-SOURCE GUIDELINE WORKFLOWS</div>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Use the reconstructed source-grounded workflow set</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-cyan-950">Open the reconstructed workflow workspace for all 1,500 workflows. Each workflow shows its practical sections, exact authoritative sources, additions, rewrites, removals, and documented limitations.</p>
        </div>
        <Button asChild variant="primary" className="shrink-0"><Link to="/beta">Open reconstructed workflows <ArrowRight className="h-4 w-4" /></Link></Button>
      </section>

      <section aria-labelledby="mode-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="mode-heading" className="text-lg font-semibold tracking-[-0.02em] text-slate-950">Choose documentation depth</h2>
            <p className="mt-1 text-sm text-slate-500">Quick Note is the recommended starting point for beta testing.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/report"><FileText className="h-4 w-4" /> Open reports</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <DocumentationModeCard
            title="Quick Note"
            description="Review suggested workflow defaults, add clinician-confirmed details, and review a focused live SOAP draft."
            to={quickNoteTarget}
            icon={FilePlus2}
            primary
            label="Recommended"
            disabled={modeSelectionBlocked}
          />
          <DocumentationModeCard
            title="Detailed Note"
            description="Use a guided section-by-section editor when the encounter needs more structure."
            to={detailedTarget}
            icon={Layers3}
            label="Manual"
            disabled={modeSelectionBlocked}
          />
        </div>
        {modeSelectionBlocked ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            Choose a matching workflow first.
          </p>
        ) : null}
        <Link to="/report" className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-950 sm:hidden">
          <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-800" /> Medical reports and letters</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section aria-labelledby="common-workflows-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="common-workflows-heading" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
              <ShieldCheck className="h-4 w-4 text-cyan-800" />
              Common documentation workflows
            </h2>
            <p className="mt-1 text-xs text-slate-500">Curated documentation shortcuts; drafts remain local to this browser.</p>
          </div>
        </div>
        <div className="workflow-chip-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {compactWorkflows.map((workflow) => <RecentWorkflowItem key={workflow.workflowId} workflow={workflow} />)}
        </div>
      </section>

      <TestingStatusStrip totalWorkflowCount={totalWorkflowCount} excludedWorkflowCount={excludedWorkflowCount} />
    </div>
  )
}

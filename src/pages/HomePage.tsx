import { ArrowRight, Clock3, FileText, HeartPulse, Search, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react'
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

  const modes = [
    {
      title: 'Quick Note',
      description: 'Fast workflow-guided SOAP drafting for common clinic documentation.',
      icon: Stethoscope,
      href: '/quick-note',
      accent: 'sky',
    },
    {
      title: 'Detailed Encounter',
      description: 'Structured encounter drafting with history, exam, investigations, and plan sections.',
      icon: HeartPulse,
      href: '/encounter',
      accent: 'slate',
    },
    {
      title: 'Medical Report',
      description: 'Simple clinician-review report and letter drafting without autonomous recommendations.',
      icon: FileText,
      href: '/report',
      accent: 'slate',
    },
  ] as const

  return (
    <div className="space-y-7">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/82 p-6 shadow-[0_30px_90px_-44px_rgba(2,6,23,0.95)] sm:p-8">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Limited internal testing build
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white text-wrap-pretty sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
            Workflow-guided clinical drafting that feels like a serious productivity tool.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Start from a workflow, document only clinician-confirmed findings, and generate a review-first draft for Quick Note, Detailed Encounter, or Medical Report use. Excluded workflows remain hidden or blocked during testing.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-slate-800/90 bg-slate-900/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workflow library</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{totalWorkflowCount.toLocaleString()}</div>
              <div className="mt-1 text-sm text-slate-400">Total imported workflows</div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-800/90 bg-slate-900/72 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Available now</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{visibleWorkflowCount.toLocaleString()}</div>
              <div className="mt-1 text-sm text-slate-400">Visible for limited testing</div>
            </div>
            <div className="rounded-[1.4rem] border border-amber-400/18 bg-amber-300/8 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">Pending review</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{excludedWorkflowCount.toLocaleString()}</div>
              <div className="mt-1 text-sm text-amber-100/80">Excluded from testing</div>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-[1.45rem] border border-amber-400/18 bg-amber-300/8 px-4 py-4 text-sm leading-6 text-amber-50/92">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            Use mock or anonymized cases only. Najm ClinicNote remains a documentation drafting tool, not clinical decision support, and all generated text requires clinician review.
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800/90 bg-slate-950/88 p-5 shadow-[0_30px_90px_-44px_rgba(2,6,23,0.95)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-sky-400/20 bg-sky-300/10 text-sky-100">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">Start with a workflow</div>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Search by symptom, diagnosis, or workflow ID and jump straight into drafting.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-slate-800/85 bg-slate-900/46 p-4">
            <WorkflowChooser
              search={search}
              specialty={specialty}
              specialties={specialties}
              workflows={filtered.slice(0, 9)}
              loading={loading}
              error={error}
              emptyTitle="No workflows match that search yet"
              emptyDescription="Try a broader symptom, diagnosis, or workflow term. You can also switch back to all specialties."
              onSearchChange={setSearch}
              onSpecialtyChange={setSpecialty}
              onSelect={(workflowId) => navigate(`/quick-note/${workflowId}`)}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <Link
              key={mode.title}
              to={mode.href}
              className="group rounded-[1.7rem] border border-slate-800/90 bg-slate-950/80 p-5 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.92)] transition hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-900/95"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] border ${mode.accent === 'sky' ? 'border-sky-400/20 bg-sky-300/10 text-sky-100' : 'border-slate-700/90 bg-slate-900/90 text-slate-100'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="rounded-full border border-slate-700/90 bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Mode
                </div>
              </div>
              <div className="mt-5 text-xl font-semibold tracking-tight text-white">{mode.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{mode.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition group-hover:text-sky-100">
                Open mode <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          )
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <SectionCard
          title="Common workflows for limited testing"
          description="Polished action cards for common outpatient documentation flows."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {commonWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="group rounded-[1.7rem] border border-slate-800/90 bg-slate-950/72 p-5 shadow-[0_20px_48px_-34px_rgba(2,6,23,0.95)] transition hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-900/92">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant="accent" className="uppercase tracking-[0.16em]">
                        {normalizeDisplayText(workflow.specialty)}
                      </Badge>
                      <Badge variant="muted">{workflow.workflowId}</Badge>
                    </div>
                    <div className="text-xl font-semibold tracking-tight text-white text-wrap-pretty">{workflow.title}</div>
                    <div className="text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-2 text-slate-400 transition group-hover:text-slate-100">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
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

        <div className="space-y-6">
          <SectionCard
            title="Recently used on this device"
            description="Helpful for repeat testing. Saved locally in your browser only."
          >
            {recentWorkflows.length ? (
              <div className="space-y-4">
                {recentWorkflows.map((workflow) => (
                  <div key={workflow.workflowId} className="rounded-[1.45rem] border border-slate-800/90 bg-slate-950/68 p-4">
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
                          Quick Note <ArrowRight className="h-4 w-4" />
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
                Generated text remains a clinician-review draft only.
              </li>
              <li className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/55 px-3.5 py-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                The 12 excluded workflows remain hidden or blocked pending medical review.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

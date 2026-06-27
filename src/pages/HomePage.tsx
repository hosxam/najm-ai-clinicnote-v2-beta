import { ArrowRight, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SectionCard } from '../components/SectionCard'
import { WorkflowChooser } from '../components/WorkflowChooser'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import type { WorkflowSummary } from '../types/clinicnote'

export function HomePage() {
  const navigate = useNavigate()
  const [catalog, setCatalog] = useState<WorkflowSummary[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [commonWorkflows, setCommonWorkflows] = useState<WorkflowSummary[]>([])
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      clinicnoteDataAdapter.loadCatalog(),
      clinicnoteDataAdapter.loadSpecialties(),
      clinicnoteDataAdapter.getCommonWorkflows(),
    ]).then(([loadedCatalog, loadedSpecialties, loadedCommon]) => {
      if (!active) return
      setCatalog(loadedCatalog)
      setSpecialties(loadedSpecialties)
      setCommonWorkflows(loadedCommon)
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
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
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
          <div className="space-y-3">
            {commonWorkflows.map((workflow) => (
              <div key={workflow.workflowId} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  {workflow.specialty}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{workflow.title}</div>
                <div className="mt-1 text-sm text-slate-400">{workflow.diagnosis}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/quick-note/${workflow.workflowId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
                  >
                    Quick Note <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/encounter/${workflow.workflowId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                  >
                    Detailed Encounter
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Testing guardrails"
          description="Keep limited internal testing aligned with safety expectations."
        >
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              Use mock or anonymized cases only. Do not enter patient identifiers.
            </li>
            <li className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              Generated text is a clinician-review draft only. No diagnosis or treatment should be invented.
            </li>
            <li className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-300" />
              The 12 limited-testing exclusions remain hidden or blocked pending medical review.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  )
}

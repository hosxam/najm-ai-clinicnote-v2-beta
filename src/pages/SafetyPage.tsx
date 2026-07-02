import { AlertTriangle, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SectionCard } from '../components/SectionCard'
import { StateNotice } from '../components/StateNotice'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import { Badge } from '../components/ui/badge'
import type { WorkflowSummary } from '../types/clinicnote'

export function SafetyPage() {
  const [excluded, setExcluded] = useState<WorkflowSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clinicnoteDataAdapter
      .loadCatalog(true)
      .then((catalog) => {
        setExcluded(catalog.filter((workflow) => workflow.exclusion))
        setError(null)
        setLoading(false)
      })
      .catch((caughtError: unknown) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'The exclusion list could not be loaded.',
        )
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 lg:space-y-7">
      <SectionCard
        title="Safety"
        description="This V2 MVP keeps the doctor-facing language simple while preserving the source safety rules."
      >
        <ul className="list-disc space-y-2.5 pl-5 text-sm leading-6 text-slate-300">
          <li>Najm ClinicNote is a documentation drafting tool, not clinical decision support.</li>
          <li>Do not add diagnosis suggestions, treatment suggestions, or medication doses automatically.</li>
          <li>Do not infer missing findings.</li>
          <li>Patient instructions should only be generated if explicitly entered by the clinician.</li>
          <li>Red flags should remain prompts or checklist items, never conclusions.</li>
        </ul>
      </SectionCard>

      <SectionCard
        title="Excluded workflows"
        description="The existing limited-testing exclusions remain hidden from search and blocked by direct access."
      >
        {loading ? <p className="text-sm text-slate-400">Loading exclusion list...</p> : null}
        {error ? (
          <StateNotice title="Exclusion list unavailable" description={error} tone="error" />
        ) : null}
        {!loading && !error ? (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {excluded.map((workflow) => (
              <div key={workflow.workflowId} className="rounded-[1.45rem] border border-slate-800/90 bg-slate-900/72 p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.9)]">
                <div className="flex items-center gap-2.5">
                  <Badge variant="warning">
                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                    Excluded
                  </Badge>
                  <div className="text-sm font-semibold tracking-tight text-white">{workflow.workflowId}</div>
                </div>
                <div className="mt-1.5 text-sm leading-6 text-slate-400 text-wrap-pretty">{workflow.title}</div>
                <div className="mt-3 text-xs leading-5 text-amber-200">{workflow.exclusion?.exclusion_reason}</div>
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="About this V2 MVP"
        description="This repo is a clean redesign using the existing 1,500-workflow dataset from the staged legacy import branch."
      >
        <div className="flex items-start gap-3 rounded-[1.3rem] border border-slate-800/90 bg-slate-900/55 px-4 py-4 text-sm leading-6 text-slate-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
          <p>
            V2 focuses on a simple doctor-first flow: choose a workflow, enter clinician-confirmed findings, and generate a clinician-review draft. It intentionally avoids exposing older technical modes or schema terms to normal users.
          </p>
        </div>
      </SectionCard>
    </div>
  )
}

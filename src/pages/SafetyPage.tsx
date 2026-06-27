import { useEffect, useState } from 'react'
import { SectionCard } from '../components/SectionCard'
import { clinicnoteDataAdapter } from '../lib/dataAdapter'
import type { WorkflowSummary } from '../types/clinicnote'

export function SafetyPage() {
  const [excluded, setExcluded] = useState<WorkflowSummary[]>([])

  useEffect(() => {
    clinicnoteDataAdapter.loadCatalog(true).then((catalog) => {
      setExcluded(catalog.filter((workflow) => workflow.exclusion))
    })
  }, [])

  return (
    <div className="space-y-6">
      <SectionCard
        title="Safety"
        description="This V2 MVP keeps the doctor-facing language simple while preserving the source safety rules."
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {excluded.map((workflow) => (
            <div key={workflow.workflowId} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-sm font-semibold text-white">{workflow.workflowId}</div>
              <div className="mt-1 text-sm text-slate-400">{workflow.title}</div>
              <div className="mt-2 text-xs text-amber-200">{workflow.exclusion?.exclusion_reason}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="About this V2 MVP"
        description="This repo is a clean redesign using the existing 1,500-workflow dataset from the staged legacy import branch."
      >
        <p className="text-sm text-slate-300">
          V2 focuses on a simple doctor-first flow: choose a workflow, enter clinician-confirmed findings, and generate a clinician-review draft. It intentionally avoids exposing older technical modes or schema terms to normal users.
        </p>
      </SectionCard>
    </div>
  )
}

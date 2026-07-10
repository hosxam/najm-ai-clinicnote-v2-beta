import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { normalizeDisplayText } from '../lib/labelUtils'
import type { WorkflowSummary } from '../types/clinicnote'

export function RecentWorkflowItem({ workflow }: { workflow: WorkflowSummary }) {
  return (
    <Link
      to={`/quick-note/${workflow.workflowId}`}
      className="group flex min-w-[15rem] max-w-[18rem] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-[0_14px_32px_-26px_rgba(15,23,42,0.45)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-cyan-800">
        {workflow.title.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-950">{workflow.title}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{normalizeDisplayText(workflow.specialty)}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-800" />
    </Link>
  )
}

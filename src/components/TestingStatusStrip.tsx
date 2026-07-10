import { CheckCircle2, ShieldCheck, Workflow } from 'lucide-react'

type TestingStatusStripProps = {
  totalWorkflowCount: number
  excludedWorkflowCount: number
}

export function TestingStatusStrip({ totalWorkflowCount, excludedWorkflowCount }: TestingStatusStripProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="inline-flex items-center gap-2"><Workflow className="h-4 w-4 text-cyan-800" />{totalWorkflowCount.toLocaleString()} workflows</span>
        <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-700" />{excludedWorkflowCount} excluded pending review</span>
        <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-800" />Clinician review required</span>
      </div>
      <span className="font-medium text-slate-500">Mock or anonymized cases only</span>
    </div>
  )
}

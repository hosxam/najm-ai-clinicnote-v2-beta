import { ArrowLeftRight, CheckCircle2, Sparkles } from 'lucide-react'
import { normalizeDisplayText } from '../lib/labelUtils'
import { Button } from './ui/button'
import type { WorkflowSummary } from '../types/clinicnote'

type SelectedWorkflowBarProps = {
  workflow: WorkflowSummary
  modeLabel: string
  helperText: string
  onChangeWorkflow: () => void
  suggestedCount?: number
}

export function SelectedWorkflowBar({
  workflow,
  modeLabel,
  helperText,
  onChangeWorkflow,
  suggestedCount,
}: SelectedWorkflowBarProps) {
  return (
    <div className="selected-workflow-bar">
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-semibold text-cyan-800">{modeLabel}</span>
            <span>•</span>
            <span>{normalizeDisplayText(workflow.specialty)}</span>
            {typeof suggestedCount === 'number' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-cyan-800">
                <CheckCircle2 className="h-3 w-3" /> {suggestedCount} suggested
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] text-slate-950 sm:text-xl">{workflow.title}</h1>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{helperText}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onChangeWorkflow} className="shrink-0">
        <ArrowLeftRight className="h-4 w-4" />
        <span className="hidden sm:inline">Change workflow</span>
        <span className="sm:hidden">Change</span>
      </Button>
    </div>
  )
}

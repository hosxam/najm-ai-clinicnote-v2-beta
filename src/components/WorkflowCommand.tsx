import { ArrowUpRight, FileSearch2, Search } from 'lucide-react'
import { normalizeDisplayText } from '../lib/labelUtils'
import { cn } from '../lib/cn'
import type { WorkflowSummary } from '../types/clinicnote'

type WorkflowCommandProps = {
  search: string
  specialty: string
  specialties: string[]
  workflows: WorkflowSummary[]
  loading?: boolean
  error?: string | null
  selectedWorkflowId?: string
  onSearchChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onSelect: (workflowId: string) => void
  resultLimit?: number
  compact?: boolean
}

export function WorkflowCommand({
  search,
  specialty,
  specialties,
  workflows,
  loading,
  error,
  selectedWorkflowId,
  onSearchChange,
  onSpecialtyChange,
  onSelect,
  resultLimit = 6,
  compact = false,
}: WorkflowCommandProps) {
  const visibleWorkflows = workflows.slice(0, resultLimit)

  return (
    <div className={cn('workflow-command', compact && 'workflow-command-compact')}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-800" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search symptom, diagnosis, or workflow"
          className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-16 text-base text-slate-950 shadow-[0_14px_34px_-25px_rgba(15,23,42,0.38)] transition placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500 sm:h-16 sm:text-lg"
          aria-label="Search workflows"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500 sm:inline-flex">
          1500
        </span>
      </div>

      <div className="workflow-chip-scroll -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => onSpecialtyChange('all')}
          className={cn('specialty-filter-chip', specialty === 'all' && 'specialty-filter-chip-active')}
        >
          All specialties
        </button>
        {specialties.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSpecialtyChange(item)}
            className={cn('specialty-filter-chip', specialty === item && 'specialty-filter-chip-active')}
          >
            {normalizeDisplayText(item)}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? <div className="command-state">Loading workflow catalog…</div> : null}
        {error ? <div className="command-state text-rose-700">{error}</div> : null}
        {!loading && !error && visibleWorkflows.length === 0 ? (
          <div className="command-state flex flex-col items-center py-8 text-center">
            <FileSearch2 className="mb-2 h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-800">No matching workflow</span>
            <span className="mt-1 text-xs text-slate-500">Try a broader symptom or switch specialties.</span>
          </div>
        ) : null}
        {!loading && !error
          ? visibleWorkflows.map((workflow, index) => {
              const selected = selectedWorkflowId === workflow.workflowId
              return (
                <button
                  key={workflow.workflowId}
                  type="button"
                  onClick={() => onSelect(workflow.workflowId)}
                  className={cn(
                    'group flex w-full items-center gap-3 px-4 py-3 text-left transition sm:px-5',
                    index > 0 && 'border-t border-slate-100',
                    selected ? 'bg-cyan-50' : 'hover:bg-slate-50',
                  )}
                >
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', selected ? 'bg-cyan-700' : 'bg-slate-300 group-hover:bg-cyan-600')} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-semibold text-slate-950">{workflow.title}</span>
                      <span className="text-xs font-medium text-cyan-800">{normalizeDisplayText(workflow.specialty)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{workflow.diagnosis}</span>
                  </span>
                  <span className="hidden font-mono text-[10px] text-slate-400 md:block">{workflow.workflowId}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-800" />
                </button>
              )
            })
          : null}
      </div>
    </div>
  )
}

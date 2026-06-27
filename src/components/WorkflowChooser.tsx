import { Search } from 'lucide-react'
import type { WorkflowSummary } from '../types/clinicnote'

type WorkflowChooserProps = {
  search: string
  specialty: string
  specialties: string[]
  workflows: WorkflowSummary[]
  loading?: boolean
  error?: string | null
  selectedWorkflowId?: string
  title?: string
  emptyTitle?: string
  emptyDescription?: string
  onSearchChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onSelect: (workflowId: string) => void
}

export function WorkflowChooser({
  search,
  specialty,
  specialties,
  workflows,
  loading,
  error,
  selectedWorkflowId,
  title = 'Search symptom, diagnosis, or workflow',
  emptyTitle = 'No workflows found',
  emptyDescription = 'Try a broader search term or switch to all specialties.',
  onSearchChange,
  onSpecialtyChange,
  onSelect,
}: WorkflowChooserProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={title}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
          />
        </label>
        <select
          value={specialty}
          onChange={(event) => onSpecialtyChange(event.target.value)}
          className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        >
          <option value="all">All specialties</option>
          {specialties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading workflow catalog…</p> : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-300/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && workflows.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-6 text-center">
          <div className="text-base font-semibold text-white">{emptyTitle}</div>
          <div className="mt-2 text-sm text-slate-400">{emptyDescription}</div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <button
            key={workflow.workflowId}
            type="button"
            onClick={() => onSelect(workflow.workflowId)}
            className={`rounded-3xl border p-4 text-left transition ${
              selectedWorkflowId === workflow.workflowId
                ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-950/30'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                {workflow.specialty}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-400">
                {workflow.workflowId}
              </span>
            </div>
            <div className="mt-3 text-lg font-semibold text-white">{workflow.title}</div>
            <div className="mt-1 text-sm text-slate-400">{workflow.diagnosis}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {workflow.aliases.slice(0, 3).map((alias) => (
                <span
                  key={alias}
                  className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300"
                >
                  {alias}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

import { Search } from 'lucide-react'
import { normalizeDisplayText } from '../lib/labelUtils'
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
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_230px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={title}
            className="field-input pl-11"
          />
        </label>
        <select
          value={specialty}
          onChange={(event) => onSpecialtyChange(event.target.value)}
          className="field-select"
        >
          <option value="all">All specialties</option>
          {specialties.map((item) => (
            <option key={item} value={item}>
              {normalizeDisplayText(item)}
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
        <div className="rounded-[1.6rem] border border-slate-800/90 bg-slate-950/45 px-5 py-8 text-center">
          <div className="text-base font-semibold tracking-tight text-white">{emptyTitle}</div>
          <div className="mt-2 text-sm leading-6 text-slate-400">{emptyDescription}</div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <button
            key={workflow.workflowId}
            type="button"
            onClick={() => onSelect(workflow.workflowId)}
            className={`group rounded-[1.65rem] border p-4 text-left transition duration-200 ${
              selectedWorkflowId === workflow.workflowId
                ? 'border-cyan-400/75 bg-cyan-400/10 shadow-[0_22px_48px_-28px_rgba(34,211,238,0.95)]'
                : 'border-slate-800/95 bg-slate-950/58 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/95 hover:shadow-[0_20px_40px_-32px_rgba(15,23,42,1)]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                {normalizeDisplayText(workflow.specialty)}
              </span>
              <span className="rounded-full border border-slate-700/90 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-400">
                {workflow.workflowId}
              </span>
            </div>
            <div className="mt-3 text-lg font-semibold leading-6 tracking-tight text-white">{workflow.title}</div>
            <div className="mt-1.5 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {workflow.aliases.slice(0, 3).map((alias) => (
                <span
                  key={alias}
                  className="rounded-full border border-slate-700/80 bg-slate-900/95 px-2.5 py-1 text-xs text-slate-300 group-hover:border-slate-600"
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

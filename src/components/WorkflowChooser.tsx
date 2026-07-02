import { ArrowRight, Search, Sparkles, Stethoscope } from 'lucide-react'
import { normalizeDisplayText } from '../lib/labelUtils'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
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

      {loading ? (
        <div className="rounded-[1.35rem] border border-slate-800/80 bg-slate-950/55 px-4 py-3 text-sm text-slate-400">
          Loading workflow catalog…
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-300/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && workflows.length === 0 ? (
        <div className="rounded-[1.6rem] border border-slate-800/90 bg-slate-950/50 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800/90 bg-slate-900/90">
            <Sparkles className="h-5 w-5 text-slate-400" />
          </div>
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
            className={`group relative overflow-hidden rounded-[1.65rem] border p-4 text-left transition duration-200 ${
              selectedWorkflowId === workflow.workflowId
                ? 'border-sky-400/55 bg-sky-300/10 shadow-[0_22px_48px_-28px_rgba(56,189,248,0.45)]'
                : 'border-slate-800/95 bg-slate-950/58 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/92 hover:shadow-[0_20px_40px_-32px_rgba(15,23,42,1)]'
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-px ${
                selectedWorkflowId === workflow.workflowId ? 'bg-sky-300/70' : 'bg-slate-700/40'
              }`}
            />
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <Badge variant="accent" className="uppercase tracking-[0.14em]">
                  {normalizeDisplayText(workflow.specialty)}
                </Badge>
                <Badge variant="muted">{workflow.workflowId}</Badge>
              </div>
              <div className="rounded-2xl border border-slate-800/90 bg-slate-900/75 p-2 text-slate-400 transition group-hover:border-slate-700 group-hover:text-slate-200">
                <Stethoscope className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-lg font-semibold leading-6 tracking-tight text-white text-wrap-pretty">{workflow.title}</div>
            <div className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-400">{workflow.diagnosis}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {workflow.aliases.slice(0, 3).map((alias) => (
                <span key={alias} className="rounded-full border border-slate-700/80 bg-slate-900/95 px-2.5 py-1 text-xs text-slate-300 group-hover:border-slate-600">
                  {alias}
                </span>
              ))}
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition group-hover:text-sky-100">
              Open workflow <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

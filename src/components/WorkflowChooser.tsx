import { ArrowRight, FileSearch2, Search } from 'lucide-react'
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
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading workflow catalog…
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {!loading && !error && workflows.length === 0 ? (
        <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <FileSearch2 className="h-5 w-5 text-slate-500" />
          </div>
          <div className="text-base font-semibold tracking-tight text-slate-950">{emptyTitle}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{emptyDescription}</div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <button
            key={workflow.workflowId}
            type="button"
            onClick={() => onSelect(workflow.workflowId)}
            className={`group rounded-[1.05rem] border p-4 text-left transition duration-200 ${
              selectedWorkflowId === workflow.workflowId
                ? 'border-cyan-400 bg-cyan-50/70 shadow-[0_14px_32px_-24px_rgba(14,116,144,0.42)]'
                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_38px_-30px_rgba(15,23,42,0.32)]'
            }`}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <Badge variant="accent" className="uppercase tracking-[0.14em]">
                  {normalizeDisplayText(workflow.specialty)}
                </Badge>
                <Badge variant="muted">{workflow.workflowId}</Badge>
            </div>
            <div className="mt-3 text-base font-semibold leading-6 tracking-tight text-slate-950 text-wrap-pretty">{workflow.title}</div>
            <div className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">{workflow.diagnosis}</div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <div className="text-xs text-slate-500">
                {selectedWorkflowId === workflow.workflowId ? 'Selected for drafting' : 'Open for drafting'}
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-800 transition group-hover:text-cyan-950">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

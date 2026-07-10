import { Badge } from './ui/badge'
import { cn } from '../lib/cn'

type ChecklistOption = {
  id: string
  label: string
  noteText?: string
  warning?: string
}

type ChecklistGroup = {
  id: string
  label: string
  safetyNote?: string
  options: ChecklistOption[]
}

type ChecklistGroupsProps = {
  groups: ChecklistGroup[]
  selectedValues: string[]
  onToggle: (value: string) => void
  variant?: 'panel' | 'plain'
}

export function ChecklistGroups({ groups, selectedValues, onToggle, variant = 'panel' }: ChecklistGroupsProps) {
  if (!groups.length) return <p className="text-sm text-slate-500">No workflow-specific prompts available.</p>

  return (
    <div className="space-y-4.5">
      {groups.map((group) => (
        <div key={group.id} className={cn(variant === 'panel' ? 'rounded-xl border border-slate-200 bg-slate-50/70 p-4' : 'border-b border-slate-200 pb-5 last:border-0 last:pb-0')}>
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-950">{group.label}</h3>
              {group.safetyNote ? <p className="mt-1 text-xs leading-5 text-slate-600">{group.safetyNote}</p> : null}
            </div>
            <Badge variant="muted">
              {group.options.filter((option) => selectedValues.includes(option.noteText || option.label)).length} selected
            </Badge>
          </div>
          <div className="space-y-2.5">
            {group.options.map((option) => {
              const value = option.noteText || option.label
              const checked = selectedValues.includes(value)
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border px-3.5 py-3 transition ${
                    checked
                      ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-700 focus:ring-cyan-600"
                  />
                  <div className="space-y-1">
                    <div className="text-sm leading-6 text-slate-700">{option.label}</div>
                    {option.warning ? <div className="text-xs leading-5 text-amber-800">{option.warning}</div> : null}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

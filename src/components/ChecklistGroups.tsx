import { Badge } from './ui/badge'

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
}

export function ChecklistGroups({ groups, selectedValues, onToggle }: ChecklistGroupsProps) {
  if (!groups.length) return <p className="text-sm text-slate-500">No workflow-specific prompts available.</p>

  return (
    <div className="space-y-4.5">
      {groups.map((group) => (
        <div key={group.id} className="rounded-[1.35rem] border border-slate-800/90 bg-slate-900/65 p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.95)]">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-100">{group.label}</h3>
              {group.safetyNote ? <p className="mt-1 text-xs leading-5 text-slate-400">{group.safetyNote}</p> : null}
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
                      ? 'border-sky-400/45 bg-sky-400/10 shadow-[0_10px_22px_-18px_rgba(56,189,248,0.75)]'
                      : 'border-slate-800/90 bg-slate-950/45 hover:border-slate-700 hover:bg-slate-950/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-400 focus:ring-sky-400"
                  />
                  <div className="space-y-1">
                    <div className="text-sm leading-6 text-slate-200">{option.label}</div>
                    {option.warning ? <div className="text-xs leading-5 text-amber-200">{option.warning}</div> : null}
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

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
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-100">{group.label}</h3>
            {group.safetyNote ? <p className="mt-1 text-xs text-slate-400">{group.safetyNote}</p> : null}
          </div>
          <div className="space-y-2">
            {group.options.map((option) => {
              const value = option.noteText || option.label
              const checked = selectedValues.includes(value)
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2 ${
                    checked ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(value)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <div className="space-y-1">
                    <div className="text-sm text-slate-200">{option.label}</div>
                    {option.warning ? <div className="text-xs text-amber-200">{option.warning}</div> : null}
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

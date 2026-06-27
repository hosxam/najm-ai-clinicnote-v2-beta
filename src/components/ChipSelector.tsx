type ChipSelectorProps = {
  label: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
}

export function ChipSelector({ label, items, selectedItems, onToggle }: ChipSelectorProps) {
  if (!items.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-100">{label}</h3>
        <span className="text-xs text-slate-400">{selectedItems.length} selected</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = selectedItems.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                active
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-100'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  )
}

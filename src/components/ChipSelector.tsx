type ChipSelectorProps = {
  label: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
}

export function ChipSelector({ label, items, selectedItems, onToggle }: ChipSelectorProps) {
  if (!items.length) return null

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-slate-100">{label}</h3>
        <span className="text-xs text-slate-400">{selectedItems.length} selected</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => {
          const active = selectedItems.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`rounded-full border px-3.5 py-2 text-sm transition ${
                active
                  ? 'border-cyan-400/70 bg-cyan-400/16 text-cyan-100 shadow-[0_8px_24px_-18px_rgba(34,211,238,0.95)]'
                  : 'border-slate-700/90 bg-slate-900/90 text-slate-300 hover:border-slate-500 hover:bg-slate-900 hover:text-white'
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

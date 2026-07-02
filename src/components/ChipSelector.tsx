import { CheckCircle2, Sparkles } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

type ChipSelectorProps = {
  label: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  description?: string
  suggestedItems?: string[]
}

export function ChipSelector({
  label,
  items,
  selectedItems,
  onToggle,
  description,
  suggestedItems = [],
}: ChipSelectorProps) {
  if (!items.length) return null

  const suggestedCount = suggestedItems.length

  return (
    <div className="space-y-3.5 rounded-[1.35rem] border border-slate-800/70 bg-slate-950/42 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">{label}</h3>
          {description ? <p className="text-xs leading-5 text-slate-400">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {suggestedCount ? (
            <Badge variant="muted" className="gap-1.5 text-slate-300">
              <Sparkles className="h-3 w-3 text-sky-300" />
              {suggestedCount} suggested
            </Badge>
          ) : null}
          <Badge variant={selectedItems.length ? 'accent' : 'muted'}>{selectedItems.length} selected</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => {
          const active = selectedItems.includes(item)
          const suggested = suggestedItems.includes(item)
          return (
            <Button
              key={item}
              onClick={() => onToggle(item)}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              className={`justify-start ${
                active
                  ? 'pr-3 text-left'
                  : suggested
                    ? 'border-slate-700/90 bg-slate-900/96 text-left text-slate-100'
                    : 'text-left text-slate-200'
              }`}
            >
              {active ? <CheckCircle2 className="h-4 w-4" /> : null}
              {!active && suggested ? <Sparkles className="h-3.5 w-3.5 text-sky-300" /> : null}
              {item}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

import { BadgeCheck, CheckCircle2 } from 'lucide-react'
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
    <div className="space-y-3.5 rounded-[1.05rem] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">{label}</h3>
          {description ? <p className="text-xs leading-5 text-slate-600">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {suggestedCount ? (
            <Badge variant="accent" className="gap-1.5">
              <BadgeCheck className="h-3 w-3" />
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
                    ? 'border-cyan-200 bg-cyan-50 text-left text-cyan-900'
                    : 'text-left text-slate-700'
              }`}
            >
              {active ? <CheckCircle2 className="h-4 w-4" /> : null}
              {!active && suggested ? <BadgeCheck className="h-3.5 w-3.5 text-cyan-700" /> : null}
              {item}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

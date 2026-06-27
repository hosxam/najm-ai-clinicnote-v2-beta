import { CheckCircle2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

type ChipSelectorProps = {
  label: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  description?: string
}

export function ChipSelector({ label, items, selectedItems, onToggle, description }: ChipSelectorProps) {
  if (!items.length) return null

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">{label}</h3>
          {description ? <p className="text-xs leading-5 text-slate-400">{description}</p> : null}
        </div>
        <Badge variant={selectedItems.length ? 'accent' : 'muted'}>{selectedItems.length} selected</Badge>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => {
          const active = selectedItems.includes(item)
          return (
            <Button
              key={item}
              onClick={() => onToggle(item)}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              className={`justify-start ${
                active
                  ? 'pr-3 text-left'
                  : 'text-left text-slate-200'
              }`}
            >
              {active ? <CheckCircle2 className="h-4 w-4" /> : null}
              {item}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

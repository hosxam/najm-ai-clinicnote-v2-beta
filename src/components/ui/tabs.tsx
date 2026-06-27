import { cn } from '../../lib/cn'

type TabItem = {
  key: string
  label: string
}

type TabsProps = {
  items: TabItem[]
  value: string
  onChange?: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange?.(item.key)}
          className={cn(
            'rounded-full border px-3.5 py-2 text-sm font-medium transition',
            value === item.key
              ? 'border-cyan-400/60 bg-cyan-300/12 text-cyan-50'
              : 'border-slate-700/90 bg-slate-950/86 text-slate-300 hover:border-slate-500 hover:text-white',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

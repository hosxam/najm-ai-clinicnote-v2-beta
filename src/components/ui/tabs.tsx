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
    <div className={cn('flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1.5', className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange?.(item.key)}
          className={cn(
            'rounded-xl border px-3.5 py-2 text-sm font-medium transition',
            value === item.key
              ? 'border-slate-200 bg-white text-cyan-800 shadow-sm'
              : 'border-transparent bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-950',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

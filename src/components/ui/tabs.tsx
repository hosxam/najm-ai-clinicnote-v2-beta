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
    <div className={cn('flex flex-wrap gap-2 rounded-[1.3rem] border border-slate-800/80 bg-slate-950/62 p-1.5', className)}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange?.(item.key)}
          className={cn(
            'rounded-xl border px-3.5 py-2 text-sm font-medium transition',
            value === item.key
              ? 'border-sky-400/45 bg-sky-300/12 text-sky-50 shadow-[0_12px_28px_-20px_rgba(56,189,248,0.75)]'
              : 'border-transparent bg-transparent text-slate-300 hover:border-slate-700/90 hover:bg-slate-900/70 hover:text-white',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type AlertTone = 'default' | 'warning' | 'error'

const toneClasses: Record<AlertTone, string> = {
  default: 'border-slate-700/80 bg-slate-900/72 text-slate-200',
  warning: 'border-amber-400/25 bg-amber-300/10 text-amber-100',
  error: 'border-rose-400/30 bg-rose-300/10 text-rose-100',
}

export function Alert({
  className,
  tone = 'default',
  children,
}: PropsWithChildren<{ className?: string; tone?: AlertTone }>) {
  return (
    <div className={cn('rounded-[1.2rem] border px-4 py-3', toneClasses[tone], className)}>
      {children}
    </div>
  )
}

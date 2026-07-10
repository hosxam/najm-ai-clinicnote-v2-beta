import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type AlertTone = 'default' | 'warning' | 'error'

const toneClasses: Record<AlertTone, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
}

export function Alert({
  className,
  tone = 'default',
  children,
}: PropsWithChildren<{ className?: string; tone?: AlertTone }>) {
  return (
    <div className={cn('rounded-[1.25rem] border px-4 py-3 shadow-[0_16px_34px_-28px_rgba(2,6,23,0.95)]', toneClasses[tone], className)}>
      {children}
    </div>
  )
}

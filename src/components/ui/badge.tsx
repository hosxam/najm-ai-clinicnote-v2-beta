import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type BadgeVariant = 'default' | 'muted' | 'accent' | 'warning'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-slate-200 bg-white text-slate-600',
  muted: 'border-slate-200 bg-slate-50 text-slate-500',
  accent: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

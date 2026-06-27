import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type BadgeVariant = 'default' | 'muted' | 'accent' | 'warning'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-slate-700/90 bg-slate-900/92 text-slate-300',
  muted: 'border-slate-800/90 bg-slate-950/80 text-slate-400',
  accent: 'border-cyan-400/25 bg-cyan-300/10 text-cyan-100',
  warning: 'border-amber-400/25 bg-amber-300/10 text-amber-100',
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

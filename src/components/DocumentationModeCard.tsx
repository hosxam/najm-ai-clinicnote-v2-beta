import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

type DocumentationModeCardProps = {
  title: string
  description: string
  to: string
  icon: LucideIcon
  primary?: boolean
  label?: string
  disabled?: boolean
}

export function DocumentationModeCard({
  title,
  description,
  to,
  icon: Icon,
  primary = false,
  label,
  disabled = false,
}: DocumentationModeCardProps) {
  const className = cn(
    'group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl border p-5 transition sm:p-6',
    disabled
      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 opacity-80'
      : primary
        ? 'border-cyan-900 bg-cyan-900 text-white shadow-[0_24px_50px_-32px_rgba(14,116,144,0.9)] hover:bg-cyan-950'
        : 'border-slate-200 bg-white text-slate-950 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_42px_-32px_rgba(15,23,42,0.45)]'
  )

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', disabled ? 'bg-slate-200 text-slate-500' : primary ? 'bg-white/12' : 'bg-slate-100 text-cyan-800')}>
          <Icon className="h-5 w-5" />
        </span>
        {label ? (
          <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]', disabled ? 'bg-slate-200 text-slate-500' : primary ? 'bg-white/12 text-cyan-50' : 'bg-slate-100 text-slate-600')}>
            {label}
          </span>
        ) : null}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold tracking-[-0.025em]">{title}</h2>
        <p className={cn('mt-2 max-w-md text-sm leading-6', disabled ? 'text-slate-500' : primary ? 'text-cyan-50/75' : 'text-slate-600')}>{description}</p>
        <span className={cn('mt-5 inline-flex items-center gap-2 text-sm font-semibold', disabled ? 'text-amber-800' : primary ? 'text-white' : 'text-cyan-800')}>
          {disabled ? 'Choose a matching workflow first' : 'Open workspace'}
          {!disabled ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
        </span>
      </div>
    </>
  )

  if (disabled) {
    return <div className={className} aria-disabled="true">{content}</div>
  }

  return <Link to={to} className={className}>{content}</Link>
}

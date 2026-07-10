import type { PropsWithChildren, ReactNode } from 'react'
import { cn } from '../lib/cn'

type DocumentationSectionProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}>

export function DocumentationSection({ title, description, actions, className, children }: DocumentationSectionProps) {
  return (
    <section className={cn('documentation-section', className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[-0.01em] text-slate-950 sm:text-base">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

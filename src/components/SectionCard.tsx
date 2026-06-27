import type { PropsWithChildren, ReactNode } from 'react'

type SectionCardProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

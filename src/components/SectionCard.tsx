import type { PropsWithChildren, ReactNode } from 'react'

type SectionCardProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <section className="rounded-[1.9rem] border border-slate-800/90 bg-slate-950/68 p-5 shadow-[0_22px_70px_-36px_rgba(2,6,23,0.85)] backdrop-blur-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

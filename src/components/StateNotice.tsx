import type { PropsWithChildren } from 'react'

type StateNoticeProps = PropsWithChildren<{
  title: string
  description?: string
  tone?: 'default' | 'warning' | 'error'
}>

const toneClasses: Record<NonNullable<StateNoticeProps['tone']>, string> = {
  default: 'border-slate-700 bg-slate-900/60 text-slate-300',
  warning: 'border-amber-400/40 bg-amber-300/10 text-amber-100',
  error: 'border-rose-400/40 bg-rose-300/10 text-rose-100',
}

export function StateNotice({
  title,
  description,
  tone = 'default',
  children,
}: StateNoticeProps) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-sm opacity-90">{description}</p> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

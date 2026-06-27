import type { PropsWithChildren } from 'react'

type StateNoticeProps = PropsWithChildren<{
  title: string
  description?: string
  tone?: 'default' | 'warning' | 'error'
}>

const toneClasses: Record<NonNullable<StateNoticeProps['tone']>, string> = {
  default:
    'border-slate-700/90 bg-slate-900/68 text-slate-300 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.95)]',
  warning:
    'border-amber-400/30 bg-linear-to-r from-amber-300/10 via-amber-200/6 to-transparent text-amber-100 shadow-[0_16px_34px_-28px_rgba(245,158,11,0.7)]',
  error:
    'border-rose-400/35 bg-linear-to-r from-rose-300/10 via-rose-200/6 to-transparent text-rose-100 shadow-[0_16px_34px_-28px_rgba(244,63,94,0.7)]',
}

export function StateNotice({
  title,
  description,
  tone = 'default',
  children,
}: StateNoticeProps) {
  return (
    <div className={`rounded-[1.45rem] border px-4 py-4 sm:px-5 ${toneClasses[tone]}`}>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-sm leading-6 opacity-90">{description}</p> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

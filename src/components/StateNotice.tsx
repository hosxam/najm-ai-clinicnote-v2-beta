import type { PropsWithChildren } from 'react'
import { Alert } from './ui/alert'

type StateNoticeProps = PropsWithChildren<{
  title: string
  description?: string
  tone?: 'default' | 'warning' | 'error'
}>

export function StateNotice({
  title,
  description,
  tone = 'default',
  children,
}: StateNoticeProps) {
  return (
    <Alert tone={tone} className="rounded-[1.45rem] px-4 py-4 sm:px-5">
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-sm leading-6 opacity-90">{description}</p> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </Alert>
  )
}

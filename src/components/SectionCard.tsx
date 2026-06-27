import type { PropsWithChildren, ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'

type SectionCardProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CardHeader className="min-w-0 gap-1.5">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription className="max-w-3xl">{description}</CardDescription> : null}
        </CardHeader>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </Card>
  )
}

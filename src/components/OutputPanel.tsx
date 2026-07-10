import { Check, Clipboard, FileCheck2, Printer, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Tabs } from './ui/tabs'

type OutputTab = {
  key: string
  label: string
  content: string
}

type OutputPanelProps = {
  title: string
  description?: string
  tabs: OutputTab[]
  activeKey?: string
  onActiveKeyChange?: (key: string) => void
  onResetDraft?: () => void
  onClearSavedDraft?: () => void
  className?: string
}

export function OutputPanel({
  title,
  description,
  tabs,
  activeKey,
  onActiveKeyChange,
  onResetDraft,
  onClearSavedDraft,
  className,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false)
  const firstKey = tabs[0]?.key ?? 'output'
  const currentKey = activeKey ?? firstKey
  const currentTab = tabs.find((tab) => tab.key === currentKey) ?? tabs[0]

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    if (!currentTab?.content) return
    await navigator.clipboard.writeText(currentTab.content)
    setCopied(true)
  }

  const outputLines = (currentTab?.content ?? 'No output yet.').split('\n')

  return (
    <div className={`draft-review-pane ${className ?? ''}`}>
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5" data-no-print="true">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-800">
                <FileCheck2 className="h-3.5 w-3.5" /> Draft review
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800">
                Clinician review required
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            <Button onClick={handleCopy} variant="primary" size="sm">
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onClick={() => window.print()} variant="secondary" size="sm"><Printer className="h-4 w-4" /> Print</Button>
          </div>
        </div>

        {tabs.length > 1 ? (
          <Tabs items={tabs.map((tab) => ({ key: tab.key, label: tab.label }))} value={currentKey} onChange={onActiveKeyChange} className="mt-4" />
        ) : null}
      </div>

      <div className="print-surface bg-slate-50 p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400" data-no-print="true">
          <span>Live preview</span>
          <span>{currentTab?.label ?? 'Output'}</span>
        </div>
        <article className="output-document min-h-[32rem] rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
          {outputLines.map((line, index) => {
            const trimmed = line.trim()
            const isHeading = Boolean(trimmed) && trimmed.length < 48 && trimmed === trimmed.toUpperCase() && /^[A-Z /-]+$/.test(trimmed)
            const isDisclaimer = trimmed.startsWith('Draft generated')
            if (!trimmed) return <div key={`${index}-space`} className="h-3" />
            if (isHeading) return <h3 key={`${index}-${trimmed}`} className="mt-1 border-b border-slate-100 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-900 first:mt-0">{trimmed}</h3>
            if (isDisclaimer) return <p key={`${index}-${trimmed}`} className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">{trimmed}</p>
            return <p key={`${index}-${trimmed}`} className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{line}</p>
          })}
        </article>
      </div>

      {onResetDraft || onClearSavedDraft ? (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-200 px-4 py-3 sm:px-5" data-no-print="true">
          {onResetDraft ? <Button onClick={onResetDraft} variant="ghost" size="sm"><RotateCcw className="h-4 w-4" /> Reset draft</Button> : null}
          {onClearSavedDraft ? <Button onClick={onClearSavedDraft} variant="warning" size="sm"><Trash2 className="h-4 w-4" /> Clear saved</Button> : null}
        </div>
      ) : null}
    </div>
  )
}

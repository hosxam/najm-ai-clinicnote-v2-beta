import { Check, Clipboard, Printer, RotateCcw, Trash2 } from 'lucide-react'
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

  return (
    <div className={`rounded-[1.95rem] border border-slate-800/90 bg-slate-950/82 p-5 shadow-[0_28px_80px_-38px_rgba(2,6,23,0.9)] sm:p-6 ${className ?? ''}`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between" data-no-print="true">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="eyebrow text-slate-300">Review-first draft</div>
            <div className="rounded-full border border-amber-400/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100">
              Clinician review required
            </div>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2.5 rounded-[1.2rem] border border-slate-800/80 bg-slate-900/52 p-2">
          <Button
            onClick={handleCopy}
            variant="primary"
            size="sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy output'}
          </Button>
          <Button
            onClick={() => window.print()}
            variant="secondary"
            size="sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          {onResetDraft ? (
            <Button
              onClick={onResetDraft}
              variant="secondary"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
              Reset draft
            </Button>
          ) : null}
          {onClearSavedDraft ? (
            <Button
              onClick={onClearSavedDraft}
              variant="warning"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear saved draft
            </Button>
          ) : null}
        </div>
      </div>

      {tabs.length > 1 ? (
        <Tabs
          items={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
          value={currentKey}
          onChange={onActiveKeyChange}
          className="mb-4"
        />
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500" data-no-print="true">
        <span>Generated preview</span>
        <span>{currentTab?.label ?? 'Output'}</span>
      </div>

      <div className="print-surface rounded-[1.5rem] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="mb-3 flex items-center justify-between rounded-[1rem] border border-slate-800/80 bg-slate-950/70 px-3.5 py-2 text-xs font-medium text-slate-400">
          <span>Clinical draft surface</span>
          <span>Review before export</span>
        </div>
        <pre className="output-prose min-h-[28rem] whitespace-pre-wrap rounded-[1.2rem] bg-slate-950/50 p-5 text-sm text-slate-100">
          {currentTab?.content ?? 'No output yet.'}
        </pre>
      </div>
    </div>
  )
}

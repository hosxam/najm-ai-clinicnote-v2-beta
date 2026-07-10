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
    <div className={`rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_24px_65px_-40px_rgba(15,23,42,0.34)] sm:p-6 ${className ?? ''}`}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between" data-no-print="true">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="eyebrow">Draft review</div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">
              Clinician review required
            </div>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
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

      <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-500" data-no-print="true">
        <span>Live preview</span>
        <span>{currentTab?.label ?? 'Output'}</span>
      </div>

      <div className="print-surface rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500">
          <span>Clinical draft surface</span>
          <span>Review before export</span>
        </div>
        <pre className="output-prose min-h-[28rem] whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          {currentTab?.content ?? 'No output yet.'}
        </pre>
      </div>
    </div>
  )
}

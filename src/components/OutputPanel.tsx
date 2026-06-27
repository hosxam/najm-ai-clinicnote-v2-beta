import { Check, Clipboard, Printer, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from './ui/alert'
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
}

export function OutputPanel({
  title,
  description,
  tabs,
  activeKey,
  onActiveKeyChange,
  onResetDraft,
  onClearSavedDraft,
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
    <div className="rounded-[1.9rem] border border-slate-800/90 bg-slate-950/78 p-5 shadow-[0_24px_70px_-36px_rgba(2,6,23,0.9)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between" data-no-print="true">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2.5">
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

      <Alert tone="warning" className="mb-3 text-xs font-medium leading-5" data-no-print="true">
        Limited testing build. Do not enter patient identifiers. Outputs remain clinician-review drafts only.
      </Alert>

      <pre className="print-surface min-h-[28rem] whitespace-pre-wrap rounded-[1.35rem] border border-slate-800/90 bg-slate-950/96 p-5 text-sm leading-7 text-slate-100">
        {currentTab?.content ?? 'No output yet.'}
      </pre>
    </div>
  )
}

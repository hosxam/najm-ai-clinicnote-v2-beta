import { Check, Clipboard, Printer, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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
    <div className="rounded-[1.9rem] border border-slate-800/90 bg-slate-950/72 p-5 shadow-[0_24px_70px_-36px_rgba(2,6,23,0.9)] sm:p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between" data-no-print="true">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3.5 py-2 text-sm font-medium text-cyan-100"
          >
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy output'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-200"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          {onResetDraft ? (
            <button
              type="button"
              onClick={onResetDraft}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-medium text-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reset draft
            </button>
          ) : null}
          {onClearSavedDraft ? (
            <button
              type="button"
              onClick={onClearSavedDraft}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-300/10 px-3.5 py-2 text-sm font-medium text-amber-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear saved draft
            </button>
          ) : null}
        </div>
      </div>

      {tabs.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2.5" data-no-print="true">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onActiveKeyChange?.(tab.key)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium ${
                currentKey === tab.key
                  ? 'border-cyan-400/70 bg-cyan-400/14 text-cyan-100'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-3 text-xs font-medium leading-5 text-amber-200" data-no-print="true">
        Limited testing build. Do not enter patient identifiers. Outputs remain clinician-review drafts only.
      </div>

      <pre className="print-surface min-h-[28rem] whitespace-pre-wrap rounded-[1.35rem] border border-slate-800/90 bg-slate-950/92 p-5 text-sm leading-7 text-slate-100">
        {currentTab?.content ?? 'No output yet.'}
      </pre>
    </div>
  )
}

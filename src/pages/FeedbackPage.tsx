import { CheckCircle2, Clipboard, Download, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { SectionCard } from '../components/SectionCard'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'

type FeedbackValues = {
  workflowTested: string
  modeTested: string
  taskCompleted: string
  timeToComplete: string
  usefulnessScore: string
  accuracyScore: string
  unsafeOrInventedContent: string
  missingFields: string
  uiConfusion: string
  freeFeedback: string
}

const initialValues: FeedbackValues = {
  workflowTested: '',
  modeTested: '',
  taskCompleted: '',
  timeToComplete: '',
  usefulnessScore: '',
  accuracyScore: '',
  unsafeOrInventedContent: '',
  missingFields: '',
  uiConfusion: '',
  freeFeedback: '',
}

const selectClassName = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100'

export function FeedbackPage() {
  const [values, setValues] = useState<FeedbackValues>(initialValues)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')

  function updateValue(key: keyof FeedbackValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setCopyStatus('idle')
  }

  async function copyFeedback() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(createFeedbackPayload(), null, 2))
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  function downloadFeedback() {
    const blob = new Blob([JSON.stringify(createFeedbackPayload(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `najm-clinicnote-feedback-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function createFeedbackPayload() {
    return {
      feedback_type: 'najm_clinicnote_limited_beta',
      recorded_at: new Date().toISOString(),
      ...values,
    }
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <SectionCard
        title="Testing feedback"
        description="Complete one local feedback entry per workflow and mode. Nothing is sent or stored remotely."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Use mock or anonymized cases only. Do not enter names, identifiers, contact details, or other patient information.
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="field-label">Workflow tested</span>
            <Input value={values.workflowTested} onChange={(event) => updateValue('workflowTested', event.target.value)} placeholder="Workflow title or ID" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Mode tested</span>
            <select className={selectClassName} value={values.modeTested} onChange={(event) => updateValue('modeTested', event.target.value)}>
              <option value="">Choose mode</option>
              <option>Quick Note</option>
              <option>Detailed Encounter</option>
              <option>Medical Report</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Task completed</span>
            <select className={selectClassName} value={values.taskCompleted} onChange={(event) => updateValue('taskCompleted', event.target.value)}>
              <option value="">Choose answer</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Time to complete</span>
            <Input value={values.timeToComplete} onChange={(event) => updateValue('timeToComplete', event.target.value)} placeholder="For example, 3 minutes" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Usefulness score</span>
            <select className={selectClassName} value={values.usefulnessScore} onChange={(event) => updateValue('usefulnessScore', event.target.value)}>
              <option value="">Choose 1–5</option>
              {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Documentation accuracy score</span>
            <select className={selectClassName} value={values.accuracyScore} onChange={(event) => updateValue('accuracyScore', event.target.value)}>
              <option value="">Choose 1–5</option>
              {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm lg:col-span-2">
            <span className="field-label">Unsafe wording or invented content found</span>
            <select className={selectClassName} value={values.unsafeOrInventedContent} onChange={(event) => updateValue('unsafeOrInventedContent', event.target.value)}>
              <option value="">Choose answer</option>
              <option>No</option>
              <option>Yes — describe below</option>
              <option>Unsure — describe below</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">Missing fields or information</span>
            <Textarea rows={4} value={values.missingFields} onChange={(event) => updateValue('missingFields', event.target.value)} placeholder="Describe anything important that was missing." />
          </label>
          <label className="space-y-2 text-sm">
            <span className="field-label">UI confusion</span>
            <Textarea rows={4} value={values.uiConfusion} onChange={(event) => updateValue('uiConfusion', event.target.value)} placeholder="Describe search, selection, chip, output, or navigation problems." />
          </label>
          <label className="space-y-2 text-sm lg:col-span-2">
            <span className="field-label">Free feedback</span>
            <Textarea rows={5} value={values.freeFeedback} onChange={(event) => updateValue('freeFeedback', event.target.value)} placeholder="Add safety concerns, wrong assumptions, or practical suggestions." />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
          <Button type="button" onClick={copyFeedback}><Clipboard className="h-4 w-4" /> Copy feedback</Button>
          <Button type="button" variant="secondary" onClick={downloadFeedback}><Download className="h-4 w-4" /> Download feedback as JSON</Button>
          {copyStatus === 'copied' ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Copied</span> : null}
          {copyStatus === 'failed' ? <span className="text-sm font-medium text-rose-700">Copy failed — select or download the JSON instead.</span> : null}
        </div>
      </SectionCard>
    </div>
  )
}

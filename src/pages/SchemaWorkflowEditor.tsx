import { ArrowLeft, ArrowRight, Copy, Download, ExternalLink, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { buildMarker } from '../lib/buildInfo'
import { buildInteractiveProcedureNote, buildInteractiveSoapNote, type InteractiveValues } from '../lib/interactiveSoap'
import { interactiveWorkflowData, type InteractiveField, type InteractiveWorkflow } from '../lib/interactiveWorkflowData'

const DRAFT_SCHEMA_VERSION = '1'
const draftKey = (workflowId: string, mode: 'quick' | 'advanced') => `najm-clinicnote-v2:draft:${DRAFT_SCHEMA_VERSION}:${workflowId}:${mode}`
const sectionLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

type Mode = 'quick' | 'advanced'
type DraftChoice = 'fresh' | 'resume'

function isVisible(field: InteractiveField, values: InteractiveValues) {
  if (!field.visibility || field.visibility.type === 'always') return true
  return values[field.visibility.field_id]?.trim() === field.visibility.value
}

function parseOptions(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function isMulti(field: InteractiveField) {
  return field.field_type === 'multi_select' || field.field_type === 'repeated_structured_rows'
}

function valueFor(field: InteractiveField, values: InteractiveValues) {
  return values[field.field_id] ?? ''
}

function setOptionValue(current: string, option: string) {
  const next = new Set(parseOptions(current))
  if (next.has(option)) next.delete(option)
  else next.add(option)
  return JSON.stringify([...next])
}

function isLong(field: InteractiveField) {
  return ['textarea', 'examination_finding', 'investigation_result', 'medication_entry', 'allergy_entry', 'assessment_entry', 'plan_entry', 'safety_netting_selection', 'referral_selection', 'follow_up_selection', 'repeated_structured_rows'].includes(field.field_type)
}

function FieldControl({ field, value, onChange }: { field: InteractiveField; value: string; onChange: (value: string) => void }) {
  if (isMulti(field)) {
    const selected = parseOptions(value)
    return <div id={field.field_id} className="grid gap-2" role="group" aria-label={field.label}>{field.options.map((option, index) => { const optionId = `${field.field_id}__${index}`; return <label key={option} htmlFor={optionId} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-sm"><input id={optionId} name={field.field_id} type="checkbox" checked={selected.includes(option)} onChange={() => onChange(setOptionValue(value, option))} /><span>{option}</span></label> })}</div>
  }
  if (field.options.length || ['select', 'yes_no', 'yes_no_unknown'].includes(field.field_type)) {
    const options = field.options.length ? field.options : field.field_type === 'yes_no_unknown' ? ['Yes', 'No', 'Unknown'] : ['Yes', 'No']
    return <select id={field.field_id} name={field.field_id} value={value} required={field.required} onChange={(event) => onChange(event.target.value)} className="field-input" aria-label={field.label}><option value="">Not assessed</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
  }
  if (field.field_type === 'date' || field.field_type === 'time') return <Input id={field.field_id} name={field.field_id} type={field.field_type} value={value} required={field.required} onChange={(event) => onChange(event.target.value)} aria-label={field.label} />
  if (field.field_type === 'integer') return <Input id={field.field_id} name={field.field_id} type="number" step="1" value={value} required={field.required} onChange={(event) => onChange(event.target.value)} aria-label={field.label} />
  if (field.field_type === 'decimal' || field.field_type === 'vital_sign') return <Input id={field.field_id} name={field.field_id} type="text" inputMode="decimal" value={value} required={field.required} placeholder="Enter if assessed" onChange={(event) => onChange(event.target.value)} aria-label={field.label} />
  if (isLong(field)) return <Textarea id={field.field_id} name={field.field_id} value={value} required={field.required} rows={field.field_type === 'assessment_entry' || field.field_type === 'plan_entry' ? 4 : 3} placeholder="Enter only documented patient-specific information" onChange={(event) => onChange(event.target.value)} aria-label={field.label} />
  return <Input id={field.field_id} name={field.field_id} type="text" value={value} required={field.required} placeholder="Enter if assessed" onChange={(event) => onChange(event.target.value)} aria-label={field.label} />
}

function FieldCard({ field, values, onChange }: { field: InteractiveField; values: InteractiveValues; onChange: (field: InteractiveField, value: string) => void }) {
  if (!isVisible(field, values)) return null
  return <div className="grid gap-2 text-sm">
    <span className="font-semibold text-slate-900">{field.label}{field.required ? <span className="ml-1 text-cyan-700" aria-label="required">*</span> : null}</span>
    <FieldControl field={field} value={valueFor(field, values)} onChange={(value) => onChange(field, value)} />
    <span className="text-xs leading-5 text-slate-500">{field.helper_text}</span>
    <span className="text-[11px] text-slate-400">Source: {field.provenance.evidence_pack_ids.join(', ') || 'committed schema reference'}</span>
  </div>
}

function quickFields(workflow: InteractiveWorkflow) {
  const chosen = new Set<string>()
  const bySection = new Map<string, InteractiveField[]>()
  for (const field of workflow.fields) bySection.set(field.section, [...(bySection.get(field.section) ?? []), field])
  for (const field of workflow.fields) if (field.quick_priority || field.required || ['vital_sign', 'examination_finding', 'investigation_result', 'medication_entry', 'assessment_entry', 'plan_entry', 'safety_netting_selection', 'referral_selection'].includes(field.field_type)) chosen.add(field.field_id)
  for (const fields of bySection.values()) for (let index = 0; index < fields.length && index < 2; index += 1) chosen.add(fields[index].field_id)
  return workflow.fields.filter((field) => chosen.has(field.field_id)).sort((a, b) => a.display_order - b.display_order)
}

function EvidencePanel({ workflow }: { workflow: InteractiveWorkflow }) {
  const sources = [...new Map(workflow.evidence.map((record) => [record.source_id, record])).values()]
  return <details className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><summary className="cursor-pointer font-semibold text-violet-950">Guideline evidence ({workflow.evidence.length} internal records)</summary><div className="mt-3 grid gap-2">{sources.map((record) => <div key={record.source_id} className="rounded-xl border border-violet-200 bg-white p-3 text-sm"><div className="font-semibold">{record.source_id}</div>{record.official_source_url ? <a className="mt-1 inline-flex items-center gap-1 text-blue-700 underline" href={record.official_source_url} target="_blank" rel="noreferrer">Open official source <ExternalLink size={13} /></a> : null}<div className="mt-1 text-xs text-slate-600">{String(record.locator.section_heading ?? 'Exact committed locator')}</div></div>)}</div></details>
}

export function SchemaWorkflowEditor() {
  const { workflowId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const [workflow, setWorkflow] = useState<InteractiveWorkflow | null>(null)
  const [values, setValues] = useState<InteractiveValues>({})
  const [mode, setMode] = useState<Mode>(() => searchParams.get('mode') === 'advanced' ? 'advanced' : 'quick')
  const [draftChoice, setDraftChoice] = useState<DraftChoice | null>(null)
  const [savedDraft, setSavedDraft] = useState<InteractiveValues | null>(null)
  const [section, setSection] = useState('')
  const [output, setOutput] = useState('')
  const [procedureOutput, setProcedureOutput] = useState('')
  const [tab, setTab] = useState<'soap' | 'procedure'>('soap')
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    let cancelled = false
    const requestedMode: Mode = searchParams.get('mode') === 'advanced' ? 'advanced' : 'quick'
    setMode(requestedMode)
    localStorage.removeItem('najm-clinicnote-v2:quick-note-draft')
    localStorage.removeItem('najm-clinicnote-v2:detailed-encounter-draft')
    setWorkflow(null); setValues({}); setSavedDraft(null); setDraftChoice(null); setOutput(''); setProcedureOutput(''); setError(null); setValidationError('')
    interactiveWorkflowData.getWorkflow(workflowId).then((loaded) => {
      if (cancelled) return
      setWorkflow(loaded)
      const raw = localStorage.getItem(draftKey(workflowId, requestedMode))
      if (!raw) { setDraftChoice('fresh'); return }
      try { setSavedDraft(JSON.parse(raw) as InteractiveValues) } catch { localStorage.removeItem(draftKey(workflowId, requestedMode)); setDraftChoice('fresh') }
    }).catch((caught: unknown) => { if (!cancelled) setError(caught instanceof Error ? caught.message : 'Interactive workflow could not be loaded.') })
    return () => { cancelled = true }
  }, [workflowId, searchParams])

  useEffect(() => { if (!workflow || !draftChoice) return; const serialized = JSON.stringify(values); localStorage.setItem(draftKey(workflow.workflow_id, 'quick'), serialized); localStorage.setItem(draftKey(workflow.workflow_id, 'advanced'), serialized) }, [workflow, values, draftChoice])

  const sections = useMemo(() => [...new Set((workflow?.fields ?? []).map((field) => field.section))], [workflow])
  useEffect(() => { if (sections.length && !sections.includes(section)) setSection(sections[0]) }, [sections, section])
  const visibleFields = useMemo(() => (workflow?.fields ?? []).filter((field) => field.section === section && isVisible(field, values)).sort((a, b) => a.display_order - b.display_order), [workflow, section, values])
  const requiredFields = useMemo(() => (workflow?.fields ?? []).filter((field) => field.required && isVisible(field, values)), [workflow, values])
  const answeredRequired = requiredFields.filter((field) => Boolean(values[field.field_id]?.trim())).length
  const fieldsForMode = workflow ? (mode === 'quick' ? quickFields(workflow) : workflow.fields) : []
  const progress = requiredFields.length ? Math.round((answeredRequired / requiredFields.length) * 100) : 100

  const chooseDraft = (choice: DraftChoice) => { setDraftChoice(choice); setValues(choice === 'resume' && savedDraft ? savedDraft : {}) }
  const updateField = (field: InteractiveField, value: string) => {
    setValidationError('')
    setValues((current) => {
      const next = { ...current, [field.field_id]: value }
      for (const rule of field.contradictory_option_rules) {
        const [otherField, otherValue] = rule.split('=')
        if (otherField && otherValue && value.includes(otherValue)) delete next[otherField]
      }
      return next
    })
  }
  const reset = () => { setValues({}); setOutput(''); setProcedureOutput(''); setValidationError(''); localStorage.removeItem(draftKey(workflowId, 'quick')); localStorage.removeItem(draftKey(workflowId, 'advanced')) }
  const missingRequired = requiredFields.filter((field) => !values[field.field_id]?.trim())
  const generate = () => {
    if (!workflow) return
    if (missingRequired.length) { setValidationError(`Complete required fields before generating: ${missingRequired.map((field) => field.label).join(', ')}`); setOutput(''); setProcedureOutput(''); return }
    setValidationError('')
    setOutput(buildInteractiveSoapNote(workflow, values)); setProcedureOutput(buildInteractiveProcedureNote(workflow, values))
  }
  const switchMode = (next: Mode) => setMode(next)

  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">Interactive workflow failed closed: {error}</div>
  if (!workflow) return <div className="p-8 text-sm text-slate-600">Loading source-grounded workflow…</div>
  if (!draftChoice) return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="draft-choice-title"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="draft-choice-title" className="text-lg font-semibold text-slate-950">Saved draft found</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose whether to resume this workflow’s saved encounter or start a fresh encounter. Drafts are workflow-scoped.</p><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => chooseDraft('fresh')}>Start fresh</Button><Button variant="primary" onClick={() => chooseDraft('resume')}>Resume saved draft</Button></div></div></div>

  const sectionIndex = sections.indexOf(section)
  const procedure = Boolean(procedureOutput)
  return <div key={workflow.workflow_id} className="min-w-0 space-y-5">
    <header className="rounded-3xl border border-cyan-200 bg-slate-950 p-5 text-white shadow-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/beta" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100"><ArrowLeft size={16} /> Catalogue</Link><span className="font-mono text-xs text-cyan-200">Build {buildMarker}</span></div>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Active source-grounded workflow</div><h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">{workflow.title}</h1><p className="mt-2 break-words text-sm text-slate-300">{workflow.workflow_id} · {workflow.specialty} · {sectionLabel(workflow.archetype)}</p></div><span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100"><Sparkles size={14} /> Scope-specific</span></div>
      <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2"><div className="rounded-xl border border-white/15 bg-white/5 p-3"><span className="font-semibold text-cyan-200">Population</span><div className="mt-1">{workflow.population.join(' ')}</div></div><div className="rounded-xl border border-white/15 bg-white/5 p-3"><span className="font-semibold text-cyan-200">Setting</span><div className="mt-1">{workflow.settings.join(' ')}</div></div></div>
    </header>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Closest available match:</strong> this route is limited to the declared workflow scope. It does not add unsupported procedure fields or infer missing clinical facts.</div>
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Documentation mode"><Button size="sm" variant={mode === 'quick' ? 'primary' : 'ghost'} aria-pressed={mode === 'quick'} onClick={() => switchMode('quick')}>Quick</Button><Button size="sm" variant={mode === 'advanced' ? 'primary' : 'ghost'} aria-pressed={mode === 'advanced'} onClick={() => switchMode('advanced')}>Advanced</Button></div><div className="text-xs text-slate-600" aria-label={`Required fields ${answeredRequired} of ${requiredFields.length}`}>Required fields: {answeredRequired}/{requiredFields.length} · {progress}%</div></section>
    {mode === 'quick' ? <main className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.5fr)]"><div className="space-y-4">{fieldsForMode.map((field) => <section key={field.field_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold text-slate-950">{sectionLabel(field.section)}</h2><FieldCard field={field} values={values} onChange={updateField} /></section>)}</div><OutputPanel output={output} procedureOutput={procedureOutput} procedure={procedure} tab={tab} onTab={setTab} onGenerate={generate} onReset={reset} canGenerate={!missingRequired.length} validationError={validationError} /></main> : <main className="grid min-w-0 gap-5 xl:grid-cols-[minmax(12rem,0.25fr)_minmax(0,1fr)_minmax(20rem,0.5fr)]"><nav className="section-rail" aria-label="Advanced workflow sections">{sections.map((item, index) => <button key={item} type="button" onClick={() => setSection(item)} className={`section-rail-item ${item === section ? 'section-rail-item-active' : ''}`}><span className="section-rail-index">{index + 1}</span><span>{sectionLabel(item)}</span></button>)}</nav><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-950">{sectionLabel(section)}</h2><p className="mt-1 text-xs text-slate-500">All supported source-grounded fields in schema order.</p></div><span className="text-xs text-slate-500">{visibleFields.length} fields</span></div><div className="grid gap-5">{visibleFields.map((field) => <FieldCard key={field.field_id} field={field} values={values} onChange={updateField} />)}</div><div className="mt-7 flex justify-between border-t border-slate-200 pt-4"><Button variant="ghost" disabled={sectionIndex <= 0} onClick={() => setSection(sections[sectionIndex - 1])}><ArrowLeft size={15} /> Previous</Button><Button variant="primary" disabled={sectionIndex === sections.length - 1} onClick={() => setSection(sections[sectionIndex + 1])}>Next <ArrowRight size={15} /></Button></div></section><OutputPanel output={output} procedureOutput={procedureOutput} procedure={procedure} tab={tab} onTab={setTab} onGenerate={generate} onReset={reset} canGenerate={!missingRequired.length} validationError={validationError} /></main>}
    <EvidencePanel workflow={workflow} />
  </div>
}

function OutputPanel({ output, procedureOutput, procedure, tab, onTab, onGenerate, onReset, canGenerate, validationError }: { output: string; procedureOutput: string; procedure: boolean; tab: 'soap' | 'procedure'; onTab: (tab: 'soap' | 'procedure') => void; onGenerate: () => void; onReset: () => void; canGenerate: boolean; validationError: string }) {
  const content = tab === 'procedure' ? procedureOutput : output
  const copy = async () => { if (content) await navigator.clipboard.writeText(content) }
  const exportNote = () => { if (!content) return; const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = tab === 'procedure' ? 'procedure-note.txt' : 'soap-note.txt'; anchor.click(); URL.revokeObjectURL(url) }
  return <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start"><section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold text-cyan-950">Draft outputs</h2><div className="flex gap-1"><Button size="sm" variant={tab === 'soap' ? 'primary' : 'ghost'} onClick={() => onTab('soap')}>SOAP</Button>{procedure ? <Button size="sm" variant={tab === 'procedure' ? 'primary' : 'ghost'} onClick={() => onTab('procedure')}>Procedure note</Button> : null}</div></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="primary" onClick={onGenerate} disabled={!canGenerate} aria-describedby={validationError ? 'generation-validation' : undefined}>Generate</Button><Button size="sm" variant="ghost" onClick={onReset}><RotateCcw size={14} /> Reset</Button><Button size="sm" variant="ghost" disabled={!content} onClick={copy}><Copy size={14} /> Copy</Button><Button size="sm" variant="ghost" disabled={!content} onClick={exportNote}><Download size={14} /> Export</Button></div>{validationError ? <p id="generation-validation" className="mt-3 text-sm font-semibold text-rose-800" role="alert" aria-live="assertive">{validationError}</p> : null}<Textarea className="mt-4 min-h-72 bg-white font-mono text-xs leading-5" value={content} readOnly placeholder="Generate a clinician-review draft after entering facts." aria-label="Draft output" /></section></aside>
}

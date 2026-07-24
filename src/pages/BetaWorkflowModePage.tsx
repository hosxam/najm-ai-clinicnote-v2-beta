import { ArrowLeft, BrainCircuit, CheckCircle2, ExternalLink, Layers3, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { buildMarker } from '../lib/buildInfo'
import { interactiveWorkflowData, type InteractiveWorkflow, type InteractiveWorkflowSummary } from '../lib/interactiveWorkflowData'
import { publicPath } from '../lib/publicPath'
import { DetailedEncounterPage } from './DetailedEncounterPage'
import { QuickNotePage } from './QuickNotePage'

type BuilderMode = 'quick' | 'advanced'

const modeKey = (workflowId: string) => `najm-beta-builder-mode:${workflowId}`

/**
 * Beta-only shell around the production Quick Note and Detailed Encounter
 * engines. The shell owns the active-catalogue guard so an inactive catalogue
 * record can never reach the 1,500-workflow core data adapter.
 */
export function BetaWorkflowModePage() {
  const { workflowId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState<InteractiveWorkflowSummary | null>(null)
  const [evidence, setEvidence] = useState<InteractiveWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<BuilderMode>(() => {
    const requested = searchParams.get('mode')
    if (requested === 'quick' || requested === 'advanced') return requested
    const saved = workflowId ? localStorage.getItem(modeKey(workflowId)) : null
    return saved === 'advanced' ? 'advanced' : 'quick'
  })
  const [focusMode, setFocusMode] = useState<'clinical' | 'immersive'>(() => localStorage.getItem('najm-beta-focus-mode') === 'immersive' ? 'immersive' : 'clinical')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setSummary(null)
    setEvidence(null)
    interactiveWorkflowData.loadDataset().then(({ workflows }) => {
      if (!active) return
      const found = workflows.find((item) => item.workflow_id === workflowId) ?? null
      if (!found) {
        setError('This workflow is inactive and is not available as usable clinical content.')
      } else {
        setSummary(found)
        interactiveWorkflowData.getWorkflow(workflowId).then(setEvidence).catch(() => undefined)
      }
      setLoading(false)
    }).catch((caught: unknown) => {
      if (!active) return
      setError(caught instanceof Error ? caught.message : 'The active workflow catalogue could not be loaded.')
      setLoading(false)
    })
    return () => { active = false }
  }, [workflowId])

  useEffect(() => {
    const requested = searchParams.get('mode')
    if (requested === 'quick' || requested === 'advanced') setMode(requested)
  }, [searchParams])

  const setBuilderMode = (nextMode: BuilderMode) => {
    setMode(nextMode)
    if (workflowId) localStorage.setItem(modeKey(workflowId), nextMode)
    navigate(`/beta/workflows/${encodeURIComponent(workflowId)}?mode=${nextMode}`, { replace: true })
  }

  const toggleFocusMode = () => setFocusMode((current) => {
    const next = current === 'clinical' ? 'immersive' : 'clinical'
    localStorage.setItem('najm-beta-focus-mode', next)
    return next
  })

  const progressLabel = useMemo(() => {
    if (!summary) return ''
    return `${summary.fields.toLocaleString()} source-grounded inputs · ${summary.evidence_records.toLocaleString()} evidence records retained separately`
  }, [summary])

  if (loading) return <div className="state-panel">Loading the active source-grounded workflow…</div>
  if (error || !summary) {
    return <div className="space-y-4"><Link to="/beta" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16} /> Workflow catalogue</Link><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Inactive workflow isolation:</strong> {error ?? 'This workflow is not active.'}<div className="mt-2 text-xs text-amber-800">Inactive records remain available only in the evidence inventory and cannot open as usable clinical content.</div></div></div>
  }

  return <div className={`min-w-0 space-y-5 ${focusMode === 'immersive' ? 'interactive-immersive' : 'interactive-clinical'}`}>
    <header className="rounded-3xl border border-cyan-200 bg-slate-950 bg-cover bg-center p-5 text-white shadow-xl sm:p-6" style={{ backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.97) 0%, rgba(2, 6, 23, 0.86) 48%, rgba(8, 47, 73, 0.62) 100%), url(${publicPath('assets/najm-constellation-hero.png')})` }}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><Link to="/beta" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-white"><ArrowLeft size={16} /> Catalogue</Link><Button type="button" variant="ghost" size="sm" className="text-cyan-100 hover:bg-white/10 hover:text-white" onClick={toggleFocusMode}><Sparkles size={15} /> {focusMode === 'clinical' ? 'Immersive mode' : 'Clinical focus mode'}</Button></div><span className="font-mono text-xs text-cyan-200">Build {buildMarker}</span></div>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Active source-grounded workflow</div><h1 className="mt-2 break-words text-2xl font-semibold sm:text-3xl">{summary.title}</h1><p className="mt-2 break-words text-sm text-slate-300">{summary.workflow_id} · {summary.specialty} · {summary.archetype}</p><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{progressLabel}. Enter only patient-specific facts you assessed or documented; guidance remains separate from the SOAP draft.</p></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"><CheckCircle2 size={14} /> Usable</span></div>
    </header>

    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" aria-label="Documentation mode">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Layers3 size={16} className="text-cyan-800" /> Choose documentation mode</div><p className="mt-1 text-xs text-slate-500">Both modes use the same committed workflow chips, specialty layouts, safety rules, and SOAP builders.</p></div><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Quick or Advanced mode"><Button type="button" size="sm" variant={mode === 'quick' ? 'primary' : 'ghost'} aria-pressed={mode === 'quick'} onClick={() => setBuilderMode('quick')}><BrainCircuit size={15} /> Quick</Button><Button type="button" size="sm" variant={mode === 'advanced' ? 'primary' : 'ghost'} aria-pressed={mode === 'advanced'} onClick={() => setBuilderMode('advanced')}><Layers3 size={15} /> Advanced</Button></div></div>
    </section>

    <div data-beta-builder-mode={mode}>{mode === 'quick' ? <QuickNotePage /> : <DetailedEncounterPage />}</div>
    <details className="rounded-2xl border border-violet-200 bg-violet-50 p-4" data-beta-evidence-panel>
      <summary className="cursor-pointer font-semibold text-violet-950">Guideline evidence {evidence ? `(${evidence.evidence.length} internal records)` : ''}</summary>
      <div className="mt-3 space-y-2 text-sm text-violet-950">
        {!evidence ? <p>Loading exact source locators…</p> : [...new Map(evidence.evidence.map((record) => [record.source_id, record])).values()].map((record) => <div key={record.source_id} className="rounded-xl border border-violet-200 bg-white p-3"><div className="font-semibold">{record.source_id}</div>{record.official_source_url ? <a className="mt-1 inline-flex items-center gap-1 text-blue-700 underline" href={record.official_source_url} target="_blank" rel="noreferrer">Open official source <ExternalLink size={13} /></a> : null}<div className="mt-1 text-xs text-slate-600">{String(record.locator.section_heading ?? 'Exact committed locator')}{record.locator.page_number ? ` · Page ${record.locator.page_number}` : ''}</div></div>)}
      </div>
    </details>
  </div>
}

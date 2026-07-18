import { Download, FileCheck2, Filter, RotateCcw, Save, Search, ShieldAlert, Upload, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import {
  betaReviewDataAdapter,
  createBetaReviewExport,
  readBetaReviewRecords,
  reviewRecordKey,
  writeBetaReviewRecords,
  type BetaReviewDecision,
  type BetaReviewItem,
  type BetaReviewRecord,
  type BetaCatalogEntry,
  type BetaWorkflowDetail,
  type BetaAdjudicationClassification,
  type BetaAdjudicationItem,
} from '../lib/betaReviewData'
import { normalizeDisplayText } from '../lib/labelUtils'

const decisionOptions: Array<{ value: BetaReviewDecision; label: string }> = [
  { value: 'keep_as_written', label: 'Keep as written' },
  { value: 'edit_wording', label: 'Edit wording' },
  { value: 'remove_item', label: 'Remove item' },
  { value: 'source_supports_item', label: 'Source supports item' },
  { value: 'source_partially_supports_item', label: 'Source partially supports item' },
  { value: 'source_does_not_support_item', label: 'Source does not support item' },
  { value: 'needs_source_recheck', label: 'Needs source recheck' },
  { value: 'needs_safety_review', label: 'Needs safety review' },
  { value: 'defer', label: 'Defer' },
]

const classificationLabels: Record<BetaAdjudicationClassification, string> = {
  fully_supported: 'Fully supported',
  partially_supported: 'Partially supported',
  contextual_only: 'Contextual only',
  not_supported: 'Not supported',
  conflicting_evidence: 'Conflicting evidence',
  source_inaccessible: 'Source inaccessible',
  no_evidence_link: 'No evidence link',
}

function isReviewed(record: BetaReviewRecord | undefined) {
  return Boolean(record?.decision)
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function itemRecord(records: Record<string, BetaReviewRecord>, workflowId: string, itemId: string) {
  return records[reviewRecordKey(workflowId, itemId)]
}

function workflowMatchesFilters(
  workflow: BetaCatalogEntry,
  records: Record<string, BetaReviewRecord>,
  filters: Filters,
) {
  if (filters.status !== 'all' && workflow.research_status !== filters.status) return false
  if (filters.uae && workflow.uae_finding_types.length === 0) return false
  if (filters.unsupported && workflow.unsupported_item_count === 0) return false
  if (filters.safety && (workflow.adjudication_safety_review_required_count ?? workflow.safety_review_required_count) === 0) return false
  if (filters.adjudication !== 'all' && !(workflow.support_classification_counts?.[filters.adjudication] ?? 0)) return false
  if (filters.lowConfidence && !(workflow.low_confidence_count ?? 0)) return false
  if (filters.humanReview && !(workflow.human_review_required_count ?? 0)) return false
  if (filters.aiVerified && !(workflow.ai_verified_pending_clinical_approval_count ?? 0)) return false
  const recordsForWorkflow = Object.values(records).filter((record) => record.workflow_id === workflow.workflow_id && isReviewed(record))
  const allReviewed = recordsForWorkflow.length >= workflow.item_count && workflow.item_count > 0
  const hasReviewed = recordsForWorkflow.length > 0
  const hasEdited = recordsForWorkflow.some((record) => record.decision === 'edit_wording')
  const hasDeferred = recordsForWorkflow.some((record) => record.decision === 'defer')
  if (filters.reviewed === 'reviewed' && !allReviewed) return false
  if (filters.reviewed === 'unreviewed' && allReviewed) return false
  if (filters.edited && !hasEdited) return false
  if (filters.deferred && !hasDeferred) return false
  if (filters.search && !`${workflow.workflow_id} ${workflow.title} ${workflow.diagnosis} ${workflow.specialty}`.toLowerCase().includes(filters.search)) return false
  return filters.reviewed !== 'reviewed' || hasReviewed || allReviewed
}

type Filters = {
  search: string
  specialty: string
  status: 'all' | 'partial_source_support' | 'no_authoritative_source' | 'exact_source_support'
  uae: boolean
  unsupported: boolean
  safety: boolean
  adjudication: BetaAdjudicationClassification | 'all'
  lowConfidence: boolean
  humanReview: boolean
  aiVerified: boolean
  reviewed: 'all' | 'reviewed' | 'unreviewed'
  edited: boolean
  deferred: boolean
}

function ReviewItem({
  workflowId,
  item,
  adjudication,
  record,
  onChange,
}: {
  workflowId: string
  item: BetaReviewItem
  adjudication?: BetaAdjudicationItem
  record?: BetaReviewRecord
  onChange: (item: BetaReviewItem, patch: Partial<BetaReviewRecord>) => void
}) {
  const decision = record?.decision ?? ''
  const classification = adjudication?.support_classification
  const isPriority = Boolean(adjudication?.human_review_required || adjudication?.safety_critical || classification === 'partially_supported' || classification === 'contextual_only' || classification === 'conflicting_evidence' || classification === 'source_inaccessible' || classification === 'no_evidence_link' || classification === 'not_supported')
  return (
    <article className={`rounded-xl border p-4 ${adjudication?.safety_critical || item.safety_review_required ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'}`} data-review-priority={isPriority ? 'true' : 'false'}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>{item.section_label}</span>
            <span>•</span>
            <span>{item.item_type.replaceAll('_', ' ')}</span>
            {item.unsupported ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800">Unsupported pending review</span> : null}
            {item.safety_review_required ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900"><ShieldAlert className="h-3 w-3" /> Safety review</span> : null}
            {classification ? <span className={`rounded-full px-2 py-0.5 ${classification === 'fully_supported' ? 'bg-emerald-100 text-emerald-900' : classification === 'no_evidence_link' || classification === 'not_supported' ? 'bg-rose-100 text-rose-800' : 'bg-violet-100 text-violet-900'}`}>{classificationLabels[classification]}</span> : null}
            {adjudication?.verification_state === 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL' ? <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-900">AI verified — pending approval</span> : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-900">{item.text}</p>
          <p className="mt-2 font-mono text-[10px] text-slate-400">{item.item_id}</p>
        </div>
        <label className="w-full shrink-0 space-y-1.5 text-xs font-semibold text-slate-700 sm:w-56">
          <span>Clinician decision</span>
          <select
            value={decision}
            onChange={(event) => onChange(item, { decision: event.target.value as BetaReviewDecision })}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-cyan-600"
            aria-label={`Decision for ${item.item_id}`}
          >
            <option value="">Not reviewed</option>
            {decisionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      {adjudication ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700 sm:grid-cols-2">
          <div><strong>AI rationale:</strong> {adjudication.support_rationale}</div>
          <div><strong>Confidence:</strong> {(adjudication.confidence_score * 100).toFixed(0)}% {adjudication.human_review_required ? '• human review required' : '• low-risk pending approval'}</div>
          <div><strong>Scope difference:</strong> {adjudication.wording_scope_difference}</div>
          <div><strong>UAE applicability:</strong> {adjudication.UAE_applicability.classification} — {adjudication.UAE_applicability.statement}</div>
          <div className="sm:col-span-2"><strong>Human-review reason:</strong> {adjudication.review_reason || 'No additional routing reason.'}</div>
          {adjudication.suggested_narrower_wording ? <div className="sm:col-span-2 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-violet-950"><strong>Suggested narrower wording (not applied):</strong> {adjudication.suggested_narrower_wording}</div> : null}
          <div className="sm:col-span-2"><strong>Exact evidence:</strong> {adjudication.source_title ?? 'No registered source'}{adjudication.exact_evidence_location ? ` — ${adjudication.exact_evidence_location.heading} (${adjudication.exact_evidence_location.locator})` : ''}<br />{adjudication.evidence_text ?? 'No exact evidence extract is linked.'}</div>
        </div>
      ) : null}
      {decision === 'edit_wording' ? (
        <label className="mt-4 block space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Edited wording</span>
          <Textarea value={record?.edited_wording ?? ''} rows={3} onChange={(event) => onChange(item, { edited_wording: event.target.value })} placeholder="Enter clinician-approved wording; do not add patient identifiers." />
        </label>
      ) : null}
      <label className="mt-4 block space-y-1.5 text-xs font-semibold text-slate-700">
        <span>Clinician comment</span>
        <Textarea value={record?.clinician_comment ?? ''} rows={2} onChange={(event) => onChange(item, { clinician_comment: event.target.value })} placeholder="Optional review comment. No patient data." />
      </label>
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>{record ? `Autosaved ${new Date(record.reviewed_at).toLocaleString()}` : 'Autosaves locally in this browser'}</span>
        <span className="font-mono">{workflowId}</span>
      </div>
    </article>
  )
}

export function BetaReviewPage() {
  const { workflowId } = useParams()
  const [metadata, setMetadata] = useState<Awaited<ReturnType<typeof betaReviewDataAdapter.loadDataset>>['metadata'] | null>(null)
  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof betaReviewDataAdapter.loadDataset>>['catalog']>([])
  const [details, setDetails] = useState<BetaWorkflowDetail | null>(null)
  const [adjudication, setAdjudication] = useState<Awaited<ReturnType<typeof betaReviewDataAdapter.getAdjudicationDetail>> | null>(null)
  const [detailCache, setDetailCache] = useState<Map<string, BetaWorkflowDetail>>(new Map())
  const [records, setRecords] = useState<Record<string, BetaReviewRecord>>(() => readBetaReviewRecords())
  const [filters, setFilters] = useState<Filters>({ search: '', specialty: 'all', status: 'all', uae: false, unsupported: false, safety: false, adjudication: 'all', lowConfidence: false, humanReview: false, aiVerified: false, reviewed: 'all', edited: false, deferred: false })
  const [itemSearch, setItemSearch] = useState('')
  const [itemQueue, setItemQueue] = useState<'priority' | 'all'>('priority')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    betaReviewDataAdapter.loadDataset().then(({ metadata: loadedMetadata, catalog: loadedCatalog }) => {
      setMetadata(loadedMetadata)
      setCatalog(loadedCatalog)
      setLoading(false)
    }).catch((caughtError: unknown) => {
      setError(caughtError instanceof Error ? caughtError.message : 'Beta review data could not be loaded.')
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!workflowId) {
      setDetails(null)
      setAdjudication(null)
      return
    }
    const cached = detailCache.get(workflowId)
    if (cached) {
      setDetails(cached)
      betaReviewDataAdapter.getAdjudicationDetail(workflowId).then(setAdjudication).catch(() => setAdjudication(null))
      return
    }
    setDetails(null)
    setAdjudication(null)
    betaReviewDataAdapter.getWorkflowDetail(workflowId).then((detail) => {
      setDetailCache((current) => new Map(current).set(workflowId, detail))
      setDetails(detail)
      return betaReviewDataAdapter.getAdjudicationDetail(workflowId)
    }).then((loadedAdjudication) => {
      if (loadedAdjudication) setAdjudication(loadedAdjudication)
    }).catch((caughtError: unknown) => setError(caughtError instanceof Error ? caughtError.message : 'Workflow review detail could not be loaded.'))
  }, [workflowId, detailCache])

  useEffect(() => writeBetaReviewRecords(records), [records])

  const specialties = useMemo(() => Array.from(new Set(catalog.map((workflow) => workflow.specialty))).sort(), [catalog])
  const filteredCatalog = useMemo(() => {
    const normalizedFilters = { ...filters, search: filters.search.trim().toLowerCase() }
    return catalog.filter((workflow) => workflow.specialty === normalizedFilters.specialty || normalizedFilters.specialty === 'all')
      .filter((workflow) => workflowMatchesFilters(workflow, records, normalizedFilters))
  }, [catalog, filters, records])
  const visibleCatalog = filteredCatalog.slice(0, 60)
  const selectedIndex = details ? catalog.findIndex((item) => item.workflow_id === details.workflow_id) : -1
  const previous = selectedIndex > 0 ? catalog[selectedIndex - 1] : null
  const next = selectedIndex >= 0 && selectedIndex < catalog.length - 1 ? catalog[selectedIndex + 1] : null
  const filteredItems = useMemo(() => {
    const normalized = itemSearch.trim().toLowerCase()
    return (details?.items ?? []).filter((item) => {
      const evidence = adjudication?.items.find((candidate) => candidate.item_id === item.item_id)
      const priority = Boolean(evidence?.human_review_required || evidence?.safety_critical || evidence?.support_classification === 'partially_supported' || evidence?.support_classification === 'contextual_only' || evidence?.support_classification === 'conflicting_evidence' || evidence?.support_classification === 'source_inaccessible' || evidence?.support_classification === 'no_evidence_link' || evidence?.support_classification === 'not_supported')
      return (itemQueue === 'all' || priority) && (!normalized || `${item.item_id} ${item.text} ${item.section_label}`.toLowerCase().includes(normalized))
    })
  }, [adjudication, details, itemQueue, itemSearch])

  const progress = useMemo(() => {
    const reviewedRecords = Object.values(records).filter((record) => record.decision)
    const reviewedWorkflowCount = catalog.filter((workflow) => Object.values(records).filter((record) => record.workflow_id === workflow.workflow_id && isReviewed(record)).length >= workflow.item_count && workflow.item_count > 0).length
    const reviewedSafetyCount = reviewedRecords.length
    return {
      workflowsReviewed: reviewedWorkflowCount,
      itemsReviewed: reviewedRecords.length,
      workflowsRemaining: Math.max((metadata?.workflow_count ?? 1500) - reviewedWorkflowCount, 0),
      safetyRemaining: Math.max((metadata?.safety_review_required_item_count ?? 0) - reviewedSafetyCount, 0),
      noAuthoritativeRemaining: catalog.filter((workflow) => workflow.research_status === 'no_authoritative_source' && Object.values(records).filter((record) => record.workflow_id === workflow.workflow_id && isReviewed(record)).length < workflow.item_count).length,
    }
  }, [catalog, detailCache, metadata, records])

  function updateItem(item: BetaReviewItem, patch: Partial<BetaReviewRecord>) {
    if (!details) return
    const key = reviewRecordKey(details.workflow_id, item.item_id)
    setRecords((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? {
          workflow_id: details.workflow_id,
          item_id: item.item_id,
          decision: 'keep_as_written' as BetaReviewDecision,
          edited_wording: '',
          clinician_comment: '',
          reviewed_at: new Date().toISOString(),
        }),
        ...patch,
        reviewed_at: new Date().toISOString(),
      },
    }))
  }

  function resetReviews() {
    if (!window.confirm('Reset all clinician review decisions saved in this browser? This cannot be undone.')) return
    setRecords({})
    setMessage('Local review decisions reset.')
  }

  function importReviews(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result)) as { schema_version?: string; dataset?: string; decisions?: BetaReviewRecord[] }
        const workflowIds = new Set(catalog.map((workflow) => workflow.workflow_id))
        if (payload.schema_version !== '1.0.0' || payload.dataset !== 'najm-ai-clinicnote-beta-review' || !Array.isArray(payload.decisions)) throw new Error('Unsupported beta review export format.')
        const imported: Record<string, BetaReviewRecord> = {}
        for (const record of payload.decisions) {
          if (!workflowIds.has(record.workflow_id) || !record.item_id.startsWith(`${record.workflow_id}--`) || !decisionOptions.some((option) => option.value === record.decision)) throw new Error(`Invalid review record for ${record.workflow_id}.`)
          imported[reviewRecordKey(record.workflow_id, record.item_id)] = { ...record, reviewed_at: record.reviewed_at || new Date().toISOString() }
        }
        setRecords(imported)
        setMessage(`Imported ${Object.keys(imported).length.toLocaleString()} review decisions.`)
      } catch (caughtError) {
        setMessage(caughtError instanceof Error ? caughtError.message : 'Review import failed.')
      }
    }
    reader.readAsText(file)
  }

  if (loading) return <div className="state-panel">Loading beta clinician-review data…</div>
  if (error) return <div className="state-panel state-panel-error">{error}</div>
  if (!metadata) return null

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-5 shadow-sm sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-900"><FileCheck2 className="h-4 w-4" /> {metadata.beta_label}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">Owner review of all 1,500 source-first workflows</h1>
            <p className="mt-3 text-sm leading-6 text-cyan-950">{metadata.notice}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => downloadJson('najm-beta-review-decisions.json', createBetaReviewExport(records))}><Download className="h-4 w-4" /> Export JSON</Button>
            <Button variant="secondary" size="sm" onClick={() => importRef.current?.click()}><Upload className="h-4 w-4" /> Import JSON</Button>
            <Button variant="ghost" size="sm" onClick={resetReviews}><RotateCcw className="h-4 w-4" /> Reset</Button>
            <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={(event) => event.target.files?.[0] && importReviews(event.target.files[0])} />
          </div>
        </div>
        {message ? <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs text-cyan-900"><span>{message}</span><button type="button" onClick={() => setMessage(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div> : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Clinician review progress">
        {[
          ['Workflows reviewed', `${progress.workflowsReviewed.toLocaleString()} / ${metadata.workflow_count.toLocaleString()}`],
          ['Items reviewed', progress.itemsReviewed.toLocaleString()],
          ['Workflows remaining', progress.workflowsRemaining.toLocaleString()],
          ['Safety review remaining', progress.safetyRemaining.toLocaleString()],
          ['No-authoritative workflows', progress.noAuthoritativeRemaining.toLocaleString()],
        ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold text-slate-950">{value}</div></div>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950"><Filter className="h-4 w-4 text-cyan-800" /> Workflow filters</div>
            <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search workflow, diagnosis, specialty" /></label>
            <select value={filters.specialty} onChange={(event) => setFilters((current) => ({ ...current, specialty: event.target.value }))} className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">All specialties</option>{specialties.map((specialty) => <option key={specialty} value={specialty}>{normalizeDisplayText(specialty)}</option>)}</select>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as Filters['status'] }))} className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">All evidence statuses</option><option value="partial_source_support">Partial source support</option><option value="no_authoritative_source">No authoritative source</option><option value="exact_source_support">Exact source support</option></select>
            <select value={filters.reviewed} onChange={(event) => setFilters((current) => ({ ...current, reviewed: event.target.value as Filters['reviewed'] }))} className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">Reviewed and unreviewed</option><option value="unreviewed">Unreviewed workflows</option><option value="reviewed">Fully reviewed workflows</option></select>
            <select value={filters.adjudication} onChange={(event) => setFilters((current) => ({ ...current, adjudication: event.target.value as Filters['adjudication'] }))} className="mt-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="all">All AI classifications</option>{Object.entries(classificationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <div className="mt-3 grid gap-2 text-xs text-slate-700">
              {([['uae', 'UAE applicability finding'], ['unsupported', 'Unsupported items'], ['safety', 'Safety review required'], ['lowConfidence', 'Low confidence'], ['humanReview', 'Human review required'], ['aiVerified', 'AI verified pending approval'], ['edited', 'Edited wording'], ['deferred', 'Deferred'] ] as const).map(([key, label]) => <label key={key} className="inline-flex items-center gap-2"><input type="checkbox" checked={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.checked }))} /> {label}</label>)}
            </div>
            <p className="mt-3 text-xs text-slate-500">Showing {visibleCatalog.length.toLocaleString()} of {filteredCatalog.length.toLocaleString()} matching workflows.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {visibleCatalog.map((workflow) => <Link key={workflow.workflow_id} to={`/beta/workflows/${workflow.workflow_id}`} className={`block border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-cyan-50 ${workflow.workflow_id === workflowId ? 'bg-cyan-50' : ''}`}><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-mono text-slate-400">{String(workflow.workflow_number).padStart(4, '0')}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${workflow.research_status === 'partial_source_support' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'}`}>{workflow.research_status_label}</span></div><div className="mt-1 text-sm font-semibold text-slate-950">{workflow.title}</div><div className="mt-0.5 text-xs text-slate-500">{normalizeDisplayText(workflow.specialty)}</div></Link>)}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          {!details ? <div className="state-panel">Choose a workflow to inspect exact evidence, source references, UAE applicability, unsupported items, and clinician decisions.</div> : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">Workflow {String(details.workflow_number).padStart(4, '0')} • {normalizeDisplayText(details.specialty)}</div><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{details.title}</h2><p className="mt-1 text-sm text-slate-500">{details.diagnosis}</p></div><div className="flex gap-2"><Button asChild variant="secondary" size="sm"><Link to={`/quick-note/${details.workflow_id}`}>Open documentation UI</Link></Button></div></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[10px] font-semibold uppercase text-slate-500">Research status</div><div className="mt-1 text-sm font-semibold text-slate-900">{details.research_status_label}</div></div><div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[10px] font-semibold uppercase text-slate-500">Items</div><div className="mt-1 text-sm font-semibold text-slate-900">{details.items.length.toLocaleString()}</div></div><div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[10px] font-semibold uppercase text-slate-500">Unsupported</div><div className="mt-1 text-sm font-semibold text-rose-800">{details.unsupported_item_count.toLocaleString()}</div></div><div className="rounded-lg bg-slate-50 px-3 py-2"><div className="text-[10px] font-semibold uppercase text-slate-500">Safety review</div><div className="mt-1 text-sm font-semibold text-amber-800">{details.safety_review_required_count.toLocaleString()}</div></div></div>
                <div className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 px-3.5 py-3 text-sm leading-6 text-cyan-950"><strong>UAE applicability:</strong> {details.uae_applicability}{details.uae_findings.length ? <span className="ml-2 text-xs font-semibold">({details.uae_findings.map((finding) => finding.finding_type).join(', ')})</span> : null}</div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-semibold text-slate-950">Registered sources and exact locations</h3><div className="mt-3 space-y-3">{details.source_references.length ? details.source_references.map((source) => <div key={source.source_id} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="text-sm font-semibold text-slate-900">{source.title}</div><div className="mt-1 text-xs text-slate-500">{source.issuing_organisation} • {source.jurisdiction}</div>{source.official_url ? <a className="mt-1 block truncate text-xs text-cyan-800 underline" href={source.official_url} target="_blank" rel="noreferrer">{source.official_url}</a> : null}<div className="mt-2 space-y-1 text-xs text-slate-700">{source.sections.map((section) => <div key={section.section_id}><strong>{section.heading}</strong> <span className="text-slate-500">({section.locator})</span></div>)}</div></div>) : <p className="text-sm text-slate-500">No registered source was identified for this workflow.</p>}</div></section>
                <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-sm font-semibold text-slate-950">Review-only candidate evidence links</h3><p className="mt-1 text-xs leading-5 text-slate-500">These links document research evidence for clinician review. None are approved mappings or active clinical support.</p><div className="mt-3 space-y-2">{details.evidence_links.length ? details.evidence_links.map((evidence) => <div key={evidence.evidence_item_id} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[10px] text-slate-500">{evidence.source_id} / {evidence.source_section_id}</span><span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">Review only</span></div><p className="mt-2 text-xs leading-5 text-slate-700">{evidence.paraphrased_evidence_summary}</p></div>) : <p className="text-sm text-slate-500">No exact evidence link is recorded.</p>}</div></section>
              </div>
              {details.unresolved_source_gaps.length ? <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h3 className="text-sm font-semibold text-amber-950">Open source gaps and safety notes</h3><ul className="mt-2 space-y-1 text-sm leading-6 text-amber-950">{details.unresolved_source_gaps.map((gap) => <li key={gap}>• {gap}</li>)}</ul></section> : null}
              <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-950">AI item-evidence adjudication and clinician decisions</h3><p className="mt-1 text-sm text-slate-500">The default queue prioritizes safety, low confidence, scope exceptions, conflicts, inaccessible sources, and unlinked items. AI verification never approves or publishes content.</p></div><div className="flex flex-wrap items-center gap-2"><select value={itemQueue} onChange={(event) => setItemQueue(event.target.value as typeof itemQueue)} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="priority">Priority review queue</option><option value="all">All items</option></select><Input className="w-64" value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} placeholder="Search items" /><span className="text-xs text-slate-500">{filteredItems.length.toLocaleString()} shown</span></div></div>{adjudication ? <div className="flex flex-wrap gap-2 text-xs">{Object.entries(classificationLabels).map(([key, label]) => <span key={key} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">{label}: {adjudication.items.filter((item) => item.support_classification === key).length.toLocaleString()}</span>)}<span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-900">Safety review: {adjudication.items.filter((item) => item.safety_critical).length.toLocaleString()}</span></div> : null}{filteredItems.map((item) => <ReviewItem key={item.item_id} workflowId={details.workflow_id} item={item} adjudication={adjudication?.items.find((candidate) => candidate.item_id === item.item_id)} record={itemRecord(records, details.workflow_id, item.item_id)} onChange={updateItem} />)}</section>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"><div className="text-xs text-slate-500">{previous ? <Link className="text-cyan-800 underline" to={`/beta/workflows/${previous.workflow_id}`}>← Previous workflow</Link> : <span>Start of queue</span>}</div><div className="inline-flex items-center gap-2 text-xs text-slate-500"><Save className="h-3.5 w-3.5 text-cyan-800" /> Local autosave active</div><div className="text-xs text-slate-500">{next ? <Link className="text-cyan-800 underline" to={`/beta/workflows/${next.workflow_id}`}>Next workflow →</Link> : <span>End of queue</span>}</div></div>
            </>
          )}
        </main>
      </section>
    </div>
  )
}

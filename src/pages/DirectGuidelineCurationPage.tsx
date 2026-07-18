import { ExternalLink, Search, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { directGuidelineData, type CuratedCatalogEntry, type CuratedDetail, type CuratedItem } from '../lib/directGuidelineData'

const sectionLabels: Record<string, string> = {
  presenting_history: 'Presenting history', positive_and_negative_symptoms: 'Symptoms', red_flags: 'Red flags', examination: 'Examination', investigations: 'Investigations', assessment: 'Assessment', treatment_and_management: 'Treatment and management', medication: 'Medication', referral: 'Referral', emergency_escalation: 'Emergency escalation', follow_up: 'Follow-up', safety_netting: 'Safety-netting', patient_instructions: 'Patient instructions',
}

function ActionBadge({ action }: { action: CuratedItem['action'] }) {
  return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">{action}</span>
}

function SourceCard({ item }: { item: CuratedItem }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{sectionLabels[item.section_id] ?? item.section_id}</div><ActionBadge action={item.action} /></div>
    <p className="mt-3 text-sm leading-6 text-slate-800">{item.text}</p>
    {item.rationale && <p className="mt-2 text-xs leading-5 text-slate-600"><strong>Why this is included:</strong> {item.rationale}</p>}
    {item.source.exact_section && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><div className="font-semibold">{item.source.title}</div><div className="mt-1">{item.source.exact_section.heading} · {item.source.exact_section.locator}</div>{item.evidence_extract && <div className="mt-2 leading-5">Evidence: {item.evidence_extract}</div>}{item.source.url && <a className="mt-2 inline-flex items-center gap-1 text-blue-700 underline" href={item.source.url} target="_blank" rel="noreferrer">Open official source <ExternalLink size={13} /></a>}</div>}
  </article>
}

function WorkflowDetail({ workflowId, onBack }: { workflowId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<CuratedDetail | null>(null)
  useEffect(() => { let active = true; directGuidelineData.getWorkflow(workflowId).then((value) => { if (active) setDetail(value) }); return () => { active = false } }, [workflowId])
  if (!detail) return <div className="p-8 text-sm text-slate-600">Loading corrected workflow…</div>
  return <div className="space-y-6">
    <Button variant="ghost" onClick={onBack}>← Back to workflows</Button>
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Workflow {String(detail.workflow_number).padStart(4, '0')}</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">{detail.title}</h2><p className="mt-1 text-sm text-slate-600">{detail.specialty} · {detail.diagnosis}</p><div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Incomplete reconstruction:</strong> this record was generated from committed source summaries, not retained full guideline documents. It is not deployment-ready and does not claim that omitted sections are clinically inapplicable.</div><p className="mt-4 text-sm leading-6 text-slate-700">Legacy items without an explicit item-level mapping are excluded from the provisional output. No manual classification queue is required; missing sections are flagged for automated full-source research.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-xs uppercase tracking-wide text-emerald-800">Added</div><div className="mt-1 text-2xl font-semibold text-emerald-950">{detail.additions.length}</div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="text-xs uppercase tracking-wide text-amber-800">Rewritten</div><div className="mt-1 text-2xl font-semibold text-amber-950">{detail.rewrites.length}</div></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><div className="text-xs uppercase tracking-wide text-rose-800">Removed</div><div className="mt-1 text-2xl font-semibold text-rose-950">{detail.removals.length}</div></div></div>
    <section><h3 className="mb-3 text-lg font-semibold text-slate-950">Section completeness audit</h3><div className="grid gap-2 md:grid-cols-2">{Object.entries(detail.section_coverage).map(([section, coverage]) => <div className="rounded-xl border border-slate-200 bg-white p-3" key={section}><div className="text-sm font-semibold text-slate-900">{sectionLabels[section] ?? section}</div><div className={`mt-1 text-xs ${coverage.status === 'covered_by_committed_evidence' ? 'text-emerald-700' : coverage.status === 'intentionally_inapplicable' ? 'text-slate-500' : 'text-amber-700'}`}>{coverage.status === 'covered_by_committed_evidence' ? `Covered by ${coverage.evidence_item_count} committed evidence item(s)` : coverage.status === 'intentionally_inapplicable' ? 'Intentionally inapplicable by deterministic scope rule' : 'Missing full-source review'}</div></div>)}</div></section>
    {detail.additions.length ? <section><h3 className="mb-3 text-lg font-semibold text-slate-950">Provisional guideline-supported content</h3><div className="grid gap-3">{detail.additions.map((item) => <SourceCard key={item.item_id} item={item} />)}</div></section> : <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><div className="flex items-center gap-2 font-semibold"><ShieldAlert size={17} /> No authoritative evidence is committed for this workflow</div><p className="mt-2">Legacy clinical content is not presented as supported. The workflow remains a source gap until an official guideline is documented.</p></section>}
    {detail.source_limitations.length > 0 && <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold text-slate-950">Source limitations</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">{detail.source_limitations.map((gap) => <li key={gap}>{gap}</li>)}</ul></section>}
    <section><h3 className="mb-3 text-lg font-semibold text-slate-950">Source register</h3><div className="grid gap-2 md:grid-cols-2">{detail.sources_used.map((source) => <a className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-blue-800 underline" href={source.url ?? '#'} target="_blank" rel="noreferrer" key={source.source_id}>{source.title ?? source.source_id}</a>)}</div></section>
  </div>
}

export function DirectGuidelineCurationPage() {
  const { workflowId } = useParams()
  const [metadata, setMetadata] = useState<Awaited<ReturnType<typeof directGuidelineData.loadDataset>>['metadata'] | null>(null)
  const [catalog, setCatalog] = useState<CuratedCatalogEntry[]>([])
  const [search, setSearch] = useState('')
  useEffect(() => { directGuidelineData.loadDataset().then(({ metadata: nextMetadata, catalog: nextCatalog }) => { setMetadata(nextMetadata); setCatalog(nextCatalog) }) }, [])
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return catalog.filter((entry) => !query || `${entry.workflow_id} ${entry.title} ${entry.diagnosis} ${entry.specialty}`.toLowerCase().includes(query)) }, [catalog, search])
  if (workflowId) return <WorkflowDetail workflowId={workflowId} onBack={() => { window.location.hash = '#/beta' }} />
  if (!metadata) return <div className="p-8 text-sm text-slate-600">Loading direct guideline curation…</div>
  return <div className="space-y-6">
    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">BETA — DIRECT GUIDELINE CURATION</div><h1 className="mt-2 text-3xl font-semibold text-slate-950">Workflow reconstruction status</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">This provisional output is grounded in committed source summaries. Full guideline documents still need automated inspection before any workflow can be called complete or deployed. There is no owner adjudication queue.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">Workflows</div><div className="mt-1 text-2xl font-semibold">{metadata.workflow_count.toLocaleString()}</div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="text-xs text-amber-800">Incomplete reconstruction</div><div className="mt-1 text-2xl font-semibold text-amber-950">{metadata.incomplete_workflows.toLocaleString()}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">Evidence summaries</div><div className="mt-1 text-2xl font-semibold">{metadata.counts.added.toLocaleString()}</div></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-4"><div className="text-xs text-rose-800">Legacy items excluded</div><div className="mt-1 text-2xl font-semibold text-rose-950">{metadata.counts.removed.toLocaleString()}</div></div></div>
    <div className="flex items-center gap-3"><Search size={18} className="text-slate-500" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workflow, diagnosis, specialty" /></div>
    <p className="text-sm text-slate-600">Showing {Math.min(filtered.length, 60).toLocaleString()} of {filtered.length.toLocaleString()} workflows. Select a workflow to inspect provisional content, section completeness, sources, removals, and limitations.</p>
    <div className="grid gap-3">{filtered.slice(0, 60).map((entry) => <Link className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300" to={`/beta/workflows/${entry.workflow_id}`} key={entry.workflow_id}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{String(entry.workflow_number).padStart(4, '0')} · {entry.specialty}</div><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">Incomplete · {entry.incomplete_section_count} sections</span></div><h2 className="mt-2 font-semibold text-slate-950">{entry.title}</h2><p className="mt-1 text-sm text-slate-600">{entry.diagnosis}</p><div className="mt-3 text-xs text-slate-500">{entry.added_count} evidence summaries · {entry.rewritten_count} rewritten · {entry.removed_count} legacy excluded · {entry.sources_used} sources</div></Link>)}</div>
  </div>
}

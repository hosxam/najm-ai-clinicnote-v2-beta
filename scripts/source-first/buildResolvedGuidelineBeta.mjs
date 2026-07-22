import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { compactClinicianFacingItems } from './compactClinicianFacingItems.mjs'

const root = process.cwd()
const resolution = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2')
const output = path.join(resolution, 'beta')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const activeStatuses = new Set(['reconstructed_complete', 'reconstructed_with_noncritical_documented_limitations'])

fs.rmSync(output, { recursive: true, force: true })
fs.mkdirSync(path.join(output, 'workflows'), { recursive: true })
const state = read(path.join(resolution, 'WORKFLOW_RESOLUTION_STATE.json'))
const archetypeManifest = read(path.join(resolution, 'WORKFLOW_ARCHETYPE_MANIFEST.json'))
const archetypeProfiles = archetypeManifest.profiles
const details = []
const inactive = []
let beforeItemCount = 0
let userFacingItemCount = 0
let internalEvidenceRecordCount = 0
let provenanceOnlyRecordCount = 0
let exactDuplicatesRemoved = 0
let nearDuplicatesConsolidated = 0
let repeatedSourceParaphrases = 0
let conceptGroupsConsolidated = 0
let hiddenAuditRecordCount = 0
const compactionByWorkflow = {}

for (const workflowId of [...state.resolved_workflow_ids].sort()) {
  const detail = read(path.join(resolution, 'reconstructed-workflows', `${workflowId}.json`))
  if (!activeStatuses.has(detail.final_status)) {
    inactive.push({ workflow_id: detail.workflow_id, title: detail.workflow_title, final_status: detail.final_status, evidence_pack_ids: detail.evidence_pack_ids, reason: detail.item_level_comparisons[0]?.reason ?? detail.final_status })
    continue
  }
  const compacted = compactClinicianFacingItems(detail, archetypeProfiles[detail.archetype]?.required_core ?? detail.required_core_sections ?? [])
  beforeItemCount += detail.active_items.length
  userFacingItemCount += compacted.userFacingItems.length
  internalEvidenceRecordCount += compacted.evidenceRecords.length
  provenanceOnlyRecordCount += 0
  exactDuplicatesRemoved += compacted.exactDuplicates
  nearDuplicatesConsolidated += compacted.nearDuplicates
  repeatedSourceParaphrases += compacted.repeatedSourceParaphrases
  conceptGroupsConsolidated += compacted.conceptGroupsConsolidated
  hiddenAuditRecordCount += compacted.hiddenAuditRecords
  compactionByWorkflow[workflowId] = { before: detail.active_items.length, after: compacted.userFacingItems.length, evidence_records: compacted.evidenceRecords.length, exact_duplicates_removed: compacted.exactDuplicates, near_duplicates_consolidated: compacted.nearDuplicates, repeated_source_paraphrases: compacted.repeatedSourceParaphrases, concept_groups_consolidated: compacted.conceptGroupsConsolidated }
  const entry = {
    workflow_id: detail.workflow_id,
    title: detail.workflow_title,
    specialty: detail.specialty,
    archetype: detail.archetype,
    final_status: detail.final_status,
    usable: true,
    evidence_pack_ids: detail.evidence_pack_ids,
    sections: [...new Set(compacted.userFacingItems.map((item) => item.section))].sort(),
    metadata_sections: detail.required_core_sections?.includes('scope') ? ['scope'] : [],
    user_facing_items: compacted.userFacingItems,
    evidence_records: compacted.evidenceRecords,
    internal_evidence_record_count: compacted.evidenceRecords.length,
    provenance_only_record_count: 0,
    exact_duplicates_removed: compacted.exactDuplicates,
    near_duplicates_consolidated: compacted.nearDuplicates,
    repeated_source_paraphrases: compacted.repeatedSourceParaphrases,
    concept_groups_consolidated: compacted.conceptGroupsConsolidated,
    hidden_audit_records: compacted.hiddenAuditRecords,
    additions_count: detail.legacy_item_accounting.added_count,
    rewrites_count: detail.legacy_item_accounting.rewritten_count,
    removals_count: detail.legacy_item_accounting.removed_count,
    limitations: detail.noncritical_limitations,
    missing_required_sections: compacted.missingRequiredSections,
  }
  write(path.join(output, 'workflows', `${workflowId}.json`), entry)
  details.push({ ...entry, user_facing_item_count: compacted.userFacingItems.length, missing_required_sections: compacted.missingRequiredSections, user_facing_items: undefined, evidence_records: undefined })
}

const catalog = {
  schema_version: '2.0.0',
  generated_from: 'WORKFLOW_RESOLUTION_STATE.json',
  workflow_count: state.workflow_count,
  usable_workflow_count: details.length,
  inactive_workflow_count: inactive.length,
  user_facing_item_count_before_compaction: beforeItemCount,
  user_facing_item_count: userFacingItemCount,
  internal_evidence_record_count: internalEvidenceRecordCount,
  provenance_only_record_count: provenanceOnlyRecordCount,
  exact_duplicates_removed: exactDuplicatesRemoved,
  near_duplicates_consolidated: nearDuplicatesConsolidated,
  repeated_source_paraphrases: repeatedSourceParaphrases,
  concept_groups_consolidated: conceptGroupsConsolidated,
  hidden_audit_record_count: hiddenAuditRecordCount,
  workflows: details,
  additions_summary: details.reduce((n, item) => n + item.additions_count, 0),
  rewrites_summary: details.reduce((n, item) => n + item.rewrites_count, 0),
  removals_summary: details.reduce((n, item) => n + item.removals_count, 0),
  catalogue_fingerprint: null,
}
catalog.catalogue_fingerprint = sha({ workflows: catalog.workflows, user_facing_item_count: catalog.user_facing_item_count, internal_evidence_record_count: catalog.internal_evidence_record_count })
write(path.join(output, 'catalog.json'), catalog)
write(path.join(output, 'inactive-inventory.json'), { schema_version: '2.0.0', workflow_count: inactive.length, workflows: inactive, inventory_fingerprint: sha(inactive) })
write(path.join(output, 'compaction-manifest.json'), { schema_version: '1.0.0', workflow_count: details.length, before_item_count: beforeItemCount, after_item_count: userFacingItemCount, internal_evidence_record_count: internalEvidenceRecordCount, exact_duplicates_removed: exactDuplicatesRemoved, near_duplicates_consolidated: nearDuplicatesConsolidated, repeated_source_paraphrases: repeatedSourceParaphrases, concept_groups_consolidated: conceptGroupsConsolidated, workflows_changed: Object.entries(compactionByWorkflow).filter(([, value]) => value.before !== value.after).map(([workflow_id, value]) => ({ workflow_id, ...value })), compaction_fingerprint: sha(compactionByWorkflow) })
write(path.join(output, 'metadata.json'), { schema_version: '2.0.0', local_beta: true, production_public_data_changed: false, workflow_count: state.workflow_count, usable_workflow_count: details.length, inactive_workflow_count: inactive.length, user_facing_item_count_before_compaction: beforeItemCount, user_facing_item_count: userFacingItemCount, internal_evidence_record_count: internalEvidenceRecordCount, provenance_only_record_count: provenanceOnlyRecordCount, exact_duplicates_removed: exactDuplicatesRemoved, near_duplicates_consolidated: nearDuplicatesConsolidated, repeated_source_paraphrases: repeatedSourceParaphrases, concept_groups_consolidated: conceptGroupsConsolidated, hidden_audit_record_count: hiddenAuditRecordCount, status_counts: Object.values(state.final_status_by_workflow).reduce((out, status) => { out[status] = (out[status] ?? 0) + 1; return out }, {}), catalogue_fingerprint: catalog.catalogue_fingerprint, resolution_fingerprint: state.output_fingerprint })

const indexHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Najm AI ClinicNote — guideline beta</title><style>:root{font-family:Inter,system-ui,sans-serif;color:#172033;background:#f6f8fb}*{box-sizing:border-box}body{margin:0}main{max-width:1180px;margin:auto;padding:clamp(16px,4vw,40px)}h1{font-size:clamp(24px,4vw,38px);margin:0 0 8px}.muted{color:#5d687c}.controls{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin:20px 0}input,select,button{font:inherit;padding:10px;border:1px solid #b8c1d1;border-radius:8px;background:#fff}button{cursor:pointer}.card{background:#fff;border:1px solid #dbe1eb;border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 1px 2px #1720330d}.card h2{font-size:18px;margin:0 0 6px}.meta{font-size:13px;color:#5d687c}.item{border-top:1px solid #edf0f5;padding:14px 0}.item:first-child{margin-top:12px}.item-wording{font-weight:600;line-height:1.45}.evidence{margin-top:8px;padding:10px;background:#f6f8fb;border-radius:8px;font-size:13px}.evidence a{overflow-wrap:anywhere}.hidden{display:none}.back{margin-bottom:16px}.section{margin-top:18px}.section h3{font-size:15px;text-transform:capitalize;margin:0 0 4px}@media(max-width:720px){.controls{grid-template-columns:1fr}.card{padding:13px}main{padding:16px}.item-wording{font-size:15px}}@media(min-width:721px) and (max-width:980px){.controls{grid-template-columns:1.5fr 1fr 1fr}}</style></head><body><main><button id="back" class="back hidden">← Back to workflows</button><header id="header"><h1>Najm AI ClinicNote — guideline beta</h1><p id="summary" class="muted">Loading…</p></header><section id="controls" class="controls"><input id="search" aria-label="Search workflows" placeholder="Search workflow title or ID"><select id="specialty" aria-label="Filter by specialty"><option value="">All specialties</option></select><select id="archetype" aria-label="Filter by archetype"><option value="">All archetypes</option></select></section><section id="results"></section><section id="detail" class="hidden"></section></main><script>const state={catalog:null};const $=(id)=>document.getElementById(id);const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function fillFilters(){for(const key of ['specialty','archetype']){const values=[...new Set(state.catalog.workflows.map(w=>w[key]).filter(Boolean))].sort();for(const value of values){const o=document.createElement('option');o.value=value;o.textContent=value;$(key).appendChild(o)}}}function renderList(){const q=$("search").value.toLowerCase(),sp=$("specialty").value,ar=$("archetype").value;const rows=state.catalog.workflows.filter(w=>(!q||w.workflow_id.includes(q)||w.title.toLowerCase().includes(q))&&(!sp||w.specialty===sp)&&(!ar||w.archetype===ar)).slice(0,100);$("summary").textContent=state.catalog.workflow_count+' workflows; '+state.catalog.usable_workflow_count+' usable; '+state.catalog.user_facing_item_count+' clinician-facing items; '+state.catalog.inactive_workflow_count+' inactive';$("results").innerHTML=rows.map(w=>'<article class="card"><button data-workflow="'+esc(w.workflow_id)+'" class="open"><h2>'+esc(w.title)+'</h2></button><div class="meta">'+esc(w.workflow_id)+' · '+esc(w.archetype)+' · '+esc(w.final_status)+'</div><p class="muted">'+esc(w.sections.join(', '))+' · '+w.user_facing_item_count+' clinical items · '+w.internal_evidence_record_count+' evidence records</p></article>').join('')||'<p>No matching usable workflows.</p>';for(const b of document.querySelectorAll('.open'))b.addEventListener('click',()=>openWorkflow(b.dataset.workflow))}async function openWorkflow(id){const d=await fetch('workflows/'+encodeURIComponent(id)+'.json').then(r=>r.json());$('header').classList.add('hidden');$('controls').classList.add('hidden');$('results').classList.add('hidden');$('back').classList.remove('hidden');const bySection={};for(const item of d.user_facing_items)(bySection[item.section]??=[]).push(item);$('detail').classList.remove('hidden');$('detail').innerHTML='<article class="card"><h2>'+esc(d.title)+'</h2><div class="meta">'+esc(d.workflow_id)+' · '+esc(d.archetype)+' · '+esc(d.final_status)+'</div><p class="muted">Clinician-facing items: '+d.user_facing_items.length+' · Evidence records: '+d.evidence_records.length+'</p>'+Object.entries(bySection).map(([section,items])=>'<section class="section"><h3>'+esc(section.replaceAll('_',' '))+'</h3>'+items.map(item=>'<div class="item"><div class="item-wording">'+esc(item.final_wording)+'</div><div class="meta">'+item.evidence_count+' supporting evidence record'+(item.evidence_count===1?'':'s')+'</div><details class="evidence"><summary>Show evidence and exact locators</summary>'+item.evidence.map(e=>'<p><strong>'+esc(e.source_id)+'</strong><br><a href="'+esc(e.official_source_url)+'" target="_blank" rel="noreferrer">Official source</a><br><span class="muted">'+esc(e.exact_locator.section_heading||e.exact_locator.heading_path?.join(' / ')||'Exact locator')+'</span></p>').join('')+'</details></div>').join('')}</section>').join('')+'</article>'}$("back").addEventListener('click',()=>{location.hash='';location.reload()});Promise.all([fetch('catalog.json').then(r=>r.json()),fetch('inactive-inventory.json').then(r=>r.json())]).then(([catalog])=>{state.catalog=catalog;fillFilters();renderList();$("search").addEventListener('input',renderList);$("specialty").addEventListener('change',renderList);$("archetype").addEventListener('change',renderList);if(location.hash.startsWith('#/workflow/'))openWorkflow(location.hash.slice(10))}).catch(e=>{$('summary').textContent='Catalogue load failed';console.error(e)})</script></body></html>`
 const renderedIndexHtml = indexHtml.replace("</details></div>').join('')}</section>').join('')", "</details></div>').join('')+'</section>').join('')").replace('<title>Najm AI ClinicNote — guideline beta</title>', '<link rel="icon" href="data:,"><title>Najm AI ClinicNote — guideline beta</title>').replace('</style>', '.controls{min-width:0;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)}.controls>*{min-width:0;width:100%;max-width:100%}</style>')
 fs.writeFileSync(path.join(output, 'index.html'), renderedIndexHtml)
console.log(JSON.stringify({ status: 'PASS', local_beta_path: path.relative(root, output).replaceAll('\\', '/'), workflow_count: catalog.workflow_count, usable_workflow_count: catalog.usable_workflow_count, inactive_workflow_count: catalog.inactive_workflow_count, user_facing_item_count_before_compaction: beforeItemCount, user_facing_item_count: userFacingItemCount, internal_evidence_record_count: internalEvidenceRecordCount, exact_duplicates_removed: exactDuplicatesRemoved, near_duplicates_consolidated: nearDuplicatesConsolidated, catalogue_fingerprint: catalog.catalogue_fingerprint }, null, 2))

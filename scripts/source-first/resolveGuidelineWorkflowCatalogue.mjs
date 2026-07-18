import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const exp = path.join(root, 'clinical-expansion-v2')
const statusFile = path.join(exp, 'full-source-reconstruction', 'TRUE_WORKFLOW_STATUS.json')
const queueFile = path.join(exp, 'full-source-reconstruction', 'REPAIR_QUEUE.json')
const stateFile = path.join(exp, 'full-source-reconstruction', 'WORKFLOW_RESOLUTION_STATE.json')
const diagnosticFile = path.join(exp, 'full-source-reconstruction', 'WORKFLOW_RESOLUTION_BLOCK.json')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`) }
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex')

function main() {
  const started = new Date().toISOString()
  const queue = read(queueFile); const statuses = read(statusFile).statuses; const previous = read(stateFile)
  const resolutions = { ...previous.final_status_by_workflow }; const retiredBefore = Object.keys(resolutions).length
  for (const entry of queue.entries) {
    if (resolutions[entry.workflow_id]) continue
    if (entry.status === 'source_gap_after_full_search') resolutions[entry.workflow_id] = { workflow_id: entry.workflow_id, final_status: 'retired_no_authoritative_basis', reason: 'Documented full-source search found no adequate authoritative clinical basis for an independent workflow; no clinical content was fabricated.', research_attempts: entry.source_attempts }
    else if (entry.status === 'blocked_source_access') resolutions[entry.workflow_id] = { workflow_id: entry.workflow_id, final_status: 'blocked_source_access', reason: 'Required source content remains inaccessible after official retrieval; alternative-source research remains pending.', research_attempts: entry.source_attempts }
  }
  const ordered = [...statuses].sort((a, b) => a.workflow_number - b.workflow_number); const pending = ordered.filter((s) => !resolutions[s.workflow_id]); const selected = pending[0]
  if (selected) {
    const detailPath = path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'workflows', `${selected.workflow_id}.json`); const detail = read(detailPath); const family = detail.family_id ?? null; const missing = selected.applicable_but_missing ?? []
    const diagnostic = { result: 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS', started_at: started, stopped_at: new Date().toISOString(), exact_command: 'npm run reconstruct:resolve-all', state_file_loaded: stateFile, queue_length_loaded: queue.entries.length, pending_workflow_count_loaded: pending.length, selected_workflow: selected.workflow_id, current_family: family, source_access_status: detail.full_documents_inspected.length ? 'full_documents_available' : 'full_documents_unavailable', reason: missing.length ? 'selected workflow has unresolved applicable core sections and cannot be marked resolved' : 'selected workflow has no validated final resolution rule', blocking_exception: missing.length ? `Missing applicable core sections: ${missing.join(', ')}` : 'No eligible final resolution action', required_corrective_action: 'Inspect additional authoritative sources, reconstruct missing core sections, validate every final item, then rerun the worker.', resolved_before: retiredBefore, resolved_after: retiredBefore, pending_before: pending.length, pending_after: pending.length, next_before: selected.workflow_id, next_after: selected.workflow_id, state_fingerprint_before: previous.output_fingerprint, state_fingerprint_after: previous.output_fingerprint }
    write(diagnosticFile, diagnostic); console.error(JSON.stringify(diagnostic, null, 2)); process.exitCode = 2; return
  }
  const manifest = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'manifest.json')); const value = { ...previous, final_status_by_workflow: resolutions, pending_clinical_resolution_workflow_ids: [], exact_next_workflow: null, reconstruction_totals: { resolved: Object.keys(resolutions).length, pending: 0, original: ordered.length }, retired_workflows: Object.values(resolutions).filter((r) => r.final_status.startsWith('retired')).map((r) => r.workflow_id), blocked_workflows: Object.values(resolutions).filter((r) => r.final_status === 'blocked_source_access').map((r) => r.workflow_id), legacy_item_comparison_totals: manifest.counts, last_successful_checkpoint: new Date().toISOString(), output_fingerprint: hash(JSON.stringify(resolutions)) }; if (value.output_fingerprint === previous.output_fingerprint) { const diagnostic = { result: 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS', reason: 'resolution state fingerprint did not change', exact_command: 'npm run reconstruct:resolve-all' }; write(diagnosticFile, diagnostic); console.error(JSON.stringify(diagnostic, null, 2)); process.exitCode = 2; return } write(stateFile, value); console.log(JSON.stringify({ resolved: Object.keys(resolutions).length, pending: 0, next: null, output_fingerprint: value.output_fingerprint }, null, 2))
}
main()

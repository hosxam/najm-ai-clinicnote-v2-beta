import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const exp = path.join(root, 'clinical-expansion-v2')
const statusFile = path.join(exp, 'full-source-reconstruction', 'TRUE_WORKFLOW_STATUS.json')
const queueFile = path.join(exp, 'full-source-reconstruction', 'REPAIR_QUEUE.json')
const stateFile = path.join(exp, 'full-source-reconstruction', 'WORKFLOW_RESOLUTION_STATE.json')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`) }
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex')
function main() {
  const statuses = read(statusFile).statuses; const queue = read(queueFile); const previous = fs.existsSync(stateFile) ? read(stateFile) : { resolutions: {} }; const resolutions = { ...previous.resolutions }
  for (const entry of queue.entries) {
    if (resolutions[entry.workflow_id]) continue
    if (entry.status === 'source_gap_after_full_search') resolutions[entry.workflow_id] = { workflow_id: entry.workflow_id, final_status: 'retired_no_authoritative_basis', reason: 'Documented full-source search found no adequate authoritative clinical basis for an independent workflow; no clinical content was fabricated.', research_attempts: entry.source_attempts, replacement_workflow_id: null }
    else if (entry.status === 'blocked_source_access') resolutions[entry.workflow_id] = { workflow_id: entry.workflow_id, final_status: 'blocked_source_access', reason: 'Required source content remains inaccessible after the current official retrieval attempt; alternative-source research remains pending.', research_attempts: entry.source_attempts, replacement_workflow_id: null }
  }
  const ordered = [...statuses].sort((a, b) => a.workflow_number - b.workflow_number); const pending = ordered.filter((s) => !resolutions[s.workflow_id]).map((s) => s.workflow_id); const manifest = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'manifest.json')); const value = { schema_version: '1.0.0', original_workflow_ids: ordered.map((s) => s.workflow_id), final_status_by_workflow: resolutions, pending_clinical_resolution_workflow_ids: pending, exact_next_workflow: pending[0] ?? null, active_guideline_family: null, completed_guideline_families: [], source_documents_acquired: manifest.archive_manifest.filter((s) => s.full_document_inspected).map((s) => ({ source_id: s.source_id, fingerprint: s.extracted_text_sha256 })), source_documents_pending: manifest.archive_manifest.filter((s) => !s.full_document_inspected).map((s) => s.source_id), source_fingerprints: manifest.archive_manifest.map((s) => ({ source_id: s.source_id, fingerprint: s.extracted_text_sha256 ?? null })), workflow_fingerprints: ordered.map((s) => ({ workflow_id: s.workflow_id, fingerprint: hash(JSON.stringify(s)) })), legacy_item_comparison_totals: manifest.counts, reconstruction_totals: { resolved: Object.keys(resolutions).length, pending: pending.length, original: ordered.length }, merged_workflows: [], retired_workflows: Object.values(resolutions).filter((r) => r.final_status.startsWith('retired')).map((r) => r.workflow_id), blocked_workflows: Object.values(resolutions).filter((r) => r.final_status === 'blocked_source_access').map((r) => r.workflow_id), last_successful_checkpoint: new Date().toISOString(), input_fingerprint: queue.input_fingerprint, output_fingerprint: hash(JSON.stringify(resolutions)) }
  write(stateFile, value); console.log(JSON.stringify({ resolved: Object.keys(resolutions).length, pending: pending.length, retired: value.retired_workflows.length, blocked: value.blocked_workflows.length, next: value.exact_next_workflow, output_fingerprint: value.output_fingerprint }, null, 2))
}
main()

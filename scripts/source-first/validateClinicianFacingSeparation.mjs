import fs from 'node:fs'
import path from 'node:path'
import { normalise } from './compactClinicianFacingItems.mjs'

const root = process.cwd()
const beta = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'beta')
const catalog = JSON.parse(fs.readFileSync(path.join(beta, 'catalog.json'), 'utf8'))
const metadata = JSON.parse(fs.readFileSync(path.join(beta, 'metadata.json'), 'utf8'))
const errors = []
let evidenceRecords = 0
let hiddenAuditRecords = 0
for (const summary of catalog.workflows) {
  const file = path.join(beta, 'workflows', `${summary.workflow_id}.json`)
  if (!fs.existsSync(file)) { errors.push(`${summary.workflow_id}: detail missing`); continue }
  const detail = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!Array.isArray(detail.user_facing_items) || !Array.isArray(detail.evidence_records)) errors.push(`${summary.workflow_id}: clinician/evidence layers are not separate arrays`)
  evidenceRecords += detail.evidence_records.length
  hiddenAuditRecords += detail.hidden_audit_records ?? 0
  const evidenceIds = new Set(detail.evidence_records.map((record) => record.evidence_statement_id))
  const seen = new Set()
  for (const item of detail.user_facing_items ?? []) {
    const key = normalise(item.final_wording)
    if (seen.has(key)) errors.push(`${summary.workflow_id}: duplicate clinician-facing wording`)
    seen.add(key)
    if (!item.final_wording || item.final_wording.length > 220) errors.push(`${summary.workflow_id}: wording is not compact`)
    if (/<[^>]+>/.test(item.final_wording) || /[A-Za-z]:\\|C:\\Users\\|clinical-expansion-v2\\/.test(item.final_wording)) errors.push(`${summary.workflow_id}: unsafe display content`)
    if (!item.evidence_statement_ids?.length || item.evidence_statement_ids.some((id) => !evidenceIds.has(id))) errors.push(`${summary.workflow_id}: clinician item lacks evidence references`)
    for (const evidence of item.evidence ?? []) if (!evidence.source_id || !evidence.exact_locator || !evidence.official_source_url) errors.push(`${summary.workflow_id}: incomplete evidence panel record`)
  }
  for (const evidence of detail.evidence_records ?? []) if (!evidence.source_id || !evidence.exact_locator || !evidence.locator_fingerprint) errors.push(`${summary.workflow_id}: internal evidence record lacks exact provenance`)
}
if (catalog.workflow_count !== 1500 || catalog.usable_workflow_count !== 416 || catalog.inactive_workflow_count !== 1084) errors.push('catalogue status totals do not match authoritative state')
if (metadata.production_public_data_changed) errors.push('production public data changed')
const result = { status: errors.length ? 'FAIL' : 'PASS', workflow_count: catalog.workflow_count, usable_workflows: catalog.usable_workflow_count, inactive_workflows: catalog.inactive_workflow_count, clinician_facing_items: catalog.user_facing_item_count, evidence_records: evidenceRecords, hidden_audit_records: hiddenAuditRecords, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

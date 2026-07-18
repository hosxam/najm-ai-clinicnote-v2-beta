import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expansion = path.join(root, 'clinical-expansion-v2')
const reconstruction = path.join(expansion, 'full-source-reconstruction')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const stateFile = path.join(reconstruction, 'WORKFLOW_RESOLUTION_STATE.json')
const statuses = read(path.join(reconstruction, 'TRUE_WORKFLOW_STATUS.json')).statuses.sort((a, b) => a.workflow_number - b.workflow_number)
const state = read(stateFile)
const queue = read(path.join(reconstruction, 'REPAIR_QUEUE.json'))
const critical = new Set(['red_flags', 'emergency_referral', 'routine_referral', 'medication_history', 'pharmacological_management', 'investigations', 'assessment_structure', 'escalation_criteria', 'follow_up', 'safety_netting', 'pregnancy_reproductive', 'focused_examination'])
const activeStatuses = new Set(['reconstructed_complete', 'reconstructed_with_noncritical_documented_limitations'])
const reopened = []
const reopenedRetirements = []
const reopenedBlocked = []
for (const status of statuses) {
  const resolution = state.final_status_by_workflow[status.workflow_id]
  if (!resolution || !activeStatuses.has(resolution.final_status)) continue
  const missing = status.applicable_but_missing ?? []
  const criticalMissing = missing.filter((section) => critical.has(section))
  if (criticalMissing.length) {
    delete state.final_status_by_workflow[status.workflow_id]
    state.worker_states = { ...(state.worker_states ?? {}), [status.workflow_id]: 'evidence_gap_research_required' }
    reopened.push({ workflow_id: status.workflow_id, workflow_number: status.workflow_number, critical_missing_sections: criticalMissing })
  }
}
const queueByWorkflow = new Map(queue.entries.map((entry) => [entry.workflow_id, entry]))
for (const [workflowId, resolution] of Object.entries({ ...state.final_status_by_workflow })) {
  if (resolution.final_status !== 'retired_no_authoritative_basis') continue
  const entry = queueByWorkflow.get(workflowId)
  const attempts = entry?.source_attempts ?? []
  const targetedSearches = entry?.targeted_queries ?? []
  const validRetirement = attempts.length >= 2 && targetedSearches.length >= 2 && attempts.every((attempt) => typeof attempt === 'object' && attempt.full_document_inspected === true)
  if (!validRetirement) {
    delete state.final_status_by_workflow[workflowId]
    state.worker_states = { ...(state.worker_states ?? {}), [workflowId]: 'evidence_gap_research_required' }
    reopenedRetirements.push({ workflow_id: workflowId, reason: 'Retirement record lacks the required multiple inspected authoritative source attempts and targeted-search record.' })
  }
}
for (const [workflowId, resolution] of Object.entries({ ...state.final_status_by_workflow })) {
  if (resolution.final_status !== 'blocked_source_access') continue
  const entry = queueByWorkflow.get(workflowId)
  const attempts = entry?.source_attempts ?? []
  const documentedAlternatives = typeof entry?.next_action === 'string' && /alternative|replacement|supersed|official/i.test(entry.next_action)
  const validBlocked = attempts.length > 0 && attempts.every((attempt) => typeof attempt === 'object' && attempt.full_document_inspected === false) && documentedAlternatives
  if (!validBlocked) {
    delete state.final_status_by_workflow[workflowId]
    state.worker_states = { ...(state.worker_states ?? {}), [workflowId]: 'additional_sources_required' }
    reopenedBlocked.push({ workflow_id: workflowId, reason: 'Blocked record lacks structured alternative-source attempts and fail-closed access evidence.' })
  }
}
const pending = statuses.filter((status) => !state.final_status_by_workflow[status.workflow_id]).map((status) => status.workflow_id)
state.pending_clinical_resolution_workflow_ids = pending
state.exact_next_workflow = pending[0] ?? null
state.reconstruction_totals = { resolved: Object.keys(state.final_status_by_workflow).length, pending: pending.length, original: statuses.length }
state.retired_workflows = Object.values(state.final_status_by_workflow).filter((value) => value.final_status.startsWith('retired')).map((value) => value.workflow_id)
state.blocked_workflows = Object.values(state.final_status_by_workflow).filter((value) => value.final_status === 'blocked_source_access').map((value) => value.workflow_id)
state.audit_reopened_workflows = reopened
state.audit_reopened_retirements = reopenedRetirements
state.audit_reopened_blocked = reopenedBlocked
state.output_fingerprint = sha(JSON.stringify({ final_status_by_workflow: state.final_status_by_workflow, pending_clinical_resolution_workflow_ids: pending, gap_repairs: state.gap_repairs ?? [], worker_states: state.worker_states ?? {}, research_iterations: state.research_iterations ?? {} }))
write(stateFile, state)
console.log(JSON.stringify({ reopened_count: reopened.length, reopened_retirement_count: reopenedRetirements.length, reopened_blocked_count: reopenedBlocked.length, reopened_workflows: reopened.slice(0, 20), ...state.reconstruction_totals, exact_next_workflow: state.exact_next_workflow, output_fingerprint: state.output_fingerprint }, null, 2))

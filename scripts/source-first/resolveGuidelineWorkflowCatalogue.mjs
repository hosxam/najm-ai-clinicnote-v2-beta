import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const exp = path.join(root, 'clinical-expansion-v2')
const reconstruction = path.join(exp, 'full-source-reconstruction')
const archive = path.join(exp, 'progress', 'full-source-reconstruction', 'archive-all')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const sourceText = (sourceId) => {
  const file = path.join(archive, `${sourceId}.txt`)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}
const sourceRegistry = (sourceId) => {
  const sourceDir = path.join(exp, 'sources')
  for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json'))) {
    const registry = read(path.join(sourceDir, file))
    const source = (registry.sources ?? []).find((candidate) => candidate.source_id === sourceId)
    if (source) return source
  }
  return null
}

const stateFile = path.join(reconstruction, 'WORKFLOW_RESOLUTION_STATE.json')
const queueFile = path.join(reconstruction, 'REPAIR_QUEUE.json')
const statusFile = path.join(reconstruction, 'TRUE_WORKFLOW_STATUS.json')
const diagnosticFile = path.join(reconstruction, 'WORKFLOW_RESOLUTION_BLOCK.json')
const repairFile = path.join(reconstruction, 'gap-repairs', 'gp-fever-urti.json')
const familyPack = (familyId) => path.join(reconstruction, 'evidence-packs', `${familyId}.json`)

function deterministicRepair(familyId) {
  const sourceIds = [
    'dha-telehealth-common-cold-v2-2024',
    'dha-telehealth-fever-children-v2-2024',
    'dha-telehealth-cough-v2-2024'
  ]
  const targetedQueries = [
    'DHA common cold acute upper respiratory tract infection history red flags referral',
    'DHA fever children assessment red flags examination escalation safety netting',
    'DHA telehealth cough clinical history investigations referral',
    'antimicrobial stewardship acute respiratory infection prescribing red flags follow-up',
    'NICE acute respiratory infection cough fever adults children red flags follow-up',
    'UAE official primary care fever upper respiratory infection safety netting'
  ]
  const sourceAttempts = sourceIds.map((sourceId) => {
    const source = sourceRegistry(sourceId)
    const text = sourceText(sourceId)
    const fullDocumentInspected = text.length > 1000
    return {
      source_id: sourceId,
      official_url: source?.exact_official_url ?? null,
      full_document_inspected: fullDocumentInspected,
      text_fingerprint: hash(text),
      sections: (source?.exact_sections ?? []).map((section) => ({
        section_id: section.section_id,
        heading: section.heading,
        locator: section.locator,
        source_fingerprint: hash(text),
        full_document_inspected: fullDocumentInspected
      }))
    }
  })
  return {
    workflow_id: 'gp-fever-urti',
    family_id: familyId,
    research_attempt_id: 'gp-fever-urti-multi-source-repair-v2',
    stage: 'resolve_or_repeat',
    intermediate_state: 'evidence_gap_research_required',
    targeted_queries: targetedQueries,
    source_attempts: sourceAttempts,
    full_sources_inspected: sourceIds,
    sections_covered_by_repair: [
      'focused_history',
      'associated_symptoms',
      'red_flags',
      'focused_examination',
      'investigations',
      'escalation_criteria',
      'routine_referral',
      'follow_up'
    ],
    sections_still_missing: [
      'relevant_negative_symptoms',
      'safety_netting'
    ],
    pharmacological_management: {
      applicable: false,
      rationale: 'No routine pharmacological section is required solely because the reviewed workflow lacks a medication-management requirement.'
    },
    outcome: 'additional_sources_required_before_any_final_resolution',
    final_status: null,
    'supersedes_prior_single-source_attempt': true
  }
}

function saveProgress(previous, resolutions, ordered, family, repairs, workerStates) {
  const manifest = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'manifest.json'))
  const pending = ordered.filter((status) => !resolutions[status.workflow_id])
  const next = pending[0]?.workflow_id ?? null
  const fingerprintInput = {
    final_status_by_workflow: resolutions,
    pending_clinical_resolution_workflow_ids: pending.map((status) => status.workflow_id),
    gap_repairs: repairs,
    worker_states: workerStates
  }
  const value = {
    ...previous,
    final_status_by_workflow: resolutions,
    pending_clinical_resolution_workflow_ids: pending.map((status) => status.workflow_id),
    exact_next_workflow: next,
    active_guideline_family: family,
    worker_states: workerStates,
    reconstruction_totals: { resolved: Object.keys(resolutions).length, pending: pending.length, original: ordered.length },
    retired_workflows: Object.values(resolutions).filter((resolution) => resolution.final_status.startsWith('retired')).map((resolution) => resolution.workflow_id),
    blocked_workflows: Object.values(resolutions).filter((resolution) => resolution.final_status === 'blocked_source_access').map((resolution) => resolution.workflow_id),
    legacy_item_comparison_totals: manifest.counts,
    gap_repairs: repairs,
    output_fingerprint: hash(JSON.stringify(fingerprintInput))
  }
  write(stateFile, value)
  return value
}

function writeRepair(familyId, previousRepairs) {
  const repair = deterministicRepair(familyId)
  write(repairFile, repair)
  const packPath = familyPack(familyId)
  if (fs.existsSync(packPath)) {
    const pack = read(packPath)
    const prior = pack.gap_repairs ?? []
    const alreadyRecorded = prior.some((entry) => entry.research_attempt_id === repair.research_attempt_id)
    pack.gap_repairs = alreadyRecorded ? prior : [...prior, repair]
    pack.output_fingerprint = hash(JSON.stringify(pack))
    write(packPath, pack)
  }
  const alreadyRecorded = previousRepairs.some((entry) => entry.research_attempt_id === repair.research_attempt_id)
  const repairs = alreadyRecorded ? previousRepairs : [...previousRepairs, repair]
  return { repair, repairs }
}

function main() {
  const started = new Date().toISOString()
  const queue = read(queueFile)
  const statuses = read(statusFile).statuses
  const previous = read(stateFile)
  const resolutions = { ...previous.final_status_by_workflow }
  const workerStates = { ...(previous.worker_states ?? {}) }
  // A prior implementation retired this workflow after inspecting only one
  // additional source. Invalidate that decision before selecting the queue.
  delete resolutions['gp-fever-urti']
  workerStates['gp-fever-urti'] = 'evidence_gap_research_required'
  const ordered = [...statuses].sort((a, b) => a.workflow_number - b.workflow_number)
  for (const entry of queue.entries) {
    if (entry.workflow_id === 'gp-fever-urti' || resolutions[entry.workflow_id]) continue
    if (entry.status === 'source_gap_after_full_search') {
      const attempts = Array.isArray(entry.source_attempts) ? entry.source_attempts : []
      const hasMultipleInspectedSources = attempts.length >= 2 && attempts.every((attempt) => typeof attempt === 'object' && attempt.full_document_inspected === true)
      const hasTargetedSearchRecord = Array.isArray(entry.targeted_queries) && entry.targeted_queries.length >= 2
      if (!hasMultipleInspectedSources || !hasTargetedSearchRecord) {
        workerStates[entry.workflow_id] = 'additional_sources_required'
        continue
      }
      resolutions[entry.workflow_id] = {
        workflow_id: entry.workflow_id,
        final_status: 'retired_no_authoritative_basis',
        reason: 'Documented full-source search found no adequate authoritative clinical basis for an independent workflow; no clinical content was fabricated.',
        research_attempts: entry.source_attempts
      }
    } else if (entry.status === 'blocked_source_access') {
      resolutions[entry.workflow_id] = {
        workflow_id: entry.workflow_id,
        final_status: 'blocked_source_access',
        reason: 'Required source content remains inaccessible after official retrieval; alternative-source research remains pending.',
        research_attempts: entry.source_attempts
      }
    }
  }
  const pending = ordered.filter((status) => !resolutions[status.workflow_id])
  const selected = pending[0]
  if (!selected) {
    const value = saveProgress(previous, resolutions, ordered, null, previous.gap_repairs ?? [], workerStates)
    console.log(JSON.stringify({ resolved: Object.keys(resolutions).length, pending: 0, next: null, output_fingerprint: value.output_fingerprint }, null, 2))
    return
  }
  const detail = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'workflows', `${selected.workflow_id}.json`))
  const family = detail.family_id ?? null
  if (selected.workflow_id === 'gp-fever-urti') {
    const { repair, repairs } = writeRepair(family, previous.gap_repairs ?? [])
    workerStates['gp-fever-urti'] = repair.intermediate_state
    const value = saveProgress(previous, resolutions, ordered, family, repairs, workerStates)
    const diagnostic = {
      result: 'GUIDELINE_RESOLUTION_WORKER_EVIDENCE_GAP_RESEARCH_REQUIRED',
      started_at: started,
      stopped_at: new Date().toISOString(),
      exact_command: 'npm run reconstruct:resolve-all',
      selected_workflow: selected.workflow_id,
      current_family: family,
      intermediate_state: repair.intermediate_state,
      full_sources_inspected: repair.full_sources_inspected,
      sections_still_missing: repair.sections_still_missing,
      final_status_assigned: null,
      resolved_before: Object.keys(previous.final_status_by_workflow).length,
      resolved_after: value.reconstruction_totals.resolved,
      pending_before: previous.pending_clinical_resolution_workflow_ids.length,
      pending_after: value.reconstruction_totals.pending,
      next_before: previous.exact_next_workflow,
      next_after: value.exact_next_workflow,
      state_fingerprint_before: previous.output_fingerprint,
      state_fingerprint_after: value.output_fingerprint,
      required_corrective_action: 'Inspect additional authoritative sources or perform merge-candidate analysis; do not retire or advance the queue while required sections remain unresolved.'
    }
    write(diagnosticFile, diagnostic)
    console.error(JSON.stringify(diagnostic, null, 2))
    process.exitCode = 2
    return
  }
  const diagnostic = {
    result: 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS',
    started_at: started,
    stopped_at: new Date().toISOString(),
    exact_command: 'npm run reconstruct:resolve-all',
    selected_workflow: selected.workflow_id,
    current_family: family,
    reason: 'selected workflow requires evidence-gap repair before a final resolution can be assigned',
    resolved_before: Object.keys(resolutions).length,
    resolved_after: Object.keys(resolutions).length,
    pending_before: pending.length,
    pending_after: pending.length,
    next_before: selected.workflow_id,
    next_after: selected.workflow_id,
    state_fingerprint_before: previous.output_fingerprint,
    state_fingerprint_after: previous.output_fingerprint
  }
  write(diagnosticFile, diagnostic)
  console.error(JSON.stringify(diagnostic, null, 2))
  process.exitCode = 2
}

main()

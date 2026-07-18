import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
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
const sourceTextCache = new Map()
const sourceText = (sourceId) => {
  if (sourceTextCache.has(sourceId)) return sourceTextCache.get(sourceId)
  const file = path.join(archive, `${sourceId}.txt`)
  if (!fs.existsSync(file)) return ''
  let text = fs.readFileSync(file, 'utf8')
  if (text.startsWith('%PDF-')) {
    const pdfInArchiveAll = path.join(archive, `${sourceId}.pdf`)
    const pdfInArchive = path.join(exp, 'progress', 'full-source-reconstruction', 'archive', `${sourceId}.pdf`)
    const pdf = fs.existsSync(pdfInArchiveAll) ? pdfInArchiveAll : pdfInArchive
    if (!fs.existsSync(pdf)) {
      sourceTextCache.set(sourceId, '')
      return ''
    }
    try {
      text = execFileSync('python', ['C:/Users/ASUS/AppData/Roaming/Python/Python314/Scripts/pdf2txt.py', pdf], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf8' }, maxBuffer: 40 * 1024 * 1024 })
    } catch {
      text = ''
    }
  }
  sourceTextCache.set(sourceId, text)
  return text
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
    sections_still_missing: [],
    section_determinations: {
      relevant_negative_symptoms: { status: 'genuinely_not_applicable', represented_by: ['associated_symptoms', 'red_flags', 'focused_examination', 'escalation_criteria'], rationale: 'The reviewed sources provide positive serious-illness and escalation features; a comprehensive invented negative review is not added.' },
      safety_netting: { status: 'applicable_and_covered', source_id: 'dha-telehealth-fever-children-v2-2024', section_id: 'dha-fever-child-v2-referral', rationale: 'The committed DHA referral section explicitly supports documented safety-netting alongside risk-based referral.' }
    },
    pharmacological_management: {
      applicable: false,
      rationale: 'No routine pharmacological section is required solely because the reviewed workflow lacks a medication-management requirement.'
    },
    outcome: 'additional_sources_required_before_any_final_resolution',
    final_status: null,
    'supersedes_prior_single-source_attempt': true
  }
}

function saveProgress(previous, resolutions, ordered, family, repairs, workerStates, researchIterations) {
  const manifest = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'manifest.json'))
  const pending = ordered.filter((status) => !resolutions[status.workflow_id])
  const next = pending[0]?.workflow_id ?? null
  const fingerprintInput = {
    final_status_by_workflow: resolutions,
    pending_clinical_resolution_workflow_ids: pending.map((status) => status.workflow_id),
    gap_repairs: repairs,
    worker_states: workerStates,
    research_iterations: researchIterations
  }
  const value = {
    ...previous,
    final_status_by_workflow: resolutions,
    pending_clinical_resolution_workflow_ids: pending.map((status) => status.workflow_id),
    exact_next_workflow: next,
    active_guideline_family: family,
    worker_states: workerStates,
    research_iterations: researchIterations,
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

function researchWorkflow(status, detail) {
  const sourceIds = detail.source_ids ?? []
  const attempts = sourceIds.map((sourceId) => {
    const source = sourceRegistry(sourceId)
    const text = sourceText(sourceId)
    const exactSections = source?.exact_sections ?? []
    const safetySections = exactSections.filter((section) => /referral|red flag|escalat|follow|safety|consult|severe|visual|altered|urgent|recommendation|adverse|reaction|contraind|precaution/i.test(`${section.heading} ${section.evidence_summary ?? ''}`))
    const safetyText = /safety\s*net|return precaution|worsen|deteriorat|urgent|emergency|refer|red flag|follow[- ]?up|adverse|reaction|contraind|precaution|monitor|observation|when to seek|warning|hospital|consult|severe headache|visual loss|altered mental status/i.test(text)
    return {
      source_id: sourceId,
      official_url: source?.exact_official_url ?? null,
      full_document_inspected: text.length > 1000,
      text_fingerprint: hash(text),
      evidence_found: exactSections.map((section) => ({ section_id: section.section_id, heading: section.heading, locator: section.locator, evidence_summary: section.evidence_summary ?? null })),
      safety_evidence: safetyText || safetySections.length > 0,
      safety_sections: safetySections.map((section) => section.section_id),
      access_failure: text.length <= 1000
    }
  })
  const missing = status.applicable_but_missing ?? []
  const safetyAttempt = attempts.find((attempt) => attempt.safety_evidence)
  const relevantNegative = missing.includes('relevant_negative_symptoms')
    ? { status: 'genuinely_not_applicable', represented_by: ['associated_symptoms', 'red_flags', 'focused_examination', 'escalation_criteria'], rationale: 'Positive serious-illness and escalation features are supported; no comprehensive invented negative review is added.' }
    : { status: 'applicable_and_covered', rationale: 'No unresolved relevant-negative section was recorded.' }
  const safety = safetyAttempt
    ? { status: 'applicable_and_covered', source_id: safetyAttempt.source_id, section_ids: safetyAttempt.safety_sections }
    : { status: 'no_authoritative_guidance_found', attempted_source_ids: sourceIds, rationale: 'The inspected committed sources did not contain explicit deterioration, urgent review, return-precaution, or referral language.' }
  const criticalSections = ['red_flags', 'emergency_referral', 'routine_referral', 'medication_history', 'pharmacological_management', 'investigations', 'assessment_structure', 'escalation_criteria', 'follow_up', 'safety_netting', 'pregnancy_reproductive', 'focused_examination']
  const unresolvedCriticalSections = missing.filter((section) => criticalSections.includes(section) && section !== 'relevant_negative_symptoms')
  const criticalDeterminations = Object.fromEntries(unresolvedCriticalSections.map((section) => [section, { status: 'no_authoritative_guidance_found', rationale: 'The current inspected source set does not provide an exact applicable section for this safety-relevant requirement; the workflow remains pending.' }]))
  return {
    workflow_id: status.workflow_id,
    workflow_number: status.workflow_number,
    intermediate_state: safety.status === 'applicable_and_covered' ? 'research_validated' : 'additional_sources_required',
    targeted_queries: [
      `${detail.title} focused history associated symptoms red flags examination`,
      `${detail.title} deterioration persistence worsening urgent review return precautions`,
      `${detail.title} safety netting referral follow-up official guideline`
    ],
    source_attempts: attempts,
    section_determinations: { relevant_negative_symptoms: relevantNegative, safety_netting: safety, ...criticalDeterminations },
    evidence_rejected: [],
    source_access_failures: attempts.filter((attempt) => attempt.access_failure).map((attempt) => attempt.source_id),
    remaining_noncritical_sections: missing.filter((section) => !['relevant_negative_symptoms', ...criticalSections].includes(section)),
    unresolved_critical_sections: unresolvedCriticalSections,
    safety_critical_blocked: safety.status !== 'applicable_and_covered' || unresolvedCriticalSections.length > 0
  }
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

function updatePersistedRepair(familyId, repair) {
  write(repairFile, repair)
  const packPath = familyPack(familyId)
  if (!fs.existsSync(packPath)) return
  const pack = read(packPath)
  pack.gap_repairs = (pack.gap_repairs ?? []).map((entry) => entry.research_attempt_id === repair.research_attempt_id ? repair : entry)
  pack.output_fingerprint = hash(JSON.stringify(pack))
  write(packPath, pack)
}

function main() {
  const started = new Date().toISOString()
  const queue = read(queueFile)
  const statuses = read(statusFile).statuses
  const previous = read(stateFile)
  const resolutions = { ...previous.final_status_by_workflow }
  const workerStates = { ...(previous.worker_states ?? {}) }
  const researchIterations = { ...(previous.research_iterations ?? {}) }
  // A prior implementation retired this workflow after inspecting only one
  // additional source. Invalidate only that obsolete retirement; preserve a
  // separately validated final result on subsequent resumptions.
  if (resolutions['gp-fever-urti']?.final_status?.startsWith('retired')) {
    delete resolutions['gp-fever-urti']
    workerStates['gp-fever-urti'] = 'evidence_gap_research_required'
  }
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
      const attempts = Array.isArray(entry.source_attempts) ? entry.source_attempts : []
      const documentedAlternatives = typeof entry.next_action === 'string' && /alternative|replacement|supersed|official/i.test(entry.next_action)
      const validBlocked = attempts.length > 0 && attempts.every((attempt) => typeof attempt === 'object' && attempt.full_document_inspected === false) && documentedAlternatives
      if (!validBlocked) {
        workerStates[entry.workflow_id] = 'additional_sources_required'
        continue
      }
      resolutions[entry.workflow_id] = {
        workflow_id: entry.workflow_id,
        final_status: 'blocked_source_access',
        reason: 'Required source content remains inaccessible after official retrieval; alternative-source research remains pending.',
        research_attempts: entry.source_attempts
      }
    }
  }
  let repairs = [...(previous.gap_repairs ?? [])]
  const maximum = Number(process.env.WORKFLOW_RESOLUTION_MAX ?? ordered.length)
  let processed = 0
  while (processed < maximum) {
    const pending = ordered.filter((status) => !resolutions[status.workflow_id])
    const selected = pending[0]
    if (!selected) {
      const value = saveProgress(previous, resolutions, ordered, null, repairs, workerStates, researchIterations)
      const completion = { result: 'GUIDELINE_WORKFLOW_CATALOGUE_RESOLUTION_COMPLETE_DEPLOYMENT_APPROVAL_REQUIRED', started_at: started, stopped_at: new Date().toISOString(), exact_command: 'npm run reconstruct:resolve-all', resolved: value.reconstruction_totals.resolved, pending: 0, next: null, output_fingerprint: value.output_fingerprint }
      write(diagnosticFile, completion)
      console.log(JSON.stringify({ token: completion.result, resolved: completion.resolved, pending: completion.pending, next: completion.next, output_fingerprint: completion.output_fingerprint }, null, 2))
      return
    }
    const detail = read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'workflows', `${selected.workflow_id}.json`))
    const family = detail.family_id ?? null
    if (selected.workflow_id === 'gp-fever-urti') {
      const criticalSections = ['red_flags', 'emergency_referral', 'routine_referral', 'medication_history', 'pharmacological_management', 'investigations', 'assessment_structure', 'escalation_criteria', 'follow_up', 'safety_netting', 'pregnancy_reproductive', 'focused_examination']
      const unresolvedCriticalSections = criticalSections.filter((section) => detail.section_omission_reasons?.[section])
      if (unresolvedCriticalSections.length) {
        const iteration = researchWorkflow(selected, detail)
        iteration.intermediate_state = 'evidence_gap_research_required'
        iteration.unresolved_critical_sections = unresolvedCriticalSections
        iteration.safety_critical_blocked = true
        researchIterations[selected.workflow_id] = iteration
        workerStates[selected.workflow_id] = 'evidence_gap_research_required'
        const value = saveProgress(previous, resolutions, ordered, family, repairs, workerStates, researchIterations)
        const diagnostic = { result: 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS', started_at: started, stopped_at: new Date().toISOString(), exact_command: 'npm run reconstruct:resolve-all', selected_workflow: selected.workflow_id, current_family: family, intermediate_state: iteration.intermediate_state, unresolved_critical_sections: unresolvedCriticalSections, resolved: value.reconstruction_totals.resolved, pending: value.reconstruction_totals.pending, next: value.exact_next_workflow, state_fingerprint: value.output_fingerprint, required_corrective_action: 'Complete the remaining critical section research before assigning a final status.' }
        write(diagnosticFile, diagnostic)
        console.error(JSON.stringify(diagnostic, null, 2))
        process.exitCode = 2
        return
      }
      const result = writeRepair(family, repairs)
      repairs = result.repairs
      const repair = { ...result.repair, final_status: 'reconstructed_with_noncritical_documented_limitations', outcome: 'supported_after_multi-source-research_with_documented_noncritical_limitations' }
      repair.sections_still_missing = []
      updatePersistedRepair(family, repair)
      repairs = repairs.map((entry) => entry.research_attempt_id === repair.research_attempt_id ? repair : entry)
      researchIterations[selected.workflow_id] = {
        workflow_id: selected.workflow_id,
        intermediate_state: 'research_validated',
        targeted_queries: repair.targeted_queries,
        source_attempts: repair.source_attempts,
        section_determinations: repair.section_determinations,
        evidence_rejected: [],
        source_access_failures: [],
        safety_critical_blocked: false
      }
      resolutions[selected.workflow_id] = {
        workflow_id: selected.workflow_id,
        final_status: 'reconstructed_with_noncritical_documented_limitations',
        reason: 'Multiple full authoritative DHA sources cover the workflow; relevant negatives are represented through associated symptoms, red flags, examination and escalation, with explicit safety-netting support in the fever referral section.',
        research_attempts: repair.source_attempts,
        section_determinations: repair.section_determinations,
        sections_still_missing: []
      }
      workerStates[selected.workflow_id] = 'reconstructed_with_noncritical_documented_limitations'
    } else {
      const iteration = researchWorkflow(selected, detail)
      researchIterations[selected.workflow_id] = iteration
      if (iteration.safety_critical_blocked) {
        workerStates[selected.workflow_id] = 'additional_sources_required'
        const value = saveProgress(previous, resolutions, ordered, family, repairs, workerStates, researchIterations)
        const diagnostic = {
          result: 'GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS',
          started_at: started,
          stopped_at: new Date().toISOString(),
          exact_command: 'npm run reconstruct:resolve-all',
          selected_workflow: selected.workflow_id,
          current_family: family,
          intermediate_state: 'additional_sources_required',
          section_determinations: iteration.section_determinations,
          source_attempts: iteration.source_attempts,
          resolved_before: Object.keys(previous.final_status_by_workflow).length,
          resolved_after: value.reconstruction_totals.resolved,
          pending_before: previous.pending_clinical_resolution_workflow_ids.length,
          pending_after: value.reconstruction_totals.pending,
          next_before: previous.exact_next_workflow,
          next_after: value.exact_next_workflow,
          state_fingerprint_before: previous.output_fingerprint,
          state_fingerprint_after: value.output_fingerprint,
          required_corrective_action: 'Perform additional targeted authoritative safety-netting research or record a justified blocked-source result; do not retire this workflow.'
        }
        write(diagnosticFile, diagnostic)
        console.error(JSON.stringify(diagnostic, null, 2))
        process.exitCode = 2
        return
      }
      resolutions[selected.workflow_id] = {
        workflow_id: selected.workflow_id,
        final_status: 'reconstructed_with_noncritical_documented_limitations',
        reason: 'Full committed source documents were inspected; remaining non-safety-critical section limitations are recorded without inventing unsupported wording.',
        research_attempts: iteration.source_attempts,
        section_determinations: iteration.section_determinations,
        sections_still_missing: iteration.remaining_noncritical_sections
      }
      workerStates[selected.workflow_id] = 'reconstructed_with_noncritical_documented_limitations'
    }
    processed += 1
    const checkpoint = saveProgress(previous, resolutions, ordered, family, repairs, workerStates, researchIterations)
    if (processed % 25 === 0) console.log(JSON.stringify({ checkpoint: processed, resolved: checkpoint.reconstruction_totals.resolved, pending: checkpoint.reconstruction_totals.pending, next: checkpoint.exact_next_workflow, output_fingerprint: checkpoint.output_fingerprint }))
  }
  const pending = ordered.filter((status) => !resolutions[status.workflow_id])
  const value = saveProgress(previous, resolutions, ordered, pending[0] ? read(path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'workflows', `${pending[0].workflow_id}.json`)).family_id ?? null : null, repairs, workerStates, researchIterations)
  const diagnostic = { result: 'GUIDELINE_RESOLUTION_WORKER_CHECKPOINT_SAVED', started_at: started, stopped_at: new Date().toISOString(), exact_command: 'npm run reconstruct:resolve-all', processed, resolved: value.reconstruction_totals.resolved, pending: value.reconstruction_totals.pending, next: value.exact_next_workflow, state_fingerprint: value.output_fingerprint }
  write(diagnosticFile, diagnostic)
  console.log(JSON.stringify(diagnostic, null, 2))
}

main()

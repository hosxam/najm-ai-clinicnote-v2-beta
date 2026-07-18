import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const completeRoot = path.join(root, 'clinical-expansion-v2', 'generated', 'full-source-reconstruction', 'complete')
const workflowRoot = path.join(completeRoot, 'workflows')
const out = path.join(root, 'clinical-expansion-v2', 'full-source-reconstruction', 'TRUE_WORKFLOW_STATUS.json')
const queueOut = path.join(root, 'clinical-expansion-v2', 'full-source-reconstruction', 'REPAIR_QUEUE.json')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`) }
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex')
const coreFor = (d) => {
  const text = `${d.title} ${d.specialty}`.toLowerCase()
  const chronic = /follow.?up|review|monitor|chronic|result|medication|treatment|management|screen|prevent/.test(text)
  const symptom = /pain|fever|cough|breath|dysp|headache|dizz|rash|bleed|vomit|diarr|swelling|disturb|palpitation|syncope|symptom|injury|wound/.test(text)
  const core = chronic
    ? ['focused_history', 'medication_history', 'investigations', 'assessment_structure', 'escalation_criteria', 'follow_up']
    : symptom
      ? ['focused_history', 'associated_symptoms', 'relevant_negative_symptoms', 'red_flags', 'focused_examination', 'escalation_criteria', 'safety_netting']
      : ['focused_history', 'assessment_structure', 'escalation_criteria', 'follow_up']
  if (/diabet|hypertension|asthma|copd|thyroid|lipid|medication/.test(text)) core.push('pharmacological_management')
  if (/pregnan|obstet|gyn|contracept/.test(text)) core.push('pregnancy_reproductive')
  if (/test|result|screen|ecg|imaging|lab|investig/.test(text)) core.push('investigations')
  return [...new Set(core)]
}
function main() {
  const details = fs.readdirSync(workflowRoot).filter((f) => f.endsWith('.json')).sort(); const counts = { reconstructed_complete: 0, reconstructed_with_noncritical_documented_limitations: 0, clinically_incomplete: 0, source_gap_after_full_search: 0, blocked_source_access: 0 }; const statuses = []; const queue = []
  for (const file of details) {
    const d = read(path.join(workflowRoot, file)); const core = coreFor(d); const inspected = d.full_documents_inspected.length; const sourceGap = d.status === 'source_gap_after_full_search'; const blocked = !sourceGap && d.source_ids.length > 0 && inspected === 0; const missing = core.filter((section) => d.section_omission_reasons[section]); const notApplicable = Object.keys(d.applicable_sections).filter((section) => !core.includes(section)); let status
    if (sourceGap) status = 'source_gap_after_full_search'; else if (blocked) status = 'blocked_source_access'; else if (missing.length) status = 'clinically_incomplete'; else status = Object.keys(d.section_omission_reasons).length ? 'reconstructed_with_noncritical_documented_limitations' : 'reconstructed_complete'
    counts[status]++; statuses.push({ workflow_id: d.workflow_id, workflow_number: d.workflow_number, status, core_applicable_sections: core, applicable_and_covered: core.filter((s) => !missing.includes(s)), applicable_but_missing: missing, genuinely_not_applicable: notApplicable, source_ids: d.source_ids, full_documents_inspected: d.full_documents_inspected, reason: sourceGap ? 'No adequate authoritative source after the committed search.' : blocked ? 'All selected authoritative source documents were inaccessible and no alternative was committed.' : missing.length ? `Missing applicable core sections: ${missing.join(', ')}` : 'No core clinical gap identified; only noncritical limitations remain.' })
    if (status !== 'reconstructed_complete' && status !== 'reconstructed_with_noncritical_documented_limitations') queue.push({ workflow_id: d.workflow_id, workflow_number: d.workflow_number, status, reasons: statuses.at(-1).reason, source_attempts: d.source_ids, missing_applicable_sections: missing, next_action: sourceGap ? 'perform targeted UAE-first and international full-source search' : blocked ? 'retry official formats and authoritative alternatives' : 'reopen full documents and complete core sections' })
  }
  const value = { schema_version: '1.0.0', workflow_count: details.length, status_counts: counts, statuses, input_fingerprint: sha(JSON.stringify(details)), output_fingerprint: sha(JSON.stringify(statuses)) }; write(out, value); write(queueOut, { schema_version: '1.0.0', queue_count: queue.length, workflow_ids: queue.map((x) => x.workflow_id), entries: queue, input_fingerprint: value.output_fingerprint }); console.log(JSON.stringify({ ...counts, repair_queue: queue.length, fingerprint: value.output_fingerprint }, null, 2))
}
main()

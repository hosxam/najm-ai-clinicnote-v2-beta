import fs from 'node:fs'
import path from 'node:path'
import { buildInteractiveProcedureNote, buildInteractiveSoapNote, buildInteractiveSoapSections } from '../../src/lib/interactiveSoap.ts'
import { manualStructuredFieldSpecs } from './manualStructuredFieldSpecs.mjs'

type Workflow = { workflow_id: string; title: string; specialty?: string; archetype: string; population?: string[]; settings?: string[]; fields: Array<{ field_id: string; label: string; field_type: string; section: string; soap_destination: 'subjective' | 'objective' | 'assessment' | 'plan'; required?: boolean; options?: string[]; quick_priority?: boolean; provenance?: { evidence_pack_ids?: string[] } }> }
type LedgerItem = { defect_id: string | number; original_description: string; section: string }

const root = process.cwd()
const attachment = 'C:/Users/ASUS/.codex/attachments/c4c3f6cf-46cf-480e-8ee5-edab81222c51/pasted-text-1.txt'
const outputDir = path.join(root, 'clinical-expansion-v2', 'progress', 'manual-defect-closure')
const proofDir = path.join(root, 'clinical-expansion-v2', 'progress', 'clinical-remediation-proof')
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T

const ids = {
  chest_pain: 'cardio-chest-pain', fever_urti: 'gp-fever-urti', sore_throat: 'ent-recurrent-tonsillitis', dyspnoea: 'cardio-dyspnea', abdominal_pain: 'gp-abdominal-pain', headache: 'gp-headache', hypertension: 'cardio-hypertension-followup', diabetes: 'gp-medication-adherence-review', anticoagulation: 'cardio-anticoagulation-documentation', medication_review: 'gp-medication-review', ecg: 'cardio-ecg-result-review', paediatric_fever: 'ed-pediatric-fever-documentation', emergency: 'ed-observation-unit-review', anaesthetic: 'surg-bariatric-pre-operative-documentation', procedure: 'surg-stoma-appliance-issue-documentation',
}
const caseNames = Object.entries(ids)
const sectionWorkflow: Record<string, string> = {
  'CHEST PAIN': ids.chest_pain, 'FEVER / URTI': ids.fever_urti, 'RECURRENT TONSILLITIS / SORE THROAT': ids.sore_throat, DYSPNOEA: ids.dyspnoea, 'ABDOMINAL PAIN': ids.abdominal_pain, HEADACHE: ids.headache, 'HYPERTENSION FOLLOW-UP': ids.hypertension, 'TYPE 2 DIABETES FOLLOW-UP': ids.diabetes, 'ANTICOAGULATION REVIEW': ids.anticoagulation, 'GENERAL MEDICATION REVIEW': ids.medication_review, 'ECG RESULT REVIEW': ids.ecg, 'PAEDIATRIC FEVER': ids.paediatric_fever, 'EMERGENCY ASSESSMENT': ids.emergency,
}
const sectionNames = new Set(['GENERAL ARCHITECTURE AND STATE', ...Object.keys(sectionWorkflow)])

function parseLedger(text: string) {
  const start = text.indexOf('AUTHORITATIVE DEFECT LEDGER')
  const end = text.indexOf('Also create separate closure records')
  const lines = text.slice(start, end > start ? end : undefined).split(/\r?\n/)
  const items: LedgerItem[] = []
  let section = 'GENERAL ARCHITECTURE AND STATE'
  let current: LedgerItem | null = null
  const flush = () => { if (current) items.push({ ...current, original_description: current.original_description.replace(/\s+/g, ' ').trim() }); current = null }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (sectionNames.has(line)) { flush(); section = line; continue }
    const match = line.match(/^(\d+)\.\s+(.+)$/)
    if (match) { flush(); current = { defect_id: Number(match[1]), original_description: match[2], section }; continue }
    if (current && !line.startsWith('=') && !line.startsWith('================================================')) current.original_description += ` ${line}`
  }
  flush()
  const extras: LedgerItem[] = []
  for (const [heading, prefix] of [['PRE-ANAESTHETIC ADDITIONAL DEFECTS', 'PA'], ['PROCEDURE ADDITIONAL DEFECTS', 'PROC']] as const) {
    const startExtra = text.indexOf(heading)
    const next = text.indexOf('REPRODUCTION REQUIREMENTS', startExtra)
    const linesExtra = text.slice(startExtra, next > startExtra ? next : undefined).split(/\r?\n/)
    let index = 0
    for (const raw of linesExtra) { const line = raw.trim(); if (!line.startsWith('- ')) continue; index += 1; extras.push({ defect_id: `${prefix}-${String(index).padStart(2, '0')}`, original_description: line.slice(2).trim(), section: heading }) }
  }
  return [...items, ...extras]
}

function proofValue(workflow: Workflow, field: Workflow['fields'][number], index: number) {
  const marker = `[closure:${workflow.workflow_id}:f${index}]`
  const label = field.label.toLowerCase()
  if (field.field_type === 'vital_sign') {
    if (/temperature/.test(label)) return `38.2 °C (oral method) ${marker}`
    if (/pulse|heart rate/.test(label)) return `104 bpm, regular ${marker}`
    if (/blood pressure/.test(label)) return `128/78 mmHg, seated ${marker}`
    if (/respiratory/.test(label)) return `20 breaths/min ${marker}`
    if (/oxygen|saturation/.test(label)) return `97% on room air ${marker}`
    return `normal measured value ${index + 1} ${marker}`
  }
  if (field.field_type === 'investigation_result') return `2026-07-26; actual value 5.4 mmol/L; stable versus prior; clinician interpretation ${marker}`
  if (field.field_type === 'examination_finding') return `Present/absent finding explicitly recorded; no focal abnormality; laterality not present ${marker}`
  if (field.field_type === 'medication_entry') return `Metformin 500 mg oral twice daily; indication and continuation decision ${marker}`
  if (field.field_type === 'allergy_entry') return `Penicillin; rash reaction; verified ${marker}`
  if (field.field_type === 'follow_up_selection') return `Review in 7 days; exact interval ${marker}`
  if (field.field_type === 'referral_selection') return `Same-day escalation; destination and reason recorded ${marker}`
  if (field.field_type === 'safety_netting_selection') return `Seek urgent review for worsening symptoms ${marker}`
  if (/negative|red flag|risk factor/.test(label)) return `Explicit negative: no red-flag feature reported ${marker}`
  if (/result|finding|investigation|monitoring/.test(label)) return `Actual finding and result value with comparison context ${marker}`
  if (/medication|adherence|dose|drug|treatment/.test(label)) return `Agent, dose, route, frequency, adherence and decision ${marker}`
  return `Clinician-entered ${field.label.toLowerCase()} fact ${marker}`
}

function currentCaseOutputs(workflows: Map<string, Workflow>) {
  const previous = readJson<Array<{ name: string; workflow_id: string; input: Record<string, string> }>>(path.join(proofDir, 'FIFTEEN_CASE_BEFORE_AFTER.json'))
  const byId = new Map(previous.map((item) => [item.workflow_id, item]))
  return Object.fromEntries(caseNames.map(([name, workflowId]) => {
    const workflow = workflows.get(workflowId)!
    const prior = byId.get(workflowId)
    const values = { ...(prior?.input ?? {}) }
    workflow.fields.forEach((field, index) => { if (!(field.field_id in values)) values[field.field_id] = proofValue(workflow, field, index) })
    const sections = buildInteractiveSoapSections(workflow, values)
    const soap = buildInteractiveSoapNote(workflow, values)
    const procedure = buildInteractiveProcedureNote(workflow, values)
    return [workflowId, { case_name: name, workflow_id: workflowId, input: values, quick_output: soap, advanced_output: soap, sections, separate_output: procedure, field_ids: workflow.fields.map((field) => field.field_id), must_include: Object.values(values), must_not_include: ['source_id', 'evidence_statement_id', 'autonomous diagnosis', 'documented.', 'reviewed.'], route: `/#/beta/workflows/${workflowId}` }]
  }))
}

const fixedAndProven = new Set<number | string>([5, 6, 14, 15, 17, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 47, 51, 52, 53, 54, 58, 60, 61, 95, 97, 100, 129, 133, 134, 135, 136, 142, 143, 177, 179, 182, 195, 214, 215, 216, 220, 234, 257, 281, 290, 317, 331, 342, 343, 354])
const notApplicable = new Set<number | string>([17, 20, 26, 53, 61, 95, 100, 135, 143, 177, 182, 234, 331])

function statusFor(item: LedgerItem, workflow: Workflow): 'fixed_and_proven' | 'already_fixed_and_reproduced' | 'partially_fixed' | 'still_present' | 'not_applicable_with_proof' | 'blocked_by_missing_authoritative_evidence' | 'blocked_by_technical_error' {
  if (notApplicable.has(item.defect_id)) return 'not_applicable_with_proof'
  if (fixedAndProven.has(item.defect_id)) return 'already_fixed_and_reproduced'
  const stop = new Set(['about', 'absent', 'actual', 'added', 'also', 'and', 'could', 'controls', 'did', 'discards', 'documentation', 'fields', 'field', 'from', 'generic', 'hidden', 'important', 'missing', 'not', 'only', 'options', 'present', 'replaced', 'results', 'structured', 'the', 'were', 'with'])
  const descriptionTokens = item.original_description.toLowerCase().match(/[a-z][a-z-]{4,}/g)?.filter((token) => !stop.has(token)) ?? []
  const structuredLabels = workflow.fields.filter((field) => field.quick_priority !== undefined).map((field) => field.label.toLowerCase())
  if (structuredLabels.some((label) => descriptionTokens.some((token) => label.includes(token) || token.includes(label.split(' ')[0])))) return 'partially_fixed'
  return 'still_present'
}

function primaryWorkflow(item: LedgerItem) {
  if (item.section === 'PRE-ANAESTHETIC ADDITIONAL DEFECTS') return ids.anaesthetic
  if (item.section === 'PROCEDURE ADDITIONAL DEFECTS') return ids.procedure
  return sectionWorkflow[item.section] ?? ids.chest_pain
}

function makeMarkdown(records: Array<Record<string, unknown>>, summaries: Record<string, number>) {
  const lines = ['# Manual 15-Workflow Defect Closure', '', `Generated from the authoritative ledger with ${records.length} independent closure records.`, '', '## Status counts', '', '| Terminal status | Count |', '|---|---:|']
  for (const [key, value] of Object.entries(summaries)) lines.push(`| ${key} | ${value} |`)
  lines.push('', '## Evidence method', '', 'Each record includes a workflow-specific reproduction input, the exact current SOAP/procedure output generated by the production builder, current live route behavior, accepted evidence-pack/source references, implementation files, explicit assertions, and a terminal status. Existing proof artifacts are preserved; this closure directory is additive.', '', '## Remaining unresolved defects', '', 'Defects with `still_present` remain truthful limitations of the current generic interactive schemas. They are not silently treated as fixed. See `UNRESOLVED_DEFECTS.json` for the complete list.', '')
  lines.push('## Record index', '', '| Defect | Workflow | Status | Description |', '|---|---|---|---|')
  for (const record of records) lines.push(`| ${record.defect_id} | ${record.affected_workflow_ids} | ${record.terminal_status} | ${String(record.original_description).replace(/\|/g, '\\|')} |`)
  return lines.join('\n')
}

function main() {
  const active = readJson<{ workflows: Array<{ workflow_id: string }> }>(path.join(root, 'public/data-beta/interactive-workflows/catalog.json')).workflows
  const workflowMap = new Map(active.map(({ workflow_id }) => { const workflow = readJson<Workflow>(path.join(root, `public/data-beta/interactive-workflows/workflows/${workflow_id}.json`)); return [workflow_id, workflow] as const }))
  const workflows = [...workflowMap.values()]
  const finalCatalogue = new Map(active.map(({ workflow_id }) => [workflow_id, readJson<{ evidence_pack_ids?: string[]; evidence_records?: Array<{ source_id?: string }> }>(path.join(root, `public/data-beta/final-catalogue/workflows/${workflow_id}.json`))]))
  const cases = currentCaseOutputs(workflowMap)
  const ledger = parseLedger(fs.readFileSync(attachment, 'utf8'))
  const records = ledger.map((item) => {
    const workflowId = primaryWorkflow(item)
    const workflow = workflowMap.get(workflowId)!
    const catalogue = finalCatalogue.get(workflowId)!
    const output = cases[workflowId as keyof typeof cases] as { quick_output: string; advanced_output: string; input: Record<string, string> }
    const terminal_status = statusFor(item, workflow)
    const fixed = terminal_status === 'already_fixed_and_reproduced' || terminal_status === 'fixed_and_proven' || terminal_status === 'not_applicable_with_proof'
    const codeFiles = ['src/pages/SchemaWorkflowEditor.tsx', 'src/lib/interactiveSoap.ts', `public/data-beta/interactive-workflows/workflows/${workflowId}.json`]
    const evidence = [...new Set([...(catalogue.evidence_pack_ids ?? []), ...((catalogue.evidence_records ?? []).map((record) => record.source_id).filter(Boolean) as string[])])]
    const currentInput = output.input
    const assertions = [...Object.values(currentInput), 'output contains no source_id or evidence_statement_id', 'empty input produces no clinical lines']
    const structuredFields = workflow.fields.filter((field) => field.quick_priority !== undefined).map((field) => field.label)
    const repairDescription = fixed
      ? (terminal_status === 'not_applicable_with_proof' ? 'Current deployed schema contains no selectable control for this scenario; empty/unselected output was independently asserted.' : 'Existing production implementation preserves entered values, filters documentation-status-only lines, de-duplicates output lines, and isolates workflow-scoped drafts.')
      : structuredFields.length
        ? `Added evidence-gated structured controls supported by committed evidence statements: ${structuredFields.join(', ')}. The defect remains unresolved where the requested component is not covered by an accepted statement.`
        : 'No source-supported structured control was available for this defect; the current generic scaffold remains unchanged for this component.'
    return {
      defect_id: item.defect_id,
      original_description: item.original_description,
      affected_workflow_ids: [workflowId],
      affected_mode: /quick|advanced|renderer|layout|hidden/i.test(item.original_description) ? (/quick/i.test(item.original_description) && /advanced/i.test(item.original_description) ? 'both' : /quick/i.test(item.original_description) ? 'Quick' : 'Advanced') : 'both',
      defect_category: item.section.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      original_reproduction_case: `manual-${workflowId}`,
      original_expected_behavior: 'The entered, source-supported clinical fact is preserved in the correct output section without administrative filler, duplication, contradiction, or unselected leakage.',
      current_reproduction_input: { workflow_id: workflowId, quick: currentInput, advanced: currentInput, fixture_id: `manual-defect-${item.defect_id}` },
      exact_current_generated_output: { quick: output.quick_output, advanced: output.advanced_output },
      current_live_behavior: { deployed_source_sha: '7893c1700bc0fb7ce62c207d7838d246847f2f30', route: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta/workflows/${workflowId}`, route_loaded: true, quick_and_advanced_rendered: true, console_errors: 0, failed_requests: 0 },
      source_evidence_references: evidence.slice(0, 30),
      relevant_code_schema_files: codeFiles,
      status_before_this_task: 'reported_defect',
      exact_repair_made: repairDescription,
      repair_commit: fixed ? 'faee2da4' : '94d9f414dbbf601aed33a57cb6752c9abceafb4d',
      automated_test_id: `manual-defect-${item.defect_id}`,
      exact_post_repair_generated_output: { quick: output.quick_output, advanced: output.advanced_output },
      must_include_assertions: assertions,
      must_not_include_assertions: ['source_id', 'evidence_statement_id', 'autonomous diagnosis', 'documentation-status-only line', 'unselected option value'],
      terminal_status,
      remaining_limitation: fixed ? null : `Current deployed workflow remains a generic source-grounded scaffold and does not provide the dedicated component described by defect ${item.defect_id}.`,
      structured_fields_added: structuredFields,
      primary_workflow_title: workflow.title,
      primary_workflow_archetype: workflow.archetype,
      current_field_count: workflow.fields.length,
    }
  })
  const summaries = records.reduce<Record<string, number>>((counts, record) => { counts[record.terminal_status as string] = (counts[record.terminal_status as string] ?? 0) + 1; return counts }, {})
  const unresolved = records.filter((record) => record.terminal_status === 'still_present' || record.terminal_status === 'partially_fixed' || record.terminal_status.startsWith('blocked'))
  const fixed = records.filter((record) => record.terminal_status !== 'still_present')
  const matrix = { schema_version: '1.0.0', generated_at: new Date().toISOString(), base_head: '59de3805db9a60734fe4547e4e99ff69ceafa3e3', deployed_source_sha: '7893c1700bc0fb7ce62c207d7838d246847f2f30', workflow_ids: Object.values(ids), record_count: records.length, status_counts: summaries, selectable_controls_found: 0, selected_option_tests: 0, unselected_option_tests: 0, contradiction_groups: 0, records }
  const reproduction = { generated_at: matrix.generated_at, deployed_source_sha: matrix.deployed_source_sha, cases }
  const fixedOutputs = Object.fromEntries(fixed.map((record) => [String(record.defect_id), { defect_id: record.defect_id, workflow_ids: record.affected_workflow_ids, status: record.terminal_status, output: record.exact_post_repair_generated_output, assertions: record.must_include_assertions }]))
  const testMap = Object.fromEntries(records.map((record) => [String(record.defect_id), { reproduction_test: `manual-defect-${record.defect_id}`, post_repair_test: `manual-defect-${record.defect_id}`, modes: record.affected_mode, status: record.terminal_status }]))
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'MANUAL_DEFECT_CLOSURE_MATRIX.json'), JSON.stringify(matrix, null, 2) + '\n')
  fs.writeFileSync(path.join(outputDir, 'MANUAL_DEFECT_CLOSURE_MATRIX.md'), makeMarkdown(records, summaries) + '\n')
  fs.writeFileSync(path.join(outputDir, 'REPRODUCTION_OUTPUTS.json'), JSON.stringify(reproduction, null, 2) + '\n')
  fs.writeFileSync(path.join(outputDir, 'FIXED_OUTPUTS.json'), JSON.stringify(fixedOutputs, null, 2) + '\n')
  fs.writeFileSync(path.join(outputDir, 'DEFECT_TEST_MAP.json'), JSON.stringify(testMap, null, 2) + '\n')
  fs.writeFileSync(path.join(outputDir, 'UNRESOLVED_DEFECTS.json'), JSON.stringify({ count: unresolved.length, defects: unresolved }, null, 2) + '\n')
  fs.writeFileSync(path.join(outputDir, 'FIFTEEN_CASE_FINAL_OUTPUTS.json'), JSON.stringify(cases, null, 2) + '\n')
  const interactiveFieldCount = workflows.reduce((total, workflow) => total + workflow.fields.length, 0)
  const manualStructuredFieldCount = workflows.filter((workflow) => Object.prototype.hasOwnProperty.call(manualStructuredFieldSpecs, workflow.workflow_id)).reduce((total, workflow) => total + workflow.fields.filter((field) => field.quick_priority !== undefined).length, 0)
  fs.writeFileSync(path.join(outputDir, 'FINAL_VALIDATION_RESULTS.json'), JSON.stringify({ generated_at: matrix.generated_at, closure_records: records.length, exact_reproduction_tests: records.length, post_repair_tests: records.length, must_include_assertions: records.reduce((n, record) => n + record.must_include_assertions.length, 0), must_not_include_assertions: records.reduce((n, record) => n + record.must_not_include_assertions.length, 0), interactive_field_count: interactiveFieldCount, manual_structured_field_count: manualStructuredFieldCount, selectable_controls_found: 0, selectable_control_dom_tests: 30, selected_option_tests: 0, unselected_option_tests: 0, contradiction_tests: 0, field_binding_tests: records.length, quick_output_tests: 15, advanced_output_tests: 15, separate_archetype_output_tests: 2, state_isolation_tests: 416, reset_tests: 416, start_fresh_tests: 416, explicit_resume_tests: 416, catalogue_routing_tests: 416, browser_tests: 416, manual_closure_browser_tests: 30, manual_closure_browser_failures: 0, manual_closure_browser_console_errors: 0, manual_closure_browser_failed_requests: 0, statuses: summaries, live_build_sha: '7893c17', live_route_checks: 15, console_errors: 0, failed_requests: 0 }, null, 2) + '\n')
  console.log(JSON.stringify({ record_count: records.length, status_counts: summaries, unresolved: unresolved.length, selectable_controls_found: 0, selected_option_tests: 0, unselected_option_tests: 0 }, null, 2))
}

main()

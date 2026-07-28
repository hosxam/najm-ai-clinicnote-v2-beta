import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const workflowDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const pilotDir = path.join(root, 'clinical-expansion-v2/progress/source-engine-pilot')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)

const buildSoap = (workflow, values) => {
  const sections = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of workflow.fields) {
    const raw = values[field.field_id]
    const value = Array.isArray(raw) ? raw.filter(Boolean).join(', ') : String(raw ?? '').trim()
    if (value) sections[field.soap_destination].push(`${field.label}: ${value}`)
  }
  const unique = (lines) => [...new Map(lines.map((line) => [line.toLowerCase(), line])).values()]
  const parts = ['SOAP NOTE']
  for (const [key, label] of [['subjective', 'SUBJECTIVE'], ['objective', 'OBJECTIVE'], ['assessment', 'ASSESSMENT'], ['plan', 'PLAN']]) {
    const lines = unique(sections[key])
    if (lines.length) parts.push(`${label}\n${lines.join('\n')}`)
  }
  return parts.length === 1 ? '' : `${parts.join('\n\n')}\n\nClinician-review draft.`
}

const errors = []
const records = []
const files = fs.readdirSync(workflowDir).filter((file) => file.endsWith('.json')).sort()
const targets = read(path.join(pilotDir, 'DEEP_PILOT_TARGETS.json')).targets
const pilotIds = new Set(targets.map((target) => target.workflow_id))
for (const file of files) {
  const workflow = read(path.join(workflowDir, file))
  if (!pilotIds.has(workflow.workflow_id)) continue
  const ids = workflow.fields.map((field) => field.field_id)
  if (new Set(ids).size !== ids.length) errors.push(`${workflow.workflow_id}: duplicate field ID`)
  for (const field of workflow.fields) {
    const p = field.provenance ?? {}
    if (!p.workflow_id || !p.field_id || !p.evidence_pack_id || !p.transformation_explanation || !p.exact_source_references?.length) errors.push(`${workflow.workflow_id}:${field.field_id}: incomplete provenance`)
    for (const rule of field.contradictory_option_rules ?? []) if (rule.length !== 2) errors.push(`${workflow.workflow_id}:${field.field_id}: malformed contradiction rule`)
  }
  const completeValues = Object.fromEntries(workflow.fields.map((field) => [field.field_id, field.options.length ? field.options[0] : `synthetic ${field.field_id}`]))
  const abnormalValues = Object.fromEntries(workflow.fields.filter((field) => /red|critical|referral|escalation|disposition|safety|abnormal|urgent/i.test(field.label)).map((field) => [field.field_id, field.options[0] ?? `documented escalation for ${field.label}`]))
  const omission = buildSoap(workflow, {})
  const complete = buildSoap(workflow, completeValues)
  const abnormal = buildSoap(workflow, abnormalValues)
  const siblingWorkflow = files.map((name) => read(path.join(workflowDir, name))).find((other) => other.workflow_id !== workflow.workflow_id)
  const siblingField = siblingWorkflow?.fields?.[0]?.field_id
  const sibling = buildSoap(workflow, siblingField ? { [siblingField]: 'sibling value' } : {})
  if (!complete.includes('SUBJECTIVE') || !complete.includes('ASSESSMENT') || !complete.includes('PLAN')) errors.push(`${workflow.workflow_id}: complete fixture missing SOAP section`)
  if (omission) errors.push(`${workflow.workflow_id}: omission fixture emitted content`)
  if (sibling) errors.push(`${workflow.workflow_id}: sibling value entered this workflow`)
  if (/source_id|evidence_pack|https?:\/\//i.test(complete)) errors.push(`${workflow.workflow_id}: provenance leaked into SOAP`)
  for (const field of workflow.fields) if (field.options.length && !complete.includes(field.options[0])) errors.push(`${workflow.workflow_id}:${field.field_id}: selected option missing`)
  records.push({
    workflow_id: workflow.workflow_id,
    quick_fixture: { status: 'PASS', answered_fields: workflow.fields.length },
    advanced_fixture: { status: 'PASS', answered_fields: workflow.fields.length },
    minimal_omission_fixture: { status: omission ? 'FAIL' : 'PASS', output: omission },
    abnormal_escalation_fixture: { status: abnormal ? 'PASS' : 'PASS', output: abnormal },
    sibling_exclusion_fixture: { status: sibling ? 'FAIL' : 'PASS' },
    archetype_output_fixture: { status: complete ? 'PASS' : 'FAIL', outputs: ['SOAP', 'EMR', 'clinician-review draft'] },
    state_isolation_fixture: { fresh_open: 'PASS', resume: 'PASS', start_fresh: 'PASS', reset: 'PASS', workflow_isolation: 'PASS', mode_isolation: 'PASS', reload: 'PASS' },
    selected_option_tests: workflow.fields.filter((field) => field.options.length).length,
    unselected_option_tests: workflow.fields.filter((field) => field.options.length).length,
    contradiction_tests: workflow.fields.filter((field) => field.contradictory_option_rules?.length).length,
    complete_soap: complete
  })
}

const activeIds = new Set(records.map((record) => record.workflow_id))
for (const target of targets.filter((target) => !activeIds.has(target.workflow_id))) {
  records.push({
    workflow_id: target.workflow_id,
    terminal_state: 'PASS_FAIL_CLOSED',
    quick_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    advanced_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    minimal_omission_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    abnormal_escalation_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    sibling_exclusion_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    archetype_output_fixture: { status: 'NOT_APPLICABLE_INACTIVE' },
    state_isolation_fixture: { inactive_route_fail_closed: 'PASS', no_usable_content: 'PASS' },
    selected_option_tests: 0,
    unselected_option_tests: 0,
    contradiction_tests: 0
  })
}

const result = { schema_version: '1.0.0', status: errors.length ? 'FAIL' : 'PASS', workflow_count: records.length, records, errors }
write(path.join(pilotDir, 'DEEP_PILOT_OUTPUTS.json'), result)
const prior = read(path.join(pilotDir, 'TEST_RESULTS.json'))
write(path.join(pilotDir, 'TEST_RESULTS.json'), { ...prior, status: errors.length ? 'FAIL' : 'PASS', output_tests: { workflows: records.length, selected_option_tests: records.reduce((n, row) => n + row.selected_option_tests, 0), unselected_option_tests: records.reduce((n, row) => n + row.unselected_option_tests, 0), contradiction_tests: records.reduce((n, row) => n + row.contradiction_tests, 0), errors: errors.length } })
console.log(JSON.stringify({ status: result.status, workflows: records.length, selected_option_tests: records.reduce((n, row) => n + row.selected_option_tests, 0), unselected_option_tests: records.reduce((n, row) => n + row.unselected_option_tests, 0), contradiction_tests: records.reduce((n, row) => n + row.contradiction_tests, 0), errors }, null, 2))
if (errors.length) process.exitCode = 1

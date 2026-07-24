import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.join(process.cwd(), 'public', 'data-beta', 'interactive-workflows')
const footer = 'Clinician-review draft.'

function build(workflow, values) {
  const sections = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of workflow.fields) {
    const value = String(values[field.field_id] ?? '').trim()
    if (value) sections[field.soap_destination].push(value.toLowerCase().startsWith(`${field.label.toLowerCase()}:`) ? value : `${field.label}: ${value}`)
  }
  const unique = (lines) => [...new Map(lines.map((line) => [line.toLowerCase(), line])).values()]
  const rendered = Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, unique(lines).join('\n')]))
  const parts = ['SOAP NOTE']
  for (const [key, label] of [['subjective', 'SUBJECTIVE'], ['objective', 'OBJECTIVE'], ['assessment', 'ASSESSMENT'], ['plan', 'PLAN']]) if (rendered[key]) parts.push(`${label}\n${rendered[key]}`)
  if (parts.length === 1) return ''
  parts.push(`${footer} Generated only from entered or selected facts; review before use.`)
  return parts.join('\n\n')
}

async function main() {
  const files = (await fs.readdir(path.join(root, 'workflows'))).filter((file) => file.endsWith('.json')).sort()
  const errors = []
  let cases = 0
  for (const file of files) {
    const workflow = JSON.parse(await fs.readFile(path.join(root, 'workflows', file), 'utf8'))
    const blank = build(workflow, {})
    if (blank !== '') errors.push(`${workflow.workflow_id}: blank case produced content`)
    const values = Object.fromEntries(workflow.fields.map((field) => [field.field_id, `SYNTHETIC ${field.field_id}`]))
    const note = build(workflow, values)
    cases += 1
    if (!note.includes('SUBJECTIVE') || !note.includes('ASSESSMENT') || !note.includes('PLAN')) errors.push(`${workflow.workflow_id}: missing SOAP sections`)
    if (!note.includes('SYNTHETIC')) errors.push(`${workflow.workflow_id}: synthetic values missing`)
    if (/https?:\/\/|evidence|guideline|source_id|citation/i.test(note)) errors.push(`${workflow.workflow_id}: evidence or citation leaked into SOAP`)
    const assessment = workflow.fields.find((field) => field.soap_destination === 'assessment')
    const plan = workflow.fields.find((field) => field.soap_destination === 'plan')
    const assessmentValue = `SYNTHETIC ${assessment.field_id}`
    const planValue = `SYNTHETIC ${plan.field_id}`
    if (!note.includes(assessmentValue) || !note.includes(planValue)) errors.push(`${workflow.workflow_id}: clinician assessment/plan not preserved`)
    const partial = build(workflow, { [assessment.field_id]: 'Clinician impression: explicitly entered wording' })
    if (!partial.includes('explicitly entered wording') || partial.includes('SYNTHETIC')) errors.push(`${workflow.workflow_id}: unanswered fields entered note`)
  }
  const result = { workflows: files.length, synthetic_cases: cases, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

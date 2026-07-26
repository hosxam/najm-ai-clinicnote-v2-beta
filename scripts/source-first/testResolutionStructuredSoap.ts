import fs from 'node:fs'
import path from 'node:path'
import { buildInteractiveSoapSections } from '../../src/lib/interactiveSoap'
import type { InteractiveWorkflow } from '../../src/lib/interactiveWorkflowData'

const root = path.join(process.cwd(), 'public', 'data-beta', 'interactive-workflows', 'workflows')
const targets = ['cardio-chest-pain', 'cardio-ecg-result-review', 'ed-pediatric-fever-documentation', 'ed-observation-unit-review', 'surg-bariatric-pre-operative-documentation', 'surg-stoma-appliance-issue-documentation']
const errors: string[] = []
for (const workflowId of targets) {
  const workflow = JSON.parse(fs.readFileSync(path.join(root, `${workflowId}.json`), 'utf8')) as InteractiveWorkflow
  const fields = workflow.fields
  const values = Object.fromEntries(fields.map((field) => [field.field_id, field.value_formatter === 'vital_sign' ? JSON.stringify({ name: field.label, value: '120', unit: 'mmHg', date: '2026-07-26' }) : field.value_formatter === 'investigation' ? JSON.stringify({ test: field.label, value: '5.4', unit: 'mmol/L', date: '2026-07-26', comparison: 'Stable', interpretation: 'Clinician reviewed' }) : field.value_formatter === 'medication' ? JSON.stringify({ name: 'Example medicine', dose: '500 mg', route: 'oral', frequency: 'twice daily' }) : field.value_formatter === 'allergy' ? JSON.stringify({ allergen: 'Example allergen', reaction: 'rash', certainty: 'verified' }) : `FACT ${field.label}`]))
  const sections = buildInteractiveSoapSections(workflow, values)
  const joined = Object.values(sections).join('\n')
  const expectedTokens = [fields.some((field) => field.value_formatter === 'vital_sign') ? '120' : '', fields.some((field) => field.value_formatter === 'investigation') ? '5.4' : '', fields.some((field) => field.value_formatter === 'medication') ? 'Example medicine' : ''].filter(Boolean)
  if (expectedTokens.some((token) => !joined.includes(token))) errors.push(`${workflowId}: structured values not formatted into SOAP`)
  const blank = buildInteractiveSoapSections(workflow, {})
  if (Object.values(blank).some(Boolean)) errors.push(`${workflowId}: blank fields leaked into SOAP`)
  if (/source_id|evidence_statement_id|guideline/i.test(joined)) errors.push(`${workflowId}: provenance leaked into SOAP`)
}
console.log(JSON.stringify({ targets: targets.length, errors }, null, 2))
if (errors.length) process.exitCode = 1

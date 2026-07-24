import fs from 'node:fs'
import { buildDetailedOutputs, buildQuickOutputs } from '../../src/lib/outputBuilders.ts'

const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'))
const values = (value: unknown) => Array.isArray(value) ? value : Object.values((value ?? {}) as Record<string, unknown>)
const active = read('public/data-beta/interactive-workflows/catalog.json').workflows as Array<{ workflow_id: string; title: string; specialty: string }>
const chips = new Map((values(read('public/data/workflow_chips.json')) as Array<any>).map((entry) => [entry.workflow_id, entry]))
const errors: string[] = []
let cases = 0
for (const entry of active) {
  const workflow = { summary: { workflowId: entry.workflow_id, title: entry.title, specialty: entry.specialty } } as any
  const blankQuick = buildQuickOutputs({ workflow, duration: '', selectedSymptoms: [], selectedNegatives: [], selectedExam: [], selectedPlanItems: [], additionalHistory: '', assessment: '', plan: '' })
  const blankAdvanced = buildDetailedOutputs({ workflow, historyValues: {}, selectedSymptoms: [], selectedNegatives: [], selectedExamPrompts: [], selectedInvestigations: [], assessment: '', plan: '', selectedPlanItems: [], referralReason: '', patientInstructions: '' })
  if (blankQuick.soap || blankAdvanced.soap) errors.push(`${entry.workflow_id}: blank output was non-empty`)
  const available = (chips.get(entry.workflow_id)?.chips ?? []).map((chip: any) => chip.chip_text)
  const selected = available.slice(0, 2)
  const quick = buildQuickOutputs({ workflow, duration: 'SYNTHETIC duration', selectedSymptoms: selected, selectedNegatives: [], selectedExam: [], selectedPlanItems: [], additionalHistory: '', assessment: 'SYNTHETIC impression', plan: 'SYNTHETIC plan' })
  const advanced = buildDetailedOutputs({ workflow, historyValues: { '[duration]': 'SYNTHETIC duration' }, selectedSymptoms: selected, selectedNegatives: ['explicit negative assessed'], selectedRedFlags: ['red flag explicitly assessed'], selectedAdditionalContext: ['course: worsening'], selectedFollowUp: ['follow-up explicitly discussed'], selectedMedications: ['medication explicitly documented'], safetyNetting: 'SYNTHETIC safety-net', selectedExamPrompts: ['Temperature: 38.2'], selectedInvestigations: ['CBC reviewed'], assessment: 'SYNTHETIC impression', plan: 'SYNTHETIC plan', selectedPlanItems: [], referralReason: '', patientInstructions: '' })
  for (const [label, output] of [['quick', quick.soap], ['advanced', advanced.soap]] as const) {
    if (!output.includes('SUBJECTIVE') || !output.includes('ASSESSMENT') || !output.includes('PLAN')) errors.push(`${entry.workflow_id}: ${label} missing SOAP section`)
    if (!output.includes('SYNTHETIC')) errors.push(`${entry.workflow_id}: ${label} synthetic clinician facts missing`)
    if (/https?:\/\/|evidence|guideline|source_id|citation/i.test(output)) errors.push(`${entry.workflow_id}: ${label} evidence leaked into SOAP`)
  }
  if (!advanced.soap.includes('explicit negative assessed') || !advanced.soap.includes('red flag explicitly assessed') || !advanced.soap.includes('medication explicitly documented') || !advanced.soap.includes('SYNTHETIC safety-net')) errors.push(`${entry.workflow_id}: advanced contextual, medication, or safety-net content missing`)
  const negative = buildDetailedOutputs({ workflow, historyValues: {}, selectedSymptoms: [], selectedNegatives: [], selectedExamPrompts: [], selectedInvestigations: [], assessment: '', plan: '', selectedPlanItems: [], referralReason: '', patientInstructions: '' })
  if (negative.hasMeaningfulContent || negative.soap) errors.push(`${entry.workflow_id}: explicit empty case was not empty`)
  cases += 2
}
const result = { status: errors.length ? 'FAIL' : 'PASS', workflows: active.length, mode_cases: cases, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

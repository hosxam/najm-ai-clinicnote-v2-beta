import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDetailedOutputs, buildQuickOutputs } from '../src/lib/outputBuilders.ts'
import { createUnconfirmedQuickNoteSelections } from '../src/lib/quickNoteConfirmation.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'))
}

function indexByWorkflowId(entries) {
  return new Map(entries.map((entry) => [entry.workflow_id, entry]))
}

function makeDetails(workflow, related) {
  return {
    summary: {
      workflowId: workflow.workflow_id,
      title: workflow.chief_complaint || workflow.diagnosis || workflow.workflow_id,
      specialty: workflow.specialty_id,
      diagnosis: workflow.diagnosis,
      aliases: [],
      searchText: '',
    },
    clinical: workflow,
    chips: related.chips ?? null,
    preset: related.preset ?? null,
    historyDraft: null,
    examDetails: null,
    investigationDetails: null,
    planDetails: null,
    medicationDetails: null,
    specialtyLayout: null,
  }
}

function assertFactParity(outputs, facts, workflowId) {
  for (const fact of facts) {
    assert(outputs.soap.includes(fact), `${workflowId}: SOAP omitted selected fact: ${fact}`)
    assert(outputs.emr.includes(fact), `${workflowId}: EMR omitted selected fact: ${fact}`)
  }
}

const [workflows, chipEntries, presets] = await Promise.all([
  readJson('public/data/clinical_workflows.json'),
  readJson('public/data/workflow_chips.json'),
  readJson('public/data/speed_presets.json'),
])

assert.equal(workflows.length, 1500, 'Expected the current 1500-workflow catalog.')
assert.equal(new Set(workflows.map((workflow) => workflow.workflow_id)).size, workflows.length, 'Workflow IDs must be unique.')

const chipsByWorkflow = indexByWorkflowId(chipEntries)
const presetsByWorkflow = indexByWorkflowId(presets)
let suggestedFactCount = 0

for (const workflow of workflows) {
  const workflowId = workflow.workflow_id
  const details = makeDetails(workflow, {
    chips: chipsByWorkflow.get(workflowId),
    preset: presetsByWorkflow.get(workflowId),
  })
  const unconfirmed = createUnconfirmedQuickNoteSelections()
  const preset = presetsByWorkflow.get(workflowId)
  const chips = chipsByWorkflow.get(workflowId)?.chips ?? []
  suggestedFactCount += chips.filter((chip) => ['symptoms', 'relevant_negatives', 'plan_phrases'].includes(chip.group)).length
  for (const key of [
    'prechecked_symptoms',
    'prechecked_relevant_negatives',
    'prechecked_exam_findings',
    'prechecked_investigations',
    'prechecked_plan_phrases',
    'prechecked_follow_up',
  ]) {
    assert.equal(preset?.[key]?.length ?? 0, 0, `${workflowId}: ${key} must remain unconfirmed.`)
  }

  assert.deepEqual(unconfirmed, {
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExam: [],
    selectedPlanItems: [],
  }, `${workflowId}: suggested defaults must begin unconfirmed.`)

  const emptyQuick = buildQuickOutputs({
    workflow: details,
    duration: '',
    additionalHistory: '',
    assessment: '',
    plan: '',
    ...unconfirmed,
  })
  assert.deepEqual(emptyQuick, { soap: '', emr: '', hasMeaningfulContent: false }, `${workflowId}: unconfirmed defaults leaked into output.`)

  const selectedSymptom = `Selected symptom fact [${workflowId}]`
  const unselectedSymptom = `Unselected symptom fact [${workflowId}]`
  const selectedNegative = `Selected negative fact [${workflowId}]`
  const selectedExam = `Selected examination fact [${workflowId}]`
  const selectedPlan = `Selected plan fact [${workflowId}]`
  const quickOutputs = buildQuickOutputs({
    workflow: details,
    duration: '',
    selectedSymptoms: [selectedSymptom],
    selectedNegatives: [selectedNegative],
    selectedExam: [selectedExam],
    selectedPlanItems: [selectedPlan],
    additionalHistory: '',
    assessment: '',
    plan: '',
  })
  assertFactParity(quickOutputs, [selectedSymptom, selectedNegative, selectedExam, selectedPlan], workflowId)
  assert(!quickOutputs.soap.includes(unselectedSymptom), `${workflowId}: SOAP included an unselected fact.`)
  assert(!quickOutputs.emr.includes(unselectedSymptom), `${workflowId}: EMR included an unselected fact.`)
  assert.match(quickOutputs.soap, /^SOAP NOTE/)
  assert.match(quickOutputs.emr, /^SHORT EMR NOTE/)
  assert.notEqual(quickOutputs.soap, quickOutputs.emr, `${workflowId}: SOAP and EMR formats must remain distinct.`)

  const investigation = `Selected investigation fact [${workflowId}]`
  const detailedOutputs = buildDetailedOutputs({
    workflow: details,
    historyValues: {},
    selectedSymptoms: [selectedSymptom],
    selectedNegatives: [selectedNegative],
    selectedExamPrompts: [selectedExam],
    selectedInvestigations: [investigation],
    assessment: '',
    plan: '',
    selectedPlanItems: [selectedPlan],
    referralReason: '',
    patientInstructions: '',
  })
  assertFactParity(detailedOutputs, [selectedSymptom, selectedNegative, selectedExam, investigation, selectedPlan], workflowId)
  assert.equal(detailedOutputs.referral, '', `${workflowId}: referral content appeared without clinician input.`)
  assert.equal(detailedOutputs.patientInstructions, '', `${workflowId}: patient instructions appeared without clinician input.`)
}

console.log(JSON.stringify({
  status: 'PASS',
  workflows_checked: workflows.length,
  suggested_facts_kept_unconfirmed: suggestedFactCount,
  checks: ['unconfirmed defaults', 'selected fact isolation', 'SOAP/EMR parity'],
}, null, 2))

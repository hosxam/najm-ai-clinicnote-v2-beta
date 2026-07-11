import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDetailedOutputs, buildMedicalReportDraft, buildQuickOutputs } from '../src/lib/outputBuilders.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const workflows = JSON.parse(await readFile(path.join(rootDir, 'public/data/clinical_workflows.json'), 'utf8'))
const forbiddenPlaceholders = [
  'History not documented',
  'Examination not documented',
  'Objective findings not documented',
  'Clinician impression not documented',
  'Clinician plan not documented',
]
const labels = [
  'Duration',
  'Symptoms',
  'Important negatives',
  'History',
  'Examination',
  'Investigations reviewed',
  'Impression',
  'Plan',
  'Reason for referral',
  'Relevant history',
  'Relevant examination',
  'Clinician impression',
  'Current clinician plan',
  'Patient instructions',
]

function detailsFor(workflow) {
  return {
    summary: {
      workflowId: workflow.workflow_id,
      title: workflow.chief_complaint || workflow.diagnosis || workflow.workflow_id,
      specialty: workflow.specialty_id,
      diagnosis: workflow.diagnosis,
      aliases: [],
      searchText: '',
    },
  }
}

function assertSafeOutput(output, workflowId, outputName) {
  assert.equal(typeof output, 'string', `${workflowId}: ${outputName} must be a string.`)
  for (const placeholder of forbiddenPlaceholders) {
    assert(!output.includes(placeholder), `${workflowId}: ${outputName} leaked placeholder: ${placeholder}`)
  }
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.doesNotMatch(output, new RegExp(`${escaped}:\\s*${escaped}:`, 'i'), `${workflowId}: ${outputName} duplicated ${label}.`)
  }
}

assert.equal(workflows.length, 1500, 'Expected the current 1500-workflow catalog.')

for (const workflow of workflows) {
  const details = detailsFor(workflow)
  const workflowId = workflow.workflow_id
  const fact = `Clinician-confirmed fact [${workflowId}]`
  let quickOutputs
  let detailedOutputs
  let medicalReport

  assert.doesNotThrow(() => {
    quickOutputs = buildQuickOutputs({
      workflow: details,
      duration: 'Duration: Duration: ',
      selectedSymptoms: [`Symptoms: Symptoms: ${fact}`],
      selectedNegatives: ['Important negatives: Important negatives: '],
      selectedExam: [`Examination: Examination: ${fact}`],
      selectedPlanItems: [`Plan: Plan: ${fact}`],
      additionalHistory: 'History: History: ',
      assessment: 'Impression: Impression: ',
      plan: 'Plan: Plan: ',
    })
    detailedOutputs = buildDetailedOutputs({
      workflow: details,
      historyValues: {
        '[Presenting complaint]': `Presenting complaint: Presenting complaint: ${fact}`,
        '[Empty placeholder]': 'Empty placeholder:',
      },
      selectedSymptoms: [`Symptoms: Symptoms: ${fact}`],
      selectedNegatives: ['Important negatives: Important negatives: '],
      selectedExamPrompts: [`Examination: Examination: ${fact}`],
      selectedInvestigations: [`Investigations reviewed: Investigations reviewed: ${fact}`],
      assessment: `Clinician impression: Clinician impression: ${fact}`,
      plan: '',
      selectedPlanItems: [`Current clinician plan: Current clinician plan: ${fact}`],
      referralReason: `Reason for referral: Reason for referral: ${fact}`,
      patientInstructions: `Patient instructions: Patient instructions: ${fact}`,
    })
    medicalReport = buildMedicalReportDraft(details, {
      reportPurpose: fact,
      summary: '',
      findings: fact,
      assessment: '',
      plan: '',
      requestedAction: '',
    })
  }, `${workflowId}: an output builder threw.`)

  for (const [name, output] of Object.entries({
    quickSoap: quickOutputs.soap,
    quickEmr: quickOutputs.emr,
    detailedSoap: detailedOutputs.soap,
    detailedEmr: detailedOutputs.emr,
    referral: detailedOutputs.referral,
    patientInstructions: detailedOutputs.patientInstructions,
    medicalReport,
  })) {
    assertSafeOutput(output, workflowId, name)
  }
  assert(quickOutputs.soap.includes(fact) && quickOutputs.emr.includes(fact), `${workflowId}: quick output parity failed.`)
  assert(detailedOutputs.soap.includes(fact) && detailedOutputs.emr.includes(fact), `${workflowId}: detailed output parity failed.`)
}

console.log(JSON.stringify({
  status: 'PASS',
  workflows_checked: workflows.length,
  outputs_checked: workflows.length * 7,
  checks: ['non-throwing builders', 'duplicate labels', 'forbidden placeholders'],
}, null, 2))

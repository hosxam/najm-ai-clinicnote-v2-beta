import { cleanPlaceholderLabel, normalizeDisplayText } from './labelUtils'
import type { WorkflowDetails } from '../types/clinicnote'

type QuickNoteInput = {
  workflow: WorkflowDetails
  duration: string
  selectedSymptoms: string[]
  selectedNegatives: string[]
  selectedExam: string[]
  selectedPlanItems: string[]
  additionalHistory: string
  assessment: string
  plan: string
}

type DetailedEncounterInput = {
  workflow: WorkflowDetails
  historyValues: Record<string, string>
  selectedSymptoms: string[]
  selectedNegatives: string[]
  selectedExamPrompts: string[]
  selectedInvestigations: string[]
  assessment: string
  plan: string
  selectedPlanItems: string[]
  referralReason: string
  patientInstructions: string
}

function lineJoin(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join('\n')
}

function bulletJoin(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join('; ')
}

export function buildQuickSoapDraft(input: QuickNoteInput) {
  const subjective = [
    input.duration ? `Duration: ${input.duration}` : '',
    input.selectedSymptoms.length ? `Symptoms: ${bulletJoin(input.selectedSymptoms)}` : '',
    input.selectedNegatives.length ? `Important negatives: ${bulletJoin(input.selectedNegatives)}` : '',
    input.additionalHistory,
  ]

  const objective = [
    input.selectedExam.length ? `Examination: ${bulletJoin(input.selectedExam)}` : 'Examination not documented.',
  ]

  const assessment = input.assessment.trim() || 'Clinician impression not documented.'
  const plan = bulletJoin([input.plan, ...input.selectedPlanItems]) || 'Clinician plan not documented.'

  return `SOAP NOTE\n\nSUBJECTIVE\n${lineJoin(subjective) || 'History not documented.'}\n\nOBJECTIVE\n${lineJoin(objective)}\n\nASSESSMENT\n${assessment}\n\nPLAN\n${plan}\n\nDraft generated from clinician-entered information. Review and approve before use.`
}

export function buildDetailedOutputs(input: DetailedEncounterInput) {
  const historyLines = Object.entries(input.historyValues)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${cleanPlaceholderLabel(key)}: ${value.trim()}`)

  const subjective = lineJoin([
    ...historyLines,
    input.selectedSymptoms.length ? `Symptoms: ${bulletJoin(input.selectedSymptoms)}` : '',
    input.selectedNegatives.length ? `Important negatives: ${bulletJoin(input.selectedNegatives)}` : '',
  ]) || 'History not documented.'

  const objective = lineJoin([
    input.selectedExamPrompts.length ? `Examination: ${bulletJoin(input.selectedExamPrompts)}` : 'Examination not documented.',
    input.selectedInvestigations.length ? `Investigations reviewed: ${bulletJoin(input.selectedInvestigations)}` : '',
  ]) || 'Objective findings not documented.'

  const assessment = input.assessment.trim() || 'Clinician impression not documented.'
  const plan = bulletJoin([input.plan, ...input.selectedPlanItems]) || 'Clinician plan not documented.'

  const soap = `SOAP NOTE\n\nSUBJECTIVE\n${subjective}\n\nOBJECTIVE\n${objective}\n\nASSESSMENT\n${assessment}\n\nPLAN\n${plan}\n\nDraft generated from clinician-entered information. Review and approve before use.`

  const emr = `SHORT EMR NOTE\n\nWorkflow: ${input.workflow.summary.title}\nSpecialty: ${normalizeDisplayText(input.workflow.summary.specialty)}\n\nHistory: ${subjective}\nExamination: ${objective}\nImpression: ${assessment}\nPlan: ${plan}\n\nDraft generated from clinician-entered information. Review and approve before use.`

  const referral = input.referralReason.trim()
    ? `REFERRAL LETTER\n\nReason for referral: ${input.referralReason.trim()}\nRelevant history: ${subjective}\nRelevant examination: ${objective}\nClinician impression: ${assessment}\nCurrent clinician plan: ${plan}\n\nDraft generated from clinician-entered information. Review and approve before use.`
    : 'Referral letter not documented. Enter a clinician-stated referral reason to generate this draft.'

  const patientInstructions = input.patientInstructions.trim()
    ? `PATIENT INSTRUCTIONS\n\n${input.patientInstructions.trim()}\n\nDraft generated from clinician-entered information. Review and approve before use.`
    : 'Patient instructions not documented. Enter clinician-stated instructions if you need this output.'

  return { soap, emr, referral, patientInstructions }
}

export function buildMedicalReportDraft(workflow: WorkflowDetails | null, values: Record<string, string>) {
  const reportSections = [
    values.reportPurpose ? `Purpose: ${values.reportPurpose}` : '',
    workflow ? `Workflow: ${workflow.summary.title} (${normalizeDisplayText(workflow.summary.specialty)})` : '',
    values.summary ? `Clinical summary: ${values.summary}` : '',
    values.findings ? `Findings: ${values.findings}` : '',
    values.assessment ? `Clinician impression: ${values.assessment}` : 'Clinician impression not documented.',
    values.plan ? `Clinician plan: ${values.plan}` : 'Clinician plan not documented.',
    values.requestedAction ? `Requested action: ${values.requestedAction}` : '',
  ].filter(Boolean)

  return `MEDICAL REPORT / LETTER DRAFT\n\n${reportSections.join('\n\n')}\n\nDraft generated from clinician-entered information. Review and approve before use.`
}

import { cleanPlaceholderLabel, normalizeDisplayText } from './labelUtils.ts'
import type { WorkflowDetails } from '../types/clinicnote.ts'

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

type NoteSections = {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

const draftReviewFooter = 'Draft generated from clinician-entered information. Review and approve before use.'

function lineJoin(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join('\n')
}

function bulletJoin(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join('; ')
}

function hasMeaningfulSections(sections: NoteSections) {
  return Boolean(sections.subjective || sections.objective || sections.assessment || sections.plan)
}

function buildSoapDraft(sections: NoteSections) {
  if (!hasMeaningfulSections(sections)) return ''

  const parts = ['SOAP NOTE']
  if (sections.subjective) parts.push(`SUBJECTIVE\n${sections.subjective}`)
  if (sections.objective) parts.push(`OBJECTIVE\n${sections.objective}`)
  if (sections.assessment) parts.push(`ASSESSMENT\n${sections.assessment}`)
  if (sections.plan) parts.push(`PLAN\n${sections.plan}`)
  parts.push(draftReviewFooter)
  return parts.join('\n\n')
}

function buildEmrDraft(workflow: WorkflowDetails, sections: NoteSections) {
  if (!hasMeaningfulSections(sections)) return ''

  const parts = [
    'SHORT EMR NOTE',
    `Workflow: ${workflow.summary.title}\nSpecialty: ${normalizeDisplayText(workflow.summary.specialty)}`,
  ]
  if (sections.subjective) parts.push(`History: ${sections.subjective}`)
  if (sections.objective) parts.push(`Examination: ${sections.objective}`)
  if (sections.assessment) parts.push(`Impression: ${sections.assessment}`)
  if (sections.plan) parts.push(`Plan: ${sections.plan}`)
  parts.push(draftReviewFooter)
  return parts.join('\n\n')
}

function getQuickNoteSections(input: QuickNoteInput): NoteSections {
  const subjective = lineJoin([
    input.duration ? `Duration: ${input.duration}` : '',
    input.selectedSymptoms.length ? `Symptoms: ${bulletJoin(input.selectedSymptoms)}` : '',
    input.selectedNegatives.length ? `Important negatives: ${bulletJoin(input.selectedNegatives)}` : '',
    input.additionalHistory,
  ])

  const objective = input.selectedExam.length ? `Examination: ${bulletJoin(input.selectedExam)}` : ''

  const assessment = input.assessment.trim()
  const plan = bulletJoin([input.plan, ...input.selectedPlanItems])

  return { subjective, objective, assessment, plan }
}

export function buildQuickOutputs(input: QuickNoteInput) {
  const sections = getQuickNoteSections(input)
  return {
    soap: buildSoapDraft(sections),
    emr: buildEmrDraft(input.workflow, sections),
    hasMeaningfulContent: hasMeaningfulSections(sections),
  }
}

export function buildQuickSoapDraft(input: QuickNoteInput) {
  return buildQuickOutputs(input).soap
}

export function buildDetailedOutputs(input: DetailedEncounterInput) {
  const historyLines = Object.entries(input.historyValues)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${cleanPlaceholderLabel(key)}: ${value.trim()}`)

  const subjective = lineJoin([
    ...historyLines,
    input.selectedSymptoms.length ? `Symptoms: ${bulletJoin(input.selectedSymptoms)}` : '',
    input.selectedNegatives.length ? `Important negatives: ${bulletJoin(input.selectedNegatives)}` : '',
  ])

  const objective = lineJoin([
    input.selectedExamPrompts.length ? `Examination: ${bulletJoin(input.selectedExamPrompts)}` : '',
    input.selectedInvestigations.length ? `Investigations reviewed: ${bulletJoin(input.selectedInvestigations)}` : '',
  ])

  const assessment = input.assessment.trim()
  const plan = bulletJoin([input.plan, ...input.selectedPlanItems])

  const sections = { subjective, objective, assessment, plan }
  const soap = buildSoapDraft(sections)
  const emr = buildEmrDraft(input.workflow, sections)

  const referralParts = input.referralReason.trim()
    ? ['REFERRAL LETTER', `Reason for referral: ${input.referralReason.trim()}`]
    : []
  if (referralParts.length && subjective) referralParts.push(`Relevant history: ${subjective}`)
  if (referralParts.length && objective) referralParts.push(`Relevant examination: ${objective}`)
  if (referralParts.length && assessment) referralParts.push(`Clinician impression: ${assessment}`)
  if (referralParts.length && plan) referralParts.push(`Current clinician plan: ${plan}`)
  if (referralParts.length) referralParts.push(draftReviewFooter)
  const referral = referralParts.join('\n\n')

  const patientInstructions = input.patientInstructions.trim()
    ? `PATIENT INSTRUCTIONS\n\n${input.patientInstructions.trim()}\n\n${draftReviewFooter}`
    : ''

  return {
    soap,
    emr,
    referral,
    patientInstructions,
    hasMeaningfulContent: hasMeaningfulSections(sections),
    hasReferralContent: Boolean(referral),
    hasPatientInstructionsContent: Boolean(patientInstructions),
  }
}

export function buildMedicalReportDraft(workflow: WorkflowDetails | null, values: Record<string, string>) {
  const hasEnteredContent = Object.values(values).some((value) => value.trim())
  if (!hasEnteredContent) return ''

  const reportSections = [
    values.reportPurpose ? `Purpose: ${values.reportPurpose}` : '',
    workflow ? `Workflow: ${workflow.summary.title} (${normalizeDisplayText(workflow.summary.specialty)})` : '',
    values.summary ? `Clinical summary: ${values.summary}` : '',
    values.findings ? `Findings: ${values.findings}` : '',
    values.assessment ? `Clinician impression: ${values.assessment}` : '',
    values.plan ? `Clinician plan: ${values.plan}` : '',
    values.requestedAction ? `Requested action: ${values.requestedAction}` : '',
  ].filter(Boolean)

  return `MEDICAL REPORT / LETTER DRAFT\n\n${reportSections.join('\n\n')}\n\n${draftReviewFooter}`
}

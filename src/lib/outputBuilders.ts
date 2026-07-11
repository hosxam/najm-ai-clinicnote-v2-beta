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
  examination: string
  investigations: string
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cleanLeadingLabels(value: string, labels: string[]) {
  const normalizedLabels = labels
    .map((label) => label.replace(/:\s*$/, '').trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)

  if (!normalizedLabels.length) return value.trim()

  const labelPattern = normalizedLabels.map(escapeRegExp).join('|')
  return value
    .trim()
    .replace(new RegExp(`^(?:(?:${labelPattern})\\s*:\\s*)+`, 'i'), '')
    .trim()
}

function labeledLine(label: string, value: string, aliases: string[] = []) {
  const normalizedLabel = label.replace(/:\s*$/, '').trim()
  const content = cleanLeadingLabels(value, [normalizedLabel, ...aliases])
  if (!content) return ''
  return normalizedLabel ? `${normalizedLabel}: ${content}` : content
}

function labeledListLine(label: string, values: string[], aliases: string[] = []) {
  const content = bulletJoin(values.map((value) => cleanLeadingLabels(value, [label, ...aliases])))
  return content ? labeledLine(label, content, aliases) : ''
}

function buildObjectiveText(sections: NoteSections) {
  return lineJoin([
    sections.examination ? labeledLine('Examination', sections.examination, ['Relevant examination']) : '',
    sections.investigations
      ? labeledLine('Investigations reviewed', sections.investigations, ['Investigations'])
      : '',
  ])
}

function hasMeaningfulSections(sections: NoteSections) {
  return Boolean(
    sections.subjective
      || sections.examination
      || sections.investigations
      || sections.assessment
      || sections.plan,
  )
}

function buildSoapDraft(sections: NoteSections) {
  if (!hasMeaningfulSections(sections)) return ''

  const objective = buildObjectiveText(sections)
  const parts = ['SOAP NOTE']
  if (sections.subjective) parts.push(`SUBJECTIVE\n${sections.subjective}`)
  if (objective) parts.push(`OBJECTIVE\n${objective}`)
  if (sections.assessment) parts.push(`ASSESSMENT\n${sections.assessment}`)
  if (sections.plan) parts.push(`PLAN\n${sections.plan}`)
  parts.push(draftReviewFooter)
  return parts.join('\n\n')
}

function buildEmrDraft(workflow: WorkflowDetails, sections: NoteSections) {
  if (!hasMeaningfulSections(sections)) return ''

  const objective = buildObjectiveText(sections)
  const parts = [
    'SHORT EMR NOTE',
    `Workflow: ${workflow.summary.title}\nSpecialty: ${normalizeDisplayText(workflow.summary.specialty)}`,
  ]
  if (sections.subjective) parts.push(`HISTORY\n${sections.subjective}`)
  if (objective) parts.push(objective)
  if (sections.assessment) parts.push(`Impression: ${sections.assessment}`)
  if (sections.plan) parts.push(`Plan: ${sections.plan}`)
  parts.push(draftReviewFooter)
  return parts.join('\n\n')
}

function getQuickNoteSections(input: QuickNoteInput): NoteSections {
  const subjective = lineJoin([
    labeledLine('Duration', input.duration),
    labeledListLine('Symptoms', input.selectedSymptoms),
    labeledListLine('Important negatives', input.selectedNegatives),
    cleanLeadingLabels(input.additionalHistory, ['History', 'Relevant history']),
  ])

  const examination = bulletJoin(
    input.selectedExam.map((value) => cleanLeadingLabels(value, ['Examination', 'Relevant examination'])),
  )
  const investigations = ''
  const assessment = cleanLeadingLabels(input.assessment, ['Assessment', 'Impression', 'Clinician impression'])
  const plan = bulletJoin(
    [input.plan, ...input.selectedPlanItems]
      .map((value) => cleanLeadingLabels(value, ['Plan', 'Clinician plan', 'Current clinician plan'])),
  )

  return { subjective, examination, investigations, assessment, plan }
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
    .map(([key, value]) => labeledLine(cleanPlaceholderLabel(key), value))

  const subjective = lineJoin([
    ...historyLines,
    labeledListLine('Symptoms', input.selectedSymptoms),
    labeledListLine('Important negatives', input.selectedNegatives),
  ])

  const examination = bulletJoin(
    input.selectedExamPrompts
      .map((value) => cleanLeadingLabels(value, ['Examination', 'Relevant examination'])),
  )
  const investigations = bulletJoin(
    input.selectedInvestigations
      .map((value) => cleanLeadingLabels(value, ['Investigations reviewed', 'Investigations'])),
  )
  const assessment = cleanLeadingLabels(input.assessment, ['Assessment', 'Impression', 'Clinician impression'])
  const plan = bulletJoin(
    [input.plan, ...input.selectedPlanItems]
      .map((value) => cleanLeadingLabels(value, ['Plan', 'Clinician plan', 'Current clinician plan'])),
  )

  const sections = { subjective, examination, investigations, assessment, plan }
  const soap = buildSoapDraft(sections)
  const emr = buildEmrDraft(input.workflow, sections)

  const referralReason = cleanLeadingLabels(input.referralReason, ['Reason for referral', 'Referral reason'])
  const referralParts = referralReason
    ? ['REFERRAL LETTER', `Reason for referral: ${referralReason}`]
    : []
  if (referralParts.length && subjective) referralParts.push(`RELEVANT HISTORY\n${subjective}`)
  if (referralParts.length && examination) referralParts.push(`Relevant examination: ${examination}`)
  if (referralParts.length && investigations) {
    referralParts.push(`Investigations reviewed: ${investigations}`)
  }
  if (referralParts.length && assessment) referralParts.push(`Clinician impression: ${assessment}`)
  if (referralParts.length && plan) referralParts.push(`Current clinician plan: ${plan}`)
  if (referralParts.length) referralParts.push(draftReviewFooter)
  const referral = referralParts.join('\n\n')

  const instructionText = cleanLeadingLabels(input.patientInstructions, ['Patient instructions', 'Instructions'])
  const patientInstructions = instructionText
    ? `PATIENT INSTRUCTIONS\n\n${instructionText}\n\n${draftReviewFooter}`
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

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { COMMON_WORKFLOW_IDS } from '../src/lib/commonWorkflows.ts'
import { buildDetailedOutputs, buildMedicalReportDraft, buildQuickOutputs } from '../src/lib/outputBuilders.ts'
import {
  confirmSuggestedQuickNoteSelections,
  createUnconfirmedQuickNoteSelections,
  QUICK_NOTE_CONFIRMATION_MODEL_VERSION,
  restoreConfirmedQuickNoteSelections,
} from '../src/lib/quickNoteConfirmation.ts'
import { selectHomeModeWorkflow } from '../src/lib/workflowSelection.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const fakeWorkflow = {
  summary: {
    workflowId: 'test-safe-documentation',
    title: 'Safe documentation test',
    specialty: 'General Medicine / GP',
    diagnosis: '',
    aliases: [],
    searchText: '',
  },
}

const suggested = {
  symptoms: ['Fever', 'Dry cough', 'Productive cough'],
  relevantNegatives: ['No vomiting'],
  planPhrases: ['Clinician documented follow-up discussion'],
}

function quickInput(selections, overrides = {}) {
  return {
    workflow: fakeWorkflow,
    duration: '',
    additionalHistory: '',
    assessment: '',
    plan: '',
    ...selections,
    ...overrides,
  }
}

function detailedInput(overrides = {}) {
  return {
    workflow: fakeWorkflow,
    historyValues: {},
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExamPrompts: [],
    selectedInvestigations: [],
    assessment: '',
    plan: '',
    selectedPlanItems: [],
    referralReason: '',
    patientInstructions: '',
    ...overrides,
  }
}

function assertContainsFacts(output, facts) {
  for (const fact of facts) assert.match(output, new RegExp(fact, 'i'))
}

function assertSoapEmrFactParity(output, facts) {
  assertContainsFacts(output.soap, facts)
  assertContainsFacts(output.emr, facts)
}

function assertNoDuplicateLabels(output) {
  for (const label of [
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
  ]) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.doesNotMatch(
      output,
      new RegExp(`${escapedLabel}:\\s*${escapedLabel}:`, 'i'),
      `Output repeats the ${label} label.`,
    )
  }
}

const initialSelections = createUnconfirmedQuickNoteSelections()
assert.deepEqual(initialSelections, {
  selectedSymptoms: [],
  selectedNegatives: [],
  selectedExam: [],
  selectedPlanItems: [],
})

const initialOutput = buildQuickOutputs(quickInput(initialSelections))
assert.equal(initialOutput.soap, '', 'Initial SOAP must contain no unconfirmed suggestions.')
assert.equal(initialOutput.emr, '', 'Initial EMR must contain no unconfirmed suggestions.')
assert.equal(initialOutput.hasMeaningfulContent, false)

const legacyRestore = restoreConfirmedQuickNoteSelections({
  selectedSymptoms: suggested.symptoms,
  selectedNegatives: suggested.relevantNegatives,
  selectedPlanItems: suggested.planPhrases,
})
assert.deepEqual(legacyRestore, initialSelections, 'Legacy drafts must not restore formerly automatic selections.')

const versionedRestore = restoreConfirmedQuickNoteSelections({
  confirmationModelVersion: QUICK_NOTE_CONFIRMATION_MODEL_VERSION,
  selectedSymptoms: ['Fever'],
})
assert.deepEqual(versionedRestore.selectedSymptoms, ['Fever'])

const beforeConfirmation = buildQuickOutputs(quickInput(initialSelections))
assert.doesNotMatch(beforeConfirmation.soap, /follow-up discussion/i, 'Suggested plans must stay out before confirmation.')

const bulkConfirmed = confirmSuggestedQuickNoteSelections(initialSelections, suggested)
assert.deepEqual(bulkConfirmed.selectedSymptoms, ['Fever'])
assert.deepEqual(bulkConfirmed.selectedNegatives, ['No vomiting'])
assert.deepEqual(bulkConfirmed.selectedPlanItems, ['Clinician documented follow-up discussion'])
assert.deepEqual(bulkConfirmed.selectedExam, [], 'Examination must remain manual.')
assert(!bulkConfirmed.selectedSymptoms.includes('Dry cough'))
assert(!bulkConfirmed.selectedSymptoms.includes('Productive cough'))

const bulkOutput = buildQuickOutputs(quickInput(bulkConfirmed))
assertContainsFacts(bulkOutput.soap, ['Fever', 'No vomiting', 'follow-up discussion'])
assertContainsFacts(bulkOutput.emr, ['Fever', 'No vomiting', 'follow-up discussion'])
assert.notEqual(bulkOutput.soap, bulkOutput.emr, 'SOAP and EMR formats must be distinct.')
assert.match(bulkOutput.soap, /^SOAP NOTE/)
assert.match(bulkOutput.emr, /^SHORT EMR NOTE/)

const prefixedQuickFacts = [
  'Two days',
  'Fever',
  'No vomiting',
  'Clinician-entered history',
  'Lungs clear',
  'Viral syndrome',
  'Hydration discussed',
  'Review as documented',
]
const prefixedQuickOutput = buildQuickOutputs(quickInput({
  selectedSymptoms: ['Symptoms: Fever'],
  selectedNegatives: ['Important negatives: No vomiting'],
  selectedExam: ['Examination: Examination: Lungs clear'],
  selectedPlanItems: ['Plan: Review as documented'],
}, {
  duration: 'Duration: Two days',
  additionalHistory: 'History: Clinician-entered history',
  assessment: 'Impression: Viral syndrome',
  plan: 'Plan: Hydration discussed',
}))
assertSoapEmrFactParity(prefixedQuickOutput, prefixedQuickFacts)
assertNoDuplicateLabels(prefixedQuickOutput.soap)
assertNoDuplicateLabels(prefixedQuickOutput.emr)
assert.equal((prefixedQuickOutput.soap.match(/Examination:/gi) ?? []).length, 1)
assert.equal((prefixedQuickOutput.emr.match(/Examination:/gi) ?? []).length, 1)

const individuallyConfirmedDry = buildQuickOutputs(quickInput({
  ...initialSelections,
  selectedSymptoms: ['Dry cough'],
}))
assert.match(individuallyConfirmedDry.soap, /Dry cough/)
assert.doesNotMatch(individuallyConfirmedDry.soap, /Productive cough/)

const individuallyConfirmedBoth = buildQuickOutputs(quickInput({
  ...initialSelections,
  selectedSymptoms: ['Dry cough', 'Productive cough'],
}))
assert.match(individuallyConfirmedBoth.soap, /Dry cough/)
assert.match(individuallyConfirmedBoth.soap, /Productive cough/)

const subjectiveOnly = buildQuickOutputs(quickInput(initialSelections, { additionalHistory: 'Clinician-confirmed history.' }))
for (const forbidden of [
  'History not documented',
  'Examination not documented',
  'Objective findings not documented',
  'Clinician impression not documented',
  'Clinician plan not documented',
]) {
  assert(!subjectiveOnly.soap.includes(forbidden), `Placeholder leaked: ${forbidden}`)
  assert(!subjectiveOnly.emr.includes(forbidden), `Placeholder leaked: ${forbidden}`)
}
assert.doesNotMatch(subjectiveOnly.soap, /OBJECTIVE|ASSESSMENT|PLAN/)
assert.doesNotMatch(subjectiveOnly.emr, /Examination:|Impression:|Plan:/)

const emptyDetailedOutput = buildDetailedOutputs(detailedInput())
assert.equal(emptyDetailedOutput.soap, '')
assert.equal(emptyDetailedOutput.emr, '')
assert.equal(emptyDetailedOutput.referral, '')
assert.equal(emptyDetailedOutput.patientInstructions, '')
assert.equal(emptyDetailedOutput.hasMeaningfulContent, false)
assert.equal(emptyDetailedOutput.hasReferralContent, false)
assert.equal(emptyDetailedOutput.hasPatientInstructionsContent, false)

const prefixedDetailedFacts = [
  'Persistent cough',
  'Fever',
  'No hemoptysis',
  'Bilateral air entry',
  'Chest radiograph reviewed',
  'Lower respiratory infection',
  'Continue clinician-stated care',
  'Safety-net advice documented',
]
const prefixedDetailedOutput = buildDetailedOutputs(detailedInput({
  historyValues: {
    '[Presenting complaint]': 'Presenting complaint: Persistent cough',
  },
  selectedSymptoms: ['Symptoms: Fever'],
  selectedNegatives: ['Important negatives: No hemoptysis'],
  selectedExamPrompts: ['Examination: Examination: Bilateral air entry'],
  selectedInvestigations: [
    'Investigations reviewed: Investigations reviewed: Chest radiograph reviewed',
  ],
  assessment: 'Clinician impression: Lower respiratory infection',
  plan: 'Current clinician plan: Continue clinician-stated care',
  selectedPlanItems: ['Plan: Safety-net advice documented'],
  referralReason: 'Reason for referral: Reason for referral: Specialist review requested',
  patientInstructions: 'Patient instructions: Follow clinician-stated advice',
}))
assertSoapEmrFactParity(prefixedDetailedOutput, prefixedDetailedFacts)
assertContainsFacts(prefixedDetailedOutput.referral, [
  ...prefixedDetailedFacts,
  'Specialist review requested',
])
assert.match(prefixedDetailedOutput.patientInstructions, /Follow clinician-stated advice/)
for (const output of [
  prefixedDetailedOutput.soap,
  prefixedDetailedOutput.emr,
  prefixedDetailedOutput.referral,
  prefixedDetailedOutput.patientInstructions,
]) {
  assertNoDuplicateLabels(output)
}
assert.equal((prefixedDetailedOutput.soap.match(/Investigations reviewed:/gi) ?? []).length, 1)
assert.equal((prefixedDetailedOutput.emr.match(/Investigations reviewed:/gi) ?? []).length, 1)
assert.equal((prefixedDetailedOutput.referral.match(/Investigations reviewed:/gi) ?? []).length, 1)

const investigationOnlyOutput = buildDetailedOutputs(detailedInput({
  selectedInvestigations: ['Investigations reviewed: Blood test reviewed'],
}))
assertSoapEmrFactParity(investigationOnlyOutput, ['Blood test reviewed'])
assert.match(investigationOnlyOutput.soap, /OBJECTIVE/)
assert.doesNotMatch(investigationOnlyOutput.soap, /SUBJECTIVE|ASSESSMENT|PLAN/)
assert.doesNotMatch(investigationOnlyOutput.emr, /\nHISTORY(?:\n|$)|Examination:|Impression:|Plan:/)
assert.equal(investigationOnlyOutput.referral, '')
assert.equal(investigationOnlyOutput.patientInstructions, '')

const documentedNoteWithoutAncillaryDrafts = buildDetailedOutputs(detailedInput({
  selectedSymptoms: ['Clinician-confirmed symptom'],
  assessment: 'Clinician-entered assessment',
}))
assert.notEqual(documentedNoteWithoutAncillaryDrafts.soap, '')
assert.notEqual(documentedNoteWithoutAncillaryDrafts.emr, '')
assert.equal(documentedNoteWithoutAncillaryDrafts.referral, '')
assert.equal(documentedNoteWithoutAncillaryDrafts.patientInstructions, '')
assert.equal(documentedNoteWithoutAncillaryDrafts.hasReferralContent, false)
assert.equal(documentedNoteWithoutAncillaryDrafts.hasPatientInstructionsContent, false)

const labelOnlyAncillaryDrafts = buildDetailedOutputs(detailedInput({
  referralReason: 'Reason for referral:',
  patientInstructions: 'Patient instructions:',
}))
assert.equal(labelOnlyAncillaryDrafts.referral, '')
assert.equal(labelOnlyAncillaryDrafts.patientInstructions, '')
assert.equal(labelOnlyAncillaryDrafts.hasReferralContent, false)
assert.equal(labelOnlyAncillaryDrafts.hasPatientInstructionsContent, false)

assert.equal(buildMedicalReportDraft(null, {
  reportPurpose: '',
  summary: '',
  findings: '',
  assessment: '',
  plan: '',
  requestedAction: '',
}), '')

const commonWorkflow = { workflowId: 'gp-cold' }
const recentWorkflow = { workflowId: 'gp-diabetes-followup' }
assert.equal(selectHomeModeWorkflow({
  hasActiveFilter: true,
  matchingWorkflows: [],
  commonWorkflows: [commonWorkflow],
  recentWorkflows: [recentWorkflow],
}), null, 'An active no-result filter must not fall back to an unrelated workflow.')
assert.equal(selectHomeModeWorkflow({
  hasActiveFilter: false,
  matchingWorkflows: [],
  commonWorkflows: [commonWorkflow],
  recentWorkflows: [recentWorkflow],
})?.workflowId, 'gp-cold')

const prohibitedShortcutTerms = [
  'chest-pain',
  'abdominal-pain',
  'pregnancy-bleeding',
  'airway',
  'sepsis',
  'suicidality',
  'safeguarding',
]
for (const workflowId of COMMON_WORKFLOW_IDS) {
  for (const prohibitedTerm of prohibitedShortcutTerms) {
    assert(!workflowId.includes(prohibitedTerm), `Unsafe shortcut ${workflowId} contains ${prohibitedTerm}.`)
  }
}

const exclusions = JSON.parse(await readFile(path.join(rootDir, 'public/config/limited_testing_exclusions.json'), 'utf8'))
const originalExcludedWorkflowIds = [
  'anes-airway-review-documentation',
  'derm-pigmented-lesion-review',
  'ed-pregnancy-bleeding-documentation',
  'icu-sepsis-review-documentation',
  'peds-safeguarding-prompt-documentation',
  'psych-suicidality-screening-documentation',
  'cardio-medication-review',
  'gi-medication-review',
  'peds-pediatric-medication-review',
  'resp-medication-review',
  'rheum-medication-review',
  'uro-urology-medication-review',
]
assert(exclusions.exclusions.length >= originalExcludedWorkflowIds.length, 'The original limited-testing exclusions must not be lost.')
for (const workflowId of originalExcludedWorkflowIds) {
  assert(exclusions.exclusions.some((entry) => entry.workflow_id === workflowId), `Missing original exclusion: ${workflowId}`)
}
assert(exclusions.exclusions.some((entry) => entry.workflow_id === 'icu-sepsis-review-documentation'))

const quickNoteSource = await readFile(path.join(rootDir, 'src/pages/QuickNotePage.tsx'), 'utf8')
assert.match(quickNoteSource, /summary\?\.exclusion/)
assert.match(quickNoteSource, /excluded from limited internal testing pending medical review/)
assert.match(quickNoteSource, /Confirm suggested items/)
assert.doesNotMatch(quickNoteSource, /Use defaults/)

const homeSource = await readFile(path.join(rootDir, 'src/pages/HomePage.tsx'), 'utf8')
assert.match(homeSource, /Choose a matching workflow first/)
assert.match(homeSource, /Common documentation workflows/)

const outputBuilderSource = await readFile(path.join(rootDir, 'src/lib/outputBuilders.ts'), 'utf8')
for (const forbidden of [
  'History not documented',
  'Examination not documented',
  'Objective findings not documented',
  'Clinician impression not documented',
  'Clinician plan not documented',
]) {
  assert(!outputBuilderSource.includes(forbidden), `Output builder contains forbidden placeholder: ${forbidden}`)
}

const outputPanelSource = await readFile(path.join(rootDir, 'src/components/OutputPanel.tsx'), 'utf8')
assert.match(outputPanelSource, /disabled={!canExport}/)

const feedbackSource = await readFile(path.join(rootDir, 'src/pages/FeedbackPage.tsx'), 'utf8')
assert.match(feedbackSource, /Copy feedback/)
assert.match(feedbackSource, /Download feedback as JSON/)

const deploymentWorkflow = await readFile(path.join(rootDir, '.github/workflows/deploy.yml'), 'utf8')
assert.match(deploymentWorkflow, /VITE_BUILD_SHA: \$\{\{ github\.sha \}\}/)

console.log(JSON.stringify({
  status: 'PASS',
  tests: 21,
  common_shortcuts: COMMON_WORKFLOW_IDS,
  exclusions_checked: exclusions.exclusions.length,
}, null, 2))

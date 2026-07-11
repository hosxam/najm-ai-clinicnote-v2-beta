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

function assertContainsFacts(output, facts) {
  for (const fact of facts) assert.match(output, new RegExp(fact, 'i'))
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

const emptyDetailedOutput = buildDetailedOutputs({
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
})
assert.equal(emptyDetailedOutput.soap, '')
assert.equal(emptyDetailedOutput.emr, '')
assert.equal(emptyDetailedOutput.referral, '')
assert.equal(emptyDetailedOutput.patientInstructions, '')
assert.equal(emptyDetailedOutput.hasMeaningfulContent, false)
assert.equal(emptyDetailedOutput.hasReferralContent, false)
assert.equal(emptyDetailedOutput.hasPatientInstructionsContent, false)

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
assert.equal(exclusions.exclusions.length, 12, 'The limited-testing exclusion count must remain 12.')
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
  tests: 16,
  common_shortcuts: COMMON_WORKFLOW_IDS,
  exclusions_checked: exclusions.exclusions.length,
}, null, 2))

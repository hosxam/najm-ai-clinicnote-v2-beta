import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

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

const requiredFiles = [
  'public/data/clinical_workflows.json',
  'public/data/workflow_chips.json',
  'public/data/diagnosis_index.json',
  'public/data/speed_presets.json',
  'public/data/specialty_history_layouts.json',
  'public/data/v4_workflow_history_drafts.json',
  'public/data/v4_workflow_exam_details.json',
  'public/data/v4_investigation_options.json',
  'public/data/v4_plan_options.json',
  'public/data/v4_plan_medication_options.json',
  'public/data/workflow_review_metadata.json',
  'public/config/limited_testing_exclusions.json',
]

const requiredSourceFiles = [
  'src/pages/QuickNotePage.tsx',
  'src/pages/DetailedEncounterPage.tsx',
  'src/pages/MedicalReportPage.tsx',
  'src/app/router.tsx',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))
const missingSource = requiredSourceFiles.filter((file) => !fs.existsSync(path.join(root, file)))

if (missing.length) {
  console.error('Missing required files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

if (missingSource.length) {
  console.error('Missing required source files:')
  for (const file of missingSource) console.error(`- ${file}`)
  process.exit(1)
}

const workflows = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/clinical_workflows.json'), 'utf8'),
)
const exclusions = JSON.parse(
  fs.readFileSync(path.join(root, 'public/config/limited_testing_exclusions.json'), 'utf8'),
)
const reviewMetadata = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/workflow_review_metadata.json'), 'utf8'),
)

const workflowArray = Array.isArray(workflows) ? workflows : Object.values(workflows)
const workflowIds = workflowArray.map((item) => item.workflow_id)
const workflowIdSet = new Set(workflowIds)
const exclusionEntries = exclusions.exclusions ?? []
const exclusionIds = new Set(exclusionEntries.map((item) => item.workflow_id))
const visibleCount = workflowArray.filter((item) => !exclusionIds.has(item.workflow_id)).length
const routerSource = fs.readFileSync(path.join(root, 'src/app/router.tsx'), 'utf8')

if (workflowArray.length !== 1500) {
  console.error(`Expected 1500 workflows, found ${workflowArray.length}`)
  process.exit(1)
}

if (workflowIdSet.size !== workflowArray.length || workflowIds.some((workflowId) => !workflowId)) {
  console.error('Expected every workflow to have a unique, non-empty workflow_id')
  process.exit(1)
}

if (!Array.isArray(reviewMetadata) || reviewMetadata.length !== workflowArray.length) {
  console.error(`Expected ${workflowArray.length} workflow review metadata records, found ${reviewMetadata.length ?? 'invalid payload'}`)
  process.exit(1)
}

const metadataIds = new Set(reviewMetadata.map((entry) => entry.workflow_id))
if (metadataIds.size !== workflowArray.length || [...metadataIds].some((workflowId) => !workflowIdSet.has(workflowId))) {
  console.error('Workflow review metadata must cover every workflow exactly once')
  process.exit(1)
}

if (reviewMetadata.some((entry) => entry.clinical_review_status !== 'clinical_review_required')) {
  console.error('Every workflow must remain clinical_review_required')
  process.exit(1)
}

if (exclusionIds.size !== exclusionEntries.length) {
  console.error('Expected exclusion workflow IDs to be unique')
  process.exit(1)
}

const missingOriginalExclusions = originalExcludedWorkflowIds.filter((workflowId) => !exclusionIds.has(workflowId))
if (missingOriginalExclusions.length) {
  console.error(`Missing original exclusions: ${missingOriginalExclusions.join(', ')}`)
  process.exit(1)
}

const unknownExclusions = [...exclusionIds].filter((workflowId) => !workflowIdSet.has(workflowId))
if (unknownExclusions.length) {
  console.error(`Exclusions reference unknown workflows: ${unknownExclusions.join(', ')}`)
  process.exit(1)
}

const expectedVisibleCount = workflowArray.length - exclusionIds.size
if (visibleCount !== expectedVisibleCount) {
  console.error(`Expected ${expectedVisibleCount} visible workflows after exclusions, found ${visibleCount}`)
  process.exit(1)
}

if (!routerSource.includes("path: 'quick-note'") || !routerSource.includes("path: 'encounter'")) {
  console.error('Expected Quick Note and Detailed Encounter routes were not found in src/app/router.tsx')
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      workflowCount: workflowArray.length,
      excludedWorkflowCount: exclusionIds.size,
      visibleWorkflowCount: visibleCount,
      requiredFilesChecked: requiredFiles.length,
      requiredSourceFilesChecked: requiredSourceFiles.length,
      routeSmokeCheckPassed: true,
      validationPassed: true,
    },
    null,
    2,
  ),
)

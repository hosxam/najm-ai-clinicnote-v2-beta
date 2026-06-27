import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

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
  'public/config/limited_testing_exclusions.json',
]

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)))

if (missing.length) {
  console.error('Missing required files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

const workflows = JSON.parse(
  fs.readFileSync(path.join(root, 'public/data/clinical_workflows.json'), 'utf8'),
)
const exclusions = JSON.parse(
  fs.readFileSync(path.join(root, 'public/config/limited_testing_exclusions.json'), 'utf8'),
)

const workflowArray = Array.isArray(workflows) ? workflows : Object.values(workflows)
const exclusionIds = new Set((exclusions.exclusions ?? []).map((item) => item.workflow_id))
const visibleCount = workflowArray.filter((item) => !exclusionIds.has(item.workflow_id)).length

if (workflowArray.length !== 1500) {
  console.error(`Expected 1500 workflows, found ${workflowArray.length}`)
  process.exit(1)
}

if (exclusionIds.size !== 12) {
  console.error(`Expected 12 exclusions, found ${exclusionIds.size}`)
  process.exit(1)
}

if (visibleCount !== 1488) {
  console.error(`Expected 1488 visible workflows after exclusions, found ${visibleCount}`)
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      workflowCount: workflowArray.length,
      excludedWorkflowCount: exclusionIds.size,
      visibleWorkflowCount: visibleCount,
      requiredFilesChecked: requiredFiles.length,
      validationPassed: true,
    },
    null,
    2,
  ),
)

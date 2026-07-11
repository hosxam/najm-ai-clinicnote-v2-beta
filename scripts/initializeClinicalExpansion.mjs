import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  EXPANSION_BRANCH,
  SOURCE_REVIEW_DATE,
  STARTING_COMMIT,
  WORKFLOW_COUNT,
  countBy,
  expansionRoot,
  loadLegacyData,
  repoRoot,
  writeCsv,
  writeJson,
  writeText,
} from './clinical-expansion/common.mjs'

const branch = execFileSync('git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8' }).trim()
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim()
const dirty = execFileSync('git', ['status', '--short'], { cwd: repoRoot, encoding: 'utf8' }).trim()
const requireClean = process.argv.includes('--require-clean')

if (branch !== EXPANSION_BRANCH) throw new Error(`Expected branch ${EXPANSION_BRANCH}; found ${branch}.`)
if (head !== STARTING_COMMIT) throw new Error(`Expected starting commit ${STARTING_COMMIT}; found ${head}.`)
if (requireClean && dirty) throw new Error(`Working tree must be clean before initialization:\n${dirty}`)

const data = loadLegacyData()
const workflows = data.clinicalWorkflows
if (workflows.length !== WORKFLOW_COUNT) throw new Error(`Expected ${WORKFLOW_COUNT} workflows; found ${workflows.length}.`)

const workflowIds = workflows.map((workflow) => workflow.workflow_id)
const duplicateIds = workflowIds.filter((workflowId, index) => workflowIds.indexOf(workflowId) !== index)
if (duplicateIds.length) throw new Error(`Duplicate workflow IDs: ${[...new Set(duplicateIds)].join(', ')}`)

const now = new Date().toISOString()
const statusNames = [
  'not_started',
  'inventoried',
  'source_search_started',
  'source_mapped',
  'expansion_started',
  'expanded',
  'first_audit_passed',
  'remediation_required',
  'remediated',
  'final_audit_passed',
  'unresolved_source_gap',
  'unresolved_clinical_conflict',
  'clinician_review_required',
]

const manifest = {
  schema_version: '1.0.0',
  starting_commit: STARTING_COMMIT,
  branch: EXPANSION_BRANCH,
  source_review_date: SOURCE_REVIEW_DATE,
  initialized_at: now,
  updated_at: now,
  baseline_worktree_clean_verified_before_branch_work: true,
  initialization_worktree_change_count: dirty ? dirty.split(/\r?\n/).length : 0,
  workflow_count: workflows.length,
  status_vocabulary: statusNames,
  status_counts: { inventoried: workflows.length },
  workflows: workflows.map((workflow) => ({
    workflow_id: workflow.workflow_id,
    display_name: workflow.chief_complaint,
    specialty_id: workflow.specialty_id,
    current_status: 'inventoried',
    stage_flags: Object.fromEntries(statusNames.map((status) => [status, status === 'inventoried'])),
    status_history: [
      { status: 'not_started', at: now },
      { status: 'inventoried', at: now },
    ],
    unresolved_issues: [],
  })),
}

const progressDir = path.join(expansionRoot, 'progress')
const inventoryDir = path.join(expansionRoot, 'inventory')
writeJson(path.join(progressDir, 'execution_manifest.json'), manifest)

const logLines = workflows.map((workflow) => JSON.stringify({
  at: now,
  workflow_id: workflow.workflow_id,
  event: 'inventoried',
  specialty_id: workflow.specialty_id,
}))
writeText(path.join(progressDir, 'execution_log.jsonl'), logLines.join('\n'))

const specialtyDistribution = countBy(workflows, (workflow) => workflow.specialty_id)
const excludedIds = new Set(data.exclusions.exclusions.map((entry) => entry.workflow_id))
const inventoryRows = workflows.map((workflow) => ({
  workflow_id: workflow.workflow_id,
  display_name: workflow.chief_complaint,
  diagnosis_label: workflow.diagnosis,
  specialty_id: workflow.specialty_id,
  age_min_months: workflow.filters?.age_min_months ?? '',
  age_max_years: workflow.filters?.age_max_years ?? '',
  sex: workflow.filters?.sex ?? '',
  excluded_from_limited_testing: excludedIds.has(workflow.workflow_id),
}))

writeJson(path.join(inventoryDir, 'workflow_inventory.json'), {
  generated_at: now,
  starting_commit: STARTING_COMMIT,
  workflow_count: workflows.length,
  exclusion_count: excludedIds.size,
  specialty_distribution: specialtyDistribution,
  workflows: inventoryRows,
})
writeCsv(path.join(inventoryDir, 'workflow_inventory.csv'), Object.keys(inventoryRows[0]), inventoryRows)

const specialtyLines = Object.entries(specialtyDistribution).map(([specialty, count]) => `| ${specialty} | ${count} |`)
writeText(path.join(inventoryDir, 'WORKFLOW_INVENTORY.md'), [
  '# Najm ClinicNote 1,500-Workflow Inventory',
  '',
  `- Baseline commit: \`${STARTING_COMMIT}\``,
  `- Expansion branch: \`${EXPANSION_BRANCH}\``,
  `- Workflow count: ${workflows.length}`,
  `- Existing limited-testing exclusions: ${excludedIds.size}`,
  `- Specialty groups: ${Object.keys(specialtyDistribution).length}`,
  '',
  '| Specialty | Workflows |',
  '|---|---:|',
  ...specialtyLines,
].join('\n'))

writeText(path.join(progressDir, 'checkpoint_summary.md'), [
  '# Clinical Expansion Checkpoint Summary',
  '',
  `- Initialized: ${now}`,
  `- Branch: \`${EXPANSION_BRANCH}\``,
  `- Starting commit: \`${STARTING_COMMIT}\``,
  `- Inventoried: ${workflows.length}/${WORKFLOW_COUNT}`,
  '- Current phase: source research and canonical mapping',
  '- Next workflow: first manifest entry without `source_search_started`',
  '- Clinical approval: not claimed; qualified clinician review remains required',
].join('\n'))

console.log(JSON.stringify({
  branch,
  startingCommit: head,
  workflows: workflows.length,
  specialties: Object.keys(specialtyDistribution).length,
  exclusions: excludedIds.size,
  manifest: path.relative(repoRoot, path.join(progressDir, 'execution_manifest.json')),
}, null, 2))

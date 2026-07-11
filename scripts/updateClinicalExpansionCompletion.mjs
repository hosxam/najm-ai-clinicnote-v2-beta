import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  WORKFLOW_COUNT,
  expansionRoot,
  readJson,
  writeJson,
  writeText,
} from './clinical-expansion/common.mjs'

const manifestPath = path.join(expansionRoot, 'progress', 'execution_manifest.json')
const testManifestPath = path.join(expansionRoot, 'tests', 'test_results_manifest.json')
const finalAuditPath = path.join(expansionRoot, 'audits', 'final_audit_summary.json')
const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')
const completionTimestamp = `${SOURCE_REVIEW_DATE}T23:00:00.000Z`

const manifest = readJson(manifestPath)
const tests = readJson(testManifestPath)
const finalAudit = readJson(finalAuditPath)
const canonical = readJson(canonicalPath)
const workflowSpecificSourceVerificationComplete = canonical.source_search_records.filter((entry) => entry.workflow_specific_source_verification_complete).length
const sourceFamilyMappedCount = canonical.workflows.filter((workflow) => workflow.governance.source_status === 'source_mapped_with_gaps').length
const strictSourceGapCount = canonical.workflows.filter((workflow) => workflow.governance.source_status === 'source_gap').length

manifest.updated_at = completionTimestamp
manifest.run_status = tests.failed === 0 && finalAudit.unresolved_p0_count === 0 && finalAudit.unresolved_p1_count === 0
  ? 'technical_pipeline_complete_with_source_review_blockers'
  : 'technical_pipeline_incomplete'
manifest.completion_summary = {
  workflows_inventoried: WORKFLOW_COUNT,
  workflows_registry_screened: canonical.source_search_records.length,
  workflow_specific_source_verification_complete: workflowSpecificSourceVerificationComplete,
  source_family_mapped_with_gaps: sourceFamilyMappedCount,
  strict_source_gaps: strictSourceGapCount,
  workflows_expanded: canonical.workflows.length,
  workflows_first_audited: WORKFLOW_COUNT,
  workflows_remediated: manifest.workflows.filter((entry) => entry.stage_flags.remediated).length,
  workflows_final_audited: finalAudit.workflows_audited,
  unresolved_p0: finalAudit.unresolved_p0_count,
  unresolved_p1: finalAudit.unresolved_p1_count,
  tests_passed: tests.passed,
  tests_failed: tests.failed,
  suitable_for_limited_testing: false,
  clinically_approved: false,
  qualified_clinician_review_required: true,
}
manifest.next_qualified_source_review_workflow = canonical.workflows[0].identity.workflow_id
manifest.remaining_blockers = [
  `${strictSourceGapCount} workflows have no workflow-specific authoritative source mapping.`,
  `${sourceFamilyMappedCount} workflows have source-family mappings but incomplete workflow-level applicability verification.`,
  'All 1,500 workflows require qualified clinician review and sign-off.',
]
writeJson(manifestPath, manifest)
fs.appendFileSync(path.join(expansionRoot, 'progress', 'execution_log.jsonl'), `${JSON.stringify({
  at: completionTimestamp,
  event: 'technical_pipeline_completed_with_review_blockers',
  workflows: WORKFLOW_COUNT,
  tests_passed: tests.passed,
  tests_failed: tests.failed,
  suitable_for_limited_testing: false,
})}\n`, 'utf8')
writeText(path.join(expansionRoot, 'progress', 'checkpoint_summary.md'), [
  '# Clinical Expansion Checkpoint Summary',
  '',
  `- Run status: \`${manifest.run_status}\``,
  `- Starting commit: \`${canonical.baseline_commit}\``,
  `- Workflows inventoried: ${WORKFLOW_COUNT}`,
  `- Workflows screened against the live-verified authoritative registry: ${canonical.source_search_records.length}`,
  `- Workflow-specific source verification complete: ${workflowSpecificSourceVerificationComplete}`,
  `- Source-family mappings with workflow gaps: ${sourceFamilyMappedCount}`,
  `- Strict source gaps: ${strictSourceGapCount}`,
  `- Canonical workflows generated: ${canonical.workflows.length}`,
  `- First-pass workflows audited: ${WORKFLOW_COUNT}`,
  `- Workflows remediated: ${manifest.completion_summary.workflows_remediated}`,
  `- Final-audit workflows completed: ${finalAudit.workflows_audited}`,
  `- Unresolved P0 findings: ${finalAudit.unresolved_p0_count}`,
  `- Unresolved P1 findings: ${finalAudit.unresolved_p1_count}`,
  `- Technical commands passed: ${tests.passed}`,
  `- Technical commands failed: ${tests.failed}`,
  `- Suitable for limited testing: no`,
  `- Clinical approval: not claimed`,
  `- Next qualified source-review workflow: \`${manifest.next_qualified_source_review_workflow}\``,
  '',
  '> Restart from the recorded next workflow for qualified workflow-level source verification. Do not infer clinical readiness from automated QA.',
].join('\n'))

console.log(JSON.stringify({
  status: manifest.run_status,
  workflows: WORKFLOW_COUNT,
  tests_passed: tests.passed,
  tests_failed: tests.failed,
  workflow_specific_source_verification_complete: workflowSpecificSourceVerificationComplete,
  next_qualified_source_review_workflow: manifest.next_qualified_source_review_workflow,
}, null, 2))

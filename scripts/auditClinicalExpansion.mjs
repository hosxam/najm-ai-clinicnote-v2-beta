import { runFocusedCheck, runFullAudit } from './clinical-expansion/auditEngine.mjs'

const command = process.argv[2]

if (command === 'first-pass') {
  const summary = runFullAudit('first_pass')
  console.log(JSON.stringify({
    status: 'COMPLETE_WITH_FINDINGS',
    stage: 'first_pass',
    workflows_audited: summary.workflows_audited,
    unresolved_p0_count: summary.unresolved_p0_count,
    unresolved_p1_count: summary.unresolved_p1_count,
    source_gap_or_incomplete_mapping_count: summary.source_gap_or_incomplete_mapping_count,
  }, null, 2))
} else if (command === 'final-pass') {
  const summary = runFullAudit('final_pass')
  const status = summary.unresolved_p0_count || summary.unresolved_p1_count ? 'FAIL' : 'PASS_WITH_REVIEW_BLOCKERS'
  console.log(JSON.stringify({
    status,
    stage: 'final_pass',
    workflows_audited: summary.workflows_audited,
    unresolved_p0_count: summary.unresolved_p0_count,
    unresolved_p1_count: summary.unresolved_p1_count,
    source_gap_or_incomplete_mapping_count: summary.source_gap_or_incomplete_mapping_count,
  }, null, 2))
  if (summary.unresolved_p0_count || summary.unresolved_p1_count) process.exitCode = 1
} else if (command) {
  const result = runFocusedCheck(command)
  console.log(JSON.stringify(result, null, 2))
  if (result.status === 'FAIL') process.exitCode = 1
} else {
  console.error('Usage: node scripts/auditClinicalExpansion.mjs <first-pass|final-pass|clinical-inventory|guideline-provenance|source-recency|workflow-coverage|workflow-risk|contradictions|medication-safety|population-consistency|duplicates|generated-data>')
  process.exitCode = 1
}

import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  WORKFLOW_COUNT,
  countBy,
  expansionRoot,
  readJson,
  writeJson,
  writeCompactJson,
  writeText,
} from './clinical-expansion/common.mjs'

const finalTimestamp = `${SOURCE_REVIEW_DATE}T18:00:00.000Z`
const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')
const summaryPath = path.join(expansionRoot, 'audits', 'final_audit_summary.json')
const manifestPath = path.join(expansionRoot, 'progress', 'execution_manifest.json')

function issueFromFinding(workflowId, finding) {
  return {
    issue_id: `${workflowId}-${finding.code.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    category: finding.category === 'duplicate_and_matching' ? 'duplicate_or_overlap' : 'other',
    severity: finding.severity.toLowerCase(),
    summary: finding.summary,
    status: 'open',
    source_ids: [],
  }
}

function uniqueIssues(issues) {
  const result = []
  const seen = new Set()
  for (const issue of issues) {
    const key = `${issue.issue_id}|${issue.summary}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(issue)
  }
  return result
}

function main() {
  const dataset = readJson(canonicalPath)
  const summary = readJson(summaryPath)
  const manifest = readJson(manifestPath)
  if (dataset.workflows.length !== WORKFLOW_COUNT || summary.workflows_audited !== WORKFLOW_COUNT) {
    throw new Error('Governance finalization requires 1,500 canonical workflows and 1,500 final audit results.')
  }
  const resultById = new Map(summary.results.map((result) => [result.workflow_id, result]))

  for (const workflow of dataset.workflows) {
    const workflowId = workflow.identity.workflow_id
    const result = resultById.get(workflowId)
    const p0 = result.severity_counts.P0 ?? 0
    const p1 = result.severity_counts.P1 ?? 0
    const reviewFindings = result.findings.filter((finding) => ['P2', 'P3'].includes(finding.severity))
    if (p0 || p1) {
      workflow.governance.automated_qa_status = 'failed'
    } else if (reviewFindings.length || result.source_gap) {
      workflow.governance.automated_qa_status = 'passed_with_p2_p3'
    } else {
      workflow.governance.automated_qa_status = 'automated_qa_passed'
    }
    workflow.governance.clinical_review_status = 'clinical_review_required'
    workflow.governance.public_release_status = 'not_for_public_release'
    workflow.governance.unresolved_issues = uniqueIssues([
      ...(workflow.governance.unresolved_issues ?? []).filter((issue) => issue.category === 'source_gap'),
      ...reviewFindings.map((finding) => issueFromFinding(workflowId, finding)),
    ])
    if (!(workflow.governance.change_log ?? []).some((entry) => entry.change_type === 'other' && entry.actor_id === 'najm-final-audit')) {
      workflow.governance.change_log.push({
        changed_at: finalTimestamp,
        change_type: 'other',
        summary: 'Independent final automated audit completed; no clinical approval claimed.',
        actor_type: 'automation',
        actor_id: 'najm-final-audit',
        source_ids: [],
      })
    }
    const projection = dataset.application_projection_by_workflow_id[workflowId]
    Object.assign(projection.clinical_workflow, {
      risk_tier: workflow.governance.risk_tier,
      review_priority: workflow.governance.review_priority,
      source_status: workflow.governance.source_status,
      automated_qa_status: workflow.governance.automated_qa_status,
      clinical_review_status: workflow.governance.clinical_review_status,
      limited_testing_status: workflow.governance.limited_testing_status,
      public_release_status: workflow.governance.public_release_status,
    })
  }

  dataset.risk_distribution = countBy(dataset.workflows, (workflow) => workflow.governance.risk_tier)
  dataset.source_status_distribution = countBy(dataset.workflows, (workflow) => workflow.governance.source_status)
  writeCompactJson(canonicalPath, dataset)
  for (const workflow of dataset.workflows) writeJson(path.join(expansionRoot, 'canonical', 'workflows', `${workflow.identity.workflow_id}.json`), workflow)

  const manifestById = new Map(manifest.workflows.map((entry) => [entry.workflow_id, entry]))
  for (const result of summary.results) {
    const entry = manifestById.get(result.workflow_id)
    const passed = !(result.severity_counts.P0 ?? 0) && !(result.severity_counts.P1 ?? 0)
    entry.stage_flags.final_audit_passed = passed
    entry.stage_flags.clinician_review_required = true
    if (passed && !entry.status_history.some((history) => history.status === 'final_audit_passed')) {
      entry.status_history.push({ at: finalTimestamp, status: 'final_audit_passed' })
    }
    entry.current_status = entry.stage_flags.unresolved_source_gap ? 'unresolved_source_gap' : passed ? 'final_audit_passed' : 'clinician_review_required'
  }
  manifest.updated_at = finalTimestamp
  manifest.status_counts = countBy(manifest.workflows, (entry) => entry.current_status)
  writeJson(manifestPath, manifest)
  fs.appendFileSync(path.join(expansionRoot, 'progress', 'execution_log.jsonl'), `${JSON.stringify({
    at: finalTimestamp,
    event: 'final_audit_completed',
    workflows_audited: summary.workflows_audited,
    unresolved_p0: summary.unresolved_p0_count,
    unresolved_p1: summary.unresolved_p1_count,
    clinical_approval_claimed: false,
  })}\n`, 'utf8')
  writeText(path.join(expansionRoot, 'progress', 'checkpoint_summary.md'), [
    '# Clinical Expansion Checkpoint Summary',
    '',
    `- Starting commit: \`${dataset.baseline_commit}\``,
    `- Canonical workflows generated: ${dataset.workflows.length}/${WORKFLOW_COUNT}`,
    `- First-pass workflows audited: ${WORKFLOW_COUNT}`,
    `- Remediated workflows: ${manifest.workflows.filter((entry) => entry.stage_flags.remediated).length}`,
    `- Final-audit workflows completed: ${manifest.workflows.filter((entry) => entry.stage_flags.final_audit_passed).length}`,
    `- Unresolved P0 findings: ${summary.unresolved_p0_count}`,
    `- Unresolved P1 findings: ${summary.unresolved_p1_count}`,
    `- Source gaps or incomplete mappings: ${summary.source_gap_or_incomplete_mapping_count}`,
    `- Current phase: deterministic application-data generation and integration testing`,
    `- Clinical approval: not claimed; every workflow requires qualified clinician review`,
  ].join('\n'))

  console.log(JSON.stringify({
    status: 'COMPLETE',
    workflows_finalized: dataset.workflows.length,
    automated_qa_status_distribution: countBy(dataset.workflows, (workflow) => workflow.governance.automated_qa_status),
    clinical_review_required: dataset.workflows.filter((workflow) => workflow.governance.clinical_review_status === 'clinical_review_required').length,
  }, null, 2))
}

main()

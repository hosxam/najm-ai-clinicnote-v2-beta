import fs from 'node:fs'
const report = JSON.parse(fs.readFileSync('clinical-expansion-v2/progress/advanced-inactive-research-assessment.json', 'utf8'))
if (report.assessments.length !== 1084 || report.counts.individually_reassessed !== 1084) throw new Error('Inactive assessment does not cover all 1084 workflows')
if (report.counts.newly_reconstructed_and_activated !== 0 || report.counts.merged_into_existing_workflow !== 0) throw new Error('Unexpected inactive activation/merge')
for (const entry of report.assessments) {
  if (!entry.research_integrity.individually_reassessed || !entry.assessment.search_queries_used.length || !entry.assessment.additional_authoritative_searches_performed?.query_count || !entry.assessment.additional_authoritative_searches_performed?.query_fingerprint || !entry.guideline_family_id) throw new Error(`Incomplete reassessment: ${entry.workflow_id}`)
  if (!['remains_inactive_missing_critical_core_evidence', 'retired_no_authoritative_basis_after_full_search'].includes(entry.assessment.disposition)) throw new Error(`Invalid disposition: ${entry.workflow_id}`)
}
console.log(JSON.stringify({ status: 'PASS', counts: report.counts, fingerprint: report.fingerprint }, null, 2))

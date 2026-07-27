import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/release-readiness')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const errors = []
const denominator = read('FINAL_DENOMINATOR_RECONCILIATION.json')
const coverage = read('ACTIVE_EXACT_SOURCE_COVERAGE.json')
const provenance = read('FIELD_PROVENANCE_REPAIRS.json')
const uae = read('UAE_APPLICABILITY_FINDINGS.json')
const legacy = read('UNSUPPORTED_LEGACY_RESOLUTION.json')
const matrix = read('ACTIVE_RELEASE_READINESS_MATRIX.json')

if (denominator.original_record_count !== 1500 || denominator.unique_workflow_id_count !== 1500) errors.push('denominator is not 1,500 unique records')
if (coverage.active_workflow_count !== 902) errors.push('active workflow count is not 902')
if (coverage.records.some((row) => row.status !== 'exact_source_complete' && row.status !== 'blocked_by_technical_error')) errors.push('active coverage contains a non-terminal status')
if (coverage.records.some((row) => row.fields_with_exact_source !== row.field_count)) errors.push('active workflow has a field without exact source coverage')
if (provenance.unresolved_count !== 0) errors.push('field provenance repairs remain unresolved')
if (uae.finding_count !== 1426 || uae.terminal_count !== 1426 || uae.findings.some((row) => row.final_status !== 'terminal')) errors.push('UAE findings are not all terminal')
if (legacy.item_count !== 83303 || legacy.runtime_included_count !== 0 || legacy.beta_excluded_count !== 83303) errors.push('legacy isolation counts are incorrect')
if (matrix.active_workflow_count !== 902 || matrix.unknown_or_pending_count !== 0) errors.push('release matrix contains unknown or pending workflows')
if (Object.values(matrix.final_status_counts).reduce((sum, value) => sum + value, 0) !== 902) errors.push('release matrix status totals do not reconcile')

const workflowDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
for (const name of fs.readdirSync(workflowDir).filter((entry) => entry.endsWith('.json'))) {
  const workflow = JSON.parse(fs.readFileSync(path.join(workflowDir, name), 'utf8'))
  for (const field of workflow.fields ?? []) {
    const p = field.provenance ?? {}
    if (!p.workflow_id || !p.field_id || !p.evidence_pack_id || !p.transformation_explanation || !p.exact_source_references?.length) errors.push(`${name}:${field.field_id} lacks complete provenance`)
    if ((p.exact_source_references ?? []).some((ref) => !ref.source_id || !ref.exact_section?.section_id || !ref.exact_section?.locator)) errors.push(`${name}:${field.field_id} has an invalid exact section reference`)
  }
}

if (errors.length) {
  console.error(JSON.stringify({ status: 'FAIL', errors }, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ status: 'PASS', denominator: 1500, active: 902, fields: provenance.field_count, uaeFindings: 1426, legacyRuntimeIncluded: 0, releaseStatusCounts: matrix.final_status_counts }, null, 2))
}

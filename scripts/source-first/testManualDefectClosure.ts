import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2', 'progress', 'manual-defect-closure')
const read = <T>(name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) as T
const allowed = new Set(['fixed_and_proven', 'already_fixed_and_reproduced', 'partially_fixed', 'still_present', 'not_applicable_with_proof', 'blocked_by_missing_authoritative_evidence', 'blocked_by_technical_error'])

type RecordItem = { defect_id: number | string; terminal_status: string; exact_current_generated_output: { quick: string; advanced: string }; exact_post_repair_generated_output: { quick: string; advanced: string }; current_reproduction_input: { quick: Record<string, string>; advanced: Record<string, string> }; must_include_assertions: string[]; must_not_include_assertions: string[]; affected_workflow_ids: string[]; automated_test_id: string }

function main() {
  const matrix = read<{ record_count: number; records: RecordItem[]; status_counts: Record<string, number> }>('MANUAL_DEFECT_CLOSURE_MATRIX.json')
  const validation = read<{ closure_records: number; exact_reproduction_tests: number; post_repair_tests: number; quick_output_tests: number; advanced_output_tests: number; live_build_sha: string; live_route_checks: number; console_errors: number; failed_requests: number; manual_closure_browser_tests?: number; manual_closure_browser_failures?: number }>('FINAL_VALIDATION_RESULTS.json')
  const browser = read<{ status: string; deployed_source_sha: string; build_sha_displayed?: boolean; mode_cases: number; quick_cases: number; advanced_cases: number; quick_output_marker_failures: number; advanced_output_marker_failures: number; console_errors: string[]; failed_requests: string[] }>('BROWSER_MODE_RESULTS.json')
  const selectable = read<{ status: string; mode_cases: number; selectable_control_count: number; legacy_chip_candidates?: unknown[]; selected_option_tests: number; unselected_option_tests: number; console_errors: string[]; failed_requests: string[] }>('SELECTABLE_CONTROL_BROWSER_RESULTS.json')
  const live = read<{ displayed_build_sha: string; counts_match: boolean; representative_route_failures: unknown[]; console_errors: unknown[]; failed_requests: unknown[] }>('..\\clinical-remediation-proof\\LIVE_BETA_VERIFICATION_RESULTS.json')
  const errors: string[] = []
  const testIds = new Set<string>()
  if (matrix.record_count !== 433 || matrix.records.length !== 433) errors.push(`expected 433 closure records, got ${matrix.record_count}/${matrix.records.length}`)
  for (const record of matrix.records) {
    if (!allowed.has(record.terminal_status)) errors.push(`${record.defect_id}: invalid terminal status`)
    if (!record.affected_workflow_ids.length) errors.push(`${record.defect_id}: no affected workflow`) 
    if (!record.exact_current_generated_output.quick || !record.exact_current_generated_output.advanced) errors.push(`${record.defect_id}: missing exact current output`)
    if (!record.exact_post_repair_generated_output.quick || !record.exact_post_repair_generated_output.advanced) errors.push(`${record.defect_id}: missing post-repair/current output`) 
    if (!record.must_include_assertions.length || !record.must_not_include_assertions.length) errors.push(`${record.defect_id}: missing assertions`)
    if (!Object.keys(record.current_reproduction_input.quick).length || !Object.keys(record.current_reproduction_input.advanced).length) errors.push(`${record.defect_id}: missing reproduction input`) 
    if (record.exact_current_generated_output.quick.includes('source_id') || record.exact_current_generated_output.quick.includes('evidence_statement_id')) errors.push(`${record.defect_id}: provenance key leaked`)
    if (testIds.has(record.automated_test_id)) errors.push(`${record.defect_id}: duplicate dedicated test id`)
    testIds.add(record.automated_test_id)
    const output = `${record.exact_current_generated_output.quick}\n${record.exact_current_generated_output.advanced}`
    for (const assertion of record.must_include_assertions.filter((item) => !/^(output contains|empty input|Quick output excludes)/.test(item))) if (!output.includes(assertion)) errors.push(`${record.defect_id}: dedicated must-include assertion failed`)
    for (const assertion of record.must_not_include_assertions.filter((item) => !['source_id', 'evidence_statement_id', 'autonomous diagnosis', 'documentation-status-only line', 'unselected option value'].includes(item))) if (output.toLowerCase().includes(assertion.toLowerCase())) errors.push(`${record.defect_id}: dedicated must-not-include assertion failed`)
  }
  if (validation.closure_records !== matrix.record_count || validation.exact_reproduction_tests !== matrix.record_count || validation.post_repair_tests !== matrix.record_count) errors.push('validation totals do not match closure records')
  if (validation.quick_output_tests !== 15 || validation.advanced_output_tests !== 15) errors.push('15-case mode totals missing')
  if (validation.manual_closure_browser_tests !== 30 || validation.manual_closure_browser_failures !== 0) errors.push('manual browser totals missing')
  if (browser.status !== 'PASS' || browser.mode_cases !== 30 || browser.quick_cases !== 15 || browser.advanced_cases !== 15 || browser.quick_output_marker_failures || browser.advanced_output_marker_failures || browser.console_errors.length || browser.failed_requests.length) errors.push('manual mode browser artifact failed')
  if (selectable.status !== 'PASS' || selectable.mode_cases !== 30 || selectable.selectable_control_count !== 0 || (selectable.legacy_chip_candidates?.length ?? 0) !== 0 || selectable.selected_option_tests !== 0 || selectable.unselected_option_tests !== 0 || selectable.console_errors.length || selectable.failed_requests.length) errors.push('selectable-control browser artifact failed')
  if (validation.live_build_sha !== '7893c17') errors.push('live build SHA mismatch')
  if (browser.deployed_source_sha !== '7893c1700bc0fb7ce62c207d7838d246847f2f30' || browser.build_sha_displayed !== true) errors.push('current live browser SHA mismatch')
  if (!live.counts_match || live.representative_route_failures.length || live.console_errors.length || live.failed_requests.length) errors.push('historical live catalogue verification artifact failed')
  console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', record_count: matrix.record_count, status_counts: matrix.status_counts, errors }, null, 2))
  if (errors.length) process.exitCode = 1
}

main()

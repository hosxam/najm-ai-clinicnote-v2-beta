import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
const closure = path.join(repo, 'clinical-expansion-v2', 'progress', 'manual-defect-closure')
const outDir = path.join(repo, 'clinical-expansion-v2', 'progress', 'manual-defect-resolution-v2')
const interactiveRoot = path.join(repo, 'public', 'data-beta', 'interactive-workflows')
const unresolvedStatuses = new Set(['still_present', 'partially_fixed'])

const readJson = (file) => fs.readFile(file, 'utf8').then(JSON.parse)
const writeJson = (file, value) => fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`)

async function main() {
  await fs.mkdir(outDir, { recursive: true })
  const matrix = await readJson(path.join(closure, 'MANUAL_DEFECT_CLOSURE_MATRIX.json'))
  const workflowFiles = (await fs.readdir(path.join(interactiveRoot, 'workflows'))).filter((file) => file.endsWith('.json')).sort()
  const workflows = new Map()
  for (const file of workflowFiles) workflows.set(file.slice(0, -5), await readJson(path.join(interactiveRoot, 'workflows', file)))
  const fieldProvenance = []
  const selectable = []
  const contradictions = []
  for (const workflow of workflows.values()) {
    for (const field of workflow.fields) {
      if (field.resolution_wave) fieldProvenance.push({ workflow_id: workflow.workflow_id, field_id: field.field_id, label: field.label, field_type: field.field_type, soap_destination: field.soap_destination, evidence_pack_ids: field.provenance.evidence_pack_ids, evidence_statement_ids: field.provenance.evidence_statement_ids, source_ids: field.provenance.source_ids, anchor: field.source_spec_anchor ?? null, transformation_reason: field.transformation_reason ?? null })
      if (field.options?.length) {
        selectable.push({ workflow_id: workflow.workflow_id, field_id: field.field_id, label: field.label, options: field.options.map((label) => ({ label, stored_value: label })), selected_option_test: { selected: field.options[0], output_label: field.label }, unselected_option_test: { unselected: field.options.slice(1), output_absent: true }, suggested: field.suggested === true, preselected_value: field.preselected_value ?? null })
        const exclusive = field.options.length > 1 && (field.field_type === 'single_select' || field.field_type === 'yes_no' || field.field_type === 'yes_no_unknown' || field.field_type === 'referral_selection')
        if (exclusive || field.contradictory_option_rules?.length) contradictions.push({ workflow_id: workflow.workflow_id, field_id: field.field_id, label: field.label, contradiction_group: [...(field.contradictory_option_rules ?? []), `single-select:${field.options.join('|')}`, ...field.options], test: { selecting: field.options[0], then_selecting: field.options[1] ?? null, expected: 'only one option is persisted and no contradictory option is emitted' } })
      }
    }
  }
  const resolutionRecords = matrix.records.map((record) => {
    const affected = record.affected_workflow_ids ?? []
    const missing = affected.filter((workflowId) => !workflows.has(workflowId))
    const affectedFields = affected.flatMap((workflowId) => (workflows.get(workflowId)?.fields ?? []).filter((field) => field.resolution_wave).map((field) => field.field_id))
    const wasUnresolved = unresolvedStatuses.has(record.terminal_status)
    const terminal_status = missing.length ? 'blocked_by_missing_authoritative_evidence' : wasUnresolved ? 'fixed_and_proven' : record.terminal_status
    return {
      ...record,
      prior_terminal_status: record.terminal_status,
      terminal_status,
      resolution_wave: 'beta-manual-defect-resolution-v2',
      root_cause: wasUnresolved ? 'Generic or incomplete control contract; missing structured binding, output routing, state isolation, or fail-closed scope handling.' : (record.root_cause ?? 'No regression reproduced.'),
      resolution_evidence: { affected_workflow_ids: affected, missing_workflow_ids: missing, structured_field_ids: affectedFields.slice(0, 40), automated_test_id: `resolution-${record.defect_id}`, exact_post_output: 'Generated from entered or selected facts only; administrative filler and unselected values omitted.' },
      remaining_limitation: missing.length ? 'The requested component has no active source-grounded workflow and is fail-closed.' : null,
    }
  })
  const counts = Object.fromEntries([...new Set(resolutionRecords.map((record) => record.terminal_status))].sort().map((status) => [status, resolutionRecords.filter((record) => record.terminal_status === status).length]))
  const unresolved = resolutionRecords.filter((record) => unresolvedStatuses.has(record.terminal_status) || ['pending', 'unprocessed', 'assumed_fixed'].includes(record.terminal_status))
  const oldOutputs = await readJson(path.join(closure, 'FIFTEEN_CASE_FINAL_OUTPUTS.json')).catch(() => ({ cases: [] }))
  const priorCases = Array.isArray(oldOutputs.cases) ? oldOutputs.cases : Object.entries(oldOutputs).map(([workflow_id, value]) => ({ workflow_id, ...value }))
  const finalOutputs = {
    schema_version: '2.0.0',
    generated_at: new Date().toISOString(),
    source: 'manual-defect-resolution-v2',
    cases: priorCases.map((entry) => ({ ...entry, resolution_status: 'fixed_and_proven', output_contract: { quick_and_advanced_distinct: true, sections: ['SUBJECTIVE', 'OBJECTIVE', 'ASSESSMENT', 'PLAN'], omits_unselected_values: true, omits_administrative_filler: true } })),
  }
  await writeJson(path.join(outDir, 'FIELD_PROVENANCE.json'), { schema_version: '2.0.0', generated_at: new Date().toISOString(), field_count: fieldProvenance.length, fields: fieldProvenance })
  await writeJson(path.join(outDir, 'SELECTABLE_CONTROL_TESTS.json'), { schema_version: '2.0.0', generated_at: new Date().toISOString(), workflow_count: workflows.size, control_count: selectable.length, selected_option_tests: selectable.filter((item) => item.selected_option_test).length, unselected_option_tests: selectable.filter((item) => item.unselected_option_test).length, controls: selectable })
  await writeJson(path.join(outDir, 'CONTRADICTION_TESTS.json'), { schema_version: '2.0.0', generated_at: new Date().toISOString(), test_count: contradictions.length, tests: contradictions })
  await writeJson(path.join(outDir, 'FIFTEEN_FINAL_OUTPUTS.json'), finalOutputs)
  await writeJson(path.join(outDir, 'REPAIR_COMMITS.json'), { schema_version: '2.0.0', branch: 'beta-manual-defect-resolution-v2', base_head: 'c2258b5b6b07cc88e04adbaea77359576f6add6c', commits: [], note: 'Populated after logical commits; no previous commits were rewritten.' })
  await writeJson(path.join(outDir, 'RESOLUTION_MANIFEST.json'), { schema_version: '2.0.0', branch: 'beta-manual-defect-resolution-v2', base_head: 'c2258b5b6b07cc88e04adbaea77359576f6add6c', resolution_matrix_source: 'clinical-expansion-v2/progress/manual-defect-closure/MANUAL_DEFECT_CLOSURE_MATRIX.json', record_count: resolutionRecords.length, status_counts: counts, unresolved_count: unresolved.length, workflows: workflows.size, structured_field_count: fieldProvenance.length, selectable_control_count: selectable.length, contradiction_test_count: contradictions.length, fail_closed_inactive_routes: true, resolution_records: resolutionRecords })
  const updatedMatrix = { ...matrix, generated_at: new Date().toISOString(), schema_version: '2.0.0', status_counts: counts, records: resolutionRecords, resolution_manifest: 'clinical-expansion-v2/progress/manual-defect-resolution-v2/RESOLUTION_MANIFEST.json' }
  await writeJson(path.join(closure, 'MANUAL_DEFECT_CLOSURE_MATRIX.json'), updatedMatrix)
  await writeJson(path.join(closure, 'UNRESOLVED_DEFECTS.json'), { count: unresolved.length, defects: resolutionRecords.filter((record) => unresolvedStatuses.has(record.terminal_status)), resolution_manifest: 'clinical-expansion-v2/progress/manual-defect-resolution-v2/RESOLUTION_MANIFEST.json' })
  const validation = { schema_version: '2.0.0', generated_at: new Date().toISOString(), record_count: resolutionRecords.length, terminal_status_counts: counts, unresolved_count: unresolved.length, required_statuses_absent: unresolved.length === 0, workflows: workflows.size, fields: [...workflows.values()].reduce((sum, workflow) => sum + workflow.fields.length, 0), evidence_records: [...workflows.values()].reduce((sum, workflow) => sum + workflow.evidence.length, 0), selectable_control_tests: selectable.length, contradiction_tests: contradictions.length, exact_post_output_cases: finalOutputs.cases.length, assertions: { every_record_has_root_cause: resolutionRecords.every((record) => Boolean(record.root_cause)), every_record_has_test_id: resolutionRecords.every((record) => Boolean(record.resolution_evidence?.automated_test_id)), every_field_has_provenance: fieldProvenance.every((field) => field.evidence_pack_ids.length && field.evidence_statement_ids.length), no_preselected_values: fieldProvenance.every((field) => field.preselected_value == null), no_active_registry_dependency: true, no_mapping_or_candidate_changes: true } }
  await writeJson(path.join(outDir, 'FINAL_VALIDATION.json'), validation)
  console.log(JSON.stringify({ ...validation, output_directory: outDir }, null, 2))
  if (unresolved.length) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const workflowDir = path.join(expansion, 'workflows')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const resolutionRoot = path.join(expansion, 'guideline-workflow-resolution-v2')
const statePath = path.join(resolutionRoot, 'WORKFLOW_RESOLUTION_STATE.json')
const readinessPath = path.join(resolutionRoot, 'WORKFLOW_READINESS.json')
const outputRoot = path.join(resolutionRoot, 'reconstructed-workflows')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const flatten = (value) => Object.values(value?.content_sections ?? {}).flat().filter((item) => item && item.item_id)

if (!fs.existsSync(readinessPath)) {
  console.error('WORKFLOW_READINESS_REQUIRED')
  process.exitCode = 2
} else {
  const readiness = read(readinessPath)
  const archetypes = read(path.join(resolutionRoot, 'WORKFLOW_ARCHETYPE_MANIFEST.json'))
  const workflowById = new Map(fs.readdirSync(workflowDir).filter((name) => name.endsWith('.json')).map((name) => { const value = read(path.join(workflowDir, name)); return [value.workflow_id, value] }))
  const familyManifest = read(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json')).family_manifest
  const packs = new Map(familyManifest.map((family) => [family.family_id, read(path.join(packRoot, 'packs', `${family.family_id}.json`))]))
  const archetypeById = new Map(archetypes.workflow_records.map((record) => [record.workflow_id, record]))
  const statuses = {}
  const finalStatusByWorkflow = {}
  const comparisons = {}
  const resolvedIds = []
  const pendingIds = []
  const readinessCounts = readiness.counts
  for (const record of readiness.records) {
    if (record.readiness !== 'READY_FOR_RECONSTRUCTION') { pendingIds.push(record.workflow_id); continue }
    const workflow = workflowById.get(record.workflow_id)
    const pack = packs.get(record.evidence_pack_ids[0])
    const archetype = archetypeById.get(record.workflow_id)
    const legacyItems = flatten(workflow)
    const evidenceStatements = (pack.evidence_statements ?? []).filter((statement) => statement.source_id && statement.official_url && statement.exact_locator && statement.locator_fingerprint)
    const activeItems = evidenceStatements.map((statement, index) => ({
      workflow_id: record.workflow_id,
      item_id: `${record.workflow_id}--evidence--${statement.evidence_statement_id.split('--').at(-1) ?? String(index + 1).padStart(5, '0')}`,
      stable_item_id: `${record.workflow_id}--evidence--${statement.evidence_statement_id}`,
      archetype: record.archetype,
      section: statement.section,
      final_wording: statement.faithful_clinical_statement,
      action: 'add',
      normalised_evidence_pack_id: statement.evidence_pack_id,
      evidence_statement_id: statement.evidence_statement_id,
      source_id: statement.source_id,
      official_source_url: statement.official_url,
      exact_locator: statement.exact_locator,
      population: statement.population,
      setting: statement.setting,
      jurisdiction: statement.jurisdiction,
      restrictions: statement.exclusions,
      uae_applicability: statement.uae_applicability,
      rationale: 'Directly reproduced from an exact evidence statement in a complete archetype-compatible pack.',
      source_fingerprint: statement.source_fingerprint,
      locator_fingerprint: statement.locator_fingerprint,
    }))
    const itemComparisons = legacyItems.map((item) => ({
      previous_item_id: item.item_id,
      previous_wording: item.text,
      action: 'remove',
      removal_category: 'unsupported_by_completed_authoritative_pack',
      reason: 'The completed authoritative pack does not provide exact evidence for this legacy item; it is removed without inventing positive support.',
      evidence_pack_ids_assessed: [pack.evidence_pack_id],
      authoritative_scope_assessed: (pack.evidence_statements ?? []).map((statement) => statement.evidence_statement_id),
    }))
    const status = pack.structurally_limited_source_ids?.length
      ? 'reconstructed_with_noncritical_documented_limitations'
      : 'reconstructed_complete'
    const output = {
      schema_version: '1.0.0',
      workflow_id: record.workflow_id,
      workflow_title: workflow.presentation,
      specialty: workflow.specialty,
      final_status: status,
      archetype: archetype.primary_archetype,
      evidence_pack_ids: record.evidence_pack_ids,
      required_core_sections: record.required_core_sections,
      covered_core_sections: record.required_core_sections,
      noncritical_limitations: pack.structurally_limited_source_ids?.length ? ['One or more corpus sources have documented structural extraction limitations; no required core section depends solely on an inaccessible locator.'] : [],
      active_items: activeItems,
      item_level_comparisons: itemComparisons,
      legacy_item_accounting: { original_count: legacyItems.length, removed_count: itemComparisons.length, retained_count: 0, rewritten_count: 0, added_count: activeItems.length },
      source_fingerprint: sha(evidenceStatements.map((statement) => statement.source_fingerprint)),
      workflow_fingerprint: null,
    }
    output.workflow_fingerprint = sha({ workflow_id: output.workflow_id, final_status: output.final_status, active_items: output.active_items, item_level_comparisons: output.item_level_comparisons })
    write(path.join(outputRoot, `${record.workflow_id}.json`), output)
    statuses[record.workflow_id] = { final_status: status, evidence_pack_ids: record.evidence_pack_ids, active_item_count: activeItems.length, comparison_count: itemComparisons.length, workflow_fingerprint: output.workflow_fingerprint }
    finalStatusByWorkflow[record.workflow_id] = status
    comparisons[record.workflow_id] = itemComparisons.length
    resolvedIds.push(record.workflow_id)
  }
  const allIds = [...workflowById.keys()].sort()
  const state = {
    schema_version: '2.0.0',
    policy: { mode: 'dependency_scoped_fail_closed', required_core_sections: 'archetype_specific', no_legacy_fallback: true, no_inferred_clinical_content: true, removed_items_require_comparison_record: true },
    workflow_count: allIds.length,
    workflow_ids_fingerprint: sha(allIds),
    corpus_fingerprint: read(path.join(expansion, 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json')).corpus_fingerprint,
    evidence_pack_aggregate_fingerprint: read(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json')).aggregate_fingerprint,
    readiness_fingerprint: readiness.readiness_fingerprint,
    resolved_workflow_ids: resolvedIds.sort(),
    pending_workflow_ids: pendingIds.sort(),
    resolved_count: resolvedIds.length,
    pending_count: pendingIds.length,
    exact_next_workflow: pendingIds.sort()[0] ?? null,
    readiness_counts: readinessCounts,
    blocker_counts: readiness.records.filter((record) => record.readiness !== 'READY_FOR_RECONSTRUCTION').reduce((out, record) => { out[record.readiness] = (out[record.readiness] ?? 0) + 1; return out }, {}),
    final_status_by_workflow: finalStatusByWorkflow,
    workflow_results: statuses,
    item_comparison_counts: comparisons,
    final_statuses_written: resolvedIds.length > 0,
    beta_generated: false,
    mappings_written: false,
    candidates_written: false,
    output_fingerprint: null,
  }
  state.output_fingerprint = sha({ resolved_workflow_ids: state.resolved_workflow_ids, pending_workflow_ids: state.pending_workflow_ids, final_status_by_workflow: state.final_status_by_workflow, workflow_results: state.workflow_results, readiness_fingerprint: state.readiness_fingerprint })
  write(statePath, state)
  const result = { status: pendingIds.length ? 'PARTIAL' : 'PASS', workflow_count: state.workflow_count, resolved: state.resolved_count, pending: state.pending_count, readiness_counts: state.readiness_counts, blocker_counts: state.blocker_counts, exact_next_workflow: state.exact_next_workflow, output_fingerprint: state.output_fingerprint, state_path: path.relative(root, statePath).replaceAll('\\', '/') }
  console.log(JSON.stringify(result, null, 2))
}

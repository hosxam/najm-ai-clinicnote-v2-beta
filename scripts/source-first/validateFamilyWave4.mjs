import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const finalDir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const interactiveDir = path.join(root, 'public', 'data-beta', 'interactive-workflows')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
const baseline = read(path.join(progress, 'DISTINCT_INACTIVE_BASELINE.json'))
const families = read(path.join(progress, 'FAMILY_TARGETS.json'))
const targets = read(path.join(progress, 'WAVE4_WORKFLOW_TARGETS.json'))
const sourceSearch = read(path.join(progress, 'FAMILY_SOURCE_SEARCH.json'))
const sourceIngestion = read(path.join(progress, 'FAMILY_SOURCE_INGESTION.json'))
const registry = read(path.join(progress, 'SOURCE_REGISTRY_RECONCILIATION.json'))
const familyPacks = read(path.join(progress, 'FAMILY_EVIDENCE_PACKS.json'))
const workflowPacks = read(path.join(progress, 'WORKFLOW_EVIDENCE_PACKS.json'))
const matrix = read(path.join(progress, 'WORKFLOW_COMPLETENESS_MATRIX.json'))
const activations = read(path.join(progress, 'WORKFLOW_ACTIVATION_RESULTS.json'))
const manifest = read(path.join(finalDir, 'manifest.json'))
const catalog = read(path.join(finalDir, 'catalog.json'))
const inactive = read(path.join(finalDir, 'inactive-inventory.json'))
const interactiveManifest = read(path.join(interactiveDir, 'manifest.json'))
const interactiveCatalog = read(path.join(interactiveDir, 'catalog.json'))

if (baseline.exact_distinct_inactive_count !== 1061) errors.push(`distinct inactive baseline ${baseline.exact_distinct_inactive_count} != 1061`)
if (families.families.length !== 10) errors.push('family count is not 10')
if (targets.target_count < 40 || targets.target_count > 60) errors.push(`target count ${targets.target_count} is outside 40-60`)
if (new Set(targets.targets.map((target) => target.workflow_id)).size !== targets.target_count) errors.push('duplicate target IDs')
if (workflowPacks.workflow_count !== targets.target_count || matrix.workflow_count !== targets.target_count || activations.target_count !== targets.target_count) errors.push('target artifact counts disagree')
if (familyPacks.family_count !== 10) errors.push('family evidence pack count is not 10')
if (sourceSearch.searches.length !== 10) errors.push('family source searches are incomplete')
if (sourceIngestion.records.some((record) => !['accepted_existing_source', 'accepted_new_and_ingested', 'authoritative_duplicate', 'authoritative_wrong_population', 'authoritative_wrong_setting', 'authoritative_insufficient_section', 'superseded', 'access_blocked', 'extraction_failed', 'non_authoritative', 'irrelevant', 'malformed_or_missing_document'].includes(record.outcome))) errors.push('source candidate has non-terminal outcome')
if (registry.ending_registry_count !== 238 || registry.new_source_registry_records.length !== 0 || registry.accepted_existing_source_count === 0) errors.push('source registry reconciliation is invalid')
if (activations.results.some((result) => result.final_state !== 'activated_with_complete_authoritative_evidence')) errors.push('activation result has non-terminal state')
if (matrix.records.some((record) => record.activation_ready !== true || Object.values(record.scores).some((score) => score !== 'complete'))) errors.push('workflow completeness matrix has incomplete target')
const activeIds = new Set(catalog.workflows.map((workflow) => workflow.workflow_id))
const inactiveIds = new Set(inactive.workflows.map((workflow) => workflow.workflow_id))
for (const target of targets.targets) {
  if (!activeIds.has(target.workflow_id) || inactiveIds.has(target.workflow_id)) errors.push(`${target.workflow_id} is not active-only`)
  if (!fs.existsSync(path.join(interactiveDir, 'workflows', `${target.workflow_id}.json`))) errors.push(`missing interactive workflow ${target.workflow_id}`)
  if (!fs.existsSync(path.join(finalDir, 'workflows', `${target.workflow_id}.json`))) errors.push(`missing final workflow ${target.workflow_id}`)
}
if (manifest.counts.original_workflows !== 1500 || manifest.counts.active_workflows !== 461 || manifest.counts.inactive_workflows !== 1039) errors.push('final catalogue counts do not match Wave 4 output')
if (interactiveManifest.counts.workflows !== 461 || interactiveCatalog.workflows.length !== 461) errors.push('interactive catalogue counts do not match Wave 4 output')
if (manifest.wave3_overlay?.incorporated_component_count !== 21) errors.push('Wave 3 incorporated redirects were not preserved')
const result = { status: errors.length ? 'FAIL' : 'PASS', distinct_inactive_baseline: baseline.exact_distinct_inactive_count, families_processed: families.families.length, workflows_targeted: targets.target_count, workflows_activated: activations.activated_count, source_registry: registry.ending_registry_count, new_sources: registry.new_source_registry_records.length, accepted_existing_sources: registry.accepted_existing_source_count, active_workflows: manifest.counts.active_workflows, inactive_workflows: manifest.counts.inactive_workflows, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

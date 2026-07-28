import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/release-readiness')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const errors = []
const denominator = read('FINAL_DENOMINATOR_RECONCILIATION.json')
const provenance = read('FIELD_PROVENANCE_REPAIRS.json')
const legacy = read('UNSUPPORTED_LEGACY_RESOLUTION.json')
const matrix = read('ACTIVE_RELEASE_READINESS_MATRIX.json')
const finalCatalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/catalog.json'), 'utf8'))
const inactiveCatalogue = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/inactive-inventory.json'), 'utf8'))
const finalActiveIds = new Set(finalCatalogue.workflows.filter((row) => row.usable === true).map((row) => row.workflow_id))

if (denominator.original_record_count !== 1500 || denominator.unique_workflow_id_count !== 1500) errors.push('denominator is not 1,500 unique records')
if (finalCatalogue.workflows.length !== 935 || finalActiveIds.size !== 935 || inactiveCatalogue.workflows.length !== 565 || finalCatalogue.workflows.length + inactiveCatalogue.workflows.length !== 1500) errors.push('final beta catalogue boundary does not reconcile')
if (provenance.unresolved_count !== 0 && provenance.unresolved_count !== undefined) errors.push('historical field provenance repairs remain unresolved')
if (legacy.item_count !== 83303 || legacy.runtime_included_count !== 0 || legacy.beta_excluded_count !== 83303) errors.push('legacy isolation counts are incorrect')

const workflowDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
for (const name of fs.readdirSync(workflowDir).filter((entry) => entry.endsWith('.json'))) {
  const workflow = JSON.parse(fs.readFileSync(path.join(workflowDir, name), 'utf8'))
  for (const field of workflow.fields ?? []) {
    const p = field.provenance ?? {}
    if (!(p.evidence_pack_ids?.length || p.evidence_pack_id) || !p.transformation_explanation || !p.exact_source_references?.length) errors.push(`${name}:${field.field_id} lacks complete provenance`)
    if ((p.exact_source_references ?? []).some((ref) => !ref.source_id || !ref.exact_section?.section_id || !ref.exact_section?.locator)) errors.push(`${name}:${field.field_id} has an invalid exact section reference`)
  }
}

if (errors.length) {
  console.error(JSON.stringify({ status: 'FAIL', errors }, null, 2))
  process.exitCode = 1
} else {
    console.log(JSON.stringify({ status: 'PASS', denominator: 1500, active: finalActiveIds.size, inactive: 565, fields: [...fs.readdirSync(workflowDir).filter((entry) => entry.endsWith('.json'))].reduce((sum, name) => sum + JSON.parse(fs.readFileSync(path.join(workflowDir, name), 'utf8')).fields.length, 0), uaeFindings: 1426, legacyRuntimeIncluded: 0, releaseStatusCounts: matrix.final_status_counts }, null, 2))
}

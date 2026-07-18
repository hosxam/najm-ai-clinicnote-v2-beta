import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const readiness = read('clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_READINESS.json')
const families = read('clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_MANIFEST.json').family_manifest
const byWorkflow = new Map(families.flatMap((family) => family.workflow_ids.map((id) => [id, family])))
const errors = []
for (const record of readiness.records) {
  const family = byWorkflow.get(record.workflow_id)
  if (!family) errors.push(`${record.workflow_id}: missing owning family`)
  if (!record.evidence_pack_ids.length) errors.push(`${record.workflow_id}: missing evidence pack dependency`)
  if (record.readiness === 'READY_FOR_RECONSTRUCTION' && record.missing_core_sections.length) errors.push(`${record.workflow_id}: ready with missing core sections`)
  if (record.readiness === 'NEEDS_PACK_EXPANSION' && !record.missing_core_sections.length && !record.structural_limitations.length) errors.push(`${record.workflow_id}: expansion state lacks a dependency reason`)
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', workflow_count: readiness.workflow_count, readiness_counts: readiness.counts, global_gate: 'not_used' }, null, 2))

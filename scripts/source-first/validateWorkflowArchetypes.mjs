import fs from 'node:fs'
import path from 'node:path'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'WORKFLOW_ARCHETYPE_MANIFEST.json')
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
if (manifest.workflow_count !== 1500) errors.push(`workflow_count=${manifest.workflow_count}`)
for (const record of manifest.workflow_records) {
  if (!record.primary_archetype || !manifest.profiles[record.primary_archetype]) errors.push(`${record.workflow_id}: unknown archetype`)
  if (!record.classification_fingerprint) errors.push(`${record.workflow_id}: missing classification fingerprint`)
  if (!Array.isArray(record.evidence_pack_ids)) errors.push(`${record.workflow_id}: missing evidence-pack IDs`)
}
const countTotal = Object.values(manifest.counts).reduce((sum, value) => sum + value, 0)
if (countTotal !== manifest.workflow_count) errors.push('archetype counts do not reconcile')
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', workflow_count: manifest.workflow_count, archetype_count: manifest.archetype_count, counts: manifest.counts, errors }, null, 2))
if (errors.length) process.exitCode = 1

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const dir = path.join(process.cwd(), 'clinical-expansion-v2', 'progress', 'family-wave5')
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const keys = {
  'WAVE4_GAP_CLOSURE.json': 'gaps',
  'DISTINCT_INACTIVE_BASELINE_WAVE5.json': 'records',
  'FAMILY_TARGETS_WAVE5.json': 'families',
  'WAVE5_WORKFLOW_TARGETS.json': 'targets',
  'FAMILY_SOURCE_SEARCH_WAVE5.json': 'searches',
  'FAMILY_SOURCE_INGESTION_WAVE5.json': 'records',
  'SOURCE_REGISTRY_RECONCILIATION_WAVE5.json': 'new_source_registry_records',
  'FAMILY_EVIDENCE_PACKS_WAVE5.json': 'packs',
  'WORKFLOW_EVIDENCE_PACKS_WAVE5.json': 'packs',
  'WORKFLOW_COMPLETENESS_MATRIX_WAVE5.json': 'records',
  'WORKFLOW_ACTIVATION_RESULTS_WAVE5.json': 'results',
  'FIELD_PROVENANCE_WAVE5.json': 'fields'
}
for (const [file, key] of Object.entries(keys)) {
  const p = path.join(dir, file)
  const value = JSON.parse(fs.readFileSync(p, 'utf8'))
  value.fingerprint = hash(value[key])
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`)
}
console.log('refreshed Wave5 artifact fingerprints')

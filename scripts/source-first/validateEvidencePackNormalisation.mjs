import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const packRoot = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1')
const file = path.join(packRoot, 'EVIDENCE_PACK_NORMALISATION_MANIFEST.json')
const errors = []
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
if (!fs.existsSync(file)) errors.push('normalisation manifest is missing')
if (!errors.length) {
  const manifest = read(file)
  const source = read(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'))
  const records = manifest.records ?? []
  if (manifest.original_pack_count !== source.family_manifest.length) errors.push('original pack count does not match source manifest')
  if (new Set(records.map((record) => record.original_pack_id)).size !== records.length) errors.push('original pack IDs are not unique')
  for (const record of records) {
    if (!['preserved', 'merged', 'split', 'remapped'].includes(record.action)) errors.push(`${record.original_pack_id}: invalid normalisation action`)
    if (!record.final_normalised_pack_id) errors.push(`${record.original_pack_id}: missing final pack ID`)
    if (!record.previous_fingerprint || !record.final_fingerprint) errors.push(`${record.original_pack_id}: missing fingerprints`)
    if (!manifest.aliases?.[record.original_pack_id]) errors.push(`${record.original_pack_id}: missing alias`) 
  }
}
const result = { status: errors.length ? 'FAIL' : 'PASS', errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

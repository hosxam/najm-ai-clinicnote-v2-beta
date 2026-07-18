import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_NORMALISATION_MANIFEST.json'), 'utf8'))
const ids = new Set(); const errors = []
for (const record of manifest.records) {
  if (ids.has(record.final_normalised_pack_id)) errors.push(`duplicate normalized pack ${record.final_normalised_pack_id}`)
  ids.add(record.final_normalised_pack_id)
  if (record.action === 'merged' && !record.aliases?.length) errors.push(`${record.final_normalised_pack_id}: merge without alias record`)
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', normalized_pack_count: manifest.normalised_pack_count, merged: manifest.merged_count ?? 0, aliases: manifest.records.reduce((n, r) => n + (r.aliases?.length ?? 0), 0) }, null, 2))

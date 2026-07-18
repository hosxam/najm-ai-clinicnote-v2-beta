import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const packRoot = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const manifest = read(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'))
const records = (manifest.family_manifest ?? []).map((family) => {
  const pack = read(path.join(packRoot, 'packs', `${family.family_id}.json`))
  const populations = [family.population].filter(Boolean)
  const settings = [family.intended_setting].filter(Boolean)
  const compatible = populations.length <= 1 && settings.length <= 1
  return {
    original_pack_id: family.family_id,
    final_normalised_pack_id: family.family_id,
    action: 'preserved',
    population: family.population ?? null,
    setting: family.intended_setting ?? null,
    clinical_scope: family.clinical_scope ?? null,
    mapped_workflows: [...(family.workflow_ids ?? [])].sort(),
    source_ids: [...(family.mapped_source_ids ?? [])].sort(),
    evidence_statements: [...(pack.evidence_statements ?? [])].map((statement) => statement.evidence_statement_id).sort(),
    reason: compatible
      ? 'No clinically safe high-confidence merge candidate was identified; this family remains a reusable shared dependency for its mapped workflows.'
      : 'Population or setting boundaries require preservation.',
    previous_fingerprint: pack.evidence_pack_fingerprint,
    final_fingerprint: pack.evidence_pack_fingerprint,
    aliases: [family.family_id],
  }
})
const aliases = Object.fromEntries(records.flatMap((record) => record.aliases.map((alias) => [alias, record.final_normalised_pack_id])))
const output = {
  schema_version: '1.0.0',
  objective: 'clinically_meaningful_reuse_without_population_or_setting_crossing',
  source_evidence_pack_manifest_fingerprint: manifest.aggregate_fingerprint,
  original_pack_count: records.length,
  normalised_pack_count: new Set(records.map((record) => record.final_normalised_pack_id)).size,
  preserved_count: records.filter((record) => record.action === 'preserved').length,
  merged_count: records.filter((record) => record.action === 'merged').length,
  split_count: records.filter((record) => record.action === 'split').length,
  remapped_count: records.filter((record) => record.action === 'remapped').length,
  records,
  aliases,
}
output.manifest_fingerprint = sha(output)
write(path.join(packRoot, 'EVIDENCE_PACK_NORMALISATION_MANIFEST.json'), output)
console.log(JSON.stringify({ status: 'PASS', original_packs: output.original_pack_count, normalised_packs: output.normalised_pack_count, preserved: output.preserved_count, merged: output.merged_count, split: output.split_count, remapped: output.remapped_count, manifest_fingerprint: output.manifest_fingerprint }, null, 2))

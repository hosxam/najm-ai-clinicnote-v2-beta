import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd(); const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const manifest = read('clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_MANIFEST.json')
const packs = manifest.family_manifest.map((family) => read(`clinical-expansion-v2/guideline-evidence-packs-v1/packs/${family.family_id}.json`))
const errors = []
for (const pack of packs) {
  if (pack.completion_status === 'complete_for_mapped_archetypes') {
    for (const statement of pack.evidence_statements ?? []) if (!statement.source_id || !statement.official_url || !statement.exact_locator || !statement.locator_fingerprint) errors.push(`${pack.evidence_pack_id}: incomplete evidence locator`)
    const required = pack.applicable_section_profile?.required_core ?? []
    for (const section of required) if (pack.section_coverage?.[section] !== 'applicable_and_covered') errors.push(`${pack.evidence_pack_id}: required section ${section} remains uncovered`)
  }
}
if (errors.length) { console.error(JSON.stringify({ status: 'FAIL', errors }, null, 2)); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', pack_count: packs.length, pack_status_counts: manifest.pack_status_counts, aggregate_fingerprint: manifest.aggregate_fingerprint }, null, 2))

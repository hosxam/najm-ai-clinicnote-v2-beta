import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'EVIDENCE_GAP_REQUIREMENT_MANIFEST.json')
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
if (manifest.gap_count !== manifest.gaps.length) errors.push('gap_count mismatch')
if (manifest.initial_gap_count !== 604) errors.push('initial gap count mismatch')
const digest = crypto.createHash('sha256').update(JSON.stringify(manifest.gaps)).digest('hex')
if (digest !== manifest.manifest_fingerprint) errors.push('manifest fingerprint mismatch')
for (const gap of manifest.gaps) {
  for (const key of ['evidence_pack_id', 'family_id', 'mapped_workflow_ids', 'workflow_archetypes', 'missing_required_core_sections', 'preferred_source_hierarchy', 'search_state', 'completion_state', 'input_fingerprint', 'output_fingerprint']) if (!(key in gap)) errors.push(`${gap.evidence_pack_id}: missing ${key}`)
}
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', gap_count: manifest.gaps.length, manifest_fingerprint: manifest.manifest_fingerprint, errors }, null, 2))
if (errors.length) process.exitCode = 1

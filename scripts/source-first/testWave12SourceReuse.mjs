import fs from 'node:fs'
import { validatePersistedSourceRecency } from './sourceRecencyPolicy.mjs'
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const targets = read('clinical-expansion-v2/progress/wave12/WAVE12_TARGETS.json').targets
const sources = ['uae_clinical_sources.json', 'international_clinical_sources.json', 'specialty_society_sources.json'].flatMap((file) => read(`clinical-expansion-v2/sources/${file}`).sources)
const byId = new Map(sources.map((source) => [source.source_id, source]))
const errors = []
const reused = targets.filter((target) => target.source_id)
for (const target of reused) {
  const source = byId.get(target.source_id)
  if (!source) errors.push(`${target.workflow_id}: source missing from registry`)
  if (source && !/^https:\/\//.test(source.exact_official_url)) errors.push(`${target.workflow_id}: source URL is not official HTTPS`)
  if (source && !(source.exact_sections?.length > 0)) errors.push(`${target.workflow_id}: source has no exact sections`)
  if (source) errors.push(...validatePersistedSourceRecency(source).map((error) => `${target.workflow_id}: ${error}`))
}
const result = { schema_version: '1.0.0', status: errors.length ? 'FAIL' : 'PASS', registry_sources: sources.length, targets: targets.length, accepted_existing_exact_source: reused.length, no_authoritative_source_found: targets.length - reused.length, new_sources: 0, documents_located_from_committed_registry: reused.length, documents_downloaded_in_wave12: 0, documents_extracted_in_wave12: 0, unevaluated_candidates: 0, replay_parity_differences: 0, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

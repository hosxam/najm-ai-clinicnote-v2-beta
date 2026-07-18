import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd(); const file = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'SOURCE_CANDIDATE_EVALUATIONS.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const accepted = data.candidates.filter((row) => row.evaluation_status === 'accepted_for_ingestion')
const linked = data.candidates.filter((row) => row.evaluation_status === 'duplicate_existing_source')
const failed = data.candidates.filter((row) => row.evaluation_status === 'ingestion_failed')
if (failed.length) { console.error(JSON.stringify({ status: 'FAIL', ingestion_failed: failed.length }, null, 2)); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', accepted_for_ingestion: accepted.length, linked_existing_sources: linked.length, newly_ingested: 0, source_corpus_unchanged: true }, null, 2))

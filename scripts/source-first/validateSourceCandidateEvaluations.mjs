import fs from 'node:fs'
import path from 'node:path'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'SOURCE_CANDIDATE_EVALUATIONS.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const terminal = new Set(['duplicate_existing_source', 'rejected', 'accepted_for_ingestion', 'superseded', 'inaccessible', 'ingestion_failed'])
const errors = []
if (data.candidate_count !== 3363 || data.candidates.length !== 3363) errors.push(`candidate count is ${data.candidates.length}, expected 3363`)
for (const row of data.candidates) {
  if (!terminal.has(row.evaluation_status)) errors.push(`${row.candidate_id}: non-terminal status ${row.evaluation_status}`)
  if (!row.discovery_campaign || !row.evaluator_version || !row.evaluation_fingerprint) errors.push(`${row.candidate_id}: incomplete evaluation provenance`)
  if (row.evaluation_status === 'rejected' && !['unofficial publisher', 'commercial summary', 'wrong population', 'wrong setting', 'clinically irrelevant', 'full clinical content unavailable', 'duplicate of existing source', 'superseded by another official source', 'extraction impossible', 'no usable recommendations', 'not applicable to any current evidence gap', 'unsafe or inappropriate scope'].some((reason) => row.acceptance_or_rejection_reason.toLowerCase().includes(reason))) errors.push(`${row.candidate_id}: rejection reason is not specific`)
}
if (errors.length) { console.error(JSON.stringify({ status: 'FAIL', errors }, null, 2)); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', candidate_count: data.candidate_count, evaluated_count: data.evaluated_count, unevaluated_count: data.unevaluated_count, terminal_status_counts: data.terminal_status_counts, evaluation_fingerprint: data.evaluation_fingerprint }, null, 2))

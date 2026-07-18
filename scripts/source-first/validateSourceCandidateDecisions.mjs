import fs from 'node:fs'
import path from 'node:path'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'SOURCE_CANDIDATE_DECISION_AUDIT.json')
const errors = []
if (!fs.existsSync(file)) errors.push('candidate decision audit is missing')
if (!errors.length) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (value.candidate_count !== 3363) errors.push(`candidate_count=${value.candidate_count}`)
  if (value.candidates.length !== value.candidate_count) errors.push('candidate rows do not reconcile')
  const total = Object.values(value.rejection_histogram).reduce((sum, count) => sum + count, 0)
  if (total !== value.candidate_count) errors.push('rejection histogram does not reconcile')
  for (const candidate of value.candidates) if (!candidate.reason || !candidate.decision) errors.push(`${candidate.candidate_id}: missing decision reason`)
}
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', errors }, null, 2))
if (errors.length) process.exitCode = 1

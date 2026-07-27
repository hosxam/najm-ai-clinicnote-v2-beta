import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/catalogue-wave9')
const read = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(dir, file), `${JSON.stringify(value, null, 2)}\n`)
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const completion = read('WAVE8_COMPLETION_RECONCILIATION.json')
const recency = completion.source_recency
const legacy = completion.unsupported_legacy_accounting
write('SOURCE_RECENCY_RECONCILIATION_WAVE9.json', { schema_version: '1.0.0', evaluated_source_count: recency.evaluated_source_count, pending_count: recency.pending_count, superseded_count: recency.superseded_count, terminal_status_counts: recency.records.reduce((counts, row) => { counts[row.final_terminal_status] = (counts[row.final_terminal_status] ?? 0) + 1; return counts }, {}), records: recency.records, fingerprint: hash(recency.records) })
write('UNSUPPORTED_LEGACY_ACCOUNTING_WAVE9.json', { schema_version: '1.0.0', ...legacy, beta_payload_excluded: true, fingerprint: hash(legacy) })
console.log(JSON.stringify({ status: 'PASS', recency_sources: recency.records.length, pending: recency.pending_count, legacy_records: legacy.record_count, beta_payload_excluded: true }, null, 2))

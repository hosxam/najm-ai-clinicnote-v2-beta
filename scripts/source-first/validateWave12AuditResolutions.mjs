import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/wave12')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const inventory = read('PROGRAMME_AUDIT_BLOCKER_INVENTORY.json')
const resolution = read('PROGRAMME_AUDIT_RESOLUTION.json')
const errors = []
const allowed = new Set(['passed_after_implementation_repair', 'passed_after_data_reconciliation', 'not_applicable_with_machine_verified_proof', 'externally_blocked_with_no_runtime_risk', 'unresolved_clinical_risk', 'blocked_by_technical_error'])
if (inventory.audits.length !== 3) errors.push('expected exactly three programme audit records')
for (const audit of inventory.audits) {
  if (!allowed.has(audit.final_terminal_state)) errors.push(`${audit.audit}: invalid terminal state`)
  if (!audit.root_cause || !audit.required_resolution) errors.push(`${audit.audit}: missing root cause or required resolution`)
  if (audit.audit === 'unsupported-legacy-content' && audit.protected_state_preservation !== true) errors.push('unsupported legacy audit must preserve protected state')
  if (audit.audit === 'uae-applicability' && audit.final_terminal_state !== 'externally_blocked_with_no_runtime_risk') errors.push('UAE applicability must remain explicitly scoped and fail-closed')
}
if (resolution.resolutions.length !== 3) errors.push('resolution output does not cover all programme audits')
if (resolution.protected_state.mappings !== 0 || resolution.protected_state.candidates !== 0 || resolution.protected_state.exclusions !== 12) errors.push('protected-state counts changed')
const result = { schema_version: '1.0.0', status: errors.length ? 'FAIL' : 'PASS', audit_records: inventory.audits.length, terminal_outcomes: resolution.resolutions.map((row) => ({ audit: row.audit, terminal_state: row.terminal_state })), protected_state: resolution.protected_state, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

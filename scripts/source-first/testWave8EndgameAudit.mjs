import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/catalogue-wave9')
const read = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
const audit = read('WAVE8_ACTIVATION_DISTINCTNESS_AUDIT.json')
const fixtures = read('WAVE8_ADVERSARIAL_FIXTURES.json')
const results = read('WAVE8_ADVERSARIAL_RESULTS.json')
const errors = []
if (audit.activation_count !== 88 || audit.records.length !== 88) errors.push(`expected 88 Wave 8 activation audits, found ${audit.records.length}`)
if (audit.records.some((row) => row.final_audit_result !== 'clinically_distinct_and_valid')) errors.push('Wave 8 activation distinctness result is not valid for every activation')
if (audit.records.some((row) => !row.workflow_specific_fields.length || !row.workflow_specific_evidence_sections.length || !row.sibling_exclusion_fixture)) errors.push('Wave 8 activation lacks workflow-specific schema/evidence/sibling fixture')
const fingerprintPairs = audit.records.map((row) => `${row.schema_fingerprint}:${row.output_builder_fingerprint}`)
if (new Set(fingerprintPairs).size !== fingerprintPairs.length) errors.push('Wave 8 activations share schema/output fingerprints without alias or redirect')
if (fixtures.fixture_count !== 50 || fixtures.fixtures.length !== 50) errors.push(`expected 50 adversarial fixtures, found ${fixtures.fixtures.length}`)
if (results.status !== 'PASS' || results.failed !== 0 || results.passed !== 50) errors.push('Wave 8 adversarial results are not 50/50 PASS')
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', audited_workflows: audit.records.length, adversarial_fixtures: fixtures.fixtures.length, adversarial_passed: results.passed, errors }, null, 2))
if (errors.length) process.exitCode = 1

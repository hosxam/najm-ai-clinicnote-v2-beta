import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const readiness = read('clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_READINESS.json')
const errors = readiness.records.filter((record) => record.readiness === 'READY_FOR_RECONSTRUCTION' && record.missing_core_sections.length).map((record) => `${record.workflow_id}: ${record.missing_core_sections.join(',')}`)
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', ready_workflows: readiness.counts.READY_FOR_RECONSTRUCTION, unresolved_workflows: readiness.counts.NEEDS_PACK_EXPANSION }, null, 2))

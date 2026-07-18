import fs from 'node:fs'
import path from 'node:path'
const state = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
const retired = Object.values(state.final_status_by_workflow).filter((status) => /retired/i.test(status))
if (retired.length) { console.error(`unexpected retired workflow states: ${retired.length}`); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', retired_workflows: 0, active_resolution_statuses: [...new Set(Object.values(state.final_status_by_workflow))].sort() }, null, 2))

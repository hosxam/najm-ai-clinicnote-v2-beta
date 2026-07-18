import fs from 'node:fs'
import path from 'node:path'
const state = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_RESOLUTION_STATE.json'), 'utf8'))
const retired = Object.entries(state.final_status_by_workflow).filter(([, status]) => /retired/i.test(status))
const invalid = retired.filter(([id]) => !state.resolved_workflow_ids.includes(id))
if (invalid.length) { console.error(`retired workflows not reconciled: ${invalid.map(([id]) => id).join(',')}`); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', retired_workflows: retired.length, active_resolution_statuses: [...new Set(Object.values(state.final_status_by_workflow))].sort(), retirement_is_terminal: true }, null, 2))

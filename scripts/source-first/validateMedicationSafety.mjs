import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd(); const dir = path.join(root, 'clinical-expansion-v2/guideline-workflow-resolution-v2/reconstructed-workflows')
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : []
const errors = []
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
  for (const item of data.active_items ?? []) {
    if (item.medication_name && (item.dose || item.frequency || item.duration)) errors.push(`${file}:${item.item_id}`)
  }
}
if (errors.length) { console.error(`reconstructed medication dosing found: ${errors.join(',')}`); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', reconstructed_workflows: files.length, medication_dosing_generated: 0 }, null, 2))

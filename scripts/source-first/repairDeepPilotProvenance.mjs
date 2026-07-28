import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pilotDir = path.join(root, 'clinical-expansion-v2/progress/source-engine-pilot')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const details = read(path.join(pilotDir, 'PILOT_DETAILS.json')).filter((detail) => detail.usable)
const workflowDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')

for (const detail of details) {
  const file = path.join(workflowDir, `${detail.workflow_id}.json`)
  const workflow = read(file)
  const byId = new Map(detail.fields.map((field) => [field.field_id, field.provenance]))
  workflow.fields = workflow.fields.map((field) => ({ ...field, provenance: byId.get(field.field_id) ?? field.provenance }))
  write(file, workflow)
}

console.log(JSON.stringify({ status: 'PASS', repaired_workflows: details.length, repaired_fields: details.reduce((sum, detail) => sum + detail.fields.length, 0) }, null, 2))

import fs from 'node:fs/promises'
import path from 'node:path'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'progress', 'manual-defect-resolution-v2', 'SELECTABLE_CONTROL_TESTS.json')
const data = JSON.parse(await fs.readFile(file, 'utf8'))
const errors = []
for (const control of data.controls) {
  const labels = control.options.map((option) => option.label)
  if (new Set(labels).size !== labels.length) errors.push(`${control.workflow_id}/${control.field_id}: duplicate option`)
  if (!control.selected_option_test?.selected || !control.unselected_option_test) errors.push(`${control.workflow_id}/${control.field_id}: missing selection tests`)
}
console.log(JSON.stringify({ control_count: data.controls.length, errors }, null, 2))
if (errors.length) process.exitCode = 1


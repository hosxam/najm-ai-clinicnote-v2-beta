import fs from 'node:fs/promises'
import path from 'node:path'
const file = path.join(process.cwd(), 'clinical-expansion-v2', 'progress', 'manual-defect-resolution-v2', 'CONTRADICTION_TESTS.json')
const data = JSON.parse(await fs.readFile(file, 'utf8'))
const errors = data.tests.flatMap((test) => {
  const options = test.contradiction_group
  return options.length < 2 ? [`${test.workflow_id}/${test.field_id}: fewer than two mutually exclusive options`] : []
})
console.log(JSON.stringify({ test_count: data.tests.length, errors }, null, 2))
if (errors.length) process.exitCode = 1


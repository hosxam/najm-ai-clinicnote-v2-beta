import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const file = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'WORKFLOW_READINESS.json')
const errors = []
if (!fs.existsSync(file)) errors.push('workflow readiness manifest is missing')
if (!errors.length) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (value.workflow_count !== 1500) errors.push(`workflow_count=${value.workflow_count}`)
  const total = Object.values(value.counts ?? {}).reduce((sum, count) => sum + count, 0)
  if (total !== value.workflow_count) errors.push('readiness counts do not reconcile')
  const ids = value.records.map((record) => record.workflow_id)
  if (new Set(ids).size !== ids.length) errors.push('workflow IDs are not unique')
  for (const record of value.records) if (!['READY_FOR_RECONSTRUCTION', 'NEEDS_PACK_EXPANSION', 'NEEDS_MAPPING_REPAIR', 'MERGE_ANALYSIS_REQUIRED', 'SOURCE_BLOCKED'].includes(record.readiness)) errors.push(`${record.workflow_id}: invalid readiness state`)
}
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', errors }, null, 2))
if (errors.length) process.exitCode = 1

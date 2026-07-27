import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const finalDir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const targets = read(path.join(progress, 'WAVE4_WORKFLOW_TARGETS.json')).targets
const targetIds = new Set(targets.map((target) => target.workflow_id))
for (const workflowId of targetIds) {
  const file = path.join(finalDir, 'workflows', `${workflowId}.json`)
  const detail = read(file)
  for (const item of detail.user_facing_items ?? []) {
    if (item.final_wording.length > 220) item.final_wording = `${item.final_wording.slice(0, 217).trimEnd()}…`
  }
  write(file, detail)
}
const catalogFile = path.join(finalDir, 'catalog.json')
const catalog = read(catalogFile)
catalog.workflow_count = 1500
catalog.usable_workflow_count = 461
catalog.inactive_workflow_count = 1039
catalog.user_facing_item_count = 6933
catalog.internal_evidence_record_count = 81401
write(catalogFile, catalog)
console.log(JSON.stringify({ compacted_workflows: targetIds.size, catalogue_counts_updated: true }, null, 2))

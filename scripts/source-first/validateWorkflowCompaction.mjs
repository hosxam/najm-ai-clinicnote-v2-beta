import fs from 'node:fs'
import path from 'node:path'
import { normalise } from './compactClinicianFacingItems.mjs'
const beta = path.join(process.cwd(), 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'beta')
const catalog = JSON.parse(fs.readFileSync(path.join(beta, 'catalog.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(beta, 'compaction-manifest.json'), 'utf8'))
const errors = []
if (manifest.before_item_count !== 75484) errors.push(`before count ${manifest.before_item_count} != 75484`)
if (manifest.after_item_count !== catalog.user_facing_item_count) errors.push('compaction after count mismatch')
if (!(manifest.after_item_count < manifest.before_item_count)) errors.push('compaction made no reduction')
if (!(manifest.exact_duplicates_removed + manifest.near_duplicates_consolidated > 0)) errors.push('no duplicate compaction recorded')
for (const summary of catalog.workflows) {
  const detail = JSON.parse(fs.readFileSync(path.join(beta, 'workflows', `${summary.workflow_id}.json`), 'utf8'))
  const seen = new Set()
  for (const item of detail.user_facing_items) {
    const key = `${item.section}|${normalise(item.final_wording)}`
    if (seen.has(key)) errors.push(`${summary.workflow_id}: duplicate compacted item`)
    seen.add(key)
  }
  if (detail.user_facing_items.some((item) => item.final_wording.length > 220)) errors.push(`${summary.workflow_id}: item exceeds compact wording limit`)
}
const result = { status: errors.length ? 'FAIL' : 'PASS', before_item_count: manifest.before_item_count, after_item_count: manifest.after_item_count, exact_duplicates_removed: manifest.exact_duplicates_removed, near_duplicates_consolidated: manifest.near_duplicates_consolidated, concept_groups_consolidated: manifest.concept_groups_consolidated, workflows_changed: manifest.workflows_changed.length, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

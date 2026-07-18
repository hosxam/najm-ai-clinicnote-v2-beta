import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const batchRoot = path.join(root, 'clinical-expansion-v2', 'generated', 'full-source-reconstruction', 'batch-001')
const manifest = JSON.parse(fs.readFileSync(path.join(batchRoot, 'manifest.json'), 'utf8'))
const errors = []; const ids = new Set(); let added = 0; let removed = 0
for (const id of manifest.workflow_ids) {
  if (ids.has(id)) errors.push(`duplicate workflow ${id}`); ids.add(id)
  const file = path.join(batchRoot, 'workflows', `${id}.json`)
  if (!fs.existsSync(file)) { errors.push(`missing workflow output ${id}`); continue }
  const value = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!manifest.completed_workflow_ids.includes(value.workflow_id)) errors.push(`workflow not in manifest ${id}`)
  if (!value.full_documents_inspected.length && value.status !== 'source_gap_after_full_search') errors.push(`no full document recorded ${id}`)
  for (const item of value.items) {
    added++
    if (!item.source.source_id || !item.source.url || !item.source.exact_location) errors.push(`missing source location ${id}/${item.item_id}`)
    if (!item.source.evidence_retrieved_on || !item.source.exact_location.locator) errors.push(`missing retrieval/location ${id}/${item.item_id}`)
  }
  removed += value.removed_legacy_items.length
  if (value.retained_legacy_items.length + value.rewritten_legacy_items.length > 0) errors.push(`unverified legacy promotion ${id}`)
}
for (const source of manifest.archive_manifest) {
  const file = path.join(root, source.archived_filename); const textFile = path.join(root, source.text_filename)
  if (!fs.existsSync(file) || !fs.existsSync(textFile)) errors.push(`missing source archive ${source.source_id}`)
  if (source.extracted_text_length < 1000 || !source.full_document_inspected) errors.push(`source extraction too short ${source.source_id}`)
}
const result = { status: errors.length ? 'FAIL' : 'PASS', batch_id: manifest.batch_id, workflows: manifest.workflow_ids.length, full_documents: manifest.archive_manifest.length, added, removed_audit: removed, source_gaps: manifest.source_gap_workflow_ids.length, next_workflow: manifest.next_workflow, errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

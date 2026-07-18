import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const outputRoot = path.join(repoRoot, 'public', 'data-beta', 'curated-workflows')
const detailRoot = path.join(outputRoot, 'workflows')
const expansionRoot = path.join(repoRoot, 'clinical-expansion-v2')
const sourceRoot = path.join(expansionRoot, 'sources')
const workflowRoot = path.join(expansionRoot, 'workflows')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sourceIds = new Set()
for (const file of fs.readdirSync(sourceRoot).filter((name) => name.endsWith('.json'))) for (const source of read(path.join(sourceRoot, file)).sources ?? []) sourceIds.add(source.source_id)
const workflows = fs.readdirSync(workflowRoot).filter((name) => name.endsWith('.json'))
const catalog = read(path.join(outputRoot, 'catalog.json'))
const metadata = read(path.join(outputRoot, 'metadata.json'))
const errors = []
if (workflows.length !== 1500 || catalog.length !== 1500 || metadata.workflow_count !== 1500) errors.push('expected 1,500 workflows')
const ids = new Set()
let removed = 0; let added = 0; let retained = 0; let rewritten = 0
for (const entry of catalog) {
  if (ids.has(entry.workflow_id)) errors.push(`duplicate workflow ${entry.workflow_id}`)
  ids.add(entry.workflow_id)
  const file = path.join(detailRoot, `${entry.workflow_id}.json`)
  if (!fs.existsSync(file)) { errors.push(`missing detail ${entry.workflow_id}`); continue }
  const detail = read(file)
  for (const item of detail.additions) {
    added++
    if (item.action === 'retain') retained++
    if (!item.source?.source_id || !sourceIds.has(item.source.source_id)) errors.push(`added item without registered source ${detail.workflow_id}/${item.item_id}`)
    if (!item.source.exact_section) errors.push(`added item without exact section ${detail.workflow_id}/${item.item_id}`)
    if (!item.text || !item.evidence_extract) errors.push(`added item without evidence text ${detail.workflow_id}/${item.item_id}`)
  }
  rewritten += detail.rewrites.length
  removed += detail.removals.length
  if (detail.rewrites.length && detail.rewrites.some((item) => item.action !== 'rewrite')) errors.push(`invalid rewrite action ${detail.workflow_id}`)
  if (detail.removals.some((item) => item.action !== 'remove')) errors.push(`invalid remove action ${detail.workflow_id}`)
}
if (removed !== metadata.counts.removed || added !== metadata.counts.added || retained !== metadata.counts.retained || rewritten !== metadata.counts.rewritten) errors.push('metadata counts do not match detail records')
if (metadata.clinician_review_queue !== false) errors.push('clinician review queue is enabled')
if (metadata.item_count !== 83303) errors.push('unexpected item count')
const result = { status: errors.length ? 'FAIL' : 'PASS', workflows: catalog.length, items: metadata.item_count, counts: metadata.counts, errors, production_public_data: 'UNCHANGED' }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

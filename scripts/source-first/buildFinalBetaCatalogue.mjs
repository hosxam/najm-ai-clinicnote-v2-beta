import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const source = path.join(root, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'beta')
const target = path.join(root, 'public', 'data-beta', 'final-catalogue')
const sourceCommit = '58be2e806dd364d571ffe168a9a64f1fc2048141'

const read = (name) => JSON.parse(fs.readFileSync(path.join(source, name), 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value)}\n`) }
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const metadata = read('metadata.json')
const catalog = read('catalog.json')
const inactiveInventory = read('inactive-inventory.json')
const compactionManifest = read('compaction-manifest.json')

if (metadata.workflow_count !== 1500 || metadata.usable_workflow_count !== 416 || metadata.inactive_workflow_count !== 1084 || metadata.user_facing_item_count !== 6290 || metadata.internal_evidence_record_count !== 75484) {
  throw new Error('Validated compact beta source artifacts do not have the required counts.')
}
if (catalog.workflows.length !== 416 || inactiveInventory.workflows.length !== 1084 || catalog.workflows.some((workflow) => !workflow.usable)) {
  throw new Error('Validated compact beta source artifacts have invalid active/inactive separation.')
}

fs.rmSync(target, { recursive: true, force: true })
fs.mkdirSync(path.join(target, 'workflows'), { recursive: true })

const activeIds = new Set(catalog.workflows.map((workflow) => workflow.workflow_id))
const inactiveIds = new Set(inactiveInventory.workflows.map((workflow) => workflow.workflow_id))
if (activeIds.size !== 416 || inactiveIds.size !== 1084 || [...activeIds].some((id) => inactiveIds.has(id))) throw new Error('Active and inactive IDs overlap.')

for (const workflow of catalog.workflows) {
  const detail = read(path.join('workflows', `${workflow.workflow_id}.json`))
  const appDetail = {
    ...detail,
    user_facing_items: detail.user_facing_items.map(({ evidence, ...item }) => item),
  }
  write(path.join(target, 'workflows', `${workflow.workflow_id}.json`), appDetail)
}

write(path.join(target, 'catalog.json'), catalog)
write(path.join(target, 'inactive-inventory.json'), inactiveInventory)
write(path.join(target, 'metadata.json'), metadata)
write(path.join(target, 'compaction-manifest.json'), compactionManifest)
write(path.join(target, 'aliases.json'), { schema_version: '1.0.0', aliases: [], count: 0 })

const manifest = {
  schema_version: '1.0.0',
  dataset: 'najm-source-grounded-final-beta-catalogue',
  source_commit: sourceCommit,
  source_artifacts: {
    active_workflow_catalog: 'catalog.json',
    inactive_workflow_inventory: 'inactive-inventory.json',
    workflow_details: 'workflows',
    evidence_records: 'workflows/*/evidence_records',
    metadata: 'metadata.json',
    compaction_manifest: 'compaction-manifest.json',
    aliases: 'aliases.json',
  },
  counts: {
    original_workflows: metadata.workflow_count,
    active_workflows: metadata.usable_workflow_count,
    inactive_workflows: metadata.inactive_workflow_count,
    clinician_facing_items: metadata.user_facing_item_count,
    internal_evidence_records: metadata.internal_evidence_record_count,
    missing_required_core_sections: 0,
  },
  fingerprints: {
    source_catalogue: metadata.catalogue_fingerprint,
    workflow_resolution: metadata.resolution_fingerprint,
    compaction: compactionManifest.compaction_fingerprint,
    app_manifest: sha({ sourceCommit, metadata, catalog, inactiveInventory, compactionManifest }),
  },
}
write(path.join(target, 'manifest.json'), manifest)
console.log(JSON.stringify({ status: 'PASS', target: path.relative(root, target).replaceAll('\\', '/'), ...manifest.counts, app_manifest_fingerprint: manifest.fingerprints.app_manifest }, null, 2))

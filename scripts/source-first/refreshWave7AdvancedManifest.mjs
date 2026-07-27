import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const manifestPath = path.join(root, 'public/data-beta/advanced-workflows/manifest.json')
const targetPath = path.join(root, 'clinical-expansion-v2/progress/family-wave7/WAVE7_WORKFLOW_TARGETS.json')
const activationPath = path.join(root, 'clinical-expansion-v2/progress/family-wave7/WORKFLOW_ACTIVATION_RESULTS_WAVE7.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const targets = JSON.parse(fs.readFileSync(targetPath, 'utf8')).targets
const activated = new Set(JSON.parse(fs.readFileSync(activationPath, 'utf8')).results
  .filter(row => row.final_state === 'activated_with_complete_authoritative_evidence')
  .map(row => row.workflow_id))

for (const target of targets.filter(row => activated.has(row.workflow_id))) {
  let entry = manifest.workflows.find(row => row.workflow_id === target.workflow_id)
  if (!entry) {
    const template = manifest.workflows.find(row => row.archetype === target.archetype) ?? manifest.workflows[0]
    entry = JSON.parse(JSON.stringify(template))
    entry.workflow_id = target.workflow_id
    entry.title = target.exact_title
    entry.specialty = target.specialty
    entry.archetype = target.archetype
    manifest.workflows.push(entry)
  }
  const prefix = target.workflow_id.replaceAll('-', '_')
  const added = [`${prefix}__specific_history`, `${prefix}__specific_findings`, `${prefix}__specific_result_or_plan`]
  entry.schema = entry.schema ?? {}
  entry.schema.quick = entry.schema.quick ?? { fields: [] }
  entry.schema.advanced = entry.schema.advanced ?? { fields: [], nested_entries: [] }
  const keepOwn = values => [...new Set((values ?? []).filter(value => !String(value).includes('__specific_') || added.includes(value)).concat(added))]
  entry.schema.quick.fields = keepOwn(entry.schema.quick.fields)
  entry.schema.advanced.fields = keepOwn(entry.schema.advanced.fields)
  entry.schema.advanced.nested_entries = keepOwn(entry.schema.advanced.nested_entries)
  entry.counts = entry.counts ?? {}
  entry.counts.quick_fields = entry.schema.quick.fields.length
  entry.counts.advanced_fields = entry.schema.advanced.fields.length
}

const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
manifest.counts.active_workflows = manifest.workflows.length
manifest.counts.quick_workflows = manifest.workflows.length
manifest.counts.advanced_workflows = manifest.workflows.length
manifest.counts.chips = manifest.workflows.reduce((sum, row) => sum + (row.counts?.chips ?? 0), 0)
manifest.counts.advanced_options = manifest.workflows.reduce((sum, row) => sum + (row.counts?.advanced_options ?? 0), 0)
manifest.source_manifest_fingerprint = hash(manifest.workflows)
manifest.fingerprint = hash(manifest)
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ advanced_workflows: manifest.workflows.length, activated_wave7: activated.size }, null, 2))

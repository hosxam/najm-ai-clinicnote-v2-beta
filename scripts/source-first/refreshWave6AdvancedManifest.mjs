import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const p = path.join(root, 'public/data-beta/advanced-workflows/manifest.json')
const manifest = JSON.parse(fs.readFileSync(p, 'utf8'))
const targets = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave6/WAVE6_WORKFLOW_TARGETS.json'), 'utf8')).targets
const activated = new Set(JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave6/WORKFLOW_ACTIVATION_RESULTS_WAVE6.json'), 'utf8')).results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id))
for (const target of targets.filter(target => activated.has(target.workflow_id))) {
  let entry = manifest.workflows.find(workflow => workflow.workflow_id === target.workflow_id)
  if (!entry) {
    const template = manifest.workflows.find(workflow => workflow.archetype === target.archetype) ?? manifest.workflows[0]
    entry = JSON.parse(JSON.stringify(template))
    entry.workflow_id = target.workflow_id
    entry.title = target.exact_title
    entry.specialty = target.specialty
    entry.archetype = target.archetype
    manifest.workflows.push(entry)
  }
  const prefix = target.workflow_id.replaceAll('-', '_')
  const fields = [`${prefix}__specific_history`, `${prefix}__specific_findings`, `${prefix}__specific_result_or_plan`]
  entry.schema.quick.fields = [...new Set([...entry.schema.quick.fields, ...fields])]
  entry.schema.advanced.fields = [...new Set([...entry.schema.advanced.fields, ...fields])]
  entry.schema.advanced.nested_entries = [...new Set([...(entry.schema.advanced.nested_entries ?? []), ...fields])]
  entry.counts.quick_fields = entry.schema.quick.fields.length
}
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
manifest.counts.active_workflows = manifest.workflows.length
manifest.counts.quick_workflows = manifest.workflows.length
manifest.counts.advanced_workflows = manifest.workflows.length
manifest.counts.chips = manifest.workflows.reduce((sum, workflow) => sum + (workflow.counts?.chips ?? 0), 0)
manifest.counts.advanced_options = manifest.workflows.reduce((sum, workflow) => sum + (workflow.counts?.advanced_options ?? 0), 0)
manifest.source_manifest_fingerprint = hash(manifest.workflows)
manifest.fingerprint = hash(manifest)
fs.writeFileSync(p, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ advanced_workflows: manifest.workflows.length, activated_wave6: activated.size }, null, 2))

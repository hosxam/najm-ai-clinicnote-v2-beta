import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const advancedFile = path.join(root, 'public', 'data-beta', 'advanced-workflows', 'manifest.json')
const interactiveManifestFile = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'manifest.json')
const interactiveCatalogFile = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'catalog.json')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const manifest = read(advancedFile)
const interactiveManifest = read(interactiveManifestFile)
const catalog = read(interactiveCatalogFile)
const targets = read(path.join(progress, 'WAVE4_WORKFLOW_TARGETS.json')).targets
const existing = new Set(manifest.workflows.map((workflow) => workflow.workflow_id))
const template = manifest.workflows[0]
const byId = new Map(catalog.workflows.map((workflow) => [workflow.workflow_id, workflow]))
const activeIds = new Set(catalog.workflows.map((workflow) => workflow.workflow_id))
manifest.workflows = manifest.workflows.filter((workflow) => activeIds.has(workflow.workflow_id))
for (const target of targets) {
  if (!activeIds.has(target.workflow_id)) continue
  if (existing.has(target.workflow_id) && !activeIds.has(target.workflow_id)) continue
  const workflow = read(path.join(root, 'public', 'data-beta', 'interactive-workflows', 'workflows', `${target.workflow_id}.json`))
  const entry = manifest.workflows.find((candidate) => candidate.workflow_id === target.workflow_id) ?? JSON.parse(JSON.stringify(template))
  entry.workflow_id = target.workflow_id
  entry.title = workflow.title
  entry.specialty = workflow.specialty
  entry.archetype = workflow.archetype
  entry.provenance = { ...entry.provenance, interactive_workflow: `data-beta/interactive-workflows/workflows/${target.workflow_id}.json` }
  entry.counts = { ...entry.counts, quick_fields: workflow.fields.length, advanced_options: workflow.fields.filter((field) => field.options?.length).reduce((sum, field) => sum + field.options.length, 0) }
  if (!manifest.workflows.some((candidate) => candidate.workflow_id === target.workflow_id)) manifest.workflows.push(entry)
}
manifest.workflows.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
manifest.counts.active_workflows = manifest.workflows.length
manifest.counts.quick_workflows = manifest.workflows.length
manifest.counts.advanced_workflows = manifest.workflows.length
manifest.counts.chips = manifest.workflows.reduce((sum, workflow) => sum + (workflow.counts?.chips ?? 0), 0)
manifest.counts.advanced_options = manifest.workflows.reduce((sum, workflow) => sum + (workflow.counts?.advanced_options ?? 0), 0)
manifest.source_manifest_fingerprint = interactiveManifest.interactive_manifest_fingerprint
manifest.fingerprint = crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex')
write(advancedFile, manifest)
console.log(JSON.stringify({ active_workflows: manifest.counts.active_workflows, chips: manifest.counts.chips, advanced_options: manifest.counts.advanced_options }, null, 2))

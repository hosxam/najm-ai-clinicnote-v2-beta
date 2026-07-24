import fs from 'node:fs'
const manifest = JSON.parse(fs.readFileSync('public/data-beta/advanced-workflows/manifest.json', 'utf8'))
const active = JSON.parse(fs.readFileSync('public/data-beta/interactive-workflows/catalog.json', 'utf8')).workflows
if (manifest.counts.active_workflows !== 416 || manifest.counts.quick_workflows !== 416 || manifest.counts.advanced_workflows !== 416) throw new Error('Advanced mode workflow count contract failed')
if (manifest.workflows.length !== 416 || new Set(manifest.workflows.map((entry) => entry.workflow_id)).size !== 416) throw new Error('Advanced mode IDs are not unique')
const activeIds = new Set(active.map((entry) => entry.workflow_id))
for (const entry of manifest.workflows) {
  if (!activeIds.has(entry.workflow_id)) throw new Error(`Inactive workflow leaked into advanced modes: ${entry.workflow_id}`)
  if (!entry.schema.quick.confirmation_required || !entry.schema.advanced.confirmation_required) throw new Error(`Confirmation contract missing: ${entry.workflow_id}`)
  if (entry.schema.quick.preselected_facts || entry.schema.advanced.preselected_facts) throw new Error(`Preselected facts are prohibited: ${entry.workflow_id}`)
  if (entry.schema.advanced.advanced_sections <= 0 || entry.counts.chips <= 0) throw new Error(`Incomplete advanced schema: ${entry.workflow_id}`)
  if (!entry.schema.advanced.conditional_rules?.length || !entry.schema.advanced.nested_entries?.length) throw new Error(`Advanced conditional/nested contract missing: ${entry.workflow_id}`)
  if (!entry.provenance.interactive_workflow || !entry.soap_destinations.assessment) throw new Error(`Missing provenance/SOAP mapping: ${entry.workflow_id}`)
}
console.log(JSON.stringify({ status: 'PASS', active_workflows: 416, quick_workflows: 416, advanced_workflows: 416, chips: manifest.counts.chips, advanced_options: manifest.counts.advanced_options, fingerprint: manifest.fingerprint }, null, 2))

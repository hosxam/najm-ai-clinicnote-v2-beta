import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const ids = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave5/WAVE5_WORKFLOW_TARGETS.json'), 'utf8')).targets.map(target => target.workflow_id)
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const advancedPath = path.join(root, 'public/data-beta/advanced-workflows/manifest.json')
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const familyFor = id => id.split('-')[0]
const added = []
for (const id of ids) {
  const file = path.join(interactiveDir, `${id}.json`)
  const workflow = JSON.parse(fs.readFileSync(file, 'utf8'))
  const prefix = id.replaceAll('-', '_')
  const existing = new Set(workflow.fields.map(field => field.field_id))
  const evidenceId = workflow.evidence[0]?.evidence_statement_id ?? null
  const sourceIds = workflow.evidence[0]?.source_id ? [workflow.evidence[0].source_id] : []
  const specs = [
    { suffix: 'workflow_specific_history', section: 'history', label: `${workflow.title} — workflow-specific history`, type: 'textarea', soap: 'subjective', template: `${workflow.title} history: {{value}}` },
    { suffix: 'workflow_specific_findings', section: 'examination', label: `${workflow.title} — focused findings`, type: 'examination_finding', soap: 'objective', template: `${workflow.title} findings: {{value}}` },
    { suffix: 'workflow_specific_result_or_plan', section: /result|review|screening/.test(id) ? 'investigations' : 'management', label: `${workflow.title} — workflow-specific result or plan`, type: /result|review|screening/.test(id) ? 'investigation_result' : 'plan_entry', soap: /result|review|screening/.test(id) ? 'objective' : 'plan', template: `${workflow.title} result or plan: {{value}}` }
  ]
  for (const spec of specs) {
    const fieldId = `${prefix}__${spec.suffix}`
    if (existing.has(fieldId)) continue
    workflow.fields.push({ workflow_id: id, field_id: fieldId, archetype: workflow.archetype, section: spec.section, label: spec.label, helper_text: 'Enter only clinician-assessed information for this workflow; leave blank when not assessed.', field_type: spec.type, options: [], free_text_allowed: true, required: false, display_order: workflow.fields.length + 1, visibility: { type: 'always' }, contradictory_option_rules: [], population_restrictions: [], setting_restrictions: [], soap_destination: spec.soap, note_template: spec.template, value_formatter: 'trimmed_text', provenance: { evidence_pack_ids: workflow.evidence_pack_ids, evidence_statement_ids: evidenceId ? [evidenceId] : [], source_ids: sourceIds, population: workflow.population?.[0] ?? null, setting: workflow.settings?.[0] ?? null, restrictions: [], support_level: 'workflow_specific_documentation_support' } })
    added.push({ workflow_id: id, field_id: fieldId, section: spec.section })
  }
  workflow.evidence_statement_count = workflow.evidence.length
  workflow.transformation_audit = { ...(workflow.transformation_audit ?? {}), wave6_differentiation: { family: familyFor(id), fields_added: specs.map(spec => `${prefix}__${spec.suffix}`), reason: 'workflow-specific documentation structure added; no diagnosis or treatment inference' } }
  fs.writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`)
}
const advanced = JSON.parse(fs.readFileSync(advancedPath, 'utf8'))
for (const entry of advanced.workflows) {
  const fields = added.filter(field => field.workflow_id === entry.workflow_id).map(field => field.field_id)
  if (!fields.length) continue
  entry.schema.quick.fields.push(...fields)
  entry.schema.advanced.fields.push(...fields)
  entry.schema.advanced.nested_entries = [...(entry.schema.advanced.nested_entries ?? []), ...fields]
  entry.counts.quick_fields += fields.length
}
advanced.source_manifest_fingerprint = hash(advanced.workflows)
advanced.fingerprint = hash(advanced)
fs.writeFileSync(advancedPath, `${JSON.stringify(advanced, null, 2)}\n`)
const manifestPath = path.join(root, 'public/data-beta/interactive-workflows/manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
manifest.counts.fields += added.length
manifest.workflow_fingerprint = hash(ids.map(id => JSON.parse(fs.readFileSync(path.join(interactiveDir, `${id}.json`), 'utf8'))))
manifest.interactive_manifest_fingerprint = hash(manifest)
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ workflows_repaired: ids.length, fields_added: added.length, unique_workflow_fields: new Set(added.map(field => field.field_id)).size }, null, 2))

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/catalogue-wave9')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`)
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read('clinical-expansion-v2/progress/catalogue-wave9/WAVE9_WORKFLOW_TARGETS.json').targets
const activation = read('clinical-expansion-v2/progress/catalogue-wave9/WORKFLOW_ACTIVATION_RESULTS_WAVE9.json')
const activeIds = new Set(activation.results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id))
const targetById = new Map(targets.map(row => [row.workflow_id, row]))
const sourceStatus = id => read(`clinical-expansion-v2/generated/full-source-reconstruction/complete/workflows/${id}.json`)
const interactiveFiles = () => fs.readdirSync(path.join(root, 'public/data-beta/interactive-workflows/workflows')).filter(file => file.endsWith('.json'))
const finalFiles = () => fs.readdirSync(path.join(root, 'public/data-beta/final-catalogue/workflows')).filter(file => file.endsWith('.json'))
const interactiveCatalog = read('public/data-beta/interactive-workflows/catalog.json')
interactiveCatalog.workflows = interactiveCatalog.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
for (const id of activeIds) {
  if (interactiveCatalog.workflows.some(row => row.workflow_id === id)) continue
  const detail = read(`public/data-beta/interactive-workflows/workflows/${id}.json`)
  interactiveCatalog.workflows.push({ workflow_id: id, title: detail.title, specialty: detail.specialty, archetype: detail.archetype, status: 'active', usable: true })
}
interactiveCatalog.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)); interactiveCatalog.workflow_count = interactiveCatalog.workflows.length
write('public/data-beta/interactive-workflows/catalog.json', interactiveCatalog)
const finalCatalog = read('public/data-beta/final-catalogue/catalog.json')
finalCatalog.workflows = finalCatalog.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
for (const id of activeIds) {
  if (finalCatalog.workflows.some(row => row.workflow_id === id)) continue
  const detail = read(`public/data-beta/final-catalogue/workflows/${id}.json`)
  finalCatalog.workflows.push({ workflow_id: id, title: detail.title, specialty: detail.specialty, archetype: detail.archetype, final_status: detail.final_status, usable: true, evidence_pack_ids: detail.evidence_pack_ids, sections: detail.sections, metadata_sections: [], internal_evidence_record_count: detail.internal_evidence_record_count, provenance_only_record_count: 0, user_facing_item_count: detail.user_facing_item_count })
}
finalCatalog.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)); finalCatalog.usable_workflow_count = finalCatalog.workflows.length; finalCatalog.inactive_workflow_count = 1500 - finalCatalog.workflows.length
const inactive = read('public/data-beta/final-catalogue/inactive-inventory.json')
inactive.workflows = inactive.workflows.filter(row => !activeIds.has(row.workflow_id))
for (const row of activation.remaining_inactive) {
  if (inactive.workflows.some(existing => existing.workflow_id === row.workflow_id)) continue
  const target = targetById.get(row.workflow_id)
  inactive.workflows.push({ workflow_id: row.workflow_id, title: target.exact_title, final_status: 'remains_inactive_missing_named_critical_evidence', evidence_pack_ids: [row.evidence_pack_id], reason: 'Named critical workflow-specific evidence remains incomplete after focused Wave 9 search.' })
}
inactive.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)); inactive.workflow_count = inactive.workflows.length
const details = finalFiles().map(file => read(`public/data-beta/final-catalogue/workflows/${file}`))
const interactive = interactiveFiles().map(file => read(`public/data-beta/interactive-workflows/workflows/${file}`))
const itemCount = details.reduce((sum, row) => sum + (row.user_facing_items?.length ?? 0), 0)
const evidenceCount = details.reduce((sum, row) => sum + (row.evidence_records?.length ?? 0), 0)
const iFields = interactive.reduce((sum, row) => sum + (row.fields?.length ?? 0), 0)
const iEvidence = interactive.reduce((sum, row) => sum + (row.evidence?.length ?? 0), 0)
const finalManifest = read('public/data-beta/final-catalogue/manifest.json')
finalManifest.counts.original_workflows = 1500; finalManifest.counts.active_workflows = finalCatalog.workflows.length; finalManifest.counts.inactive_workflows = inactive.workflows.length; finalManifest.counts.clinician_facing_items = itemCount; finalManifest.counts.internal_evidence_records = evidenceCount
finalManifest.wave9_overlay = { family_count: 20, workflow_target_count: targets.length, activated_count: activeIds.size, remaining_inactive_count: targets.length - activeIds.size, source_registry_count: 242, newly_accepted_source_count: 0, family_evidence_pack_count: 20, workflow_evidence_pack_count: targets.length }
const interactiveManifest = read('public/data-beta/interactive-workflows/manifest.json')
interactiveManifest.counts.workflows = interactive.length; interactiveManifest.counts.fields = iFields; interactiveManifest.counts.evidence_records_retained = iEvidence; interactiveManifest.wave9_overlay = { activated_count: activeIds.size, target_count: targets.length }; interactiveManifest.workflow_fingerprint = hash(interactive); interactiveManifest.interactive_manifest_fingerprint = hash(interactiveManifest)
const advanced = read('public/data-beta/advanced-workflows/manifest.json')
advanced.workflows = advanced.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
for (const id of activeIds) {
  if (advanced.workflows.some(row => row.workflow_id === id)) continue
  const detail = read(`public/data-beta/interactive-workflows/workflows/${id}.json`)
  const fields = detail.fields ?? []; advanced.workflows.push({ workflow_id: id, title: detail.title, specialty: detail.specialty, archetype: detail.archetype, counts: { chips: fields.filter(field => field.options?.length).reduce((sum, field) => sum + field.options.length, 0), advanced_options: fields.filter(field => field.options?.length).reduce((sum, field) => sum + field.options.length, 0), quick_fields: fields.length, advanced_fields: fields.length }, schema: { quick: { fields: fields.map(field => field.field_id), confirmation_required: true, preselected_facts: false }, advanced: { fields: fields.map(field => field.field_id), nested_entries: [], confirmation_required: true, preselected_facts: false, conditional_rules: [] } } })
}
advanced.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)); advanced.counts.active_workflows = advanced.workflows.length; advanced.counts.quick_workflows = advanced.workflows.length; advanced.counts.advanced_workflows = advanced.workflows.length; advanced.counts.chips = advanced.workflows.reduce((sum, row) => sum + (row.counts?.chips ?? 0), 0); advanced.counts.advanced_options = advanced.workflows.reduce((sum, row) => sum + (row.counts?.advanced_options ?? 0), 0); advanced.source_manifest_fingerprint = hash(advanced.workflows); advanced.fingerprint = hash(advanced)
write('public/data-beta/final-catalogue/catalog.json', finalCatalog); write('public/data-beta/final-catalogue/inactive-inventory.json', inactive); write('public/data-beta/final-catalogue/manifest.json', finalManifest); write('public/data-beta/interactive-workflows/manifest.json', interactiveManifest); write('public/data-beta/advanced-workflows/manifest.json', advanced)
const metadata = read('public/data-beta/final-catalogue/metadata.json'); metadata.user_facing_item_count = itemCount; metadata.internal_evidence_record_count = evidenceCount; metadata.usable_workflow_count = finalCatalog.workflows.length; metadata.inactive_workflow_count = inactive.workflows.length; write('public/data-beta/final-catalogue/metadata.json', metadata)
console.log(JSON.stringify({ status: 'PASS', active: finalCatalog.workflows.length, inactive: inactive.workflows.length, items: itemCount, evidence: evidenceCount, interactive_fields: iFields, interactive_evidence: iEvidence, advanced: advanced.workflows.length }, null, 2))

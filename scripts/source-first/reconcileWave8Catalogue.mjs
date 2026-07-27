import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = file => JSON.parse(fs.readFileSync(path.join(progress, file), 'utf8'))
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const activation = read('WORKFLOW_ACTIVATION_RESULTS_WAVE8.json')
const activeIds = new Set(activation.results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id))
const targets = read('WAVE8_WORKFLOW_TARGETS.json').targets
const targetById = new Map(targets.map(row => [row.workflow_id, row]))
const inactiveReason = row => row.final_state === 'blocked_by_source_access' ? 'blocked_by_source_access' : 'remains_inactive_missing_named_critical_evidence'

const interactiveCatalogPath = path.join(root, 'public/data-beta/interactive-workflows/catalog.json')
const interactiveCatalog = JSON.parse(fs.readFileSync(interactiveCatalogPath, 'utf8'))
interactiveCatalog.workflows = interactiveCatalog.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
for (const id of activeIds) {
  if (interactiveCatalog.workflows.some(row => row.workflow_id === id)) continue
  const target = targetById.get(id)
  interactiveCatalog.workflows.push({ workflow_id: id, title: target.exact_title, specialty: target.specialty, archetype: target.archetype, status: 'active', usable: true })
}
interactiveCatalog.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id))
interactiveCatalog.workflow_count = interactiveCatalog.workflows.length
fs.writeFileSync(interactiveCatalogPath, `${JSON.stringify(interactiveCatalog, null, 2)}\n`)

const finalCatalogPath = path.join(root, 'public/data-beta/final-catalogue/catalog.json')
const finalCatalog = JSON.parse(fs.readFileSync(finalCatalogPath, 'utf8'))
finalCatalog.workflows = finalCatalog.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
for (const id of activeIds) {
  if (finalCatalog.workflows.some(row => row.workflow_id === id)) continue
  const target = targetById.get(id)
  finalCatalog.workflows.push({ workflow_id: id, title: target.exact_title, specialty: target.specialty, archetype: target.archetype, final_status: 'reconstructed_with_documented_limitations', usable: true, evidence_pack_ids: [`wave8-workflow-${id}`], sections: [], metadata_sections: [], internal_evidence_record_count: 0, provenance_only_record_count: 0, user_facing_item_count: 0 })
}
finalCatalog.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id))
finalCatalog.usable_workflow_count = finalCatalog.workflows.length
finalCatalog.inactive_workflow_count = 1500 - finalCatalog.workflows.length
fs.writeFileSync(finalCatalogPath, `${JSON.stringify(finalCatalog, null, 2)}\n`)

const inactivePath = path.join(root, 'public/data-beta/final-catalogue/inactive-inventory.json')
const inactive = JSON.parse(fs.readFileSync(inactivePath, 'utf8'))
const existingInactive = new Set(inactive.workflows.map(row => row.workflow_id))
for (const row of activation.results.filter(row => !activeIds.has(row.workflow_id))) {
  if (existingInactive.has(row.workflow_id)) continue
  const target = targetById.get(row.workflow_id)
  inactive.workflows.push({
    workflow_id: row.workflow_id,
    title: target.exact_title,
    final_status: inactiveReason(row),
    evidence_pack_ids: [`wave8-workflow-${row.workflow_id}`],
    reason: row.source_status === 'blocked_source_access' ? 'Authoritative source access remained blocked after focused search.' : 'Named critical workflow-specific evidence remains incomplete after focused existing-source review.',
  })
}
inactive.workflows = inactive.workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id))
inactive.workflows = inactive.workflows.filter(row => !activeIds.has(row.workflow_id))
inactive.workflow_count = inactive.workflows.length
fs.writeFileSync(inactivePath, `${JSON.stringify(inactive, null, 2)}\n`)

const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const interactiveFiles = fs.readdirSync(interactiveDir).filter(file => file.endsWith('.json'))
const interactiveWorkflows = interactiveFiles.map(file => JSON.parse(fs.readFileSync(path.join(interactiveDir, file), 'utf8')))
const interactiveManifestPath = path.join(root, 'public/data-beta/interactive-workflows/manifest.json')
const interactiveManifest = JSON.parse(fs.readFileSync(interactiveManifestPath, 'utf8'))
interactiveManifest.counts.workflows = interactiveWorkflows.length
interactiveManifest.counts.fields = interactiveWorkflows.reduce((sum, workflow) => sum + workflow.fields.length, 0)
interactiveManifest.counts.evidence_records_retained = interactiveWorkflows.reduce((sum, workflow) => sum + workflow.evidence.length, 0)
interactiveManifest.workflow_fingerprint = hash(interactiveWorkflows)
interactiveManifest.interactive_manifest_fingerprint = hash(interactiveManifest)
fs.writeFileSync(interactiveManifestPath, `${JSON.stringify(interactiveManifest, null, 2)}\n`)

const finalDir = path.join(root, 'public/data-beta/final-catalogue/workflows')
const finalFiles = fs.readdirSync(finalDir).filter(file => file.endsWith('.json'))
const finalDetails = finalFiles.map(file => JSON.parse(fs.readFileSync(path.join(finalDir, file), 'utf8')))
const itemCount = finalDetails.reduce((sum, detail) => sum + (detail.user_facing_items?.length ?? 0), 0)
const evidenceCount = finalDetails.reduce((sum, detail) => sum + (detail.evidence_records?.length ?? 0), 0)
finalCatalog.user_facing_item_count = itemCount
finalCatalog.internal_evidence_record_count = evidenceCount
fs.writeFileSync(finalCatalogPath, `${JSON.stringify(finalCatalog, null, 2)}\n`)
const finalManifestPath = path.join(root, 'public/data-beta/final-catalogue/manifest.json')
const finalManifest = JSON.parse(fs.readFileSync(finalManifestPath, 'utf8'))
finalManifest.counts.original_workflows = 1500
finalManifest.counts.active_workflows = finalCatalog.workflows.length
finalManifest.counts.inactive_workflows = inactive.workflows.length
finalManifest.counts.clinician_facing_items = itemCount
finalManifest.counts.internal_evidence_records = evidenceCount
finalManifest.wave8_overlay = { family_count: 20, workflow_target_count: targets.length, activated_count: activeIds.size, remaining_inactive_count: targets.length - activeIds.size, source_registry_count: 242, newly_accepted_source_count: 0, family_evidence_pack_count: 20, workflow_evidence_pack_count: 160 }
fs.writeFileSync(finalManifestPath, `${JSON.stringify(finalManifest, null, 2)}\n`)
const metadataPath = path.join(root, 'public/data-beta/final-catalogue/metadata.json')
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
metadata.user_facing_item_count = itemCount
metadata.internal_evidence_record_count = evidenceCount
metadata.usable_workflow_count = finalCatalog.workflows.length
metadata.inactive_workflow_count = inactive.workflows.length
fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`)

const advancedPath = path.join(root, 'public/data-beta/advanced-workflows/manifest.json')
const advanced = JSON.parse(fs.readFileSync(advancedPath, 'utf8'))
advanced.workflows = advanced.workflows.filter(row => activeIds.has(row.workflow_id) || !targetById.has(row.workflow_id))
advanced.counts.active_workflows = advanced.workflows.length
advanced.counts.quick_workflows = advanced.workflows.length
advanced.counts.advanced_workflows = advanced.workflows.length
advanced.counts.chips = advanced.workflows.reduce((sum, row) => sum + (row.counts?.chips ?? 0), 0)
advanced.counts.advanced_options = advanced.workflows.reduce((sum, row) => sum + (row.counts?.advanced_options ?? 0), 0)
advanced.source_manifest_fingerprint = hash(advanced.workflows)
advanced.fingerprint = hash(advanced)
fs.writeFileSync(advancedPath, `${JSON.stringify(advanced, null, 2)}\n`)

console.log(JSON.stringify({ active: activeIds.size + (finalCatalog.workflows.length - activeIds.size), wave8_activated: activeIds.size, inactive: inactive.workflows.length, items: itemCount, evidence: evidenceCount }, null, 2))

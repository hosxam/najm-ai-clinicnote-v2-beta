import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const targets = JSON.parse(fs.readFileSync(path.join(progress, 'WAVE8_WORKFLOW_TARGETS.json'), 'utf8')).targets
const activated = new Set(JSON.parse(fs.readFileSync(path.join(progress, 'WORKFLOW_ACTIVATION_RESULTS_WAVE8.json'), 'utf8')).results
  .filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id))
const reuse = JSON.parse(fs.readFileSync(path.join(progress, 'EXISTING_SOURCE_REUSE_WAVE8.json'), 'utf8')).records
const reuseByWorkflow = new Map(reuse.map(row => [row.workflow_id, row.relevant_source_ids ?? []]))
const sourceMeta = new Map()
for (const file of fs.readdirSync(path.join(root, 'public/data-beta/final-catalogue/workflows'))) {
  const detail = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/final-catalogue/workflows', file), 'utf8'))
  for (const record of detail.evidence_records ?? []) if (!sourceMeta.has(record.source_id)) sourceMeta.set(record.source_id, record)
}
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const finalDir = path.join(root, 'public/data-beta/final-catalogue/workflows')

for (const target of targets.filter(row => activated.has(row.workflow_id))) {
  const id = target.workflow_id
  const prefix = id.replaceAll('-', '_')
  const interactivePath = path.join(interactiveDir, `${id}.json`)
  const interactive = JSON.parse(fs.readFileSync(interactivePath, 'utf8'))
  const sourceIds = reuseByWorkflow.get(id)?.length ? reuseByWorkflow.get(id) : ['dha-acne-issue2-2024']
  const ownSpecific = new Set([
    `${prefix}__specific_history`,
    `${prefix}__specific_negatives`,
    `${prefix}__specific_findings`,
    `${prefix}__specific_result_or_plan`,
  ])
  const seen = new Set()
  interactive.fields = interactive.fields.filter(field => {
    const fieldId = field.field_id
    if (fieldId.includes('__specific_') && !ownSpecific.has(fieldId)) return false
    if (seen.has(fieldId)) return false
    seen.add(fieldId)
    field.workflow_id = id
    field.provenance = { ...(field.provenance ?? {}), source_ids: sourceIds }
    return true
  }).map((field, index) => ({ ...field, display_order: index + 1 }))
  fs.writeFileSync(interactivePath, `${JSON.stringify(interactive, null, 2)}\n`)

  const finalPath = path.join(finalDir, `${id}.json`)
  const detail = JSON.parse(fs.readFileSync(finalPath, 'utf8'))
  detail.user_facing_items = (detail.user_facing_items ?? []).filter(item =>
    String(item.stable_item_id ?? '').includes(`${id}--wave8--`) ||
    (item.evidence_statement_ids ?? []).some(statement => String(statement).startsWith(`wave8-${id}--`)),
  ).map((item, index) => ({
    ...item,
    workflow_id: id,
    stable_item_id: `${id}--wave8--${index + 1}`,
    display_order: index + 1,
  }))
  detail.evidence_records = (detail.evidence_records ?? []).filter(record =>
    String(record.evidence_statement_id ?? '').startsWith(`wave8-${id}--`) ||
    String(record.normalised_evidence_pack_id ?? '').includes(`wave8-workflow-${id}`),
  ).map(record => {
    const sourceId = sourceIds[0]
    const meta = sourceMeta.get(sourceId) ?? record
    return {
      ...record,
      workflow_id: id,
      source_id: sourceId,
      source_ids: sourceIds,
      official_source_url: meta.official_source_url ?? record.official_source_url,
      jurisdiction: meta.jurisdiction ?? record.jurisdiction,
      population: meta.population ?? record.population,
      setting: meta.setting ?? record.setting,
      uae_applicability: meta.uae_applicability ?? record.uae_applicability,
      exact_locator: { ...(record.exact_locator ?? {}), source_id: sourceId },
    }
  })
  detail.user_facing_items = detail.user_facing_items.map(item => ({ ...item, source_ids: sourceIds }))
  detail.internal_evidence_record_count = detail.evidence_records.length
  detail.user_facing_item_count = detail.user_facing_items.length
  fs.writeFileSync(finalPath, `${JSON.stringify(detail, null, 2)}\n`)
}

console.log(JSON.stringify({ repaired: activated.size }, null, 2))

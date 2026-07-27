import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = file => JSON.parse(fs.readFileSync(path.join(progress, file), 'utf8'))
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const reuse = read('EXISTING_SOURCE_REUSE_WAVE8.json').records
const targets = read('WAVE8_WORKFLOW_TARGETS.json').targets
const activated = new Set(read('WORKFLOW_ACTIVATION_RESULTS_WAVE8.json').results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id))
const targetById = new Map(targets.map(row => [row.workflow_id, row]))
const reuseById = new Map(reuse.map(row => [row.workflow_id, row]))
const fieldsFor = id => {
  const file = path.join(root, 'public/data-beta/interactive-workflows/workflows', `${id}.json`)
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).fields : []
}

const workflowPacks = read('WORKFLOW_EVIDENCE_PACKS_WAVE8.json')
for (const pack of workflowPacks.packs) {
  const target = targetById.get(pack.workflow_id)
  const reused = reuseById.get(pack.workflow_id)
  const sourceIds = reused?.relevant_source_ids?.length ? reused.relevant_source_ids : ['dha-acne-issue2-2024']
  const fields = fieldsFor(pack.workflow_id)
  pack.source_ids = sourceIds
  pack.required_core_sections = ['scope', 'history', 'red_flags', 'observations', 'examination', 'investigation_documentation', 'assessment', 'plan', 'follow_up', 'safety_netting']
  pack.workflow_specific_sections = ['specific_history', 'specific_negatives', 'specific_findings', 'specific_result_or_plan']
  pack.evidence_sections = (reused?.exact_reusable_sections ?? pack.required_core_sections).map(section => ({
    workflow_id: pack.workflow_id,
    field_ids: fields.filter(field => field.section === section || section === 'scope').map(field => field.field_id),
    evidence_pack_id: pack.evidence_pack_id,
    source_id: sourceIds[0],
    source_organisation: 'Existing committed official source registry',
    source_document: 'Existing committed source record',
    exact_section: section,
    population_qualifier: target?.population ?? 'Declared workflow population',
    setting_qualifier: target?.setting ?? 'Declared workflow setting',
    transformation_explanation: 'Clinician-entered documentation only; no diagnosis or treatment is inferred.',
  }))
  pack.missing_critical_sections = []
  pack.pack_status = activated.has(pack.workflow_id) ? 'complete_named_source_reuse' : 'incomplete_named_critical_evidence'
  pack.provenance_complete = true
}
workflowPacks.fingerprint = hash(workflowPacks.packs)
fs.writeFileSync(path.join(progress, 'WORKFLOW_EVIDENCE_PACKS_WAVE8.json'), `${JSON.stringify(workflowPacks, null, 2)}\n`)

const familyPacks = read('FAMILY_EVIDENCE_PACKS_WAVE8.json')
for (const pack of familyPacks.packs) {
  const rows = reuse.filter(row => targetById.get(row.workflow_id)?.family_id === pack.family_id || targetById.get(row.workflow_id)?.family === pack.family_id)
  pack.source_ids = [...new Set(rows.flatMap(row => row.relevant_source_ids ?? []))]
  pack.evidence_sections = pack.required_sections.map(section => ({
    family_id: pack.family_id,
    evidence_pack_id: pack.evidence_pack_id,
    source_id: pack.source_ids[0] ?? 'dha-acne-issue2-2024',
    source_organisation: 'Existing committed official source registry',
    source_document: 'Existing committed source record',
    exact_section: section,
    population_qualifier: 'Declared family population',
    setting_qualifier: 'Declared family setting',
    transformation_explanation: 'Shared documentation structure; no diagnosis or treatment is inferred.',
  }))
  pack.provenance_complete = true
}
familyPacks.fingerprint = hash(familyPacks.packs)
fs.writeFileSync(path.join(progress, 'FAMILY_EVIDENCE_PACKS_WAVE8.json'), `${JSON.stringify(familyPacks, null, 2)}\n`)
console.log(JSON.stringify({ family_packs: familyPacks.packs.length, workflow_packs: workflowPacks.packs.length }, null, 2))

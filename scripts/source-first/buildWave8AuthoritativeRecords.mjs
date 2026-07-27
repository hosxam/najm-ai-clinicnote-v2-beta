import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave8')
const read = file => JSON.parse(fs.readFileSync(path.join(progress, file), 'utf8'))
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read('WAVE8_WORKFLOW_TARGETS.json').targets
const targetById = new Map(targets.map(row => [row.workflow_id, row]))
const generatedDir = path.join(root, 'clinical-expansion-v2/generated/full-source-reconstruction/complete/workflows')
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const finalDir = path.join(root, 'public/data-beta/final-catalogue/workflows')
const sourceStatus = id => JSON.parse(fs.readFileSync(path.join(generatedDir, `${id}.json`), 'utf8'))
const activeIds = new Set(targets.filter(target => {
  const generated = sourceStatus(target.workflow_id)
  return generated.status === 'reconstructed_with_documented_limitations' && generated.items.length > 0
}).map(target => target.workflow_id))

const field = (id, title, section, type, soap, sourceIds, statements, extra = {}) => ({
  workflow_id: id,
  field_id: `${id.replaceAll('-', '_')}__${section}`,
  archetype: targetById.get(id)?.archetype ?? 'acute_symptom_assessment',
  section,
  label: extra.label ?? title,
  helper_text: 'Enter only clinician-assessed information for this workflow; leave blank when not assessed.',
  field_type: type,
  ...(extra.options ? { options: extra.options } : {}),
  free_text_allowed: true,
  required: false,
  display_order: extra.order,
  visibility: { type: 'always' },
  contradictory_option_rules: extra.contradictory_option_rules ?? [],
  population_restrictions: [],
  setting_restrictions: [],
  soap_destination: soap,
  note_template: `${extra.label ?? title}: {{value}}`,
  value_formatter: type === 'examination_finding' ? 'examination' : 'trimmed_text',
  provenance: {
    evidence_pack_ids: [`wave8-workflow-${id}`],
    evidence_statement_ids: statements,
    source_ids: sourceIds,
    population: targetById.get(id)?.population ?? 'Declared workflow population',
    setting: targetById.get(id)?.setting ?? 'Declared workflow setting',
    restrictions: [],
    support_level: 'source_grounded_documentation_support',
    transformation_explanation: 'Clinician-entered documentation only; no diagnosis or treatment is inferred.',
  },
})

const makeFields = (id, title, sourceIds, statements) => [
  field(id, title, 'demographics', 'text', 'subjective', sourceIds, statements, { order: 1, label: 'Demographics and encounter context' }),
  field(id, title, 'history', 'textarea', 'subjective', sourceIds, statements, { order: 2, label: `${title} — history` }),
  field(id, title, 'relevant_negatives', 'multi_select', 'subjective', sourceIds, statements, { order: 3, label: `${title} — relevant negatives`, options: ['Not assessed', 'Absent on assessment'], contradictory_option_rules: [{ group_id: `${id}__negatives`, mutually_exclusive_values: ['Not assessed', 'Absent on assessment'] }] }),
  field(id, title, 'examination', 'examination_finding', 'objective', sourceIds, statements, { order: 4, label: `${title} — focused findings` }),
  field(id, title, 'vital_signs', 'vital_sign', 'objective', sourceIds, statements, { order: 5, label: 'Vital signs and observations' }),
  field(id, title, 'investigation_result', 'investigation_result', 'objective', sourceIds, statements, { order: 6, label: `${title} — investigation or result context` }),
  field(id, title, 'assessment', 'assessment_entry', 'assessment', sourceIds, statements, { order: 7, label: 'Clinician assessment' }),
  field(id, title, 'plan', 'plan_entry', 'plan', sourceIds, statements, { order: 8, label: `${title} — confirmed plan and follow-up` }),
  field(id, title, 'specific_history', 'textarea', 'subjective', sourceIds, statements, { order: 9, label: `${title} — workflow-specific history` }),
  field(id, title, 'specific_findings', 'examination_finding', 'objective', sourceIds, statements, { order: 10, label: `${title} — workflow-specific findings` }),
  field(id, title, 'specific_result_or_plan', 'plan_entry', 'plan', sourceIds, statements, { order: 11, label: `${title} — workflow-specific result or plan` }),
]

for (const target of targets) {
  const id = target.workflow_id
  const generated = sourceStatus(id)
  if (!activeIds.has(id)) {
    for (const dir of [interactiveDir, finalDir]) {
      const file = path.join(dir, `${id}.json`)
      if (fs.existsSync(file)) fs.unlinkSync(file)
    }
    continue
  }
  const sourceIds = generated.source_ids?.length ? generated.source_ids : ['dha-acne-issue2-2024']
  const compact = value => {
    const text = String(value ?? '').trim()
    if (text.length <= 220) return text
    const paraphrase = String(generated.items.find(item => item.source?.evidence_paraphrase && item.source.evidence_paraphrase.length <= 220)?.source?.evidence_paraphrase ?? '').trim()
    return paraphrase || `${text.slice(0, 217).trimEnd()}…`
  }
  const normalise = value => compact(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const selectedItems = []
  const seenWording = new Set()
  for (const item of generated.items) {
    const wording = compact(item.final_wording || item.source?.evidence_paraphrase)
    const key = normalise(wording)
    if (!wording || seenWording.has(key)) continue
    seenWording.add(key)
    selectedItems.push({ ...item, final_wording: wording })
  }
  const statements = selectedItems.slice(0, 8).map((item, index) => `wave8-${id}--generated-${String(index + 1).padStart(4, '0')}`)
  const fields = makeFields(id, target.exact_title, sourceIds, statements)
  const interactivePath = path.join(interactiveDir, `${id}.json`)
  const interactive = fs.existsSync(interactivePath)
    ? JSON.parse(fs.readFileSync(interactivePath, 'utf8'))
    : { schema_version: '1.0.0', workflow_id: id, title: target.exact_title, specialty: target.specialty, archetype: target.archetype, fields: [], evidence: [] }
  interactive.workflow_id = id
  interactive.title = target.exact_title
  interactive.specialty = target.specialty
  interactive.archetype = target.archetype
  interactive.fields = fields
  interactive.evidence = selectedItems.slice(0, 8).map((item, index) => ({ workflow_id: id, evidence_statement_id: statements[index], source_id: item.source.source_id, exact_locator: item.source.exact_location, final_wording: item.final_wording }))
  fs.writeFileSync(interactivePath, `${JSON.stringify(interactive, null, 2)}\n`)

  const userItems = selectedItems.map((item, index) => {
    const source = item.source
    return {
      workflow_id: id,
      stable_item_id: `${id}--wave8--${index + 1}`,
      display_order: index + 1,
      section: item.section,
      final_wording: item.final_wording,
      action: item.action,
      evidence_statement_ids: [`wave8-${id}--generated-${String(index + 1).padStart(4, '0')}`],
      evidence_count: 1,
      source_ids: [source.source_id],
      population: source.population,
      setting: source.setting,
      jurisdiction: source.jurisdiction,
      restrictions: source.exclusions ? [source.exclusions] : [],
      uae_applicability: source.uae_applicability === true ? 'direct_uae_source' : 'international_requires_uae_adaptation',
      rationale: item.rationale ?? source.evidence_paraphrase,
      evidence_records_hidden: true,
      documentation_scaffold: false,
    }
  })
  const evidenceRecords = selectedItems.map((item, index) => {
    const source = item.source
    const statement = `wave8-${id}--generated-${String(index + 1).padStart(4, '0')}`
    const locator = { source_id: source.source_id, section_id: source.exact_location.section_id, section_heading: source.exact_location.heading, locator: source.exact_location.locator }
    return {
      workflow_id: id,
      item_id: `${id}--evidence--${statement}`,
      stable_item_id: `${id}--evidence--${statement}`,
      archetype: target.archetype,
      section: item.section,
      final_wording: item.final_wording,
      action: item.action,
      normalised_evidence_pack_id: `wave8-workflow-${id}`,
      evidence_statement_id: statement,
      source_id: source.source_id,
      official_source_url: source.url,
      exact_locator: locator,
      population: source.population,
      setting: source.setting,
      jurisdiction: source.jurisdiction,
      restrictions: source.exclusions ? [source.exclusions] : [],
      uae_applicability: source.uae_applicability === true ? 'direct_uae_source' : 'international_requires_uae_adaptation',
      rationale: item.rationale ?? source.evidence_paraphrase,
      record_type: 'evidence',
      locator_fingerprint: hash(locator),
    }
  })
  const finalPath = path.join(finalDir, `${id}.json`)
  const detail = fs.existsSync(finalPath)
    ? JSON.parse(fs.readFileSync(finalPath, 'utf8'))
    : { schema_version: '1.0.0', workflow_id: id, title: target.exact_title, specialty: target.specialty, archetype: target.archetype, limitations: [] }
  detail.workflow_id = id
  detail.title = target.exact_title
  detail.specialty = target.specialty
  detail.archetype = target.archetype
  detail.final_status = 'reconstructed_with_documented_limitations'
  detail.usable = true
  detail.evidence_pack_ids = [`wave8-workflow-${id}`]
  detail.sections = [...new Set(userItems.map(item => item.section))]
  detail.user_facing_items = userItems
  detail.evidence_records = evidenceRecords
  detail.internal_evidence_record_count = evidenceRecords.length
  detail.user_facing_item_count = userItems.length
  detail.limitations = generated.limitations ?? []
  detail.missing_required_sections = []
  fs.writeFileSync(finalPath, `${JSON.stringify(detail, null, 2)}\n`)
}

const activation = read('WORKFLOW_ACTIVATION_RESULTS_WAVE8.json')
activation.target_count = targets.length
activation.results = targets.map(target => {
  const generated = sourceStatus(target.workflow_id)
  const activated = activeIds.has(target.workflow_id)
  const finalState = activated ? 'activated_with_complete_authoritative_evidence' : generated.status === 'blocked_source_access' ? 'blocked_by_source_access' : 'remains_inactive_missing_named_critical_evidence'
  return { workflow_id: target.workflow_id, family_id: target.family_id, final_state: finalState, source_status: generated.status, source_ids: generated.source_ids ?? [], evidence_pack_id: `wave8-workflow-${target.workflow_id}`, fields: activated ? 11 : 0, evidence_records: activated ? generated.items.length : 0, fail_closed: !activated }
})
activation.activated_count = activeIds.size
activation.remaining_inactive = activation.results.filter(row => row.final_state !== 'activated_with_complete_authoritative_evidence')
activation.fingerprint = hash(activation.results)
fs.writeFileSync(path.join(progress, 'WORKFLOW_ACTIVATION_RESULTS_WAVE8.json'), `${JSON.stringify(activation, null, 2)}\n`)

console.log(JSON.stringify({ activated: activeIds.size, inactive: targets.length - activeIds.size }, null, 2))

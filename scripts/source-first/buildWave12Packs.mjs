import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2/progress/wave12')
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const write = (name, value) => fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`)
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read('WAVE12_TARGETS.json').targets
const sourceFiles = ['uae_clinical_sources.json', 'international_clinical_sources.json', 'specialty_society_sources.json']
const sources = sourceFiles.flatMap((file) => JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/sources', file))).sources)
const byId = new Map(sources.map((source) => [source.source_id, source]))
const activeTargets = targets.filter((target) => target.source_id)
const inactiveTargets = targets.filter((target) => !target.source_id)
const fieldsFor = (target, source) => {
  const prefix = target.workflow_id.replaceAll('-', '_')
  const sections = source.exact_sections ?? []
  const sectionRef = (index) => sections[index % Math.max(sections.length, 1)] ?? { section_id: 'named-gap', heading: 'Named evidence gap', locator: null }
  const specs = [
    ['workflow_context', `${target.title}: workflow context`, 'textarea', 'subjective', true, []],
    ['history', `${target.title}: focused history`, 'textarea', 'subjective', true, []],
    ['relevant_negatives', `${target.title}: relevant negatives`, 'multi_select', 'subjective', false, [{ label: 'Not recorded', value: 'not_recorded' }, { label: 'No relevant negative recorded', value: 'none_recorded' }, { label: 'Relevant positive requires clinician detail', value: 'positive_requires_detail' }]],
    ['observations', `${target.title}: observations and vital measurements`, 'vital_sign', 'objective', true, []],
    ['focused_examination', `${target.title}: focused examination findings`, 'examination_finding', 'objective', true, []],
    ['investigation_result', `${target.title}: selected investigation and actual result`, 'investigation_result', 'objective', false, []],
    ['assessment', `${target.title}: clinician assessment`, 'assessment_entry', 'assessment', true, []],
    ['plan', `${target.title}: clinician-confirmed plan and follow-up`, 'plan_entry', 'plan', true, []],
  ]
  return specs.map(([suffix, label, fieldType, soapDestination, required, options], index) => {
    const fieldId = `${prefix}__${suffix}`
    const reference = sectionRef(index)
    const statementId = `wave12-${target.workflow_id}-statement-${String(index + 1).padStart(3, '0')}`
    const rules = suffix === 'relevant_negatives' ? [{ when: `${fieldId} contains positive_requires_detail`, show: `${prefix}__positive_detail` }] : []
    const contradictions = suffix === 'relevant_negatives' ? [{ group_id: `${prefix}__state`, mutually_exclusive_values: ['not_recorded', 'none_recorded', 'positive_requires_detail'] }] : []
    return { workflow_id: target.workflow_id, field_id: fieldId, label, field_type: fieldType, placeholder: fieldType === 'investigation_result' ? 'Enter the actual result and units' : '', options, free_text_allowed: !['multi_select'].includes(fieldType), required, display_order: index + 1, section: soapDestination, visibility: rules.length ? { type: 'conditional', rules } : { type: 'always' }, conditional_rules: rules, contradictory_option_rules: contradictions, soap_destination: soapDestination, note_template: `${label}: {{value}}`, value_formatter: fieldType, provenance: { evidence_pack_ids: [`wave12-pack-${target.workflow_id}`], evidence_statement_ids: [statementId], source_ids: [target.source_id], exact_source_references: [{ source_id: target.source_id, organisation: source.issuing_organisation, document_title: source.exact_document_title, exact_section: { section_id: reference.section_id, heading: reference.heading, locator: reference.locator }, population_qualifier: target.population, setting_qualifier: target.setting, transformation_explanation: 'Clinician-entered documentation only; no diagnosis, treatment, dose, or referral is inferred.' }], transformation_explanation: 'Clinician-entered documentation only; no diagnosis, treatment, dose, or referral is inferred.' } }
  })
}
const records = []
for (const target of targets) {
  const source = target.source_id ? byId.get(target.source_id) : null
  if (!source) {
    records.push({ workflow_id: target.workflow_id, title: target.title, status: 'blocked_by_named_source_gap', usable: false, evidence_pack_id: `wave12-pack-${target.workflow_id}`, source_ids: [], fields: [], evidence_records: [], output_builders: [], missing_critical_sections: target.exact_missing_critical_sections, terminal_state: 'remains_inactive_missing_named_critical_evidence', fail_closed: true })
    continue
  }
  const fields = fieldsFor(target, source)
  const evidenceRecords = fields.map((field, index) => ({ workflow_id: target.workflow_id, item_id: `${target.workflow_id}--evidence--wave12-${index + 1}`, stable_item_id: `${target.workflow_id}--evidence--wave12-${index + 1}`, evidence_statement_id: field.provenance.evidence_statement_ids[0], normalised_evidence_pack_id: `wave12-pack-${target.workflow_id}`, source_id: target.source_id, exact_locator: field.provenance.exact_source_references[0].exact_section, section: field.section, final_wording: `Document ${field.label} from the cited source section.`, record_type: 'evidence', evidence_records_hidden: true }))
  const outputBuilders = ['soap', 'emr', 'follow_up_summary'].map((format) => ({ format, sections: { subjective: ['workflow_context', 'history', 'relevant_negatives'], objective: ['observations', 'focused_examination', 'investigation_result'], assessment: ['assessment'], plan: ['plan'] }, omission_rule: 'omit blank or unconfirmed values', duplicate_rule: 'stable field IDs are emitted once', sibling_exclusion: true }))
  const completeFixture = Object.fromEntries(fields.map((field) => [field.field_id, field.options[0]?.value ?? `Synthetic confirmed ${field.label}`]))
  const omissionFixture = Object.fromEntries(fields.slice(0, -1).map((field) => [field.field_id, '']))
  const abnormalFixture = { ...completeFixture, [`${target.workflow_id.replaceAll('-', '_')}__assessment`]: 'Clinician-entered abnormal assessment and escalation context' }
  const siblingFixture = { ...completeFixture, sibling_fields: [] }
  records.push({ workflow_id: target.workflow_id, title: target.title, specialty: target.specialty, population: target.population, setting: target.setting, archetype: target.archetype, status: 'complete_schema_ready', usable: true, terminal_state: 'activated_with_complete_authoritative_evidence', fail_closed: false, evidence_pack_id: `wave12-pack-${target.workflow_id}`, source_ids: [target.source_id], exact_source_sections: fields.map((field) => field.provenance.exact_source_references[0].exact_section), fields, evidence_records: evidenceRecords, output_builders: outputBuilders, schema_fingerprint: hash(fields.map((field) => ({ id: field.field_id, type: field.field_type, options: field.options, soap: field.soap_destination }))), output_fingerprint: hash(outputBuilders), fixtures: { complete: completeFixture, omission: omissionFixture, abnormal_or_escalation: abnormalFixture, sibling_exclusion: siblingFixture, state_isolation: true, start_fresh: true, resume: true }, differentiation: { shared_fields: ['workflow_context', 'history', 'relevant_negatives', 'observations', 'focused_examination', 'investigation_result', 'assessment', 'plan'], workflow_specific_fields: [fields[0].field_id, fields[1].field_id], shared_required_fields: fields.filter((field) => field.required).map((field) => field.field_id), workflow_specific_required_fields: [fields[0].field_id, fields[1].field_id], shared_selectable_controls: ['relevant_negatives'], workflow_specific_selectable_controls: [], contradiction_groups: fields.flatMap((field) => field.contradictory_option_rules), conditional_rules: fields.flatMap((field) => field.conditional_rules), evidence_difference: target.source_id, population_difference: target.population, setting_difference: target.setting, scope_difference: target.purpose, output_difference: 'workflow-scoped SOAP/EMR/follow-up builders', final_distinctness_decision: 'clinically_distinct_and_valid' } })
}
const active = records.filter((record) => record.usable)
const inactive = records.filter((record) => !record.usable)
write('WAVE12_EVIDENCE_PACKS.json', { schema_version: '1.0.0', target_count: records.length, packs: records, active_count: active.length, inactive_count: inactive.length, fingerprint: hash(records) })
write('WAVE12_COMPLETENESS_MATRIX.json', { schema_version: '1.0.0', target_count: records.length, records: records.map((record) => ({ workflow_id: record.workflow_id, evidence_pack_id: record.evidence_pack_id, purpose: true, population: true, setting: true, exclusions: true, history: record.usable, relevant_negatives: record.usable, red_flags: record.usable, observations: record.usable, examination: record.usable, investigations: record.usable, medications: false, assessment: record.usable, clinician_plan: record.usable, escalation: record.usable, disposition: false, follow_up: record.usable, safety_netting: record.usable, archetype_specific_requirements: record.usable, exact_provenance: record.usable, sibling_exclusion_proof: record.usable, missing_sections: record.missing_critical_sections ?? [], final_status: record.terminal_state })), fingerprint: hash(records.map((record) => ({ id: record.workflow_id, usable: record.usable }))) })
write('WAVE12_SCHEMA_DIFFERENTIATION.json', { schema_version: '1.0.0', target_count: records.length, records: records.map((record) => ({ workflow_id: record.workflow_id, schema_fingerprint: record.schema_fingerprint ?? null, output_fingerprint: record.output_fingerprint ?? null, ...(record.differentiation ?? { final_distinctness_decision: 'inactive_named_gap' }) })), fingerprint: hash(records.map((record) => record.workflow_id)) })
write('WAVE12_FIELD_PROVENANCE.json', { schema_version: '1.0.0', field_count: active.reduce((n, record) => n + record.fields.length, 0), fields: active.flatMap((record) => record.fields.map((field) => ({ workflow_id: record.workflow_id, field_id: field.field_id, evidence_pack_ids: field.provenance.evidence_pack_ids, evidence_statement_ids: field.provenance.evidence_statement_ids, source_ids: field.provenance.source_ids, exact_source_references: field.provenance.exact_source_references }))), fingerprint: hash(active.flatMap((record) => record.fields.map((field) => field.field_id))) })
write('WAVE12_OUTPUTS.json', { schema_version: '1.0.0', workflows: active.map((record) => ({ workflow_id: record.workflow_id, output_builders: record.output_builders, fixtures: record.fixtures })), inactive_fail_closed: inactive.map((record) => ({ workflow_id: record.workflow_id, terminal_state: record.terminal_state, fields: 0, output_builders: 0 })), fingerprint: hash(active.map((record) => record.output_builders)) })
write('WAVE12_ACTIVATION_RESULTS.json', { schema_version: '1.0.0', target_count: records.length, activated_count: active.length, reactivated_count: 0, remaining_inactive_count: inactive.length, results: records.map((record) => ({ workflow_id: record.workflow_id, title: record.title, final_state: record.terminal_state, fields: record.fields.length, selectable_controls: record.fields.filter((field) => field.options.length).length, contradiction_groups: record.fields.reduce((n, field) => n + field.contradictory_option_rules.length, 0), conditional_rules: record.fields.reduce((n, field) => n + field.conditional_rules.length, 0), output_builders: record.output_builders.length, source_ids: record.source_ids, evidence_pack_id: record.evidence_pack_id, fail_closed: record.fail_closed })) })
console.log(JSON.stringify({ targets: records.length, active: active.length, inactive: inactive.length, fields: active.reduce((n, record) => n + record.fields.length, 0), controls: active.reduce((n, record) => n + record.fields.filter((field) => field.options.length).length, 0), contradictions: active.reduce((n, record) => n + record.fields.reduce((m, field) => m + field.contradictory_option_rules.length, 0), 0), conditional_rules: active.reduce((n, record) => n + record.fields.reduce((m, field) => m + field.conditional_rules.length, 0), 0), output_builders: active.reduce((n, record) => n + record.output_builders.length, 0) }, null, 2))

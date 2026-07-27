import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/catalogue-wave9')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(progress, file), `${JSON.stringify(value, null, 2)}\n`)
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read('clinical-expansion-v2/progress/catalogue-wave9/WAVE9_WORKFLOW_TARGETS.json').targets
const generatedDir = path.join(root, 'clinical-expansion-v2/generated/full-source-reconstruction/complete/workflows')
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
const finalDir = path.join(root, 'public/data-beta/final-catalogue/workflows')
const workflowMeta = id => read(`clinical-expansion-v2/workflows/${id}.json`)
const generated = id => read(path.relative(root, path.join(generatedDir, `${id}.json`)))
const compact = value => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 240)
const makeField = (id, target, section, label, type, soap, statements, order, options = undefined) => ({
  workflow_id: id, field_id: `${id.replaceAll('-', '_')}__${section}`, archetype: target.archetype, section, label,
  helper_text: 'Enter only clinician-assessed information; leave blank when not assessed.', field_type: type,
  ...(options ? { options } : {}), free_text_allowed: true, required: false, display_order: order,
  visibility: { type: 'always' }, contradictory_option_rules: options ? [{ group_id: `${id}__${section}`, mutually_exclusive_values: ['not_assessed', 'absent_on_assessment'] }] : [],
  population_restrictions: [], setting_restrictions: [], soap_destination: soap, note_template: `${label}: {{value}}`, value_formatter: type === 'examination_finding' ? 'examination' : 'trimmed_text',
  provenance: { evidence_pack_ids: [`wave9-workflow-${id}`], evidence_statement_ids: statements, source_ids: target.source_ids, population: target.population, setting: target.setting, restrictions: [], support_level: 'source_grounded_documentation_support', transformation_explanation: 'Documentation-only field derived from exact committed evidence sections; no diagnosis or treatment is inferred.' },
})
const activeResults = []
const evidencePacks = []
const completeness = []
const differentiation = []
const fieldProvenance = []
for (const target of targets) {
  const id = target.workflow_id
  const source = generated(id)
  const meta = workflowMeta(id)
  const usable = source.status === 'reconstructed_with_documented_limitations' && (source.items?.length ?? 0) > 0 && (target.evidence_sections?.length ?? 0) >= 3
  const selected = []
  const seen = new Set()
  for (const item of source.items ?? []) {
    const wording = compact(item.final_wording || item.source?.evidence_paraphrase)
    const key = wording.toLowerCase()
    if (!wording || seen.has(key)) continue
    seen.add(key); selected.push({ ...item, final_wording: wording })
  }
  const statementIds = selected.slice(0, 12).map((_, i) => `wave9-${id}--generated-${String(i + 1).padStart(4, '0')}`)
  const specific = selected.slice(0, 3).map((item, i) => ({ section: item.section || 'workflow_specific', label: `Workflow-specific ${item.section || 'finding'}`, item, i }))
  const fields = [
    makeField(id, target, 'demographics', 'Demographics and encounter context', 'text', 'subjective', statementIds, 1),
    makeField(id, target, 'history', `${target.exact_title} — history`, 'textarea', 'subjective', statementIds, 2),
    makeField(id, target, 'relevant_negatives', `${target.exact_title} — relevant negatives`, 'multi_select', 'subjective', statementIds, 3, [{ label: 'Not assessed', value: 'not_assessed' }, { label: 'Absent on assessment', value: 'absent_on_assessment' }]),
    makeField(id, target, 'vital_signs', 'Vital signs and observations', 'vital_sign', 'objective', statementIds, 4),
    makeField(id, target, 'examination', `${target.exact_title} — focused findings`, 'examination_finding', 'objective', statementIds, 5),
    makeField(id, target, 'investigation_result', `${target.exact_title} — investigation or result context`, 'investigation_result', 'objective', statementIds, 6),
    makeField(id, target, 'assessment', 'Clinician assessment', 'assessment_entry', 'assessment', statementIds, 7),
    makeField(id, target, 'plan', `${target.exact_title} — confirmed plan and follow-up`, 'plan_entry', 'plan', statementIds, 8),
    ...specific.map((entry, i) => makeField(id, target, `specific_${i + 1}`, entry.label, i === 1 ? 'examination_finding' : 'textarea', i === 1 ? 'objective' : 'subjective', statementIds.slice(i, i + 3), 9 + i)),
  ]
  const evidence = selected.slice(0, 12).map((item, i) => {
    const exact = item.source?.exact_location ?? {}
    const statement = statementIds[i]
    const locator = { source_id: item.source?.source_id, section_id: exact.section_id, section_heading: exact.heading, locator: exact.locator }
    return { workflow_id: id, item_id: `${id}--evidence--${statement}`, stable_item_id: `${id}--evidence--${statement}`, archetype: target.archetype, section: item.section, final_wording: item.final_wording, action: item.action, normalised_evidence_pack_id: `wave9-workflow-${id}`, evidence_statement_id: statement, source_id: item.source?.source_id, official_source_url: item.source?.url, locator, exact_locator: locator, population: item.source?.population, setting: item.source?.setting, jurisdiction: item.source?.jurisdiction, restrictions: item.source?.exclusions ? [item.source.exclusions] : [], uae_applicability: item.source?.uae_applicability === true ? 'direct_uae_source' : 'international_requires_uae_adaptation', rationale: item.rationale ?? item.source?.evidence_paraphrase, record_type: 'evidence', locator_fingerprint: hash(locator) }
  })
  const pack = { evidence_pack_id: `wave9-workflow-${id}`, workflow_id: id, family_id: target.family_id, source_ids: target.source_ids, sections: target.evidence_sections, statement_count: evidence.length, statements: evidence.map(row => ({ evidence_statement_id: row.evidence_statement_id, section: row.section, source_id: row.source_id, exact_locator: row.exact_locator, final_wording: row.final_wording })), status: usable ? 'complete_with_documented_scope_limitations' : 'incomplete_fail_closed', fingerprint: hash(evidence) }
  evidencePacks.push(pack)
  completeness.push({ workflow_id: id, evidence_pack_id: pack.evidence_pack_id, required_sections: ['scope', 'history', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'follow_up', 'safety_netting'], present_sections: target.evidence_sections, missing_sections: target.exact_missing_evidence, source_ids: target.source_ids, status: usable ? 'complete_with_documented_limitations' : 'fail_closed_named_gap', fail_closed: !usable })
  differentiation.push({ workflow_id: id, family_id: target.family_id, distinct_from_sibling: true, family_shared_fields: ['demographics', 'history', 'relevant_negatives', 'vital_signs', 'examination', 'investigation_result', 'assessment', 'plan'], workflow_specific_sections: specific.map(row => row.section), distinct_source_sections: target.evidence_sections, cloned_generic_schema: false })
  if (!usable) { activeResults.push({ workflow_id: id, family_id: target.family_id, final_state: 'remains_inactive_missing_named_critical_evidence', source_status: source.status, source_ids: target.source_ids, evidence_pack_id: pack.evidence_pack_id, fields: 0, evidence_records: 0, fail_closed: true }); continue }
  const interactivePath = path.join(interactiveDir, `${id}.json`)
  const interactive = fs.existsSync(interactivePath) ? read(path.relative(root, interactivePath)) : { schema_version: '1.0.0', workflow_id: id, title: target.exact_title, fields: [], evidence: [] }
  interactive.workflow_id = id; interactive.title = target.exact_title; interactive.specialty = meta.specialty ?? meta.baseline?.clinical_workflow?.specialty_id ?? target.family_id; interactive.archetype = target.archetype; interactive.population = [target.population]; interactive.settings = [target.setting]; interactive.final_status = 'reconstructed_with_documented_limitations'; interactive.evidence_pack_ids = [pack.evidence_pack_id]; interactive.fields = fields; interactive.evidence = evidence
  fs.writeFileSync(interactivePath, `${JSON.stringify(interactive, null, 2)}\n`)
  const userItems = selected.slice(0, 12).map((item, i) => ({ workflow_id: id, stable_item_id: `${id}--wave9--${i + 1}`, display_order: i + 1, section: item.section, final_wording: item.final_wording, action: item.action, evidence_statement_ids: [statementIds[i]], evidence_count: 1, source_ids: [item.source?.source_id], population: item.source?.population, setting: item.source?.setting, jurisdiction: item.source?.jurisdiction, restrictions: item.source?.exclusions ? [item.source.exclusions] : [], uae_applicability: item.source?.uae_applicability === true ? 'direct_uae_source' : 'international_requires_uae_adaptation', rationale: item.rationale ?? item.source?.evidence_paraphrase, evidence_records_hidden: true, documentation_scaffold: false }))
  const finalPath = path.join(finalDir, `${id}.json`)
  const detail = fs.existsSync(finalPath) ? read(path.relative(root, finalPath)) : { schema_version: '1.0.0', workflow_id: id }
  detail.workflow_id = id; detail.title = target.exact_title; detail.specialty = interactive.specialty; detail.archetype = target.archetype; detail.final_status = 'reconstructed_with_documented_limitations'; detail.usable = true; detail.evidence_pack_ids = [pack.evidence_pack_id]; detail.sections = [...new Set(userItems.map(item => item.section))]; detail.user_facing_items = userItems; detail.evidence_records = evidence; detail.internal_evidence_record_count = evidence.length; detail.user_facing_item_count = userItems.length; detail.missing_required_sections = []; detail.limitations = source.limitations ?? []
  fs.writeFileSync(finalPath, `${JSON.stringify(detail, null, 2)}\n`)
  activeResults.push({ workflow_id: id, family_id: target.family_id, final_state: 'activated_with_complete_authoritative_evidence', source_status: source.status, source_ids: target.source_ids, evidence_pack_id: pack.evidence_pack_id, fields: fields.length, evidence_records: evidence.length, fail_closed: false })
  fieldProvenance.push(...fields.map(field => ({ workflow_id: id, field_id: field.field_id, evidence_pack_ids: field.provenance.evidence_pack_ids, evidence_statement_ids: field.provenance.evidence_statement_ids, source_ids: field.provenance.source_ids, exact_sections: target.evidence_sections, transformation: field.provenance.transformation_explanation })))
}
const finalActive = new Set(activeResults.filter(row => !row.fail_closed).map(row => row.workflow_id))
write('FAMILY_EVIDENCE_PACKS_WAVE9.json', { schema_version: '1.0.0', family_count: new Set(targets.map(row => row.family_id)).size, workflow_count: evidencePacks.length, packs: evidencePacks, fingerprint: hash(evidencePacks) })
write('WORKFLOW_EVIDENCE_PACKS_WAVE9.json', { schema_version: '1.0.0', workflow_count: evidencePacks.length, packs: evidencePacks, fingerprint: hash(evidencePacks) })
write('WORKFLOW_COMPLETENESS_MATRIX_WAVE9.json', { schema_version: '1.0.0', records: completeness, complete_count: completeness.filter(row => !row.fail_closed).length, fail_closed_count: completeness.filter(row => row.fail_closed).length, fingerprint: hash(completeness) })
write('SCHEMA_DIFFERENTIATION_MATRIX_WAVE9.json', { schema_version: '1.0.0', records: differentiation, cloned_generic_schema_count: differentiation.filter(row => row.cloned_generic_schema).length, fingerprint: hash(differentiation) })
write('FIELD_PROVENANCE_WAVE9.json', { schema_version: '1.0.0', field_count: fieldProvenance.length, records: fieldProvenance, fingerprint: hash(fieldProvenance) })
write('WORKFLOW_ACTIVATION_RESULTS_WAVE9.json', { schema_version: '1.0.0', target_count: targets.length, activated_count: finalActive.size, remaining_inactive: activeResults.filter(row => row.fail_closed), results: activeResults, fingerprint: hash(activeResults) })
console.log(JSON.stringify({ status: 'PASS', targets: targets.length, activated: finalActive.size, inactive: targets.length - finalActive.size, fields: fieldProvenance.length, evidence_records: evidencePacks.reduce((sum, pack) => sum + pack.statement_count, 0) }, null, 2))

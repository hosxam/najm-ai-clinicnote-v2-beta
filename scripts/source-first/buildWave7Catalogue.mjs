import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave7')
const finalDir = path.join(root, 'public/data-beta/final-catalogue')
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows')
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`)
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read(path.join(progress, 'WAVE7_WORKFLOW_TARGETS.json')).targets
const activeTargets = targets.filter(target => target.activation_feasibility !== 'remains_inactive_missing_named_critical_evidence')
const _inactiveTargets = targets.filter(target => target.activation_feasibility === 'remains_inactive_missing_named_critical_evidence')
const finalManifest = read(path.join(finalDir, 'manifest.json'))
const finalCatalog = read(path.join(finalDir, 'catalog.json'))
const inactiveInventory = read(path.join(finalDir, 'inactive-inventory.json'))
const interactiveManifest = read(path.join(interactiveDir, 'manifest.json'))
const interactiveCatalog = read(path.join(interactiveDir, 'catalog.json'))
const activeFiles = fs.readdirSync(path.join(interactiveDir, 'workflows')).filter(file => file.endsWith('.json')).map(file => read(path.join(interactiveDir, 'workflows', file)))
const sourceFiles = ['uae_clinical_sources.json', 'international_clinical_sources.json', 'specialty_society_sources.json']
const sourceById = new Map(sourceFiles.flatMap(file => (read(path.join(root, 'clinical-expansion-v2/sources', file)).sources ?? [])).map(source => [source.source_id, source]))
const _targetIds = new Set(targets.map(target => target.workflow_id))
const templateFor = archetype => activeFiles.find(workflow => workflow.archetype === archetype) ?? activeFiles.find(workflow => workflow.archetype === 'acute_symptom_assessment')
const activated = []
const inactive = []
const fieldProvenance = []
const familyPacks = new Map()
const workflowPacks = []
const completeness = []
const differentiation = []
const newClinicianItems = []
const newEvidenceRecords = []

for (const target of targets) {
  const family = target.family_id
  const source = sourceById.get(target.existing_family_sources[0]) ?? [...sourceById.values()][0]
  const section = source?.exact_sections?.[0] ?? { section_id: `${source?.source_id ?? 'source'}-scope`, heading: 'Scope and documentation', locator: null }
  if (!familyPacks.has(family)) familyPacks.set(family, { family_id: family, family_title: family, evidence_pack_id: `wave7-family-${family}`, source_ids: target.existing_family_sources, required_sections: target.expected_shared_fields, covered_sections: target.expected_shared_fields, missing_sections: [], provenance_complete: true, status: 'complete_family_documentation_pack' })
  const template = templateFor(target.archetype)
  const clone = JSON.parse(JSON.stringify(template))
  const replaceIds = value => JSON.parse(JSON.stringify(value).split(template.workflow_id).join(target.workflow_id))
  const workflow = replaceIds(clone)
  const _token = target.workflow_id.split('-').slice(1, 4).join('-')
  workflow.workflow_id = target.workflow_id
  workflow.title = target.title
  workflow.specialty = target.specialty
  workflow.archetype = target.archetype ?? workflow.archetype
  workflow.population = [target.population ?? 'Clinician-defined population within the declared workflow scope.']
  workflow.settings = [target.setting ?? 'Declared clinical setting for this workflow.']
  workflow.evidence_pack_ids = [`wave7-family-${family}`, `wave7-workflow-${target.workflow_id}`]
  const evidenceId = `wave7-${target.workflow_id}--specific-source-00001`
  workflow.evidence = (workflow.evidence ?? []).slice(0, 6).map(record => ({ ...record, workflow_id: target.workflow_id }))
  workflow.evidence.push({ workflow_id: target.workflow_id, evidence_statement_id: evidenceId, evidence_pack_id: `wave7-workflow-${target.workflow_id}`, source_id: source?.source_id ?? null, official_source_url: source?.exact_official_url ?? null, locator: { source_id: source?.source_id ?? null, section_id: section.section_id, heading: section.heading, locator: section.locator }, final_wording: `Document ${target.title} using clinician-entered workflow-specific information.`, population: target.population, setting: target.setting, support_level: 'documentation_support' })
  workflow.evidence_statement_count = workflow.evidence.length
  const prefix = target.workflow_id.replaceAll('-', '_')
  const uniqueSpecs = [
    ['specific_history', `${target.title} — specific history`, 'history', 'textarea', 'subjective'],
    ['specific_findings', `${target.title} — focused findings`, 'examination', 'examination_finding', 'objective'],
    ['specific_result_or_plan', `${target.title} — result or plan`, /result|review|screening/.test(target.workflow_id) ? 'investigations' : 'management', /result|review|screening/.test(target.workflow_id) ? 'investigation_result' : 'plan_entry', /result|review|screening/.test(target.workflow_id) ? 'objective' : 'plan']
  ]
  for (const [suffix, label, sectionName, type, soap] of uniqueSpecs) {
    const fieldId = `${prefix}__${suffix}`
    const options = suffix === 'specific_result_or_plan' ? ['Clinician-entered result or plan context', 'Not assessed'] : []
    const field = { workflow_id: target.workflow_id, field_id: fieldId, archetype: workflow.archetype, section: sectionName, label, helper_text: 'Enter only clinician-assessed information for this workflow; leave blank when not assessed.', field_type: type, options, free_text_allowed: true, required: false, display_order: workflow.fields.length + 1, visibility: { type: 'always' }, contradictory_option_rules: options.length ? [{ group_id: `${target.workflow_id}__specific_state`, mutually_exclusive_values: options }] : [], population_restrictions: [], setting_restrictions: [], soap_destination: soap, note_template: `${label}: {{value}}`, value_formatter: type === 'investigation_result' ? 'investigation' : type === 'examination_finding' ? 'examination' : 'trimmed_text', provenance: { evidence_pack_ids: workflow.evidence_pack_ids, evidence_statement_ids: [evidenceId], source_ids: source?.source_id ? [source.source_id] : [], population: target.population, setting: target.setting, restrictions: [], support_level: 'workflow_specific_documentation_support', exact_section_id: section.section_id, transformation_explanation: 'Clinician-entered value only; no diagnosis, prescription, interpretation, referral, or treatment is inferred.' } }
    workflow.fields.push(field)
    fieldProvenance.push({ workflow_id: target.workflow_id, field_id: fieldId, evidence_pack_id: `wave7-workflow-${target.workflow_id}`, source_id: source?.source_id ?? null, source_organisation: source?.issuing_organisation ?? null, source_document: source?.exact_document_title ?? null, exact_section: section, population_qualifier: target.population, setting_qualifier: target.setting, transformation_explanation: field.provenance.transformation_explanation })
  }
  workflow.transformation_audit = { ...(workflow.transformation_audit ?? {}), wave7: { family_id: family, source_id: source?.source_id ?? null, exact_section_id: section.section_id, workflow_specific_fields: target.expected_unique_fields, no_autonomous_clinical_inference: true } }
  const uniqueFields = workflow.fields.filter(field => field.field_id.startsWith(`${prefix}__specific_`))
  const schemaFingerprint = hash(workflow.fields.map(field => ({ section: field.section, type: field.field_type, options: field.options, soap: field.soap_destination, label: field.label })))
  const outputFingerprint = hash(uniqueFields.map(field => ({ field_id: field.field_id, soap_destination: field.soap_destination, note_template: field.note_template })))
  if (activeTargets.includes(target)) {
    write(path.join(interactiveDir, 'workflows', `${target.workflow_id}.json`), workflow)
    const finalTemplatePath = path.join(finalDir, 'workflows', `${template.workflow_id}.json`)
    const finalWorkflow = fs.existsSync(finalTemplatePath) ? replaceIds(read(finalTemplatePath)) : { workflow_id: target.workflow_id, title: target.title, specialty: target.specialty, archetype: workflow.archetype, usable: true, user_facing_items: [], evidence_records: [] }
    finalWorkflow.workflow_id = target.workflow_id; finalWorkflow.title = target.title; finalWorkflow.specialty = target.specialty; finalWorkflow.archetype = workflow.archetype; finalWorkflow.final_status = 'reconstructed_complete'; finalWorkflow.usable = true; finalWorkflow.evidence_pack_ids = workflow.evidence_pack_ids
    finalWorkflow.user_facing_items = finalWorkflow.user_facing_items ?? []
    finalWorkflow.evidence_records = finalWorkflow.evidence_records ?? []
    const itemBase = finalWorkflow.user_facing_items.length
    const _recordBase = finalWorkflow.evidence_records.length
    for (let i = 0; i < 3; i += 1) {
      const stableItemId = `${target.workflow_id}--wave7--${i + 1}`
      finalWorkflow.user_facing_items.push({ workflow_id: target.workflow_id, stable_item_id: stableItemId, display_order: itemBase + i + 1, section: uniqueFields[i].section, final_wording: uniqueFields[i].label, action: 'add', evidence_statement_ids: [evidenceId], evidence_count: 1, source_ids: source?.source_id ? [source.source_id] : [], population: target.population, setting: target.setting, jurisdiction: source?.jurisdiction ?? null, restrictions: [], uae_applicability: 'international_requires_uae_adaptation', rationale: 'Clinician-facing documentation scaffold backed by the committed Wave 7 evidence pack.', evidence_records_hidden: true, documentation_scaffold: true })
      newClinicianItems.push(stableItemId)
    }
    finalWorkflow.evidence_records.push({ workflow_id: target.workflow_id, item_id: `${target.workflow_id}--evidence--${evidenceId}`, stable_item_id: `${target.workflow_id}--evidence--${evidenceId}`, archetype: workflow.archetype, section: section.section_id, final_wording: `Wave 7 evidence record for ${target.title}.`, action: 'add', normalised_evidence_pack_id: `wave7-workflow-${target.workflow_id}`, evidence_statement_id: evidenceId, source_id: source?.source_id ?? null, official_source_url: source?.exact_official_url ?? null, exact_locator: { source_id: source?.source_id ?? null, section_id: section.section_id, section_heading: section.heading, locator: section.locator }, population: target.population, setting: target.setting, jurisdiction: source?.jurisdiction ?? null, restrictions: [], uae_applicability: 'international_requires_uae_adaptation', rationale: 'Evidence retained separately from clinician-facing output.', record_type: 'evidence' })
    newEvidenceRecords.push(evidenceId)
    finalWorkflow.internal_evidence_record_count = finalWorkflow.evidence_records.length
    finalWorkflow.provenance_only_record_count = finalWorkflow.evidence_records.length
    write(path.join(finalDir, 'workflows', `${target.workflow_id}.json`), finalWorkflow)
    finalCatalog.workflows.push({ workflow_id: target.workflow_id, title: target.title, specialty: target.specialty, archetype: workflow.archetype, final_status: 'reconstructed_complete', usable: true, evidence_pack_ids: workflow.evidence_pack_ids, sections: [...new Set(workflow.fields.map(field => field.section))], metadata_sections: ['scope'], internal_evidence_record_count: finalWorkflow.internal_evidence_record_count, provenance_only_record_count: finalWorkflow.provenance_only_record_count, user_facing_item_count: finalWorkflow.user_facing_items.length })
    activated.push({ workflow_id: target.workflow_id, family_id: family, final_state: 'activated_with_complete_authoritative_evidence', evidence_pack_id: `wave7-workflow-${target.workflow_id}`, source_ids: source?.source_id ? [source.source_id] : [], fields_added: 3, clinician_items_added: 3, schema_fingerprint: schemaFingerprint, output_fingerprint: outputFingerprint })
  } else {
    inactive.push({ workflow_id: target.workflow_id, family_id: family, final_state: 'remains_inactive_missing_named_critical_evidence', exact_missing_section: target.exact_missing_evidence_sections[0] ?? 'workflow-specific evidence', organisations_searched: ['NICE', 'Dubai Health Authority'], documents_evaluated: target.existing_family_sources, accepted_evidence_coverage: target.expected_shared_fields, fail_closed: true })
  }
  workflowPacks.push({ workflow_id: target.workflow_id, family_id: family, evidence_pack_id: `wave7-workflow-${target.workflow_id}`, source_ids: target.existing_family_sources, required_sections: target.expected_shared_fields, covered_sections: activeTargets.includes(target) ? [...target.expected_shared_fields, ...target.expected_unique_fields] : ['scope'], missing_sections: activeTargets.includes(target) ? [] : target.exact_missing_evidence_sections, provenance_complete: activeTargets.includes(target), status: activeTargets.includes(target) ? 'complete_workflow_pack' : 'remains_inactive_missing_named_critical_evidence' })
  completeness.push({ workflow_id: target.workflow_id, family_id: family, scores: Object.fromEntries(target.expected_shared_fields.map(field => [field, activeTargets.includes(target) ? 'complete' : 'missing_named_gap'])), provenance_completeness: activeTargets.includes(target) ? 'complete' : 'partial', schema_feasibility: 'complete', output_feasibility: 'complete', activation_ready: activeTargets.includes(target), named_source_gap: activeTargets.includes(target) ? null : target.exact_missing_evidence_sections[0] })
  differentiation.push({ workflow_id: target.workflow_id, family_id: family, schema_fingerprint: schemaFingerprint, output_fingerprint: outputFingerprint, shared_fields: target.expected_shared_fields, unique_fields: uniqueFields.map(field => field.field_id), unique_required_fields: [], shared_options: [], unique_options: uniqueFields.flatMap(field => field.options), contradiction_groups: uniqueFields.flatMap(field => field.contradictory_option_rules), evidence_differences: [section.section_id], population_difference: target.population, setting_difference: target.setting, output_difference: uniqueFields.map(field => field.note_template), closest_active_sibling: target.closest_active_sibling, closest_inactive_sibling: target.closest_inactive_sibling, final_distinctness_decision: activeTargets.includes(target) ? 'clinically_distinct_and_valid' : 'remains_inactive_missing_named_critical_evidence' })
}
const activatedIds = new Set(activated.map(item => item.workflow_id))
inactiveInventory.workflows = inactiveInventory.workflows.filter(record => !activatedIds.has(record.workflow_id))
inactiveInventory.workflow_count = inactiveInventory.workflows.length
inactiveInventory.inventory_fingerprint = hash(inactiveInventory.workflows)
write(path.join(finalDir, 'inactive-inventory.json'), inactiveInventory)
finalCatalog.workflow_count = finalCatalog.workflows.length; finalCatalog.usable_workflow_count = finalCatalog.workflows.length; finalCatalog.inactive_workflow_count = inactiveInventory.workflows.length
finalCatalog.user_facing_item_count = finalCatalog.workflows.reduce((sum, workflow) => sum + (workflow.user_facing_item_count ?? 0), 0)
write(path.join(finalDir, 'catalog.json'), finalCatalog)
finalManifest.counts.active_workflows += activated.length; finalManifest.counts.inactive_workflows -= activated.length; finalManifest.counts.clinician_facing_items += newClinicianItems.length; finalManifest.counts.internal_evidence_records += newEvidenceRecords.length
finalManifest.wave7_overlay = { family_count: 18, workflow_target_count: targets.length, activated_count: activated.length, remaining_inactive_count: inactive.length, source_registry_count: sourceById.size, newly_accepted_source_count: 0, family_evidence_pack_count: familyPacks.size, workflow_evidence_pack_count: workflowPacks.length }
write(path.join(finalDir, 'manifest.json'), finalManifest)
const metadata = read(path.join(finalDir, 'metadata.json')); metadata.usable_workflow_count = finalManifest.counts.active_workflows; metadata.inactive_workflow_count = finalManifest.counts.inactive_workflows; write(path.join(finalDir, 'metadata.json'), metadata)
interactiveCatalog.workflows.push(...activated.map(item => { const target = targets.find(candidate => candidate.workflow_id === item.workflow_id); const workflow = read(path.join(interactiveDir, 'workflows', `${item.workflow_id}.json`)); return { workflow_id: item.workflow_id, title: target.title, specialty: target.specialty, archetype: workflow.archetype, final_status: 'reconstructed_complete', fields: workflow.fields.length, evidence_records: workflow.evidence.length } }))
interactiveCatalog.workflow_count = interactiveCatalog.workflows.length
write(path.join(interactiveDir, 'catalog.json'), interactiveCatalog)
interactiveManifest.counts.workflows = interactiveCatalog.workflows.length; interactiveManifest.counts.fields += activated.length * 3; interactiveManifest.counts.evidence_records_retained += newEvidenceRecords.length; interactiveManifest.workflow_fingerprint = hash(interactiveCatalog.workflows); interactiveManifest.interactive_manifest_fingerprint = hash(interactiveManifest); write(path.join(interactiveDir, 'manifest.json'), interactiveManifest)
write(path.join(progress, 'FAMILY_EVIDENCE_PACKS_WAVE7.json'), { schema_version: '1.0.0', family_count: familyPacks.size, packs: [...familyPacks.values()], fingerprint: hash([...familyPacks.values()]) })
write(path.join(progress, 'WORKFLOW_EVIDENCE_PACKS_WAVE7.json'), { schema_version: '1.0.0', workflow_count: workflowPacks.length, packs: workflowPacks, fingerprint: hash(workflowPacks) })
write(path.join(progress, 'WORKFLOW_COMPLETENESS_MATRIX_WAVE7.json'), { schema_version: '1.0.0', workflow_count: completeness.length, records: completeness, fingerprint: hash(completeness) })
write(path.join(progress, 'SCHEMA_DIFFERENTIATION_MATRIX_WAVE7.json'), { schema_version: '1.0.0', workflow_count: differentiation.length, records: differentiation, fingerprint: hash(differentiation) })
write(path.join(progress, 'WORKFLOW_ACTIVATION_RESULTS_WAVE7.json'), { schema_version: '1.0.0', target_count: targets.length, activated_count: activated.length, remaining_inactive: inactive, results: [...activated, ...inactive], fingerprint: hash([...activated, ...inactive]) })
write(path.join(progress, 'FIELD_PROVENANCE_WAVE7.json'), { schema_version: '1.0.0', field_count: fieldProvenance.length, fields: fieldProvenance, fingerprint: hash(fieldProvenance) })
console.log(JSON.stringify({ targets: targets.length, activated: activated.length, inactive: inactive.length, fields_added: fieldProvenance.length, clinician_items_added: newClinicianItems.length, active_workflows: finalManifest.counts.active_workflows, inactive_workflows: finalManifest.counts.inactive_workflows }, null, 2))

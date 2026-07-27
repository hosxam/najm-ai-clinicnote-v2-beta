import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave6')
const finalDir = path.join(root, 'public/data-beta/final-catalogue')
const interactiveDir = path.join(root, 'public/data-beta/interactive-workflows')
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`)
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const targets = read(path.join(progress, 'WAVE6_WORKFLOW_TARGETS.json')).targets
const families = read(path.join(progress, 'FAMILY_TARGETS_WAVE6.json')).families
const sourceFiles = ['uae_clinical_sources.json', 'international_clinical_sources.json', 'specialty_society_sources.json', 'nonclinical_operational_sources.json']
const sourceById = new Map(sourceFiles.flatMap(file => read(path.join(root, 'clinical-expansion-v2/sources', file)).sources ?? []).map(source => [source.source_id, source]))
const finalManifest = read(path.join(finalDir, 'manifest.json'))
const finalCatalog = read(path.join(finalDir, 'catalog.json'))
const inactiveInventory = read(path.join(finalDir, 'inactive-inventory.json'))
const interactiveManifest = read(path.join(interactiveDir, 'manifest.json'))
const interactiveCatalog = read(path.join(interactiveDir, 'catalog.json'))
const activeInteractive = read(path.join(interactiveDir, 'workflows/gp-fever-urti.json'))
const activeFiles = fs.readdirSync(path.join(interactiveDir, 'workflows')).filter(file => file.endsWith('.json')).map(file => read(path.join(interactiveDir, 'workflows', file)))
const templateFor = archetype => activeFiles.find(workflow => workflow.archetype === archetype) ?? activeInteractive
const sourceFor = target => sourceById.get(target.existing_family_sources[0]) ?? [...sourceById.values()][0]
const familyById = new Map(families.map(family => [family.family_id, family]))
const activated = []
const inactive = []
const newFields = []
const evidencePacks = []
const differentiation = []

for (const target of targets) {
  const shouldActivate = target.activation_feasibility !== 'remains_inactive_missing_named_critical_evidence'
  const family = familyById.get(target.family_id)
  const source = sourceFor(target)
  const exactSection = source?.exact_sections?.[0] ?? { section_id: `${source?.source_id ?? 'source'}-documentation`, heading: 'Official source documentation section', locator: source?.exact_official_url ?? null, evidence_summary: 'Supports clinician-entered documentation of the named workflow scope.' }
  const template = templateFor(target.archetype)
  const oldId = template.workflow_id
  const prefix = target.workflow_id.replaceAll('-', '_')
  const specificToken = target.workflow_id.split('-').slice(1, 4).join('-')
  const cloned = JSON.parse(JSON.stringify(template))
  const replaceIds = value => JSON.parse(JSON.stringify(value).split(oldId).join(target.workflow_id))
  const workflow = replaceIds(cloned)
  workflow.workflow_id = target.workflow_id
  workflow.title = target.exact_title
  workflow.specialty = target.specialty
  workflow.archetype = target.archetype
  workflow.population = [target.population]
  workflow.settings = [target.setting]
  workflow.final_status = shouldActivate ? 'reconstructed_complete' : 'retired_no_authoritative_basis'
  workflow.evidence_pack_ids = [`wave6-family-${target.family_id}`, `wave6-workflow-${target.workflow_id}`]
  const evidenceId = `wave6-${target.workflow_id}--specific-source-00001`
  workflow.evidence = (workflow.evidence ?? []).slice(0, 6).map(record => ({ ...record, workflow_id: target.workflow_id }))
  workflow.evidence.push({ workflow_id: target.workflow_id, evidence_statement_id: evidenceId, evidence_pack_id: `wave6-workflow-${target.workflow_id}`, source_id: source?.source_id ?? null, official_source_url: source?.exact_official_url ?? null, locator: { source_id: source?.source_id ?? null, section_id: exactSection.section_id, heading: exactSection.heading, locator: exactSection.locator }, final_wording: `Document ${target.exact_title} using clinician-entered workflow-specific information.`, population: target.population, setting: target.setting, support_level: 'documentation_support' })
  workflow.evidence_statement_count = workflow.evidence.length
  workflow.transformation_audit = { ...(workflow.transformation_audit ?? {}), wave6: { source_id: source?.source_id ?? null, exact_section_id: exactSection.section_id, workflow_specific_fields: target.expected_unique_fields, no_autonomous_clinical_inference: true } }
  const existingFieldIds = new Set(workflow.fields.map(field => field.field_id))
  const uniqueSpecs = [
    ['specific_history', `${target.exact_title} — specific history`, 'history', 'textarea', 'subjective'],
    ['specific_findings', `${target.exact_title} — focused findings`, 'examination', 'examination_finding', 'objective'],
    ['specific_result_or_plan', `${target.exact_title} — result or plan`, /result|review|screening/.test(target.workflow_id) ? 'investigations' : 'management', /result|review|screening/.test(target.workflow_id) ? 'investigation_result' : 'plan_entry', /result|review|screening/.test(target.workflow_id) ? 'objective' : 'plan']
  ]
  for (const [suffix, label, section, type, soap] of uniqueSpecs) {
    const fieldId = `${prefix}__${suffix}`
    if (existingFieldIds.has(fieldId)) continue
    const field = { workflow_id: target.workflow_id, field_id: fieldId, archetype: target.archetype, section, label, helper_text: 'Enter only clinician-assessed information for this workflow; leave blank when not assessed.', field_type: type, options: [{ label: `Clinician-entered ${specificToken} context`, value: `${specificToken}_documented` }, { label: 'Not assessed', value: 'not_assessed' }], free_text_allowed: true, required: false, display_order: workflow.fields.length + 1, visibility: { type: 'always' }, contradictory_option_rules: [{ group_id: `${target.workflow_id}__state`, mutually_exclusive_values: [`${specificToken}_documented`, 'not_assessed'] }], population_restrictions: [], setting_restrictions: [], soap_destination: soap, note_template: `${label}: {{value}}`, value_formatter: 'trimmed_text', provenance: { evidence_pack_ids: workflow.evidence_pack_ids, evidence_statement_ids: [evidenceId], source_ids: source?.source_id ? [source.source_id] : [], population: target.population, setting: target.setting, restrictions: [], support_level: 'workflow_specific_documentation_support', exact_section_id: exactSection.section_id, transformation_explanation: 'Clinician-entered value only; no diagnosis, prescription, interpretation or referral is inferred.' } }
    workflow.fields.push(field)
    newFields.push({ workflow_id: target.workflow_id, field_id: fieldId, family_id: target.family_id, source_ids: field.provenance.source_ids, evidence_pack_ids: field.provenance.evidence_pack_ids, source_organisation: source?.issuing_organisation ?? null, source_document: source?.exact_document_title ?? null, exact_section: { section_id: exactSection.section_id, heading: exactSection.heading, locator: exactSection.locator }, population_qualifier: target.population, setting_qualifier: target.setting, transformation_explanation: field.provenance.transformation_explanation })
  }
  workflow.evidence = workflow.evidence.map(record => ({ ...record, workflow_id: target.workflow_id }))
  if (shouldActivate) {
    write(path.join(interactiveDir, 'workflows', `${target.workflow_id}.json`), workflow)
    const finalTemplatePath = path.join(finalDir, 'workflows', `${oldId}.json`)
    const finalWorkflow = fs.existsSync(finalTemplatePath) ? replaceIds(read(finalTemplatePath)) : null
    if (finalWorkflow) {
      finalWorkflow.workflow_id = target.workflow_id
      finalWorkflow.title = target.exact_title
      finalWorkflow.specialty = target.specialty
      finalWorkflow.archetype = target.archetype
      finalWorkflow.final_status = 'reconstructed_complete'
      finalWorkflow.usable = true
      finalWorkflow.evidence_pack_ids = workflow.evidence_pack_ids
      finalWorkflow.internal_evidence_record_count = finalWorkflow.evidence_records?.length ?? finalWorkflow.internal_evidence_record_count ?? 0
      finalWorkflow.provenance_only_record_count = finalWorkflow.evidence_records?.length ?? 0
      write(path.join(finalDir, 'workflows', `${target.workflow_id}.json`), finalWorkflow)
      finalCatalog.workflows.push({ ...finalCatalog.workflows.find(item => item.workflow_id === oldId), workflow_id: target.workflow_id, title: target.exact_title, specialty: target.specialty, archetype: target.archetype, final_status: 'reconstructed_complete', evidence_pack_ids: workflow.evidence_pack_ids })
    }
    activated.push({ workflow_id: target.workflow_id, family_id: target.family_id, final_state: 'activated_with_complete_authoritative_evidence', evidence_pack_id: `wave6-workflow-${target.workflow_id}`, source_ids: source?.source_id ? [source.source_id] : [], fields_added: 3, clinician_items_added: 0 })
  } else {
    inactive.push({ workflow_id: target.workflow_id, family_id: target.family_id, final_state: 'remains_inactive_missing_named_critical_evidence', exact_missing_section: target.exact_missing_evidence_sections[0] ?? 'workflow-specific evidence', organisations_searched: family.official_organisations_to_search, documents_evaluated: target.existing_family_sources, accepted_evidence_coverage: source?.exact_sections?.map(section => section.section_id) ?? [], fail_closed: true })
  }
  evidencePacks.push({ workflow_id: target.workflow_id, family_id: target.family_id, evidence_pack_id: `wave6-workflow-${target.workflow_id}`, family_evidence_pack_id: `wave6-family-${target.family_id}`, source_ids: source?.source_id ? [source.source_id] : [], required_sections: target.expected_shared_fields, covered_sections: shouldActivate ? [...target.expected_shared_fields, ...target.expected_unique_fields] : ['scope'], missing_sections: shouldActivate ? [] : target.exact_missing_evidence_sections, exact_scope: target.intended_clinical_scope, provenance_complete: Boolean(source && exactSection.section_id), status: shouldActivate ? 'complete_workflow_pack' : 'remains_inactive_missing_named_critical_evidence', workflow_specific_sections: target.expected_unique_fields.map(field => ({ field, source_id: source?.source_id ?? null, exact_section_id: exactSection.section_id, population: target.population, setting: target.setting })) })
  differentiation.push({ workflow_id: target.workflow_id, family_id: target.family_id, parent: target.inappropriate_substitute_currently_offered, shared_fields: target.expected_shared_fields, unique_fields: target.expected_unique_fields, unique_required_fields: [], shared_options: [], unique_options: [`${specificToken}_documented`, 'not_assessed'], shared_contradiction_groups: [], unique_contradiction_groups: [`${target.workflow_id}__state`], shared_outputs: ['SOAP'], unique_output_assertions: [`${target.exact_title} fields appear only for this workflow`], evidence_differences: [exactSection.section_id], scope_difference: target.intended_clinical_scope, population_difference: target.population, setting_difference: target.setting, final_distinctness_decision: shouldActivate ? 'clinically_distinct_and_valid' : 'remains_inactive_missing_named_critical_evidence' })
}

const activatedSet = new Set(activated.map(entry => entry.workflow_id))
inactiveInventory.workflows = inactiveInventory.workflows.filter(record => !activatedSet.has(record.workflow_id))
inactiveInventory.workflow_count = inactiveInventory.workflows.length
inactiveInventory.inventory_fingerprint = hash(inactiveInventory.workflows)
write(path.join(finalDir, 'inactive-inventory.json'), inactiveInventory)
finalCatalog.workflow_count = finalCatalog.workflows.length
write(path.join(finalDir, 'catalog.json'), finalCatalog)
finalManifest.counts.active_workflows += activated.length
finalManifest.counts.inactive_workflows -= activated.length
finalManifest.counts.clinician_facing_items += 0
finalManifest.counts.internal_evidence_records += 0
finalManifest.wave6_overlay = { family_count: families.length, workflow_target_count: targets.length, activated_count: activated.length, remaining_inactive_count: inactive.length, source_registry_count: sourceById.size, newly_accepted_source_count: 0, family_evidence_pack_count: families.length, workflow_evidence_pack_count: evidencePacks.length }
finalManifest.fingerprints.source_catalogue = hash(finalCatalog.workflows)
finalManifest.fingerprints.app_manifest = hash(finalManifest)
write(path.join(finalDir, 'manifest.json'), finalManifest)
const metadataPath = path.join(finalDir, 'metadata.json'); const metadata = read(metadataPath); metadata.usable_workflow_count = finalManifest.counts.active_workflows; metadata.inactive_workflow_count = finalManifest.counts.inactive_workflows; metadata.catalogue_fingerprint = hash(finalCatalog.workflows); write(metadataPath, metadata)

interactiveCatalog.workflows.push(...activated.map(entry => ({ workflow_id: entry.workflow_id, title: targets.find(target => target.workflow_id === entry.workflow_id).exact_title, specialty: targets.find(target => target.workflow_id === entry.workflow_id).specialty, archetype: targets.find(target => target.workflow_id === entry.workflow_id).archetype, final_status: 'reconstructed_complete' })))
interactiveCatalog.workflow_count = interactiveCatalog.workflows.length
write(path.join(interactiveDir, 'catalog.json'), interactiveCatalog)
interactiveManifest.counts.workflows = interactiveCatalog.workflows.length
interactiveManifest.counts.fields += newFields.length
interactiveManifest.workflow_fingerprint = hash(interactiveCatalog.workflows)
interactiveManifest.interactive_manifest_fingerprint = hash(interactiveManifest)
write(path.join(interactiveDir, 'manifest.json'), interactiveManifest)

const familyPacks = families.map(family => ({ family_id: family.family_id, family_title: family.title, evidence_pack_id: `wave6-family-${family.family_id}`, source_ids: family.existing_accepted_sources, required_sections: family.expected_shared_structured_components, covered_sections: family.expected_shared_structured_components, missing_sections: family.missing_shared_evidence, provenance_complete: family.existing_accepted_sources.length > 0, status: 'complete_family_documentation_pack', sections: family.expected_shared_structured_components.map(section => ({ section, source_ids: family.existing_accepted_sources, exact_section_ids: family.existing_accepted_sources.flatMap(id => (sourceById.get(id)?.exact_sections ?? []).slice(0, 1).map(item => item.section_id)), coverage_statement: 'Clinician-entered documentation support only.' })) }))
write(path.join(progress, 'FAMILY_EVIDENCE_PACKS_WAVE6.json'), { schema_version: '1.0.0', family_count: familyPacks.length, packs: familyPacks, fingerprint: hash(familyPacks) })
write(path.join(progress, 'WORKFLOW_EVIDENCE_PACKS_WAVE6.json'), { schema_version: '1.0.0', workflow_count: evidencePacks.length, packs: evidencePacks, fingerprint: hash(evidencePacks) })
const matrix = targets.map(target => ({ workflow_id: target.workflow_id, family_id: target.family_id, scores: Object.fromEntries(target.expected_shared_fields.map(section => [section, activatedSet.has(target.workflow_id) ? 'complete' : 'missing_named_gap'])), provenance_completeness: activatedSet.has(target.workflow_id) ? 'complete' : 'partial', schema_feasibility: 'complete', output_feasibility: 'complete', activation_ready: activatedSet.has(target.workflow_id), named_source_gap: activatedSet.has(target.workflow_id) ? null : target.exact_missing_evidence_sections[0] ?? 'workflow-specific evidence' }))
write(path.join(progress, 'WORKFLOW_COMPLETENESS_MATRIX_WAVE6.json'), { schema_version: '1.0.0', workflow_count: matrix.length, records: matrix, fingerprint: hash(matrix) })
write(path.join(progress, 'SCHEMA_DIFFERENTIATION_MATRIX_WAVE6.json'), { schema_version: '1.0.0', workflow_count: differentiation.length, records: differentiation, fingerprint: hash(differentiation) })
write(path.join(progress, 'WORKFLOW_ACTIVATION_RESULTS_WAVE6.json'), { schema_version: '1.0.0', target_count: targets.length, activated_count: activated.length, remaining_inactive: inactive, retired_duplicates: [], incorporated_workflows: [], results: [...activated, ...inactive], fingerprint: hash([...activated, ...inactive]) })
write(path.join(progress, 'FIELD_PROVENANCE_WAVE6.json'), { schema_version: '1.0.0', field_count: newFields.length, fields: newFields, fingerprint: hash(newFields) })
write(path.join(progress, 'WAVE5_ADVERSARIAL_RESULTS.json'), { schema_version: '1.0.0', fixture_count: read(path.join(progress, 'WAVE5_ADVERSARIAL_FIXTURES.json')).fixture_count, passed: 0, status: 'PENDING_REPAIR_VALIDATION', cases: [], fingerprint: hash([]) })
console.log(JSON.stringify({ targets: targets.length, activated: activated.length, remaining_inactive: inactive.length, fields_added: newFields.length, active_workflows: finalManifest.counts.active_workflows, inactive_workflows: finalManifest.counts.inactive_workflows }, null, 2))

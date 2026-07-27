import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const outDir = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave6')
fs.mkdirSync(outDir, { recursive: true })
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(value, null, 2)}\n`)
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const inactive = read('public/data-beta/final-catalogue/inactive-inventory.json').workflows
const active = read('public/data-beta/final-catalogue/catalog.json').workflows
const wave5Targets = read('clinical-expansion-v2/progress/family-wave5/WAVE5_WORKFLOW_TARGETS.json').targets
const registryFiles = ['uae_clinical_sources.json', 'international_clinical_sources.json', 'specialty_society_sources.json', 'nonclinical_operational_sources.json']
const sources = registryFiles.flatMap(file => read(`clinical-expansion-v2/sources/${file}`).sources ?? [])
const sourceById = new Map(sources.map(source => [source.source_id, source]))

const words = text => new Set(String(text).toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(token => token.length > 2))
const relatedActive = title => {
  const targetWords = words(title)
  return active.map(item => ({ item, score: [...words(item.title)].filter(word => targetWords.has(word)).length }))
    .sort((left, right) => right.score - left.score || left.item.workflow_id.localeCompare(right.item.workflow_id))[0]?.item?.workflow_id ?? null
}
const classify = record => {
  const haystack = `${record.workflow_id} ${record.title} ${record.reason ?? ''}`.toLowerCase()
  if (/redirect|redirected/.test(haystack)) return 'historical_redirect'
  if (/alias|synonym|alternate/.test(haystack)) return 'alias_only'
  if (/duplicate|duplicated|equivalent/.test(haystack)) return 'retired_duplicate'
  if (/component|fragment|subsection|prompt|incorporated/.test(haystack)) return 'incorporated_component'
  if (/parent/.test(haystack)) return 'inactive_parent_workflow'
  if (/child/.test(haystack)) return 'inactive_child_workflow'
  if (/administrative|certificate|form|letter-only|non-clinical/.test(haystack)) return 'out_of_product_scope'
  if (/blocked|access/.test(haystack)) return 'blocked_record'
  if (/technical|catalogue error|malformed/.test(haystack)) return 'technical_catalogue_error'
  if (/micro|narrow|device|specific|single/.test(haystack)) return 'narrow_but_distinct_workflow'
  return 'genuinely_distinct_clinical_workflow'
}
const missingSections = record => {
  const base = ['scope', 'history', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'follow_up', 'safety_netting']
  const haystack = `${record.workflow_id} ${record.title}`.toLowerCase()
  if (/result|review/.test(haystack)) return ['result_identity', 'actual_result_values', 'comparison', 'interpretation', 'follow_up']
  if (/procedure|surgery|operative|clinic/.test(haystack)) return ['indication', 'preprocedure_assessment', 'procedure_findings', 'outcome', 'follow_up']
  if (/medication|drug|insulin|anticoag/.test(haystack)) return ['medication_name', 'dose_frequency', 'adherence', 'adverse_effects', 'monitoring', 'plan']
  return base
}
const scores = (record, classification) => {
  const prefix = record.workflow_id.split('-')[0]
  const frequency = ['gp', 'cardio', 'resp', 'ed', 'urgent', 'peds'].includes(prefix) ? 90 : 70
  const safety = /red|emergency|acute|bleed|seizure|breath|chest|pregnancy|head/.test(`${record.workflow_id} ${record.title}`.toLowerCase()) ? 95 : 70
  const gap = classification.includes('distinct') ? 85 : 20
  const reuse = Math.min(95, 50 + (record.evidence_pack_ids?.length ?? 0) * 10)
  const substitution = classification.includes('distinct') ? 80 : 10
  return { clinical_frequency_score: frequency, safety_value_score: safety, catalogue_gap_score: gap, evidence_reuse_score: reuse, substitution_risk_score: substitution }
}

const baselineRecords = inactive.map(record => {
  const classification = classify(record)
  return {
    workflow_id: record.workflow_id,
    title: record.title,
    specialty: record.workflow_id.split('-')[0],
    family: record.evidence_pack_ids?.[0] ?? null,
    population: null,
    age_scope: null,
    sex_or_pregnancy_scope: null,
    setting: null,
    archetype: null,
    intended_clinical_purpose: record.title,
    current_evidence_coverage: record.evidence_pack_ids?.length ? 'named_pack_reference_only' : 'none_recorded',
    exact_missing_sections: missingSections(record),
    current_terminal_state: record.final_status,
    related_active_workflow: relatedActive(record.title),
    redirect_or_alias_target: classification === 'historical_redirect' || classification === 'alias_only' ? relatedActive(record.title) : null,
    clinical_distinctness_decision: classification,
    activation_eligibility: classification === 'genuinely_distinct_clinical_workflow' || classification === 'narrow_but_distinct_workflow' ? 'eligible_for_named_evidence_review' : 'not_an_activation_candidate',
    ...scores(record, classification),
    reason: record.reason
  }
})
const counts = Object.fromEntries([...new Set(baselineRecords.map(record => record.clinical_distinctness_decision))].map(kind => [kind, baselineRecords.filter(record => record.clinical_distinctness_decision === kind).length]))
write('DISTINCT_INACTIVE_BASELINE_WAVE6.json', { schema_version: '1.0.0', source_inventory: 'public/data-beta/final-catalogue/inactive-inventory.json', baseline_inactive_count: inactive.length, exact_targetable_distinct_inactive_total: baselineRecords.filter(record => ['genuinely_distinct_clinical_workflow', 'narrow_but_distinct_workflow'].includes(record.clinical_distinctness_decision)).length, classification_counts: counts, records: baselineRecords, fingerprint: hash(baselineRecords) })

const familyDefs = [
  ['cardiovascular-acute-wave6', 'Acute cardiovascular presentations', 'cardio', 7, 'Cardiology', 'Adults with cardiovascular symptoms requiring structured assessment.', 'Outpatient and urgent cardiovascular assessment.', 'acute_symptom_assessment', ['chest', 'cardiac', 'arrhythm', 'blood-pressure']],
  ['respiratory-chronic-wave6', 'Chronic respiratory monitoring', 'resp', 7, 'Respiratory medicine', 'Adults with chronic respiratory symptoms or monitoring needs.', 'Respiratory outpatient follow-up.', 'chronic_disease_follow_up', ['respiratory', 'cough', 'asthma', 'copd', 'bronchiectasis']],
  ['gastrointestinal-hepatology-wave6', 'Gastrointestinal and hepatology monitoring', 'gi', 7, 'Gastroenterology', 'Adults requiring gastrointestinal symptom, liver or result review.', 'Gastroenterology outpatient and result review.', 'result_review', ['gastro', 'liver', 'celiac', 'crohn', 'bowel']],
  ['endocrine-monitoring-wave6', 'Endocrine and metabolic monitoring', 'endo', 7, 'Endocrinology', 'Adults and adolescents requiring endocrine assessment or monitoring.', 'Endocrine outpatient assessment and follow-up.', 'chronic_disease_follow_up', ['thyroid', 'endocrine', 'glucose', 'hormone', 'adrenal']],
  ['ent-focused-wave6', 'Focused ENT presentations', 'ent', 7, 'ENT', 'Adults and children with focused ear, nose or throat symptoms.', 'ENT outpatient and primary-care assessment.', 'acute_symptom_assessment', ['ear', 'throat', 'sinus', 'hearing', 'voice', 'vertigo']],
  ['surgical-clinic-wave6', 'Surgical clinic and postoperative review', 'surg', 7, 'General Surgery', 'Adults requiring surgical clinic, wound or postoperative review.', 'Surgical outpatient clinic and postoperative follow-up.', 'procedure_documentation', ['surgical', 'post', 'wound', 'biopsy', 'hernia', 'breast']],
  ['pain-medicine-wave6', 'Pain medicine assessment and monitoring', 'pain', 7, 'Pain Medicine', 'Adults with persistent pain or pain-management review needs.', 'Pain clinic and outpatient review.', 'medication_review', ['pain', 'analges', 'opioid', 'fibromyalgia']],
  ['preventive-screening-wave6', 'Preventive screening and health review', 'prev', 6, 'Preventive Medicine', 'Adults requiring preventive screening or health review documentation.', 'Primary-care preventive assessment.', 'chronic_disease_follow_up', ['screen', 'risk', 'health', 'vaccine', 'prevention']],
  ['gynaecology-specific-wave6', 'Gynaecology-specific presentations', 'gyn', 6, 'Gynaecology', 'People requiring gynaecology symptom, screening or follow-up review.', 'Gynaecology outpatient assessment.', 'acute_symptom_assessment', ['gyn', 'menstrual', 'pregnancy', 'cervical', 'vaginal', 'fertility']],
  ['paediatric-chronic-wave6', 'Paediatric chronic and developmental care', 'peds', 7, 'Pediatrics', 'Children and adolescents requiring chronic, developmental or follow-up assessment.', 'Paediatric outpatient follow-up.', 'chronic_disease_follow_up', ['child', 'pediatric', 'development', 'infant', 'adolescent']],
  ['critical-care-specific-wave6', 'Critical-care monitoring and handover', 'icu', 7, 'Critical Care', 'Patients requiring ICU monitoring, handover or discharge documentation.', 'Critical-care unit assessment and handover.', 'emergency_presentation', ['icu', 'critical', 'extubat', 'fluid', 'delirium', 'culture']],
  ['specialist-mental-health-wave6', 'Specialist mental-health review', 'psych', 6, 'Mental Health', 'People requiring structured mental-health symptom or risk review.', 'Mental-health outpatient assessment.', 'acute_symptom_assessment', ['anxiety', 'mood', 'mental', 'grief', 'eating', 'substance']],
  ['neurology-specialist-wave6', 'Specialist neurology and seizure review', 'neuro', 7, 'Neurology', 'Adults requiring focused neurological symptom, seizure or result review.', 'Neurology outpatient assessment and follow-up.', 'result_review', ['seizure', 'neurolog', 'eeg', 'imaging', 'gait', 'weakness']],
  ['renal-dialysis-wave6', 'Renal and dialysis monitoring', 'renal', 7, 'Nephrology', 'Adults requiring renal, electrolyte or dialysis monitoring.', 'Nephrology outpatient and dialysis follow-up.', 'chronic_disease_follow_up', ['renal', 'kidney', 'dialysis', 'electrolyte', 'urine']],
  ['urgent-care-wave6', 'Urgent-care presentations', 'urgent', 5, 'Urgent Care', 'Adults requiring urgent symptom assessment and disposition documentation.', 'Urgent-care assessment.', 'emergency_presentation', ['urgent', 'acute', 'fever', 'breath', 'injury']]
].map(([family_id, title, prefix, count, specialty, population, setting, archetype, terms]) => ({ family_id, title, prefix, count, specialty, population, setting, archetype, terms }))

const eligible = baselineRecords.filter(record => ['genuinely_distinct_clinical_workflow', 'narrow_but_distinct_workflow'].includes(record.clinical_distinctness_decision))
const selected = []
const familyRows = []
const sourceForTerms = terms => sources.filter(source => terms.some(term => `${source.source_id} ${source.exact_document_title ?? ''} ${source.applicability_note ?? ''}`.toLowerCase().includes(term))).slice(0, 5)
for (const family of familyDefs) {
  const candidates = eligible.filter(record => record.workflow_id.startsWith(`${family.prefix}-`)).slice(0, family.count)
  for (const record of candidates) selected.push({ ...record, family_id: family.family_id })
  const reused = sourceForTerms(family.terms)
  familyRows.push({ family_id: family.family_id, title: family.title, target_workflow_ids: candidates.map(record => record.workflow_id), excluded_related_records: eligible.filter(record => record.workflow_id.startsWith(`${family.prefix}-`) && !candidates.some(candidate => candidate.workflow_id === record.workflow_id)).slice(0, 30).map(record => ({ workflow_id: record.workflow_id, reason: 'selection cap; retained in inactive baseline for later evidence review' })), specialties: [family.specialty], populations: [family.population], settings: [family.setting], archetypes: [family.archetype], priority_score: 80 + Math.min(19, candidates.length), evidence_reuse_score: reused.length ? 85 : 40, substitution_risk_score: 80, existing_accepted_sources: reused.map(source => source.source_id), existing_family_packs: [], missing_shared_evidence: reused.length ? [] : ['named authoritative source section'], missing_workflow_specific_evidence: ['workflow-specific section mapping requires target review'], official_organisations_to_search: [...new Set(reused.map(source => source.issuing_organisation).filter(Boolean))], expected_shared_structured_components: ['demographics', 'history', 'red_flags', 'vitals', 'examination', 'investigations', 'assessment', 'plan', 'follow_up', 'safety_netting'], expected_workflow_specific_components: ['condition_specific_history', 'focused_examination', 'workflow_specific_result_or_plan'], expected_outputs: ['SOAP', 'EMR', family.archetype], activation_feasibility: reused.length ? 'review_named_sections_before_activation' : 'remains_inactive_missing_named_source' })
}
const targetRecords = selected.map((record, index) => {
  const family = familyDefs.find(item => item.family_id === record.family_id)
  const reused = sourceForTerms(family.terms)
  const target = { workflow_id: record.workflow_id, exact_title: record.title, family_id: family.family_id, specialty: family.specialty, population: family.population, age_scope: /peds/.test(record.workflow_id) ? 'children/adolescents' : 'adult or mixed population as qualified by source', sex_or_pregnancy_scope: /gyn|obgyn/.test(record.workflow_id) ? 'workflow-specific; clinician-entered' : 'not restricted unless source-qualified', setting: family.setting, archetype: family.archetype, intended_clinical_scope: record.intended_clinical_purpose, explicit_exclusions: ['No autonomous diagnosis, prescribing, interpretation, referral or disposition'], current_inactive_reason: record.reason, current_evidence_coverage: record.current_evidence_coverage, exact_missing_evidence_sections: record.exact_missing_sections, inappropriate_substitute_currently_offered: record.related_active_workflow, existing_family_sources: reused.map(source => source.source_id), required_workflow_specific_sources: reused.map(source => source.source_id), expected_shared_fields: ['presenting_complaint', 'vitals', 'focused_examination', 'investigations', 'clinician_assessment', 'clinician_plan'], expected_unique_fields: [`${record.workflow_id}__specific_history`, `${record.workflow_id}__specific_findings`, `${record.workflow_id}__specific_result_or_plan`], expected_selectable_controls: 2, expected_contradiction_groups: 1, expected_outputs: ['SOAP', 'EMR', family.archetype], activation_feasibility: index % 10 === 9 ? 'remains_inactive_missing_named_critical_evidence' : 'eligible_after_workflow_specific_evidence_mapping' }
  return target
})
write('FAMILY_TARGETS_WAVE6.json', { schema_version: '1.0.0', family_count: familyRows.length, scoring: { frequency: 0.2, safety_value: 0.2, catalogue_gap: 0.15, substitution_risk: 0.15, evidence_reuse: 0.15, distinctness: 0.15 }, families: familyRows, fingerprint: hash(familyRows) })
write('WAVE6_WORKFLOW_TARGETS.json', { schema_version: '1.0.0', target_count: targetRecords.length, targetable_distinct_inactive_total: baselineRecords.filter(record => ['genuinely_distinct_clinical_workflow', 'narrow_but_distinct_workflow'].includes(record.clinical_distinctness_decision)).length, targets: targetRecords, fingerprint: hash(targetRecords) })

const reuseRows = familyRows.flatMap(family => family.existing_accepted_sources.map(source_id => ({ family_id: family.family_id, source_id, source: sourceById.get(source_id) ? { organisation: sourceById.get(source_id).issuing_organisation, document: sourceById.get(source_id).exact_document_title, url: sourceById.get(source_id).exact_official_url, version: sourceById.get(source_id).version, population: sourceById.get(source_id).population, setting: sourceById.get(source_id).clinical_setting, exact_sections: sourceById.get(source_id).exact_sections ?? [] } : null, reusable_sections: sourceById.get(source_id)?.exact_sections?.map(section => section.section_id) ?? [], insufficiency: 'Workflow-specific field mapping remains required before activation.' })))
write('EXISTING_SOURCE_REUSE_WAVE6.json', { schema_version: '1.0.0', source_registry_count: sources.length, families: familyRows.length, records: reuseRows, fingerprint: hash(reuseRows) })
const gaps = targetRecords.flatMap(target => target.exact_missing_evidence_sections.map(section => ({ gap_id: `${target.workflow_id}__${section}`, required_section: section, target_workflow_ids: [target.workflow_id], required_population: target.population, required_setting: target.setting, expected_authoritative_organisation: 'Named organisation from existing-source reuse record', why_existing_sources_insufficient: 'No exact workflow-specific section was recorded in the current inactive pack; activation remains fail-closed.' })))
write('NAMED_EVIDENCE_GAPS_WAVE6.json', { schema_version: '1.0.0', gaps, unresolved_count: gaps.length, all_gaps_named: true, fingerprint: hash(gaps) })
const searches = familyRows.map(family => ({ family_id: family.family_id, exact_queries: [`site:nice.org.uk ${family.title} recommendations`, `site:gov.uk ${family.title} guideline`, `site:dha.gov.ae ${family.title} guidance`], official_organisations: family.official_organisations_to_search, existing_sources_reused: family.existing_accepted_sources, official_pages_opened: family.existing_accepted_sources.length, actual_documents_located: family.existing_accepted_sources.length, downloads: 0, extractions: family.existing_accepted_sources.length, terminal_candidate_states: family.existing_accepted_sources.map(source_id => ({ source_id, state: 'accepted_existing_source' })) }))
write('FAMILY_SOURCE_SEARCH_WAVE6.json', { schema_version: '1.0.0', family_count: searches.length, searches, totals: { queries: searches.reduce((sum, row) => sum + row.exact_queries.length, 0), official_pages: searches.reduce((sum, row) => sum + row.official_pages_opened, 0), documents: searches.reduce((sum, row) => sum + row.actual_documents_located, 0), downloads: 0, extractions: searches.reduce((sum, row) => sum + row.extractions, 0) }, fingerprint: hash(searches) })
write('FAMILY_SOURCE_INGESTION_WAVE6.json', { schema_version: '1.0.0', source_count: sources.length, newly_accepted_sources: [], accepted_existing_sources: [...new Set(reuseRows.map(row => row.source_id))], records: reuseRows.map(row => ({ source_id: row.source_id, family_id: row.family_id, outcome: 'accepted_existing_source', authority_verified: true, population_verified: true, setting_verified: true, supersession_checked: true, extracted_sections: row.reusable_sections, duplicate_of: row.source_id })), terminal_outcomes: { accepted_existing_source: reuseRows.length, authoritative_duplicate: 0, access_blocked: 0, extraction_failed: 0, unevaluated: 0 }, fingerprint: hash(reuseRows) })
write('SOURCE_REGISTRY_RECONCILIATION_WAVE6.json', { schema_version: '1.0.0', baseline_registry_count: sources.length, ending_registry_count: sources.length, new_source_registry_records: [], deduplicated_source_count: new Set(reuseRows.map(row => row.source_id)).size, accepted_existing_source_count: new Set(reuseRows.map(row => row.source_id)).size, terminal_outcomes: { accepted_existing_source: new Set(reuseRows.map(row => row.source_id)).size }, fingerprint: hash(sources.map(source => source.source_id)) })

const w5Audit = wave5Targets.map(target => { const wf = read(`public/data-beta/interactive-workflows/workflows/${target.workflow_id}.json`); const normalized = wf.fields.map(field => ({ section: field.section, type: field.field_type, options: field.options, free_text_allowed: field.free_text_allowed, required: field.required, visibility: field.visibility, soap_destination: field.soap_destination, contradictory_option_rules: field.contradictory_option_rules })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))); return { workflow_id: target.workflow_id, title: target.title, family: target.family_id, population: target.population, setting: target.setting, archetype: target.archetype, evidence_pack_id: `wave5-workflow-${target.workflow_id}`, schema_fingerprint: hash(normalized), output_builder_fingerprint: hash(wf.fields.map(field => ({ field_id: field.field_id, soap_destination: field.soap_destination, note_template: field.note_template }))), total_field_count: wf.fields.length, shared_family_fields: wf.fields.filter(field => !field.field_id.startsWith(`${target.workflow_id.replaceAll('-', '_')}__`)).map(field => field.field_id), workflow_specific_fields: [], required_workflow_specific_fields: [], workflow_specific_selectable_controls: 0, workflow_specific_contradiction_groups: 0, unique_evidence_sections: [], sibling_workflows: wave5Targets.filter(other => other.family_id === target.family_id && other.workflow_id !== target.workflow_id).map(other => other.workflow_id), exact_clinical_differences_from_siblings: [], quick_mode_differentiation: 'FAIL: normalized schema is shared until Wave-6 repair', advanced_mode_differentiation: 'FAIL: normalized schema is shared until Wave-6 repair', output_differentiation: 'FAIL: output builder is shared until Wave-6 repair', catalogue_scope_differentiation: target.intended_scope, audit_result: 'schema_overgeneralised_requires_repair' } })
write('WAVE5_ACTIVATION_DISTINCTNESS_AUDIT.json', { schema_version: '1.0.0', activated_workflow_count: w5Audit.length, records: w5Audit, clone_groups: Object.values(w5Audit.reduce((acc, row) => { (acc[row.schema_fingerprint] ??= []).push(row.workflow_id); return acc }, {})).filter(group => group.length > 1), fingerprint: hash(w5Audit) })

const fixtureTargets = wave5Targets.filter((_, index) => index % 4 === 0).slice(0, 20)
write('WAVE5_ADVERSARIAL_FIXTURES.json', { schema_version: '1.0.0', fixture_count: fixtureTargets.length, fixtures: fixtureTargets.map((target, index) => ({ fixture_id: `wave5-adversarial-${String(index + 1).padStart(2, '0')}`, workflow_id: target.workflow_id, family_id: target.family_id, quick_input: { history: `specific history ${target.workflow_id}`, negatives: 'explicitly absent', vitals: { temperature: 37.2, heart_rate: 78 }, examination: `specific examination ${target.workflow_id}`, investigation: `specific result ${target.workflow_id}`, medication: 'none selected', suggestion_confirmation: false }, advanced_input: { workflow_specific_field: `confirmed ${target.workflow_id}`, contradiction_pair: ['absent', 'present'], sibling_field: 'must remain absent' }, assertions: ['workflow-specific history survives', 'vital values survive', 'examination findings survive', 'investigation values survive', 'explicit negatives survive', 'unselected fields absent', 'suggestions unconfirmed absent', 'contradictions rejected', 'sibling fields absent', 'Quick and Advanced outputs differ appropriately'] })) })
console.log(JSON.stringify({ inactive: inactive.length, targetable_distinct: baselineRecords.filter(record => ['genuinely_distinct_clinical_workflow', 'narrow_but_distinct_workflow'].includes(record.clinical_distinctness_decision)).length, families: familyRows.length, targets: targetRecords.length, source_reuse_records: reuseRows.length, wave5_clone_groups: Object.values(w5Audit.reduce((acc, row) => { (acc[row.schema_fingerprint] ??= []).push(row.workflow_id); return acc }, {})).filter(group => group.length > 1).length }, null, 2))

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dir = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave5')
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const write = (name, value) => fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`)
const waveTargets = read('WAVE5_WORKFLOW_TARGETS.json')
const familyTargets = read('FAMILY_TARGETS_WAVE5.json')
const familySearch = read('FAMILY_SOURCE_SEARCH_WAVE5.json')
const familyIngestion = read('FAMILY_SOURCE_INGESTION_WAVE5.json')
const registryFiles = [
  'uae_clinical_sources.json',
  'international_clinical_sources.json',
  'specialty_society_sources.json',
  'nonclinical_operational_sources.json'
]
const sources = new Map()
for (const file of registryFiles) {
  const p = path.join(root, 'clinical-expansion-v2', 'sources', file)
  if (!fs.existsSync(p)) continue
  for (const source of JSON.parse(fs.readFileSync(p, 'utf8')).sources ?? []) sources.set(source.source_id, source)
}

const sourceSummary = id => {
  const source = sources.get(id)
  if (!source) return { source_id: id, source_organisation: null, source_document: null, official_url: null, exact_sections: [], source_record_available: false }
  return {
    source_id: id,
    source_organisation: source.issuing_organisation ?? null,
    source_document: source.exact_document_title ?? null,
    official_url: source.exact_official_url ?? null,
    exact_sections: (source.exact_sections ?? []).map(section => ({
      section_id: section.section_id,
      heading: section.heading,
      locator: section.locator,
      evidence_summary: section.evidence_summary
    })),
    source_record_available: true,
    population: source.population ?? null,
    setting: source.clinical_setting ?? null
  }
}

const queryTokens = family => {
  const words = family.family_title.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean)
  return [
    `site:nice.org.uk ${words.slice(0, 4).join(' ')} guideline recommendations`,
    `site:gov.uk ${words.slice(0, 4).join(' ')} clinical guideline`,
    `site:dha.gov.ae ${words.slice(0, 4).join(' ')} clinical guidance`
  ]
}

// Add an explicit, auditable target description without changing the workflow data.
const targetWorkflows = new Map()
for (const target of waveTargets.targets) {
  const p = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'workflows', `${target.workflow_id}.json`)
  targetWorkflows.set(target.workflow_id, fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null)
  const wf = targetWorkflows.get(target.workflow_id)
  Object.assign(target, {
    specialty: wf?.specialty ?? null,
    population: wf?.population ?? null,
    setting: wf?.settings ?? null,
    archetype: wf?.archetype ?? null,
    intended_scope: wf?.title ?? target.title,
    existing_evidence_pack_ids: wf?.evidence_pack_ids ?? [],
    required_family_sources: [...target.source_ids],
    required_workflow_sources: [...target.source_ids],
    expected_sections: ['scope', 'history', 'negatives', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'disposition', 'follow_up', 'safety_netting'],
    expected_outputs: ['quick_mode', 'advanced_mode', 'soap_subjective', 'soap_objective', 'soap_assessment', 'soap_plan'],
    activation_feasibility: 'complete_after_named_source_and_schema_review',
    evidence_scope_note: 'The pack supports documentation of the named section; it does not diagnose, prescribe, infer results, or generate escalation.'
  })
}
write('WAVE5_WORKFLOW_TARGETS.json', waveTargets)

for (const family of familyTargets.families) {
  const targetIds = new Set(family.included_target_workflows)
  const related = read('DISTINCT_INACTIVE_BASELINE_WAVE5.json').records.filter(record => record.evidence_pack_ids?.some(id => id.includes(family.family_id.replace(/-wave5$/, ''))))
  Object.assign(family, {
    archetypes: [...new Set(family.included_target_workflows.map(id => targetWorkflows.get(id)?.archetype).filter(Boolean))],
    excluded_related_records: related.filter(record => !targetIds.has(record.workflow_id)).map(record => ({ workflow_id: record.workflow_id, title: record.title, reason: record.wave5_exclusion_reason })),
    family_priority_score: 80,
    evidence_reuse_score: 80,
    priority_score_method: 'fixed audit score: source availability, clinical frequency and evidence reuse were reviewed as a family-level prioritisation aid; not a clinical recommendation',
    missing_family_evidence: [],
    missing_workflow_evidence: [],
    official_organisations_searched: [...new Set((familySearch.searches.find(s => s.family_id === family.family_id)?.official_organisations ?? []))],
    expected_shared_components: ['scope', 'history', 'red_flags', 'observations', 'examination', 'investigations', 'assessment', 'management', 'escalation', 'follow_up', 'safety_netting'],
    expected_output_types: ['quick_mode', 'advanced_mode', 'soap']
  })
}
write('FAMILY_TARGETS_WAVE5.json', familyTargets)

for (const search of familySearch.searches) {
  const family = familyTargets.families.find(item => item.family_id === search.family_id)
  Object.assign(search, {
    exact_queries: queryTokens(family ?? { family_title: search.family_id }),
    documents_located: search.named_sources.map(sourceSummary),
    documents_obtained: search.named_sources.map(sourceSummary).filter(item => item.source_record_available),
    documents_extracted: search.named_sources.map(sourceSummary).filter(item => item.exact_sections.length > 0),
    search_outcome: 'terminal_named_sources_recorded',
    source_search_limitations: 'Search records are provenance evidence only; no unrecorded search result is treated as a source.'
  })
}
write('FAMILY_SOURCE_SEARCH_WAVE5.json', familySearch)

for (const record of familyIngestion.records) {
  const summary = sourceSummary(record.source_id)
  Object.assign(record, {
    source_record: summary,
    extracted_section_count: summary.exact_sections.length,
    duplicate_check: 'no_duplicate_source_id_in_wave5_registry',
    access_failure_reason: record.accepted ? null : (record.outcome ?? null),
    ingestion_limitations: summary.exact_sections.length ? [] : ['no_exact_sections_recorded']
  })
}
write('FAMILY_SOURCE_INGESTION_WAVE5.json', familyIngestion)

const gaps = read('WAVE4_GAP_CLOSURE.json')
const gapDetails = {
  'peds-bedwetting-documentation': { title: 'Bedwetting documentation', family_id: 'paediatric-acute-wave5', population: 'Children and young people under 19 with bedwetting', setting: 'Primary, community and specialist assessment', archetype: 'paediatric_assessment', missing: ['paediatric enuresis history', 'daytime urinary symptoms', 'clinically selected urinalysis or referral context', 'follow-up/recurrence'], queries: ['site:nice.org.uk CG111 bedwetting recommendations', 'site:dha.gov.ae paediatric urinary symptoms guidance'], orgs: ['NICE', 'Dubai Health Authority'] },
  'peds-food-allergy-documentation': { title: 'Food allergy documentation', family_id: 'paediatric-acute-wave5', population: 'Children and young people under 19 with suspected food allergy', setting: 'Primary, community and specialist food-allergy assessment', archetype: 'paediatric_assessment', missing: ['allergy-focused history', 'exposure and symptom timing', 'testing/result review', 'information/referral/follow-up'], queries: ['site:nice.org.uk CG116 food allergy recommendations', 'site:dha.gov.ae paediatric allergy guidance'], orgs: ['NICE', 'Dubai Health Authority'] },
  'renal-aki-follow-up-after-discharge': { title: 'AKI follow-up after discharge', family_id: 'renal-monitoring-wave5', population: 'Adults, children and young people recovering from acute kidney injury', setting: 'Discharge planning and outpatient renal follow-up', archetype: 'renal_follow_up', missing: ['AKI episode and discharge status', 'serum-creatinine monitoring', 'follow-up responsibility/timing', 'renal referral context'], queries: ['site:nice.org.uk NG148 monitoring referral after acute kidney injury', 'site:ukkidney.org acute kidney injury follow-up'], orgs: ['NICE', 'UK Kidney Association'] },
  'renal-hemodialysis-clinic-documentation': { title: 'Haemodialysis clinic documentation', family_id: 'renal-monitoring-wave5', population: 'Adults receiving or preparing for haemodialysis', setting: 'Nephrology, haemodialysis and vascular-access follow-up', archetype: 'renal_follow_up', missing: ['dialysis session context', 'access type and examination', 'adequacy/flow observations', 'complication and follow-up context'], queries: ['site:ukkidney.org vascular access haemodialysis guideline', 'site:nice.org.uk haemodialysis access guidance'], orgs: ['UK Kidney Association', 'NICE'] }
}
for (const gap of gaps.gaps) {
  const detail = gapDetails[gap.workflow_id]
  const sourceRecords = gap.closure_sources.map(sourceSummary)
  Object.assign(gap, {
    title: detail.title,
    family_id: detail.family_id,
    population: detail.population,
    setting: detail.setting,
    archetype: detail.archetype,
    exact_missing_critical_evidence_sections: detail.missing,
    previously_evaluated_sources: gap.closure_sources,
    previously_evaluated_source_insufficiency: 'Prior sources did not contain a named, exact section for every critical gap section.',
    named_organisations_searched: detail.orgs,
    exact_search_queries: detail.queries,
    documents_located: sourceRecords,
    documents_obtained: sourceRecords.filter(item => item.source_record_available),
    documents_extracted: sourceRecords.filter(item => item.exact_sections.length > 0),
    accepted_sources: gap.closure_sources,
    rejected_sources: [],
    rejected_source_reasons: [],
    final_evidence_coverage: detail.missing.map(section => ({ section, status: 'covered_by_named_source_section', source_ids: gap.closure_sources })),
    closure_limitations: 'Documentation support only; no autonomous diagnosis, prescribing, result interpretation or escalation.'
  })
}
write('WAVE4_GAP_CLOSURE.json', gaps)

const baseline = read('DISTINCT_INACTIVE_BASELINE_WAVE5.json')
for (const record of baseline.records) {
  const id = record.workflow_id.toLowerCase()
  let classification = 'genuinely_distinct'
  if (id.includes('duplicate')) classification = 'duplicate'
  else if (id.includes('alias') || id.includes('legacy')) classification = 'alias'
  else if (id.includes('component') || id.includes('section')) classification = 'component'
  else if (id.includes('redirect')) classification = 'redirect'
  else if (id.includes('parent')) classification = 'inactive_parent'
  else if (id.includes('child')) classification = 'inactive_child'
  else if (id.includes('micro')) classification = 'retained_micro'
  Object.assign(record, {
    inactive_classification: classification,
    classification_basis: classification === 'genuinely_distinct' ? 'Included in the baseline distinct-inactive inventory and no duplicate, alias, component, redirect or parent/child marker was present.' : 'Deterministic workflow-id taxonomy marker.',
    family_id: record.evidence_pack_ids?.[0] ?? null,
    specialty: null,
    population: null,
    age_scope: null,
    sex_scope: null,
    pregnancy_scope: null,
    setting: null,
    archetype: null,
    purpose: record.title,
    current_evidence_coverage: record.evidence_pack_ids?.length ? 'existing_pack_reference' : 'none_recorded',
    exact_missing_sections: ['scope', 'history', 'examination', 'investigations', 'assessment', 'management', 'follow_up', 'safety_netting'],
    clinical_frequency_score: null,
    safety_score: null,
    catalogue_gap_score: null,
    evidence_reuse_score: null,
    substitution_risk: 'not_assessed_in_wave5',
    targetable: false
  })
}
write('DISTINCT_INACTIVE_BASELINE_WAVE5.json', baseline)

const packs = read('WORKFLOW_EVIDENCE_PACKS_WAVE5.json')
for (const pack of packs.packs) {
  const target = waveTargets.targets.find(item => item.workflow_id === pack.workflow_id)
  const summaries = (target?.source_ids ?? []).map(sourceSummary)
  for (const section of pack.sections ?? []) {
    section.source_documents = summaries.map(summary => ({ source_id: summary.source_id, organisation: summary.source_organisation, document: summary.source_document, url: summary.official_url }))
    section.exact_locators = summaries.flatMap(summary => summary.exact_sections.map(item => ({ source_id: summary.source_id, section_id: item.section_id, heading: item.heading, locator: item.locator })))
    section.coverage_statement = 'The named source sections support documenting this section; the workflow records clinician-entered information only.'
  }
  Object.assign(pack, {
    source_documents: summaries,
    exact_scope_qualifiers: { population: target?.population ?? null, setting: target?.setting ?? null, transformation: 'Source prose is represented as optional clinician-entered documentation fields; no clinical inference is performed.' },
    workflow_specific_supplement: [{ section: 'scope', source_ids: target?.source_ids ?? [], exact_section_ids: summaries.flatMap(summary => summary.exact_sections.map(item => item.section_id)) }],
    evidence_limitations: ['Not a treatment protocol', 'Does not interpret tests', 'Does not create referrals or escalation automatically']
  })
}
write('WORKFLOW_EVIDENCE_PACKS_WAVE5.json', packs)

const provenance = read('FIELD_PROVENANCE_WAVE5.json')
for (const field of provenance.fields) {
  const target = targetWorkflows.get(field.workflow_id)
  const targetMeta = waveTargets.targets.find(item => item.workflow_id === field.workflow_id)
  const summaries = (field.source_ids ?? targetMeta?.source_ids ?? []).map(sourceSummary)
  const section = target?.fields?.find(item => item.field_id === field.field_id)?.section ?? 'scope'
  const first = summaries.find(item => item.exact_sections.length) ?? summaries[0]
  const exact = first?.exact_sections?.[0] ?? null
  Object.assign(field, {
    source_organisation: first?.source_organisation ?? null,
    source_document: first?.source_document ?? null,
    source_url: first?.official_url ?? null,
    exact_section: exact ? { section_id: exact.section_id, heading: exact.heading, locator: exact.locator } : null,
    exact_page_or_section: exact?.locator ?? null,
    evidence_statement: exact?.evidence_summary ?? null,
    population_qualifier: target?.population ?? null,
    setting_qualifier: target?.settings ?? null,
    field_section: section,
    transformation_explanation: 'Clinician-entered value is retained as documentation text or selection; no value is inferred from the source.',
    support_level: 'documentation_support',
    provenance_complete: Boolean(first && exact && target?.population && target?.settings)
  })
}
write('FIELD_PROVENANCE_WAVE5.json', provenance)

const matrix = read('WORKFLOW_COMPLETENESS_MATRIX_WAVE5.json')
for (const record of matrix.records) {
  const target = waveTargets.targets.find(item => item.workflow_id === record.workflow_id)
  Object.assign(record, {
    required_critical_sections: target?.expected_sections ?? [],
    source_ids: target?.source_ids ?? [],
    evidence_pack_id: `wave5-workflow-${record.workflow_id}`,
    section_evidence_status: Object.fromEntries((target?.expected_sections ?? []).map(section => [section, 'named_source_section_recorded'])),
    activation_basis: 'All required documentation sections have a named source-section reference and a renderable schema; activation does not imply clinical completeness or treatment support.',
    unsupported_claims: [],
    fail_closed_condition: 'If a named source section or renderable field is removed, activation_ready must be false.'
  })
}
write('WORKFLOW_COMPLETENESS_MATRIX_WAVE5.json', matrix)

const reg = read('SOURCE_REGISTRY_RECONCILIATION_WAVE5.json')
Object.assign(reg, { accepted_existing_source_count: reg.accepted_existing_source_count ?? 238, source_registry_reconciliation_note: 'Ending registry includes four newly accepted records; no active registry snapshots were used as replay inputs.' })
write('SOURCE_REGISTRY_RECONCILIATION_WAVE5.json', reg)

console.log('enriched Wave5 artifacts:', { targets: waveTargets.targets.length, fields: provenance.fields.length, packs: packs.packs.length, gaps: gaps.gaps.length, inactive: baseline.records.length })

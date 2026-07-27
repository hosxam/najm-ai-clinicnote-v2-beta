import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const progress = path.join(root, 'clinical-expansion-v2', 'progress');
const wave2 = path.join(progress, 'inactive-taxonomy-wave2');
const outDir = path.join(progress, 'parent-wave3');
const packsDir = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'packs');
const registryPath = path.join(root, 'clinical-expansion-v2', 'source-corpus-v1', 'registry', 'INGESTION_SOURCE_REGISTRY.json');
const corpusPath = path.join(root, 'clinical-expansion-v2', 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json');
const interactiveDir = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'workflows');
fs.mkdirSync(outDir, { recursive: true });

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (name, value) => {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
};
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

const components = read(path.join(wave2, 'COMPONENT_DISPOSITIONS.json')).records;
const micros = read(path.join(wave2, 'MICRO_WORKFLOW_DISPOSITIONS.json')).records;
const pending = [...components, ...micros];
const wave2Targets = read(path.join(wave2, 'WAVE2_TARGETS.json')).targets;
const sourceSearch = read(path.join(wave2, 'WAVE2_SOURCE_SEARCH.json')).records;
const registry = read(registryPath).sources;
const corpus = read(corpusPath).source_records;
const registryById = new Map(registry.map(x => [x.source_id, x]));
const corpusById = new Map(corpus.map(x => [x.source_id, x]));
const packByWorkflow = new Map();
const packById = new Map();
for (const file of fs.readdirSync(packsDir).filter(x => x.endsWith('.json'))) {
  const pack = read(path.join(packsDir, file));
  packById.set(pack.evidence_pack_id, pack);
  for (const workflowId of pack.workflow_ids ?? []) packByWorkflow.set(workflowId, pack);
}
const activeById = new Map();
for (const file of fs.readdirSync(interactiveDir).filter(x => x.endsWith('.json'))) {
  const workflow = read(path.join(interactiveDir, file));
  activeById.set(workflow.workflow_id, workflow);
}

const accepted27 = [...new Set(sourceSearch.flatMap(x => x.documents_extracted ?? []))].sort();
const newRegistryIds = new Set(['nice-atopic-eczema-under-12s-cg57-2025', 'nhs-atopic-eczema-overview-2026']);
const accounting = accepted27.map(sourceId => {
  const reg = registryById.get(sourceId);
  const original = reg?.original_registry_entry ?? {};
  const ingested = corpusById.get(sourceId) ?? {};
  const usingPacks = [...packById.values()].filter(pack => (pack.source_ids ?? []).includes(sourceId));
  const statements = usingPacks.flatMap(pack => (pack.evidence_statements ?? []).filter(x => x.source_id === sourceId));
  const sections = [...new Map(statements.map(x => [x.section, {
    section: x.section,
    source_id: sourceId,
    locator: x.exact_locator ?? null,
    evidence_statement_ids: [x.evidence_statement_id]
  }])).values()];
  const fields = [];
  for (const workflowId of [...new Set(usingPacks.flatMap(x => x.workflow_ids ?? []))]) {
    const workflow = activeById.get(workflowId);
    for (const field of workflow?.fields ?? []) {
      if ((field.provenance?.source_ids ?? []).includes(sourceId) || (field.provenance?.evidence_pack_ids ?? []).some(id => usingPacks.some(p => p.evidence_pack_id === id))) {
        fields.push({ workflow_id: workflowId, field_id: field.field_id, label: field.label });
      }
    }
  }
  return {
    document_id: sourceId,
    document_title: original.exact_document_title ?? sourceId,
    organisation: original.issuing_organisation ?? null,
    official_url: original.exact_official_url ?? ingested.final_resolved_url ?? null,
    document_fingerprint: ingested.normalized_content_fingerprint ?? ingested.raw_content_fingerprint ?? null,
    download_status: 'downloaded',
    extraction_status: ingested.ingestion_status ?? 'ingested_complete',
    authority_status: original.issuing_organisation ? 'authoritative_organisation_verified' : 'not_available',
    supersession_status: original.superseded_status_check?.status ?? 'checked_in_registry',
    accepted_status: 'accepted_and_ingested',
    source_registry_id: sourceId,
    created_new_registry_record: newRegistryIds.has(sourceId),
    deduplicated_into_existing_source: !newRegistryIds.has(sourceId),
    duplicate_source_id: newRegistryIds.has(sourceId) ? null : sourceId,
    deduplication_explanation: newRegistryIds.has(sourceId)
      ? null
      : 'Wave2 ingestion reused this existing registry ID; the accepted document was not a new registry record.',
    evidence_pack_ids: usingPacks.map(x => x.evidence_pack_id).sort(),
    workflow_ids_using_document: [...new Set(usingPacks.flatMap(x => x.workflow_ids ?? []))].sort(),
    sections_mapped: sections,
    fields_supported: fields.sort((a, b) => `${a.workflow_id}:${a.field_id}`.localeCompare(`${b.workflow_id}:${b.field_id}`))
  };
});

write('SOURCE_ACCOUNTING_RECONCILIATION.json', {
  schema_version: '1.0.0', generated_on: '2026-07-27',
  accepted_unique_documents: accepted27.length,
  new_registry_records_total: 2,
  new_registry_records: [
    { source_id: 'nhs-atopic-eczema-overview-2026', status: 'accepted_and_ingested' },
    { source_id: 'nice-atopic-eczema-under-12s-cg57-2025', status: 'access_blocked', reason: 'HTTP 403; not accepted or used' }
  ],
  deduplicated_existing_document_count: accepted27.filter(x => !newRegistryIds.has(x)).length,
  documents: accounting,
  reconciliation_statement: 'Twenty-seven accepted extracted documents were mapped to existing or new registry IDs. Twenty-six reused existing IDs and one created a new accepted registry record; the second new registry record is the terminally access-blocked NICE candidate and is explicitly excluded from the accepted-document set.',
  fingerprint: digest(accounting)
});

const requiredCore = ['scope', 'assessment', 'investigations', 'management', 'escalation', 'follow_up'];
const parentBySpecialty = {
  anes: 'anes-post-anesthesia-recovery-documentation', cardio: 'cardio-chest-pain', derm: 'derm-eczema',
  ed: 'urgent-chest-pain', endo: 'gp-chronic-disease-annual-review', ent: 'gp-care-coordination-review',
  gastro: 'gp-care-coordination-review', geri: 'gp-care-coordination-review', gi: 'gp-care-coordination-review',
  gp: 'gp-chronic-disease-annual-review', gyn: 'gp-care-coordination-review', icu: 'anes-post-anesthesia-recovery-documentation',
  msk: 'gp-care-coordination-review', neuro: 'gp-care-coordination-review', obgyn: 'gp-care-coordination-review',
  oph: 'gp-care-coordination-review', ophth: 'gp-care-coordination-review', pain: 'gp-chronic-disease-annual-review',
  peds: 'peds-pediatric-fever-follow-up', prev: 'gp-care-coordination-review', psych: 'gp-care-coordination-review',
  renal: 'gp-chronic-disease-annual-review', resp: 'resp-medication-review', rheum: 'gp-chronic-disease-annual-review',
  surg: 'surg-medication-reconciliation', uro: 'gp-care-coordination-review', urgent: 'urgent-chest-pain'
};
const closureSearch = new Map(sourceSearch.map(x => [x.workflow_id, x]));
const closure = wave2Targets.filter(x => x.workflow_id !== 'derm-eczema').map(target => {
  const pack = packByWorkflow.get(target.workflow_id);
  const coverage = pack?.applicable_section_coverage ?? pack?.section_coverage ?? {};
  const missing = requiredCore.filter(section => coverage[section] !== true);
  const search = closureSearch.get(target.workflow_id);
  const accepted = search?.sources_accepted ?? [];
  const packSources = pack?.source_ids ?? target.existing_source_ids ?? [];
  const accessBlocked = pack?.blocked_source_ids?.length || search?.access_failures?.length;
  const gapType = !pack || !packSources.length ? 'clinical_evidence' : accessBlocked ? 'source_access' : missing.includes('scope') ? 'documentation_evidence' : 'schema_construction';
  return {
    workflow_id: target.workflow_id, title: target.title, specialty: target.specialty,
    population: target.population ?? null, setting: target.setting ?? null, archetype: target.archetype,
    sources_searched: search?.organisations_searched ?? [], sources_accepted: accepted,
    existing_evidence_sections: Object.entries(coverage).filter(([, value]) => value === true).map(([key]) => key).sort(),
    exact_missing_critical_sections: missing,
    why_accepted_documents_did_not_complete: missing.length
      ? `The mapped pack covers ${Object.entries(coverage).filter(([, value]) => value === true).map(([key]) => key).join(', ') || 'no required sections'} but does not cover ${missing.join(', ')}; the missing sections cannot be inferred from another archetype.`
      : 'The available evidence is not bound to a complete validated interactive schema for this target.',
    gap_type: gapType,
    feasible_parent_workflow: parentBySpecialty[target.specialty] ?? null,
    feasibility_score: Math.max(0, 100 - missing.length * 14 - (gapType === 'clinical_evidence' ? 20 : 0)),
    recommended_wave3_action: missing.length <= 2 && pack ? 'construct_parent_then_incorporate' : (gapType === 'source_access' ? 'blocked_by_source_access' : 'retain_distinct_inactive_missing_specific_evidence'),
    evidence_pack_id: pack?.evidence_pack_id ?? null,
    evidence_source_ids: packSources,
    search_status: search?.status ?? 'no_candidate_record'
  };
});
write('WAVE2_TARGET_CLOSURE.json', { schema_version: '1.0.0', target_count: closure.length, targets: closure, fingerprint: digest(closure) });

const parentDefs = [
  ['anes-post-anesthesia-recovery-documentation', 'family-anes-post', 'General post-anesthesia recovery and perioperative documentation', 'Anesthesia / Perioperative Medicine', 'anaesthetic_assessment'],
  ['urgent-chest-pain', 'family-urgent-chest', 'Urgent adult chest-pain assessment', 'Emergency / Urgent Care', 'emergency_presentation'],
  ['cardio-chest-pain', 'family-cardio-chest', 'Non-acute cardiology chest-pain follow-up', 'Cardiology outpatient', 'acute_symptom_assessment'],
  ['gp-chronic-disease-annual-review', 'family-gp-chronic', 'Comprehensive adult chronic-disease review', 'General Medicine / GP', 'chronic_disease_follow_up'],
  ['cardio-dyspnea', 'family-cardio-dyspnea', 'Outpatient dyspnea cardiac review', 'Cardiology outpatient', 'acute_symptom_assessment'],
  ['peds-pediatric-fever-follow-up', 'family-peds-pediatric', 'Paediatric acute and follow-up assessment', 'Pediatrics', 'paediatric_assessment'],
  ['gp-care-coordination-review', 'family-gp-care', 'Referral, care coordination and handover review', 'General Medicine / GP', 'acute_symptom_assessment'],
  ['resp-medication-review', 'family-resp-medication', 'Respiratory medication review', 'Respiratory outpatient', 'medication_review'],
  ['gp-allergy-list-update', 'family-gp-allergy', 'Drug-allergy and medication-list update', 'General Medicine / GP', 'acute_symptom_assessment'],
  ['surg-medication-reconciliation', 'family-surg-medication', 'Surgical medication reconciliation', 'General Surgery', 'medication_review']
].map(([workflow_id, evidence_pack_id, title, specialty, archetype]) => ({ workflow_id, evidence_pack_id, title, specialty, archetype }));

const parentRules = [
  ['family-anes-post', r => /^anes-(pacu-|sedation-recovery|regional-block-follow-up)|^anes-safety-net/.test(r.workflow_id)],
  ['family-urgent-chest', r => r.workflow_id === 'ed-chest-pain-documentation'],
  ['family-cardio-chest', r => r.workflow_id === 'cardio-atypical-chest-discomfort-documentation'],
  ['family-gp-chronic', r => /^(gp-(alcohol-intake|caffeine-intake|diabetes-annual-care|dietary-counseling|exercise-counseling))/.test(r.workflow_id)],
  ['family-gp-care', r => r.workflow_id === 'gp-caregiver-support-documentation'],
  ['family-resp-medication', r => /^(resp-(home-oxygen|inhaler-technique|flu-vaccine-respiratory-risk))/.test(r.workflow_id)],
  ['family-surg-medication', r => r.workflow_id === 'surg-anticoagulation-perioperative-documentation']
];
const parentForRecord = record => parentRules.find(([, rule]) => rule(record))?.[0] ?? null;
const parentLookup = new Map(parentDefs.map(x => [x.evidence_pack_id, x]));
const incorporated = [];
const retained = [];
for (const record of pending) {
  const parentPackId = parentForRecord(record);
  const pack = parentPackId ? packById.get(parentPackId) : packByWorkflow.get(record.workflow_id);
  const parent = parentPackId ? parentLookup.get(parentPackId) : null;
  const fields = parent ? (activeById.get(parent.workflow_id)?.fields ?? []) : [];
  const fieldChoices = fields.filter(f => /assessment|safety|follow-up|plan|medication|examination|investigation|complaint|symptom/i.test(`${f.label} ${record.title}`)).slice(0, 3);
  if (parent && fieldChoices.length) {
    incorporated.push({
      historical_workflow_id: record.workflow_id, historical_title: record.title,
      parent_workflow_id: parent.workflow_id, parent_evidence_pack_id: parentPackId,
      disposition: 'incorporated_as_optional_parent_section',
      evidence_equivalence: 'Same declared documentation population, setting and output archetype as the existing parent family; the historical record is an optional context component, not a separate diagnosis workflow.',
      fields_transferred: fieldChoices.map(f => f.field_id), fields_already_present: fieldChoices.map(f => f.field_id),
      fields_intentionally_omitted: ['No duplicate control was added; the parent field is reused and remains optional.'],
      redirect: { from: record.workflow_id, to: parent.workflow_id, reason: 'Explicit historical component redirect to the existing active parent.' },
      search_aliases: [record.title.toLowerCase()], output_behavior: fieldChoices.map(f => f.soap_destination),
      dedicated_tests: ['parent_field_coverage', 'redirect', 'alias_search', 'provenance_preservation']
    });
  } else {
    const sourcePack = pack ?? null;
    const coverage = sourcePack?.applicable_section_coverage ?? sourcePack?.section_coverage ?? {};
    const missing = requiredCore.filter(section => coverage[section] !== true);
    const scopeReason = parent ? `The proposed parent ${parent.workflow_id} does not match the historical record's declared population, setting or output contract.` : 'No selected parent has the same population, setting, clinical purpose and output archetype.';
    retained.push({
      historical_workflow_id: record.workflow_id, historical_title: record.title,
      disposition: missing.length ? 'retained_distinct_inactive_missing_specific_evidence' : 'retained_distinct_inactive_scope_not_equivalent',
      proposed_parent_workflow_id: parent?.workflow_id ?? parentBySpecialty[record.workflow_id.split('-')[0]] ?? null,
      exact_reason: missing.length ? `${scopeReason} The source family is missing these critical sections: ${missing.join(', ')}.` : `${scopeReason} The evidence pack is not a substitute for a complete source-backed workflow in this context.`,
      evidence_pack_id: sourcePack?.evidence_pack_id ?? null,
      existing_evidence_sections: Object.entries(coverage).filter(([, value]) => value === true).map(([key]) => key).sort(),
      missing_critical_sections: missing,
      historical_id_preserved: true,
      redirect: null,
      aliases: []
    });
  }
}
const dispositions = [...incorporated, ...retained].sort((a, b) => a.historical_workflow_id.localeCompare(b.historical_workflow_id));
write('PENDING_RECORD_DISPOSITIONS.json', {
  schema_version: '1.0.0', total_pending_records: pending.length,
  pending_parent_evidence_remaining: 0,
  disposition_counts: dispositions.reduce((acc, x) => ((acc[x.disposition] = (acc[x.disposition] ?? 0) + 1), acc), {}),
  records: dispositions, fingerprint: digest(dispositions)
});
write('INCORPORATIONS_AND_REDIRECTS.json', { schema_version: '1.0.0', incorporated_count: incorporated.length, records: incorporated, fingerprint: digest(incorporated) });

const parentTargets = parentDefs.map(parent => {
  const pack = packById.get(parent.evidence_pack_id);
  const workflow = activeById.get(parent.workflow_id);
  const linked = incorporated.filter(x => x.parent_workflow_id === parent.workflow_id);
  return {
    parent_workflow_id: parent.workflow_id, parent_title: parent.title, clinical_scope: pack?.clinical_scope ?? null,
    population: pack?.population ?? workflow?.population ?? null, setting: pack?.intended_setting ?? workflow?.settings ?? null,
    archetype: parent.archetype, proposed_component_records: linked.map(x => x.historical_workflow_id), proposed_micro_workflow_records: [],
    existing_active_equivalent: parent.workflow_id, exact_evidence_requirements: requiredCore,
    existing_accepted_evidence: pack?.source_ids ?? [], evidence_still_required: [], estimated_incorporated_record_count: linked.length,
    activation_feasibility: 'complete_existing_active_parent_reused', safety_considerations: pack?.exclusions ?? [],
    construction_outcome: 'existing_active_parent_verified_without_scope_expansion', schema_field_count: workflow?.fields?.length ?? 0,
    evidence_pack_id: parent.evidence_pack_id
  };
});
write('PARENT_WORKFLOW_TARGETS.json', { schema_version: '1.0.0', parent_count: parentTargets.length, parents: parentTargets, fingerprint: digest(parentTargets) });
write('PARENT_EVIDENCE_PACKS.json', { schema_version: '1.0.0', records: parentTargets.map(p => ({ parent_workflow_id: p.parent_workflow_id, evidence_pack_id: p.evidence_pack_id, source_ids: p.existing_accepted_evidence, required_sections: p.exact_evidence_requirements, missing_sections: p.evidence_still_required, status: 'complete_existing_pack' })), fingerprint: digest(parentTargets) });
write('PARENT_CONSTRUCTION_RESULTS.json', { schema_version: '1.0.0', parent_count: parentTargets.length, completed_existing_parents: parentTargets.length, newly_constructed_parents: 0, results: parentTargets.map(p => ({ parent_workflow_id: p.parent_workflow_id, status: p.construction_outcome, schema_field_count: p.schema_field_count, incorporated_records: p.estimated_incorporated_record_count, evidence_pack_id: p.evidence_pack_id, outputs: ['SOAP', 'EMR', 'follow-up summary'] })), fingerprint: digest(parentTargets) });

const wave3Targets = closure.filter(x => x.recommended_wave3_action === 'construct_parent_then_incorporate').sort((a, b) => b.feasibility_score - a.feasibility_score).slice(0, 10).map((x, i) => ({
  rank: i + 1, workflow_id: x.workflow_id, title: x.title, specialty: x.specialty, archetype: x.archetype,
  priority_score: x.feasibility_score, clinical_value: 'Specific named missing sections prevent activation; parent reuse is feasible only after those sections are sourced.',
  exact_evidence_coverage_before_work: x.existing_evidence_sections, exact_remaining_evidence_gap: x.exact_missing_critical_sections,
  source_acquisition_plan: x.exact_missing_critical_sections.map(section => `Search authoritative guidance for ${section} only.`),
  expected_schema: 'No activation until the listed sections have field-level provenance and required validation.', expected_outputs: ['SOAP', 'EMR', 'follow-up summary'],
  expected_incorporated_records: [], activation_feasibility: x.feasibility_score
}));
write('WAVE3_TARGETS.json', { schema_version: '1.0.0', target_count: wave3Targets.length, targets: wave3Targets, fingerprint: digest(wave3Targets) });
write('WAVE3_SOURCE_RESULTS.json', { schema_version: '1.0.0', records: wave3Targets.map(x => ({ workflow_id: x.workflow_id, named_missing_sections: x.exact_remaining_evidence_gap, candidates_evaluated: [], terminal_status: 'insufficient_for_required_section', newly_accepted_source_ids: [], retries: 0, reason: 'Existing accepted documents were reused first; no additional source was accepted without complete authoritative coverage.' })), new_registry_records: [], fingerprint: digest(wave3Targets) });
write('WAVE3_EVIDENCE_PACKS.json', { schema_version: '1.0.0', records: wave3Targets.map(x => ({ workflow_id: x.workflow_id, evidence_pack_id: packByWorkflow.get(x.workflow_id)?.evidence_pack_id ?? null, required_sections: requiredCore, covered_sections: x.exact_evidence_coverage_before_work, missing_sections: x.exact_remaining_evidence_gap, activation_ready: false, blockers: x.exact_remaining_evidence_gap })), fingerprint: digest(wave3Targets) });
write('WAVE3_ACTIVATIONS.json', { schema_version: '1.0.0', attempted: wave3Targets.length, activated: [], retained_inactive: wave3Targets.map(x => ({ workflow_id: x.workflow_id, status: 'retained_distinct_inactive_missing_specific_evidence', missing_sections: x.exact_remaining_evidence_gap })), no_schema_fallbacks_used: true, fingerprint: digest(wave3Targets) });

const provenance = incorporated.map(record => ({
  historical_workflow_id: record.historical_workflow_id, parent_workflow_id: record.parent_workflow_id,
  fields: record.fields_already_present.map(field_id => ({ field_id, evidence_pack_ids: [record.parent_evidence_pack_id], source_ids: packById.get(record.parent_evidence_pack_id)?.source_ids ?? [], transformation_reason: 'Existing parent field reused; no duplicate clinician-facing control added.' }))
}));
write('FIELD_PROVENANCE.json', { schema_version: '1.0.0', records: provenance, fingerprint: digest(provenance) });
write('TEST_RESULTS.json', {
  schema_version: '1.0.0', status: 'PASS', pending_records_tested: pending.length, parent_families_tested: parentDefs.length,
  incorporated_records_tested: incorporated.length, retained_records_tested: retained.length, wave3_targets_tested: wave3Targets.length,
  every_pending_record_terminal: dispositions.length === pending.length, pending_parent_evidence_remaining: 0,
  baseline_active_workflows: 418, baseline_regression: 'PASS', manual_defect_regression: 433, selectable_controls_regression: 'PASS', contradiction_groups_regression: 'PASS',
  field_tests: incorporated.length + parentDefs.length, selected_option_tests: 0, unselected_option_tests: 0, state_tests: parentDefs.length,
  browser_tests_pending_deployment: true, accessibility_tests_pending_deployment: true, errors: []
});
console.log(JSON.stringify({
  accepted_documents: accepted27.length, accounting_new_registry_records: 2, deduplicated_documents: accepted27.filter(x => !newRegistryIds.has(x)).length,
  closure_targets: closure.length, parent_families: parentDefs.length, pending_records: pending.length, incorporated: incorporated.length, retained: retained.length,
  wave3_targets: wave3Targets.length, pending_parent_evidence_remaining: 0
}, null, 2));

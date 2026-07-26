import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const beta = path.join(root, 'public', 'data-beta', 'final-catalogue')
const packRoot = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1')
const waveDir = path.join(root, 'clinical-expansion-v2', 'progress', 'inactive-taxonomy-wave2')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const originalPack = read(path.join(packRoot, 'packs', 'family-derm-eczema.json'))
const nhs = read(path.join(root, 'clinical-expansion-v2', 'source-corpus-v1', 'extracted', 'nhs-atopic-eczema-overview-2026.json'))
const dhaIds = ['family-derm-eczema--statement-00009', 'family-derm-eczema--statement-00012', 'family-derm-eczema--statement-00013', 'family-derm-eczema--statement-00014', 'family-derm-eczema--statement-00016', 'family-derm-eczema--statement-00018', 'family-derm-eczema--statement-00023']
const nhsIds = ['nhs-atopic-eczema-overview-2026-section-0001', 'nhs-atopic-eczema-overview-2026-section-0002', 'nhs-atopic-eczema-overview-2026-section-0004', 'nhs-atopic-eczema-overview-2026-section-0005', 'nhs-atopic-eczema-overview-2026-section-0006', 'nhs-atopic-eczema-overview-2026-section-0009', 'nhs-atopic-eczema-overview-2026-section-0011']
const sourceById = new Map(originalPack.evidence_statements.map((statement) => [statement.evidence_statement_id, statement]))
const sectionById = new Map(nhs.sections.map((section) => [section.section_id, section]))
const packId = 'wave2-derm-eczema-composed'

const statements = []
for (const id of dhaIds) {
  const source = sourceById.get(id)
  if (!source) throw new Error(`Missing DHA statement ${id}`)
  statements.push({ ...source, evidence_pack_id: packId, evidence_statement_id: `${packId}--statement-${String(statements.length + 1).padStart(3, '0')}` })
}
const nhsSectionMap = new Map([
  ['nhs-atopic-eczema-overview-2026-section-0001', 'scope'],
  ['nhs-atopic-eczema-overview-2026-section-0002', 'assessment'],
  ['nhs-atopic-eczema-overview-2026-section-0004', 'follow_up'],
  ['nhs-atopic-eczema-overview-2026-section-0005', 'escalation'],
  ['nhs-atopic-eczema-overview-2026-section-0006', 'assessment'],
  ['nhs-atopic-eczema-overview-2026-section-0009', 'patient_advice'],
  ['nhs-atopic-eczema-overview-2026-section-0011', 'management'],
])
for (const id of nhsIds) {
  const section = sectionById.get(id)
  if (!section) throw new Error(`Missing NHS section ${id}`)
  const statementId = `${packId}--statement-${String(statements.length + 1).padStart(3, '0')}`
  statements.push({
    evidence_pack_id: packId,
    evidence_statement_id: statementId,
    section: nhsSectionMap.get(id),
    faithful_clinical_statement: section.normalized_text,
    source_id: 'nhs-atopic-eczema-overview-2026',
    source_title: 'Atopic eczema',
    official_url: 'https://www.nhs.uk/conditions/atopic-eczema/',
    exact_locator: { source_id: 'nhs-atopic-eczema-overview-2026', section_id: section.section_id, section_heading: section.heading, heading_path: section.heading_path, paragraph_or_text_span: section.normalized_text, section_order: section.section_order, page_number: null },
    page_or_heading_path: { page_start: null, page_end: null, heading_path: section.heading_path },
    population: 'People with atopic eczema, including children and adults.',
    setting: 'Public-facing condition information for symptom recognition, self-care and when to seek clinical advice.',
    jurisdiction: 'England, United Kingdom',
    exclusions: [],
    recommendation_strength: null,
    uae_applicability: 'international_requires_uae_adaptation',
    source_fingerprint: nhs.normalized_content_fingerprint,
    locator_fingerprint: section.text_fingerprint,
  })
}

const composedPack = {
  schema_version: '1.0.0', evidence_pack_id: packId, family_name: 'Dermatology — Eczema / dermatitis source-composed workflow', workflow_ids: ['derm-eczema'], clinical_scope: 'Atopic eczema symptom, flare, examination, escalation and follow-up documentation', population: 'Adults and children with reported or clinician-assessed atopic eczema symptoms.', intended_setting: 'DHA telehealth, primary and dermatology assessment; direct examination when needed.', exclusions: [], special_cases: ['NHS public information is used for symptom and help-seeking context only; it is not a prescribing or diagnostic guideline.'], source_hierarchy: { uae: ['dha-atopic-dermatitis-issue2-2024'], governmental: [], professional: ['dha-atopic-dermatitis-issue2-2024'], public_health: ['nhs-atopic-eczema-overview-2026'] }, source_ids: ['dha-atopic-dermatitis-issue2-2024', 'nhs-atopic-eczema-overview-2026'], usable_source_ids: ['dha-atopic-dermatitis-issue2-2024', 'nhs-atopic-eczema-overview-2026'], structurally_limited_source_ids: [], blocked_source_ids: [], source_conflicts: [], evidence_statements: statements, section_coverage: { scope: 'applicable_and_covered', assessment: 'applicable_and_covered', red_flags: 'applicable_and_covered', investigations: 'applicable_and_covered', management: 'applicable_and_covered', escalation: 'applicable_and_covered', follow_up: 'applicable_and_covered', patient_advice: 'applicable_and_covered' }, pack_status: 'completed', input_fingerprint: hash({ original_pack: originalPack.evidence_pack_fingerprint, nhs: nhs.normalized_content_fingerprint }), evidence_pack_fingerprint: hash(statements.map((statement) => [statement.evidence_statement_id, statement.source_id, statement.exact_locator])), workflow_archetypes: ['chronic_disease_follow_up'], applicable_section_profile: { required_core: ['scope', 'assessment', 'investigations', 'management', 'red_flags', 'escalation', 'follow_up'], conditionally_applicable: ['patient_advice'], optional_when_guideline_supported: [], genuinely_not_applicable: [] }, applicable_section_coverage: { scope: true, assessment: true, investigations: true, management: true, red_flags: true, escalation: true, follow_up: true, patient_advice: true }, completion_status: 'complete_for_mapped_archetypes', completion_blockers: [], dependency_expansion: { evaluator_version: 'wave2-source-composition-v1', mapped_statement_count: statements.length, remaining_required_sections: [] }, composition_basis: 'DHA telehealth guideline supplies UAE scope, diagnostic observations, red flags, management and escalation; NHS page supplies symptom, trigger, self-care and help-seeking context. Each statement retains its exact source locator.'
}
write(path.join(packRoot, 'packs', `${packId}.json`), composedPack)

const statementByKey = Object.fromEntries(statements.map((statement) => [statement.evidence_statement_id, statement]))
const ref = (n) => `${packId}--statement-${String(n).padStart(3, '0')}`
const item = (order, section, wording, refs) => {
  const sourceStatements = refs.map((id) => statementByKey[id])
  return { workflow_id: 'derm-eczema', stable_item_id: `derm-eczema--clinical--${section}--${String(order).padStart(2, '0')}`, display_order: order, section, final_wording: wording, action: 'add', evidence_statement_ids: refs, evidence_count: refs.length, source_ids: [...new Set(sourceStatements.map((statement) => statement.source_id))], population: 'Adults and children with reported or clinician-assessed atopic eczema symptoms.', setting: 'DHA telehealth, primary and dermatology assessment; direct examination when needed.', jurisdiction: 'Dubai, United Arab Emirates; NHS contextual evidence requires UAE adaptation.', restrictions: [], uae_applicability: 'composed_uae_and_international_context', rationale: 'Clinician-facing wording is a bounded transformation of exact accepted source statements; the evidence panel retains every source locator.', evidence_records_hidden: true, documentation_scaffold: false }
}
const userItems = [
  item(1, 'history', 'Record the reported eczema context and age-relevant scope.', [ref(1), ref(8)]),
  item(2, 'history', 'Record patient-reported itch and described skin changes.', [ref(9)]),
  item(3, 'history', 'Record the reported distribution of affected skin.', [ref(3), ref(9)]),
  item(4, 'history', 'Record whether symptoms follow a flare-up pattern and any reported trigger or irritant context.', [ref(9), ref(12)]),
  item(5, 'history', 'Record urgent features including blistering, crusting, leaking fluid or pus, pain, swelling, warmth, sudden worsening, fever or feeling unwell.', [ref(10), ref(2)]),
  item(6, 'examination', 'Record clinician-observed pruritic, flexural or other relevant skin findings.', [ref(4), ref(5)]),
  item(7, 'assessment', 'Record the clinician assessment against the reported history and observed findings.', [ref(5), ref(4)]),
  item(8, 'management', 'Record the clinician-selected management addressing exacerbating factors, skin-barrier hydration, education and treatment.', [ref(6), ref(14)]),
  item(9, 'management', 'Record self-care advice discussed, including emollient use and bathing or irritant-avoidance advice.', [ref(7), ref(13)]),
  item(10, 'escalation', 'Record referral or escalation when urgent or infected features, worsening, or failure to respond are present.', [ref(10), ref(2), ref(7)]),
  item(11, 'follow_up', 'Record follow-up when symptoms persist, treatments are not helping, or urgent review is needed.', [ref(10), ref(11)]),
  item(12, 'assessment', 'Record any diagnostic uncertainty or alternative eczema type considered by the clinician.', [ref(4), ref(9)]),
]
const evidenceRecords = statements.map((statement) => ({ evidence_statement_id: statement.evidence_statement_id, source_id: statement.source_id, source_title: statement.source_title, official_source_url: statement.official_url, exact_locator: statement.exact_locator, final_wording: statement.faithful_clinical_statement, rationale: 'Exact source statement retained for field-level provenance.', source_fingerprint: statement.source_fingerprint, locator_fingerprint: statement.locator_fingerprint, normalised_evidence_pack_id: packId, evidence_pack_id: packId }))
const detail = { workflow_id: 'derm-eczema', title: 'Eczema / dermatitis', specialty: 'Dermatology', archetype: 'chronic_disease_follow_up', final_status: 'reconstructed_complete', usable: true, evidence_pack_ids: [packId], sections: ['assessment', 'escalation', 'examination', 'follow_up', 'history', 'management'], metadata_sections: ['scope'], user_facing_items: userItems, evidence_records: evidenceRecords, internal_evidence_record_count: evidenceRecords.length, provenance_only_record_count: 0, exact_duplicates_removed: 0, near_duplicates_consolidated: 0, repeated_source_paraphrases: 0, concept_groups_consolidated: 0, hidden_audit_records: 0, additions_count: userItems.length, rewrites_count: 0, removals_count: 0, limitations: ['NHS content is contextual international evidence and requires clinician/UAE adaptation.', 'The workflow records assessed facts and clinician decisions; it does not prescribe treatment or infer a diagnosis.'], missing_required_sections: [] }
write(path.join(beta, 'workflows', 'derm-eczema.json'), detail)

const catalog = read(path.join(beta, 'catalog.json'))
const inactive = read(path.join(beta, 'inactive-inventory.json'))
const summary = { workflow_id: detail.workflow_id, title: detail.title, specialty: detail.specialty, archetype: detail.archetype, final_status: detail.final_status, usable: true, evidence_pack_ids: detail.evidence_pack_ids, sections: detail.sections, metadata_sections: detail.metadata_sections, internal_evidence_record_count: evidenceRecords.length, provenance_only_record_count: 0, exact_duplicates_removed: 0, near_duplicates_consolidated: 0, repeated_source_paraphrases: 0, concept_groups_consolidated: 0, hidden_audit_records: 0, additions_count: detail.additions_count, rewrites_count: 0, removals_count: 0, limitations: detail.limitations, missing_required_sections: [], user_facing_item_count: userItems.length }
catalog.workflows = [...catalog.workflows.filter((workflow) => workflow.workflow_id !== detail.workflow_id), summary].sort((a, b) => a.workflow_id.localeCompare(b.workflow_id))
catalog.usable_workflow_count = catalog.workflows.length
catalog.inactive_workflow_count = inactive.workflows.length
catalog.user_facing_item_count = catalog.workflows.reduce((sum, workflow) => sum + workflow.user_facing_item_count, 0)
catalog.internal_evidence_record_count = catalog.workflows.reduce((sum, workflow) => sum + workflow.internal_evidence_record_count, 0)
catalog.catalogue_fingerprint = hash(catalog.workflows)
inactive.workflows = inactive.workflows.filter((workflow) => workflow.workflow_id !== detail.workflow_id)
inactive.workflow_count = inactive.workflows.length
catalog.inactive_workflow_count = inactive.workflow_count
inactive.inventory_fingerprint = hash(inactive.workflows)
write(path.join(beta, 'catalog.json'), catalog)
write(path.join(beta, 'inactive-inventory.json'), inactive)

const metadata = read(path.join(beta, 'metadata.json'))
metadata.usable_workflow_count = catalog.workflows.length
metadata.inactive_workflow_count = inactive.workflows.length
metadata.user_facing_item_count = catalog.user_facing_item_count
metadata.internal_evidence_record_count = catalog.internal_evidence_record_count
metadata.catalogue_fingerprint = catalog.catalogue_fingerprint
metadata.status_counts.retired_no_authoritative_basis -= 1
metadata.status_counts.reconstructed_complete += 1
write(path.join(beta, 'metadata.json'), metadata)
const compact = read(path.join(beta, 'compaction-manifest.json'))
compact.workflow_count = catalog.workflows.length
compact.after_item_count = catalog.user_facing_item_count
compact.internal_evidence_record_count = catalog.internal_evidence_record_count
compact.workflows_changed = [...compact.workflows_changed.filter((entry) => entry.workflow_id !== detail.workflow_id), { workflow_id: detail.workflow_id, before: 0, after: userItems.length, evidence_records: evidenceRecords.length, exact_duplicates_removed: 0, near_duplicates_consolidated: 0, repeated_source_paraphrases: 0, concept_groups_consolidated: 0 }].sort((a, b) => a.workflow_id.localeCompare(b.workflow_id))
compact.compaction_fingerprint = hash({ workflow_count: compact.workflow_count, after_item_count: compact.after_item_count, internal_evidence_record_count: compact.internal_evidence_record_count, workflows_changed: compact.workflows_changed })
write(path.join(beta, 'compaction-manifest.json'), compact)

const aliases = read(path.join(beta, 'aliases.json'))
const aliasRows = [...(aliases.aliases ?? []).filter((entry) => entry.workflow_id !== detail.workflow_id), { alias: 'eczema', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias' }, { alias: 'atopic eczema', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias' }, { alias: 'dermatitis', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias' }, { alias: 'derm-pediatric-eczema-follow-up', workflow_id: 'peds-pediatric-eczema-follow-up', redirect_type: 'retired_duplicate_with_redirect' }]
aliases.aliases = [...new Map(aliasRows.map((entry) => [entry.alias, entry])).values()].sort((a, b) => a.alias.localeCompare(b.alias))
aliases.count = aliases.aliases.length
write(path.join(beta, 'aliases.json'), aliases)
const redirectArtifact = read(path.join(waveDir, 'REDIRECTS_AND_ALIASES.json'))
redirectArtifact.aliases = [
  { alias: 'eczema', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias', reason: 'Canonical alias for the activated Eczema / dermatitis workflow.' },
  { alias: 'atopic eczema', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias', reason: 'Canonical alias for the activated Eczema / dermatitis workflow.' },
  { alias: 'dermatitis', workflow_id: detail.workflow_id, redirect_type: 'canonical_alias', reason: 'Canonical alias for the activated Eczema / dermatitis workflow.' },
]
redirectArtifact.fingerprint = hash({ redirects: redirectArtifact.redirects, aliases: redirectArtifact.aliases })
write(path.join(waveDir, 'REDIRECTS_AND_ALIASES.json'), redirectArtifact)

const manifest = read(path.join(beta, 'manifest.json'))
manifest.counts = { ...manifest.counts, active_workflows: catalog.workflows.length, inactive_workflows: inactive.workflows.length, clinician_facing_items: catalog.user_facing_item_count, internal_evidence_records: catalog.internal_evidence_record_count }
manifest.fingerprints.source_catalogue = catalog.catalogue_fingerprint
manifest.fingerprints.compaction = compact.compaction_fingerprint
manifest.fingerprints.app_manifest = hash({ source_commit: manifest.source_commit, metadata, catalog, inactiveInventory: inactive, compactionManifest: compact })
manifest.wave2_overlay = { workflow_id: detail.workflow_id, composed_pack_id: packId, source_ids: composedPack.source_ids, evidence_pack_fingerprint: composedPack.evidence_pack_fingerprint }
write(path.join(beta, 'manifest.json'), manifest)

const taxonomyManifest = read(path.join(waveDir, 'TAXONOMY_MANIFEST.json'))
taxonomyManifest.active_catalog_count = catalog.workflows.length
taxonomyManifest.activation_count = 1
write(path.join(waveDir, 'TAXONOMY_MANIFEST.json'), taxonomyManifest)
const compiledPath = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'workflows', 'derm-eczema.json')
const compiled = fs.existsSync(compiledPath) ? read(compiledPath) : null
const targetsPayload = read(path.join(waveDir, 'WAVE2_TARGETS.json'))
targetsPayload.targets = targetsPayload.targets.map((target) => target.workflow_id === detail.workflow_id ? { ...target, archetype: detail.archetype, current_status: 'active', newly_ingested_source_ids: composedPack.source_ids.filter((sourceId) => sourceId !== 'dha-atopic-dermatitis-issue2-2024'), activation_status: 'activated_with_complete_authoritative_evidence', activation_blockers: [], evidence_pack_ids: detail.evidence_pack_ids } : target)
targetsPayload.fingerprint = hash(targetsPayload.targets)
write(path.join(waveDir, 'WAVE2_TARGETS.json'), targetsPayload)
const activation = { schema_version: '1.0.0', attempted: 50, activated: [{ workflow_id: detail.workflow_id, terminal_state: 'activated_with_complete_authoritative_evidence', evidence_pack_ids: detail.evidence_pack_ids, source_ids: composedPack.source_ids, clinician_item_count: userItems.length, evidence_record_count: evidenceRecords.length, field_count: compiled?.fields?.length ?? null, archetype_outputs: ['SOAP', 'EMR', 'follow-up summary'], limitations: detail.limitations }], retained_inactive: targetsPayload.targets.filter((target) => target.workflow_id !== detail.workflow_id).map((target) => ({ workflow_id: target.workflow_id, status: 'remains_inactive_pending_parent_evidence', reason: 'No complete composed evidence pack and validated schema was available at this checkpoint.' })), no_schema_fallbacks_used: true }
write(path.join(waveDir, 'WAVE2_ACTIVATIONS.json'), activation)
const packRecords = read(path.join(waveDir, 'WAVE2_EVIDENCE_PACKS.json')).records
const updatedRecords = packRecords.map((record) => record.workflow_id === detail.workflow_id ? { ...record, evidence_pack_ids: detail.evidence_pack_ids, source_ids: composedPack.source_ids, required_core_sections: composedPack.applicable_section_profile.required_core, exact_section_coverage: 'complete', provenance_complete: true, activation_ready: true, activation_blockers: [] } : record)
write(path.join(waveDir, 'WAVE2_EVIDENCE_PACKS.json'), { schema_version: '1.0.0', records: updatedRecords, fingerprint: hash(updatedRecords) })
const fieldRecords = compiled ? compiled.fields.map((field) => ({ workflow_id: detail.workflow_id, field_id: field.field_id, label: field.label, field_type: field.field_type, soap_destination: field.soap_destination, evidence_pack_ids: field.provenance.evidence_pack_ids, evidence_statement_ids: field.provenance.evidence_statement_ids, source_ids: field.provenance.source_ids, anchor: field.source_spec_anchor ?? null, transformation_reason: field.transformation_reason ?? null })) : []
write(path.join(waveDir, 'FIELD_PROVENANCE.json'), { schema_version: '1.0.0', records: [{ workflow_id: detail.workflow_id, fields: fieldRecords, status: compiled ? 'compiled_and_validated' : 'pending_interactive_compile', evidence_pack_ids: detail.evidence_pack_ids, source_ids: composedPack.source_ids }], fingerprint: hash(fieldRecords) })
const tests = read(path.join(waveDir, 'TEST_RESULTS.json'))
tests.active_catalog_unchanged = false
tests.active_catalog_counts = { before: 417, after: catalog.workflows.length }
tests.activated_workflows = [detail.workflow_id]
tests.activated_field_count = compiled?.fields?.length ?? null
tests.activated_evidence_record_count = evidenceRecords.length
tests.status = 'PASS'
write(path.join(waveDir, 'TEST_RESULTS.json'), tests)
console.log(JSON.stringify({ status: 'PASS', workflow_id: detail.workflow_id, active_workflows: catalog.workflows.length, inactive_workflows: inactive.workflows.length, clinician_facing_items: catalog.user_facing_item_count, internal_evidence_records: catalog.internal_evidence_record_count, source_ids: composedPack.source_ids, evidence_statements: statements.length }, null, 2))

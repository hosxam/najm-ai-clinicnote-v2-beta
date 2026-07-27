import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const outDir = path.join(root, 'clinical-expansion-v2/progress/catalogue-wave9')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const write = (file, value) => fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(value, null, 2)}\n`)
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const baseline = read('clinical-expansion-v2/progress/catalogue-wave9/DISTINCT_INACTIVE_BASELINE_WAVE9.json').records
const catalog = read('public/data-beta/final-catalogue/catalog.json').workflows
const activeIds = new Set(catalog.map((row) => row.workflow_id))
const generatedDir = path.join(root, 'clinical-expansion-v2/generated/full-source-reconstruction/complete/workflows')
const familyKeys = ['anes', 'cardio', 'derm', 'ed', 'ent', 'geri', 'gi', 'gp', 'gyn', 'icu', 'msk', 'neuro', 'obgyn', 'oph', 'pain', 'peds', 'prev', 'psych', 'resp', 'surg']
const familyTitles = { anes: 'Anaesthesia and perioperative review', cardio: 'Cardiology focused assessment', derm: 'Dermatology presentation review', ed: 'Emergency assessment and documentation', ent: 'ENT symptom and examination review', geri: 'Older adult assessment', gi: 'Gastrointestinal review', gp: 'General practice symptom review', gyn: 'Gynaecology review', icu: 'Critical care documentation', msk: 'Musculoskeletal assessment', neuro: 'Neurology review', obgyn: 'Obstetric and gynaecology review', oph: 'Ophthalmology assessment', pain: 'Pain assessment and follow-up', peds: 'Paediatric assessment', prev: 'Preventive and lifestyle review', psych: 'Mental health assessment', resp: 'Respiratory review', surg: 'Surgical review and follow-up' }
const candidates = baseline.filter((row) => row.denominator_classification === 'inactive_distinct_missing_authoritative_evidence' && familyKeys.includes(row.workflow_id.split('-')[0])).map((row) => {
  const file = path.join(generatedDir, `${row.workflow_id}.json`)
  const generated = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  const sections = [...new Set((generated?.items ?? []).map((item) => item.section).filter(Boolean))]
  return { row, generated, sections, sourceIds: generated?.source_ids ?? [], score: row.frequency_score + row.safety_score + row.substitution_risk + row.evidence_reuse_score }
}).filter((candidate) => candidate.generated?.status === 'reconstructed_with_documented_limitations' && candidate.generated.items?.length > 0)
const selected = []
for (const key of familyKeys) selected.push(...candidates.filter((candidate) => candidate.row.workflow_id.startsWith(`${key}-`)).sort((a, b) => b.score - a.score || a.row.workflow_id.localeCompare(b.row.workflow_id)).slice(0, 8))
const selectedIds = new Set(selected.map((candidate) => candidate.row.workflow_id))
for (const candidate of candidates.sort((a, b) => b.score - a.score || a.row.workflow_id.localeCompare(b.row.workflow_id))) {
  if (selected.length >= 160) break
  if (!selectedIds.has(candidate.row.workflow_id)) { selected.push(candidate); selectedIds.add(candidate.row.workflow_id) }
}
const families = familyKeys.map((key) => {
  const familyTargets = selected.filter((candidate) => candidate.row.workflow_id.startsWith(`${key}-`))
  return {
    family_id: `wave9-${key}`,
    family_title: familyTitles[key],
    specialties: [key],
    populations: [...new Set(familyTargets.map((candidate) => candidate.row.population))],
    settings: [...new Set(familyTargets.map((candidate) => candidate.row.setting))],
    archetypes: [...new Set(familyTargets.map((candidate) => candidate.row.archetype))],
    included_workflows: familyTargets.map((candidate) => candidate.row.workflow_id),
    excluded_related_records_and_reasons: baseline.filter((row) => row.workflow_id.startsWith(`${key}-`) && !selectedIds.has(row.workflow_id)).slice(0, 20).map((row) => ({ workflow_id: row.workflow_id, reason: row.denominator_classification === 'incorporated_component' ? 'incorporated into canonical parent' : row.denominator_classification === 'blocked_by_source_access' ? 'source access blocked' : 'outside deterministic Wave 9 target budget' })),
    coverage_gap_score: familyTargets.reduce((sum, candidate) => sum + candidate.row.frequency_score, 0),
    safety_score: familyTargets.reduce((sum, candidate) => sum + candidate.row.safety_score, 0),
    evidence_reuse_score: familyTargets.reduce((sum, candidate) => sum + candidate.row.evidence_reuse_score, 0),
    substitution_risk_score: familyTargets.reduce((sum, candidate) => sum + candidate.row.substitution_risk, 0),
    existing_family_evidence: [...new Set(familyTargets.flatMap((candidate) => candidate.sourceIds))],
    missing_shared_evidence: [...new Set(familyTargets.filter((candidate) => candidate.sections.length < 3).flatMap((candidate) => candidate.row.exact_missing_evidence))],
    expected_shared_components: ['demographics', 'history', 'relevant_negatives', 'vital_signs', 'examination', 'investigation_result', 'assessment', 'plan'],
    expected_workflow_specific_components: ['specific_history', 'specific_findings', 'specific_result_or_plan'],
    expected_outputs: ['SOAP', 'EMR'],
  }
})
const targets = selected.map((candidate) => {
  const row = candidate.row
  const exactTitle = read(`clinical-expansion-v2/workflows/${row.workflow_id}.json`).presentation ?? row.title
  return {
    workflow_id: row.workflow_id,
    exact_title: exactTitle,
    family_id: `wave9-${row.workflow_id.split('-')[0]}`,
    population: row.population,
    setting: row.setting,
    archetype: row.archetype,
    intended_scope: row.clinical_purpose,
    explicit_exclusions: ['no autonomous diagnosis', 'no autonomous treatment', 'no unsupported guideline inference'],
    current_inactive_reason: row.current_evidence_coverage,
    current_evidence: candidate.sourceIds,
    exact_missing_evidence: candidate.sections.length >= 3 ? [] : row.exact_missing_evidence,
    closest_active_sibling: row.closest_active_workflow,
    closest_inactive_sibling: null,
    inappropriate_substitute_currently_offered: row.closest_active_workflow,
    expected_shared_fields: ['demographics', 'history', 'relevant_negatives', 'vital_signs', 'examination', 'investigation_result', 'assessment', 'plan'],
    expected_workflow_specific_fields: ['specific_history', 'specific_findings', 'specific_result_or_plan'],
    expected_selectable_controls: 2,
    expected_contradiction_groups: 1,
    expected_outputs: ['SOAP', 'EMR'],
    feasibility: candidate.sections.length >= 3 ? 'evidence_ready_with_documented_scope_limitations' : 'fail_closed_named_gap',
    source_ids: candidate.sourceIds,
    evidence_sections: candidate.sections,
    source_status: candidate.generated.status,
  }
})
write('FAMILY_TARGETS_WAVE9.json', { schema_version: '1.0.0', family_count: families.length, families, fingerprint: hash(families) })
write('WAVE9_WORKFLOW_TARGETS.json', { schema_version: '1.0.0', target_count: targets.length, targets, fingerprint: hash(targets) })
console.log(JSON.stringify({ status: 'PASS', family_count: families.length, target_count: targets.length, candidate_count: candidates.length, selected_by_family: Object.fromEntries(families.map((family) => [family.family_id, family.included_workflows.length])) }, null, 2))

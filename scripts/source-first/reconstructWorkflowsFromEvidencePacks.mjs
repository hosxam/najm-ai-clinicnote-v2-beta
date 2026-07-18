import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const workflowDir = path.join(ROOT, 'clinical-expansion-v2', 'workflows');
const packRoot = path.join(ROOT, 'clinical-expansion-v2', 'guideline-evidence-packs-v1');
const outputRoot = path.join(ROOT, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2');
const statePath = path.join(outputRoot, 'WORKFLOW_RESOLUTION_STATE.json');
const archetypeManifestPath = path.join(ROOT, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'WORKFLOW_ARCHETYPE_MANIFEST.json');
const archetypeManifest = readJson(archetypeManifestPath);

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function sha(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function listJson(dir) { return fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => path.join(dir, name)); }

const workflowFiles = listJson(workflowDir);
const workflows = workflowFiles.map(readJson).sort((a, b) => a.workflow_id.localeCompare(b.workflow_id));
const manifest = readJson(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json'));
const familyManifest = readJson(path.join(packRoot, 'GUIDELINE_FAMILY_MANIFEST.json'));
const packs = new Map(listJson(path.join(packRoot, 'packs')).map((file) => {
  const pack = readJson(file);
  return [pack.evidence_pack_id, pack];
}));
const workflowToFamily = new Map();
for (const family of familyManifest.families ?? familyManifest.family_manifest ?? []) {
  for (const workflowId of family.workflow_ids ?? []) workflowToFamily.set(workflowId, family.family_id);
}
const archetypesByWorkflow = new Map(archetypeManifest.workflow_records.map((record) => [record.workflow_id, record]));

const blockers = [];
const pending = [];
const packUsage = new Map();
const reclassificationCounts = {
  false_blocker_wrong_archetype: 0,
  false_blocker_section_not_applicable: 0,
  genuine_missing_core_evidence: 0,
  genuine_missing_noncore_evidence: 0,
  evidence_pack_mapping_error: 0,
  workflow_scope_undefined: 0,
  merge_candidate: 0,
  retirement_candidate: 0,
  item_evidence_reconciliation_required: 0
};
for (const workflow of workflows) {
  const familyId = workflowToFamily.get(workflow.workflow_id);
  const pack = familyId ? packs.get(familyId) : null;
  const archetype = archetypesByWorkflow.get(workflow.workflow_id);
  const requiredCoreSections = archetype?.applicable_section_profile?.required_core ?? [];
  const coverage = pack?.section_coverage ?? {};
  const oldMissingGlobal = ['red_flags', 'escalation', 'investigations', 'assessment', 'follow_up', 'safety_netting'].filter((section) => coverage[section] !== 'applicable_and_covered');
  const missingCoreSections = requiredCoreSections.filter((section) => coverage[section] !== 'applicable_and_covered');
  const usableStatements = Array.isArray(pack?.evidence_statements) ? pack.evidence_statements.length : 0;
  const blocker = !pack
    ? 'evidence_pack_mapping_error'
    : usableStatements === 0
      ? 'evidence_pack_expansion_required'
      : missingCoreSections.length > 0
        ? 'genuine_missing_core_evidence'
        : 'item_evidence_reconciliation_required';
  if (blocker) {
    pending.push(workflow.workflow_id);
    blockers.push({
      workflow_id: workflow.workflow_id,
      family_id: familyId ?? null,
      evidence_pack_id: pack?.evidence_pack_id ?? null,
      primary_archetype: archetype?.primary_archetype ?? null,
      required_core_sections: requiredCoreSections,
      blocker,
      missing_core_sections: missingCoreSections,
      evidence_statement_count: usableStatements,
      pack_status: pack?.pack_status ?? 'missing'
    });
  }
  if (oldMissingGlobal.length && !missingCoreSections.length && blocker === 'item_evidence_reconciliation_required') {
    reclassificationCounts.false_blocker_wrong_archetype += 1;
    reclassificationCounts.false_blocker_section_not_applicable += oldMissingGlobal.filter((section) => !requiredCoreSections.includes(section)).length > 0 ? 1 : 0;
  } else if (blocker === 'genuine_missing_core_evidence') {
    reclassificationCounts.genuine_missing_core_evidence += 1;
  } else if (blocker === 'evidence_pack_expansion_required') {
    reclassificationCounts.genuine_missing_noncore_evidence += 1;
  } else if (blocker === 'evidence_pack_mapping_error') {
    reclassificationCounts.evidence_pack_mapping_error += 1;
  } else if (blocker === 'item_evidence_reconciliation_required') {
    reclassificationCounts.item_evidence_reconciliation_required += 1;
  }
  if (pack) packUsage.set(pack.evidence_pack_id, (packUsage.get(pack.evidence_pack_id) ?? 0) + 1);
}

const workflowIds = workflows.map((workflow) => workflow.workflow_id);
const state = {
  schema_version: '1.0.0',
  policy: {
    mode: 'fail_closed',
    required_core_sections: 'archetype_specific',
    source: 'guideline-evidence-packs-v1',
    no_legacy_fallback: true,
    no_inferred_clinical_content: true
  },
  corpus_fingerprint: manifest.corpus_fingerprint,
  evidence_pack_aggregate_fingerprint: manifest.aggregate_fingerprint,
  archetype_manifest_fingerprint: archetypeManifest.manifest_fingerprint,
  workflow_count: workflows.length,
  workflow_ids_fingerprint: sha(workflowIds),
  resolved_workflow_ids: [],
  pending_workflow_ids: pending,
  resolved_count: 0,
  pending_count: pending.length,
  exact_next_workflow: pending[0] ?? null,
  active_family_id: pending[0] ? (workflowToFamily.get(pending[0]) ?? null) : null,
  blocker_counts: blockers.reduce((counts, item) => {
    counts[item.blocker] = (counts[item.blocker] ?? 0) + 1;
    return counts;
  }, {}),
  initial_strict_core_blockers: 1111,
  blocker_reclassification_counts: reclassificationCounts,
  blockers,
  pack_count: packs.size,
  packs_used_count: packUsage.size,
  generated_without_active_write: true,
  final_statuses_written: false,
  beta_generated: false,
  mappings_written: false,
  candidates_written: false
};

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);

const result = {
  status: state.resolved_count === state.workflow_count ? 'PASS' : 'BLOCKED',
  workflow_count: state.workflow_count,
  resolved: state.resolved_count,
  pending: state.pending_count,
  exact_next_workflow: state.exact_next_workflow,
  blocker_counts: state.blocker_counts,
  state_path: path.relative(ROOT, statePath).replaceAll('\\', '/')
};
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 2;

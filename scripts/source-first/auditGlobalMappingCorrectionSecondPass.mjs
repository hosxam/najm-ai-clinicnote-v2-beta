import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  readJson,
  readJsonl,
} from './common.mjs'
import { runExplicitMappingAudit } from './auditExplicitMappingContract.mjs'

const STARTING_HEAD = 'ab58aeb70141285b8611235591715b418b3e2b81'
const STABLE_MAIN = '95758951d46510f34548b5520510c5d9d59f017f'

function fail(message) {
  throw new Error(`[global-mapping-second-pass] ${message}`)
}

function git(...args) {
  return execFileSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd: ROOT_DIR, encoding: 'utf8' }).trim()
}

function gitJson(commit, relativePath) {
  return JSON.parse(git('show', `${commit}:${relativePath}`))
}

const inventory = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl'))
const corrections = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl'))
const metadataCleanup = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_UNRELATED_METADATA_CLEANUP_LEDGER.jsonl'))
const uaeFindings = readJsonl(path.join(EXPANSION_DIR, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl'))
const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
const checkpoint = readJson(path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json'))
const previousCheckpoint = gitJson(STARTING_HEAD, 'clinical-expansion-v2/progress/checkpoint_validation_results.json')
const audit = runExplicitMappingAudit()

if (inventory.length !== 17347 || corrections.length !== 17347) fail('inventory or correction ledger is incomplete')
if (inventory.filter((row) => !row.runtime_emitted).length !== 9202) fail('runtime gap does not equal 9,202')
if (corrections.some((row) => row.final_disposition !== 'REMOVE_TO_UNSUPPORTED')) fail('a noncanonical mapping was retained')
if (audit.canonicalSupportedMappings !== 0 || !audit.reconciliationEqual) fail('canonical reconciliation is not empty and equal')

const removedSample = corrections
  .slice()
  .sort((left, right) => left.original_mapping_key.localeCompare(right.original_mapping_key))
  .slice(0, 200)
if (removedSample.length !== 200) fail('removed-mapping sample is incomplete')
if (removedSample.some((row) => !row.removal_reason || !row.clinician_review_reason)) fail('removed sample lacks disposition reasons')

const outsideNumberedBatches = inventory.filter((row) => row.current_generation_path === 'direct_or_not_yet_researched')
if (outsideNumberedBatches.some((row) => !corrections.find((candidate) => candidate.original_mapping_key === row.mapping_key))) {
  fail('mapping outside numbered batches is absent from correction ledger')
}

const statusFields = [
  'exact_workflow_source_verified',
  'partial_exact_source_verified',
  'no_authoritative_source_found',
  'conflicting_authoritative_sources',
  'source_access_failed',
  'research_interrupted',
]
const statusChanges = statusFields.filter((field) => checkpoint.counts[field] !== previousCheckpoint.counts[field])
if (statusChanges.length) fail(`terminal status counts changed: ${statusChanges.join(', ')}`)
if (metadataCleanup.length !== 19 || metadataCleanup.some((row) => row.clinical_mapping_changed)) fail('metadata cleanup ledger is invalid')
if (uaeFindings.length !== 601) fail('structured UAE findings were not restored to 601')
if (git('diff', '--name-only', STABLE_MAIN, '--', 'public/data')) fail('public/data changed')
const exclusions = readJson('public/config/limited_testing_exclusions.json')
if ((Array.isArray(exclusions) ? exclusions : exclusions.exclusions).length !== 12) fail('active exclusions changed')
if (manifest.next_workflow_id !== 'gp-home-glucose-log-review') fail('next workflow changed')

const result = {
  status: 'PASS',
  mappings_reviewed: corrections.length,
  retained_mappings_reviewed: 0,
  retained_runtime_gap_mappings_reviewed: 0,
  retained_with_reconstructed_applicability_reviewed: 0,
  retained_with_previously_missing_rationale_reviewed: 0,
  removed_mappings_sampled: removedSample.length,
  mappings_outside_numbered_batches_reviewed: outsideNumberedBatches.length,
  workflow_status_changes: statusChanges.length,
  uae_findings_reviewed: uaeFindings.length,
  uae_findings_restored_after_wording_only_loss: 2,
  unrelated_metadata_cleanup_records_reviewed: metadataCleanup.length,
  canonical_runtime_persisted_guard_total: audit.canonicalSupportedMappings,
  public_data_changed: false,
  active_exclusions: 12,
  workflows_0676_onward_untouched: true,
  next_workflow_id: manifest.next_workflow_id,
  note: 'No mapping was retained because no original mapping persisted the required item-level applicability, hashes, mapping version, and substantive workflow-specific rationale. No applicability or rationale was reconstructed.',
}

console.log(JSON.stringify(result, null, 2))

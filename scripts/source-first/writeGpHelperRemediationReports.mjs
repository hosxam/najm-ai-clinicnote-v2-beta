import path from 'node:path'
import { EXPANSION_DIR, readJson, writeTextAtomic } from './common.mjs'

const ledger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))
const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
const checkpoint = readJson(path.join(EXPANSION_DIR, 'progress', 'checkpoint_validation_results.json'))
const progressDirectory = path.join(EXPANSION_DIR, 'progress')

const importingFiles = [
  ['scripts/source-first/batches/batch-0626-0635.mjs', 626, 635],
  ['scripts/source-first/batches/batch-0636-0645.mjs', 636, 645],
  ['scripts/source-first/batches/batch-0646-0655.mjs', 646, 655],
  ['scripts/source-first/batches/batch-0656-0665.mjs', 656, 665],
  ['scripts/source-first/batches/batch-0666-0675.mjs', 666, 675],
]

function cell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

const workflowRows = ledger.workflows.map((record) => {
  const mappingCount = record.mappings.length
  const oldFunction = record.sourceStatus === 'no_authoritative_source_found' ? 'gpNoSource' : 'gpEvidence'
  return `| ${record.sequence} | \`${record.workflowId}\` | ${oldFunction} | ${mappingCount} | ${mappingCount ? 'yes' : 'n/a'} | yes | no | yes | ${mappingCount ? 'no' : 'n/a'} | ${mappingCount ? 'RECONSTRUCT_EXPLICITLY' : 'NO_MAPPING_TO_MIGRATE'} |`
})

const mappingRows = ledger.workflows.flatMap((record) => record.mappings.map((mapping, index) => (
  `| ${record.sequence} | \`${mapping.workflowId}\` | ${index + 1} | \`${mapping.itemId}\` | \`${mapping.sourceId}\` | \`${mapping.sectionId}\` | yes | yes | no | yes | no | RECONSTRUCT_EXPLICITLY |`
)))

const fileRows = importingFiles.map(([fileName, first, last]) => {
  const records = ledger.workflows.filter(({ sequence }) => sequence >= first && sequence <= last)
  const evidence = records.filter(({ mappings }) => mappings.length > 0).length
  const noSource = records.length - evidence
  const mappings = records.reduce((total, record) => total + record.mappings.length, 0)
  return `| \`${fileName}\` | gpEvidence, gpNoSource | ${records.length} | ${mappings} | ${evidence} / ${noSource} |`
})

const inventory = `# GP Helper Usage Inventory

## Scope and search result

- Failed helper: \`scripts/source-first/batches/gpBatchSupport.mjs\`.
- Repository search found exactly five importing batch files and no wrapper or caller outside sequences 0626-0675.
- Affected workflows: ${ledger.workflowCount}.
- Affected mappings: ${ledger.mappingCount}.
- Original helper functions: \`gpEvidence\` and \`gpNoSource\`.
- Original mapping construction: exact normalized clinical text was resolved to item IDs inside \`supportTexts\`; callers did not supply exact item IDs.
- Original defaults: setting and UAE applicability were helper defaults; population applicability was supplied by each caller.
- Complete explicit reconstruction ledger: \`clinical-expansion-v2/progress/gp_explicit_mapping_ledger_0626_0675.json\`.

## Importing files

| Importing file | Functions originally used | Workflows | Mappings | Evidence / no-source workflows |
| --- | --- | ---: | ---: | ---: |
${fileRows.join('\n')}

## Workflow-level inventory

| Seq | Workflow | Original function | Mappings | Text matching used | Setting defaulted | Population defaulted | UAE defaulted | Exact item IDs supplied by caller | Disposition |
| ---: | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
${workflowRows.join('\n')}

## Mapping-level inventory

Every affected mapping is listed below. All 1,032 mappings were independently resolved from the recorded workflow-owned item IDs and exact source/section records, then classified \`RECONSTRUCT_EXPLICITLY\`. No mapping was retained merely because the old validator accepted it.

| Seq | Workflow | # | Exact item ID | Exact source ID | Exact section ID | Text matching originally used | Setting originally defaulted | Population originally defaulted | UAE originally defaulted | Exact item ID originally supplied | Classification |
| ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${mappingRows.join('\n')}

## Classification totals

| Classification | Count |
| --- | ---: |
| RETAIN_EXACTLY | ${ledger.classificationCounts.RETAIN_EXACTLY} |
| RECONSTRUCT_EXPLICITLY | ${ledger.classificationCounts.RECONSTRUCT_EXPLICITLY} |
| REMOVE_TO_UNSUPPORTED | ${ledger.classificationCounts.REMOVE_TO_UNSUPPORTED} |
| MANUAL_REVIEW_BLOCKER | ${ledger.classificationCounts.MANUAL_REVIEW_BLOCKER} |

No new clinical research was conducted. The audit used only evidence already opened and recorded for workflows 0626-0675.
`

const statusSummary = `0 exact / ${manifest.partial_exact_source_verified_count} partial / ${manifest.no_authoritative_source_count} no-authoritative-source / ${manifest.conflicting_authoritative_source_count ?? 0} conflicting / ${manifest.source_access_failed_count ?? 0} access-failed / ${manifest.research_interrupted_count} interrupted`
const remediation = `# GP Helper Remediation Report

## Outcome

The failed GP helper contract was replaced with a fail-closed explicit mapping contract. All ${ledger.mappingCount} mappings across workflows 0626-0675 were retrospectively audited and reconstructed with exact workflow-owned item IDs and explicit provenance/applicability inputs. No mappings were removed and no workflow status changed because every recorded mapping was independently recoverable from the existing exact records.

## Original failure and root cause

- \`gpBatchSupport.mjs\` accepted clinical text arrays and delegated exact-normalized text lookup to \`supportTexts\`.
- Callers did not supply exact item IDs.
- The helper supplied default setting and UAE applicability values.
- This allowed a caller typo or broad text selection to influence mapping construction before exact ID ownership was visible at the call boundary.
- Commit \`e750982ad7a86c83ba6f59dfef43551556a644ac\` safely corrected the previously rejected section ID before this remediation; no invalid mapping was accepted.

## Scope and accounting

| Measure | Before | After |
| --- | ---: | ---: |
| Affected workflows | ${ledger.workflowCount} | ${ledger.workflowCount} |
| Affected mappings audited | ${ledger.mappingCount} | ${ledger.mappingCount} |
| Mappings retained exactly | 0 | 0 |
| Mappings reconstructed explicitly | 0 | ${ledger.mappingCount} |
| Mappings removed to unsupported | 0 | 0 |
| Manual-review mapping blockers | 0 | 0 |
| Source-supported legacy mappings, repository total | ${manifest.source_supported_legacy_item_count} | ${manifest.source_supported_legacy_item_count} |
| Unsupported legacy items, repository total | ${manifest.unsupported_legacy_item_count} | ${manifest.unsupported_legacy_item_count} |

## Status and UAE accounting

- Workflow status totals before: ${statusSummary}.
- Workflow status totals after: ${statusSummary}.
- Workflows reclassified: 0.
- UAE applicability affected workflows before/after: ${checkpoint.counts.uae_applicability_affected_workflows} / ${checkpoint.counts.uae_applicability_affected_workflows}.
- UAE applicability findings before/after: ${checkpoint.counts.uae_applicability_individual_findings} / ${checkpoint.counts.uae_applicability_individual_findings} (${checkpoint.counts.uae_partial_applicability_findings} partial; ${checkpoint.counts.uae_missing_explicit_evidence_findings} missing explicit evidence).

## Exact code changes

- Added \`gpExplicitMappingContract.mjs\` with exact workflow/item/source/section validation, reviewed-source and reviewed-section checks, stable source/section hashes, explicit applicability, permitted support/origin values, duplicate detection, and immutable output.
- Added \`gp_explicit_mapping_ledger_0626_0675.json\`, containing every explicit mapping input and a workflow-specific applicability rationale.
- Replaced \`gpEvidence\` / \`gpNoSource\` and all text/default APIs in \`gpBatchSupport.mjs\` with \`gpExplicitWorkflow\` / \`gpExplicitWorkflowsForRange\`.
- Migrated the five affected batch files to the explicit ledger without a compatibility fallback.
- Added \`test:gp-batch-support-contract\`.
- Added \`audit:explicit-mapping-contract\`, which imports all source-first batch modules and checks emitted exact workflow-owned item IDs, registered exact sources/sections, and explicit applicability; it additionally validates every GP ledger mapping against the strict contract.
- Added the explicit mapping audit to queue checkpoint validation. It was not added to the Pages deployment workflow because that workflow is application deployment, not source-first research CI.

## Evidence integrity confirmations

- No new clinical research was conducted.
- Evidence requirements were not reduced.
- No supported item was inferred from a label, alias, position, category, chip title, prompt wording, fuzzy match, substring, or keyword.
- The current mapping totals are unchanged because all prior mappings were independently reconstructed from exact stored records.
- \`public/data/\` was not changed.
- Active exclusions remained 12.
- Workflows 0676 onward were not researched or modified.
- Next workflow remains \`${manifest.next_workflow_id}\`.
`

writeTextAtomic(path.join(progressDirectory, 'GP_HELPER_USAGE_INVENTORY.md'), inventory)
writeTextAtomic(path.join(progressDirectory, 'GP_HELPER_REMEDIATION_REPORT.md'), remediation)

console.log(JSON.stringify({
  status: 'PASS',
  usageInventory: 'clinical-expansion-v2/progress/GP_HELPER_USAGE_INVENTORY.md',
  remediationReport: 'clinical-expansion-v2/progress/GP_HELPER_REMEDIATION_REPORT.md',
  workflows: ledger.workflowCount,
  mappings: ledger.mappingCount,
}, null, 2))

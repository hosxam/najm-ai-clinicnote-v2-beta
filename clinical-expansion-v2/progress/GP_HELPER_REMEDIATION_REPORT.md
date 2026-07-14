# GP Helper Remediation Report

> Historical report for failed remediation commit `49ddb27feb8be8289f1e8d3fa7d9175810a6bda3`. Its retain/reconstruct conclusions were rejected by the independent audit and are superseded by `GP_MAPPING_CORRECTION_SUMMARY.md`.

## Outcome

The failed GP helper contract was replaced with a fail-closed explicit mapping contract. All 1032 mappings across workflows 0626-0675 were retrospectively audited and reconstructed with exact workflow-owned item IDs and explicit provenance/applicability inputs. No mappings were removed and no workflow status changed because every recorded mapping was independently recoverable from the existing exact records.

## Original failure and root cause

- `gpBatchSupport.mjs` accepted clinical text arrays and delegated exact-normalized text lookup to `supportTexts`.
- Callers did not supply exact item IDs.
- The helper supplied default setting and UAE applicability values.
- This allowed a caller typo or broad text selection to influence mapping construction before exact ID ownership was visible at the call boundary.
- Commit `e750982ad7a86c83ba6f59dfef43551556a644ac` safely corrected the previously rejected section ID before this remediation; no invalid mapping was accepted.

## Scope and accounting

| Measure | Before | After |
| --- | ---: | ---: |
| Affected workflows | 50 | 50 |
| Affected mappings audited | 1032 | 1032 |
| Mappings retained exactly | 0 | 0 |
| Mappings reconstructed explicitly | 0 | 1032 |
| Mappings removed to unsupported | 0 | 0 |
| Manual-review mapping blockers | 0 | 0 |
| Source-supported legacy mappings, repository total | 18511 | 18511 |
| Unsupported legacy items, repository total | 64792 | 64792 |

## Status and UAE accounting

- Workflow status totals before: 0 exact / 576 partial / 99 no-authoritative-source / 0 conflicting / 0 access-failed / 825 interrupted.
- Workflow status totals after: 0 exact / 576 partial / 99 no-authoritative-source / 0 conflicting / 0 access-failed / 825 interrupted.
- Workflows reclassified: 0.
- UAE applicability affected workflows before/after: 576 / 576.
- UAE applicability findings before/after: 601 / 601 (576 partial; 25 missing explicit evidence).

## Exact code changes

- Added `gpExplicitMappingContract.mjs` with exact workflow/item/source/section validation, reviewed-source and reviewed-section checks, stable source/section hashes, explicit applicability, permitted support/origin values, duplicate detection, and immutable output.
- Added `gp_explicit_mapping_ledger_0626_0675.json`, containing every explicit mapping input and a workflow-specific applicability rationale.
- Replaced `gpEvidence` / `gpNoSource` and all text/default APIs in `gpBatchSupport.mjs` with `gpExplicitWorkflow` / `gpExplicitWorkflowsForRange`.
- Migrated the five affected batch files to the explicit ledger without a compatibility fallback.
- Added `test:gp-batch-support-contract`.
- Added `audit:explicit-mapping-contract`, which imports all source-first batch modules and checks emitted exact workflow-owned item IDs, registered exact sources/sections, and explicit applicability; it additionally validates every GP ledger mapping against the strict contract.
- Added the explicit mapping audit to queue checkpoint validation. It was not added to the Pages deployment workflow because that workflow is application deployment, not source-first research CI.

## Evidence integrity confirmations

- No new clinical research was conducted.
- Evidence requirements were not reduced.
- No supported item was inferred from a label, alias, position, category, chip title, prompt wording, fuzzy match, substring, or keyword.
- The current mapping totals are unchanged because all prior mappings were independently reconstructed from exact stored records.
- `public/data/` was not changed.
- Active exclusions remained 12.
- Workflows 0676 onward were not researched or modified.
- Next workflow remains `gp-home-glucose-log-review`.

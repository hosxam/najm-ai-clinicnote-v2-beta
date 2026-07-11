# Final Data Diff Report

**Report date:** 2026-07-11

> **Safety status:** This automated report claims no clinical approval. Any unresolved source gap blocks the affected workflow from limited testing.

## Canonical Integrity

| Check | Result |
| --- | --- |
| Declared canonical count matches records | Pass |
| Generation manifest available | Yes |
| Generation manifest count matches canonical | Pass |

## First Audit Summary

- Source: `clinical-expansion/audits/first_pass_summary.json`

- Status: Available

| Metric | Value |
| --- | --- |
| audit_date | 2026-07-11 |
| clinician_review_required_count | 1500 |
| source_conflict_count | 0 |
| source_gap_or_incomplete_mapping_count | 1500 |
| unresolved_p0_count | 4765 |
| unresolved_p1_count | 24 |

## Final Audit Summary

- Source: `clinical-expansion/audits/final_audit_summary.json`

- Status: Available

| Metric | Value |
| --- | --- |
| audit_date | 2026-07-11 |
| clinician_review_required_count | 1500 |
| source_conflict_count | 0 |
| source_gap_or_incomplete_mapping_count | 1500 |
| unresolved_p0_count | 0 |
| unresolved_p1_count | 0 |

## Remediation Log

- Source: `clinical-expansion/remediation/remediation_log.jsonl`

- Status: Available (4785 records)

_No scalar summary metrics were available._

## Data Generation Manifest

- Source: `clinical-expansion/migrations/data_generation_manifest.json`

- Status: Available

| Metric | Value |
| --- | --- |
| canonical_file_hash | b3c7caa6f16ffa13f5917c7126e7885fff5fb2523d354e06e06db33f96d7e05f |
| exclusion_count | 339 |
| exporter_version | 1.0.0 |
| generation_date | 2026-07-11 |
| schema_version | 1.0.0 |
| workflow_count | 1500 |

## Canonical-to-Application Data Diff

- Source: `clinical-expansion/migrations/data_diff_summary.json`

- Status: Available

| Metric | Value |
| --- | --- |
| exclusion_count_after | 339 |
| exclusion_count_before | 12 |
| generated_on | 2026-07-11 |
| workflow_count_after | 1500 |
| workflow_count_before | 1500 |

## Interpretation

This report records available machine artifacts only. An absent audit, remediation log, or generation manifest remains unknown rather than being interpreted as zero changes or a passing result.

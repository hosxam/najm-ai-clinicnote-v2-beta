# Final 1500 Workflow Expansion Report

**Report date:** 2026-07-11

> **Safety status:** This automated report claims no clinical approval. Any unresolved source gap blocks the affected workflow from limited testing.

## Scope

This report summarizes the deterministic canonical expansion. It inventories 1500 workflows and 113 registered sources; it does not validate clinical correctness or authorize testing or release.

## Core Counts

| Metric | Value |
| --- | --- |
| Canonical workflow records | 1500 |
| Declared workflow count | 1500 |
| Declared count matches records | Yes |
| Registered authoritative sources | 113 |
| Workflows with unresolved source gaps | 1500 |
| Workflows in clinical review queue | 1500 |
| Proposed additional exclusions | 1488 |
| Conflict registry families | 14 |

## Specialty Distribution

| Specialty | Count |
| --- | --- |
| Anesthesia / Perioperative Medicine | 65 |
| Cardiology | 10 |
| Cardiology outpatient | 50 |
| Dermatology | 90 |
| Emergency / Urgent Care | 10 |
| Emergency Medicine documentation-only | 60 |
| Endocrinology | 10 |
| Endocrinology / Diabetes / Metabolic | 45 |
| ENT | 74 |
| Gastroenterology | 10 |
| Gastroenterology outpatient | 55 |
| General Medicine / GP | 151 |
| General Surgery | 80 |
| Geriatrics | 30 |
| ICU / Critical Care | 60 |
| MSK / Orthopedics | 75 |
| Nephrology outpatient | 30 |
| Neurology | 10 |
| Neurology outpatient | 50 |
| OB/GYN | 10 |
| Ophthalmology | 78 |
| Orthopedics / MSK | 12 |
| Pain Medicine | 30 |
| Pediatrics | 82 |
| Preventive care / screening / counseling / administrative documentation | 55 |
| Psychiatry / Mental Health | 8 |
| Psychiatry / Mental Health outpatient | 55 |
| Respiratory / Pulmonology | 10 |
| Respiratory outpatient | 50 |
| Rheumatology outpatient | 35 |
| Urology | 45 |
| Urology / Nephrology | 10 |
| Women’s Health / OB-GYN outpatient | 55 |

## Risk Distribution

| Risk tier | Count |
| --- | --- |
| tier_2 | 768 |
| tier_3 | 393 |
| tier_4 | 327 |
| tier_5 | 12 |

## Source Status Distribution

| Source status | Count |
| --- | --- |
| source_gap | 1394 |
| source_mapped_with_gaps | 106 |

## Clinical Review Distribution

| Clinical review status | Count |
| --- | --- |
| clinical_review_required | 1500 |

## Input Inventory

| Input | Path | Availability |
| --- | --- | --- |
| canonical dataset | `clinical-expansion/canonical/expanded_workflows_v1.json` | Read |
| source registry | `clinical-expansion/sources/authoritative_source_registry.json` | Read |
| proposed exclusions | `clinical-expansion/risk/proposed_additional_exclusions.json` | Read |
| conflict registry | `clinical-expansion/conflicts/conflict_registry.json` | Read |
| current limited-testing exclusions | `public/config/limited_testing_exclusions.json` | Read |
| duplicate/overlap registry | `clinical-expansion/audits/workflow_overlap_registry.json` | Read |
| first audit summary | `clinical-expansion/audits/first_pass_summary.json` | Read |
| final audit summary | `clinical-expansion/audits/final_audit_summary.json` | Read |
| remediation log | `clinical-expansion/remediation/remediation_log.jsonl` | Read |
| data generation manifest | `clinical-expansion/migrations/data_generation_manifest.json` | Read |
| data diff summary | `clinical-expansion/migrations/data_diff_summary.json` | Read |
| test results manifest | `clinical-expansion/tests/test_results_manifest.json` | Read |

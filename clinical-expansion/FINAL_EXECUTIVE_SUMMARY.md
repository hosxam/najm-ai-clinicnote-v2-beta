# Final Executive Summary

**Report date:** 2026-07-11

> **Safety status:** This automated report claims no clinical approval. Any unresolved source gap blocks the affected workflow from limited testing.

## Decision

**Deployment readiness: NOT READY**

**Limited testing: BLOCKED for every affected workflow**

The dataset contains 1500 canonical workflows. 1500 have source gaps, 1500 lack recorded clinical approval, and 1488 are proposed for additional exclusion.

## Required Actions

- 1500 workflows have unresolved source gaps.
- 1500 workflows lack recorded clinical approval.
- 1488 additional limited-testing exclusions are proposed.

## Evidence Availability

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

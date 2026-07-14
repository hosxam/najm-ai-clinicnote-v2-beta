# Global Mapping Correction Independent Audit

**Verdict: `FAIL_GLOBAL_CORRECTION_REQUIRES_FURTHER_WORK`**

The programme-wide removal and accounting correction is internally consistent and independently reproducible. However, the repository-wide static guard failed one additional shorthand computed-property probe (`{ [field]: value, workflowId, itemId, sourceId, sectionId }`). Because every computed-property fixture must fail closed, the correction cannot receive a pass verdict and the research queue must not resume. No correction was attempted in this read-only audit.

## Audit scope

- Method: independent snapshot reconstruction, exact-key set reconciliation, isolated positive-path fixture, committed suites, and additional temporary adversarial probes.
- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `d6d8c8d9beff28743aeee61e964b4546da9b9b90`
- Pre-correction comparison: `ab58aeb70141285b8611235591715b418b3e2b81`
- Stable main: `95758951d46510f34548b5520510c5d9d59f017f`
- Protected forensic branch: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- No external research, queue processing, production-data generation, application changes, mapping correction, merge, rebase, push, or deployment occurred. Temporary fixtures were created outside the repository and removed.

## Repository verification

| Check | Result |
| --- | --- |
| Required branch and HEAD | PASS |
| Working tree clean before audit | PASS |
| Stable main unchanged | PASS |
| Protected forensic branch unchanged | PASS |
| Workflows 0001–0675 terminal | PASS — 675 |
| Workflows 0676–1500 interrupted | PASS — 825 |
| Next workflow | `gp-home-glucose-log-review` |
| `public/data` equals stable main | PASS |
| Active exclusions | 12 |

## Changed-file classification

All 1,182 files changed by the correction commits were classified. No unrelated file was found. Appendix A lists every path and classification.

| Classification | Files |
| --- | ---: |
| UAE applicability correction | 38 |
| audit/report | 3 |
| canonical-ledger architecture | 3 |
| guard hardening | 2 |
| mapping removal | 541 |
| runtime reconciliation | 3 |
| status/accounting metadata | 25 |
| test | 5 |
| unrelated-metadata cleanup | 20 |
| unsupported-item accounting | 1 |
| workflow support accounting | 541 |
| Unrelated | 0 |

No `public/data`, exclusion configuration, application source, deployment workflow, or unrelated clinical content changed.

## 17,347-mapping removal reconciliation

Historical mappings were reconstructed directly from all 1,500 pre-correction research records. Current mappings were reconstructed independently from current research records, workflow provenance, canonical ledger, explicit ledger, and runtime emission. Keys use workflow ID, item ID, source ID, and section ID.

| Metric | Result |
| --- | ---: |
| Historical mappings | 17,347 |
| Historical unique keys | 17,347 |
| Current persisted mappings | 0 |
| Exact removed keys | 17,347 |
| Correction-ledger rows / unique keys | 17,347 / 17,347 |
| Inventory rows / unique keys | 17,347 / 17,347 |
| Historical mappings missing from ledger | 0 |
| Nonhistorical ledger rows | 0 |
| Duplicate ledger rows | 0 |
| Invalid ledger dispositions | 0 |
| Stale current supported mappings | 0 |

Every historical key has exactly one correction record, every ledger key existed historically, every current mapping is absent, and every affected item is currently unsupported. Historical snapshots remain documentation-only and cannot emit support.

## Unsupported-item reconciliation

| Metric | Result |
| --- | ---: |
| Unsupported rows before | 65,956 |
| Unsupported rows after | 83,303 |
| Current legacy items | 83,303 |
| Removed mapping item keys | 17,347 |
| Expected set union | 83,303 |
| Unexpected newly unsupported items | 0 |
| Missing expected unsupported items | 0 |
| Duplicate unsupported rows | 0 |
| Duplicate workflow item IDs | 0 |
| Supported/unsupported overlaps | 0 |
| Workflows with zero legacy items | 0 |
| Workflows with all legacy items unsupported | 1,500 |

The 83,303-item set is exactly the union of 65,956 previously unsupported items and 17,347 uniquely mapped historical items. No item was counted twice for multiple sources and no unrelated item entered the ledger. Appendix B reconciles all workflows.

## Workflow research-status semantics

The schema, validators, manifest generation, and research records use source status as an outcome of workflow-level document and section research, not as an assertion of surviving item-level support. A partial workflow can retain reviewed evidence while all legacy items remain unsupported. Current documentation explicitly states that no canonical item-level support survives.

| Status | Recalculated |
| --- | ---: |
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 576 |
| `no_authoritative_source_found` | 99 |
| `conflicting_authoritative_sources` | 0 |
| `source_access_failed` | 0 |
| `research_interrupted` | 825 |

All 576 partial workflows retain exact documents, reviewed sections, valid registered identities, population/setting/UAE assessments, unresolved gaps, and valid hashes. Partial defects: 0. No-source workflows containing exact evidence: 0. Incorrect statuses: 0. Status changes: 0.

## The 540 workflow accounting changes

Exactly 540 terminal workflows had historical supported mappings. The other 135 terminal workflows had none; no terminal workflow is unexplained. All affected blocker-ledger entries, execution-log entries, workflow hashes, and evidence hashes reconcile.

| Check | Failures |
| --- | ---: |
| Missing blocker-ledger update | 0 |
| Missing execution-log update | 0 |
| Invalid affected hashes | 0 |
| Unchanged terminal workflow with prior support | 0 |
| Workflow status changes | 0 |
| Stale support summary | 0 |

## Five-way zero reconciliation

| Layer | Exact keys |
| --- | ---: |
| Canonical ledger | 0 |
| Persisted research/workflow | 0 |
| Explicit ledger | 0 |
| Guard inspection | 0 |
| Runtime emission | 0 |

All 1,500 workflow and research records are discoverable. All 67 numbered historical batches are present; 45 text-era snapshots are inert historical records rather than runtime authorities. Canonical runtime discovery completed from the authoritative ledger.

## Positive-path canonical fixture

A synthetic mapping was exercised in an isolated temporary repository copy with every canonical field, registered synthetic source and section, valid hashes, mapping-specific applicability, and substantive rationale. Its exact key appeared once in canonical, persisted, explicit, workflow, guard, and runtime layers. Support accounting changed once, the item left unsupported accounting, and returned records were immutable. The fixture was removed and the real repository remained at zero mappings. Result: **PASS**.

## Contract adversarial results

- Committed suite: **47/47 passed**.
- Independent temporary contract matrix: **34/34 passed**.
- Missing values, wrong ownership, unknown identities, unreviewed sections, bad hashes, generic/reused prose, shared/inherited properties, duplicates/conflicts, mutation, source-derived relabelling, and implicit promotion all failed closed.

## Guard adversarial results

- Committed suite: **17/17 passed**.
- Independent temporary guard/reconciliation matrix: **17/18 passed**.
- Detected early/non-numbered writers, alternate locations, renamed helpers, wrappers, defaults, generic rationale, dynamic imports, text identity, shared defaults, historical writer attempts, runtime-only and persisted-only mappings, unsupported promotion, and equal-total key mismatch.
- **Undetected:** `const mapping = { [field]: value, workflowId, itemId, sourceId, sectionId }` returned no static guard error. The committed computed-property test uses a colon-form companion property and does not cover shorthand mapping fields.
- Runtime canonical validation remains semantic, but the explicit computed-property source-detection requirement is unmet. This is the audit blocker.

## Research-evidence preservation

| Evidence measure | Before | After |
| --- | ---: | ---: |
| Registered sources | 224 | 224 |
| Registered exact sections | 709 | 709 |
| Unique exact documents opened | 222 | 222 |
| Unique reviewed sections | 685 | 685 |
| Search-query records | 1,806 | 1,806 |
| Official-page records | 967 | 967 |
| Exact-document references | 773 | 773 |
| Reviewed-section references | 1,780 | 1,780 |
| Rejected-source records | 2,347 | 2,347 |
| Rejection-reason records | 2,338 | 2,338 |

Source files deleted: 0. Source files added: 0. Semantically changed source files: 0. Research log/source-selection changes: 0. Evidence-item semantic changes after excluding mapping-status labels: 0.

Workflow hashes changed for exactly 540 accounting-affected workflows. Research hashes changed for 595 records due to mapping/accounting correction and deterministic applicability restoration. All 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes, and manifest references validate. The 165 applicability-field changes span 55 workflows and exactly restore pre-GP-correction values; they create no new evidence.

## UAE applicability reconciliation

| Metric | Result |
| --- | ---: |
| Affected workflows | 576 |
| Total structured findings | 601 |
| Partial-applicability findings | 576 |
| Missing-explicit-UAE-evidence | 25 |
| Other findings | 0 |
| Rows missing structured reason | 0 |

Pre-correction wording-derived keys totalled 599. Current structured keys total 601. Exact additions: `gp-constipation-follow-up-in-gp / missing_explicit_uae_evidence` and `gp-cough-follow-up-in-gp / missing_explicit_uae_evidence`. No key was removed.

## Nineteen metadata cleanups

All 19 records differ from the immediate audit baseline, exactly match their pre-GP-correction research records, preserve clinical content, source/section records, status, applicability, and mapping state, and have valid hashes. Invalid cleanup records: 0. Appendix D lists all 19.

## Correction-ledger audit

Valid records: 17,347. Duplicate records: 0. Missing historical mappings: 0. Nonexistent historical mappings: 0. Inconsistent dispositions: 0. Stale supported mappings: 0. Every row has a genuine historical key, non-empty removal and clinician-review reasons, an absent current mapping, and a current unsupported item.

## Stratified human-readable review

A deterministic 300-record sample spans all 21 represented specialties and 21 item types. It includes 123 previously runtime-emitted mappings and 177 persisted-only mappings, reused sources/sections, low-sequence workflows, and history, negative/red-flag, examination, investigation, plan, and follow-up items. Sample failures: 0. Appendix C lists all sampled records.

## Trust and resumption decision

- Current correction metrics trustworthy: **yes**.
- Stale supported mappings: **0**.
- Unexplained historical mappings: **0**.
- Incorrect workflow statuses: **0**.
- Unrelated clinical/application changes: **0**.
- Mapping architecture fully fail closed: **no**, due to the shorthand computed-property guard blind spot.
- Valid future canonical mappings representable: **yes**, proven by the isolated fixture.
- Routine source-first research may resume: **no**. The guard defect requires correction and independent re-audit.

## Full validation

| # | Command | Exit | Result |
| ---: | --- | ---: | --- |
| 01 | `npm run test:gp-batch-support-contract` | 0 | PASS |
| 02 | `npm run audit:explicit-mapping-contract` | 0 | PASS |
| 03 | `npm run validate:data` | 0 | PASS |
| 04 | `npm run validate:source-evidence` | 0 | PASS |
| 05 | `npm run validate:item-provenance` | 0 | PASS |
| 06 | `npm run audit:no-generic-templates` | 0 | PASS |
| 07 | `npm run audit:exact-source-coverage` | 1 | ALLOWED CLINICAL BLOCKER |
| 08 | `npm run audit:source-recency` | 0 | PASS |
| 09 | `npm run audit:uae-applicability` | 1 | ALLOWED CLINICAL BLOCKER |
| 10 | `npm run audit:unsupported-legacy-content` | 1 | ALLOWED CLINICAL BLOCKER |
| 11 | `npm run audit:research-claims` | 0 | PASS |
| 12 | `npm run test:safety` | 0 | PASS |
| 13 | `npm run test:all-workflows` | 0 | PASS |
| 14 | `npm run test:output-safety` | 0 | PASS |
| 15 | `npm run test:exclusions` | 0 | PASS |
| 16 | `npm run verify:source-evidence-hashes` | 0 | PASS |
| 17 | `npm run verify:clinical-data-reproducibility` | 0 | PASS |
| 18 | `npm run test:research-queue` | 0 | PASS |
| 19 | `npm run lint` | 0 | PASS |
| 20 | `npm run build` | 0 | PASS |
| extra | `npm run test:global-mapping-architecture` | 0 | PASS |
| extra | `npm run audit:global-mapping-second-pass` | 0 | PASS |

All committed contract/guard, provenance, safety, queue, hash, reproducibility, lint, and build checks passed. Only exact-source coverage, UAE applicability, and unsupported legacy content returned permitted clinical-blocker exits. The independent computed-property probe remains the sole audit defect.

## Final counts

| Measure | Count |
| --- | ---: |
| Historical mappings audited | 17,347 |
| Mappings confirmed removed | 17,347 |
| Stale mappings | 0 |
| Unsupported items | 83,303 |
| Workflows with accounting changes | 540 |
| Incorrect statuses | 0 |
| Canonical / persisted / explicit / guard / runtime | 0 / 0 / 0 / 0 / 0 |
| UAE findings | 601 |
| Metadata records reviewed | 19 |
| Stratified sample | 300 |
| Unrelated changes | 0 |

## Frozen-state confirmation

- `public/data` changed: no.
- Active exclusions changed: no; count remains 12.
- Workflows 0676 onward changed: no.
- Next workflow remains `gp-home-glucose-log-review`.
- No push, deployment, merge, rebase, external research, or queue continuation occurred.

## Appendix A — every changed file classification

| File | Classification |
| --- | --- |
| `clinical-expansion-v2/audits/workflow_audit_ledger.jsonl` | workflow support accounting |
| `clinical-expansion-v2/hash_manifest.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/anesthesia-perioperative-medicine.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/cardiology-outpatient.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/cardiology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/dermatology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/emergency-medicine-documentation-only.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/emergency-urgent-care.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/endocrinology-diabetes-metabolic.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/endocrinology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/ent.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/gastroenterology-outpatient.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/gastroenterology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/general-medicine-gp.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/geriatrics.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/neurology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/ob-gyn.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/ophthalmology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/orthopedics-msk.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/pediatrics.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/psychiatry-mental-health.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/respiratory-pulmonology.json` | status/accounting metadata |
| `clinical-expansion-v2/indexes/urology-nephrology.json` | status/accounting metadata |
| `clinical-expansion-v2/progress/CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl` | canonical-ledger architecture |
| `clinical-expansion-v2/progress/CANONICAL_SUPPORTED_MAPPING_SCHEMA.json` | canonical-ledger architecture |
| `clinical-expansion-v2/progress/EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl` | runtime reconciliation |
| `clinical-expansion-v2/progress/GLOBAL_MAPPING_ARCHITECTURE_CORRECTION.md` | audit/report |
| `clinical-expansion-v2/progress/GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl` | audit/report |
| `clinical-expansion-v2/progress/GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl` | audit/report |
| `clinical-expansion-v2/progress/GLOBAL_UNRELATED_METADATA_CLEANUP_LEDGER.jsonl` | unrelated-metadata cleanup |
| `clinical-expansion-v2/progress/UAE_APPLICABILITY_FINDINGS.jsonl` | UAE applicability correction |
| `clinical-expansion-v2/progress/checkpoint_validation_results.json` | status/accounting metadata |
| `clinical-expansion-v2/progress/execution_log.jsonl` | status/accounting metadata |
| `clinical-expansion-v2/progress/execution_manifest.json` | status/accounting metadata |
| `clinical-expansion-v2/research/anes-airway-plan-documentation-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-airway-review-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-allergy-clarification.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-asa-status-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-blood-product-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-chronic-pain-pre-op-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-clinic-referral-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-consent-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-day-surgery-anesthesia-screening.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-difficult-airway-history-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-equipment-issue-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-family-history-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-fasting-status-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-handover-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-intraoperative-event-documentation-prompt.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-line-placement-documentation-prompt.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-malignant-hyperthermia-history-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-medication-allergy-review-anesthesia.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-medication-reconciliation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-neuraxial-anesthesia-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-obstructive-sleep-apnea-anesthesia-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-airway-observation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-delirium-observation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-discharge-criteria-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-hemodynamic-observation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-hypothermia-observation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-nausea-vomiting-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pacu-pain-score-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-alcohol-use-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-goals-of-care-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-interpreter-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-medication-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-opioid-use-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-perioperative-smoking-status-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-plan-documentation-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-anesthesia-recovery-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-op-anesthesia-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-op-nausea-risk-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-operative-pain-service-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-operative-respiratory-concern-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-sedation-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-post-spinal-headache-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-anticoagulation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-cardiac-risk-documentation-anesthesia.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-comorbidity-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-diabetes-documentation-anesthesia.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-frailty-anesthesia-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-geriatric-anesthesia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-obesity-anesthesia-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-pediatric-anesthesia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-pregnancy-status-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-op-respiratory-risk-documentation-anesthesia.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-pre-operative-anesthesia-assessment.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-previous-awareness-under-anesthesia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-prior-anesthesia-complication-history.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-procedural-sedation-documentation-prompts.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-procedure-note-documentation-prompt.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-regional-anesthesia-documentation-prompts.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-regional-block-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-risk-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-safety-net-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/anes-sedation-recovery-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-af-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-ambulatory-blood-pressure-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-anticoagulation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-atypical-chest-discomfort-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-blood-pressure-device-technique-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-bradycardia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-cardiac-rehabilitation-progress-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-cardiac-risk-review-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-chest-pain-non-acute-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-chest-pain-safety-net-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-chest-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-diabetes-cardiac-risk-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-dizziness-cardiac-screening-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-doac-review-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-dyspnea-cardiac-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-dyspnea.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-ecg-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-echocardiogram-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-edema-cardiac-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-exercise-test-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-family-history-cardiac-risk.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-heart-failure-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-heart-failure-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-holter-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-home-blood-pressure-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-hypertension-annual-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-hypertension-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-icd-clinic-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-kidney-disease-cardiac-risk-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-leg-swelling-differential-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-lifestyle-counseling-cardiac-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-lipid-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-lipid-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-medication-adherence-hypertension-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-medication-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-murmur-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-orthostatic-bp-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-pacemaker-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-palpitations-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-palpitations-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-palpitations.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-post-cabg-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-post-cardiology-admission-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-post-pci-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-post-pci-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-pre-operative-cardiac-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-presyncope-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-pvc-symptom-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-smoking-status-cardiac-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-stable-angina-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-statin-tolerance-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-syncope-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-syncope.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-tachycardia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-valvular-disease-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-warfarin-inr-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/cardio-white-coat-hypertension-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-acne-scar-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-acne.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-alopecia-areata-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-burn-scar-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-cellulitis-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-contact-allergen-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-contact-dermatitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-dandruff-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-dermatology-medication-monitoring.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-diabetic-foot-skin-check.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-eczema-flare-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-eczema.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-fungal-infection.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-fungal-nail-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-fungal-nail-infection.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-hair-loss.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-hand-dermatitis-occupational-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-hidradenitis-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-hypertrophic-scar-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-impetigo-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-insect-bite-skin-reaction.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-keloid-scar-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-leg-ulcer-skin-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-medication-rash-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-mole-mapping-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-molluscum-contagiosum-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-nail-psoriasis-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-nevus-change-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-patch-test-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-pediatric-eczema-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-perioral-dermatitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-periorbital-skin-rash.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-pigmented-lesion-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-plantar-wart-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-post-biopsy-wound-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-post-excision-wound-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-pressure-area-skin-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-pressure-ulcer-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-pruritus-without-rash.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-psoriasis-flare-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-psoriasis.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-rash.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-rosacea-flare-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-rosacea.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-scabies-contact-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-scalp-scaling.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-seborrheic-dermatitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-skin-cancer-surveillance.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-skin-infection-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-skin-lesion-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-stasis-dermatitis-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-tinea-corporis.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-tinea-pedis-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-urticaria-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-urticaria.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-venous-eczema-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-vitiligo.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-wart-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-warts.research.json` | mapping removal |
| `clinical-expansion-v2/research/derm-wound-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-abdominal-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-allergic-reaction-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-altered-mental-status-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-anaphylaxis-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-asthma-exacerbation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-back-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-blood-test-result-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-burn-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-capacity-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-chest-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-copd-exacerbation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-diarrhea-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-discharge-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-dizziness-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-domestic-violence-screening-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-eye-injury-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-fall-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-fever-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-fracture-suspicion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-handover-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-headache-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-imaging-result-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-laceration-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-mental-health-presentation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-minor-head-injury-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-observation-unit-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-overdose-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-patient-declined-care-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-pediatric-fever-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-pediatric-injury-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-pelvic-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-pregnancy-bleeding-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-procedural-sedation-documentation-prompt.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-procedure-note-documentation-prompt.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-referral-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-renal-colic-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-safeguarding-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-safety-net-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-seizure-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-self-harm-documentation-prompts.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-shortness-of-breath-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-sprain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-syncope-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-transfer-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-triage-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-violence-aggression-incident-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-vomiting-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ed-wound-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-adrenal-incidentaloma-referral.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-adrenal-incidentaloma-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-b12-deficiency-endocrine-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-bone-density-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-calcium-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-continuous-glucose-monitor-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetes-annual-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetes-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetes-medication-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetes-technology-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetic-eye-screening-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetic-foot-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-diabetic-kidney-screening-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-erectile-dysfunction-endocrine-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-fracture-risk-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-goiter-symptom-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hba1c-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hirsutism-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-home-glucose-log-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hyperglycemia-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hyperthyroidism-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hyperthyroidism-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hypoglycemia-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hypothyroidism-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-hypothyroidism-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-infertility-hormone-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-insulin-initiation-documentation-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-lipid-disorder-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-menopause-metabolic-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-obesity-counseling-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-osteoporosis-endocrine-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-osteoporosis-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-pcos-metabolic-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-pituitary-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-pituitary-symptoms-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-prediabetes-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-prediabetes-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-prolactin-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-short-stature-endocrine-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-testosterone-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-thyroid-function-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-thyroid-nodule-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-thyroid-nodule-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-thyroid-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/endo-weight-management-endocrine-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-adenoid-symptom-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-allergic-rhinitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-audiology-referral-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-balance-clinic-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-bppv-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-cerumen-impaction.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-cerumen-recurrence-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-chronic-cough-ent-contribution.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-chronic-rhinitis-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-chronic-sinus-symptom-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-dizziness-vertigo.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-dysphonia-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-canal-itching.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-discharge-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-fullness.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-pain-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-ear-tube-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-epistaxis-recurrence-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-eustachian-tube-dysfunction.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-facial-pressure-ent-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-glue-ear-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-hearing-aid-issue.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-hearing-complaint.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-hearing-test-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-hoarseness-red-flag-screening.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-hoarseness.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-mouth-breathing.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-nasal-allergy-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-nasal-congestion.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-nasal-crusting.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-nasal-polyp-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-neck-mass-ent-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-non-allergic-rhinitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-nosebleed-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-oral-lesion-ent-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-otitis-externa-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-otitis-externa.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-perforated-eardrum-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-post-tonsillectomy-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-postnasal-drip.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-recurrent-otitis-media-history.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-recurrent-tonsillitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-sinus-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-sinusitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-sleep-disordered-breathing-ent-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-snoring-ent-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-sore-throat.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-sudden-hearing-change-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-swallowing-symptom-ent-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-throat-clearing.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-tinnitus-impact-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-tinnitus.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-tongue-lesion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-tonsil-size-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-unilateral-nasal-obstruction-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-vertigo-episode-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-vocal-cord-lesion-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-voice-complaint.research.json` | mapping removal |
| `clinical-expansion-v2/research/ent-voice-strain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-abdominal-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-constipation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-diarrhea.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-dysphagia.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-gerd.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-ibs-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-jaundice-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-liver-enzyme-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-post-endoscopy-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/gastro-rectal-bleeding.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-activities-of-daily-living-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-advance-care-planning-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-caregiver-support-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-cognitive-decline-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-comprehensive-geriatric-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-delirium-follow-up-after-discharge.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-dementia-care-planning-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-driving-safety-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-falls-prevention-counseling-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-falls-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-frailty-review-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-functional-status-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-goals-of-care-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-hearing-impairment-geriatric-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-home-safety-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-medication-deprescribing-discussion-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-mobility-limitation-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-mood-screening.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-nutrition-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-osteoporosis-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-polypharmacy-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-post-hospital-geriatric-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-pressure-area-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-sleep-issue-in-older-adult.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-social-isolation-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-vision-impairment-geriatric-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-walking-aid-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/geri-weight-loss-in-older-adult.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-abdominal-bloating.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-abdominal-imaging-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-abdominal-pain-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-abnormal-liver-enzyme-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-alcohol-related-liver-risk-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-anal-fissure-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-appetite-loss-gi-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-ascites-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-belching-and-burping-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-biliary-colic-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-celiac-disease-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-celiac-screening-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-change-in-bowel-habit-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-chronic-nausea-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-constipation-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-crohn-disease-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-diarrhea-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-dyspepsia-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-dysphagia-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-early-satiety-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-fatty-liver-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-fecal-incontinence-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-fit-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-food-intolerance-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-functional-abdominal-pain-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-gallstone-symptom-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-h-pylori-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-hemorrhoid-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-hepatitis-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-ibs-symptom-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-inflammatory-bowel-disease-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-iron-deficiency-gi-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-jaundice-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-lactose-intolerance-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-liver-ultrasound-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-medication-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-nausea-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-nsaid-gi-risk-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-nutritional-counseling-gi-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-pancreatitis-follow-up-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-perianal-symptoms-gi-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-portal-hypertension-clinic-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-post-cholecystectomy-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-post-gastroenteritis-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-post-gi-admission-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-rectal-bleeding-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-reflux-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-ulcerative-colitis-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-vomiting-follow-up.research.json` | mapping removal |
| `clinical-expansion-v2/research/gi-weight-loss-gi-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-abdominal-bloating.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-abdominal-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-abnormal-kidney-function-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-abnormal-liver-enzyme-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-alcohol-intake-documentation.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-allergic-symptoms.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-allergy-list-update.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-anal-itching.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-anemia-result-review.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-appetite-loss.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-axillary-lump.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-b12-deficiency-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-bite-or-sting-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-blood-pressure-device-technique-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-breast-pain.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-bruising-tendency.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-caffeine-intake-documentation.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-care-coordination-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-caregiver-stress.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-caregiver-support-documentation.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-chest-discomfort-non-acute-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-chest-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-cholesterol-result-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-chronic-disease-annual-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-chronic-pain-medication-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-cold-intolerance.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-cold.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-constipation-follow-up-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-constipation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-cough-follow-up-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-cough.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-diabetes-annual-care-documentation.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-diabetes-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-diarrhea-follow-up-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-diarrhea.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-dietary-counseling-documentation.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-dizziness-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-dizziness.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-domestic-safety-screening-documentation.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-driving-medical-form.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-dyslipidemia-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-dyspepsia-follow-up-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-dyspepsia.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-dysuria.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-epistaxis-review-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-excessive-sweating.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-exercise-counseling-documentation.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-falls-risk-screening.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-family-history-risk-review.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-fatigue.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-fever-follow-up.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-fever-urti.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-financial-stress-health-impact.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-fitness-to-work-review.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-foot-numbness.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-frequency-urgency.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-general-weakness.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-general-wellness-review.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-halitosis.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-headache-follow-up-in-gp.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-headache.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-health-anxiety-documentation.research.json` | unrelated-metadata cleanup |
| `clinical-expansion-v2/research/gp-heat-intolerance.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-hemorrhoid-symptoms.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-home-blood-pressure-log-review.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-hypertension-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-lab-result-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-lab-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-lifestyle-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-medication-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-nausea.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-palpitations.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-rash.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-results-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-shortness-of-breath.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-smoking-cessation.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-sore-throat.research.json` | UAE applicability correction |
| `clinical-expansion-v2/research/gp-thyroid-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-urinary-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-viral-illness.research.json` | mapping removal |
| `clinical-expansion-v2/research/gp-weight-management.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-acute-sprain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-ankle-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-fracture-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-hip-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-knee-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-low-back-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-neck-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-osteoarthritis-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-post-op-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-shoulder-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-sports-injury.research.json` | mapping removal |
| `clinical-expansion-v2/research/msk-wrist-hand-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/neph-ckd-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/neph-proteinuria.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-dizziness.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-headache.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-memory-concern.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-migraine-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-neuropathy-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-numbness-tingling.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-seizure-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-stroke-tia-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-tremor.research.json` | mapping removal |
| `clinical-expansion-v2/research/neuro-weakness.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-antenatal-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-contraception.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-dysmenorrhea.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-early-pregnancy.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-fertility.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-irregular-bleeding.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-menopause.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-pelvic-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-postnatal-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/obgyn-vaginal-discharge.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-allergic-conjunctivitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-blepharitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-cataract-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-conjunctivitis.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-dry-eye.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-foreign-body-sensation.research.json` | mapping removal |
| `clinical-expansion-v2/research/oph-stye.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-contact-lens-complaint.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-eye-discharge.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-eye-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-eye-trauma.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-red-eye.research.json` | mapping removal |
| `clinical-expansion-v2/research/ophth-vision-change.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-abdominal-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-cough.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-development-concern.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-ear-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-fever.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-growth-concern.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-poor-feeding.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-rash.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-routine-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-vaccination.research.json` | mapping removal |
| `clinical-expansion-v2/research/peds-vomiting-diarrhea.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-anxiety.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-insomnia.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-low-mood.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-medication-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-panic-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-sleep-difficulty.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-stress-reaction.research.json` | mapping removal |
| `clinical-expansion-v2/research/psych-stress-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-asthma-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-chronic-cough.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-copd-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-dyspnea.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-hemoptysis-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-pneumonia-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-pulmonary-function-review.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-sleep-apnea-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-smoking-history-note.research.json` | mapping removal |
| `clinical-expansion-v2/research/resp-wheeze.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-abdominal-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-allergic-reaction.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-burn-assessment.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-chest-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-fever-suspected-infection.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-head-injury.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-minor-trauma.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-shortness-of-breath.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-syncope.research.json` | mapping removal |
| `clinical-expansion-v2/research/urgent-wound-care-laceration.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-dysuria-uti-symptoms.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-flank-pain.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-frequency-urgency.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-hematuria.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-luts-bph.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-renal-colic-followup.research.json` | mapping removal |
| `clinical-expansion-v2/research/uro-urinary-retention-documentation.research.json` | mapping removal |
| `clinical-expansion-v2/review/unsupported_legacy_items.jsonl` | unsupported-item accounting |
| `clinical-expansion-v2/workflows/anes-airway-plan-documentation-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-airway-review-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-allergy-clarification.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-asa-status-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-blood-product-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-chronic-pain-pre-op-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-clinic-referral-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-consent-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-day-surgery-anesthesia-screening.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-difficult-airway-history-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-equipment-issue-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-family-history-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-fasting-status-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-handover-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-intraoperative-event-documentation-prompt.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-line-placement-documentation-prompt.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-malignant-hyperthermia-history-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-medication-allergy-review-anesthesia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-medication-reconciliation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-neuraxial-anesthesia-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-obstructive-sleep-apnea-anesthesia-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-airway-observation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-delirium-observation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-discharge-criteria-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-hemodynamic-observation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-hypothermia-observation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-nausea-vomiting-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pacu-pain-score-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-alcohol-use-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-goals-of-care-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-interpreter-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-medication-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-opioid-use-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-perioperative-smoking-status-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-plan-documentation-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-anesthesia-recovery-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-op-anesthesia-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-op-nausea-risk-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-operative-pain-service-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-operative-respiratory-concern-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-sedation-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-post-spinal-headache-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-anticoagulation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-cardiac-risk-documentation-anesthesia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-comorbidity-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-diabetes-documentation-anesthesia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-frailty-anesthesia-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-geriatric-anesthesia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-obesity-anesthesia-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-pediatric-anesthesia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-pregnancy-status-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-op-respiratory-risk-documentation-anesthesia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-pre-operative-anesthesia-assessment.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-previous-awareness-under-anesthesia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-prior-anesthesia-complication-history.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-procedural-sedation-documentation-prompts.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-procedure-note-documentation-prompt.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-regional-anesthesia-documentation-prompts.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-regional-block-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-risk-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-safety-net-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/anes-sedation-recovery-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-af-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-ambulatory-blood-pressure-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-anticoagulation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-atypical-chest-discomfort-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-blood-pressure-device-technique-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-bradycardia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-cardiac-rehabilitation-progress-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-cardiac-risk-review-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-chest-pain-non-acute-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-chest-pain-safety-net-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-chest-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-diabetes-cardiac-risk-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-dizziness-cardiac-screening-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-doac-review-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-dyspnea-cardiac-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-dyspnea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-ecg-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-echocardiogram-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-edema-cardiac-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-exercise-test-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-family-history-cardiac-risk.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-heart-failure-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-heart-failure-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-holter-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-home-blood-pressure-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-hypertension-annual-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-hypertension-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-icd-clinic-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-kidney-disease-cardiac-risk-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-leg-swelling-differential-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-lifestyle-counseling-cardiac-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-lipid-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-lipid-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-medication-adherence-hypertension-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-medication-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-murmur-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-orthostatic-bp-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-pacemaker-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-palpitations-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-palpitations-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-palpitations.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-post-cabg-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-post-cardiology-admission-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-post-pci-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-post-pci-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-pre-operative-cardiac-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-presyncope-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-pvc-symptom-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-smoking-status-cardiac-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-stable-angina-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-statin-tolerance-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-syncope-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-syncope.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-tachycardia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-valvular-disease-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-warfarin-inr-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/cardio-white-coat-hypertension-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-acne-scar-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-acne.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-alopecia-areata-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-burn-scar-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-cellulitis-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-contact-allergen-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-contact-dermatitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-dandruff-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-dermatology-medication-monitoring.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-diabetic-foot-skin-check.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-eczema-flare-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-eczema.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-fungal-infection.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-fungal-nail-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-fungal-nail-infection.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-hair-loss.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-hand-dermatitis-occupational-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-hidradenitis-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-hypertrophic-scar-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-impetigo-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-insect-bite-skin-reaction.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-keloid-scar-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-leg-ulcer-skin-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-medication-rash-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-mole-mapping-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-molluscum-contagiosum-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-nail-psoriasis-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-nevus-change-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-patch-test-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-pediatric-eczema-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-perioral-dermatitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-periorbital-skin-rash.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-pigmented-lesion-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-plantar-wart-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-post-biopsy-wound-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-post-excision-wound-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-pressure-area-skin-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-pressure-ulcer-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-pruritus-without-rash.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-psoriasis-flare-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-psoriasis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-rash.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-rosacea-flare-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-rosacea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-scabies-contact-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-scalp-scaling.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-seborrheic-dermatitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-skin-cancer-surveillance.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-skin-infection-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-skin-lesion-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-stasis-dermatitis-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-tinea-corporis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-tinea-pedis-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-urticaria-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-urticaria.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-venous-eczema-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-vitiligo.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-wart-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-warts.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/derm-wound-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-abdominal-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-allergic-reaction-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-altered-mental-status-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-anaphylaxis-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-asthma-exacerbation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-back-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-blood-test-result-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-burn-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-capacity-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-chest-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-copd-exacerbation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-diarrhea-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-discharge-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-dizziness-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-domestic-violence-screening-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-eye-injury-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-fall-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-fever-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-fracture-suspicion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-handover-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-headache-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-imaging-result-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-laceration-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-mental-health-presentation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-minor-head-injury-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-observation-unit-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-overdose-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-patient-declined-care-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-pediatric-fever-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-pediatric-injury-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-pelvic-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-pregnancy-bleeding-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-procedural-sedation-documentation-prompt.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-procedure-note-documentation-prompt.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-referral-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-renal-colic-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-safeguarding-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-safety-net-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-seizure-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-self-harm-documentation-prompts.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-shortness-of-breath-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-sprain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-syncope-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-transfer-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-triage-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-violence-aggression-incident-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-vomiting-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ed-wound-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-adrenal-incidentaloma-referral.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-adrenal-incidentaloma-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-b12-deficiency-endocrine-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-bone-density-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-calcium-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-continuous-glucose-monitor-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetes-annual-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetes-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetes-medication-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetes-technology-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetic-eye-screening-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetic-foot-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-diabetic-kidney-screening-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-erectile-dysfunction-endocrine-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-fracture-risk-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-goiter-symptom-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hba1c-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hirsutism-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-home-glucose-log-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hyperglycemia-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hyperthyroidism-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hyperthyroidism-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hypoglycemia-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hypothyroidism-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-hypothyroidism-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-infertility-hormone-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-insulin-initiation-documentation-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-lipid-disorder-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-menopause-metabolic-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-obesity-counseling-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-osteoporosis-endocrine-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-osteoporosis-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-pcos-metabolic-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-pituitary-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-pituitary-symptoms-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-prediabetes-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-prediabetes-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-prolactin-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-short-stature-endocrine-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-testosterone-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-thyroid-function-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-thyroid-nodule-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-thyroid-nodule-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-thyroid-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/endo-weight-management-endocrine-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-adenoid-symptom-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-allergic-rhinitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-audiology-referral-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-balance-clinic-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-bppv-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-cerumen-impaction.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-cerumen-recurrence-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-chronic-cough-ent-contribution.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-chronic-rhinitis-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-chronic-sinus-symptom-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-dizziness-vertigo.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-dysphonia-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-canal-itching.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-discharge-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-fullness.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-pain-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-ear-tube-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-epistaxis-recurrence-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-eustachian-tube-dysfunction.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-facial-pressure-ent-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-glue-ear-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-hearing-aid-issue.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-hearing-complaint.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-hearing-test-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-hoarseness-red-flag-screening.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-hoarseness.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-mouth-breathing.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-nasal-allergy-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-nasal-congestion.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-nasal-crusting.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-nasal-polyp-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-neck-mass-ent-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-non-allergic-rhinitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-nosebleed-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-oral-lesion-ent-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-otitis-externa-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-otitis-externa.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-perforated-eardrum-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-post-tonsillectomy-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-postnasal-drip.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-recurrent-otitis-media-history.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-recurrent-tonsillitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-sinus-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-sinusitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-sleep-disordered-breathing-ent-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-snoring-ent-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-sore-throat.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-sudden-hearing-change-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-swallowing-symptom-ent-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-throat-clearing.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-tinnitus-impact-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-tinnitus.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-tongue-lesion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-tonsil-size-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-unilateral-nasal-obstruction-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-vertigo-episode-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-vocal-cord-lesion-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-voice-complaint.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ent-voice-strain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-abdominal-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-constipation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-diarrhea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-dysphagia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-gerd.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-ibs-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-jaundice-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-liver-enzyme-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-post-endoscopy-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gastro-rectal-bleeding.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-activities-of-daily-living-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-advance-care-planning-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-caregiver-support-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-cognitive-decline-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-comprehensive-geriatric-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-delirium-follow-up-after-discharge.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-dementia-care-planning-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-driving-safety-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-falls-prevention-counseling-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-falls-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-frailty-review-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-functional-status-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-goals-of-care-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-hearing-impairment-geriatric-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-home-safety-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-medication-deprescribing-discussion-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-mobility-limitation-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-mood-screening.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-nutrition-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-osteoporosis-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-polypharmacy-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-post-hospital-geriatric-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-pressure-area-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-sleep-issue-in-older-adult.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-social-isolation-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-vision-impairment-geriatric-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-walking-aid-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/geri-weight-loss-in-older-adult.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-abdominal-bloating.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-abdominal-imaging-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-abdominal-pain-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-abnormal-liver-enzyme-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-alcohol-related-liver-risk-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-anal-fissure-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-appetite-loss-gi-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-ascites-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-belching-and-burping-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-biliary-colic-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-celiac-disease-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-celiac-screening-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-change-in-bowel-habit-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-chronic-nausea-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-constipation-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-crohn-disease-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-diarrhea-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-dyspepsia-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-dysphagia-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-early-satiety-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-fatty-liver-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-fecal-incontinence-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-fit-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-food-intolerance-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-functional-abdominal-pain-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-gallstone-symptom-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-h-pylori-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-hemorrhoid-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-hepatitis-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-ibs-symptom-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-inflammatory-bowel-disease-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-iron-deficiency-gi-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-jaundice-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-lactose-intolerance-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-liver-ultrasound-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-medication-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-nausea-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-nsaid-gi-risk-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-nutritional-counseling-gi-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-pancreatitis-follow-up-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-perianal-symptoms-gi-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-portal-hypertension-clinic-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-post-cholecystectomy-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-post-gastroenteritis-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-post-gi-admission-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-rectal-bleeding-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-reflux-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-ulcerative-colitis-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-vomiting-follow-up.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gi-weight-loss-gi-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-abdominal-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-chest-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-cold.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-constipation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-diabetes-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-diarrhea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-dyslipidemia-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-dyspepsia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-dysuria.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-fatigue.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-frequency-urgency.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-hypertension-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-lab-result-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-lab-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-lifestyle-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-medication-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-nausea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-palpitations.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-rash.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-results-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-shortness-of-breath.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-smoking-cessation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-thyroid-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-urinary-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-viral-illness.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/gp-weight-management.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-acute-sprain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-ankle-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-fracture-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-hip-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-knee-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-low-back-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-neck-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-osteoarthritis-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-post-op-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-shoulder-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-sports-injury.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/msk-wrist-hand-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neph-ckd-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neph-proteinuria.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-dizziness.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-headache.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-memory-concern.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-migraine-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-neuropathy-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-numbness-tingling.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-seizure-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-stroke-tia-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-tremor.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/neuro-weakness.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-antenatal-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-contraception.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-dysmenorrhea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-early-pregnancy.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-fertility.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-irregular-bleeding.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-menopause.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-pelvic-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-postnatal-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/obgyn-vaginal-discharge.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-allergic-conjunctivitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-blepharitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-cataract-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-conjunctivitis.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-dry-eye.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-foreign-body-sensation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/oph-stye.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-contact-lens-complaint.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-eye-discharge.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-eye-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-eye-trauma.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-red-eye.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/ophth-vision-change.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-abdominal-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-cough.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-development-concern.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-ear-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-fever.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-growth-concern.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-poor-feeding.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-rash.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-routine-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-vaccination.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/peds-vomiting-diarrhea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-anxiety.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-insomnia.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-low-mood.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-medication-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-panic-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-sleep-difficulty.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-stress-reaction.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/psych-stress-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-asthma-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-chronic-cough.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-copd-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-dyspnea.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-hemoptysis-documentation.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-pneumonia-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-pulmonary-function-review.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-sleep-apnea-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-smoking-history-note.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/resp-wheeze.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-abdominal-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-allergic-reaction.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-burn-assessment.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-chest-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-fever-suspected-infection.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-head-injury.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-minor-trauma.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-shortness-of-breath.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-syncope.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/urgent-wound-care-laceration.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-dysuria-uti-symptoms.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-flank-pain.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-frequency-urgency.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-hematuria.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-luts-bph.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-renal-colic-followup.json` | workflow support accounting |
| `clinical-expansion-v2/workflows/uro-urinary-retention-documentation.json` | workflow support accounting |
| `package.json` | test |
| `scripts/source-first/applyResearchBatch.mjs` | runtime reconciliation |
| `scripts/source-first/auditExplicitMappingContract.mjs` | guard hardening |
| `scripts/source-first/auditExplicitMappingContract.test.mjs` | test |
| `scripts/source-first/auditGlobalMappingCorrectionSecondPass.mjs` | test |
| `scripts/source-first/batches/gpBatchSupport.mjs` | runtime reconciliation |
| `scripts/source-first/batches/gpExplicitMappingContract.mjs` | guard hardening |
| `scripts/source-first/canonicalMappingLedger.mjs` | canonical-ledger architecture |
| `scripts/source-first/correctGlobalMappingArchitecture.mjs` | mapping removal |
| `scripts/source-first/globalMappingArchitecture.test.mjs` | test |
| `scripts/source-first/gpBatchSupportContract.test.mjs` | test |
| `scripts/source-first/runCheck.mjs` | UAE applicability correction |

## Appendix B — per-workflow reconciliation (all 1,500)

| Seq | Workflow | Specialty | Legacy | Supported before | Supported now | Unsupported before | Unsupported now | Status | Changed | Ledger/log/hash valid | Stale support |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| 1 | `gp-fever-urti` | General Medicine / GP | 127 | 0 | 0 | 127 | 127 | `partial_exact_source_verified` | no | yes | no |
| 2 | `gp-cough` | General Medicine / GP | 108 | 0 | 0 | 108 | 108 | `partial_exact_source_verified` | no | yes | no |
| 3 | `gp-sore-throat` | General Medicine / GP | 98 | 0 | 0 | 98 | 98 | `partial_exact_source_verified` | no | yes | no |
| 4 | `gp-headache` | General Medicine / GP | 99 | 0 | 0 | 99 | 99 | `partial_exact_source_verified` | no | yes | no |
| 5 | `gp-dizziness` | General Medicine / GP | 95 | 0 | 0 | 95 | 95 | `partial_exact_source_verified` | no | yes | no |
| 6 | `gp-fatigue` | General Medicine / GP | 102 | 43 | 0 | 59 | 102 | `partial_exact_source_verified` | yes | yes | no |
| 7 | `gp-abdominal-pain` | General Medicine / GP | 109 | 43 | 0 | 66 | 109 | `partial_exact_source_verified` | yes | yes | no |
| 8 | `gp-nausea` | General Medicine / GP | 87 | 38 | 0 | 49 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 9 | `gp-diarrhea` | General Medicine / GP | 87 | 46 | 0 | 41 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 10 | `gp-constipation` | General Medicine / GP | 86 | 33 | 0 | 53 | 86 | `partial_exact_source_verified` | yes | yes | no |
| 11 | `gp-chest-pain` | General Medicine / GP | 107 | 53 | 0 | 54 | 107 | `partial_exact_source_verified` | yes | yes | no |
| 12 | `gp-palpitations` | General Medicine / GP | 96 | 51 | 0 | 45 | 96 | `partial_exact_source_verified` | yes | yes | no |
| 13 | `gp-shortness-of-breath` | General Medicine / GP | 106 | 52 | 0 | 54 | 106 | `partial_exact_source_verified` | yes | yes | no |
| 14 | `gp-hypertension-followup` | General Medicine / GP | 94 | 48 | 0 | 46 | 94 | `partial_exact_source_verified` | yes | yes | no |
| 15 | `gp-diabetes-followup` | General Medicine / GP | 97 | 48 | 0 | 49 | 97 | `partial_exact_source_verified` | yes | yes | no |
| 16 | `gp-thyroid-followup` | General Medicine / GP | 81 | 23 | 0 | 58 | 81 | `partial_exact_source_verified` | yes | yes | no |
| 17 | `gp-dyslipidemia-followup` | General Medicine / GP | 75 | 21 | 0 | 54 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 18 | `gp-lab-result-review` | General Medicine / GP | 71 | 17 | 0 | 54 | 71 | `partial_exact_source_verified` | yes | yes | no |
| 19 | `peds-fever` | Pediatrics | 123 | 70 | 0 | 53 | 123 | `partial_exact_source_verified` | yes | yes | no |
| 20 | `peds-cough` | Pediatrics | 109 | 42 | 0 | 67 | 109 | `partial_exact_source_verified` | yes | yes | no |
| 21 | `peds-vomiting-diarrhea` | Pediatrics | 99 | 60 | 0 | 39 | 99 | `partial_exact_source_verified` | yes | yes | no |
| 22 | `peds-rash` | Pediatrics | 92 | 26 | 0 | 66 | 92 | `partial_exact_source_verified` | yes | yes | no |
| 23 | `peds-poor-feeding` | Pediatrics | 96 | 27 | 0 | 69 | 96 | `partial_exact_source_verified` | yes | yes | no |
| 24 | `peds-ear-pain` | Pediatrics | 87 | 26 | 0 | 61 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 25 | `peds-abdominal-pain` | Pediatrics | 94 | 56 | 0 | 38 | 94 | `partial_exact_source_verified` | yes | yes | no |
| 26 | `peds-routine-followup` | Pediatrics | 77 | 38 | 0 | 39 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 27 | `peds-vaccination` | Pediatrics | 73 | 48 | 0 | 25 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 28 | `peds-growth-concern` | Pediatrics | 87 | 48 | 0 | 39 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 29 | `peds-development-concern` | Pediatrics | 93 | 48 | 0 | 45 | 93 | `partial_exact_source_verified` | yes | yes | no |
| 30 | `peds-school-note` | Pediatrics | 76 | 0 | 0 | 76 | 76 | `no_authoritative_source_found` | no | yes | no |
| 31 | `obgyn-antenatal-followup` | OB/GYN | 117 | 74 | 0 | 43 | 117 | `partial_exact_source_verified` | yes | yes | no |
| 32 | `obgyn-pelvic-pain` | OB/GYN | 106 | 30 | 0 | 76 | 106 | `partial_exact_source_verified` | yes | yes | no |
| 33 | `obgyn-irregular-bleeding` | OB/GYN | 102 | 30 | 0 | 72 | 102 | `partial_exact_source_verified` | yes | yes | no |
| 34 | `obgyn-vaginal-discharge` | OB/GYN | 99 | 53 | 0 | 46 | 99 | `partial_exact_source_verified` | yes | yes | no |
| 35 | `obgyn-contraception` | OB/GYN | 64 | 43 | 0 | 21 | 64 | `partial_exact_source_verified` | yes | yes | no |
| 36 | `obgyn-dysmenorrhea` | OB/GYN | 83 | 53 | 0 | 30 | 83 | `partial_exact_source_verified` | yes | yes | no |
| 37 | `obgyn-postnatal-followup` | OB/GYN | 92 | 78 | 0 | 14 | 92 | `partial_exact_source_verified` | yes | yes | no |
| 38 | `obgyn-early-pregnancy` | OB/GYN | 97 | 69 | 0 | 28 | 97 | `partial_exact_source_verified` | yes | yes | no |
| 39 | `obgyn-menopause` | OB/GYN | 73 | 48 | 0 | 25 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 40 | `obgyn-fertility` | OB/GYN | 75 | 50 | 0 | 25 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 41 | `msk-low-back-pain` | Orthopedics / MSK | 108 | 67 | 0 | 41 | 108 | `partial_exact_source_verified` | yes | yes | no |
| 42 | `msk-neck-pain` | Orthopedics / MSK | 87 | 62 | 0 | 25 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 43 | `msk-knee-pain` | Orthopedics / MSK | 105 | 53 | 0 | 52 | 105 | `partial_exact_source_verified` | yes | yes | no |
| 44 | `msk-shoulder-pain` | Orthopedics / MSK | 88 | 58 | 0 | 30 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 45 | `msk-hip-pain` | Orthopedics / MSK | 83 | 48 | 0 | 35 | 83 | `partial_exact_source_verified` | yes | yes | no |
| 46 | `msk-ankle-pain` | Orthopedics / MSK | 85 | 56 | 0 | 29 | 85 | `partial_exact_source_verified` | yes | yes | no |
| 47 | `msk-wrist-hand-pain` | Orthopedics / MSK | 83 | 56 | 0 | 27 | 83 | `partial_exact_source_verified` | yes | yes | no |
| 48 | `msk-acute-sprain` | Orthopedics / MSK | 79 | 67 | 0 | 12 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 49 | `msk-fracture-followup` | Orthopedics / MSK | 75 | 43 | 0 | 32 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 50 | `msk-post-op-followup` | Orthopedics / MSK | 92 | 71 | 0 | 21 | 92 | `partial_exact_source_verified` | yes | yes | no |
| 51 | `msk-osteoarthritis-followup` | Orthopedics / MSK | 67 | 46 | 0 | 21 | 67 | `partial_exact_source_verified` | yes | yes | no |
| 52 | `msk-sports-injury` | Orthopedics / MSK | 79 | 67 | 0 | 12 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 53 | `ent-ear-pain` | ENT | 95 | 72 | 0 | 23 | 95 | `partial_exact_source_verified` | yes | yes | no |
| 54 | `ent-hearing-complaint` | ENT | 88 | 71 | 0 | 17 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 55 | `ent-tinnitus` | ENT | 77 | 54 | 0 | 23 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 56 | `ent-dizziness-vertigo` | ENT | 98 | 69 | 0 | 29 | 98 | `partial_exact_source_verified` | yes | yes | no |
| 57 | `ent-nasal-congestion` | ENT | 88 | 59 | 0 | 29 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 58 | `ent-sinus-symptoms` | ENT | 89 | 69 | 0 | 20 | 89 | `partial_exact_source_verified` | yes | yes | no |
| 59 | `ent-sore-throat` | ENT | 101 | 80 | 0 | 21 | 101 | `partial_exact_source_verified` | yes | yes | no |
| 60 | `ent-voice-complaint` | ENT | 90 | 54 | 0 | 36 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 61 | `derm-rash` | Dermatology | 103 | 82 | 0 | 21 | 103 | `partial_exact_source_verified` | yes | yes | no |
| 62 | `derm-acne` | Dermatology | 90 | 56 | 0 | 34 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 63 | `derm-eczema` | Dermatology | 90 | 75 | 0 | 15 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 64 | `derm-fungal-infection` | Dermatology | 94 | 63 | 0 | 31 | 94 | `partial_exact_source_verified` | yes | yes | no |
| 65 | `derm-urticaria` | Dermatology | 88 | 48 | 0 | 40 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 66 | `derm-wound-review` | Dermatology | 94 | 54 | 0 | 40 | 94 | `partial_exact_source_verified` | yes | yes | no |
| 67 | `derm-skin-lesion-review` | Dermatology | 98 | 47 | 0 | 51 | 98 | `partial_exact_source_verified` | yes | yes | no |
| 68 | `derm-hair-loss` | Dermatology | 101 | 51 | 0 | 50 | 101 | `partial_exact_source_verified` | yes | yes | no |
| 69 | `ophth-red-eye` | Ophthalmology | 98 | 75 | 0 | 23 | 98 | `partial_exact_source_verified` | yes | yes | no |
| 70 | `ophth-eye-pain` | Ophthalmology | 94 | 63 | 0 | 31 | 94 | `partial_exact_source_verified` | yes | yes | no |
| 71 | `ophth-vision-change` | Ophthalmology | 93 | 46 | 0 | 47 | 93 | `partial_exact_source_verified` | yes | yes | no |
| 72 | `ophth-eye-discharge` | Ophthalmology | 87 | 68 | 0 | 19 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 73 | `ophth-contact-lens-complaint` | Ophthalmology | 88 | 60 | 0 | 28 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 74 | `ophth-eye-trauma` | Ophthalmology | 95 | 71 | 0 | 24 | 95 | `partial_exact_source_verified` | yes | yes | no |
| 75 | `psych-anxiety` | Psychiatry / Mental Health | 106 | 52 | 0 | 54 | 106 | `partial_exact_source_verified` | yes | yes | no |
| 76 | `psych-low-mood` | Psychiatry / Mental Health | 102 | 89 | 0 | 13 | 102 | `partial_exact_source_verified` | yes | yes | no |
| 77 | `psych-sleep-difficulty` | Psychiatry / Mental Health | 90 | 82 | 0 | 8 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 78 | `psych-stress-symptoms` | Psychiatry / Mental Health | 98 | 81 | 0 | 17 | 98 | `partial_exact_source_verified` | yes | yes | no |
| 79 | `psych-panic-symptoms` | Psychiatry / Mental Health | 103 | 53 | 0 | 50 | 103 | `partial_exact_source_verified` | yes | yes | no |
| 80 | `psych-medication-followup` | Psychiatry / Mental Health | 103 | 78 | 0 | 25 | 103 | `partial_exact_source_verified` | yes | yes | no |
| 81 | `urgent-minor-trauma` | Emergency / Urgent Care | 85 | 68 | 0 | 17 | 85 | `partial_exact_source_verified` | yes | yes | no |
| 82 | `urgent-wound-care-laceration` | Emergency / Urgent Care | 90 | 63 | 0 | 27 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 83 | `urgent-burn-assessment` | Emergency / Urgent Care | 84 | 72 | 0 | 12 | 84 | `partial_exact_source_verified` | yes | yes | no |
| 84 | `urgent-allergic-reaction` | Emergency / Urgent Care | 83 | 69 | 0 | 14 | 83 | `partial_exact_source_verified` | yes | yes | no |
| 85 | `urgent-head-injury` | Emergency / Urgent Care | 85 | 75 | 0 | 10 | 85 | `partial_exact_source_verified` | yes | yes | no |
| 86 | `urgent-chest-pain` | Emergency / Urgent Care | 80 | 48 | 0 | 32 | 80 | `partial_exact_source_verified` | yes | yes | no |
| 87 | `urgent-shortness-of-breath` | Emergency / Urgent Care | 82 | 54 | 0 | 28 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 88 | `urgent-abdominal-pain` | Emergency / Urgent Care | 88 | 61 | 0 | 27 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 89 | `urgent-syncope` | Emergency / Urgent Care | 80 | 65 | 0 | 15 | 80 | `partial_exact_source_verified` | yes | yes | no |
| 90 | `urgent-fever-suspected-infection` | Emergency / Urgent Care | 95 | 68 | 0 | 27 | 95 | `partial_exact_source_verified` | yes | yes | no |
| 91 | `cardio-chest-pain` | Cardiology | 99 | 56 | 0 | 43 | 99 | `partial_exact_source_verified` | yes | yes | no |
| 92 | `cardio-palpitations` | Cardiology | 54 | 32 | 0 | 22 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 93 | `cardio-hypertension-followup` | Cardiology | 57 | 45 | 0 | 12 | 57 | `partial_exact_source_verified` | yes | yes | no |
| 94 | `cardio-heart-failure-followup` | Cardiology | 65 | 54 | 0 | 11 | 65 | `partial_exact_source_verified` | yes | yes | no |
| 95 | `cardio-ecg-review` | Cardiology | 45 | 0 | 0 | 45 | 45 | `no_authoritative_source_found` | no | yes | no |
| 96 | `cardio-dyspnea` | Cardiology | 64 | 49 | 0 | 15 | 64 | `partial_exact_source_verified` | yes | yes | no |
| 97 | `cardio-lipid-followup` | Cardiology | 51 | 40 | 0 | 11 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 98 | `cardio-post-pci-followup` | Cardiology | 54 | 20 | 0 | 34 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 99 | `cardio-syncope` | Cardiology | 60 | 48 | 0 | 12 | 60 | `partial_exact_source_verified` | yes | yes | no |
| 100 | `cardio-murmur-documentation` | Cardiology | 54 | 40 | 0 | 14 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 101 | `neuro-headache` | Neurology | 100 | 47 | 0 | 53 | 100 | `partial_exact_source_verified` | yes | yes | no |
| 102 | `neuro-migraine-followup` | Neurology | 70 | 46 | 0 | 24 | 70 | `partial_exact_source_verified` | yes | yes | no |
| 103 | `neuro-seizure-followup` | Neurology | 75 | 56 | 0 | 19 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 104 | `neuro-dizziness` | Neurology | 90 | 73 | 0 | 17 | 90 | `partial_exact_source_verified` | yes | yes | no |
| 105 | `neuro-weakness` | Neurology | 84 | 30 | 0 | 54 | 84 | `partial_exact_source_verified` | yes | yes | no |
| 106 | `neuro-numbness-tingling` | Neurology | 81 | 34 | 0 | 47 | 81 | `partial_exact_source_verified` | yes | yes | no |
| 107 | `neuro-tremor` | Neurology | 77 | 25 | 0 | 52 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 108 | `neuro-neuropathy-followup` | Neurology | 75 | 37 | 0 | 38 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 109 | `neuro-stroke-tia-followup` | Neurology | 84 | 33 | 0 | 51 | 84 | `partial_exact_source_verified` | yes | yes | no |
| 110 | `neuro-memory-concern` | Neurology | 81 | 51 | 0 | 30 | 81 | `partial_exact_source_verified` | yes | yes | no |
| 111 | `resp-asthma-followup` | Respiratory / Pulmonology | 85 | 57 | 0 | 28 | 85 | `partial_exact_source_verified` | yes | yes | no |
| 112 | `resp-copd-followup` | Respiratory / Pulmonology | 76 | 41 | 0 | 35 | 76 | `partial_exact_source_verified` | yes | yes | no |
| 113 | `resp-chronic-cough` | Respiratory / Pulmonology | 75 | 47 | 0 | 28 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 114 | `resp-dyspnea` | Respiratory / Pulmonology | 82 | 61 | 0 | 21 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 115 | `resp-wheeze` | Respiratory / Pulmonology | 73 | 50 | 0 | 23 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 116 | `resp-pneumonia-followup` | Respiratory / Pulmonology | 72 | 47 | 0 | 25 | 72 | `partial_exact_source_verified` | yes | yes | no |
| 117 | `resp-sleep-apnea-symptoms` | Respiratory / Pulmonology | 73 | 46 | 0 | 27 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 118 | `resp-hemoptysis-documentation` | Respiratory / Pulmonology | 76 | 32 | 0 | 44 | 76 | `partial_exact_source_verified` | yes | yes | no |
| 119 | `resp-smoking-history-note` | Respiratory / Pulmonology | 69 | 36 | 0 | 33 | 69 | `partial_exact_source_verified` | yes | yes | no |
| 120 | `resp-pulmonary-function-review` | Respiratory / Pulmonology | 67 | 36 | 0 | 31 | 67 | `partial_exact_source_verified` | yes | yes | no |
| 121 | `gastro-gerd` | Gastroenterology | 82 | 38 | 0 | 44 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 122 | `gastro-abdominal-pain` | Gastroenterology | 82 | 53 | 0 | 29 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 123 | `gastro-ibs-symptoms` | Gastroenterology | 74 | 33 | 0 | 41 | 74 | `partial_exact_source_verified` | yes | yes | no |
| 124 | `gastro-constipation` | Gastroenterology | 69 | 29 | 0 | 40 | 69 | `partial_exact_source_verified` | yes | yes | no |
| 125 | `gastro-diarrhea` | Gastroenterology | 74 | 48 | 0 | 26 | 74 | `partial_exact_source_verified` | yes | yes | no |
| 126 | `gastro-rectal-bleeding` | Gastroenterology | 72 | 37 | 0 | 35 | 72 | `partial_exact_source_verified` | yes | yes | no |
| 127 | `gastro-liver-enzyme-review` | Gastroenterology | 71 | 35 | 0 | 36 | 71 | `partial_exact_source_verified` | yes | yes | no |
| 128 | `gastro-jaundice-documentation` | Gastroenterology | 75 | 23 | 0 | 52 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 129 | `gastro-dysphagia` | Gastroenterology | 68 | 26 | 0 | 42 | 68 | `partial_exact_source_verified` | yes | yes | no |
| 130 | `gastro-post-endoscopy-followup` | Gastroenterology | 69 | 24 | 0 | 45 | 69 | `partial_exact_source_verified` | yes | yes | no |
| 131 | `endo-diabetes-followup` | Endocrinology | 95 | 62 | 0 | 33 | 95 | `partial_exact_source_verified` | yes | yes | no |
| 132 | `endo-thyroid-symptoms` | Endocrinology | 75 | 31 | 0 | 44 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 133 | `endo-hypothyroidism-followup` | Endocrinology | 69 | 23 | 0 | 46 | 69 | `partial_exact_source_verified` | yes | yes | no |
| 134 | `endo-hyperthyroidism-followup` | Endocrinology | 74 | 19 | 0 | 55 | 74 | `partial_exact_source_verified` | yes | yes | no |
| 135 | `endo-obesity-counseling-documentation` | Endocrinology | 68 | 33 | 0 | 35 | 68 | `partial_exact_source_verified` | yes | yes | no |
| 136 | `endo-hypoglycemia-review` | Endocrinology | 72 | 47 | 0 | 25 | 72 | `partial_exact_source_verified` | yes | yes | no |
| 137 | `endo-pcos-metabolic-review` | Endocrinology | 71 | 33 | 0 | 38 | 71 | `partial_exact_source_verified` | yes | yes | no |
| 138 | `endo-osteoporosis-followup` | Endocrinology | 73 | 29 | 0 | 44 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 139 | `endo-adrenal-incidentaloma-referral` | Endocrinology | 66 | 34 | 0 | 32 | 66 | `partial_exact_source_verified` | yes | yes | no |
| 140 | `endo-pituitary-symptoms-documentation` | Endocrinology | 67 | 32 | 0 | 35 | 67 | `partial_exact_source_verified` | yes | yes | no |
| 141 | `uro-dysuria-uti-symptoms` | Urology / Nephrology | 88 | 43 | 0 | 45 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 142 | `uro-hematuria` | Urology / Nephrology | 74 | 40 | 0 | 34 | 74 | `partial_exact_source_verified` | yes | yes | no |
| 143 | `uro-luts-bph` | Urology / Nephrology | 78 | 52 | 0 | 26 | 78 | `partial_exact_source_verified` | yes | yes | no |
| 144 | `uro-renal-colic-followup` | Urology / Nephrology | 72 | 15 | 0 | 57 | 72 | `partial_exact_source_verified` | yes | yes | no |
| 145 | `uro-urinary-retention-documentation` | Urology / Nephrology | 70 | 34 | 0 | 36 | 70 | `partial_exact_source_verified` | yes | yes | no |
| 146 | `uro-flank-pain` | Urology / Nephrology | 76 | 34 | 0 | 42 | 76 | `partial_exact_source_verified` | yes | yes | no |
| 147 | `uro-frequency-urgency` | Urology / Nephrology | 71 | 39 | 0 | 32 | 71 | `partial_exact_source_verified` | yes | yes | no |
| 148 | `neph-ckd-followup` | Urology / Nephrology | 75 | 38 | 0 | 37 | 75 | `partial_exact_source_verified` | yes | yes | no |
| 149 | `neph-proteinuria` | Urology / Nephrology | 71 | 31 | 0 | 40 | 71 | `partial_exact_source_verified` | yes | yes | no |
| 150 | `neph-electrolyte-abnormality-review` | Urology / Nephrology | 72 | 0 | 0 | 72 | 72 | `no_authoritative_source_found` | no | yes | no |
| 151 | `ent-allergic-rhinitis` | ENT | 79 | 53 | 0 | 26 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 152 | `ent-cerumen-impaction` | ENT | 82 | 52 | 0 | 30 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 153 | `oph-conjunctivitis` | Ophthalmology | 78 | 65 | 0 | 13 | 78 | `partial_exact_source_verified` | yes | yes | no |
| 154 | `oph-dry-eye` | Ophthalmology | 81 | 60 | 0 | 21 | 81 | `partial_exact_source_verified` | yes | yes | no |
| 155 | `gp-medication-review` | General Medicine / GP | 62 | 36 | 0 | 26 | 62 | `partial_exact_source_verified` | yes | yes | no |
| 156 | `gp-lab-review` | General Medicine / GP | 62 | 14 | 0 | 48 | 62 | `partial_exact_source_verified` | yes | yes | no |
| 157 | `ent-sinusitis` | ENT | 79 | 61 | 0 | 18 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 158 | `ent-otitis-externa` | ENT | 86 | 46 | 0 | 40 | 86 | `partial_exact_source_verified` | yes | yes | no |
| 159 | `oph-stye` | Ophthalmology | 77 | 51 | 0 | 26 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 160 | `oph-blepharitis` | Ophthalmology | 77 | 57 | 0 | 20 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 161 | `ent-hoarseness` | ENT | 73 | 49 | 0 | 24 | 73 | `partial_exact_source_verified` | yes | yes | no |
| 162 | `oph-allergic-conjunctivitis` | Ophthalmology | 74 | 66 | 0 | 8 | 74 | `partial_exact_source_verified` | yes | yes | no |
| 163 | `derm-contact-dermatitis` | Dermatology | 70 | 57 | 0 | 13 | 70 | `partial_exact_source_verified` | yes | yes | no |
| 164 | `derm-tinea-corporis` | Dermatology | 68 | 33 | 0 | 35 | 68 | `partial_exact_source_verified` | yes | yes | no |
| 165 | `derm-seborrheic-dermatitis` | Dermatology | 68 | 59 | 0 | 9 | 68 | `partial_exact_source_verified` | yes | yes | no |
| 166 | `gp-smoking-cessation` | General Medicine / GP | 60 | 34 | 0 | 26 | 60 | `partial_exact_source_verified` | yes | yes | no |
| 167 | `gp-weight-management` | General Medicine / GP | 63 | 40 | 0 | 23 | 63 | `partial_exact_source_verified` | yes | yes | no |
| 168 | `gp-lifestyle-review` | General Medicine / GP | 60 | 19 | 0 | 41 | 60 | `partial_exact_source_verified` | yes | yes | no |
| 169 | `gp-results-review` | General Medicine / GP | 65 | 13 | 0 | 52 | 65 | `partial_exact_source_verified` | yes | yes | no |
| 170 | `ent-eustachian-tube-dysfunction` | ENT | 70 | 29 | 0 | 41 | 70 | `partial_exact_source_verified` | yes | yes | no |
| 171 | `oph-foreign-body-sensation` | Ophthalmology | 78 | 58 | 0 | 20 | 78 | `partial_exact_source_verified` | yes | yes | no |
| 172 | `psych-insomnia` | Psychiatry / Mental Health | 80 | 70 | 0 | 10 | 80 | `partial_exact_source_verified` | yes | yes | no |
| 173 | `psych-stress-reaction` | Psychiatry / Mental Health | 79 | 64 | 0 | 15 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 174 | `gp-dyspepsia` | General Medicine / GP | 87 | 42 | 0 | 45 | 87 | `partial_exact_source_verified` | yes | yes | no |
| 175 | `oph-cataract-followup` | Ophthalmology | 72 | 41 | 0 | 31 | 72 | `partial_exact_source_verified` | yes | yes | no |
| 176 | `gp-rash` | General Medicine / GP | 80 | 36 | 0 | 44 | 80 | `partial_exact_source_verified` | yes | yes | no |
| 177 | `gp-urinary-symptoms` | General Medicine / GP | 89 | 43 | 0 | 46 | 89 | `partial_exact_source_verified` | yes | yes | no |
| 178 | `gp-dysuria` | General Medicine / GP | 84 | 42 | 0 | 42 | 84 | `partial_exact_source_verified` | yes | yes | no |
| 179 | `gp-frequency-urgency` | General Medicine / GP | 88 | 47 | 0 | 41 | 88 | `partial_exact_source_verified` | yes | yes | no |
| 180 | `gp-viral-illness` | General Medicine / GP | 84 | 23 | 0 | 61 | 84 | `partial_exact_source_verified` | yes | yes | no |
| 181 | `gp-cold` | General Medicine / GP | 82 | 31 | 0 | 51 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 182 | `derm-psoriasis` | Dermatology | 82 | 29 | 0 | 53 | 82 | `partial_exact_source_verified` | yes | yes | no |
| 183 | `derm-rosacea` | Dermatology | 77 | 36 | 0 | 41 | 77 | `partial_exact_source_verified` | yes | yes | no |
| 184 | `derm-fungal-nail-infection` | Dermatology | 80 | 42 | 0 | 38 | 80 | `partial_exact_source_verified` | yes | yes | no |
| 185 | `derm-warts` | Dermatology | 79 | 45 | 0 | 34 | 79 | `partial_exact_source_verified` | yes | yes | no |
| 186 | `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 54 | 37 | 0 | 17 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 187 | `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 54 | 37 | 0 | 17 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 188 | `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 189 | `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 190 | `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 191 | `anes-chronic-pain-pre-op-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 192 | `anes-clinic-referral-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 193 | `anes-consent-discussion-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 194 | `anes-day-surgery-anesthesia-screening` | Anesthesia / Perioperative Medicine | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 195 | `anes-difficult-airway-history-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 196 | `anes-equipment-issue-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 197 | `anes-family-history-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 198 | `anes-fasting-status-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 199 | `anes-handover-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 200 | `anes-intraoperative-event-documentation-prompt` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 201 | `anes-line-placement-documentation-prompt` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 202 | `anes-malignant-hyperthermia-history-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 203 | `anes-medication-allergy-review-anesthesia` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 204 | `anes-medication-reconciliation` | Anesthesia / Perioperative Medicine | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 205 | `anes-neuraxial-anesthesia-follow-up` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 206 | `anes-obstructive-sleep-apnea-anesthesia-review` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 207 | `anes-pacu-airway-observation-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 208 | `anes-pacu-delirium-observation-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 209 | `anes-pacu-discharge-criteria-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 210 | `anes-pacu-hemodynamic-observation-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 211 | `anes-pacu-hypothermia-observation-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 212 | `anes-pacu-nausea-vomiting-documentation` | Anesthesia / Perioperative Medicine | 56 | 38 | 0 | 18 | 56 | `partial_exact_source_verified` | yes | yes | no |
| 213 | `anes-pacu-pain-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 214 | `anes-pacu-pain-score-review` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 215 | `anes-perioperative-alcohol-use-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 216 | `anes-perioperative-goals-of-care-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 217 | `anes-perioperative-interpreter-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 218 | `anes-perioperative-medication-review` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 219 | `anes-perioperative-opioid-use-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 220 | `anes-perioperative-smoking-status-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 221 | `anes-plan-documentation-review` | Anesthesia / Perioperative Medicine | 54 | 37 | 0 | 17 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 222 | `anes-post-anesthesia-recovery-documentation` | Anesthesia / Perioperative Medicine | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 223 | `anes-post-op-anesthesia-follow-up` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 224 | `anes-post-op-nausea-risk-documentation` | Anesthesia / Perioperative Medicine | 52 | 31 | 0 | 21 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 225 | `anes-post-operative-pain-service-review` | Anesthesia / Perioperative Medicine | 53 | 37 | 0 | 16 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 226 | `anes-post-operative-respiratory-concern-documentation` | Anesthesia / Perioperative Medicine | 52 | 8 | 0 | 44 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 227 | `anes-post-operative-sore-throat-anesthesia-follow-up` | Anesthesia / Perioperative Medicine | 53 | 0 | 0 | 53 | 53 | `no_authoritative_source_found` | no | yes | no |
| 228 | `anes-post-sedation-follow-up-documentation` | Anesthesia / Perioperative Medicine | 57 | 9 | 0 | 48 | 57 | `partial_exact_source_verified` | yes | yes | no |
| 229 | `anes-post-spinal-headache-documentation` | Anesthesia / Perioperative Medicine | 52 | 12 | 0 | 40 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 230 | `anes-pre-op-anticoagulation-documentation` | Anesthesia / Perioperative Medicine | 52 | 11 | 0 | 41 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 231 | `anes-pre-op-cardiac-risk-documentation-anesthesia` | Anesthesia / Perioperative Medicine | 52 | 11 | 0 | 41 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 232 | `anes-pre-op-comorbidity-documentation` | Anesthesia / Perioperative Medicine | 52 | 10 | 0 | 42 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 233 | `anes-pre-op-diabetes-documentation-anesthesia` | Anesthesia / Perioperative Medicine | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 234 | `anes-pre-op-frailty-anesthesia-review` | Anesthesia / Perioperative Medicine | 53 | 15 | 0 | 38 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 235 | `anes-pre-op-geriatric-anesthesia-documentation` | Anesthesia / Perioperative Medicine | 52 | 11 | 0 | 41 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 236 | `anes-pre-op-obesity-anesthesia-review` | Anesthesia / Perioperative Medicine | 53 | 15 | 0 | 38 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 237 | `anes-pre-op-pediatric-anesthesia-documentation` | Anesthesia / Perioperative Medicine | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 238 | `anes-pre-op-pregnancy-status-documentation` | Anesthesia / Perioperative Medicine | 52 | 10 | 0 | 42 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 239 | `anes-pre-op-respiratory-risk-documentation-anesthesia` | Anesthesia / Perioperative Medicine | 52 | 15 | 0 | 37 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 240 | `anes-pre-operative-anesthesia-assessment` | Anesthesia / Perioperative Medicine | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 241 | `anes-previous-awareness-under-anesthesia-documentation` | Anesthesia / Perioperative Medicine | 52 | 14 | 0 | 38 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 242 | `anes-prior-anesthesia-complication-history` | Anesthesia / Perioperative Medicine | 51 | 12 | 0 | 39 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 243 | `anes-procedural-sedation-documentation-prompts` | Anesthesia / Perioperative Medicine | 52 | 10 | 0 | 42 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 244 | `anes-procedure-note-documentation-prompt` | Anesthesia / Perioperative Medicine | 52 | 6 | 0 | 46 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 245 | `anes-pseudocholinesterase-deficiency-history-documentation` | Anesthesia / Perioperative Medicine | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 246 | `anes-regional-anesthesia-documentation-prompts` | Anesthesia / Perioperative Medicine | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 247 | `anes-regional-block-follow-up-documentation` | Anesthesia / Perioperative Medicine | 54 | 12 | 0 | 42 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 248 | `anes-risk-discussion-documentation` | Anesthesia / Perioperative Medicine | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 249 | `anes-safety-net-documentation` | Anesthesia / Perioperative Medicine | 52 | 9 | 0 | 43 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 250 | `anes-sedation-recovery-documentation` | Anesthesia / Perioperative Medicine | 52 | 11 | 0 | 41 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 251 | `cardio-af-follow-up` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 252 | `cardio-ambulatory-blood-pressure-result-review` | Cardiology outpatient | 53 | 24 | 0 | 29 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 253 | `cardio-anticoagulation-documentation` | Cardiology outpatient | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 254 | `cardio-atypical-chest-discomfort-documentation` | Cardiology outpatient | 55 | 34 | 0 | 21 | 55 | `partial_exact_source_verified` | yes | yes | no |
| 255 | `cardio-blood-pressure-device-technique-review` | Cardiology outpatient | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 256 | `cardio-bradycardia-documentation` | Cardiology outpatient | 51 | 34 | 0 | 17 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 257 | `cardio-cardiac-rehabilitation-progress-review` | Cardiology outpatient | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 258 | `cardio-cardiac-risk-review-documentation` | Cardiology outpatient | 56 | 26 | 0 | 30 | 56 | `partial_exact_source_verified` | yes | yes | no |
| 259 | `cardio-chest-pain-non-acute-follow-up` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 260 | `cardio-chest-pain-safety-net-documentation` | Cardiology outpatient | 51 | 19 | 0 | 32 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 261 | `cardio-diabetes-cardiac-risk-documentation` | Cardiology outpatient | 51 | 23 | 0 | 28 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 262 | `cardio-dizziness-cardiac-screening-documentation` | Cardiology outpatient | 54 | 29 | 0 | 25 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 263 | `cardio-doac-review-documentation` | Cardiology outpatient | 56 | 25 | 0 | 31 | 56 | `partial_exact_source_verified` | yes | yes | no |
| 264 | `cardio-dyspnea-cardiac-review` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 265 | `cardio-ecg-result-review` | Cardiology outpatient | 53 | 26 | 0 | 27 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 266 | `cardio-echocardiogram-result-review` | Cardiology outpatient | 53 | 34 | 0 | 19 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 267 | `cardio-edema-cardiac-review` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 268 | `cardio-exercise-test-result-review` | Cardiology outpatient | 53 | 34 | 0 | 19 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 269 | `cardio-family-history-cardiac-risk` | Cardiology outpatient | 50 | 27 | 0 | 23 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 270 | `cardio-heart-failure-follow-up` | Cardiology outpatient | 52 | 35 | 0 | 17 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 271 | `cardio-holter-result-review` | Cardiology outpatient | 53 | 33 | 0 | 20 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 272 | `cardio-home-blood-pressure-review` | Cardiology outpatient | 52 | 23 | 0 | 29 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 273 | `cardio-hypertension-annual-review` | Cardiology outpatient | 52 | 29 | 0 | 23 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 274 | `cardio-icd-clinic-documentation` | Cardiology outpatient | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 275 | `cardio-kidney-disease-cardiac-risk-documentation` | Cardiology outpatient | 51 | 24 | 0 | 27 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 276 | `cardio-leg-swelling-differential-documentation` | Cardiology outpatient | 54 | 26 | 0 | 28 | 54 | `partial_exact_source_verified` | yes | yes | no |
| 277 | `cardio-lifestyle-counseling-cardiac-documentation` | Cardiology outpatient | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 278 | `cardio-lipid-follow-up` | Cardiology outpatient | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 279 | `cardio-medication-adherence-hypertension-review` | Cardiology outpatient | 52 | 23 | 0 | 29 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 280 | `cardio-medication-review` | Cardiology outpatient | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 281 | `cardio-orthostatic-bp-documentation` | Cardiology outpatient | 51 | 20 | 0 | 31 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 282 | `cardio-pacemaker-follow-up-documentation` | Cardiology outpatient | 53 | 21 | 0 | 32 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 283 | `cardio-palpitations-follow-up` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 284 | `cardio-palpitations-review` | Cardiology outpatient | 52 | 33 | 0 | 19 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 285 | `cardio-post-cabg-follow-up` | Cardiology outpatient | 52 | 31 | 0 | 21 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 286 | `cardio-post-cardiology-admission-follow-up` | Cardiology outpatient | 52 | 35 | 0 | 17 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 287 | `cardio-post-pci-follow-up` | Cardiology outpatient | 52 | 34 | 0 | 18 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 288 | `cardio-pre-operative-cardiac-review` | Cardiology outpatient | 52 | 37 | 0 | 15 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 289 | `cardio-pregnancy-cardiac-history-documentation` | Cardiology outpatient | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 290 | `cardio-presyncope-documentation` | Cardiology outpatient | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 291 | `cardio-pvc-symptom-review` | Cardiology outpatient | 52 | 35 | 0 | 17 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 292 | `cardio-referral-documentation` | Cardiology outpatient | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 293 | `cardio-smoking-status-cardiac-review` | Cardiology outpatient | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 294 | `cardio-stable-angina-follow-up` | Cardiology outpatient | 52 | 37 | 0 | 15 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 295 | `cardio-statin-tolerance-documentation` | Cardiology outpatient | 51 | 23 | 0 | 28 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 296 | `cardio-syncope-follow-up` | Cardiology outpatient | 52 | 37 | 0 | 15 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 297 | `cardio-tachycardia-documentation` | Cardiology outpatient | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 298 | `cardio-valvular-disease-follow-up` | Cardiology outpatient | 52 | 37 | 0 | 15 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 299 | `cardio-warfarin-inr-result-review` | Cardiology outpatient | 53 | 23 | 0 | 30 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 300 | `cardio-white-coat-hypertension-documentation` | Cardiology outpatient | 51 | 23 | 0 | 28 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 301 | `derm-abscess-wound-check` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 302 | `derm-acne-scar-review` | Dermatology | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 303 | `derm-actinic-keratosis` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 304 | `derm-alopecia-areata-follow-up` | Dermatology | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 305 | `derm-burn-scar-review` | Dermatology | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 306 | `derm-candidal-intertrigo` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 307 | `derm-cellulitis-follow-up-documentation` | Dermatology | 52 | 36 | 0 | 16 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 308 | `derm-cherry-angioma` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 309 | `derm-chronic-itch-follow-up` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 310 | `derm-contact-allergen-review` | Dermatology | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 311 | `derm-cosmetic-skin-concern-documentation` | Dermatology | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 312 | `derm-dandruff-follow-up` | Dermatology | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 313 | `derm-dermatology-medication-monitoring` | Dermatology | 49 | 35 | 0 | 14 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 314 | `derm-diabetic-foot-skin-check` | Dermatology | 49 | 35 | 0 | 14 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 315 | `derm-dry-skin-counseling` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 316 | `derm-eczema-flare-follow-up` | Dermatology | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 317 | `derm-epidermoid-cyst` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 318 | `derm-facial-redness-review` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 319 | `derm-folliculitis` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 320 | `derm-fungal-nail-follow-up` | Dermatology | 51 | 27 | 0 | 24 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 321 | `derm-genital-skin-lesion-documentation` | Dermatology | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 322 | `derm-hair-loss-pattern-review` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 323 | `derm-hand-dermatitis-occupational-review` | Dermatology | 51 | 36 | 0 | 15 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 324 | `derm-hidradenitis-symptoms` | Dermatology | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 325 | `derm-hyperhidrosis` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 326 | `derm-hypertrophic-scar-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 327 | `derm-impetigo-follow-up` | Dermatology | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 328 | `derm-ingrown-toenail-skin-review` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 329 | `derm-insect-bite-skin-reaction` | Dermatology | 49 | 20 | 0 | 29 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 330 | `derm-intertrigo` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 331 | `derm-keloid-scar-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 332 | `derm-keratosis-pilaris` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 333 | `derm-leg-ulcer-skin-review` | Dermatology | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 334 | `derm-lichen-planus` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 335 | `derm-lipoma-skin-lump` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 336 | `derm-medication-rash-documentation` | Dermatology | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 337 | `derm-melasma` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 338 | `derm-milia` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 339 | `derm-mole-mapping-follow-up` | Dermatology | 51 | 20 | 0 | 31 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 340 | `derm-molluscum-contagiosum-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 341 | `derm-nail-psoriasis-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 342 | `derm-nail-trauma-review` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 343 | `derm-nevus-change-documentation` | Dermatology | 50 | 19 | 0 | 31 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 344 | `derm-patch-test-result-review` | Dermatology | 52 | 27 | 0 | 25 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 345 | `derm-pediatric-eczema-follow-up` | Dermatology | 51 | 29 | 0 | 22 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 346 | `derm-perianal-skin-symptoms` | Dermatology | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 347 | `derm-perioral-dermatitis` | Dermatology | 49 | 13 | 0 | 36 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 348 | `derm-periorbital-skin-rash` | Dermatology | 49 | 13 | 0 | 36 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 349 | `derm-photodermatitis` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 350 | `derm-pigmented-lesion-review` | Dermatology | 51 | 23 | 0 | 28 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 351 | `derm-pityriasis-rosea` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 352 | `derm-plantar-wart-review` | Dermatology | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 353 | `derm-post-biopsy-wound-review` | Dermatology | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 354 | `derm-post-excision-wound-review` | Dermatology | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 355 | `derm-post-inflammatory-hyperpigmentation` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 356 | `derm-pressure-area-skin-review` | Dermatology | 51 | 19 | 0 | 32 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 357 | `derm-pressure-ulcer-follow-up` | Dermatology | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 358 | `derm-pruritus-without-rash` | Dermatology | 49 | 23 | 0 | 26 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 359 | `derm-psoriasis-flare-documentation` | Dermatology | 50 | 19 | 0 | 31 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 360 | `derm-rosacea-flare-documentation` | Dermatology | 50 | 16 | 0 | 34 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 361 | `derm-scabies-contact-documentation` | Dermatology | 50 | 16 | 0 | 34 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 362 | `derm-scalp-scaling` | Dermatology | 49 | 21 | 0 | 28 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 363 | `derm-sebaceous-cyst` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 364 | `derm-seborrheic-keratosis` | Dermatology | 49 | 0 | 0 | 49 | 49 | `no_authoritative_source_found` | no | yes | no |
| 365 | `derm-skin-cancer-surveillance` | Dermatology | 49 | 23 | 0 | 26 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 366 | `derm-skin-infection-follow-up` | Dermatology | 51 | 28 | 0 | 23 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 367 | `derm-skin-tag-documentation` | Dermatology | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 368 | `derm-stasis-dermatitis-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 369 | `derm-sunburn-review` | Dermatology | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 370 | `derm-tinea-pedis-review` | Dermatology | 51 | 22 | 0 | 29 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 371 | `derm-urticaria-follow-up` | Dermatology | 51 | 19 | 0 | 32 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 372 | `derm-vasculitic-rash-documentation` | Dermatology | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 373 | `derm-venous-eczema-review` | Dermatology | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 374 | `derm-vitiligo` | Dermatology | 49 | 20 | 0 | 29 | 49 | `partial_exact_source_verified` | yes | yes | no |
| 375 | `derm-wart-follow-up` | Dermatology | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 376 | `ed-abdominal-pain-documentation` | Emergency Medicine documentation-only | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 377 | `ed-admission-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 378 | `ed-allergic-reaction-documentation` | Emergency Medicine documentation-only | 52 | 11 | 0 | 41 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 379 | `ed-altered-mental-status-documentation` | Emergency Medicine documentation-only | 52 | 8 | 0 | 44 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 380 | `ed-anaphylaxis-documentation` | Emergency Medicine documentation-only | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 381 | `ed-asthma-exacerbation-documentation` | Emergency Medicine documentation-only | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 382 | `ed-back-pain-documentation` | Emergency Medicine documentation-only | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 383 | `ed-blood-test-result-documentation` | Emergency Medicine documentation-only | 53 | 11 | 0 | 42 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 384 | `ed-burn-documentation` | Emergency Medicine documentation-only | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 385 | `ed-capacity-discussion-documentation` | Emergency Medicine documentation-only | 52 | 9 | 0 | 43 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 386 | `ed-chest-pain-documentation` | Emergency Medicine documentation-only | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 387 | `ed-copd-exacerbation-documentation` | Emergency Medicine documentation-only | 52 | 7 | 0 | 45 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 388 | `ed-critical-incident-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 389 | `ed-death-verification-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 390 | `ed-diarrhea-documentation` | Emergency Medicine documentation-only | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 391 | `ed-discharge-documentation` | Emergency Medicine documentation-only | 52 | 15 | 0 | 37 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 392 | `ed-dizziness-documentation` | Emergency Medicine documentation-only | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 393 | `ed-domestic-violence-screening-documentation` | Emergency Medicine documentation-only | 52 | 15 | 0 | 37 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 394 | `ed-ear-nose-throat-presentation` | Emergency Medicine documentation-only | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 395 | `ed-ecg-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 396 | `ed-eye-injury-documentation` | Emergency Medicine documentation-only | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 397 | `ed-fall-documentation` | Emergency Medicine documentation-only | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 398 | `ed-family-update-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 399 | `ed-fever-documentation` | Emergency Medicine documentation-only | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 400 | `ed-fracture-suspicion-documentation` | Emergency Medicine documentation-only | 52 | 25 | 0 | 27 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 401 | `ed-handover-documentation` | Emergency Medicine documentation-only | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 402 | `ed-headache-documentation` | Emergency Medicine documentation-only | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 403 | `ed-imaging-result-documentation` | Emergency Medicine documentation-only | 53 | 13 | 0 | 40 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 404 | `ed-interpreter-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 405 | `ed-intoxication-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 406 | `ed-laceration-documentation` | Emergency Medicine documentation-only | 52 | 28 | 0 | 24 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 407 | `ed-medication-administration-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 408 | `ed-mental-health-presentation-documentation` | Emergency Medicine documentation-only | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 409 | `ed-minor-head-injury-documentation` | Emergency Medicine documentation-only | 52 | 28 | 0 | 24 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 410 | `ed-observation-unit-review` | Emergency Medicine documentation-only | 53 | 28 | 0 | 25 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 411 | `ed-overdose-documentation` | Emergency Medicine documentation-only | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 412 | `ed-patient-declined-care-documentation` | Emergency Medicine documentation-only | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 413 | `ed-pediatric-fever-documentation` | Emergency Medicine documentation-only | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 414 | `ed-pediatric-injury-documentation` | Emergency Medicine documentation-only | 52 | 31 | 0 | 21 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 415 | `ed-pelvic-pain-documentation` | Emergency Medicine documentation-only | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 416 | `ed-pregnancy-bleeding-documentation` | Emergency Medicine documentation-only | 52 | 28 | 0 | 24 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 417 | `ed-procedural-sedation-documentation-prompt` | Emergency Medicine documentation-only | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 418 | `ed-procedure-note-documentation-prompt` | Emergency Medicine documentation-only | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 419 | `ed-reattendance-documentation` | Emergency Medicine documentation-only | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 420 | `ed-referral-documentation` | Emergency Medicine documentation-only | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 421 | `ed-renal-colic-documentation` | Emergency Medicine documentation-only | 52 | 9 | 0 | 43 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 422 | `ed-safeguarding-documentation` | Emergency Medicine documentation-only | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 423 | `ed-safety-net-documentation` | Emergency Medicine documentation-only | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 424 | `ed-seizure-documentation` | Emergency Medicine documentation-only | 52 | 29 | 0 | 23 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 425 | `ed-self-harm-documentation-prompts` | Emergency Medicine documentation-only | 52 | 30 | 0 | 22 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 426 | `ed-shortness-of-breath-documentation` | Emergency Medicine documentation-only | 52 | 27 | 0 | 25 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 427 | `ed-sprain-documentation` | Emergency Medicine documentation-only | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 428 | `ed-syncope-documentation` | Emergency Medicine documentation-only | 56 | 28 | 0 | 28 | 56 | `partial_exact_source_verified` | yes | yes | no |
| 429 | `ed-testicular-pain-documentation` | Emergency Medicine documentation-only | 53 | 0 | 0 | 53 | 53 | `no_authoritative_source_found` | no | yes | no |
| 430 | `ed-transfer-documentation` | Emergency Medicine documentation-only | 52 | 30 | 0 | 22 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 431 | `ed-triage-documentation` | Emergency Medicine documentation-only | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 432 | `ed-urinary-symptoms-documentation` | Emergency Medicine documentation-only | 57 | 0 | 0 | 57 | 57 | `no_authoritative_source_found` | no | yes | no |
| 433 | `ed-violence-aggression-incident-documentation` | Emergency Medicine documentation-only | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 434 | `ed-vomiting-documentation` | Emergency Medicine documentation-only | 52 | 28 | 0 | 24 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 435 | `ed-wound-documentation` | Emergency Medicine documentation-only | 52 | 30 | 0 | 22 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 436 | `endo-adrenal-incidentaloma-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 18 | 0 | 35 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 437 | `endo-b12-deficiency-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 438 | `endo-bone-density-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 16 | 0 | 37 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 439 | `endo-calcium-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 20 | 0 | 33 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 440 | `endo-cold-intolerance-endocrine-documentation` | Endocrinology / Diabetes / Metabolic | 53 | 0 | 0 | 53 | 53 | `no_authoritative_source_found` | no | yes | no |
| 441 | `endo-continuous-glucose-monitor-review` | Endocrinology / Diabetes / Metabolic | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 442 | `endo-cortisol-result-discussion-documentation` | Endocrinology / Diabetes / Metabolic | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 443 | `endo-diabetes-annual-review` | Endocrinology / Diabetes / Metabolic | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 444 | `endo-diabetes-medication-review` | Endocrinology / Diabetes / Metabolic | 52 | 25 | 0 | 27 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 445 | `endo-diabetes-technology-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 446 | `endo-diabetic-eye-screening-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 17 | 0 | 36 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 447 | `endo-diabetic-foot-risk-review` | Endocrinology / Diabetes / Metabolic | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 448 | `endo-diabetic-kidney-screening-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 24 | 0 | 29 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 449 | `endo-erectile-dysfunction-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 27 | 0 | 25 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 450 | `endo-excessive-sweating-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 451 | `endo-fracture-risk-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 20 | 0 | 31 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 452 | `endo-goiter-symptom-review` | Endocrinology / Diabetes / Metabolic | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 453 | `endo-growth-hormone-concern-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 454 | `endo-hba1c-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 24 | 0 | 29 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 455 | `endo-heat-intolerance-endocrine-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 456 | `endo-hirsutism-review` | Endocrinology / Diabetes / Metabolic | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 457 | `endo-home-glucose-log-review` | Endocrinology / Diabetes / Metabolic | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 458 | `endo-hyperglycemia-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 14 | 0 | 38 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 459 | `endo-hyperthyroidism-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 460 | `endo-hypothyroidism-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 461 | `endo-infertility-hormone-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 14 | 0 | 39 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 462 | `endo-insulin-initiation-documentation-review` | Endocrinology / Diabetes / Metabolic | 53 | 17 | 0 | 36 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 463 | `endo-lipid-disorder-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 464 | `endo-menopause-metabolic-risk-review` | Endocrinology / Diabetes / Metabolic | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 465 | `endo-metabolic-syndrome-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 466 | `endo-osteoporosis-endocrine-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 467 | `endo-pituitary-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 19 | 0 | 34 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 468 | `endo-polyuria-polydipsia-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 469 | `endo-prediabetes-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 13 | 0 | 39 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 470 | `endo-prediabetes-review` | Endocrinology / Diabetes / Metabolic | 52 | 14 | 0 | 38 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 471 | `endo-prolactin-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 20 | 0 | 33 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 472 | `endo-referral-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 473 | `endo-short-stature-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 474 | `endo-testosterone-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 22 | 0 | 31 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 475 | `endo-thyroid-function-result-review` | Endocrinology / Diabetes / Metabolic | 53 | 20 | 0 | 33 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 476 | `endo-thyroid-nodule-documentation` | Endocrinology / Diabetes / Metabolic | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 477 | `endo-thyroid-nodule-review` | Endocrinology / Diabetes / Metabolic | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 478 | `endo-vitamin-d-deficiency-endocrine-follow-up` | Endocrinology / Diabetes / Metabolic | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 479 | `endo-weight-loss-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 480 | `endo-weight-management-endocrine-review` | Endocrinology / Diabetes / Metabolic | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 481 | `ent-adenoid-symptom-documentation` | ENT | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 482 | `ent-audiology-referral-documentation` | ENT | 51 | 18 | 0 | 33 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 483 | `ent-balance-clinic-follow-up` | ENT | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 484 | `ent-barotrauma-ear-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 485 | `ent-bppv-follow-up` | ENT | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 486 | `ent-cerumen-recurrence-review` | ENT | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 487 | `ent-chronic-cough-ent-contribution` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 488 | `ent-chronic-rhinitis-follow-up` | ENT | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 489 | `ent-chronic-sinus-symptom-follow-up` | ENT | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 490 | `ent-deviated-septum-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 491 | `ent-dysphonia-follow-up` | ENT | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 492 | `ent-ear-canal-itching` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 493 | `ent-ear-discharge-follow-up` | ENT | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 494 | `ent-ear-fullness` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 495 | `ent-ear-pain-follow-up` | ENT | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 496 | `ent-ear-tube-follow-up` | ENT | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 497 | `ent-epistaxis-recurrence-review` | ENT | 52 | 23 | 0 | 29 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 498 | `ent-eustachian-tube-dysfunction-follow-up` | ENT | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 499 | `ent-facial-pressure-ent-review` | ENT | 52 | 14 | 0 | 38 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 500 | `ent-foreign-body-sensation-throat` | ENT | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 501 | `ent-globus-sensation` | ENT | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 502 | `ent-glue-ear-follow-up` | ENT | 52 | 16 | 0 | 36 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 503 | `ent-hearing-aid-issue` | ENT | 50 | 17 | 0 | 33 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 504 | `ent-hearing-test-result-review` | ENT | 53 | 18 | 0 | 35 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 505 | `ent-hoarseness-red-flag-screening` | ENT | 50 | 19 | 0 | 31 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 506 | `ent-laryngopharyngeal-reflux-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 507 | `ent-mouth-breathing` | ENT | 50 | 16 | 0 | 34 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 508 | `ent-nasal-allergy-follow-up` | ENT | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 509 | `ent-nasal-crusting` | ENT | 50 | 17 | 0 | 33 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 510 | `ent-nasal-polyp-symptoms` | ENT | 51 | 16 | 0 | 35 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 511 | `ent-nasal-trauma-follow-up` | ENT | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 512 | `ent-neck-mass-ent-documentation` | ENT | 51 | 22 | 0 | 29 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 513 | `ent-non-allergic-rhinitis` | ENT | 50 | 17 | 0 | 33 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 514 | `ent-nosebleed-documentation` | ENT | 51 | 20 | 0 | 31 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 515 | `ent-oral-lesion-ent-review` | ENT | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 516 | `ent-otitis-externa-follow-up` | ENT | 52 | 19 | 0 | 33 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 517 | `ent-perforated-eardrum-follow-up` | ENT | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 518 | `ent-post-procedure-review` | ENT | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 519 | `ent-post-septoplasty-follow-up` | ENT | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 520 | `ent-post-tonsillectomy-follow-up` | ENT | 52 | 17 | 0 | 35 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 521 | `ent-postnasal-drip` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 522 | `ent-recurrent-otitis-media-history` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 523 | `ent-recurrent-tonsillitis` | ENT | 50 | 18 | 0 | 32 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 524 | `ent-reflux-related-throat-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 525 | `ent-salivary-gland-swelling` | ENT | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 526 | `ent-sleep-disordered-breathing-ent-documentation` | ENT | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 527 | `ent-smell-loss` | ENT | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 528 | `ent-snoring-ent-review` | ENT | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 529 | `ent-sudden-hearing-change-documentation` | ENT | 51 | 19 | 0 | 32 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 530 | `ent-swallowing-symptom-ent-review` | ENT | 52 | 21 | 0 | 31 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 531 | `ent-throat-clearing` | ENT | 50 | 19 | 0 | 31 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 532 | `ent-tinnitus-impact-review` | ENT | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 533 | `ent-tmj-related-ear-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 534 | `ent-tongue-lesion-documentation` | ENT | 51 | 20 | 0 | 31 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 535 | `ent-tonsil-size-documentation` | ENT | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 536 | `ent-tonsil-stone-symptoms` | ENT | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 537 | `ent-unilateral-nasal-obstruction-documentation` | ENT | 51 | 22 | 0 | 29 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 538 | `ent-vertigo-episode-documentation` | ENT | 51 | 18 | 0 | 33 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 539 | `ent-vocal-cord-lesion-follow-up` | ENT | 52 | 23 | 0 | 29 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 540 | `ent-voice-strain-documentation` | ENT | 51 | 22 | 0 | 29 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 541 | `geri-activities-of-daily-living-documentation` | Geriatrics | 51 | 23 | 0 | 28 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 542 | `geri-advance-care-planning-documentation` | Geriatrics | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 543 | `geri-caregiver-support-review` | Geriatrics | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 544 | `geri-cognitive-decline-review` | Geriatrics | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 545 | `geri-comprehensive-geriatric-review` | Geriatrics | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 546 | `geri-continence-review-in-older-adult` | Geriatrics | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 547 | `geri-delirium-follow-up-after-discharge` | Geriatrics | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 548 | `geri-dementia-care-planning-documentation` | Geriatrics | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 549 | `geri-driving-safety-discussion-documentation` | Geriatrics | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 550 | `geri-falls-prevention-counseling-documentation` | Geriatrics | 51 | 18 | 0 | 33 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 551 | `geri-falls-review` | Geriatrics | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 552 | `geri-frailty-review-documentation` | Geriatrics | 53 | 19 | 0 | 34 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 553 | `geri-functional-status-review` | Geriatrics | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 554 | `geri-goals-of-care-discussion-documentation` | Geriatrics | 51 | 17 | 0 | 34 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 555 | `geri-hearing-impairment-geriatric-review` | Geriatrics | 52 | 25 | 0 | 27 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 556 | `geri-home-safety-discussion-documentation` | Geriatrics | 51 | 18 | 0 | 33 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 557 | `geri-medication-deprescribing-discussion-documentation` | Geriatrics | 51 | 19 | 0 | 32 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 558 | `geri-mobility-limitation-documentation` | Geriatrics | 51 | 25 | 0 | 26 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 559 | `geri-mood-screening` | Geriatrics | 50 | 20 | 0 | 30 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 560 | `geri-nutrition-risk-review` | Geriatrics | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 561 | `geri-osteoporosis-risk-review` | Geriatrics | 52 | 22 | 0 | 30 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 562 | `geri-polypharmacy-review` | Geriatrics | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 563 | `geri-post-hospital-geriatric-follow-up` | Geriatrics | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 564 | `geri-pressure-area-risk-review` | Geriatrics | 52 | 24 | 0 | 28 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 565 | `geri-referral-documentation` | Geriatrics | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 566 | `geri-sleep-issue-in-older-adult` | Geriatrics | 50 | 26 | 0 | 24 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 567 | `geri-social-isolation-review` | Geriatrics | 52 | 18 | 0 | 34 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 568 | `geri-vision-impairment-geriatric-review` | Geriatrics | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 569 | `geri-walking-aid-review` | Geriatrics | 52 | 26 | 0 | 26 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 570 | `geri-weight-loss-in-older-adult` | Geriatrics | 50 | 23 | 0 | 27 | 50 | `partial_exact_source_verified` | yes | yes | no |
| 571 | `gi-abdominal-bloating` | Gastroenterology outpatient | 52 | 20 | 0 | 32 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 572 | `gi-abdominal-imaging-result-review` | Gastroenterology outpatient | 53 | 26 | 0 | 27 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 573 | `gi-abdominal-pain-follow-up` | Gastroenterology outpatient | 52 | 27 | 0 | 25 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 574 | `gi-abnormal-liver-enzyme-review` | Gastroenterology outpatient | 52 | 27 | 0 | 25 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 575 | `gi-alcohol-related-liver-risk-documentation` | Gastroenterology outpatient | 51 | 21 | 0 | 30 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 576 | `gi-anal-fissure-symptoms` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 577 | `gi-appetite-loss-gi-review` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 578 | `gi-ascites-follow-up-documentation` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 579 | `gi-belching-and-burping-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 580 | `gi-biliary-colic-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 581 | `gi-bowel-cancer-screening-documentation` | Gastroenterology outpatient | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 582 | `gi-celiac-disease-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 583 | `gi-celiac-screening-result-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 584 | `gi-change-in-bowel-habit-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 585 | `gi-chronic-nausea-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 586 | `gi-colonoscopy-result-discussion-documentation` | Gastroenterology outpatient | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 587 | `gi-constipation-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 588 | `gi-crohn-disease-follow-up-documentation` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 589 | `gi-diarrhea-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 590 | `gi-dyspepsia-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 591 | `gi-dysphagia-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 592 | `gi-early-satiety-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 593 | `gi-endoscopy-result-discussion-documentation` | Gastroenterology outpatient | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 594 | `gi-fatty-liver-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 595 | `gi-fecal-incontinence-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 596 | `gi-fit-result-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 597 | `gi-food-intolerance-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 598 | `gi-functional-abdominal-pain-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 599 | `gi-gallstone-symptom-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 600 | `gi-gastroenterology-referral-documentation` | Gastroenterology outpatient | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 601 | `gi-h-pylori-result-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 602 | `gi-hemorrhoid-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 603 | `gi-hepatitis-result-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 604 | `gi-ibs-symptom-review` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 605 | `gi-inflammatory-bowel-disease-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 606 | `gi-iron-deficiency-gi-review` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 607 | `gi-jaundice-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 608 | `gi-lactose-intolerance-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 609 | `gi-liver-ultrasound-result-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 610 | `gi-medication-review` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 611 | `gi-nausea-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 612 | `gi-nsaid-gi-risk-review` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 613 | `gi-nutritional-counseling-gi-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 614 | `gi-pancreatitis-follow-up-documentation` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 615 | `gi-perianal-symptoms-gi-review` | Gastroenterology outpatient | 53 | 32 | 0 | 21 | 53 | `partial_exact_source_verified` | yes | yes | no |
| 616 | `gi-portal-hypertension-clinic-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 617 | `gi-post-cholecystectomy-symptoms` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 618 | `gi-post-gastroenteritis-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 619 | `gi-post-gi-admission-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 620 | `gi-rectal-bleeding-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 621 | `gi-reflux-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 622 | `gi-stool-test-result-review` | Gastroenterology outpatient | 53 | 0 | 0 | 53 | 53 | `no_authoritative_source_found` | no | yes | no |
| 623 | `gi-ulcerative-colitis-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 624 | `gi-vomiting-follow-up` | Gastroenterology outpatient | 52 | 32 | 0 | 20 | 52 | `partial_exact_source_verified` | yes | yes | no |
| 625 | `gi-weight-loss-gi-documentation` | Gastroenterology outpatient | 51 | 31 | 0 | 20 | 51 | `partial_exact_source_verified` | yes | yes | no |
| 626 | `gp-abdominal-bloating` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 627 | `gp-abnormal-kidney-function-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 628 | `gp-abnormal-liver-enzyme-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 629 | `gp-alcohol-intake-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `partial_exact_source_verified` | no | yes | no |
| 630 | `gp-allergic-symptoms` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 631 | `gp-allergy-list-update` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 632 | `gp-anal-itching` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 633 | `gp-anemia-result-review` | General Medicine / GP | 53 | 0 | 0 | 53 | 53 | `no_authoritative_source_found` | no | yes | no |
| 634 | `gp-appetite-loss` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 635 | `gp-axillary-lump` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 636 | `gp-b12-deficiency-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 637 | `gp-bite-or-sting-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 638 | `gp-blood-pressure-device-technique-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 639 | `gp-breast-pain` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 640 | `gp-bruising-tendency` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 641 | `gp-caffeine-intake-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 642 | `gp-care-coordination-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 643 | `gp-caregiver-stress` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 644 | `gp-caregiver-support-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 645 | `gp-chest-discomfort-non-acute-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 646 | `gp-cholesterol-result-review` | General Medicine / GP | 53 | 0 | 0 | 53 | 53 | `partial_exact_source_verified` | no | yes | no |
| 647 | `gp-chronic-disease-annual-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 648 | `gp-chronic-pain-medication-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 649 | `gp-cold-intolerance` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 650 | `gp-constipation-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 651 | `gp-cough-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 652 | `gp-diabetes-annual-care-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `partial_exact_source_verified` | no | yes | no |
| 653 | `gp-diarrhea-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 654 | `gp-dietary-counseling-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 655 | `gp-dizziness-in-gp` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 656 | `gp-domestic-safety-screening-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `partial_exact_source_verified` | no | yes | no |
| 657 | `gp-driving-medical-form` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 658 | `gp-dyspepsia-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 659 | `gp-epistaxis-review-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 660 | `gp-excessive-sweating` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 661 | `gp-exercise-counseling-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 662 | `gp-falls-risk-screening` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 663 | `gp-family-history-risk-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 664 | `gp-fever-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 665 | `gp-financial-stress-health-impact` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 666 | `gp-fitness-to-work-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 667 | `gp-foot-numbness` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 668 | `gp-general-weakness` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 669 | `gp-general-wellness-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `no_authoritative_source_found` | no | yes | no |
| 670 | `gp-halitosis` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `no_authoritative_source_found` | no | yes | no |
| 671 | `gp-headache-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 672 | `gp-health-anxiety-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `no_authoritative_source_found` | no | yes | no |
| 673 | `gp-heat-intolerance` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `partial_exact_source_verified` | no | yes | no |
| 674 | `gp-hemorrhoid-symptoms` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `partial_exact_source_verified` | no | yes | no |
| 675 | `gp-home-blood-pressure-log-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `partial_exact_source_verified` | no | yes | no |
| 676 | `gp-home-glucose-log-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 677 | `gp-immunization-counseling` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 678 | `gp-insurance-medical-report` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 679 | `gp-iron-deficiency-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 680 | `gp-laboratory-trend-review` | General Medicine / GP | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 681 | `gp-leg-swelling` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 682 | `gp-lifestyle-goal-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 683 | `gp-lightheadedness` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 684 | `gp-long-covid-symptom-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 685 | `gp-lymph-node-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 686 | `gp-medical-fitness-certificate` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 687 | `gp-medication-adherence-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 688 | `gp-medication-allergy-clarification` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 689 | `gp-medication-reconciliation-after-discharge` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 690 | `gp-medication-refill-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 691 | `gp-medication-side-effect-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 692 | `gp-microscopic-hematuria-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 693 | `gp-minor-burn-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 694 | `gp-minor-head-bump-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 695 | `gp-minor-wound-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 696 | `gp-motion-sickness` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 697 | `gp-mouth-dryness` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 698 | `gp-mouth-ulcer` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 699 | `gp-nail-discoloration` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 700 | `gp-nausea-follow-up-in-gp` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 701 | `gp-neck-lump` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 702 | `gp-new-patient-registration-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 703 | `gp-night-sweats` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 704 | `gp-non-specific-body-aches` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 705 | `gp-occupational-health-form` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 706 | `gp-occupational-stress` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 707 | `gp-oral-thrush` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 708 | `gp-palpitations-in-gp-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 709 | `gp-polypharmacy-concern` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 710 | `gp-post-hospital-discharge-gp-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 711 | `gp-post-viral-fatigue` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 712 | `gp-pre-employment-medical-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 713 | `gp-pre-travel-consultation` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 714 | `gp-prediabetes-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 715 | `gp-proteinuria-result-discussion` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 716 | `gp-rectal-pain` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 717 | `gp-recurrent-infections` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 718 | `gp-reduced-exercise-tolerance` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 719 | `gp-repeat-prescription-safety-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 720 | `gp-restless-legs-symptoms` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 721 | `gp-return-to-sport-note` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 722 | `gp-routine-blood-test-discussion` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 723 | `gp-routine-follow-up-with-no-new-complaint` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 724 | `gp-routine-urine-test-review` | General Medicine / GP | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 725 | `gp-school-medical-form` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 726 | `gp-school-or-work-absence-note` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 727 | `gp-sick-leave-extension-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 728 | `gp-side-effect-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 729 | `gp-sleep-pattern-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 730 | `gp-smoking-status-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 731 | `gp-snoring-complaint` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 732 | `gp-social-support-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 733 | `gp-suture-removal-documentation` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 734 | `gp-taste-or-smell-change` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 735 | `gp-thyroid-result-review` | General Medicine / GP | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 736 | `gp-travel-illness-return-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 737 | `gp-travel-insurance-form` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 738 | `gp-travel-vaccine-record-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 739 | `gp-unintentional-weight-loss` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 740 | `gp-vaccination-status-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 741 | `gp-varicose-vein-symptoms` | General Medicine / GP | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 742 | `gp-viral-illness-follow-up` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 743 | `gp-vitamin-d-deficiency-review` | General Medicine / GP | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 744 | `gp-weight-change-concern` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 745 | `gp-workplace-exposure-concern` | General Medicine / GP | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 746 | `gyn-abnormal-uterine-bleeding` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 747 | `gyn-adolescent-menstrual-concern` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 748 | `gyn-amenorrhea-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 749 | `gyn-antenatal-routine-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 750 | `gyn-breast-lump-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 751 | `gyn-breast-pain-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 752 | `gyn-breastfeeding-concern-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 753 | `gyn-cervical-screening-result-review` | Women�s Health / OB-GYN outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 754 | `gyn-colposcopy-follow-up-documentation` | Women�s Health / OB-GYN outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 755 | `gyn-contraception-counseling` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 756 | `gyn-contraception-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 757 | `gyn-contraception-side-effect-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 758 | `gyn-dysmenorrhea-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 759 | `gyn-dyspareunia-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 760 | `gyn-early-pregnancy-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 761 | `gyn-emergency-contraception-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 762 | `gyn-endometriosis-symptom-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 763 | `gyn-family-planning-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 764 | `gyn-fertility-concern-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 765 | `gyn-fibroid-symptom-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 766 | `gyn-genital-ulcer-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 767 | `gyn-genital-wart-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 768 | `gyn-gynecology-imaging-result-review` | Women�s Health / OB-GYN outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 769 | `gyn-heavy-menstrual-bleeding-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 770 | `gyn-hpv-result-discussion-documentation` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 771 | `gyn-hrt-discussion-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 772 | `gyn-implant-contraception-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 773 | `gyn-irregular-periods` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 774 | `gyn-iud-check-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 775 | `gyn-mastitis-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 776 | `gyn-menopause-symptom-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 777 | `gyn-menstrual-migraine-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 778 | `gyn-miscarriage-follow-up-documentation` | Women�s Health / OB-GYN outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 779 | `gyn-nausea-in-pregnancy-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 780 | `gyn-nipple-discharge-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 781 | `gyn-oral-contraceptive-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 782 | `gyn-ovarian-cyst-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 783 | `gyn-pcos-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 784 | `gyn-pelvic-organ-prolapse-symptoms` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 785 | `gyn-pelvic-pain-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 786 | `gyn-perimenopause-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 787 | `gyn-post-procedure-gynecology-follow-up` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 788 | `gyn-postnatal-check` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 789 | `gyn-postpartum-mood-screening-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 790 | `gyn-preconception-counseling` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 791 | `gyn-pregnancy-dating-discussion-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 792 | `gyn-pregnancy-medication-review` | Women�s Health / OB-GYN outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 793 | `gyn-premenstrual-symptoms` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 794 | `gyn-sexual-health-screening-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 795 | `gyn-sti-result-review` | Women�s Health / OB-GYN outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 796 | `gyn-stress-incontinence-womens-health` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 797 | `gyn-urinary-symptoms-in-pregnancy` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 798 | `gyn-vaginal-bleeding-after-menopause` | Women�s Health / OB-GYN outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 799 | `gyn-vaginal-discharge-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 800 | `gyn-vulval-itching-documentation` | Women�s Health / OB-GYN outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 801 | `icu-agitation-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 802 | `icu-aki-in-icu-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 803 | `icu-antibiotic-plan-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 804 | `icu-arterial-line-documentation-prompt` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 805 | `icu-blood-gas-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 806 | `icu-burn-patient-review` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 807 | `icu-central-line-documentation-prompt` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 808 | `icu-critical-care-medication-reconciliation` | ICU / Critical Care | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 809 | `icu-critical-care-safety-net-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 810 | `icu-culture-result-review` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 811 | `icu-daily-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 812 | `icu-delirium-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 813 | `icu-discharge-summary-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 814 | `icu-drain-output-review-icu` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 815 | `icu-dvt-prophylaxis-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 816 | `icu-electrolyte-issue-icu-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 817 | `icu-end-of-life-care-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 818 | `icu-extubation-readiness-prompt-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 819 | `icu-family-meeting-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 820 | `icu-family-update-icu-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 821 | `icu-fluid-balance-documentation-icu` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 822 | `icu-glycemic-control-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 823 | `icu-goals-of-care-icu-discussion-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 824 | `icu-handover-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 825 | `icu-hemodynamic-instability-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 826 | `icu-imaging-result-review` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 827 | `icu-infection-review-icu-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 828 | `icu-lactate-trend-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 829 | `icu-lines-tubes-drains-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 830 | `icu-mobility-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 831 | `icu-neurological-observation-review` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 832 | `icu-nutrition-review-icu-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 833 | `icu-obstetric-critical-care-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 834 | `icu-organ-support-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 835 | `icu-pain-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 836 | `icu-pediatric-handover-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 837 | `icu-physiotherapy-progress-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 838 | `icu-post-icu-clinic-follow-up` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 839 | `icu-post-operative-admission-review` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 840 | `icu-procedure-note-documentation-prompt` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 841 | `icu-readmission-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 842 | `icu-reintubation-risk-prompt-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 843 | `icu-renal-replacement-therapy-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 844 | `icu-respiratory-deterioration-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 845 | `icu-restraint-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 846 | `icu-sedation-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 847 | `icu-sepsis-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 848 | `icu-shock-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 849 | `icu-skin-pressure-area-review` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 850 | `icu-sleep-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 851 | `icu-step-down-readiness-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 852 | `icu-stress-ulcer-prophylaxis-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 853 | `icu-tracheostomy-review-icu` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 854 | `icu-trauma-patient-daily-review` | ICU / Critical Care | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 855 | `icu-urinary-catheter-documentation-icu` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 856 | `icu-vasopressor-documentation-review` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 857 | `icu-ventilated-patient-review-documentation` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 858 | `icu-ventilator-setting-documentation-review` | ICU / Critical Care | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 859 | `icu-weaning-readiness-documentation-prompts` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 860 | `icu-withdrawal-of-care-discussion-documentation` | ICU / Critical Care | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 861 | `msk-achilles-tendon-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 862 | `msk-activity-limitation-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 863 | `msk-ankle-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 864 | `msk-back-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 865 | `msk-baker-cyst-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 866 | `msk-bone-density-result-review` | MSK / Orthopedics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 867 | `msk-bunion-symptoms` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 868 | `msk-carpal-tunnel-symptoms` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 869 | `msk-cast-check-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 870 | `msk-cervicogenic-headache-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 871 | `msk-chronic-widespread-pain-msk` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 872 | `msk-de-quervain-symptoms` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 873 | `msk-diabetic-foot-msk-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 874 | `msk-elbow-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 875 | `msk-ergonomic-strain-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 876 | `msk-falls-related-injury-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 877 | `msk-finger-injury-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 878 | `msk-flat-foot-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 879 | `msk-foot-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 880 | `msk-fracture-clinic-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 881 | `msk-frozen-shoulder-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 882 | `msk-ganglion-cyst-wrist` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 883 | `msk-gout-flare-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 884 | `msk-growth-plate-injury-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 885 | `msk-hand-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 886 | `msk-hand-swelling-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 887 | `msk-heel-pain-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 888 | `msk-hip-impingement-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 889 | `msk-imaging-result-review` | MSK / Orthopedics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 890 | `msk-inflammatory-joint-symptom-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 891 | `msk-ingrown-toenail-orthopedic-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 892 | `msk-it-band-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 893 | `msk-joint-hypermobility-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 894 | `msk-joint-stiffness` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 895 | `msk-knee-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 896 | `msk-knee-swelling-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 897 | `msk-kyphosis-posture-concern` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 898 | `msk-ligament-sprain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 899 | `msk-meniscal-symptom-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 900 | `msk-mobility-aid-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 901 | `msk-muscle-strain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 902 | `msk-neuropathic-foot-symptom-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 903 | `msk-orthopedic-referral-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 904 | `msk-orthopedic-second-opinion-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 905 | `msk-osteoarthritis-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 906 | `msk-osteoporosis-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 907 | `msk-pain-score-functional-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 908 | `msk-patellofemoral-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 909 | `msk-pediatric-limp-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 910 | `msk-physiotherapy-progress-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 911 | `msk-plantar-fasciitis-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 912 | `msk-post-arthroscopy-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 913 | `msk-post-cast-removal-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 914 | `msk-post-fall-msk-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 915 | `msk-post-injection-msk-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 916 | `msk-post-operative-orthopedic-wound-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 917 | `msk-post-trauma-pain-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 918 | `msk-pre-operative-orthopedic-assessment` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 919 | `msk-prosthesis-discomfort-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 920 | `msk-return-to-sport-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 921 | `msk-rotator-cuff-symptom-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 922 | `msk-sciatica-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 923 | `msk-scoliosis-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 924 | `msk-shin-splints-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 925 | `msk-shoulder-impingement-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 926 | `msk-splint-check-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 927 | `msk-sports-injury-review` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 928 | `msk-stress-injury-concern` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 929 | `msk-tendon-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 930 | `msk-tennis-elbow-follow-up` | MSK / Orthopedics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 931 | `msk-thigh-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 932 | `msk-thumb-base-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 933 | `msk-trigger-finger-documentation` | MSK / Orthopedics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 934 | `msk-work-related-msk-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 935 | `msk-wrist-pain` | MSK / Orthopedics | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 936 | `neuro-balance-problem-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 937 | `neuro-carpal-tunnel-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 938 | `neuro-chronic-fatigue-neurological-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 939 | `neuro-cognitive-decline-caregiver-discussion` | Neurology outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 940 | `neuro-cognitive-screening-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 941 | `neuro-dizziness-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 942 | `neuro-driving-advice-documentation-neurological` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 943 | `neuro-dystonia-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 944 | `neuro-eeg-result-review` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 945 | `neuro-epilepsy-medication-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 946 | `neuro-facial-weakness-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 947 | `neuro-falls-neurological-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 948 | `neuro-first-seizure-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 949 | `neuro-functional-neurological-symptom-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 950 | `neuro-gait-disturbance-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 951 | `neuro-headache-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 952 | `neuro-headache-red-flag-screening-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 953 | `neuro-imaging-result-review` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 954 | `neuro-medication-side-effect-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 955 | `neuro-memory-concern-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 956 | `neuro-migraine-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 957 | `neuro-mri-brain-result-discussion-documentation` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 958 | `neuro-multiple-sclerosis-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 959 | `neuro-myopathy-symptom-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 960 | `neuro-nerve-conduction-result-review` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 961 | `neuro-neuralgia-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 962 | `neuro-neuropathic-pain-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 963 | `neuro-numbness-and-tingling-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 964 | `neuro-optic-neuritis-follow-up-documentation` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 965 | `neuro-parkinson-symptoms-follow-up` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 966 | `neuro-peripheral-neuropathy-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 967 | `neuro-post-concussion-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 968 | `neuro-post-stroke-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 969 | `neuro-referral-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 970 | `neuro-restless-legs-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 971 | `neuro-safety-net-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 972 | `neuro-sciatica-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 973 | `neuro-second-opinion-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 974 | `neuro-seizure-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 975 | `neuro-sleep-disorder-neurology-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 976 | `neuro-speech-disturbance-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 977 | `neuro-swallowing-symptom-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 978 | `neuro-syncope-neurology-follow-up` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 979 | `neuro-tension-headache-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 980 | `neuro-tia-follow-up-documentation` | Neurology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 981 | `neuro-tremor-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 982 | `neuro-vertigo-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 983 | `neuro-visual-disturbance-neurology-review` | Neurology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 984 | `neuro-weakness-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 985 | `neuro-work-impact-neurological-documentation` | Neurology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 986 | `oph-adult-strabismus-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 987 | `oph-allergic-conjunctivitis-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 988 | `oph-amblyopia-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 989 | `oph-blepharitis-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 990 | `oph-blurred-vision-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 991 | `oph-cataract-post-operative-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 992 | `oph-cataract-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 993 | `oph-chalazion-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 994 | `oph-chemical-exposure-eye-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 995 | `oph-color-vision-concern` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 996 | `oph-computer-vision-symptoms` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 997 | `oph-conjunctivitis-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 998 | `oph-contact-lens-discomfort` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 999 | `oph-contact-lens-red-eye-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1000 | `oph-corneal-abrasion-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1001 | `oph-diabetic-retinopathy-screening-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1002 | `oph-double-vision-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1003 | `oph-driving-vision-form-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1004 | `oph-dry-eye-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1005 | `oph-episcleritis-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1006 | `oph-eye-allergy-medication-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1007 | `oph-eye-pain-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1008 | `oph-eye-strain` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1009 | `oph-eye-trauma-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1010 | `oph-eyelid-lesion` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1011 | `oph-eyelid-swelling` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1012 | `oph-eyelid-twitching` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1013 | `oph-family-history-glaucoma-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1014 | `oph-flashes-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1015 | `oph-floaters-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1016 | `oph-foreign-body-sensation-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1017 | `oph-glaucoma-monitoring-visit` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1018 | `oph-headache-with-visual-symptoms` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1019 | `oph-keratitis-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1020 | `oph-lacrimal-obstruction-symptoms` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1021 | `oph-macular-degeneration-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1022 | `oph-meibomian-gland-dysfunction` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1023 | `oph-oct-result-review` | Ophthalmology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1024 | `oph-optic-disc-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1025 | `oph-pediatric-squint-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1026 | `oph-photophobia-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1027 | `oph-pinguecula-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1028 | `oph-post-injection-eye-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1029 | `oph-post-laser-eye-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1030 | `oph-post-operative-eye-wound-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1031 | `oph-pterygium-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1032 | `oph-ptosis-documentation` | Ophthalmology | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1033 | `oph-raised-intraocular-pressure-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1034 | `oph-recurrent-stye` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1035 | `oph-red-eye-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1036 | `oph-reduced-vision-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1037 | `oph-referral-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1038 | `oph-refractive-error-review` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1039 | `oph-retinal-tear-follow-up-documentation` | Ophthalmology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1040 | `oph-retinal-vein-occlusion-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1041 | `oph-scleritis-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1042 | `oph-spectacle-prescription-discussion` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1043 | `oph-subconjunctival-hemorrhage` | Ophthalmology | 49 | 0 | 0 | 49 | 49 | `research_interrupted` | no | yes | no |
| 1044 | `oph-transient-vision-loss-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1045 | `oph-uveitis-follow-up` | Ophthalmology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1046 | `oph-vision-screening-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1047 | `oph-visual-aura-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1048 | `oph-visual-field-result-review` | Ophthalmology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1049 | `oph-watery-eye-symptoms` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1050 | `oph-workplace-eye-strain-documentation` | Ophthalmology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1051 | `pain-activity-pacing-discussion-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1052 | `pain-articular-clinic-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1053 | `pain-cancer-pain-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1054 | `pain-cervical-clinic-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1055 | `pain-chronic-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1056 | `pain-clinic-referral-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1057 | `pain-complex-regional-pain-symptoms` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1058 | `pain-controlled-drug-review-documentation` | Pain Medicine | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1059 | `pain-diary-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1060 | `pain-fibromyalgia-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1061 | `pain-flare-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1062 | `pain-functional-impact-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1063 | `pain-headache-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1064 | `pain-injection-follow-up-pain-clinic` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1065 | `pain-lumbar-clinic-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1066 | `pain-medication-adherence-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1067 | `pain-medication-side-effect-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1068 | `pain-mood-impact-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1069 | `pain-multidisciplinary-pain-plan-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1070 | `pain-nerve-block-follow-up-documentation` | Pain Medicine | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1071 | `pain-neuropathic-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1072 | `pain-opioid-medication-review-documentation` | Pain Medicine | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1073 | `pain-post-discharge-pain-follow-up` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1074 | `pain-post-operative-pain-review` | Pain Medicine | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1075 | `pain-procedure-follow-up-documentation` | Pain Medicine | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1076 | `pain-safety-net-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1077 | `pain-self-management-discussion-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1078 | `pain-sleep-impact-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1079 | `pain-substance-risk-screening-pain-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1080 | `pain-work-impact-pain-documentation` | Pain Medicine | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1081 | `peds-acne-in-adolescent` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1082 | `peds-adhd-follow-up-documentation` | Pediatrics | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1083 | `peds-anxiety-symptoms-in-child` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1084 | `peds-autism-developmental-concern` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1085 | `peds-bedwetting-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1086 | `peds-behavior-concern-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1087 | `peds-bullying-related-health-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1088 | `peds-developmental-milestone-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1089 | `peds-diaper-rash-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1090 | `peds-ear-pain-follow-up-in-child` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1091 | `peds-eating-concern-in-adolescent` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1092 | `peds-family-social-stress-review-child` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1093 | `peds-feeding-difficulty` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1094 | `peds-food-allergy-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1095 | `peds-growing-pains-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1096 | `peds-growth-chart-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1097 | `peds-hearing-concern-in-child` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1098 | `peds-immunization-catch-up-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1099 | `peds-infant-colic-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1100 | `peds-infant-reflux-symptoms` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1101 | `peds-limping-child-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1102 | `peds-medication-allergy-documentation-child` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1103 | `peds-menstrual-concern-in-adolescent` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1104 | `peds-minor-head-injury-follow-up-child` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1105 | `peds-mood-concern-in-adolescent` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1106 | `peds-newborn-feeding-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1107 | `peds-newborn-jaundice-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1108 | `peds-obesity-follow-up-in-child` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1109 | `peds-pediatric-abdominal-pain-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1110 | `peds-pediatric-allergic-rhinitis` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1111 | `peds-pediatric-allergy-action-plan-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1112 | `peds-pediatric-anemia-result-review` | Pediatrics | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1113 | `peds-pediatric-asthma-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1114 | `peds-pediatric-chronic-disease-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1115 | `peds-pediatric-constipation` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1116 | `peds-pediatric-cough-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1117 | `peds-pediatric-diarrhea-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1118 | `peds-pediatric-dizziness` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1119 | `peds-pediatric-eczema-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1120 | `peds-pediatric-fatigue` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1121 | `peds-pediatric-fever-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1122 | `peds-pediatric-headache-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1123 | `peds-pediatric-injury-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1124 | `peds-pediatric-medication-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1125 | `peds-pediatric-rash-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1126 | `peds-pediatric-result-review` | Pediatrics | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1127 | `peds-pediatric-travel-advice-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1128 | `peds-pediatric-urinary-symptoms` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1129 | `peds-pediatric-vitamin-d-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1130 | `peds-pediatric-vomiting-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1131 | `peds-pediatric-wheeze-follow-up` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1132 | `peds-pediatric-wound-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1133 | `peds-poor-weight-gain` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1134 | `peds-post-viral-pediatric-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1135 | `peds-puberty-concern` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1136 | `peds-recurrent-infections-in-child` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1137 | `peds-safeguarding-prompt-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1138 | `peds-school-absence-note` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1139 | `peds-school-performance-concern` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1140 | `peds-short-stature-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1141 | `peds-sleep-difficulty-in-child` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1142 | `peds-speech-delay-concern` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1143 | `peds-sports-clearance-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1144 | `peds-tall-stature-review` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1145 | `peds-toilet-training-concern` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1146 | `peds-tonsil-symptoms-in-child` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1147 | `peds-underweight-follow-up-in-child` | Pediatrics | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1148 | `peds-vaccine-counseling-documentation` | Pediatrics | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1149 | `peds-vision-concern-in-child` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1150 | `peds-well-child-check` | Pediatrics | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1151 | `prev-advance-directive-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1152 | `prev-alcohol-risk-screening` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1153 | `prev-allergy-list-update` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1154 | `prev-annual-health-check` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1155 | `prev-blood-pressure-screening` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1156 | `prev-breast-cancer-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1157 | `prev-cancer-screening-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1158 | `prev-cardiovascular-risk-screening` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1159 | `prev-care-coordination-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1160 | `prev-caregiver-certificate-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1161 | `prev-cervical-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1162 | `prev-colon-cancer-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1163 | `prev-diabetes-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1164 | `prev-diet-counseling-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1165 | `prev-disability-support-form-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1166 | `prev-domestic-safety-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1167 | `prev-driving-medical-form` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1168 | `prev-exercise-counseling-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1169 | `prev-family-history-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1170 | `prev-financial-stress-health-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1171 | `prev-fitness-to-fly-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1172 | `prev-fitness-to-work-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1173 | `prev-flu-vaccine-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1174 | `prev-genetic-risk-referral-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1175 | `prev-hpv-vaccine-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1176 | `prev-insurance-medical-report` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1177 | `prev-lifestyle-goal-setting` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1178 | `prev-lipid-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1179 | `prev-medical-summary-letter` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1180 | `prev-medication-list-update` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1181 | `prev-obesity-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1182 | `prev-occupational-health-screening` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1183 | `prev-patient-requested-report` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1184 | `prev-pneumococcal-vaccine-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1185 | `prev-pre-employment-medical` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1186 | `prev-preventive-care-review` | Preventive care / screening / counseling / administrative documentation | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1187 | `prev-problem-list-reconciliation` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1188 | `prev-prostate-screening-discussion-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1189 | `prev-referral-letter-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1190 | `prev-results-explanation-visit` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1191 | `prev-return-to-work-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1192 | `prev-safeguarding-screening-prompt-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1193 | `prev-school-medical-form` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1194 | `prev-sexual-health-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1195 | `prev-shared-decision-making-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1196 | `prev-sick-leave-certificate` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1197 | `prev-sleep-counseling-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1198 | `prev-smoking-cessation-counseling-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1199 | `prev-social-determinants-review` | Preventive care / screening / counseling / administrative documentation | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1200 | `prev-sports-participation-form` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1201 | `prev-stress-counseling-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1202 | `prev-substance-use-screening-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1203 | `prev-travel-vaccination-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1204 | `prev-vaccination-counseling` | Preventive care / screening / counseling / administrative documentation | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1205 | `prev-work-accommodation-documentation` | Preventive care / screening / counseling / administrative documentation | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1206 | `psych-adhd-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1207 | `psych-adjustment-difficulty-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1208 | `psych-alcohol-use-mental-health-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1209 | `psych-anger-management-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1210 | `psych-antidepressant-follow-up-documentation` | Psychiatry / Mental Health outpatient | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1211 | `psych-anxiety-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1212 | `psych-autism-support-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1213 | `psych-bipolar-mood-symptom-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1214 | `psych-body-image-concern-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1215 | `psych-caffeine-and-anxiety-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1216 | `psych-cannabis-use-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1217 | `psych-caregiver-burnout-mental-health` | Psychiatry / Mental Health outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1218 | `psych-chronic-illness-adjustment-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1219 | `psych-crisis-contact-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1220 | `psych-digital-overuse-mental-health-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1221 | `psych-eating-pattern-concern` | Psychiatry / Mental Health outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1222 | `psych-exam-stress-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1223 | `psych-family-conflict-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1224 | `psych-functional-impairment-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1225 | `psych-generalized-worry-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1226 | `psych-grief-and-bereavement-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1227 | `psych-health-anxiety-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1228 | `psych-insomnia-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1229 | `psych-irritability-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1230 | `psych-loneliness-and-social-isolation-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1231 | `psych-low-mood-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1232 | `psych-medication-adherence-mental-health` | Psychiatry / Mental Health outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1233 | `psych-medication-change-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1234 | `psych-medication-side-effect-mental-health-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1235 | `psych-mindfulness-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1236 | `psych-mood-diary-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1237 | `psych-neurodiversity-accommodations-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1238 | `psych-occupational-functioning-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1239 | `psych-ocd-symptom-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1240 | `psych-panic-symptoms-follow-up` | Psychiatry / Mental Health outpatient | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1241 | `psych-perinatal-anxiety-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1242 | `psych-postpartum-mood-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1243 | `psych-psychiatry-referral-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1244 | `psych-psychology-referral-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1245 | `psych-psychosis-symptom-screening-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1246 | `psych-ptsd-symptom-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1247 | `psych-relapse-prevention-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1248 | `psych-relationship-stress-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1249 | `psych-return-to-work-mental-health-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1250 | `psych-safety-plan-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1251 | `psych-school-stress-adolescent` | Psychiatry / Mental Health outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1252 | `psych-self-harm-history-documentation-prompts` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1253 | `psych-sleep-hygiene-discussion-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1254 | `psych-social-anxiety-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1255 | `psych-stress-reaction-follow-up` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1256 | `psych-substance-use-screening-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1257 | `psych-suicidality-screening-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1258 | `psych-therapy-progress-review` | Psychiatry / Mental Health outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1259 | `psych-trauma-exposure-documentation` | Psychiatry / Mental Health outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1260 | `psych-work-related-stress-mental-health` | Psychiatry / Mental Health outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1261 | `renal-aki-follow-up-after-discharge` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1262 | `renal-albumin-creatinine-ratio-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1263 | `renal-anemia-in-ckd-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1264 | `renal-bone-mineral-ckd-result-review` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1265 | `renal-ckd-follow-up` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1266 | `renal-creatinine-trend-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1267 | `renal-cyst-result-discussion-documentation` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1268 | `renal-diabetic-kidney-disease-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1269 | `renal-dialysis-access-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1270 | `renal-edema-renal-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1271 | `renal-egfr-result-review` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1272 | `renal-electrolyte-abnormality-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1273 | `renal-fluid-status-renal-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1274 | `renal-hematuria-renal-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1275 | `renal-hemodialysis-clinic-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1276 | `renal-hyperkalemia-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1277 | `renal-hypertension-renal-risk-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1278 | `renal-hyponatremia-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1279 | `renal-kidney-stone-metabolic-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1280 | `renal-medication-adherence-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1281 | `renal-medication-renal-safety-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1282 | `renal-nephrology-referral-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1283 | `renal-nsaid-renal-risk-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1284 | `renal-peritoneal-dialysis-follow-up-documentation` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1285 | `renal-proteinuria-result-review` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1286 | `renal-recurrent-uti-renal-risk-review` | Nephrology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1287 | `renal-safety-net-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1288 | `renal-transplant-kidney-follow-up-documentation` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1289 | `renal-ultrasound-result-review` | Nephrology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1290 | `renal-urine-output-documentation` | Nephrology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1291 | `resp-allergic-airway-symptoms` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1292 | `resp-allergy-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1293 | `resp-asthma-action-plan-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1294 | `resp-asthma-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1295 | `resp-breathlessness-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1296 | `resp-bronchiectasis-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1297 | `resp-chest-infection-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1298 | `resp-chest-tightness-non-acute-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1299 | `resp-chest-x-ray-result-review` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1300 | `resp-chronic-cough-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1301 | `resp-chronic-cough-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1302 | `resp-copd-exacerbation-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1303 | `resp-copd-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1304 | `resp-cough-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1305 | `resp-cough-red-flag-screening-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1306 | `resp-cpap-follow-up-documentation` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1307 | `resp-ct-chest-result-discussion-documentation` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1308 | `resp-exercise-induced-bronchospasm-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1309 | `resp-flu-vaccine-respiratory-risk-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1310 | `resp-home-oxygen-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1311 | `resp-inhaler-technique-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1312 | `resp-interstitial-lung-disease-follow-up-documentation` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1313 | `resp-latent-tb-result-review` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1314 | `resp-long-covid-breathlessness-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1315 | `resp-medication-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1316 | `resp-nocturnal-breathlessness-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1317 | `resp-nocturnal-cough-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1318 | `resp-occupational-exposure-respiratory-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1319 | `resp-oxygen-saturation-trend-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1320 | `resp-peak-flow-diary-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1321 | `resp-pediatric-to-adult-asthma-transition-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1322 | `resp-pleural-effusion-follow-up-documentation` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1323 | `resp-pneumococcal-vaccine-respiratory-risk` | Respiratory outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1324 | `resp-post-covid-respiratory-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1325 | `resp-post-hospital-respiratory-follow-up` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1326 | `resp-post-pneumonia-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1327 | `resp-pulmonary-function-result-review` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1328 | `resp-pulmonary-nodule-result-review` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1329 | `resp-pulmonary-rehab-progress-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1330 | `resp-referral-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1331 | `resp-safety-net-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1332 | `resp-smoking-related-respiratory-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1333 | `resp-snoring-respiratory-review` | Respiratory outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1334 | `resp-spirometry-result-review` | Respiratory outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1335 | `resp-sputum-symptom-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1336 | `resp-travel-related-respiratory-symptoms` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1337 | `resp-tuberculosis-screening-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1338 | `resp-vaccine-counseling` | Respiratory outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1339 | `resp-vaping-related-respiratory-symptoms` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1340 | `resp-wheeze-documentation` | Respiratory outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1341 | `rheum-ana-result-discussion-documentation` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1342 | `rheum-ankylosing-spondylitis-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1343 | `rheum-anti-ccp-result-review` | Rheumatology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1344 | `rheum-autoimmune-blood-result-review` | Rheumatology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1345 | `rheum-back-pain-inflammatory-screening` | Rheumatology outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1346 | `rheum-biologic-therapy-monitoring-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1347 | `rheum-chronic-widespread-pain-rheumatology` | Rheumatology outpatient | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1348 | `rheum-connective-tissue-disease-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1349 | `rheum-dmard-monitoring-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1350 | `rheum-enthesitis-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1351 | `rheum-esr-crp-trend-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1352 | `rheum-fibromyalgia-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1353 | `rheum-flare-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1354 | `rheum-functional-impact-rheumatology-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1355 | `rheum-giant-cell-arteritis-screening-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1356 | `rheum-gout-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1357 | `rheum-inflammatory-arthritis-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1358 | `rheum-injection-follow-up-rheumatology` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1359 | `rheum-joint-swelling-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1360 | `rheum-lupus-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1361 | `rheum-medication-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1362 | `rheum-morning-stiffness-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1363 | `rheum-osteoporosis-rheumatology-review` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1364 | `rheum-polymyalgia-rheumatica-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1365 | `rheum-pseudogout-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1366 | `rheum-psoriatic-arthritis-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1367 | `rheum-raynaud-phenomenon-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1368 | `rheum-referral-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1369 | `rheum-rheumatoid-arthritis-follow-up` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1370 | `rheum-rheumatoid-factor-result-review` | Rheumatology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1371 | `rheum-safety-net-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1372 | `rheum-sj-gren-symptoms-documentation` | Rheumatology outpatient | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1373 | `rheum-steroid-side-effect-review-documentation` | Rheumatology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1374 | `rheum-uveitis-rheumatology-association-documentation` | Rheumatology outpatient | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1375 | `rheum-vasculitis-follow-up-documentation` | Rheumatology outpatient | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1376 | `surg-abdominal-wall-pain-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1377 | `surg-abscess-post-procedure-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1378 | `surg-anal-fissure-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1379 | `surg-anorectal-pain-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1380 | `surg-anticoagulation-perioperative-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1381 | `surg-appendicitis-post-discharge-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1382 | `surg-axillary-lump-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1383 | `surg-bariatric-pre-operative-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1384 | `surg-bariatric-surgery-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1385 | `surg-benign-breast-clinic-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1386 | `surg-biliary-colic-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1387 | `surg-biopsy-result-discussion` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1388 | `surg-breast-lump-surgical-clinic` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1389 | `surg-breast-pain-surgical-clinic` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1390 | `surg-carotid-clinic-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1391 | `surg-colorectal-clinic-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1392 | `surg-complication-screening-prompts` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1393 | `surg-consent-discussion-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1394 | `surg-day-surgery-follow-up-call-documentation` | General Surgery | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1395 | `surg-diabetic-foot-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1396 | `surg-drain-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1397 | `surg-drain-removal-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1398 | `surg-fissure-follow-up-surgical` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1399 | `surg-fistula-symptom-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1400 | `surg-gallbladder-imaging-result-review` | General Surgery | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1401 | `surg-gallstone-symptom-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1402 | `surg-groin-pain-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1403 | `surg-handover-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1404 | `surg-hematoma-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1405 | `surg-hemorrhoid-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1406 | `surg-hernia-imaging-result-review` | General Surgery | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1407 | `surg-hiatal-hernia-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1408 | `surg-hidradenitis-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1409 | `surg-incisional-hernia-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1410 | `surg-inguinal-hernia-clinic-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1411 | `surg-leg-ulcer-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1412 | `surg-lipoma-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1413 | `surg-lump-recurrence-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1414 | `surg-medication-reconciliation` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1415 | `surg-nutritional-status-surgical-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1416 | `surg-oncology-follow-up-documentation` | General Surgery | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1417 | `surg-parathyroid-clinic-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1418 | `surg-peripheral-vascular-symptom-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1419 | `surg-pilonidal-sinus-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1420 | `surg-post-appendectomy-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1421 | `surg-post-bowel-surgery-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1422 | `surg-post-breast-surgery-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1423 | `surg-post-cholecystectomy-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1424 | `surg-post-colonoscopy-surgical-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1425 | `surg-post-endoscopy-surgical-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1426 | `surg-post-hernia-repair-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1427 | `surg-post-operative-bowel-function-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1428 | `surg-post-operative-fever-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1429 | `surg-post-operative-nausea-documentation-surgical` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1430 | `surg-post-operative-pain-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1431 | `surg-post-operative-swelling-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1432 | `surg-post-operative-wound-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1433 | `surg-post-thyroid-surgery-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1434 | `surg-pre-operative-general-surgery-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1435 | `surg-rectal-bleeding-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1436 | `surg-referral-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1437 | `surg-reflux-surgical-clinic-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1438 | `surg-safety-net-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1439 | `surg-sebaceous-cyst-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1440 | `surg-second-opinion-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1441 | `surg-seroma-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1442 | `surg-skin-lump-surgical-assessment` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1443 | `surg-smoking-status-surgical-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1444 | `surg-staple-removal-surgical-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1445 | `surg-stoma-appliance-issue-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1446 | `surg-stoma-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1447 | `surg-suture-removal-surgical-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1448 | `surg-theatre-listing-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1449 | `surg-thyroid-nodule-surgical-clinic` | General Surgery | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1450 | `surg-umbilical-hernia-clinic-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1451 | `surg-upper-gi-surgical-follow-up` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1452 | `surg-varicose-vein-surgical-review` | General Surgery | 54 | 0 | 0 | 54 | 54 | `research_interrupted` | no | yes | no |
| 1453 | `surg-ward-review-documentation` | General Surgery | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1454 | `surg-wound-dehiscence-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1455 | `surg-wound-infection-concern-documentation` | General Surgery | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1456 | `uro-balanitis-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1457 | `uro-bladder-pain-symptoms` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1458 | `uro-catheter-care-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1459 | `uro-catheter-problem-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1460 | `uro-dysuria-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1461 | `uro-epididymal-symptoms` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1462 | `uro-erectile-dysfunction-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1463 | `uro-hematuria-documentation` | Urology | 55 | 0 | 0 | 55 | 55 | `research_interrupted` | no | yes | no |
| 1464 | `uro-hydrocele-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1465 | `uro-interstitial-cystitis-symptom-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1466 | `uro-kidney-stone-prevention-discussion-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1467 | `uro-lower-urinary-tract-symptoms-female` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1468 | `uro-lower-urinary-tract-symptoms-male` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1469 | `uro-male-fertility-concern` | Urology | 50 | 0 | 0 | 50 | 50 | `research_interrupted` | no | yes | no |
| 1470 | `uro-microscopic-hematuria-result-review` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1471 | `uro-neurogenic-bladder-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1472 | `uro-nocturia-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1473 | `uro-overactive-bladder-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1474 | `uro-pelvic-floor-symptom-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1475 | `uro-penile-lesion-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1476 | `uro-phimosis-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1477 | `uro-post-urology-procedure-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1478 | `uro-post-uti-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1479 | `uro-post-vasectomy-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1480 | `uro-prostate-symptom-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1481 | `uro-prostatitis-symptom-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1482 | `uro-psa-result-review` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1483 | `uro-recurrent-urinary-symptoms-without-infection` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1484 | `uro-recurrent-uti-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1485 | `uro-renal-colic-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1486 | `uro-renal-cyst-result-review` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1487 | `uro-scrotal-swelling-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1488 | `uro-stress-incontinence-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1489 | `uro-testicular-pain-follow-up` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1490 | `uro-ureteric-stent-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1491 | `uro-urge-incontinence-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1492 | `uro-urgency-symptoms-follow-up` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1493 | `uro-urinary-frequency-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1494 | `uro-urinary-incontinence-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1495 | `uro-urinary-retention-follow-up` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1496 | `uro-urine-culture-result-review` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1497 | `uro-urology-imaging-result-review` | Urology | 53 | 0 | 0 | 53 | 53 | `research_interrupted` | no | yes | no |
| 1498 | `uro-urology-medication-review` | Urology | 52 | 0 | 0 | 52 | 52 | `research_interrupted` | no | yes | no |
| 1499 | `uro-urology-referral-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |
| 1500 | `uro-vasectomy-counseling-documentation` | Urology | 51 | 0 | 0 | 51 | 51 | `research_interrupted` | no | yes | no |

## Appendix C — 300-record stratified removal sample

| Workflow | Specialty | Seq | Item type | Item | Source | Section | Prior runtime | Reused source/section | Existed | Removed | Unsupported | Research preserved | Status defensible |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `workflow_presentation` | `anes-airway-plan-documentation-review--workflow-presentation--chief-complaint` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `workflow_presentation` | `cardio-chest-pain--workflow-presentation--chief-complaint` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-af-follow-up` | Cardiology outpatient | 251 | `workflow_presentation` | `cardio-af-follow-up--workflow-presentation--chief-complaint` | `nice-atrial-fibrillation-ng196-2021` | `nice-ng196-risk-function-care-package` | no | yes/yes | yes | yes | yes | yes | yes |
| `derm-acne-scar-review` | Dermatology | 302 | `workflow_presentation` | `derm-acne-scar-review--workflow-presentation--chief-complaint` | `nice-acne-vulgaris-ng198-2026` | `nice-ng198-acne-scarring-review` | no | yes/yes | yes | yes | yes | yes | yes |
| `ent-adenoid-symptom-documentation` | ENT | 481 | `chip_symptoms` | `ent-adenoid-symptom-documentation--chip-symptoms--ent-adenoid-symptom-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `nice-ome-ng233-2023` | `nice-ng233-ome-recognition-assessment` | no | yes/yes | yes | yes | yes | yes | yes |
| `urgent-abdominal-pain` | Emergency / Urgent Care | 88 | `workflow_presentation` | `urgent-abdominal-pain--workflow-presentation--chief-complaint` | `dha-telehealth-abdominal-pain-adults-v2-2024` | `dha-abdominal-pain-adults-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `ed-abdominal-pain-documentation` | Emergency Medicine documentation-only | 376 | `chip_symptoms` | `ed-abdominal-pain-documentation--chip-symptoms--ed-abdominal-pain-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `dha-telehealth-abdominal-pain-adults-v2-2024` | `dha-abdominal-pain-adults-v2-history` | no | yes/yes | yes | yes | yes | yes | yes |
| `endo-adrenal-incidentaloma-referral` | Endocrinology | 139 | `workflow_presentation` | `endo-adrenal-incidentaloma-referral--workflow-presentation--chief-complaint` | `ese-adrenal-incidentaloma-2023` | `ese-adrenal-2023-imaging` | yes | yes/yes | yes | yes | yes | yes | yes |
| `endo-adrenal-incidentaloma-result-review` | Endocrinology / Diabetes / Metabolic | 436 | `chip_symptoms` | `endo-adrenal-incidentaloma-result-review--chip-symptoms--endo-adrenal-incidentaloma-result-review-symptoms-1-6-associated-symptoms-reviewed-if-relevant` | `ese-adrenal-incidentaloma-2023` | `ese-adrenal-2023-hormone-assessment` | no | yes/yes | yes | yes | yes | yes | yes |
| `gastro-abdominal-pain` | Gastroenterology | 122 | `workflow_presentation` | `gastro-abdominal-pain--workflow-presentation--chief-complaint` | `dha-telehealth-abdominal-pain-adults-v2-2024` | `dha-abdominal-pain-adults-v2-scope-applicability` | yes | yes/yes | yes | yes | yes | yes | yes |
| `gi-abdominal-bloating` | Gastroenterology outpatient | 571 | `chip_symptoms` | `gi-abdominal-bloating--chip-symptoms--gi-abdominal-bloating-symptoms-1-2-onset-duration-documented-if-discussed` | `nice-ibs-cg61-2025` | `nice-cg61-ibs-symptom-profile` | no | yes/yes | yes | yes | yes | yes | yes |
| `gp-abdominal-pain` | General Medicine / GP | 7 | `workflow_presentation` | `gp-abdominal-pain--workflow-presentation--chief-complaint` | `dha-telehealth-abdominal-pain-adults-v2-2024` | `dha-abdominal-pain-adults-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `geri-activities-of-daily-living-documentation` | Geriatrics | 541 | `chip_symptoms` | `geri-activities-of-daily-living-documentation--chip-symptoms--geri-activities-of-daily-living-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `nice-multimorbidity-ng56-2016` | `nice-ng56-identification-function-frailty` | no | yes/yes | yes | yes | yes | yes | yes |
| `neuro-dizziness` | Neurology | 104 | `workflow_presentation` | `neuro-dizziness--workflow-presentation--chief-complaint` | `dha-telehealth-dizziness-v2-2024` | `dha-dizziness-v2-scope-applicability` | yes | yes/yes | yes | yes | yes | yes | yes |
| `obgyn-antenatal-followup` | OB/GYN | 31 | `workflow_presentation` | `obgyn-antenatal-followup--workflow-presentation--chief-complaint` | `doh-antenatal-care-standard-v1-2024` | `doh-antenatal-v1-scope-routine-care` | yes | yes/yes | yes | yes | yes | yes | yes |
| `oph-allergic-conjunctivitis` | Ophthalmology | 162 | `workflow_presentation` | `oph-allergic-conjunctivitis--workflow-presentation--chief-complaint` | `dha-conjunctivitis-issue2-2024` | `dha-conjunctivitis-i2-features` | yes | yes/yes | yes | yes | yes | yes | yes |
| `msk-acute-sprain` | Orthopedics / MSK | 48 | `workflow_presentation` | `msk-acute-sprain--workflow-presentation--chief-complaint` | `dha-muscle-sprains-strains-issue2-2024` | `dha-sprains-i2-symptoms-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `peds-abdominal-pain` | Pediatrics | 25 | `workflow_presentation` | `peds-abdominal-pain--workflow-presentation--chief-complaint` | `rch-pic-acute-abdominal-pain-children-2024` | `rch-peds-abdominal-pain-2024-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `psych-anxiety` | Psychiatry / Mental Health | 75 | `workflow_presentation` | `psych-anxiety--workflow-presentation--chief-complaint` | `nice-gad-cg113-2020` | `nice-cg113-gad-identification-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `resp-asthma-followup` | Respiratory / Pulmonology | 111 | `workflow_presentation` | `resp-asthma-followup--workflow-presentation--chief-complaint` | `dha-telehealth-asthma-v2-2024` | `dha-asthma-v2-scope-applicability` | yes | yes/yes | yes | yes | yes | yes | yes |
| `neph-ckd-followup` | Urology / Nephrology | 148 | `workflow_presentation` | `neph-ckd-followup--workflow-presentation--chief-complaint` | `kdigo-ckd-evaluation-management-2024` | `kdigo-ckd-2024-detection-chronicity` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_exam_findings` | `anes-airway-plan-documentation-review--chip-exam-findings--anes-airway-plan-documentation-review-exam-findings-2-1-pre-perioperative-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_follow_up` | `cardio-chest-pain--chip-follow-up--cardio-chest-pain-follow-up-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_investigations` | `anes-airway-plan-documentation-review--chip-investigations--anes-airway-plan-documentation-review-investigations-4-1-preoperative-assessment-results-documented-if-reviewed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_plan_phrases` | `anes-airway-plan-documentation-review--chip-plan-phrases--anes-airway-plan-documentation-review-plan-phrases-5-3-risk-consent-discussion-documented-if-clinician-completed-it` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_red_flags` | `anes-airway-plan-documentation-review--chip-red-flags--anes-airway-plan-documentation-review-red-flags-3-1-airway-aspiration-allergy-bleeding-or-cardiorespiratory-risk` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_relevant_negatives` | `cardio-chest-pain--chip-relevant-negatives--cardio-chest-pain-relevant-negatives-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-1-airway-plan-documentation-only-review-interval-history-docum` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--bp` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `history_draft` | `cardio-chest-pain--history-draft--default-history-draft` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--1-1-ecg` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `legacy_diagnosis_label` | `anes-airway-plan-documentation-review--legacy-diagnosis-label--diagnosis` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `matching_alias` | `anes-airway-plan-documentation-review--matching-alias--alias-1` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `msk-knee-pain` | Orthopedics / MSK | 43 | `medication_documentation_option` | `msk-knee-pain--medication-documentation-option--3-2-msk-knee-imaging` | `dha-osteoarthritis-issue2-2024` | `dha-oa-i2-diagnosis-imaging` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `plan_documentation_option` | `anes-airway-plan-documentation-review--plan-documentation-option--1-2-anes-airway-plan-documentation-review-risk-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_exam_findings` | `anes-airway-plan-documentation-review--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_follow_up` | `cardio-chest-pain--preset-prechecked-follow-up--prechecked-follow-up-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_investigations` | `anes-airway-plan-documentation-review--preset-prechecked-investigations--prechecked-investigations-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_plan_phrases` | `anes-airway-plan-documentation-review--preset-prechecked-plan-phrases--prechecked-plan-phrases-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_relevant_negatives` | `cardio-chest-pain--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_symptoms` | `anes-airway-plan-documentation-review--preset-prechecked-symptoms--prechecked-symptoms-1` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_investigations` | `cardio-chest-pain--chip-investigations--cardio-chest-pain-investigations-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_investigations` | `cardio-chest-pain--chip-investigations--cardio-chest-pain-investigations-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_investigations` | `cardio-chest-pain--chip-investigations--cardio-chest-pain-investigations-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_investigations` | `cardio-chest-pain--chip-investigations--cardio-chest-pain-investigations-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_plan_phrases` | `cardio-chest-pain--chip-plan-phrases--cardio-chest-pain-plan-phrases-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_plan_phrases` | `cardio-chest-pain--chip-plan-phrases--cardio-chest-pain-plan-phrases-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-5` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_red_flags` | `cardio-chest-pain--chip-red-flags--cardio-chest-pain-red-flags-6` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_relevant_negatives` | `cardio-chest-pain--chip-relevant-negatives--cardio-chest-pain-relevant-negatives-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_relevant_negatives` | `cardio-chest-pain--chip-relevant-negatives--cardio-chest-pain-relevant-negatives-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_relevant_negatives` | `cardio-chest-pain--chip-relevant-negatives--cardio-chest-pain-relevant-negatives-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_relevant_negatives` | `cardio-chest-pain--chip-relevant-negatives--cardio-chest-pain-relevant-negatives-5` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-5` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-6` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-7` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `chip_symptoms` | `cardio-chest-pain--chip-symptoms--cardio-chest-pain-symptoms-8` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--1-2-troponin` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--2-1-cbc` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--2-2-crp` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--2-4-renal-function` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `investigation_documentation_option` | `cardio-chest-pain--investigation-documentation-option--3-1-chest-xray` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `legacy_diagnosis_label` | `cardio-chest-pain--legacy-diagnosis-label--diagnosis` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-10` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-4` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-5` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-6` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `matching_alias` | `cardio-chest-pain--matching-alias--alias-9` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `plan_documentation_option` | `cardio-chest-pain--plan-documentation-option--1-2-cardio-chest-pain-safety-netting` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `plan_documentation_option` | `cardio-chest-pain--plan-documentation-option--3-2-cardio-chest-pain-referral` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_investigations` | `cardio-chest-pain--preset-prechecked-investigations--prechecked-investigations-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_investigations` | `cardio-chest-pain--preset-prechecked-investigations--prechecked-investigations-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_investigations` | `cardio-chest-pain--preset-prechecked-investigations--prechecked-investigations-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-investigations` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_plan_phrases` | `cardio-chest-pain--preset-prechecked-plan-phrases--prechecked-plan-phrases-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-red-flags-referral` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_relevant_negatives` | `cardio-chest-pain--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_relevant_negatives` | `cardio-chest-pain--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_symptoms` | `cardio-chest-pain--preset-prechecked-symptoms--prechecked-symptoms-1` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_symptoms` | `cardio-chest-pain--preset-prechecked-symptoms--prechecked-symptoms-2` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-chest-pain` | Cardiology | 91 | `preset_prechecked_symptoms` | `cardio-chest-pain--preset-prechecked-symptoms--prechecked-symptoms-3` | `dha-telehealth-chest-pain-v2-2024` | `dha-chest-pain-v2-history` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_exam_findings` | `cardio-dyspnea--chip-exam-findings--cardio-dyspnea-exam-findings-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_exam_findings` | `cardio-dyspnea--chip-exam-findings--cardio-dyspnea-exam-findings-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_exam_findings` | `cardio-dyspnea--chip-exam-findings--cardio-dyspnea-exam-findings-3` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_exam_findings` | `cardio-dyspnea--chip-exam-findings--cardio-dyspnea-exam-findings-4` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_investigations` | `cardio-dyspnea--chip-investigations--cardio-dyspnea-investigations-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_investigations` | `cardio-dyspnea--chip-investigations--cardio-dyspnea-investigations-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_relevant_negatives` | `cardio-dyspnea--chip-relevant-negatives--cardio-dyspnea-relevant-negatives-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-3` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-4` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-5` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `chip_symptoms` | `cardio-dyspnea--chip-symptoms--cardio-dyspnea-symptoms-6` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--cardiac-auscultation` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--chest-auscultation` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--general-appearance` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--heart-rate` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--jvp` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--oxygen-saturation` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--pedal-oedema` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--respiratory-rate` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--temperature` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `examination_prompt` | `cardio-dyspnea--examination-prompt--work-of-breathing` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--1-1-ecg` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--1-2-oxygen-sat` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--1-3-vitals-review` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--2-1-bnp-ntprobnp` | `nice-chronic-heart-failure-ng106-2025` | `nice-ng106-diagnosis-assessment-tests` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--2-2-cbc` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--2-3-renal-function` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--3-1-chest-xray` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `investigation_documentation_option` | `cardio-dyspnea--investigation-documentation-option--3-2-echo` | `nice-chronic-heart-failure-ng106-2025` | `nice-ng106-diagnosis-assessment-tests` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `legacy_diagnosis_label` | `cardio-dyspnea--legacy-diagnosis-label--diagnosis` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `matching_alias` | `cardio-dyspnea--matching-alias--alias-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `matching_alias` | `cardio-dyspnea--matching-alias--alias-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `matching_alias` | `cardio-dyspnea--matching-alias--alias-3` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `matching_alias` | `cardio-dyspnea--matching-alias--alias-4` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `plan_documentation_option` | `cardio-dyspnea--plan-documentation-option--1-2-cardio-dyspnea-safety-netting` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-red-flags-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `plan_documentation_option` | `cardio-dyspnea--plan-documentation-option--3-2-cardio-dyspnea-referral` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-red-flags-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_exam_findings` | `cardio-dyspnea--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_exam_findings` | `cardio-dyspnea--preset-prechecked-exam-findings--prechecked-exam-findings-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_exam_findings` | `cardio-dyspnea--preset-prechecked-exam-findings--prechecked-exam-findings-3` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_investigations` | `cardio-dyspnea--preset-prechecked-investigations--prechecked-investigations-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_investigations` | `cardio-dyspnea--preset-prechecked-investigations--prechecked-investigations-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-assessment` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_relevant_negatives` | `cardio-dyspnea--preset-prechecked-relevant-negatives--prechecked-relevant-negatives-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_symptoms` | `cardio-dyspnea--preset-prechecked-symptoms--prechecked-symptoms-1` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_symptoms` | `cardio-dyspnea--preset-prechecked-symptoms--prechecked-symptoms-2` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-key-points` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `preset_prechecked_symptoms` | `cardio-dyspnea--preset-prechecked-symptoms--prechecked-symptoms-3` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-dyspnea` | Cardiology | 96 | `workflow_presentation` | `cardio-dyspnea--workflow-presentation--chief-complaint` | `nhs-england-adult-breathlessness-pathway-2023` | `nhs-england-breathlessness-2023-purpose-scope` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-heart-failure-followup` | Cardiology | 94 | `chip_exam_findings` | `cardio-heart-failure-followup--chip-exam-findings--cardio-heart-failure-followup-exam-findings-1` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-heart-failure-followup` | Cardiology | 94 | `chip_exam_findings` | `cardio-heart-failure-followup--chip-exam-findings--cardio-heart-failure-followup-exam-findings-2` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-heart-failure-followup` | Cardiology | 94 | `chip_exam_findings` | `cardio-heart-failure-followup--chip-exam-findings--cardio-heart-failure-followup-exam-findings-3` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-heart-failure-followup` | Cardiology | 94 | `chip_exam_findings` | `cardio-heart-failure-followup--chip-exam-findings--cardio-heart-failure-followup-exam-findings-4` | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `nhs-cm-hf-deterioration-assessment-page19` | yes | yes/yes | yes | yes | yes | yes | yes |
| `cardio-heart-failure-followup` | Cardiology | 94 | `chip_investigations` | `cardio-heart-failure-followup--chip-investigations--cardio-heart-failure-followup-investigations-1` | `nice-chronic-heart-failure-ng106-2025` | `nice-ng106-diagnosis-assessment-tests` | yes | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_exam_findings` | `anes-airway-plan-documentation-review--chip-exam-findings--anes-airway-plan-documentation-review-exam-findings-2-2-airway-assessment-documentation-if-assessed-documented-only` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_exam_findings` | `anes-airway-plan-documentation-review--chip-exam-findings--anes-airway-plan-documentation-review-exam-findings-2-3-cardiorespiratory-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_exam_findings` | `anes-airway-plan-documentation-review--chip-exam-findings--anes-airway-plan-documentation-review-exam-findings-2-4-risk-discussion-documentation-documented-only-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_investigations` | `anes-airway-plan-documentation-review--chip-investigations--anes-airway-plan-documentation-review-investigations-4-2-existing-investigations-documented-if-reviewed-by-clinician` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_investigations` | `anes-airway-plan-documentation-review--chip-investigations--anes-airway-plan-documentation-review-investigations-4-3-consent-risk-discussion-documentation-reviewed-if-available` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_plan_phrases` | `anes-airway-plan-documentation-review--chip-plan-phrases--anes-airway-plan-documentation-review-plan-phrases-5-1-clinician-entered-documentation-plan-recorded` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_plan_phrases` | `anes-airway-plan-documentation-review--chip-plan-phrases--anes-airway-plan-documentation-review-plan-phrases-5-2-senior-specialist-discussion-documented-if-already-performed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_red_flags` | `anes-airway-plan-documentation-review--chip-red-flags--anes-airway-plan-documentation-review-red-flags-3-2-consent-risk-discussion-documented-only-if-completed-by-clin` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-2-onset-duration-documented-if-discussed` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-3-change-since-last-review-documented` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-4-severity-impact-on-function-documented-if-discussed` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-5-associated-symptoms-reviewed-if-relevant` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-6-relevant-negatives-documented-if-assessed` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `chip_symptoms` | `anes-airway-plan-documentation-review--chip-symptoms--anes-airway-plan-documentation-review-symptoms-1-8-clinician-led-risk-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `plan_documentation_option` | `anes-airway-plan-documentation-review--plan-documentation-option--1-1-anes-airway-plan-documentation-review-clinician-documentation-plan` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `plan_documentation_option` | `anes-airway-plan-documentation-review--plan-documentation-option--1-4-anes-airway-plan-documentation-review-senior-or-specialist-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_exam_findings` | `anes-airway-plan-documentation-review--preset-prechecked-exam-findings--prechecked-exam-findings-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_exam_findings` | `anes-airway-plan-documentation-review--preset-prechecked-exam-findings--prechecked-exam-findings-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_investigations` | `anes-airway-plan-documentation-review--preset-prechecked-investigations--prechecked-investigations-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_investigations` | `anes-airway-plan-documentation-review--preset-prechecked-investigations--prechecked-investigations-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_plan_phrases` | `anes-airway-plan-documentation-review--preset-prechecked-plan-phrases--prechecked-plan-phrases-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_plan_phrases` | `anes-airway-plan-documentation-review--preset-prechecked-plan-phrases--prechecked-plan-phrases-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_symptoms` | `anes-airway-plan-documentation-review--preset-prechecked-symptoms--prechecked-symptoms-2` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-plan-documentation-review` | Anesthesia / Perioperative Medicine | 186 | `preset_prechecked_symptoms` | `anes-airway-plan-documentation-review--preset-prechecked-symptoms--prechecked-symptoms-3` | `doh-day-surgery-procedure-standard-v1-2024` | `doh-day-surgery-assessment-care-plan` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_exam_findings` | `anes-airway-review-documentation--chip-exam-findings--anes-airway-review-documentation-exam-findings-2-1-pre-perioperative-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_exam_findings` | `anes-airway-review-documentation--chip-exam-findings--anes-airway-review-documentation-exam-findings-2-2-airway-assessment-documentation-if-assessed-documented-only` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_exam_findings` | `anes-airway-review-documentation--chip-exam-findings--anes-airway-review-documentation-exam-findings-2-3-cardiorespiratory-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_exam_findings` | `anes-airway-review-documentation--chip-exam-findings--anes-airway-review-documentation-exam-findings-2-4-risk-discussion-documentation-documented-only-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_investigations` | `anes-airway-review-documentation--chip-investigations--anes-airway-review-documentation-investigations-4-1-preoperative-assessment-results-documented-if-reviewed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_investigations` | `anes-airway-review-documentation--chip-investigations--anes-airway-review-documentation-investigations-4-2-existing-investigations-documented-if-reviewed-by-clinician` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_investigations` | `anes-airway-review-documentation--chip-investigations--anes-airway-review-documentation-investigations-4-3-consent-risk-discussion-documentation-reviewed-if-available` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_plan_phrases` | `anes-airway-review-documentation--chip-plan-phrases--anes-airway-review-documentation-plan-phrases-5-1-clinician-entered-documentation-plan-recorded` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_plan_phrases` | `anes-airway-review-documentation--chip-plan-phrases--anes-airway-review-documentation-plan-phrases-5-2-senior-specialist-discussion-documented-if-already-performed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_plan_phrases` | `anes-airway-review-documentation--chip-plan-phrases--anes-airway-review-documentation-plan-phrases-5-3-risk-consent-discussion-documented-if-clinician-completed-it` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_red_flags` | `anes-airway-review-documentation--chip-red-flags--anes-airway-review-documentation-red-flags-3-1-airway-aspiration-allergy-bleeding-or-cardiorespiratory-risk` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_red_flags` | `anes-airway-review-documentation--chip-red-flags--anes-airway-review-documentation-red-flags-3-2-consent-risk-discussion-documented-only-if-completed-by-clin` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-1-airway-review-documentation-interval-history-documented` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-3-change-since-last-review-documented` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-4-severity-impact-on-function-documented-if-discussed` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-5-associated-symptoms-reviewed-if-relevant` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-6-relevant-negatives-documented-if-assessed` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `chip_symptoms` | `anes-airway-review-documentation--chip-symptoms--anes-airway-review-documentation-symptoms-1-8-clinician-led-risk-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `legacy_diagnosis_label` | `anes-airway-review-documentation--legacy-diagnosis-label--diagnosis` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `matching_alias` | `anes-airway-review-documentation--matching-alias--alias-1` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `plan_documentation_option` | `anes-airway-review-documentation--plan-documentation-option--1-1-anes-airway-review-documentation-clinician-documentation-plan` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `plan_documentation_option` | `anes-airway-review-documentation--plan-documentation-option--1-2-anes-airway-review-documentation-risk-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `plan_documentation_option` | `anes-airway-review-documentation--plan-documentation-option--1-4-anes-airway-review-documentation-senior-or-specialist-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_exam_findings` | `anes-airway-review-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_exam_findings` | `anes-airway-review-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_exam_findings` | `anes-airway-review-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_investigations` | `anes-airway-review-documentation--preset-prechecked-investigations--prechecked-investigations-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_investigations` | `anes-airway-review-documentation--preset-prechecked-investigations--prechecked-investigations-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_investigations` | `anes-airway-review-documentation--preset-prechecked-investigations--prechecked-investigations-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_plan_phrases` | `anes-airway-review-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_plan_phrases` | `anes-airway-review-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_plan_phrases` | `anes-airway-review-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_symptoms` | `anes-airway-review-documentation--preset-prechecked-symptoms--prechecked-symptoms-1` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_symptoms` | `anes-airway-review-documentation--preset-prechecked-symptoms--prechecked-symptoms-2` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `preset_prechecked_symptoms` | `anes-airway-review-documentation--preset-prechecked-symptoms--prechecked-symptoms-3` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-airway-review-documentation` | Anesthesia / Perioperative Medicine | 187 | `workflow_presentation` | `anes-airway-review-documentation--workflow-presentation--chief-complaint` | `asa-basic-preanesthesia-care-2020` | `asa-basic-preanesthesia-interview-exam` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_exam_findings` | `anes-allergy-clarification--chip-exam-findings--anes-allergy-clarification-exam-findings-2-1-pre-perioperative-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_exam_findings` | `anes-allergy-clarification--chip-exam-findings--anes-allergy-clarification-exam-findings-2-2-airway-assessment-documentation-if-assessed-documented-only` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_exam_findings` | `anes-allergy-clarification--chip-exam-findings--anes-allergy-clarification-exam-findings-2-3-cardiorespiratory-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_exam_findings` | `anes-allergy-clarification--chip-exam-findings--anes-allergy-clarification-exam-findings-2-4-risk-discussion-documentation-documented-only-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_investigations` | `anes-allergy-clarification--chip-investigations--anes-allergy-clarification-investigations-4-1-preoperative-assessment-results-documented-if-reviewed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_investigations` | `anes-allergy-clarification--chip-investigations--anes-allergy-clarification-investigations-4-2-existing-investigations-documented-if-reviewed-by-clinician` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_investigations` | `anes-allergy-clarification--chip-investigations--anes-allergy-clarification-investigations-4-3-consent-risk-discussion-documentation-reviewed-if-available` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_plan_phrases` | `anes-allergy-clarification--chip-plan-phrases--anes-allergy-clarification-plan-phrases-5-1-clinician-entered-documentation-plan-recorded` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_plan_phrases` | `anes-allergy-clarification--chip-plan-phrases--anes-allergy-clarification-plan-phrases-5-2-senior-specialist-discussion-documented-if-already-performed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_plan_phrases` | `anes-allergy-clarification--chip-plan-phrases--anes-allergy-clarification-plan-phrases-5-3-risk-consent-discussion-documented-if-clinician-completed-it` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_red_flags` | `anes-allergy-clarification--chip-red-flags--anes-allergy-clarification-red-flags-3-1-airway-aspiration-allergy-bleeding-or-cardiorespiratory-risk` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_red_flags` | `anes-allergy-clarification--chip-red-flags--anes-allergy-clarification-red-flags-3-2-consent-risk-discussion-documented-only-if-completed-by-clin` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-1-anesthesia-allergy-clarification-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-2-onset-duration-documented-if-discussed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-3-severity-impact-on-function-documented-if-discussed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-4-associated-symptoms-reviewed-if-relevant` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-5-relevant-negatives-documented-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `chip_symptoms` | `anes-allergy-clarification--chip-symptoms--anes-allergy-clarification-symptoms-1-7-clinician-led-risk-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `legacy_diagnosis_label` | `anes-allergy-clarification--legacy-diagnosis-label--diagnosis` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `matching_alias` | `anes-allergy-clarification--matching-alias--alias-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `plan_documentation_option` | `anes-allergy-clarification--plan-documentation-option--1-1-anes-allergy-clarification-clinician-documentation-plan` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `plan_documentation_option` | `anes-allergy-clarification--plan-documentation-option--1-2-anes-allergy-clarification-risk-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `plan_documentation_option` | `anes-allergy-clarification--plan-documentation-option--1-4-anes-allergy-clarification-senior-or-specialist-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_exam_findings` | `anes-allergy-clarification--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_exam_findings` | `anes-allergy-clarification--preset-prechecked-exam-findings--prechecked-exam-findings-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_exam_findings` | `anes-allergy-clarification--preset-prechecked-exam-findings--prechecked-exam-findings-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_investigations` | `anes-allergy-clarification--preset-prechecked-investigations--prechecked-investigations-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_investigations` | `anes-allergy-clarification--preset-prechecked-investigations--prechecked-investigations-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_investigations` | `anes-allergy-clarification--preset-prechecked-investigations--prechecked-investigations-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_plan_phrases` | `anes-allergy-clarification--preset-prechecked-plan-phrases--prechecked-plan-phrases-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_plan_phrases` | `anes-allergy-clarification--preset-prechecked-plan-phrases--prechecked-plan-phrases-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_plan_phrases` | `anes-allergy-clarification--preset-prechecked-plan-phrases--prechecked-plan-phrases-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_symptoms` | `anes-allergy-clarification--preset-prechecked-symptoms--prechecked-symptoms-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_symptoms` | `anes-allergy-clarification--preset-prechecked-symptoms--prechecked-symptoms-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `preset_prechecked_symptoms` | `anes-allergy-clarification--preset-prechecked-symptoms--prechecked-symptoms-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-allergy-clarification` | Anesthesia / Perioperative Medicine | 188 | `workflow_presentation` | `anes-allergy-clarification--workflow-presentation--chief-complaint` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_exam_findings` | `anes-asa-status-documentation--chip-exam-findings--anes-asa-status-documentation-exam-findings-2-1-pre-perioperative-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_exam_findings` | `anes-asa-status-documentation--chip-exam-findings--anes-asa-status-documentation-exam-findings-2-2-airway-assessment-documentation-if-assessed-documented-only` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_exam_findings` | `anes-asa-status-documentation--chip-exam-findings--anes-asa-status-documentation-exam-findings-2-3-cardiorespiratory-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_exam_findings` | `anes-asa-status-documentation--chip-exam-findings--anes-asa-status-documentation-exam-findings-2-4-risk-discussion-documentation-documented-only-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_investigations` | `anes-asa-status-documentation--chip-investigations--anes-asa-status-documentation-investigations-4-1-preoperative-assessment-results-documented-if-reviewed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_investigations` | `anes-asa-status-documentation--chip-investigations--anes-asa-status-documentation-investigations-4-2-existing-investigations-documented-if-reviewed-by-clinician` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_investigations` | `anes-asa-status-documentation--chip-investigations--anes-asa-status-documentation-investigations-4-3-consent-risk-discussion-documentation-reviewed-if-available` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_plan_phrases` | `anes-asa-status-documentation--chip-plan-phrases--anes-asa-status-documentation-plan-phrases-5-1-clinician-entered-documentation-plan-recorded` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_plan_phrases` | `anes-asa-status-documentation--chip-plan-phrases--anes-asa-status-documentation-plan-phrases-5-2-senior-specialist-discussion-documented-if-already-performed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_plan_phrases` | `anes-asa-status-documentation--chip-plan-phrases--anes-asa-status-documentation-plan-phrases-5-3-risk-consent-discussion-documented-if-clinician-completed-it` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_red_flags` | `anes-asa-status-documentation--chip-red-flags--anes-asa-status-documentation-red-flags-3-1-airway-aspiration-allergy-bleeding-or-cardiorespiratory-risk` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_red_flags` | `anes-asa-status-documentation--chip-red-flags--anes-asa-status-documentation-red-flags-3-2-consent-risk-discussion-documented-only-if-completed-by-clin` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-1-asa-status-documentation-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-3-severity-impact-on-function-documented-if-discussed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-4-associated-symptoms-reviewed-if-relevant` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-5-relevant-negatives-documented-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `chip_symptoms` | `anes-asa-status-documentation--chip-symptoms--anes-asa-status-documentation-symptoms-1-7-clinician-led-risk-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `legacy_diagnosis_label` | `anes-asa-status-documentation--legacy-diagnosis-label--diagnosis` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `matching_alias` | `anes-asa-status-documentation--matching-alias--alias-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `plan_documentation_option` | `anes-asa-status-documentation--plan-documentation-option--1-1-anes-asa-status-documentation-clinician-documentation-plan` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `plan_documentation_option` | `anes-asa-status-documentation--plan-documentation-option--1-2-anes-asa-status-documentation-risk-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `plan_documentation_option` | `anes-asa-status-documentation--plan-documentation-option--1-4-anes-asa-status-documentation-senior-or-specialist-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_exam_findings` | `anes-asa-status-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_exam_findings` | `anes-asa-status-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_exam_findings` | `anes-asa-status-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_investigations` | `anes-asa-status-documentation--preset-prechecked-investigations--prechecked-investigations-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_investigations` | `anes-asa-status-documentation--preset-prechecked-investigations--prechecked-investigations-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_investigations` | `anes-asa-status-documentation--preset-prechecked-investigations--prechecked-investigations-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_plan_phrases` | `anes-asa-status-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_plan_phrases` | `anes-asa-status-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_plan_phrases` | `anes-asa-status-documentation--preset-prechecked-plan-phrases--prechecked-plan-phrases-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_symptoms` | `anes-asa-status-documentation--preset-prechecked-symptoms--prechecked-symptoms-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_symptoms` | `anes-asa-status-documentation--preset-prechecked-symptoms--prechecked-symptoms-2` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `preset_prechecked_symptoms` | `anes-asa-status-documentation--preset-prechecked-symptoms--prechecked-symptoms-3` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-asa-status-documentation` | Anesthesia / Perioperative Medicine | 189 | `workflow_presentation` | `anes-asa-status-documentation--workflow-presentation--chief-complaint` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_exam_findings` | `anes-blood-product-discussion-documentation--chip-exam-findings--anes-blood-product-discussion-documentation-exam-findings-2-1-pre-perioperative-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_exam_findings` | `anes-blood-product-discussion-documentation--chip-exam-findings--anes-blood-product-discussion-documentation-exam-findings-2-2-airway-assessment-documentation-if-assessed-documented-only` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_exam_findings` | `anes-blood-product-discussion-documentation--chip-exam-findings--anes-blood-product-discussion-documentation-exam-findings-2-3-cardiorespiratory-assessment-documentation-documented-only-i` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_exam_findings` | `anes-blood-product-discussion-documentation--chip-exam-findings--anes-blood-product-discussion-documentation-exam-findings-2-4-risk-discussion-documentation-documented-only-if-assessed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_investigations` | `anes-blood-product-discussion-documentation--chip-investigations--anes-blood-product-discussion-documentation-investigations-4-1-preoperative-assessment-results-documented-if-reviewed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_investigations` | `anes-blood-product-discussion-documentation--chip-investigations--anes-blood-product-discussion-documentation-investigations-4-2-existing-investigations-documented-if-reviewed-by-clinician` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_investigations` | `anes-blood-product-discussion-documentation--chip-investigations--anes-blood-product-discussion-documentation-investigations-4-3-consent-risk-discussion-documentation-reviewed-if-available` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_plan_phrases` | `anes-blood-product-discussion-documentation--chip-plan-phrases--anes-blood-product-discussion-documentation-plan-phrases-5-1-clinician-entered-documentation-plan-recorded` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_plan_phrases` | `anes-blood-product-discussion-documentation--chip-plan-phrases--anes-blood-product-discussion-documentation-plan-phrases-5-2-senior-specialist-discussion-documented-if-already-performed` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_plan_phrases` | `anes-blood-product-discussion-documentation--chip-plan-phrases--anes-blood-product-discussion-documentation-plan-phrases-5-3-risk-consent-discussion-documented-if-clinician-completed-it` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_red_flags` | `anes-blood-product-discussion-documentation--chip-red-flags--anes-blood-product-discussion-documentation-red-flags-3-1-airway-aspiration-allergy-bleeding-or-cardiorespiratory-risk` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_red_flags` | `anes-blood-product-discussion-documentation--chip-red-flags--anes-blood-product-discussion-documentation-red-flags-3-2-consent-risk-discussion-documented-only-if-completed-by-clin` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-1-blood-product-discussion-documentation-context-documented` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-2-onset-duration-documented-if-discussed` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-3-severity-impact-on-function-documented-if-discussed` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-4-associated-symptoms-reviewed-if-relevant` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-5-relevant-negatives-documented-if-assessed` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `chip_symptoms` | `anes-blood-product-discussion-documentation--chip-symptoms--anes-blood-product-discussion-documentation-symptoms-1-7-clinician-led-risk-context-documented` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `legacy_diagnosis_label` | `anes-blood-product-discussion-documentation--legacy-diagnosis-label--diagnosis` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `matching_alias` | `anes-blood-product-discussion-documentation--matching-alias--alias-1` | `asa-perioperative-blood-management-2015` | `asa-blood-product-discussion` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `plan_documentation_option` | `anes-blood-product-discussion-documentation--plan-documentation-option--1-1-anes-blood-product-discussion-documentation-clinician-documentation-plan` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `plan_documentation_option` | `anes-blood-product-discussion-documentation--plan-documentation-option--1-2-anes-blood-product-discussion-documentation-risk-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `plan_documentation_option` | `anes-blood-product-discussion-documentation--plan-documentation-option--1-4-anes-blood-product-discussion-documentation-senior-or-specialist-discussion` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |
| `anes-blood-product-discussion-documentation` | Anesthesia / Perioperative Medicine | 190 | `preset_prechecked_exam_findings` | `anes-blood-product-discussion-documentation--preset-prechecked-exam-findings--prechecked-exam-findings-1` | `asa-documentation-anesthesia-care-2023` | `asa-documentation-preanesthesia` | no | yes/yes | yes | yes | yes | yes | yes |

## Appendix D — metadata cleanup records

| Workflow | Differed from audit start | Restored to pre-GP record | Semantic fields preserved | Mapping changed | Status changed |
| --- | --- | --- | --- | --- | --- |
| `gp-allergic-symptoms` | yes | yes | yes | no | no |
| `gp-anemia-result-review` | yes | yes | yes | no | no |
| `gp-axillary-lump` | yes | yes | yes | no | no |
| `gp-breast-pain` | yes | yes | yes | no | no |
| `gp-bruising-tendency` | yes | yes | yes | no | no |
| `gp-caffeine-intake-documentation` | yes | yes | yes | no | no |
| `gp-caregiver-stress` | yes | yes | yes | no | no |
| `gp-caregiver-support-documentation` | yes | yes | yes | no | no |
| `gp-dietary-counseling-documentation` | yes | yes | yes | no | no |
| `gp-driving-medical-form` | yes | yes | yes | no | no |
| `gp-excessive-sweating` | yes | yes | yes | no | no |
| `gp-exercise-counseling-documentation` | yes | yes | yes | no | no |
| `gp-family-history-risk-review` | yes | yes | yes | no | no |
| `gp-fever-follow-up` | yes | yes | yes | no | no |
| `gp-financial-stress-health-impact` | yes | yes | yes | no | no |
| `gp-fitness-to-work-review` | yes | yes | yes | no | no |
| `gp-general-wellness-review` | yes | yes | yes | no | no |
| `gp-halitosis` | yes | yes | yes | no | no |
| `gp-health-anxiety-documentation` | yes | yes | yes | no | no |

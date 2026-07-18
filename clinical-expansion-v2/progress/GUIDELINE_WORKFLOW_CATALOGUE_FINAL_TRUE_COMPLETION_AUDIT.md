# Guideline Workflow Catalogue — Final True-Completion Audit

## Verdict

**GUIDELINE_WORKFLOW_CATALOGUE_FINAL_AUDIT_BLOCKED**

The catalogue is not clinically complete. The audit automatically reopened every
invalid final classification and the local beta is fail-closed: no workflow is
exposed as resolved until the required evidence is present. Workflow research
must continue from `gp-fever-urti`; this audit does not authorize deployment,
push, approval, or queue completion.

## Run identity and boundaries

- Repository: `najm-ai-clinicnote-v2`
- Branch: `guideline-workflow-resolution-v1`
- Starting HEAD: `46903a2ffa132c7772abf39680d9c28516aa5cb0`
- Ending HEAD: recorded by the final audit commit and returned with this report
- Audit date: 2026-07-18 (Asia/Dubai)
- No Git operation was active at the audit start.
- Production `public/data` was unchanged.
- Canonical and signed state were unchanged.
- Mappings and candidates remain `0 / 0`.
- Exclusions remain `12`.
- No clinician or owner review queue was created.
- No push, deployment, merge, rebase, signing, or approval was performed.

## Automatic repair and final state

The true-completion audit compared the persisted classifications with the
critical-section contract, retirement evidence contract, and blocked-access
contract. It removed invalid final records, set their worker state to an
evidence-gap state, recomputed the queue, and rebuilt the local beta dataset.

Before repair, the persisted report claimed:

| Classification | Count |
|---|---:|
| `reconstructed_with_noncritical_documented_limitations` | 1048 |
| `retired_no_authoritative_basis` | 401 |
| `blocked_source_access` | 51 |
| **Total** | **1500** |

The audit found and reopened:

- **1047** active records with at least one applicable critical section missing.
- **401** retirements without the required multiple structured full-document
  attempts and targeted-search records.
- **51** blocked records without structured full-source access evidence and
  documented alternatives.

The 1048th previously active record (`gp-fever-urti`) was independently repaired
but still failed the critical-section gate, so it is also pending. The final
authoritative state is therefore:

| Final state | Count |
|---|---:|
| `reconstructed_complete` | 0 |
| `reconstructed_with_noncritical_documented_limitations` | 0 |
| `merged_into_supported_workflow` | 0 |
| `retired_no_authoritative_basis` | 0 |
| `retired_duplicate_or_overlapping` | 0 |
| `retired_out_of_scope_or_unsafe` | 0 |
| `blocked_source_access` | 0 |
| **Pending `evidence_gap_research_required` / additional sources required** | **1500** |

`WORKFLOW_RESOLUTION_STATE.json` now records `0` final-status records,
`1500` pending workflows, no retired or blocked final records, and exact next
workflow `gp-fever-urti`. The fail-closed worker stops with
`GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS` while these critical gaps remain.

## Evidence-gap blockers

The prior active set was not eligible for a noncritical limitation status. The
TRUE status audit recorded these applicable-but-missing sections across the
catalogue:

| Section | Workflows missing |
|---|---:|
| `focused_history` | 1499 |
| `escalation_criteria` | 1495 |
| `assessment_structure` | 1304 |
| `follow_up` | 1304 |
| `medication_history` | 759 |
| `investigations` | 712 |
| `pharmacological_management` | 123 |
| `pregnancy_reproductive` | 69 |
| `red_flags` | 188 |
| `focused_examination` | 196 |
| `safety_netting` | 196 |
| `associated_symptoms` | 186 |
| `relevant_negative_symptoms` | 196 |

The repaired `gp-fever-urti` record still lacks
`medication_history`, `pharmacological_management`, `assessment_structure`,
`follow_up`, and `pregnancy_reproductive`. It remains pending rather than being
presented as complete.

## Research and source audit

- Research iterations audited: `1048`.
- Unique full guideline documents inspected: `210`.
- Existing documents reopened: `210`.
- New authoritative documents registered during this audit: `0`.
- Source URLs inspected: `210`.
- Unique source fingerprints: `209`.
- Guideline families represented: `400`.
- Recorded source-access failures: `40`.
- Rejected source attempts recorded: `0`.
- Evidence gaps remaining after fail-closed repair: `1048` active research
  gaps, plus invalid retirement and blocked-access records reopened into the
  same pending queue.

All 1500 workflows are now internal evidence-gap work. No generated detail is
treated as publishable catalogue content.

## Reconstruction and beta accounting

The pre-audit generated comparison manifest remains an accounting record only:

- Legacy items compared: `83,303`.
- Retained: `624`.
- Rewritten: `2,585`.
- Added: `2,942`.
- Removed from the generated candidate manifest: `80,094`.
- Candidate items: `6,151`.

The local beta builder preserves the legacy `item_count` (`83,303`) so the
curation validator can reconcile the comparison manifest, but exposes no active
workflow content:

- Usable workflow count: `0`.
- Unavailable workflow count: `1,500`.
- Active catalogue items exposed: `0`.
- `public/data-beta/curated-workflows/unavailable-content.json` contains all
  1500 pending workflow IDs.

Because no workflow qualifies as active, the applicable-core-section count in
the exposed catalogue is zero; pending workflows retain the unresolved missing
sections above. No browser beta smoke test was run because there is no usable
route to validate and the audit is blocked.

## Deep sample result

The deterministic sample included `gp-fever-urti`, `gp-cough`,
`gp-chest-pain`, `gp-shortness-of-breath`, `gp-abdominal-pain`, `peds-fever`,
`peds-poor-feeding`, `obgyn-antenatal-followup`, `ed-anaphylaxis-documentation`,
`cardio-hypertension-annual-review`, `gp-medication-reconciliation-after-discharge`,
`psych-anxiety`, `derm-rash`, `ophth-red-eye`, `uro-urology-medication-review`,
`ed-burn-documentation`, `pain-cervical-clinic-review`,
`icu-agitation-documentation`, `gastro-gerd`, and
`icu-renal-replacement-therapy-documentation`. Source documents and item
comparisons were present for most sampled records, but none qualified for the
active catalogue because the critical-section gate remains unmet. The sample
therefore correctly fails closed rather than implying full support.

## Reproducibility and fingerprints

The existing source metadata reproducibility verifier passed independently:

- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay manifest fingerprint:
  `53109420feff822fa7d82266c7a6325135b5092a7b3c2662f5055e8d995edbf0`
- Source count and replay source count: `235 / 235`.
- Replay modules: `151`.
- Active/replay/stored metadata fingerprints matched.
- Persisted date provenance, recency, committed replay, and public-data
  reconciliation all passed.

The resolution-state output fingerprint after repair is:

`ebe9132bd1027572dc3cec0aad9d47bda6eb248f4b4a0e710b2297953471485a`

## Validation results

| Check | Result |
|---|---|
| `test:workflow-resolution-worker` | PASS (2 tests) |
| `test:safety` | PASS (16 tests) |
| `test:all-workflows` | PASS (1500 workflows, 1500 overlays, 1500 research records) |
| `test:output-safety` | PASS |
| `validate:source-evidence` | PASS (235 registered sources) |
| `validate:item-provenance` | PASS (83,303 items) |
| `validate:direct-guideline-curation` | PASS; active workflows 0, legacy accounting 83,303 |
| `validate:data` | PASS (1500 workflows, 12 exclusions) |
| `audit:research-claims` | PASS (1500 claims checked) |
| `audit:source-recency` | PASS (235 sources; 23 recheck due) |
| `verify:clinical-data-reproducibility` | PASS |
| `lint` | PASS with pre-existing warnings |
| `build` | PASS |
| `reconstruct:resolve-all` | EXPECTED FAIL-CLOSED `GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS` |

The worker’s expected non-zero stop is a blocker, not a validation defect: it
proves that unresolved critical sections cannot silently become final output.

## Protected-state confirmation

Production `public/data` is unchanged. Source registries, mappings, candidates,
canonical approval/signature state, and exclusions were not altered. No workflow
research queue continuation, deployment, push, merge, rebase, signing, or
approval was performed.

## Required next action

Continue authoritative, section-targeted research from `gp-fever-urti`, record
structured source attempts and evidence for every missing critical section, and
re-run this audit only after the worker can produce a genuinely supported final
classification. Until then the true-completion verdict remains:

**GUIDELINE_WORKFLOW_CATALOGUE_FINAL_AUDIT_BLOCKED**

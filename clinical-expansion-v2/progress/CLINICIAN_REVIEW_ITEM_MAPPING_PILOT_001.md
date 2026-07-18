# Clinician Review and Item-Mapping Pilot 001

## Milestone and authority

- Branch: `clinician-review-item-mapping-pilot-v1`
- Starting milestone HEAD: `07eb099512f976a329c40b1b59a8f963b16d7b87`
- Pilot scope: the first 25 eligible `partial_exact_source_verified` workflows in baseline workflow order
- Research scope: completed source-first evidence only; no new broad research and no workflow changes
- Authority: candidate preparation only; no qualified-clinician decision, approval, signature, or supported mapping was created

The completed 1,500-workflow research milestone was frozen before branch creation. The research queue was complete, no workflow 1501 existed, all five freeze commands passed, and mappings/candidates were `0 / 0` at selection time.

## Selected workflows

| Position | Workflow | Specialty | Items | Candidate links | Unsupported items | Safety review |
|---:|---|---|---:|---:|---:|---:|
| 1 | `gp-fever-urti` | General Medicine / GP | 127 | 0 | 127 | 38 |
| 2 | `gp-cough` | General Medicine / GP | 108 | 0 | 108 | 31 |
| 3 | `gp-sore-throat` | General Medicine / GP | 98 | 0 | 98 | 26 |
| 4 | `gp-headache` | General Medicine / GP | 99 | 0 | 99 | 26 |
| 5 | `gp-dizziness` | General Medicine / GP | 95 | 0 | 95 | 22 |
| 6 | `gp-fatigue` | General Medicine / GP | 102 | 43 | 59 | 32 |
| 7 | `gp-abdominal-pain` | General Medicine / GP | 109 | 43 | 66 | 37 |
| 8 | `gp-nausea` | General Medicine / GP | 87 | 38 | 49 | 21 |
| 9 | `gp-diarrhea` | General Medicine / GP | 87 | 46 | 41 | 22 |
| 10 | `gp-constipation` | General Medicine / GP | 86 | 33 | 53 | 22 |
| 11 | `gp-chest-pain` | General Medicine / GP | 107 | 53 | 54 | 32 |
| 12 | `gp-palpitations` | General Medicine / GP | 96 | 51 | 45 | 30 |
| 13 | `gp-shortness-of-breath` | General Medicine / GP | 106 | 52 | 54 | 32 |
| 14 | `gp-hypertension-followup` | General Medicine / GP | 94 | 48 | 46 | 40 |
| 15 | `gp-diabetes-followup` | General Medicine / GP | 97 | 48 | 49 | 46 |
| 16 | `gp-thyroid-followup` | General Medicine / GP | 81 | 23 | 58 | 29 |
| 17 | `gp-dyslipidemia-followup` | General Medicine / GP | 75 | 21 | 54 | 32 |
| 18 | `gp-lab-result-review` | General Medicine / GP | 71 | 17 | 54 | 34 |
| 19 | `peds-fever` | Pediatrics | 123 | 70 | 53 | 37 |
| 20 | `peds-cough` | Pediatrics | 109 | 42 | 67 | 31 |
| 21 | `peds-vomiting-diarrhea` | Pediatrics | 99 | 60 | 39 | 23 |
| 22 | `peds-rash` | Pediatrics | 92 | 26 | 66 | 23 |
| 23 | `peds-poor-feeding` | Pediatrics | 96 | 27 | 69 | 22 |
| 24 | `peds-ear-pain` | Pediatrics | 87 | 26 | 61 | 20 |
| 25 | `peds-abdominal-pain` | Pediatrics | 94 | 56 | 38 | 22 |
| **Total** | **25 workflows** | **2 specialties** | **2,425** | **823** | **1,602** | **730** |

The first five workflows have completed workflow-level evidence but no retained explicit item relationship in their committed owning definitions. They therefore receive packets and complete item inventories, but no candidate proposal; all 527 of their items remain unsupported.

## Evidence-candidate method and authority boundary

No evidence outside the completed source-first programme was introduced. Each candidate requires all of the following to match: an exact current workflow item, a previously committed explicit item relationship in the owning source-first batch, the same source and section in the persisted completed research record, an active registered source, and an exact registered location with heading and locator.

The prior relationships were deliberately not promoted back to supported mappings. Because qualified-clinician review has not independently established direct item support and applicability, the generator conservatively classified the 823 links as either partial or contextual; it assigned zero direct-support candidates. Every candidate says it is generated for clinician review, not approved, and unsuitable for production use until the separate human approval and signing controls are completed.

## Accounting

### Overall

| Measure | Count |
|---|---:|
| Workflows selected | 25 |
| Current clinical items inventoried | 2,425 |
| Direct-support candidates | 0 |
| Partial-support candidates | 713 |
| Contextual-support candidates | 110 |
| Unsupported items | 1,602 |
| Clinician-review-required items | 2,425 |
| Safety-review-required items | 730 |
| UAE-specific candidates | 662 |
| International-only candidates | 161 |
| Candidate proposals | 823 across 20 candidate documents |
| Supported mappings | 0 |

The 823 candidate links use 18 already registered sources. Their persisted recency outcomes are 718 `weaker_metadata_current`, 53 `access_verification_current`, and 52 `explicit_stronger_date_current`; no due, expired, unavailable, superseded, or incomplete source was used by a pilot candidate.

### By specialty

| Specialty | Workflows | Items | Partial | Contextual | Unsupported | Safety review |
|---|---:|---:|---:|---:|---:|---:|
| General Medicine / GP | 18 | 1,725 | 450 | 66 | 1,209 | 552 |
| Pediatrics | 7 | 700 | 263 | 44 | 393 | 178 |

### By item category

| Item category | Items | Partial | Contextual | Unsupported | Safety review |
|---|---:|---:|---:|---:|---:|
| Aliases and matching terms | 406 | 141 | 83 | 182 | 8 |
| Chips | 921 | 356 | 10 | 555 | 337 |
| Examination prompts | 317 | 31 | 0 | 286 | 0 |
| History drafts | 25 | 17 | 0 | 8 | 5 |
| Investigation options | 87 | 46 | 0 | 41 | 87 |
| Medication options | 45 | 0 | 0 | 45 | 45 |
| Plan options | 110 | 12 | 0 | 98 | 110 |
| Speed presets | 464 | 91 | 9 | 364 | 113 |
| Workflow identity | 50 | 19 | 8 | 23 | 25 |

Activation accounting records 1,769 optional and 656 conditional items; no item is currently active by default. Safety accounting records 98 medication-related high-safety, 203 escalation/safety-net, 429 clinical-decision, and 1,695 routine-documentation items.

## Review artifacts

- Deterministic 25-workflow manifest: `clinical-expansion-v2/clinician-review/pilot-001/PILOT_WORKFLOW_MANIFEST.json`
- Complete machine-readable item inventory and evidence candidates: `CLINICIAN_REVIEW_ITEMS.json`
- One-row-per-item review table: `CLINICIAN_REVIEW_ITEMS.csv`
- Reproducible accounting: `PILOT_ACCOUNTING.json`
- Qualified-clinician packets: 25 Markdown files under `workflows/`
- Review-only proposal documents: 20 files under `clinical-expansion-v2/candidate-mapping-proposals/`

## Validation

The pilot-specific test suite passed 6/6 tests, and the deterministic validator passed with 25 workflows, 2,425 items, 20 proposal files, 823 proposals, zero supported mappings, and protected paths unchanged.

The required 19-command matrix passed 19/19 in the requested order:

1. `verify:signed-canonical-reconciliation`
2. `verify:canonical-mapping-reconciliation`
3. `test:candidate-support-separation`
4. `audit:canonical-write-authority`
5. `audit:no-code-generated-mappings`
6. `validate:data`
7. `validate:source-evidence`
8. `validate:item-provenance`
9. `audit:source-recency`
10. `audit:research-claims`
11. `test:safety`
12. `test:all-workflows`
13. `test:output-safety`
14. `test:exclusions`
15. `verify:source-evidence-hashes`
16. `verify:clinical-data-reproducibility`
17. `test:research-queue`
18. `lint`
19. `build`

Lint completed with pre-existing warnings and no errors. Final reconciliation remained exact: zero canonical files, zero approved-manifest mappings, zero persisted/runtime supported mappings, and 83,303 unsupported legacy items. Source recency passed for 235 registered sources with 23 rechecks due globally. Reproducibility passed with 151 replay modules and unchanged fingerprints:

- Metadata: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay manifest: `53109420feff822fa7d82266c7a6325135b5092a7b3c2662f5055e8d995edbf0`

## Programme boundaries

- Supported mappings remain zero and candidate/support separation passes.
- `public/data`, all 1,500 workflows, source registries, exclusions, canonical mappings, approval manifest, detached signature, and signed state are unchanged from the completed milestone.
- Active exclusions remain 12; no proposed exclusion was created.
- The source-first research queue remains complete; no new research batch or pilot 002 was started.
- No clinician identity, signature, approval date, approval decision, dose, diagnosis, or treatment recommendation was fabricated.
- No push, deployment, merge, rebase, signing, or approval was performed.

## Recommended qualified-clinician process

1. Triage the 730 safety-review-required items first, with medication-related and escalation/safety-net items receiving specialist review where appropriate.
2. For each candidate, open the cited official location and confirm the exact item wording, population, setting, jurisdiction, UAE limitation, and date/recency record.
3. Record exactly one decision: approve candidate, reject candidate, request narrower wording, request source recheck, mark item unsupported, or escalate safety review.
4. Leave all 1,602 unsupported items unsupported unless a separately authorised, cited evidence process supplies an exact relationship.
5. Move any human-approved candidate through the existing canonical transaction, qualified approval, and signature controls in a separate authorised phase; do not edit these pilot artifacts into active mappings.
6. Review pilot outcomes before considering pilot 002, including rejection reasons, wording changes, reviewer burden, and safety escalations.

## Readiness recommendation

Pilot 001 is ready for controlled qualified-clinician review. It is not ready for production use, and no candidate should become active merely because it appears in a packet or candidate document.

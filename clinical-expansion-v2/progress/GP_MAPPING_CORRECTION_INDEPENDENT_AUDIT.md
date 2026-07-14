# GP Mapping Correction Independent Audit

## Audit scope

This was a frozen, read-only audit of the GP mapping correction between pre-correction commit `225ef377c632c679514a1092f6058a93b4408de5` and documentation commit `4edfa92b1efcddbc0af9a6a52fa665c12b7f3ac4`. No research queue work, external clinical research, remediation, production-code changes, workflow-status changes, or data regeneration was performed. Temporary probes were created only under the operating-system temporary directory and removed after execution.

The audit independently inspected all 1,500 workflow overlays, all 1,500 research records, the correction and support ledgers, all 67 numbered batch modules, the helper contract, repository guard, correction diff, restart state, manifests, hashes, tests, and public baseline files.

## Executive conclusion

The narrow removal operation is arithmetically and referentially correct: all 1,164 historical mappings in scope existed before correction, all are present in the correction ledger, all were removed from current supported locations, all affected items are now unsupported, and no unrelated supported mapping was removed.

The correction cannot be approved as safe overall because the required fail-closed and four-way guard invariants are not met:

1. Runtime batch emission reconstructs only 8,145 of the 17,347 persisted mappings. Forty-five historical batch modules fail on import through the retired text resolver, leaving 9,202 persisted mappings with no runtime-emitted counterpart.
2. The repository guard reports `guardInspectedSupportedMappings` by recounting persisted records; it does not inspect a runtime-emitted ledger.
3. Independent guard fixtures were missed for default population, setting, and UAE applicability; generic rationale; dynamic import; and persisted/runtime mismatch.
4. Independent helper probes accepted generic rationale, cross-workflow reused rationale, object-spread applicability, shared pre-populated applicability, and computed-property construction at runtime.
5. Nineteen research records with no historical mapping in the correction set were substantively edited and falsely annotated as having previously supported mappings removed.
6. A 150-mapping sample from the remaining supported set had exact item/source/section provenance and direct-relationship text, but the persisted mapping schema contains no item-level population, setting, UAE applicability, or workflow-specific applicability rationale. All 150 therefore require review under the audit criteria.

Routine research must not resume until these defects are remediated and independently re-audited.

## Repository state

| Check | Result |
|---|---:|
| Branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | `4edfa92b1efcddbc0af9a6a52fa665c12b7f3ac4` |
| Working tree before audit | Clean |
| Stable `main` | `95758951d46510f34548b5520510c5d9d59f017f` |
| Protected forensic branch | `9b4cddb0fb226543ce621cb14a672a4edf789261` |
| Terminal workflows | 675 |
| Interrupted workflows | 825 |
| Next workflow | `gp-home-glucose-log-review` |
| `public/data` versus stable main | No change |
| Active exclusions | 12; no change |
| Workflows 0676 onward | No changed workflow or research file in the correction diff |

## Changed-file classification

All 116 changed files were inspected.

| Classification | Files | Finding |
|---|---:|---|
| Helper hardening | 7 | In scope |
| Guard hardening | 1 | In scope, but incomplete under adversarial testing |
| Mapping removal | 72 | 36 research records plus 36 workflow overlays with removed mappings |
| Ledger | 4 | In scope |
| Progress/accounting update | 6 | In scope |
| Test | 4 | In scope |
| Documentation | 3 | In scope |
| Unrelated | 19 | Fail: records had no pre-correction mappings but received correction-specific clinical applicability and audit text |

The 19 unrelated research-record edits were:

- `gp-allergic-symptoms`
- `gp-anemia-result-review`
- `gp-axillary-lump`
- `gp-breast-pain`
- `gp-bruising-tendency`
- `gp-caffeine-intake-documentation`
- `gp-caregiver-stress`
- `gp-caregiver-support-documentation`
- `gp-dietary-counseling-documentation`
- `gp-driving-medical-form`
- `gp-excessive-sweating`
- `gp-exercise-counseling-documentation`
- `gp-family-history-risk-review`
- `gp-fever-follow-up`
- `gp-financial-stress-health-impact`
- `gp-fitness-to-work-review`
- `gp-general-wellness-review`
- `gp-halitosis`
- `gp-health-anxiety-documentation`

Each had zero pre-correction mappings yet was changed to state that previously supported GP mappings were removed. Population, setting, UAE applicability, unresolved-gap text, evidence hash, and technical-audit metadata were altered. These are unrelated clinical-record changes under the audit scope.

## 1,164-removal reconciliation

| Reconciliation element | Number | Result |
|---|---:|---|
| Historical affected mappings reconstructed from pre-correction records | 1,164 | Pass |
| Correction-ledger records | 1,164 | Pass |
| Numbered GP mappings, sequences 0626–0675 | 1,032 | Pass |
| Early GP mappings across the five named workflows | 132 | Pass |
| Exact historical keys found | 1,164 | Pass |
| `REMOVE_TO_UNSUPPORTED` dispositions | 1,164 | Pass |
| Absent from current persisted mappings | 1,164 | Pass |
| Current unsupported-ledger records | 1,164 | Pass |
| Current supported/unsupported overlap | 0 | Pass |
| Current supported provenance remaining on affected items | 0 | Pass |
| Source IDs still recorded as opened | 1,164 | Pass |
| Section IDs still recorded as reviewed | 1,164 | Pass |
| Stale affected mappings | 0 | Pass |

The exact pre-correction affected-key set equals the correction-ledger key set. No correction row refers to a nonexistent historical mapping, and no historical affected mapping is missing from the correction ledger.

Evidence-item `content_mapping_status` values were changed to `reviewed_not_mapped_to_legacy_content` for the 36 mapped workflows. Source and section identifiers were retained; the source documents themselves were not deleted.

## Supported and unsupported accounting

The following totals were recalculated from the workflow and research primary records, not copied from manifest summaries.

| Measure | Recalculated value | Reconciliation |
|---|---:|---|
| Clinical items | 83,303 | 17,347 supported + 65,956 unsupported |
| Supported mappings | 17,347 | Research mappings and supported workflow provenance agree |
| Unsupported legacy items | 65,956 | Unsupported ledger and workflow records agree |
| Duplicate mapping keys | 0 | Pass |
| Duplicate supported workflow-item mappings | 0 | Pass |
| Duplicate unsupported workflow-item rows | 0 | Pass |
| Simultaneously supported and unsupported | 0 | Pass |
| Supported items lacking explicit persisted mapping | 0 | Pass |
| Unsupported workflow items missing from unsupported ledger | 0 | Pass |
| Terminal workflows | 675 | Manifest and restart state agree |
| `partial_exact_source_verified` | 576 | Primary research records |
| `no_authoritative_source_found` | 99 | Primary research records |
| `exact_workflow_source_verified` | 0 | Primary research records |
| `research_interrupted` | 825 | Primary research records |
| UAE-affected workflows | 576 | Deterministic audit formula |
| UAE findings | 599 | 576 partial + 23 missing-explicit-evidence findings |
| Exact-source coverage blockers | 1,500 | Expected programme blocker |
| Workflows containing unsupported legacy items | 675 | Expected programme blocker |
| Active exclusions | 12 | Public config and exclusion test agree |

The 1,164 removals account exactly for the change from 18,511 supported mappings to 17,347 and from 64,792 unsupported items to 65,956. No duplicate inflated either total. The explicit support model permits only one mapping per workflow item, so no multi-source item is double-counted.

The arithmetic totals are trustworthy. The safety interpretation of “guard coverage” and the evidentiary interpretation of the UAE metric are not trustworthy for the reasons below.

## Four-way mapping reconciliation

| Location | Total | Exact-key result against persisted set |
|---|---:|---|
| Persisted research mappings | 17,347 | Reference set |
| Guard-inspected mappings | 17,347 | Same persisted rows are recounted |
| Explicit supported ledger | 17,347 | Exact key equality |
| Runtime-emitted mappings from all 67 batch modules | 8,145 | 9,202 persisted keys missing; 0 unexpected runtime keys |

Runtime import results:

- 22 batch modules imported successfully.
- Batches 0006–0175 emitted 8,145 unique mapping keys.
- Batches 0626–0675 imported and emitted zero mappings, as intended after correction.
- 45 batches covering 0176–0625 failed immediately because `supportTexts` is retired.
- Runtime duplicates: 0.
- Runtime keys absent from persistence: 0.
- Persisted keys absent from runtime emission: 9,202.

The required four-way equality is therefore false. `guardInspectedSupportedMappings` is not an independent runtime count; it is assigned `persistedRows.length`. Runtime-only and persisted-only drift cannot be reconciled by the current guard.

## Helper contract and hidden-default findings

The current GP contract explicitly requires workflow ID, workflow-owned item ID, source and section IDs, source and section hashes, evidence relationship, four applicability fields, workflow-specific rationale, support status, and origin. It checks registered ownership, reviewed source/section, exact hashes, allowed statuses/origins, plain-object shape, and unexpected fields. Validated outputs are structured-cloned and deeply frozen. Caller-owned arrays cannot mutate validated output.

No active GP mapping field default was found in `gpBatchSupport.mjs` or `gpExplicitMappingContract.mjs`; required fields are checked with own-property and non-empty checks. However, independent runtime probes showed that value-shape validation is insufficient to establish caller authorship or uniqueness:

- Generic rationale with all required IDs was accepted.
- One unchanged rationale/applicability block containing both workflows’ IDs was accepted for two workflows.
- Applicability supplied by object spread was accepted by the runtime contract.
- Applicability copied from a shared pre-populated object was accepted.
- A computed property resolving to a required field name was accepted by the runtime contract.

The static guard catches the tested object-spread and computed-property syntax, but it does not catch equivalent shared-object assignment or all construction paths. Fail-closed safety cannot depend on the exact syntax reaching that scanner.

## Text-resolver search

No active text resolver successfully emitted a current supported mapping during this audit. The former `supportTexts` helper now throws. A correction-only normalizer remains in `correctGpMappings.mjs`, but it is used to audit/remove historical mappings rather than validate support.

Forty-five historical batch snapshots still invoke `supportTexts` or retain `exact_texts` structures. They are intentionally treated as non-writing snapshots by the static guard, but importing them fails. This is the direct reason runtime emission covers only 8,145 mappings.

## Adversarial contract results

The committed contract suite passed 41/41.

Independent temporary probes exercised required identity, ownership, source/section review, hashes, applicability presence, rationale shape, object ownership, prototype safety, duplicates, mutation, and construction patterns. Of 31 applicable helper-level probes, 26 behaved as required and 5 invalid constructions were accepted:

1. generic rationale;
2. rationale/applicability reused unchanged across workflows;
3. object-spread applicability;
4. shared pre-populated applicability object;
5. computed required-property construction.

Missing fields, wrong workflow, cross-workflow item, unknown item/source, wrong source-section relationship, unreviewed section, incorrect hashes, empty fields, whitespace rationale, inherited properties, unexpected properties, prototype pollution, duplicate/conflicting mappings, legacy-to-source-derived relabelling, and mutation attempts failed closed or remained isolated.

Repository reconciliation does detect a supported workflow item with no persisted mapping and exact-key mismatches between persisted and explicit ledgers. It does not compare against runtime emission.

## Adversarial guard results

The committed guard suite passed 11/11.

Independent fixtures produced the following result:

| Former blind spot | Detected |
|---|---:|
| Early non-numbered mapping writer | Yes |
| Mapping outside batches | Yes |
| Renamed text helper | Yes |
| Wrapper around text helper | Yes |
| Default UAE applicability | No |
| Default setting applicability | No |
| Default population applicability | No |
| Generic rationale | No |
| Computed mapping property | Yes |
| Dynamic import | No |
| Persisted/runtime mismatch | No; runtime is not an audit input |
| Equal-total mapping-key mismatch between persisted and explicit ledgers | Yes; exact signatures are compared |

Result: 7/12 required blind spots detected, 5/12 missed. The guard depends materially on function names, regex-recognized syntax, the `scripts/source-first` directory, and its classification of 45 batch filenames as historical snapshots. It does not provide syntax-independent runtime coverage.

All temporary fixtures and probe scripts were removed.

## Collateral-change analysis

| Change type | Count |
|---|---:|
| Intended supported mappings removed | 1,164 |
| Unrelated supported mappings removed | 0 |
| Supported mappings added | 0 |
| Mapping keys changed instead of removed | 0 |
| Source IDs changed outside affected mapping set | 0 supported mappings |
| Section IDs changed outside affected mapping set | 0 supported mappings |
| Supported applicability/origin/status changed outside affected mapping set | 0 supported mappings |
| Unrelated clinical research records altered | 19 |

The exact supported-mapping set difference is correct and contains only the intended correction-ledger keys. The overall diff is not clinically collateral-free because 19 no-mapping records were given generic correction applicability text and correction audit metadata.

## Workflow-status consistency

All 36 workflows that actually lost mappings remain `partial_exact_source_verified`. Under the unchanged `source-evidence` classification rules, each still has at least one exact opened document, at least one reviewed section, at least one evidence item, and at least one unresolved source gap. None qualifies for `no_authoritative_source_found`, because authoritative source and section review remains recorded. Incorrect affected-workflow terminal statuses found: 0.

The 19 unrelated records remain `no_authoritative_source_found`; their status is structurally consistent, but their new correction language is factually inapplicable because no mapping was removed from them.

## UAE-applicability consistency

The current deterministic formula yields 576 affected workflows and 599 findings. The pre-correction missing-explicit-evidence findings for `gp-constipation-follow-up-in-gp` and `gp-cough-follow-up-in-gp` disappeared only because their UAE text was replaced by a generic sentence containing the literal term `UAE`; no new source research occurred. The audit still counts both among the 576 partial-applicability blockers, but the two-finding reduction is syntactic rather than evidentiary.

## Stratified removal sample

A deterministic 194-record removal sample was reviewed:

- all 132 early GP removals;
- at least two removals from each of the 31 numbered workflows that had mappings to remove;
- the other 19 numbered workflows had zero historical mappings, so no removal sample exists for them.

Results: 194/194 historical keys existed, 194/194 are absent from current support, 194/194 are present in unsupported accounting, and 0 stale supported entries remain.

## Stratified remaining-supported sample

A deterministic 150-record sample was built from the remaining 17,347 mappings. It included 120 mappings from workflows at sequences 0006–0175, 30 from later numbered workflows, 30 rows from the ten largest mapping workflows, 125 rows sharing a source-section pair with another sampled row, and 150 partial-applicability workflows. The sample covered history/symptom items, relevant negatives, red flags, examination items, investigation-documentation items, and plan/follow-up items.

Results:

- Exact workflow-owned item identity: 150/150.
- Registered exact source and source-owned section: 150/150.
- Recorded direct relationship: 150/150.
- Research-level population/setting/UAE text present: 150/150.
- Persisted item-level population applicability: 0/150.
- Persisted item-level setting applicability: 0/150.
- Persisted item-level UAE applicability: 0/150.
- Persisted workflow-specific applicability rationale: 0/150.
- `RETAIN`: 0.
- `REVIEW_REQUIRED`: 150.
- `INVALID` on identity/source/section grounds: 0.

The persisted and explicit ledgers contain only workflow ID, item ID, source ID, section ID, and direct relationship. The stricter GP contract’s applicability fields are not represented in the remaining persisted mapping records, so the sample cannot satisfy the requested retention test.

## Deterministic defect counts

| Measure | Count |
|---|---:|
| Stale corrected mappings | 0 |
| Unexplained persisted mappings relative to runtime emission | 9,202 |
| Incorrect affected workflow statuses | 0 |
| Unrelated clinical-record changes | 19 |
| Independent helper probes failing closed | 5 |
| Independent guard blind spots missed | 5 |

## Full validation results

| # | Command | Result |
|---:|---|---|
| 1 | `npm run test:gp-batch-support-contract` | PASS — 41/41 |
| 2 | `npm run audit:explicit-mapping-contract` | PASS — committed 11/11 tests and persisted/workflow/explicit reconciliation; does not test runtime equality |
| 3 | `npm run validate:data` | PASS — 1,500 workflows, 12 exclusions |
| 4 | `npm run validate:source-evidence` | PASS |
| 5 | `npm run validate:item-provenance` | PASS — 83,303 items |
| 6 | `npm run audit:no-generic-templates` | PASS |
| 7 | `npm run audit:exact-source-coverage` | BLOCKED AS ALLOWED — 1,500 blockers |
| 8 | `npm run audit:source-recency` | PASS — 224 sources |
| 9 | `npm run audit:uae-applicability` | BLOCKED AS ALLOWED — 599 findings |
| 10 | `npm run audit:unsupported-legacy-content` | BLOCKED AS ALLOWED — 65,956 items |
| 11 | `npm run audit:research-claims` | PASS |
| 12 | `npm run test:safety` | PASS — 16 tests |
| 13 | `npm run test:all-workflows` | PASS |
| 14 | `npm run test:output-safety` | PASS |
| 15 | `npm run test:exclusions` | PASS — 12 active |
| 16 | `npm run verify:source-evidence-hashes` | PASS — 1,500 workflow and evidence hashes, 33 index hashes |
| 17 | `npm run verify:clinical-data-reproducibility` | PASS — public data unchanged |
| 18 | `npm run test:research-queue` | PASS — 12/12; queue not run |
| 19 | `npm run lint` | PASS with pre-existing Impeccable-skill warnings |
| 20 | `npm run build` | PASS |

Only the three permitted clinical-blocker audits exited nonzero. Passing committed tests do not override the independent runtime and adversarial failures documented above.

## Operational conclusion

- Aggregate supported, unsupported, status, restart, and hash totals are deterministically reproducible.
- The 1,164 mapping removals themselves are complete and free of stale support.
- The correction is not safe to approve because runtime reconciliation, helper/guard fail-closed behavior, item-level applicability persistence, and collateral record integrity do not meet the audit contract.
- The research queue must remain paused.
- No push, deployment, merge, rebase, or queue continuation was performed.

## Final verdict

FAIL_CORRECTION_REQUIRES_FURTHER_WORK

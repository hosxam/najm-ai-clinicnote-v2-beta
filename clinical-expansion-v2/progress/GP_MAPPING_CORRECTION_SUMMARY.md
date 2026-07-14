# GP Mapping Correction Summary

## Outcome

**CORRECTION_COMPLETE_INDEPENDENT_REVIEW_REQUIRED**

The failed GP remediation was corrected conservatively without new clinical research. None of the 1,164 affected mappings could satisfy the independent item-level identity, direct-support, and substantive applicability contract using recorded metadata alone. All 1,164 were therefore removed from supported mapping state and returned to `unsupported_pending_review` rather than preserved to maintain aggregate counts.

## Scope

- Starting HEAD: `225ef377c632c679514a1092f6058a93b4408de5`.
- Numbered GP workflows audited: 50 (`0626–0675`).
- Early GP workflows audited: `gp-cough`, `gp-dizziness`, `gp-fever-urti`, `gp-headache`, and `gp-sore-throat`.
- Original mappings audited: 1,164.
- Numbered mappings: 1,032.
- Early mappings: 132.
- Unique-normalised-text numbered mappings: 290.
- Ambiguous duplicate-text numbered mappings: 742.
- New external clinical research: none.
- Workflows 0676 onward: unchanged.

## Conservative dispositions

| Disposition | Count |
| --- | ---: |
| `RETAIN_EXPLICIT` | 0 |
| `REMOVE_TO_UNSUPPORTED` | 1,164 |
| `MANUAL_REVIEW_BLOCKER` preventing correction | 0 |
| Qualified clinician review required before reinstatement | 1,164 |
| Changed item IDs | 0 |

Unique text was used only to classify reconstruction history, never as support. Every one of the 290 unique-text mappings was removed because unique wording does not prove direct source support or applicability. Every one of the 742 ambiguous-text mappings records all candidate item IDs and was removed because the prior helper output could not independently prove one exact target. All 132 early mappings were included in the same correction and guard scope.

## Accounting

| Measure | Before | After | Change |
| --- | ---: | ---: | ---: |
| Persisted supported mappings | 18,511 | 17,347 | -1,164 |
| Guard-inspected supported mappings | 18,379 | 17,347 | Full equality restored |
| Repository explicit-ledger records | Not complete | 17,347 | Full equality restored |
| Unsupported legacy items | 64,792 | 65,956 | +1,164 |
| UAE applicability findings | 601 | 599 | -2 missing-explicit findings |
| Partial-applicability findings | 576 | 576 | 0 |
| Missing-explicit UAE findings | 25 | 23 | -2 |

No item is both supported and unsupported. Removed mappings were cleared from research records, workflow-item provenance, the numbered GP ledger, generated counts, workflow audit rows, hash/index outputs, and the repository-wide supported-mapping ledger.

## Helper and contract corrections

- The explicit mapping contract now accepts only plain schema-owned objects with exactly the required fields.
- Empty and whitespace-only values, inherited properties, symbol properties, and unexpected properties fail closed.
- Mapping-specific population, setting, jurisdiction, UAE, and rationale strings must name the exact workflow, item, source, and section IDs and state limitations.
- The generic first-remediation rationale is explicitly rejected.
- Generic applicability supplied through shared constants or object spread fails the mapping-specific contract; static guard checks reject spread-based applicability construction in production mapping sources.
- Duplicate workflow/item mappings fail regardless of conflicting section or support status.
- Validated output is cloned and deeply frozen.
- `supportTexts` is fail-closed retired and no longer resolves any clinical item ID.
- `finalizeInitialResearch.mjs` and `buildGpExplicitMappingLedger.mjs` are fail-closed retired and cannot emit or reconstruct mappings.
- `applyResearchBatch.mjs` rejects text, label, alias, category, fuzzy, substring, positional, and empty-item mapping requests.

## Text-resolver inventory

- Executable text-to-item resolver implementations remaining: 0.
- Historical batch snapshots containing `supportTexts` or `exact_texts`: 45.
- Those snapshots cannot emit support: the resolver throws unconditionally, and the only active batch writer requires non-empty explicit `item_ids` and rejects text-mapping fields.
- `writeGpHelperRemediationReports.mjs` retains normalised-text analysis only for historical documentation; it cannot emit, migrate, validate, or persist a supported mapping.

## Repository-wide guard correction

The guard now reads all 1,500 research records, including every early workflow, and compares three independent representations:

1. persisted research mappings;
2. supported workflow-item provenance;
3. `EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl`.

It enforces exact mapping-key and relationship equality, source/section registration, recorded opening/review, workflow item ownership, support-state consistency, no duplicate/conflicting mappings, no stale removed GP mapping, and the complete 1,164-row correction ledger. Static checks cover alternate directories, renamed wrappers, computed mapping properties, spread applicability, unapproved writers, retired early writers, and historical text batches.

Final invariant:

`17,347 persisted = 17,347 guard-inspected = 17,347 explicit-ledger records`.

## Tests and adversarial probes

- GP fail-closed contract tests: 41/41 passed.
- Repository guard tests: 11/11 passed.
- Previously accepted cases now rejected: generic rationale, generic spread applicability, generic shared applicability, and unexpected properties.
- Additional cases covered: omissions, whitespace, wrong workflow/item/source/section, unreviewed evidence, invalid hashes, conflicting duplicates, source-derived relabelling, inherited properties, post-validation mutation, renamed text wrappers, alternate mapping locations, computed fields, historical early mappings, duplicate-text ambiguity, and unique-text insufficiency.

## Independent internal second pass

The clean-context second pass rechecked all 1,164 correction records, every one of the 132 early mappings, all changed item IDs (none), every retained ambiguous mapping (none), all target workflow support state, and full runtime/persisted/ledger reconciliation. Because no corrected mapping was retained, a 150-row retained-target sample did not exist. Instead, a deterministic stratified sample of 150 conservative removals was rechecked alongside the complete 1,164-row disposition audit. Results: 0 stale supported items, 0 changed item IDs, 0 retained ambiguous targets, and exact 17,347-count reconciliation.

## Workflow and queue state

- Workflow source-status totals remain 0 exact / 576 partial / 99 no-authoritative-source / 0 conflicting / 0 access-failed / 825 interrupted.
- Terminal workflow count remains 675.
- Workflow status changes: 0.
- Next workflow remains `gp-home-glucose-log-review`.
- Research queue continuation: none.
- `public/data/`: unchanged from stable main.
- Active exclusions: unchanged at 12.

## Validation results

| # | Command | Result |
| ---: | --- | --- |
| 1 | `npm run test:gp-batch-support-contract` | PASS, 41/41 |
| 2 | `npm run audit:explicit-mapping-contract` | PASS, guard 11/11 and 17,347-count equality |
| 3 | `npm run validate:data` | PASS |
| 4 | `npm run validate:source-evidence` | PASS |
| 5 | `npm run validate:item-provenance` | PASS |
| 6 | `npm run audit:no-generic-templates` | PASS |
| 7 | `npm run audit:exact-source-coverage` | Expected clinical blocker |
| 8 | `npm run audit:source-recency` | PASS |
| 9 | `npm run audit:uae-applicability` | Expected clinical blocker, 599 findings |
| 10 | `npm run audit:unsupported-legacy-content` | Expected clinical blocker, 65,956 items |
| 11 | `npm run audit:research-claims` | PASS |
| 12 | `npm run test:safety` | PASS |
| 13 | `npm run test:all-workflows` | PASS |
| 14 | `npm run test:output-safety` | PASS |
| 15 | `npm run test:exclusions` | PASS |
| 16 | `npm run verify:source-evidence-hashes` | PASS |
| 17 | `npm run verify:clinical-data-reproducibility` | PASS |
| 18 | `npm run test:research-queue` | PASS |
| 19 | `npm run lint` | PASS with pre-existing Impeccable warnings |
| 20 | `npm run build` | PASS |

## Final position

The mechanical correction is complete and deterministic, but no removed mapping is clinically approved for reinstatement. Independent review remains required before research resumes or any mapping is restored.

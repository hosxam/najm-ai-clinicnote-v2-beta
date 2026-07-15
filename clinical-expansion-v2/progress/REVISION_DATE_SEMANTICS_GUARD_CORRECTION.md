# Revision-date semantics guard correction

## Scope and outcome

This was a narrow provenance-guard correction on `source-first-guideline-expansion-1500-v2`, starting from `acc86db7642b4654e9d4aad9bbdc433a2eb94621`. No clinical research was performed, the research queue was not resumed, and no workflow, source conclusion, source registry record, mapping, public application datum, exclusion, evidence hash, execution-manifest entry, or restart-state entry was changed.

The correction closes the failed independent-review finding in `clinical-expansion-v2/progress/MOHAP_DATE_PROVENANCE_INDEPENDENT_REVIEW.md`: generic webpage-update evidence could populate `revision_date` because the production stronger-date allowlist and its duplicated tests omitted that field.

## Frozen entry state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `acc86db7642b4654e9d4aad9bbdc433a2eb94621`
- Stable main: `95758951d46510f34548b5520510c5d9d59f017f`
- Protected forensic ref: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- Terminal workflows through 0775: 775
- Partial exact-source workflows: 652
- No-authoritative-source workflows: 123
- Research-interrupted workflows from 0776 onward: 725
- Next workflow: `gyn-menopause-symptom-review`
- Registered sources: 235
- Supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12

Before editing, signed reconciliation, canonical reconciliation, canonical write-authority, candidate-separation, and research-queue tests all passed.

## Exact root cause and affected paths

Commit `3a1b12835fd5c3def7212a9594202072943a390d` introduced a manually maintained stronger-date set containing `publication_date`, `effective_date`, `service_commencement_date`, and `legal_effective_date`. `revision_date` was omitted. The test file maintained a second unsynchronised list with the same omission, so the six committed cases could not expose it.

The main guard rejected a generic update label only when a caller used the assignment helper or when a stronger date duplicated a structured webpage-update field. The review identified additional fail-open surfaces:

- metadata-only replay records could omit the structured webpage-update field;
- wrapped generic labels and claimed provenance were matched too narrowly;
- only incoming batch records were checked before a registry write;
- registry semantics were checked by source-recency but not by every source-evidence or reproducibility load;
- the historical initial-registry writer and canonical mapping context loader did not enforce the guard.

The repository uses snake_case. Active source records contain `publication_date`, `effective_date`, `revision_date`, and `webpage_last_updated_date`. Searches found no production `revisionDate`, `commencement_date`, or `version_date` representation, so no speculative aliases were added. The nested `revision_due` recency field is not a source revision date.

## Protected fields before and after

| Classification | Before | After |
| --- | --- | --- |
| Protected stronger dates | `publication_date`, `effective_date`, `service_commencement_date`, `legal_effective_date` | `publication_date`, `effective_date`, `revision_date`, `service_commencement_date`, `legal_effective_date` |
| Approved webpage-update fields | `last_updated_date`, `webpage_last_updated_date`, `source_modified_date` | unchanged |

`SOURCE_DATE_SEMANTICS` is now the single frozen authority for page-update labels, weaker fields, and protected stronger fields. The guard and tests derive their sets from that authority.

## Guard implementation

- Generic `last updated`, `page updated`, `content updated`, `modified`, `webpage updated`, and `source modified` evidence cannot establish any protected stronger date, including `revision_date`.
- Token-aware matching covers wrapped, hyphenated, underscored, source-prefixed, connector, punctuation, parenthesised, weekday, ISO-date, and day-month-year forms without matching `modified` inside `unmodified` or accepting a partial date such as `2026-07-100`.
- Metadata parsing associates a date with its adjacent update label instead of treating every date in a multi-date version string as an update date.
- Metadata-derived update dates are compared with every protected stronger field, including raw/replayed records that omit a dedicated webpage-update field.
- Claimed independent provenance must set `independent_from_webpage_update: true` and provide a non-generic official label. Wrapped update wording cannot qualify.
- Explicit revision labels such as `Revision date`, `Revised on`, `Formally revised`, `Revision effective from`, and `Edition revision date` remain accepted.
- Existing records were not rewritten. Fifteen established NICE revision tuples and one established NHS effective-date tuple that predate structured `date_provenance` are preserved by exact field, source-ID, issuing-organisation, and date compatibility checks. Changed ID, organisation, field, or date near-misses reject. New or changed records do not receive a generic organisation-wide exemption.

## Production enforcement paths

| Path | Enforcement after correction |
| --- | --- |
| `scripts/source-first/sourceDateSemantics.mjs` | Central authority, assignment guard, structured registry validation, metadata-only validation, and explicit-provenance distinction |
| `scripts/recordInitialSourceResearch.mjs` | Validates every initial source before any registry write |
| `scripts/source-first/applyResearchBatch.mjs` | Validates each incoming batch source, every existing target-registry source before write, and every reloaded registry source before downstream consumption |
| `scripts/source-first/runCheck.mjs` | The shared registry loader validates semantics for source-evidence and source-recency; clinical-data reproducibility now invokes the same loader |
| `scripts/source-first/canonicalMappingStore.mjs` | Validates all repository source records before creating the production canonical mapping context |

This covers authored batch modules, batch insertion, active registries, replay through the batch applier, source-evidence checks, source-recency checks, and clinical-data reproducibility. No frontend or public-data write path changed.

## Regression suite

`npm run test:source-date-semantics` passes 18 of 18 tests.

The suite now proves:

- every authoritative page-update label rejects every protected stronger field;
- `Last updated on 10th Jul, 2026` cannot establish `revision_date: "2026-07-10"` through assignment, claimed provenance, or raw metadata;
- the structured same-date form rejects for the revision semantics error;
- the exact pre-correction raw MOHAP shape rejects `publication_date`, `effective_date`, and `revision_date` promotions;
- explicit genuine revision labels and explicit independent revision provenance pass;
- a decoy structured webpage-update date cannot suppress a matching metadata-only update date;
- common wrapped, source-prefixed, hyphenated, underscored, connector, colon, parenthesised, and weekday forms reject;
- negated modification wording and invalid date-prefix matches do not create false positives;
- exact NICE and NHS compatibility tuples pass while changed ID, organisation, or date near-misses reject;
- active source date fields are a subset of the single governed field authority;
- every protected stronger field rejects both structured-field and metadata-only update promotion;
- the active and replayable MOHAP records retain identical correct semantics.

The negative probes fail for the date-semantics error itself, not for malformed fixtures, missing schema fields, unknown IDs, or invalid canonical dates. The positive explicit-revision probes are accepted by the same guard.

## MOHAP verification and residual search

The active registry and `batch-0726-0735.mjs` both remain:

| Field | Value |
| --- | --- |
| `publication_date` | `undated_on_official_page` |
| `effective_date` | `null` |
| `revision_date` | `null` |
| `webpage_last_updated_date` | `2026-07-10` |
| `recency_verification.verified_on` | `2026-07-15` |
| `superseded_status_check.checked_on` | `2026-07-15` |

A deterministic active-registry scan found zero assignments of `2026-07-10` to `publication_date`, `effective_date`, `revision_date`, `commencement_date`, `service_commencement_date`, or `legal_effective_date`. Historical reports describing the corrected defect remain as forensic documentation.

## Downstream and frozen-state impact

- Active source records changed: 0
- Replayable batch source records changed: 0
- Workflow statuses changed: 0
- Terminal workflows: 775
- Partial exact-source workflows: 652
- No-authoritative-source workflows: 123
- Research-interrupted workflows: 725
- Workflows 0776 onward: untouched
- Next workflow: `gyn-menopause-symptom-review`
- UAE affected workflows/findings: 676 / 701, unchanged
- Registered sources: 235, unchanged
- Source-recency result: PASS, 235 sources
- Evidence hashes: PASS, 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes
- Execution manifest and restart state: unchanged
- Document and section totals: unchanged
- Supported mappings and candidates: 0 / 0
- Unsupported legacy items: 83,303
- Public data changed: no
- Active exclusions: 12, unchanged
- Canonical and signed mapping state: unchanged; reconciliation key-set hash remains `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`
- Signing, approval, deployment, merge, rebase, and queue-continuation operations: none

## Internal independent second pass

Three read-only reviews independently covered guard behavior, regression quality, and frozen-state impact. Early passes rejected narrower implementations after finding raw-object, consumer-path, wrapped-label, compatibility-scope, metadata-only stronger-field, connector-composition, token-boundary, date-prefix, and source-acronym cases. Each concrete case was reproduced and regression-locked before the final pass.

The final reviews unanimously approved the current implementation:

- invalid webpage-update-to-revision promotion rejects in assignment, provenance, structured, raw replay, and registry-consumer paths;
- explicit genuine revision evidence passes;
- every protected stronger-date field is covered through one authority;
- all source write and validation paths fail closed;
- all 235 active sources validate without modification;
- replayable MOHAP metadata remains correct;
- source-recency remains semantically correct;
- no temporary fixture or generated state remains;
- workflows 0776 onward, canonical/signed state, public data, and exclusions remain unchanged.

## Final validation

| Command | Result |
| --- | --- |
| `npm run test:source-date-semantics` | PASS — 18/18 |
| `npm run verify:signed-canonical-reconciliation` | PASS — mappings 0; unsupported 83,303 |
| `npm run verify:canonical-mapping-reconciliation` | PASS |
| `npm run test:candidate-support-separation` | PASS — 3/3 |
| `npm run audit:canonical-write-authority` | PASS — 11/11; audit PASS |
| `npm run audit:no-code-generated-mappings` | PASS — generated mappings 0 |
| `npm run validate:data` | PASS — 1,500 workflows; 12 exclusions |
| `npm run validate:source-evidence` | PASS — 1,500 records; 235 sources |
| `npm run validate:item-provenance` | PASS — 83,303 items; source-derived 0 |
| `npm run audit:no-generic-templates` | PASS — 0 matches |
| `npm run audit:exact-source-coverage` | EXPECTED BLOCKER — 0 exact, 652 partial, 123 no-source, 725 interrupted |
| `npm run audit:source-recency` | PASS — 235 sources |
| `npm run audit:uae-applicability` | EXPECTED BLOCKER — 676 workflows, 701 findings (652 partial, 49 missing explicit UAE evidence, 0 other) |
| `npm run audit:unsupported-legacy-content` | EXPECTED BLOCKER — 83,303 |
| `npm run audit:research-claims` | PASS — 1,500 |
| `npm run test:safety` | PASS — 16 tests; 12 exclusions |
| `npm run test:all-workflows` | PASS — 1,500 workflows/overlays/research records |
| `npm run test:output-safety` | PASS — 10 checks |
| `npm run test:exclusions` | PASS — 12 active, 0 proposed |
| `npm run verify:source-evidence-hashes` | PASS — 1,500 / 1,500 / 33 |
| `npm run verify:clinical-data-reproducibility` | PASS — 10 baseline files; `public_data_changed: false` |
| `npm run test:research-queue` | PASS — 14/14; queue not run |
| `npm run lint` | PASS — exit 0; errors 0; warnings 172; new warnings 0 |
| `npm run build` | PASS |

Only the three authorised programme blockers remain. No additional blocker or regression was introduced.

# Source Recency and Provenance Reproducibility Correction

## Completion status

The existing dirty worktree was recovered in place and completed without resuming workflow research. Source-recency classification, persisted date provenance, independent batch replay, the source-metadata fingerprint, and clinical-data reproducibility now agree for all 235 active sources.

This correction remains subject to independent review. The three pre-existing programme blockers—exact-source coverage, UAE applicability, and unsupported legacy content—remain open and were not altered by this maintenance task.

## Dirty-worktree recovery

- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `d43f4d3704c2dd4708e351748c66bfd7e5adf994`
- Recovery timestamp: `2026-07-16T17:13:19+04:00` (Asia/Dubai)
- Initial state: 0 staged, 88 modified tracked, 9 untracked, 97 changed paths, 0 deleted, 0 renamed, 0 conflicted
- Recovery directory: `C:\Users\ASUS\OpenClaw_Workspaces\recovery\source-recency-metadata-reproducibility-20260716T171319+0400`
- Tracked patch: `tracked-working-tree.patch`, 910,538 bytes, SHA-256 `56557fad4d2a1459e3f2b5c94ff0f3e9487bfd687b7f1e3bfcbc72c951e6500c`
- Porcelain snapshot: `status-porcelain-v2.txt`, SHA-256 `1c9d9fc520977bf30afa14c9b349953d35d0759aa2926c1e3af6e9bd6db21f75`
- Inventory: `inventory.txt`, SHA-256 `9575257058dc7d3430a04ac2605602ad03a1f98036023fc496cedee0382f1712`
- All nine original untracked files were copied below `untracked\` with repository-relative paths and matching hashes.

The branch, HEAD, path inventory, tracked patch, index, and operation state were checked again after backup creation. The external backup changed nothing in the repository.

## Original incomplete implementation findings

The recovered implementation was coherent but incomplete:

- `sourceRecencyProvenanceBasis` had been removed while production callers and tests still imported it.
- Replay callers used an obsolete gate signature.
- Required recency, precision, replay, backlog-isolation, digest, and reproducibility tests and commands were absent.
- Replay depended on active-registry-derived supplement files; the initial registration module was indexed but not executed.
- Several batch modules loaded active registries while being imported, so replay expectations were circular and nondeterministic.
- Replay differences identified a source but not the exact field.
- Recency used overlapping `basis` and `status` representations, included `manualMetadataReviewPending`, and did not expose one exclusive operational outcome.
- Four valid `YYYY-MM` weaker dates were misclassified as access-only, producing the old `25 / 3 / 65 / 142` basis split.
- The 274-entry migration backlog influenced active metadata through generated fields and fingerprint bindings.
- The first digest implementation was not verified by tests or clinical-data reproducibility.
- The migration validator mixed historical ledger/inventory data into active validation.
- No correction report existed.

## Repaired contracts and persisted provenance

The supported contract is now:

- `classifySourceRecency(source, options)`
- `validatePersistedSourceRecency(source, options)`
- `summarizeSourceRecency(sources)`
- `classifyDatePrecision(value)`
- `normalizeAndValidateReplaySource({ sourceUpdate, modulePath, batch, registryState, manifest, provenanceDocument, asOfDate })`

Obsolete imports, old replay signatures, compatibility fallbacks, `sourceRecencyProvenanceBasis`, `manualMetadataReviewPending`, and the old overlapping recency representation were removed.

The committed provenance authority remains `clinical-expansion-v2/schema/STRONGER_DATE_PROVENANCE.json`. Retained provenance is also persisted inline in active source records under `date_provenance`; weaker metadata provenance is persisted under `date_metadata_provenance`. Active validation is pure: it reads and verifies the persisted records and never fills, infers, or invents missing provenance. A populated stronger-date value without its exact source/field/value provenance fails closed and the input is not mutated.

The replay artifact builder may materialize only exact records selected from the committed provenance registry. The independently recomputed replay manifest binds the raw batch operation digest, owner/history, final absent/null/value states, and exact retained or weaker provenance-record keys before the result is accepted. Historical inventory and ledger values are not replay inputs.

## Recency policy

The fixed policy is stored in `clinical-expansion-v2/schema/SOURCE_RECENCY_POLICY.json`:

- Evaluation date: `2026-07-16`
- Maximum verification age: 30 days
- Warning window: 7 days
- Days 23 through 30: `recheck_due`
- Day 31 onward: `verification_expired`
- Recorded recency gap: immediately `recheck_due`
- Missing, invalid, or future verification/check dates: `incomplete_recency_metadata`

The exclusive basis precedence is explicit stronger date, approved unknown, weaker metadata, then access verification only. The exclusive outcome precedence is unavailable, superseded, incomplete, expired, recheck due, then the basis-specific current outcome.

Access or verification freshness is operational evidence only. It never implies publication, effective, revision, service-commencement, or legal-effective recency.

Persisted `source_recency` uses snake-case fields for the schema and policy versions, evaluation date, basis and raw value, precision and conservative comparison value, verification date and age, maximum interval, warning and routine dates, next required recheck date, exclusive outcome, availability and supersession flags, and the recorded recency-gap flag.

## Final source counts

### Mutually exclusive recency bases

| Basis | Count |
|---|---:|
| `explicit_stronger_date` | 25 |
| `approved_unknown` | 3 |
| `weaker_metadata` | 69 |
| `access_verification_only` | 138 |
| **Total** | **235** |

### Mutually exclusive recency outcomes

| Outcome | Count |
|---|---:|
| `explicit_stronger_date_current` | 24 |
| `approved_unknown_current_by_verification` | 3 |
| `weaker_metadata_current` | 65 |
| `access_verification_current` | 120 |
| `recheck_due` | 23 |
| `verification_expired` | 0 |
| `incomplete_recency_metadata` | 0 |
| `unavailable` | 0 |
| `superseded` | 0 |
| **Total** | **235** |

### Date precision

| Precision | Basis count | Policy |
|---|---:|---|
| day | 226 | Exact calendar day; impossible dates fail |
| month | 4 | Raw `YYYY-MM` retained; first day used only as the conservative comparison value |
| year | 2 | Raw `YYYY` retained; no month/day or comparison date fabricated |
| unknown | 3 | Approved unknown remains a non-date outcome |

The four corrected month-precision sources are `doh-antenatal-care-standard-v1-2024`, `doh-postnatal-care-program-v1-2025`, `doh-well-child-visits-v10-2025`, and `rch-pic-acute-abdominal-pain-children-2024`. All four now use `weaker_metadata` without altering their raw values.

MOHAP remains unchanged and semantically separate:

- `publication_date`: `undated_on_official_page`
- `effective_date`: `null`
- `revision_date`: `null`
- `webpage_last_updated_date`: `2026-07-10`
- `recency_verification.verified_on`: `2026-07-15`
- `superseded_status_check.checked_on`: `2026-07-15`

Its approved unknown publication outcome does not count as a concrete stronger date, and its webpage update remains weaker webpage metadata.

## Backlog isolation

The historical metadata-recheck view remains non-authoritative:

- Backlog entries: 274
- Unique source IDs: 209
- Joined active sources: 209
- Missing active sources: 0
- Presently due entries: 22
- Presently due unique sources: 22

The standalone backlog reporter joins only by source ID and applies current active recency outcomes. It does not import former dates into active metadata. Inventory fingerprint bindings and supplement references introduced by the incomplete generator were removed. Active validation, replay, recency, and fingerprint modules do not import the inventory, ledger, historical tuple, or backlog reporter.

## Independent replay and manifest

- Initial source module executed: yes
- Initial registrations: 6
- Numbered production batches discovered from the execution manifest: 77
- Total executed modules: 78
- Source update operations recorded: 251
- Replayed sources: 235
- Supplement files or supplement execution: none
- Active-registry reads during replay construction: none
- Protected GP mapping-ledger reads during replay construction: none
- Pre-existing replay-discovery environment state restored: yes
- Full registry-header differences: 0
- Full source-record differences: 0

`recordInitialSourceResearch.mjs` is import-safe and exports its six-source batch. The production application engine supports full registrations plus declarative field merges, applicability-note appends, and exact-section upserts. The formerly registry-only `who-audit-primary-care-2001` record is independently authored in its owning batch. Every executed operation has an independently recomputed digest and ownership history.

Parity diagnostics have the exact structured shape `{ source_id, field_path, expected, replayed }` and use stable JSON-pointer paths. Tests intentionally mutate a nested field and confirm that the exact source and field are returned.

The manifest at `clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json` is an ownership/provenance index, not an active metadata snapshot. It records ordered modules and batch IDs, operation digests, source ownership/origin history, date-field states, provenance-record keys, schema/policy versions, and its own aggregate fingerprint.

- Logical replay-manifest fingerprint: `4818f94c18b29d8af292f4ed5839cd89147928ca6f7723489a2fa239424356fc`
- Manifest file SHA-256: `bca519e2ea16eddc40ba03ce7ae1051c70ea91edb8806a3177e1134c8f862c9c`

The reproducibility verifier rebuilds this manifest from initial definitions, numbered batches, committed provenance, and the fixed policy before loading active source records for comparison. A stored but self-consistent altered manifest is rejected.

## Source-metadata fingerprint and reproducibility

The artifact at `clinical-expansion-v2/progress/SOURCE_METADATA_FINGERPRINT.json` recursively canonicalizes object keys and source IDs while preserving array order and distinguishing absent, null, approved unknown, day, month, and year states. It covers identity, URL, type, jurisdiction, stronger and weaker dates, nested revision-due precision, version/edition, verification and supersession checks, persisted provenance, recency, next recheck, replay references, and schema/policy/migration bindings. Volatile runtime timestamps are excluded.

- Logical source-metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Fingerprint artifact file SHA-256: `93fd1e5f6010ea8b2ecb71f7c14ec8b5ea46757218826a479bbd6304d4900678`
- Stored / active / replay logical fingerprints: identical

The verifier recomputes against current committed schema, policy, migration, and manifest versions; it does not trust version values supplied by the stored artifact. Mutation, stale-version, deterministic-order, provenance, recency, and null/absent/unknown tests all pass.

`verify:clinical-data-reproducibility` now verifies the existing 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes, ten protected baseline files, unchanged public data/exclusions, independently recomputed manifest, persisted provenance and recency, exact committed-batch replay, active/replay/stored fingerprint equality, and next-recheck parity.

## Tests and commands

### Focused tests

| Category | Tests | Result |
|---|---:|---|
| Persisted date semantics and calendar validation | 15 | PASS |
| Recency policy, precedence, aggregates, and boundaries | 8 | PASS |
| Day/month/year/unknown precision | 4 | PASS |
| Initial plus numbered-batch replay and manifest tamper detection | 2 | PASS |
| Historical backlog isolation | 3 | PASS |
| Metadata fingerprint determinism and mutation detection | 8 | PASS |
| Aggregate metadata reproducibility and manifest recomputation | 5 | PASS |
| **Focused total** | **45** | **PASS** |

All required source commands passed: `test:source-recency-policy`, `test:source-date-precision`, `validate:persisted-source-date-provenance`, `test:source-batch-replay-parity`, `test:metadata-recheck-isolation`, `verify:source-metadata-fingerprint`, and `verify:source-metadata-reproducibility`. The existing `test:source-date-semantics`, `validate:stronger-date-provenance`, `verify:legacy-date-migration`, `verify:replay-date-provenance`, and `audit:source-recency-provenance` commands also passed.

### Required 23-command programme matrix

| # | Command | Result |
|---:|---|---|
| 1 | `verify:signed-canonical-reconciliation` | PASS |
| 2 | `verify:canonical-mapping-reconciliation` | PASS |
| 3 | `test:candidate-support-separation` | PASS — 3 tests |
| 4 | `audit:canonical-write-authority` | PASS — 11 tests and zero generated mappings |
| 5 | `audit:no-code-generated-mappings` | PASS |
| 6 | `validate:data` | PASS |
| 7 | `validate:source-evidence` | PASS |
| 8 | `validate:item-provenance` | PASS |
| 9 | `audit:no-generic-templates` | PASS |
| 10 | `audit:exact-source-coverage` | ALLOWED BLOCKER — 1,500 workflows |
| 11 | `audit:source-recency` | PASS |
| 12 | `audit:uae-applicability` | ALLOWED BLOCKER — 676 affected workflows / 701 findings |
| 13 | `audit:unsupported-legacy-content` | ALLOWED BLOCKER — 83,303 items |
| 14 | `audit:research-claims` | PASS |
| 15 | `test:safety` | PASS — 16 tests |
| 16 | `test:all-workflows` | PASS |
| 17 | `test:output-safety` | PASS — 10 checks |
| 18 | `test:exclusions` | PASS |
| 19 | `verify:source-evidence-hashes` | PASS |
| 20 | `verify:clinical-data-reproducibility` | PASS |
| 21 | `test:research-queue` | PASS — 14 tests; queue not executed |
| 22 | `lint` | PASS with existing repository/tooling warnings |
| 23 | `build` | PASS |

Twenty commands passed. Only the three expressly permitted programme audits remain blocked.

## Programme-boundary confirmation

The protected audit after artifact generation confirmed:

- Terminal workflows: 775
- Interrupted workflows: 725
- Workflows 0776–1500: unchanged, `not_started` / `research_interrupted`
- Next workflow: `gyn-menopause-symptom-review`
- Supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12
- UAE impact: unchanged at 676 affected workflows / 701 findings
- `public/data`: unchanged
- Canonical mapping directory: unchanged
- `APPROVED_MANIFEST.json`: unchanged, zero mapping keys/files
- `APPROVED_MANIFEST.sig`: unchanged
- Execution manifest: unchanged
- Restart state: unchanged
- Stable `main`: `95758951d46510f34548b5520510c5d9d59f017f`, unchanged locally and on origin
- Protected forensic branch: `9b4cddb0fb226543ce621cb14a672a4edf789261`, unchanged locally and on origin

No workflow research, new clinical-source research, mapping/candidate creation, public-data generation, exclusion change, queue continuation, push, deployment, merge, rebase, signing, or approval action occurred.

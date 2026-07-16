# Stronger-Date Provenance Migration Independent Review

## Verdict

`FAIL_STRONGER_DATE_PROVENANCE_MIGRATION_REQUIRES_FURTHER_WORK`

Workflow research must not resume. The migration reconciles the historical claims and correctly clears most unsupported stronger dates, but the source-recency, replay, inventory, reproducibility, and migration-test requirements are not fully satisfied.

## Review Scope and Method

- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Required branch: `source-first-guideline-expansion-1500-v2`
- Starting review HEAD: `50c01500d229f3b3e9663b8eeecc3a99b21cc7f4`
- Pre-migration review HEAD: `ed71365070027ea64fcaab9c04dfa7e9bca0e1c5`
- Migration commits resolved to:
  - `6eb2e33b777f80cb1feb89f62b0c9d1b636272d3`
  - `5164bfafa6b6979823894cb022a9b84ffa699e74`
  - `298cd1eea3dc43baa76269090d64603cfca2759a`
  - `50c01500d229f3b3e9663b8eeecc3a99b21cc7f4`
- Review method:
  - reconstructed original claims directly from the three source registries at the pre-migration commit with `git show`;
  - did not use the migration ledger as the source of original totals;
  - inspected every retained disposition and its stored metadata evidence;
  - reconciled every cleared disposition against active source state and the ledger;
  - inspected source-recency, replay normalization, registry loading, canonical-context loading, evidence hashing, and tests;
  - ran all five migration-specific review commands and the full 23-command programme suite.

No workflow research or new clinical research was conducted.

## Repository Verification

| Check | Result |
|---|---|
| Branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | `50c01500d229f3b3e9663b8eeecc3a99b21cc7f4` |
| Working tree before review | Clean |
| Stable `main` | `95758951d46510f34548b5520510c5d9d59f017f` — unchanged |
| Protected forensic branch | `9b4cddb0fb226543ce621cb14a672a4edf789261` — unchanged |
| Migration diff | 20 files; 52,166 insertions; 1,469 deletions |
| `public/data` diff | None |
| Limited-testing exclusions diff | None |
| Canonical directory diff | None |
| Signed manifest diff | None |
| Detached signature diff | None |
| Execution manifest diff | None |
| Restart state diff | None |
| Workflow records diff | None |
| Research records diff | None |
| Evidence records diff | None |

### Changed-File Classification

| File | Classification |
|---|---|
| `clinical-expansion-v2/progress/STRONGER_DATE_PROVENANCE_MIGRATION.md` | migration documentation |
| `clinical-expansion-v2/progress/stronger_date_claim_inventory.json` | migration inventory |
| `clinical-expansion-v2/progress/stronger_date_provenance_migration.json` | non-authoritative migration ledger |
| `clinical-expansion-v2/schema/SOURCE_DATE_PROVENANCE.schema.json` | stronger-date provenance contract |
| `clinical-expansion-v2/schema/SOURCE_REGISTRY_DATE_FIELDS.schema.json` | stronger-date provenance contract |
| `clinical-expansion-v2/schema/STRONGER_DATE_PROVENANCE.json` | stronger-date provenance contract |
| `clinical-expansion-v2/sources/international_clinical_sources.json` | active source-data migration |
| `clinical-expansion-v2/sources/specialty_society_sources.json` | active source-data migration |
| `clinical-expansion-v2/sources/uae_clinical_sources.json` | active source-data migration |
| `package.json` | package-script wiring |
| `scripts/recordInitialSourceResearch.mjs` | replayable-data migration |
| `scripts/source-first/applyResearchBatch.mjs` | registry or replay validation |
| `scripts/source-first/canonicalMappingStore.mjs` | canonical-context integration |
| `scripts/source-first/migrateStrongerDateProvenance.mjs` | replayable-data migration |
| `scripts/source-first/runCheck.mjs` | source-recency integration |
| `scripts/source-first/sourceDateProvenanceContract.mjs` | stronger-date provenance contract |
| `scripts/source-first/sourceDateRegistryGate.mjs` | registry or replay validation |
| `scripts/source-first/sourceDateSemantics.mjs` | stronger-date provenance contract |
| `scripts/source-first/sourceDateSemantics.test.mjs` | migration test |
| `scripts/source-first/validateStrongerDateProvenance.mjs` | registry or replay validation |

No unrelated workflow, clinical-content, mapping, application-data, or exclusion change was found. No migration change was classified as reproducibility integration; this absence is material below.

## Material Findings

### 1. Approved unknowns are incorrectly counted as stronger-date recency

`sourceRecencyProvenanceBasis()` counts keys in `date_provenance` without distinguishing `authoritative_explicit` from `approved_unknown`. These three non-date values therefore return `explicit_stronger_date_provenance`:

- `college-optometrists-eye-referral-annex4-current.publication_date`
- `college-optometrists-flashes-floaters-guidance-current.publication_date`
- `mohap-medical-leave-attestation-2026.publication_date`

All three contain `undated_on_official_page`. They are valid approved unknown representations, but they are not dated claims and must not contribute to a stronger-date recency category. The reported `28` stronger-date recency count therefore combines 25 explicit dates with 3 unknowns and is semantically incorrect.

### 2. Access-only recency weakens the previous policy without a freshness boundary

Before migration, source-recency required a populated `publication_date`, a version, a mission-date verification, and no superseded marker. After migration, a source can pass with only a syntactically valid `recency_verification.verified_on` date, provided it is on or after the fixed `VERIFICATION_DATE` constant.

The new policy has no rolling maximum age, expiry, recheck interval, or explicit rejection of a recorded recency gap. Consequences observed during this review:

- 138 sources pass through `source_access_and_verification_only`;
- 23 source records explicitly contain `recency_gap` language and still pass;
- 18 of those 23 pass through access/verification only;
- a single verification event on or after the fixed mission start date can continue passing indefinitely;
- the implementation checks only that the status does not contain the word `superseded`, not that the source is affirmatively current and applicable.

Access is not mislabelled as publication or revision metadata, but it was introduced as a new passing recency pathway without a defined freshness policy. The migration therefore weakens recency to preserve `235/235` and the resulting recency conclusion is not semantically trustworthy.

### 3. Replay provenance is auto-injected and raw replay data remains legacy-bearing

The production replay gate calls `normalizeSourceDateClaims()`. That function looks up the authoritative disposition registry, overwrites stronger-date fields, and constructs `date_provenance` automatically. This directly conflicts with the requirement that replay records carry equivalent provenance and that replay not add provenance automatically.

Additional replay findings:

- raw batch modules remain unchanged and still contain former stronger-date values;
- the validator does not replay the actual batch modules;
- replay tests construct synthetic inputs by cloning active source records, deleting provenance, restoring historical tuple values, and then calling the same normalizer under test;
- `who-audit-primary-care-2001` has no registered replay definition for either of its two original claims;
- the inventory's string-based `replayableBatchLocations` can identify references rather than an actual source declaration and includes non-batch helper references;
- attempted direct loading of all batch modules encountered an existing retired helper throw, so the current suite does not establish end-to-end replay reproducibility.

The normalizer prevents cleared values from becoming active at the current gate, but that is not equivalent to migrating replayable records or proving an independent replay path.

### 4. The original-claim inventory is not self-contained as required

The independently reconstructed totals match exactly and every source/field/value claim has a unique inventory row. However:

- inventory rows contain no `migrationOutcome` field;
- the outcome is available only after joining to the separate ledger or provenance registry;
- the two `who-audit-primary-care-2001` rows have no replayable location;
- replayable-location entries are string-search results, not guaranteed source-definition locations.

The inventory therefore reconciles the original claims numerically but does not meet the required per-row migration-outcome and replay-representation contract.

### 5. Source-metadata migration lacks a reproducibility fingerprint

The unchanged workflow/research/index evidence hashes are legitimate because no underlying workflow, reviewed section, evidence item, or index changed. However:

- source registries are not included in the source-evidence hash manifest;
- the stronger-date provenance registry is not included;
- the migration inventory and ledger have no authoritative top-level content hash or signed manifest binding;
- `verify:clinical-data-reproducibility` covers the ten protected public/config baseline files, not migrated source metadata.

Per-row inventory hashes do not bind the complete active source/provenance state. The source-metadata migration is therefore not represented by a separate deterministic reproducibility fingerprint.

### 6. Migration tests are not sufficiently independent

All migration-specific commands pass, but they primarily validate generated artifacts and constants produced by the migration itself. They do not independently reconstruct the pre-migration source registries or exercise actual raw batch replay. The tests do not reject:

- an approved unknown counted as stronger-date recency;
- access-only recency with no rolling freshness policy;
- a source status explicitly recording a recency gap;
- automatic provenance injection during replay;
- absence of an actual replay source definition;
- absence of source/provenance metadata from reproducibility hashes.

Passing migration-specific tests therefore do not establish the semantics required by this review.

### 7. Current evidence-location validation is internally consistent but not independently dereferenced at runtime

The 25 retained explicit values were independently checked against the stored official artefact metadata or source-record metadata during this review. Each exact location exists and the stored text supports the stated field meaning. Runtime validation, however, checks agreement among active source data, the provenance registry, and inline provenance; it does not independently dereference `exactEvidenceLocation` and verify that the recorded label and date are present there. This is a future integrity gap even though the current 25 retained values passed manual inspection.

## Original Inventory Reconciliation

The pre-migration source registries were read directly from `ed71365070027ea64fcaab9c04dfa7e9bca0e1c5`. The result was compared to, but not derived from, the inventory or ledger.

| Field | Independently reconstructed | Inventory | Reconciled |
|---|---:|---:|---|
| `publication_date` | 235 | 235 | Yes |
| `effective_date` | 230 | 230 | Yes |
| `revision_date` | 89 | 89 | Yes |
| `service_commencement_date` | 0 | 0 | Yes |
| `legal_effective_date` | 0 | 0 | Yes |
| **Total** | **554** | **554** | **Yes** |

- Unique source/field claim keys: 554
- Missing claim keys: 0
- Extra claim keys: 0
- Duplicate claim keys: 0
- Original value mismatches: 0
- Original validation basis:
  - 543 established pre-contract tuple-only claims;
  - 11 claims with recorded explicit/unknown metadata plus the former tuple fallback.
- Inventory contract defects: missing per-row migration outcome; two rows without replayable representation.

## Provenance-Contract Assessment

The per-field provenance records bind:

- exact source ID;
- exact field name;
- exact retained value;
- evidence category;
- displayed/structured label;
- exact evidence location;
- registered source-record reference;
- optional section reference;
- review date;
- migration version.

The active validators reject source, field, and date mismatches. One source's provenance cannot validate another source, and one field's provenance cannot validate another field. Generic webpage-update, access, and review metadata cannot validate stronger-date fields.

The prohibited categories include `frozen_tuple`, `legacy_exception`, `generic_provenance`, `inferred_from_other_date`, `assumed_same_as_publication`, `assumed_from_recency`, `inferred_from_access_date`, and the established pre-contract tuple category. Frozen tuples are no longer an active validation input.

Contract result: field/source/value binding is sound for active records; the approved-unknown recency classification and runtime evidence-location dereferencing remain defective.

## Retained-Claim Assessment

### Grouped result

| Field | Explicit retained dates | Approved unknowns | Total retained outcomes |
|---|---:|---:|---:|
| Publication | 21 | 3 | 24 |
| Effective | 1 | 0 | 1 |
| Revision | 3 | 0 | 3 |
| Service commencement | 0 | 0 | 0 |
| Legal effective | 0 | 0 | 0 |
| **Total** | **25** | **3** | **28** |

### Individual retained outcomes

| Field | Source | Retained value | Status | Stored evidence label |
|---|---|---|---|---|
| Effective | `gmc-decision-making-consent-2024` | `2020-11-09` | explicit | effective |
| Publication | `cdc-ringworm-clinical-overview-2024` | `2024-07-15` | explicit | page dated |
| Publication | `college-optometrists-cl-infiltrative-keratitis-v9-2026` | `2026-02-17` | explicit | published |
| Publication | `college-optometrists-corneal-abrasion-v15-2025` | `2025-12-09` | explicit | published |
| Publication | `college-optometrists-eye-referral-annex4-current` | `undated_on_official_page` | approved unknown | publication date not stated |
| Publication | `college-optometrists-flashes-floaters-guidance-current` | `undated_on_official_page` | approved unknown | publication date not stated |
| Publication | `college-optometrists-microbial-keratitis-v14-2024` | `2024-10-15` | explicit | published |
| Publication | `hrs-ishne-ambulatory-ecg-2017` | `2017` | explicit | published |
| Publication | `hrs-remote-device-clinic-2023` | `2023` | explicit | published |
| Publication | `mohap-medical-leave-attestation-2026` | `undated_on_official_page` | approved unknown | publication date not stated |
| Publication | `nhs-cheshire-merseyside-heart-failure-pathway-2022` | `2021-11-04` | explicit | document dated |
| Publication | `nhs-england-adult-breathlessness-pathway-2023` | `2023-04-26` | explicit | published |
| Publication | `nice-acute-coronary-syndromes-ng185-2020` | `2020-11-18` | explicit | published |
| Publication | `nice-b12-deficiency-ng239-2024` | `2024-03-06` | explicit | published |
| Publication | `nice-child-abuse-neglect-ng76-2017` | `2017-10-09` | explicit | published |
| Publication | `nice-cvd-lipid-modification-ng238-2023` | `2023-12-14` | explicit | published |
| Publication | `nice-falls-ng249-2025` | `2025-04-29` | explicit | published |
| Publication | `nice-heart-valve-disease-ng208-2021` | `2021-11-17` | explicit | published |
| Publication | `nice-hyperparathyroidism-ng132-2019` | `2019-05-23` | explicit | published |
| Publication | `nice-osahs-ng202-2021` | `2021-08-20` | explicit | published |
| Publication | `nice-self-harm-ng225-2022` | `2022-09-07` | explicit | published |
| Publication | `nice-stroke-rehabilitation-ng236-2023` | `2023-10-18` | explicit | published |
| Publication | `nice-suspected-sepsis-ng253-2026` | `2025-11-19` | explicit | published |
| Publication | `nice-tinnitus-ng155-2020` | `2020-03-11` | explicit | published |
| Publication | `nice-violence-aggression-ng10-2015` | `2015-05-28` | explicit | published |
| Revision | `asa-basic-anesthetic-monitoring-2025` | `2025-10-15` | explicit | last amended |
| Revision | `asa-documentation-anesthesia-care-2023` | `2023-10-18` | explicit | last amended |
| Revision | `asa-postanesthesia-care-2024` | `2024-10-23` | explicit | last amended |

For all 25 explicit values, the source identity, exact value, field-appropriate label, stored location, and source-record metadata matched. None depended only on a former frozen tuple.

The three approved unknown values are correctly represented as unknown in active source data and do not imply publication timing. They fail only in source-recency classification, where they are incorrectly counted as stronger-date provenance.

## Cleared-Claim Assessment

| Cleared disposition | Count |
|---|---:|
| Derived/duplicated claims cleared | 178 |
| Existing-source metadata recheck, active value cleared | 274 |
| Webpage update moved to weaker metadata | 20 |
| Access/review timing retained only as weaker review metadata | 54 |
| **Total cleared stronger claims** | **526** |

All 526 claims were reconciled individually:

- active stronger-date field is `null`;
- no active inline stronger-date provenance remains for the cleared field;
- original value is preserved in the non-authoritative ledger;
- final disposition is non-authoritative;
- ledger/inventory are not imported by source validation, recency, canonical context, workflow support, candidate support, or mapping consumers.

The migration ledger is isolated from active consumption. Historical values cannot be reactivated merely because they remain in the ledger or inventory. However, raw batch modules still contain legacy values and rely on registry-driven normalization to clear them, so the replayability requirement is not met independently.

## Metadata-Recheck Assessment

| Field | Recheck entries |
|---|---:|
| Publication | 209 |
| Effective | 49 |
| Revision | 16 |
| **Total** | **274** |

- Unique affected sources: 209
- Active stronger-date values: cleared
- Replay normalizer result: cleared at the gate
- Old date preserved as authoritative: no
- Mapping or candidate support granted: no
- Clinician approval implied: no
- Recheck queue mixed with workflow queue: no

The recheck backlog is non-authoritative. Nevertheless, 616 of the 775 terminal workflows reference at least one source with a metadata-recheck entry, and 411 terminal workflows reference at least one source now passing through access-only recency. Workflow evidence and conclusions were not changed by the migration and no supported mappings exist, but the recency defect means reproducibility of the terminal-state recency assertion is not established. Immediate source reinspection is not required to keep the cleared values non-authoritative; it is required before the current blanket source-recency conclusion can be trusted.

## Effective-Date Migration

- Original effective-date claims: 230
- Explicitly retained: 1
- Cleared: 229
- Retained source: `gmc-decision-making-consent-2024`
- Retained value: `2020-11-09`
- Evidence: explicit `effective` label in stored version metadata

No publication, issue, webpage-update, access, or verification date was reused as effective-date evidence.

### Duplicated publication/effective values

- Duplicates reviewed: 179
- Independently retained effective date: 1
- Cleared duplicated effective dates: 178

The retained GMC effective date has independent effective-date wording. No other duplicate was retained merely because publication and effective values matched.

## Revision-Date Migration

- Original revision-date claims: 89
- Explicitly retained: 3
- Approved unknown revisions: 0
- Cleared: 86

The three retained values are ASA records with explicit `last amended` wording. Generic webpage update, document modification, access timing, review timing, equality with publication, and difference from publication were not accepted as revision evidence.

## Source-Recency Assessment

| Reported basis | Count | Independent result |
|---|---:|---|
| Stronger-date provenance | 28 | Structurally counted, but includes 3 approved unknown non-dates |
| Weaker metadata | 69 | 18 webpage-update records and 51 access/review metadata records |
| Access/verification only | 138 | Passing pathway has no rolling freshness/recheck limit |
| **Total** | **235** | Categories are mutually exclusive in code and total correctly |

The weaker-metadata records are not relabelled as publication, effective, or revision claims. Their categories remain `webpage_update_only` or `access_or_review_date_only`.

The access-only pathway checks HTTPS URL form, version presence, a verification date on or after the fixed mission date, and absence of the literal word `superseded`. It does not prove that access was recently repeated, does not define expiry, and does not reject recorded recency gaps. The `235/235` result is therefore numerically reproducible but semantically untrustworthy.

## Replay, Registry, Canonical Context, and Reproducibility

### Positive findings

- Registry loading rejects populated stronger dates without matching source/field/value provenance.
- Frozen tuples are not active authority.
- Active canonical context consumes normalized active source data, not the ledger.
- The migration ledger and original inventory are not active inputs.
- Current normalization clears all 526 unsupported values before registry acceptance.
- Workflow/research/index evidence hashes remain unchanged because their underlying evidence content did not change.
- Public clinical-data reproducibility remains unchanged.

### Failed requirements

- Replayable source definitions were not migrated to carry provenance; normalization injects it.
- Actual batch modules are not replayed by the migration validator.
- Raw modules retain legacy stronger-date values.
- Two original claims for `who-audit-primary-care-2001` have no replay definition.
- Source registry and provenance registry state are not covered by a separate migration reproducibility fingerprint.

Replay/reproducibility result: current runtime normalization is protective, but independent deterministic replay and source-metadata reproducibility are not proven.

## Migration-Test Quality

Migration-specific commands discovered and run:

| Command | Result |
|---|---|
| `npm run test:source-date-semantics` | PASS — 21 tests |
| `npm run validate:stronger-date-provenance` | PASS |
| `npm run verify:legacy-date-migration` | PASS |
| `npm run verify:replay-date-provenance` | PASS |
| `npm run audit:source-recency-provenance` | PASS |

The tests cover source/field/date binding, prohibited categories, deterministic normalization, expected totals, and current generated artifacts. They do not independently verify the pre-migration inventory, actual raw batch replay, unknown-date recency exclusion, freshness expiry, recency-gap rejection, no automatic provenance injection, or source-metadata hash coverage. Their passing status does not resolve the material findings.

## Full Validation Results

All 28 required commands were run. Twenty-five passed. Only the three explicitly permitted programme blockers failed.

| # | Command | Result |
|---:|---|---|
| 1 | `npm run test:source-date-semantics` | PASS |
| 2 | `npm run validate:stronger-date-provenance` | PASS |
| 3 | `npm run verify:legacy-date-migration` | PASS |
| 4 | `npm run verify:replay-date-provenance` | PASS |
| 5 | `npm run audit:source-recency-provenance` | PASS |
| 6 | `npm run verify:signed-canonical-reconciliation` | PASS |
| 7 | `npm run verify:canonical-mapping-reconciliation` | PASS |
| 8 | `npm run test:candidate-support-separation` | PASS |
| 9 | `npm run audit:canonical-write-authority` | PASS |
| 10 | `npm run audit:no-code-generated-mappings` | PASS |
| 11 | `npm run validate:data` | PASS |
| 12 | `npm run validate:source-evidence` | PASS |
| 13 | `npm run validate:item-provenance` | PASS |
| 14 | `npm run audit:no-generic-templates` | PASS |
| 15 | `npm run audit:exact-source-coverage` | EXPECTED PROGRAMME BLOCKER — 1,500 clinical blockers |
| 16 | `npm run audit:source-recency` | PASS, but semantic defects identified independently |
| 17 | `npm run audit:uae-applicability` | EXPECTED PROGRAMME BLOCKER — 676 affected workflows / 701 findings |
| 18 | `npm run audit:unsupported-legacy-content` | EXPECTED PROGRAMME BLOCKER — 83,303 items |
| 19 | `npm run audit:research-claims` | PASS |
| 20 | `npm run test:safety` | PASS |
| 21 | `npm run test:all-workflows` | PASS |
| 22 | `npm run test:output-safety` | PASS |
| 23 | `npm run test:exclusions` | PASS |
| 24 | `npm run verify:source-evidence-hashes` | PASS |
| 25 | `npm run verify:clinical-data-reproducibility` | PASS |
| 26 | `npm run test:research-queue` | PASS — 14 tests |
| 27 | `npm run lint` | PASS with pre-existing Impeccable-script warnings |
| 28 | `npm run build` | PASS |

No migration-specific command failed. That outcome is recorded separately from the independent semantic failures and is evidence that the current validators do not cover them.

## Collateral Programme State

| State | Verified value |
|---|---:|
| Total workflows | 1,500 |
| Terminal workflows | 775 |
| Partial exact-source workflows | 652 |
| No-authoritative-source workflows | 123 |
| Research-interrupted workflows | 725 |
| First interrupted sequence | 776 |
| Next workflow | `gyn-menopause-symptom-review` |
| Supported mappings | 0 |
| Candidate proposals | 0 |
| Unsupported legacy items | 83,303 |
| UAE affected workflows | 676 |
| UAE findings | 701 |
| Active exclusions | 12 |

Workflows 0001–0775 remain terminal. Workflows 0776 onward remain `research_interrupted`. Public data, exclusions, workflows, research records, evidence records, canonical data, signed manifest, detached signature, execution manifest, restart state, stable `main`, and the protected forensic branch are unchanged.

## Required Remediation Before Queue Resumption

1. Exclude `approved_unknown` records from stronger-date recency counts and add a regression test.
2. Define an explicitly reviewed access-only recency policy with rolling freshness/recheck limits, affirmative availability/applicability checks, and recency-gap handling.
3. Migrate or regenerate actual replayable source definitions so they carry authoritative provenance, and make replay reject missing provenance instead of silently injecting it.
4. Replay actual batch inputs in validation and resolve the registry-only WHO source representation.
5. Add per-row migration outcomes and precise replay-definition locations to the original-claim inventory.
6. Add a deterministic content hash or signed fingerprint covering active source registries plus the authoritative provenance registry.
7. Make migration tests independently reconstruct the pre-migration state and test the defects identified above.

Until these requirements are satisfied and independently re-reviewed, workflow research may not resume.

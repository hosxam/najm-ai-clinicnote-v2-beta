# Source Recency and Provenance Reproducibility Independent Review

## Verdict

`FAIL_SOURCE_RECENCY_AND_PROVENANCE_REPRODUCIBILITY_REQUIRES_FURTHER_WORK`

Workflow research and the research queue may not resume. The committed source records, aggregate accounting, replay, fingerprints, and protected programme state all reconcile, but the active-registry loading contract does not consistently enforce the fixed policy evaluation date.

## Review scope and repository verification

This was an independent, read-only review of the correction range:

- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Branch: `source-first-guideline-expansion-1500-v2`
- Reviewed starting and subject HEAD: `6d066efef54c610c8468fe8e6a6020660077ca59`
- Pre-correction HEAD: `d43f4d3704c2dd4708e351748c66bfd7e5adf994`
- Correction commits inspected: `364e3fc19e846d2c1bbb954219dc689657a12e44`, `e1c4bb304d231ecf8b6e8ca95894c79b1fe06dc9`, `3ff17b94afa293222f978b386d8b56c675abe8c3`, `b02d128bf06e5f080edf0f17800e10edf14ca97e`, and `6d066efef54c610c8468fe8e6a6020660077ca59`
- Starting worktree/index: clean
- Conflicts: zero
- Merge, rebase, cherry-pick, revert, bisect, or sequencer state: none

Stable refs were unchanged and still matched their origin refs:

- `main`: `95758951d46510f34548b5520510c5d9d59f017f`
- `guideline-expansion-1500-all-in-one`: `9b4cddb0fb226543ce621cb14a672a4edf789261`

The recovery directory exists at `C:\Users\ASUS\OpenClaw_Workspaces\recovery\source-recency-metadata-reproducibility-20260716T171319+0400`. It resolves outside the repository, contains the tracked patch, status snapshot, inventory, and nine untracked-file copies, and is absent from all tracked and committed paths.

## Correction-range changed-file classification

Every one of the 110 changed paths between the pre-correction and reviewed HEAD was inspected and assigned one primary category. No unrelated change was found.

| Category | Count | Files or range |
|---|---:|---|
| Recency contract | 3 | `sourceDateSemantics.mjs`, `sourceMetadataRecheckBacklog.mjs`, `sourceRecencyPolicy.mjs` |
| Persisted provenance | 3 | `stronger_date_claim_inventory.json`, `sourceDateRegistryGate.mjs`, `validateStrongerDateProvenance.mjs` |
| Source metadata | 3 | International, specialty-society, and UAE active source registries |
| Replay implementation | 8 | Replay manifest, initial-source module, batch application engine, authored-batch support, migration builder, research-queue integration, source application engine, and replay engine |
| Numbered batch reference | 77 | Every numbered module from `batch-0006-0015.mjs` through `batch-0766-0775.mjs` |
| Metadata policy | 1 | `SOURCE_RECENCY_POLICY.json` |
| Metadata fingerprint | 3 | Stored fingerprint, fingerprint module, and fingerprint verifier |
| Reproducibility integration | 3 | `runCheck.mjs`, reproducibility module, and reproducibility verifier |
| Test | 7 | Date precision, date semantics, recency policy, backlog, replay, fingerprint, and reproducibility tests |
| Package command | 1 | `package.json` |
| Report | 1 | The correction report |
| Unrelated | 0 | None |
| **Total** | **110** |  |

No clinical workflow content, mapping payload, public application data, canonical approval/signature payload, execution or restart state, or exclusion configuration changed in the correction range.

## Blocking contract finding

### [P1] Active loading trusts a persisted evaluation date

At reviewed HEAD, `validateActiveRegistrySource()` in `scripts/source-first/sourceDateRegistryGate.mjs` lines 280–284 validates persisted recency with:

```js
validatePersistedSourceRecency(source, {
  as_of_date: source?.source_recency?.evaluated_on
    ?? sourceRecencyPolicy().evaluation_date,
})
```

The value under validation therefore selects its own expected policy date. This defeats the fixed `2026-07-16` evaluation contract.

An in-memory negative fixture reproduced the impact without changing any file:

- Source: `ada-standards-care-hypoglycemia-2026`
- Verification and supersession-check dates: `2026-06-20`
- Self-selected persisted evaluation date: `2026-07-01`
- Self-consistent persisted result: age 11, `access_verification_current`
- Fixed-policy result on `2026-07-16`: age 26, `recheck_due`
- `validateActiveRegistrySource()`: accepted the stale payload
- Default `validatePersistedSourceRecency()`: rejected the evaluation date, age, and outcome

The affected production consumers include `applyResearchBatch.mjs` and `canonicalMappingStore.mjs`. The integrated metadata reproducibility verifier would detect the corresponding committed drift through fixed-policy validation, replay parity, and fingerprints, but the active-loading contract itself is not fail-closed. Historical verification can therefore appear current to these loading paths when accompanied by a self-consistent stale `evaluated_on` payload.

No test directly exercises `validateActiveRegistrySource()` against a stale self-selected evaluation date. The required repair is to validate active records using the policy default/fixed evaluation date, never the persisted date, and add the exact negative fixture above.

### Secondary validation coverage gap

Removing `date_metadata_provenance` from `rch-pic-acute-abdominal-pain-children-2024` and recalculating its recency as access-only also passes active semantic/recency validation. This is fail-closed for basis selection—the unproven weaker date is not used as a weaker-metadata basis—and full replay/fingerprint reproducibility detects the change, but active validation does not require weaker-provenance completeness in the same way that it requires stronger-date provenance. A follow-up correction should make this requirement explicit and add a negative fixture.

No production or test module imports the removed `sourceRecencyProvenanceBasis` API. All replay callers use the final object-form `normalizeAndValidateReplaySource({...})` signature. `normalizeSourceDateClaims()` clones and validates without filling missing provenance. Active persisted stronger-date provenance validation is pure and fails missing inline provenance without mutation.

Replay materializes inline provenance only by exact selection from committed `STRONGER_DATE_PROVENANCE.json` during each source operation. It does not infer provenance from labels, active registries, the migration inventory, or the migration ledger, and it does not append provenance after replay. Historical inventory and ledger data remain explicitly non-authoritative.

## Independent recency reconciliation

All 235 committed sources were independently recalculated. Apart from the active-loader enforcement defect above, every persisted `source_recency` field matched the fixed policy result.

### Basis totals

| Recency basis | Count |
|---|---:|
| Explicit stronger date | 25 |
| Approved unknown | 3 |
| Weaker metadata | 69 |
| Access/verification only | 138 |
| **Total** | **235** |

The categories are mutually exclusive and follow the committed precedence.

### Exclusive outcome totals

| Outcome | Count |
|---|---:|
| Explicit stronger-date current | 24 |
| Approved-unknown current by verification | 3 |
| Weaker-metadata current | 65 |
| Access/verification current | 120 |
| Recheck due | 23 |
| Verification expired | 0 |
| Incomplete recency metadata | 0 |
| Unavailable | 0 |
| Superseded | 0 |
| **Total** | **235** |

### Basis-by-outcome cross-tab

| Basis | Basis-specific current | Recheck due | Total |
|---|---:|---:|---:|
| Explicit stronger date | 24 | 1 | 25 |
| Approved unknown | 3 | 0 | 3 |
| Weaker metadata | 65 | 4 | 69 |
| Access/verification only | 120 | 18 | 138 |
| **Total** | **212** | **23** | **235** |

The expected due composition is exact: `1 + 4 + 18 = 23`. All 23 currently due records carry a recorded recency-gap flag; none is due only because of the ordinary warning window at this evaluation date.

An explicit stronger publication date establishes the evidence basis but does not make operational verification permanently current. Availability, supersession, verification freshness, and recorded gaps are evaluated independently. The one explicit-date source is therefore legitimately `recheck_due` because its recorded gap triggers immediate review.

Approved unknowns remain registered non-date values with `unknown` precision. They are not counted as explicit concrete dates and require valid current verification/check metadata.

## Reconciliation of 22 backlog-due entries and 23 active-due sources

The exact difference is `hrs-ishne-ambulatory-ecg-2017`.

- Active basis: explicit stronger date
- Publication value: raw year `2017`
- Verification age: 3 days at the fixed evaluation date
- Recorded recency gap: true
- Active outcome: `recheck_due`
- Next required recheck: `2026-07-16`

Its historical claim dispositions are `A_EXPLICITLY_SUPPORTED` for the publication year and `D_DERIVED_OR_DUPLICATED_CLAIM` for the cleared duplicate effective date. It has no `F_REQUIRES_SOURCE_METADATA_RECHECK` entry, so it is outside the 274-entry historical backlog. The 22-versus-23 difference is legitimate and precisely reconciled; it is not an accounting defect.

## Date-precision review

| Precision | Count |
|---|---:|
| Day | 226 |
| Month | 4 |
| Year | 2 |
| Unknown | 3 |
| **Total** | **235** |

The four month records retain raw `YYYY-MM` values in active metadata. First-of-month values exist only as conservative internal comparison dates; no fabricated day is written into the source field.

| Source | Raw field/value | Comparison date | Basis | Next recheck |
|---|---|---|---|---|
| `doh-antenatal-care-standard-v1-2024` | `revision_due: 2027-07` | `2027-07-01` | Weaker metadata | `2026-08-10` |
| `doh-postnatal-care-program-v1-2025` | `revision_due: 2028-05` | `2028-05-01` | Weaker metadata | `2026-08-11` |
| `doh-well-child-visits-v10-2025` | `revision_due: 2029-12` | `2029-12-01` | Weaker metadata | `2026-08-10` |
| `rch-pic-acute-abdominal-pain-children-2024` | `last_updated_date: 2024-04` | `2024-04-01` | Weaker metadata | `2026-08-10` |

The two year records are `hrs-ishne-ambulatory-ecg-2017` (`2017`) and `hrs-remote-device-clinic-2023` (`2023`). Both retain raw year-only values, have `year` precision, and use a null comparison date rather than inventing a month or day. Their next-recheck dates are deterministic from operational verification: `2026-07-16` and `2026-08-12`, respectively.

## Recency-policy review

`SOURCE_RECENCY_POLICY.json` was introduced by this correction and is absent from the pre-correction HEAD. The policy artifact and classifier correctly specify:

- Fixed evaluation date: `2026-07-16`
- Maximum verification age: 30 days
- Warning window: seven days
- Ages 23–30: `recheck_due`
- Age 31: `verification_expired`
- Missing, invalid, or future verification/check dates: incomplete
- Unavailable and superseded outcomes precede current outcomes
- Recorded recency gaps: immediately due
- Access or verification: operational freshness only, never publication, effective, revision, service-commencement, or legal-effective evidence
- Approved unknown: separate non-date basis requiring valid verification

Routine and warning dates are deterministic. Historical access cannot keep a source current indefinitely in the classifier. The blocking finding is that one production active-loader wrapper does not consistently enforce the fixed evaluation date when validating persisted output.

## Historical backlog isolation

The historical operational view contains 274 entries across 209 source IDs. It reports 22 currently due entries across 22 sources by joining backlog membership to current active outcomes using source ID only.

The inventory is marked `activeAuthority: false` and `nonAuthoritative: true`, lists active consumers that must not use it, and contains zero active fingerprint bindings. The backlog does not supply active date provenance or replay records, change recency basis/outcomes, enter the metadata fingerprint, or affect mappings, candidates, workflows, exclusions, or public data. Its due count is a standalone operational view.

## Real replay review

The committed replay genuinely starts from empty registry templates, imports the side-effect-free initial module, then discovers and executes all production-numbered batches before loading active registries for comparison.

- Initial module executed: yes
- Initial registrations: 6
- Numbered batches: 77
- Total modules: 78
- Full-source operations: 243
- Declarative patches: 8
- Total operations: 251
- Reconstructed sources: 235
- Supplement used: no
- Active-registry-derived replay input: no
- Historical inventory or migration ledger used as active input: no
- Post-replay provenance addition: no
- Registry-header differences: 0
- Full source-record differences: 0

The four initial-only DHA sources come from initial registration. Later NICE/WHO changes resolve through ordered real batch definitions and declarative patches. `who-audit-primary-care-2001` has a full authored definition in its owning batch.

The manifest records ownership, operation history/digests, all 12 managed absent/null/value date states, and exact committed provenance keys without storing a complete active metadata snapshot. Diagnostics have the exact shape `{ source_id, field_path, expected, replayed }` and stable JSON-pointer paths. Mutation tests exercise nested source and registry-header paths.

## Metadata fingerprints

Independent recomputation matched the committed values:

- Source-metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `4818f94c18b29d8af292f4ed5839cd89147928ca6f7723489a2fa239424356fc`

Canonicalization sorts object keys and source IDs while preserving array order. It distinguishes absent, null, approved unknown, and concrete precision; covers identity, URL, type, jurisdiction, version, stronger and weaker dates, nested revision-due data, persisted provenance, recency basis/outcome, next recheck, verification and supersession checks, replay references, and schema/policy/migration bindings; and recursively excludes volatile runtime timestamps. Active metadata and replay produced the same fingerprint. Document evidence hashes remain separate.

## Reproducibility integration

`verify:clinical-data-reproducibility` builds and checks the independent replay manifest before active-registry loading, then verifies committed-manifest parity, persisted provenance and fixed-policy recency, exact batch replay, stored fingerprint, active/replay fingerprint parity, next-recheck parity, existing evidence hashes, and protected public-data state.

The integrated check passed with 235 active/replayed sources, 78 replay modules, 1,500 workflow hashes, 1,500 evidence hashes, and 33 index hashes. A metadata change cannot remain undetected merely because document evidence hashes are unchanged. This integration contains committed drift, but it does not remove the active-loader defect documented above.

## Test-quality review

The seven required package commands are:

| Command | Result |
|---|---|
| `test:source-recency-policy` | 8/8 passed |
| `test:source-date-precision` | 4/4 passed |
| `validate:persisted-source-date-provenance` | Passed for 235 sources |
| `test:source-batch-replay-parity` | 2/2 passed |
| `test:metadata-recheck-isolation` | 3/3 passed |
| `verify:source-metadata-fingerprint` | Passed; stored and active digest matched |
| `verify:source-metadata-reproducibility` | Passed; active, replay, stored, and manifest digests matched |

The correction also added supporting test commands for metadata fingerprint and reproducibility plus the migration builder command. Relevant production-module tests totalled 45/45:

- Persisted provenance/date semantics: 15
- Recency policy: 8
- Date precision: 4
- Real replay: 2
- Backlog isolation: 3
- Metadata fingerprint: 8
- Metadata reproducibility: 5

The suites import production modules. Replay tests execute the real initial module and all real numbered batches; fingerprint and reproducibility tests exercise production canonicalization and verification. Coverage includes missing stronger-date provenance without mutation, approved unknowns, month/year precision, policy boundary days, initial execution, field-level replay diagnostics, backlog isolation, digest determinism/mutation, MOHAP invariants, and real replay digest equality. The missing stale-evaluation fixture for `validateActiveRegistrySource()` is the material test gap.

## MOHAP verification

`mohap-medical-leave-attestation-2026` remains exactly:

- `publication_date`: `undated_on_official_page`
- `effective_date`: null
- `revision_date`: null
- `webpage_last_updated_date`: `2026-07-10`
- `recency_verification.verified_on`: `2026-07-15`
- `superseded_status_check.checked_on`: `2026-07-15`
- Basis: approved unknown
- Outcome: approved-unknown current by verification

The publication outcome is not counted as an explicit concrete stronger date. The webpage-update value remains separate weaker webpage metadata. Loading and replay do not infer the webpage date as publication provenance.

## Standard validation matrix

| # | Command | Result |
|---:|---|---|
| 1 | `verify:signed-canonical-reconciliation` | Passed |
| 2 | `verify:canonical-mapping-reconciliation` | Passed |
| 3 | `test:candidate-support-separation` | 3/3 passed |
| 4 | `audit:canonical-write-authority` | Passed |
| 5 | `audit:no-code-generated-mappings` | Passed |
| 6 | `validate:data` | Passed |
| 7 | `validate:source-evidence` | Passed; 235 sources |
| 8 | `validate:item-provenance` | Passed; 83,303 items checked |
| 9 | `audit:no-generic-templates` | Passed |
| 10 | `audit:exact-source-coverage` | Authorized blocker; 1,500 clinical blockers |
| 11 | `audit:source-recency` | Passed |
| 12 | `audit:uae-applicability` | Authorized blocker; 676 workflows / 701 findings |
| 13 | `audit:unsupported-legacy-content` | Authorized blocker; 83,303 items |
| 14 | `audit:research-claims` | Passed; 1,500 claims |
| 15 | `test:safety` | Passed |
| 16 | `test:all-workflows` | Passed; 1,500 workflows |
| 17 | `test:output-safety` | Passed; 10 checks |
| 18 | `test:exclusions` | Passed; 12 active exclusions |
| 19 | `verify:source-evidence-hashes` | Passed; 1,500 workflow, 1,500 evidence, and 33 index hashes |
| 20 | `verify:clinical-data-reproducibility` | Passed |
| 21 | `test:research-queue` | 14/14 passed |
| 22 | `lint` | Passed with existing repository/tooling warnings |
| 23 | `build` | Passed |

Twenty commands passed. Only the three explicitly authorized programme blockers remained.

## Protected programme state

Protected Git objects were byte-identical at the pre-correction and reviewed HEADs for `public/data`, exclusions, workflows/research, canonical mappings, approval manifest and detached signature, candidate proposals, execution manifest, restart state, and the unsupported ledger.

- Supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12
- Workflows 0001–0775: terminal
- Workflows 0776–1500: unchanged, `not_started` / `research_interrupted`
- Next workflow: `gyn-menopause-symptom-review`
- Restart status: `INTERRUPTED_RESTARTABLE`
- `public/data` changed: no
- Exclusions changed: no
- Canonical or signed state changed: no

## Programme boundary and required next action

The committed data, aggregate totals, backlog accounting, real replay, metadata fingerprints, and reproducibility integration are internally consistent. The correction nevertheless requires further work because active loading can validate recency against a stale persisted evaluation date.

Workflow research may not resume. A follow-up correction must enforce the policy evaluation date inside `validateActiveRegistrySource()`, add the stale-evaluation regression fixture, decide and test fail-closed completeness for weaker metadata provenance, regenerate any artifacts only if the repair changes committed metadata contracts, and repeat the independent review before any queue continuation.

No workflow research, clinical research, queue continuation, production-code change, test change, source-data change, replay-data change, artifact regeneration, mapping change, public-data change, exclusion change, push, deployment, merge, rebase, signing, or approval occurred during this review.

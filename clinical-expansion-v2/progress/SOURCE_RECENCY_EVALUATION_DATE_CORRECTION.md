# Source Recency Evaluation-Date Correction

## Outcome

The active source-registry validation defect identified by the independent review was corrected. Persisted source-recency records are now validated against the authoritative evaluation date loaded from the committed source-recency policy. A source record can no longer select its own expected validation date through `source_recency.evaluated_on`.

Workflow research and the research queue were not resumed. No clinical research was performed.

## Repository and starting state

- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `dc6ae16f794800effd04403aa312f448d536657e`
- Starting worktree/index: clean
- Conflicts or active merge/rebase/cherry-pick/revert/bisect/sequencer: none

The mandatory pre-edit checks passed:

- Signed canonical reconciliation
- Canonical mapping reconciliation
- Candidate/support separation: 3/3 tests
- Canonical write authority: 11/11 tests and zero code-generated mappings
- Research queue: 14/14 tests

## Independent-review finding and exact root cause

The independent review found that `validateActiveRegistrySource()` in `scripts/source-first/sourceDateRegistryGate.mjs` passed the persisted value `source.source_recency.evaluated_on` into `validatePersistedSourceRecency()` as the expected `as_of_date`.

Old behavior:

```js
validatePersistedSourceRecency(source, {
  as_of_date: source?.source_recency?.evaluated_on
    ?? sourceRecencyPolicy().evaluation_date,
})
```

Because the record under validation supplied its own expected date, a stale but internally consistent payload could pass. The recency classifier recalculated against the same stale date and reproduced the stale outcome instead of the authoritative policy outcome.

## Corrected validation behavior

The active validator now obtains the authoritative date from the central committed-policy API:

```js
const authoritativeEvaluationDate = sourceRecencyPolicy().evaluation_date
validatePersistedSourceRecency(source, {
  as_of_date: authoritativeEvaluationDate,
})
```

The policy API reads `clinical-expansion-v2/schema/SOURCE_RECENCY_POLICY.json`, whose committed `evaluation_date` is `2026-07-16`. The validator does not use a source field, system clock, file timestamp, access date, verification date, or duplicated date literal as policy authority.

Validation remains read-only. It recalculates the complete expected `source_recency` object and rejects differences in `evaluated_on`, basis, outcome, verification age, warning/routine dates, next recheck, and all other derived fields. It does not silently rewrite the source.

## Regression fixtures

The existing production-module recency suite now imports and directly executes `validateActiveRegistrySource()`.

### Stale self-consistent payload

Fixture metadata:

- Verification date: `2026-06-20`
- Supersession-check date: `2026-06-20`
- Persisted evaluation date: `2026-07-01`
- Persisted age: 11 days
- Persisted outcome: `access_verification_current`

Authoritative recalculation on `2026-07-16` yields:

- Verification age: 26 days
- Outcome: `recheck_due`

Result: active-registry validation rejects the payload with clear mismatches for `source_recency.evaluated_on`, `source_recency.recency_outcome`, and `source_recency.verification_age_days`. This fixture fails if the validator returns to record-selected evaluation-date logic.

### Correct policy-date payload

The same underlying source metadata is classified using the committed policy date:

- Persisted evaluation date: `2026-07-16`
- Verification age: 26 days
- Outcome: `recheck_due`

Result: active-registry validation passes and returns the unchanged source object.

## Validation paths reviewed

All persisted source-recency validation paths were traced:

- `applyResearchBatch.mjs` validates loaded active sources and final source state through `validateActiveRegistrySource()`; new source operations use the policy-date default in `normalizeAndValidateReplaySource()`.
- `recordInitialSourceResearch.mjs` uses `normalizeAndValidateReplaySource()` without overriding its policy-date default.
- `canonicalMappingStore.mjs` validates every loaded source through `validateActiveRegistrySource()`.
- `sourceMetadataReplay.mjs` obtains `asOfDate` from `sourceRecencyPolicy().evaluation_date`, uses it for every replay operation, and validates final sources through the active gate.
- Replay parity exact-compares active source records against fixed-policy replay output.
- `runCheck.mjs` source-recency audit calls `validatePersistedSourceRecency()` with its committed-policy default.
- `validateStrongerDateProvenance.mjs` uses the same fixed default.
- `sourceMetadataReproducibility.mjs` independently validates persisted recency with the fixed default before fingerprint comparisons.
- Replay and manifest builders explicitly pass `recencyPolicy.evaluation_date`.
- Standalone source-metadata fingerprint verification hashes the complete persisted `source_recency`, including `evaluated_on`; the unchanged stored artifact detects drift, while integrated reproducibility supplies independent fixed-policy semantic validation.

No remaining production path uses persisted `source_recency.evaluated_on` as expected policy authority. Lower-level classifier APIs retain optional caller-supplied dates for deterministic tests and replay construction, but all production callers use the committed policy date.

## Active source-data impact

No source registry or active metadata record changed. All 235 active sources already persist `evaluated_on: 2026-07-16`.

### Recency basis totals

| Basis | Count |
|---|---:|
| Explicit stronger date | 25 |
| Approved unknown | 3 |
| Weaker metadata | 69 |
| Access/verification only | 138 |
| **Total** | **235** |

### Exclusive outcome totals

| Outcome | Count |
|---|---:|
| Explicit stronger-date current | 24 |
| Approved-unknown current | 3 |
| Weaker-metadata current | 65 |
| Access/verification current | 120 |
| Recheck due | 23 |
| Expired, incomplete, unavailable, or superseded | 0 |
| **Total** | **235** |

### Basis-by-outcome reconciliation

| Basis | Current | Recheck due | Total |
|---|---:|---:|---:|
| Explicit stronger date | 24 | 1 | 25 |
| Approved unknown | 3 | 0 | 3 |
| Weaker metadata | 65 | 4 | 69 |
| Access/verification only | 120 | 18 | 138 |
| **Total** | **212** | **23** | **235** |

The historical-backlog reconciliation remains valid. `hrs-ishne-ambulatory-ecg-2017` is the twenty-third active due source because of its recorded recency gap; its historical dispositions are class A/D rather than backlog class F.

MOHAP remains unchanged: its publication value is an approved unknown, its webpage update remains weaker metadata, and its verification/check dates remain `2026-07-15`.

## Replay and fingerprint stability

Real source-batch replay passed with:

- Initial module applied: yes
- Numbered batches: 77
- Total modules: 78
- Source operations: 251
- Reconstructed sources: 235
- Supplement used: no
- Parity diagnostics: zero

No replay, manifest, source registry, or fingerprint artifact was regenerated or changed.

- Source-metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `4818f94c18b29d8af292f4ed5839cd89147928ca6f7723489a2fa239424356fc`

Stored, active, and replay source-metadata fingerprints matched exactly.

## Focused validation

All seven required focused commands passed:

| Command | Result |
|---|---|
| `test:source-recency-policy` | 10/10 tests passed, including stale rejection and correct-date acceptance |
| `test:source-date-precision` | 4/4 tests passed |
| `validate:persisted-source-date-provenance` | Passed for 235 sources |
| `test:source-batch-replay-parity` | 2/2 tests passed |
| `test:metadata-recheck-isolation` | 3/3 tests passed |
| `verify:source-metadata-fingerprint` | Passed; stored and active fingerprints matched |
| `verify:source-metadata-reproducibility` | Passed; stored, active, replay, and manifest fingerprints matched |

Additional production-module suites passed:

- Source-date semantics: 15/15
- Metadata fingerprint: 8/8
- Metadata reproducibility: 5/5
- Replay-date provenance verifier: 77 numbered batches, 251 operations, 235 sources, zero diagnostics
- Source-recency provenance audit: passed

Relevant unit-test total: 47/47.

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

Twenty commands passed. Only the three explicitly authorized programme audits remained blocked.

## Programme-boundary confirmation

- Workflows 0776–1500: unchanged, all `not_started` / `research_interrupted`
- Next workflow: `gyn-menopause-symptom-review`
- Supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12
- `public/data` changed: no
- Source records changed: no
- Fingerprint or replay artifacts changed: no
- Canonical mapping state changed: no
- Approval manifest or detached signature changed: no

Only the active validator, its focused test suite, and this correction report are part of the correction. No workflow research, clinical research, queue continuation, source conclusion change, workflow-status change, mapping change, public-data change, exclusion change, push, deployment, merge, rebase, signing, or approval occurred.

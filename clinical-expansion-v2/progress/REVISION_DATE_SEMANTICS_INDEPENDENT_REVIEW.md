# Independent review of `revision_date` semantics correction

Review date: 2026-07-16 (Asia/Dubai)

Verdict: `FAIL_REVISION_DATE_SEMANTICS_REQUIRES_FURTHER_WORK`

## Executive conclusion

The correction centralises the protected stronger-date fields, adds `revision_date`, and wires the central guard into every production consumer requested by this review. The same-date invalid promotion is rejected for the intended semantic reason in assignment, raw metadata, replay, active-registry, source-evidence, source-recency, reproducibility, and canonical-context paths. The active and replayable MOHAP records remain correct and no collateral programme state changed.

The review nevertheless fails for two independently reproduced reasons:

1. A non-null `revision_date` with a different value from the webpage-update date is accepted when the only available evidence is generic `Last updated` wording. The guard detects duplicated date values; it does not require separate explicit revision evidence for a different date. Focused probe E therefore fails the required rule.
2. The protected-field completeness test is not anchored to an independent authoritative schema or semantic-field contract. Deliberately removing `service_commencement_date` or `legal_effective_date` from production protection leaves all 18 committed tests green.

No correction was made. Research must not resume.

## Repository verification

| Item | Verified value | Result |
| --- | --- | --- |
| Branch | `source-first-guideline-expansion-1500-v2` | Correct |
| Starting HEAD | `36a01574968ac07b8632ea05e10fb117e51f9635` | Correct |
| Failed-review HEAD | `acc86db7642b4654e9d4aad9bbdc433a2eb94621` | Correct comparison base |
| Correction commits | `cab3ab58e3dffa0351c8308bdb266cc719fadb1a`, `6a8441ba878bccd4939cf0cc12c4255b12c8d3fd`, `36a01574968ac07b8632ea05e10fb117e51f9635` | Present in order |
| Stable `main` | `95758951d46510f34548b5520510c5d9d59f017f` | Unchanged |
| Protected forensic branch | `9b4cddb0fb226543ce621cb14a672a4edf789261` | Unchanged |
| Entry working tree | Clean | Verified |

The frozen entry state was 1,500 workflows: sequences 0001–0775 were terminal (652 `partial_exact_source_verified`, 123 `no_authoritative_source_found`) and sequences 0776–1500 were all 725 `research_interrupted`. Sequence 0776 and the restart state both identify `gyn-menopause-symptom-review` as next. Supported mappings and candidate proposals were 0; unsupported legacy items were 83,303; registered sources were 235; UAE applicability remained 676 workflows and 701 findings; active exclusions remained 12.

## Changed-file classification

The complete diff from `acc86db7642b4654e9d4aad9bbdc433a2eb94621` to `36a01574968ac07b8632ea05e10fb117e51f9635` contains exactly seven files:

| Changed file | Classification | Independent assessment |
| --- | --- | --- |
| `scripts/source-first/sourceDateSemantics.mjs` | Central date-semantics definition; production validation | Adds the central field/label authority, metadata parser, revision protection, and exact legacy compatibility tuples. Contains the probe-E defect described below. |
| `scripts/recordInitialSourceResearch.mjs` | Production validation path; initial registry enforcement | Imports and applies the central assertion before initial source-registry writes. |
| `scripts/source-first/applyResearchBatch.mjs` | Replay or registry enforcement | Validates incoming sources, existing target-registry sources, and every reloaded registry source. |
| `scripts/source-first/canonicalMappingStore.mjs` | Production validation path | Validates repository sources before canonical-mapping context creation. |
| `scripts/source-first/runCheck.mjs` | Source-evidence, recency, and reproducibility enforcement | Moves semantics enforcement into the common source-registry loader used by all three checks. |
| `scripts/source-first/sourceDateSemantics.test.mjs` | Test | Expands the suite to 18 cases, but does not independently prove field completeness or execute the claimed replay/registry integrations. |
| `clinical-expansion-v2/progress/REVISION_DATE_SEMANTICS_GUARD_CORRECTION.md` | Documentation | Correction report inspected; its conclusions were not assumed. |

Package wiring changes: none. Unrelated changes: none. No source record, replay batch, workflow, research record, mapping, candidate, public-data file, exclusion, execution manifest, restart state, or evidence-hash file changed in the correction diff.

## Central protected-field assessment

`SOURCE_DATE_SEMANTICS.protectedStrongerDateFields` is the production authority and contains all five reported fields:

- `publication_date`
- `effective_date`
- `revision_date`
- `service_commencement_date`
- `legal_effective_date`

The guard, assignment helper, and tests derive from that central constant; consumers import the guard rather than maintaining their own production field lists. The implementation is not special-cased to the MOHAP source ID or URL. Exact compatibility is limited to fifteen established NICE revision tuples and one NHS effective-date tuple.

The generic webpage-update labels are centrally represented as `last updated`, `last updated on`, `modified`, `page updated`, `content updated`, `webpage updated`, and `source modified`. Wrapped, hyphenated, underscored, prefixed, connector, punctuation, weekday, ISO, and day-month-year forms are normalised. Explicit labels including `Revision date`, `Revised on`, `Formally revised`, `Revision effective from`, and `Edition revision date` remain representable through assignment and explicit independent `date_provenance`.

The decisive semantic defect is in `sourceDateSemanticsErrors`: it reports a protected field only when that field's value equals a date found in a structured webpage-update field or parsed from update metadata. For:

```json
{
  "webpage_last_updated_date": "2026-07-10",
  "revision_date": "2025-11-01",
  "version": "Last updated."
}
```

the production function returns `[]` and `assertSourceDateSemantics` accepts the record. Adding `date_provenance.revision_date` with the generic label `Last updated` and `independent_from_webpage_update: true` does not change that acceptance because provenance is examined only after a date-value match. Thus a generic webpage update can still be the only asserted evidence associated with a different non-null `revision_date`.

## Production-path assessment

| Required path | Central enforcement traced | Same-date invalid probe |
| --- | --- | --- |
| Initial source-registry creation | `recordInitialSourceResearch.mjs` asserts every source before writes | Rejected in a disposable clone before registry writes |
| Incoming batch-registry validation | `applyResearchBatch.mjs` asserts the incoming source | Rejected at the incoming-source guard |
| Existing registry validation | Batch applier asserts every source already in the target registry | Rejected at the existing-registry guard |
| Metadata-only replay | Batch applier receives the raw source; central metadata parser supplies the update date | Rejected for the revision semantic error |
| Full batch replay | Same incoming guard is reached by an all-terminal replay | Rejected for the revision semantic error |
| Registry reload | Every source in all four reloaded registries is asserted | Guard present; no silent stripping |
| Source-evidence validation | Common `loadSourceRegistry` accumulates central semantic errors | Rejected only for the intended semantic error |
| Source-recency validation | Uses the same guarded registry loader | Rejected only for the intended semantic error |
| Clinical-data reproducibility | Invokes the same guarded registry loader | Rejected only for the intended semantic error; `public_data_changed: false` |
| Canonical-mapping context loading | Asserts every repository source before constructing context | Rejected at context creation for the intended semantic error |

No required production path omits the central guard, silently removes `revision_date`, or relies on an unrelated validator for the same-date case. Replay and active-registry behavior agree. However, because every path delegates to the same guard, every path would accept focused probe E. Production-path wiring passes, but end-to-end semantic protection fails.

## Protected-field completeness-test independence

The committed test avoids a second manually duplicated field array, but its expected protected set, generated fixture, expected errors, and per-field loops all derive from the production `SOURCE_DATE_SEMANTICS.protectedStrongerDateFields` constant. Its only separately hard-coded membership assertion is for `revision_date`.

The active-source `_date` scan is independent but observes only `publication_date`, `effective_date`, `revision_date`, and `webpage_last_updated_date`. It cannot protect schema-approved stronger fields not currently present in active data. Repository inspection found no approved source-registry JSON Schema, schema annotation, or separately reviewed semantic-field contract naming the five stronger fields.

An in-memory mutation audit ran the unchanged committed test source against a production module with one protected field removed:

| Field removed from production protection | Test result |
| --- | --- |
| `revision_date` | Failed: 9 passed, 9 failed |
| `effective_date` | Failed: 15 passed, 3 failed |
| `service_commencement_date` | Incorrectly passed: 18/18 |
| `legal_effective_date` | Incorrectly passed: 18/18 |

The completeness assertion is therefore self-referential for fields outside active data and can remain green while production protection is incomplete. Completeness-test result: FAIL.

## Focused independent probes

All probes used temporary in-memory fixtures or a disposable repository clone. The clone, its `node_modules` junction, and all fixture material were removed; the production repository remained unchanged.

| Probe | Expected | Observed | Result |
| --- | --- | --- | --- |
| A. Generic `Last updated on 10th Jul, 2026`; structured page-update and revision dates both `2026-07-10` | Rejected | Rejected with `revision_date duplicates a webpage-update date without independent explicit provenance` | PASS |
| B. Metadata-only replay of the same invalid record | Rejected | Actual batch-applier path rejected the raw record for the same semantic error | PASS |
| C. Existing registry containing the same invalid record | Rejected | Actual existing-registry, source-evidence, source-recency, reproducibility, and canonical-context paths rejected it for the same semantic error | PASS |
| D. Explicit `Revision date: 10 July 2026` with valid independent revision provenance | Accepted | Accepted by the production guard | PASS |
| E. Page update `2026-07-10`, revision `2025-11-01`, only generic `Last updated` evidence | Rejected absent separate revision evidence | Incorrectly accepted; errors `[]` | FAIL |
| F. `revision_date: null` | Accepted | Accepted | PASS |
| G. Absent `revision_date` | Accepted | Accepted | PASS |

Probe E independently establishes that the required invariant is not enforced.

## MOHAP metadata and residual search

The active registry and replayable `batch-0726-0735.mjs` record for `mohap-medical-leave-attestation-2026` agree exactly:

| Field | Active and replayable value |
| --- | --- |
| `publication_date` | `undated_on_official_page` |
| `effective_date` | `null` |
| `revision_date` | `null` |
| `webpage_last_updated_date` | `2026-07-10` |
| `recency_verification.verified_on` | `2026-07-15` |
| `superseded_status_check.checked_on` | `2026-07-15` |

The correct official URL and administrative-service classification are retained. Searches for the source ID, URL, and `2026-07-10`, plus a structured scan of all 235 active sources and the replay object, found zero active assignments of that date to `publication_date`, `effective_date`, `revision_date`, `service_commencement_date`, or `legal_effective_date`. Remaining stronger-field occurrences are regression fixtures or accurate historical reports. Residual incorrect active occurrences: 0.

## Date-semantics test quality

`npm run test:source-date-semantics` reports 18/18 passing. The test categories and counts are:

| Category | Tests |
| --- | ---: |
| Page-update label by protected-field matrix | 1 |
| Direct revision and wrapped/provenance rejection | 2 |
| Negation/false-positive controls and approved weak fields | 2 |
| Explicit publication and revision positive cases | 2 |
| Exact NICE and NHS legacy compatibility | 2 |
| Active, structured, raw-metadata, and human-metadata negative cases | 4 |
| Connector/separator and decoy structured-date cases | 2 |
| Protected-field completeness | 1 |
| Independently labelled same-day publication | 1 |
| Active/replayable MOHAP parity | 1 |
| Total | 18 |

The direct negative tests assert exact semantic reasons, the explicit-revision positive reaches successful semantic validation, and unrelated schema failures are not being mistaken for protection. Those portions pass.

Test quality as a whole fails. The test named for raw replay directly calls `sourceDateSemanticsErrors` and `assertSourceDateSemantics`; the active-source validation test also calls the guard directly; and the MOHAP parity test imports the batch object without executing the batch applier. No committed test runs `applyResearchBatch.mjs`, the guarded `runCheck.mjs` consumers, or repository canonical-context loading with an invalid fixture. The suite therefore does not genuinely exercise replay/registry integration and remains green despite focused probe E. The committed suite creates no filesystem fixture, so it has no success/failure cleanup path to assess; the independent integration fixtures were cleaned after both successful and failing probes.

## Prescribed validation

| # | Command | Result |
| ---: | --- | --- |
| — | `npm run test:source-date-semantics` | PASS — 18/18 |
| 1 | `npm run verify:signed-canonical-reconciliation` | PASS — supported mappings 0; unsupported 83,303; key-set hash `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` |
| 2 | `npm run verify:canonical-mapping-reconciliation` | PASS |
| 3 | `npm run test:candidate-support-separation` | PASS — 3/3 |
| 4 | `npm run audit:canonical-write-authority` | PASS — 11/11 and audit pass |
| 5 | `npm run audit:no-code-generated-mappings` | PASS — generated mappings 0 |
| 6 | `npm run validate:data` | PASS — 1,500 workflows; 12 exclusions |
| 7 | `npm run validate:source-evidence` | PASS — 1,500 research records; 235 sources |
| 8 | `npm run validate:item-provenance` | PASS — 83,303 items; source-derived 0 |
| 9 | `npm run audit:no-generic-templates` | PASS — 0 matches |
| 10 | `npm run audit:exact-source-coverage` | EXPECTED BLOCKER — exact 0, partial 652, no source 123, interrupted 725; clinical blockers 1,500 |
| 11 | `npm run audit:source-recency` | PASS — 235 sources |
| 12 | `npm run audit:uae-applicability` | EXPECTED BLOCKER — 676 affected workflows; 701 findings: 652 partial, 49 missing explicit evidence, 0 other |
| 13 | `npm run audit:unsupported-legacy-content` | EXPECTED BLOCKER — 83,303 |
| 14 | `npm run audit:research-claims` | PASS — 1,500 |
| 15 | `npm run test:safety` | PASS — 16 tests; 12 exclusions |
| 16 | `npm run test:all-workflows` | PASS — 1,500 workflows, overlays, and research records |
| 17 | `npm run test:output-safety` | PASS — 10 checks |
| 18 | `npm run test:exclusions` | PASS — 12 active, 0 proposed |
| 19 | `npm run verify:source-evidence-hashes` | PASS — 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes |
| 20 | `npm run verify:clinical-data-reproducibility` | PASS — 10 baseline files; `public_data_changed: false` |
| 21 | `npm run test:research-queue` | PASS — 14/14; queue not run |
| 22 | `npm run lint` | PASS — exit 0; 0 errors; 172 warnings |
| 23 | `npm run build` | PASS |

Only the three expressly permitted programme audits remained blocked. All other prescribed commands passed. The independent semantic and completeness failures remain review blockers despite the green command suite.

## Collateral-state verification

| State | Verified result |
| --- | --- |
| Workflows 0001–0775 | 775 terminal; 652 partial exact-source and 123 no-authoritative-source |
| Workflows 0776–1500 | 725 `research_interrupted`; boundary violations 0 |
| Next workflow | `gyn-menopause-symptom-review` |
| Registered sources | 235 |
| UAE applicability | 676 workflows; 701 findings |
| Supported mappings | 0 |
| Candidate proposals | 0 JSON documents |
| Unsupported legacy items | 83,303 |
| Active exclusions | 12; unchanged |
| `public/data` versus stable `main` | Unchanged; tree `ed1a080bdbb2936797ec6fbb7479e3713b1c97a8` on both |
| Workflow tree across correction | Unchanged; tree `0c39c93428247e8b0a8393a3be4e1af7cdca13bc` |
| Canonical directory | Unchanged; tree `4174da43602a5975c72ec8119a3be62bf8ca5a86` |
| Signed approval manifest | Unchanged; blob `2efa36ac4ff71758813409bcd978fed4ac1d1c0a` |
| Detached signature | Unchanged; blob `384291c01543e810e07292099e472d197a2546af` |
| Execution manifest | Unchanged; blob `a41ac9fb4b884f5eb24021f26617af37be6eff3c` |
| Restart state | Unchanged; blob `dbc85dfa2d8d102ca19ac9fa7b96e558abf88974` |
| Evidence-hash manifest | Unchanged; blob `7ec4444b9f4d3d2c1d195c87315f38aeef44a0e2` |
| Active MOHAP registry/replay blobs | Unchanged; `e2b7af99a83a3dd9a52f9eb9a07308dd31cae241` / `9333f599e8bcf93c333ee8901d04447a583a6551` |

No workflow from 0776 onward, public datum, exclusion, canonical artifact, signature, manifest, restart record, or evidence hash changed.

## Queue decision and prohibited actions

Research may resume: NO.

The queue was not resumed and no clinical research was conducted. No production guard, test, schema, source record, batch module, workflow, mapping, accounting file, execution manifest, restart state, public datum, or exclusion was corrected or modified. No push, deployment, merge, rebase, signing, or approval action was performed.

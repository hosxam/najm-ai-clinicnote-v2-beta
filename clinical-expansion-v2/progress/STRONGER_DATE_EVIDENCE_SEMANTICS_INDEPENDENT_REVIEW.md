# Independent review of stronger-date evidence semantics

Review date: 2026-07-16 (Asia/Dubai)

Verdict: `FAIL_STRONGER_DATE_EVIDENCE_SEMANTICS_REQUIRES_FURTHER_WORK`

## Executive conclusion

The correction successfully makes the direct field-specific validator independent of date equality. Unlisted fixtures with generic webpage-update wording are rejected whether the stronger date is the same, different, or present without a structured webpage-update date. Explicit field-appropriate evidence remains representable. The independent schema also closes the prior `service_commencement_date` and `legal_effective_date` completeness omissions.

The review nevertheless fails for two material reasons:

1. The frozen pre-contract tuple mechanism is a broad exception to field-specific evidence. It enumerates every active source and permits 543 stronger-date claims that the production validator itself rejects once tuple identity is disabled. No tuple contains per-field supporting provenance, 230/230 effective-date claims and 89/89 revision-date claims depend solely on the exception, and no migration or sunset policy exists.
2. The committed production-path test reads source files and applies regular expressions to confirm imports/calls. It does not execute initial registry creation, batch/replay, existing-registry, source-evidence, recency, reproducibility, or canonical-context paths with an invalid record. The green repository checks execute those paths only against already accepted active data.

No correction was made. Workflow research must not resume.

## Repository verification

| Item | Verified value | Result |
| --- | --- | --- |
| Branch | `source-first-guideline-expansion-1500-v2` | Correct |
| Starting HEAD | `16bb6f708f50b48e155591f82eaf0f8a83e60675` | Correct |
| Previous failed-review HEAD | `0610e1def1b82bb46d9296b91a54f1ab4a80238d` | Correct comparison base |
| Stable `main` | `95758951d46510f34548b5520510c5d9d59f017f` | Unchanged |
| Protected forensic branch | `9b4cddb0fb226543ce621cb14a672a4edf789261` | Unchanged |
| Entry working tree | Clean | Verified |

The execution manifest contains 1,500 workflows. Sequences 0001–0775 are terminal: 652 `partial_exact_source_verified` and 123 `no_authoritative_source_found`. Sequences 0776–1500 are all 725 `research_interrupted`, with zero terminal entries after 0775. Sequence 0776 and the restart state both identify `gyn-menopause-symptom-review` as next.

Supported mappings remain 0, candidate proposal documents remain 0, unsupported legacy items remain 83,303, registered sources remain 235, UAE applicability remains 676 workflows and 701 findings, and active exclusions remain 12.

## Changed-file review

The diff from `0610e1def1b82bb46d9296b91a54f1ab4a80238d` to `16bb6f708f50b48e155591f82eaf0f8a83e60675` contains exactly five files:

| File | Classification | Review finding |
| --- | --- | --- |
| `scripts/source-first/sourceDateSemantics.mjs` | Central production date-semantics contract and validator | Direct generic-date semantics corrected; tuple exception is overbroad and provenance-free. |
| `scripts/source-first/sourceDateSemantics.test.mjs` | Focused semantic/completeness test | Independent field completeness passes; production-path coverage is static only. |
| `clinical-expansion-v2/schema/SOURCE_REGISTRY_DATE_FIELDS.schema.json` | Independent field classification | Correctly names five stronger fields and three webpage-update fields. |
| `clinical-expansion-v2/schema/ESTABLISHED_SOURCE_DATE_TUPLES.json` | Frozen compatibility allowlist | Finite and exact, but covers the entire active registry and lacks per-field evidence provenance or migration policy. |
| `clinical-expansion-v2/progress/STRONGER_DATE_EVIDENCE_SEMANTICS_CORRECTION.md` | Correction documentation | Inspected but not assumed accurate; its tuple-safety conclusion is not supported by this review. |

Unrelated changes: none. No registry/replay consumer, package script, source record, workflow, research record, mapping, candidate, public datum, exclusion, manifest, restart record, or evidence hash changed in the correction diff.

## Date-meaning assessment

The direct validator no longer compares stronger-date values with webpage-update dates. `sourceDateSemanticsErrors` checks permitted null/unknown values, explicit field provenance, explicit label/date evidence in the same bounded metadata segment, and finally an exact tuple. It does not infer meaning from equality, inequality, recency, access date, review date, or comparison with another date.

Independent field-by-field probes produced the following result for all five protected fields:

| Probe | Result |
| --- | --- |
| Generic update wording; same date | Rejected for missing field-specific evidence |
| Generic update wording; different date | Rejected for missing field-specific evidence |
| Generic update wording; no structured webpage-update date | Rejected for missing field-specific evidence |
| Explicit field-appropriate label and matching date | Accepted |
| Null | Accepted |

The required revision probe with `webpage_last_updated_date: 2026-07-10`, `revision_date: 2025-11-01`, and only `Last updated on 10 July 2026` is rejected for the intended revision-evidence reason. Same-date generic revision is also rejected. Explicit `Revision date: 10 July 2026` is accepted.

Generic labels including `last updated`, `page updated`, `webpage updated`, `modified`, `content updated`, and `source modified` are not in any explicit stronger-field label set. Direct assignment also rejects their use for stronger fields.

Direct equality-independence result: PASS. Overall evidence-semantics result: FAIL because exact tuples bypass the field-specific evidence requirement for most active claims.

## Central evidence-contract assessment

`SOURCE_DATE_SEMANTICS.strongerDateFieldContract` centrally defines:

- field identity
- semantic evidence category
- accepted explicit labels
- accepted evidence categories
- prohibited generic webpage-update category
- permitted null values
- approved unknown values

Protected fields are exactly:

- `publication_date`
- `effective_date`
- `revision_date`
- `service_commencement_date`
- `legal_effective_date`

The only approved non-null unknown is `publication_date: undated_on_official_page`. `revision_date` has no approved non-null unknown representation; its permitted unknown list is empty. The focused test therefore covers null revision but cannot satisfy the requested “approved unknown revision representation” case because no such representation exists.

## Production-path assessment

All required consumers import the central validator rather than maintaining separate stronger-date field lists:

| Path | Central call present | Adversarial execution in committed suite |
| --- | --- | --- |
| Initial registry creation | Yes | No; source-text regex only |
| Incoming batch validation | Yes | No; source-text call count only |
| Existing registry validation | Yes | No; source-text call count only |
| Metadata-only replay | Same incoming batch path | No invalid replay executed |
| Full replay | Same incoming batch path | No invalid replay executed |
| Registry reload | Yes | No invalid registry executed |
| Source-evidence validation | Guarded shared loader | Valid active data only |
| Source-recency validation | Guarded shared loader | Valid active data only |
| Clinical-data reproducibility | Guarded shared loader | Valid active data only |
| Canonical-mapping context loading | Yes | No invalid context executed |

Production wiring itself is central and consistent. No separate consumer field list was found. Test reach is insufficient: the test named `all production registry and replay paths retain the central date-semantics guard` reads four production source files and uses regular expressions; it does not invoke those paths.

## Completeness-test independence

`SOURCE_REGISTRY_DATE_FIELDS.schema.json` is separate from the production contract and independently classifies the expected stronger-date fields. The test derives its expected fields from the schema and compares them with production protection rather than comparing the production constant with itself.

Individual omission results:

| Production rule removed | Detected |
| --- | --- |
| `publication_date` | Yes |
| `effective_date` | Yes |
| `revision_date` | Yes |
| `service_commencement_date` | Yes |
| `legal_effective_date` | Yes |

The suite also detects a future schema-approved stronger-date field without a production rule, a rule containing only generic webpage-update labels, and a rule mixing a prohibited generic label into explicit labels. Production-path wiring is tested separately from field presence.

Completeness-test result: PASS. The two previously missed omissions, `service_commencement_date` and `legal_effective_date`, are now independently detected.

## Frozen pre-contract tuple assessment

### Structural properties

| Property | Finding |
| --- | --- |
| Tuple entries | 235 |
| Unique source IDs | 235 |
| Active source records represented | 235/235 |
| Stronger-date claims recorded | 554 |
| Fields represented | 235 publication, 230 effective, 89 revision |
| Service-commencement tuples | 0 |
| Legal-effective tuples | 0 |
| Finite and explicitly enumerated | Yes |
| Runtime generation | No generator/reference found |
| Wildcard or partial identity matching | No |
| Exact identity binding | Source ID, organisation, title, URL |
| Exact field/value binding | Yes |
| Duplicate tuple IDs | 0 |
| Per-field provenance/evidence properties | 0 entries |
| Migration owner, sunset, review date, or retirement policy | None |

The file is fixed to baseline commit `0610e1def1b82bb46d9296b91a54f1ab4a80238d`. A changed source ID, organisation, title, URL, field, or value does not match. The file is not expanded by registry reads or replay and no automatic generator references it.

### Evidence quality

The tuple mechanism does not document historical field-specific provenance. Each entry contains only source identity and `stronger_dates`; there is no official label, quoted/located source evidence, section, page, evidence category, reviewer, approval record, or provenance hash for the retained date claim.

An independent probe disabled tuple identity while retaining every other source field and passed each record back through the production validator:

| Field | Claims | Claims dependent only on tuple |
| --- | ---: | ---: |
| `publication_date` | 235 | 224 |
| `effective_date` | 230 | 230 |
| `revision_date` | 89 | 89 |
| Total | 554 | 543 |

All 230 effective-date claims and all 89 revision-date claims lack explicit evidence recognised by the central validator. Of those effective-date claims, 179 equal `publication_date` and are accepted only because the tuple freezes the value.

Examples accepted only through tuples include:

- `bad-hidradenitis-suppurativa-guideline-2018`: `effective_date: 2019-03-01`; metadata says the guideline was published in the journal, not that it became effective on that date.
- `cdc-ringworm-clinical-overview-2024`: `effective_date: 2024-07-15`; metadata says the page is dated, not that an effective date exists.
- `ebi-tonsillectomy-recurrent-2024`: `revision_date: 2024-09-01`; metadata says `last reviewed September 2024`, which the contract does not recognise as explicit revision evidence.

With tuple identity enabled these records return no error; with the source ID changed they produce the expected missing publication/effective/revision evidence errors. This proves the tuple, not field-specific provenance, is the decisive acceptance path.

A newly constructed record that copies an exact tuple identity and field/value passes without proving registry membership or provenance. The tuple is source-level rather than workflow-bound, so another workflow can cite the tuple-backed source. It cannot be reused under a different source identity, but it does not satisfy the stricter requirement that a newly created record or another workflow cannot rely on the exception.

The MOHAP tuple contains only `publication_date: undated_on_official_page`. It does not assign `2026-07-10` to publication, effective, revision, service-commencement, or legal-effective fields.

Frozen-tuple verdict: FAIL. The mechanism is finite and exact but acts as a general exception covering the full active registry. At least 543 retained claims lack explicit supporting provenance, including 230 effective and 89 revision assertions that are semantically unsupported under the stated field-specific evidence contract. No explicit migration policy governs removal of the exception.

## Existing test assessment

`npm run test:source-date-semantics` passed 26/26.

The suite directly covers:

- same-date generic revision rejection
- different-date generic revision rejection
- explicit revision acceptance
- null revision acceptance
- all five stronger-date fields
- individual omission mutation for all five fields
- schema/contract completeness
- generic-only and mixed-generic rule failures
- exact tuple identity/date near misses
- active source scan
- MOHAP active/replay object parity

The suite does not cover an approved non-null revision unknown because the contract defines none. It also does not execute invalid fixtures through initial registry creation, batch/replay, existing registry, shared `runCheck` consumers, or canonical-context loading. Its production-path test is static source inspection.

Semantic test command result: PASS, 26/26. Test sufficiency for the requested end-to-end path assertions: FAIL.

## MOHAP metadata verification

The active registry and replayable `batch-0726-0735.mjs` source agree:

| Field | Active and replayable value |
| --- | --- |
| `publication_date` | `undated_on_official_page` |
| `effective_date` | null |
| `revision_date` | null |
| `service_commencement_date` | absent/null |
| `legal_effective_date` | absent/null |
| `webpage_last_updated_date` | `2026-07-10` |
| `verified_on` | `2026-07-15` |
| `checked_on` | `2026-07-15` |

The exact official URL remains `https://mohap.gov.ae/en/w/attestation-of-medical-leaves-and-reports`. A structured scan of all active sources found zero stronger-date assignments of `2026-07-10`, including zero for the MOHAP source. MOHAP metadata result: PASS.

## Validation results

| Command | Result |
| --- | --- |
| `npm run test:source-date-semantics` | PASS — 26/26 |
| `npm run verify:signed-canonical-reconciliation` | PASS — supported 0; unsupported 83,303 |
| `npm run verify:canonical-mapping-reconciliation` | PASS |
| `npm run test:candidate-support-separation` | PASS — 3/3 |
| `npm run audit:canonical-write-authority` | PASS — 11/11 and production audit |
| `npm run audit:no-code-generated-mappings` | PASS — generated mappings 0 |
| `npm run validate:data` | PASS — 1,500 workflows; 12 exclusions |
| `npm run validate:source-evidence` | PASS — 1,500 records; 235 sources |
| `npm run validate:item-provenance` | PASS — 83,303 items; 0 source-derived |
| `npm run audit:no-generic-templates` | PASS — 0 matches |
| `npm run audit:exact-source-coverage` | EXPECTED BLOCKER — exact 0; partial 652; no source 123; interrupted 725 |
| `npm run audit:source-recency` | PASS — 235 sources |
| `npm run audit:uae-applicability` | EXPECTED BLOCKER — 676 workflows; 701 findings |
| `npm run audit:unsupported-legacy-content` | EXPECTED BLOCKER — 83,303 items |
| `npm run audit:research-claims` | PASS — 1,500 claims |
| `npm run test:safety` | PASS — 16 tests; 12 exclusions |
| `npm run test:all-workflows` | PASS — 1,500 workflows, overlays, and research records |
| `npm run test:output-safety` | PASS — 10 checks |
| `npm run test:exclusions` | PASS — 12 active; 0 proposed |
| `npm run verify:source-evidence-hashes` | PASS — 1,500 workflow/evidence hashes; 33 index hashes |
| `npm run verify:clinical-data-reproducibility` | PASS — 10 files; `public_data_changed: false` |
| `npm run test:research-queue` | PASS — 14/14; queue not run |
| `npm run lint` | PASS — exit 0; 0 errors; 172 existing warnings |
| `npm run build` | PASS |

Only the three expressly permitted programme audits remain blocked. Green validators do not resolve the independently reproduced tuple-provenance and path-test deficiencies.

## Collateral-state verification

| State | Result |
| --- | --- |
| Terminal workflows | 775 |
| Partial exact-source workflows | 652 |
| No-authoritative-source workflows | 123 |
| Research-interrupted workflows | 725 |
| Registered sources | 235 |
| UAE applicability | 676 workflows / 701 findings |
| Supported mappings | 0 |
| Candidate proposals | 0 |
| Unsupported legacy items | 83,303 |
| Active exclusions | 12 |
| Workflows 0776 onward | Unchanged |
| Execution manifest | Unchanged; blob `a41ac9fb4b884f5eb24021f26617af37be6eff3c` |
| Restart state | Unchanged; blob `dbc85dfa2d8d102ca19ac9fa7b96e558abf88974` |
| Evidence/hash manifest | Unchanged; blob `7ec4444b9f4d3d2c1d195c87315f38aeef44a0e2` |
| `public/data` | Unchanged; tree `ed1a080bdbb2936797ec6fbb7479e3713b1c97a8` |
| Exclusion config | Unchanged; blob `ac66ec0c20901b3fcacc5e2c94a721b947362eb9` |
| Canonical directory | Unchanged; tree `4174da43602a5975c72ec8119a3be62bf8ca5a86` |
| Signed manifest | Unchanged; blob `2efa36ac4ff71758813409bcd978fed4ac1d1c0a` |
| Detached signature | Unchanged; blob `384291c01543e810e07292099e472d197a2546af` |

## Queue decision

Workflow research may resume: NO.

The central direct semantic correction and completeness test are materially improved, but the 235-source tuple allowlist remains a general, provenance-free exception and committed tests do not adversarially execute the required production paths. Further narrow correction and independent review are required before queue continuation.

No production code, test, source record, workflow, mapping, public datum, exclusion, or fixture was modified during this review. No push, deployment, merge, rebase, or queue continuation was performed.

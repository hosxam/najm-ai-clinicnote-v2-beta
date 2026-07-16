# Stronger-date evidence semantics correction

Correction date: 2026-07-16 (Asia/Dubai)

Status: `STRONGER_DATE_EVIDENCE_SEMANTICS_CORRECTION_COMPLETE_REVIEW_REQUIRED`

## Scope and frozen state

This correction was performed on `source-first-guideline-expansion-1500-v2` from starting commit `0610e1def1b82bb46d9296b91a54f1ab4a80238d`. It corrects only the stronger-date evidence validator, its independent field-classification schema, the frozen pre-contract compatibility tuples, and the focused test suite.

The research queue was not resumed. No clinical research, source conclusion, workflow status, mapping, candidate proposal, public application datum, or active exclusion was changed.

The mandatory pre-edit checks passed:

- signed canonical reconciliation: PASS; supported mappings 0; unsupported legacy items 83,303
- canonical mapping reconciliation: PASS
- canonical write authority: PASS
- candidate/support separation: PASS, 3/3
- research queue: PASS, 14/14

The frozen programme state remained:

- workflows 0001–0775: 775 terminal
- `partial_exact_source_verified`: 652
- `no_authoritative_source_found`: 123
- workflows 0776–1500: 725 `research_interrupted`
- next workflow: `gyn-menopause-symptom-review`
- registered sources: 235
- supported mappings: 0
- candidate proposals: 0
- unsupported legacy items: 83,303
- UAE affected workflows: 676
- UAE findings: 701
- active exclusions: 12

Stable `main` remained `95758951d46510f34548b5520510c5d9d59f017f`. The protected forensic branch remained `9b4cddb0fb226543ce621cb14a672a4edf789261`.

## Failed independent-review finding

The failed review proved that this record was accepted even though its only source wording was generic webpage-update metadata:

```json
{
  "webpage_last_updated_date": "2026-07-10",
  "revision_date": "2025-11-01",
  "version": "Last updated on 10 July 2026"
}
```

It also proved that deleting `service_commencement_date` or `legal_effective_date` from production protection left all 18 then-current tests green.

## Root cause

The old validator inferred an invalid promotion primarily from a value relationship between a stronger date and a parsed webpage-update date. A same-date promotion was rejected, but a different stronger-date value could escape because inequality was treated as if it established independent meaning. Date inequality is not evidence: a generic `Last updated` label does not become revision evidence merely because another date value is different.

The old completeness test was also self-referential. Its expected fields, generated fixtures, and protected fields were derived from the same production constant. Fields absent from active source data could disappear from production protection without creating a failing expectation.

## Central field-to-evidence contract

`scripts/source-first/sourceDateSemantics.mjs` now exposes one central contract for every protected stronger-date field. Each rule defines the semantic category, accepted explicit labels, accepted evidence categories, prohibited generic-update category, null policy, and approved unknown values.

| Stronger-date field | Required evidence category | Representative explicit labels | Null / approved unknown |
| --- | --- | --- | --- |
| `publication_date` | publication | `published`, `publication date`, `first published`, `issued on`, repository-used document/page-date terms | null; `undated_on_official_page` |
| `effective_date` | effective date | `effective date`, `effective from`, `takes effect`, `comes into force` | null |
| `revision_date` | revision | `revision date`, `revised on`, `formally revised`, `revision effective from`, repository-used revision terms | null |
| `service_commencement_date` | service commencement | `service commenced`, `service launched`, `available from`, `service start date` | null |
| `legal_effective_date` | legal commencement | `law effective from`, `regulation effective date`, `entered into force`, `legal commencement date` | null |

The only accepted evidence categories are:

1. `explicit_field_label`: a matching field-specific label in structured independent `date_provenance`, or a matching label and date in the same bounded metadata segment.
2. `established_precontract_tuple`: an exact field/value assertion bound to the frozen starting baseline by source ID, issuing organisation, exact document title, and exact official URL.

The pre-contract tuple contract is `clinical-expansion-v2/schema/ESTABLISHED_SOURCE_DATE_TUPLES.json`. It is fixed to baseline commit `0610e1def1b82bb46d9296b91a54f1ab4a80238d`, binds all 235 active source identities, and records 554 existing non-null or approved-unknown assertions: 235 publication, 230 effective, and 89 revision assertions. It is not generated at runtime and does not allow a new source, changed identity, changed URL, changed title, changed organisation, changed field, or changed value to inherit baseline acceptance.

Generic webpage-update labels and fields remain a prohibited evidence category. They cannot support a stronger date when the dates are equal, different, absent from a structured page-update field, plausible, or recent. A bare non-null stronger date without explicit evidence or an exact frozen tuple now fails closed.

Explicit labels are associated with their own bounded metadata segment. A label such as `Revision date: 10 July 2026` cannot borrow an unrelated access or verification date elsewhere in the same metadata string.

## Independent completeness source of truth

`clinical-expansion-v2/schema/SOURCE_REGISTRY_DATE_FIELDS.schema.json` independently classifies the five stronger-date fields and three webpage-update fields. Its annotations identify:

- stronger versus webpage-update semantics
- field-specific evidence category
- explicit evidence example
- accepted evidence categories
- prohibited evidence categories
- null policy
- approved unknown values

The test derives the expected stronger-date field set from this schema, not from the production validator. It then compares the independently classified fields with the production contract.

The two removals previously missed were:

- `service_commencement_date`
- `legal_effective_date`

Omission mutation now fails independently for each field:

| Removed production field | Completeness result |
| --- | --- |
| `publication_date` | Detected |
| `effective_date` | Detected |
| `revision_date` | Detected |
| `service_commencement_date` | Detected |
| `legal_effective_date` | Detected |

The suite also fails when a schema-classified stronger-date field has no rule, when a rule contains only generic webpage-update labels, when a generic label is mixed into otherwise explicit labels, or when a required production consumer no longer imports/calls the central validator.

## Production paths

All required consumers were already wired to the central module; correcting that module applies the same semantics without duplicating field lists. Static integration assertions verify these paths:

- initial source-registry creation: `recordInitialSourceResearch.mjs`
- incoming batch source validation: `applyResearchBatch.mjs`
- existing target-registry validation: `applyResearchBatch.mjs`
- metadata-only and full batch replay incoming source path: `applyResearchBatch.mjs`
- registry reload across all source registries: `applyResearchBatch.mjs`
- source-evidence validation: guarded `loadSourceRegistry()` in `runCheck.mjs`
- source-recency validation: the same guarded loader in `runCheck.mjs`
- clinical-data reproducibility: the same guarded loader in `runCheck.mjs`
- canonical-mapping context loading: `canonicalMappingStore.mjs`

No consumer silently rewrites or strips a stronger-date value. The intended semantic error is returned before downstream use.

## Focused semantic results

`npm run test:source-date-semantics` passed 26/26 tests.

| Category | Tests | Result |
| --- | ---: | --- |
| Independent schema/contract and completeness | 5 | PASS |
| Production-path central wiring | 1 | PASS |
| Assignment and provenance semantics | 4 | PASS |
| Same-date, different-date, bare-value, and required revision negatives | 4 | PASS |
| Explicit evidence and label/date association | 3 | PASS |
| Null/unknown, webpage-field, and negation behavior | 3 | PASS |
| Generic variants, exact pre-contract tuples, and raw metadata | 3 | PASS |
| Active registry, source recency, and MOHAP parity | 3 | PASS |
| Total | 26 | PASS |

Field-by-field matrices cover every stronger-date field for:

- generic webpage-update wording with the same date: rejected
- generic webpage-update wording with a different date: rejected
- a non-null value without evidence: rejected
- explicit field-appropriate wording/provenance: accepted
- null or approved unknown representation: accepted

Revision-specific results:

- same date as generic `Last updated`: rejected for missing explicit revision evidence
- different date `2025-11-01` with only `Last updated on 10 July 2026`: rejected for missing explicit revision evidence
- explicit `Revision date: 10 July 2026`: accepted
- explicit revision label next to a different date elsewhere in metadata: the unrelated date is rejected

## Source recency

`audit:source-recency` passed for all 235 registered sources. The recency path first uses the guarded source-registry loader. Its recency logic does not compare publication, effective, revision, service-commencement, or legal-effective values to infer validity. Webpage update, access/review, and stronger dates remain separate metadata types.

## MOHAP verification

The active registry and replayable batch retain the same record for `mohap-medical-leave-attestation-2026`:

| Field | Value |
| --- | --- |
| `publication_date` | `undated_on_official_page` |
| `effective_date` | null |
| `revision_date` | null |
| `webpage_last_updated_date` | `2026-07-10` |
| `recency_verification.verified_on` | `2026-07-15` |
| `superseded_status_check.checked_on` | `2026-07-15` |

A structured scan found zero active assignments of `2026-07-10` to publication, effective, revision, service-commencement, or legal-effective fields for this source. Historical reports remain historical and were not rewritten.

## Downstream impact

Active source records changed: 0. Replayable batch records changed: 0. Workflow statuses changed: 0. UAE applicability changed: 0. Source-recency totals changed: 0. Evidence hashes changed: 0. Execution manifest changed: 0. Restart state changed: 0. Public application data changed: 0. Active exclusions changed: 0.

Canonical mapping files, signed approval state, execution state, source registries, workflows, research records, and workflows 0776 onward are unchanged from the starting commit.

## Complete validation

| Command | Result |
| --- | --- |
| `npm run test:source-date-semantics` | PASS — 26/26 |
| `npm run verify:signed-canonical-reconciliation` | PASS — supported 0; unsupported 83,303 |
| `npm run verify:canonical-mapping-reconciliation` | PASS |
| `npm run test:candidate-support-separation` | PASS — 3/3 |
| `npm run audit:canonical-write-authority` | PASS — 11/11 and production audit |
| `npm run audit:no-code-generated-mappings` | PASS — 0 generated mappings |
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
| `npm run verify:clinical-data-reproducibility` | PASS — 10 baseline files; `public_data_changed: false` |
| `npm run test:research-queue` | PASS — 14/14; queue not run |
| `npm run lint` | PASS — exit 0; 0 errors; 172 existing warnings; 0 new warnings |
| `npm run build` | PASS |

Only the three expressly permitted programme blockers remain blocked.

## Internal second review

The final independent recheck confirmed:

- same-date generic-update promotion is rejected
- different-date generic-update promotion is rejected
- explicit revision evidence is accepted
- explicit labels cannot borrow unrelated dates from other metadata segments
- every stronger-date field requires appropriate evidence, an exact frozen tuple, or a permitted null/unknown
- each of the five fields is independently required by schema-derived completeness tests
- removing any one field is detected
- every required production path uses the central contract
- source recency receives centrally validated sources and keeps date types separate
- active and replayable MOHAP metadata remains correct
- no active source record changed
- workflows 0776 onward remain untouched
- canonical and signed state remained unchanged
- no temporary files remain

No push, deployment, merge, rebase, signing, approval, or queue continuation was performed.

# Stronger-Date Provenance Migration

Date: 2026-07-16  
Branch: `source-first-guideline-expansion-1500-v2`  
Starting HEAD: `ed71365070027ea64fcaab9c04dfa7e9bca0e1c5`  
Migration version: `1.0.0`

## Scope and outcome

This was a source-metadata provenance migration only. It did not resume the research queue, add or replace a clinical source, create a supported mapping, approve a candidate, change workflow clinical content, alter `public/data`, or alter the active exclusion configuration.

The failed independent review identified 554 populated stronger-date claims across 235 registered sources. Eleven claims had a direct field-specific metadata basis under the previous implementation, while 543 claims passed only through the frozen pre-contract tuple. All 230 `effective_date` claims and all 89 `revision_date` claims depended on tuple fallback. The tuple set contained no authoritative per-field provenance, migration policy, or retirement policy.

Frozen tuple acceptance has now been removed from active validation, replay, registry loading, source recency, canonical source loading, and future source ingestion. `ESTABLISHED_SOURCE_DATE_TUPLES.json` remains historical migration input only and cannot authorize an active claim.

## Deterministic inventory

The complete inventory is `clinical-expansion-v2/progress/stronger_date_claim_inventory.json`. Each of its 554 records identifies the source, source title/type/URL, field and value, former validation basis, historical tuple entry, stored label/location, registered source reference, replay locations, same-date fields, and pre-migration explicit-provenance state.

| Field | Original | Retained | Cleared |
| --- | ---: | ---: | ---: |
| `publication_date` | 235 | 24 | 211 |
| `effective_date` | 230 | 1 | 229 |
| `revision_date` | 89 | 3 | 86 |
| `service_commencement_date` | 0 | 0 | 0 |
| `legal_effective_date` | 0 | 0 | 0 |
| **Total** | **554** | **28** | **526** |

The 28 retained claims comprise 25 explicitly supported claims and three approved `unknown_on_official_source` publication values. Every retained value has exact source-, field-, and value-bound provenance. No retained claim relies on the historical tuple.

## Authoritative provenance model

The authoritative registry is `clinical-expansion-v2/schema/STRONGER_DATE_PROVENANCE.json`, governed by `clinical-expansion-v2/schema/SOURCE_DATE_PROVENANCE.schema.json` and the executable contract in `scripts/source-first/sourceDateProvenanceContract.mjs`.

Each retained claim records `sourceId`, `fieldName`, `dateValue`, provenance status, evidence category, displayed/structured label, exact evidence location, registered source reference, section reference where present, reviewed date, verification method, and migration version. Identity matching additionally binds the issuing organisation, exact document title, and exact official URL.

Permitted categories distinguish explicit publication, effective, revision, service-commencement, and legal-effective labels; official document/header/service metadata; webpage-update-only metadata; access/review-only metadata; unsupported legacy claims; and approved unknown values. Generic provenance, frozen tuples, legacy exceptions, cross-field inference, equality inference, recency inference, and access-date inference are prohibited.

## Claim classifications

| Classification | Claims | Migration action |
| --- | ---: | --- |
| A — explicitly supported | 25 | Retained with exact per-field provenance |
| B — webpage update only | 20 | Stronger field cleared; weaker webpage metadata retained where available |
| C — access or review date only | 54 | Stronger field cleared; access/review metadata remains distinct |
| D — derived or duplicated claim | 178 | Unsupported copied field cleared |
| E — unknown on official source | 3 | Approved unknown representation retained with provenance |
| F — requires source-metadata recheck | 274 | Stronger field cleared pending review of the already registered source |
| **Total** | **554** | **28 retained / 526 cleared** |

The migration used only already stored source records and metadata. It did not browse for replacement guidance or introduce new clinical evidence. Claims in classification F remain non-authoritative and require a future metadata-only recheck of the already registered official source.

## Field results

### Publication dates

Of 235 original publication claims, 21 were explicitly supported, three retained the approved `undated_on_official_page` representation, and 211 were cleared. The cleared set comprises 209 requiring existing-source metadata recheck and two that represented webpage-update metadata rather than publication.

### Effective dates

All 230 effective claims were reviewed. One explicitly labelled effective date was retained and 229 unsupported claims were cleared: 178 duplicated/derived claims, 49 requiring existing-source metadata recheck, and two webpage-update-only claims.

Of the 179 effective values equal to publication values, one had independent effective-date evidence and was retained. The other 178 were cleared as unsupported derivations. None was converted to a different stronger-date field, and none remains unresolved as an active value.

### Revision dates

All 89 revision claims were reviewed. Three explicitly supported revision dates were retained. Eighty-six were cleared: 16 webpage-update-only claims, 54 access/review-only claims, and 16 requiring existing-source metadata recheck.

### Service commencement and legal effective dates

The starting registry contained no populated `service_commencement_date` or `legal_effective_date` claims. Both fields are governed by the new contract and reject any future non-null value without exact field-appropriate provenance.

## Weaker metadata and MOHAP

The registry contains 75 explicit weaker-metadata provenance records: 74 migrated webpage/access/review classifications plus the existing MOHAP webpage update. Weaker metadata remains unavailable as authority for a stronger-date field.

`mohap-medical-leave-attestation-2026` remains:

- `publication_date`: `undated_on_official_page`
- `effective_date`: `null`
- `revision_date`: `null`
- `webpage_last_updated_date`: `2026-07-10`
- `verified_on` / `checked_on`: `2026-07-15`

The 2026-07-10 value is explicitly classified as `webpage_update_only` and has no stronger-date provenance.

## Active/replay migration and ledger

Active source registries were migrated in place. Replay ingestion now passes through `normalizeAndValidateReplaySource`, which reconciles legacy batch records to the authoritative registry before applying the same source-date semantic gate. It cannot restore any cleared value. Active canonical-context loading passes through `validateActiveRegistrySource`.

The non-authoritative historical ledger is `clinical-expansion-v2/progress/stronger_date_provenance_migration.json`. It records every original value, final value, original basis, final status/category/reference, migration action/reason, active file, replay locations, process, and version. Production validation and clinical mapping do not consume the ledger.

One source, `who-audit-primary-care-2001`, is registry-only because no replay definition is registered; its active record is covered by the same provenance gate.

## Source-recency impact

The source-recency audit remains PASS for 235/235 registered sources without relabelling weaker metadata:

| Valid recency basis | Sources |
| --- | ---: |
| Explicit stronger-date provenance | 28 |
| Explicit weaker-metadata provenance | 69 |
| Source access and verification only | 138 |

The policy was not weakened and the historical tuple is not a recency input.

## Programme impact

- Registered source records: 235, unchanged.
- Workflow statuses: unchanged at 652 `partial_exact_source_verified`, 123 `no_authoritative_source_found`, and 725 `research_interrupted`.
- Terminal workflows: 775, unchanged. Workflows 0776 onward remain untouched.
- Next workflow: `gyn-menopause-symptom-review`, unchanged.
- Source-selection decisions, exact sections, document records, research claims, and workflow evidence: unchanged.
- UAE applicability: unchanged at 676 workflows / 701 findings; the pre-existing audit remains blocked.
- Source evidence hashes: unchanged and verified (1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes).
- Execution manifest, restart state, and hash manifest: unchanged.
- Supported mappings: 0, unchanged.
- Candidate proposals: 0, unchanged.
- Unsupported legacy items: 83,303, unchanged.
- Active exclusions: 12, unchanged.
- `public/data`: unchanged; reproducibility validation reports `public_data_changed: false`.
- Canonical mapping directory, approval manifest, detached signature, and signing paths: unchanged and not accessed for signing.
- Stable `main` and protected forensic branch: unchanged.

## Validation commands

The migration adds these explicit commands:

```text
npm run test:source-date-semantics
npm run validate:stronger-date-provenance
npm run verify:legacy-date-migration
npm run verify:replay-date-provenance
npm run audit:source-recency-provenance
```

All five pass. The adversarial suite contains 21 tests covering exact contract parity, tuple retirement, inventory reconciliation, active/replay gates, cross-field/source/value misuse, weaker metadata separation, duplicate semantics, deterministic replay, source recency, and MOHAP.

The full requested 28-command validation run produced 25 PASS results and exactly the three permitted pre-existing blockers:

- PASS: signed/canonical reconciliation, mapping reconciliation, candidate separation, canonical write authority, no-code-generated mappings, data import, source evidence, item provenance, generic-template audit, source recency, research claims, safety, all workflows, output safety, exclusions, evidence hashes, reproducibility, research queue, lint, build, and all five new migration commands.
- Expected blocker: `audit:exact-source-coverage` — 1,500 workflows lack complete exact-source coverage.
- Expected blocker: `audit:uae-applicability` — 676 workflows / 701 findings.
- Expected blocker: `audit:unsupported-legacy-content` — 83,303 items.

No new source-recency failure or other blocker was introduced. Lint exited successfully with pre-existing warnings in the installed Impeccable tooling.

## Internal second review

An independent post-migration review confirmed:

- the active semantic module has no import, lookup, or fallback to `ESTABLISHED_SOURCE_DATE_TUPLES.json`;
- historical tuples are read only by the migration generator, validator, and adversarial tests;
- all 554 original claims are present exactly once in the inventory, provenance registry, and migration ledger;
- all 230 effective dates, 89 revision dates, and 179 publication/effective duplicates reconcile to the totals above;
- every retained claim has source-, field-, and value-specific authoritative provenance;
- a novel source or copied historical tuple fails closed;
- replay strips unsupported legacy dates and cannot recreate a cleared claim;
- active and replay representations reconcile deterministically;
- source recency uses only valid stronger provenance, weaker metadata provenance, or explicit access/verification status;
- MOHAP retains only webpage metadata for 2026-07-10;
- no workflow research, evidence mapping, candidate approval, signing, queue continuation, merge, rebase, push, or deployment occurred;
- workflow files, workflows 0776 onward, canonical/signed state, `public/data`, active exclusions, execution manifest, restart state, and evidence hashes remain unchanged;
- no repository temporary files remain.

## Final result

The 554-claim legacy stronger-date population has been migrated to an explicit, conservative, per-field provenance architecture. Twenty-eight active claims remain provenance-backed (25 explicit dates plus three approved unknown values); 526 unsupported stronger-date claims are cleared and preserved only in the non-authoritative migration ledger. Frozen tuple acceptance is retired. The result requires independent review before any further research-queue execution.

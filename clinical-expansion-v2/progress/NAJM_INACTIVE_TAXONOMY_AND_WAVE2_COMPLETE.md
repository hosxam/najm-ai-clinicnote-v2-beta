# NAJM inactive taxonomy and Wave-2 source-research report

> Status: implementation, beta deployment, and live verification complete.

## Scope and branch

Wave 2 was prepared on branch `beta-inactive-taxonomy-and-wave2-v1`, forked from
`beta-inactive-source-acceptance-and-wave1-v1` at `bcaffa232c898dd48e2620864e64d8bf3e94483a`.
The Wave-1 artifacts were read before any Wave-2 work. The Wave-1 activation
identity was confirmed as `gp-sore-throat`; the Wave-1 live deployment remains
identified by source SHA `a5a02d8a8292f02d704cabb2fc91bb5d2f70f823`.

## Taxonomy resolution

All 1,083 inactive records were evaluated from the committed taxonomy inventory:

- 451 component/archetype fragments were assigned
  `remains_inactive_pending_parent_evidence`.
- 77 narrow micro-workflows were assigned
  `remains_inactive_pending_parent_evidence`.
- 555 unsupported-but-clinically-valid records were evaluated individually;
  records without a proven equivalent parent were assigned
  `retained_as_distinct_workflow`.
- `derm-pediatric-eczema-follow-up` has an explicit
  `retired_duplicate_with_redirect` record to the active
  `peds-pediatric-eczema-follow-up` identity. No clinical content was copied.
- No parent enrichment was applied and no workflow was silently merged.

The final taxonomy artifact records 451 component records and 77
micro-workflows. Dispositions are 528 `remains_inactive_pending_parent_evidence`,
554 `retained_as_distinct_workflow`, and 1
`retired_duplicate_with_redirect`. One redirect was added for
`derm-pediatric-eczema-follow-up` to `peds-pediatric-eczema-follow-up`.

The complete record-level decisions are in `progress/inactive-taxonomy-wave2/`.
The inactive catalogue itself remains unchanged until a separately reviewed
integration step applies the explicit redirect; this preserves the deployed
Wave-1 catalogue while the taxonomy decisions remain auditable.

## Wave-2 targets and evidence

Fifty unsupported-but-clinically-valid workflows were selected with a
deterministic priority and specialty-diversity rule. Existing source families
were searched first and every candidate reached a terminal evaluation. No
unresolved access candidate was treated as evidence.

Two genuinely new official source registrations were added and replay-owned in
the existing `batch-1496-1500.mjs` module:

1. NICE CG57, *Atopic eczema in under 12s: diagnosis and management* (the NICE
   page was reviewed, but automated retrieval is fail-closed as blocked HTTP
   403 and is recorded as such).
2. NHS, *Atopic eczema* overview (retrieved and structurally ingested from the
   official NHS page).

The source corpus now contains 238 registered sources. Two new source records
were added in this wave: the accepted and ingested NHS atopic-eczema overview,
and the NICE CG57 candidate, which was terminally rejected as access-blocked
(HTTP 403) and was not used. Corpus counts are 149 complete, 65 structurally
limited, 20 blocked, 3 invalid-target, 1 superseded, and 0 exact duplicates.
The corpus fingerprint is recorded in `WAVE2_SOURCE_INGESTION.json`.

## Replay and recency

Independent source replay covers the initial module plus 150 numbered modules,
238 source records, and 254 source updates. Replay parity differences: 0.
The regenerated metadata fingerprint is
`94f9f350cefa1c964953c2b782df219f0ad5500208a62dd01c9b7e1b5b7c84a5`; the
replay-manifest fingerprint is
`ae86b5a4c45b79184061d84776e80d7bb9528559188cc34e02d01673410ba8ba`.
Source-recency validation passes against the fixed policy date. The two new
sources are access-verification-only records; no stronger date was fabricated.

## Activation

One Wave-2 target, `derm-eczema`, reached a complete composed evidence pack and
validated interactive schema. It was activated with 12 clinician-facing fields,
14 internal evidence records, and SOAP/EMR/follow-up-summary outputs. The
remaining 49 targets remain inactive pending complete evidence and schema
validation. No legacy fallback schema was used.

Catalogue counts changed from 417 active / 1,083 inactive to 418 active /
1,082 inactive. Final beta catalogue totals are 1,500 original workflows,
6,313 clinician-facing items, and 75,526 internal evidence records. The
interactive compiler contains 418 workflows and 4,198 rendered fields.

## Validation

## Validation

- `npm run validate:sources-ingestion`: PASS.
- `npm run test:source-batch-replay-parity`: PASS (2 tests; 0 differences).
- `npm run verify:source-metadata-reproducibility`: PASS.
- `npm run audit:source-recency`: PASS.
- `npm run test:inactive-taxonomy-wave2`: PASS; 451 component decisions, 77
  micro-workflow decisions, 50 targets, 1 activation, 12 fields, and 14
  evidence records.
- `npm run validate:final-beta-manifest`: PASS (1,500 / 418 / 1,082 / 6,313 /
  75,526).
- `npm run validate:interactive-workflows`: PASS (418 / 4,198 / 75,526).
- `npm run validate:evidence-packs`: PASS (1,198 packs; 243 completed).
- `npm run test:interactive-soap-all`: PASS (418 workflows).
- `npm run test:advanced-soap`: PASS (836 mode cases).
- `npm run test:interactive-clinical-repair`: PASS (418 workflows, 4,198
  fields, 15 fixtures, zero fallback).
- `npm run test:interactive-random-sample`: PASS (three 50-workflow seeds).
- `npm run validate:interactive-accessibility`: PASS.
- `npm run validate:interactive-performance`: PASS.
- `npm run validate:data`, `npm run test:safety`, `npm run lint`, and `npm run
  build`: PASS.

Source replay and metadata reproducibility also passed: 238 sources, 151
modules, 254 updates, zero parity differences; metadata fingerprint
`94f9f350cefa1c964953c2b782df219f0ad5500208a62dd01c9b7e1b5b7c84a5`; replay
manifest fingerprint
`ae86b5a4c45b79184061d84776e80d7bb9528559188cc34e02d01673410ba8ba`.

## Deployment result

The branch was pushed without force and only the beta workflow was dispatched.
Run `30241059111`
([workflow URL](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30241059111))
checked out source SHA `a758d31b7623af24614d83647745bee3416a29e8`. Its build job
`89898180157` and deploy job `89898369266` both passed. The live beta is
`https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta` and displays build
`a758d31`.

Automated browser verification passed: the canonical
`/data-beta/final-catalogue/manifest.json` was requested and no
`curated-workflows` resource was requested; the page displayed 418 active
interactive workflows, 4,198 interactive fields, and 75,526 retained evidence
records; alias search, specialty and archetype filters worked; active routes
opened; `urgent-abdominal-pain` failed closed as inactive; the eczema evidence
panel showed DHA and NHS source links; desktop (1440 px), tablet (1024 px),
and mobile (390 px) layouts had no horizontal overflow; and zero console
errors or failed requests were observed. Workflow-scoped localStorage drafts
were isolated and temporary test data was cleared.

The exact machine-readable record is
`progress/inactive-taxonomy-wave2/LIVE_VERIFICATION.json`.

Stable production was not deployed. Mappings and candidates remain zero,
exclusions remain 12, public/data and canonical/signed state are unchanged,
and no merge, rebase, force-push, signing, approval, or queue continuation was
performed. The deployed source is `a758d31b7623af24614d83647745bee3416a29e8`.

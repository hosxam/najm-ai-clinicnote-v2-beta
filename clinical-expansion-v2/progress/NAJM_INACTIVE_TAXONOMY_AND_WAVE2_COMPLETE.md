# NAJM inactive taxonomy and Wave-2 source-research report

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

The complete record-level decisions are in `progress/inactive-taxonomy-wave2/`.
The inactive catalogue itself remains unchanged until a separately reviewed
integration step applies the explicit redirect; this preserves the deployed
Wave-1 catalogue while the taxonomy decisions remain auditable.

## Wave-2 targets and evidence

Fifty unsupported-but-clinically-valid workflows were selected by deterministic
specialty round-robin. Existing source families were searched first, candidate
decisions were terminal, and no unresolved access candidate was treated as
evidence. All 50 remain inactive because no complete archetype-compatible
interactive schema was proven. No field, diagnosis, treatment, dose,
referral, or output was invented to force activation.

Two genuinely new official source registrations were added and replay-owned in
the existing `batch-1496-1500.mjs` module:

1. NICE CG57, *Atopic eczema in under 12s: diagnosis and management* (the NICE
   page was reviewed, but automated retrieval is fail-closed as blocked HTTP
   403 and is recorded as such).
2. NHS, *Atopic eczema* overview (retrieved and structurally ingested from the
   official NHS page).

The source corpus now contains 238 registered sources, with 238 completed
ingestion records and no pending source. Corpus counts are 149 complete, 65
structurally limited, 20 blocked, 3 invalid-target, 1 superseded, and 0 exact
duplicates. The corpus fingerprint is recorded in `WAVE2_SOURCE_INGESTION.json`.

## Replay and recency

Independent source replay covers the initial module plus 150 numbered modules,
238 source records, and 254 source updates. Replay parity differences: 0.
The regenerated metadata fingerprint is
`94f9f350cefa1c964953c2b782df219f0ad5500208a62dd01c9b7e1b5b7c84a5`; the
replay-manifest fingerprint is
`ae86b5a4c45b79184061d84776e80d7bb9528559188cc34e02d01673410ba8ba`.
Source-recency validation passes against the fixed policy date. The two new
sources are access-verification-only records; no stronger date was fabricated.

## Activation and protected state

Wave-2 activation count is 0 because none of the 50 targets has a complete,
archetype-compatible evidence pack and interactive schema. This is a deliberate
fail-closed result, not a claim of clinical completion. No legacy fallback
schema was used. Active workflow data, public data, mappings, candidates,
canonical state, signed state, exclusions, and Wave-1 activation data were not
modified.

## Validation

- `npm run validate:sources-ingestion`: PASS.
- `npm run test:source-batch-replay-parity`: PASS (2 tests; 0 differences).
- `npm run verify:source-metadata-reproducibility`: PASS.
- `npm run audit:source-recency`: PASS.
- `npm run run:inactive-taxonomy-wave2`: PASS; 451 component decisions, 77
  micro-workflow decisions, 50 targets, 2 new source registrations, 0
  activations.

The remaining full clinical and browser validation matrix must be run before any
beta deployment of Wave 2. Stable production was not deployed, and no push,
merge, signing, approval, or queue continuation was performed by this wave.

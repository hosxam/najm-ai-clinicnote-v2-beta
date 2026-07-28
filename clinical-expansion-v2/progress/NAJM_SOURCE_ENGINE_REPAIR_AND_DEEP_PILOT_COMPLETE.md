# NAJM source-engine repair and deep-pilot completion

Status: PASS  
Starting branch: `beta-targetable-backlog-and-wave10-v1`  
Starting HEAD: `4d252017940aaf70ec4edfe252edcaefdd6b02bf`  
Implementation branch: `beta-source-engine-repair-and-deep-pilot-v1`  
Implementation/deployed HEAD: `a10a9182a96366553cfeb36371385bf6570dcd7f`  
Deployment: [GitHub Actions run 30377213533](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30377213533)  
Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta

## Wave 10 audit and failure analysis

All 160 Wave 10 evidence packs were audited. The corrected classification is:

- truly complete: 0
- partial with named sections missing: 160
- empty administrative: 0
- invalid: 0
- technical failure: 0

The common root cause was `no search was executed` (160/160). The prior
completeness signal therefore did not demonstrate source acquisition or
workflow-specific evidence coverage.

## Source-engine repair

The production acquisition engine now supports official-host redirect handling,
HTML landing-page traversal to linked PDFs, HTML section and table extraction,
PDF extraction through the existing repository tooling, source metadata and
supersession capture, deterministic fingerprints, registry deduplication, and
partial evidence-pack composition. Acquisition accepts the supported snake- and
camel-case source request forms and preserves terminal access failures.

The real-fixture test suite passed 4/4 test cases and all 10 capability checks,
including a local official HTML fixture, a landing page, and a tracked official
PDF fixture. No source-engine test failed.

## Deep pilot

Exactly 10 workflows were selected and processed:

1. `peds-cough`
2. `peds-pediatric-asthma-review`
3. `peds-pediatric-fever-follow-up`
4. `gp-hypertension-followup`
5. `cardio-syncope-follow-up`
6. `gp-dysuria`
7. `ed-imaging-result-documentation`
8. `derm-psoriasis-flare-documentation`
9. `resp-pediatric-to-adult-asthma-transition-documentation`
10. `urgent-wound-care-laceration`

Nine authoritative source searches were executed. Five matched existing exact
registry records, three were authoritative duplicates of existing records, and
one (NICE NG143) was blocked by HTTP 403. Three real authoritative documents
were nevertheless downloaded and extracted for duplicate reconciliation. No new
canonical source ID was added; the canonical registry remained 242 records.

Seven workflows have complete schema-ready packs and are active in the beta
catalogue. Two were reactivated (`peds-cough` and
`peds-pediatric-asthma-review`). Three remain inactive and fail closed:

- `peds-pediatric-fever-follow-up`: source access blocked
- `gp-dysuria`: source/workflow setting mismatch
- `resp-pediatric-to-adult-asthma-transition-documentation`: source/workflow
  scope mismatch

The seven active schemas add 63 fields, one selectable control, one
contradiction group, and zero conditional rules. The generated outputs cover
SOAP, EMR, and clinician-review drafts for each active pilot workflow. Flat
field provenance is present for every added field and no evidence or local
filesystem path is exposed in output.

## Validation

The full regression set passed: `validate:data`,
`validate:final-beta-manifest`, `validate:interactive-workflows`,
`validate:advanced-workflow-modes`, `validate:release-readiness`,
`verify:clinical-data-reproducibility`, `audit:source-recency`,
`test:all-workflows`, `test:interactive-soap-all`,
`test:manual-defect-closure-assertions`, `test:resolution-selectable-controls`,
`test:resolution-contradictions`, `test:resolution-structured-soap`,
`validate:merge-aliases`, `validate:retirement`, `validate:blocked-source`,
`validate:medication-safety`, `test:source-engine`, `test:deep-pilot`,
`test:wave9-schemas`, `lint`, and `build` (22/22 PASS).

Release-readiness passed with 1,500 denominator workflows, 877 baseline active
workflows, 10,980 fields, 1,426 UAE findings, and release counts of 460
`release_ready_beta` and 417 `beta_only_with_scope_qualifier`. The final beta
manifest contains 1,500 original workflows, 884 active, 616 inactive, 12,358
clinician-facing items, and 116,856 internal evidence records. The interactive
manifest contains 884 workflows, 11,043 fields, and 69,777 retained evidence
records.

The lint inventory baseline was 223 warnings and no new warning was introduced
by this pilot. The current raw repository lint count is 225 because of two
pre-existing warnings outside the pilot files. Build and all safety,
provenance, reproducibility, retirement, alias, and blocked-source checks
passed.

## Live beta verification

The successful beta deployment is run `30377213533`, sourced from
`a10a9182a96366553cfeb36371385bf6570dcd7f`, and displays build `a10a918`.
The automated browser verification passed at `2026-07-28T20:18:58+04:00`:

- final and interactive manifests returned HTTP 200;
- Quick, Advanced, and evidence panels rendered on all seven active routes;
- all three inactive routes failed closed;
- desktop (1440), tablet (1024), and mobile (390) layouts had no horizontal
  overflow;
- console errors: 0; failed asset/data requests: 0;
- no obsolete curated-workflow requests occurred;
- no local filesystem paths were exposed; temporary local storage was cleared.

The complete machine-readable result is in
`clinical-expansion-v2/progress/source-engine-pilot/LIVE_VERIFICATION.json`.

## Protected-state and limitations

`public/data` was not changed by the pilot. Mappings and candidates remain
0/0, exclusions remain 12, and canonical and signed state were not modified.
Stable production was not deployed or touched; only
`beta-source-engine-repair-and-deep-pilot-v1` was pushed and deployed. No
merge, rebase, force-push, signing, or approval occurred.

The pilot did not invent evidence for the blocked or scope-mismatched workflows,
and it did not add a new canonical source record. A stale CDN response required
cache-busting during the browser check; the cache-busted deployment and all
post-deployment checks passed.

## Commits

- `812ba7e5` — `audit(wave10): correct false evidence-pack completeness`
- `47ed5c20` — `fix(sources): repair authoritative source acquisition engine`
- `a61bd677` — `test(sources): validate real HTML and PDF ingestion`
- `5caf5336` — `research(pilot): acquire sources for deep pilot workflows`
- `d1785b05` — `data(pilot): build complete evidence packs`
- `aac7b270` — `feat(pilot): activate complete workflow schemas and outputs`
- `a10a9182` — `test(pilot): prove outputs and full regression`
- documentation-only completion commit follows this report.


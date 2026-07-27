# NAJM Quality Reconciliation and Activation Wave 8

Status: complete for the beta release surface.

## Release and deployment

- Required starting branch: `beta-clinical-coverage-and-wave7-v1`
- Required starting HEAD: `ebe7eb7c5f62d5a9a3512a5f759b53df8d493eb0`
- Working branch: `beta-quality-reconciliation-and-wave8-v1`
- Implementation/deployed source HEAD: `f3acc5aa197286d8ae50b07b39c8183f0033e14d`
- Deployment workflow: [30289948366](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30289948366)
- Beta URL: <https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta>
- Displayed beta build: `f3acc5a`
- Final report commit: recorded after this documentation change

Deployment was beta-only. Stable production, `main`, mappings, candidates,
canonical state, signed state, exclusions, and `public/data` were not changed.

## Wave 7 reconciliation

The committed Wave 7 reconciliation was retained and independently checked:
90 previously activated workflows audited, 30 adversarial cases and 10 gap
outcomes recorded, with no clone-group or overgeneralization finding. The
120-record distinctness audit classified every record
`clinically_distinct_and_valid`; the 40/40 adversarial fixture run passed.
Wave 7's 390 fields, 120 selectable controls, 120 contradiction groups, and
18 archetype outputs remained in the regression surface.

The 83,303 unsupported legacy statements remain isolated accounting data. They
are not workflow or evidence records, are not loaded by beta, and do not create
mappings or candidates.

## Source recency and source reconciliation

All 23 due source-recency reviews were processed in
`SOURCE_RECENCY_RECHECKS_WAVE8.json`; pending count is zero, superseded count
is zero, and 11 access-blocked outcomes are retained truthfully. The active
registry's policy calculation still contains 23 `recheck_due` records; this is
reported rather than silently rewritten. Source metadata reproducibility and
fingerprint checks pass.

Wave 8 ran 20 official-search strategies over 160 targets and opened 160
official pages. No new source was accepted. The ingestion terminal outcomes
were 89 accepted-existing-source records, 56 authoritative-insufficient-section
records, and 15 access-blocked records; 75 unique existing source IDs were
reused and the source registry remains at 242 sources. No document download or
extraction was claimed where the committed source archive already supplied the
usable provenance.

## Coverage, evidence packs, and activation

- Families: 20
- Workflow targets: 160
- Family evidence packs: 20
- Workflow evidence packs: 160
- Activated Wave 8 workflows: 88
- Wave 8 inactive workflows: 72 (56 insufficient section, 15 blocked access,
  and one empty reconstruction)
- Active/inactive before Wave 8: 741 / 759
- Active/inactive after Wave 8: 829 / 671
- Clinician-facing items: 12,416
- Internal evidence records: 132,121
- Interactive workflows / fields: 829 / 10,277
- Wave 8 fields: 968
- Wave 8 selectable options: 176
- Wave 8 contradiction groups: 88
- Wave 8 archetype-specific output families: 20

Every activation uses the committed full-source reconstruction records and
exact source locators. Inactive targets fail closed with a named evidence gap;
no activation was forced to meet a numeric target.

## Reproducibility and fingerprints

- Source count: 242
- Replay modules: 151
- Stored/active/replay source metadata fingerprint:
  `e9efd82ddfbeef8bc057271bb8fb8e42ba5745a918e19efc84f023daf676bf1f`
- Replay manifest fingerprint:
  `6efb37d2aa8271aac771781b8c6f185181c07682df0c1f0075b98a22ac2f77f9`
- Source metadata reproducibility: PASS
- Clinical-data reproducibility: PASS
- Persisted provenance and replay parity: PASS with zero differences

## Validation

The Wave 8 schema, family, provenance, catalogue, manifest, source-recency,
metadata fingerprint, and reproducibility checks passed. The full regression
matrix also passed for workflow coverage (1,500/1,500), safety (16 tests;
12 exclusions), data, source evidence, item provenance, evidence hashes,
research queue (16 tests), interactive SOAP (829), advanced SOAP (1,658 mode
cases), resolution selectable controls (127), contradiction fixtures (111),
archetypes, dependency graph, compaction, pack dependencies, section
applicability, aliases, retirement, blocked-source, medication safety, lint,
and build.

The manual-defect-closure command exited successfully but continues to report
its pre-existing unresolved inventory (122 unresolved statuses, 254 partially
fixed, 376 unresolved); no prior 433-case defect set was reopened or changed.
Lint reports 210 pre-existing warnings and zero new Wave 8 warnings.

## Live beta verification

`LIVE_VERIFICATION_WAVE8.json` records the automated browser result. The
catalogue loaded the canonical
`public/data-beta/final-catalogue/manifest.json` and reported 1,500 original,
829 active, 671 inactive, 12,416 clinician-facing, and 132,121 internal
evidence records. The obsolete `public/data-beta/curated-workflows` path was
not loaded by the application; an explicit probe returned 404.

Search, specialty and archetype filtering, Quick and Advanced routes, evidence
panel/source links, inactive isolation, desktop/tablet/mobile layouts, and
horizontal-overflow checks passed. Representative routes were
`gp-diabetes-followup`, `resp-chronic-cough-review`,
`ed-blood-test-result-documentation`, `peds-hearing-concern-in-child`, and
`anes-pre-operative-anesthesia-assessment`. The final smoke test recorded zero
console errors, zero failed asset requests, and no local filesystem path
exposure.

The deployment required two narrow corrections: interactive evidence records
now carry the renderer's `locator` shape alongside exact provenance, and the
loader appends the deployed build SHA to schema requests to prevent stale CDN
JSON. Both corrections were validated locally and in the successful beta run.

## Protected boundaries and limitations

- `public/data`: unchanged
- Mappings/candidates: `0 / 0`
- Exclusions: `12`
- Canonical and signed state: unchanged
- Stable production: untouched
- Queue/research continuation: not resumed
- Remaining named Wave 8 gaps: 72, fail-closed
- Source registry: unchanged at 242 records

No merge, rebase, force-push, signing, approval, stable deployment, or queue
continuation was performed.

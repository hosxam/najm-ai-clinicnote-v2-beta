# Najm Catalogue Endgame and Wave 9 Completion

## Scope and boundary

- Starting branch/HEAD: `beta-quality-reconciliation-and-wave8-v1` / `4aef772fb08cb0a81a2bf1bcb874f562de4d393f`
- Delivery branch: `beta-catalogue-endgame-and-wave9-v1`
- Ending implementation HEAD: `ef4acedb`; subsequent documentation/correction commits: `0c9c9061`, `9e710c8e`, `753dd9f9`, `37a2ce63`.
- Beta only: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta`
- Stable production, `main`, canonical approval/signature state, mappings, candidates, exclusions, and `public/data` were not modified.

## Denominator and Wave 8 reconciliation

The Wave 8 reporting omission was reconstructed from committed artifacts without inventing per-source history. The reconciliation records the 20 families, 160 targets, 88 activations, 72 inactive outcomes, 968 fields, 176 selectable options, 88 contradiction groups, 23 recency records, 11 access-blocked sources, 242 registered sources, and 83,303 isolated unsupported legacy records. The 50 adversarial Wave 8 fixtures all pass.

The final 1,500-record denominator is:

| Classification | Count |
| --- | ---: |
| Active distinct clinical workflows | 902 |
| Inactive distinct targetable workflows | 517 |
| Inactive distinct missing authoritative evidence | 53 |
| Blocked by source access | 15 |
| Incorporated component | 13 |
| Retired duplicate | 1 |
| **Original records** | **1,500** |

The Wave 9 selection contains 20 families and 160 distinct target workflows. No alias, incorporated component, or retired duplicate was selected as an independent activation target. The denominator validator confirms one allowed classification per original record (1,500/1,500; true distinct denominator 1,487; 570 remaining targetable distinct records including 517 reconciled targetable records and 53 evidence-missing records).

## Evidence and activation

- Existing authoritative source records reused: 94 distinct source IDs; newly accepted sources: 0.
- Family searches: 20; target searches: 160; documents newly downloaded/extracted: 0.
- Evidence packs: 20 family packs and 160 workflow packs.
- Workflows activated: 73, each with complete named section coverage and documented scope limitations.
- Target workflows left inactive/fail-closed: 87.
- Wave 9 interactive fields added: 803; retained interactive catalogue totals: 902 workflows, 11,080 fields, 85,345 evidence records.
- Final beta catalogue totals: 1,500 original workflows, 902 active, 598 inactive, 12,719 clinician-facing items, 132,424 internal evidence records.
- Schema differentiation matrix reports zero cloned-generic-schema activations; workflow-specific sections are provenance-bound.
- All fields map only to clinician-entered documentation and SOAP destinations; no diagnosis or treatment is inferred.

## Recency, replay, and fingerprints

- Source registry: 242 records.
- Recency basis totals: explicit stronger date 25; approved unknown 3; weaker metadata 69; access-verification only 145.
- Outcomes: 24 explicit-stronger current; 3 approved-unknown current; 65 weaker-metadata current; 126 access-verification current; 23 recheck due; 1 incomplete metadata; 0 unavailable/superseded/expired.
- Date precision: 233 day, 4 month, 2 year, 3 unknown.
- Independent replay: 151 modules (initial plus 150 numbered modules), source replay count 242, zero parity differences.
- Metadata fingerprint: `e9efd82ddfbeef8bc057271bb8fb8e42ba5745a918e19efc84f023daf676bf1f`.
- Replay-manifest fingerprint: `6efb37d2aa8271aac771781b8c6f185181c07682df0c1f0075b98a22ac2f77f9`.
- Unsupported legacy accounting remains non-authoritative and isolated from active beta payloads, replay, recency, and fingerprints.

## Automated validation

Focused Wave 9 artifact, schema, interactive-workflow, final-manifest, final-route, recency, date-precision, replay-parity, recheck-isolation, metadata-fingerprint, and reproducibility checks passed. The complete regression matrix passed: data validation, source evidence, item provenance, no-generic-templates, clinical-item diff, research claims, all-workflows, output safety, exclusions, evidence hashes, reproducibility, research queue, interactive validation, final beta manifest, final route wiring, lint (exit 0 with 210 pre-existing warnings), and production build. The three explicitly authorized audits remain the only blockers: exact-source coverage (1,500 clinical blockers; 0 exact, 1,099 partial, 401 no-authoritative), UAE applicability (1,426 structured findings across 1,401 affected workflows; 1,099 partial and 327 missing explicit UAE evidence), and unsupported legacy content (83,303 historical items). No other validation blocker is present.

The exact machine-readable results are in `clinical-expansion-v2/progress/catalogue-wave9/TEST_RESULTS_WAVE9.json`, `LINT_WARNING_INVENTORY_WAVE9.json`, `WORKFLOW_COMPLETENESS_MATRIX_WAVE9.json`, `SCHEMA_DIFFERENTIATION_MATRIX_WAVE9.json`, and `FIELD_PROVENANCE_WAVE9.json`.

## Beta deployment and live verification

- Deployment workflow: `Deploy beta to GitHub Pages`.
- Successful run: `30297143395`.
- Deployed source: `97e387a108a1ba5ec37ecf373bda03e3890b4039` (displayed build `97e387a`).
- Canonical manifest loaded: `public/data-beta/final-catalogue/manifest.json`.
- Obsolete `curated-workflows` dataset was not requested.
- Automated browser checks passed for catalogue load, totals, search, specialty filtering, Wave 9 workflow opening, Quick and Advanced modes, evidence panel, inactive fail-closed isolation, and desktop/tablet/mobile layouts with no horizontal overflow.
- Direct route smoke testing recorded zero console errors and zero failed requests. A combined navigation run observed one `ERR_ABORTED` diagnosis-index request during route teardown; the same resource returns HTTP 200 and direct route verification had no failed assets.
- Fresh post-correction landing and direct workflow smoke checks rendered the deployed build, opened Quick/Advanced controls and the guideline-evidence panel, and recorded no console errors.
- Browser draft prompt and workflow-scoped localStorage behavior were exercised; no clinician approval or mapping state is exposed.

The detailed machine-readable live result is `clinical-expansion-v2/progress/catalogue-wave9/LIVE_VERIFICATION_WAVE9.json`.

## Commits

1. `8ac2aaea` — `chore(wave9): add catalogue-denominator and quality pipeline`
2. `a992a42a` — `test(wave9): audit Wave-8 activations`
3. `e40c19d3` — `data(wave9): reconcile source recency and unsupported legacy records`
4. `7250a681` — `data(wave9): classify final catalogue denominator`
5. `568af85f` — `data(wave9): update clinical coverage map`
6. `961ec249` — `research(wave9): acquire targeted authoritative evidence`
7. `b652ae3a` — `data(wave9): build family and workflow evidence packs`
8. `3e6082fa` — `feat(wave9): activate clinically distinct workflows`
9. `d15e80d5` — `feat(wave9): add outputs and catalogue metadata`
10. `f52b1380` — `test(wave9): prove activations and full regression`
11. `21dd895a` — `test(wave9): reconcile expanded source recency totals`
12. `3fb0eb54` — `test(wave9): record regression and lint results`
13. `ef4acedb` — `fix(wave9): preserve evidence locator objects`

14. `4b177ed0` — `fix(wave9): enforce compact clinician-facing wording and denominator classes`

15. `97e387a1` — `fix(wave9): reconcile advanced and interactive beta manifests`

The repository is clean after deployment documentation is committed. No stable deployment, merge, rebase, force-push, signing, approval, or queue continuation was performed.

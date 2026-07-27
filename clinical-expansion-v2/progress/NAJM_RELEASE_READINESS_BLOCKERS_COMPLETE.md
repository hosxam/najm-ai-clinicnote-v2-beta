# NAJM AI ClinicNote — Release-readiness blocker resolution

Status: COMPLETE for the beta release-readiness scope, with the explicitly fail-closed technical recency set and historical audit limitations recorded below.

## Reconciliation and scope

- Starting branch/HEAD: `beta-catalogue-endgame-and-wave9-v1` / `a7dc72f3a83da718bc723f2a5c4a10c1c2ed6d58`.
- Working branch: `beta-release-readiness-blockers-v1`.
- Final denominator: 1,500 unique original workflow records.
- Prior reported total of 1,501 was a double count of `derm-pediatric-eczema-follow-up`, which is a retired duplicate redirecting to `peds-pediatric-eczema-follow-up`. The corrected model counts it once.
- Distinct clinical workflows after removing 13 incorporated components and one retired duplicate: 1,486.
- Denominator classes: 902 active, 15 source-blocked inactive, 516 targetable inactive, 53 inactive missing authoritative evidence, 13 incorporated components, 1 retired duplicate.

## Exact-source blocker resolution

Every active workflow field is now linked to a registered source ID and at least one exact committed section. The repair added workflow/field/evidence-pack identifiers, source organisation/document/version, population and setting qualifiers, exact section locators, inherited-family linkage, and a deterministic transformation explanation.

- Active workflows checked: 902.
- Active fields checked: 11,080.
- Exact source references: 85,847.
- Missing or unknown source IDs/sections after repair: 0.
- Transformation explanations repaired: 8,457.
- Unresolved field-provenance records: 0.
- The historical workflow-level research audit still reports partial/no-authoritative statuses for inactive and legacy research records; those records are not release inputs.

Twenty-five active workflows cite `nice-acute-cough-ng120-2019`, whose committed recency metadata is future-dated relative to the fixed policy evaluation date. They remain terminal `blocked_by_technical_error` and fail closed; no date or source was fabricated. The remaining active release matrix is 460 `release_ready_beta` and 417 `beta_only_with_scope_qualifier`.

## UAE applicability

All 1,426 existing UAE findings are terminally classified in `release-readiness/UAE_APPLICABILITY_FINDINGS.json`:

- Partial applicability: `internationally_applicable_with_UAE_qualifier` with a visible scope qualifier.
- Missing explicit UAE evidence: `insufficient_information`; no local prescribing, referral, reporting, or pathway rule is inferred.
- Existing DHA/DoH/MOHAP/EHS sources were reused; newly accepted UAE sources: 0; unresolved source-search outcomes: 0.

## Unsupported legacy isolation

The 83,303 historical unsupported statements remain reproducibility-only accounting. They are excluded from beta runtime, clinician search, active workflow reachability, and evidence matching. Production `public/data`, mappings, candidates, canonical state, signed state, exclusions, and stable production were not modified.

## Validation

The following passed after the repair: research queue, source-recency, clinical-data reproducibility, data validation, safety, all-workflow tests, output safety, source evidence, item provenance, research claims, exclusions, source-evidence hashes, source-metadata reproducibility/fingerprint checks, interactive schema/separation/final-manifest/advanced-mode validators, release-readiness validator, interactive SOAP and browser regressions, accessibility, performance, workflow-item evidence, pack dependencies, section applicability, merge aliases, retirement, blocked-source, medication safety, Wave9 schema/family/browser checks, lint, and production build.

The three pre-existing audit limitations remain transparently reported: workflow-level exact-source audit includes inactive unsupported research records; UAE audit includes historical applicability findings; unsupported-legacy audit counts the 83,303 reproducibility-only statements. None is loaded into the release runtime.

## Beta deployment and live verification

- Deployed branch: `beta-release-readiness-blockers-v1`.
- Deployed source SHA: `51d3de95c2a90c534a71ecd99dca324260fdf9e5` (displayed as `51d3de9`).
- Workflow run: [30300390142](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30300390142).
- Live beta: [https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta](https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta).
- Verification timestamp: 2026-07-28 00:03:25 +04:00.
- Canonical `data-beta/final-catalogue/manifest.json` loaded with HTTP 200; no `curated-workflows` request was observed.
- Live catalogue totals: 1,500 original workflows, 902 active, 598 inactive, 12,719 clinician-facing items, 132,424 final internal evidence records; the interactive surface displays 85,345 retained interactive evidence records.
- Build SHA, catalogue, Quick mode, Advanced mode, workflow-scoped evidence panel, search, specialty filtering, inactive fail-closed route, and responsive layouts all verified by Playwright.
- Desktop (1280px), tablet (768px), and mobile (390px) had no horizontal overflow.
- Console errors/warnings: 0. Failed static assets: 0. Local filesystem paths exposed: 0.

## Logical commits

1. `e0e6b954` — `fix(catalogue): reconcile final denominator accounting`
2. `3a89f096` — `fix(provenance): repair exact active-workflow source coverage`
3. `073d8ad8` — `research(uae): acquire required official UAE sources`
4. `91a627e7` — `data(uae): classify and resolve UAE applicability`
5. `33fb44ca` — `chore(legacy): archive and isolate unsupported legacy data`
6. `d413ff46` — `data(beta): update active release-readiness states`
7. `51d3de95` — `test(beta): validate blocker resolution and full regression`
8. This documentation commit — `docs(beta): complete release-readiness report`

No push to stable production, merge, rebase, force-push, signing, approval, mapping, candidate, or queue continuation occurred. The branch worktree is clean after this documentation commit.

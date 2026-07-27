# NAJM Clinical Coverage Map and Family Activation Wave 7

## Completion

- Starting HEAD: `b6bfcdc86de6244ba9ae47ef3eeb766f8561ddc0` on `beta-family-evidence-and-wave6-v1`.
- Working branch: `beta-clinical-coverage-and-wave7-v1`.
- Implementation commits: `30e87ba0` (`feat(source-first): add clinical coverage map for wave 7`); `d279e11c` (`feat(source-first): activate differentiated wave 7 workflows`).
- Deployed implementation SHA: `d279e11c5f5f890adb5f95b97eeaf382031e83f1` (displayed `d279e11`).
- Deployment run: [30285120392](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30285120392), successful GitHub Pages beta deployment.
- Live URL: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta

## Wave 6 reconciliation and closure

- Wave 6 reconciliation: PASS; 90 activated, 10 terminal inactive, 621 active and 879 inactive before Wave 7.
- Wave 6 distinctness audit: 90 activations, zero clone groups.
- Adversarial fixtures: 30/30 passed.
- Evidence gaps: ten remain explicitly fail-closed with named missing sections; none were silently activated.
- Current inactive baseline: 879 records, 879 current inactive IDs, with distinct targetability recorded in `family-wave7/DISTINCT_INACTIVE_BASELINE_WAVE7.json`.

## Coverage map and targeting

- Families: 18 (`gp`, `msk`, `derm`, `surg`, `anes`, `prev`, `ed`, `icu`, `oph`, `ent`, `neuro`, `gi`, `gyn`, `psych`, `peds`, `pain`, `endo`, `uro`).
- Distinct targets: 130.
- Activation-ready: 120.
- Remaining inactive: 10, each with a named critical evidence gap and fail-closed terminal state.
- Existing-source reuse: 242-source registry, 31 accepted existing source records in Wave 7, 48 pages/sections extracted in the targeted search artefact, no new source registry records.
- Source registry reconciliation: 242 before and after; replay remains 242 sources, 151 modules, zero differences.

## Evidence packs and schema differentiation

- Family packs: 18 complete documentation packs.
- Workflow packs/completeness rows: 130/130.
- Field provenance rows: 390 (three workflow-specific, clinician-entered fields per target).
- Activated interactive workflows: 120; selectable controls added: 120; contradiction groups: 120; archetype output coverage: 18 families.
- Every activated schema has workflow-scoped field IDs, provenance references, SOAP destinations, and no patient facts preselected.
- Evidence remains in the internal evidence layer; clinician-facing wording contains only compact documentation scaffolds and references the evidence panel.

## Catalogue totals

| Measure | Before Wave 7 | After Wave 7 |
|---|---:|---:|
| Original workflows | 1,500 | 1,500 |
| Active workflows | 621 | 741 |
| Inactive workflows | 879 | 759 |
| Clinician-facing items | 9,656 | 12,176 |
| Internal evidence records | 97,321 | 131,881 |
| Interactive fields | 7,509 | 9,309 |

The current authoritative final catalogue is 741 active and 759 inactive. The 10 Wave 7 unresolved targets are included in the inactive inventory and cannot open as usable clinical workflows.

## Integrity and protected state

- Source recency: PASS (242 sources; 25 explicit stronger date, 3 approved unknown, 69 weaker metadata, 145 access/verification-only; 23 due; one incomplete metadata record remains explicitly reported by the existing policy checker).
- Source metadata fingerprint: `e9efd82ddfbeef8bc057271bb8fb8e42ba5745a918e19efc84f023daf676bf1f`.
- Replay manifest fingerprint: `6efb37d2aa8271aac771781b8c6f185181c07682df0c1f0075b98a22ac2f77f9`.
- Clinical-data reproducibility and source-metadata reproducibility: PASS.
- Mappings/candidates: `0 / 0`.
- Unsupported legacy items: `83,303`.
- Exclusions: `12`.
- `public/data`: unchanged.
- Canonical mapping, approval, signature, and signed state: unchanged.
- No stable production deployment, main-branch change, merge, rebase, force-push, signing, or approval occurred.

## Validation inventory

The focused Wave 7, Wave 6 regression, schema, manifest, route, evidence-separation, provenance, source-recency, replay, SOAP, safety, data, accessibility, performance, mapping-authority, queue, lint, and build checks all passed. Lint is `PASS_WITH_PRE_EXISTING_WARNINGS`; no Wave 7 files add a lint warning. The three historical audit blockers remain the only allowed audit limitations where applicable: exact-source coverage, UAE applicability, and unsupported legacy content.

The detailed machine-readable inventory is `family-wave7/TEST_RESULTS_WAVE7.json`.

## Live beta verification

Playwright verification recorded in `family-wave7/LIVE_VERIFICATION_WAVE7.json` passed:

- catalogue route, Quick Mode, Advanced Mode and all ten representative Wave 7 workflows loaded;
- displayed build SHA matched `d279e11`;
- active/inactive isolation held;
- desktop, tablet and mobile layouts loaded without horizontal overflow;
- no uncaught console errors or failed asset/data requests were observed.

## Limitations

The ten unresolved targets remain inactive until their named critical evidence is obtained. International source material remains marked for UAE adaptation where no direct UAE evidence exists. Wave 7 adds documentation-only workflow-specific controls; it does not create mappings, approvals, inferred diagnoses, prescriptions, or unsupported clinical recommendations.

Final repository status after the documentation commit: clean (`0 staged / 0 modified / 0 untracked`).

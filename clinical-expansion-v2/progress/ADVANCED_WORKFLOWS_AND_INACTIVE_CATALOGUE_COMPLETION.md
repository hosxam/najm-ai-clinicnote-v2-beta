# Advanced workflows and inactive catalogue completion

## Outcome

The beta branch `guideline-evidence-packs-and-reconstruction-v1` started at `ad6149d992e3ab6dd5e638411165b2feb5a125f3`. The implementation commit `71c0a6606d80b61295d2ddb9ba1316e449464383` was pushed to that branch and deployed by GitHub Pages workflow run `30111806793` (build job `89542885290`, deploy job `89543177606`). The deployed beta build displays `71c0a66` at [the beta workspace](https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta).

The beta now uses the existing main-site engines: Quick mode renders `QuickNotePage` and its confirmation-aware `ChipSelector` workflow; Advanced mode renders `DetailedEncounterPage` with the committed specialty history layouts, examination groups, investigations, medication/plan groups, safety notes, section progress, and `buildDetailedOutputs`. The beta route is active-catalogue guarded and fails closed for inactive IDs.

## Catalogue and modes

| Measure | Result |
| --- | ---: |
| Original workflows | 1,500 |
| Active usable workflows | 416 |
| Inactive workflows | 1,084 |
| Clinician-facing items | 6,290 |
| Internal evidence records | 75,484 |
| Quick-mode workflows | 416 |
| Advanced-mode workflows | 416 |
| Committed advanced chip options | 9,935 |
| Advanced examination/investigation/plan/medication options | 5,001 |

`public/data-beta/advanced-workflows/manifest.json` is deterministic and references the committed core data and interactive evidence records. Every mode has explicit SOAP destinations, confirmation-required input, and `preselected_facts: false`; the Quick suggestions remain visibly unconfirmed until a clinician confirms them.

## Inactive-workflow reassessment

All 1,084 inactive workflows were individually reassessed in `advanced-inactive-research-assessment.json`, preserving the existing source-first research records and not mutating clinical source data.

- Search queries recorded: 2,880.
- Official pages opened: 1,208; exact documents opened: 903.
- Exact evidence items: 1,937.
- Evaluated candidate source references: 4,075.
- Unique accepted existing sources: 210; newly ingested sources: 0.
- Evidence packs consulted: 960.
- 708 remain inactive because critical core evidence is still missing.
- 376 are retired after full search found no authoritative basis.
- Newly reconstructed/activated: 0; merged: 0; blocked source access: 0.

No workflow was activated merely to improve totals. The per-workflow record includes title, specialty, population, setting, inactivity reason, pack IDs, queries, opened documents, evaluated/accepted/rejected sources, exact evidence, gaps, and disposition.

## Visual asset

The exact provided hero remains at `public/assets/najm-constellation-hero.png`: 1536×1024 RGB PNG, 1,922,791 bytes, SHA-256 `61c2579dffd720dab492c78ea683ea80087f543064046fccad694643dfc25a72`. It is used as the dark-left/text, constellation-right responsive hero with a mobile-safe crop and no distortion.

## SOAP and browser validation

- `npm run test:advanced-soap`: 416 workflows × 2 modes, 832 cases, PASS (blank, populated, partial, evidence-separation checks).
- `npm run test:interactive-soap-all`: 416/416 PASS.
- `npm run test:interactive-random-sample`: seeds 20260724, 20260725, 20260726; 50 workflows/15 archetypes per round; three consecutive clean passes.
- Local Playwright: seven representative active workflows across acute, chronic follow-up, medication review, result review, anaesthetic, and emergency archetypes opened in Quick and Advanced; source evidence panels opened; chip selections generated SOAP content; inactive route stayed isolated; search, specialty and archetype filters worked; desktop 1440px, tablet 1024px, and mobile 390px had no major horizontal overflow; no console errors or failed assets; no `curated-workflows` requests.
- Live Playwright against the deployed URL reproduced the same results. Displayed build SHA was `71c0a66`; live counts were 1,500/416/1,084/6,290/75,484; obsolete dataset requests were zero; console errors and failed assets were zero.

Representative live IDs: `gp-fever-urti`, `cardio-chest-pain`, `anes-post-op-anesthesia-follow-up`, `cardio-anticoagulation-documentation`, `cardio-ambulatory-blood-pressure-result-review`, `anes-post-anesthesia-recovery-documentation`, and `derm-nail-trauma-review`.

## Validation results

PASS: `validate:advanced-workflow-modes`, `validate:inactive-research-assessment`, `beta:validate-complete`, `validate:data`, `test:safety`, `test:all-workflows`, `test:output-safety`, `audit:source-recency`, `verify:clinical-data-reproducibility`, `test:advanced-soap`, `test:interactive-soap-all`, `test:interactive-random-sample`, `build`, and `lint` (lint has the repository's existing non-blocking warnings).

Source-recency and clinical-data reproducibility remained PASS. The stored/active/replay metadata fingerprint remained `b4c72a2a883c0bd733c06077a950939c18700349cdc1e0f897efcb0609945533`; replay and stored manifest fingerprint remained `e2fee811807c83f4d2bd2bcc7a630634fb845afbd3a8f323dc8183d91d79bfe9`.

## Boundaries

- Beta only; no stable production deployment and no merge into `main`.
- `public/data` unchanged; source registries unchanged; canonical and signed state unchanged; mappings/candidates remain 0/0; exclusions remain 12.
- No unsupported legacy content was modified.
- No automatic clinician approval, signing, merge, rebase, force-push, or production deployment occurred.

The final documentation commit is separate from the deployed implementation commit; the live beta intentionally reports the deployed implementation SHA `71c0a66`.

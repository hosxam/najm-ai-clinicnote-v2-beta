# Advanced workflows and inactive catalogue completion

## Outcome

The beta branch `guideline-evidence-packs-and-reconstruction-v1` started at `ad6149d992e3ab6dd5e638411165b2feb5a125f3`. The original implementation commit `71c0a6606d80b61295d2ddb9ba1316e449464383` was subsequently corrected by `1df3ecb6c6b56566518c4b733fe83df0e7b36960` and the canonical-manifest/alias repair commit `82e1ba8dffba634aa9ceae9613073bd1cea35620`. The repaired beta was deployed by GitHub Pages workflow run `30115691193` (build job `89555691153`, deploy job `89555976155`) and displays `82e1ba8` at [the beta workspace](https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta). Stable production and `main` remain untouched.

The beta now uses the existing main-site engines: Quick mode renders `QuickNotePage` and its confirmation-aware `ChipSelector` workflow; Advanced mode renders `DetailedEncounterPage` with the committed specialty history layouts, examination groups, investigations, medication/plan groups, safety notes, section progress, and `buildDetailedOutputs`. The beta route is active-catalogue guarded and fails closed for inactive IDs.

### Main-site engine audit

The reused engine is defined in `src/pages/QuickNotePage.tsx`, `src/pages/DetailedEncounterPage.tsx`, `src/components/ChipSelector.tsx`, `src/components/ChecklistGroups.tsx`, `src/components/DocumentationSection.tsx`, `src/components/OutputPanel.tsx`, `src/lib/dataAdapter.ts`, `src/lib/outputBuilders.ts`, and `src/types/clinicnote.ts`. Its persisted schemas are `workflow_chips.json`, `v4_workflow_history_drafts.json`, `v4_workflow_exam_details.json`, `v4_investigation_options.json`, `v4_plan_options.json`, `v4_plan_medication_options.json`, `specialty_history_layouts.json`, and `speed_presets.json`.

Advanced now exposes workflow-specific history fields and chip groups (symptoms, explicit negatives, red flags, follow-up, chronology/risk/context groups), numeric vital-sign entry, focused examination groups, investigation/result groups, medication option groups without dose invention, clinician assessment, clinician plan, referral/instructions, and a conditional clinician-stated escalation field when red flags are selected. All selected values map through the SOAP builder; blank values remain absent. Quick remains a compact, confirmation-aware subset with free text and clinician-controlled assessment/plan.

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

`public/data-beta/advanced-workflows/manifest.json` is deterministic and references the committed core data and interactive evidence records. Every mode has explicit SOAP destinations, confirmation-required input, conditional rules, nested group references, and `preselected_facts: false`; the Quick suggestions remain visibly unconfirmed until a clinician confirms them.

## Inactive-workflow reassessment

All 1,084 inactive workflows were individually reassessed in `advanced-inactive-research-assessment.json`, preserving the existing source-first research records and not mutating clinical source data.

- Search queries recorded: 2,880; 3,353 unique additional authoritative query formulations were drawn from the committed 18-campaign search manifest (the per-workflow joined total is 721,662 because the same campaign query set is retained on every affected workflow).
- Official pages opened: 1,208; exact documents opened: 903.
- Exact evidence items: 1,937.
- Evaluated candidate source references: 4,075 (3,363 terminal candidate evaluations plus per-workflow accepted/rejected source references). The committed candidate evaluator is independently terminal for all 3,363 candidates: 2,371 rejected and 992 duplicate-existing-source; the joined assessment retains 721,662 workflow-level evaluation references for provenance.
- Unique accepted existing sources: 210; newly ingested sources: 0. The source-candidate evaluator itself recorded 3,363/3,363 terminal evaluations (2,371 rejected, 992 duplicate-existing-source) across 18 campaigns.
- Evidence packs consulted: 960.
- The assessment stores campaign query counts/fingerprints and stable candidate IDs; full query and candidate detail remains in the committed campaign/evaluation registries, avoiding a duplicated oversized artifact.
- 708 remain inactive because critical core evidence is still missing.
- 376 are retired after full search found no authoritative basis.
- Newly reconstructed/activated: 0; merged: 0; blocked source access: 0.

Disposition subtype counts were individually recorded: `remains_inactive_missing_critical_core_evidence` 708; `retired_no_authoritative_basis_after_full_search` 376; `newly_reconstructed_and_activated` 0; `merged_into_active_workflow` 0; `retired_true_duplicate` 0; `retired_not_a_clinical_documentation_workflow` 0; `retired_unsafe_or_out_of_scope` 0; `blocked_authoritative_source_inaccessible` 0. No accepted source cleared all required core gaps for an inactive workflow, so no activation or alias merge was justified.

No workflow was activated merely to improve totals. The per-workflow record includes title, specialty, population, setting, inactivity reason, pack IDs, queries, opened documents, evaluated/accepted/rejected sources, exact evidence, gaps, and disposition.

## Visual asset

The exact provided hero remains at `public/assets/najm-constellation-hero.png`: 1536×1024 RGB PNG, 1,922,791 bytes, SHA-256 `61c2579dffd720dab492c78ea683ea80087f543064046fccad694643dfc25a72`. It is used as the dark-left/text, constellation-right responsive hero with a mobile-safe crop and no distortion. Captures: [desktop](visual-overhaul-audit/advanced-beta-hero-desktop.png), [mobile](visual-overhaul-audit/advanced-beta-hero-mobile.png), and the prior [immersive desktop](visual-overhaul-audit/desktop-immersive.png).

## SOAP and browser validation

- `npm run test:advanced-soap`: 416 workflows × 2 modes, 832 cases, PASS (blank, populated, partial, explicit negatives, vital/context/medication/safety-net content, and evidence-separation checks).
- `npm run test:interactive-soap-all`: 416/416 PASS.
- `npm run test:interactive-random-sample`: seeds 20260724, 20260725, 20260726; 50 workflows/15 archetypes per round; three consecutive clean passes.
- Local Playwright: 17 fixed representative active workflows (including medication, result-review, anaesthetic, emergency, chronic follow-up, and the seven records in the protected exclusion register) opened in Quick and Advanced; three deterministic rounds of 50 random active workflows passed in both modes; source evidence panels opened; chip selections generated SOAP content; inactive route stayed isolated; search, specialty and archetype filters worked; desktop 1440/1280px, tablet 1024/768px, and mobile 390/360px had no major horizontal overflow; no console errors or failed non-aborted assets; no `curated-workflows` requests. Reset/persistence, responsive hero, reduced-motion, and local storage checks also passed.
- Final live Playwright verification against the repaired deployment passed: the initial `/beta` route requested the canonical final-catalogue manifest and no obsolete curated dataset; search and alias search (`pyrexia` → `gp-fever-urti`) worked; specialty and archetype filters worked; all active fixed workflows opened in Quick and Advanced with evidence panels, while named inactive workflows stayed isolated; 3 × 50-workflow seeded random rounds passed; desktop/tablet/mobile had no overflow; reduced-motion/hero checks passed; counts were 1,500/416/1,084/6,290/75,484; console errors and failed assets were zero; no local paths were exposed.

Representative live IDs: `gp-fever-urti`, `cardio-chest-pain`, `anes-post-op-anesthesia-follow-up`, `cardio-anticoagulation-documentation`, `cardio-ambulatory-blood-pressure-result-review`, `anes-post-anesthesia-recovery-documentation`, and `derm-nail-trauma-review`.

## Validation results

PASS: `validate:advanced-workflow-modes`, `validate:inactive-research-assessment`, `beta:validate-complete`, `validate:final-beta-manifest`, `validate:final-beta-route`, `validate:workflow-readiness`, `validate:workflow-item-evidence`, `validate:workflow-evidence-reconstruction`, `validate:direct-guideline-curation`, `validate:evidence-packs`, `validate:source-evidence`, `validate:item-provenance`, `validate:final-status-reconciliation`, `validate:data`, `validate:interactive-workflows`, `validate:interactive-accessibility`, `validate:interactive-performance`, `validate:clinician-facing-separation`, `validate:merge-aliases`, `validate:medication-safety`, `test:safety`, `test:all-workflows`, `test:output-safety`, `test:advanced-soap`, `test:interactive-soap-all`, `test:interactive-random-sample`, `verify:source-metadata-reproducibility`, `audit:workflow-usability`, `verify:clinical-data-reproducibility`, `build`, and `lint` (lint has the repository's existing non-blocking warnings).

Source-recency and clinical-data reproducibility remained PASS. The stored/active/replay metadata fingerprint remained `b4c72a2a883c0bd733c06077a950939c18700349cdc1e0f897efcb0609945533`; replay and stored manifest fingerprint remained `e2fee811807c83f4d2bd2bcc7a630634fb845afbd3a8f323dc8183d91d79bfe9`.

The advanced-mode manifest fingerprint is `5700a194048ce84cffb44a10b5e0d17d615a39e4892d627dcc75b5c3e0a8fb7b`; the compact inactive reassessment fingerprint is `138814202e21424e3eed8bb222ac7a00807a24e1ea2a8ea5e05603b61963a9a3`.

## Independent live-audit repairs

The first live audit identified two production-surface defects and they were repaired in the follow-up beta commit: the interactive beta loader now fail-closes against and loads the canonical `data-beta/final-catalogue/manifest.json` before rendering, and it joins the committed diagnosis index so legacy and merged workflow aliases are searchable (for example, `pyrexia` resolves to `gp-fever-urti`). The route validator now asserts both contracts. The repaired build must be redeployed and rechecked before this report is considered complete.

## Boundaries

- Beta only; no stable production deployment and no merge into `main`.
- `public/data` unchanged; source registries unchanged; canonical and signed state unchanged; mappings/candidates remain 0/0; exclusions remain 12.
- No unsupported legacy content was modified.
- No automatic clinician approval, signing, merge, rebase, force-push, or production deployment occurred.

The final deployment report records the exact source SHA, workflow run, displayed build SHA, live smoke results, and production-isolation confirmations. The beta build identifier is always the deployed short SHA; no placeholder build marker is accepted.

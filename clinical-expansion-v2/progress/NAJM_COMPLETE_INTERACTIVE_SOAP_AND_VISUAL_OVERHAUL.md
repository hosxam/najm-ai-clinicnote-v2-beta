# Najm complete source-grounded interactive SOAP and visual overhaul

## Completion record

- Branch: `guideline-evidence-packs-and-reconstruction-v1`
- Starting HEAD: `184578969ef88dc94f7bad756c690ad07277aff2`
- Interactive implementation commits: `027ca0ac` (compiler and data), `5080d832` (interactive workspace and visual layer), `c211d43e` (inactive-route fail-closed repair)
- Deployed source commit: `c211d43ef0a5766540ad77f4f0f07056877afded`
- Beta deployment workflow: `30105398473` (build and Pages deploy succeeded)
- Live beta: <https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta>
- Displayed build SHA: `c211d43`

## Catalogue and reassessment

The source-grounded catalogue began with 416 active and 1,084 inactive workflows. All 1,084 inactive workflows were reassessed against the existing 236-source corpus and 960 evidence families. No new source was ingested and no inactive workflow was activated without a new authoritative basis: 0 newly activated, 0 merged, 1,084 retained inactive with `retired_no_authoritative_basis`, and 0 blocked-source decisions in this reassessment. Final totals are 1,500 original workflows, 416 active, and 1,084 inactive. Existing public/data, canonical and signed state, mappings, candidates, and exclusions (12) were preserved.

## Interactive schema and SOAP safety

- Interactive workflows: 416
- Interactive fields: 3,720
- Median fields per workflow: 10 (range 4–12)
- Evidence records retained separately: 75,484
- Synthetic SOAP cases: 416/416 passed
- Random iterations: 3 × 50 workflows (at least 10% per iteration), seeds `20260724`, `20260725`, `20260726`; each covered all 15 archetypes and passed consecutively
- SOAP mapping: all 3,720 fields have a valid SOAP destination; all 416 workflows contain assessment and plan mappings
- Field types: assessment_entry 416; examination_finding 247; follow_up_selection 165; investigation_result 317; medication_entry 26; plan_entry 416; referral_selection 103; safety_netting_selection 152; text 432; textarea 1,294; vital_sign 152

The generated note contains only entered or selected values, preserves clinician assessment and plan wording, omits empty sections, and has no guideline prose, evidence identifiers, citations, inferred diagnoses, or invented treatment. Evidence remains a separate drawer.

## Defects found and repaired

The primary route was changed from an evidence-browser-first surface to the interactive SOAP catalogue. A duplicate note-label prefix was removed. Direct navigation to inactive workflow IDs initially caused 404 asset requests and stale prior-workflow rendering; the final repair checks catalogue membership before fetching and resets route state, returning a clear inactive fail-closed message without a request or form.

## Visual, accessibility, and performance work

The available image-generation integration was invoked after functional gates passed and completed an original constellation/nebula hero asset generation. Integrated asset: `public/assets/najm-constellation-hero.png` (1,922,791 bytes; SHA-256 `61c2579dffd720dab492c78ea683ea80087f543064046fccad694643dfc25a72`). Visual manifest SHA-256: `95c8321c7bbd06494afd6d46c94f586c3032354de66052b278cec0dc86f2e841`. The tool does not expose a model name in its result, so no unsupported model-name claim is made.

The overhaul adds a constellation hero, cyan/violet depth, immersive and Clinical Focus modes, evidence drawer styling, keyboard-visible focus states, semantic labels, and reduced-motion CSS. Accessibility validation passed for all 416 workflows/3,720 fields. Desktop (1,440 px), tablet (768 px), and mobile (390 px) live checks had no horizontal overflow. The production build passed; the interactive route requests only its manifest/catalogue/detail assets and lazy workflow detail, while pre-existing legacy static payloads remain outside the primary route.

## Fingerprints and live verification

- Source catalogue: `9ba3008fdc043f21f8d8c3e4ea48f3a1385a17a24c5a220c640831fc5b460bdb`
- Workflow resolution: `96b4db875995643f010ad50b2b0f95a1a7269504ceabd80693f2fd0750dad70a`
- Interactive workflow fingerprint: `09561cf2a55417d9911304e0c7f6e26bd8adb5e3a517124537ec856315a3c821`
- Interactive manifest: `02c3ffac3bac65132750e77d857fa1ada1208b258a12c41ac4406be144dd705c`

Live Playwright verification on the deployed SHA confirmed the beta catalogue and 416 count, search, specialty/archetype filters, active workflow forms, SOAP generation/editability, local draft persistence, evidence drawer and official links, no evidence leakage into notes, merged-title variants (`cardio-post-pci-follow-up` and `cardio-post-pci-followup`), and an active emergency workflow (`ed-anaphylaxis-documentation`). Inactive examples (`gp-cough`, `gp-shortness-of-breath`, `peds-fever`, and `urgent-anaphylaxis-documentation`) showed the unavailable fail-closed state with no usable form. Desktop/tablet/mobile layouts had no major overflow; reduced-motion and Clinical Focus controls were present; console error count was zero and all observed static requests returned 200. No local filesystem paths were exposed.

The primary route loaded `data-beta/interactive-workflows/manifest.json` and `catalog.json`; it did not request `curated-workflows` or the evidence-only final catalogue. Production isolation was confirmed: no stable production deployment, main push/merge, rebase, force-push, signing, approval, mapping/candidate write, canonical/signed-state change, public/data change, or exclusion change occurred.


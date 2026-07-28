# NAJM Targetable Backlog and Recovery — Wave 10

Status: **complete with zero automatic reactivations**

Wave 10 started from `beta-final-recency-resolution-v1` at `053817e86ffe6f5a73630d3b1defbc75f14c3c4a`, and was delivered on `beta-targetable-backlog-and-wave10-v1`. All inactive records and selected targets were handled fail-closed: no workflow was activated without exact current workflow-specific authoritative evidence.

## Deployment

- End SHA / deployed SHA: `a53b8912fabcfbfd13efb7f292d733addeacba63` (`a53b891` displayed)
- Deployment run: [30372419102](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30372419102)
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Deployment succeeded on the beta branch only; stable production was not touched.
- Live verification: [LIVE_VERIFICATION_WAVE10.json](./wave10/LIVE_VERIFICATION_WAVE10.json)

## Reconciliation and targeting

- Inactive records reconciled: **623**, unique and exactly once; active + inactive remains **1,500**.
- Baseline classifications: 569 distinct targetable missing named evidence; 15 source-access blocked; 25 recently deactivated (24 source mismatches, 1 metadata inconsistency); 13 incorporated components; 1 retired duplicate.
- Recently deactivated recovery outcomes: 0 reactivated, 0 incorporated/redirected, 25 remain inactive (24 `remains_inactive_workflow_source_mismatch`, 1 `remains_inactive_metadata_inconsistency`).
- Families selected: **20** (new Wave-10 specialty-prefix families; no Wave-9 family pack was repeated as an activation).
- Distinct targets: **160** (25 recovery targets + 135 distinct inactive targetable workflows).
- Workflows newly activated: **0**; reactivated: **0**; all 160 targets have terminal fail-closed outcomes.

## Evidence acquisition and packs

- Official domain searches: **185** terminal candidate searches (25 recovery gaps + 160 selected target gaps).
- Guideline documents located/downloaded/extracted for new Wave-10 evidence: **0**; no candidate met exact current workflow, population, setting and scope requirements.
- New sources accepted: **0**; existing source registry remains **242**.
- Existing source references reused for recovery comparison: **20**; duplicate sources: **0**; access failures: **0**; unresolved candidates: **0**.
- Family evidence packs: **20** terminal packs; workflow evidence packs: **160** terminal packs; completeness and differentiation matrices cover all 160 targets.
- Field provenance added: **0** (no activation occurred).

## Catalogue and regression

| Measure | Before | After |
|---|---:|---:|
| Original workflows | 1,500 | 1,500 |
| Active usable workflows | 877 | 877 |
| Inactive workflows | 623 | 623 |
| Release-ready workflows | 460 | 460 |
| Scope-qualified workflows | 417 | 417 |
| Interactive fields | 10,980 | 10,980 |
| Interactive evidence records | 69,714 | 69,714 |
| Selectable controls added | 0 | 0 |
| Contradiction groups added | 0 | 0 |
| Conditional rules added | 0 | 0 |
| Archetype outputs added | 0 | 0 |

All required regression commands passed, including the 877-workflow regression, 433 manual-defect regression, selectable controls, contradiction groups, aliases, retirement, blocked-source, medication safety, source recency, replay/provenance, manifest, lint and build checks. Field tests, selected/unselected option tests and Wave-10 adversarial activation cases are zero because no workflow was activated; baseline state and browser checks passed.

Lint reported **223 pre-existing warnings before and after**, with zero new warnings. The complete file/rule inventory is [LINT_WARNING_INVENTORY_WAVE10.json](./wave10/LINT_WARNING_INVENTORY_WAVE10.json).

## Live verification

The deployed build SHA matched `a53b891`. The canonical `data-beta/final-catalogue/manifest.json` loaded with HTTP 200 and reported 1,500 original, 877 active, 623 inactive, 12,295 clinician-facing items and 116,793 internal evidence records. The active `gp-fever-urti` route opened after a workflow-scoped Start Fresh action; `peds-cough` failed closed as inactive. Desktop (1440), tablet (768) and mobile (390) had no horizontal overflow. Console errors and failed assets were zero.

The legacy `data-beta/curated-workflows/catalog.json` endpoint returns an empty JSON array and is requested by the current shell, but it did not supply the rendered catalogue; the interactive route rendered from the interactive catalogue and canonical final manifest. This is recorded as a truthful remaining limitation rather than changing the protected application in Wave 10.

## Protected-state confirmation

- Source registries: unchanged (242 sources).
- Public/data, canonical mapping state, signed state, mappings and candidates: unchanged; mappings/candidates remain **0/0**.
- Exclusions remain **12**; unsupported legacy remains **83,303 runtime-excluded**.
- No stable production deployment, merge, rebase, force-push, signing, approval or queue continuation occurred.

The remaining limitation is evidence availability: exact current authoritative workflow-specific documents were not established for the selected inactive targets, so they remain inactive and no unsupported clinical content was fabricated.

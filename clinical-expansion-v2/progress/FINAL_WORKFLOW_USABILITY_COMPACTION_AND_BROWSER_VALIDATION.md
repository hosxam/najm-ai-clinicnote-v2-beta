# Final workflow usability, content-compaction, and browser validation gate

## Scope and boundary

This gate was run on branch `guideline-evidence-packs-and-reconstruction-v1` from starting HEAD `3b83625e9182599081a873a131d0c787c5f12141`. The worktree was clean at the starting check. No source research, candidate evaluation, clinician queue, deployment, push, merge, rebase, signing, approval, canonical state, signed state, mappings, exclusions, or production public/data was changed. This was a local beta-catalogue usability and validation pass only.

## Final workflow status reconciliation

The catalogue contains exactly 1,500 workflows and the seven-way status reconciliation remains:

| Final status | Workflows |
| --- | ---: |
| `reconstructed_complete` | 214 |
| `reconstructed_with_noncritical_documented_limitations` | 202 |
| `merged_into_supported_workflow` | 0 |
| `retired_no_authoritative_basis` | 1,084 |
| `retired_duplicate_or_overlapping` | 0 |
| `retired_out_of_scope_or_unsafe` | 0 |
| `blocked_source_access` | 0 |
| **Total** | **1,500** |

Active/usable workflows are the 416 reconstructed records (214 complete plus 202 with documented limitations). The 1,084 inactive records remain in the inactive inventory and are not presented as usable workflows. Retirement validation confirms terminal retirement and no reopened workflows.

## Clinician-facing separation and compaction

The previous 75,484 active evidence statements were audited and separated by role. They are now retained as 75,484 internal evidence records with source IDs, official URLs, exact locators, and fingerprints; they are not rendered as a clinician-facing evidence dump. `provenance_only_record_count` is 0 because provenance is embedded in the hidden evidence records. The compact clinician-facing layer contains 6,290 items across the 416 usable workflows.

Compaction results:

- before: 75,484 clinician-facing candidates
- after: 6,290 clinician-facing items
- exact duplicate statements removed: 830
- near-duplicate statements consolidated: 8,309
- concept groups consolidated: 34,016
- workflows changed by compaction: 416
- evidence records retained behind the compact layer: 75,484
- hidden audit records: 23,745

Compaction preserves all evidence statement IDs and source IDs on each compact item. Each item has a concise wording, section, action, population/setting/jurisdiction metadata, and an expandable evidence panel with the official source URL and exact locator. Navigation, document-control, survey, and definition boilerplate is excluded from clinician-facing wording.

## Usability and content audit

The automated audit covered all 416 active workflows and checked required archetype sections, duplicate wording, near-duplicate wording, HTML/local-path leakage, and evidence-prose leakage.

- minimum items per active workflow: 6
- median: 16
- mean: 15.120192307692308
- p90: 17
- p95: 17
- maximum: 17
- workflows over 50 items: 0
- workflows over 100 items: 0
- workflows under 3 items: 0
- workflows containing evidence-prose items: 0
- near-duplicate clinician-facing items: 0
- workflows missing required non-scope sections: 0
- long wording or local filesystem paths: 0

The named-workflow and seeded sample audit covered 52 workflows (21 named and 31 deterministic seeded samples), checked 2,809 active items, and reopened exact locators successfully. Retirement and blocked-source audits both passed; 1,084 retirements remain terminal and the 22 scoped blocked-source records remain correctly isolated.

## Browser validation

The local beta was generated at `clinical-expansion-v2/guideline-workflow-resolution-v2/beta` and served locally at `http://127.0.0.1:8765/`. No deployment was performed.

Playwright CLI version was 1.61.1. Chromium installation was completed with `npx playwright install chromium`; the installed Chrome for Testing/Playwright Chromium was 149.0.7827.55 at `C:\Users\ASUS\AppData\Local\ms-playwright\chromium-1228`.

Desktop (1440×900), tablet (768×1024), and mobile (390×844) checks passed. The catalogue loaded with `1,500 workflows; 416 usable; 6,290 clinician-facing items; 1,084 inactive`. Search for `gp-fever-urti` returned Fever. Specialty filtering (Cardiology) and archetype filtering (`acute_symptom_assessment`) reduced the list correctly. Opening Fever rendered structured sections and 14 clinician-facing items with 55 retained evidence records. Expanding an evidence panel displayed an official DHA source URL and an exact page locator. Tablet and mobile layouts had no horizontal overflow (`scrollWidth` equalled viewport width), and screenshots were captured for desktop list/detail, tablet list, and mobile list/detail under `output/playwright/`. The browser console had zero errors or warnings after the favicon and layout fixes; there were no failed asset requests or local filesystem paths.

## Validation results

All requested repository checks passed: final status reconciliation, source ingestion, evidence packs, clinician-facing separation, compaction, workflow usability, named/sample workflow audit, evidence reconstruction, item evidence, archetypes, section applicability, medication safety, merge aliases, retirement, blocked-source, data validation, all-workflow tests, output safety, source recency, clinical-data reproducibility, lint, and production build. The compact beta fingerprint is `9ba3008fdc043f21f8d8c3e4ea48f3a1385a17a24c5a220c640831fc5b460bdb`. Source corpus, evidence-pack, and workflow-resolution fingerprints remain `9377495369b84412d0b0b265d86311264b01abc6865b69e1c1ebfdd017134e02`, `30e25a36cd53ae0436474dcf5c0968404ab37f4d2de03c6333275390a75e2d77`, and `96b4db875995643f010ad50b2b0f95a1a7269504ceabd80693f2fd0750dad70a` respectively.

## Production isolation and disposition

This gate changed only the local beta presentation artifacts, the compaction/validation implementation, package scripts, and this report. Public production data, canonical approval/signature state, mappings, exclusions, source research, and clinician adjudication state were untouched. No push, deployment, merge, rebase, signing, approval, or queue continuation occurred. Deployment remains approval-gated.

**FINAL_WORKFLOW_USABILITY_AND_BROWSER_VALIDATION_COMPLETE_DEPLOYMENT_APPROVAL_REQUIRED**

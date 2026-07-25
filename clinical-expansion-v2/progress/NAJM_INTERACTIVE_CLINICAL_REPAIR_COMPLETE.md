# NAJM Interactive Clinical Repair

Status: IMPLEMENTED; BETA DEPLOYMENT BLOCKED BY EXISTING PAGES ENVIRONMENT POLICY

## Baseline and delivery

- Starting branch: `guideline-evidence-packs-and-reconstruction-v1`
- Starting SHA: `ce35891ff68096f2ee014e6aa8af321e21723588`
- Implementation branch: `beta-interactive-clinical-repair-v1`
- Ending SHA before this report: `1adf3fe36f691036045234450b8e6ba2e972e5ae`
- Intended beta URL: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Deployment workflows: https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30170840800 and retry https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30170958926
- Deployed source SHA: not available; the run's build job passed, but the deploy job was rejected because the existing `github-pages` environment does not allow `beta-interactive-clinical-repair-v1`.
- No stable-production deployment was attempted.

The branch was pushed without force-push, merge, rebase, signing, approval, or protection-rule changes. The live URL therefore remains the previously deployed beta and was not represented as containing this repair.

## Architecture changes

- `/beta/workflows/:workflowId` now uses the compiled schema in `public/data-beta/interactive-workflows/workflows/<workflow-id>.json` as its primary renderer.
- Advanced mode renders every schema field in declared display order; Quick mode is a curated subset of the same schema.
- Controls use exact field IDs, source labels, source-defined options, required state, visibility rules, contradiction clearing, and provenance references.
- Supported controls include text, textarea, integer, decimal, date, time, select, multi-select, yes/no/unknown, duration, vital-sign, examination, investigation, medication, allergy, assessment, plan, safety-netting, referral, follow-up, and repeated structured rows.
- Workflow-scoped draft keys are versioned as `najm-clinicnote-v2:draft:1:<workflow-id>:<mode>`. Obsolete global keys are removed and saved drafts require an explicit Resume or Start fresh choice.
- SOAP output is schema-ordered, clinician-label based, blank/unselected safe, semantically deduplicated, and retains the clinician-review footer. Procedure archetypes also receive a separate procedure-note output.
- Catalogue search prioritises exact title, workflow ID, title prefix, and exact alias matches.

## Catalogue and provenance counts

- Original workflows: 1,500
- Active interactive workflows: 416
- Inactive workflows: 1,084
- Rendered schema fields: 3,720
- Retained evidence records: 75,484
- Legacy fallback workflows: 0
- Newly activated workflows: none
- Newly ingested sources: none
- Stable source/canonical/protected data: unchanged

## Validation results

- `npm run build`: PASS
- `npm run lint`: PASS with pre-existing warnings only
- `npm run validate:interactive-workflows`: PASS (416 workflows, 3,720 fields, 75,484 evidence records)
- `npm run test:interactive-soap-all`: PASS (416 synthetic cases)
- `npm run test:advanced-soap`: PASS (832 mode cases)
- `npm run test:interactive-clinical-repair`: PASS (15 targeted fixture workflow presence checks; 3,720 field binding/provenance checks)
- `npm run test:interactive-random-sample`: PASS (seeds 20260724, 20260725, 20260726; 50 workflows per seed; three consecutive clean passes)
- `npm run validate:interactive-accessibility`: PASS (3,720 fields; keyboard focus and reduced-motion checks)
- `npm run validate:interactive-performance`: PASS (60 critical assets; no validation errors)
- `npm run test:all-workflows`: PASS
- `npm run test:output-safety`: PASS
- `npm run test:safety`: PASS (16 tests; 12 exclusions checked)
- `npm run validate:data`: PASS
- `npm run audit:source-recency`: PASS
- `npm run verify:clinical-data-reproducibility`: PASS, including active/replay/stored metadata parity

Local Playwright smoke checks passed on the catalogue, chest-pain route, draft-choice modal, workflow transition isolation, SOAP generation, and desktop/tablet/mobile viewport sizes. No uncaught console errors or failed asset requests were observed. Screenshots were transient QA artifacts and were removed before the final repository check.

## Protected-state confirmation

- `public/data` unchanged.
- Canonical signed artefacts and source signatures unchanged.
- Mappings and candidates remain zero.
- Clinician approvals remain zero.
- Exclusions remain 12.
- No stable production deployment, merge, rebase, force-push, signing, or approval occurred.

## Deployment blocker

GitHub Actions runs `30170840800` and `30170958926` completed their build and artifact upload successfully. Both deploy jobs failed before publication with: `Branch "beta-interactive-clinical-repair-v1" is not allowed to deploy to github-pages due to environment protection rules.` The environment currently allows only `main`, `guideline-evidence-packs-and-reconstruction-v1`, and `clinician-review-adjudication-micro-pilot-v1`. No protection rule was changed, and no alternate branch was used.

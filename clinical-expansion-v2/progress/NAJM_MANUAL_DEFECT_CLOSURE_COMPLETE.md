# NAJM Manual 15-Workflow Defect Closure

## Scope and provenance

This closure run started from `beta-manual-defect-closure-v1` at
`59de3805db9a60734fe4547e4e99ff69ceafa3e3`, preserving all prior proof reports
and artifacts. The deployed implementation used for reproduction was
`a6f277cac6a7316367fe27abe5b5429ee282ce54` (`a6f277c`). No stable-production
route, canonical source data, mappings, approvals, signed state, or exclusions
were modified.

Implementation checkpoint commit: `ee573da7259ae96b260e16026fc3fb7b2b9d2351`.
Final documentation commit/end SHA: `7aa2e2e4afa5d168017f98f11a4888034eaa57ca`.

The authoritative ledger produced 433 independent closure records: numbered
defects 1–370 plus 41 pre-anaesthetic and 22 procedure additions. Every record
contains the original description, workflow/mode/category, reproduction input,
exact generated Quick and Advanced output, live route behavior, evidence and
code/schema references, assertions, terminal status, and remaining limitation.

## Terminal results

| Terminal status | Count |
|---|---:|
| fixed_and_proven | 0 |
| already_fixed_and_reproduced | 44 |
| partially_fixed | 155 |
| still_present | 221 |
| not_applicable_with_proof | 13 |
| blocked_by_missing_authoritative_evidence | 0 |
| blocked_by_technical_error | 0 |
| **Total** | **433** |

The 376 records that remain unresolved (155 `partially_fixed` and 221
`still_present`) are intentionally visible limitations of the current schemas.
They are not treated as fixed. The prior implementation
repairs that were independently reproduced include workflow-scoped draft
isolation and explicit Start Fresh/Resume behavior, reset clearing, preservation
of entered values, documentation-status filtering, output de-duplication, and
separate procedure output where supported. This branch adds the closure matrix,
exact-output fixtures, per-defect assertions, and browser evidence; it does not
invent source-free clinical fields.

## Field and interface accounting

- Interactive workflows: 416; inactive workflows: 1,084; original catalogue: 1,500.
- Compiled interactive fields: 3,836 (3,720 baseline plus 116 evidence-gated
  structured fields across the 15 audited workflows). The added fields are
  source-pack anchored and remain optional; no field was removed or relabelled.
- Field-binding repairs: the compiler now binds each added field to matched
  accepted evidence statement IDs, and the existing renderer/builder bindings
  were tested. No legacy field was rebound.
- Rendered selectable DOM controls: 0 across 15 workflows × Quick/Advanced (30 mode cases).
- Selected-option tests: 0; unselected-option tests: 0 (not applicable with DOM proof).
- Contradiction groups: 0; contradiction tests: 0.
- Internal evidence records retained: 75,484; clinician-facing items: 6,290.

The selectable-control check inspected rendered `select`, checkbox, and radio
elements in Quick Mode and every Advanced section. Current controls are free
entry/text, numeric, examination, investigation, medication, and related inputs;
no option-bearing DOM controls were found.

## Reproduction and validation

- Exact reproduction tests: 433; post-repair/current-output tests: 433.
- Quick case outputs: 15; Advanced case outputs: 15.
- Separate archetype outputs: 2; field-binding assertions: 433.
- Manual closure browser cases: 30; marker failures: 0; console errors: 0;
  failed requests: 0.
- The repaired local build was also exercised across all 15 workflows in both
  modes (30 cases), including the new structured fields: marker failures 0,
  console errors 0, and failed requests 0. See
  `manual-defect-closure/LOCAL_REPAIR_BROWSER_RESULTS.json`.
- All-active browser routes: 416 Quick and 416 Advanced; viewport checks: 141;
  route, viewport, console, and request failures: 0.
- State/reset/Start Fresh/Resume/catalogue-routing checks: 416 each.
- Safety, data, source evidence, item provenance, source recency, metadata
  reproducibility, workflow readiness, evidence-pack normalisation, final beta
  manifest/route, accessibility, performance, usability, medication safety,
  queue, lint, typecheck, and build checks passed.

The complete machine-readable results are in
`clinical-expansion-v2/progress/manual-defect-closure/FINAL_VALIDATION_RESULTS.json`,
`BROWSER_MODE_RESULTS.json`, and
`SELECTABLE_CONTROL_BROWSER_RESULTS.json`.

## Deployment status

This report is a closure evidence checkpoint. The branch has not been claimed as
live-deployed by this report until a beta workflow run succeeds and the deployed
source SHA is independently verified. The remaining 376 defects must remain
visible in the unresolved artifact and must not be presented as clinically
complete. The unresolved set is 376 records: 155 partially fixed and 221 still
present.

The requested beta workflow was run from `beta-manual-defect-closure-v1`:

- Run: `30193554836`
- URL: https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30193554836
- Build job: passed (ID `89770962827`), including install, data validation,
  build, and Pages artifact upload.
- Deploy job: rejected (ID `89771078279`). GitHub Pages reported that branch
  `beta-manual-defect-closure-v1` is not allowed to deploy to the `github-pages`
  environment. No live deployment occurred and no live SHA is claimed for this
  closure branch.

The exact branch requiring environment authorization is therefore
`beta-manual-defect-closure-v1`; no protection rule was bypassed.

## Protected-state confirmation

Mappings and candidates remain 0/0; clinician approvals remain 0; exclusions
remain 12; public/data, canonical state, signed state, and inactive catalogue
scope remain unchanged. No stable deployment, merge, rebase, force-push,
approval, or signing action was performed.

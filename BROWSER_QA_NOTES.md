# Browser QA Notes

## Scope
- Repo: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Date: 2026-06-27
- QA method: live Vite dev server + Playwright CLI browser pass
- Clinical data changed: no

## Screens tested
- Home
- Quick Note
- Detailed Encounter
- Medical Report / Letter
- Feedback
- Safety / About

## Flows tested
- Home search terms: `cough`, `URTI`, `abdominal pain`, `back pain`, `sepsis`
- Quick Note route selection and direct-load flow with `gp-fever-urti`
- Quick Note SOAP draft generation
- Copy output action
- Reset draft confirmation
- Refresh-page local draft restore behavior
- Clear saved draft behavior
- Detailed Encounter route and output tabs with `msk-low-back-pain`
- Medical Report draft flow with `gp-abdominal-pain`
- Exclusion guard direct access check with `icu-sepsis-review-documentation`
- Narrow mobile-width sanity check on Quick Note and Detailed Encounter (`390x844`)

## Real issues found
1. Quick Note started with prefilled duration and preselected chips even after browser storage was cleared.
   - Impact: testers could generate contradictory or partially invented drafts before entering anything.
2. Specialty labels had visible mojibake in the selector/UI for women\'s health workflows.
   - Impact: obvious polish/readability issue in doctor-facing UI.
3. Detailed Encounter investigation/plan checklist text showed repeated boilerplate fragments.
   - Impact: options were noisy, hard to scan, and made the drafting UI feel lower quality.

## Fixes applied
- Removed automatic Quick Note prefill for duration and prechecked chip selections.
- Kept local draft restore working only for values the tester actually entered or selected.
- Added display-level normalization for visible specialty text such as `Women\'s Health / OB-GYN outpatient`.
- Added display/output normalization for repeated documentation boilerplate in Detailed Encounter checklist items.
- Suppressed redundant checklist warning text when the warning simply repeated the visible label.

## Issues intentionally deferred
- Broad urgent search terms such as `sepsis` can still surface non-excluded related workflows if those workflows are allowed for testing.
  - This did not expose the excluded sepsis workflow itself, so it is not treated as a blocker.
- Some imported legacy wording remains clinically verbose in the underlying data.
  - This pass only cleaned the visible UI/output layer where the noise created real browser-usability problems.

## Exclusion behavior check
- Direct access to `icu-sepsis-review-documentation` is blocked with the existing limited-testing warning.
- Excluded workflows remain hidden from normal limited-testing catalog views.

## Mobile/browser observations
- No horizontal overflow reproduced on Quick Note or Detailed Encounter at `390x844`.
- No broken routes reproduced during this pass.
- No browser console errors reproduced beyond the normal React DevTools development notice.

## Validation and build
- `npm run validate:data` ✅
  - workflow count: `1500`
  - excluded workflow count: `12`
  - visible workflow count: `1488`
- `npm run build` ✅

## Files changed in this QA pass
- `src/components/WorkflowChooser.tsx`
- `src/lib/labelUtils.ts`
- `src/lib/outputBuilders.ts`
- `src/pages/DetailedEncounterPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/QuickNotePage.tsx`

## Recommendation
- Ready for beta deployment from a UI/usability perspective, with the existing limited-testing exclusions and clinician-review safety framing kept in place.

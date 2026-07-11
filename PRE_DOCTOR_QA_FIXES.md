# Pre-Doctor QA Fixes

## Summary

The four pre-doctor QA findings were fixed without changing clinical workflow data, exclusion configuration, workflow safety rules, or deterministic clinical content selection.

## Findings fixed

### P1 — Quick Note EMR duplicated SOAP

**Decision:** Keep the EMR tab and make it genuinely distinct.

- Reused the existing deterministic short-EMR format already used by Detailed Note.
- Extracted shared SOAP and EMR formatters in `src/lib/outputBuilders.ts`.
- Quick Note now builds both formats from the exact same clinician-entered fields and selected chips.
- SOAP remains sectioned as Subjective / Objective / Assessment / Plan.
- EMR now uses the distinct short-EMR structure with workflow, specialty, history, examination, impression, and plan.
- No clinical facts, diagnoses, plans, medications, investigations, or instructions are inferred.

### P2 — Generate note was not a generation action

**Decision:** Rename the action to `Review note`.

- Renamed the handler to reflect review/scroll behavior.
- The button now selects the SOAP tab and scrolls to the existing live clinician-review draft.
- Quick Note helper text now states that the draft updates live and is saved locally.
- Home now describes Quick Note as reviewing a live SOAP draft rather than generating one.
- Referral and instruction tab messages now say those formats are unavailable in Quick Note instead of saying they were not generated.
- Deterministic output assembly remains unchanged in behavior.

### P2 — Clear saved draft immediately autosaved defaults again

**Decision:** Use the honest `Clear entered content` behavior in Quick Note and Detailed Note.

- Removed the misleading storage-deletion step from both modes.
- Quick Note clears typed content and restores workflow suggested defaults.
- Detailed Note clears entered fields and returns to its empty manual defaults.
- Confirmation messages explicitly state that autosave continues.
- Local draft storage is then updated with the visible reset/default state, matching what the UI promises.

### P2 — Clipboard failure handling

- Wrapped `navigator.clipboard.writeText()` in `try/catch`.
- Success state displays `Copied`.
- Failure state displays `Copy failed` and the visible message: `Copy failed — select the text manually.`
- Failure is announced through an ARIA live status region.
- Clipboard errors no longer crash or silently fail.

## Files changed

- `src/lib/outputBuilders.ts`
- `src/pages/QuickNotePage.tsx`
- `src/pages/DetailedEncounterPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/MedicalReportPage.tsx` (OutputPanel callback API alignment only)
- `src/components/OutputPanel.tsx`
- `PRE_DOCTOR_QA_FIXES.md`

## Focused browser QA

- Quick Note SOAP output: **PASS**.
- Quick Note EMR output is distinct and begins with `SHORT EMR NOTE`: **PASS**.
- EMR uses the same selected symptoms, negatives, assessment, and plan inputs: **PASS**.
- `Review note` selects SOAP and scrolls to the review pane: **PASS**.
- Quick Note `Clear entered content` clears typed fields, restores suggested defaults, and autosaves the visible state: **PASS**.
- Detailed Note `Clear entered content` clears fields and autosaves an empty draft: **PASS**.
- Clipboard success state (`Copied`) using a controlled browser clipboard stub: **PASS**.
- Simulated clipboard rejection shows `Copy failed — select the text manually.`: **PASS**.
- Direct access to an excluded workflow remains blocked: **PASS**.
- Browser console errors during focused checks: **0**.

## Data and build validation

- Clinical data changed: **No**.
- `public/data/` changed: **No**.
- `public/config/limited_testing_exclusions.json` changed: **No**.
- Workflow count: **1,500**.
- Excluded workflow count: **12**.
- Visible workflow count: **1,488**.
- `npm run validate:data`: **PASS**.
- `npm run build`: **PASS**.

## Status

Ready for local pre-doctor review. No commit or push was performed.

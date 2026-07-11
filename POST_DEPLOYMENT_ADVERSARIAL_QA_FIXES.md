# Post-Deployment Adversarial QA Fixes

Date: 2026-07-11

## Scope

This pass fixes the post-deployment safety and usability blockers without redesigning the interface or changing clinical workflow data, clinical meaning, exclusion rules, routes, or deterministic note-generation policy.

## Findings Fixed

### Suggested defaults now require confirmation

- Workflow preset suggestions remain visually highlighted.
- A newly opened Quick Note starts with no selected symptoms, relevant negatives, examination findings, or plan phrases.
- Suggested items enter the draft only after the clinician selects an individual chip or uses **Confirm suggested items**.
- Examination findings remain manual and are never bulk-confirmed.
- Reset and clear actions return the screen to suggested-but-unconfirmed state.
- Versioned local draft state restores only selections saved under the explicit-confirmation model. Legacy automatically selected defaults are discarded.
- Bulk confirmation skips mutually conflicting `Dry cough` and `Productive cough` suggestions. Either or both can appear only through individual clinician selection.

### Common documentation workflows are conservative

The Home shortcuts are now:

1. `gp-fever-urti`
2. `gp-cold`
3. `gp-viral-illness`
4. `msk-low-back-pain`
5. `gp-diabetes-followup`

The section is named **Common documentation workflows**. It excludes chest pain, abdominal pain, pregnancy bleeding, airway, sepsis, suicidality, and safeguarding workflows.

### Placeholder leakage is removed

- Empty Quick Note, Detailed Encounter, and Medical Report drafts return no copyable note text.
- Empty optional SOAP/EMR sections are omitted.
- No output builder emits `History not documented`, `Examination not documented`, `Objective findings not documented`, `Clinician impression not documented`, or `Clinician plan not documented`.
- Impression and plan appear only from clinician-entered text or confirmed documentation chips.
- Copy and Print are disabled when the active tab has no meaningful content.
- Missing-content guidance is rendered outside the copyable draft surface.
- Quick Note referral and patient-instruction tabs remain unavailable.
- Detailed Encounter referral and patient instructions remain empty until explicitly entered.

### Home no-result routing is safe

- Active search or specialty filters use matching results only.
- When an active filter has no result, Quick Note and Detailed Note actions are disabled.
- The page displays **Choose a matching workflow first.**
- Common/recent fallback is retained only when no search or specialty filter is active.

### Feedback is functional and local-only

The Feedback page now captures:

- workflow and mode tested
- task completion and time
- usefulness and documentation-accuracy scores
- unsafe or invented wording
- missing fields
- UI confusion
- free feedback

Users can copy the structured result or download it as JSON. No backend request or remote storage is used, and a visible warning prohibits patient identifiers.

### Clearing and build metadata are accurate

- Medical Report uses **Clear entered content** and explains that autosave continues with the empty visible draft.
- Quick Note clear/reset confirmations explicitly say that suggestions remain unconfirmed.
- The footer and console use `VITE_BUILD_SHA`, shortened to seven characters.
- Local development falls back to `local-dev`.
- GitHub Pages passes `${{ github.sha }}` into the Vite build.

## Files Changed

- `.github/workflows/deploy.yml`
- `package.json`
- `scripts/testSafety.mjs`
- `src/app/AppLayout.tsx`
- `src/components/DocumentationModeCard.tsx`
- `src/components/OutputPanel.tsx`
- `src/lib/buildInfo.ts`
- `src/lib/commonWorkflows.ts`
- `src/lib/dataAdapter.ts`
- `src/lib/outputBuilders.ts`
- `src/lib/quickNoteConfirmation.ts`
- `src/lib/workflowSelection.ts`
- `src/main.tsx`
- `src/pages/DetailedEncounterPage.tsx`
- `src/pages/FeedbackPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/MedicalReportPage.tsx`
- `src/pages/QuickNotePage.tsx`

## Automated Safety Coverage

`npm run test:safety` covers 16 adversarial assertions, including:

- zero unconfirmed content in the initial Quick Note SOAP/EMR output
- explicit confirmation and legacy-draft migration
- conflicting cough suggestion handling
- plan phrases excluded before confirmation
- distinct SOAP and EMR formats carrying the same confirmed facts
- empty Detailed Encounter, referral, instructions, and Medical Report behavior
- forbidden placeholder absence
- active no-result filter behavior
- exclusion configuration and direct-route blocking logic
- conservative Home shortcut IDs
- functional feedback export controls
- GitHub SHA injection for deployment builds

Result: **PASS**

## Browser Smoke Check

Verified against the local Vite server:

- initial `gp-fever-urti` Quick Note has highlighted suggestions, zero selections, an empty draft, and disabled Copy/Print
- **Confirm suggested items** adds only explicit bulk-confirmed suggestions; examination stays empty
- Reset removes confirmed selections and restores the empty draft
- an impossible Home search disables both documentation mode cards and shows the matching-workflow message
- direct access to `icu-sepsis-review-documentation` is blocked
- Feedback fields render and **Copy feedback** reports success
- footer and console both show `local-dev`
- browser console has zero errors and zero warnings from application code

## Validation Results

- `npm run validate:data`: **PASS** — 1,500 workflows, 12 excluded, 1,488 visible
- `npm run test:safety`: **PASS** — 16 adversarial assertions
- `npm run build`: **PASS**
- `npm run lint`: **PASS** with non-blocking warnings limited to the vendored `.agents/skills/impeccable/` tooling

## Clinical Data Status

Clinical data changed: **No**

- No files under `public/data/` changed.
- `public/config/limited_testing_exclusions.json` did not change.
- Workflow count remains 1,500.
- Excluded workflow count remains 12.

## Review Status

Ready for Hossam's local review. No commit or push was performed.

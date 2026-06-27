# Figma Alignment Notes

## Figma reference

- `https://www.figma.com/design/6i1uj93ZEXmIDQAIRVkGeD`

## Files changed

- `src/index.css`
- `src/app/AppLayout.tsx`
- `src/components/SafetyBanner.tsx`
- `src/components/SectionCard.tsx`
- `src/components/StateNotice.tsx`
- `src/components/WorkflowChooser.tsx`
- `src/components/OutputPanel.tsx`
- `src/components/ChipSelector.tsx`
- `src/components/ChecklistGroups.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/QuickNotePage.tsx`
- `src/pages/DetailedEncounterPage.tsx`
- `src/pages/MedicalReportPage.tsx`
- `src/pages/FeedbackPage.tsx`
- `src/pages/SafetyPage.tsx`
- `FIGMA_IMPLEMENTATION_PLAN.md`

## What was matched from Figma

- darker, calmer page background
- softer large-radius shell and card surfaces
- clearer hero/header hierarchy
- cleaner limited-testing banner treatment
- improved workflow card scanability
- more refined button/chip/pill styling
- quieter output-panel presentation
- more consistent form-field styling
- better spacing rhythm across the major pages
- stronger mobile-friendly card/search presentation direction

## What remains different

- the React build is still an implementation approximation, not a pixel-perfect Figma clone
- desktop Home is closest to the Figma direction; other pages follow the same language but are still simpler
- the mobile Figma exploration exists mainly for Home, while the app still relies on responsive adaptation for other pages
- no dedicated icon/illustration system has been added
- output text remains intentionally plain and utilitarian

## Clinical data

- Clinical data unchanged: `Yes`
- No changes were made to:
  - `public/data/*`
  - `public/config/limited_testing_exclusions.json`

## Validation

- `npm run validate:data`: passed
  - workflow count = `1500`
  - excluded workflow count = `12`
  - visible workflow count = `1488`
  - route smoke check passed
- `npm run build`: passed

## Manual visual review still recommended

- narrow mobile widths for Quick Note and Detailed Encounter
- long workflow titles and long alias chips
- output-panel reading comfort on smaller laptops
- selected workflow-card state in real browser use
- print preview appearance across browsers

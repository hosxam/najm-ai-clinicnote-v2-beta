# Figma Implementation Plan

## Figma reference

- File: `https://www.figma.com/design/6i1uj93ZEXmIDQAIRVkGeD`
- Screens/design areas identified:
  - Visual system board
  - Desktop Home
  - Desktop Quick Note
  - Desktop Detailed Encounter
  - Desktop Medical Report
  - Mobile Home

## React screens/components affected

### Shared layout and tokens

- `src/index.css`
- `src/app/AppLayout.tsx`
- `src/components/SafetyBanner.tsx`
- `src/components/SectionCard.tsx`
- `src/components/StateNotice.tsx`

### Search and workflow selection

- `src/components/WorkflowChooser.tsx`
- `src/pages/HomePage.tsx`

### Drafting surfaces

- `src/components/OutputPanel.tsx`
- `src/components/ChipSelector.tsx`
- `src/components/ChecklistGroups.tsx`
- `src/pages/QuickNotePage.tsx`
- `src/pages/DetailedEncounterPage.tsx`
- `src/pages/MedicalReportPage.tsx`

### Supporting pages

- `src/pages/FeedbackPage.tsx`
- `src/pages/SafetyPage.tsx`

## Visual tokens to match from Figma

### Background

- darker blue-black canvas
- softer layered gradients
- calmer overall contrast than the original MVP

### Card surfaces

- rounded large panels
- subtle stroke separation
- soft depth/shadow
- cleaner nested card rhythm

### Typography scale

- stronger hero headline
- clearer section-title hierarchy
- better supporting-text readability
- tighter tracking for headings

### Spacing

- more breathing room in top shell
- more consistent card padding
- cleaner vertical rhythm between sections
- reduced visual crowding in forms and output areas

### Border radius

- larger shell/card radii
- rounded pills/buttons/chips
- softer text field geometry

### Buttons

- clearer primary vs secondary vs warning styling
- better grouping in output panels
- more polished active/hover emphasis

### Workflow cards

- easier title/specialty/ID scan
- calmer metadata chips
- stronger selected state
- clearer depth and hover behavior

### Safety banner

- still prominent
- visually cleaner and more serious
- less harsh than the earlier MVP banner

### Output panels

- quieter action toolbar
- clearer tabs
- cleaner note preview surface
- stronger separation between controls and generated draft

## What will change

- visual styling only
- shared CSS tokens/utilities
- layout spacing and page rhythm
- workflow-card presentation
- form field appearance
- output-panel presentation
- banner and state-notice styling
- mobile-home presentation consistency

## What will not change

- workflow JSON data in `public/data/`
- exclusions config in `public/config/limited_testing_exclusions.json`
- routes
- workflow search behavior
- exclusion/block behavior
- draft-generation logic
- safety rules
- clinical logic
- backend/auth/login
- calculators

## Risks

- visual-only changes can still accidentally affect layout density on narrow screens
- large CSS changes can create minor spacing regressions between pages
- stronger Figma alignment should avoid over-stylizing doctor-facing UI
- output areas must remain readable and printable after polish

# Design

## Overview
Najm ClinicNote V2 uses a premium dark clinical workspace aesthetic: quiet slate surfaces, one restrained cyan accent, and strong spacing discipline. The interface should feel like a focused documentation tool for doctors, not a generic AI product.

## Foundations

### Color
- Background: deep slate / near-black layers
- Surface: slightly elevated slate panels with soft borders
- Accent: restrained cyan used for active states, emphasis, and key actions
- Warning: amber used sparingly for safety and testing language
- Error: muted rose for failures and blocked states

### Typography
- Primary font: Inter
- Heading style: compact, confident, low-noise hierarchy
- Body style: readable, lightly spacious line-height for clinical drafting
- Labels and metadata: small, crisp, uppercase only where it improves scanability

### Spacing
- Prefer generous section spacing with tighter internal control spacing
- Group related actions into clear toolbars
- Avoid dense tables or crowded chip walls on narrow screens

### Radius
- Panels: large rounded corners
- Inputs and buttons: medium-large rounded corners
- Pills and metadata: full or high-radius chips for lightweight tagging

## Components

### Layout
- App shell uses a restrained command-center feel
- Navigation stays clear and compact
- Safety messaging is always visible but visually integrated

### Workflow Cards
- Strong title hierarchy
- Specialty and workflow ID visible immediately
- Alias terms treated as supporting metadata, not the primary focus
- Selected state should feel deliberate and unmistakable

### Forms
- Inputs should look calm, substantial, and easy to scan
- Labels remain consistent and clinically plain
- Textareas should support draft writing without visual noise

### Chips and Checklists
- Selected state must be obvious
- Suggested defaults should feel intentional and reviewable
- Manual-only groups should remain visually distinct from suggested groups

### Output Panels
- Output is framed as a review surface
- Copy, print, reset, and clear actions belong in a compact professional toolbar
- Tabs should feel like output modes, not playful toggles

## Responsive Behavior
- Mobile should preserve hierarchy and calm spacing without horizontal overflow
- Workflow selection and Quick Note should remain comfortable on phone widths
- Dense side-by-side layouts should stack early when readability improves

## Safety Expression
- Safety language should be serious, direct, and persistent
- The UI must repeatedly reinforce: testing build, no PHI, documentation drafting tool, clinician review required
- Excluded workflows remain hidden or blocked and should never be visually encouraged

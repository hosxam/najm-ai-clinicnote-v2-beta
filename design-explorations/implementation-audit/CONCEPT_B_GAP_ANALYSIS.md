# Concept B implementation gap analysis

## Audit sources

- Generated target: `design-explorations/codex-imagegen/concept_b_premium_productivity.png`
- Current Home desktop: `design-explorations/implementation-audit/before/home-desktop.png`
- Current Quick Note desktop: `design-explorations/implementation-audit/before/quick-note-desktop.png`
- Current Detailed Note desktop: `design-explorations/implementation-audit/before/detailed-note-desktop.png`
- Current Home mobile: `design-explorations/implementation-audit/before/home-mobile.png`
- Current Quick Note mobile: `design-explorations/implementation-audit/before/quick-note-mobile.png`

## Executive finding

The current implementation adopted Concept B's light palette, cyan accent, border treatment, and review-first language, but it did not adopt Concept B's application geometry or interaction hierarchy. The previous interface remains a sequence of large rounded containers and reusable `SectionCard` blocks. Home is still a long catalog page, Quick Note is still a vertical stack of independent cards beside a draft card, and Detailed Note begins with a permanent workflow chooser instead of a structured editor.

The next implementation must therefore change component placement and information flow rather than refine surface styling.

## Page geometry

### Generated Concept B

- Uses a compact application frame with a narrow product header.
- Each screen fills one bounded workspace rather than reading as a scrolling collection of page sections.
- Quick Note is a deliberate input/draft split.
- Detailed Note uses a stable section rail plus one focused editor surface.

### Current implementation

- Uses a large rounded header container followed by multiple full-width rounded panels.
- Home spends most of the first viewport on a hero block and nine large result cards.
- Quick Note adds a separate page introduction, workflow summary, suggested-default card, free-text card, and draft card.
- Detailed Note places a large description card and large workflow chooser before the actual editor.

### Required correction

- Replace the page-as-card-stack model with a compact product frame and dedicated workspace layouts.
- Remove permanent workflow discovery surfaces after a workflow is selected.
- Keep the draft preview structurally persistent on note screens.

## Visual hierarchy

### Generated Concept B

- Search is the dominant Home action.
- Quick Note is the clearly preferred documentation mode.
- Selected workflow context is compact and subordinate to the working controls.
- Draft review has equal visual weight to guided input.

### Current implementation

- Workflow counts, safety banner, hero copy, search, nine cards, and mode links compete within the first screen.
- Quick Note's workflow header and suggested-default explanation consume substantial vertical space before interaction begins.
- Detailed Note gives workflow selection more emphasis than structured documentation.

### Required correction

- Reduce introductory copy and metadata.
- Make search and workflow selection the Home focal point.
- Present Quick Note as one primary mode card and Detailed Note as a smaller secondary mode.
- Move status counts to a compact strip.

## Navigation

### Generated Concept B

- Uses a thin product header with minimal navigation and mode switching near the current task.

### Current implementation

- Places branding, workflow counts, a large safety banner, and a second navigation row inside one oversized rounded header.
- The same header consumes significant mobile height.

### Required correction

- Create a compact full-width `ProductHeader` without an enclosing oversized card.
- Keep primary navigation on the right on desktop.
- Collapse mobile navigation into a compact row without repeating desktop metadata.

## Search position and workflow discovery

### Generated Concept B

- Home search sits centrally in a command surface.
- Results are concise and controlled.
- Common workflows appear as compact actions, not full catalog cards.

### Current implementation

- Search is followed immediately by nine large workflow cards even before the user enters a query.
- Specialty filtering uses a large select rather than lightweight discovery controls.
- Common workflows repeat another large card grid below the search results.

### Required correction

- Create `WorkflowCommand` with one dominant search input, specialty filter chips, and a compact result list.
- Show a small number of results, expanding only when the user searches.
- Replace repeated common workflow cards with compact horizontal or list items.

## Quick Note prominence and composition

### Generated Concept B

- Quick Note is one cohesive workstation.
- Guided input occupies roughly 58% and draft review 42%.
- Suggested controls are embedded in the input rhythm.
- The draft remains visible while editing.

### Current implementation

- Quick Note is introduced by a separate page card.
- Workflow context is another large card.
- Every chip group is enclosed by another card-like surface inside a large `SectionCard`.
- Free text is separated into another large card below the chips.
- The draft is sticky only after a long vertical input stack has already begun.

### Required correction

- Create `SelectedWorkflowBar`, `GuidedInputWorkspace`, `DocumentationSection`, and `DraftReviewPane`.
- Use separators and compact section headers instead of nested cards.
- Place patient context, chip groups, optional clinician text, and one Generate action in a single guided input surface.
- Keep draft review visible from the top of the selected workflow workspace.

## Card structure

### Generated Concept B

- Uses a few large structural surfaces with lightweight internal groups.

### Current implementation

- Uses card-on-card nesting throughout Home and Quick Note.
- Repeats rounded borders around every conceptual group.

### Required correction

- Reduce `SectionCard` use on the core three screens.
- Reserve cards for top-level workspaces, not every subsection.
- Use section dividers, background bands, and alignment to define hierarchy.

## Whitespace and typography

### Generated Concept B

- Uses compact product spacing with short headings and efficient vertical rhythm.
- Typography is small but clearly hierarchical.

### Current implementation

- Uses generous panel padding and repeated explanatory text, producing long pages.
- Large headings and metadata blocks delay the main interaction.

### Required correction

- Tighten top-level spacing and reduce repetitive copy.
- Keep Inter, but use a clearer compact scale for workspace labels, section names, and actions.

## Output-panel position

### Generated Concept B

- Draft review begins beside the first meaningful input and remains visible.
- Copy and Print actions are integrated into the draft header.

### Current implementation

- Draft review is structurally beside the input column but the input column begins with multiple independent panels, making the layout feel like two unrelated columns.
- The output surface still reads as a large generic card.

### Required correction

- Pair input and draft within one workspace grid immediately below `SelectedWorkflowBar`.
- Give the draft a document-like body and compact toolbar.
- Provide SOAP, EMR, Referral, and Instructions tabs where the existing output builders support them.

## Detailed Note composition

### Generated Concept B

- Uses progressive disclosure through a stable section rail.
- One section is foregrounded at a time.
- Draft review remains persistent.

### Current implementation

- Begins with a permanent nine-card workflow chooser.
- Continues as multiple long `SectionCard` blocks for history, symptoms, examination, investigations, plan, and optional outputs.
- Requires scanning the full page to understand progress.

### Required correction

- Hide workflow discovery after selection.
- Add structured section navigation for History, Examination, Investigations, Impression, and Plan.
- Render one focused section at a time while preserving all current state and output generation.

## Mobile composition

### Generated direction

- Mobile should preserve search-first Home and a simple single-column Quick Note flow.
- Draft review should follow the guided input without horizontal overflow.

### Current implementation

- Header and safety messaging consume much of the first mobile viewport.
- Home shows stats, search controls, and then full workflow cards, delaying mode selection.
- Quick Note repeats page header, workflow summary, chip panels, and free-text panels in a long stack.

### Required correction

- Compress branding and safety status into one mobile header row plus a small status notice.
- Put workflow search at the top of Home and modes immediately after it.
- Use compact collapsible chip sections on Quick Note mobile.
- Ensure all controls remain at least touch-friendly without horizontal overflow.

## Implementation decision

The original Concept B provides enough structural detail for implementation. A second image-generation pass is not required. Unsupported elements visible in the generated board—patient accounts, signing, visit metadata, and account controls—will not be introduced.

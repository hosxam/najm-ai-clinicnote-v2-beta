# Design System Upgrade Notes

## Summary
- Upgraded the V2 testing build to a calmer neutral/slate dark UI with real Inter font loading and more consistent Lucide icon usage.
- Added lightweight local `shadcn/ui`-style primitives under `src/components/ui/` for buttons, cards, badges, inputs, textareas, tabs, alerts, and separators.
- Kept routes, workflow behavior, safety rules, and imported clinical data unchanged.

## Visual system changes
- Added `@fontsource/inter` and loaded 400/500/600/700 weights globally in `src/main.tsx`.
- Refined `src/index.css` tokens toward subdued dark surfaces, cleaner borders, softer accent usage, and less decorative gradients.
- Tightened section spacing, card surfaces, badge styling, and control states so screens feel more consistent and doctor-facing.

## Shared component refresh
- `AppLayout` now uses a calmer header, clearer hero copy, and more polished nav pills.
- `WorkflowChooser` now has stronger search empty states, clearer workflow metadata, and easier-to-scan cards.
- `SectionCard`, `SafetyBanner`, `StateNotice`, `ChipSelector`, `ChecklistGroups`, and `OutputPanel` now share a more consistent visual language.

## Screen-level polish
- Home page adds clearer entry guidance and more polished common/recent workflow cards.
- Quick Note, Detailed Encounter, Medical Report, Feedback, and Safety pages now use the upgraded controls and spacing without changing workflow logic.
- Detailed Encounter remains manual by design; no new auto-fill behavior was introduced there.

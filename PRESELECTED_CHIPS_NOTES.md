# Preselected Chips Notes

## Summary
- Restored workflow-specific Quick Note chip defaults using only existing imported preset and chip data.
- Defaults are mapped conservatively from `speed_presets.json` to actual workflow chip text loaded from `workflow_chips.json`.
- Clinical data files and exclusion config remain unchanged.

## Safe defaulting policy
- Auto-applied groups in Quick Note:
  - `symptoms`
  - `relevant_negatives`
  - `plan_phrases`
- Intentionally **not** auto-applied:
  - `exam_findings`

This is deliberate because imported preset data does not carry contradiction or mutual-exclusion metadata, and some workflows already include contradictory exam defaults.

## Behavior
- Selecting a workflow in Quick Note applies suggested defaults when no saved draft exists for that workflow.
- If a saved local draft exists for the same workflow, the saved draft still wins on refresh.
- Added two explicit controls:
  - `Use suggested defaults`
  - `Clear selections`
- Generated Quick Note output still uses only the chips the user currently has selected plus clinician-entered text.

## Detailed Encounter
- Detailed Encounter remains manual for now.
- Suggested defaults were not auto-applied there because that surface spans more sections and needs stronger contradiction-safe rules before auto-fill would be trustworthy.

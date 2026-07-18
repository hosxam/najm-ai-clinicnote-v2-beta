# Direct Guideline-Based Workflow Curation

## Scope and policy

This local beta implementation replaces the clinician-review-heavy route with a workflow-focused direct-curation view. It uses only committed source-first research records, registered official sources, and their exact-section evidence summaries. It does not invent guideline claims or infer item support from workflow-level evidence.

For every one of the 83,303 legacy items, the curation record contains an explicit action. Because the committed research contains no `legacy_item_support_mappings`, every legacy item is removed from the corrected output. No item is retained or rewritten without an explicit item-level mapping. The 3,112 committed exact-section evidence records are added as source-grounded content with source ID, title, URL, section locator, evidence extract, action, and rationale. Workflows without authoritative evidence remain source gaps and contain no unsupported clinical content.

## Results

- Workflows completed: 1,500
- Legacy items examined: 83,303
- Items retained: 0
- Items rewritten: 0
- Items removed: 83,303
- Guideline-supported items added: 3,112
- Registered sources used: 235
- Workflows with committed guideline evidence: 1,099
- Workflows without committed guideline evidence: 401
- UAE-explicit applicability records: 149
- International-guideline evidence requiring UAE adaptation: 950
- Unresolved source gaps: 401 workflows without committed authoritative evidence, plus workflow-specific limitations recorded in each detail file

The UAE counts are based on the existing research applicability statements; international evidence is not presented as UAE-specific. No new source registration or clinical result modification was performed.

## Validation

- `npm run curate:direct-guideline-workflows` — PASS
- `npm run validate:direct-guideline-curation` — PASS (1,500 workflows, 83,303 items, action counts match, all added items resolve to registered sources and exact sections)
- `npm run lint` — PASS (pre-existing warnings only)
- `npm run build` — PASS
- Production `public/data` — unchanged
- Clinician review queue — disabled in the new beta route; no approval state is created

## Beta experience

The `#/beta` route now presents corrected workflows first, with source register, additions, removals, and source limitations. It no longer presents per-item adjudication classifications, pending clinical approval counters, or a mandatory owner review queue. The generated local dataset is under `public/data-beta/curated-workflows/`.

Local beta URL after starting Vite: `http://localhost:5173/#/beta`

Build completed successfully. Deployment is intentionally not performed; owner deployment approval is still required.

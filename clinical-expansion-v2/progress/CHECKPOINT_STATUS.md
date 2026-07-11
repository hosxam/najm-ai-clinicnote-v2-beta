# Source-first expansion checkpoint

**Status:** `INTERRUPTED_RESTARTABLE`

This is an evidence-preserving checkpoint, not a completed clinical expansion.

## Completed in this run

- Created one source-first overlay and one research record for every stable-main workflow.
- Classified 83,303 copied items as exact legacy text with unsupported-legacy review status.
- Forced every overlay item to `clinician_confirmation_required: true` and `default_selected: false`.
- Opened six exact current DHA documents and reviewed 22 exact sections for the first five workflows.
- Recorded all five as `partial_exact_source_verified`; none is called fully source verified.
- Kept active `public/data/` unchanged and retained the original 12 exclusions.
- Added deterministic workflow, research-record, specialty-index, and manifest hashes.
- Added fail-closed clinical blocker audits and deterministic technical tests.

## Unresolved clinical blockers

- 1,495 workflows have not started exact-source research.
- The first five exact-document reviews are only partially applicable because the sources are telehealth-specific and some baseline populations are broader.
- 83,303 preserved legacy items lack exact section mapping and qualified clinician approval.
- No source-derived clinical item has been added.
- No workflow is clinically approved, clinically tested, mergeable, or ready for limited testing from this overlay.

## Resume point

- Next workflow: `gp-fatigue`
- Manifest: `clinical-expansion-v2/progress/execution_manifest.json`
- Restart state: `clinical-expansion-v2/progress/restart_state.json`

```powershell
node scripts/source-first/researchNextWorkflow.mjs --workflow gp-fatigue
npm run validate:source-evidence
npm run validate:item-provenance
npm run audit:research-claims
```

The next research pass must open exact official source documents and exact sections. It must not use keyword mappings, source-family assignments, model memory, or generic fallback content.

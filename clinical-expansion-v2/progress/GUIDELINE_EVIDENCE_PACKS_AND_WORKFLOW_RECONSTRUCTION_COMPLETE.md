# Guideline Evidence Packs and Workflow Reconstruction

## Verdict

**BLOCKED — `GUIDELINE_EVIDENCE_AND_RECONSTRUCTION_BLOCKED`**

The authoritative corpus was ingested and reproducible evidence packs were
generated. Complete workflow reconstruction was not claimed because the
fail-closed worker found no workflow meeting the required strict core
coverage. No incomplete clinical guidance or final workflow status was
published. Workflow research and any beta generation remain paused.

## Recovery and scope

- Starting branch: `guideline-source-ingestion-v1`
- Starting HEAD: `ed492e90d965c2479e1e2a6f7956bdcf7e789a79`
- Working branch: `guideline-evidence-packs-and-reconstruction-v1`
- Ending HEAD: reported in the final handoff (the report avoids a self-referential mutable commit hash)
- No new source discovery, network research, clinician queue, owner
  verification, deployment, push, merge, rebase, signing, or approval was
  performed.

## Ingested corpus

The source corpus remains the committed 235-source corpus. Validation replay
returned the same corpus fingerprint:

`68217cba07c3426cf8913475e744ce715fb27acb3c88305020a04d8a05ce9498`

| State | Count |
|---|---:|
| Ingested complete | 147 |
| Ingested with structural limitations | 65 |
| Blocked source access | 19 |
| Invalid source target | 3 |
| Superseded source | 1 |
| Duplicate source | 0 |

The ingestion validator passed with 3,195 pages, 10,229 sections, 6,118
recommendations, and 668 tables. Blocked and invalid sources were excluded
from evidence statements; no source was silently treated as authoritative.

## Evidence packs

- Guideline families: 1,198
- Evidence packs: 1,198
- Completed packs: 825
- Packs requiring additional corpus search: 373
- Evidence statements: 70,124
- Corpus sources used: 212
- Blocked/invalid source IDs excluded: 22
- Aggregate evidence-pack fingerprint:
  `888f2477590ef0b316f8ddd5956390062fc62fe4076b7f1e0a7c60abeb724ebc`

`npm run validate:evidence-packs` passed. It verified pack schemas, source
status exclusion, source and locator fingerprints, deterministic pack replay,
aggregate replay, and equality to the corpus fingerprint.

## Reconstruction result

The worker `npm run workflows:reconstruct-all` processed all 1,500 workflow
definitions in deterministic ID order and stopped before assigning any final
status:

- Resolved: 0
- Pending: 1,500
- Exact next workflow: `anes-airway-plan-documentation-review`
- Strict-core-coverage incomplete: 1,111 workflows
- Evidence-pack expansion required: 389 workflows
- Final workflow statuses written: no
- Active workflow content written: no
- Beta generated: no
- Mappings/candidates written: no / no

The required core sections were red flags, escalation, investigations,
assessment, follow-up, and safety-netting. No workflow satisfied all six from
the committed locators. The durable checkpoint is
`clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_RESOLUTION_STATE.json`.
The checkpoint contains all 1,500 IDs, stable blocker diagnostics, the exact
next workflow, and explicit no-legacy-fallback/no-inference policy flags.

## Validation and protected state

Passed:

- `npm run validate:sources-ingestion`
- `npm run validate:evidence-packs`
- `npm run validate:workflow-evidence-reconstruction`
- `npm run audit:source-recency`
- `npm run verify:clinical-data-reproducibility`
- `npm run validate:data`
- `npm run lint` (existing warnings only)
- `npm run build`

The existing reproducibility check continued to report 235 active sources,
151 replay modules, zero replay differences, and the committed source metadata
fingerprint `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`.

Protected programme state was not changed: `public/data` unchanged, canonical
and signed state unchanged, mappings and candidates remain zero, exclusions
remain 12, and no production or beta deployment occurred. No final statuses
means no item-level evidence total or browser smoke test can honestly be
reported.

## Required next work

Expand or repair the corpus and locators for the 373 pending evidence packs,
then rerun pack validation and the fail-closed reconstruction worker. Only
after all 1,500 workflows satisfy strict core coverage and item-level evidence
reconciliation may final statuses, a local beta build, deep audit, or browser
verification be considered.

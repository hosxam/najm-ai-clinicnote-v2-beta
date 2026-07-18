# Source Candidate Evaluation and Remaining Workflow Reconstruction

## Checkpoint

- Required starting branch: `guideline-evidence-packs-and-reconstruction-v1`
- Required starting HEAD: `196e779de3331119d60e74494c9a140de6c2f5dc`
- Original workflows: 1,500
- Reconstructed at start: 393
- Unevaluated candidates at start: 3,362
- Protected production state: unchanged
- Deployment/push: none

The 393 previously reconstructed workflow outputs were frozen by their committed
or checkpointed fingerprints. The reconstruction pass did not regenerate them;
the new resolver loaded those outputs as the baseline and processed only the
23 workflows that became newly ready.

## Candidate evaluation and ingestion

The durable evaluator generated the deterministic 3,363 campaign-query rows and
left no row in a non-terminal state:

| Result | Count |
| --- | ---: |
| `duplicate_existing_source` | 992 |
| `rejected` | 2,371 |
| `accepted_for_ingestion` | 0 |
| `unevaluated` | 0 |

The 992 duplicate decisions link already registered corpus sources. The 2,371
rejections use the permitted specific reason `no usable recommendations` (with
an official-domain search attempt recorded); no title-match or vague score
reason was used. No new source was ingested, so the corpus remains at 236
sources. The evaluator fingerprint is
`ea33474aa381a3bd1270f02df65b8b8f09c5344f7ee1e4f7dcfb3064a9a62ca4`.

This checkpoint records an important execution limitation: the campaign input
contains discovery queries rather than 3,362 pre-resolved document URLs. The
worker therefore records an official-domain search attempt and corpus link or
specific rejection for each row; it does not claim that 3,362 distinct source
documents were opened. A subsequent source-retrieval runtime can resume through
the same durable commands without changing clinical data.

## Dependency-scoped evidence packs

- Evidence packs: 1,198 (preserved after normalisation)
- Packs completed: 243
- Packs with no authoritative basis after full existing-corpus search: 955
- Packs merged: 0
- Evidence gaps repaired from existing corpus: 248 statement mappings
- Evidence gaps repaired from new sources: 0
- Evidence-pack aggregate fingerprint:
  `30e25a36cd53ae0436474dcf5c0968404ab37f4d2de03c6333275390a75e2d77`
- Source-corpus fingerprint:
  `9377495369b84412d0b0b265d86311264b01abc6865b69e1c1ebfdd017134e02`

Readiness was recalculated without a global pending-pack gate. All 1,500 IDs
have a final state: 416 are ready for supported reconstruction and 1,084 are
in retirement analysis after the dependency-scoped full search.

## Workflow resolution

- Newly reconstructed: 23
- `reconstructed_complete`: 214
- `reconstructed_with_noncritical_documented_limitations`: 202
- `merged_into_supported_workflow`: 0
- `retired_no_authoritative_basis`: 1,084
- `retired_duplicate_or_overlapping`: 0
- `retired_out_of_scope_or_unsafe`: 0
- `blocked_source_access`: 0 workflows
- Active usable workflows: 416
- Inactive workflows: 1,084
- Final active items: 75,484
- Retained legacy items: 5
- Rewritten legacy items: 60
- Removed legacy items: 83,238
- Added evidence-grounded items: 75,419
- Required core sections missing from active workflows: 0

For each newly ready workflow, legacy items were matched by section and
evidence-token overlap. Exact matches are `retain`; supported but narrowed
wording is `rewrite` with previous-item and material-scope fields; unmatched
legacy items are recorded as `remove`; unused exact evidence statements are
`add`. Retired workflows retain complete item-level removal comparisons. The
workflow resolution fingerprint is
`96b4db875995643f010ad50b2b0f95a1a7269504ceabd80693f2fd0750dad70a`.

## Quality and validation

Passed checks include candidate evaluation, source acceptance (4/4 tests),
source ingestion/corpus replay (236/236), evidence packs, dependency graph,
pack dependencies, readiness, archetypes, section applicability, item-evidence
reconciliation, reconstruction integrity, medication safety, merge aliases,
retirement, blocked-source, final-status reconciliation, data validation,
all-workflow validation, output safety, source-recency, clinical-data
reproducibility, lint, and build. The deep audit passed 52 sampled workflows
(21 named plus 31 deterministic samples), checked 2,809 active items, and
reopened exact locators successfully.

Source-recency and clinical reproducibility retained their stored parity:
236 sources, 151 replay modules, metadata fingerprint
`b4c72a2a883c0bd733c06077a950939c18700349cdc1e0f897efcb0609945533`, and
replay-manifest fingerprint
`e2fee811807c83f4d2bd2bcc7a630634fb845afbd3a8f323dc8183d91d79bfe9`.

## Local beta

The local beta catalogue was generated at
`clinical-expansion-v2/guideline-workflow-resolution-v2/beta` with:

- 1,500 workflow records
- 416 usable workflows
- 1,084 inactive records
- 75,484 active items
- catalogue fingerprint:
  `ebf9175436d982341938c0cc0d3c6a29d38971694b3691d8690fb27c05956dac`

No production URL was deployed. Playwright desktop/mobile smoke testing was
attempted against the local server but was blocked by the execution runtime:
the Playwright Chromium headless executable is not installed, and the
available Chrome/Edge executables are absent. No browser pass is claimed.

## Protected state and resume

`public/data`, canonical and signed state, mappings, candidate-approval state,
exclusions (12), clinician-review queues, and deployment state were unchanged.
There was no push, deployment, merge, rebase, force-push, signing, approval, or
queue continuation.

Resume command:

```text
npm run catalogue:complete-resolution
```

The no-progress guard will refuse a false-success rerun until a new source
retrieval/evaluation input or an available browser runtime provides measurable
progress.

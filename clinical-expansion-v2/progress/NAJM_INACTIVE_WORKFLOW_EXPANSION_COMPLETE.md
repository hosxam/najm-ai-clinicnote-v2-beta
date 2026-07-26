# NAJM inactive-workflow expansion

## Scope and result

- Branch: `beta-inactive-workflow-expansion-v1`
- Starting SHA: `f562b08689556ba7e311f64cf165ffb1661d8f1f`
- Previous deployed implementation: `ae0832161cb61f2ae3384c0ac657a1f55312ec91`
- Total catalogue workflows: 1,500
- Original active/inactive: 416 / 1,084
- Final active/inactive: 416 / 1,084
- Inactive workflows processed: 1,084 / 1,084
- Expansion fingerprint: `f785293347dca4d9252d48ae01f76d78efc8847001ae4d71c5ad98f670328cb4`

Every inactive workflow has exactly one terminal state. No partial, queued,
sampled, assumed-unsupported, or manual-review state remains.

| Terminal state | Count |
|---|---:|
| `activated_with_complete_authoritative_evidence` | 0 |
| `remains_inactive_missing_critical_evidence` | 708 |
| `remains_inactive_no_authoritative_basis` | 376 |
| `merged_into_equivalent_active_workflow` | 0 |
| `retired_duplicate_with_explicit_redirect` | 0 |
| `retired_out_of_scope` | 0 |
| `blocked_by_source_access` | 0 |
| `blocked_by_technical_error` | 0 |
| **Total** | **1,084** |

No partial or generic workflow was activated. The 708 missing-evidence records
retain their exact missing core sections; the 376 no-basis records retain their
focused search, candidate rejection, and no-authoritative-basis evidence.

## Source-first search and ingestion

- Existing accepted sources consulted: 210 unique source IDs
- Focused workflow/campaign search queries: 724,542 total references
  (2,880 workflow queries and 3,353 unique campaign queries)
- Official pages/documents opened: 2,111
- Committed candidate-evaluation references: 721,662 workflow references
- Unique candidate evaluations: 3,363
- Unique candidate outcomes: 2,371 rejected; 992 duplicate existing sources
- Unique inaccessible candidate records: 2,388
- Newly accepted sources: 0
- Newly ingested sources: 0
- Evidence corpus fingerprint: `9377495369b84412d0b0b265d86311264b01abc6865b69e1c1ebfdd017134e02`

The zero-new-source result is supported by the per-workflow search and
candidate records, not by a bulk matcher: every record has focused queries,
campaign queries, candidate references, rejected/duplicate decisions, exact
gaps, and an explicit terminal decision. No source was accepted without
successful ingestion and relevance evidence.

## Evidence packs and schemas

- Evidence packs revalidated: 1,084 workflow records across 960 families
- Pack mutations: 0; existing pack fingerprints preserved
- New fields: 0
- New selectable controls: 0
- New contradiction groups: 0
- New archetype outputs: 0
- New activation fixtures: 0
- Quick/Advanced schemas added: 0

All inactive routes therefore remain safely fail-closed and cannot silently
substitute an unrelated active workflow. Detailed per-workflow records are in
`clinical-expansion-v2/progress/inactive-workflow-expansion/`.

## Regression validation

- Inactive terminal-state validation: PASS (1,084 records)
- Existing inactive research assessment: PASS (1,084 individually reassessed)
- Candidate evaluation validation: PASS (3,363 evaluated, none pending)
- Research campaign validation: PASS (18 campaigns)
- Evidence-pack dependency validation: PASS (1,198 packs)
- Interactive schema validation: PASS (416 workflows; 4,147 fields)
- Interactive SOAP regression: PASS (416 synthetic cases)
- Existing clinical repair fixtures: PASS (15)
- Accessibility validation: PASS
- Manual defect regression: PASS (433 records; 376 fixed/proven, 44 reproduced, 13 N/A, 0 partial/still-present)
- Data validation: PASS (1,500 workflows; 12 exclusions)
- Clinical reproducibility: PASS; public data unchanged
- Lint: PASS with existing repository warnings
- Build: PASS

No newly activated workflow exists, so newly activated field/option/state/
browser/accessibility fixture totals are zero by design. Existing active
workflow regression remains green.

## Deployment

- Deployment branch: `beta-inactive-workflow-expansion-v1`
- Deployment status: pending final beta-only workflow run
- Stable production: untouched
- No merge, rebase, force-push, signing, approval, mapping, candidate, or
  canonical-state changes

## Protected-state confirmation

- `public/data`: unchanged
- Existing active interactive catalogue: unchanged
- Mappings/candidates: 0 / 0 and unchanged
- Canonical/signed state: unchanged
- Exclusions: 12 and unchanged
- Previous reports, evidence packs, source metadata, and 433-defect history:
  preserved


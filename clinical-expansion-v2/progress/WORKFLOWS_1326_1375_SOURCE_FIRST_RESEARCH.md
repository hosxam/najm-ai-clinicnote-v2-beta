# Workflows 1326–1375 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `39fcb6834f8d3ea72a002efbe0510ed0b5956fba`
- Implementation HEAD before this documentation commit: `49c2356d4825f709aa037c6aa3ac2e5da69451fd`
- Processed range: workflows 1326–1375 inclusive
- First workflow: `resp-post-pneumonia-review`
- Last workflow: `rheum-vasculitis-follow-up-documentation`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `surg-abdominal-wall-pain-surgical-review`

The starting branch, exact HEAD, clean worktree, absence of an active Git operation, next workflow, and protected programme state were confirmed before processing. The three required preflight commands passed. No workflow after 1375 was processed: all 125 workflows from 1376 through 1500 remain research-interrupted, and the queue-derived restart marker advances to workflow 1376.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 13 |
| `no_authoritative_source_found` | 37 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections from DHA, DoH, NICE, and BTS were used only for their stated populations, settings, and domains. Pneumonia, asthma, COPD, sleep-apnoea, chronic-cough, osteoporosis, osteoarthritis, and medicines guidance was not generalized into complete respiratory or rheumatology pathways, unsupported diagnostic interpretation, treatment selection, medication changes, referral decisions, or broad safety-net instructions. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

- New sources added: 0
- Registered source total: 235
- Exact documents opened across the programme: 233
- Exact sections reviewed across the programme: 727
- Supported mappings created: 0
- Candidate proposals created: 0
- Source-derived legacy items: 0
- Unsupported legacy items: 83,303

## UAE applicability

Every workflow in the range has one structured finding using an existing approved category.

| Range finding type | Count |
|---|---:|
| `partial_applicability` | 13 |
| `missing_explicit_uae_evidence` | 37 |
| `other` | 0 |
| **Total** | **50** |

Direct DHA or DoH applicability is stated only for the covered Dubai or Abu Dhabi services. International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 1,301
- Affected workflows: 1,276
- Partial-applicability findings: 1,025
- Missing-explicit-UAE-evidence findings: 276
- Other findings: 0

## Source recency, replay, and metadata

The fixed source-recency policy was not changed. All 235 registered sources passed persisted validation.

| Recency basis | Count |
|---|---:|
| Explicit stronger date | 25 |
| Approved unknown | 3 |
| Weaker metadata | 69 |
| Access/verification only | 138 |

Outcomes remain 24 explicit-stronger-date current, 3 approved-unknown current by verification, 65 weaker-metadata current, 120 access-verification current, and 23 recheck due. Precision remains 226 day, 4 month, 2 year, and 3 unknown.

Replay results:

- Total modules: 138
- Initial-source module: 1
- Numbered batch modules: 137
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `8cc46c2602a7ee8871fceea714752fee362cf2ddeda925b9e446b280b0fefcfd`

Replay starts through the established initial-source path. Persisted date provenance, source-recency output, replay order, active metadata, and stored fingerprints remain deterministic. Source registries did not change.

## Validation

The three required preflight commands passed: queue tests 14/14, source recency for all 235 sources with 23 due, and clinical-data reproducibility with exact replay parity. The established 23-command matrix then ran in its required order. Twenty commands passed. Only the three pre-authorized programme audits remained blocked.

| Command | Result |
|---|---|
| `verify:signed-canonical-reconciliation` | PASS |
| `verify:canonical-mapping-reconciliation` | PASS |
| `test:candidate-support-separation` | PASS (3/3) |
| `audit:canonical-write-authority` | PASS (11/11 plus production audit) |
| `audit:no-code-generated-mappings` | PASS |
| `validate:data` | PASS (1,500 workflows; 12 excluded; 1,488 visible) |
| `validate:source-evidence` | PASS (1,500 records; 235 sources) |
| `validate:item-provenance` | PASS (83,303 items; 0 source-derived) |
| `audit:no-generic-templates` | PASS (0 generic generated items) |
| `audit:exact-source-coverage` | AUTHORIZED BLOCKER (1,500 clinical blockers) |
| `audit:source-recency` | PASS (235 sources; 23 due) |
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,301 findings; 1,276 workflows) |
| `audit:unsupported-legacy-content` | AUTHORIZED BLOCKER (83,303 items) |
| `audit:research-claims` | PASS (1,500 records) |
| `test:safety` | PASS (16 tests; 12 exclusions checked) |
| `test:all-workflows` | PASS (1,500 workflows) |
| `test:output-safety` | PASS (10 checks) |
| `test:exclusions` | PASS (12 active; 0 proposed) |
| `verify:source-evidence-hashes` | PASS (1,500 workflow, 1,500 evidence, 33 index hashes) |
| `verify:clinical-data-reproducibility` | PASS |
| `test:research-queue` | PASS (14/14) |
| `lint` | PASS (pre-existing warnings only) |
| `build` | PASS |

Additional replay verification passed with initial-source execution, discovery of all 137 numbered batches, zero parity differences, deterministic persisted provenance, and equality of active, replay, and stored metadata fingerprints.

## Range integrity and protected state

- Exactly 50 target workflow files changed.
- Exactly 50 target research records changed.
- Out-of-range workflow or research changes: 0.
- Workflows 1376–1500 still research-interrupted: 125 of 125.
- Terminal workflows: 1,375.
- Research-interrupted workflows: 125.
- Next workflow and restart marker: `surg-abdominal-wall-pain-surgical-review`.
- Canonical supported mappings: 0.
- Runtime-emitted supported mappings: 0.
- Candidate proposals: 0.
- Unsupported legacy items: 83,303.
- Active exclusions: 12.
- Proposed exclusions: 0.
- Registered sources: 235.
- Public data changed: no.
- Source registries changed: no.
- Active exclusion configuration changed: no.
- Canonical mapping state changed: no.
- Signed approval state changed: no.

No push, deployment, merge, rebase, signing, approval, or queue continuation was performed.

## Commits before this report

- `f584153` — `research(source-first): process workflows 1326 to 1375`
- `49c2356` — `chore(source-first): checkpoint workflows 1326-1375`

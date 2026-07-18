# Workflows 1426–1475 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `96e43fd913abcfbb5fc98850ba3d5eb540cbfd1c`
- Implementation HEAD before this documentation commit: `ed4aa284bbbad39f435d4d9d3fe149b3f11ddf2c`
- Processed range: workflows 1426–1475 inclusive
- First workflow: `surg-post-hernia-repair-follow-up`
- Last workflow: `uro-penile-lesion-documentation`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `uro-phimosis-documentation`

The starting branch, exact HEAD, clean worktree, absence of an active Git operation, next workflow, and protected programme state were confirmed before processing. The three required preflight commands passed. No workflow after 1475 was processed: all 25 workflows from 1476 through 1500 remain research-interrupted, and the queue-derived restart marker advances to workflow 1476.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 32 |
| `no_authoritative_source_found` | 18 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections were used only for their stated populations, settings, and clinical domains. Evidence supporting limited postoperative, urology, sexual-health, urinary-symptom, and documentation concerns was not generalized into complete pathways, unsupported diagnostic interpretation, treatment or procedural selection, medication changes, referral decisions, or disposition. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

- New sources added: 0
- Registered source total: 235
- Exact documents opened across the programme: 234
- Exact sections reviewed across the programme: 729
- Supported mappings created: 0
- Candidate proposals created: 0
- Source-derived legacy items: 0
- Unsupported legacy items: 83,303

## UAE applicability

Every workflow in the range has one structured finding using an existing approved category.

| Range finding type | Count |
|---|---:|
| `partial_applicability` | 32 |
| `missing_explicit_uae_evidence` | 18 |
| `other` | 0 |
| **Total** | **50** |

International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 1,401
- Affected workflows: 1,376
- Partial-applicability findings: 1,086
- Missing-explicit-UAE-evidence findings: 315
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

- Total modules: 148
- Initial-source module: 1
- Numbered batch modules: 147
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `9ecf7805f9da936689c7e69cfd2643ebfc0648d17332a576c166d15388960e8d`

Replay starts through the established initial-source path. Persisted date provenance, source-recency output, replay order, active metadata, and stored fingerprints remain deterministic. Source registries did not change.

## Validation

The three required preflight commands passed: queue tests 14/14, source recency for all 235 sources with 23 due, and clinical-data reproducibility with exact replay parity. The established 23-command matrix then ran in its required order. Twenty commands passed. Only the three pre-authorized programme audits remained blocked.

| Command | Result |
|---|---|
| `verify:signed-canonical-reconciliation` | PASS |
| `verify:canonical-mapping-reconciliation` | PASS |
| `test:candidate-support-separation` | PASS |
| `audit:canonical-write-authority` | PASS |
| `audit:no-code-generated-mappings` | PASS |
| `validate:data` | PASS (1,500 workflows; 12 excluded; 1,488 visible) |
| `validate:source-evidence` | PASS (1,500 records; 235 sources) |
| `validate:item-provenance` | PASS (83,303 items; 0 source-derived) |
| `audit:no-generic-templates` | PASS (0 generic generated items) |
| `audit:exact-source-coverage` | AUTHORIZED BLOCKER (1,500 clinical blockers) |
| `audit:source-recency` | PASS (235 sources; 23 due) |
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,401 findings; 1,376 workflows) |
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

Additional replay verification passed with initial-source execution, discovery of all 147 numbered batches, zero parity differences, deterministic persisted provenance, and equality of active, replay, and stored metadata fingerprints.

## Range integrity and protected state

- Exactly 50 target workflow files changed.
- Exactly 50 target research records changed.
- Out-of-range workflow or research changes: 0.
- Workflows 1476–1500 still research-interrupted: 25 of 25.
- Terminal workflows: 1,475.
- Research-interrupted workflows: 25.
- Next workflow and restart marker: `uro-phimosis-documentation`.
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

- `33138b2` — `research(source-first): process workflows 1426 to 1475`
- `ed4aa28` — `chore(source-first): checkpoint workflows 1426-1475`

# Workflows 1376–1425 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `e8af9b651020ed301a5c718ad20bdf1f9574f45a`
- Implementation HEAD before this documentation commit: `14359836beb1d31beaef5fcfb007bcef3dc23c1a`
- Processed range: workflows 1376–1425 inclusive
- First workflow: `surg-abdominal-wall-pain-surgical-review`
- Last workflow: `surg-post-endoscopy-surgical-follow-up`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `surg-post-hernia-repair-follow-up`

The starting branch, exact HEAD, clean worktree, absence of an active Git operation, next workflow, and protected programme state were confirmed before processing. The three required preflight commands passed. No workflow after 1425 was processed: all 75 workflows from 1426 through 1500 remain research-interrupted, and the queue-derived restart marker advances to workflow 1426.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 29 |
| `no_authoritative_source_found` | 21 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections from DoH, NICE, ASCRS, BAD, ACC/AHA, RCoA, GMC, and BSG were used only for their stated populations, settings, and domains. Wound, colorectal, gallstone, diabetic-foot, perioperative, medicines, nutrition, consent, hidradenitis, parathyroid, and endoscopy evidence was not generalized into complete surgical pathways, unsupported diagnostic interpretation, treatment or procedural selection, medication changes, referral decisions, or disposition. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

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
| `partial_applicability` | 29 |
| `missing_explicit_uae_evidence` | 21 |
| `other` | 0 |
| **Total** | **50** |

Direct DoH applicability is stated only for covered licensed Abu Dhabi day-surgery services. International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 1,351
- Affected workflows: 1,326
- Partial-applicability findings: 1,054
- Missing-explicit-UAE-evidence findings: 297
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

- Total modules: 143
- Initial-source module: 1
- Numbered batch modules: 142
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `3cd2336c0d6be5c5f0a2aa8c024cc8936585f0ce26b36985d1268f165ba53f62`

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
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,351 findings; 1,326 workflows) |
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

Additional replay verification passed with initial-source execution, discovery of all 142 numbered batches, zero parity differences, deterministic persisted provenance, and equality of active, replay, and stored metadata fingerprints.

## Range integrity and protected state

- Exactly 50 target workflow files changed.
- Exactly 50 target research records changed.
- Out-of-range workflow or research changes: 0.
- Workflows 1426–1500 still research-interrupted: 75 of 75.
- Terminal workflows: 1,425.
- Research-interrupted workflows: 75.
- Next workflow and restart marker: `surg-post-hernia-repair-follow-up`.
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

- `9f8e9e1` — `research(source-first): process workflows 1376 to 1425`
- `1435983` — `chore(source-first): checkpoint workflows 1376-1425`

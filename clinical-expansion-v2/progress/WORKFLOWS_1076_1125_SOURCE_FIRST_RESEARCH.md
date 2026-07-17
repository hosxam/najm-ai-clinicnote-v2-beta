# Workflows 1076–1125 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `af51fac6c236e5b34441fce7c2d7d61f129649fe`
- Implementation HEAD before this documentation commit: `02d67e8d6aabff3bab1069b76a4bb32a88c10479`
- Processed range: workflows 1076–1125 inclusive
- First workflow: `pain-safety-net-documentation`
- Last workflow: `peds-pediatric-rash-documentation`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `peds-pediatric-result-review`

No workflow after 1125 was processed. All 375 workflows from 1126 through 1500 remain research-interrupted, and the next workflow was derived from the queue manifest.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 36 |
| `no_authoritative_source_found` | 14 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections from DHA, DoH, NICE, CPOC, RCH/PIC, and RCEM were used only for their stated populations, settings, and domains. Pain and paediatric evidence was not generalized into complete diagnostic, investigation, treatment, medicine, procedure, safeguarding, or referral pathways. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

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
| `partial_applicability` | 36 |
| `missing_explicit_uae_evidence` | 14 |
| `other` | 0 |
| **Total** | **50** |

Direct DHA and DoH applicability is stated only for their covered Dubai and Abu Dhabi services. International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 1,051
- Affected workflows: 1,026
- Partial-applicability findings: 905
- Missing-explicit-UAE-evidence findings: 146
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

- Total modules: 113
- Initial-source module: 1
- Numbered batch modules: 112
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `e4ffba4f7a427f8de0cbb6d2b374945eb424dc295b9575452127d08b88647287`

Replay starts through the established initial-source path. Persisted date provenance, source-recency output, replay order, active metadata, and stored fingerprints remain deterministic. Source registries did not change.

## Validation

The three required preflight commands passed. The established 23-command matrix then ran in its required order. Twenty commands passed. Only the three pre-authorized programme audits remained blocked.

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
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,051 findings; 1,026 workflows) |
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

Additional replay checks passed with initial-source execution, discovery of all 112 numbered batches, zero parity differences, deterministic persisted provenance, and equality of active, replay, and stored metadata fingerprints.

## Programme totals and protected state

- Terminal workflows: 1,125
- Research-interrupted workflows: 375
- Next workflow: `peds-pediatric-result-review`
- Canonical supported mappings: 0
- Runtime-emitted supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12
- Proposed exclusions: 0
- Registered sources: 235
- Public data changed: no
- Source registries changed: no
- Active exclusion configuration changed: no
- Canonical mapping state changed: no
- Signed approval state changed: no
- Workflows outside 1076–1125 changed by this range: no

No push, deployment, merge, rebase, signing, approval, or queue continuation was performed.

## Commits before this report

- `63dd2bb` — `research(source-first): process workflows 1076 to 1125`
- `02d67e8` — `chore(source-first): checkpoint workflows 1076-1125`

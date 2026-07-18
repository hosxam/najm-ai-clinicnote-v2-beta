# Workflows 1126–1175 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `c68eebb5bbb72bd18ba9584c27972edbcb3205b3`
- Implementation HEAD before this documentation commit: `0f4c985b34120f6917341c37b70468af2e657e8b`
- Processed range: workflows 1126–1175 inclusive
- First workflow: `peds-pediatric-result-review`
- Last workflow: `prev-hpv-vaccine-counseling`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `prev-insurance-medical-report`

The starting branch, exact HEAD, clean worktree, absence of an active Git operation, next workflow, and protected programme state were confirmed before processing. The three required preflight commands passed. No workflow after 1175 was processed: all 325 workflows from 1176 through 1500 remain research-interrupted, and the next workflow was derived from the queue manifest.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 26 |
| `no_authoritative_source_found` | 24 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections from DoH, DHA, NICE, WHO, CDC, RCEM, AAO-HNS, and ADA were used only for their stated populations, settings, and domains. Paediatric and preventive evidence was not generalized into complete diagnostic, investigation, treatment, medicine, procedure, screening, certification, safeguarding, referral, or fitness pathways. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

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
| `partial_applicability` | 26 |
| `missing_explicit_uae_evidence` | 24 |
| `other` | 0 |
| **Total** | **50** |

Direct DoH and DHA applicability is stated only for their covered Abu Dhabi and Dubai services. International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 1,101
- Affected workflows: 1,076
- Partial-applicability findings: 931
- Missing-explicit-UAE-evidence findings: 170
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

- Total modules: 118
- Initial-source module: 1
- Numbered batch modules: 117
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `5da1e7f6d30d6bdf6ece7658e86a9cd648db36cf85e8147e81fc756cfce85775`

Replay starts through the established initial-source path. Persisted date provenance, source-recency output, replay order, active metadata, and stored fingerprints remain deterministic. Source registries did not change. The final batch restart marker was aligned to the queue-derived workflow `prev-insurance-medical-report`; this did not change either fingerprint.

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
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,101 findings; 1,076 workflows) |
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

Additional replay checks passed with initial-source execution, discovery of all 117 numbered batches, zero parity differences, deterministic persisted provenance, and equality of active, replay, and stored metadata fingerprints.

## Range integrity and protected state

- Exactly 50 target workflow files changed.
- Exactly 50 target research records changed.
- Out-of-range workflow or research changes: 0.
- Workflows 1176–1500 still research-interrupted: 325 of 325.
- Terminal workflows: 1,175.
- Research-interrupted workflows: 325.
- Next workflow: `prev-insurance-medical-report`.
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

- `dbda2ab` — `research(source-first): process workflows 1126 to 1175`
- `47ec6de` — `chore(source-first): checkpoint workflows 1126-1175`
- `0f4c985` — `chore(source-first): align workflow 1176 restart marker`

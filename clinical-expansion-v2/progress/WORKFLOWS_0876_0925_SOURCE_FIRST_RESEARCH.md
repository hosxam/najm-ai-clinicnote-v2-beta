# Workflows 0876–0925 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `821b45bfff3b8f950e24e5df2f0a5e94eb1bb4e2`
- Implementation HEAD before this documentation commit: `c7c13f13fb716b362f20b1b34f5b7f0b84b74ef9`
- Processed range: workflows 0876–0925 inclusive
- First workflow: `msk-falls-related-injury-review`
- Last workflow: `msk-shoulder-impingement-review`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows
- Next workflow: `msk-splint-check-documentation`

No workflow after 0925 was processed.

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 38 |
| `no_authoritative_source_found` | 12 |
| **Total** | **50** |

Existing registered official sources were searched first. Exact sections from NICE, DHA, DoH, BESS, RCEM, RCoA, WHO/ICRC and other already registered authorities were used only for their stated populations and clinical domains. Adjacent evidence was not generalized into condition-specific diagnoses or treatment protocols. Workflows without a directly applicable registered exact section retained the honest no-authoritative-source status.

- New sources added: 0
- Registered source total: 235
- Exact documents opened across the programme: 233
- Exact sections reviewed across the programme: 726
- Supported mappings created: 0
- Candidate proposals created: 0
- Source-derived legacy items: 0
- Unsupported legacy items: 83,303

## UAE applicability

Every workflow in the range has one structured finding using an existing approved category.

| Range finding type | Count |
|---|---:|
| `partial_applicability` | 38 |
| `missing_explicit_uae_evidence` | 12 |
| `other` | 0 |
| **Total** | **50** |

Direct DHA and DoH applicability is stated in the evidence basis where present. International guidance was not classified as explicitly UAE applicable without direct UAE evidence.

The global UAE audit remains an authorized programme blocker:

- Structured findings: 851
- Affected workflows: 826
- Partial-applicability findings: 763
- Missing-explicit-UAE-evidence findings: 88
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

- Total modules: 93
- Initial-source module: 1
- Numbered batch modules: 92
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `5a02626c83b9d1cdba6a39bdb05fa9d50e897a7af63dbd5c5ebbd3021b808a81`

Persisted date provenance, source-recency output, replay order, active metadata and stored fingerprints remain deterministic.

## Validation

The required 23-command matrix ran in the requested order. Twenty commands passed. Only the three pre-authorized programme audits remained blocked.

| Command | Result |
|---|---|
| `verify:signed-canonical-reconciliation` | PASS |
| `verify:canonical-mapping-reconciliation` | PASS |
| `test:candidate-support-separation` | PASS (3/3) |
| `audit:canonical-write-authority` | PASS (11/11 plus production audit) |
| `audit:no-code-generated-mappings` | PASS |
| `validate:data` | PASS |
| `validate:source-evidence` | PASS (1,500 records; 235 sources) |
| `validate:item-provenance` | PASS (83,303 items; 0 source-derived) |
| `audit:no-generic-templates` | PASS (0 generic generated items) |
| `audit:exact-source-coverage` | AUTHORIZED BLOCKER (1,500 clinical blockers) |
| `audit:source-recency` | PASS (235 sources; 23 due) |
| `audit:uae-applicability` | AUTHORIZED BLOCKER (851 findings; 826 workflows) |
| `audit:unsupported-legacy-content` | AUTHORIZED BLOCKER (83,303 items) |
| `audit:research-claims` | PASS (1,500 records) |
| `test:safety` | PASS |
| `test:all-workflows` | PASS (1,500 workflows) |
| `test:output-safety` | PASS |
| `test:exclusions` | PASS (12 active; 0 proposed) |
| `verify:source-evidence-hashes` | PASS (1,500 workflow, 1,500 evidence, 33 index hashes) |
| `verify:clinical-data-reproducibility` | PASS |
| `test:research-queue` | PASS (14/14) |
| `lint` | PASS (pre-existing warnings only) |
| `build` | PASS |

## Programme totals and protected state

- Terminal workflows: 925
- Research-interrupted workflows: 575
- Next workflow: `msk-splint-check-documentation`
- Canonical supported mappings: 0
- Runtime-emitted supported mappings: 0
- Candidate proposals: 0
- Unsupported legacy items: 83,303
- Active exclusions: 12
- Proposed exclusions: 0
- Registered sources: 235
- Public data changed: no
- Active exclusion configuration changed: no
- Canonical mapping state changed: no
- Signed approval state changed: no
- Workflows outside 0876–0925 changed by this range: no

No push, deployment, merge, rebase, signing, approval, or queue continuation was performed.

## Commits before this report

- `1cdc7f1` — `research(source-first): process workflows 0876 to 0925`
- `c7c13f1` — `chore(source-first): checkpoint workflows 0876-0925`

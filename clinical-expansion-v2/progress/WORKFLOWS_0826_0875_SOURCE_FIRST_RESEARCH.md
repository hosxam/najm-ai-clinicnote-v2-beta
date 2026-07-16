# Workflows 0826–0875 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `a0b199219c81cef37f8694c13423a73a89a2d4e5`
- Implementation HEAD before this documentation commit: `b2e21144325a281e39bc90c1abcf8fbaf4dd0779`
- Processed range: workflows 0826–0875 inclusive, beginning with `icu-imaging-result-review` and ending with `msk-ergonomic-strain-documentation`
- Workflows processed: 50
- Queue result: `INTERRUPTED_RESTARTABLE` after exactly 50 workflows; no workflow after 0875 was processed
- Next workflow: `msk-falls-related-injury-review`

## Research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 32 |
| `no_authoritative_source_found` | 18 |
| **Total** | **50** |

Existing registered official sources and their committed exact sections were checked first. The range reused those sources where their population and setting supported an honest partial classification. Adjacent evidence was not generalized into an ICU device protocol or condition-specific MSK diagnosis. Eighteen workflows therefore retain the honest no-authoritative-source status.

- New sources added: 0
- Registered source total: 235
- Exact documents opened across the programme: 233
- Exact sections reviewed across the programme: 724
- Supported mappings created: 0
- Candidate proposals created: 0
- Source-derived legacy items: 0
- Unsupported legacy items: 83,303

## UAE applicability

Each of the 50 workflows has one explicit structured finding.

| Range finding type | Count |
|---|---:|
| `partial_applicability` | 32 |
| `missing_explicit_uae_evidence` | 18 |
| `other` | 0 |
| **Total** | **50** |

Direct DHA or DoH applicability is retained in each finding's evidence basis, while the approved `partial_applicability` category reflects that the workflow itself remains only partially source verified. General international guidance was not described as explicitly UAE applicable.

The global UAE audit remains an authorized programme blocker: 801 structured findings across 776 affected workflows, comprising 725 partial-applicability and 76 missing-explicit-evidence findings. No range-local structured-category omission remains.

## Recency, replay, and metadata reproducibility

The fixed source-recency policy remained unchanged. All 235 sources passed persisted recency validation.

| Recency basis | Count |
|---|---:|
| Explicit stronger date | 25 |
| Approved unknown | 3 |
| Weaker metadata | 69 |
| Access/verification only | 138 |

Current outcomes remain 24 explicit-stronger-date current, 3 approved-unknown current by verification, 65 weaker-metadata current, 120 access-verification current, and 23 recheck due. Date precision remains 226 day, 4 month, 2 year, and 3 unknown.

The deterministic replay boundary was extended from 82 to 87 numbered modules. Final replay results:

- Modules: 88 total (initial registration plus 87 numbered batches)
- Numbered batches: 87
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Active/replay differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `6ee998dc6389df03763b60fc2fec7a5cf8c1dc8ffca5737795ed463c7e9e03bd`

## Validation

The required 23-command matrix was run in the requested order. Twenty commands passed. Only the three pre-authorized programme audits remained blocked.

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
| `audit:uae-applicability` | AUTHORIZED BLOCKER (801 findings; 776 workflows) |
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

After normalizing the ten direct DHA/DoH records to the established partial category, `audit:uae-applicability` was rerun and remained blocked only for the expected structured applicability findings. `verify:source-evidence-hashes` and `verify:clinical-data-reproducibility` were rerun and passed.

## Programme totals and protected state

- Terminal workflows: 875
- Research-interrupted workflows: 625
- Next workflow: `msk-falls-related-injury-review`
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
- Workflows outside 0826–0875 changed by this range: no

No push, deployment, merge, rebase, signing, approval, or queue continuation was performed.

## Commits before this report

- `0f9aeb08396cc1a0b654af5b395a0b8231d8aa43` — `research(source-first): process workflows 0826 to 0875`
- `1c08b0b670230ca4dc4c204174458f83c454b6c6` — `fix(source-first): use approved UAE finding categories`
- `5e2ab0b6deef45ecab7ff5c92c739e81161fef71` — `chore(source-first): checkpoint workflows 0826-0875`
- `b2e21144325a281e39bc90c1abcf8fbaf4dd0779` — `fix(source-first): normalize UAE findings through workflow 0875`

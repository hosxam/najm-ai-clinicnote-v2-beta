# Workflows 1476–1500 source-first research

## Scope and repository state

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `2d36d8671bcb1f4e90c95cab52b5ca4c40944df0`
- Implementation HEAD before documentation: `78b2f1b9462819873f83e952998a0a1a76752b62`
- Processed range: workflows 1476–1500 inclusive
- First workflow: `uro-phimosis-documentation`
- Last workflow: `uro-vasectomy-counseling-documentation`
- Workflows processed: 25
- Queue result: `SOURCE_FIRST_RESEARCH_COMPLETE`
- Next workflow: none

The starting branch, exact HEAD, clean worktree, absence of an active Git operation, first unfinished workflow, and protected programme state were confirmed before processing. Queue tests, source-recency validation, and clinical-data reproducibility passed at preflight. The production queue processed every final-range workflow exactly once and did not change any earlier workflow.

## Final-range research outcome

| Terminal source status | Range count |
|---|---:|
| `exact_workflow_source_verified` | 0 |
| `partial_exact_source_verified` | 13 |
| `no_authoritative_source_found` | 12 |
| `conflicting_authoritative_sources` | 0 |
| `source_access_failed` | 0 |
| **Total** | **25** |

Existing registered official sources were searched first. Exact registered sections from the DHA dysuria guideline, NICE male-LUTS guideline, NICE renal and ureteric stone guideline, and NICE women’s urinary-incontinence guideline were used only for their qualified populations, settings, and domains. They were not generalized into complete urology pathways, diagnoses, result interpretation, medicines, procedures, referrals, escalation, or disposition. Workflows without a directly applicable registered exact section retained the no-authoritative-source status.

- New sources added: 0
- Registered source total: 235
- Exact documents opened across the programme: 234
- Exact sections reviewed across the programme: 729
- Supported mappings created: 0
- Candidate proposals created: 0
- Source-derived legacy items: 0
- Unsupported legacy items: 83,303

## UAE applicability

Every workflow in the final range has one structured finding using an approved category.

| Range finding type | Count |
|---|---:|
| `partial_applicability` | 13 |
| `missing_explicit_uae_evidence` | 12 |
| `other` | 0 |
| **Total** | **25** |

DHA dysuria evidence was labelled directly UAE-applicable only within its qualified Dubai telehealth scope. NICE guidance was not classified as explicitly UAE applicable.

Global UAE totals after the final range:

- Structured findings: 1,426
- Affected workflows: 1,401
- Partial-applicability findings: 1,099
- Missing-explicit-UAE-evidence findings: 327
- Other findings: 0

## Queue completion and programme reconciliation

The final workflow produced a null `next_workflow_id`. The restart and checkpoint states use `SOURCE_FIRST_RESEARCH_COMPLETE`, contain no research-queue resume command, and do not invent workflow 1501. A post-completion queue dry-run returned `DRY_RUN_QUEUE_COMPLETE` with zero requested or runnable workflows.

| Programme research status | Count |
|---|---:|
| Exact workflow source verified | 0 |
| Partial exact source verified | 1,099 |
| No authoritative source found | 401 |
| Conflicting authoritative sources | 0 |
| Source access failed | 0 |
| Other approved terminal statuses | 0 |
| **Terminal total** | **1,500** |
| **Research interrupted** | **0** |

No workflow remains `not_started`. Every workflow has one final research outcome. The workflow audit ledger independently reports 1,500 terminal and zero interrupted records.

## Source recency, replay, and metadata

The fixed source-recency policy and all source registries remain unchanged. All 235 registered sources passed persisted validation.

Recency basis totals remain 25 explicit stronger date, 3 approved unknown, 69 weaker metadata, and 138 access/verification only. Outcomes remain 24 explicit-stronger-date current, 3 approved-unknown current by verification, 65 weaker-metadata current, 120 access-verification current, and 23 recheck due. All unavailable, superseded, incomplete, and expired outcomes remain zero.

Replay results:

- Total modules: 151
- Initial-source module: 1
- Numbered batch modules: 150
- Source operations: 251
- Replayed sources: 235
- Supplement replay: none
- Replay parity differences: 0
- Metadata fingerprint: `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`
- Replay-manifest fingerprint: `53109420feff822fa7d82266c7a6325135b5092a7b3c2662f5055e8d995edbf0`

Persisted date provenance, recency output, replay order, active metadata, and stored fingerprints remain deterministic.

## Validation

The full 23-command matrix ran in the required order. Twenty commands passed; only the three pre-authorized programme audits remain blocked.

| Command | Result |
|---|---|
| `verify:signed-canonical-reconciliation` | PASS |
| `verify:canonical-mapping-reconciliation` | PASS |
| `test:candidate-support-separation` | PASS (3/3) |
| `audit:canonical-write-authority` | PASS |
| `audit:no-code-generated-mappings` | PASS |
| `validate:data` | PASS (1,500 workflows; 12 excluded; 1,488 visible) |
| `validate:source-evidence` | PASS (1,500 records; 235 sources) |
| `validate:item-provenance` | PASS (83,303 items; 0 source-derived) |
| `audit:no-generic-templates` | PASS |
| `audit:exact-source-coverage` | AUTHORIZED BLOCKER (1,500 clinical blockers) |
| `audit:source-recency` | PASS (235 sources; 23 due) |
| `audit:uae-applicability` | AUTHORIZED BLOCKER (1,426 findings; 1,401 workflows) |
| `audit:unsupported-legacy-content` | AUTHORIZED BLOCKER (83,303 items) |
| `audit:research-claims` | PASS (1,500 records) |
| `test:safety` | PASS (16 tests) |
| `test:all-workflows` | PASS (1,500 workflows) |
| `test:output-safety` | PASS (10 checks) |
| `test:exclusions` | PASS (12 active; 0 proposed) |
| `verify:source-evidence-hashes` | PASS (1,500 workflow, 1,500 evidence, 33 index hashes) |
| `verify:clinical-data-reproducibility` | PASS |
| `test:research-queue` | PASS (16/16) |
| `lint` | PASS (pre-existing warnings only) |
| `build` | PASS |

## Range integrity and protected state

- Exactly 25 final-range workflow files changed.
- Exactly 25 final-range research records changed.
- Each final-range workflow has exactly one finalization event.
- Earlier workflow or research changes: 0.
- Canonical supported mappings: 0.
- Runtime-emitted supported mappings: 0.
- Candidate proposals: 0.
- Unsupported legacy items: 83,303.
- Active exclusions: 12.
- Proposed exclusions: 0.
- Public data changed: no.
- Source registries changed: no.
- Canonical mapping state changed: no.
- Signed approval state changed: no.

No push, deployment, merge, rebase, signing, approval, or next-phase work was performed.

## Commits before this report

- `8ab6635` — `research(source-first): process workflows 1476 to 1500`
- `78b2f1b` — `chore(source-first): complete source-first research queue`

# Evidence-pack normalisation, source acceptance, and reconstruction checkpoint

## Scope and boundary

This corrective pass started from `7a2f8c72507670ae95ed2acf83a2db3d124f375e` on branch `guideline-evidence-packs-and-reconstruction-v1`. It repairs the evidence-pack granularity and global reconstruction gate without changing clinical adjudication results, legacy/public data, canonical or signed state, mappings/candidates, exclusions, or clinician queues. No deployment, push, merge, rebase, signing, or approval was performed.

## Normalisation

The durable command `npm run evidence-packs:normalise` generated `guideline-evidence-packs-v1/EVIDENCE_PACK_NORMALISATION_MANIFEST.json` and preserved the existing reusable dependency graph. Of 1,198 packs, 1,198 were preserved; merged, split, and remapped packs were all zero. Every normalized pack has a stable alias and pre/post fingerprint. Manifest fingerprint: `a3d003c971f76339b7c510cc4edf5e54de5029abd9c1cafad010b58d0257e189`.

## Dependency-scoped readiness and reconstruction

Readiness is calculated per workflow dependency, not as a global all-packs gate. The readiness manifest contains all 1,500 workflows:

- `READY_FOR_RECONSTRUCTION`: 393
- `NEEDS_PACK_EXPANSION`: 1,107
- `NEEDS_MAPPING_REPAIR`: 0
- `MERGE_ANALYSIS_REQUIRED`: 0
- `SOURCE_BLOCKED`: 0

Readiness fingerprint: `b385896400a3788c7f8023e4a54d65cdb88ce66b868b78e990fce8ad15203ae0`.

All 393 ready workflows were reconstructed immediately. Their 72,004 active items contain exact source statement IDs, source IDs, official URLs, locators, and evidence fingerprints. Legacy items are reconciled with explicit removal records (22,541 comparisons): original ID and wording, removal category/reason, and assessed evidence scope are retained. Final resolved statuses are 205 `reconstructed_complete` and 188 `reconstructed_with_noncritical_documented_limitations`. There are 1,107 pending workflows, all blocked by their own missing pack/core-section dependencies; they are not presented as usable reconstructed workflows. The next pending ID currently derives deterministically as `anes-airway-plan-documentation-review`.

Resolution state fingerprint: `13c8b403b62dca8612a5ed820248874a8dbec252655b2e2e71bfb707c470a5d8`. `beta_generated`, `mappings_written`, and `candidates_written` remain false.

## Authoritative-source acceptance

Source acceptance is now separated from workflow mapping. Authority, accessible full content, and population/setting relevance are evaluated first; exact workflow-title matching is not required. Duplicate detection remains a separate result. The broad NICE acute-cough guideline path is accepted on those criteria. Commercial/blog content and inaccessible full content are rejected by focused tests.

The deterministic source-research campaign manifest contains 3,363 generated official-search candidates. The auditable histogram is:

- 1 `accepted_source_family_match` (NICE NG120)
- 3,362 `candidate_never_actually_evaluated` (queries generated for discovery; no source page was opened, so no unsupported rejection is inferred)

Candidate audit fingerprint: `060a5b386edcb52fa65295ec0da11ae3fad217057eb3c712e75f1c31b8ae4f1d`. The accepted NICE source is already present in the committed corpus; no additional source was accepted during this corrective pass.

## Corpus and pack state

The source corpus has 236 registered sources and fingerprint `9377495369b84412d0b0b265d86311264b01abc6865b69e1c1ebfdd017134e02`. Evidence-pack aggregate fingerprint: `55862cd719aa30b110b30bce0815440b7272fcd65bf4ba3aada53a0eec7ea632`. Pack status is 825 completed and 373 requiring additional corpus search. The durable `catalogue:resolve-all` command now normalizes, recalculates scoped readiness, reconstructs every newly ready workflow, and validates the result; it returns `PARTIAL` while 1,107 dependency-scoped blockers remain. It does not emit the broken-path token because ready workflows were successfully reconstructed.

## Validation

Passed focused commands: `evidence-packs:normalise`, `validate:evidence-pack-normalisation`, `workflows:calculate-readiness`, `validate:workflow-readiness`, `workflows:reconstruct-ready`, `validate:workflow-evidence-reconstruction`, `validate:workflow-item-evidence`, `audit:source-candidate-decisions`, `validate:source-candidate-decisions`, `test:source-acceptance`, `validate:workflow-pack-dependencies`, `validate:section-applicability`, `validate:merge-aliases`, `validate:retirement`, `validate:blocked-source`, and `validate:medication-safety`.

Repository checks also passed: `validate:sources-ingestion`, `validate:evidence-packs`, `audit:source-recency`, `verify:source-metadata-reproducibility`, `verify:clinical-data-reproducibility`, `validate:data`, `test:safety`, `test:all-workflows`, `test:output-safety`, `lint` (warnings only), and `build`. Source-recency remains fail-closed and reports 236 sources; its one incomplete metadata record and 23 rechecks due are unchanged policy outcomes, not silently promoted to current.

## Protected-state confirmation and next step

Mappings and candidates remain zero; exclusions remain 12; public/data, canonical files, signed/approval state, and clinician queues are unchanged. No beta dataset or deployment was generated. Continue authoritative source expansion for the 1,107 `NEEDS_PACK_EXPANSION` workflows, regenerate only the affected packs, and reconstruct each workflow immediately when its own dependencies become ready. The full completion token is intentionally not emitted because the catalogue is not yet fully reconstructed.

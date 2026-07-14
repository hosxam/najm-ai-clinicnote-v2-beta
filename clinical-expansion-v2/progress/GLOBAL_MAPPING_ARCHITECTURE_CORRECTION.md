# Global Supported-Evidence Mapping Architecture Correction

## Scope and outcome

This correction was performed on `source-first-guideline-expansion-1500-v2` from starting commit `ab58aeb70141285b8611235591715b418b3e2b81`. It did not resume the research queue, perform external research, generate new clinical evidence, or fabricate item-level applicability or rationales.

The independent audit found that none of the 17,347 persisted supported mappings contained the complete item-level semantic and provenance record now required by the canonical contract. Every mapping was therefore removed conservatively to unsupported clinician-review status. No mapping was retained merely because a valid source and section existed.

| Measure | Before | After |
|---|---:|---:|
| Persisted supported mappings | 17,347 | 0 |
| Historical runtime-emitted mappings | 8,145 | 0 canonical runtime mappings |
| Canonical-ledger mappings | Not authoritative | 0 |
| Guard-inspected mappings | 17,347 by total only | 0, exact-key reconciled |
| Unsupported legacy items | 65,956 | 83,303 |
| Mappings removed to unsupported | 0 | 17,347 |
| Mappings requiring clinician review before reinstatement | — | 17,347 |
| Workflows whose item-support accounting changed | — | 540 |
| Workflow source-status changes | — | 0 |

## Root causes

1. Supported evidence existed in several competing representations: research records, workflow item provenance, an explicit ledger, historical batch output, and runtime helper output.
2. Historical helper paths reconstructed mappings from text and batch context instead of consuming one authoritative record.
3. Item-level population, setting, jurisdiction/UAE applicability, substantive workflow-specific rationale, source hash, section hash, and mapping version were not persisted on the original mappings.
4. Runtime discovery emitted only 8,145 of 17,347 persisted mappings. The other 9,202 mappings were associated with retired or incompatible historical batch paths and were not in runtime output.
5. The prior contract accepted some generic, shared, or insufficiently specific applicability prose.
6. The prior guard missed alternate locations, wrappers, defaults, dynamic imports, computed properties, and equal-total key mismatches.
7. UAE accounting relied on free-text wording, allowing two findings to disappear when generic text gained the literal term `UAE` without new evidence.
8. Nineteen no-mapping GP records received correction metadata even though no mapping had changed.

## Canonical mapping architecture

The authoritative ledger is `CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl`, governed by `CANONICAL_SUPPORTED_MAPPING_SCHEMA.json` and `scripts/source-first/canonicalMappingLedger.mjs`.

Every future supported mapping must own these fields directly:

- `workflowId`
- `itemId`
- `sourceId`
- `sectionId`
- `sourceHash`
- `sectionHash`
- `evidenceRelationship`
- `populationApplicability`
- `settingApplicability`
- `jurisdictionApplicability`
- `uaeApplicability`
- `applicabilityRationale`
- `supportStatus`
- `origin`
- `mappingVersion`

The canonical reader returns cloned, deeply immutable records. `applyResearchBatch.mjs` accepts supported mappings only from this ledger, validates them against the exact workflow item, source, reviewed section, hashes, applicability, rationale, origin, status, and version, and rejects historical `support_groups`. Historical batch modules cannot independently create current supported mappings.

The required invariant now holds by exact mapping key and complete semantic record:

```text
canonical = persisted research = workflow provenance = explicit ledger = guard = runtime
0 = 0 = 0 = 0 = 0 = 0
```

## Mapping inventory and reclassification

- `GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl` contains exactly 17,347 unique rows, one per original supported mapping.
- `GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl` contains exactly 17,347 unique dispositions with the same key set.
- Runtime-emitted before correction: 8,145.
- Runtime gap before correction: 9,202. Each affected inventory row records the historical generation path and a deterministic gap explanation.
- Item-level population applicability persisted: 0 of 17,347.
- Item-level setting applicability persisted: 0 of 17,347.
- Item-level UAE applicability persisted: 0 of 17,347.
- Substantive workflow-specific rationale persisted: 0 of 17,347.
- Mapping-level source and section hashes persisted: 0 of 17,347.
- `RETAIN_CANONICAL`: 0.
- `REMOVE_TO_UNSUPPORTED`: 17,347.
- Qualified clinician review required before any reinstatement: 17,347.

The final unsupported ledger contains all 83,303 legacy clinical items exactly once. No item is simultaneously supported and unsupported, and no supported workflow-item status remains.

## Contract correction

The mapping contract now requires plain schema-owned objects, exact workflow-owned item identity, exact reviewed source and section, valid hashes, explicit mapping version, non-empty mapping-owned applicability fields, and a substantive rationale naming the exact workflow, item, source, and section while addressing population, setting, UAE/local transfer, and material limitations.

It rejects missing or whitespace-only values, text/label/fuzzy resolution, generic or reused clinical prose, shared/default applicability, unexpected or inherited properties, prototype-derived objects, invalid hashes, cross-workflow items, unreviewed sources or sections, invalid status/origin/version, duplicate or conflicting mappings, and mutation of validated or caller-owned data.

The committed contract suite contains 47 deterministic tests covering all 31 required independent probe categories. Result: **47 passed, 0 failed**.

## Guard correction

The repository guard now combines static path-independent detection with runtime and persisted-record reconciliation. It checks alternate directories and filenames, early workflows, renamed helpers, wrappers, default applicability, generic rationale, computed properties, dynamic imports, alternate writers, duplicate keys, semantic changes, runtime/persistence mismatch, and equal-total key mismatch.

The 12 independent guard probes all fail closed. The full guard suite result is **17 passed, 0 failed**, followed by a successful repository audit of 1,500 research records, 17,347 correction records, 83,303 unsupported items, and exact zero-key reconciliation.

## Unrelated metadata cleanup

`GLOBAL_UNRELATED_METADATA_CLEANUP_LEDGER.jsonl` records exactly 19 no-mapping GP research records. Each was restored to its pre-correction research metadata without changing clinical content, source status, sources, or mappings. None now carries `technical_audit.gp_mapping_correction`, and every cleanup row confirms `clinical_mapping_changed: false`.

## UAE applicability correction

UAE findings are now stored in `UAE_APPLICABILITY_FINDINGS.jsonl` and counted from structured finding types rather than free-text matching.

| Finding | Before | After |
|---|---:|---:|
| Affected workflows | 576 | 576 |
| Partial-applicability findings | 576 | 576 |
| Missing-explicit-UAE-evidence findings | 23 | 25 |
| Other findings | 0 | 0 |
| Total findings | 599 | 601 |

The missing-explicit-evidence findings for `gp-constipation-follow-up-in-gp` and `gp-cough-follow-up-in-gp` were restored because their disappearance was caused only by generic wording that included `UAE`; no evidence status had changed. Future batch application fails closed unless UAE findings are supplied as explicit structured records.

## Status and accounting reconciliation

The unchanged terminal source-status classifier was reapplied from primary records. Removing unsupported item mappings did not alter workflow-level source-review status:

- `exact_workflow_source_verified`: 0
- `partial_exact_source_verified`: 576
- `no_authoritative_source_found`: 99
- `conflicting_authoritative_sources`: 0
- `source_access_failed`: 0
- `research_interrupted`: 825

Every partial workflow retains independently reviewed exact documents and sections, while no partial workflow claims canonical item-level support. Programme manifest, checkpoint counts, workflow and evidence hashes, specialty indexes, audit ledger, execution log, and unsupported ledger were rebuilt from the corrected primary records.

## Independent second pass

`npm run audit:global-mapping-second-pass` completed with `PASS` in a clean-context review:

- all 17,347 mapping dispositions reviewed by deterministic invariant checks;
- all 9,202 old runtime-gap mappings confirmed removed;
- retained mapping set reviewed in full: 0 records;
- retained mappings with reconstructed applicability: 0;
- retained mappings with previously missing rationale: 0;
- 200 deterministically selected removed mappings reviewed with complete removal and clinician-review reasons;
- mappings outside numbered batch modules in the original 17,347 set: 0, so the entire such set was reviewed;
- workflow source-status changes: 0;
- all 601 UAE findings reviewed, including the two restored wording-only losses;
- all 19 unrelated metadata cleanup records reviewed;
- workflows 0676 onward unchanged;
- next workflow remains `gp-home-glucose-log-review`.

The requested 200 retained-mapping sample was not applicable because the conservative contract retained no mappings. The second pass instead reviewed the complete empty retained set and a deterministic 200-record removed sample.

## Validation results

| Command | Result |
|---|---|
| `npm run test:gp-batch-support-contract` | PASS — 47/47 |
| `npm run audit:explicit-mapping-contract` | PASS — 17/17 plus repository reconciliation |
| `npm run test:global-mapping-architecture` | PASS — 10/10 |
| `npm run validate:data` | PASS — 1,500 workflows, 12 exclusions |
| `npm run validate:source-evidence` | PASS |
| `npm run validate:item-provenance` | PASS — 83,303 items |
| `npm run audit:no-generic-templates` | PASS |
| `npm run audit:exact-source-coverage` | ALLOWED CLINICAL BLOCKER — 1,500 incomplete workflows |
| `npm run audit:source-recency` | PASS — 224 sources |
| `npm run audit:uae-applicability` | ALLOWED CLINICAL BLOCKER — 601 structured findings across 576 workflows |
| `npm run audit:unsupported-legacy-content` | ALLOWED CLINICAL BLOCKER — 83,303 unsupported items |
| `npm run audit:research-claims` | PASS |
| `npm run test:safety` | PASS — 16 tests |
| `npm run test:all-workflows` | PASS |
| `npm run test:output-safety` | PASS |
| `npm run test:exclusions` | PASS — 12 active exclusions |
| `npm run verify:source-evidence-hashes` | PASS — 1,500 workflow and evidence hashes |
| `npm run verify:clinical-data-reproducibility` | PASS — `public/data` unchanged |
| `npm run test:research-queue` | PASS — 12/12; queue was not resumed |
| `npm run lint` | PASS with pre-existing warnings only |
| `npm run build` | PASS |
| `npm run audit:global-mapping-second-pass` | PASS |

## Frozen-state confirmations

- No new external clinical research occurred.
- The research queue was not resumed.
- `public/data` is unchanged from stable main `95758951d46510f34548b5520510c5d9d59f017f`.
- Active exclusions remain exactly 12.
- Workflows 0676 onward remain unchanged from starting commit `ab58aeb70141285b8611235591715b418b3e2b81`.
- Stable `main` remains at `95758951d46510f34548b5520510c5d9d59f017f`.
- Protected forensic branch `guideline-expansion-1500-all-in-one` remains at `9b4cddb0fb226543ce621cb14a672a4edf789261`.
- No push, deployment, merge, or rebase occurred.

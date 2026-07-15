# Declarative Mapping Architecture

## Decision

Supported clinical evidence mappings now have one authoritative source: strict per-workflow JSON documents under `clinical-expansion-v2/canonical-mappings/`.

General-purpose JavaScript data-flow analysis remains defence in depth, but it is no longer the primary security boundary. An active supported mapping is valid only when it is present in a schema-valid canonical JSON file and has passed the canonical loader. No JavaScript or TypeScript batch, helper, snapshot, progress record, cache, workflow array, research array, or historical ledger can create active support.

This architecture change was performed from frozen starting commit `98167d898c2e83560b139fc4c2b38ffef8d2e2b2` on branch `source-first-guideline-expansion-1500-v2`.

## Why General JavaScript Taint Analysis Is No Longer Primary

The independent reverse-context review demonstrated that extending a general JavaScript whole-program analyser was not a reliable primary guarantee. The previous analyser rejected the direct A-T cases but initially allowed four unresolved-flow classes:

- unresolved array source;
- unresolved conditional branch;
- aliased-object property assignment; and
- unavailable call result.

It also initially rejected neither bare-import probe, and an `export *` re-export cycle crashed analysis. These defects showed that the primary invariant should not depend on proving every possible JavaScript construction safe.

The decisive invariant is now simpler and enforceable: if a record did not come from a validated canonical JSON document, it is not active support.

The module analyser was still repaired as defence in depth. Bare side-effect imports and unavailable imported values fail closed in mapping infrastructure. Named/default imports, dynamic imports, re-export chains, circular imports, mutually recursive modules, and `export *` cycles terminate deterministically and produce stable diagnostics rather than crashing or silently skipping unresolved modules.

## Canonical Store

Authoritative directory:

`clinical-expansion-v2/canonical-mappings/<workflow-id>.json`

Current production contents: no JSON mapping files. The committed `.gitkeep` only preserves the empty directory.

Every document has exactly three top-level fields:

```json
{
  "schemaVersion": "1.0.0",
  "workflowId": "workflow-id",
  "mappings": []
}
```

Every mapping requires exactly:

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

The retained `jurisdictionApplicability` field preserves the existing strict explicit-mapping contract in addition to the required UAE applicability field.

Schema: `clinical-expansion-v2/schema/CANONICAL_MAPPING_FILE_SCHEMA.json`

The loader uses strict JSON parsing plus duplicate-property detection. It rejects malformed JSON, unknown or missing fields, inherited/non-plain values, symbols, computed-looking placeholders, empty values, invalid enums, generic or reused applicability text, invalid identifiers, incorrect ownership, unreviewed sources or sections, incorrect hashes, duplicate keys, conflicting workflow-item mappings, `source_derived` relabelling, and mismatched document filenames.

## Approved Serializer

Serializer: `scripts/source-first/writeCanonicalMapping.mjs`

The serializer accepts one complete mapping value only. It does not accept fragments, callbacks, defaults, text resolution, shared applicability objects, inferred fields, arrays of caller objects, or partially assembled mappings.

Before writing it validates:

1. every exact field and enum;
2. the workflow and workflow-owned item;
3. the registered source and exact section;
4. workflow-specific source and section review;
5. source and section hashes;
6. population, setting, jurisdiction, and UAE applicability;
7. a substantive workflow-specific rationale;
8. support status, origin, and mapping version; and
9. absence of duplicate or conflicting mappings.

It writes formatted strict JSON atomically, re-reads the document, revalidates the whole canonical directory, and rolls back the file on failure. Production cleanup through the synthetic-test path is prohibited. Noncanonical output directories require an explicit test-only flag.

## Canonical Loader and Active Views

Loader: `scripts/source-first/canonicalMappingStore.mjs`

Reconciliation: `scripts/source-first/canonicalMappingReconciliation.mjs`

The following active views are all deterministic immutable projections of the same canonical loader result:

- canonical JSON;
- persisted active mappings;
- explicit-ledger mappings;
- guard-inspected mappings; and
- runtime-emitted mappings.

Reconciliation compares full mapping keys and stable record values, not totals alone. Equal counts with unequal keys fail closed.

The historical `CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl` and `EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl` remain empty forensic records. They are not active stores.

## Allowlisted Infrastructure

The code-generation guard permits mapping-shaped implementation details only in the narrow canonical infrastructure allowlist:

- `auditExplicitMappingContract.mjs`
- `auditNoCodeGeneratedMappings.mjs`
- `canonicalMappingContract.mjs`
- `canonicalMappingLedger.mjs`
- `canonicalMappingReconciliation.mjs`
- `canonicalMappingStore.mjs`
- `computedMappingDataFlow.mjs`
- `writeCanonicalMapping.mjs`
- `batches/gpExplicitMappingContract.mjs`

Only `applyResearchBatch.mjs` and `runCheck.mjs` are approved read-only consumers of canonical reconciliation metrics outside that infrastructure. Arbitrary production imports, re-exports, or dynamic imports of canonical active readers fail. Importing, re-exporting, or dynamically importing the serializer from arbitrary production code also fails.

## Code-Generated Mapping Prohibition

`scripts/source-first/auditNoCodeGeneratedMappings.mjs` scans production JavaScript and TypeScript with the TypeScript AST. Outside the allowlist it rejects mapping-shaped object literals and production pathways involving direct literals, spreads, `Object.assign`, aliases, arrays, conditionals, logical expressions, wrappers, returns, imports, re-exports, dynamic imports, later property assignment, alternative support arrays, support-status promotion, stored support totals, canonical-directory writes, and retired-ledger reactivation.

The guard deliberately does not claim to solve arbitrary whole-program taint analysis. Its authority comes from two enforceable properties:

1. production code cannot write or expose canonical active mapping records outside the approved boundary; and
2. every active support view is derived only from the strict canonical loader.

## Research and Support Are Separate

Research completion is not item-level evidence support.

Future research batches may produce source records, reviewed-section records, applicability assessments, unsupported-item accounting, terminal workflow research status, and non-supporting candidate proposals. Candidate proposals may use only:

- `candidate_pending_review`
- `unsupported_pending_review`
- `clinician_review_required`

Candidate proposals cannot contain support fields and do not contribute to supported totals, exact item-level support, runtime output, or application overlays.

Executable batches cannot contain active `mappings` or `legacy_item_support_mappings`, and non-empty historical `support_groups` fail. `gpBatchSupport.mjs` requires its legacy `mappings` input to remain empty and cannot emit support. `applyResearchBatch.mjs` records all current items as unsupported unless a separately reviewed canonical mapping already exists; it never turns a research result into support.

## Future Mapping Authoring Process

1. Complete source-first research without creating support.
2. Record exact opened documents and reviewed sections.
3. Retain candidate item-evidence proposals as explicitly non-supporting review material.
4. Independently review one proposed workflow-item/source-section relationship.
5. Prepare one complete canonical mapping JSON value with no defaults or inferred fields.
6. Submit that complete value to `writeCanonicalMapping.mjs`.
7. Allow the serializer and loader to validate ownership, review status, hashes, applicability, rationale, and uniqueness.
8. Run canonical reconciliation and the complete validation suite.
9. Obtain separate qualified clinician review before any clinical approval decision.

## Positive Path

The positive test used synthetic temporary workflow, item, source, section, and research fixtures only. The approved serializer wrote one canonical mapping to an operating-system temporary directory.

Result after write:

`canonical / persisted / explicit / guard / runtime = 1 / 1 / 1 / 1 / 1`

Supported accounting increased exactly once, and the synthetic item left the derived unsupported set exactly once.

The controlled synthetic cleanup then removed the file.

Final result:

`canonical / persisted / explicit / guard / runtime = 0 / 0 / 0 / 0 / 0`

The synthetic item returned to the unsupported set, the temporary directory was empty, and no fixture remained in the repository.

## Negative and Bypass Tests

All tested bypasses failed closed, including:

- numbered, non-numbered, and outside-batch mapping literals;
- wrapper returns, spreads, `Object.assign`, aliases, conditionals, arrays, logical expressions, and later assignments;
- imported mappings, re-exports, dynamic imports, unavailable bare imports, and bare side-effect imports;
- canonical active-reader imports by arbitrary production code;
- serializer imports, re-exports, and dynamic imports by arbitrary production code;
- deterministic `export *` cycles;
- direct canonical-directory writes;
- historical helper output, progress-only mappings, and runtime-cache-only mappings;
- malformed JSON, duplicate JSON fields, unexpected fields, missing applicability, placeholders, generic rationale, wrong hashes, cross-workflow items, duplicate/conflicting keys, and noncanonical directory entries; and
- equal totals with unequal mapping keys.

The architecture suite passed 26/26 tests. The explicit mapping contract suite passed 63/63 tests. The GP support contract passed 47/47 tests. The repository guard inspected 133 production files and found zero code-generated supported mappings.

## Migration Impact

No supported mapping was migrated because the frozen baseline contained zero valid supported mappings. Historical correction ledgers and batch snapshots remain available for forensic inspection but are incapable of active emission.

Active mapping sources before this change were structurally distributed across canonical/explicit ledgers, workflow and research arrays, batch/helper output, and runtime reconciliation logic, even though the corrected baseline held zero active records. After this change, canonical JSON is the only possible active source and every consumer is a projection of it.

Retired mutation scripts now fail immediately instead of reconstructing mappings. The old general data-flow analyser remains only as a secondary detector.

## Final Zero-Mapping Baseline

| Measure | Final value |
|---|---:|
| Canonical JSON mappings | 0 |
| Persisted active mappings | 0 |
| Explicit-ledger mappings | 0 |
| Guard-inspected mappings | 0 |
| Runtime-emitted mappings | 0 |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Exact workflows | 0 |
| Partial workflows | 576 |
| No-authoritative-source workflows | 99 |
| Research-interrupted workflows | 825 |
| Terminal workflows | 675 |
| UAE findings | 601 across 576 workflows |
| Registered sources | 224 |
| Registered exact sections | 709 |
| Unique reviewed sections | 685 |
| Active exclusions | 12 |

Workflows 0676-1500 remain unchanged and `research_interrupted`. The next workflow remains `gp-home-glucose-log-review`.

Source registries, source sections, research records, workflow records, evidence hashes, manifest metrics, restart/checkpoint metrics, `public/data`, and the active exclusion configuration are unchanged from the frozen starting state. `public/data` remains identical to stable main.

## Required Validation Results

| # | Command | Exit | Result |
|---:|---|---:|---|
| 1 | `npm run test:canonical-mapping-schema` | 0 | PASS - 9/9 |
| 2 | `npm run test:canonical-mapping-serializer` | 0 | PASS - 4/4 |
| 3 | `npm run test:declarative-mapping-architecture` | 0 | PASS - 26/26 |
| 4 | `npm run audit:no-code-generated-mappings` | 0 | PASS - 133 production files, 0 generated mappings |
| 5 | `npm run verify:canonical-mapping-reconciliation` | 0 | PASS - 0/0/0/0/0, 83,303 unsupported |
| 6 | `npm run test:gp-batch-support-contract` | 0 | PASS - 47/47 |
| 7 | `npm run audit:explicit-mapping-contract` | 0 | PASS - 63/63 plus runtime audit |
| 8 | `npm run validate:data` | 0 | PASS - 1,500 workflows, 12 exclusions |
| 9 | `npm run validate:source-evidence` | 0 | PASS - 1,500 research records, 224 sources |
| 10 | `npm run validate:item-provenance` | 0 | PASS - 83,303 items, 0 source-derived |
| 11 | `npm run audit:no-generic-templates` | 0 | PASS - 0 generic items |
| 12 | `npm run audit:exact-source-coverage` | 1 | EXPECTED CLINICAL BLOCKER - 1,500 workflows incomplete |
| 13 | `npm run audit:source-recency` | 0 | PASS - 224 sources |
| 14 | `npm run audit:uae-applicability` | 1 | EXPECTED CLINICAL BLOCKER - 601 findings across 576 workflows |
| 15 | `npm run audit:unsupported-legacy-content` | 1 | EXPECTED CLINICAL BLOCKER - 83,303 items |
| 16 | `npm run audit:research-claims` | 0 | PASS - 1,500 records |
| 17 | `npm run test:safety` | 0 | PASS - 16 tests, 12 exclusions |
| 18 | `npm run test:all-workflows` | 0 | PASS - 1,500 workflows/overlays/research records |
| 19 | `npm run test:output-safety` | 0 | PASS - 10 checks |
| 20 | `npm run test:exclusions` | 0 | PASS - 12 active, 0 proposed |
| 21 | `npm run verify:source-evidence-hashes` | 0 | PASS - 1,500 workflow, 1,500 evidence, 33 index hashes |
| 22 | `npm run verify:clinical-data-reproducibility` | 0 | PASS - public data unchanged |
| 23 | `npm run test:research-queue` | 0 | PASS - 13/13 |
| 24 | `npm run lint` | 0 | PASS - pre-existing third-party skill warnings only |
| 25 | `npm run build` | 0 | PASS |

Only the three explicitly permitted clinical blocker audits returned nonzero. Every architecture, schema, serializer, reconciliation, safety, queue, hash, lint, and build command passed.

## Internal Independent Second Pass

A separate clean-context pass repeated the no-code guard, canonical reconciliation, explicit-source audit, bypass suite, and source/evidence hash verification.

It confirmed:

- no active source exists outside canonical JSON;
- no executable batch or historical snapshot can emit active support;
- only the approved serializer can write canonical mapping files;
- malformed and code-generated mappings fail;
- unavailable bare imports fail closed;
- export-star cycles terminate without crashing;
- the synthetic positive mapping reconciles 1/1/1/1/1;
- cleanup returns reconciliation to 0/0/0/0/0;
- canonical mapping JSON files remaining in production: 0;
- temporary fixtures remaining in the repository: 0;
- historical canonical ledger rows: 0;
- historical explicit ledger rows: 0;
- workflow-level support-array rows: 0;
- research-level support-array rows: 0;
- protected baseline path changes: 0; and
- workflow, research, source, manifest, restart, checkpoint, hash, public-data, and exclusion baselines remain unchanged.

No new clinical research occurred. No clinical mapping was restored. The research queue remained stopped throughout the task.

This implementation is complete and requires independent review before any queue continuation.

# Reverse-Context Clinical-Mapping Guard Repair

## Scope and frozen baseline

This repair closes the remaining reverse-context and data-flow blind spot in the source-first computed-property guard. The research queue remained stopped throughout. No clinical research, clinical mapping, workflow status, support accounting, public data, or exclusion configuration changed.

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `557beb24b028b0c69209133b75357bd1486afa1d`
- Previous guard-repair HEAD: `f6e19f3883d261e6d42a27fe60e5a3d637960f85`
- Stable main: `95758951d46510f34548b5520510c5d9d59f017f`
- Protected forensic commit: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- Previous committed guard suite: **29/29**
- Final committed guard suite: **61/61**

## Original reverse-context defect

The prior AST pass inspected an object literal using only its lexical context. It rejected an unresolved computed property when identity or protected mapping fields were present in the same object, but it did not propagate a later mapping consumer back through a separately bound value.

The following flow therefore escaped before this repair:

```js
const field = getFieldAtRuntime()
const dynamicPart = { [field]: value }

const mapping = {
  workflowId,
  itemId,
  sourceId,
  sectionId,
  ...dynamicPart,
}
```

The root cause was a lexical object-shape model rather than a symbol/value-flow model. Resolving the spread identifier established that an object existed, but did not carry the consuming mapping context to the initializer or through aliases, calls, returns, imports, containers, or later assignments.

## Reproducing fixtures

Before production code changed, the required A-N fixture matrix was exercised. Only the inline function-parameter case was already rejected; **13 of 14 reverse-context cases escaped**.

| Fixture | Flow | Before | After |
| --- | --- | --- | --- |
| A | Pre-bound object spread | Escaped | Rejected |
| B | Pre-bound nested object | Escaped | Rejected |
| C | Mapping-function argument | Escaped | Rejected |
| D | Multi-hop alias chain | Escaped | Rejected |
| E | Wrapper return | Escaped | Rejected |
| F | Function parameter into returned mapping | Rejected | Rejected |
| G | Named imported object | Escaped | Rejected |
| H | Default-exported object | Escaped | Rejected |
| I | `Object.assign` | Escaped | Rejected |
| J | Array-mediated flow | Escaped | Rejected |
| K | Nested alias then spread | Escaped | Rejected |
| L | Conditional expression | Escaped | Rejected |
| M | Logical expression | Escaped | Rejected |
| N | Computed property assignment after declaration | Escaped | Rejected |

All temporary runners and fixtures were removed.

## Corrected symbol and data-flow model

`scripts/source-first/computedMappingDataFlow.mjs` now builds a TypeScript `Program` over every in-scope JavaScript and TypeScript source file. Files and diagnostics are sorted before analysis so filesystem order does not affect results.

The analyzer creates stable graph identities for bindings, expressions, object and array containers, call results, function returns, imports, exports, and synthetic parse-failure nodes. It then:

1. Seeds `COMPUTED_MAPPING_HAZARD` at unresolved or computed object fields and later computed assignments.
2. Adds forward value edges through declarations, aliases, assignments, spreads, nesting, arrays, statically followed property access, conditionals, logical/binary expressions, `Object.assign`, returns, exports, imports, re-exports, and dynamic imports.
3. Resolves function bindings, including renamed local bindings, named/default imports, and re-exports.
4. Computes call-specific parameter-to-return and parameter-to-sink dependencies rather than contaminating every invocation of a shared helper.
5. Iterates wrapper summaries to a deterministic fixed point so nested and mutually recursive wrappers terminate conservatively.
6. Propagates hazards and mapping identity to stable fixed points.
7. Rejects a hazard when it intersects a clinical mapping sink.

The call-specific summary step is important: a first implementation attempt connected every argument to a shared formal parameter and produced unrelated cross-call taint. The final model only connects an actual argument to a call result or wrapper sink when the corresponding formal parameter can reach that function's return or an owned mapping sink.

## Mapping sinks recognised

The repaired guard recognises mapping context from structure and use, not only helper names. Covered sinks include:

- Objects containing `workflowId`, `itemId`, `sourceId`, or `sectionId`.
- Objects containing protected canonical mapping fields.
- Canonical mapping constructor and validator calls.
- Mapping persistence, writer, emitter, and ledger calls.
- Runtime-only mapping emission paths.
- Persisted-only mapping writer paths.
- Explicit mapping-ledger and workflow-support writers.
- `legacy_item_support_mappings` fields, including later assignment.
- Exported mapping collections and arrays containing mapping objects.
- Nested applicability or fragments that reach a mapping object.
- Wrappers whose return reaches a mapping sink.
- Wrappers that invoke a mapping sink without returning the mapped value.
- Unknown calls where hazardous and mapping-identity values meet at the same call site.

Protected fields include the required canonical identity, hash, evidence relationship, applicability, rationale, status, origin, and version fields.

## Alias, function, and cross-file propagation

Verified propagation paths include:

- One-hop and multi-hop aliases.
- Cyclic aliases.
- Local function renaming.
- Function arguments and parameters.
- Function returns and nested wrappers.
- Mutually recursive wrappers.
- Named imports.
- Default imports and exports.
- Named re-exports.
- Circular imports.
- Statically discoverable dynamic imports.
- Alternate source-first directories and non-numbered files.
- Arrays, nested containers, conditionals, logical expressions, `Object.assign`, and later computed assignments.

## Unresolved-flow behaviour

The guard fails closed when a relative import, dynamic import, parse, or source-first call flow cannot be resolved and that unresolved value reaches a mapping sink. Diagnostics identify the hazard origin and the sink reached. Parse failures are always emitted explicitly and cannot be silently skipped.

Clearly disconnected nonclinical computed objects remain allowed. Local UI configuration, chart configuration, unrelated runtime-key objects, and a safely imported UI object all passed because no hazard path reached mapping identity, persistence, runtime emission, or a mapping writer.

## Cycle safety and determinism

Permanent tests verify:

- Cyclic aliases terminate.
- Mutually recursive wrappers terminate.
- Circular imports terminate.
- Repeated execution returns identical diagnostics and metrics.
- Reversed file-discovery order returns identical diagnostics.
- Parsed ASTs and caller-provided source entries are not mutated.
- Parse failure produces a stable fail-closed diagnostic.

The implementation uses sorted work queues, visited sets, bounded import/re-export resolution, and monotonic edge/sink growth. Propagation ends when no new edge or sink is added.

## Regression tests and adversarial results

The committed guard suite increased from **29** to **61** tests.

New permanent coverage includes every required reverse-context fixture plus local and imported safe cases, a literal canonical mapping, cycles, recursion, circular imports, deterministic repeats, shuffled input order, and parse failure.

Independent clean-context results:

| Probe set | Result |
| --- | ---: |
| Previous independent guard categories | **18/18 detected** |
| Direct computed-property variants | **16/16 rejected** |
| Alternate-location probes | **9/9 detected** |
| Reverse-context A-N matrix | **14/14 rejected** |
| Safe nonclinical fixtures | **4/4 accepted** |
| Committed guard suite | **61/61 passed** |
| GP explicit mapping contract | **47/47 passed** |

Tests assert the intended computed-flow or sink diagnostic, not merely a non-zero process exit.

## Synthetic positive path

A synthetic, nonclinical contract fixture supplied one workflow, one item, one source, one exact section, valid source/section hashes, and every literal canonical mapping field. It passed explicit mapping validation, immutability checks, static data-flow inspection, and exact-key reconciliation.

| Layer | Temporary count |
| --- | ---: |
| Canonical ledger representation | 1 |
| Persisted representation | 1 |
| Workflow support representation | 1 |
| Guard inspection representation | 1 |
| Explicit ledger representation | 1 |
| Runtime representation | 1 |

Temporary result: **`1 / 1 / 1 / 1 / 1 / 1`**.

The fixture existed only in memory and was removed. Final repository reconciliation is **`0 / 0 / 0 / 0 / 0 / 0`**.

## Clinical and accounting invariants

| Measure | Final unchanged value |
| --- | ---: |
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
| Unique reviewed sources | 222 |
| Unique reviewed sections | 685 |
| Active exclusions | 12 |

- Workflows 0001-0675 remain terminal.
- Workflows 0676-1500 remain `research_interrupted`.
- The next workflow remains `gp-home-glucose-log-review`.
- Source hashes, section hashes, workflow hashes, evidence hashes, specialty-index hashes, manifest counts, and restart/checkpoint counts remain valid.
- `public/data` remains identical to stable main.
- No clinical or accounting record changed.

## Validation results

| # | Command | Exit | Result |
| ---: | --- | ---: | --- |
| 1 | `npm run test:gp-batch-support-contract` | 0 | PASS - 47/47 |
| 2 | `npm run audit:explicit-mapping-contract` | 0 | PASS - guard 61/61 and six-layer zero reconciliation |
| 3 | `npm run validate:data` | 0 | PASS - 1,500 workflows, 12 exclusions |
| 4 | `npm run validate:source-evidence` | 0 | PASS - 1,500 records, 224 sources |
| 5 | `npm run validate:item-provenance` | 0 | PASS - 83,303 items, 0 source-derived |
| 6 | `npm run audit:no-generic-templates` | 0 | PASS |
| 7 | `npm run audit:exact-source-coverage` | 1 | EXPECTED CLINICAL BLOCKER |
| 8 | `npm run audit:source-recency` | 0 | PASS |
| 9 | `npm run audit:uae-applicability` | 1 | EXPECTED CLINICAL BLOCKER - 601 findings across 576 workflows |
| 10 | `npm run audit:unsupported-legacy-content` | 1 | EXPECTED CLINICAL BLOCKER - 83,303 items |
| 11 | `npm run audit:research-claims` | 0 | PASS |
| 12 | `npm run test:safety` | 0 | PASS - 16 tests |
| 13 | `npm run test:all-workflows` | 0 | PASS |
| 14 | `npm run test:output-safety` | 0 | PASS |
| 15 | `npm run test:exclusions` | 0 | PASS - 12 active, 0 proposed |
| 16 | `npm run verify:source-evidence-hashes` | 0 | PASS - 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes |
| 17 | `npm run verify:clinical-data-reproducibility` | 0 | PASS - `public_data_changed: false` |
| 18 | `npm run test:research-queue` | 0 | PASS - 12/12; queue not executed |
| 19 | `npm run lint` | 0 | PASS with pre-existing Impeccable warnings only |
| 20 | `npm run build` | 0 | PASS |

Only the three permitted clinical blocker audits remain blocked.

## Final disposition

- Reverse-context blind spot repaired: **yes**.
- Cross-file and interprocedural propagation verified: **yes**.
- Unresolved mapping flow fails closed: **yes**.
- Safe disconnected nonclinical code preserved: **yes**.
- Clinical or accounting change: **none**.
- Public data change: **none**.
- Exclusion change: **none**.
- Research queue resumed: **no**.
- Push, deployment, merge, or rebase: **none**.

**Status: `REVERSE_CONTEXT_GUARD_REPAIR_COMPLETE_FINAL_REVIEW_REQUIRED`**

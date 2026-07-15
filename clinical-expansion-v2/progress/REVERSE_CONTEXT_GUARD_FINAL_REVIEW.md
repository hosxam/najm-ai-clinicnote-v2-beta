# Reverse-Context Clinical-Mapping Guard Final Independent Review

**Verdict: `FAIL_REVERSE_CONTEXT_GUARD_REQUIRES_FURTHER_WORK`**

The repair closes every required A-T flow when a computed-property hazard is already present and reaches an identifiable mapping sink. It also preserves the literal positive mapping path and all repository invariants. It is not, however, genuinely fail closed for every required unresolved flow, and it crashes on an `export *` re-export cycle. Four of nine required unresolved-flow probes escaped without diagnostics, two additional bare-module resolution probes escaped, and the required borderline unresolved flow was accepted. The research queue must not resume.

No production code, test, clinical record, mapping, status, accounting record, evidence record, public-data file, exclusion, workflow, or queue state was changed during this review. No defect was corrected.

## Repository verification

| Check | Result |
| --- | --- |
| Repository | `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2` |
| Branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | `36b80b746354a6fc44dcfcae6f02e52ebf9d12d1` |
| Pre-repair audit HEAD | `557beb24b028b0c69209133b75357bd1486afa1d` |
| Stable main | `95758951d46510f34548b5520510c5d9d59f017f` |
| Protected forensic branch | `guideline-expansion-1500-all-in-one` at `9b4cddb0fb226543ce621cb14a672a4edf789261` |
| Working tree before review | Clean |
| Repair commits in ancestry | `e79f0e1`, `164768a`, `36b80b7` |
| `public/data` versus stable main | Unchanged |
| Active exclusions | 12 |
| Workflows 0001-0675 | 675/675 terminal |
| Workflows 0676-1500 | 825/825 `research_interrupted` |
| Next workflow | `gp-home-glucose-log-review` |

Stable main and the protected forensic branch still point to their required commits. The repair range contains no clinical, mapping, workflow, status, accounting, source-evidence, application, public-data, or exclusion changes.

## Changed-file classification

Exactly four files changed between `557beb24b028b0c69209133b75357bd1486afa1d` and `36b80b746354a6fc44dcfcae6f02e52ebf9d12d1`.

| File | Classification | Assessment |
| --- | --- | --- |
| `scripts/source-first/computedMappingDataFlow.mjs` | data-flow guard implementation | In scope; independently inspected in full |
| `scripts/source-first/auditExplicitMappingContract.mjs` | package/script wiring | In scope; adds deterministic traversal and invokes the data-flow guard |
| `scripts/source-first/auditExplicitMappingContract.test.mjs` | guard test | In scope; independently inspected and executed |
| `clinical-expansion-v2/progress/REVERSE_CONTEXT_GUARD_REPAIR.md` | repair report | In scope; inspected but not treated as evidence |

Unrelated changed files: **0**.

## Data-flow implementation assessment

### Verified implementation properties

- Source entries and source files are normalised and sorted before analysis.
- Stable graph identities represent bindings, expressions, object/array containers, calls, function returns, imports, exports, and parse failures.
- Forward propagation covers declarations, ordinary aliases, assignments, spreads, nested properties, arrays, element/property access, `Object.assign`, conditionals, logical/binary expressions, arguments, parameters, returns, wrappers, named/default imports and exports, named re-exports, dynamic imports, and direct later computed assignments.
- Call-specific parameter summaries avoid globally tainting every invocation of a shared function.
- Sorted work queues and visited sets terminate ordinary graph cycles and produce stable diagnostics for the tested non-crashing inputs.
- Parse failures are converted into both a hazard and a sink, so parse failures fail closed.
- Relative unresolved imports and statically named unresolved dynamic imports are seeded as hazards.
- Hazard and mapping-identity propagation run to graph fixed points after call-summary construction.
- Caller-owned source-entry objects and strings remained unchanged across every independent probe.

### Blocking defects

1. **Aliased-object later assignment is one-way and escapes.** Declaration aliases create an initializer-to-alias edge at `computedMappingDataFlow.mjs:385`, but a later computed assignment seeds the alias binding at `computedMappingDataFlow.mjs:478` without propagating that mutation back to the original object. `alias[field] = value` followed by spreading `base` therefore produces no error.
2. **Unknown call results are not fail-closed hazards.** For an unresolved call, `computedMappingDataFlow.mjs:653` links the callee and arguments to the call result, but does not mark the result hazardous merely because the implementation is unavailable. A no-argument `loadRuntimePart()` result can therefore flow into a mapping object without a diagnostic.
3. **Unresolved array sources and conditional branches inherit the unknown-call gap.** Element access and conditional nodes only receive forward edges. If their input is an unknown call result with no hazard seed, the unresolved value reaches the mapping sink silently.
4. **Bare-module resolution failures are not seeded.** `computedMappingDataFlow.mjs:568` marks unresolved imports only when the specifier starts with `.`. Values and functions imported from unavailable bare-module specifiers can reach mapping sinks without a hazard.
5. **`export *` re-export cycles crash instead of failing closed.** At `computedMappingDataFlow.mjs:615`, `ts.isNamedExports(clause)` is called when `exportClause` is undefined for `export *`, causing `TypeError: Cannot read properties of undefined (reading 'kind')`. This violates the required termination and stable-diagnostic contract.

Because these paths are explicitly required by the review contract, the guard is not genuinely fail closed.

## Mapping-sink identification

Independent sink probes: **10/10 rejected for the intended data-flow reason**.

| Sink category | Result |
| --- | --- |
| Canonical mapping constructor | Rejected |
| Mapping validator | Rejected |
| Persisted mapping writer | Rejected |
| Runtime mapping emitter | Rejected |
| Explicit mapping ledger | Rejected |
| Workflow support field | Rejected |
| Research-record support field | Rejected |
| Mapping array/collection | Rejected |
| Exported neutrally named collection containing a mapping object | Rejected |
| Unknown helper where identity and hazard meet | Rejected |

The analyzer recognises the required identity fields and protected canonical fields, including the additional `jurisdictionApplicability` field. Structural identity propagation proves that sink detection is not limited to known helper names. The sink model is adequate once a hazard has been seeded; the blocking problem is unresolved values that never become hazards.

## Reverse-context A-T probes

All **20/20** prohibited A-T fixtures were rejected with a `reaches clinical mapping sink` data-flow diagnostic.

| Case | Flow | Result |
| --- | --- | --- |
| A | Pre-bound spread | Rejected |
| B | Pre-bound nested object | Rejected |
| C | Separate mapping-function argument | Rejected |
| D | One-hop alias | Rejected |
| E | Multi-hop alias | Rejected |
| F | Wrapper return | Rejected |
| G | Function parameter propagation | Rejected |
| H | Named import | Rejected |
| I | Named re-export | Rejected |
| J | Default import | Rejected |
| K | Statically discoverable dynamic import | Rejected |
| L | `Object.assign` | Rejected |
| M | Array-mediated flow | Rejected |
| N | Nested alias and spread | Rejected |
| O | Conditional-expression hazard | Rejected |
| P | Logical-expression hazard | Rejected |
| Q | Direct property assignment after declaration | Rejected |
| R | Two wrapper functions | Rejected |
| S | Value returned from one module and consumed by another | Rejected |
| T | Hazard stored in a container before reaching a sink | Rejected |

The original reverse-context A-N matrix was separately reconstructed and passed **14/14**.

## Unresolved-flow probes

Required unresolved-flow result: **5/9 rejected, 4/9 escaped**.

| Required case | Result |
| --- | --- |
| Runtime-computed field | Rejected |
| Unknown wrapper receiving a hazardous input | Rejected |
| Unresolved relative imported function | Rejected |
| Unresolved array index/source | **Escaped: no diagnostic** |
| Unresolved conditional branch | **Escaped: no diagnostic** |
| Unresolved dynamic import | Rejected |
| Computed assignment on an aliased object | **Escaped: no diagnostic** |
| Call result with unavailable implementation | **Escaped: no diagnostic** |
| Unknown intermediate where mapping identity and hazard meet | Rejected |

Additional resolution probes:

- Unresolved bare-module imported function: **escaped**.
- Unresolved bare-module imported value: **escaped**.
- Borderline unresolved no-argument call result spread into an identity-bearing mapping: **escaped**.

These are genuine fail-open results: every escaping source parsed successfully, no unrelated validator was involved, and the returned guard error list was empty.

## Cycles and fixed-point determinism

| Probe | Result |
| --- | --- |
| Cyclic aliases with a hazard | Rejected; terminated |
| Circular object references with a hazard | Rejected; terminated |
| Mutually recursive wrappers | Rejected; terminated |
| Circular named imports | Rejected; terminated |
| `export *` re-export cycle | **Crash: no fail-closed diagnostic** |
| Repeated execution | Identical result and metrics |
| Reversed file-discovery order | Identical diagnostics |
| Caller-owned input mutation | None observed |
| Safe disconnected cycle | Accepted |

Determinism is verified for all non-crashing probes, but the `export *` crash prevents an unconditional cycle/fixed-point pass.

## Safe nonclinical flows

Provably disconnected safe flows: **6/6 accepted**.

- Local UI computed configuration.
- Chart computed configuration.
- Imported nonclinical computed configuration.
- Nonclinical multi-hop alias chain.
- Nonclinical wrapper return.
- Safe disconnected circular object graph.

Each safe case genuinely contained a runtime-computed property and remained disconnected from mapping identity, validators, support ledgers, persistence, runtime emission, and mapping collections. The separate borderline unresolved mapping flow was not rejected, so safe-case acceptance does not establish complete conservative resolution.

## Positive literal mapping path

One in-memory, synthetic, nonclinical mapping supplied every canonical literal field, valid synthetic source/section hashes, substantive mapping-specific applicability text, status, origin, and mapping version. Contract validation succeeded and returned frozen data.

| Layer | Temporary count |
| --- | ---: |
| Canonical representation | 1 |
| Persisted representation | 1 |
| Workflow support representation | 1 |
| Guard inspection representation | 1 |
| Explicit-ledger representation | 1 |
| Runtime representation | 1 |

Result: **`1 / 1 / 1 / 1 / 1 / 1`**, exact-key reconciliation true. Support accounting transitioned exactly once from unsupported to supported. The fixture was in memory only. Post-removal reconciliation was **`0 / 0 / 0 / 0 / 0 / 0`**.

Valid future mappings therefore remain representable. That does not cure fail-open unresolved flows.

## Committed guard-test review

- Committed suite result: **61/61 passed**.
- The new computed-flow tests invoke the data-flow analyzer directly and require the intended sink-reaching diagnostic, rather than any arbitrary non-zero result.
- Multi-file named/default import, re-export, circular-import, and dynamic-import fixtures are genuinely supplied to one TypeScript `Program`.
- The dynamic-import fixture uses a statically discoverable string-literal import.
- Alias fixtures contain the intended computed-property hazard.
- Safe fixtures genuinely contain computed properties and require an empty error list.
- Test fixtures are virtual source-entry objects, not filesystem files, so no committed-suite fixture cleanup is needed and no fixture survives the suite.
- Independent alternate-location probes used real temporary directories with `finally` cleanup; removal was verified.

Coverage gaps explain why 61/61 passes despite the blockers:

- No test assigns a computed property through an alias and later consumes the original object.
- No test requires a no-argument unknown call result to fail closed at a mapping sink.
- No test covers an unresolved array source or unresolved conditional branch without a pre-existing hazard seed.
- No test covers unavailable bare-module imports in mapping flow.
- No test covers an `export *` re-export or re-export cycle.

## Historical probe results

| Probe set | Result |
| --- | ---: |
| GP explicit mapping contract | 47/47 passed |
| Committed guard suite | 61/61 passed |
| Historical independent categories | 18/18 detected |
| Direct computed-property variants | 16/16 rejected |
| Alternate-location repository probes | 9/9 detected |
| Original reverse-context A-N | 14/14 rejected |
| Expanded reverse-context A-T | 20/20 rejected |
| Sink matrix | 10/10 rejected |
| Required unresolved-flow matrix | **5/9 rejected** |
| Additional unresolved bare imports | **0/2 rejected** |
| Hazardous cycle matrix | **4/5 completed and rejected; 1 crash** |
| Safe nonclinical matrix | 6/6 accepted |
| Positive literal canonical mapping | 1/1/1/1/1/1, then 0/0/0/0/0/0 |

The historical sets remain green, but the new required unresolved and re-export-cycle cases are blocking.

## Final mapping and collateral reconciliation

| Measure | Result |
| --- | ---: |
| Canonical supported mappings | 0 |
| Persisted supported mappings | 0 |
| Workflow supported mappings | 0 |
| Guard-inspected supported mappings | 0 |
| Explicit-ledger mappings | 0 |
| Runtime emitted mappings | 0 |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Exact-source workflows | 0 |
| Partial exact-source workflows | 576 |
| No-authoritative-source workflows | 99 |
| Research-interrupted workflows | 825 |
| Terminal workflows | 675 |
| UAE findings | 601 across 576 workflows |
| Registered sources | 224 |
| Registered exact sections | 709 |
| Unique reviewed sources | 222 |
| Unique reviewed sections | 685 |
| Reviewed-section references | 1,780 |
| Active exclusions | 12 |

Source registries, source sections, reviewed-section records, evidence hashes, manifest, checkpoint, restart state, workflows 0676 onward, workflow records, research records, `public/data`, and exclusions are unchanged from the frozen starting state. `public/data` also remains identical to stable main. The next workflow remains `gp-home-glucose-log-review`.

## Full validation

| # | Command | Exit | Result |
| ---: | --- | ---: | --- |
| 1 | `npm run test:gp-batch-support-contract` | 0 | PASS - 47/47 |
| 2 | `npm run audit:explicit-mapping-contract` | 0 | PASS - 61/61 and zero-set reconciliation |
| 3 | `npm run validate:data` | 0 | PASS - 1,500 workflows and 12 exclusions |
| 4 | `npm run validate:source-evidence` | 0 | PASS - 1,500 records and 224 sources |
| 5 | `npm run validate:item-provenance` | 0 | PASS - 83,303 items and 0 source-derived |
| 6 | `npm run audit:no-generic-templates` | 0 | PASS |
| 7 | `npm run audit:exact-source-coverage` | 1 | EXPECTED CLINICAL BLOCKER - 1,500 incomplete workflows |
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

Only the three permitted clinical blocker audits remain blocked. Repository validation does not override the independently reproduced guard defects because the committed suites do not cover those paths.

## Final decision

- Guard genuinely fail closed for all required mapping flows: **no**.
- Reverse-context A-T flows with seeded hazards: **yes, 20/20 rejected**.
- Required unresolved flows: **no, 4/9 escaped**.
- Re-export cycles terminate with stable diagnostics: **no, `export *` crashes**.
- Safe disconnected computed objects remain representable: **yes**.
- Valid literal future mappings remain representable: **yes**.
- Clinical/accounting collateral change: **none**.
- Research queue may resume: **no**.
- Research queue was not resumed.
- No push, deployment, merge, rebase, or clinical research occurred.

**Final verdict: `FAIL_REVERSE_CONTEXT_GUARD_REQUIRES_FURTHER_WORK`**

# Declarative Canonical Evidence-Mapping Architecture — Independent Review

**Review date:** 2026-07-15  
**Required branch:** `source-first-guideline-expansion-1500-v2`  
**Starting HEAD:** `1fff0018ddc4fa9191c68b025108ff67140fe1f3`  
**Pre-architecture HEAD:** `98167d898c2e83560b139fc4c2b38ffef8d2e2b2`  
**Stable main:** `95758951d46510f34548b5520510c5d9d59f017f`  
**Protected forensic branch:** `9b4cddb0fb226543ce621cb14a672a4edf789261`

## Verdict

**FAIL_DECLARATIVE_MAPPING_ARCHITECTURE_REQUIRES_FURTHER_WORK**

The repository is frozen at the expected state and the committed validation suite is green except for the three expressly permitted clinical blocker audits. The declarative architecture nevertheless fails independent security and integrity review. A production module can bypass the static guard and copy, append, stream, or asynchronously rename a valid JSON document into the canonical directory; the canonical loader accepts copied and hard-linked documents without serializer provenance. A temporary proof loaded one active synthetic mapping after an unflagged `copyFileSync` operation. The approved serializer is also non-idempotent, preserves caller-controlled mapping-field order, executes own accessor properties, and has no upper size bounds. The five reported reconciliation views are clones of one loader result rather than independently observed pipelines.

The research queue must not resume until these defects are corrected and independently re-audited.

## 1. Frozen Repository Verification

| Check | Result |
| --- | --- |
| Repository | `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2` |
| Branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | Exact match: `1fff0018ddc4fa9191c68b025108ff67140fe1f3` |
| Working tree before review fixtures | Clean |
| Stable main | Exact match: `95758951d46510f34548b5520510c5d9d59f017f` |
| Protected forensic branch | Exact match: `9b4cddb0fb226543ce621cb14a672a4edf789261` |
| Workflow count | 1,500 |
| Terminal workflows | 675 |
| Workflows 0001–0675 | Terminal: 576 partial exact-source, 99 no-authoritative-source |
| Workflows 0676–1500 | All 825 remain `research_interrupted` and non-terminal |
| Next workflow | `gp-home-glucose-log-review` |
| Canonical directory | `.gitkeep` only; zero JSON mapping documents |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Public data vs stable main | No differences |
| Active exclusions | 12; exclusion validator passed |

No workflow, research, source, review, audit, manifest, restart-state, public-data, or exclusion file differs between the pre-architecture HEAD and the reviewed HEAD. Temporary fixtures were created only under the operating-system temporary directory or as in-memory virtual source entries and were removed.

## 2. Changed-File Classification

All 27 files changed between `98167d898c2e83560b139fc4c2b38ffef8d2e2b2` and `1fff0018ddc4fa9191c68b025108ff67140fe1f3` were inspected.

### Canonical schema

- `clinical-expansion-v2/progress/CANONICAL_SUPPORTED_MAPPING_SCHEMA.json`
- `clinical-expansion-v2/schema/CANONICAL_MAPPING_FILE_SCHEMA.json`
- `scripts/source-first/canonicalMappingContract.mjs`

### Canonical store/loader

- `clinical-expansion-v2/canonical-mappings/.gitkeep`
- `scripts/source-first/canonicalMappingStore.mjs`
- `scripts/source-first/canonicalMappingLedger.mjs`
- `scripts/source-first/canonicalMappingReconciliation.mjs`

### Serializer

- `scripts/source-first/writeCanonicalMapping.mjs`

### Code-generation prohibition

- `scripts/source-first/auditExplicitMappingContract.mjs`
- `scripts/source-first/auditNoCodeGeneratedMappings.mjs`
- `scripts/source-first/correctGlobalMappingArchitecture.mjs`
- `scripts/source-first/correctGpMappings.mjs`

The two correction scripts are retirement stubs that throw immediately; they no longer emit mappings.

### Import/cycle handling

- `scripts/source-first/computedMappingDataFlow.mjs`

### Queue-contract separation

- `scripts/source-first/applyResearchBatch.mjs`
- `scripts/source-first/batches/gpBatchSupport.mjs`
- `scripts/source-first/batches/gpExplicitMappingContract.mjs`
- `scripts/source-first/researchBatchMappingContract.mjs`
- `scripts/source-first/researchQueue.mjs`
- `scripts/source-first/runCheck.mjs`

### Tests

- `scripts/source-first/auditExplicitMappingContract.test.mjs`
- `scripts/source-first/canonicalMappingFixture.test.mjs`
- `scripts/source-first/canonicalMappingSchema.test.mjs`
- `scripts/source-first/canonicalMappingSerializer.test.mjs`
- `scripts/source-first/declarativeMappingArchitecture.test.mjs`
- `scripts/source-first/researchQueue.test.mjs`

### Package-script wiring

- `package.json`

### Architecture documentation

- `clinical-expansion-v2/progress/DECLARATIVE_MAPPING_ARCHITECTURE.md`

### Unrelated changes

None. There were zero unrelated clinical, workflow, status, accounting, source-evidence, application, public-data, or exclusion changes.

## 3. Sole-Source and Consumer Analysis

### Current exact key reconciliation

The exact mapping-key arrays, not only their totals, were read from every reported view:

| View | Exact keys |
| --- | --- |
| Canonical JSON | `[]` |
| Persisted active | `[]` |
| Explicit ledger | `[]` |
| Guard inspected | `[]` |
| Runtime emitted | `[]` |

Current reconciliation is therefore `0 / 0 / 0 / 0 / 0`, and the current repository contains no active support.

### Active consumers traced

| Consumer | Observed behavior |
| --- | --- |
| `canonicalMappingStore.mjs` | Reads JSON files from the canonical directory and validates records. |
| `canonicalMappingLedger.mjs` | Delegates read, emit, and per-workflow queries directly to the store. |
| `canonicalMappingReconciliation.mjs` | Loads once, then clones the same array into all five named views. |
| `auditExplicitMappingContract.mjs` | Uses reconciliation and derives unsupported rows from canonical rows. |
| `applyResearchBatch.mjs` | Uses canonical rows for manifest-level supported count and derived unsupported count. |
| `runCheck.mjs` | Uses derived unsupported rows for the unsupported-content audit. |
| `writeCanonicalMapping.mjs` | Uses the store for validation and post-write re-reading. |

No application component, overlay generator, dashboard, or public-data generator was found consuming canonical mappings. `runtimeEmitted` is not an independently observed runtime output; it is a clone of the store result. Likewise, `persistedActive`, `explicitLedger`, and `guardInspected` are not independent reads or pipelines.

The current loader does not activate numbered batches, non-numbered batches, research records, candidate proposals, workflow arrays, progress metadata, old JSONL ledgers, correction ledgers, helper output, caches, or forensic snapshots. Those alternate sources are currently empty or rejected. However, the architecture does not establish controlled sole-source authority because arbitrary code can place a valid document in the canonical directory without the serializer and the loader will activate it.

### Future accounting inconsistency

`applyResearchBatch.mjs` writes workflow, research, audit, and execution-log supported counts as zero and writes all workflow items as unsupported. It separately derives only manifest-level support and unsupported totals from canonical rows. No synchronization path was found that promotes workflow/research summaries when a future canonical mapping is added. `auditExplicitMappingContract.mjs` reports `workflowSupportedMappings` from `views.persistedActive.length`, not from actual workflow item state. A future mapping can therefore produce apparently reconciled canonical totals while workflow and research summaries remain contradictory.

## 4. Canonical Format and Schema Findings

The document contract is strict at the top level: `schemaVersion`, `workflowId`, and `mappings`, with unknown properties rejected. Mapping records require the requested fields plus the repository contract's `jurisdictionApplicability` field. Unknown and missing fields, symbols, nulls, empty strings, whitespace-only strings, invalid enums, generic rationale text, unsupported versions, placeholders, cross-workflow items, unknown sources, wrong-source sections, unreviewed sections, bad hashes, duplicate keys, and conflicting item mappings were rejected in temporary tests.

Filename and directory checks reject mismatched workflow filenames, duplicate workflow documents, nested entries, backup files, hidden files other than `.gitkeep`, unsupported extensions, and unexpected directory entries.

### Schema defect: unbounded input size

The schema has minimum lengths but no `maxLength`, `maxItems`, document-size, or mapping-count bound. An otherwise valid synthetic mapping with an applicability rationale approximately 2,000,334 characters long was accepted and validated. This fails the requirement that dangerous or excessively large canonical input fail closed and creates memory/CPU denial-of-service exposure.

## 5. Raw JSON Parsing Edge Cases

Independent raw-text tests produced these results:

- Duplicate top-level `workflowId` and `mappings` keys: rejected for both identical and conflicting values.
- Duplicate mapping `itemId`, `sourceId`, and `applicabilityRationale` keys: rejected for both identical and conflicting values.
- Unicode-escaped duplicate property names: rejected.
- Unicode-confusable or differently normalized unknown keys: rejected by exact schema ownership, though not normalized into a duplicate diagnostic.
- UTF-8 BOM: rejected.
- Comments and trailing commas: rejected.
- `NaN` and `Infinity`: rejected.
- Prototype-related `__proto__`, `constructor`, and `prototype` properties: rejected end-to-end as unexpected schema fields.
- Excessive nesting: rejected, but by an uncontrolled `RangeError` rather than a stable architecture diagnostic.
- Malformed UTF-8: rejected where the fixture could be represented by the test infrastructure.
- Excessively large strings: **accepted**, which is a defect.

The TypeScript JSON parser is used before `JSON.parse`, so duplicate raw keys are detected rather than silently overwritten by `JSON.parse`'s last-key behavior.

## 6. Serializer Findings

### Controls that worked

- A complete synthetic mapping passed workflow/item/source/section/hash/applicability validation.
- Partial records, unexpected properties, array fragments, inherited objects, direct function values, generic rationale, shared defaults, wrong workflow items, unknown sources, unreviewed sections, and wrong hashes were rejected.
- The writer uses a temporary file plus rename, re-reads the output, reloads the directory, and removes temporary files on handled failure.
- It does not implicitly edit research records, workflow statuses, or unrelated support records.
- A conflicting duplicate is rejected rather than overwritten.

### Serializer defects

1. **Repeated identical writes are not idempotent.** The second identical call throws `mapping already exists`.
2. **Field order is caller-controlled.** Two semantically identical mappings supplied with different own-property insertion order produce different JSON bytes because the validated mapping is cloned without canonical field projection before `JSON.stringify`.
3. **Executable accessors are accepted.** An own getter on `evidenceRelationship` passed the plain-object check, executed three times during validation/serialization, and produced a written mapping. The serializer checks object prototypes and symbols but not own property descriptors.
4. **Input size is unbounded.** The serializer inherits the missing schema size limits.
5. **Write authority is importable.** The serializer is an exported general function. The static guard blocks ordinary imports but can be bypassed with a query/hash-suffixed module specifier or re-export.
6. **Atomicity lacks reparse-point/race protection.** The temporary-write/rename helper does not pin a directory handle, reject reparse-point roots, or protect against directory replacement between validation and rename.

## 7. Filesystem and Path Security

### Rejected

- `../` traversal and absolute/alternate-drive values supplied as workflow IDs.
- Forward- and backslash separators, encoded separator forms, and null-byte-like workflow IDs.
- Arbitrary output directories unless the explicit synthetic-test flag is supplied.
- Missing canonical directory, nested files, hidden/backup files, unsupported extensions, and unexpected entries.
- Conflicting repeated writes.
- Temporary files were not left behind after controlled failures.

### Failed security requirements

- A valid document written outside the store and copied with `copyFileSync` into a temporary canonical directory loaded as one active mapping.
- A hard link to a valid external document loaded as active canonical content.
- A junction/reparse-point canonical root was accepted, and the serializer wrote through it.
- The static guard did not flag `copyFileSync`, `appendFileSync`, `createWriteStream`, asynchronous rename, split-string canonical paths, or writes to an alternate active-support directory.
- A per-file symlink probe could not be created under the Windows test environment because the operating system returned `EPERM`; the code would treat a symlink directory entry as unexpected, but root-junction acceptance remains proven.
- No protection exists against canonical-directory replacement or validation/rename races.
- A malformed file reached through an absolute Windows path failed closed but surfaced a TypeScript internal diagnostic (`Debug Failure. Expected C:/... === C:\...`) rather than a stable controlled error.

The approved serializer is therefore not the only effective writer.

## 8. Canonical Loader Findings

The loader deterministically sorts entries and mappings, validates strict raw JSON and schema ownership, checks filename/workflow identity, validates workflow/item/source/section relationships and hashes, rejects duplicate mapping keys and conflicting workflow-item mappings, rejects unsupported schema versions, throws on malformed or unreadable input, does not use a previous-run cache, and returns deeply frozen cloned records. Repeated clean loads were identical, and shuffled file-creation order did not affect output.

The loader nevertheless trusts any structurally valid file found in the directory. It has no serializer provenance, signature, creation ledger, inode/link check, canonical-root realpath check, or reparse-point check. Copied, hard-linked, and junction-routed files are accepted. This is the decisive integrity failure because the guard does not cover all filesystem write mechanisms.

## 9. No-Code-Generated-Mappings Guard

The committed audit reported 133 production files inspected, nine allowlisted infrastructure files, and zero code-generated mappings. It catches ordinary mapping-shaped literals, many spreads/aliases/wrappers, direct `writeFileSync`, synchronous rename, ordinary serializer/store imports, legacy support arrays, and common historical reactivation patterns.

Independent probes found no diagnostic for:

- `copyFileSync` into `canonical-mappings`.
- `fs.promises.rename` into `canonical-mappings`.
- `appendFileSync` into a canonical file.
- `createWriteStream` into a canonical file.
- A canonical path assembled from string fragments.
- A write into an alternate active-support directory when the payload is not visibly mapping-shaped.
- Re-exporting the serializer with a `#bypass` suffix.
- Dynamically importing the loader with a `?bypass` suffix.
- A complete mapping literal carrying `candidateStatus: "candidate_pending_review"`; the candidate-only exemption suppresses mapping-shape detection.
- A later-property-assembled mapping followed by append.

The guard's `codeGeneratedSupportedMappings` result is a literal zero returned by the scanner; the no-code guard itself does not load the canonical store as the decisive active-support source. A combined temporary proof showed zero guard diagnostics for `copyFileSync` followed by one loader-activated synthetic canonical mapping.

Accordingly, arbitrary production code **can** create active support by bypassing the guard and placing valid JSON in the canonical directory.

## 10. Bare Imports, Re-exports, and Cycles

Independent virtual-module probes confirmed:

- Unresolved bare side-effect import: rejected deterministically.
- Unresolved named/default import used in a mapping flow: rejected deterministically.
- Named re-export and multi-hop `export *` hazard: rejected.
- Circular `export *` and circular import graphs: analysis terminated without a crash and produced stable diagnostics regardless of input order.
- Unresolved dynamic import used in a mapping flow: rejected.
- **Standalone unresolved dynamic import in mapping infrastructure: accepted with zero errors.**
- **Standalone unresolved named import in mapping infrastructure: accepted with zero errors.**

The implementation terminates cycles through bounded fixed-point loops (`iteration <= sourceFiles.length` and `iteration <= resolvedCalls.length`). It does not implement explicit visited/in-progress module tracking as required. Termination is demonstrated, but fail-closed unresolved-module handling is incomplete.

## 11. Queue Research/Support Separation

The queue contract correctly:

- Accepts only `candidate_pending_review`, `unsupported_pending_review`, and `clinician_review_required` candidate statuses.
- Rejects all 11 canonical support fields on candidate proposals.
- Rejects executable-batch `mappings`, `legacy_item_support_mappings`, and non-empty historical `support_groups`.
- Returns frozen candidate records without `supportStatus`.
- Persists candidates only in research records.

Independent before/after validation left canonical mappings at `0` and unsupported items at `83,303`. Candidate proposals did not affect runtime mapping emission, exact item support, or canonical totals. The conceptual invariant `research completion != item-level evidence support` is preserved.

The queue separation is not sufficient to permit restart because the serializer/guard/store boundary is bypassable and future support-summary synchronization is incomplete.

## 12. Positive Synthetic Canonical-Mapping Path

A dedicated synthetic workflow, item, source, and reviewed section were created only in memory and in an operating-system temporary directory.

| Step | Result |
| --- | --- |
| First approved serializer write | Succeeded |
| Reported reconciliation | `1 / 1 / 1 / 1 / 1` |
| Synthetic unsupported rows after write | 0 |
| Repeated identical write | Failed with `mapping already exists`; not idempotent |
| Conflicting duplicate | Rejected |
| Controlled cleanup | Succeeded |
| Final reconciliation | `0 / 0 / 0 / 0 / 0` |
| Synthetic unsupported rows after cleanup | 1 |
| Temporary files remaining | 0 |

The `1 / 1 / 1 / 1 / 1` result is not independent reconciliation evidence: all five views are cloned from one loader call in `createCanonicalMappingViews`.

## 13. Negative Bypass Results

Committed tests reject common literal, spread, `Object.assign`, alias, array, conditional, wrapper, import, re-export, dynamic-import, progress-metadata, runtime-cache, historical-output, malformed-file, wrong-hash, wrong-item, and direct-write patterns. Equal totals with unequal exact keys are rejected when independently supplied views are passed to `reconcileCanonicalMappingViews`.

Independent tests exposed bypasses not represented by those fixtures:

- Copy, append, stream, asynchronous rename, split-path, query/hash module-specifier, alternate-directory, candidate-exemption, and later-assignment patterns escaped the guard.
- A copied valid synthetic JSON file became active support in the loader.
- The repository's real canonical count remained zero because all temporary fixtures were isolated and removed.

The required negative-bypass invariant is therefore false even though the committed bypass suite reports 26/26.

## 14. Allowlist Review

The production allowlist uses exact paths rather than broad directories:

| File | Reason |
| --- | --- |
| `auditExplicitMappingContract.mjs` | Repository mapping audit and reconciliation consumer. |
| `auditNoCodeGeneratedMappings.mjs` | Static architecture guard. |
| `canonicalMappingContract.mjs` | Field/version/key constants. |
| `canonicalMappingLedger.mjs` | Read/emit facade over the store. |
| `canonicalMappingReconciliation.mjs` | Reconciliation and derived unsupported accounting. |
| `canonicalMappingStore.mjs` | Canonical JSON loader and validator. |
| `computedMappingDataFlow.mjs` | Static import/data-flow analysis. |
| `writeCanonicalMapping.mjs` | Intended sole serializer. |
| `batches/gpExplicitMappingContract.mjs` | Explicit mapping validation and hashes. |

The two approved read-only consumers are `applyResearchBatch.mjs` and `runCheck.mjs`.

The allowlist is syntactically narrow, and no historical batch or application directory is broadly allowlisted. It still fails the security objective because non-allowlisted production code can use unrecognized filesystem APIs or module-specifier variants to acquire effective write/read authority. Test-only directory permission is also a caller-controlled boolean once serializer access is obtained.

## 15. Test-Quality Review

### Positive observations

- Schema tests exercise malformed and duplicate JSON rather than relying only on a zero-mapping repository.
- Serializer and architecture suites include a successful synthetic mapping path.
- Reconciliation has an exact-key mismatch test, not totals only.
- Data-flow tests exercise wrappers, imports, re-exports, and cycles and assert deterministic results.
- Queue tests reach the candidate-contract path.

### Deficiencies

- Serializer tests explicitly expect an identical second write to throw, contradicting the idempotency requirement.
- The reconciliation positive path uses five clones of one loader result and therefore cannot detect divergence among ledger, guard, persistence, and runtime consumers.
- Positive serializer/architecture tests do not wrap all fixture setup in `try/finally`; a failed assertion can bypass cleanup.
- Several negative helpers assert only that some error exists, not that the intended security rule caused rejection.
- There are no committed tests for copy, append, stream, asynchronous rename, split canonical paths, hard links, root junctions, accessor descriptors, oversized strings, canonical mapping-field order, or idempotent replay.
- Standalone unresolved named and dynamic imports are not tested.
- The no-code audit reports a hard-coded zero code-generated count rather than reconciling against an independent active-source observation.

The committed tests execute and pass, but they do not establish the architecture's claimed security boundary.

## 16. Full Validation Matrix

| # | Command | Result |
| --- | --- | --- |
| 1 | `npm run test:canonical-mapping-schema` | Pass: 9/9 |
| 2 | `npm run test:canonical-mapping-serializer` | Pass: 4/4 |
| 3 | `npm run test:declarative-mapping-architecture` | Pass: 26/26 |
| 4 | `npm run audit:no-code-generated-mappings` | Pass: 133 production files, 9 allowlisted files |
| 5 | `npm run verify:canonical-mapping-reconciliation` | Pass at current zero state: `0/0/0/0/0`, unsupported 83,303 |
| 6 | `npm run test:gp-batch-support-contract` | Pass: 47/47 |
| 7 | `npm run audit:explicit-mapping-contract` | Pass: 63/63 tests and repository audit |
| 8 | `npm run validate:data` | Pass: 1,500 workflows, 12 exclusions |
| 9 | `npm run validate:source-evidence` | Pass: 1,500 research records, 224 sources |
| 10 | `npm run validate:item-provenance` | Pass: 83,303 items, 0 source-derived items |
| 11 | `npm run audit:no-generic-templates` | Pass: 0 generic generated items |
| 12 | `npm run audit:exact-source-coverage` | Expected clinical blocker: 576 partial, 99 no-authoritative, 825 interrupted |
| 13 | `npm run audit:source-recency` | Pass: 224 exact sources checked |
| 14 | `npm run audit:uae-applicability` | Expected clinical blocker: 601 findings across 576 workflows |
| 15 | `npm run audit:unsupported-legacy-content` | Expected clinical blocker: 83,303 unsupported items |
| 16 | `npm run audit:research-claims` | Pass: 1,500 claims checked |
| 17 | `npm run test:safety` | Pass; 12 exclusions checked |
| 18 | `npm run test:all-workflows` | Pass: 1,500 workflows, overlays, and research records |
| 19 | `npm run test:output-safety` | Pass: 10 output-builder checks |
| 20 | `npm run test:exclusions` | Pass: 12 active, 0 proposed |
| 21 | `npm run verify:source-evidence-hashes` | Pass: 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes |
| 22 | `npm run verify:clinical-data-reproducibility` | Pass: 10 baseline files; public data unchanged |
| 23 | `npm run test:research-queue` | Pass: 13/13 |
| 24 | `npm run lint` | Exit 0; warnings only in vendored `.agents/skills/impeccable` detector code |
| 25 | `npm run build` | Pass |

Twenty-two commands passed. The only nonzero commands were the three explicitly permitted clinical blocker audits. This does not override the independently demonstrated architecture defects.

## 17. Final Reconciliation and Collateral Verification

| Metric | Final value |
| --- | --- |
| Canonical JSON mappings | 0 |
| Persisted active mappings | 0 |
| Explicit-ledger mappings | 0 |
| Guard-inspected mappings | 0 |
| Runtime-emitted mappings | 0 |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Exact-source-verified workflows | 0 |
| Partial exact-source workflows | 576 |
| No-authoritative-source workflows | 99 |
| Interrupted workflows | 825 |
| Terminal workflows | 675 |
| UAE findings | 601 across 576 workflows |
| Registered sources | 224 |
| Registered exact sections | 709 |
| Reviewed section references | 1,780; 685 unique section IDs |
| Workflow hashes | 1,500 |
| Evidence hashes | 1,500 |
| Active exclusions | 12 |
| Next workflow | `gp-home-glucose-log-review` |

All source registries, research files, workflow files, audit ledgers, unsupported rows, evidence hashes, manifest metrics, restart state, public data, and exclusion configuration remain unchanged. Workflows 0676 onward remain untouched. The final pre-report working tree was clean.

## 18. Required Conclusions

- **Can arbitrary production code create active support?** Yes. An unflagged filesystem-copy path produced one loader-active synthetic mapping in an isolated temporary store.
- **Is canonical JSON genuinely the sole controlled active source?** No. It is the only currently consulted storage directory, but it is not protected as the sole authorized source or writer.
- **Are valid future mappings representable?** A first valid mapping is representable, but replay is non-idempotent, serialization is not byte-deterministic across field order, consumer reconciliation is not independent, and summary synchronization is incomplete.
- **May the research queue resume?** No.

Minimum remediation must cover serializer provenance or an equivalent enforceable write boundary, all filesystem mutation APIs and path indirections, reparse/hard-link handling, idempotent deterministic serialization, accessor rejection, size limits, independent consumer reconciliation, unresolved-module fail-closed behavior, and tests that directly prove each corrected invariant.

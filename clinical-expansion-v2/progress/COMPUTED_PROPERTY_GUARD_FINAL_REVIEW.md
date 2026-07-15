# Computed-Property Mapping-Guard Final Independent Review

**Verdict: `FAIL_COMPUTED_PROPERTY_GUARD_REQUIRES_FURTHER_WORK`**

The repair correctly closes the originally reported shorthand computed-property bypass and passes its committed and previously defined independent probe suites. However, the AST implementation does not propagate mapping context backward from a mapping consumer to a separately bound object used through a spread or function argument. An unresolved computed property in that pre-bound object can therefore reach a mapping-like object or mapping pipeline without either the AST or regex layer reporting an error. This violates the required fail-closed spread/context behaviour, so routine research must not resume.

No defect was corrected during this review.

## Repository verification

| Check | Result |
| --- | --- |
| Repository | `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2` |
| Branch | `source-first-guideline-expansion-1500-v2` |
| Starting HEAD | `f6e19f3883d261e6d42a27fe60e5a3d637960f85` |
| Pre-repair audit HEAD | `51859a930dc67afba09b3783583bb6cf8309a037` |
| Working tree before review | Clean |
| Stable main | `95758951d46510f34548b5520510c5d9d59f017f` |
| Protected forensic commit | `9b4cddb0fb226543ce621cb14a672a4edf789261` |
| `public/data` versus stable main | No difference |
| Active exclusions | 12 |
| Terminal workflows 0001–0675 | 675 |
| Workflows 0676–1500 | 825 `research_interrupted` |
| Next workflow | `gp-home-glucose-log-review` |

## Changed-file inspection

Exactly three files changed between `51859a930dc67afba09b3783583bb6cf8309a037` and `f6e19f3883d261e6d42a27fe60e5a3d637960f85`.

| File | Classification | Assessment |
| --- | --- | --- |
| `scripts/source-first/auditExplicitMappingContract.mjs` | AST guard implementation | In scope |
| `scripts/source-first/auditExplicitMappingContract.test.mjs` | Guard regression test | In scope |
| `clinical-expansion-v2/progress/COMPUTED_PROPERTY_GUARD_REPAIR.md` | Repair documentation | In scope |

Unrelated files: **0**. No clinical, workflow, mapping, status, accounting, application, public-data, or exclusion change was found.

## AST implementation assessment

### Verified behaviour

- JavaScript, MJS, CJS, JSX, TypeScript, and TSX source files in repository scan scope are parsed through the TypeScript AST.
- Canonical mapping fields and legacy identity aliases are protected.
- Direct identity fields, protected fields, statically resolvable spreads, and mapping/support/evidence/clinical/provenance/identity context names establish mapping context.
- Safe `const` literals, aliases, string concatenations, and template expressions resolve statically.
- Unresolved computed properties fail closed when they occur directly inside an already recognised mapping-like object.
- Nested object literals inherit mapping context when they are syntactic descendants of that object.
- Direct objects in assignments, arrays, returns, exports, inline function arguments, and wrapper returns are inspected.
- AST errors are accumulated before the older regex checks; the regex layer cannot remove or approve an AST rejection.
- Exact-key runtime and persisted reconciliation remains independent of the current zero-mapping state.

### Blocking context-propagation defect

The implementation inspects a spread binding's object shape to discover known identity/protected fields, but it does not visit that binding's initializer with the consuming mapping object's context. Likewise, a pre-bound object passed as an identifier into a mapping function is not revisited with call-site mapping context.

The following temporary probe returned **no AST error and no static guard error**:

```js
const field = getFieldAtRuntime()

const applicability = {
  [field]: value,
}

const mapping = {
  workflowId,
  itemId,
  sourceId,
  sectionId,
  ...applicability,
}
```

The nested equivalent also returned no error:

```js
const field = getFieldAtRuntime()
const leaf = { [field]: value }
const applicability = { ...leaf }

const mapping = {
  workflowId,
  itemId,
  sourceId,
  sectionId,
  ...applicability,
}
```

A pre-bound function-argument form also returned no error:

```js
const field = getFieldAtRuntime()
const payload = { [field]: value }
persistClinicalMapping(payload)
```

In each case, the computed key is unresolved, the object is indirectly consumed by a clinical mapping path, and the guard should reject rather than guess. The object initializer is visited initially without mapping context; resolving the identifier later does not propagate the consumer context back into that initializer. This is a fail-open path under the stated contract.

## Original bypass and computed variants

The original shorthand bypass is fixed:

```js
const field = "uaeApplicability"
const mapping = { [field]: value, workflowId, itemId, sourceId, sectionId }
```

Independent direct AST results:

| Probe | Result |
| --- | --- |
| Original shorthand computed property | Rejected specifically by AST computed-property rule |
| Direct computed literal | Rejected |
| Const alias | Rejected |
| Template literal | Rejected |
| String concatenation | Rejected |
| Computed identity field | Rejected |
| Nested applicability | Rejected |
| Identity spread plus computed field | Rejected |
| Wrapper return | Rejected |
| Exported object | Rejected |
| Exported array | Rejected |
| Unresolved function parameter in direct mapping object | Rejected fail-closed |
| Runtime-derived field in direct mapping object | Rejected fail-closed |
| Reverse spread with statically resolved protected key | Rejected |
| Nested identity spread plus direct computed key | Rejected |
| Inline object passed to mapping function | Rejected |

Required direct variants: **16/16 rejected**. The blocking failures arise only when the computed object is pre-bound and the mapping context exists at a later spread or argument consumer.

## Safe nonclinical and borderline behaviour

```js
const key = "displayName"
const uiConfig = { [key]: "Example" }
```

Result: **accepted**, because the object has no mapping identity, protected field, mapping-path context, persistence, or support emission.

```js
const key = getFieldAtRuntime()
const clinicalCandidate = { [key]: "Example" }
```

Result: **rejected fail-closed**, because the variable context is explicitly clinical. Direct borderline handling is conservative; the gap is identifier-flow propagation from neutrally named pre-bound objects to later mapping consumers.

## Alternate-location and prior guard probes

- Previous independent guard categories: **18/18 detected**.
- Temporary repository-location scan: **9/9 detected**.
- Covered numbered batch, non-numbered early file, outside-batch file, alternate directory, dynamically loaded module source, renamed helper, nested wrapper, exported array, and runtime module path.
- All temporary directories and runners were removed.

## Committed test-quality review

- Committed suite: **29/29 passed**.
- Computed-property table tests invoke the static scanner with syntactically valid source and require the specific `computed clinical mapping properties are prohibited` error; they are not passing because of an unrelated non-zero result.
- The safe nonclinical test correctly requires an empty error list.
- Runtime/persisted set tests independently require exact-key mismatch errors.
- The tests use in-memory source strings, so no fixture cleanup is required for those cases.
- The suite covers shorthand, direct protected literal, alias resolution, unresolved direct key, computed identity, nested object, identity spread, wrapper return, template expression, exported array, dynamic module source, and safe nonclinical metadata.
- Concatenation was verified independently but is not a distinct committed regression case.
- The suite does not cover unresolved computed fields in a pre-bound object later spread into or passed into a mapping pipeline; therefore 29/29 does not establish complete fail-closed context propagation.

## Synthetic positive path

One isolated synthetic workflow, item, source, and exact section supplied every canonical literal field, valid hashes, mapping-specific applicability, substantive rationale, status, origin, and mapping version.

| Layer | Temporary count |
| --- | ---: |
| Canonical ledger | 1 |
| Persisted representation | 1 |
| Workflow support record | 1 |
| Guard inspection | 1 |
| Explicit ledger | 1 |
| Runtime emission | 1 |

Result: **PASS — `1 / 1 / 1 / 1 / 1 / 1`**, exact-key reconciliation true and returned mappings immutable. The fixture was synthetic only and was removed.

Final real-repository reconciliation after removal:

| Layer | Final count |
| --- | ---: |
| Canonical ledger | 0 |
| Persisted representation | 0 |
| Workflow support record | 0 |
| Guard inspection | 0 |
| Explicit ledger | 0 |
| Runtime emission | 0 |

## Collateral-change verification

| Measure | Result |
| --- | ---: |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Exact workflows | 0 |
| Partial workflows | 576 |
| No-authoritative-source workflows | 99 |
| Research-interrupted workflows | 825 |
| Terminal workflows | 675 |
| UAE findings | 601 across 576 workflows |
| Active exclusions | 12 |
| Registered sources | 224 |
| Registered exact sections | 709 |
| Unique reviewed sources | 222 |
| Unique reviewed sections | 685 |
| Reviewed-section references | 1,780 |

Source hashes, section hashes, 1,500 workflow hashes, 1,500 evidence hashes, 33 index hashes, manifest metrics, restart/checkpoint metrics, research records, workflow records, and `public/data` remain unchanged and validate. Workflows 0676 onward remain untouched. The next workflow remains `gp-home-glucose-log-review`.

## Validation results

| # | Command | Exit | Result |
| ---: | --- | ---: | --- |
| 1 | `npm run test:gp-batch-support-contract` | 0 | PASS — 47/47 |
| 2 | `npm run audit:explicit-mapping-contract` | 0 | PASS — committed guard 29/29 and current zero-set reconciliation |
| 3 | `npm run validate:data` | 0 | PASS |
| 4 | `npm run validate:source-evidence` | 0 | PASS |
| 5 | `npm run validate:item-provenance` | 0 | PASS |
| 6 | `npm run audit:no-generic-templates` | 0 | PASS |
| 7 | `npm run audit:exact-source-coverage` | 1 | EXPECTED CLINICAL BLOCKER |
| 8 | `npm run audit:source-recency` | 0 | PASS |
| 9 | `npm run audit:uae-applicability` | 1 | EXPECTED CLINICAL BLOCKER |
| 10 | `npm run audit:unsupported-legacy-content` | 1 | EXPECTED CLINICAL BLOCKER |
| 11 | `npm run audit:research-claims` | 0 | PASS |
| 12 | `npm run test:safety` | 0 | PASS |
| 13 | `npm run test:all-workflows` | 0 | PASS |
| 14 | `npm run test:output-safety` | 0 | PASS |
| 15 | `npm run test:exclusions` | 0 | PASS |
| 16 | `npm run verify:source-evidence-hashes` | 0 | PASS |
| 17 | `npm run verify:clinical-data-reproducibility` | 0 | PASS — public data unchanged |
| 18 | `npm run test:research-queue` | 0 | PASS — 12/12; queue not executed |
| 19 | `npm run lint` | 0 | PASS with existing warnings |
| 20 | `npm run build` | 0 | PASS |

The existing suites pass because they do not include the independently identified pre-bound reverse-flow cases. Passing repository validation does not override the fail-closed guard defect.

## Final decision

- Guard genuinely fail closed for all required mapping flows: **no**.
- Original shorthand computed-property defect fixed: **yes**.
- New blocking spread/argument context-propagation defect independently reproduced: **yes**.
- Clinical/accounting collateral change: **none**.
- Routine research may resume: **no**.
- Research queue was not resumed.
- No push, deployment, merge, rebase, or clinical research occurred.

**Final verdict: `FAIL_COMPUTED_PROPERTY_GUARD_REQUIRES_FURTHER_WORK`**

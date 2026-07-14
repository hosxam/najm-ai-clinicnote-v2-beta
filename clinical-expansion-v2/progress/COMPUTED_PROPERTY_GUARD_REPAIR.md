# Computed-Property Guard Repair

## Scope and frozen baseline

This repair addresses only the shorthand computed-property blind spot identified by the independent audit. The research queue was not resumed, no clinical research was performed, and no mapping, workflow evidence, research status, support accounting, application data, or exclusion configuration was changed.

- Branch: `source-first-guideline-expansion-1500-v2`
- Starting HEAD: `51859a930dc67afba09b3783583bb6cf8309a037`
- Stable main: `95758951d46510f34548b5520510c5d9d59f017f`
- Protected forensic commit: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- Previous independent guard result: **17/18**
- Previous committed guard tests: **17/17**

## Original missed syntax

```js
const field = "uaeApplicability"

const mapping = {
  [field]: "direct_uae",
  workflowId,
  itemId,
  sourceId,
  sectionId,
}
```

Before the repair, this exact shorthand form and eight equivalent computed-property variants produced no static guard error: **0/9 detected**.

## Root cause

The repository guard relied on source-text regular expressions for computed properties. Those expressions expected colon-form companion properties such as `workflowId: value`; shorthand identities such as `workflowId` did not match. Exact runtime and persisted-ledger reconciliation still returned a valid empty set, creating false confidence because the prohibited source form was never represented at runtime.

The defect was therefore static detection, not canonical validation or exact-key reconciliation.

## AST behaviour

### Before correction

- No syntax-tree inspection was performed.
- Computed fields were detected only when source text matched narrow regular expressions.
- Shorthand identities, nested applicability objects, wrapper returns, and some spread-backed identities could bypass static detection.
- Five-way zero reconciliation could pass independently of the missed syntax.

### After correction

- The guard parses JavaScript, JSX, TypeScript, and TSX using the existing TypeScript compiler dependency.
- Protected fields include every canonical mapping field plus legacy identity aliases.
- Mapping context is established by identity fields, protected fields, statically resolvable identity/protected spreads, or a known/potential mapping, support, evidence, clinical, provenance, or identity path.
- Static resolution is limited to safe `const` bindings, literal values, alias chains, string concatenation, and template expressions.
- Any computed property in a mapping-like object is rejected.
- An unresolved computed property in a mapping-like object fails closed; the guard does not guess its semantic key.
- Nested objects inherit mapping context, so nested applicability fields are inspected.
- Arrays, exports, wrapper returns, and dynamically loaded module source remain in repository scan scope.
- Existing regular-expression checks and exact canonical/persisted/explicit/workflow/runtime reconciliation remain intact and complementary.

## Files changed

- `scripts/source-first/auditExplicitMappingContract.mjs`
- `scripts/source-first/auditExplicitMappingContract.test.mjs`
- `clinical-expansion-v2/progress/COMPUTED_PROPERTY_GUARD_REPAIR.md`

## Computed-property verification

| Variant | Before | After |
| --- | --- | --- |
| Original shorthand variable key | missed | rejected |
| A. Direct computed protected string | missed | rejected |
| B. Const variable alias chain | missed | rejected |
| C. Shorthand identities plus `evidenceRelationship` | missed | rejected |
| D. Nested computed applicability | missed | rejected |
| E. Computed property after statically resolvable identity spread | missed | rejected |
| F. Computed mapping identity field | missed | rejected |
| G. Template-generated key | missed | rejected |
| G. Concatenated key | missed | rejected |
| H. Computed property in wrapper return | missed | rejected |
| Computed property in exported array | not covered | rejected |
| Computed property in dynamic clinical module source | not covered | rejected |
| Unresolved computed key in mapping-like object | not covered | rejected fail-closed |
| Nonclinical computed UI metadata outside mapping context | not covered | accepted |

- Expanded committed guard suite: **29/29 passed** (previously 17/17).
- Independent guard/reconciliation matrix: **18/18 passed** (previously 17/18).
- Expanded independent computed-property checks: **12 prohibited forms rejected; 1 safely distinguishable nonclinical form accepted**.
- Equal totals with different exact keys still fail reconciliation; computed syntax cannot conceal the mismatch.

## Synthetic positive path

An isolated temporary repository copy used one synthetic workflow, item, source, and exact section. The mapping supplied every canonical field literally, including hashes, evidence relationship, population, setting, jurisdiction, UAE applicability, substantive rationale, status, origin, and mapping version.

| Layer | Synthetic exact mappings |
| --- | ---: |
| Canonical ledger | 1 |
| Persisted research | 1 |
| Workflow provenance | 1 |
| Guard inspection | 1 |
| Explicit ledger | 1 |
| Runtime emission | 1 |

Canonical validation, persisted validation, static guard inspection, runtime emission, exact-key reconciliation, immutability, and single-occurrence support accounting all passed. The synthetic fixture used no real workflow or clinical evidence and was removed completely.

After fixture removal, the real repository returned to:

| Layer | Exact mappings |
| --- | ---: |
| Canonical ledger | 0 |
| Persisted research/workflow | 0 |
| Explicit ledger | 0 |
| Guard inspection | 0 |
| Runtime emission | 0 |

## Clinical and accounting invariants

| Measure | Unchanged result |
| --- | ---: |
| Supported mappings | 0 |
| Unsupported legacy items | 83,303 |
| Exact verified workflows | 0 |
| Partial workflows | 576 |
| No-authoritative-source workflows | 99 |
| Research-interrupted workflows | 825 |
| Terminal workflows | 675 |
| UAE findings | 601 across 576 workflows |
| Active exclusions | 12 |

- Workflows 0001–0675 remain terminal.
- Workflows 0676–1500 remain `research_interrupted`.
- Next workflow remains `gp-home-glucose-log-review`.
- Source records, reviewed sections, source hashes, section hashes, manifest clinical metrics, and restart-state clinical metrics are unchanged.
- `public/data` remains identical to stable main.

## Validation results

| # | Command | Exit | Result |
| ---: | --- | ---: | --- |
| 1 | `npm run test:gp-batch-support-contract` | 0 | PASS — 47/47 |
| 2 | `npm run audit:explicit-mapping-contract` | 0 | PASS — guard 29/29 and five-way zero reconciliation |
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
| 17 | `npm run verify:clinical-data-reproducibility` | 0 | PASS — `public_data_changed: false` |
| 18 | `npm run test:research-queue` | 0 | PASS — 12/12; queue not executed |
| 19 | `npm run lint` | 0 | PASS; pre-existing Impeccable skill warnings only |
| 20 | `npm run build` | 0 | PASS |

## Final confirmation

- No clinical mapping was added, restored, or changed.
- No workflow status or evidence record changed.
- No support-accounting value changed.
- No temporary fixture remains.
- `public/data` was not modified.
- Active exclusions remain exactly 12.
- The research queue was not resumed.
- No push, deployment, merge, or rebase occurred.

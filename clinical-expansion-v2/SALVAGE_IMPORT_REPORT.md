# Source-first salvage import report

## Baseline and preservation

- Stable starting commit: `95758951d46510f34548b5520510c5d9d59f017f`
- Failed experimental commit preserved unchanged: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- Rebuild branch: `source-first-guideline-expansion-1500-v2`
- Active `public/data/` and `public/config/limited_testing_exclusions.json` were not imported from the failed branch.
- No generated canonical workflow, first-pass audit, final audit, keyword mapping, search log, public-data export, or expanded exclusion list was imported.

The entries below were manually reviewed. “Imported” means the useful design was rebuilt or a narrowly verified code change was ported; no clinical conclusion from the failed branch was accepted.

## Imported or rebuilt infrastructure

| Failed-branch source path | Forensic classification | Imported | Modifications required | Clinical assumptions removed | Final purpose |
|---|---|---:|---|---|---|
| `clinical-expansion/schema/expanded_workflow.schema.json` | `preserve_as_governance_infrastructure` | Yes, rebuilt | Replaced the failed canonical schema with a source-first overlay schema and strict item provenance | Removed generated-template origins, inferred guideline provenance, and automatic readiness | `clinical-expansion-v2/schema/workflow.schema.json` |
| `clinical-expansion/schema/EXPANDED_WORKFLOW_SCHEMA.md` | `preserve_as_governance_infrastructure` | Yes, rebuilt | Rewrote definitions for exact legacy preservation, exact-section evidence, and clinical blockers | Removed claims that generated canonical data represented clinical expansion | `clinical-expansion-v2/schema/SOURCE_FIRST_SCHEMA.md` |
| `scripts/clinical-expansion/common.mjs` | `preserve_as_governance_infrastructure` | Yes, rebuilt | Kept deterministic JSON, hashing, and path concepts only | Removed dependencies on the failed canonical directory and generic generator | `scripts/source-first/common.mjs` |
| `scripts/clinical-expansion/exporter.mjs` | `preserve_as_governance_infrastructure` | Yes, rebuilt | Replaced public-data export with compact specialty index and hash generation | Removed permission to publish incomplete clinical content | `rebuildIndexesAndHashManifest()` in `scripts/source-first/common.mjs` |
| `scripts/initializeClinicalExpansion.mjs` | `preserve_after_minor_revision` | Yes, rebuilt | Initialises 1,500 exact legacy-preservation overlays and 1,500 empty research records | Removed “processed equals researched” semantics and all generic content creation | `scripts/initializeSourceFirstExpansion.mjs` |
| `scripts/clinical-expansion/auditEngine.mjs` | `preserve_after_minor_revision` | Yes, rebuilt | Split checks into source evidence, provenance, claims, gaps, output, exclusion, and reproducibility gates | Source gaps and partial applicability now block instead of passing with warnings | `scripts/source-first/runCheck.mjs` |
| `scripts/auditClinicalExpansion.mjs` | `preserve_after_minor_revision` | Yes, rebuilt | Replaced broad audit modes with explicit source-first commands | Removed source-family, registry-screened, keyword-mapped, and generated-content success paths | `scripts/source-first/runCheck.mjs` |
| `scripts/validateExpandedSchema.mjs` | `preserve_as_governance_infrastructure` | Yes, rebuilt | Validates required evidence and item fields without accepting unsupported origins | Removed acceptance of unverifiable generated provenance | `validate:source-evidence` and `validate:item-provenance` |
| `scripts/testAllWorkflows.mjs` | `preserve_as_governance_infrastructure` | Yes, revised | Checks 1,500 overlay/research pairs against stable main | Removed the failed assumption that all clinical arrays must already be remediated | `test:all-workflows` |
| `scripts/testOutputSafety.mjs` | `preserve_as_governance_infrastructure` | Yes, revised | Tests empty-output behavior, confirmed-fact parity, distinct SOAP/EMR formatting, and duplicate labels | Removed dependence on failed generated workflow content | `test:output-safety` |
| `scripts/testExclusions.mjs` | `preserve_as_governance_infrastructure` | Yes, revised | Verifies the original 12 active exclusions and separates proposed exclusions | Removed the 327 rule-generated active exclusions | `test:exclusions` |
| `scripts/verifyClinicalDataReproducibility.mjs` | `preserve_as_governance_infrastructure` | Yes, revised | Uses stable-main fingerprints and confirms no active clinical-data diff | Removed regeneration from unsupported canonical content | `verify:clinical-data-reproducibility` |
| `clinical-expansion/sources/authoritative_source_registry.json` | `preserve_after_minor_revision` | Structure only | Replaced the US-first combined registry with four jurisdiction/purpose-separated registries | No US clinical source record was imported as active Najm guidance | `clinical-expansion-v2/sources/*.json` |
| `package.json` | `preserve_after_minor_revision` | Yes, revised | Added only source-first commands; no Ajv or `tsx` dependency was added | Removed generic generator, remediation, and false completion commands | Source-first command surface |
| `src/lib/dataAdapter.ts` | `preserve_after_minor_revision` | Yes, narrow fix | Uses `history_layout_id` first, then specialty fallback | Did not import generated review metadata or optional public data | Correct existing history-layout lookup |
| `src/lib/outputBuilders.ts` | `preserve_after_minor_revision` | Yes, narrow fix | Separates examination/investigation labels and strips duplicated leading labels | No clinical content or management logic was added | Deterministic formatting and output safety |

## Reviewed but not imported

The following salvage-eligible artifacts were reviewed but rejected for this checkpoint:

- `.github/workflows/deploy.yml`: no deployment changes are appropriate on an incomplete clinical research branch.
- `.oxlintrc.json`: the current linter configuration is sufficient; no forensic-only ignore is needed.
- `clinical-expansion/conflicts/conflict_registry.json`: generated conclusions were tied to the failed dataset; a new empty JSONL conflict ledger is used instead.
- `clinical-expansion/inventory/*`: these represented failed-branch generated inventory conclusions; indexes are rebuilt from stable main.
- `clinical-expansion/migrations/*`: no public-data migration is allowed before all 1,500 workflows are processed and independently audited.
- `clinical-expansion/risk/proposed_additional_exclusions.json`: risk-rule proposals were not accepted; the new proposal file starts empty.
- `clinical-expansion/tests/test_results_manifest.json`: failed-branch pass claims were not accepted.
- `package-lock.json`: no new dependency is required.
- `scripts/finalizeClinicalExpansionGovernance.mjs`, `scripts/generateClinicalDataFromCanonical.mjs`, `scripts/generateClinicalExpansionReports.mjs`, `scripts/generateClinicalDataDiffSummary.mjs`, and `scripts/updateClinicalExpansionCompletion.mjs`: completion/export semantics were unsafe while source gaps remained.
- `scripts/normalizeAuthoritativeSourceRegistry.mjs`: the source-first registries are curated from exact official documents rather than normalized from a US-first registry.
- `scripts/testRoutes.mjs`: stable-main route behavior is already covered by existing validation and was not changed in this checkpoint.
- `scripts/testSafety.mjs` and `scripts/validateDataImport.mjs`: stable-main versions were retained; no failed-branch clinical assumptions were imported.
- `src/types/clinicnote.ts`: failed generated-governance metadata was not imported because no active public review metadata is generated.

## Outcome

The salvage operation is infrastructure-only. It does not claim that any workflow is clinically approved, fully guideline-expanded, or ready for merge. Exact-source gaps and absent qualified clinician review remain clinical blockers.

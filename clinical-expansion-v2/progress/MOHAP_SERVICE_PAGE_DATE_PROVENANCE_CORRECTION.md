# MOHAP service-page date provenance correction

## Scope and result

This correction is limited to the official MOHAP service page **Attestation of Medical Leaves and Reports** (`mohap-medical-leave-attestation-2026`). The page remains classified as an official UAE federal administrative service page, not a clinical guideline, law, regulatory effective-date notice, policy publication, or professional consensus statement.

No clinical research was conducted. Workflows 0776 onward were not processed or changed, and `gyn-menopause-symptom-review` remains the next workflow.

## Original error and official wording

Commit `0cbd76f23e812471a00a2076e4a95ec61db715d8` copied `2026-07-10` into `publication_date`, `effective_date`, and `revision_date`. The [official MOHAP page](https://mohap.gov.ae/en/w/attestation-of-medical-leaves-and-reports) displays only:

> Last updated on 10th Jul, 2026 at 19:04

The page does not identify that timestamp as its original publication date, service commencement date, legal or clinical effective date, or the effective date of underlying requirements. Treating a webpage footer update as any of those dates was therefore invalid.

The clock time was not added to structured metadata because the repository has no established webpage-update time field and the page provides no timezone.

## Source-schema convention and corrected values

The source registries have no dedicated JSON Schema. Existing active records represent an unstated official-page publication date as `undated_on_official_page`, an unknown effective date as `null`, and an unknown or inapplicable formal revision date as `null`. Source access and review remain separate in `recency_verification.verified_on` and `superseded_status_check.checked_on`.

| Field | Before | After |
| --- | --- | --- |
| `publication_date` | `2026-07-10` | `undated_on_official_page` |
| `effective_date` | `2026-07-10` | `null` |
| `revision_date` | `2026-07-10` | `null` |
| `webpage_last_updated_date` | absent; update date appeared only in version/recency text | `2026-07-10` |
| `recency_verification.verified_on` | `2026-07-15` | unchanged |
| `superseded_status_check.checked_on` | `2026-07-15` | unchanged |

The version and recency descriptions now explicitly call `2026-07-10` a **webpage last-updated date**. The stable source ID is retained as an opaque page-snapshot identifier; its `-2026` suffix does not assert publication, commencement, or legal effect and changing it would create unnecessary research-hash churn.

## Repository occurrence audit

The stopped checkpoint was searched before corrective artifacts were added for the source ID, exact URL, `2026-07-10`, `10 July 2026`, `10th Jul, 2026`, and affected publication/effective/version claims.

- At the stopped checkpoint, the source ID occurred in four files. The two workflow research records contain correct source references; the registry and replayable batch contained the defective dates.
- At the stopped checkpoint, the exact URL occurred in six files. Three research records and `batch-0736-0745.mjs` contain correct page-open or rejected-source references.
- At the stopped checkpoint, `2026-07-10` occurred only in the active registry and `batch-0726-0735.mjs`; their publication, effective, and revision assignments were incorrect, while their recency status was correct webpage-update metadata needing clearer labelling.
- At the stopped checkpoint, `10 July 2026` occurred only in version text in those same two source definitions; it is retained with explicit webpage semantics.
- `10th Jul, 2026`: no repository occurrence before this report; the wording above is historical provenance quoted from the official page.
- `2026-07-15`: correct access, recency-verification, supersession-check, and research-review date; unchanged.
- No false date appeared in workflow research evidence, reviewed-section records, UAE findings, audit ledgers, execution logs, hash manifests, execution manifests, restart state, indexes, checkpoint summaries, or generated audit outputs.
- New occurrences in this report and the regression test are historical before/after documentation or deterministic fixtures, not active source-date claims.
- Unrelated occurrences of other dates were not modified. No historical report was rewritten to conceal the original error.

## Files corrected

- `clinical-expansion-v2/sources/uae_clinical_sources.json`
- `scripts/source-first/batches/batch-0726-0735.mjs`

The following dependent records were inspected and required no content change:

- `clinical-expansion-v2/research/gp-school-or-work-absence-note.research.json`
- `clinical-expansion-v2/research/gp-sick-leave-extension-review.research.json`
- `clinical-expansion-v2/research/gp-travel-insurance-form.research.json`
- `scripts/source-first/batches/batch-0736-0745.mjs`

## Downstream impact

The correction does not change source content, exact sections, section relationships, population or setting assessment, service classification, or UAE applicability. The selected source supports only the administrative attestation content stated on the page and does not establish clinical incapacity, fitness, diagnosis disclosure, absence duration, service commencement, legal effect, or clinical assessment standards.

- `gp-school-or-work-absence-note`: remains `partial_exact_source_verified`.
- `gp-sick-leave-extension-review`: remains `partial_exact_source_verified`.
- `gp-travel-insurance-form`: opened and rejected the page as non-exact clinical authority and remains `no_authoritative_source_found`.
- Workflow statuses changed: **0**.
- Source selection or rejection decisions changed: **0**.
- UAE-applicability classifications changed: **0**.
- Document and section counts changed: **0**.
- Programme blocker totals changed: **0**.

Source-recency validation remains sound: the official page was actually opened on `2026-07-15`, the webpage update is recorded distinctly, and the unavailable publication/effective dates are no longer fabricated. `audit:source-recency` passes for all 235 registered sources without weakening the classifier.

Source registry and batch definitions are not inputs to `hash_manifest.json`; no workflow, research, specialty-index, or manifest hash needed recalculation. `verify:source-evidence-hashes` passes for 1,500 workflow hashes, 1,500 evidence hashes, and 33 index hashes. Hashes recalculated: **none**.

## Regression test

Added:

- `scripts/source-first/sourceDateSemantics.mjs`
- `scripts/source-first/sourceDateSemantics.test.mjs`
- `scripts/source-first/applyResearchBatch.mjs` enforcement for future source updates
- `scripts/source-first/runCheck.mjs` enforcement for active source-recency audits
- `package.json` npm command `test:source-date-semantics`

The deterministic test rejects `last updated`, `last updated on`, `modified`, `page updated`, and `content updated` labels when automatically assigned to publication, effective, service-commencement, or legal-effective fields. Active registry validation and future batch application also fail when a protected field duplicates a webpage-update date without separate explicit provenance. A narrowly structured provenance record permits genuinely documented same-day publication or effective dates, so the guard does not overwrite or broadly reject valid dates. The suite also checks both the active MOHAP registry source and replayable batch definition. Result: **PASS (6 tests)**.

## Validation

All 23 required commands were run. Twenty passed. Only the three pre-existing programme blockers remained blocked, unchanged:

- `audit:exact-source-coverage`: expected blocker; 1,500 workflows still lack complete exact-source coverage.
- `audit:uae-applicability`: expected blocker; 676 affected workflows, 701 findings, 652 partial-applicability findings, 49 missing-explicit-UAE-evidence findings, and 0 other findings.
- `audit:unsupported-legacy-content`: expected blocker; 83,303 unsupported legacy items.

Every other required command passed, including signed/canonical reconciliation, candidate separation, canonical write authority, no-code-generated mappings, data/source/provenance validation, source recency, research claims, safety, all-workflow and output tests, exclusions, evidence hashes, clinical-data reproducibility, research-queue tests, lint, and build. Lint exited 0 with 0 errors and 172 pre-existing warnings; no warning was introduced.

## Boundary confirmations

- Active supported mappings: **0**.
- Unsupported legacy items: **83,303**.
- Candidate proposals: **0**.
- Active exclusions: **12**, unchanged.
- Canonical directory, signed manifest, and detached signature: unchanged.
- `public/data`: unchanged and reproducible against stable main.
- Workflows 0001–0775: unchanged and terminal.
- Workflows 0776–1500: unchanged and `research_interrupted`.
- No research queue command was run.
- No canonical writer, signing, approval, push, deployment, merge, or rebase occurred.

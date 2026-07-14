# Checkpoint 0675 mapping and GP helper review

## Review status

**BLOCKED — explicit-input contract does not satisfy the continuation requirement.**

Research for workflows 0676–0725 was not started. The continuation brief requires work to stop if the GP helper can create clinical mappings without explicit workflow, source, section, item-ID, population, setting, and applicability inputs. The current helper does not meet that standard because it accepts exact text instead of explicit item IDs and supplies default setting and UAE-applicability text.

## Checkpoint verification

- Branch: `source-first-guideline-expansion-1500-v2`
- HEAD reviewed: `de1ca791d13a050e94ea65c40be7bd668feecc33`
- Terminal workflows: 675
- Next workflow: `gp-home-glucose-log-review`
- Stable main: `95758951d46510f34548b5520510c5d9d59f017f`
- Protected forensic branch: `9b4cddb0fb226543ce621cb14a672a4edf789261`
- `public/data/` matches stable main.
- Active exclusions remain 12 and the exclusion configuration matches stable main.
- Research queue tests pass: 11/11.

## Mapping correction review

Commit `e750982ad7a86c83ba6f59dfef43551556a644ac` changes one file and one source-section identifier:

- File: `scripts/source-first/batches/batch-0636-0645.mjs`
- Workflow: `gp-chest-discomfort-non-acute-review`
- Previous section ID: `dha-chest-pain-v2-red-flags`
- Correct registered section ID: `dha-chest-pain-v2-red-flags-referral`

The correction aligns the mapping with the already registered exact DHA chest-pain section. It does not change the source, supported exact-text set, population, workflow status, terminal-status logic, supported or unsupported accounting rules, application data, or exclusions. No fabricated source or section was introduced, and the queue rejected the invalid section before the correction was applied.

## GP helper review

Reviewed files:

- `scripts/source-first/batches/gpBatchSupport.mjs`
- `scripts/source-first/batches/authoredBatchSupport.mjs`
- `scripts/source-first/applyResearchBatch.mjs`
- `scripts/source-first/researchQueue.test.mjs`

### Controls that are present

- Each evidence group names a workflow, source, exact section, direct relationship, and exact legacy text.
- `supportTexts` resolves exact normalized text only within the named workflow and throws when requested text is absent.
- The apply step rejects unknown workflows, unknown sources, unknown source sections, missing mapped item IDs, and duplicate support mappings.
- Unmapped legacy items remain explicitly unsupported.
- Evidence workflows require at least one reviewed exact section.
- Generic diagnosis, investigation, treatment, medicine, dose, procedure, referral, escalation, discharge, and patient-instruction generation remains prohibited.
- The helper does not alter terminal-status classification logic, public application data, or exclusions.

### Blocking contract gaps

1. `gpEvidence` does not require explicit `setting_applicability`; it supplies a generic primary-care default.
2. `gpEvidence` does not require explicit `UAE_applicability`; it supplies a generic international-to-UAE adaptation default.
3. Evidence groups accept `exact_texts`, not explicit item IDs. Item IDs are resolved by `supportTexts`, so the caller does not provide or review the exact item-ID set as an input.
4. `evidenceWorkflow` does not explicitly validate non-empty workflow, population, setting, and UAE-applicability values before producing a record.
5. There are no dedicated tests for `gpBatchSupport.mjs` or `supportTexts`; existing queue tests cover orchestration, checkpointing, rollback, locking, and frozen-file behaviour rather than this helper contract.

Because the helper can therefore create a mapping record without caller-supplied item IDs, setting applicability, or UAE applicability, the explicit stop condition is met.

## Required remediation before continuation

- Require non-empty workflow ID, population applicability, setting applicability, and UAE applicability for every evidence workflow.
- Require caller-reviewed explicit item IDs, or introduce a separately reviewed compilation step whose generated item-ID list is checked into the batch and validated against the exact-text selection.
- Remove generic setting and UAE-applicability defaults from `gpEvidence`.
- Add focused tests proving omission of any required input fails before mutation.
- Add tests for unknown source, unknown section, missing item ID, duplicate item ID, unsupported-item preservation, and exact-text ambiguity.
- Re-run the full helper tests and queue dry run before authoring workflow 0676.

## Freeze confirmation

- No workflow 0676–0725 research was started.
- No clinical workflow, evidence record, source registry, manifest terminal status, or supported-item accounting was changed by this review.
- `public/data/` was not modified.
- `public/config/limited_testing_exclusions.json` was not modified.
- No push, deployment, merge, or rebase was performed.

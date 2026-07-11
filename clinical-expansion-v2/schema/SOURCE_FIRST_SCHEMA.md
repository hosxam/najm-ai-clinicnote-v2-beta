# Source-first workflow overlay schema

The source-first rebuild is an overlay on the stable 1,500-workflow beta dataset. It does not replace active application data during research.

## Clinical item rules

- Every clinical item has an explicit origin, source linkage, confirmation requirement, default state, and review status.
- `legacy_exact` means the text is copied exactly from stable main. It does **not** mean the text is guideline-verified.
- Legacy items without an exact source-section mapping remain `unsupported_legacy_review_required`.
- Every clinical item is unconfirmed and unselected by default in this overlay.
- `source_derived` is permitted only when both `source_ids` and `source_section_ids` identify reviewed exact evidence.
- No generated title-substitution origin is permitted.

## Research rules

- A workflow can claim completed research only when an official exact document and exact section were opened.
- Partial population or setting applicability is a clinical blocker.
- A source gap cannot be represented as a clean pass or limited-testing approval.
- All workflows require qualified clinician review, regardless of technical status.

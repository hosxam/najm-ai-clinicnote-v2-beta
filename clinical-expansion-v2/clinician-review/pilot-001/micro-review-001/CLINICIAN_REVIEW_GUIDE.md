# Qualified-clinician adjudication guide

This micro-review prepares decisions; it does not make them. All template rows begin at `pending_clinician_review` with blank decision, identity, date, comment, and revised wording fields.

## Approve candidate

Use `approve_candidate` only when the cited evidence directly supports the current item wording for the recorded population, setting, and jurisdiction.

## Approve with narrower wording

Use `approve_with_narrower_wording` when the source supports a narrower statement than the current item. Enter the complete proposed wording in `revised_item_wording`.

## Reject candidate

Use `reject_candidate` when the cited source does not support the item sufficiently. Rejection does not remove or publish content automatically.

## Request source recheck

Use `request_source_recheck` when the cited location is unclear, incomplete, inaccessible, or possibly misinterpreted. Set `source_recheck_required` to true and explain the reason in `clinician_comment`.

## Mark item unsupported

Use `mark_item_unsupported` when no reviewed source supports the item. Unsupported items cannot be promoted.

## Escalate safety review

Use `escalate_safety_review` for medication, emergency, red-flag, referral, diagnostic, or management content requiring specialist review. The row must already retain its safety-review flag, and `safety_escalation_required` must be true.

## Defer decision

Use `defer_decision` when the reviewer cannot confidently adjudicate the item. State what remains unresolved in `clinician_comment`.

## Mandatory boundaries

- Partial support is not full approval.
- Contextual support is not direct support.
- Clinician review does not automatically publish anything.
- Recorded approvals still require a separately authorised controlled import, validation, canonical transaction, and signing process.
- Do not expand dosing, diagnosis, treatment, or other clinical content beyond the cited evidence.
- Do not enter a signature in these files; no signature field is part of the decision schema.

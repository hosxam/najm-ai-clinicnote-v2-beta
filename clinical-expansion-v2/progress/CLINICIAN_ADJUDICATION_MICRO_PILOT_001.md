# Clinician Adjudication Micro-Pilot 001

## Scope and authority

- Branch: `clinician-review-adjudication-micro-pilot-v1`
- Starting HEAD: `375da17e905514771022b5d3b2c9bbe2d39877a3`
- Parent pilot: `clinician-review-item-mapping-pilot-001`
- Micro-review: `micro-review-001`
- Scope: exactly five existing pilot-001 workflows
- Authority: blank qualified-clinician decision preparation only

No decision, reviewer identity, approval, rejection, signature, revised wording, supported mapping, automatic importer, or production promotion was created.

## Selected workflows and accounting

| Workflow | Specialty | Items | Candidates | Partial | Contextual | Unsupported | Safety review | UAE candidates | International candidates |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `gp-chest-pain` | General Medicine / GP | 107 | 53 | 53 | 0 | 54 | 32 | 53 | 0 |
| `gp-shortness-of-breath` | General Medicine / GP | 106 | 52 | 33 | 19 | 54 | 32 | 0 | 52 |
| `gp-fever-urti` | General Medicine / GP | 127 | 0 | 0 | 0 | 127 | 38 | 0 | 0 |
| `peds-fever` | Pediatrics | 123 | 70 | 51 | 19 | 53 | 37 | 70 | 0 |
| `peds-poor-feeding` | Pediatrics | 96 | 27 | 27 | 0 | 69 | 22 | 0 | 27 |
| **Total** | **2 specialties** | **559** | **202** | **164** | **38** | **357** | **161** | **123** | **79** |

The queue has one decision row for every current item. Candidate rows use the existing pilot-001 candidate evidence; unsupported items remain visible and have blank candidate/source/location fields. Safety-critical items appear first in every workflow packet, followed by non-safety partial candidates, contextual candidates, and unsupported items. Partial and contextual candidates retain their original classifications; none is converted to direct support.

## Authoritative decision schema

`CLINICIAN_DECISION_SCHEMA.json` defines the exact decision-document and row fields. Every row carries the pilot and micro-review identities, workflow/item/candidate identity, immutable current wording and evidence snapshot, support and UAE classification, safety flag, blank clinician-controlled fields, decision status, and schema version.

Permitted clinician decisions are:

- `approve_candidate`
- `reject_candidate`
- `approve_with_narrower_wording`
- `request_source_recheck`
- `mark_item_unsupported`
- `escalate_safety_review`
- `defer_decision`

All 559 template rows remain `pending_clinician_review`. Decision, revised wording, clinician comment, source-recheck flag, safety-escalation flag, reviewer name, professional role, optional registration/licence identifier, and review date are blank. Approved decisions: 0. Rejected decisions: 0. Supported mappings: 0.

## Review files

- Manifest: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/MICRO_REVIEW_MANIFEST.json`
- Authoritative schema: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/CLINICIAN_DECISION_SCHEMA.json`
- JSON template: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/CLINICIAN_DECISIONS_TEMPLATE.json`
- Equivalent CSV template: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/CLINICIAN_DECISIONS_TEMPLATE.csv`
- Review guide: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/CLINICIAN_REVIEW_GUIDE.md`
- Five concise workflow packets: `clinical-expansion-v2/clinician-review/pilot-001/micro-review-001/workflows/`

The review guide distinguishes approval, narrower wording, rejection, recheck, unsupported, safety escalation, and deferral. It states that partial support is not full approval, contextual support is not direct support, clinician review does not publish anything, and any recorded approval still requires a separately authorised controlled import and validation process.

## Validation

The micro-pilot test suite passed 7/7 tests. It covers deterministic derivation, the exact five workflow IDs, CSV/JSON equivalence, future completed decision validation, mandatory reviewer identity/role/date, narrower wording, source-recheck rationale, retained safety escalation, unknown candidate rejection, and prohibition of promotion fields.

The default validator passed with:

- 5 workflows
- 559 exact item rows
- 202 valid candidate references
- 357 unsupported rows
- 559 pending decisions
- 0 approved decisions
- 0 rejected decisions
- 0 supported mappings
- CSV/JSON equivalence true
- candidate proposals unchanged
- protected paths unchanged

Validator commands:

- Untouched repository template: `npm run validate:clinician-adjudication-micro-pilot-001`
- Future JSON or CSV completed copy: `npm run validate:clinician-adjudication-micro-pilot-001 -- --input <path>`
- Tests: `npm run test:clinician-adjudication-micro-pilot-001`

The required 16-command matrix passed 16/16 in the requested order: signed and canonical reconciliation, candidate separation, write authority, no code-generated mappings, source evidence, item provenance, source recency, research claims, safety, exclusions, evidence hashes, clinical-data reproducibility, research queue, lint, and build. Lint completed with pre-existing warnings and no errors; a micro-validator unused import found during the matrix was removed and the micro tests and validator were rerun successfully.

Programme confirmations:

- Candidate proposal files remain 20 with 823 proposals; none changed.
- Signed/canonical reconciliation remains exact with zero supported mappings and 83,303 unsupported legacy items.
- Source recency passes for all 235 sources with 23 global rechecks due.
- Clinical reproducibility passes with unchanged public data, 151 replay modules, metadata fingerprint `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`, and replay-manifest fingerprint `53109420feff822fa7d82266c7a6325135b5092a7b3c2662f5055e8d995edbf0`.
- Workflows, source registries, exclusions, canonical files, approval manifest, detached signature, and signed state are unchanged.

## Recommended manual review sequence

1. Assign a qualified clinician and record their real name, professional role, optional registration/licence identifier, and actual review date only when they make a decision.
2. Review the 161 safety-critical rows first, prioritising emergency, red-flag, medication, referral, diagnostic, and management content; escalate to a suitable specialist when necessary.
3. Review partial-support candidates and verify that the cited evidence directly supports the complete current wording, population, setting, and jurisdiction before choosing approval.
4. Review contextual candidates separately; use narrower wording, rejection, recheck, or deferral unless direct support is genuinely established by the cited evidence.
5. Review every unsupported item and either keep it unsupported, escalate safety review, or defer; do not infer support from related items or general clinical knowledge.
6. Validate the completed JSON or CSV copy with the micro-pilot validator. Resolve all validation failures with the clinician; do not alter the validator to make decisions pass.
7. Conduct a separate, explicitly authorised review of outcomes before designing any controlled importer or considering pilot 002. A recorded clinician approval in this micro-review does not itself create a mapping or publish content.

## Boundary result

The micro-pilot is ready for manual qualified-clinician adjudication. It is not an approval artifact and is not suitable for production use. No push, deployment, merge, rebase, signing, approval, autonomous decision, or pilot 002 was performed.

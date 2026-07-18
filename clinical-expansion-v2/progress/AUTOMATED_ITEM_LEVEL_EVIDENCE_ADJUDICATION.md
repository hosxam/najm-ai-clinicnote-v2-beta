# Automated Item-Level Evidence Adjudication

## Scope and boundary

This is an automated first-pass evidence adjudication for the beta review dataset. It does not grant clinical approval, create canonical or signed mappings, alter workflow wording, or publish production data. Every result remains either human-review-required or `AI_VERIFIED_PENDING_CLINICAL_APPROVAL`.

- Required starting HEAD: `b9c525fd37806f92c45f67afb86a832cb3680a6f`
- Branch: `clinician-review-adjudication-micro-pilot-v1`
- Model version: `item-evidence-adjudicator-1.0.0`
- Adjudication schema: `1.0.0`
- Prompt/rule version: `deterministic-evidence-scope-v1`
- Input fingerprint: `ae67d3db528d873a3d481ea7aea201c85ba75570d8dfac1004250beb89815815`
- Output fingerprint: `edf2623e8b1299a9c9b8e815c50d82a86939dfe453ffebbd87d70130c28722f7`

The adjudicator compares item wording only with exact registered source sections available through committed item-level candidate links or explicit item source fields. It does not infer support from workflow-level status, source title, specialty, diagnosis similarity, or general medical knowledge. Items without an exact link are classified `no_evidence_link`.

## Reconciled totals

| Classification | Items |
|---|---:|
| Fully supported | 149 |
| Partially supported | 224 |
| Contextual only | 110 |
| Not supported | 340 |
| Conflicting evidence | 0 |
| Source inaccessible | 0 |
| No evidence link | 82,480 |
| **Total** | **83,303** |

Confidence totals:

- High confidence (≥0.90): 108
- Low confidence (<0.90): 83,195
- Human-review required: 83,195
- Safety-review required: 33,986
- AI verified pending clinical approval: 108
- Clinician approvals: 0

Every item has a deterministic adjudication record, stable item ID, classification, rationale, scope difference, confidence, UAE applicability, safety flag, human-review route, model version, and schema version. Partial results include a proposed narrower wording that is displayed but never applied automatically.

## Pilot quality-control comparison

The existing 25-workflow pilot was processed first and compared without copying its labels:

- Existing partial candidates: 713
- Existing contextual candidates: 110
- Existing unsupported items: 1,602
- Disagreements: 607

Comparison summary:

- Unsupported → unsupported: 1,602
- Contextual → fully supported: 19
- Contextual → unsupported: 55
- Contextual → partial: 22
- Contextual → contextual: 14
- Partial → partial: 202
- Partial → unsupported: 285
- Partial → fully supported: 130
- Partial → contextual: 96

The disagreements are expected from the stricter item-level rule: the prior pilot was candidate-oriented, while this pass requires an exact reproducible source section and compares the item wording itself. Representative samples and the full deterministic cross-tab are stored in `public/data-beta/adjudication/metadata.json` and `clinical-expansion-v2/progress/automated-item-level-adjudication/PILOT_COMPARISON.json`.

## Restartable processing

Processing ran in deterministic 25-workflow batches. Each checkpoint records the workflow range, item count, classification totals, failures, model/prompt versions, input fingerprint, output fingerprint, and completion state. The final checkpoint reconciles all 1,500 workflows and 83,303 unique items with no silent omissions or duplicate authoritative records.

## Beta UI changes

The existing `/beta` workflow review surface now displays:

- AI classification and confidence
- exact source title, URL, section, locator, and evidence extract where available
- rationale, wording scope difference, and proposed narrower wording
- UAE applicability, safety flag, and human-review reason
- filters for all seven classifications, low confidence, safety-critical, human-review-required, and AI-verified-pending-approval
- a default priority queue containing safety, low-confidence, partial/contextual, conflict, inaccessible, unsupported, and unlinked items
- a switch to inspect all items
- clinician decisions remain separate from AI adjudication and cannot sign, approve, or publish mappings

Local beta URL: `http://127.0.0.1:5174/#/beta` during the smoke check.

## Validation

Passed:

- `npm run validate:beta-item-evidence`
- `npm run test:beta-item-adjudication`
- `npm run build`
- `npm run lint` (repository/pre-existing warnings only)
- local beta browser smoke check of the beta banner, classification filters, priority queue, workflow 0001, AI rationale, confidence, evidence panel, and clinician decision controls

Existing protected checks remained unchanged and passed before this work: safety, all-workflows, output safety, data validation, source recency, and clinical-data reproducibility.

## Programme boundaries

- Mappings: 0
- Candidate approvals: 0
- Canonical state: unchanged
- Signed state: unchanged
- Stable `public/data`: unchanged
- Exclusions: 12 unchanged
- No workflow item text was overwritten
- No clinician identity or approval was fabricated
- No production deployment was performed

This report is a beta owner-review handoff only. High-confidence AI results still require qualified clinical approval before any future canonical mapping or production publication.

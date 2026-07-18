# Direct Guideline Curation Completeness Correction

## Audit of the previous pass

The previous pass did **not** inspect retained full guideline documents. Its 3,112 additions were generated from committed `evidence_items`, source `exact_sections`, and their concise `evidence_summary` / paraphrased summaries. Those records are authoritative references, but they are summaries rather than full guideline text, algorithms, tables, or complete safety statements. The output is therefore now explicitly fail-closed: no workflow is marked fully reconstructed or deployment-ready.

## Current reconstruction status

- Workflows accounted for: 1,500
- Fully reconstructed: 0
- Incomplete pending full-source inspection: 1,500
- Workflows with committed evidence summaries: 1,099
- Genuine committed source gaps: 401
- Newly registered sources: 0
- Legacy items retained: 0
- Legacy items rewritten: 0
- Legacy items provisionally excluded: 83,303
- Guideline-backed evidence summaries added: 3,112
- Final provisional evidence-summary item count: 3,112
- Average additions per workflow: 2.07
- Additions distribution: 401 workflows with 0; 70 with 1; 454 with 2; 332 with 3; 146 with 4; 55 with 5; 25 with 6; 9 with 7; 6 with 8; 2 with 9

The 83,303 exclusions are not represented as final clinical deletion decisions. They remain recorded in each workflow’s audit trail as legacy content awaiting a full-source comparison. They are excluded from the provisional corrected output so unsupported content is not presented as clinically valid.

## Section completeness audit

The deterministic completeness map evaluates intentional applicability and distinguishes covered committed evidence from missing full-source review. Aggregate results are:

| Section | Applicable | Covered by committed evidence | Missing full-source review |
| --- | ---: | ---: | ---: |
| Presenting history | 1,500 | 668 | 832 |
| Positive/negative symptoms | 1,500 | 628 | 872 |
| Risk factors | 803 | 649 | 154 |
| Red flags | 941 | 435 | 506 |
| Examination | 999 | 524 | 475 |
| Investigations | 791 | 732 | 59 |
| Assessment | 1,500 | 777 | 723 |
| Management options | 1,094 | 638 | 456 |
| Escalation/referral | 636 | 583 | 53 |
| Follow-up | 1,126 | 916 | 210 |
| Safety-netting | 941 | 325 | 616 |
| Patient advice | 457 | 271 | 186 |

No workflow with missing applicable sections is presented as complete. Empty/source-gap workflows remain visibly marked as source gaps.

## Deep automated sample

The samples below were compared against the committed source-summary records and legacy content. Because full documents were not retained, each remains incomplete and is not a claim of final clinical completeness.

| Workflow | Sources | Evidence summaries added | Legacy excluded | Covered/applicable sections | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| gp-fever-urti | 2 | 7 | 127 | 8/11 | Incomplete full-source review |
| gp-chest-pain | 1 | 4 | 107 | 5/9 | Incomplete full-source review |
| gp-shortness-of-breath | 1 | 4 | 106 | 6/10 | Incomplete full-source review |
| gp-abdominal-pain | 1 | 5 | 109 | 9/12 | Incomplete full-source review |
| peds-fever | 1 | 4 | 123 | 9/11 | Incomplete full-source review |
| peds-poor-feeding | 1 | 3 | 96 | 5/11 | Incomplete full-source review |
| obgyn-antenatal-followup | 1 | 3 | 117 | 9/12 | Incomplete full-source review |
| urgent-allergic-reaction | 2 | 4 | 83 | 10/11 | Incomplete full-source review |
| gp-diabetes-followup | 1 | 5 | 97 | 5/11 | Incomplete full-source review |
| uro-vasectomy-counseling-documentation | 0 | 0 | 51 | 0/4 | Genuine committed source gap |

Each added record includes source ID, title, URL, exact section locator, evidence extract, action, and rationale. No medication dose, referral threshold, timing, or emergency instruction is synthesized beyond the committed source summary.

## Validation and deployment boundary

- `npm run curate:direct-guideline-workflows` — PASS
- `npm run validate:direct-guideline-curation` — PASS
- `npm run validate:data` — PASS
- `npm run test:all-workflows` — PASS
- `npm run test:output-safety` — PASS
- `npm run audit:source-recency` — PASS
- `npm run verify:clinical-data-reproducibility` — PASS
- `npm run lint` — PASS with pre-existing warnings
- `npm run build` — PASS
- All workflow IDs unique and accounted for
- Every provisional added item resolves to a registered source and exact committed section
- No workflow is marked complete without full-source inspection
- Production `public/data` unchanged
- Canonical and signed state unchanged
- Mappings remain zero
- Clinician-review queue remains disabled

The local beta route is `http://localhost:5173/#/beta` when Vite is running. Deployment is intentionally blocked until full authoritative documents are inspected and the incomplete section flags are repaired by the automated pipeline. No owner adjudication is requested.

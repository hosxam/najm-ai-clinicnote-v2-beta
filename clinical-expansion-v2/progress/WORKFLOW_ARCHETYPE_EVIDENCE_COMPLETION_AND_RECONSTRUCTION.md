# Workflow Archetype, Evidence Completion, and Reconstruction

## Verdict

**BLOCKED — catalogue reconstruction is not complete.**

The global symptom-oriented blocker was corrected with archetype-specific
profiles, and the evidence-pack completion loop made measurable progress. The
remaining evidence gaps are genuine or require additional corpus search. No
unsupported clinical wording, final workflow status, clinician queue, beta
dataset, or deployment was produced.

## Scope and protected state

- Branch: `guideline-evidence-packs-and-reconstruction-v1`
- Starting HEAD: `ddca86d13f20ba2e32593a912223479517728d16`
- Original workflows: 1,500
- Exact next workflow: `anes-airway-plan-documentation-review`
- Source corpus: 235 sources
- Corpus fingerprint: `68217cba07c3426cf8913475e744ce715fb27acb3c88305020a04d8a05ce9498`
- Evidence-pack aggregate fingerprint: `888f2477590ef0b316f8ddd5956390062fc62fe4076b7f1e0a7c60abeb724ebc`
- New sources ingested: 0
- Production `public/data`: unchanged
- Canonical and signed state: unchanged
- Mappings/candidates: 0 / 0
- Exclusions: 12
- Deployment/push/merge/rebase/signing/approval: none

## Archetypes

The catalogue is classified into 18 archetypes. Counts are stored in
`guideline-workflow-resolution-v2/WORKFLOW_ARCHETYPE_MANIFEST.json` and
reconcile exactly to 1,500:

| Archetype | Count |
|---|---:|
| Acute symptom assessment | 450 |
| Administrative clinical documentation | 321 |
| Chronic-disease follow-up | 228 |
| Paediatric assessment | 91 |
| Result review | 95 |
| Post-procedure follow-up | 64 |
| Screening/preventive care | 55 |
| Anaesthetic assessment | 44 |
| Medication review | 40 |
| Procedure documentation | 29 |
| Counselling | 20 |
| Referral preparation | 20 |
| Emergency presentation | 20 |
| Antenatal care | 11 |
| Postnatal care | 6 |
| Airway-plan documentation | 4 |
| Specialist surveillance | 1 |
| Procedure preparation | 1 |

The first workflow is correctly classified as `airway_plan_documentation`; it
is not forced through an acute symptom template. Archetype manifest fingerprint:
`733cabbd929bab7cf6bfd5bab490d4b459f9ab6bea3ebed8b99046bcb319dc40`.

## Blocker reconciliation

| Initial blocker class | Count |
|---|---:|
| Initial strict-core blockers | 1,111 |
| False blockers corrected by archetype/profile | 393 |
| Genuine missing core evidence | 718 |
| Evidence-expansion workflows | 389 |

The 393 false blockers are recorded as both wrong-archetype and non-applicable
section corrections. They were not counted as resolved workflows: their next
blocker is exact item-evidence reconciliation.

## Evidence-pack completion

- Initial pending packs: 373
- Packs complete for mapped archetype profiles: 221
- Packs with evidence statements but missing mapped core coverage: 604
- Packs requiring additional corpus search: 373
- New sources ingested: 0
- Pack evidence statements changed: 0
- Pack fingerprints/locators preserved: yes

The completion checkpoint is
`guideline-evidence-packs-v1/EVIDENCE_PACK_COMPLETION_STATE.json` with state
fingerprint `e3d0a5d5aed407d118c6f72afb9bf4724b60fe710816491e0b86b70558275c4e`.

## Reconstruction status

The reconstruction worker processed all 1,500 IDs deterministically and
returned nonzero because progress cannot continue without exact evidence:

- `genuine_missing_core_evidence`: 718
- `evidence_pack_expansion_required`: 389
- `item_evidence_reconciliation_required`: 393
- Final statuses assigned: 0
- Active usable workflows: 0
- Inactive/retired workflows: 0
- Pending workflows: 1,500
- Final active items: 0
- Retained/rewritten/removed/added items: not generated
- Merged aliases: not generated

No workflow can receive a permitted final status until every retained, rewritten,
or added item has exact corpus evidence and every legacy item has a documented
decision. Accordingly, no beta catalogue was generated and no browser smoke
test was run.

## Validation

Passed:

- source corpus validation
- evidence-pack validation
- workflow-archetype validation
- workflow-evidence checkpoint validation
- source-recency audit
- clinical-data reproducibility
- data validation

The reconstruction command correctly returned `BLOCKED` rather than reporting
success with unchanged evidence or unresolved item-level support. Lint/build
remain available after the implementation changes; no production-facing data
was modified.

## Required continuation

The next bounded step is additional authoritative corpus search and ingestion
for the 373 empty packs and exact evidence expansion for the 604 mapped-pack
gaps. After each source change, rerun ingestion, pack validation, archetype
applicability, and reconstruction. Do not assign final statuses or generate a
beta dataset until all 1,500 workflows reconcile with exact item evidence.

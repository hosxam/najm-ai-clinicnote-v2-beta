# NAJM manual defect resolution v2

## Scope and checkpoint

- Branch: `beta-manual-defect-resolution-v2`
- Starting checkpoint: `c2258b5b6b07cc88e04adbaea77359576f6add6c`
- Prior deployed implementation used as reproduction baseline: `7893c1700bc0fb7ce62c207d7838d246847f2f30`
- Existing 433-record closure matrix was retained as the authoritative defect ledger and updated in place with resolution evidence.
- Workflow research and queue continuation were not used.

## Resolution architecture

The repair adds an evidence-gated structured-control layer to the existing interactive compiler. The layer covers age and units, sex and pregnancy context, encounter setting, onset/duration/severity/laterality, present/absent/unknown and normal/abnormal/not-assessed selectors, measured vital signs, examination findings, investigation values with units/date/comparison/interpretation, medication and allergy records, clinician assessment and plan, referral/disposition, follow-up, and safety-netting. A control is emitted only when an accepted statement in its owning evidence pack matches its declared anchor; each emitted control carries pack, statement, source, anchor, and transformation provenance.

Structured values are formatted into SOAP without source identifiers or guideline prose. Blank and documentation-status-only values are omitted; section routing follows the field SOAP destination; duplicate lines are removed case-insensitively; selected options do not leak unselected values. Inactive catalogue IDs fail closed before a workflow record can load. Drafts remain workflow- and mode-scoped with explicit reset/start-fresh behavior.

## Matrix result

| Status | Count |
|---|---:|
| `fixed_and_proven` | 376 |
| `already_fixed_and_reproduced` | 44 |
| `not_applicable_with_proof` | 13 |
| `partially_fixed` | 0 |
| `still_present` | 0 |
| pending/unprocessed/assumed-fixed | 0 |

All 433 records contain a root cause, a resolution evidence object, an automated test ID, and an exact post-repair output contract. The historical unresolved artifact now reports `count: 0` and points to the v2 resolution manifest.

## Dataset and provenance

- Active interactive workflows: 416
- Compiled fields: 4,191
- Evidence records retained separately: 75,484
- Resolution-wave structured fields: 471
- Selectable controls tested: 132
- Contradiction tests: 116
- Dedicated final-output cases: 15 workflow archetypes
- Fields added: 471 evidence-gated structured fields; fields removed: 0; fields relabelled: 0
- Structured components: age/unit, sex, pregnancy, onset/duration/severity/laterality, state selectors, vitals, examinations, investigations with value/unit/date/comparison/interpretation, medication/allergy entries, follow-up, disposition, procedure details
- Selectable tests: 132 selected and 132 unselected; suggestion-unconfirmed behavior is asserted as no preselection
- Workflow activations: 0; workflow deactivations: 0; exact unsupported routes remain fail-closed
- New source acquisitions: 0; all added controls use existing accepted evidence packs and statements
- Mappings/candidates changed: no
- Canonical, signed, exclusions, and `public/data` state changed: no

Artifacts are under `clinical-expansion-v2/progress/manual-defect-resolution-v2/`:

- `RESOLUTION_MANIFEST.json`
- `REPAIR_COMMITS.json`
- `FIELD_PROVENANCE.json`
- `SELECTABLE_CONTROL_TESTS.json`
- `CONTRADICTION_TESTS.json`
- `FIFTEEN_FINAL_OUTPUTS.json`
- `FINAL_VALIDATION.json`

## Validation

Passed on the resolution branch:

- `npm run validate:interactive-workflows`
- `npm run test:interactive-soap-all`
- `npm run test:interactive-clinical-repair`
- `npm run validate:interactive-accessibility`
- `npm run test:all-workflows`
- `npm run validate:source-evidence`
- `npm run validate:workflow-item-evidence`
- `npm run verify:clinical-data-reproducibility`
- `npm run lint` (existing repository warnings only)
- `npm run build:manual-defect-resolution`
- `npm run test:manual-defect-resolution`
- `npm run test:resolution-selectable-controls`
- `npm run test:resolution-contradictions`
- `npm run test:resolution-structured-soap`

The production source-metadata reproducibility check remained PASS with 236 registered sources, 151 replay modules, and matching stored/active/replay fingerprints.

## Commits

- `b2ef21a2` — `fix(beta): add evidence-gated structured defect controls`
- `5ec3291f` — `test(beta): close manual defect resolution matrix`

## Deployment gate

- Branch pushed: `beta-manual-defect-resolution-v2`
- Attempted Pages run: `30206150062` — [workflow run](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30206150062)
- Build job: PASS; artifact upload: PASS; head SHA: `e4e19234e890fcdd8b15f2b6fcdf8fbe60328c2c`
- Deploy job: REJECTED before execution by the `github-pages` environment branch policy.
- Exact failure: `Branch "beta-manual-defect-resolution-v2" is not allowed to deploy to github-pages due to environment protection rules.`
- No environment rule was changed or bypassed. No stable production route was touched.
- The live URL therefore still reflects the previously authorized deployment and cannot be claimed as verification of this repair SHA.

After an owner-authorized environment policy update adds this branch, rerun only the existing Pages workflow on this same branch, verify the deployed SHA and live browser behavior, then append the successful run and verification timestamp here. Until then, this report is implementation-complete but deployment-blocked by external protection.

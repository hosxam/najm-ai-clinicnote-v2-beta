# NAJM manual defect resolution v2

## Scope and checkpoint

- Branch: `beta-manual-defect-resolution-v2`
- Starting checkpoint: `c2258b5b6b07cc88e04adbaea77359576f6add6c`
- Current implementation checkpoint: `b96f207fc0a3a7f4be614abe6b581442f8bb5489`
- Implementation end SHA after browser-test stabilization: `04d0bff4fd489e74a91b84b1a3a1e04a210318c2`
- Final documentation end SHA: `f26e6d63938a947c0d93a7b4cdfa59b6db927e37`
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
- Compiled fields: 4,147
- Evidence records retained separately: 75,484
- Resolution-wave structured fields: 427 (semantic duplicates are suppressed)
- Selectable controls tested: 127
- Contradiction tests: 111
- Dedicated final-output cases: 15 workflow archetypes
- Fields added: 427 evidence-gated structured fields; fields removed: 0; fields relabelled: 0
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
- `npm run test:manual-resolution-browser` (15 workflows × Quick/Advanced; production preview; zero console errors and failed requests; inactive route failed closed)

The production source-metadata reproducibility check remained PASS with 236 registered sources, 151 replay modules, and matching stored/active/replay fingerprints.

## Commits

- `b2ef21a2` — `fix(beta): add evidence-gated structured defect controls`
- `5ec3291f` — `test(beta): close manual defect resolution matrix`
- `6565cb4b` — `test(beta): update resolution evidence after archetype completion`
- `e525cf4d` — `test(beta): prove fifteen final outputs and matrix assertions`
- `b96f207f` — `fix(beta): deduplicate structured resolution controls`
- `04d0bff4` — `test(beta): stabilize manual resolution browser matrix`
- `f26e6d63` — `docs(beta): record browser matrix stabilization`

## Deployment gate

- Branch pushed: `beta-manual-defect-resolution-v2`
- Historical blocked run: `30206150062` — [workflow run](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30206150062); it was rejected before execution while the branch was absent from the environment allowlist.
- Successful beta run: `30209799445` — [workflow run](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30209799445)
- Deployment source SHA: `ae0832161cb61f2ae3384c0ac657a1f55312ec91` (exact run head SHA)
- Build and artifact upload: PASS; Pages deploy: PASS
- Live URL: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Live verification timestamp: `2026-07-26T20:15:08+04:00`
- Displayed live build: `ae08321`, matching the deployed source SHA.

### Post-deployment verification

- Catalogue loaded; canonical interactive manifest returned HTTP 200 with 416 workflows, 4,147 fields, and 75,484 retained evidence records.
- Chest pain, ECG result review, paediatric fever, emergency assessment, pre-anaesthetic assessment, and procedure documentation schemas loaded in Quick and Advanced routes; all representative routes rendered without fail-closed errors.
- Draft isolation passed: chest-pain content did not appear in ECG; Start fresh cleared the saved field and output.
- Responsive checks passed at desktop (1440px), tablet (768px), and mobile (390px); no horizontal overflow.
- Beta console errors: 0. Failed beta requests/responses: 0. Local filesystem paths exposed: no.
- Stable production isolation: the stable URL did not contain the repair SHA and was not modified or deployed to.

No environment rule was bypassed, no stable production route was touched, and no approval, signing, merge, rebase, or force-push was performed.

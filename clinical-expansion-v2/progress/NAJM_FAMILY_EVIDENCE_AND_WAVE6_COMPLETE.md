# Najm AI ClinicNote — Family Evidence and Multi-Workflow Activation Wave 6

## Completion

- Starting branch: `beta-family-evidence-and-wave5-v1`
- Starting HEAD: `46659cc458f3d61f8716de6b659bb2ed924242a1`
- Wave 6 branch: `beta-family-evidence-and-wave6-v1`
- Ending HEAD: `0e66bc5fa1e6b55ddbc5d66264103d0fe0cef317`
- Beta deployment run: [30282659868](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30282659868)
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Deployed source SHA: `0e66bc5fa1e6b55ddbc5d66264103d0fe0cef317`
- Displayed build SHA: `0e66bc5`

The beta deployment completed successfully. Stable production, `main`, signed state,
canonical approval state, mappings, candidates, exclusions, and production
`public/data` were not changed.

## Inactive baseline and Wave 5 audit

The exact inactive baseline contains all 969 records in the required mutually
exclusive categories. The exact targetable distinct total is 910.

| Category | Count |
| --- | ---: |
| Genuinely distinct clinical workflow | 902 |
| Incorporated component | 36 |
| Narrow but distinct workflow | 8 |
| Out of product scope | 13 |
| Inactive child workflow | 10 |
| **Total records** | **969** |

All 74 Wave 5 activations were audited. Clone groups: 0. Every audited schema
has a valid family-specific variant after repair. Twenty adversarial fixtures were
executed and all 20 passed.

## Source search and evidence packs

- Families selected: 15
- Workflow targets: 100
- Existing source records reused: 75 reuse rows (62 deduplicated accepted source records)
- Registry before/after: 242 / 242
- New source records accepted: 0
- Exact official queries: 45
- Official pages opened: 75
- Documents located: 75
- Downloads: 0
- Extractions: 75
- Family evidence packs: 15
- Workflow evidence packs: 100
- New field-provenance records: 300
- New selectable controls: 90
- New contradiction groups: 90
- Archetype output definitions: 15

All activated records carry source IDs, evidence-pack IDs, exact section anchors,
population and setting qualifiers, and a documentation-only transformation note.

## Activation result

Wave 6 activated 90 genuinely distinct workflows and retained 10 named workflows
inactive with terminal fail-closed states and explicit evidence gaps. No workflow
was activated from a generic fallback without a family-specific pack.

| Measure | Wave 5 baseline | Wave 6 result |
| --- | ---: | ---: |
| Original workflows | 1,500 | 1,500 |
| Active workflows | 531 | 621 |
| Inactive workflows | 969 | 879 |
| Clinician-facing items | 8,165 | 9,656 |
| Internal evidence records | 83,332 | 97,321 |
| Interactive fields | 5,785 | 7,509 |

The 10 remaining Wave 6 targets are: `resp-chronic-cough-review`,
`gi-biliary-colic-follow-up`, `ent-allergic-rhinitis`,
`surg-benign-breast-clinic-follow-up`, `prev-advance-directive-documentation`,
`gyn-dyspareunia-documentation`, `icu-daily-review-documentation`,
`psych-digital-overuse-mental-health-documentation`,
`renal-fluid-status-renal-review`, and `urgent-wound-care-laceration`.

## Validation

The required local validation suite passed:

- family Wave 6 validator: PASS (15 families, 100 targets, 90 activated, 10 inactive)
- Wave 5 distinctness audit: PASS (74, clone groups 0)
- adversarial fixtures: PASS (20/20)
- schema tests: PASS (1,502 field tests; 360 selected/unselected option tests; 90 contradiction tests)
- interactive catalogue and advanced modes: PASS (621/621)
- final beta manifest and clinician-facing separation: PASS
- all-workflows, workflow/evidence reconciliation, aliases and retirement: PASS
- source replay and source recency: PASS
- source ingestion: PASS (242 sources; 242 complete/terminal)
- interactive SOAP and advanced SOAP: PASS (621 and 1,242 mode cases)
- manual defect resolution and closure assertions: PASS (433 records)
- accessibility and performance: PASS
- safety, data, research claims, source evidence, item provenance and evidence hashes: PASS
- research queue: PASS (16 tests)
- lint: PASS with pre-existing warnings
- build: PASS

Source metadata reproducibility remains exact: 151 replay modules, 242 sources,
zero parity differences. Metadata fingerprint:
`e9efd82ddfbeef8bc057271bb8fb8e42ba5745a918e19efc84f023daf676bf1f`.
Replay-manifest fingerprint:
`6efb37d2aa8271aac771781b8c6f185181c07682df0c1f0075b98a22ac2f77f9`.

## Browser and beta verification

Automated Playwright verification passed against the deployed beta. The canonical
manifest reported 1,500 original, 621 active, 879 inactive, 9,656 clinician-facing
items and 97,321 internal evidence records. Six representative Wave 6 routes opened
in Quick and Advanced modes and displayed workflow-specific fields. The selected
inactive target failed closed and did not expose usable clinical content.

Desktop, tablet and mobile layouts loaded without major horizontal overflow. Search
and catalogue loading succeeded, console errors were 0, and failed asset requests
were 0. The full browser result is recorded in
`family-wave6/LIVE_VERIFICATION_WAVE6.json`.

## Protected-state confirmation and limitations

- Mappings: 0
- Candidates: 0
- Exclusions: 12
- Stable production changed: no
- `main` changed: no
- Production `public/data` changed: no
- Canonical approval or signed state changed: no
- No diagnosis, prescribing, autonomous interpretation, referral, or clinician approval was inferred
- Ten Wave 6 workflows remain inactive because their named critical evidence sections are not complete
- Some reused corpus sources retain documented structural access limitations; those limitations remain visible in source and pack artifacts

Commits were kept narrow and unsigned:

1. `cf01e54a` — `chore(wave6): add clinical-distinctness and family-evidence pipeline`
2. `e4039792` — `test(wave6): audit Wave-5 clinical differentiation`
3. `05a8cf01` — `data(wave6): build family and workflow evidence packs`
4. `cf5400b6` — `test(wave6): prove activations and full regression`
5. `fb017a83` — `fix(wave6): normalize interactive option values`
6. `0e66bc5f` — `fix(wave6): normalize cached workflow schema at load`

No push occurred to stable production, no merge or rebase occurred, and the final
worktree is clean.

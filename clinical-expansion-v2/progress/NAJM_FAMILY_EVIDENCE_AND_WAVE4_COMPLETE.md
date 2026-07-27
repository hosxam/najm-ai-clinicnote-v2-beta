# Najm AI ClinicNote — Family Evidence Packs and Multi-Workflow Activation Wave 4

Status: complete for the beta branch only.

## Branch and deployment

- Baseline branch: `beta-parent-workflows-and-wave3-v1`
- Starting HEAD: `1c817e3f16470a209ec92a9a5f2741cac8eb2b82`
- Wave 4 branch: `beta-family-evidence-and-wave4-v1`
- Deployed source SHA: `425c1aa9b9692ddcc0a3ff466f4316f0b038bbf9`
- Deployment workflow: [30245365959](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30245365959)
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Stable production was not deployed or changed.

## Scope and family selection

The exact inactive baseline contained 1,061 distinct inactive records (from 1,082 inventory entries after excluding 21 incorporated parent components). Ten clinically coherent families were selected with 43 distinct workflow targets:

1. diabetes-care (5)
2. acute-respiratory (5)
3. emergency-assessment (5)
4. perioperative-anaesthetic (4)
5. ent-presentations (4)
6. cardiovascular-review (4)
7. paediatric-acute (4)
8. gastrointestinal (4)
9. renal-monitoring (4)
10. musculoskeletal-assessment (4)

Every target was processed once and activated with complete authoritative evidence. No target remained inactive, was retired as a duplicate, or was incorporated into another workflow.

## Source and evidence reconciliation

- Source registry before/after: 238 / 238
- Newly accepted registry sources: 0
- Existing authoritative sources accepted/deduplicated for Wave 4: 59 (63 family ingestion records)
- Family evidence packs: 10
- Workflow evidence packs: 43
- Fields added: 689
- Evidence records added: 5,875
- Field provenance records: 689
- Source registry reconciliation: unchanged and deterministic
- No source was invented or promoted from an unevaluated candidate.

## Catalogue totals

| Measure | Result |
|---|---:|
| Original workflows | 1,500 |
| Active workflows | 461 |
| Inactive workflows | 1,039 |
| Clinician-facing items | 6,933 |
| Internal evidence records | 81,401 |
| Interactive fields | 4,887 |

The final catalogue manifest retains `missing_required_core_sections: 0` and the inactive route policy is fail-closed.

## Validation

All required Wave 4 checks and the full regression matrix passed, including data and source ingestion, family and workflow pack validation, workflow-item evidence reconciliation, dependency/archetype/retirement checks, source evidence and item provenance, evidence hashes, source-recency, independent source-metadata replay, clinical reproducibility, SOAP tests, safety, accessibility, performance, all-workflow/output safety, research queue, lint, and build. No authorised audit blocker remained.

The historical Wave 2 compatibility validator was narrowed to retain its 418/1082 baseline while allowing later activation waves; it now passes with the 1,500-workflow invariant.

Detailed command results are in `clinical-expansion-v2/progress/family-wave4/TEST_RESULTS.json`.

## Reproducibility and fingerprints

- Registered/replayed sources: 238 / 238
- Replay modules: 151
- Metadata fingerprint: `94f9f350cefa1c964953c2b782df219f0ad5500208a62dd01c9b7e1b5b7c84a5`
- Replay manifest fingerprint: `ae86b5a4c45b79184061d84776e80d7bb9528559188cc34e02d01673410ba8ba`
- Replay parity: PASS
- Persisted provenance and recency: PASS

## Live beta verification

The deployed build displayed `425c1aa` and loaded `data-beta/final-catalogue/manifest.json`; no `curated-workflows` resource was requested. The manifest totals matched 1,500 / 461 / 1,039 / 6,933 / 81,401. Alias search (`diabetes annual review`) resolved to `endo-diabetes-annual-review`, and specialty filtering returned the expected workflow. Representative Wave 4 routes opened with Quick and Advanced modes and evidence panels: diabetes annual review, dyspnoea, emergency shortness of breath, pre-operative anaesthetic assessment, sinusitis, DOAC review, paediatric fever, dysphagia, hyperkalaemia, and knee pain. An inactive route failed closed with no usable clinical content.

Desktop (1440px), tablet (1024px), and mobile (390px) checks had no horizontal overflow. Console errors: 0. Failed asset requests: 0. Local filesystem paths exposed: false. Temporary draft data remained workflow-scoped, did not appear in another workflow, the saved-draft prompt was observed on return, Start fresh removed it, and temporary localStorage was cleared.

Full browser evidence is in `clinical-expansion-v2/progress/family-wave4/LIVE_VERIFICATION.json`.

## Protected boundaries

- `public/data` unchanged.
- Canonical and signed state unchanged.
- Mappings: 0.
- Clinician approvals: 0.
- Exclusions: 12.
- Stable production untouched.
- No merge, rebase, force-push, signing, approval, or queue continuation.

## Commits

Wave 4 was kept in narrow logical commits (with two small validation repair/checkpoint commits required by the post-activation validators):

1. `afb943b5` — chore(wave4): add family-evidence expansion pipeline
2. `688d7199` — research(wave4): acquire authoritative family sources
3. `98c2c83f` — data(wave4): construct family evidence packs
4. `5208ac24` — data(wave4): construct workflow evidence packs
5. `59a68bb0` — feat(wave4): add shared structured clinical components
6. `fb86ec53` — feat(wave4): activate complete workflow schemas
7. `ff6acd5c` — feat(wave4): activate complete workflow schemas
8. `e1b0cbf4` — feat(wave4): add workflow and archetype outputs
9. `04376fee` — fix(wave4): repair catalogue search and substitution
10. `f0ef9123` — fix(wave4): repair catalogue compaction
11. `6fc63ad9` — test(wave4): validate activations and full regression
12. `425c1aa9` — test(wave4): record validation results

This documentation commit records the final report and live verification only.

## Truthful limitations

The beta remains a clinician-review documentation workspace, not clinical decision support. Evidence records remain separate from clinician-facing items, and inactive workflows remain unavailable as usable clinical content. Wave 4 reused the existing authoritative registry; it did not expand the registry with new sources.

## Completion

NAJM_FAMILY_EVIDENCE_AND_WAVE4_COMPLETE

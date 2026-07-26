# NAJM inactive-source acceptance and Wave-1 report

Status: **COMPLETE — BETA DEPLOYED AND VERIFIED**

The implementation and repository validations completed on branch
`beta-inactive-source-acceptance-and-wave1-v1`. GitHub Pages built the branch
successfully after the owner added the exact branch to the existing
`github-pages` allowlist. No protection rule was bypassed, and no stable
production deployment was attempted.

## Baseline and commits

- Baseline branch: `beta-inactive-workflow-expansion-v1`
- Baseline HEAD: `9bf5dc4f8526193c182402e90295574053af1cb7`
- Working branch: `beta-inactive-source-acceptance-and-wave1-v1`
- Implementation end HEAD: `a5a02d8a8292f02d704cabb2fc91bb5d2f70f823`
- Final documentation HEAD: `4e13702d469dfe5f5113d73416b0e4823ec9b51c`
- Commits:
  - `423c6c0f` — `fix(research): repair source candidate acceptance and access classification`
  - `35a296a1` — `data(wave1): activate sourced sore throat workflow`
  - `a5a02d8a` — `docs(wave1): record source acceptance deployment blocker`
  - `4e13702d` — `docs(wave1): record successful beta deployment and verification`

## Root-cause and source-access results

- Candidate evaluations classified: 3,363/3,363.
- Rejection/root-cause categories: 2,371 unresolved before access; 992 duplicate accepted source records.
- Access outcomes classified: 2,388/2,388. All 2,388 were `unresolved_before_access`; HTTP, robots, JavaScript-only, PDF, authentication, moved, superseded, malformed, extraction, and retryable-technical categories were all zero. No false inaccessible claim was retained.
- Fixed defects: terminal single-source duplicate gate; discovery without acquisition; unresolved-access conflation; literal-title matching gate.
- Accepted documents: one already-ingested official DHA source reused through composition (`dha-telehealth-sore-throat-v2-2024`); no new source corpus record was required.

## Inactive taxonomy and Wave 1

- Baseline inactive records classified: 1,084.
- Post-wave inactive records: 1,083.
- Taxonomy among the remaining inventory: 555 unsupported-but-clinically-valid, 451 documentation-component/archetype-fragment, 77 overly-narrow micro-workflows.
- Safe merges: 0. Explicit redirects: 0. Historical IDs were preserved and fail closed. Alias added: `sore throat` → `gp-sore-throat`.
- Wave-1 target count: 25 unique workflows. The target list is recorded in `inactive-source-acceptance-wave1/WAVE1_TARGETS.json`.
- Activation: `gp-sore-throat` only, terminal state `activated_with_complete_authoritative_evidence`.
- Remaining 24 targets remain inactive with a specific evidence gap; no clinically different substitute routing was introduced.
- Activated workflow: 39 interactive fields, 11 compact clinician-facing items, 28 internal evidence records, field-level provenance for every field, and complete accepted-source locators.

## Repository validation

Passed focused checks:

- source composition: 2/2
- source acceptance: 4/4
- Wave-1 acceptance validator: PASS
- final beta manifest: PASS (1,500 original / 417 active / 1,083 inactive / 6,301 clinician-facing / 75,512 evidence)
- interactive workflows: PASS (417 workflows / 4,186 fields / 75,512 evidence retained)
- advanced modes: PASS (417 quick / 417 advanced; 9,972 chips; 5,022 advanced options)
- clinician-facing separation: PASS
- workflow-item evidence reconciliation: PASS
- data, all-workflow, output-safety, exclusions, evidence hashes, clinical reproducibility, research queue, source evidence, item provenance, pack dependencies, aliases, retirement, blocked-source, medication safety, evidence-gap manifest, and final-status reconciliation: PASS
- lint: PASS with pre-existing warnings only
- production build: PASS

The required evidence and status artefacts are under
`clinical-expansion-v2/progress/inactive-source-acceptance-wave1/`.

## Deployment

- Deployment workflow: `Deploy beta to GitHub Pages`
- Prior blocked run: [30213087724](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30213087724)
- Successful run: [30216289674](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30216289674)
- Build job: PASS. Deploy job: PASS.
- Deployed source SHA: `a5a02d8a8292f02d704cabb2fc91bb5d2f70f823` (exact branch HEAD).
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Displayed build SHA: `a5a02d8`, matching the deployed source.
- Live catalogue: 417 active interactive workflows, 4,186 fields, 75,512 retained evidence records; final manifest confirms 1,500 original, 417 active, 1,083 inactive, 6,301 clinician-facing items, and 75,512 internal evidence records.
- Canonical manifest was requested by the live route; no `data-beta/curated-workflows` request occurred.
- Search and specialty/archetype filter controls rendered. All 25 Wave-1 target routes were checked: `gp-sore-throat` opened with Quick and Advanced modes; the other 24 remained fail-closed as inactive. No route failures occurred.
- The `gp-sore-throat` evidence panel opened and displayed the accepted DHA source identifier and locator page. Start Fresh cleared the workflow-scoped draft gate before rendering the form.
- Desktop (1440px), tablet (1024px), and mobile (390px) active-route checks had no horizontal overflow; Quick and Advanced controls rendered at all three sizes.
- Browser smoke tests recorded zero console errors and zero failed assets.
- Stable production: unchanged.

## Protected-state confirmation

- `public/data` unchanged.
- Source registry unchanged; the accepted source was already present.
- Mappings/candidates unchanged at zero.
- Canonical and signed state unchanged.
- Exclusions unchanged at 12.
- No merge, rebase, amend, squash, force-push, signing, approval, or protection-rule bypass occurred.

Wave-1 implementation and beta deployment are complete. The remaining
inactive workflows are intentionally fail-closed with documented evidence
gaps; no unsupported activation or substitute routing was introduced.

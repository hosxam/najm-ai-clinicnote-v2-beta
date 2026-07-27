# NAJM parent workflows and Wave 3 recovery report

## Result

Implementation and validation completed on branch `beta-parent-workflows-and-wave3-v1`. Beta deployment was attempted, but GitHub Pages rejected the deploy job because this branch is not authorized by the `github-pages` environment. The live beta was therefore not attributed to this build and live verification was not claimed.

## Reconciliation and construction

- Baseline branch: `beta-inactive-taxonomy-and-wave2-v1`.
- Baseline/start SHA: `bf0931a5df4cdda4c7c92c337821b7d6b84843e0`.
- Wave 2 accepted documents reconciled: 27 unique documents; 26 reused existing registry records and 2 new registry records were recorded (one accepted NHS record and one NICE record blocked by HTTP 403).
- Remaining Wave 2 targets closed with exact missing sections: 49.
- Parent families selected and completed: 10/10, all existing active parents verified without scope expansion; no new parent IDs.
- Pending component/micro records terminally processed: 528; pending parent evidence remaining: 0.
- Incorporated into existing parents: 21 optional components, with explicit redirects and no duplicate controls.
- Retained distinct inactive: 507.
- Wave 3 targets attempted: 5; newly activated: 0. Each was retained inactive with its exact missing sections and no schema fallback.

## Catalogue and evidence counts

The validated catalogue remains 1,500 original workflows, 418 active, 1,082 inactive, 6,313 clinician-facing items, and 75,526 internal evidence records. The source corpus contains 238 registered/completed records. Parent outputs remain the existing SOAP, EMR, and follow-up-summary outputs.

## Validation

All required implementation and regression checks passed, including parent-wave3 validation (528 terminal, 49 closures, 10 parents, 21 incorporations, 507 retained, 5 Wave 3 targets, 0 activations), inactive-taxonomy Wave 2 checks, final beta manifest and clinician-facing separation, source ingestion, replay parity, source-metadata reproducibility, source recency, evidence packs, interactive SOAP, advanced SOAP, interactive repair, accessibility, performance, data, safety, lint, build, manual-defect closure (433), selectable controls (127), contradiction tests (111), all-workflows, output safety, workflow evidence/provenance, dependency/archetype/compaction/alias/retirement checks, hashes, and the research queue.

## Deployment attempt

- Branch pushed: `beta-parent-workflows-and-wave3-v1`.
- Deployment workflow: [run 30242770647](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30242770647).
- Build job succeeded at source SHA `8abf72e123fd4bd9dcdac48f45e758d1e41ae4d1`.
- Deploy job was rejected by `github-pages`: `Branch "beta-parent-workflows-and-wave3-v1" is not allowed to deploy to github-pages due to environment protection rules.`
- No protection rule was changed. No stable production deployment, merge, rebase, force-push, signing, or approval occurred.
- Live verification: not performed for this build because no deployment was published. See `clinical-expansion-v2/progress/parent-wave3/LIVE_VERIFICATION.json`.
- GitHub's deployment records show the beta remains published from the prior Wave 2 SHA `a758d31b7623af24614d83647745bee3416a29e8`; it does not match the Wave 3 implementation SHA.

## Remaining limitations

Five Wave 3 targets and 507 retained components still require specific authoritative sections before activation. Existing accepted source evidence was reused first; the 238-record corpus still includes 20 blocked records and 955 pending evidence packs by design. The beta authorization blocker must be resolved externally before a truthful live completion can be reported.

## Protected-state confirmation

Public data is unchanged; mappings and candidates remain 0/0; exclusions remain 12; canonical and signed state are unchanged; no stable production route was touched. The working tree is required to remain clean after this documentation commit.

# NAJM parent workflows and Wave 3 recovery report

## Result

Implementation, validation, beta deployment, and live verification completed on branch `beta-parent-workflows-and-wave3-v1`.

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

## Deployment and live verification

- Branch pushed: `beta-parent-workflows-and-wave3-v1`.
- Deployment workflow: [run 30243282300](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30243282300).
- Build and deploy jobs succeeded at source SHA `9d898e7d682f11c5c1af0baa50738fd04c66d956`.
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta.
- Displayed build identifier: `9d898e7`, matching the deployed source SHA.
- The canonical final-catalogue manifest loaded; the obsolete curated-workflows dataset was not requested.
- Ten existing parent routes loaded, Quick and Advanced modes rendered, the incorporated-parent alias manifest resolved, and an inactive Wave 3 target failed closed.
- Workflow-scoped draft isolation and Start Fresh clearing passed using temporary browser state, which was cleared after testing.
- Desktop (1440x900), tablet (1024x768), and mobile (390x844) had no horizontal overflow. Console errors: 0. Failed static assets: 0. Local filesystem paths exposed: false.
- No protection rule was changed. No stable production deployment, merge, rebase, force-push, signing, or approval occurred.
- Detailed evidence is recorded in `clinical-expansion-v2/progress/parent-wave3/LIVE_VERIFICATION.json`.

## Remaining limitations

Five Wave 3 targets and 507 retained components still require specific authoritative sections before activation. Existing accepted source evidence was reused first; the 238-record corpus still includes 20 blocked records and 955 pending evidence packs by design. The beta authorization blocker must be resolved externally before a truthful live completion can be reported.

## Protected-state confirmation

Public data is unchanged; mappings and candidates remain 0/0; exclusions remain 12; canonical and signed state are unchanged; no stable production route was touched. The working tree is required to remain clean after this documentation commit.

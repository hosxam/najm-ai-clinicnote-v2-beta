# Beta 1,500-Workflow Review Integration

## Handoff scope

The completed source-first expansion is now available in the existing Najm ClinicNote V2 beta interface for owner review. This is a beta-only integration; it is not a clinician adjudication or approval run, and it is not deployed.

- Repository: `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2`
- Branch: `clinician-review-adjudication-micro-pilot-v1`
- Required starting HEAD: `d15b05007500550d71292bebe2f0393598f3bcc3`
- Implementation HEAD before this report: `f9df774f946fe86c10317fd167c2fa2c921fb093`
- Integration commits:
  - `7acae1384fce0cc055fdcde2a5420b6faad4d7c8` — `feat(beta): add source-first review dataset`
  - `f9df774f946fe86c10317fd167c2fa2c921fb093` — `feat(beta): add clinician workflow review workspace`
  - report commit is the final documentation handoff commit

## Dataset boundary and counts

The beta dataset is generated into `public/data-beta/` and leaves `public/data/` unchanged. It is built from the committed source-first workflow, research, registered-source, and UAE applicability records. Details load per workflow, preserving the existing production data adapter and stable documentation routes.

- Unique workflows: **1,500**
- Stable item records: **83,303**
- Registered source records: **235**
- Research status totals: **exact 0 / partial source support 1,099 / no authoritative source 401**
- Candidate approved in beta dataset: **0**
- Initial clinician-reviewed workflows: **0**
- Initial open workflows: **1,500**
- Source-reference resolution: **all registered source and evidence references resolve**

No candidate mapping or canonical support was promoted. Review-only evidence links are clearly labelled as not approved.

## Beta interface

The existing interface now includes `/beta` and `/beta/workflows/:workflowId` routes and a home-page entry point. The beta review surface provides:

- `BETA — CLINICIAN REVIEW DATA` banner and the required under-review / doctor-responsibility notice.
- Search, specialty, evidence-status, UAE-finding, unsupported-item, safety-review, reviewed/unreviewed, edited, and deferred filters.
- Workflow numbers 0001–1500, stable navigation, next/previous workflow links, and no out-of-range workflow creation.
- Workflow research status, source list, official URLs, exact section headings/locators, UAE applicability, source gaps, review-only evidence links, unsupported-item totals, and safety-review totals.
- Item-level decisions: Keep as written, Edit wording, Remove item, Source supports item, Source partially supports item, Source does not support item, Needs source recheck, Needs safety review, and Defer.
- Clinician comments and edited wording with a no-patient-data reminder.
- Browser-local autosave using `localStorage`, reviewed progress totals, reset confirmation, JSON export, JSON import validation, and import/export round-trip support.

Local smoke-check URL: `http://127.0.0.1:5173/#/beta`

Proposed deployment action (requires owner approval): publish the already-built beta branch to the existing beta hosting target at `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/`. No deployment was performed in this task.

## Validation

Passed:

- `npm run validate:beta-review-data`
- `npm run validate:data`
- `npm run test:safety`
- `npm run test:all-workflows`
- `npm run test:output-safety`
- `npm run audit:source-recency`
- `npm run verify:clinical-data-reproducibility`
- `npm run lint` (repository pre-existing warnings only)
- `npm run build`
- Local browser smoke check of beta home, workflow 0001, source/evidence panel, item decision controls, and next-workflow navigation.

Source recency and reproducibility remained unchanged and passed: 235 sources, 23 rechecks due, metadata fingerprint `7c54674e1c2e367d16db03d482f9bcda9bafcfbdda4f2547392760d141bb9497`, replay manifest fingerprint `53109420feff822fa7d82266c7a6325135b5092a7b3c2662f5055e8d995edbf0`, and replay source count 235.

## Protected-state confirmation

- `public/data`: unchanged
- canonical mapping and signed/approval state: unchanged
- mappings: 0
- candidate approvals: 0
- exclusions: 12 unchanged
- no source-first workflow, research, provenance, recency, replay, migration, mapping, or signing record was modified
- no patient data is collected or written
- no push, deployment, merge, rebase, signing, approval, or queue continuation was performed

## Review handoff

The beta review dataset is ready for owner inspection only. It must not be treated as approved clinical content, and the existing clinician-review and production write-authority boundaries remain in force.

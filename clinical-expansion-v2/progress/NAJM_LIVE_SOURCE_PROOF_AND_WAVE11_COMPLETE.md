# NAJM Live Source Proof and Wave 11 Completion

Status: complete. This focused wave reconciled the deep pilot, proved live
official-source ingestion, completed exactly 20 corrected partial packs, and
deployed only the beta branch.

## Repository and deployment

- Starting branch/HEAD: `beta-source-engine-repair-and-deep-pilot-v1` /
  `8302caa1c59743a03a068dc7ace9f6d08232eb96` (clean baseline).
- Working branch: `beta-live-source-proof-and-wave11-v1`.
- Deployed source: `6fde3ea4a2362a329b06105cc0958ee3dee04da4` (`6fde3ea`).
- Deployment run: [30382444935](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30382444935), successful.
- Live beta: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Stable production was not deployed or modified.

## Pilot and evidence-count reconciliation

The ten deep-pilot identities were `peds-cough`,
`peds-pediatric-asthma-review`, `peds-pediatric-fever-follow-up`,
`gp-hypertension-followup`, `cardio-syncope-follow-up`, `gp-dysuria`,
`ed-imaging-result-documentation`, `derm-psoriasis-flare-documentation`,
`resp-pediatric-to-adult-asthma-transition-documentation`, and
`urgent-wound-care-laceration`. Seven were activated and three remained
fail-closed: paediatric fever (`blocked_by_source_access`), dysuria
(`remains_inactive_wrong_setting`), and paediatric-to-adult asthma transition
(`remains_inactive_wrong_workflow_scope`). The reconciliation is explicitly
reconstructed from committed artifacts.

The exact evidence-count reconciliation is 132,424 historical Wave-9 records
to 116,856 baseline records, a reduction of 15,568. It was implementation-time
compaction of duplicate, non-clinician-facing and unsupported legacy records;
accepted source evidence, active provenance, and replay parity were preserved.
The complete reconciliation is in
`clinical-expansion-v2/progress/source-wave11/EVIDENCE_COUNT_RECONCILIATION.json`.

## Live source acquisition and registry proof

Three net-new authoritative sources were fetched from the real web, extracted,
fingerprinted, inserted, replayed, and used by structured fields:

- RCH acute abdominal pain (official HTML),
- RCH vomiting (official HTML), and
- RCH Kids Health Info gastroenteritis (official PDF).

The proof fetched two HTML documents and one PDF, increased the canonical
registry from 242 to 245 records, replayed 245 sources with zero errors, and
mapped the new sources to the abdominal-pain, diarrhoea, and vomiting
paediatric workflows. The live evidence panels expose the RCH links. No mock
fixture was used for this proof.

## Wave 11 packs and activation

Exactly 20 targets were terminally evaluated; 17 became
`activated_with_complete_authoritative_evidence` and three remain inactive with
no pending state. The target list and terminal reasons are recorded in
`source-wave11/WAVE11_PARTIAL_PACK_TARGETS.json` and
`source-wave11/WAVE11_ACTIVATION_RESULTS.json`.

The completed packs contain 136 fields, 25 selectable controls, 8 contradiction
groups, 3 conditional-rule families, exact field provenance, Quick and Advanced
schemas, three output builders per active workflow, and deterministic complete,
omission, abnormal/escalation, sibling-exclusion, state-isolation, Start Fresh,
and Resume fixtures. New Wave 11 totals are:

| Catalogue measure | Before | After |
|---|---:|---:|
| Original workflows | 1,500 | 1,500 |
| Active workflows | 884 | 901 |
| Inactive workflows | 616 | 599 |
| Clinician-facing items | 12,358 | 12,494 |
| Internal evidence records | 116,856 | 116,992 |

Interactive totals after activation are 901 workflows, 11,179 fields, and
69,913 retained evidence records. Advanced-mode compilation reports 21,525
chips, 10,767 options, and fingerprint
`8510cd2f861c581bb0de371f123bcf1a14daf6f143d9cb8b947e76dd28de50db`.

## Recency, replay, and fingerprints

- Registered sources: 245.
- Replay: 151 modules (initial plus 150 numbered), 261 source operations, 245
  replayed sources, zero parity differences.
- Source metadata fingerprint:
  `fc86d86deb7886641383e162f58b36d500e50c4a1ab2e7b6a826db29b1074606`.
- Replay manifest fingerprint:
  `b57d8c26ea44d294e70c35d9c658df72380933ad27db287be272f3a952c5575d`.
- Recency audit: PASS. Basis totals are 25 explicit stronger, 3 approved
  unknown, 69 weaker metadata, and 148 access-only; 23 sources are recheck due.

## Validation

The required Wave 11 source, pack, schema, output, source-recency, replay,
manifest, data, workflow, safety, provenance, canonical-state, interactive,
advanced-mode, release-readiness, deep-pilot, Wave-9, lint, and build checks
passed. Focused Wave 11 tests report 20 targets, 17 active, 3 fail-closed,
136 fields, 25 selected/unselected option fixture pairs, 8 contradiction
tests, and zero errors. The live browser verification is recorded in
`source-wave11/LIVE_VERIFICATION.json` and passed with zero console errors,
zero failed requests, no obsolete curated-workflow requests, no filesystem
paths, and no horizontal overflow at desktop, tablet, or mobile widths.

The three programme audits remain the expected blockers: exact-source coverage
(1,500 clinical blockers), UAE applicability (1,426 findings across 1,401
workflows), and unsupported legacy content (83,303 items). An additional
legacy `audit:no-code-generated-mappings` scanner reports three pre-existing
violations in untouched Wave-8/Wave-9 generator scripts; no Wave 11 file is
implicated and no active mapping was created.

## Protected-state confirmation

- Canonical mappings: 0.
- Candidate proposals: 0.
- Exclusions: 12.
- `public/data` unchanged; only beta data was changed.
- Canonical approval/signature state unchanged.
- No unsupported legacy content was modified.
- No merge, rebase, force-push, signing, approval, or stable deployment.

## Commits

1. `ee30b4bb` — `audit(pilot): reconcile source and evidence-count results`
2. `f1206d19` — `fix(sources): prove live source registry ingestion`
3. `382ccfa2` — `test(sources): validate real HTML and PDF ingestion`
4. `3a31a637` — `research(wave11): acquire authoritative target sources`
5. `da654f79` — `data(wave11): complete evidence packs`
6. `84f52785` — `feat(wave11): activate complete schemas and outputs`
7. `6fde3ea4` — `test(wave11): prove source ingestion and workflow outputs`
8. Final documentation commit records this report and the live verification.

The final worktree is clean after the documentation commit.

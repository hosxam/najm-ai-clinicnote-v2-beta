# MOHAP service-page date-provenance independent review

Review date: 2026-07-15 (Asia/Dubai)

Verdict: `FAIL_MOHAP_DATE_PROVENANCE_REQUIRES_FURTHER_WORK`

The current active and replayable MOHAP records correctly distinguish the webpage update from publication, effective, and revision dates. The review nevertheless fails because the production object validator omits `revision_date` from its protected fields and therefore accepts the precise forbidden duplication of a webpage-update date into `revision_date`. The research queue must not resume.

## Repository verification

- Required branch: `source-first-guideline-expansion-1500-v2` — verified.
- Required starting HEAD: `0e840f675806d8cf64c71291937cb7108f98947d` — verified.
- Pre-correction HEAD: `0cbd76f23e812471a00a2076e4a95ec61db715d8` — used as the changed-file and downstream comparison base.
- Correction commits inspected: `4b5bc7b3bcc4d03cb435536aa52f3743c2950a28`, `3a1b12835fd5c3def7212a9594202072943a390d`, and `0e840f675806d8cf64c71291937cb7108f98947d`.
- Stable `main`: `95758951d46510f34548b5520510c5d9d59f017f` — unchanged.
- Protected forensic branch `guideline-expansion-1500-all-in-one`: `9b4cddb0fb226543ce621cb14a672a4edf789261` locally and at `origin` — unchanged.
- The working tree was clean at entry and remained clean throughout the read-only inspection and prescribed command execution.
- No queue process was started. No clinical research, mapping, signing, approval, push, deployment, merge, rebase, or production/test/source/workflow edit was performed.

The frozen programme state was independently checked:

| Check | Result |
| --- | ---: |
| Workflows 0001–0775 terminal | 775; sequence violations 0 |
| Workflows 0776–1500 `research_interrupted` | 725; sequence violations 0 |
| Partial exact-source workflows | 652 |
| No-authoritative-source workflows | 123 |
| Next workflow | `gyn-menopause-symptom-review` |
| Supported mappings | 0 |
| Candidate proposals | 0 |
| Unsupported legacy items | 83,303 |
| Active exclusions | 12 |
| Proposed exclusions | 0 |
| `public/data` versus stable `main` | unchanged |
| Canonical directory, approval manifest, and detached signature | unchanged |

## Changed-file classification

The complete diff from `0cbd76f23e812471a00a2076e4a95ec61db715d8` to `0e840f675806d8cf64c71291937cb7108f98947d` contains exactly eight files:

| File | Classification | Assessment |
| --- | --- | --- |
| `clinical-expansion-v2/sources/uae_clinical_sources.json` | active source metadata | Corrected MOHAP date semantics only. |
| `scripts/source-first/batches/batch-0726-0735.mjs` | replayable batch correction | Mirrors the corrected active source record. |
| `scripts/source-first/sourceDateSemantics.mjs` | date-semantics validation | Material protection gap described below. |
| `scripts/source-first/applyResearchBatch.mjs` | date-semantics validation (batch-write enforcement) | Calls the incomplete object assertion. |
| `scripts/source-first/runCheck.mjs` | source-recency enforcement | Calls the same incomplete object validator. |
| `scripts/source-first/sourceDateSemantics.test.mjs` | regression test | Six focused tests pass, but required coverage is incomplete. |
| `package.json` | package-script wiring | Adds the date-semantics test command. |
| `clinical-expansion-v2/progress/MOHAP_SERVICE_PAGE_DATE_PROVENANCE_CORRECTION.md` | documentation | Describes the former error and correction. |

Unrelated changed files: 0. No clinical content, mapping, workflow status, public application data, exclusion, execution-manifest, restart-state, research record, workflow record, or evidence-hash file changed in the correction diff.

## Official page wording

The [official MOHAP service page](https://mohap.gov.ae/en/w/attestation-of-medical-leaves-and-reports) was opened independently on 2026-07-15. Its visible label is:

> Last updated on 10th Jul, 2026 at 19:04

The page does not label 10 July 2026 as an original or first publication date, service commencement date, legal or policy effective date, revision-effective date, or date on which requirements entered into force. It does not state a timezone for `19:04`. Page structure, current content, and search metadata therefore cannot support any stronger date meaning.

## Active source-record findings

The active record `mohap-medical-leave-attestation-2026` has:

| Semantic field | Active value | Finding |
| --- | --- | --- |
| `publication_date` | `undated_on_official_page` | Correct approved unknown-date representation. |
| `effective_date` | `null` | Correct; no effective date is stated. |
| `revision_date` | `null` | Correct; no revision date is stated. |
| `webpage_last_updated_date` | `2026-07-10` | Correct dedicated webpage-update metadata. |
| `version` | webpage last updated 10 July 2026 | Correctly labels the date as a webpage update. |
| `recency_verification.verified_on` | `2026-07-15` | Correct access/verification-date equivalent. |
| `superseded_status_check.checked_on` | `2026-07-15` | Correct review/supersession-check equivalent. |

The displayed time is not stored and no timezone is invented. The page-update date is not duplicated into a stronger field in the current record.

The record remains an official UAE Ministry of Health and Prevention administrative attestation service page. Its `clinical_setting` explicitly says it is not a clinical assessment standard. It is not classified as a clinical guideline, legislation, an effective-date notice, a commencement instrument, or professional consensus.

The source registries do not use literal `access_date` or `reviewed_at` fields: neither field appears in any of the 235 active records. The established equivalents above preserve the actual 2026-07-15 verification/check dates without substituting them for publication.

## Replayable batch findings

The source object in `batch-0726-0735.mjs` matches the active record on every relevant semantic value: unknown publication, null effective and revision dates, dedicated `2026-07-10` webpage-update date, explicitly labelled version text, and 2026-07-15 verification and supersession-check dates. It also preserves the official administrative-service classification and the limitation that the page does not establish clinical assessment, incapacity, fitness, diagnosis disclosure, dates, duration, or backdating.

No unrelated workflow or source object in the replayable batch was rewritten by this correction.

## Residual-date search results

Repository-wide searches covered the MOHAP source ID, exact URL, `2026-07-10`, `10 July 2026`, `10th Jul, 2026`, and related publication, effective, revision, commencement, version, and webpage-update fields.

- Source-ID occurrences are confined to the correction report, the two research records that select the source, the active registry, `batch-0726-0735.mjs`, and the regression test. They are corrected metadata, correct references, historical defect documentation, or test fixtures.
- URL occurrences additionally include `gp-travel-insurance-form.research.json` and `batch-0736-0745.mjs`. Those are correct page-opened/rejected-source references, not date claims.
- Active `2026-07-10` metadata occurs only in the dedicated webpage-update field and explicitly labelled version/recency text in the active record and replayable batch.
- The correction report legitimately records the former incorrect publication, effective, and revision assignments as historical evidence.
- Regression-test occurrences are fixtures: page-update assignments, intentionally invalid duplication cases, and explicitly proven same-day publication evidence.
- The only stronger-field assignments of `2026-07-10` outside the historical report are test fixtures. There is no residual active publication, effective, revision, commencement, or legal-effective assignment for the MOHAP page.
- `2026-07-15` remains correct verification, supersession-check, and research-review metadata.

Residual incorrect active occurrences: 0.

## Schema representation assessment

There is no dedicated JSON Schema for source-registry records. The operative repository convention is enforced by registry loading and `runCheck.mjs`:

- All 235 active sources have `publication_date`, `effective_date`, and `revision_date` fields.
- `undated_on_official_page` is established in three active records, including two records that predate this correction.
- Null effective and revision dates are established representations.
- Only this MOHAP record currently uses `webpage_last_updated_date`.
- `publication_date` remains truthy through the approved sentinel, so source-evidence and source-recency validation accept it for the intended reason.

The corrected representation is therefore schema-conventional. The absence of a separate registry JSON Schema does not invalidate the corrected record, but it increases the importance of complete executable semantic validation.

## Date-semantics guard assessment

The new helper recognizes `last updated`, `last updated on`, `modified`, `page updated`, and `content updated` as webpage-update labels. It directs those labels to clearly named webpage-update fields and permits non-update labels such as an explicitly stated publication label. The rule is not overly broad and does not erase existing explicit dates or substitute access dates.

The production protection is nevertheless incomplete:

1. `PROTECTED_DATE_FIELDS` in `sourceDateSemantics.mjs` contains `publication_date`, `effective_date`, `service_commencement_date`, and `legal_effective_date`, but omits the repository-standard `revision_date`.
2. A direct read-only probe at the required HEAD produced:

   ```text
   errors= []
   assertion=ACCEPTED
   ```

   for `{ webpage_last_updated_date: '2026-07-10', revision_date: '2026-07-10' }`.
3. `applyResearchBatch.mjs` calls `assertSourceDateSemantics` for batch writes, and the source-recency check in `runCheck.mjs` calls `sourceDateSemanticsErrors`. Both therefore accept that forbidden revision duplication.
4. `assignLabeledSourceDate` rejects a page-update label targeted at `revision_date` through its generic non-page-update-field rule, but repository usage search finds that helper only in tests. Raw source objects in the production write and audit paths depend on the incomplete object validator.
5. The object validator also has no evidence from which to identify a copied stronger date when a raw object omits the dedicated webpage-update field. That untested shape can reproduce the original defect even for otherwise protected fields.

This violates the explicit requirement that page-update labels must not automatically populate `revision_date`. It is the decisive review failure. No fix was made because this task is read-only.

## Regression-test quality assessment

`npm run test:source-date-semantics` passed all 6 cases. The cases are focused and pass for their intended assertions rather than unrelated validation errors:

- page-update labels rejected for the enumerated protected fields;
- page-update labels accepted only for dedicated webpage-update fields;
- explicit publication wording accepted;
- duplicate dates rejected for the enumerated protected fields;
- independently evidenced same-day publication accepted; and
- active/replayable MOHAP values checked.

Passing the suite is insufficient because its local `protectedFields` list repeats the production omission of `revision_date`. It does not test revision duplication, explicit effective or revision wording, or the raw-object/no-dedicated-webpage-field defect shape. The active-record case passes because the current values are correct, not because every mandated future regression is guarded.

## Source-recency assessment

`npm run audit:source-recency` passed all 235 registered sources. The check validates official HTTPS URLs, a non-empty publication representation, version metadata, verification dates in the active research period, non-superseded status, and the date-semantic object validator. The corrected MOHAP record passes for legitimate current-record reasons: the unknown publication token is explicit, the webpage update remains separately labelled, and verification occurred on 2026-07-15.

The recency logic does not itself claim that a webpage update proves publication, legal effect, service commencement, or guideline issuance. However, its call to the incomplete semantic validator means the 235/235 pass cannot prove the required revision-date separation. Source recency was not weakened, but its semantic enforcement is incomplete.

## Downstream-impact assessment

The metadata correction itself requires no downstream recalculation:

- `gp-school-or-work-absence-note` and `gp-sick-leave-extension-review` correctly remain `partial_exact_source_verified`. Their evidence depends on unchanged service scope, document types, licensed-facility and authority requirements, duration bands, and committee context. Their unresolved clinical-assessment, incapacity, fitness, privacy, dates, duration, school/employer, and backdating gaps are unaffected by correcting a falsely strong source date.
- `gp-travel-insurance-form` correctly remains `no_authoritative_source_found`. It opened and rejected this administrative attestation page as non-exact travel-insurance clinical authority; its rejection does not rely on a publication, effective, or revision date.
- The two selecting research records still reference the same exact document and two exact sections; the rejecting record still has no selected document or section.
- Source selection/rejection, research claims, document counts, section counts, review timestamps, UAE findings, source status, blocker totals, and workflow terminality therefore have the same meaning after the date correction.
- Git blob comparison confirms no dependent research record, workflow record, evidence/hash manifest, execution manifest, restart state, public-data file, or exclusion file changed between the pre-correction and corrected HEADs.
- Hash validation independently passed for 1,500 workflow hashes, 1,500 evidence hashes, and 33 index hashes.

Relevant unchanged totals include 233 exact documents opened, 723 exact sections reviewed, 775 research-completed/terminal workflows, 676 UAE-affected workflows, and 701 UAE findings (652 partial-applicability, 49 missing-explicit-evidence, 0 other). The date correction does not expand or contract the page's administrative scope, so these unchanged statuses and findings are semantically correct rather than merely numerically stable.

## Validation results

The six date-semantics tests and all 23 required commands were run from the required starting HEAD.

| # | Command | Exit/result | Material result |
| ---: | --- | --- | --- |
| — | `npm run test:source-date-semantics` | PASS | 6/6 cases passed; incomplete revision coverage noted above. |
| 1 | `npm run verify:signed-canonical-reconciliation` | PASS | Reconciliation equal; supported mappings 0; unsupported items 83,303. |
| 2 | `npm run verify:canonical-mapping-reconciliation` | PASS | Reconciliation equal; all supported-mapping surfaces 0. |
| 3 | `npm run test:candidate-support-separation` | PASS | 3/3 tests. |
| 4 | `npm run audit:canonical-write-authority` | PASS | 11/11 authority tests; generated mappings 0. |
| 5 | `npm run audit:no-code-generated-mappings` | PASS | 144 production files inspected; generated mappings 0. |
| 6 | `npm run validate:data` | PASS | 1,500 workflows; 12 exclusions; public route/import checks passed. |
| 7 | `npm run validate:source-evidence` | PASS | 1,500 research records; 235 registered sources. |
| 8 | `npm run validate:item-provenance` | PASS | 83,303 clinical items; source-derived items 0. |
| 9 | `npm run audit:no-generic-templates` | PASS | Generic-generated items 0. |
| 10 | `npm run audit:exact-source-coverage` | EXPECTED BLOCKER | 1,500 workflows lack complete exact-source coverage: partial 652, no source 123, interrupted 725. |
| 11 | `npm run audit:source-recency` | PASS | 235 sources checked. |
| 12 | `npm run audit:uae-applicability` | EXPECTED BLOCKER | 676 affected workflows; 701 findings: 652 partial, 49 missing explicit UAE evidence, 0 other. |
| 13 | `npm run audit:unsupported-legacy-content` | EXPECTED BLOCKER | 83,303 unsupported legacy items. |
| 14 | `npm run audit:research-claims` | PASS | 1,500 research claims checked. |
| 15 | `npm run test:safety` | PASS | 16 checks; 12 exclusions checked. |
| 16 | `npm run test:all-workflows` | PASS | 1,500 baseline workflows, overlays, and research records. |
| 17 | `npm run test:output-safety` | PASS | 10 output-builder checks. |
| 18 | `npm run test:exclusions` | PASS | Active 12; proposed 0. |
| 19 | `npm run verify:source-evidence-hashes` | PASS | 1,500 workflow, 1,500 evidence, and 33 index hashes. |
| 20 | `npm run verify:clinical-data-reproducibility` | PASS | 10 baseline files; `public_data_changed: false`. |
| 21 | `npm run test:research-queue` | PASS | 14/14 tests; queue itself was not run. |
| 22 | `npm run lint` | PASS | Exit 0; 0 errors, 172 existing warnings. |
| 23 | `npm run build` | PASS | TypeScript and Vite production build completed. |

Only the three explicitly allowed programme audits remained blocked, with their existing blockers neither weakened nor reclassified. All other prescribed commands passed. Those results do not cure the independently demonstrated semantic-guard defect.

## Final frozen-state verification and queue decision

Immediately before creating this sole authorized report:

- branch and starting HEAD were still the required values;
- the worktree was clean after all prescribed tests and the build;
- stable `main` and the protected forensic branch still resolved to the required commits;
- workflows 0776 onward remained unchanged and interrupted;
- the next workflow remained `gyn-menopause-symptom-review`;
- supported mappings and candidate proposals remained 0;
- unsupported legacy items remained 83,303;
- active exclusions remained 12 and proposed exclusions 0;
- `public/data`, canonical files, signed manifest, detached signature, workflow/research records, hashes, execution manifest, and restart state remained unchanged; and
- no queue continuation or prohibited repository/external action occurred.

Workflow research may not resume from this review. The current MOHAP metadata is corrected, but the required durable protection against webpage-update-to-revision-date misclassification is not implemented or tested in the production validation path.

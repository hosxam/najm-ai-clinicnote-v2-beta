# Exact-status attainability audit

Date: 2026-07-14  
Branch checkpoint reviewed: `97bcf1984c3bf7250948a6aa2aa4c63e5cb80bc7`  
Terminal workflows reviewed: 275

## Conclusion

`exact_workflow_source_verified` is genuinely attainable, but none of the 275 processed workflows currently qualifies. The status is not structurally unreachable and no contradictory validator condition was found. No status logic was changed and no prior workflow was reclassified.

The current architecture accepts a terminal status authored by the workflow-specific batch module, then validates the resulting evidence record. It does not automatically promote a workflow. A false exact claim would still fail the full exact-source audit when unresolved gaps remain. Exact status therefore remains a deliberate evidence conclusion rather than a metric target.

## Required conditions

An exact workflow must satisfy all of the following:

1. Use `exact_workflow_source_verified` as its single terminal source status.
2. Open at least one registered exact official document.
3. Review at least one registered exact applicable section.
4. Keep every evidence-item source and section reference valid.
5. Cover the material clinical scaffold, including applicable history, red flags, examination, investigation, plan, and follow-up documentation.
6. Leave no material unsupported legacy clinical item.
7. Leave `unresolved_source_gaps` empty.
8. State and support the intended population.
9. State and support the clinical setting.
10. Establish UAE applicability rather than merely assuming international transferability.
11. Complete publication/update, recency, version, and superseded-status verification.
12. Preserve item provenance, clinician confirmation, default-off behavior, output safety, evidence hashes, and the zero-generic-template rule.

## Deterministic blocker counts

Counts overlap because one workflow can have several independent blockers.

| Blocker category | Affected terminal workflows | Counting method |
| --- | ---: | --- |
| Incomplete source coverage | 275 | Every terminal workflow is partial or no-authoritative-source and retains a material source gap. |
| UAE applicability | 270 | All evidenced workflows remain partial under the UAE/population/setting audit. The validator emits 289 individual findings: 270 partial-applicability findings plus 19 missing-explicit-UAE-evidence findings. |
| Unsupported legacy items | 275 | Every terminal workflow has at least one retained legacy item without exact-section support. |
| Explicit setting limitation or mismatch | 165 | The record explicitly limits the source/target setting or states that another setting remains outside scope or requires local/specialist adaptation. |
| Explicit population limitation or mismatch | 54 | The record explicitly limits age, pregnancy, condition, or other population applicability. |
| Incomplete recency verification | 0 | `audit:source-recency` passes for all 149 registered sources and no terminal record contains an incomplete-recency marker. |

The setting and population counts are conservative text-classification counts over applicability fields and unresolved-gap statements. They identify explicit limitations; they are not claims that all other records have complete setting or population coverage.

## Common reasons exact status is prevented

- Exact sections support only part of the retained legacy scaffold.
- Broad workflow titles exceed the population, indication, or setting of the source.
- International guidance still requires UAE facility, referral, prescribing, or service-pathway adaptation.
- Legacy aliases, generic documentation prompts, plan phrases, or follow-up items remain unmapped.
- High-risk workflows retain deliberately conservative gaps rather than converting guidance into automatic diagnosis, urgency, investigation, treatment, or disposition output.
- Five workflows have no suitable authoritative source and therefore retain all legacy content as unsupported pending review.

## Eligibility review

Already processed workflows appearing eligible for exact status: **0**.

All 270 evidenced workflows have non-empty unresolved gaps and unsupported legacy items. The five `no_authoritative_source_found` workflows have neither an exact document nor an exact section. Reclassification would therefore overstate evidence coverage.

## Logic audit

- Exact status is present in the schema, queue terminal-status set, manifest counters, and full exact-source audit.
- The validators do not require a non-zero exact count.
- The exact-source audit requires exact status with no unresolved gaps; therefore an honestly complete workflow can pass.
- The current helper defaults to partial status and appends conservative unresolved-gap statements. This is appropriate for the current batches, whose workflows all retain unsupported legacy items. A future exact record may use the lower-level record builder or a dedicated exact helper after complete item mapping is demonstrated.
- Status selection is author-declared rather than automatically calculated from item coverage. This is a future hardening opportunity, but it does not make exact status unreachable and does not justify changing any existing status.

## Decision

- Exact-status logic changed: **no**
- Prior workflows reclassified: **none**
- Evidence requirements reduced: **no**
- Existing statuses preserved: **yes**


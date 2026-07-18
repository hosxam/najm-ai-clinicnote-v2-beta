# Full-Source Reconstruction Batch 001

## Batch scope

- Branch: `full-source-guideline-reconstruction-v1`
- Workflow IDs: 20 deterministic high-priority workflows
- Next workflow: `gp-fever-follow-up`
- Batch status: `reconstructed_with_documented_limitations`
- Full authoritative documents retrieved and text-extracted: 21
- UAE documents: 12
- International governmental/professional documents requiring UAE adaptation: 9
- New source registrations: 0 (all sources were already qualified and registered)

The archived source files and extracted text are listed in `manifest.json`, with content and text SHA-256 fingerprints, official URLs, publisher, jurisdiction, access timestamp, and document type. The source archive includes DHA telehealth PDFs, NICE recommendation pages, NHS England’s breathlessness pathway, RCUK anaphylaxis guidance, EAACI guidance, and WHO/ICRC Basic Emergency Care.

## Output counts

- Legacy items examined: 1,762
- Legacy items retained: 3
- Legacy items rewritten: 177
- Legacy items removed from the provisional output: 1,582 (each remains in an audit record with a comparison method and reason)
- Full-source evidence items added: 93
- Final reconstructed item count: 273 (93 added, 3 retained, 177 rewritten)
- Item-level comparison records: 1,762
- Source-gap workflows in this batch: 0
- Blocked-source workflows: 0

Every added item carries source ID, title, publisher, URL, exact section locator, evidence paraphrase, retrieval timestamp, archive fingerprint, and rationale. Retained and rewritten legacy items carry their matched source and exact location; removed items carry a deterministic comparison method and reason. No dose, threshold, timing, or population claim was inferred.

## Workflow completeness

All 20 outputs assess the required documentation sections and record omission reasons/status. Because the first batch uses conservative extraction and does not infer missing clinical content, each workflow is marked `reconstructed_with_documented_limitations`, not `reconstructed_complete`. Full text was retrieved and inspected programmatically; item-level legacy promotion is explicit: exact phrase matches are retained, sufficiently overlapping statements are rewritten to narrower supported wording, and unsupported statements are removed with an auditable record.

## Validation

- `npm run research:full-source-batch-001` — PASS
- `npm run validate:full-source-batch-001` — PASS
- 20 workflow IDs unique and accounted for
- 21 source archives present with non-empty extracted text
- All added items have resolvable source locations
- Source archive fingerprints recorded
- No source-gap or blocked-source workflow in this batch
- Production `public/data` unchanged
- Canonical and signed state unchanged
- Mappings remain zero

No beta UI change or deployment was performed.

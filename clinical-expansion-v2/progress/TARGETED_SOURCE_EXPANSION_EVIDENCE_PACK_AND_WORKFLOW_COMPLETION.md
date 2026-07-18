# Targeted Source Expansion, Evidence-Pack, and Workflow Completion

## Verdict

**BLOCKED — full workflow reconstruction is not complete.**

The previous zero-source expansion defect was repaired, live official-source
capability was verified, and one authoritative source was ingested and reused
through the existing corpus/replay pipeline. The remaining gaps require further
authoritative research; no unsupported workflow content or final status was
published.

## Starting and protected state

- Branch: `guideline-evidence-packs-and-reconstruction-v1`
- Starting HEAD: `33cd96c27b6019076ee1e1b8cafe4428299ed51b`
- Original workflows: 1,500
- Initial evidence-gap packs: 604
- Packs requiring additional corpus search: 373
- Initial false blockers corrected: 393
- Production `public/data`: unchanged
- Canonical/signed state: unchanged
- Mappings/candidates: 0 / 0
- Exclusions: 12
- No push, deployment, merge, rebase, signing, approval, or clinician queue

## Root cause repaired

The prior completion worker only classified `additional_corpus_search_required`
and returned a blocked checkpoint. It had no live-search execution, no official
candidate ingestion path, and no registry-checkpoint merge for new source IDs.
When a source was manually added, ingestion aborted before retrieval because
the checkpoint required the old 235-source ordering exactly. The ingestion
checkpoint now preserves completed source stages and enqueues only new registry
IDs. A zero-progress run exits nonzero with an explicit technical blocker.

## Live capability and campaign execution

Live official-domain searches were verified for UAE authority, NICE, RCEM, and
WHO sources. Official HTML and PDF results were opened; the NICE NG120 official
recommendations page and PDF were selected for the acute-cough campaign. Search
snippets were not used as evidence.

- Campaigns generated: 18
- Deterministic query candidates generated: 3,363
- Live capability queries executed: 4
- Candidate sources found: 1 accepted source
- Sources rejected: 0
- New authoritative sources ingested: 1
- Source: `nice-acute-cough-ng120-2019`
- Affected workflows: 4 (`gp-cough`, `gp-cough-follow-up-in-gp`, `peds-cough`,
  `peds-pediatric-cough-follow-up`)
- Exact sections: assessment/course, referral, self-care/antimicrobial rationale

The source was retrieved and extracted through the corpus ingestion pipeline,
with exact locators and fingerprints. Corpus validation now reports 236
sources, 148 complete, 65 structurally limited, 19 blocked, 3 invalid, 1
superseded, and corpus fingerprint:

`9377495369b84412d0b0b265d86311264b01abc6865b69e1c1ebfdd017134e02`

## Evidence-pack state

- Evidence-pack families: 1,198
- Evidence statements: 70,199
- Source count used: 213
- Evidence-pack fingerprint:
  `55862cd719aa30b110b30bce0815440b7272fcd65bf4ba3aada53a0eec7ea632`
- Packs complete for mapped archetype profiles: 221
- Packs with remaining evidence gaps: 604
- Packs requiring additional corpus search: 373
- Current gap-manifest entries: 977 (the 373 search-required entries are
  retained separately from the 604 mapped-core gap entries)

The gap manifest and campaign manifest are deterministic and validated. The
new source did not alter any previously stored evidence statement or locator.

## Workflow reconstruction

`npm run workflows:reconstruct-all` processed all 1,500 IDs and correctly
returned `BLOCKED`:

- `genuine_missing_core_evidence`: 718
- `evidence_pack_expansion_required`: 389
- `item_evidence_reconciliation_required`: 393
- Reconstructed complete: 0
- Reconstructed with noncritical limitations: 0
- Merged: 0
- Retired: 0
- Blocked source access: 0 final statuses assigned
- Active usable workflows: 0
- Inactive workflows: 0
- Final active items: 0

No final workflow output or beta dataset was generated. Consequently, retained,
rewritten, removed, and added item totals remain zero rather than being
invented. Required core sections missing from active workflows are not
reported as zero because there are no active reconstructed workflows.

## Validation

Passed:

- source ingestion and corpus validation
- evidence-pack validation
- evidence-gap manifest validation
- source-research campaign validation
- workflow-archetype validation
- workflow checkpoint validation
- source-recency audit (236 sources)
- independent source-metadata reproducibility (236 replay sources, zero differences)

The source-metadata fingerprint is
`b4c72a2a883c0bd733c06077a950939c18700349cdc1e0f897efcb0609945533`; the
replay-manifest fingerprint is
`e2fee811807c83f4d2bd2bcc7a630634fb845afbd3a8f323dc8183d91d79bfe9`.

Lint/build and protected data validation remain runnable; no beta URL or
browser result exists because no usable catalogue was produced.

## Next bounded step

Continue the remaining campaigns with live official-source retrieval and exact
ingestion. The command is restartable:

```text
npm run sources:expand-evidence-gaps
npm run workflows:reconstruct-all
```

It must not report completion until all evidence gaps, final item decisions,
and 1,500 workflow statuses reconcile with exact corpus evidence.

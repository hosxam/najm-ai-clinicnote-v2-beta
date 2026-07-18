# Guideline Source Ingestion v1

## Result

`GUIDELINE_SOURCE_INGESTION_COMPLETE_READY_FOR_EVIDENCE_PACK_GENERATION`

The full 235-source registry was processed into a reproducible, machine-readable
source corpus. This phase did not reconstruct workflows, assign workflow
statuses, create review queues, modify production data, or deploy anything.

- Starting branch/HEAD: `guideline-workflow-resolution-v1` /
  `ea4461206cea794419c0d65ab647da287bb55ffc`
- Working branch: `guideline-source-ingestion-v1`
- Ending HEAD: recorded in the final ingestion commit
- Original registered sources: `235`
- Sources processed: `235`
- Pending sources: `0`
- Corpus fingerprint:
  `68217cba07c3426cf8913475e744ce715fb27acb3c88305020a04d8a05ce9498`

## Ingestion totals

| Final ingestion status | Count |
|---|---:|
| `ingested_complete` | 147 |
| `ingested_with_structural_limitations` | 65 |
| `blocked_source_access` | 19 |
| `invalid_source_target` | 3 |
| `superseded_source` | 1 |
| `duplicate_source` | 0 |
| **Total** | **235** |

The corpus contains `150` HTML sources and `81` PDF sources. `3,195` PDF pages,
`10,229` sections, `6,118` recommendation records, and `668` table records were
extracted. `595` table/algorithm references remain explicitly locatable but not
structured into fabricated cells or diagram semantics. No OCR source was used.
There were `217` unique normalized content fingerprints and `237` recorded
retrieval attempts. One source is explicitly superseded; no duplicate
authoritative content remained after challenge/shell responses were classified
as blocked rather than duplicates.

## Environment access probes

The required live capability probes passed:

| Probe | HTTP/content | Extraction and locator result | Fingerprints |
|---|---|---|---|
| UAE official HTML (MOHAP) | 200, `text/html`, 966,593 bytes | 55 headings, stable HTML heading locator | raw `3e5d7dd5815f38b989bfc18bd0d9358061a6e9f05890e8dafe5af6c8d5c4776f`; normalized `0da0cd1e22c59f8ce8d5278316c14c04909f654d61fd983879256a64128ec742` |
| UAE governmental PDF (DHA cough) | 200, `application/pdf`, 888,958 bytes, 30 pages | UTF-8 page extraction, page locators, algorithm references preserved | raw `cffb17c698810338d5ee341e10993b908d598eeb02c84d528a87258659ccfae9`; normalized `c97faf94934e603ad49ce60fe466eb3eb12e83cb7c368f82ae91a368da16215a` |
| International guideline (NICE acne) | 200, `text/html`, 111,815 bytes | 92 headings and one structured HTML table | raw `de62fcfcb356c5e276bbf3bb03ec1405b62637a37f0f975d8d662cd3b38277b8`; normalized `c85253335899c63610009dd76c9d9d18f7039c0146845414d48b1377b3a508ad` |
| HTML/PDF table-algorithm coverage | DHA PDF contained algorithm references; NICE HTML contained a table | both preserved as exact section/page/DOM locators; unstructured PDF diagrams were not interpreted | covered by the source records above |

The PDF extractor initially exposed a Windows code-page failure on Arabic text;
the worker now uses explicit UTF-8 extraction and the production ingestion pass
completed all readable PDFs.

## Corpus architecture and reproducibility

The corpus is under `clinical-expansion-v2/source-corpus-v1/` with derived
registry, documents, extracted page/section text, locators, tables, manifests,
checkpoints, reports, schemas, and an ignored local raw cache. The canonical
four-file source registry remains untouched. Raw downloads are stored only under
the ignored `.cache/raw` directory; normalized metadata and evidence structures
are reproducible from official URLs and recorded fingerprints.

The persistent worker is `npm run sources:ingest-all`. It processes source IDs in
deterministic order, retries recoverable failures, saves state before and after
each source, and resumes without reprocessing completed outputs. The checkpoint
records ordered IDs, completed/pending IDs, active source, stages, attempts,
resolved URLs, errors, source/output fingerprints, and state/corpus fingerprints.

The validator is `npm run validate:sources-ingestion`. It passed with:

- all 235 source IDs accounted for;
- all 235 checkpoint records completed;
- resolved URLs and fingerprints for every readable source;
- PDF page counts and page boundaries reconciled;
- HTML heading paths and exact locators preserved;
- replayed normalized fingerprints equal to stored fingerprints;
- blocked and invalid records retaining attempt logs;
- no snippets, model-generated clinical text, or local filesystem paths in
  app-facing corpus records.

Replay fingerprint equals the stored corpus fingerprint:
`68217cba07c3426cf8913475e744ce715fb27acb3c88305020a04d8a05ce9498`.

## Blocked, invalid, superseded, and structurally limited sources

Every non-complete source is listed below. Detailed attempt metadata, redirect
chains, response headers, and exact limitation objects are in each document JSON
record and in `SOURCE_CORPUS_MANIFEST.json`.

### Blocked source access — official retrieval unavailable or challenge/shell response

`aaos-carpal-tunnel-cpg-2024`, `ada-standards-care-hypoglycemia-2026`,
`ada-standards-comprehensive-evaluation-2026`,
`ada-standards-diabetes-technology-2026`,
`ada-standards-pharmacologic-treatment-2026`,
`ada-standards-prevention-diabetes-2026`, `bad-cutaneous-warts-guideline-2014`,
`bad-hidradenitis-suppurativa-guideline-2018`, `bad-rosacea-guideline-2021`,
`bad-vitiligo-guideline-2021`, `edf-chronic-pruritus-guideline-2025`,
`ese-adrenal-incidentaloma-2023`, `monash-international-pcos-guideline-2023`,
`pituitary-society-incidentaloma-2025`, `rcoa-gpas-day-surgery-2025`,
`rcoa-gpas-elective-urgent-perioperative-2025`,
`rcoa-gpas-paediatric-anesthesia-2025`, `rcoa-gpas-regional-anesthesia-2025`,
`who-audit-primary-care-2001`.

The ADA, BAD, EDF, Monash, Pituitary Society, RCoA, and WHO records returned
challenge, CAPTCHA, shell, or inaccessible responses; AAOS recorded two failed
retrieval attempts. No substitute or third-party text was stored.

### Invalid source targets — redirect rejected as outside the registered official host

`asrm-amenorrhea-committee-opinion-2024`,
`bad-alopecia-areata-living-guideline-2024`,
`jsw-keloid-hypertrophic-consensus-2018`.

The redirect destinations were recorded and rejected rather than silently
accepted as authoritative replacements.

### Superseded source

`nice-medicines-adherence-cg76-2009` — the original NICE record was preserved;
the registry explicitly identifies recommendation-level replacement by NG5.

### Structural limitations — readable content retained; table/algorithm structure limited

`acc-aha-hrs-bradycardia-gms-2018`, `asa-awareness-advisory-2006`,
`asa-neuraxial-opioid-respiratory-depression-2016`, `asa-osa-perioperative-2014`,
`asa-perioperative-blood-management-2015`, `asa-postanesthetic-care-guideline-2013`,
`asa-preanesthesia-evaluation-advisory-2012`, `asa-preoperative-fasting-2017`,
`bsaci-rhinitis-2017`, `bsg-abnormal-liver-blood-tests-2018`,
`bsg-acute-lower-gi-bleeding-2019`, `bsg-endoscopy-sedation-2023`,
`bsg-iron-deficiency-anaemia-2021`, `bts-chronic-cough-adults-2023`,
`cpoc-bgs-frailty-2021`, `cpoc-diabetes-perioperative-2022`,
`dha-acne-issue2-2024`, `dha-acute-low-back-pain-issue2-2024`,
`dha-acute-rhinosinusitis-issue2-2024`, `dha-allergic-contact-dermatitis-issue2-2024`,
`dha-allergic-rhinitis-issue2-2024`, `dha-atopic-dermatitis-issue2-2024`,
`dha-burns-issue2-2024`, `dha-conjunctivitis-issue2-2024`,
`dha-depression-issue2-2024`, `dha-dysmenorrhoea-issue2-2024`,
`dha-dysuria-issue2-2024`, `dha-insomnia-issue2-2024`,
`dha-minor-head-injury-issue2-2024`, `dha-neck-pain-issue2-2024`,
`dha-osteoarthritis-issue2-2024`, `dha-seborrheic-dermatitis-issue2-2024`,
`dha-swollen-eyelid-issue2-2024`,
`dha-telehealth-abdominal-pain-adults-v2-2024`, `dha-telehealth-asthma-v2-2024`,
`dha-telehealth-chest-pain-v2-2024`, `dha-telehealth-common-cold-v2-2024`,
`dha-telehealth-constipation-v2-2024`, `dha-telehealth-cough-v2-2024`,
`dha-telehealth-dizziness-v2-2024`, `dha-telehealth-fatigue-v2-2024`,
`dha-telehealth-fever-children-v2-2024`,
`dha-telehealth-gastroenteritis-adults-v2-2024`,
`dha-telehealth-gastroenteritis-children-v2-2024`,
`dha-telehealth-headache-adults-v2-2024`, `dha-telehealth-hypertension-v2-2024`,
`dha-telehealth-nausea-vomiting-v2-2024`, `dha-telehealth-palpitations-v2-2024`,
`dha-telehealth-rashes-children-v2-2024`, `dha-telehealth-sore-throat-v2-2024`,
`dha-telehealth-type2-diabetes-v2-2024`, `dha-tinea-pedis-issue2-2024`,
`dha-vaginal-candidiasis-v2-2024`, `hrs-ishne-ambulatory-ecg-2017`,
`hrs-remote-device-clinic-2023`, `kdigo-ckd-evaluation-management-2024`,
`mohap-tobacco-dependence-guideline-2024`,
`nhs-cheshire-merseyside-heart-failure-pathway-2022`,
`rcem-mental-health-toolkit-2023`, `rcem-procedural-sedation-ed-2022`,
`rcuk-anaphylaxis-2021`, `who-contraceptive-spr-fourth-2025`,
`who-icrc-basic-emergency-care-2018`, `who-infertility-guideline-2025`,
`who-stress-related-conditions-2013`.

For these sources, readable text, page/section boundaries, recommendations, and
locators were retained. PDF table cells and diagram semantics were not invented;
their page or section references remain explicit for later evidence-pack work.

## Protected-state confirmation

The 1,500 workflows remain unresolved. No workflow clinical content, canonical
state, signed state, mappings, candidates, exclusions, production `public/data`,
beta clinical interface, clinician queue, or review status was changed. No push,
deployment, merge, rebase, force-push, signing, or approval was performed.

## Validation and handoff

- `npm run sources:ingest-all`: completed all 235; checkpoint pending `0`.
- `npm run validate:sources-ingestion`: PASS; replay fingerprints equal.
- Deterministic rerun against cached completed content: PASS; no sources were
  re-downloaded unnecessarily.
- Workflows reconstructed: `0`.
- Workflows classified: `0`.

The corpus is ready for a separately authorized evidence-pack generation phase;
this report does not authorize workflow reconstruction or publication.

# Automated Item-Level Evidence Adjudication Beta Deployment

## Deployment

- Deployed source commit: `cf925b89a7500c91f4cefdccaf0da66b5561713f`
- Pushed ref: `clinician-review-adjudication-micro-pilot-v1` only
- Mechanism: existing GitHub Pages workflow `.github/workflows/deploy.yml`, manually dispatched against the approved beta branch
- Workflow run: [29647833688](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/29647833688)
- Live URL: https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta
- Displayed build SHA: `cf925b8`
- Stable production deployment: none

## Dataset totals

The published beta metadata reports 1,500 workflows and 83,303 items:

| Measure | Total |
| --- | ---: |
| Fully supported | 149 |
| Partially supported | 224 |
| Contextual only | 110 |
| Not supported | 340 |
| Conflicting | 0 |
| Inaccessible | 0 |
| No evidence link | 82,480 |
| High confidence | 108 |
| Low confidence | 83,195 |
| Human review required | 83,195 |
| Safety review required | 33,986 |
| Mappings | 0 |
| Clinician approvals | 0 |

## Verification

- All ten predeployment commands passed, including beta validation, adjudication tests, safety, all-workflow, output-safety, data, source-recency, reproducibility, lint, and build checks.
- `#/beta` loaded successfully and displayed the 1,500-workflow review surface and `Beta build: cf925b8`.
- Published `metadata.json` matched the totals above.
- AI classification filters worked for fully supported, no evidence link, safety review, and human review populations.
- A fully supported item displayed its exact evidence and rationale; partially supported content displayed scope differences and narrower wording; contextual and not-supported labels remained distinct; no-evidence items displayed no fabricated evidence link.
- A temporary clinician decision autosaved to localStorage, exported to JSON, imported back successfully, and was cleared after testing.
- No candidate was presented as clinician-approved, mappings remained zero, and no local filesystem path was exposed in the UI.
- Desktop beta route smoke test completed with no uncaught browser errors or failed asset requests.

## Isolation and limitation

No production public/data, source data, mappings, canonical state, signed state, or exclusions were changed. Exclusions remain 12. The deployment is beta-only; no merge, stable production deployment, signing, or approval occurred. A known limitation is that 82,480 items currently lack exact evidence links and therefore remain explicitly unverified for item-level support.

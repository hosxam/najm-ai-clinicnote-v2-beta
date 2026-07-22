# Final source-grounded beta deployment — blocked

## Attempt

- Required source branch: `guideline-evidence-packs-and-reconstruction-v1`
- Required starting source HEAD: `58be2e806dd364d571ffe168a9a64f1fc2048141`
- Deployment target: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta`
- Deployment mechanism: existing `.github/workflows/deploy.yml` GitHub Pages workflow
- Pushed ref: none
- Deployment workflow run: none
- Deployment commit: none

The branch, starting HEAD, clean worktree, remote, and GitHub Pages workflow were verified. The `github-pages` environment uses a custom deployment-branch policy and the workflow supports manual dispatch; no protection rules or settings were changed.

## Blocking predeployment result

The required local application-route smoke test was run against the actual Vite `/beta` route. It loaded, but the application reads `public/data-beta/curated-workflows/metadata.json`, whose committed metadata reports:

- workflows assessed: 1,500
- usable workflows: **0** (required: 416)
- clinically incomplete: **1,500** (required inactive: 1,084)
- unavailable content: **1,500**
- final source items: **2,942** (required clinician-facing items: 6,290)

The application route therefore does not expose the compact catalogue validated in the previous gate (416 usable workflows, 6,290 clinician-facing items, and 75,484 internal evidence records). This is a production-facing contract failure, so the deployment was stopped before pushing or dispatching GitHub Actions. The exact failing step is “predeployment beta-route totals”; live-site verification was not attempted.

The local route produced no uncaught application errors, but that does not remediate the incorrect dataset totals. The source tree remains clean and recoverable; the only post-attempt change is this documentation record. No clinical content, production public/data, canonical state, signed state, mappings, candidates, or exclusions were modified.

## Required follow-up

Integrate the validated compact catalogue into the application’s `#/beta` data adapter/build output, then rerun the complete predeployment matrix and desktop/tablet/mobile browser checks. Do not push or deploy until the route displays the required totals and evidence separation.

**FINAL_SOURCE_GROUNDED_BETA_DEPLOYMENT_FAILED**

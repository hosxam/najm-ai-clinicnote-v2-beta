# Final source-grounded beta deployment

## Attempt

- Required source branch: `guideline-evidence-packs-and-reconstruction-v1`
- Required starting source HEAD: `58be2e806dd364d571ffe168a9a64f1fc2048141`
- Deployment target: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta`
- Deployment mechanism: existing `.github/workflows/deploy.yml` GitHub Pages workflow
- Pushed ref: pending final validation and beta dispatch
- Deployment workflow run: pending
- Deployment commit: pending correction commit

The original failed attempt loaded `DirectGuidelineCurationPage`, which read `public/data-beta/curated-workflows/*`. That obsolete dataset reported 0 usable workflows, 1,500 incomplete/unavailable workflows, and 2,942 final source items. The corrected route now loads the single fail-closed manifest at `public/data-beta/final-catalogue/manifest.json`, generated losslessly from the validated artifacts at source commit `58be2e806dd364d571ffe168a9a64f1fc2048141`. The route no longer imports the direct-curation page or silently falls back to an older dataset.

The branch, starting HEAD, clean worktree, remote, and GitHub Pages workflow were verified. The `github-pages` environment uses a custom deployment-branch policy and the workflow supports manual dispatch; no protection rules or settings were changed.

Corrected files:

- `scripts/source-first/buildFinalBetaCatalogue.mjs`
- `scripts/source-first/validateFinalBetaCatalogue.mjs`
- `scripts/source-first/validateFinalBetaRouteWiring.mjs`
- `src/lib/finalBetaData.ts`
- `src/pages/FinalBetaCataloguePage.tsx`
- `src/app/router.tsx`
- `src/index.css`
- `public/data-beta/final-catalogue/*`

## Corrected local result

The actual Vite `/beta` route now loads the canonical final manifest and reports:

- workflows assessed: 1,500
- usable workflows: **416**
- inactive inventory: **1,084**
- clinician-facing items: **6,290**
- internal evidence records: **75,484**

Machine validation passed for active/inactive separation, item/evidence separation, route wiring, source/locator resolution, status reconciliation, usability, safety, data, lint, and build. Browser validation passed for search, specialty/archetype filters, representative active workflow detail/evidence panels, inactive isolation, and desktop/tablet/mobile layout with no horizontal overflow or uncaught application errors.

No clinical source wording was regenerated. Production public/data, canonical state, signed state, mappings, candidates, and exclusions were not modified.

## Required follow-up

The next step is the approved beta-only push and workflow dispatch. Live verification must confirm the same counts and build SHA before the deployment is considered complete.

**FINAL_SOURCE_GROUNDED_BETA_DEPLOYMENT_PENDING**

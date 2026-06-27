# Beta Deployment Plan

## Goal
Deploy `Najm ClinicNote V2` as a limited beta testing site to:

- Repo: `najm-ai-clinicnote-v2-beta`
- URL: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/`

This beta build is for limited internal doctor testing only.
It is not clinically approved, not clinically tested, and not public production release.

## Current build readiness
- Vite production base path is set to `/najm-ai-clinicnote-v2-beta/`.
- GitHub Pages workflow is already included at `.github/workflows/deploy.yml`.
- Safety banner remains visible.
- Excluded workflows remain hidden/blocked.
- Clinical workflow data is unchanged.
- `npm run validate:data` passes.
- `npm run build` passes.

## Recommended deployment method
Use **GitHub Pages via GitHub Actions**.

Why this is the safest option:
- It does not require committing built `dist/` artifacts to `main`.
- It keeps the beta repo separate from the old production repo.
- It is easy to rebuild and redeploy after future beta changes.
- It avoids accidentally publishing the old site.

## Step 1 - Create the beta GitHub repo
Create a new GitHub repository named:

- `najm-ai-clinicnote-v2-beta`

Recommended settings:
- Public or unlisted-by-link depending on your testing preference
- No README initialization if you are pushing this repo as-is
- No Pages setup yet until the source is pushed

## Step 2 - Add the beta repo as a remote
From the local repo root:

```bash
cd C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote-v2
git remote add beta https://github.com/hosxam/najm-ai-clinicnote-v2-beta.git
```

If a `beta` remote already exists:

```bash
git remote set-url beta https://github.com/hosxam/najm-ai-clinicnote-v2-beta.git
```

Verify remotes:

```bash
git remote -v
```

## Step 3 - Push the beta source repo
Push the current branch or `main` branch to the beta repo. The Pages workflow will already be included:

```bash
git push -u beta main
```

If your local primary branch is not `main`, either push that branch explicitly or rename it before enabling Pages.

## Step 4 - GitHub Pages workflow already included
This repo now includes:

- `.github/workflows/deploy.yml`

Workflow summary:
- Name: `Deploy beta to GitHub Pages`
- Trigger: push to `main` and manual `workflow_dispatch`
- Node version: `20`
- Runs `npm ci`
- Runs `npm run validate:data`
- Runs `npm run build`
- Uploads `dist/` with `actions/upload-pages-artifact@v3`
- Deploys with `actions/deploy-pages@v4`
- Uses `actions/configure-pages@v5`
- Uses proper permissions for Pages deploy
- Uses concurrency so only one Pages deployment runs at a time

## Step 5 - Enable GitHub Pages
In the GitHub repo:

1. Open `Settings`
2. Open `Pages`
3. Under `Build and deployment`, choose:
   - `Source: GitHub Actions`

After the workflow runs successfully, the beta site should appear at:

- `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/`

## Step 6 - Verify the beta deployment
After first deployment, confirm:
- Home loads correctly
- Quick Note route loads correctly
- Detailed Encounter route loads correctly
- Medical Report route loads correctly
- Runtime JSON files load from `/najm-ai-clinicnote-v2-beta/data/...`
- Excluded workflows remain hidden/blocked
- Safety banner is visible

## Step 7 - Future updates
For later beta fixes:

```bash
npm run validate:data
npm run build
git add .
git commit -m "Describe beta fix"
git push beta main
```

GitHub Actions will rebuild and redeploy automatically.

## Dist output check from this preparation pass
Confirmed in `dist/`:
- `index.html`
- `assets/`
- `data/`
- `config/limited_testing_exclusions.json`
- `exports/` (present because it is in public assets; not required for basic UI runtime but harmless)
- No source TypeScript/React files inside `dist/`

## Safety notes for beta testing
- Do not enter patient identifiers
- Use mock or anonymized cases only
- Outputs are clinician-review drafts only
- This is a documentation drafting tool, not clinical decision support
- Beta testing should begin with common low-risk workflows first

## Recommendation
Ready to commit and push to the separate beta repo for limited internal doctor testing.

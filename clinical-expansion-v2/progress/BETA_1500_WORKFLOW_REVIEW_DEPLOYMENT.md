# Beta 1,500-Workflow Review Deployment Record

## Result

**Deployment failed before Pages publish.** The existing GitHub Pages workflow built successfully, but its deploy job was rejected by the `github-pages` environment protection rules because the approved integration branch is not an allowed deployment branch.

- Required final token: `BETA_1500_WORKFLOW_REVIEW_DEPLOYMENT_FAILED`
- Failed workflow run: `29646453607`
- Build job: passed (`88085421081`)
- Deploy job: rejected (`88085469962`)
- Exact failure: `Branch "clinician-review-adjudication-micro-pilot-v1" is not allowed to deploy to github-pages due to environment protection rules.`

## Source and target

- Source repository: `hosxam/najm-ai-clinicnote-v2-beta`
- Source branch: `clinician-review-adjudication-micro-pilot-v1`
- Deployment commit: `ec227ec28d9261e673449c4ec383c2dd2da70cc4`
- Pushed ref: `origin/clinician-review-adjudication-micro-pilot-v1`
- Deployment mechanism: `.github/workflows/deploy.yml`, GitHub Pages artifact plus `actions/deploy-pages@v4`
- Target repository: `hosxam/najm-ai-clinicnote-v2-beta`
- Target URL: `https://hosxam.github.io/najm-ai-clinicnote-v2-beta/`
- Base path: `/najm-ai-clinicnote-v2-beta/`
- Expected beta route: `#/beta`

The deployment target was unambiguous and specifically matched the beta repository. No stable production target or `main` ref was pushed or deployed.

## Build and validation

The build job completed successfully with `npm run validate:data` and `npm run build`. Local predeployment checks also passed:

- beta dataset validation: PASS
- safety checks: PASS
- all-workflows: PASS
- output safety: PASS
- data validation: PASS
- source recency: PASS
- clinical-data reproducibility: PASS
- lint: PASS with repository/pre-existing warnings
- local build: PASS

Dataset contract remained 1,500 workflows, 83,303 items, 0 exact-source, 1,099 partial source support, 401 no-authoritative source, and 235 registered sources.

Because the Pages deploy job was rejected before publication, live smoke testing of the newly deployed build was not run. The previously published site therefore cannot be treated as containing this deployment.

## Protected-state confirmation

- `public/data`: unchanged
- mappings: 0
- candidate approvals: 0
- exclusions: 12
- canonical state: unchanged
- signed state: unchanged
- stable production website: unchanged
- no merge, rebase, force-push, signing, approval, or production deployment performed

## Recovery action

Do not bypass the environment protection rule. An owner or repository administrator must explicitly allow `clinician-review-adjudication-micro-pilot-v1` to deploy to the `github-pages` environment, or provide an approved beta-only deployment ref. After that administrative change, rerun the existing workflow against the same pushed commit. No code or clinical-data change is required for the retry.

Known beta limitation: review decisions remain browser-local and are not a shared server-side adjudication record.

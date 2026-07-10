# Deployment visual mismatch diagnosis

## Outcome

The Concept B redesign was deployed correctly from commit `19218a621e300054c0d94749b7a54a406f516e2e`. The live GitHub Pages HTML and bundles matched the fresh local Concept B build before the corrective marker deployment.

The apparent unchanged website was not caused by a wrong branch, wrong commit, wrong Vite base path, wrong artifact folder, or failed GitHub Pages deployment. The evidence points to an already-open browser tab or cached HTML presentation. GitHub Pages returned `Cache-Control: max-age=600`, and the first diagnostic request showed a CDN cache age of 540 seconds. A browser could therefore continue displaying a previously loaded build until reload or cache expiry.

## Source and deployment verification

- Local branch: `main`
- Concept B commit: `19218a621e300054c0d94749b7a54a406f516e2e`
- Local `HEAD` before the marker change: `19218a621e300054c0d94749b7a54a406f516e2e`
- `origin/main` before the marker change: `19218a621e300054c0d94749b7a54a406f516e2e`
- GitHub Pages run for Concept B: `29094525622`
- Pages result: success
- Vite production base: `/najm-ai-clinicnote-v2-beta/`
- Pages artifact path: `dist`

Concept B source markers were confirmed in the local application source, including:

- `Clinical documentation workspace`
- `What are you documenting?`
- `Draft review`
- `Suggested defaults are loaded from this workflow preset`
- the light slate/cyan workspace classes

## Concept B bundle comparison before the marker

### Fresh local build

- CSS asset: `/najm-ai-clinicnote-v2-beta/assets/index-CgZ5h8hx.css`
- CSS SHA-256: `4B3F2D263C784BA6A3839B743992AAC714E4D0ED55C894263D4F8AC5F366A731`
- JavaScript asset: `/najm-ai-clinicnote-v2-beta/assets/index-BqqAZf8J.js`
- JavaScript SHA-256: `1297CB8CB67015C8BD6C07CE32D6603204ED236C2019ED8F9ED7431F28C09C20`

### Live GitHub Pages build

- CSS asset: `/najm-ai-clinicnote-v2-beta/assets/index-CgZ5h8hx.css`
- CSS SHA-256: `4B3F2D263C784BA6A3839B743992AAC714E4D0ED55C894263D4F8AC5F366A731`
- JavaScript asset: `/najm-ai-clinicnote-v2-beta/assets/index-BqqAZf8J.js`
- JavaScript SHA-256: `1297CB8CB67015C8BD6C07CE32D6603204ED236C2019ED8F9ED7431F28C09C20`

Both live bundles contained the Concept B source markers. This exact filename and SHA-256 match rules out a stale GitHub Pages deployment at the time of diagnosis.

## Corrective verification marker

Corrective commit: `fd03ddd32e1e39e6c030b17a459f436c20294a3f`

Changes:

- Visible footer marker: `Beta build: 19218a6-concept-b`
- Browser console marker: `Najm ClinicNote build 19218a6-concept-b`

GitHub Pages run `29095736241` built and deployed this commit successfully.

## Marker build assets

The local Windows build and GitHub Actions Linux build used different Vite asset filenames for the marker build. Verification therefore used the live HTML references, SHA-256 values, and embedded marker strings rather than assuming local and CI filenames would be identical.

### Fresh local marker build

- CSS asset: `/najm-ai-clinicnote-v2-beta/assets/index-C1x41Pu4.css`
- CSS SHA-256: `2294D322CB758E6B2898BE8B3A437DE112D558CE2146D8AFF48B7FC867B7F0C8`
- JavaScript asset: `/najm-ai-clinicnote-v2-beta/assets/index-lFBe6HW_.js`
- JavaScript SHA-256: `B86CA0F73BEB9D43F8DCD6B82C5DA531537BD82165D9419564873295EDA51A27`

### Live marker build

- CSS asset: `/najm-ai-clinicnote-v2-beta/assets/index-DhMITMGg.css`
- CSS SHA-256: `35C3FDD1916A043BA8888C2A419CF00736F18E9A3A55CB3AA4CACF097745CE0F`
- JavaScript asset: `/najm-ai-clinicnote-v2-beta/assets/index-moZ6q5m8.js`
- JavaScript SHA-256: `B86CA0F73BEB9D43F8DCD6B82C5DA531537BD82165D9419564873295EDA51A27`

The live JavaScript contains both requested build markers and the Concept B UI strings. The live CSS contains the Concept B light workspace styling.

## Live browser verification

Verified at:

`https://hosxam.github.io/najm-ai-clinicnote-v2-beta/?build=fd03ddd#/`

- Home visibly shows the Concept B light clinical workspace.
- Quick Note visibly shows the two-column workflow and draft-review layout.
- Footer marker is visible.
- Console marker is emitted once with no console errors.
- Workflow count is 1,500.
- Available workflow count is 1,488.
- Excluded workflow count is 12.
- Search results do not expose `icu-sepsis-review-documentation`.
- Direct access to `psych-suicidality-screening-documentation` remains blocked.

## User-side cache recovery

If an older visual presentation remains open:

1. Open the cache-busted verification URL above.
2. Confirm the footer says `Beta build: 19218a6-concept-b`.
3. Use a hard refresh (`Ctrl+F5`) if the marker is absent.
4. Close older beta tabs to avoid comparing against a tab that has not reloaded.

## Final conclusion

Root cause: **client-side stale tab or cached HTML presentation**.

Deployment mismatch: **No**.

Concept B is now visibly deployed and independently identifiable through the footer and console build markers.

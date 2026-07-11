# Automated Remediation Report

- First-pass workflows audited: 1500
- Remediation records: 4785
- Workflows changed in the latest run: 0
- First-pass P0 findings targeted: 4765
- First-pass P1 findings targeted: 24

## Rules Applied

- Cleared every `prechecked_*` array so Quick Note starts unconfirmed.
- Forced canonical documentation items and clinician-entry fields into explicit-confirmation mode.
- Reframed detected red-flag conclusions as assessment prompts.
- Added minimum unconfirmed paediatric documentation fields where the workflow title/scope was paediatric.
- Promoted detected high-risk workflows to Tier 4 and excluded them pending source/clinical review.
- Corrected known encoding and temperature-label mismatches.

> Source gaps and generic-content findings were not invented away. They remain explicit qualified-review blockers.

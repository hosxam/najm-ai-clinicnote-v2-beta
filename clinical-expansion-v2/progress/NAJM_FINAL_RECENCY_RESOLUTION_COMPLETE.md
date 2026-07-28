# NAJM AI ClinicNote — Final source-recency blocker resolution

Status: COMPLETE. No new workflow was activated. The 25 previously active,
fail-closed recency blockers were removed from usable beta and preserved in
the inactive inventory with terminal dispositions.

## Repository and deployment

- Starting branch/HEAD: `beta-release-readiness-blockers-v1` / `cc725e6cdd550b4478ec2e757c341981222e58fb`.
- Resolution branch: `beta-final-recency-resolution-v1`.
- Ending implementation HEAD: `19b4656f8996447aa8a69e185347ad9842d8910d`.
- Beta deployment run: [30369346088](https://github.com/hosxam/najm-ai-clinicnote-v2-beta/actions/runs/30369346088).
- Deployed source SHA: `19b4656f8996447aa8a69e185347ad9842d8910d` (displayed `19b4656`).
- Live beta: [https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta](https://hosxam.github.io/najm-ai-clinicnote-v2-beta/#/beta).
- Live verification: 2026-07-28 18:43:07 +04:00.

## Blocker resolution

Before: 25 workflows were counted active while their routes failed closed with
`blocked_by_technical_error`. After: 0 active workflows have unresolved source
recency; 25 are inactive with terminal outcomes.

- `peds-cough`: `deactivated_source_access_unresolved` because its only source
  verification date (`2026-07-18`) is future-dated relative to the fixed policy
  evaluation date (`2026-07-16`).
- Other 24 pediatric records: `deactivated_missing_current_authoritative_source`
  because the only cited NICE acute-cough source is not authoritative for their
  unrelated workflow subjects. No unrelated replacement was substituted.
- Official NICE NG120 recommendations were rechecked on the official NICE
  domain and verified as current/unchanged; no replacement source was ingested,
  no source was withdrawn, and no source was superseded.
- Sources verified unchanged: 1 (`nice-acute-cough-ng120-2019`).
- Replacement sources ingested: 0.
- Withdrawn sources: 0.
- Access-blocked sources: 0 after supported official-domain check.

## Catalogue and provenance reconciliation

- Active catalogue: 902 → 877.
- Inactive catalogue: 598 → 623.
- Usable beta workflows: 877.
- Release-ready workflows: 460.
- Scope-qualified workflows: 417.
- Recency-deactivated workflows: 25.
- Technical-error workflows remaining active: 0.
- Clinician-facing items: 12,295.
- Internal evidence records: 116,793.
- Interactive fields: 10,980.
- Active interactive evidence records retained: 69,714.
- Active catalogue invariant: `877 = 460 + 417`.
- Every retained active field has a registered exact source reference; no
  invented section, page, source, or replacement mapping was created.

## Testing

Passed: source-recency policy/date/provenance tests, source replay parity,
metadata recheck isolation and fingerprints, clinical reproducibility, source
evidence, item provenance, data validation, interactive/final/advanced schema
validators, release-readiness validation, SOAP/output/safety tests, all 433
manual defect assertions, selectable controls, contradiction groups,
accessibility, performance, aliases, retirement, blocked-source and medication
safety checks, Wave9 regression/schema/browser checks, lint, and build.

Browser verification passed for:

- canonical beta route and final manifest loading;
- displayed build `19b4656`;
- retained active route;
- scope-qualified route with visible scope limitation;
- recency-deactivated route failing closed and showing its inactive reason;
- evidence-panel rendering;
- inactive inventory showing all 25 dispositions;
- desktop 1280px, tablet 768px and mobile 390px with no horizontal overflow;
- zero console errors and zero failed static assets.

## Protected boundaries and limitations

`public/data` remained unchanged. Mappings/candidates remain 0/0, exclusions
remain 12, and canonical/signed state was not modified. Stable production was
not deployed, merged, signed, approved, or otherwise changed. Historical
workflow-level exact-source/UAE/unsupported-legacy audit records remain
preserved as non-release audit history; the 83,303 legacy records remain
runtime-excluded. The 25 deactivated workflows require future workflow-specific
authoritative evidence before any reactivation.

## Commits

1. `f94bfc0a` — `research(recency): resolve blocked official-source checks`
2. `1425f4e5` — `data(recency): update source registry and evidence packs`
3. `109691c3` — `fix(catalogue): reconcile active and inactive workflow status`
4. `19b4656f` — `test(beta): validate recency resolution and full regression`
5. Final documentation commit — `docs(beta): complete final recency report`

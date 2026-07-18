# Resolution Worker Diagnostic

The no-progress root cause was in the worker loop: it only converted `source_gap_after_full_search` entries to retirement and `blocked_source_access` entries to blocked status. It never had a processing branch for pending `clinically_incomplete` workflows. Consequently, `gp-fever-urti` remained pending, `current family` remained unset in the saved checkpoint, and successful invocations returned unchanged counts and fingerprints.

The worker now selects the first pending workflow by numeric workflow order, assigns its persisted family, verifies source-access state, and validates the existing full-source output before taking any state action. If applicable core sections remain missing, it exits nonzero with machine-readable `GUIDELINE_RESOLUTION_WORKER_NO_PROGRESS` diagnostics instead of claiming success. The first selected workflow is `gp-fever-urti`; its full documents are available, but the current output is missing focused history, associated symptoms, relevant negatives, red flags, examination, escalation, and safety-netting.

Validation:

- `npm run reconstruct:resolve-all` exits 2 with the diagnostic above.
- `npm run test:workflow-resolution-worker` passes.
- No state counts or fingerprints are manually advanced.

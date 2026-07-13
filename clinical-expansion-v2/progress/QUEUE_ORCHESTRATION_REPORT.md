# Source-First Queue Orchestration Report

## Previous stopping behaviour

The research tooling exposed one command per authored ten-workflow batch. `researchNextWorkflow.mjs` only printed the next workflow and `applyResearchBatch.mjs` applied one supplied batch module before exiting. No queue-level command discovered subsequent researched batches, validated checkpoints, committed them, and continued.

## Root cause

The ten-workflow stop was an orchestration gap rather than a clinical-research rule. Batch modules intentionally contain the exact-document research and item mappings, but the repository had no sequential runner above those modules. Each command therefore ended after one batch by construction.

## Orchestration changes

- Added `scripts/source-first/researchQueue.mjs`.
- Added manifest-order resume, terminal-workflow skipping, maximum-workflow and time-budget limits, checkpoint intervals, and dry-run planning.
- Added a repository-local atomic queue lock under `.git` to prevent parallel manifest writers.
- Added atomic JSON and JSONL replacement writes.
- Added per-workflow batch application so every completed workflow is durably reflected before the next begins.
- Added lightweight validation and local checkpoint commits without returning after a checkpoint.
- Added rollback to the last valid checkpoint after a technical or validation failure.
- Preserved exact-source, provenance, audit, and clinical safety rules unchanged.

## Commands

```text
npm run research:queue -- --start <workflow_id> --max-workflows <number> --checkpoint-every <number> --time-budget-minutes <number> --continue-from-manifest
npm run research:queue -- --continue-from-manifest --dry-run
npm run test:research-queue
```

## Tests

The queue tests cover resume position, terminal skipping, continuation after ten-workflow checkpoints, maximum-workflow stopping, time-budget stopping, atomic restart-state replacement, exclusive queue locking, simulated interruption recovery, and frozen application-data hashes.

## Freeze confirmation

- Clinical research logic changed: **no**
- `public/data` changed: **no**
- Active exclusions changed: **no**

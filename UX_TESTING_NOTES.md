# UX Testing Notes

## Current build status

- Vite + React + TypeScript + Tailwind MVP
- `1,500` workflows imported from the staged legacy baseline
- `12` limited-testing exclusions hidden from normal search and blocked on direct access
- No backend, login, calculators, or LLM generation

## What to test first

1. Home search
   - Search by symptom, diagnosis, and workflow title
   - Confirm excluded workflows do not appear
   - Confirm common workflows and recently used workflows are helpful
2. Quick Note
   - Pick a common low-risk workflow
   - Use chips and short free-text fields
   - Copy, print, reset, and clear saved draft actions
3. Detailed Encounter
   - Confirm structured history / exam / investigation / plan flow feels usable
   - Confirm output tabs stay documentation-focused
4. Medical Report / Letter
   - Confirm simple report drafting works without adding recommendations

## Safety expectations during testing

- Do not enter patient identifiers
- Use mock or anonymized cases only
- Outputs are clinician-review drafts only
- The tool is not clinical decision support
- No diagnosis, treatment, dose, investigation, referral, or follow-up should be invented

## Browser persistence behavior

- Draft fields save in local browser storage only
- Recently used workflows save in local browser storage only
- “Clear saved draft” removes the current page draft from this browser

## Known MVP limitations

- No automated end-to-end UI tests yet
- No multi-user sync or remote storage
- No formal clinical approval or clinical testing
- No workflow-level editing or admin controls in this repo

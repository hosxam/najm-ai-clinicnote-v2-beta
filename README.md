# Najm ClinicNote V2

Najm ClinicNote V2 is a clean browser-based redesign of the legacy ClinicNote experience, built from the staged 1,500-workflow dataset while keeping the doctor workflow simple:

**What are you documenting today? → choose workflow → enter findings → generate clinician-review draft**

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Static browser-only app

## Local development

```bash
npm install
npm run validate:data
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Production-style build

```bash
npm run build
```

## Data baseline

- workflow count: `1,500`
- limited-testing exclusions: `12`
- excluded workflows hidden by default and blocked on direct access

## Safety

Najm ClinicNote is a documentation drafting tool. It is **not** clinical decision support. Outputs require clinician review.

## Current testing status

- MVP polish pass completed for doctor-facing limited testing
- Home search, Quick Note, Detailed Encounter, Medical Report, Feedback, and Safety / About pages are available
- Local draft persistence is browser-only
- Copy, print, reset, and clear-saved-draft actions are available on generated outputs
- Excluded workflows remain hidden or blocked

## Testing reminder

- Do not enter patient identifiers
- Use mock or anonymized cases only
- No workflows in this repo are clinically approved or clinically tested

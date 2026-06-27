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

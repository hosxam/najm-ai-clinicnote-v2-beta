# Simplicity Redesign Notes

## What was simplified

- Reframed the app around one main action: search, choose a workflow, and start drafting.
- Reduced the visible top-level navigation from mode-heavy labels to four simple areas:
  - `Document`
  - `Reports`
  - `Feedback`
  - `Safety`
- Made Home feel like the actual tool instead of a landing page.
- Made Quick Note feel like the primary documentation surface.
- Reduced repeated safety wording and removed some extra notice panels.
- Simplified workflow result cards so they scan faster.
- Renamed intimidating wording like `Detailed Encounter` to `Detailed note` in the UI.
- Renamed `Medical Report / Letter` to `Reports` in the UI.

## Header and navigation changes

- `Home` + `Quick Note` now sit under the main visible concept: `Document`.
- `Detailed Encounter` is no longer a top-level nav tab.
- `Reports` now covers the report drafting page.
- The header message is shorter and more product-like.
- The persistent safety banner remains visible but is more compact.

## What was removed or de-emphasized

- Removed the crowded multi-mode top navigation.
- Reduced hero/landing-page style messaging on Home.
- Removed the large mode-card section from Home.
- Reduced stats and visual noise to a smaller workflow-status summary.
- Simplified workflow cards by removing extra alias chips and some decorative metadata.
- Removed repeated local-draft warning panels from Quick Note, Detailed note, and Reports.
- Removed the extra output warning banner inside the draft panel because the persistent safety banner and review badge already cover that message.

## What remains intentionally secondary

- `Detailed note` remains available, but is intentionally framed as the secondary path when more structure is needed.
- `Reports` remains available, but is not emphasized as the primary starting flow.
- Exam findings in Quick Note remain manual.
- Excluded workflows remain hidden or blocked.

## Clinical data changed

No.

## Workflow and exclusion counts

- workflow count: `1500`
- excluded workflow count: `12`

## Validation result

- `npm run validate:data` passed.

## Build result

- `npm run build` passed.

## Manual smoke check summary

- Home now feels like the tool rather than a landing page.
- Searching and starting from `URTI` is quicker and clearer.
- Quick Note still loads suggested chips by default.
- `Generate note` is now an obvious primary action.
- Detailed note still works and is visually de-emphasized.
- Reports still works.
- Excluded workflows still remain hidden or blocked.
- Mobile simplicity improved because the header is shorter and the Home flow is more direct.

## Remaining complexity issues

- Quick Note still contains many chip options for some workflows; this is clinically useful but can still feel dense in longer workflows.
- Detailed note is still naturally more complex than Quick Note because of its broader documentation scope.
- Reports is simpler visually now, but could still be streamlined further if testers mostly use one report pattern.

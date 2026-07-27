/* oxlint-disable no-unused-expressions */
async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const bust = Date.now(); const consoleErrors = []; const failedRequests = []
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('requestfailed', request => { const reason = request.failure()?.errorText ?? 'failed'; if (!/ABORTED/i.test(reason)) failedRequests.push(`${request.url()} :: ${reason}`) })
  const final = await page.evaluate(async ({ base, bust }) => fetch(`${base}/data-beta/final-catalogue/manifest.json?wave8=${bust}`).then(response => response.json()), { base, bust })
  const interactive = await page.evaluate(async ({ base, bust }) => fetch(`${base}/data-beta/interactive-workflows/manifest.json?wave8=${bust}`).then(response => response.json()), { base, bust })
  await page.goto(`${base}/?wave8=${bust}#/beta`); await page.waitForLoadState('networkidle'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForLoadState('networkidle')
  const home = await page.getByRole('textbox', { name: 'Search interactive workflows' }).count() === 1
  const ids = ['gp-diabetes-followup', 'resp-chronic-cough-review', 'ed-blood-test-result-documentation', 'peds-hearing-concern-in-child', 'anes-pre-operative-anesthesia-assessment']
  const routes = []
  for (const id of ids) { await page.evaluate(() => localStorage.clear()); await page.goto(`${base}/?wave8=${bust}-${id}#/beta/workflows/${id}`); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500); routes.push({ id, quick: await page.getByRole('button', { name: 'Quick', exact: true }).count() === 1, advanced: await page.getByRole('button', { name: 'Advanced', exact: true }).count() === 1 }) }
  const inactive = await page.evaluate(async ({ base, bust }) => fetch(`${base}/data-beta/final-catalogue/inactive-inventory.json?wave8=${bust}`).then(response => response.json()), { base, bust }); const inactiveId = inactive.workflows[0]?.workflow_id
  let inactiveIsolation = { id: inactiveId, usable: false }; if (inactiveId) { await page.goto(`${base}/?wave8=${bust}-inactive#/beta/workflows/${inactiveId}`); await page.waitForLoadState('networkidle'); inactiveIsolation.usable = await page.getByRole('button', { name: 'Quick', exact: true }).count() > 0 }
  const viewports = []; for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) { await page.setViewportSize({ width, height }); await page.goto(`${base}/?wave8=${bust}-${name}#/beta`); await page.waitForLoadState('networkidle'); viewports.push({ name, loaded: await page.getByRole('textbox', { name: 'Search interactive workflows' }).count() === 1, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1) }) }
  const pass = final.counts.original_workflows === 1500 && final.counts.active_workflows === 829 && final.counts.inactive_workflows === 671 && home && routes.every(route => route.quick && route.advanced) && !inactiveIsolation.usable && viewports.every(view => view.loaded && !view.overflow) && consoleErrors.length === 0 && failedRequests.length === 0
  return { status: pass ? 'PASS' : 'FAIL', manifest_counts: final.counts, interactive_counts: interactive.counts, home, routes, inactive_isolation: inactiveIsolation, viewports, console_errors: consoleErrors, failed_requests: failedRequests }
}

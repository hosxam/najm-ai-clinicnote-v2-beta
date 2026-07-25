async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const cache = '?deploy=a6f277c'
  const errors = []
  const failed = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => failed.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  const catalog = await page.evaluate(async (url) => fetch(`${url}/data-beta/final-catalogue/catalog.json`).then((response) => { if (!response.ok) throw new Error(`catalog ${response.status}`); return response.json() }), base)
  const ids = catalog.workflows.map((workflow) => workflow.workflow_id)
  const routeResults = []
  await page.evaluate(() => localStorage.clear())
  await page.goto(`${base}/${cache}#/beta`)
  await page.waitForLoadState('networkidle')
  const catalogueLoaded = await page.getByRole('textbox', { name: 'Search interactive workflows' }).count() === 1 && await page.getByText('3,720').count() === 1
  for (const id of ids) {
    await page.goto(`${base}/${cache}#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    const title = (await page.locator('h1').first().textContent())?.trim() ?? ''
    const quickButton = page.getByRole('button', { name: 'Quick', exact: true })
    const advancedButton = page.getByRole('button', { name: 'Advanced', exact: true })
    const quickLoaded = await quickButton.count() === 1
    const advancedAvailable = await advancedButton.count() === 1
    if (advancedAvailable) await advancedButton.click()
    await page.waitForTimeout(25)
    const advancedLoaded = await page.getByText('All supported source-grounded fields in schema order.').count() === 1
    if (quickLoaded) await quickButton.click()
    routeResults.push({ workflow_id: id, title, quick_loaded: quickLoaded, advanced_loaded: advancedLoaded, advanced_available: advancedAvailable })
  }
  const sample = ids.filter((_, index) => index % 9 === 0).slice(0, 50)
  const viewportResults = []
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height })
    await page.goto(`${base}/${cache}#/beta`)
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => localStorage.clear())
    for (const id of sample) {
      await page.goto(`${base}/${cache}#/beta/workflows/${id}`)
      await page.waitForLoadState('domcontentloaded')
      await page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 })
      viewportResults.push({ viewport: name, workflow_id: id, loaded: await page.locator('h1').count() === 1, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1) })
    }
  }
  return {
    catalogue_loaded: catalogueLoaded,
    workflow_count: ids.length,
    quick_routes: routeResults.filter((result) => result.quick_loaded).length,
    advanced_routes: routeResults.filter((result) => result.advanced_loaded).length,
    route_failures: routeResults.filter((result) => !result.quick_loaded || !result.advanced_loaded),
    viewport_checks: viewportResults.length,
    viewport_failures: viewportResults.filter((result) => !result.loaded || result.overflow),
    console_errors: errors,
    failed_requests: failed,
  }
}

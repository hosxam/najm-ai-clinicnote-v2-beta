/* oxlint-disable no-unused-expressions */
async (page) => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta/'
  const expectedBuild = 'a10a918'
  const errors = []
  const failed = []
  const requests = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => failed.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }))
  page.on('request', (request) => requests.push(request.url()))
  const activeIds = ['peds-cough', 'peds-pediatric-asthma-review', 'gp-hypertension-followup', 'cardio-syncope-follow-up', 'ed-imaging-result-documentation', 'derm-psoriasis-flare-documentation', 'urgent-wound-care-laceration']
  const inactiveIds = ['peds-pediatric-fever-follow-up', 'gp-dysuria', 'resp-pediatric-to-adult-asthma-transition-documentation']
  const cache = Date.now()
  await page.goto(`${base}?deep-pilot=${cache}#/beta`, { waitUntil: 'networkidle' })
  const home = await page.locator('body').innerText()
  const finalManifest = await page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}data-beta/final-catalogue/manifest.json?deep-pilot=${Date.now()}`)
  const interactiveManifest = await page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}data-beta/interactive-workflows/manifest.json?deep-pilot=${Date.now()}`)
  const routeResults = []
  for (const id of activeIds) {
    await page.goto(`${base}?deep-pilot=${cache}-${id}#/beta/workflows/${id}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(350)
    const text = await page.locator('body').innerText()
    await page.getByRole('button', { name: 'Quick' }).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    let quick = await page.getByRole('button', { name: 'Quick' }).count()
    let advanced = await page.getByRole('button', { name: 'Advanced' }).count()
    if (!quick || !advanced) {
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
      quick = await page.getByRole('button', { name: 'Quick' }).count()
      advanced = await page.getByRole('button', { name: 'Advanced' }).count()
    }
    let advancedRendered = false
    if (advanced) { await page.getByRole('button', { name: 'Advanced' }).click(); advancedRendered = await page.locator('body').innerText().then((body) => body.includes('Advanced') || body.includes('All supported source-grounded fields')) }
    routeResults.push({ workflow_id: id, active: !/inactive and is not available/i.test(text), quick: Boolean(quick), advanced: Boolean(advanced), advanced_rendered: advancedRendered, evidence_panel: /Evidence|source-grounded/i.test(text), title_loaded: text.length > 300 })
  }
  const inactiveResults = []
  for (const id of inactiveIds) {
    await page.goto(`${base}?deep-pilot=${cache}-${id}#/beta/workflows/${id}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(350)
    const text = await page.locator('body').innerText()
    inactiveResults.push({ workflow_id: id, failed_closed: /inactive and is not available as usable clinical content/i.test(text), usable_marker: /Active source-grounded workflow|^\s*Usable\s*$/m.test(text) })
  }
  const responsive = []
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height })
    await page.goto(`${base}?deep-pilot=${cache}-${name}#/beta`, { waitUntil: 'networkidle' })
    responsive.push({ name, loaded: await page.getByRole('textbox', { name: 'Search interactive workflows' }).count() === 1, scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), clientWidth: await page.evaluate(() => document.documentElement.clientWidth) })
  }
  await page.evaluate(() => localStorage.clear())
  const result = {
    status: errors.length || failed.length || !home.includes('Interactive workflows') || finalManifest.status !== 200 || interactiveManifest.status !== 200 || routeResults.some((route) => !route.active || !route.quick || !route.advanced || !route.advanced_rendered) || inactiveResults.some((route) => !route.failed_closed || route.usable_marker) || responsive.some((view) => !view.loaded || view.scrollWidth > view.clientWidth + 1) || requests.some((url) => url.includes('/data-beta/curated-workflows/')) ? 'FAIL' : 'PASS',
    live_url: `${base}#/beta`,
    expected_build: expectedBuild,
    displayed_build: (home.match(/Build\s+([0-9a-f]+)/i) ?? [])[1] ?? null,
    home_loaded: home.includes('Interactive workflows'),
    final_manifest_status: finalManifest.status,
    final_manifest_counts: finalManifest.body?.counts ?? null,
    interactive_manifest_status: interactiveManifest.status,
    interactive_manifest_counts: interactiveManifest.body?.counts ?? null,
    obsolete_curated_workflows_status: 'not_requested',
    active_routes: routeResults,
    inactive_routes: inactiveResults,
    responsive,
    console_errors: errors,
    failed_requests: failed,
    obsolete_requests: requests.filter((url) => url.includes('/data-beta/curated-workflows/')),
    local_storage_cleared: true,
    local_filesystem_paths_exposed: /[A-Z]:\\|C:\\\\Users|file:\/\//i.test(home)
  }
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'PASS') throw new Error(`Deep pilot live verification failed: ${JSON.stringify(result)}`)
  return result
}

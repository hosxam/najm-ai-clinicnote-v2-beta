/* oxlint-disable no-unused-expressions */
async (page) => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta/'
  const expectedBuild = '6fde3ea'
  const activeIds = [
    'peds-pediatric-abdominal-pain-follow-up', 'peds-pediatric-allergic-rhinitis',
    'peds-pediatric-allergy-action-plan-documentation', 'peds-pediatric-constipation',
    'peds-pediatric-cough-follow-up', 'peds-pediatric-diarrhea-follow-up',
    'peds-pediatric-dizziness', 'peds-pediatric-eczema-follow-up',
    'peds-pediatric-fever-follow-up', 'peds-pediatric-headache-follow-up',
    'peds-pediatric-injury-follow-up', 'peds-pediatric-medication-review',
    'peds-pediatric-rash-documentation', 'peds-pediatric-result-review',
    'peds-pediatric-vomiting-follow-up', 'peds-pediatric-wheeze-follow-up',
    'peds-pediatric-wound-review', 'ed-vomiting-documentation', 'gp-dysuria',
    'resp-pediatric-to-adult-asthma-transition-documentation'
  ]
  const inactiveIds = ['peds-pediatric-fever-follow-up', 'gp-dysuria', 'resp-pediatric-to-adult-asthma-transition-documentation']
  const errors = []
  const failed = []
  const requests = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => failed.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }))
  page.on('request', (request) => requests.push(request.url()))
  const cache = Date.now()
  await page.goto(`${base}?wave11=${cache}#/beta`, { waitUntil: 'networkidle' })
  const home = await page.locator('body').innerText()
  const finalManifest = await page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}data-beta/final-catalogue/manifest.json?wave11=${cache}`)
  const interactiveManifest = await page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}data-beta/interactive-workflows/manifest.json?wave11=${cache}`)
  const obsolete = 'not_requested_by_app'
  const routeResults = []
  for (const id of activeIds.filter((candidate) => !inactiveIds.includes(candidate))) {
    await page.goto(`${base}?wave11=${cache}-${id}#/beta/workflows/${id}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const text = await page.locator('body').innerText()
    let quick = await page.getByRole('button', { name: 'Quick' }).count()
    let advanced = await page.getByRole('button', { name: 'Advanced' }).count()
    if (!quick || !advanced) {
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
      quick = await page.getByRole('button', { name: 'Quick' }).count()
      advanced = await page.getByRole('button', { name: 'Advanced' }).count()
    }
    if (advanced) await page.getByRole('button', { name: 'Advanced' }).click()
    const advancedText = await page.locator('body').innerText()
    const evidenceLink = await page.locator('a[href*="rch.vic.gov.au"]').count() + await page.locator('a[href*="rch.org.au"]').count()
    const requiresNewSource = ['peds-pediatric-abdominal-pain-follow-up', 'peds-pediatric-diarrhea-follow-up', 'peds-pediatric-vomiting-follow-up'].includes(id)
    routeResults.push({ workflow_id: id, active: !/inactive and is not available as usable clinical content/i.test(text), quick: Boolean(quick), advanced: Boolean(advanced), evidence_panel: /Guideline evidence \(/i.test(text), evidence_source_link: requiresNewSource ? evidenceLink > 0 : true, advanced_rendered: /Advanced|Source-grounded/i.test(advancedText) })
  }
  const inactiveResults = []
  for (const id of inactiveIds) {
    await page.goto(`${base}?wave11=${cache}-${id}#/beta/workflows/${id}`, { waitUntil: 'networkidle' })
    const text = await page.locator('body').innerText()
    inactiveResults.push({ workflow_id: id, failed_closed: /inactive and is not available as usable clinical content/i.test(text), usable_marker: /ACTIVE SOURCE-GROUNDED WORKFLOW/i.test(text) })
  }
  const responsive = []
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height })
    await page.goto(`${base}?wave11=${cache}-${name}#/beta`, { waitUntil: 'networkidle' })
    responsive.push({ name, loaded: /Interactive workflows/i.test(await page.locator('body').innerText()), scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), clientWidth: await page.evaluate(() => document.documentElement.clientWidth) })
  }
  await page.evaluate(() => localStorage.clear())
  const result = {
    status: errors.length || failed.length || !/Interactive workflows/i.test(home) || finalManifest.status !== 200 || interactiveManifest.status !== 200 || routeResults.some((route) => !route.active || !route.quick || !route.advanced || !route.evidence_panel || !route.advanced_rendered) || inactiveResults.some((route) => !route.failed_closed || route.usable_marker) || responsive.some((view) => !view.loaded || view.scrollWidth > view.clientWidth + 1) || requests.some((url) => url.includes('/data-beta/curated-workflows/')) ? 'FAIL' : 'PASS',
    live_url: `${base}#/beta`, expected_build: expectedBuild, displayed_build: (home.match(/Build\s+([0-9a-f]+)/i) ?? [])[1] ?? null,
    catalogue_loaded: /Interactive workflows/i.test(home),
    final_manifest_status: finalManifest.status, final_manifest_counts: finalManifest.body?.counts ?? null,
    interactive_manifest_status: interactiveManifest.status, interactive_manifest_counts: interactiveManifest.body?.counts ?? null,
    obsolete_curated_workflows_status: obsolete, active_routes: routeResults, inactive_routes: inactiveResults,
    responsive, console_errors: errors, failed_requests: failed,
    obsolete_requests: requests.filter((url) => url.includes('/data-beta/curated-workflows/')),
    local_storage_cleared: true, local_filesystem_paths_exposed: /[A-Z]:\\|C:\\\\Users|file:\/\//i.test(home)
  }
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'PASS' || result.displayed_build !== expectedBuild || result.final_manifest_counts?.active_workflows !== 901) throw new Error(`Wave 11 live verification failed: ${JSON.stringify(result)}`)
  return result
}

/* oxlint-disable no-unused-expressions */
async (page) => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta/'
  const expectedBuild = process.env.WAVE12_EXPECTED_BUILD || '2f61517'
  const activeIds = ['peds-pediatric-anemia-result-review','peds-pediatric-chronic-disease-follow-up','peds-pediatric-fatigue','peds-pediatric-travel-advice-documentation','peds-pediatric-vitamin-d-review','cardio-statin-tolerance-documentation','cardio-tachycardia-documentation','cardio-valvular-disease-follow-up','gastro-rectal-bleeding','ophth-red-eye','ed-critical-incident-documentation','ed-ecg-documentation','ed-handover-documentation','ed-medication-administration-documentation','ed-referral-documentation','ed-triage-documentation','gp-epistaxis-review-in-gp','gp-falls-risk-screening','gp-fatigue','gp-lab-result-review']
  const inactiveIds = ['peds-pediatric-urinary-symptoms','cardio-pregnancy-cardiac-history-documentation','cardio-referral-documentation','ed-interpreter-documentation','resp-latent-tb-result-review','resp-vaping-related-respiratory-symptoms']
  const errors = []; const failed = []; const requests = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => failed.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }))
  page.on('request', (request) => requests.push(request.url()))
  const cache = Date.now(); const load = async (url) => { await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(400) }
  await load(`${base}?wave12=${cache}#/beta`)
  const home = await page.locator('body').innerText()
  const fetchJson = async (path) => page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}${path}?wave12=${cache}`)
  const finalManifest = await fetchJson('data-beta/final-catalogue/manifest.json'); const interactiveManifest = await fetchJson('data-beta/interactive-workflows/manifest.json')
  const routeResults = []
  for (const id of activeIds) {
    await load(`${base}?wave12=${cache}-${id}#/beta/workflows/${id}`); let text = await page.locator('body').innerText()
    let quick = await page.getByRole('button', { name: 'Quick' }).count(); let advanced = await page.getByRole('button', { name: 'Advanced' }).count()
    if (!quick || !advanced) { await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(700); quick = await page.getByRole('button', { name: 'Quick' }).count(); advanced = await page.getByRole('button', { name: 'Advanced' }).count(); text = await page.locator('body').innerText() }
    if (advanced) { await page.getByRole('button', { name: 'Advanced' }).click(); await page.waitForTimeout(100) }
    const advancedText = await page.locator('body').innerText()
    routeResults.push({ workflow_id: id, active: !/inactive and is not available as usable clinical content/i.test(text), quick: Boolean(quick), advanced: Boolean(advanced), evidence_panel: /Guideline evidence \(/i.test(text) || /Evidence/i.test(text), advanced_rendered: /Advanced|Source-grounded/i.test(advancedText) })
  }
  const inactiveResults = []
  for (const id of inactiveIds) { await load(`${base}?wave12=${cache}-${id}#/beta/workflows/${id}`); const text = await page.locator('body').innerText(); inactiveResults.push({ workflow_id: id, failed_closed: /inactive and is not available as usable clinical content/i.test(text), usable_marker: /ACTIVE SOURCE-GROUNDED WORKFLOW/i.test(text) }) }
  const search = await page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i]').count(); let searchWorks = false
  if (search) { const input = page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i]').first(); await input.fill('pediatric anemia'); await page.waitForTimeout(200); searchWorks = /pediatric anemia/i.test(await page.locator('body').innerText()) }
  const responsive = []
  for (const [name, width, height] of [['desktop',1440,900],['tablet',1024,768],['mobile',390,844]]) { await page.setViewportSize({ width, height }); await load(`${base}?wave12=${cache}-${name}#/beta`); responsive.push({ name, loaded: /Interactive workflows/i.test(await page.locator('body').innerText()), scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), clientWidth: await page.evaluate(() => document.documentElement.clientWidth) }) }
  await page.evaluate(() => localStorage.clear())
  const displayedBuild = (home.match(/Build\s+([0-9a-f]+)/i) ?? [])[1] ?? null
  const result = { status: errors.length || failed.length || !/Interactive workflows/i.test(home) || finalManifest.status !== 200 || interactiveManifest.status !== 200 || finalManifest.body?.counts?.active_workflows !== 935 || routeResults.some((route) => !route.active || !route.quick || !route.advanced || !route.evidence_panel || !route.advanced_rendered) || inactiveResults.some((route) => !route.failed_closed || route.usable_marker) || responsive.some((view) => !view.loaded || view.scrollWidth > view.clientWidth + 1) || requests.some((url) => url.includes('/data-beta/curated-workflows/')) ? 'FAIL' : 'PASS', live_url: `${base}#/beta`, expected_build: expectedBuild, displayed_build: displayedBuild, catalogue_loaded: /Interactive workflows/i.test(home), final_manifest_status: finalManifest.status, final_manifest_counts: finalManifest.body?.counts ?? null, interactive_manifest_status: interactiveManifest.status, interactive_manifest_counts: interactiveManifest.body?.counts ?? null, active_routes: routeResults, inactive_routes: inactiveResults, search_input_present: Boolean(search), search_works: searchWorks, responsive, console_errors: errors, failed_requests: failed, obsolete_requests: requests.filter((url) => url.includes('/data-beta/curated-workflows/')), local_storage_cleared: true, local_filesystem_paths_exposed: /[A-Z]:\\|C:\\\\Users|file:\/\//i.test(home) }
  console.log(JSON.stringify(result, null, 2)); if (result.status !== 'PASS' || displayedBuild !== expectedBuild) throw new Error(`Wave 12 live verification failed: ${JSON.stringify(result)}`); return result
}

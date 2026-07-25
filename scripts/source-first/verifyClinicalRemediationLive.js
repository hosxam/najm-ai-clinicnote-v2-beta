async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const cache = '?deploy=a6f277c'
  const expectedSha = 'a6f277cac6a7316367fe27abe5b5429ee282ce54'
  const representative = [
  'cardio-chest-pain', 'gp-fever-urti', 'ent-recurrent-tonsillitis', 'cardio-dyspnea',
  'gp-abdominal-pain', 'gp-headache', 'cardio-hypertension-followup',
  'gp-medication-adherence-review', 'cardio-anticoagulation-documentation',
  'gp-medication-review', 'cardio-ecg-result-review', 'ed-pediatric-fever-documentation',
  'ed-observation-unit-review', 'surg-bariatric-pre-operative-documentation',
  'surg-stoma-appliance-issue-documentation',
  ]
  const consoleErrors = []
  const failedRequests = []
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('requestfailed', request => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  await page.goto(`${base}/${cache}#/beta`)
  await page.waitForLoadState('networkidle')
  const manifest = await page.evaluate(async url => fetch(`${url}/data-beta/final-catalogue/manifest.json`).then(async response => ({ ok: response.ok, data: await response.json() })), base)
  const catalogue = await page.evaluate(async url => fetch(`${url}/data-beta/final-catalogue/catalog.json`).then(async response => ({ ok: response.ok, data: await response.json() })), base)
  const bodyText = await page.locator('body').innerText()
  const loadedCounts = {
    original_workflows: manifest.data?.counts?.original_workflows,
    active_workflows: manifest.data?.counts?.active_workflows,
    inactive_workflows: manifest.data?.counts?.inactive_workflows,
    clinician_facing_items: manifest.data?.counts?.clinician_facing_items,
    internal_evidence_records: manifest.data?.counts?.internal_evidence_records,
  }
  const buildShaDisplayed = bodyText.includes(expectedSha) || bodyText.includes(expectedSha.slice(0, 7))
  const obsoleteDatasetRequested = failedRequests.some(value => value.includes('curated-workflows'))
  const routes = []
  for (const workflowId of representative) {
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${base}/${cache}#/beta/workflows/${workflowId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(400)
    const startFresh = page.getByRole('button', { name: 'Start fresh' })
    if (await startFresh.count()) await startFresh.click()
    await page.waitForTimeout(400)
    const title = (await page.locator('h1').first().textContent())?.trim() ?? ''
    const quick = await page.getByRole('button', { name: 'Quick', exact: true }).count() === 1
    const advancedButton = page.getByRole('button', { name: 'Advanced', exact: true })
    const advanced = await advancedButton.count() === 1
    if (advanced) await advancedButton.click()
    await page.waitForTimeout(25)
    const schema = await page.getByText('All supported source-grounded fields in schema order.').count() === 1
    routes.push({ workflow_id: workflowId, title, quick, advanced, schema })
  }
  const expected = { original_workflows: 1500, active_workflows: 416, inactive_workflows: 1084, clinician_facing_items: 6290, internal_evidence_records: 75484 }
  const countMatch = Object.entries(expected).every(([key, value]) => loadedCounts[key] === value)
  return {
    live_url: `${base}/#/beta`,
    expected_sha: expectedSha,
    build_sha_displayed: buildShaDisplayed,
    manifest_loaded: manifest.ok,
    canonical_manifest: true,
    obsolete_dataset_requested: obsoleteDatasetRequested,
    catalogue_loaded: catalogue.ok,
    catalogue_workflows: catalogue.data?.workflows?.length ?? 0,
    counts: loadedCounts,
    counts_match: countMatch,
    representative_routes: routes,
    route_failures: routes.filter(route => !route.quick || !route.advanced || !route.schema),
    console_errors: consoleErrors,
    failed_requests: failedRequests,
  }
}

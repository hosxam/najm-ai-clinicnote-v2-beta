async (page) => {
const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta/'
const errors = []
const failed = []
const requests = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
page.on('requestfailed', (request) => failed.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }))
page.on('request', (request) => requests.push(request.url()))
await page.goto(`${base}#/beta`, { waitUntil: 'networkidle' })
const home = await page.locator('body').innerText()
const manifest = await page.evaluate(async (url) => { const response = await fetch(url); return { status: response.status, body: response.ok ? await response.json() : null } }, `${base}data-beta/final-catalogue/manifest.json`)
const obsolete = await page.evaluate(async (url) => { const response = await fetch(url); return response.status }, `${base}data-beta/curated-workflows/catalog.json`)
const route = async (id) => { await page.goto(`${base}#/beta/workflows/${id}`, { waitUntil: 'networkidle' }); const fresh = page.getByRole('button', { name: 'Start fresh' }); if (await fresh.count()) await fresh.click(); return await page.locator('body').innerText() }
const activeText = await route('gp-fever-urti')
const inactiveText = await route('peds-cough')
const widths = []
for (const width of [1440, 768, 390]) { await page.setViewportSize({ width, height: 900 }); await page.goto(`${base}#/beta`, { waitUntil: 'networkidle' }); widths.push({ width, scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), clientWidth: await page.evaluate(() => document.documentElement.clientWidth) }) }
const result = {
  url: page.url(),
  build_sha: (home.match(/Build\s+([0-9a-f]+)/i) ?? [])[1] ?? null,
  catalogue_loaded: home.includes('Interactive workflows'),
  interactive_workflows: Number((home.match(/Interactive workflows\s*([\d,]+)/) ?? [])[1]?.replaceAll(',', '') ?? 0),
  interactive_fields: Number((home.match(/Interactive fields\s*([\d,]+)/) ?? [])[1]?.replaceAll(',', '') ?? 0),
  interactive_evidence: Number((home.match(/Evidence records retained\s*([\d,]+)/) ?? [])[1]?.replaceAll(',', '') ?? 0),
  canonical_manifest_status: manifest.status,
  canonical_manifest_counts: manifest.body?.counts ?? null,
  obsolete_curated_workflows_status: obsolete,
  active_route_loaded: activeText.includes('Fever') && !activeText.includes('not available'),
  active_route_excerpt: activeText.slice(0, 300),
  inactive_route_fail_closed: inactiveText.includes('inactive') || inactiveText.includes('not available'),
  responsive: widths.every((row) => row.scrollWidth <= row.clientWidth + 1),
  widths,
  console_errors: errors,
  failed_assets: failed,
  curated_workflow_requests: requests.filter((url) => url.includes('/data-beta/curated-workflows/')),
}
console.log(JSON.stringify(result, null, 2))
if (result.build_sha !== 'a53b891' || !result.catalogue_loaded || result.interactive_workflows !== 877 || result.interactive_fields !== 10980 || result.interactive_evidence !== 69714 || result.canonical_manifest_status !== 200 || !result.active_route_loaded || !result.inactive_route_fail_closed || !result.responsive || errors.length || failed.length) throw new Error(`Wave 10 live verification failed: ${JSON.stringify(result)}`)
return result
}

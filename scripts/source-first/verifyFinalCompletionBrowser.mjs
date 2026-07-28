/* oxlint-disable no-unused-expressions */
async (page) => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta/'
  const errors = []
  const failed = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => { const error = request.failure()?.errorText ?? 'unknown'; if (error !== 'net::ERR_ABORTED') failed.push({ url: request.url(), error }) })
  const loadHome = async () => { await page.goto(`${base}?final=${Date.now()}#/beta`, { waitUntil: 'networkidle' }); await page.waitForTimeout(700) }
  await loadHome()
  const initialText = await page.locator('body').innerText()
  const expectedBuildSha = 'e6e540e'
  const build_sha_matches = initialText.includes(`Build ${expectedBuildSha}`)
  const search = page.getByRole('textbox', { name: 'Search interactive workflows' })
  const status = page.getByRole('combobox', { name: 'Filter interactive status' })
  const specialty = page.getByRole('combobox', { name: 'Filter interactive specialty' })
  const archetype = page.getByRole('combobox', { name: 'Filter interactive archetype' })
  const exactTitle = 'Pediatric anemia result review'
  const inactiveTitle = 'Pediatric urinary symptoms'
  const alias = 'pediatric urinary complaint'
  const searchChecks = {}
  searchChecks.control_present = await search.count() === 1
  searchChecks.empty_query = /Showing .*matching records/i.test(initialText)
  await search.fill(exactTitle); await page.waitForTimeout(150); searchChecks.exact_title = (await page.locator('body').innerText()).includes(exactTitle)
  await search.fill(alias); await page.waitForTimeout(150); searchChecks.synonym = (await page.locator('body').innerText()).includes(inactiveTitle)
  await search.fill('no-such-workflow-9f0e'); await page.waitForTimeout(150); searchChecks.no_result = /Showing 0 of 0 matching records/i.test(await page.locator('body').innerText())
  await search.fill(''); await page.waitForTimeout(150)
  await status.selectOption('inactive'); await page.waitForTimeout(150)
  const inactiveCards = page.locator('[data-workflow-status="inactive"]')
  const inactiveCount = await inactiveCards.count()
  const inactiveText = await page.locator('body').innerText()
  searchChecks.inactive_filter = inactiveCount === 565 && inactiveText.includes('Inactive · fail closed') && inactiveText.includes('Reason:')
  searchChecks.inactive_no_usable_links = await inactiveCards.locator('a').count() === 0
  await status.selectOption('active'); await page.waitForTimeout(150)
  const activeText = await page.locator('body').innerText()
  searchChecks.active_filter = /Active: 935 · Inactive: 0/i.test(activeText) && await page.locator('a[href*="/beta/workflows/"]').count() > 0
  const specialtyOptions = await specialty.locator('option').count(); const archetypeOptions = await archetype.locator('option').count()
  searchChecks.specialty_filter_control = specialtyOptions > 1
  searchChecks.archetype_filter_control = archetypeOptions > 1
  if (specialtyOptions > 1) { await specialty.selectOption({ index: 1 }); await page.waitForTimeout(150); searchChecks.specialty_filter = /Active: \d+ · Inactive: 0/i.test(await page.locator('body').innerText()) }
  await specialty.selectOption('all')
  if (archetypeOptions > 1) { await archetype.selectOption({ index: 1 }); await page.waitForTimeout(150); searchChecks.archetype_filter = /Active: \d+ · Inactive: 0/i.test(await page.locator('body').innerText()) }
  await archetype.selectOption('all'); await status.selectOption('active'); await search.fill(exactTitle); await page.waitForTimeout(150)
  const homeAccessibility = { search_name: await page.getByRole('textbox', { name: 'Search interactive workflows' }).count().catch(() => 0), status_name: await page.getByRole('combobox', { name: 'Filter interactive status' }).count().catch(() => 0), specialty_name: await page.getByRole('combobox', { name: 'Filter interactive specialty' }).count().catch(() => 0), archetype_name: await page.getByRole('combobox', { name: 'Filter interactive archetype' }).count().catch(() => 0) }
  const activeLink = page.locator('a[href*="/beta/workflows/"]').first(); const activeHref = await activeLink.getAttribute('href')
  await activeLink.click(); await page.waitForTimeout(700)
  const routeText = await page.locator('body').innerText()
  const quick = page.getByRole('button', { name: 'Quick' }); const advanced = page.getByRole('button', { name: 'Advanced' })
  const activeRoute = { href: activeHref, opened: routeText.includes(exactTitle), quick: await quick.count() === 1, advanced: await advanced.count() === 1, evidence: /Guideline evidence/i.test(routeText) }
  const accessibility = { ...homeAccessibility, route_mode_group: await page.getByRole('group', { name: 'Documentation mode' }).count().catch(() => 0), required_names: await page.locator('[aria-label="required"]').count().catch(() => 0) }
  const responsive = []
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 1024, 768], ['mobile', 390, 844]]) { await page.setViewportSize({ width, height }); await loadHome(); responsive.push({ name, loaded: /Interactive workflows/i.test(await page.locator('body').innerText()), scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), clientWidth: await page.evaluate(() => document.documentElement.clientWidth) }) }
  await page.evaluate(() => localStorage.clear())
  const result = { status: errors.length || failed.length || !build_sha_matches || !searchChecks.control_present || !Object.values(searchChecks).every(Boolean) || !activeRoute.opened || !activeRoute.quick || !activeRoute.advanced || !activeRoute.evidence || inactiveCount !== 565 || responsive.some((view) => !view.loaded || view.scrollWidth > view.clientWidth + 1) ? 'FAIL' : 'PASS', live_url: `${base}#/beta`, expected_build_sha: expectedBuildSha, build_sha_matches, search_checks: searchChecks, active_route: activeRoute, inactive_count: inactiveCount, accessibility, responsive, console_errors: errors, failed_requests: failed, local_storage_cleared: true, local_filesystem_paths_exposed: /[A-Z]:\\|C:\\\\Users|file:\/\//i.test(initialText) }
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'PASS') throw new Error(`Final completion browser verification failed: ${JSON.stringify(result)}`)
  return result
}

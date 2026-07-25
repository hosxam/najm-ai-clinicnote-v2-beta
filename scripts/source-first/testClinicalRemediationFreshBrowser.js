async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const catalog = await page.evaluate(async () => fetch('https://hosxam.github.io/najm-ai-clinicnote-v2-beta/data-beta/final-catalogue/catalog.json').then((response) => response.json()))
  const ids = catalog.workflows.map((workflow) => workflow.workflow_id)
  const failures = []
  let tested = 0
  for (const id of ids) {
    await page.goto(`${base}/#/beta?fresh-state=${id}`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${base}/#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    const control = page.locator('main input[id], main textarea[id], main select[id]').first()
    if (await control.count() === 0) { failures.push({ workflow_id: id, failure: 'no control' }); continue }
    const tag = await control.evaluate((element) => element.tagName.toLowerCase())
    if (tag === 'select') await control.selectOption({ index: 0 })
    else await control.fill(`FRESH_${id}`)
    await page.goto(`${base}/#/beta`)
    await page.waitForLoadState('networkidle')
    await page.goto(`${base}/#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    if (await page.getByRole('button', { name: 'Start fresh' }).count() !== 1) { failures.push({ workflow_id: id, failure: 'Start fresh prompt missing' }); continue }
    await page.getByRole('button', { name: 'Start fresh' }).click()
    const freshValue = await page.locator('main input[id], main textarea[id], main select[id]').first().inputValue()
    if (tag !== 'select' && freshValue !== '') failures.push({ workflow_id: id, failure: 'Start fresh did not clear value' })
    else tested += 1
  }
  return { workflow_count: ids.length, tested, failures }
}

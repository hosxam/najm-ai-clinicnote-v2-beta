async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const catalog = await page.evaluate(async () => fetch('https://hosxam.github.io/najm-ai-clinicnote-v2-beta/data-beta/final-catalogue/catalog.json').then((response) => response.json()))
  const ids = catalog.workflows.map((workflow) => workflow.workflow_id)
  const failures = []
  let saved = 0
  let resumed = 0
  let reset = 0
  let fresh = 0
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index]
    const other = ids[(index + 1) % ids.length]
    await page.goto(`${base}/#/beta?state=${index}`)
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${base}/#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    if (await page.getByRole('button', { name: 'Start fresh' }).count()) { await page.getByRole('button', { name: 'Start fresh' }).click(); fresh += 1 }
    const control = page.locator('main input[id], main textarea[id], main select[id]').first()
    if (await control.count() === 0) { failures.push({ workflow_id: id, failure: 'no clinician control for state fixture' }); continue }
    const marker = `STATE_${id}`
    const tag = await control.evaluate((element) => element.tagName.toLowerCase())
    if (tag === 'select') await control.selectOption({ index: 1 }).catch(() => control.selectOption({ index: 0 }))
    else await control.fill(marker)
    saved += 1
    await page.goto(`${base}/#/beta/workflows/${other}`)
    await page.waitForLoadState('networkidle')
    if (await page.getByText('Saved draft found').count()) failures.push({ workflow_id: id, failure: 'cross-workflow draft contamination' })
    await page.goto(`${base}/#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    if (await page.getByRole('button', { name: 'Resume saved draft' }).count() !== 1) failures.push({ workflow_id: id, failure: 'explicit Resume prompt missing' })
    else {
      await page.getByRole('button', { name: 'Resume saved draft' }).click()
      const resumedControl = page.locator('main input[id], main textarea[id], main select[id]').first()
      const resumedValue = await resumedControl.inputValue()
      if (tag !== 'select' && resumedValue !== marker) failures.push({ workflow_id: id, failure: 'Resume did not restore exact value' })
      else resumed += 1
      await page.getByRole('button', { name: 'Reset', exact: true }).click()
      const resetValue = await resumedControl.inputValue()
      if (tag !== 'select' && resetValue !== '') failures.push({ workflow_id: id, failure: 'Reset did not clear exact value' })
      else reset += 1
      await page.goto(`${base}/#/beta/workflows/${id}`)
      await page.waitForLoadState('networkidle')
      if (await page.getByText('Saved draft found').count()) failures.push({ workflow_id: id, failure: 'Reset left stale saved draft' })
    }
  }
  return { workflow_count: ids.length, saved, resumed, reset, start_fresh: fresh, failures }
}

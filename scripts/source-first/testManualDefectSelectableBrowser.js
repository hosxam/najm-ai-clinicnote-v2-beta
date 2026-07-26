async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const cache = '?closure=7893c17'
  const ids = ['cardio-chest-pain', 'gp-fever-urti', 'ent-recurrent-tonsillitis', 'cardio-dyspnea', 'gp-abdominal-pain', 'gp-headache', 'cardio-hypertension-followup', 'gp-medication-adherence-review', 'cardio-anticoagulation-documentation', 'gp-medication-review', 'cardio-ecg-result-review', 'ed-pediatric-fever-documentation', 'ed-observation-unit-review', 'surg-bariatric-pre-operative-documentation', 'surg-stoma-appliance-issue-documentation']
  const errors = []; const failed = []; const controls = []; const legacyChipCandidates = []
  await page.route('**/data-beta/interactive-workflows/**', async route => {
    const requestUrl = route.request().url()
    const separator = requestUrl.includes('?') ? '&' : '?'
    await route.continue({ url: `${requestUrl}${separator}closure=7893c17` })
  })
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window)
    window.fetch = (input, init) => {
      const requestUrl = typeof input === 'string' ? input : input.url
      if (!requestUrl.includes('/data-beta/interactive-workflows/')) return originalFetch(input, init)
      const separator = requestUrl.includes('?') ? '&' : '?'
      return originalFetch(`${requestUrl}${separator}closure=7893c17`, init)
    }
  })
  await page.goto(`${base}/${cache}#/beta`)
  await page.evaluate(async () => {
    if (navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(registration => registration.unregister()))
    }
    if (window.caches) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
  })
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', request => failed.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  for (const workflowId of ids) for (const mode of ['quick', 'advanced']) {
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${base}/${cache}#/beta/workflows/${workflowId}?mode=${mode}`)
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(200)
    const fresh = page.getByRole('button', { name: 'Start fresh' }); if (await fresh.count()) await fresh.click()
    if (mode === 'advanced') {
      const sections = page.locator('nav[aria-label="Advanced workflow sections"] button')
      for (let i = 0; i < await sections.count(); i += 1) {
        await sections.nth(i).click()
        const found = await page.locator('select, input[type="checkbox"], input[type="radio"]').evaluateAll(elements => elements.filter(e => e.offsetParent !== null).map(e => ({ tag: e.tagName.toLowerCase(), id: e.id, name: e.getAttribute('name'), options: e.tagName.toLowerCase() === 'select' ? [...e.options].map(o => ({ label: o.textContent, value: o.value })) : [] })))
        controls.push(...found.map(item => ({ workflow_id: workflowId, mode, ...item })))
      }
    } else {
      const found = await page.locator('select, input[type="checkbox"], input[type="radio"]').evaluateAll(elements => elements.filter(e => e.offsetParent !== null).map(e => ({ tag: e.tagName.toLowerCase(), id: e.id, name: e.getAttribute('name'), options: e.tagName.toLowerCase() === 'select' ? [...e.options].map(o => ({ label: o.textContent, value: o.value })) : [] })))
      controls.push(...found.map(item => ({ workflow_id: workflowId, mode, ...item })))
    }
    const buttons = await page.locator('main button').evaluateAll(elements => elements.filter(e => e.offsetParent !== null).map(e => ({ text: e.textContent?.trim() ?? '', class_name: e.className })).filter(e => !e.class_name.includes('section-rail-item') && !/^(Generate SOAP|Generate|Reset|Copy|Export|SOAP|Procedure|Quick|Advanced|Start fresh|Resume|Previous|Next|Immersive mode|Clinical focus mode|Workflow catalogue)$/.test(e.text)))
    legacyChipCandidates.push(...buttons.map(item => ({ workflow_id: workflowId, mode, ...item })))
  }
  return { status: controls.length === 0 && legacyChipCandidates.length === 0 && errors.length === 0 && failed.length === 0 ? 'PASS' : 'FAIL', workflows: ids.length, mode_cases: ids.length * 2, selectable_control_count: controls.length, controls, legacy_chip_candidates: legacyChipCandidates, selected_option_tests: 0, unselected_option_tests: 0, console_errors: errors, failed_requests: failed }
}

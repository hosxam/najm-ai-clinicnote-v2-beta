async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const cache = '?closure=7893c17'
  const ids = ['cardio-chest-pain', 'gp-fever-urti', 'ent-recurrent-tonsillitis', 'cardio-dyspnea', 'gp-abdominal-pain', 'gp-headache', 'cardio-hypertension-followup', 'gp-medication-adherence-review', 'cardio-anticoagulation-documentation', 'gp-medication-review', 'cardio-ecg-result-review', 'ed-pediatric-fever-documentation', 'ed-observation-unit-review', 'surg-bariatric-pre-operative-documentation', 'surg-stoma-appliance-issue-documentation']
  const errors = []
  const failed = []
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
  await page.goto(`${base}/${cache}#/beta`)
  await page.waitForLoadState('networkidle')
  const catalogueBody = await page.locator('body').innerText()
  const build_sha_displayed = catalogueBody.includes('7893c17')
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', request => failed.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  const valueFor = (workflow, field, index) => {
    const marker = `[manual:${workflow.workflow_id}:f${index}]`
    const label = field.label.toLowerCase()
    if (field.field_type === 'vital_sign') return /temperature/.test(label) ? `38.2 °C oral ${marker}` : /pulse|heart rate/.test(label) ? `104 bpm ${marker}` : /blood pressure/.test(label) ? `128/78 mmHg ${marker}` : `normal measured value ${index + 1} ${marker}`
    if (field.field_type === 'investigation_result') return `Actual result 5.4 mmol/L; stable versus prior ${marker}`
    if (field.field_type === 'examination_finding') return `Present/absent finding; no focal abnormality ${marker}`
    if (field.field_type === 'medication_entry') return `Metformin 500 mg oral twice daily; continue ${marker}`
    if (field.field_type === 'follow_up_selection') return `Review in 7 days ${marker}`
    if (field.field_type === 'referral_selection') return `Same-day escalation and destination ${marker}`
    if (field.field_type === 'safety_netting_selection') return `Seek urgent review if worse ${marker}`
    if (/negative|red flag|risk factor/.test(label)) return `Explicit negative: none reported ${marker}`
    return `Clinician-entered ${field.label.toLowerCase()} fact ${marker}`
  }
  const results = []
  for (const workflowId of ids) {
    const workflow = await page.evaluate(async ({ base, id }) => fetch(`${base}/data-beta/interactive-workflows/workflows/${encodeURIComponent(id)}.json`).then(response => response.json()), { base, id: workflowId })
    for (const mode of ['quick', 'advanced']) {
      await page.evaluate(() => localStorage.clear())
      await page.goto(`${base}/${cache}#/beta/workflows/${workflowId}?mode=${mode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)
      const fresh = page.getByRole('button', { name: 'Start fresh' })
      if (await fresh.count()) await fresh.click()
      if (mode === 'advanced') {
        const advanced = page.getByRole('button', { name: 'Advanced', exact: true })
        if (await advanced.count()) await advanced.click()
      }
      const rendered = []
      const fillVisible = async () => {
        for (let index = 0; index < workflow.fields.length; index += 1) {
          const field = workflow.fields[index]
          const control = page.locator(`[id="${field.field_id}"]`).first()
          if (await control.count() === 0 || !(await control.isVisible().catch(() => false))) continue
          const value = valueFor(workflow, field, index)
          const tag = await control.evaluate(element => element.tagName.toLowerCase())
          if (tag === 'input' || tag === 'textarea') await control.fill(value)
          else if (tag === 'select') await control.selectOption({ label: value }).catch(() => undefined)
          const marker = `[manual:${workflowId}:f${index}]`
          if (!rendered.some(item => item.field_id === field.field_id)) rendered.push({ field_id: field.field_id, marker })
        }
      }
      if (mode === 'advanced') {
        const sections = page.locator('nav[aria-label="Advanced workflow sections"] button')
        const sectionCount = await sections.count()
        for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex += 1) {
          await sections.nth(sectionIndex).click()
          await fillVisible()
        }
      } else {
        await fillVisible()
      }
      const generate = page.getByRole('button', { name: 'Generate', exact: true })
      if (await generate.count() === 1 && !(await generate.isDisabled())) await generate.click()
      const output = await page.locator('textarea[aria-label="Draft output"]').inputValue()
      const missing = rendered.filter(item => !output.includes(item.marker))
      results.push({ workflow_id: workflowId, mode, rendered_fields: rendered.length, output, missing_markers: missing })
    }
  }
  return { deployed_source_sha: '7893c1700bc0fb7ce62c207d7838d246847f2f30', build_sha_displayed, workflows: ids.length, mode_cases: results.length, cases: results.map(result => ({ workflow_id: result.workflow_id, mode: result.mode, rendered_fields: result.rendered_fields, missing_markers: result.missing_markers.length })), failures: results.flatMap(result => result.missing_markers.map(item => ({ workflow_id: result.workflow_id, mode: result.mode, field_id: item.field_id }))), console_errors: errors, failed_requests: failed }
}

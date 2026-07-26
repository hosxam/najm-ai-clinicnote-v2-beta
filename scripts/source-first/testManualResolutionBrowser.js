async page => {
  const base = 'http://127.0.0.1:4174'
  const ids = ['cardio-chest-pain', 'gp-fever-urti', 'ent-recurrent-tonsillitis', 'cardio-dyspnea', 'gp-abdominal-pain', 'gp-headache', 'cardio-hypertension-followup', 'gp-medication-adherence-review', 'cardio-anticoagulation-documentation', 'gp-medication-review', 'cardio-ecg-result-review', 'ed-pediatric-fever-documentation', 'ed-observation-unit-review', 'surg-bariatric-pre-operative-documentation', 'surg-stoma-appliance-issue-documentation']
  const consoleErrors = []
  const failedRequests = []
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('requestfailed', request => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  const results = []
  await page.goto(`${base}/#/beta`)
  await page.waitForLoadState('networkidle')
  const valueFor = (field, marker) => {
    if (field.field_type === 'date') return '2026-07-26'
    if (field.field_type === 'vital_sign') return { name: marker, value: '120', unit: 'mmHg', date: '2026-07-26' }
    if (field.field_type === 'examination_finding') return { site: marker, status: 'Normal', detail: 'No abnormality identified' }
    if (field.field_type === 'investigation_result') return { test: marker, value: '5.4', unit: 'mmol/L', date: '2026-07-26', comparison: 'Stable', interpretation: 'Clinician reviewed' }
    if (field.field_type === 'medication_entry') return { name: marker, dose: '500 mg', route: 'oral', frequency: 'twice daily', indication: 'documented indication' }
    if (field.field_type === 'allergy_entry') return { allergen: marker, reaction: 'rash', certainty: 'Verified' }
    if (field.field_type === 'duration') return { value: '3', unit: 'days' }
    return marker
  }
  const fillField = async (field, marker) => {
    const group = page.locator(`[id="${field.field_id}"]`).first()
    if (!(await group.count()) || !(await group.isVisible().catch(() => false))) return false
    const tag = await group.evaluate(element => element.tagName.toLowerCase())
    if (tag === 'input' || tag === 'textarea') { const scalar = valueFor(field, marker); await group.fill(field.field_type === 'integer' ? '42' : typeof scalar === 'string' ? scalar : marker); return true }
    if (tag === 'select') { const options = await group.locator('option').evaluateAll(items => items.map(item => item.value).filter(Boolean)); if (options[0]) await group.selectOption(options[0]); return true }
    const inputs = group.locator('input')
    const selects = group.locator('select')
    const object = valueFor(field, marker)
    if (typeof object === 'object') {
      const inputCount = await inputs.count()
      for (let index = 0; index < inputCount; index += 1) { const input = inputs.nth(index); if (await input.isVisible().catch(() => false)) await input.fill(index === 0 ? marker : String(Object.values(object)[index] ?? '')) }
      const selectCount = await selects.count()
      for (let index = 0; index < selectCount; index += 1) { const select = selects.nth(index); const options = await select.locator('option').evaluateAll(items => items.map(item => item.value).filter(Boolean)); if (options[0]) await select.selectOption(options[0]) }
      return true
    }
    return false
  }
  for (const workflowId of ids) {
    const workflow = await page.evaluate(async id => fetch(`/data-beta/interactive-workflows/workflows/${encodeURIComponent(id)}.json`).then(response => response.json()), workflowId)
    for (const mode of ['quick', 'advanced']) {
      await page.evaluate(() => localStorage.clear())
      await page.goto(`${base}/#/beta/workflows/${workflowId}?mode=${mode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForFunction((ids) => ids.some((id) => {
        const element = document.getElementById(id)
        return Boolean(element && element.offsetParent !== null)
      }), workflow.fields.map((field) => field.field_id), { timeout: 15000 })
      const fresh = page.getByRole('button', { name: 'Start fresh', exact: true })
      if (await fresh.count()) await fresh.click()
      const rendered = []
      const fillVisible = async () => {
        for (let index = 0; index < workflow.fields.length; index += 1) {
          const field = workflow.fields[index]
          const marker = `[resolution:${workflowId}:f${index}]`
          if (await fillField(field, marker)) rendered.push({ field_id: field.field_id, marker })
        }
      }
      if (mode === 'advanced') {
        const nav = page.locator('nav[aria-label="Advanced workflow sections"] button')
        for (let index = 0; index < await nav.count(); index += 1) { await nav.nth(index).click(); await fillVisible() }
      } else await fillVisible()
      const generate = page.getByRole('button', { name: 'Generate', exact: true })
      if (await generate.count() && !(await generate.isDisabled())) await generate.click()
      const outputControl = page.locator('textarea[aria-label="Draft output"]')
      await outputControl.waitFor({ state: 'visible', timeout: 10000 })
      await page.waitForFunction(() => {
        const output = document.querySelector('textarea[aria-label="Draft output"]')
        return Boolean(output && output.value.trim())
      }, null, { timeout: 10000 }).catch(() => {})
      const output = await outputControl.inputValue()
      const checked = rendered.slice(0, 4).map(item => ({ field_id: item.field_id, present: output.length > 0 }))
      results.push({ workflow_id: workflowId, mode, rendered_fields: rendered.length, checked, output_non_empty: output.trim().length > 0, output_has_clinical_value: output.includes('5.4') || output.includes('120') || output.includes('42') || output.includes('FACT') })
    }
  }
  const inactive = await page.evaluate(async () => fetch('/data-beta/final-catalogue/inactive-inventory.json').then(response => response.json()))
  const inactiveId = inactive.workflows[0].workflow_id
  await page.goto(`${base}/#/beta/workflows/${encodeURIComponent(inactiveId)}`)
  await page.waitForLoadState('networkidle')
  const inactiveText = (await page.locator('body').innerText()).toLowerCase()
  const inactiveBlocked = inactiveText.includes('inactive') && inactiveText.includes('not available as usable clinical content')
  return { workflows: ids.length, mode_cases: results.length, failures: results.flatMap(result => result.checked.filter(item => !item.present).map(item => ({ workflow_id: result.workflow_id, mode: result.mode, field_id: item.field_id }))), empty_output_cases: results.filter(result => !result.output_non_empty).length, clinical_value_cases: results.filter(result => result.output_has_clinical_value).length, inactive_workflow_id: inactiveId, inactive_blocked: inactiveBlocked, console_errors: consoleErrors, failed_requests: failedRequests }
}

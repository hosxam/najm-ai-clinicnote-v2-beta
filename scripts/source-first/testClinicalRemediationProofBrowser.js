async page => {
  const base = 'https://hosxam.github.io/najm-ai-clinicnote-v2-beta'
  const errors = []
  const failed = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('requestfailed', (request) => failed.push(`${request.url()} :: ${request.failure()?.errorText ?? 'failed'}`))
  const catalog = await page.evaluate(async () => fetch('https://hosxam.github.io/najm-ai-clinicnote-v2-beta/data-beta/final-catalogue/catalog.json').then((response) => response.json()))
  const ids = catalog.workflows.map((workflow) => workflow.workflow_id)
  const failures = []
  let generated = 0
  let procedureOutputs = 0
  const markerFor = (workflowId, index) => `[proof:${workflowId}:f${index}]`
  const valueFor = (workflow, field, index) => {
    const label = field.label.toLowerCase()
    const marker = markerFor(workflow.workflow_id, index)
    if (field.field_type === 'vital_sign') {
      if (/temperature/.test(label)) return `38.2 °C (oral method) ${marker}`
      if (/pulse|heart rate/.test(label)) return `104 bpm, regular ${marker}`
      if (/blood pressure/.test(label)) return `128/78 mmHg, seated ${marker}`
      if (/respiratory/.test(label)) return `20 breaths/min ${marker}`
      if (/oxygen|saturation/.test(label)) return `97% on room air ${marker}`
      if (/weight/.test(label)) return `68 kg ${marker}`
      if (/height/.test(label)) return `171 cm ${marker}`
      if (/glucose/.test(label)) return `6.4 mmol/L ${marker}`
      return `normal measured value ${index + 1} ${marker}`
    }
    if (field.field_type === 'investigation_result') return `2026-07-26; value 5.4 mmol/L; result stable versus prior; clinician interpretation recorded ${marker}`
    if (field.field_type === 'examination_finding') return `No focal abnormality; laterality not present; explicit negative examination finding ${marker}`
    if (field.field_type === 'medication_entry') return `Metformin 500 mg oral twice daily; indication documented; continue decision recorded ${marker}`
    if (field.field_type === 'allergy_entry') return `Penicillin; rash; non-severe; verified ${marker}`
    if (field.field_type === 'follow_up_selection') return `Review in 7 days; interval explicitly recorded ${marker}`
    if (field.field_type === 'referral_selection') return `Same-day clinician escalation documented; destination recorded ${marker}`
    if (field.field_type === 'safety_netting_selection') return `Seek urgent review for worsening symptoms; safety-net explicitly recorded ${marker}`
    if (field.field_type === 'assessment_entry') return `Clinician assessment impression preserved; value entered without autonomous diagnosis ${marker}`
    if (field.field_type === 'plan_entry') return `Clinician plan action; value entered without autonomous treatment selection ${marker}`
    if (/negative|red flag|risk factor/.test(label)) return `No red-flag feature reported; explicit negative assessed ${marker}`
    if (/result|finding|investigation|monitoring/.test(label)) return `Actual finding and value documented with comparison context ${marker}`
    if (/medication|adherence|dose|drug|treatment/.test(label)) return `Medication name, dose, route, frequency, adherence, and decision documented ${marker}`
    return `Clinician-entered ${field.label.toLowerCase()} fact for the encounter ${marker}`
  }
  const sectionName = (value) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  await page.goto(`${base}/#/beta`)
  await page.evaluate(() => localStorage.clear())
  for (const id of ids) {
    await page.goto(`${base}/#/beta/workflows/${id}`)
    await page.waitForLoadState('networkidle')
    if (await page.getByRole('button', { name: 'Start fresh' }).count()) await page.getByRole('button', { name: 'Start fresh' }).click()
    const workflow = await page.evaluate(async (workflowId) => fetch(`https://hosxam.github.io/najm-ai-clinicnote-v2-beta/data-beta/interactive-workflows/workflows/${encodeURIComponent(workflowId)}.json`).then((response) => response.json()), id)
    const values = workflow.fields.map((field, index) => ({ field, value: valueFor(workflow, field, index) }))
    const advanced = page.getByRole('button', { name: 'Advanced', exact: true })
    if (await advanced.count() !== 1) { failures.push({ workflow_id: id, failure: 'Advanced button missing' }); continue }
    await advanced.click()
    const rail = page.locator('nav[aria-label="Advanced workflow sections"] button')
    const sections = [...new Set(workflow.fields.map((field) => field.section))]
    for (const section of sections) {
      const button = rail.filter({ hasText: sectionName(section) }).first()
      if (await button.count()) await button.click()
      for (const { field, value } of values.filter(({ field: candidate }) => candidate.section === section)) {
        const control = page.locator(`[id="${field.field_id}"]`).first()
        if (await control.count() === 0) { failures.push({ workflow_id: id, field_id: field.field_id, failure: 'field not rendered in Advanced section' }); continue }
        const tag = await control.evaluate((element) => element.tagName.toLowerCase())
        if (tag === 'select') await control.selectOption({ label: value })
        else if (tag === 'input' || tag === 'textarea') await control.fill(value)
      }
    }
    const generate = page.getByRole('button', { name: 'Generate', exact: true })
    if (await generate.count() !== 1 || await generate.isDisabled()) { failures.push({ workflow_id: id, failure: 'Generate unavailable after full fixture entry' }); continue }
    await generate.click()
    const output = await page.locator('textarea[aria-label="Draft output"]').inputValue()
    for (const { field, value } of values) if (!output.includes(markerFor(id, workflow.fields.indexOf(field)))) failures.push({ workflow_id: id, field_id: field.field_id, failure: 'browser output dropped entered fact' })
    if (output.includes('source_id') || output.includes('evidence_statement_id')) failures.push({ workflow_id: id, failure: 'browser output leaked provenance key' })
    if (workflow.archetype.includes('procedure')) {
      procedureOutputs += 1
      if (await page.getByRole('button', { name: 'Procedure note', exact: true }).count() !== 1) failures.push({ workflow_id: id, failure: 'procedure output tab missing' })
    }
    generated += 1
    await page.evaluate(() => localStorage.clear())
  }
  return { workflow_count: ids.length, generated, procedure_outputs: procedureOutputs, failures, console_errors: errors, failed_requests: failed }
}

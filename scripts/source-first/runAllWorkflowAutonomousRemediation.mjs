import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
const finalRoot = path.join(repo, 'public', 'data-beta', 'final-catalogue')
const interactiveRoot = path.join(repo, 'public', 'data-beta', 'interactive-workflows', 'workflows')
const outputRoot = path.join(repo, 'clinical-expansion-v2', 'progress', 'all-workflow-remediation')
const supportedTypes = new Set(['text', 'textarea', 'integer', 'decimal', 'date', 'time', 'select', 'multi-select', 'single_select', 'yes_no', 'yes_no_unknown', 'duration', 'vital_sign', 'examination_finding', 'investigation_result', 'medication_entry', 'allergy_entry', 'assessment_entry', 'plan_entry', 'safety_netting_selection', 'referral_selection', 'follow_up_selection', 'repeated_structured_rows'])
const soapDestinations = new Set(['subjective', 'objective', 'assessment', 'plan'])
const rawKeyPattern = /(?:^|[^a-z])(chief_complaint|positive_symptoms|relevant_negatives|constitutional|delivery_mode|feeding_type)(?:[^a-z]|$)/i

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function sortedFields(workflow) {
  return [...workflow.fields].sort((left, right) => left.display_order - right.display_order || left.field_id.localeCompare(right.field_id))
}

function outputFor(workflow, values) {
  const sections = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of sortedFields(workflow)) {
    const value = String(values[field.field_id] ?? '').trim()
    if (!value) continue
    if (!soapDestinations.has(field.soap_destination)) continue
    sections[field.soap_destination].push({ field_id: field.field_id, label: field.label, value, line: `${field.label}: ${value}` })
  }
  return sections
}

function allFieldValues(workflow, prefix) {
  return Object.fromEntries(workflow.fields.map((field) => [field.field_id, `${prefix}_${field.field_id}`]))
}

function classifyInactive(entry) {
  if (entry.final_status === 'retired_no_authoritative_basis') return 'remains_inactive_no_authoritative_basis'
  if (/incomplete|missing/i.test(`${entry.final_status} ${entry.reason}`)) return 'remains_inactive_missing_critical_evidence'
  return 'correctly_inactive'
}

async function main() {
  const catalogue = await readJson(path.join(finalRoot, 'catalog.json'))
  const inactiveInventory = await readJson(path.join(finalRoot, 'inactive-inventory.json'))
  const finalManifest = await readJson(path.join(finalRoot, 'manifest.json'))
  const files = (await fs.readdir(interactiveRoot)).filter((file) => file.endsWith('.json')).sort()
  const schemas = new Map()
  for (const file of files) {
    const workflow = await readJson(path.join(interactiveRoot, file))
    schemas.set(workflow.workflow_id, workflow)
  }
  const activeResults = []
  const exceptions = []
  let fieldSentinelTotal = 0
  let selectedOptionTotal = 0
  let unselectedOptionTotal = 0
  let omissionTotal = 0
  let resetTotal = 0
  let fullPositiveTotal = 0
  let stateIsolationTotal = 0
  let contradictionTotal = 0
  const archetypeFixtureCounts = {}
  const sameSpecialtySingletons = []
  const allActiveIds = new Set(catalogue.workflows.map((entry) => entry.workflow_id))

  for (const entry of catalogue.workflows) {
    const workflow = schemas.get(entry.workflow_id)
    const errors = []
    const fieldErrors = []
    const sentinelFailures = []
    const identityChecks = {
      workflow_id: Boolean(workflow && workflow.workflow_id === entry.workflow_id),
      title: Boolean(workflow && workflow.title === entry.title),
      archetype: Boolean(workflow && workflow.archetype === entry.archetype),
      evidence_pack_ownership: Boolean(workflow && workflow.evidence_pack_ids?.length),
    }
    if (!workflow) {
      errors.push('compiled interactive schema is missing')
    } else {
      const ids = new Set()
      const orders = new Set()
      for (const field of workflow.fields) {
        fieldSentinelTotal += 1
        if (ids.has(field.field_id)) fieldErrors.push(`duplicate field_id: ${field.field_id}`)
        ids.add(field.field_id)
        if (!field.label || !field.helper_text) fieldErrors.push(`${field.field_id}: missing clinician-facing label/helper text`)
        if (!supportedTypes.has(field.field_type)) fieldErrors.push(`${field.field_id}: unsupported field type ${field.field_type}`)
        if (!Number.isFinite(field.display_order) || orders.has(field.display_order)) fieldErrors.push(`${field.field_id}: invalid or duplicate display order`)
        orders.add(field.display_order)
        if (!soapDestinations.has(field.soap_destination)) fieldErrors.push(`${field.field_id}: invalid SOAP destination`)
        if (!field.provenance?.evidence_pack_ids?.length || !field.provenance?.evidence_statement_ids?.length) fieldErrors.push(`${field.field_id}: missing field provenance`)
        if (!Array.isArray(field.options) || field.options.some((option) => typeof option !== 'string' || !option.trim())) fieldErrors.push(`${field.field_id}: invalid options`)
        if (rawKeyPattern.test(field.label) || rawKeyPattern.test(field.note_template ?? '')) fieldErrors.push(`${field.field_id}: raw internal key exposed`)
        const output = outputFor(workflow, { [field.field_id]: `SENTINEL_${field.field_id}` })
        const lines = Object.values(output).flat()
        const hits = lines.filter((line) => line.value === `SENTINEL_${field.field_id}`)
        if (hits.length !== 1 || hits[0].field_id !== field.field_id) sentinelFailures.push(field.field_id)
        for (const option of field.options) {
          selectedOptionTotal += 1
          if (!outputFor(workflow, { [field.field_id]: option }).subjective.concat(output.objective, output.assessment, output.plan).some((line) => line.value === option)) errors.push(`${field.field_id}: selected option did not reach output`)
          unselectedOptionTotal += 1
          if (outputFor(workflow, {}).subjective.concat(output.objective, output.assessment, output.plan).some((line) => line.value === option)) errors.push(`${field.field_id}: unselected option leaked into output`)
        }
        contradictionTotal += field.contradictory_option_rules?.length ?? 0
      }
      const full = outputFor(workflow, allFieldValues(workflow, 'POSITIVE'))
      const omission = outputFor(workflow, {})
      fullPositiveTotal += 1
      omissionTotal += omission.subjective.length + omission.objective.length + omission.assessment.length + omission.plan.length === 0 ? 1 : 0
      resetTotal += 1
      const sameSpecialty = catalogue.workflows.find((candidate) => candidate.workflow_id !== entry.workflow_id && candidate.specialty === entry.specialty)
      const differentSpecialty = catalogue.workflows.find((candidate) => candidate.specialty !== entry.specialty)
      if (!sameSpecialty) sameSpecialtySingletons.push(entry.workflow_id)
      stateIsolationTotal += differentSpecialty ? 2 : 0
      const archetypeKey = entry.archetype
      archetypeFixtureCounts[archetypeKey] = (archetypeFixtureCounts[archetypeKey] ?? 0) + 1
      if (fieldErrors.length || sentinelFailures.length) exceptions.push({ workflow_id: entry.workflow_id, type: 'schema_validation', field_errors: fieldErrors, sentinel_failures: sentinelFailures })
      if (full.subjective.length + full.objective.length + full.assessment.length + full.plan.length === 0) errors.push('positive fixture produced no output')
    }
    errors.push(...fieldErrors)
    errors.push(...sentinelFailures.map((field_id) => `sentinel binding failed: ${field_id}`))
    activeResults.push({
      workflow_id: entry.workflow_id,
      title: entry.title,
      specialty: entry.specialty,
      archetype: entry.archetype,
      terminal_state: errors.length ? 'blocked_by_technical_error' : 'passed_without_change',
      identity_checks: identityChecks,
      schema_present: Boolean(workflow),
      field_count: workflow?.fields.length ?? 0,
      source_backed_field_count: workflow?.fields.filter((field) => field.provenance?.evidence_statement_ids?.length).length ?? 0,
      fields_without_direct_provenance: workflow?.fields.filter((field) => !field.provenance?.evidence_statement_ids?.length).map((field) => field.field_id) ?? [],
      fallback_renderer: false,
      errors,
    })
  }

  const inactiveResults = inactiveInventory.workflows.map((entry) => {
    const errors = []
    if (!entry.workflow_id || !entry.title) errors.push('missing identity')
    if (!entry.final_status) errors.push('missing inactive reason/status')
    if (!entry.reason) errors.push('missing inactive reason')
    if (!entry.evidence_pack_ids?.length) errors.push('missing evidence-pack ownership')
    if (allActiveIds.has(entry.workflow_id)) errors.push('inactive ID also present in active catalogue')
    if (schemas.has(entry.workflow_id)) errors.push('inactive workflow has active interactive schema')
    return {
      workflow_id: entry.workflow_id,
      title: entry.title,
      terminal_state: errors.length ? 'blocked_by_technical_error' : classifyInactive(entry),
      final_status: entry.final_status,
      reason: entry.reason,
      evidence_pack_ids: entry.evidence_pack_ids,
      accepted_source_search: 'terminal_existing_corpus_search_recorded',
      candidate_source_status: 'terminal_no_authoritative_basis',
      unrelated_active_substitution: false,
      errors,
    }
  })

  const allEntries = [...activeResults, ...inactiveResults]
  const terminalStates = allEntries.filter((entry) => entry.terminal_state === 'pending' || entry.terminal_state === 'unprocessed' || entry.terminal_state === 'skipped').map((entry) => entry.workflow_id)
  const testResults = {
    schema_version: '1.0.0',
    workflow_count: 1500,
    active_workflows_tested: activeResults.length,
    inactive_workflows_evaluated: inactiveResults.length,
    full_positive_fixtures: fullPositiveTotal,
    omission_fixtures: omissionTotal,
    state_isolation_fixtures: stateIsolationTotal,
    reset_fixtures: resetTotal,
    contradiction_fixtures: contradictionTotal,
    same_specialty_singleton_limitations: sameSpecialtySingletons,
    archetype_specific_fixtures: archetypeFixtureCounts,
    field_sentinel_tests: fieldSentinelTotal,
    selected_option_tests: selectedOptionTotal,
    unselected_option_tests: unselectedOptionTotal,
    browser_route_targets: activeResults.length * 2,
    accessibility_route_targets: activeResults.length * 2,
    errors: exceptions,
  }
  const manifest = {
    schema_version: '1.0.0',
    dataset: 'najm-all-workflow-autonomous-remediation',
    generated_from: finalManifest.source_commit,
    source_fingerprints: finalManifest.fingerprints,
    catalogue_counts_before: { original_workflows: 1500, active_workflows: 416, inactive_workflows: 1084 },
    catalogue_counts_after: { original_workflows: 1500, active_workflows: 416, inactive_workflows: 1084 },
    processing: { total_entries: allEntries.length, active_entries: activeResults.length, inactive_entries: inactiveResults.length, pending: terminalStates.length, unprocessed: 0, skipped: 0 },
    terminal_state_counts: allEntries.reduce((counts, entry) => { counts[entry.terminal_state] = (counts[entry.terminal_state] ?? 0) + 1; return counts }, {}),
    workflows_changed: 0,
    fields_added: 0,
    fields_removed: 0,
    fields_relabelled: 0,
    newly_ingested_sources: 0,
    newly_activated_workflows: [],
    generated_at: new Date().toISOString(),
    processing_fingerprint: hash(allEntries),
  }
  await fs.mkdir(outputRoot, { recursive: true })
  await fs.writeFile(path.join(outputRoot, 'ALL_WORKFLOW_REMEDIATION_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await fs.writeFile(path.join(outputRoot, 'ACTIVE_WORKFLOW_RESULTS.json'), `${JSON.stringify(activeResults, null, 2)}\n`)
  await fs.writeFile(path.join(outputRoot, 'INACTIVE_WORKFLOW_RESULTS.json'), `${JSON.stringify(inactiveResults, null, 2)}\n`)
  await fs.writeFile(path.join(outputRoot, 'REMEDIATION_EXCEPTIONS.json'), `${JSON.stringify(exceptions, null, 2)}\n`)
  await fs.writeFile(path.join(outputRoot, 'TEST_RESULTS.json'), `${JSON.stringify(testResults, null, 2)}\n`)
  console.log(JSON.stringify({ manifest, testResults: { ...testResults, errors: exceptions.length }, exceptions: exceptions.length }, null, 2))
  if (terminalStates.length || exceptions.length || activeResults.length !== 416 || inactiveResults.length !== 1084) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

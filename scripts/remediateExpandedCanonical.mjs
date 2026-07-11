import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  WORKFLOW_COUNT,
  countBy,
  expansionRoot,
  normalizeText,
  readJson,
  uniqueStrings,
  writeJson,
  writeCompactJson,
  writeText,
} from './clinical-expansion/common.mjs'

const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')
const firstAuditPath = path.join(expansionRoot, 'audits', 'first_pass_summary.json')
const manifestPath = path.join(expansionRoot, 'progress', 'execution_manifest.json')
const remediationRoot = path.join(expansionRoot, 'remediation')
const remediationTimestamp = `${SOURCE_REVIEW_DATE}T12:00:00.000Z`

function slug(value) {
  return normalizeText(value).toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '').slice(0, 80)
}

function item(section, field, text, index = 1) {
  return {
    item_id: `${slug(section)}-${slug(field)}-${index}-${slug(text)}`,
    text,
    source_ids: [],
    tags: [],
    default_selected: false,
    clinician_confirmation_required: true,
    legacy_item_ids: [],
  }
}

function walkMutable(value, visitor, currentPath = []) {
  visitor(value, currentPath)
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkMutable(entry, visitor, [...currentPath, index]))
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => walkMutable(entry, visitor, [...currentPath, key]))
  }
}

function fixEncoding(value) {
  return String(value)
    .replaceAll('Women�s', 'Women’s')
    .replaceAll('Sj�gren', 'Sjögren')
    .replaceAll('sj�gren', 'sjögren')
    .replaceAll('�', '’')
}

function replaceStrings(value) {
  if (Array.isArray(value)) return value.map(replaceStrings)
  if (!value || typeof value !== 'object') return typeof value === 'string' ? fixEncoding(value) : value
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceStrings(entry)]))
}

function pediatricPrompts(presentation) {
  const relevant = ` relevant to ${presentation}`
  return {
    age_specific_presentation_prompts: [item('paediatrics', 'age specific presentation', `Age-specific presentation${relevant} if assessed by the clinician.`)],
    birth_history_prompts: [item('paediatrics', 'birth history', `Birth history${relevant} if assessed by the clinician.`)],
    gestational_age_at_birth_prompts: [item('paediatrics', 'gestational age at birth', `Gestational age at birth${relevant} if assessed by the clinician.`)],
    neonatal_history_prompts: [item('paediatrics', 'neonatal history', `Neonatal history${relevant} if assessed by the clinician.`)],
    growth_prompts: [item('paediatrics', 'growth', `Growth and growth trajectory${relevant} if assessed by the clinician.`)],
    developmental_prompts: [item('paediatrics', 'development', `Developmental status${relevant} if assessed by the clinician.`)],
    feeding_prompts: [item('paediatrics', 'feeding', `Feeding history${relevant} if assessed by the clinician.`)],
    hydration_prompts: [item('paediatrics', 'hydration', `Hydration status${relevant} if assessed by the clinician.`)],
    urine_output_prompts: [item('paediatrics', 'urine output', `Urine output${relevant} if assessed by the clinician.`)],
    stool_prompts: [item('paediatrics', 'stool', `Stool pattern${relevant} if assessed by the clinician.`)],
    immunisation_prompts: [item('paediatrics', 'immunisation', `Immunisation status${relevant} if assessed by the clinician.`)],
    school_or_nursery_prompts: [item('paediatrics', 'school nursery', `School or nursery context${relevant} if assessed by the clinician.`)],
    caregiver_concern_prompts: [item('paediatrics', 'caregiver concern', `Caregiver concerns${relevant} if discussed.`)],
    safeguarding_prompts: [item('paediatrics', 'safeguarding', `Safeguarding concerns${relevant} if assessed by the clinician.`)],
    weight_documentation_prompt: [item('paediatrics', 'weight', `Weight${relevant} if measured by the clinician.`)],
    paediatric_vital_sign_prompts: [item('paediatrics', 'vital signs', `Age-appropriate vital signs${relevant} if measured by the clinician.`)],
    age_specific_red_flags: [item('paediatrics', 'age specific red flags', `Age-specific red flags${relevant} if assessed by the clinician.`)],
  }
}

function remediationEntry(workflowId, findingId, severity, beforeSummary, afterSummary, rule, filesAffected) {
  return {
    workflow_id: workflowId,
    finding_id: findingId,
    severity,
    before_summary: beforeSummary,
    after_summary: afterSummary,
    source_basis: 'Najm documentation-only product safety policy; no patient-specific guideline recommendation introduced.',
    automated_rule: rule,
    timestamp: remediationTimestamp,
    files_affected: filesAffected,
  }
}

function cleanCanonicalSafety(workflow, entries) {
  const workflowId = workflow.identity.workflow_id
  let itemSafetyChanged = false
  walkMutable(workflow, (entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return
    if (typeof entry.text === 'string' && Object.hasOwn(entry, 'clinician_confirmation_required')) {
      if (entry.default_selected !== false || entry.clinician_confirmation_required !== true) itemSafetyChanged = true
      entry.default_selected = false
      entry.clinician_confirmation_required = true
    }
    if (typeof entry.field_id === 'string' && Object.hasOwn(entry, 'clinician_entry_required')) {
      if (entry.auto_populate !== false || entry.clinician_entry_required !== true) itemSafetyChanged = true
      entry.auto_populate = false
      entry.clinician_entry_required = true
    }
  })
  if (itemSafetyChanged) {
    entries.push(remediationEntry(workflowId, `${workflowId}-canonical-confirmation-hardening`, 'P0', 'One or more canonical items allowed a selected or auto-populated state.', 'All documentation items are unselected and every clinician field requires explicit entry.', 'force_unconfirmed_canonical_state', [`clinical-expansion/canonical/workflows/${workflowId}.json`]))
  }
}

function clearPreconfirmedApplicationContent(workflow, projection, firstResult, entries) {
  const workflowId = workflow.identity.workflow_id
  const preset = projection.speed_preset
  if (!preset) return
  const keys = [
    'prechecked_symptoms', 'prechecked_relevant_negatives', 'prechecked_exam_findings',
    'prechecked_investigations', 'prechecked_plan_phrases', 'prechecked_follow_up',
  ]
  for (const key of keys) {
    const before = [...(preset[key] ?? [])]
    if (!before.length) continue
    const findingCode = `PRECONFIRMED_${key.toUpperCase()}`
    const findingRecord = firstResult?.findings.find((finding) => finding.code === findingCode)
    preset[key] = []
    entries.push(remediationEntry(
      workflowId,
      findingRecord?.finding_id ?? `${workflowId}-${findingCode.toLowerCase()}`,
      'P0',
      `${key} contained ${before.length} automatically selected value(s).`,
      `${key} is empty; the same workflow content remains available only as manually selected chips or documentation options.`,
      'clear_all_preconfirmed_speed_preset_content',
      ['clinical-expansion/canonical/expanded_workflows_v1.json', 'public/data/speed_presets.json'],
    ))
  }
  preset.autofill_preset = null
  preset.safety_note = 'No clinical content is preselected. Suggestions remain unconfirmed until individually selected by the clinician. Examination always remains manual.'
  preset.review_required = true
}

function fixKnownContentIssues(workflow, projection, firstResult, entries) {
  const workflowId = workflow.identity.workflow_id
  const findingCodes = new Set((firstResult?.findings ?? []).map((entry) => entry.code))

  if (findingCodes.has('MOJIBAKE')) {
    const before = workflow.identity.aliases.join(' | ')
    if (/�/.test(before)) {
      workflow.identity.aliases = uniqueStrings(workflow.identity.aliases.map(fixEncoding))
      const clinical = projection.clinical_workflow
      clinical.chief_complaint_aliases = uniqueStrings((clinical.chief_complaint_aliases ?? []).map(fixEncoding))
      clinical.diagnosis_aliases = uniqueStrings((clinical.diagnosis_aliases ?? []).map(fixEncoding))
      entries.push(remediationEntry(workflowId, `${workflowId}-mojibake`, 'P1', before, workflow.identity.aliases.join(' | '), 'repair_known_utf8_replacement_sequences', [`clinical-expansion/canonical/workflows/${workflowId}.json`, 'public/data/clinical_workflows.json']))
    }
  }

  if (findingCodes.has('RED_FLAG_AS_CONCLUSION')) {
    let changed = false
    for (const redFlag of workflow.safety.red_flag_prompts) {
      if (/^no acute concern identified$/i.test(redFlag.text)) {
        redFlag.text = 'Prompt clinician assessment for any acute concern.'
        changed = true
      }
      if (/^no social interaction$/i.test(redFlag.text)) {
        redFlag.text = 'Assess and document reduced or absent social interaction.'
        changed = true
      }
    }
    if (changed) entries.push(remediationEntry(workflowId, `${workflowId}-red-flag-as-conclusion`, 'P1', 'A red-flag item asserted an absent finding.', 'Red-flag content is framed as a clinician assessment/documentation prompt.', 'rewrite_red_flag_conclusion_as_prompt', [`clinical-expansion/canonical/workflows/${workflowId}.json`]))
  }

  if (findingCodes.has('PAEDIATRIC_FIELDS_MISSING')) {
    const hasPediatricContent = Object.values(workflow.paediatrics).some((value) => Array.isArray(value) && value.length)
    if (!hasPediatricContent) {
      workflow.paediatrics = pediatricPrompts(workflow.identity.presentation)
      entries.push(remediationEntry(workflowId, `${workflowId}-paediatric-fields-missing`, 'P1', 'Paediatric workflow had no paediatric-specific fields.', 'Added conservative, unconfirmed paediatric documentation prompts with no management recommendations.', 'add_minimum_paediatric_documentation_scaffold', [`clinical-expansion/canonical/workflows/${workflowId}.json`]))
    }
  }

  if (findingCodes.has('HIGH_RISK_UNDERTIERED') && workflow.governance.risk_tier !== 'tier_4') {
    const beforeTier = workflow.governance.risk_tier
    workflow.governance.risk_tier = 'tier_4'
    workflow.governance.review_priority = 'high'
    workflow.governance.limited_testing_status = 'excluded_pending_source_and_clinical_review'
    workflow.identity.current_exclusion_status = 'additional_exclusion_proposed'
    entries.push(remediationEntry(workflowId, `${workflowId}-high-risk-undertiered`, 'P1', `Risk tier was ${beforeTier}.`, 'Risk tier is tier_4 and the workflow is excluded pending source and clinical review.', 'promote_high_risk_workflow_and_exclude', [`clinical-expansion/canonical/workflows/${workflowId}.json`, 'public/config/limited_testing_exclusions.json']))
  }

  if (findingCodes.has('TEMPERATURE_LABEL_MISMATCH')) {
    let changed = false
    walkMutable(workflow.investigations, (entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return
      if ((entry.legacy_item_ids ?? []).some((id) => /temperature_recorded/i.test(id)) && !/temperature/i.test(entry.text ?? '')) {
        entry.text = 'Temperature recorded.'
        changed = true
      }
    })
    for (const group of projection.investigation_options?.investigation_groups ?? []) {
      for (const option of group.options ?? []) {
        if (/temperature_recorded/i.test(option.option_id ?? '') && !/temperature/i.test(`${option.option_text ?? ''} ${option.note_text ?? ''}`)) {
          option.option_text = 'Temperature recorded.'
          option.note_text = 'Temperature recorded.'
          changed = true
        }
      }
    }
    if (changed) entries.push(remediationEntry(workflowId, `${workflowId}-temperature-label-mismatch`, 'P1', 'Temperature option was labelled as blood pressure.', 'Temperature option is consistently labelled “Temperature recorded.”', 'align_known_investigation_id_and_label', [`clinical-expansion/canonical/workflows/${workflowId}.json`, 'public/data/v4_investigation_options.json']))
  }

  const normalizedAliases = new Set()
  workflow.identity.aliases = workflow.identity.aliases.filter((alias) => {
    const key = normalizeText(alias).toLowerCase().replaceAll(/[^a-z0-9]+/g, ' ').trim()
    if (!key || normalizedAliases.has(key)) return false
    normalizedAliases.add(key)
    return true
  })
}

function updateManifest(manifest, firstSummary, remediatedIds) {
  const firstById = new Map(firstSummary.results.map((result) => [result.workflow_id, result]))
  for (const workflowEntry of manifest.workflows) {
    const result = firstById.get(workflowEntry.workflow_id)
    const neededRemediation = Boolean((result?.severity_counts.P0 ?? 0) || (result?.severity_counts.P1 ?? 0))
    workflowEntry.stage_flags.first_audit_passed = !neededRemediation
    workflowEntry.stage_flags.remediation_required = neededRemediation
    workflowEntry.stage_flags.remediated = workflowEntry.stage_flags.remediated || remediatedIds.has(workflowEntry.workflow_id)
    if (neededRemediation) workflowEntry.status_history.push({ at: remediationTimestamp, status: 'remediation_required' })
    if (remediatedIds.has(workflowEntry.workflow_id)) workflowEntry.status_history.push({ at: remediationTimestamp, status: 'remediated' })
    workflowEntry.current_status = workflowEntry.stage_flags.unresolved_source_gap ? 'unresolved_source_gap' : remediatedIds.has(workflowEntry.workflow_id) ? 'remediated' : workflowEntry.current_status
  }
  manifest.updated_at = remediationTimestamp
  manifest.status_counts = countBy(manifest.workflows, (entry) => entry.current_status)
}

function main() {
  const dataset = readJson(canonicalPath)
  const firstSummary = readJson(firstAuditPath)
  const manifest = readJson(manifestPath)
  if (dataset.workflows.length !== WORKFLOW_COUNT || firstSummary.workflows_audited !== WORKFLOW_COUNT) {
    throw new Error('Remediation requires a complete 1,500-workflow canonical dataset and first-pass audit.')
  }
  const firstById = new Map(firstSummary.results.map((result) => [result.workflow_id, result]))
  const entries = []
  const remediatedIds = new Set()

  dataset.workflows = dataset.workflows.map((rawWorkflow) => {
    const workflow = replaceStrings(rawWorkflow)
    for (const change of workflow.governance.change_log) {
      if (change.change_type === 'automated_safety_remediation') change.change_type = 'automated_remediation'
    }
    const workflowId = workflow.identity.workflow_id
    const projection = replaceStrings(dataset.application_projection_by_workflow_id[workflowId])
    dataset.application_projection_by_workflow_id[workflowId] = projection
    const beforeCount = entries.length
    cleanCanonicalSafety(workflow, entries)
    clearPreconfirmedApplicationContent(workflow, projection, firstById.get(workflowId), entries)
    fixKnownContentIssues(workflow, projection, firstById.get(workflowId), entries)
    if (entries.length > beforeCount) {
      remediatedIds.add(workflowId)
      workflow.governance.expansion_status = 'remediated'
      workflow.governance.automated_qa_status = 'in_progress'
      workflow.governance.change_log.push({
        changed_at: remediationTimestamp,
        change_type: 'automated_remediation',
        summary: 'Removed preconfirmed content and applied deterministic safety/consistency fixes; clinical review remains required.',
        actor_type: 'automation',
        actor_id: 'najm-clinical-remediation',
        source_ids: [],
      })
    }
    return workflow
  })

  dataset.risk_distribution = countBy(dataset.workflows, (workflow) => workflow.governance.risk_tier)
  dataset.source_status_distribution = countBy(dataset.workflows, (workflow) => workflow.governance.source_status)
  writeCompactJson(canonicalPath, dataset)
  for (const workflow of dataset.workflows) writeJson(path.join(expansionRoot, 'canonical', 'workflows', `${workflow.identity.workflow_id}.json`), workflow)

  const proposed = dataset.workflows
    .filter((workflow) => workflow.identity.current_exclusion_status !== 'excluded_requires_doctor_review')
    .map((workflow) => ({
      workflow_id: workflow.identity.workflow_id,
      risk_tier: workflow.governance.risk_tier,
      source_status: workflow.governance.source_status,
      reason: workflow.governance.source_status === 'source_gap'
        ? 'No workflow-specific authoritative source verified.'
        : 'Source-family mapping remains incomplete at workflow level.',
      triggering_rule: workflow.governance.source_status,
      current_status: workflow.identity.current_exclusion_status,
      proposed_category: 'excluded_pending_source_review',
    }))
  writeJson(path.join(expansionRoot, 'risk', 'proposed_additional_exclusions.json'), {
    generated_on: SOURCE_REVIEW_DATE,
    workflow_count: dataset.workflows.length,
    proposed_exclusion_count: proposed.length,
    exclusions: proposed,
  })

  updateManifest(manifest, firstSummary, remediatedIds)
  writeJson(manifestPath, manifest)
  fs.mkdirSync(remediationRoot, { recursive: true })
  const existingLogPath = path.join(remediationRoot, 'remediation_log.jsonl')
  const existingEntries = fs.existsSync(existingLogPath)
    ? fs.readFileSync(existingLogPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
    : []
  const combinedByKey = new Map()
  for (const entry of [...existingEntries, ...entries]) {
    const key = `${entry.workflow_id}|${entry.finding_id}|${entry.automated_rule}`
    if (!combinedByKey.has(key)) combinedByKey.set(key, entry)
  }
  const combinedEntries = [...combinedByKey.values()]
  fs.writeFileSync(existingLogPath, `${combinedEntries.map((entry) => JSON.stringify(entry)).join('\n')}\n`, 'utf8')
  writeText(path.join(remediationRoot, 'REMEDIATION_REPORT.md'), [
    '# Automated Remediation Report',
    '',
    `- First-pass workflows audited: ${firstSummary.workflows_audited}`,
    `- Remediation records: ${combinedEntries.length}`,
    `- Workflows changed in the latest run: ${remediatedIds.size}`,
    `- First-pass P0 findings targeted: ${firstSummary.unresolved_p0_count}`,
    `- First-pass P1 findings targeted: ${firstSummary.unresolved_p1_count}`,
    '',
    '## Rules Applied',
    '',
    '- Cleared every `prechecked_*` array so Quick Note starts unconfirmed.',
    '- Forced canonical documentation items and clinician-entry fields into explicit-confirmation mode.',
    '- Reframed detected red-flag conclusions as assessment prompts.',
    '- Added minimum unconfirmed paediatric documentation fields where the workflow title/scope was paediatric.',
    '- Promoted detected high-risk workflows to Tier 4 and excluded them pending source/clinical review.',
    '- Corrected known encoding and temperature-label mismatches.',
    '',
    '> Source gaps and generic-content findings were not invented away. They remain explicit qualified-review blockers.',
  ].join('\n'))

  console.log(JSON.stringify({
    status: 'COMPLETE',
    workflows_processed: dataset.workflows.length,
    workflows_remediated: remediatedIds.size,
    remediation_records: combinedEntries.length,
    risk_distribution: dataset.risk_distribution,
  }, null, 2))
}

main()

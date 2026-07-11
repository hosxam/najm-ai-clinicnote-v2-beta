import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  WORKFLOW_COUNT,
  countBy,
  expansionRoot,
  normalizeText,
  readJson,
  writeCsv,
  writeJson,
  writeText,
} from './common.mjs'

const severityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, ungraded: 4 }
const forbiddenPlaceholderPattern = /\b(?:history not documented|examination not documented|objective findings not documented|clinician impression not documented|clinician plan not documented|not assessed|not recorded|n\/?a)\b/i
const duplicateLabelPattern = /\b(history|examination|relevant examination|investigations reviewed|impression|plan|reason for referral|patient instructions)\s*:\s*\1\s*:/i
const dosePattern = /\b\d+(?:\.\d+)?\s*(?:mcg|micrograms?|mg|milligrams?|g|grams?|kg|ml|mL|units?|iu)\b/i
const frequencyPattern = /\b(?:once|twice|three times|four times)\s+(?:daily|a day)|\bevery\s+\d+\s*(?:hours?|hrs?)\b|\b\d+\s*(?:x|times)\s*(?:daily|per day)\b/i
const durationPattern = /\bfor\s+\d+\s*(?:days?|weeks?|months?)\b/i
const directivePattern = /(?:^|[.;]\s*)(?:start|stop|take|give|prescribe|administer|refer|order|arrange|perform|use)\b/i
const safeDocumentationPattern = /\b(?:documented|entered by clinician|if clinician|if discussed|if arranged|if ordered|if performed|if reviewed|clinician-entered|record only|option only|not a recommendation)\b/i
const mojibakePattern = /\ufffd|\u00c2|\u00c3|â€|â€™|â€œ|â€/
const genericPromptPattern = /\brelevant to .+ if assessed by the clinician\.?$/i
const highRiskPattern = /\b(?:icu|intensive care|an(?:a|e)esthesia|emergency|airway|ventilat|sedation|resuscitat|shock|sepsis|operative|perioperative|major trauma|suicid|self-harm|pregnancy bleeding|acute abdomen|neurological deficit|controlled drug)\b/i
const broadAliasTerms = new Set([
  'pain', 'fever', 'cough', 'swelling', 'rash', 'dizziness', 'fatigue', 'review', 'follow-up',
  'follow up', 'medication', 'emergency', 'chest pain', 'shortness of breath', 'abdominal pain',
  'headache', 'urinary symptoms', 'weakness', 'numbness',
])

function finding(workflowId, code, severity, category, summary, pathValue, remediable = false) {
  return {
    finding_id: `${workflowId}-${code.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    code,
    severity,
    category,
    summary,
    path: pathValue,
    remediable,
    status: 'open',
  }
}

function walk(value, visitor, currentPath = []) {
  visitor(value, currentPath)
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visitor, [...currentPath, index]))
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => walk(entry, visitor, [...currentPath, key]))
  }
}

function textLeaves(value) {
  const values = []
  walk(value, (entry, entryPath) => {
    if (typeof entry === 'string') values.push({ text: entry, path: entryPath.join('.') })
  })
  return values
}

function documentationItems(value) {
  const values = []
  walk(value, (entry, entryPath) => {
    if (
      entry
      && typeof entry === 'object'
      && !Array.isArray(entry)
      && typeof entry.text === 'string'
      && Object.hasOwn(entry, 'clinician_confirmation_required')
    ) values.push({ item: entry, path: entryPath.join('.') })
  })
  return values
}

function clinicianFields(value) {
  const values = []
  walk(value, (entry, entryPath) => {
    if (
      entry
      && typeof entry === 'object'
      && !Array.isArray(entry)
      && typeof entry.field_id === 'string'
      && Object.hasOwn(entry, 'clinician_entry_required')
    ) values.push({ field: entry, path: entryPath.join('.') })
  })
  return values
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase().replaceAll(/[^a-z0-9]+/g, ' ').trim()
}

function countItems(value) {
  return documentationItems(value).length + clinicianFields(value).length
}

function addOnce(findings, nextFinding) {
  if (!findings.some((entry) => entry.code === nextFinding.code && entry.path === nextFinding.path)) findings.push(nextFinding)
}

function auditSources(workflow, context, findings) {
  const workflowId = workflow.identity.workflow_id
  const provenance = workflow.guideline_provenance
  const sourceIds = [...new Set([...(provenance.primary_source_ids ?? []), ...(provenance.supporting_source_ids ?? [])])]
  for (const sourceId of sourceIds) {
    const source = context.sourceById.get(sourceId)
    if (!source) {
      findings.push(finding(workflowId, 'ORPHAN_SOURCE_ID', 'P1', 'source_provenance', `Source ID ${sourceId} is not present in the authoritative registry.`, 'guideline_provenance', false))
      continue
    }
    for (const required of ['organisation', 'title', 'url', 'jurisdiction', 'source_type', 'publication_date', 'access_date']) {
      const sourceValue = source[required]
      if (sourceValue === undefined || sourceValue === null || (Array.isArray(sourceValue) ? !sourceValue.length : !String(sourceValue).trim())) {
      findings.push(finding(workflowId, `SOURCE_MISSING_${required.toUpperCase()}`, 'ungraded', 'source_provenance', `Mapped source ${sourceId} is missing ${required}; the workflow remains excluded under its incomplete source mapping.`, `guideline_provenance.${required}`, false))
      }
    }
    if (!/^https:\/\//i.test(source.url ?? '')) {
      findings.push(finding(workflowId, 'SOURCE_LOCATION_INVALID', 'P1', 'source_provenance', `Mapped source ${sourceId} does not use an HTTPS official location.`, 'guideline_provenance.primary_source_ids', false))
    }
    if (source.access_date !== SOURCE_REVIEW_DATE) {
      findings.push(finding(workflowId, 'SOURCE_ACCESS_DATE_MISMATCH', 'P2', 'source_recency', `Mapped source ${sourceId} was not recorded as accessed on ${SOURCE_REVIEW_DATE}.`, 'guideline_provenance.source_search_date', false))
    }
  }

  const sourceGap = ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)
  if (!sourceIds.length && workflow.governance.source_status !== 'source_gap') {
    findings.push(finding(workflowId, 'SOURCE_STATUS_INCONSISTENT', 'P1', 'source_provenance', 'Workflow has no mapped source but is not explicitly marked as a source gap.', 'governance.source_status', true))
  }
  if (sourceIds.length && workflow.governance.source_status === 'source_gap') {
    findings.push(finding(workflowId, 'SOURCE_IDS_IGNORED', 'P1', 'source_provenance', 'Workflow has mapped source IDs but governance still reports a complete source gap.', 'governance.source_status', true))
  }
  if (provenance.source_search_date !== SOURCE_REVIEW_DATE) {
    findings.push(finding(workflowId, 'SOURCE_SEARCH_DATE_MISMATCH', 'P1', 'source_recency', `Source search date must be ${SOURCE_REVIEW_DATE}.`, 'guideline_provenance.source_search_date', true))
  }
  if (sourceGap && !workflow.governance.limited_testing_status.startsWith('excluded_')) {
    findings.push(finding(workflowId, 'SOURCE_GAP_NOT_EXCLUDED', 'P0', 'source_provenance', 'A source gap or incomplete mapping is not excluded pending source review.', 'governance.limited_testing_status', true))
  }
  if (sourceGap && !(workflow.governance.unresolved_issues ?? []).some((issue) => issue.category === 'source_gap')) {
    findings.push(finding(workflowId, 'SOURCE_GAP_NOT_RECORDED', 'P1', 'source_provenance', 'Source gap is not represented in unresolved issues.', 'governance.unresolved_issues', true))
  }
}

function auditCanonicalSafety(workflow, applicationProjection, findings) {
  const workflowId = workflow.identity.workflow_id
  for (const { item, path: itemPath } of documentationItems(workflow)) {
    if (item.default_selected !== false) {
      findings.push(finding(workflowId, 'CANONICAL_ITEM_PRESELECTED', 'P0', 'safety', 'Canonical documentation item is selected without clinician confirmation.', itemPath, true))
    }
    if (item.clinician_confirmation_required !== true) {
      findings.push(finding(workflowId, 'CANONICAL_CONFIRMATION_NOT_REQUIRED', 'P0', 'safety', 'Canonical documentation item does not require clinician confirmation.', itemPath, true))
    }
  }
  for (const { field, path: fieldPath } of clinicianFields(workflow)) {
    if (field.auto_populate !== false || field.clinician_entry_required !== true) {
      findings.push(finding(workflowId, 'CLINICIAN_FIELD_AUTOFILL', 'P0', 'safety', 'Clinician-entered field permits automatic population.', fieldPath, true))
    }
  }

  const preset = applicationProjection?.speed_preset
  if (!preset) {
    findings.push(finding(workflowId, 'MISSING_SPEED_PRESET', 'P1', 'application', 'Application projection has no speed preset.', 'application_projection.speed_preset', false))
  } else {
    for (const key of [
      'prechecked_symptoms', 'prechecked_relevant_negatives', 'prechecked_exam_findings',
      'prechecked_investigations', 'prechecked_plan_phrases', 'prechecked_follow_up',
    ]) {
      if ((preset[key] ?? []).length) {
        findings.push(finding(workflowId, `PRECONFIRMED_${key.toUpperCase()}`, 'P0', 'application', `${key} contains content that can enter the draft before individual clinician confirmation.`, `application_projection.speed_preset.${key}`, true))
      }
    }
  }

  const mismatchedTemperatureItems = documentationItems(workflow.investigations)
    .filter(({ item }) => (item.legacy_item_ids ?? []).some((legacyId) => /temperature_recorded/i.test(legacyId)) && !/temperature/i.test(item.text))
  for (const mismatch of mismatchedTemperatureItems) {
    findings.push(finding(workflowId, 'TEMPERATURE_LABEL_MISMATCH', 'P1', 'internal_consistency', `Temperature documentation item has mismatched text: “${mismatch.item.text}”`, mismatch.path, true))
  }

  const safetyText = [workflow.plan, workflow.investigations, applicationProjection?.plan_options, applicationProjection?.medication_options]
  for (const { text, path: textPath } of textLeaves(safetyText)) {
    if (dosePattern.test(text) || frequencyPattern.test(text) || durationPattern.test(text)) {
      findings.push(finding(workflowId, 'MEDICATION_REGIMEN_PATTERN', 'P0', 'medication_safety', `Possible medication dose, frequency, or duration detected: “${text}”`, textPath, true))
    }
    if (directivePattern.test(text) && !safeDocumentationPattern.test(text)) {
      findings.push(finding(workflowId, 'AUTONOMOUS_DIRECTIVE_LANGUAGE', 'P1', 'safety', `Possible autonomous management wording detected: “${text}”`, textPath, true))
    }
  }

  for (const { item, path: itemPath } of documentationItems(workflow.safety.red_flag_prompts)) {
    if (/^(?:no|absent|negative for)\b/i.test(item.text)) {
      findings.push(finding(workflowId, 'RED_FLAG_AS_CONCLUSION', 'P1', 'safety', `Red flag is written as a conclusion rather than an assessment prompt: “${item.text}”`, itemPath, true))
    }
  }
}

function auditCompletenessAndConsistency(workflow, context, findings) {
  const workflowId = workflow.identity.workflow_id
  const requiredSections = [
    ['presenting_complaint', workflow.presenting_complaint],
    ['associated_history', workflow.associated_history],
    ['background_history', workflow.background_history],
    ['examination', workflow.examination],
    ['investigations', workflow.investigations],
    ['assessment', workflow.assessment],
    ['plan', workflow.plan],
    ['safety', workflow.safety],
  ]
  for (const [sectionName, section] of requiredSections) {
    if (!section || countItems(section) === 0) {
      findings.push(finding(workflowId, `EMPTY_${sectionName.toUpperCase()}`, 'P1', 'content_completeness', `Canonical ${sectionName} section contains no clinician-facing items or fields.`, sectionName, false))
    }
  }

  if (!context.workflowIds.has(workflow.identity.workflow_id)) {
    findings.push(finding(workflowId, 'WORKFLOW_NOT_INDEXED', 'P0', 'schema', 'Workflow ID is absent from the canonical ID index.', 'identity.workflow_id', false))
  }
  for (const relatedId of workflow.identity.related_workflow_ids ?? []) {
    if (!context.workflowIds.has(relatedId)) {
      findings.push(finding(workflowId, 'ORPHAN_RELATED_WORKFLOW', 'P1', 'schema', `Related workflow ${relatedId} does not exist.`, 'identity.related_workflow_ids', false))
    }
  }
  if (workflow.scope.age_max_years !== null && workflow.scope.age_min_months !== null && workflow.scope.age_min_months > workflow.scope.age_max_years * 12) {
    findings.push(finding(workflowId, 'AGE_RANGE_CONTRADICTION', 'P1', 'population_consistency', 'Minimum age exceeds maximum age.', 'scope', false))
  }
  const womenItems = countItems(workflow.womens_health)
  if (workflow.scope.sex_applicability === 'male_only' && womenItems > 0) {
    findings.push(finding(workflowId, 'MALE_WORKFLOW_WITH_WOMENS_HEALTH_PROMPTS', 'P1', 'population_consistency', 'Male-only workflow contains women’s-health prompts.', 'womens_health', true))
  }
  const specialty = workflow.identity.specialty_display_name
  const workflowText = `${workflow.identity.workflow_id} ${workflow.identity.display_name} ${specialty}`
  if (/paediatric|pediatric|child|neonat/i.test(workflowText) && countItems(workflow.paediatrics) === 0) {
    findings.push(finding(workflowId, 'PAEDIATRIC_FIELDS_MISSING', 'P1', 'population_consistency', 'Paediatric workflow has no paediatric documentation prompts.', 'paediatrics', false))
  }
  if (/psychiatr|mental health/i.test(specialty) && countItems(workflow.psychiatry) === 0) {
    findings.push(finding(workflowId, 'PSYCHIATRY_FIELDS_MISSING', 'P1', 'population_consistency', 'Mental-health workflow has no psychiatry-specific documentation fields.', 'psychiatry', false))
  }
  if (highRiskPattern.test(workflowText) && !['tier_4', 'tier_5'].includes(workflow.governance.risk_tier)) {
    findings.push(finding(workflowId, 'HIGH_RISK_UNDERTIERED', 'P1', 'workflow_risk', 'High-risk workflow is classified below Tier 4.', 'governance.risk_tier', true))
  }
  if (['tier_4', 'tier_5'].includes(workflow.governance.risk_tier) && !workflow.governance.limited_testing_status.startsWith('excluded_')) {
    findings.push(finding(workflowId, 'HIGH_RISK_NOT_EXCLUDED', 'P0', 'workflow_risk', 'Tier 4/5 workflow is not excluded from limited testing.', 'governance.limited_testing_status', true))
  }
}

function auditQuality(workflow, applicationProjection, findings) {
  const workflowId = workflow.identity.workflow_id
  const allText = textLeaves(workflow).filter(({ path: textPath }) => !/(?:^|\.)(?:item_id|field_id|workflow_id|source_ids|legacy_item_ids|duplicate_group_id)(?:\.|$)/.test(textPath))
  const genericCount = allText.filter(({ text }) => genericPromptPattern.test(text)).length
  if (genericCount >= 12) {
    findings.push(finding(workflowId, 'GENERIC_PROMPT_DENSITY', 'P2', 'quality', `${genericCount} prompts use generic “relevant to … if assessed” wording; condition-specific clinical review is required.`, 'canonical', false))
  }
  for (const { text, path: textPath } of allText) {
    if (mojibakePattern.test(text)) addOnce(findings, finding(workflowId, 'MOJIBAKE', 'P1', 'quality', `Malformed character encoding detected: “${text}”`, textPath, true))
    if (forbiddenPlaceholderPattern.test(text)) addOnce(findings, finding(workflowId, 'FORBIDDEN_PLACEHOLDER', 'P1', 'quality', `Forbidden placeholder wording detected: “${text}”`, textPath, true))
    if (duplicateLabelPattern.test(text)) addOnce(findings, finding(workflowId, 'DUPLICATE_OUTPUT_LABEL', 'P1', 'quality', `Duplicate output label detected: “${text}”`, textPath, true))
    if (/[!?.,;:]{3,}/.test(text)) addOnce(findings, finding(workflowId, 'DUPLICATE_PUNCTUATION', 'P3', 'quality', `Repeated punctuation detected: “${text}”`, textPath, true))
  }

  const aliasKeys = (workflow.identity.aliases ?? []).map(normalizeKey).filter(Boolean)
  if (aliasKeys.some((alias) => broadAliasTerms.has(alias))) {
    findings.push(finding(workflowId, 'BROAD_ALIAS_REVIEW', 'P2', 'duplicate_and_matching', 'Workflow contains a broad collision-prone alias that requires matching review.', 'identity.aliases', false))
  }
  if (new Set(aliasKeys).size !== aliasKeys.length) {
    findings.push(finding(workflowId, 'DUPLICATE_ALIAS', 'P3', 'duplicate_and_matching', 'Workflow aliases contain normalized duplicates.', 'identity.aliases', true))
  }

  const projectionParts = ['clinical_workflow', 'workflow_chips', 'speed_preset', 'history_draft', 'exam_details', 'investigation_options', 'plan_options']
  for (const part of projectionParts) {
    if (!applicationProjection?.[part]) {
      findings.push(finding(workflowId, `MISSING_PROJECTION_${part.toUpperCase()}`, 'P1', 'application', `Application projection is missing ${part}.`, `application_projection.${part}`, false))
    }
  }
}

export function auditWorkflow(workflow, context) {
  const findings = []
  const workflowId = workflow.identity.workflow_id
  const applicationProjection = context.dataset.application_projection_by_workflow_id?.[workflowId]
  auditSources(workflow, context, findings)
  auditCanonicalSafety(workflow, applicationProjection, findings)
  auditCompletenessAndConsistency(workflow, context, findings)
  auditQuality(workflow, applicationProjection, findings)
  findings.sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity] || left.code.localeCompare(right.code))
  const severity_counts = countBy(findings, (entry) => entry.severity)
  const unresolvedP0 = severity_counts.P0 ?? 0
  const unresolvedP1 = severity_counts.P1 ?? 0
  const sourceGap = ['source_gap', 'source_mapped_with_gaps'].includes(workflow.governance.source_status)
  const verdict = unresolvedP0 || unresolvedP1
    ? 'failed'
    : findings.some((entry) => ['P2', 'P3'].includes(entry.severity)) || sourceGap
      ? 'pass_with_review_items'
      : 'clean_pass'
  return {
    workflow_id: workflowId,
    display_name: workflow.identity.display_name,
    specialty: workflow.identity.specialty_display_name,
    risk_tier: workflow.governance.risk_tier,
    source_status: workflow.governance.source_status,
    clinical_review_status: workflow.governance.clinical_review_status,
    verdict,
    severity_counts,
    source_gap: sourceGap,
    findings,
  }
}

export function loadAuditContext() {
  const dataset = readJson(path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json'))
  const registry = readJson(path.join(expansionRoot, 'sources', 'authoritative_source_registry.json'))
  const workflowIds = new Set(dataset.workflows.map((workflow) => workflow.identity.workflow_id))
  if (dataset.workflows.length !== WORKFLOW_COUNT || workflowIds.size !== WORKFLOW_COUNT) {
    throw new Error(`Canonical dataset must contain exactly ${WORKFLOW_COUNT} unique workflows.`)
  }
  return {
    dataset,
    registry,
    workflowIds,
    sourceById: new Map(registry.sources.map((source) => [source.id, source])),
  }
}

function summaryFromResults(stage, results) {
  const allFindings = results.flatMap((result) => result.findings.map((entry) => ({ ...entry, workflow_id: result.workflow_id })))
  const severityCounts = countBy(allFindings, (entry) => entry.severity)
  const sourceGapCount = results.filter((result) => result.source_gap).length
  return {
    stage,
    audit_date: SOURCE_REVIEW_DATE,
    workflows_audited: results.length,
    verdict_distribution: countBy(results, (result) => result.verdict),
    severity_distribution: severityCounts,
    source_gap_or_incomplete_mapping_count: sourceGapCount,
    source_conflict_count: results.filter((result) => result.source_status === 'conflict_requires_clinician_review').length,
    unresolved_p0_count: severityCounts.P0 ?? 0,
    unresolved_p1_count: severityCounts.P1 ?? 0,
    workflows_with_p0: results.filter((result) => (result.severity_counts.P0 ?? 0) > 0).length,
    workflows_with_p1: results.filter((result) => (result.severity_counts.P1 ?? 0) > 0).length,
    clinician_review_required_count: results.filter((result) => result.clinical_review_status === 'clinical_review_required').length,
    findings_by_category: countBy(allFindings, (entry) => entry.category),
    results,
  }
}

function auditReportMarkdown(summary) {
  const title = summary.stage === 'first_pass' ? 'First-Pass 1,500-Workflow Audit' : 'Final Independent 1,500-Workflow Audit'
  const highPriority = summary.results
    .filter((result) => (result.severity_counts.P0 ?? 0) || (result.severity_counts.P1 ?? 0))
    .slice(0, 100)
  return [
    `# ${title}`,
    '',
    `- Audit date: ${summary.audit_date}`,
    `- Workflows audited: ${summary.workflows_audited}`,
    `- Clean pass: ${summary.verdict_distribution.clean_pass ?? 0}`,
    `- Pass with review items: ${summary.verdict_distribution.pass_with_review_items ?? 0}`,
    `- Failed automated checks: ${summary.verdict_distribution.failed ?? 0}`,
    `- Unresolved P0 findings: ${summary.unresolved_p0_count}`,
    `- Unresolved P1 findings: ${summary.unresolved_p1_count}`,
    `- Source gaps or incomplete mappings: ${summary.source_gap_or_incomplete_mapping_count}`,
    `- Clinician review required: ${summary.clinician_review_required_count}`,
    '',
    '> Automated QA does not constitute clinical approval. Source gaps and incomplete workflow-level mapping remain explicit testing blockers.',
    '',
    '## Highest-Priority Findings',
    '',
    ...(highPriority.length
      ? highPriority.map((result) => `- \`${result.workflow_id}\` — ${result.findings.filter((entry) => ['P0', 'P1'].includes(entry.severity)).map((entry) => `${entry.severity} ${entry.code}`).join('; ')}`)
      : ['- No unresolved P0/P1 findings.']),
  ].join('\n')
}

export function runFullAudit(stage) {
  const context = loadAuditContext()
  const results = context.dataset.workflows.map((workflow) => auditWorkflow(workflow, context))
  const summary = summaryFromResults(stage, results)
  const isFirst = stage === 'first_pass'
  const directory = path.join(expansionRoot, 'audits', isFirst ? 'first_pass' : 'final')
  fs.mkdirSync(directory, { recursive: true })
  for (const result of results) {
    const suffix = isFirst ? '.audit.json' : '.final-audit.json'
    writeJson(path.join(directory, `${result.workflow_id}${suffix}`), {
      ...result,
      audit_stage: stage,
      audit_date: SOURCE_REVIEW_DATE,
      clinical_approval_claimed: false,
    })
  }
  const summaryPrefix = isFirst ? 'first_pass_summary' : 'final_audit_summary'
  const reportName = isFirst ? 'FIRST_PASS_AUDIT_REPORT.md' : 'FINAL_1500_WORKFLOW_AUDIT.md'
  writeJson(path.join(expansionRoot, 'audits', `${summaryPrefix}.json`), summary)
  writeCsv(path.join(expansionRoot, 'audits', `${summaryPrefix}.csv`), [
    'workflow_id', 'display_name', 'specialty', 'risk_tier', 'source_status', 'verdict', 'p0', 'p1', 'p2', 'p3', 'finding_codes',
  ], results.map((result) => ({
    workflow_id: result.workflow_id,
    display_name: result.display_name,
    specialty: result.specialty,
    risk_tier: result.risk_tier,
    source_status: result.source_status,
    verdict: result.verdict,
    p0: result.severity_counts.P0 ?? 0,
    p1: result.severity_counts.P1 ?? 0,
    p2: result.severity_counts.P2 ?? 0,
    p3: result.severity_counts.P3 ?? 0,
    finding_codes: result.findings.map((entry) => `${entry.severity}:${entry.code}`),
  })))
  writeText(path.join(expansionRoot, 'audits', reportName), auditReportMarkdown(summary))
  return summary
}

export function generateOverlapRegistry() {
  const { dataset } = loadAuditContext()
  const exactGroups = new Map()
  const aliasGroups = new Map()
  for (const workflow of dataset.workflows) {
    const exactKey = `${normalizeKey(workflow.identity.specialty_id)}|${normalizeKey(workflow.identity.display_name)}`
    if (!exactGroups.has(exactKey)) exactGroups.set(exactKey, [])
    exactGroups.get(exactKey).push(workflow.identity.workflow_id)
    for (const alias of workflow.identity.aliases ?? []) {
      const aliasKey = normalizeKey(alias)
      if (!aliasKey) continue
      if (!aliasGroups.has(aliasKey)) aliasGroups.set(aliasKey, [])
      aliasGroups.get(aliasKey).push(workflow.identity.workflow_id)
    }
  }
  const duplicateGroups = [...exactGroups.entries()]
    .filter(([, ids]) => new Set(ids).size > 1)
    .map(([normalized_concept, ids]) => ({ normalized_concept, workflow_ids: [...new Set(ids)].sort(), action: 'clinician_review_required' }))
  const aliasCollisions = [...aliasGroups.entries()]
    .map(([alias, ids]) => ({ alias, workflow_ids: [...new Set(ids)].sort() }))
    .filter((entry) => entry.workflow_ids.length > 1)
    .sort((left, right) => right.workflow_ids.length - left.workflow_ids.length || left.alias.localeCompare(right.alias))
  const registry = {
    generated_on: SOURCE_REVIEW_DATE,
    workflow_count: dataset.workflows.length,
    exact_duplicate_group_count: duplicateGroups.length,
    shared_alias_group_count: aliasCollisions.length,
    exact_duplicate_groups: duplicateGroups,
    shared_alias_groups: aliasCollisions,
    groups: [
      ...duplicateGroups.map((group, index) => ({
        group_id: `exact-${String(index + 1).padStart(3, '0')}`,
        type: 'exact_same_specialty_concept',
        workflow_ids: group.workflow_ids,
        status: group.action,
      })),
      ...aliasCollisions.map((group, index) => ({
        group_id: `alias-${String(index + 1).padStart(3, '0')}`,
        type: 'shared_alias',
        workflow_ids: group.workflow_ids,
        status: 'matching_review_required',
      })),
    ],
  }
  writeJson(path.join(expansionRoot, 'audits', 'workflow_overlap_registry.json'), registry)
  writeText(path.join(expansionRoot, 'audits', 'WORKFLOW_CONSOLIDATION_RECOMMENDATIONS.md'), [
    '# Workflow Consolidation Recommendations',
    '',
    `- Exact same-specialty concept groups: ${duplicateGroups.length}`,
    `- Shared alias groups: ${aliasCollisions.length}`,
    '',
    'No workflow is deleted automatically. Exact and near-overlap groups require qualified clinician review before any merge, rename, or retirement.',
    '',
    '## Exact Concept Groups',
    '',
    ...(duplicateGroups.length ? duplicateGroups.map((group) => `- ${group.normalized_concept}: ${group.workflow_ids.map((id) => `\`${id}\``).join(', ')}`) : ['- None detected.']),
  ].join('\n'))
  return registry
}

export function runFocusedCheck(checkName) {
  const context = loadAuditContext()
  const results = context.dataset.workflows.map((workflow) => auditWorkflow(workflow, context))
  const categoryMap = {
    'clinical-inventory': ['schema', 'application'],
    'guideline-provenance': ['source_provenance'],
    'source-recency': ['source_recency'],
    'workflow-coverage': ['content_completeness', 'application'],
    'workflow-risk': ['workflow_risk'],
    contradictions: ['population_consistency', 'contradictions'],
    'medication-safety': ['medication_safety', 'safety'],
    'population-consistency': ['population_consistency'],
    duplicates: ['duplicate_and_matching'],
    'generated-data': ['application'],
  }
  if (checkName === 'duplicates') {
    const registry = generateOverlapRegistry()
    return { check: checkName, status: 'PASS_WITH_REVIEW_ITEMS', workflows_checked: WORKFLOW_COUNT, exact_duplicate_groups: registry.exact_duplicate_group_count, shared_alias_groups: registry.shared_alias_group_count }
  }
  const categories = categoryMap[checkName]
  if (!categories) throw new Error(`Unknown audit check: ${checkName}`)
  const findings = results.flatMap((result) => result.findings.filter((entry) => categories.includes(entry.category)).map((entry) => ({ ...entry, workflow_id: result.workflow_id })))
  const blocking = findings.filter((entry) => ['P0', 'P1'].includes(entry.severity) && !entry.code.startsWith('PRECONFIRMED_'))
  return {
    check: checkName,
    status: blocking.length ? 'FAIL' : findings.length ? 'PASS_WITH_REVIEW_ITEMS' : 'PASS',
    workflows_checked: WORKFLOW_COUNT,
    finding_count: findings.length,
    blocking_finding_count: blocking.length,
    finding_distribution: countBy(findings, (entry) => entry.code),
  }
}

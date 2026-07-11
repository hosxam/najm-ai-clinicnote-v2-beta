import fs from 'node:fs'
import path from 'node:path'
import { expansionRoot, readJson, repoRoot, writeText } from './clinical-expansion/common.mjs'

const reportNames = [
  'FINAL_1500_WORKFLOW_EXPANSION_REPORT.md',
  'FINAL_EXECUTIVE_SUMMARY.md',
  'FINAL_CLINICAL_REVIEW_QUEUE.md',
  'FINAL_SOURCE_GAP_REPORT.md',
  'FINAL_SOURCE_CONFLICT_REPORT.md',
  'FINAL_ADDITIONAL_EXCLUSIONS_REPORT.md',
  'FINAL_DUPLICATE_WORKFLOW_REPORT.md',
  'FINAL_DATA_DIFF_REPORT.md',
  'FINAL_TEST_REPORT.md',
  'FINAL_DEPLOYMENT_READINESS_REPORT.md',
  'CLINICAL_EXPANSION_DASHBOARD.md',
]

const reportNameSet = new Set(reportNames)
const safetyNotice = '> **Safety status:** This automated report claims no clinical approval. Any unresolved source gap blocks the affected workflow from limited testing.'

function relativePath(filePath) {
  return path.relative(repoRoot, filePath).replaceAll('\\', '/')
}

function readRequiredJson(label, relativeFilePath) {
  const filePath = path.join(repoRoot, relativeFilePath)
  if (!fs.existsSync(filePath)) throw new Error(`Missing required ${label}: ${relativeFilePath}`)
  return { label, path: filePath, relativePath: relativeFilePath, data: readJson(filePath), available: true }
}

function walkFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) return []
  const files = []
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(entryPath))
    else if (!reportNameSet.has(entry.name)) files.push(entryPath)
  }
  return files
}

function parseArtifact(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  const contents = fs.readFileSync(filePath, 'utf8')
  if (extension === '.json') return JSON.parse(contents)
  if (extension === '.jsonl') {
    return contents.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        throw new Error(`Invalid JSONL in ${relativePath(filePath)} at line ${index + 1}: ${error.message}`)
      }
    })
  }
  return contents
}

function findOptionalArtifact(label, candidates, filenamePatterns) {
  for (const candidate of candidates) {
    const filePath = path.join(repoRoot, candidate)
    if (fs.existsSync(filePath)) {
      return { label, path: filePath, relativePath: candidate, data: parseArtifact(filePath), available: true }
    }
  }
  const matches = walkFiles(expansionRoot)
    .filter((filePath) => ['.json', '.jsonl', '.md'].includes(path.extname(filePath).toLowerCase()))
    .filter((filePath) => filenamePatterns.some((pattern) => pattern.test(path.basename(filePath))))
    .sort((left, right) => relativePath(left).localeCompare(relativePath(right)))
  if (matches.length > 0) {
    const filePath = matches[0]
    return { label, path: filePath, relativePath: relativePath(filePath), data: parseArtifact(filePath), available: true }
  }
  return { label, relativePath: null, data: null, available: false }
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function firstArray(value, keys) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  for (const key of keys) if (Array.isArray(value[key])) return value[key]
  return []
}

function firstValue(value, keys, fallback = '') {
  if (!value || typeof value !== 'object') return fallback
  for (const key of keys) {
    if (value[key] !== undefined && value[key] !== null && value[key] !== '') return value[key]
  }
  return fallback
}

function normalizedText(value, fallback = 'Not specified') {
  if (Array.isArray(value)) return value.map((entry) => normalizedText(entry, '')).filter(Boolean).join(', ') || fallback
  if (value && typeof value === 'object') return JSON.stringify(value)
  const text = String(value ?? '').replaceAll(/\s+/g, ' ').trim()
  return text || fallback
}

function markdownCell(value) {
  return normalizedText(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function table(headers, rows) {
  if (rows.length === 0) return '_None._'
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ].join('\n')
}

function countBy(values, getKey) {
  const counts = new Map()
  for (const value of values) {
    const key = normalizedText(getKey(value), 'Unspecified')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right))
}

function countTable(values, getKey, label) {
  return table([label, 'Count'], countBy(values, getKey).map(([key, count]) => [key, count]))
}

function workflowRecord(workflow) {
  const identity = workflow.identity ?? workflow
  const governance = workflow.governance ?? {}
  const provenance = workflow.guideline_provenance ?? {}
  return {
    id: normalizedText(firstValue(identity, ['workflow_id', 'id']), 'Unknown workflow'),
    name: normalizedText(firstValue(identity, ['display_name', 'presentation', 'clinician_diagnosis_label', 'name', 'title'])),
    specialty: normalizedText(firstValue(identity, ['specialty_display_name', 'specialty_id', 'specialty'])),
    riskTier: normalizedText(firstValue(governance, ['risk_tier', 'risk_level'])),
    reviewPriority: normalizedText(firstValue(governance, ['review_priority', 'priority'])),
    clinicalReviewStatus: normalizedText(firstValue(governance, ['clinical_review_status', 'review_status'])),
    qaStatus: normalizedText(firstValue(governance, ['automated_qa_status', 'qa_status'])),
    sourceStatus: normalizedText(firstValue(governance, ['source_status'], firstValue(provenance, ['source_mapping_status']))),
    limitedTestingStatus: normalizedText(firstValue(governance, ['limited_testing_status', 'testing_status'])),
    releaseStatus: normalizedText(firstValue(governance, ['public_release_status', 'release_status'])),
    sourceIds: [...new Set([
      ...asArray(provenance.primary_source_ids),
      ...asArray(provenance.supporting_source_ids),
    ].map(String))].sort((left, right) => left.localeCompare(right)),
    duplicateGroupId: normalizedText(firstValue(identity, ['duplicate_group_id']), ''),
    relatedWorkflowIds: asArray(identity.related_workflow_ids).map(String).sort((left, right) => left.localeCompare(right)),
    unresolvedIssues: asArray(governance.unresolved_issues),
    conflictingGuidance: asArray(provenance.conflicting_guidance),
  }
}

function statusRank(value, orderedTerms) {
  const normalized = String(value).toLowerCase()
  const index = orderedTerms.findIndex((term) => normalized.includes(term))
  return index === -1 ? orderedTerms.length : index
}

function sortReviewQueue(left, right) {
  const riskTerms = ['tier_5', 'tier 5', 'tier_4', 'tier 4', 'tier_3', 'tier 3', 'tier_2', 'tier 2', 'tier_1', 'tier 1']
  const priorityTerms = ['critical', 'urgent', 'highest', 'high', 'elevated', 'medium', 'routine', 'low']
  return statusRank(left.riskTier, riskTerms) - statusRank(right.riskTier, riskTerms)
    || statusRank(left.reviewPriority, priorityTerms) - statusRank(right.reviewPriority, priorityTerms)
    || left.id.localeCompare(right.id)
}

function workflowReviewCategoryRank(workflow, finalResultById) {
  const audit = finalResultById.get(workflow.id)
  const p0 = Number(audit?.severity_counts?.P0 ?? 0)
  const p1 = Number(audit?.severity_counts?.P1 ?? 0)
  const searchable = `${workflow.id} ${workflow.name} ${workflow.specialty}`.toLowerCase()
  if (p0) return 0
  if (p1) return 1
  if (/tier[_\s-]?5/i.test(workflow.riskTier)) return 2
  if (/tier[_\s-]?4/i.test(workflow.riskTier)) return 3
  if (workflow.conflictingGuidance.length) return 4
  if (isSourceGap(workflow)) return 5
  if (/paediatric|pediatric|child|neonat/.test(searchable)) return 6
  if (/obstetric|pregnan|postpartum|antenatal/.test(searchable)) return 7
  if (/psychiatr|mental health|suicid|self-harm/.test(searchable)) return 8
  if (/emergency|urgent|acute/.test(searchable)) return 9
  if (/medication|medicine|drug|prescri/.test(searchable)) return 10
  return 11
}

function isApprovedStatus(value) {
  return /(^|[_\s-])(approved|complete|completed|passed|pass)([_\s-]|$)/i.test(String(value))
    && !/(not|unapproved|pending|fail|incomplete)/i.test(String(value))
}

function isSourceGap(workflow) {
  return /gap|missing|unmapped|not[_\s-]?mapped|unverified|uncertain/i.test(workflow.sourceStatus)
    || workflow.sourceIds.length === 0
}

function sourceRegistryRecord(source) {
  return {
    id: normalizedText(firstValue(source, ['id', 'source_id']), 'Unknown source'),
    title: normalizedText(firstValue(source, ['title', 'name'])),
    organisation: normalizedText(firstValue(source, ['organisation', 'organization', 'issuer'])),
  }
}

function exclusionRecord(exclusion) {
  return {
    id: normalizedText(firstValue(exclusion, ['workflow_id', 'id']), 'Unknown workflow'),
    category: normalizedText(firstValue(exclusion, ['proposed_category', 'category', 'testing_status'])),
    rule: normalizedText(firstValue(exclusion, ['triggering_rule', 'rule']), 'Not specified'),
    reason: normalizedText(firstValue(exclusion, ['reason', 'exclusion_reason', 'summary'])),
  }
}

function conflictRecords(data) {
  return firstArray(data, ['conflict_families', 'conflicts', 'entries', 'findings', 'items'])
    .map((conflict, index) => ({
      id: normalizedText(firstValue(conflict, ['conflict_id', 'id']), `conflict-${String(index + 1).padStart(3, '0')}`),
      scope: normalizedText(firstValue(conflict, ['scope', 'category', 'type'])),
      terms: normalizedText(firstValue(conflict, ['terms', 'workflow_ids', 'members', 'items'])),
      resolution: normalizedText(firstValue(conflict, ['resolution', 'recommended_action', 'action', 'summary'])),
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function duplicateRecords(data) {
  return firstArray(data, ['duplicate_groups', 'overlap_groups', 'groups', 'duplicates', 'overlaps', 'entries', 'findings', 'items'])
    .map((group, index) => ({
      id: normalizedText(firstValue(group, ['duplicate_group_id', 'overlap_group_id', 'group_id', 'id']), `group-${String(index + 1).padStart(3, '0')}`),
      type: normalizedText(firstValue(group, ['type', 'classification', 'category']), 'Duplicate or overlap'),
      workflowIds: normalizedText(firstValue(group, ['workflow_ids', 'members', 'workflows', 'ids'])),
      disposition: normalizedText(firstValue(group, ['disposition', 'resolution', 'recommended_action', 'status', 'summary'])),
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function canonicalDuplicateGroups(workflows) {
  const groups = new Map()
  for (const workflow of workflows) {
    if (!workflow.duplicateGroupId) continue
    if (!groups.has(workflow.duplicateGroupId)) groups.set(workflow.duplicateGroupId, [])
    groups.get(workflow.duplicateGroupId).push(workflow.id)
  }
  return [...groups.entries()]
    .filter(([, workflowIds]) => workflowIds.length > 1)
    .map(([id, workflowIds]) => ({ id, workflowIds: workflowIds.sort((left, right) => left.localeCompare(right)) }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function artifactStatus(artifact) {
  if (!artifact.available) return 'Not available'
  if (typeof artifact.data === 'string') return `Available (${artifact.data.split(/\r?\n/).length} lines)`
  if (Array.isArray(artifact.data)) return `Available (${artifact.data.length} records)`
  return normalizedText(firstValue(artifact.data, ['overall_status', 'status', 'result', 'outcome']), 'Available')
}

function artifactMetrics(artifact) {
  if (!artifact.available || !artifact.data || typeof artifact.data !== 'object' || Array.isArray(artifact.data)) return []
  return Object.entries(artifact.data)
    .filter(([key, value]) => /count|total|status|result|outcome|hash|version|date|generated|updated|passed|failed|error|warning/i.test(key)
      && (value === null || ['string', 'number', 'boolean'].includes(typeof value)))
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, 30)
}

function artifactSection(title, artifact) {
  const source = artifact.available ? `\`${artifact.relativePath}\`` : '_Optional input not present._'
  const metrics = artifactMetrics(artifact)
  return [
    `## ${title}`,
    `- Source: ${source}`,
    `- Status: ${artifactStatus(artifact)}`,
    metrics.length > 0 ? table(['Metric', 'Value'], metrics) : '_No scalar summary metrics were available._',
  ].join('\n\n')
}

function reportHeader(title, reportDate) {
  return [`# ${title}`, '', `**Report date:** ${reportDate}`, '', safetyNotice].join('\n')
}

function inputInventory(artifacts) {
  return table(['Input', 'Path', 'Availability'], artifacts.map((artifact) => [
    artifact.label,
    artifact.available ? `\`${artifact.relativePath}\`` : 'Not present',
    artifact.available ? 'Read' : 'Optional input absent',
  ]))
}

const canonical = readRequiredJson('canonical dataset', 'clinical-expansion/canonical/expanded_workflows_v1.json')
const sourceRegistry = readRequiredJson('source registry', 'clinical-expansion/sources/authoritative_source_registry.json')
const proposedExclusions = readRequiredJson('proposed exclusions', 'clinical-expansion/risk/proposed_additional_exclusions.json')
const conflictRegistry = readRequiredJson('conflict registry', 'clinical-expansion/conflicts/conflict_registry.json')
const currentExclusions = readRequiredJson('current limited-testing exclusions', 'public/config/limited_testing_exclusions.json')

const duplicateRegistry = findOptionalArtifact('duplicate/overlap registry', [
  'clinical-expansion/audits/workflow_overlap_registry.json',
  'clinical-expansion/duplicates/duplicate_overlap_registry.json',
  'clinical-expansion/duplicates/duplicate_registry.json',
  'clinical-expansion/overlaps/duplicate_overlap_registry.json',
  'clinical-expansion/conflicts/duplicate_overlap_registry.json',
], [/duplicate.*overlap.*registry/i, /duplicate.*registry/i, /overlap.*registry/i])
const firstAudit = findOptionalArtifact('first audit summary', [
  'clinical-expansion/audits/first_pass_summary.json',
  'clinical-expansion/audits/first_audit_summary.json',
  'clinical-expansion/audits/first_pass_audit_summary.json',
  'clinical-expansion/audit/first_audit_summary.json',
  'clinical-expansion/audit/first_pass_audit_summary.json',
], [/first.*audit.*summary/i, /initial.*audit.*summary/i])
const finalAudit = findOptionalArtifact('final audit summary', [
  'clinical-expansion/audits/final_audit_summary.json',
  'clinical-expansion/audits/final_pass_audit_summary.json',
  'clinical-expansion/audit/final_audit_summary.json',
  'clinical-expansion/audit/final_pass_audit_summary.json',
], [/final.*audit.*summary/i])
const remediationLog = findOptionalArtifact('remediation log', [
  'clinical-expansion/audits/remediation_log.jsonl',
  'clinical-expansion/audits/remediation_log.json',
  'clinical-expansion/audit/remediation_log.jsonl',
  'clinical-expansion/remediation/remediation_log.jsonl',
], [/remediation.*log/i])
const generationManifest = findOptionalArtifact('data generation manifest', [
  'clinical-expansion/migrations/data_generation_manifest.json',
  'clinical-expansion/progress/data_generation_manifest.json',
], [/data.*generation.*manifest/i, /generation.*manifest/i])
const dataDiffSummary = findOptionalArtifact('data diff summary', [
  'clinical-expansion/migrations/data_diff_summary.json',
], [/data.*diff.*summary/i])
const testManifest = findOptionalArtifact('test results manifest', [
  'clinical-expansion/tests/test_results_manifest.json',
  'clinical-expansion/testing/test_results_manifest.json',
  'clinical-expansion/progress/test_results_manifest.json',
  'clinical-expansion/test_results_manifest.json',
], [/test.*results.*manifest/i, /test.*manifest/i])

const artifacts = [canonical, sourceRegistry, proposedExclusions, conflictRegistry, currentExclusions, duplicateRegistry, firstAudit, finalAudit, remediationLog, generationManifest, dataDiffSummary, testManifest]
const workflows = asArray(canonical.data.workflows).map(workflowRecord).sort((left, right) => left.id.localeCompare(right.id))
const sources = firstArray(sourceRegistry.data, ['sources', 'entries', 'items']).map(sourceRegistryRecord).sort((left, right) => left.id.localeCompare(right.id))
const exclusions = firstArray(proposedExclusions.data, ['exclusions', 'proposed_exclusions', 'entries', 'items']).map(exclusionRecord).sort((left, right) => left.id.localeCompare(right.id))
const conflicts = conflictRecords(conflictRegistry.data)
const registeredSourceIds = new Set(sources.map((source) => source.id))
const sourceGaps = workflows.filter(isSourceGap)
const missingRegistryReferences = workflows.flatMap((workflow) => workflow.sourceIds
  .filter((sourceId) => !registeredSourceIds.has(sourceId))
  .map((sourceId) => ({ workflowId: workflow.id, sourceId })))
  .sort((left, right) => left.workflowId.localeCompare(right.workflowId) || left.sourceId.localeCompare(right.sourceId))
const finalResultById = new Map(asArray(finalAudit.data?.results).map((result) => [result.workflow_id, result]))
const reviewQueue = workflows
  .filter((workflow) => !isApprovedStatus(workflow.clinicalReviewStatus))
  .sort((left, right) => workflowReviewCategoryRank(left, finalResultById) - workflowReviewCategoryRank(right, finalResultById) || sortReviewQueue(left, right))
const workflowConflicts = workflows.filter((workflow) => workflow.conflictingGuidance.length > 0)
const registryDuplicates = duplicateRegistry.available ? duplicateRecords(duplicateRegistry.data) : []
const derivedDuplicateGroups = canonicalDuplicateGroups(workflows)
const reportDate = normalizedText(firstValue(canonical.data, ['generation_date'], firstValue(sourceRegistry.data.registry_metadata, ['as_of_date', 'access_date'])), 'Not specified')
const expectedWorkflowCount = Number(canonical.data.workflow_count ?? workflows.length)
const workflowCountMatches = expectedWorkflowCount === workflows.length
const manifestWorkflowCount = generationManifest.available ? Number(firstValue(generationManifest.data, ['workflow_count', 'total_workflows'], Number.NaN)) : Number.NaN
const generationCountMatches = generationManifest.available && Number.isFinite(manifestWorkflowCount) && manifestWorkflowCount === workflows.length
const testStatus = artifactStatus(testManifest)
const testsPassed = testManifest.available && /pass|success|complete/i.test(testStatus) && !/fail|error|not|incomplete/i.test(testStatus)
const currentExclusionEntries = firstArray(currentExclusions.data, ['exclusions', 'entries', 'items'])
const strictSourceGapCount = workflows.filter((workflow) => workflow.sourceStatus === 'source_gap').length
const sourceMappedWithGapsCount = workflows.filter((workflow) => workflow.sourceStatus === 'source_mapped_with_gaps').length
const sourceConflictCount = workflows.filter((workflow) => workflow.sourceStatus === 'conflict_requires_clinician_review' || workflow.conflictingGuidance.length).length
const firstAuditedCount = Number(firstAudit.data?.workflows_audited ?? 0)
const finalAuditedCount = Number(finalAudit.data?.workflows_audited ?? 0)
const finalUnresolvedP0 = Number(finalAudit.data?.unresolved_p0_count ?? 0)
const finalUnresolvedP1 = Number(finalAudit.data?.unresolved_p1_count ?? 0)
const finalCleanPassCount = Number(finalAudit.data?.verdict_distribution?.clean_pass ?? 0)
const finalPassWithReviewCount = Number(finalAudit.data?.verdict_distribution?.pass_with_review_items ?? 0)
const remediationRecords = Array.isArray(remediationLog.data) ? remediationLog.data : []
const remediatedWorkflowCount = new Set(remediationRecords.map((entry) => entry.workflow_id).filter(Boolean)).size
const generatedFileCount = generationManifest.available ? Object.keys(generationManifest.data?.generated_file_hashes ?? {}).length : 0
const testPassCount = Number(testManifest.data?.passed ?? 0)
const testFailCount = Number(testManifest.data?.failed ?? 0)
const readinessBlockers = [
  sourceGaps.length > 0 ? `${sourceGaps.length} workflows have unresolved source gaps` : null,
  reviewQueue.length > 0 ? `${reviewQueue.length} workflows lack recorded clinical approval` : null,
  exclusions.length > 0 ? `${exclusions.length} additional limited-testing exclusions are proposed` : null,
  missingRegistryReferences.length > 0 ? `${missingRegistryReferences.length} source references are absent from the source registry` : null,
  !generationManifest.available ? 'data generation manifest is absent' : null,
  generationManifest.available && !generationCountMatches ? 'data generation manifest workflow count is absent or does not match canonical data' : null,
  !testManifest.available ? 'test results manifest is absent' : null,
  testManifest.available && !testsPassed ? `test results do not demonstrate a passing status (${testStatus})` : null,
].filter(Boolean)

const workflowReport = [
  reportHeader('Final 1500 Workflow Expansion Report', reportDate),
  '## Scope',
  `This report summarizes the deterministic canonical expansion. It inventories ${workflows.length} workflows and ${sources.length} registered sources; it does not validate clinical correctness or authorize testing or release.`,
  '## Core Counts',
  table(['Metric', 'Value'], [
    ['Canonical workflow records', workflows.length],
    ['Declared workflow count', expectedWorkflowCount],
    ['Declared count matches records', workflowCountMatches ? 'Yes' : 'No'],
    ['Registered authoritative sources', sources.length],
    ['Workflows with unresolved source gaps', sourceGaps.length],
    ['Workflows in clinical review queue', reviewQueue.length],
    ['Proposed additional exclusions', exclusions.length],
    ['Conflict registry families', conflicts.length],
  ]),
  '## Specialty Distribution',
  countTable(workflows, (workflow) => workflow.specialty, 'Specialty'),
  '## Risk Distribution',
  countTable(workflows, (workflow) => workflow.riskTier, 'Risk tier'),
  '## Source Status Distribution',
  countTable(workflows, (workflow) => workflow.sourceStatus, 'Source status'),
  '## Clinical Review Distribution',
  countTable(workflows, (workflow) => workflow.clinicalReviewStatus, 'Clinical review status'),
  '## Input Inventory',
  inputInventory(artifacts),
].join('\n\n')

const executiveSummary = [
  reportHeader('Final Executive Summary', reportDate),
  '## Decision',
  `**Deployment readiness: ${readinessBlockers.length === 0 ? 'CONDITIONALLY READY FOR NON-CLINICAL VALIDATION' : 'NOT READY'}**`,
  `**Limited testing: ${sourceGaps.length === 0 ? 'No source-gap blocker detected' : 'BLOCKED for every affected workflow'}**`,
  `The dataset contains ${workflows.length} canonical workflows. ${sourceGaps.length} have source gaps, ${reviewQueue.length} lack recorded clinical approval, and ${exclusions.length} are proposed for additional exclusion.`,
  '## Required Actions',
  readinessBlockers.length > 0 ? readinessBlockers.map((blocker) => `- ${blocker}.`).join('\n') : '- Independently verify all clinical, source, privacy, security, and operational release controls.',
  '## Evidence Availability',
  inputInventory(artifacts),
].join('\n\n')

const clinicalReviewQueue = [
  reportHeader('Final Clinical Review Queue', reportDate),
  '## Queue Policy',
  'Every entry below remains unapproved. Ordering is deterministic: risk tier, review priority, then workflow ID. Source gaps must be resolved before limited testing of the affected workflow.',
  '## Queue Summary',
  table(['Metric', 'Value'], [['Queued workflows', reviewQueue.length], ['Total workflows', workflows.length]]),
  '## Review Queue',
  table(['Workflow ID', 'Workflow', 'Specialty', 'Risk', 'Priority', 'Source status', 'Clinical review', 'Limited testing'], reviewQueue.map((workflow) => [
    workflow.id, workflow.name, workflow.specialty, workflow.riskTier, workflow.reviewPriority, workflow.sourceStatus, workflow.clinicalReviewStatus, workflow.limitedTestingStatus,
  ])),
].join('\n\n')

const sourceGapReport = [
  reportHeader('Final Source Gap Report', reportDate),
  '## Summary',
  `The source registry contains ${sources.length} entries. ${sourceGaps.length} workflows have an unresolved or inferred source gap. These gaps block limited testing for each affected workflow.`,
  '## Missing Registry References',
  table(['Workflow ID', 'Unregistered source ID'], missingRegistryReferences.map((entry) => [entry.workflowId, entry.sourceId])),
  '## Affected Workflows',
  table(['Workflow ID', 'Workflow', 'Specialty', 'Risk', 'Source status', 'Mapped source IDs'], sourceGaps.map((workflow) => [
    workflow.id, workflow.name, workflow.specialty, workflow.riskTier, workflow.sourceStatus, workflow.sourceIds,
  ])),
].join('\n\n')

const sourceConflictReport = [
  reportHeader('Final Source Conflict Report', reportDate),
  '## Registry Conflicts',
  table(['Conflict ID', 'Scope', 'Terms or members', 'Required resolution'], conflicts.map((conflict) => [conflict.id, conflict.scope, conflict.terms, conflict.resolution])),
  '## Workflow-Level Conflicting Guidance',
  table(['Workflow ID', 'Workflow', 'Conflicting guidance'], workflowConflicts.map((workflow) => [
    workflow.id, workflow.name, workflow.conflictingGuidance.map((entry) => normalizedText(entry)),
  ])),
  '## Control',
  'Conflict registry entries are safety controls, not clinical resolutions. A qualified reviewer must resolve applicable guidance in its jurisdiction, population, setting, version, and date context before approval.',
].join('\n\n')

const exclusionsReport = [
  reportHeader('Final Additional Exclusions Report', reportDate),
  '## Summary',
  `${exclusions.length} additional exclusions are proposed. A proposal is not approval, and omission from this list is not evidence that a workflow is safe for testing.`,
  '## Proposed Exclusions',
  table(['Workflow ID', 'Category', 'Triggering rule', 'Reason'], exclusions.map((exclusion) => [exclusion.id, exclusion.category, exclusion.rule, exclusion.reason])),
].join('\n\n')

const duplicateReport = [
  reportHeader('Final Duplicate Workflow Report', reportDate),
  '## Registry Status',
  duplicateRegistry.available
    ? `Duplicate/overlap registry read from \`${duplicateRegistry.relativePath}\`; ${registryDuplicates.length} groups were found.`
    : 'No optional duplicate/overlap registry was present. Canonical duplicate-group identifiers are summarized as a fallback and must not be treated as adjudicated duplicates.',
  '## Registry Groups',
  table(['Group ID', 'Type', 'Workflow IDs', 'Disposition'], registryDuplicates.map((group) => [group.id, group.type, group.workflowIds, group.disposition])),
  '## Canonical Multi-Workflow Groups',
  table(['Duplicate group ID', 'Count', 'Workflow IDs'], derivedDuplicateGroups.map((group) => [group.id, group.workflowIds.length, group.workflowIds])),
].join('\n\n')

const dataDiffReport = [
  reportHeader('Final Data Diff Report', reportDate),
  '## Canonical Integrity',
  table(['Check', 'Result'], [
    ['Declared canonical count matches records', workflowCountMatches ? 'Pass' : 'Fail'],
    ['Generation manifest available', generationManifest.available ? 'Yes' : 'No'],
    ['Generation manifest count matches canonical', generationCountMatches ? 'Pass' : 'Not demonstrated'],
  ]),
  artifactSection('First Audit Summary', firstAudit),
  artifactSection('Final Audit Summary', finalAudit),
  artifactSection('Remediation Log', remediationLog),
  artifactSection('Data Generation Manifest', generationManifest),
  artifactSection('Canonical-to-Application Data Diff', dataDiffSummary),
  '## Interpretation',
  'This report records available machine artifacts only. An absent audit, remediation log, or generation manifest remains unknown rather than being interpreted as zero changes or a passing result.',
].join('\n\n')

const testReport = [
  reportHeader('Final Test Report', reportDate),
  '## Overall Result',
  `**${testsPassed ? 'PASS RECORDED — NOT CLINICAL APPROVAL' : 'PASS NOT DEMONSTRATED'}**`,
  artifactSection('Test Results Manifest', testManifest),
  '## Interpretation',
  'Automated tests can demonstrate specified technical checks only. They do not establish clinical validity, source completeness, patient safety, or approval for limited testing or deployment.',
].join('\n\n')

const deploymentReport = [
  reportHeader('Final Deployment Readiness Report', reportDate),
  '## Readiness Decision',
  `**${readinessBlockers.length === 0 ? 'CONDITIONALLY READY FOR NON-CLINICAL VALIDATION ONLY' : 'NOT READY FOR DEPLOYMENT'}**`,
  '## Blocking Conditions',
  readinessBlockers.length > 0 ? readinessBlockers.map((blocker) => `- ${blocker}.`).join('\n') : '- No machine-detected blocker remains; independent human release review is still mandatory.',
  '## Gate Matrix',
  table(['Gate', 'Result'], [
    ['Canonical workflow count', workflowCountMatches ? 'Pass' : 'Fail'],
    ['Source-gap resolution', sourceGaps.length === 0 ? 'Pass' : `Blocked (${sourceGaps.length})`],
    ['Clinical approval', reviewQueue.length === 0 ? 'Recorded for all' : `Not recorded (${reviewQueue.length})`],
    ['Additional exclusions', exclusions.length === 0 ? 'None proposed' : `Review required (${exclusions.length})`],
    ['Generation reproducibility evidence', generationCountMatches ? 'Count matches' : 'Not demonstrated'],
    ['Automated test evidence', testsPassed ? 'Pass recorded' : 'Pass not demonstrated'],
  ]),
  '## Non-Negotiable Boundary',
  'No report produced by this script grants clinical approval. Workflows with unresolved source gaps remain blocked from limited testing, and public release requires separate qualified clinical, governance, security, privacy, and operational authorization.',
].join('\n\n')

const dashboard = [
  reportHeader('Clinical Expansion Dashboard', reportDate),
  '## Current Status',
  table(['Indicator', 'Value', 'Status'], [
    ['Canonical workflows', workflows.length, workflowCountMatches ? 'Count consistent' : 'Count mismatch'],
    ['Specialties', new Set(workflows.map((workflow) => workflow.specialty)).size, 'Inventory complete'],
    ['Authoritative source-family mappings', sourceMappedWithGapsCount, 'Workflow-level applicability remains incomplete'],
    ['Strict source gaps', strictSourceGapCount, strictSourceGapCount === 0 ? 'Clear' : 'Blocks affected workflows'],
    ['Source conflicts', sourceConflictCount, sourceConflictCount === 0 ? 'None recorded' : 'Clinician review required'],
    ['Expanded workflows', workflows.length, workflowCountMatches ? 'Complete' : 'Count mismatch'],
    ['First-pass workflows audited', firstAuditedCount, firstAuditedCount === workflows.length ? 'Complete' : 'Incomplete'],
    ['Workflows remediated', remediatedWorkflowCount, 'Deterministic safety remediation only'],
    ['Final-audit workflows audited', finalAuditedCount, finalAuditedCount === workflows.length ? 'Complete' : 'Incomplete'],
    ['Clean final pass', finalCleanPassCount, sourceGaps.length ? 'Source/review blockers remain' : 'Review result'],
    ['Final pass with review items', finalPassWithReviewCount, 'Not clinical approval'],
    ['Unresolved P0', finalUnresolvedP0, finalUnresolvedP0 === 0 ? 'Clear' : 'Blocked'],
    ['Unresolved P1', finalUnresolvedP1, finalUnresolvedP1 === 0 ? 'Clear' : 'Blocked'],
    ['Clinical review queue', reviewQueue.length, reviewQueue.length === 0 ? 'Clear' : 'Approval not recorded'],
    ['Current limited-testing exclusions', currentExclusionEntries.length, 'Original exclusions preserved; high-risk additions applied'],
    ['Proposed additional exclusions', exclusions.length, exclusions.length === 0 ? 'None' : 'Review required'],
    ['Preset conflict families', conflicts.length, conflicts.length === 0 ? 'None recorded' : 'Bulk preselection removed'],
    ['Duplicate/overlap groups', registryDuplicates.length, duplicateRegistry.available ? 'Review registry available' : 'Optional input absent'],
    ['Generated application files', generatedFileCount, generationCountMatches ? 'Reproducible' : 'Not demonstrated'],
    ['Tests passed', testPassCount, testsPassed ? 'Technical pass recorded' : 'Pass not demonstrated'],
    ['Tests failed', testFailCount, testFailCount === 0 ? 'Clear' : 'Fix required'],
    ['Generation manifest', generationManifest.available ? 'Available' : 'Absent', generationCountMatches ? 'Count matches' : 'Not demonstrated'],
    ['Test results', testStatus, testsPassed ? 'Pass recorded; not clinical approval' : 'Pass not demonstrated'],
    ['Deployment', readinessBlockers.length === 0 ? 'Conditional non-clinical validation only' : 'Not ready', readinessBlockers.length === 0 ? 'Human gates remain' : `${readinessBlockers.length} blockers`],
  ]),
  '## Workflows per Specialty',
  countTable(workflows, (workflow) => workflow.specialty, 'Specialty'),
  '## Workflows per Risk Tier',
  countTable(workflows, (workflow) => workflow.riskTier, 'Risk tier'),
  '## Report Index',
  reportNames.filter((name) => name !== 'CLINICAL_EXPANSION_DASHBOARD.md').map((name) => `- [${name}](./${name})`).join('\n'),
].join('\n\n')

const reports = {
  'FINAL_1500_WORKFLOW_EXPANSION_REPORT.md': workflowReport,
  'FINAL_EXECUTIVE_SUMMARY.md': executiveSummary,
  'FINAL_CLINICAL_REVIEW_QUEUE.md': clinicalReviewQueue,
  'FINAL_SOURCE_GAP_REPORT.md': sourceGapReport,
  'FINAL_SOURCE_CONFLICT_REPORT.md': sourceConflictReport,
  'FINAL_ADDITIONAL_EXCLUSIONS_REPORT.md': exclusionsReport,
  'FINAL_DUPLICATE_WORKFLOW_REPORT.md': duplicateReport,
  'FINAL_DATA_DIFF_REPORT.md': dataDiffReport,
  'FINAL_TEST_REPORT.md': testReport,
  'FINAL_DEPLOYMENT_READINESS_REPORT.md': deploymentReport,
  'CLINICAL_EXPANSION_DASHBOARD.md': dashboard,
}

for (const reportName of reportNames) writeText(path.join(expansionRoot, reportName), reports[reportName])

console.log(JSON.stringify({
  reportDate,
  workflowCount: workflows.length,
  sourceGapCount: sourceGaps.length,
  clinicalReviewQueueCount: reviewQueue.length,
  deploymentReadiness: readinessBlockers.length === 0 ? 'conditional_non_clinical_validation_only' : 'not_ready',
  generatedReports: reportNames.map((reportName) => `clinical-expansion/${reportName}`),
}, null, 2))

import path from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  ALLOWED_ORIGINS,
  ALLOWED_SOURCE_STATUSES,
  BASELINE_COMMIT,
  EXPANSION_DIR,
  PROHIBITED_GENERIC_PATTERNS,
  RESEARCH_TIME_ZONE,
  ROOT_DIR,
  VERIFICATION_DATE,
  assert,
  fileSha256,
  getResearchPaths,
  getWorkflowPaths,
  hashWithout,
  listClinicalItems,
  printResult,
  readJson,
  readJsonl,
} from './common.mjs'
import { readDerivedUnsupportedLegacyRows } from './canonicalMappingReconciliation.mjs'
import { sourceDateSemanticsErrors } from './sourceDateSemantics.mjs'

const check = process.argv[2]
const errors = []
const workflowPaths = getWorkflowPaths()
const researchPaths = getResearchPaths()
const workflows = workflowPaths.map((filePath) => readJson(filePath))
const research = researchPaths.map((filePath) => readJson(filePath))
const workflowById = new Map(workflows.map((entry) => [entry.workflow_id, entry]))
const researchById = new Map(research.map((entry) => [entry.workflow_id, entry]))

function loadSourceRegistry() {
  const files = [
    'uae_clinical_sources.json',
    'international_clinical_sources.json',
    'specialty_society_sources.json',
    'nonclinical_operational_sources.json',
  ]
  const sources = files.flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
  for (const source of sources) {
    for (const dateError of sourceDateSemanticsErrors(source)) {
      assert(false, `${source.source_id}: ${dateError}.`, errors)
    }
  }
  return new Map(sources.map((source) => [source.source_id, source]))
}

function sourceEvidenceCheck() {
  const sources = loadSourceRegistry()
  const requiredFields = [
    'workflow_id',
    'presentation',
    'specialty',
    'research_started_at',
    'research_completed_at',
    'search_queries_used',
    'official_pages_opened',
    'exact_documents_opened',
    'exact_sections_reviewed',
    'candidate_sources_rejected',
    'rejection_reasons',
    'selected_primary_sources',
    'selected_supporting_sources',
    'population_applicability',
    'setting_applicability',
    'UAE_applicability',
    'recency_verification',
    'superseded_check',
    'evidence_items',
    'source_status',
    'unresolved_source_gaps',
    'researcher_type',
    'evidence_hash',
  ]

  assert(research.length === 1500, `Expected 1500 research records, found ${research.length}.`, errors)
  for (const record of research) {
    for (const field of requiredFields) assert(Object.hasOwn(record, field), `${record.workflow_id}: missing ${field}.`, errors)
    assert(ALLOWED_SOURCE_STATUSES.has(record.source_status), `${record.workflow_id}: invalid source_status ${record.source_status}.`, errors)
    assert(record.evidence_hash === hashWithout(record, ['evidence_hash']), `${record.workflow_id}: evidence hash mismatch.`, errors)
    const claimsEvidence = ['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(record.source_status)
    if (claimsEvidence) {
      assert(record.exact_documents_opened.length > 0, `${record.workflow_id}: evidence claim has no exact document.`, errors)
      assert(record.exact_sections_reviewed.length > 0, `${record.workflow_id}: evidence claim has no exact section.`, errors)
      for (const sourceId of record.exact_documents_opened) {
        assert(sources.has(sourceId), `${record.workflow_id}: unknown exact source ${sourceId}.`, errors)
      }
      for (const sectionId of record.exact_sections_reviewed) {
        const matchingSource = [...sources.values()].find((source) => source.exact_sections?.some((section) => section.section_id === sectionId))
        assert(Boolean(matchingSource), `${record.workflow_id}: unknown exact source section ${sectionId}.`, errors)
      }
    }
    if (record.source_status === 'partial_exact_source_verified') {
      assert(record.unresolved_source_gaps.length > 0, `${record.workflow_id}: partial evidence must retain a source gap.`, errors)
    }
    for (const evidenceItem of record.evidence_items ?? []) {
      const source = sources.get(evidenceItem.source_id)
      assert(Boolean(source), `${record.workflow_id}: evidence item uses unknown source ${evidenceItem.source_id}.`, errors)
      assert(Boolean(source?.exact_sections?.some((section) => section.section_id === evidenceItem.source_section_id)), `${record.workflow_id}: evidence item uses unknown section ${evidenceItem.source_section_id}.`, errors)
    }
  }
  printResult(check, errors, { research_records: research.length, registered_sources: sources.size })
}

function itemProvenanceCheck() {
  let itemCount = 0
  let sourceDerivedCount = 0
  for (const workflow of workflows) {
    const ids = new Set()
    for (const item of listClinicalItems(workflow)) {
      itemCount += 1
      assert(!ids.has(item.item_id), `${workflow.workflow_id}: duplicate item ID ${item.item_id}.`, errors)
      ids.add(item.item_id)
      assert(ALLOWED_ORIGINS.has(item.origin), `${item.item_id}: prohibited origin ${item.origin}.`, errors)
      assert(item.clinician_confirmation_required === true, `${item.item_id}: clinician confirmation is not required.`, errors)
      assert(item.default_selected === false, `${item.item_id}: item is default-selected.`, errors)
      assert(Array.isArray(item.source_ids), `${item.item_id}: source_ids must be an array.`, errors)
      assert(Array.isArray(item.source_section_ids), `${item.item_id}: source_section_ids must be an array.`, errors)
      if (item.origin === 'source_derived') {
        sourceDerivedCount += 1
        assert(item.source_ids.length > 0, `${item.item_id}: source-derived item has no source.`, errors)
        assert(item.source_section_ids.length > 0, `${item.item_id}: source-derived item has no exact section.`, errors)
      }
    }
  }
  printResult(check, errors, { workflows: workflows.length, clinical_items: itemCount, source_derived_items: sourceDerivedCount })
}

function noGenericTemplatesCheck() {
  const matches = []
  for (const workflow of workflows) {
    for (const item of listClinicalItems(workflow)) {
      for (const pattern of PROHIBITED_GENERIC_PATTERNS) {
        if (pattern.test(item.text) || pattern.test(item.output_text ?? '')) {
          matches.push({ workflow_id: workflow.workflow_id, item_id: item.item_id, origin: item.origin, text: item.text })
        }
      }
    }
  }
  assert(matches.length === 0, `Detected ${matches.length} prohibited title-substitution item(s).`, errors)
  printResult(check, errors, { generic_generated_item_count: matches.length, sample_matches: matches.slice(0, 20) })
}

function exactCoverageCheck() {
  const counts = Object.fromEntries([...ALLOWED_SOURCE_STATUSES].map((status) => [status, 0]))
  for (const record of research) counts[record.source_status] += 1
  const clinicalBlockers = research.filter((record) => record.source_status !== 'exact_workflow_source_verified' || record.unresolved_source_gaps.length > 0)
  assert(clinicalBlockers.length === 0, `${clinicalBlockers.length} workflow(s) lack complete exact-source coverage.`, errors)
  printResult(check, errors, { source_status_counts: counts, clinical_blockers: clinicalBlockers.length })
}

function sourceRecencyCheck() {
  const sources = loadSourceRegistry()
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: RESEARCH_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date()).map(({ type, value }) => [type, value]),
  )
  const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`
  for (const source of sources.values()) {
    const verifiedOn = source.recency_verification?.verified_on ?? ''
    assert(/^https:\/\//.test(source.exact_official_url), `${source.source_id}: malformed official URL.`, errors)
    assert(Boolean(source.publication_date), `${source.source_id}: publication date missing.`, errors)
    assert(Boolean(source.version), `${source.source_id}: version missing.`, errors)
    assert(/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn), `${source.source_id}: recency verification date is invalid.`, errors)
    assert(verifiedOn >= VERIFICATION_DATE && verifiedOn <= today, `${source.source_id}: recency was not verified during the active research mission.`, errors)
    assert(!/superseded/i.test(source.superseded_status_check?.status ?? ''), `${source.source_id}: source is marked superseded.`, errors)
  }
  printResult(check, errors, { exact_sources_checked: sources.size })
}

function uaeApplicabilityCheck() {
  const evidenced = research.filter((record) => ['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(record.source_status))
  const findings = readJsonl(path.join(EXPANSION_DIR, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl'))
  const allowedFindingTypes = new Set(['partial_applicability', 'missing_explicit_uae_evidence', 'other'])
  const seen = new Set()
  for (const finding of findings) {
    const key = `${finding.workflow_id}\u0000${finding.finding_type}`
    assert(!seen.has(key), `${finding.workflow_id}: duplicate structured UAE finding ${finding.finding_type}.`, errors)
    seen.add(key)
    assert(allowedFindingTypes.has(finding.finding_type), `${finding.workflow_id}: invalid structured UAE finding type.`, errors)
    const record = researchById.get(finding.workflow_id)
    assert(Boolean(record), `${finding.workflow_id}: structured UAE finding has no research record.`, errors)
    assert(['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(record?.source_status), `${finding.workflow_id}: structured UAE finding is not attached to an evidenced workflow.`, errors)
    if (finding.finding_type === 'partial_applicability') {
      assert(record?.source_status === 'partial_exact_source_verified', `${finding.workflow_id}: partial finding does not match source status.`, errors)
    }
    errors.push(`${finding.workflow_id}: structured UAE applicability blocker ${finding.finding_type}.`)
  }
  for (const record of evidenced.filter((entry) => entry.source_status === 'partial_exact_source_verified')) {
    assert(seen.has(`${record.workflow_id}\u0000partial_applicability`), `${record.workflow_id}: missing structured partial-applicability finding.`, errors)
  }
  printResult(check, errors, {
    evidenced_workflows: evidenced.length,
    affected_workflows: new Set(findings.map((finding) => finding.workflow_id)).size,
    structured_findings: findings.length,
    partial_applicability_findings: findings.filter((finding) => finding.finding_type === 'partial_applicability').length,
    missing_explicit_uae_evidence_findings: findings.filter((finding) => finding.finding_type === 'missing_explicit_uae_evidence').length,
    other_findings: findings.filter((finding) => finding.finding_type === 'other').length,
  })
}

function unsupportedLegacyCheck() {
  const rows = readDerivedUnsupportedLegacyRows()
  assert(rows.length === 0, `${rows.length} unsupported legacy clinical item(s) require source mapping and clinician review.`, errors)
  printResult(check, errors, { unsupported_legacy_items: rows.length })
}

function clinicalItemDiffCheck() {
  const diffRows = readJsonl(path.join(EXPANSION_DIR, 'reports', 'clinical_item_diff.jsonl'))
  const sourceDerivedItems = workflows.flatMap(listClinicalItems).filter((item) => item.origin === 'source_derived')
  assert(diffRows.length === sourceDerivedItems.length, `Clinical diff rows (${diffRows.length}) do not match source-derived items (${sourceDerivedItems.length}).`, errors)
  for (const row of diffRows) {
    for (const field of ['workflow_id', 'old_text', 'new_text', 'reason', 'source_id', 'exact_section', 'change_type', 'review_requirement']) {
      assert(Object.hasOwn(row, field), `Clinical diff row missing ${field}.`, errors)
    }
  }
  printResult(check, errors, { clinical_item_diff_rows: diffRows.length, source_derived_items: sourceDerivedItems.length })
}

function researchClaimsCheck() {
  const ledger = readJsonl(path.join(EXPANSION_DIR, 'audits', 'workflow_audit_ledger.jsonl'))
  const ledgerById = new Map(ledger.map((row) => [row.workflow_id, row]))
  for (const record of research) {
    const claimsResearch = record.research_completed_at !== null
    const exactSourceStatus = ['exact_workflow_source_verified', 'partial_exact_source_verified'].includes(record.source_status)
    if (claimsResearch && exactSourceStatus) {
      assert(record.exact_documents_opened.length > 0, `${record.workflow_id}: completed research has no exact document.`, errors)
      assert(record.exact_sections_reviewed.length > 0, `${record.workflow_id}: completed research has no exact section.`, errors)
    }
    if (claimsResearch && record.source_status === 'no_authoritative_source_found') {
      assert(record.search_queries_used.length > 0, `${record.workflow_id}: no-source result has no recorded search queries.`, errors)
      assert(record.candidate_sources_rejected.length > 0, `${record.workflow_id}: no-source result has no rejected candidates.`, errors)
      assert(record.rejection_reasons.length > 0, `${record.workflow_id}: no-source result has no rejection reasons.`, errors)
      assert(record.exact_documents_opened.length === 0, `${record.workflow_id}: no-source result claims an exact document.`, errors)
      assert(record.exact_sections_reviewed.length === 0, `${record.workflow_id}: no-source result claims an exact section.`, errors)
      assert(record.evidence_items.length === 0, `${record.workflow_id}: no-source result contains evidence items.`, errors)
      assert(record.unresolved_source_gaps.length > 0, `${record.workflow_id}: no-source result has no unresolved source gap.`, errors)
    }
    if (claimsResearch && record.source_status === 'conflicting_authoritative_sources') {
      assert(record.exact_documents_opened.length > 1, `${record.workflow_id}: conflicting-source result must record at least two exact documents.`, errors)
      assert(record.exact_sections_reviewed.length > 1, `${record.workflow_id}: conflicting-source result must record the reviewed sections.`, errors)
      assert(record.unresolved_source_gaps.length > 0, `${record.workflow_id}: conflicting-source result has no unresolved conflict.`, errors)
    }
    if (claimsResearch && record.source_status === 'source_access_failed') {
      assert(record.search_queries_used.length > 0, `${record.workflow_id}: source-access failure has no recorded search queries.`, errors)
      assert(record.rejection_reasons.length > 0, `${record.workflow_id}: source-access failure has no recorded access reason.`, errors)
      assert(record.unresolved_source_gaps.length > 0, `${record.workflow_id}: source-access failure has no unresolved source gap.`, errors)
    }
    assert(!['source_family_only', 'registry_screened', 'keyword_mapped'].includes(record.source_status), `${record.workflow_id}: prohibited research status.`, errors)
    const ledgerRow = ledgerById.get(record.workflow_id)
    assert(Boolean(ledgerRow), `${record.workflow_id}: missing audit ledger row.`, errors)
    if (record.unresolved_source_gaps.length > 0) {
      assert(ledgerRow?.source_gap_marked_as_pass === false, `${record.workflow_id}: source gap is marked as pass.`, errors)
      assert(ledgerRow?.audit_status !== 'pass', `${record.workflow_id}: source gap has a clean audit pass.`, errors)
    }
  }
  printResult(check, errors, { research_claims_checked: research.length })
}

function allWorkflowsCheck() {
  const baseline = readJson('public/data/clinical_workflows.json')
  const baselineIds = new Set((Array.isArray(baseline) ? baseline : Object.values(baseline)).map((entry) => entry.workflow_id))
  assert(workflows.length === 1500, `Expected 1500 workflow overlays, found ${workflows.length}.`, errors)
  assert(research.length === 1500, `Expected 1500 research records, found ${research.length}.`, errors)
  assert(workflowById.size === 1500, `Workflow overlay IDs are not unique (${workflowById.size}).`, errors)
  assert(researchById.size === 1500, `Research record IDs are not unique (${researchById.size}).`, errors)
  for (const workflowId of baselineIds) {
    assert(workflowById.has(workflowId), `Missing workflow overlay ${workflowId}.`, errors)
    assert(researchById.has(workflowId), `Missing research record ${workflowId}.`, errors)
  }
  printResult(check, errors, { baseline_workflows: baselineIds.size, overlays: workflows.length, research_records: research.length })
}

async function outputSafetyCheck() {
  const { buildDetailedOutputs, buildQuickOutputs } = await import('../../src/lib/outputBuilders.ts')
  const fakeWorkflow = { summary: { workflowId: 'test', title: 'Test', specialty: 'General Medicine / GP', aliases: [], searchText: '' } }
  const empty = buildQuickOutputs({
    workflow: fakeWorkflow,
    duration: '',
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExam: [],
    selectedPlanItems: [],
    additionalHistory: '',
    assessment: '',
    plan: '',
  })
  assert(empty.soap === '' && empty.emr === '', 'Unconfirmed empty Quick Note produced output.', errors)
  const populated = buildQuickOutputs({
    workflow: fakeWorkflow,
    duration: '2 days',
    selectedSymptoms: ['cough'],
    selectedNegatives: ['no chest pain'],
    selectedExam: ['Examination: chest clear'],
    selectedPlanItems: ['Plan: follow-up discussed'],
    additionalHistory: 'History: clinician-entered context',
    assessment: 'Impression: clinician-entered impression',
    plan: '',
  })
  assert(!/Examination:\s*Examination:/i.test(populated.soap), 'SOAP duplicates an examination label.', errors)
  assert(!/Plan:\s*Plan:/i.test(populated.soap), 'SOAP duplicates a plan label.', errors)
  assert(populated.soap !== populated.emr, 'SOAP and EMR formats are not distinct.', errors)
  for (const fact of ['cough', 'no chest pain', 'chest clear', 'follow-up discussed']) {
    assert(populated.soap.toLowerCase().includes(fact), `SOAP lost confirmed fact: ${fact}.`, errors)
    assert(populated.emr.toLowerCase().includes(fact), `EMR lost confirmed fact: ${fact}.`, errors)
  }
  const detailed = buildDetailedOutputs({
    workflow: fakeWorkflow,
    historyValues: {},
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExamPrompts: [],
    selectedInvestigations: [],
    assessment: '',
    plan: '',
    selectedPlanItems: [],
    referralReason: '',
    patientInstructions: '',
  })
  assert(!detailed.hasMeaningfulContent, 'Empty detailed encounter produced meaningful output.', errors)
  printResult(check, errors, { output_builder_checks: 10 })
}

function exclusionsCheck() {
  const exclusions = readJson('public/config/limited_testing_exclusions.json').exclusions ?? []
  const proposed = readJson(path.join(EXPANSION_DIR, 'review', 'proposed_additional_exclusions.json'))
  assert(exclusions.length === 12, `Expected 12 active exclusions, found ${exclusions.length}.`, errors)
  assert(proposed.active_exclusions_unchanged === true, 'Proposed exclusions imply an active configuration change.', errors)
  assert(Array.isArray(proposed.proposed_exclusions), 'Proposed exclusion list is malformed.', errors)
  printResult(check, errors, { active_exclusions: exclusions.length, proposed_exclusions: proposed.proposed_exclusions.length })
}

function sourceEvidenceHashesCheck() {
  const manifest = readJson(path.join(EXPANSION_DIR, 'hash_manifest.json'))
  for (const workflow of workflows) {
    assert(manifest.workflow_hashes[workflow.workflow_id] === hashWithout(workflow, ['content_hash']), `${workflow.workflow_id}: workflow hash manifest mismatch.`, errors)
  }
  for (const record of research) {
    assert(manifest.research_hashes[record.workflow_id] === hashWithout(record, ['evidence_hash']), `${record.workflow_id}: evidence hash manifest mismatch.`, errors)
  }
  for (const [indexName, expectedHash] of Object.entries(manifest.index_hashes)) {
    const index = readJson(path.join(EXPANSION_DIR, 'indexes', indexName))
    assert(expectedHash === hashWithout(index, ['index_hash']), `${indexName}: index hash manifest mismatch.`, errors)
  }
  assert(manifest.manifest_hash === hashWithout(manifest, ['manifest_hash']), 'Hash manifest self-hash mismatch.', errors)
  printResult(check, errors, { workflow_hashes: workflows.length, evidence_hashes: research.length, index_hashes: Object.keys(manifest.index_hashes).length })
}

function clinicalDataReproducibilityCheck() {
  loadSourceRegistry()
  const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
  for (const [relativePath, expectedHash] of Object.entries(manifest.baseline_file_hashes ?? {})) {
    assert(fileSha256(path.join(ROOT_DIR, relativePath)) === expectedHash, `${relativePath}: stable baseline file changed.`, errors)
  }
  const diff = spawnSync('git', ['diff', '--quiet', BASELINE_COMMIT, '--', 'public/data', 'public/config/limited_testing_exclusions.json'], { cwd: ROOT_DIR })
  assert(diff.status === 0, 'Active public clinical data or exclusion configuration differs from stable main.', errors)
  printResult(check, errors, { baseline_files_checked: Object.keys(manifest.baseline_file_hashes ?? {}).length, public_data_changed: diff.status !== 0 })
}

const checks = {
  'source-evidence': sourceEvidenceCheck,
  'item-provenance': itemProvenanceCheck,
  'no-generic-templates': noGenericTemplatesCheck,
  'exact-source-coverage': exactCoverageCheck,
  'source-recency': sourceRecencyCheck,
  'uae-applicability': uaeApplicabilityCheck,
  'unsupported-legacy-content': unsupportedLegacyCheck,
  'clinical-item-diff': clinicalItemDiffCheck,
  'research-claims': researchClaimsCheck,
  'all-workflows': allWorkflowsCheck,
  'output-safety': outputSafetyCheck,
  exclusions: exclusionsCheck,
  'source-evidence-hashes': sourceEvidenceHashesCheck,
  'clinical-data-reproducibility': clinicalDataReproducibilityCheck,
}

if (!checks[check]) {
  console.error(`Unknown source-first check: ${check}`)
  console.error(`Available checks: ${Object.keys(checks).join(', ')}`)
  process.exit(2)
}

await checks[check]()

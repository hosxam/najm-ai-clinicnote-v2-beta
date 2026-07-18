import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  getResearchPaths,
  getWorkflowPaths,
  listClinicalItems,
  readJson,
  writeJson,
  writeTextAtomic,
} from './common.mjs'
import {
  CANDIDATE_MAPPING_PROPOSAL_DIRECTORY,
  CANONICAL_MAPPING_DIRECTORY,
} from './canonicalMappingContract.mjs'
import {
  candidateProposalDocument,
  writeCandidateProposalDocument,
} from './candidateMappingProposalStore.mjs'

export const PILOT_ID = 'clinician-review-item-mapping-pilot-001'
export const PILOT_DIRECTORY = path.join(EXPANSION_DIR, 'clinician-review', 'pilot-001')
export const PILOT_MANIFEST_PATH = path.join(PILOT_DIRECTORY, 'PILOT_WORKFLOW_MANIFEST.json')
export const PILOT_ITEMS_JSON_PATH = path.join(PILOT_DIRECTORY, 'CLINICIAN_REVIEW_ITEMS.json')
export const PILOT_ITEMS_CSV_PATH = path.join(PILOT_DIRECTORY, 'CLINICIAN_REVIEW_ITEMS.csv')
export const PILOT_ACCOUNTING_PATH = path.join(PILOT_DIRECTORY, 'PILOT_ACCOUNTING.json')
export const PILOT_WORKFLOW_DIRECTORY = path.join(PILOT_DIRECTORY, 'workflows')
export const PILOT_SIZE = 25

const AUTHORITY = Object.freeze({
  generated_for: 'qualified_clinician_review',
  approval_status: 'not_approved',
  production_use: 'prohibited_until_qualified_clinician_approval_and_existing_signing_controls_complete',
  autonomous_treatment_recommendation: false,
  dose_invention: false,
  diagnosis_invention: false,
  expansion_beyond_cited_evidence: false,
})

const SUPPORT_MODULE_PATHS = Object.freeze([
  path.join(ROOT_DIR, 'scripts', 'source-first', 'batches', 'batch-0006-0015.mjs'),
  path.join(ROOT_DIR, 'scripts', 'source-first', 'batches', 'batch-0016-0025.mjs'),
])

function candidateFileNames() {
  if (!fs.existsSync(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY)) return new Set()
  return new Set(fs.readdirSync(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY)
    .filter((name) => name.endsWith('.candidate.json'))
    .map((name) => name.slice(0, -'.candidate.json'.length)))
}

function canonicalWorkflowIds() {
  if (!fs.existsSync(CANONICAL_MAPPING_DIRECTORY)) return new Set()
  return new Set(fs.readdirSync(CANONICAL_MAPPING_DIRECTORY)
    .filter((name) => name.endsWith('.json') && name !== 'APPROVED_MANIFEST.json')
    .map((name) => name.slice(0, -'.json'.length)))
}

function proposedExclusions() {
  const value = readJson(path.join(EXPANSION_DIR, 'review', 'proposed_additional_exclusions.json'))
  return new Set((value.proposed_exclusions ?? []).map((entry) => entry.workflow_id ?? entry))
}

function researchMap() {
  return new Map(getResearchPaths().map((filePath) => {
    const record = readJson(filePath)
    return [record.workflow_id, record]
  }))
}

function uaeFindingMap() {
  const findingsPath = path.join(EXPANSION_DIR, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl')
  const rows = fs.readFileSync(findingsPath, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse)
  const result = new Map()
  for (const row of rows) {
    const values = result.get(row.workflow_id) ?? []
    values.push(row.finding_type)
    result.set(row.workflow_id, values)
  }
  return result
}

function hasUnresolvedHighPriorityIssue(workflowId) {
  const paths = [
    path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`),
    path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`),
  ]
  return paths.some((filePath) => /"(?:priority|severity)"\s*:\s*"P[01]"/i.test(fs.readFileSync(filePath, 'utf8')))
}

export function selectPilotWorkflows() {
  const researchById = researchMap()
  const findingsById = uaeFindingMap()
  const candidates = candidateFileNames()
  const canonical = canonicalWorkflowIds()
  const exclusions = proposedExclusions()
  const workflows = getWorkflowPaths().map(readJson).sort((left, right) =>
    left.baseline.source_workflow_index - right.baseline.source_workflow_index)

  const selected = []
  for (const workflow of workflows) {
    const research = researchById.get(workflow.workflow_id)
    const existingCandidateIsPilotOutput = candidates.has(workflow.workflow_id) && (() => {
      try {
        const document = readJson(path.join(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY, `${workflow.workflow_id}.candidate.json`))
        return document.proposals?.length > 0 && document.proposals.every((proposal) => proposal.proposalStatus === 'clinician_review_required')
      } catch {
        return false
      }
    })()
    if (research?.source_status !== 'partial_exact_source_verified') continue
    if (candidates.has(workflow.workflow_id) && !existingCandidateIsPilotOutput) continue
    if (canonical.has(workflow.workflow_id) || exclusions.has(workflow.workflow_id)) continue
    if (hasUnresolvedHighPriorityIssue(workflow.workflow_id)) continue
    selected.push({ workflow, research, findings: findingsById.get(workflow.workflow_id) ?? [] })
    if (selected.length === PILOT_SIZE) break
  }
  if (selected.length !== PILOT_SIZE) throw new Error(`[clinician-pilot] expected ${PILOT_SIZE} eligible workflows, found ${selected.length}`)
  return selected
}

function registeredSources() {
  const directory = path.join(EXPANSION_DIR, 'sources')
  const sources = fs.readdirSync(directory).filter((name) => name.endsWith('.json')).sort()
    .flatMap((name) => readJson(path.join(directory, name)).sources ?? [])
  return new Map(sources.map((source) => [source.source_id, source]))
}

function createManifest(selected) {
  return {
    schema_version: '1.0.0',
    pilot_id: PILOT_ID,
    selection_policy: {
      ordering: 'ascending baseline.source_workflow_index',
      required_research_status: 'partial_exact_source_verified',
      workflow_limit: PILOT_SIZE,
      excluded: [
        'no_authoritative_source_found',
        'existing_candidate_proposals_at_pilot_selection',
        'existing_supported_mappings',
        'excluded_workflows',
        'unresolved_P0_or_P1_safety_issues',
      ],
    },
    authority: AUTHORITY,
    workflow_count: selected.length,
    workflows: selected.map(({ workflow, research, findings }, index) => ({
      pilot_position: index + 1,
      workflow_number: workflow.baseline.source_workflow_index + 1,
      workflow_id: workflow.workflow_id,
      workflow_title: workflow.presentation,
      specialty: workflow.specialty,
      current_research_status: research.source_status,
      currently_registered_source_ids: [...new Set([
        ...(research.selected_primary_sources ?? []),
        ...(research.selected_supporting_sources ?? []),
      ])].sort(),
      uae_applicability_category: findings.includes('partial_applicability') ? 'partial_applicability' : (findings[0] ?? 'not_recorded'),
      reason_selected: 'First eligible partial exact-source workflow in deterministic workflow order; no pre-existing candidate proposal or supported mapping, no exclusion, and no unresolved P0/P1 safety issue.',
    })),
  }
}

async function explicitSupportRelationships(selectedIds) {
  const result = new Map()
  for (const modulePath of SUPPORT_MODULE_PATHS) {
    const batch = (await import(pathToFileURL(modulePath).href)).default
    for (const workflow of batch.workflows ?? []) {
      if (!selectedIds.has(workflow.workflow_id)) continue
      if (result.has(workflow.workflow_id)) throw new Error(`[clinician-pilot] duplicate support definition for ${workflow.workflow_id}`)
      result.set(workflow.workflow_id, workflow.support_groups ?? [])
    }
  }
  return result
}

function activationState(item) {
  if (item.default_selected === true) return 'active'
  if (/\b(?:if|when|where|only if|as needed|where indicated)\b/i.test(item.text) || /conditional/i.test(item.item_type)) return 'conditional'
  return 'optional'
}

function safetyClassification(sectionName, item) {
  const value = `${sectionName} ${item.item_type} ${item.text}`.toLowerCase()
  if (/medication|medicine|drug|dose|antibiotic|anticoagul|insulin|analgesi|paracetamol|ibuprofen/.test(value)) return 'medication_related_high_safety'
  if (/red.flag|safety.net|referral|emergency|urgent|escalat|return precaution|seek.*care/.test(value)) return 'escalation_or_safety_net'
  if (/diagnosis|assessment|plan|investigation|prescri|treatment|management/.test(value)) return 'clinical_decision'
  return 'routine_documentation'
}

function supportClassification(sectionId, relationship) {
  const value = `${sectionId} ${relationship}`.toLowerCase()
  if (/background|scope|applicability|overview|definition|terminolog|context/.test(value)) return 'contextual_support'
  // The prior batch relationship is explicit enough to prepare a proposal, but
  // qualified-clinician review is still required before direct support can exist.
  return 'partial_support'
}

function dateProvenance(source) {
  return {
    publication_date: Object.hasOwn(source, 'publication_date') ? source.publication_date : null,
    effective_date: Object.hasOwn(source, 'effective_date') ? source.effective_date : null,
    revision_date: Object.hasOwn(source, 'revision_date') ? source.revision_date : null,
    version: Object.hasOwn(source, 'version') ? source.version : null,
    verification_date: source.source_recency?.verification_date ?? source.recency_verification?.verified_on ?? null,
    recency_basis: source.source_recency?.recency_basis ?? null,
    basis_field: source.source_recency?.basis_field ?? null,
    basis_raw_value: source.source_recency?.basis_value ?? null,
    basis_precision: source.source_recency?.basis_precision ?? null,
  }
}

function evidenceLocation(source, sectionId) {
  const section = (source.exact_sections ?? []).find((entry) => entry.section_id === sectionId)
  if (!section) throw new Error(`[clinician-pilot] source ${source.source_id} lacks exact section ${sectionId}`)
  return {
    section_id: section.section_id,
    heading: section.heading,
    locator: section.locator,
  }
}

function sourceIsUae(source) {
  return /\b(?:United Arab Emirates|UAE|Dubai|Abu Dhabi)\b/i.test(`${source.jurisdiction} ${source.issuing_organisation}`)
}

function makeEvidenceCandidate({ workflow, research, item, group, source, evidenceItem, safetyReviewRequired }) {
  const classification = supportClassification(group.source_section_id, group.relationship)
  const uaeClass = sourceIsUae(source) ? 'uae_specific' : 'international_only'
  return {
    workflow_id: workflow.workflow_id,
    item_id: item.item_id,
    source_id: source.source_id,
    official_source_title: source.exact_document_title,
    official_url: source.exact_official_url,
    evidence_location: evidenceLocation(source, group.source_section_id),
    concise_evidence_summary: evidenceItem.paraphrased_evidence_summary,
    exact_relationship: group.relationship,
    support_classification: classification,
    jurisdiction: source.jurisdiction,
    uae_applicability: {
      classification: uaeClass,
      research_assessment: research.UAE_applicability,
    },
    evidence_date_provenance: dateProvenance(source),
    source_recency_status: source.source_recency?.recency_outcome ?? null,
    reviewer_required: true,
    safety_review_required: safetyReviewRequired,
    candidate_status: 'clinician_review_required',
    authority: AUTHORITY,
  }
}

function proposalFromCandidate(candidate, research) {
  return {
    workflowId: candidate.workflow_id,
    itemId: candidate.item_id,
    sourceId: candidate.source_id,
    sectionId: candidate.evidence_location.section_id,
    proposalRationale: `Generated for qualified-clinician review only; not approved and not suitable for production use. Existing committed item relationship: ${candidate.exact_relationship}`,
    populationAssessment: `${research.population_applicability} The qualified clinician must confirm applicability to this exact item.`,
    settingAssessment: `${research.setting_applicability} The qualified clinician must confirm applicability to this exact item and setting.`,
    uaeAssessment: `${research.UAE_applicability} No broader UAE applicability is inferred.`,
    proposalStatus: 'clinician_review_required',
  }
}

function increment(map, key, field, amount = 1) {
  const value = map.get(key) ?? { key }
  value[field] = (value[field] ?? 0) + amount
  map.set(key, value)
}

function accounting(items, manifest) {
  const byWorkflow = new Map()
  const bySpecialty = new Map()
  const byCategory = new Map()
  const bySupport = new Map()
  let candidateProposals = 0
  const totals = {
    workflows_selected: manifest.workflow_count,
    total_clinical_items_reviewed: items.length,
    direct_support_candidates: 0,
    partial_support_candidates: 0,
    contextual_support_candidates: 0,
    unsupported_items: 0,
    clinician_review_required_items: 0,
    safety_review_required_items: 0,
    uae_specific_candidates: 0,
    international_only_candidates: 0,
    candidate_proposals_created: 0,
    supported_mappings_created: 0,
  }
  for (const item of items) {
    const candidateCount = item.evidence_candidates.length
    const workflow = manifest.workflows.find((entry) => entry.workflow_id === item.workflow_id)
    for (const [map, key] of [[byWorkflow, item.workflow_id], [bySpecialty, workflow.specialty], [byCategory, item.item_category]]) {
      increment(map, key, 'items')
      if (item.safety_review_required) increment(map, key, 'safety_review_required_items')
      if (!candidateCount) increment(map, key, 'unsupported_items')
    }
    if (!candidateCount) {
      totals.unsupported_items += 1
      increment(bySupport, 'unsupported', 'items')
    }
    if (item.clinician_review_required) totals.clinician_review_required_items += 1
    if (item.safety_review_required) totals.safety_review_required_items += 1
    for (const candidate of item.evidence_candidates) {
      const field = `${candidate.support_classification}_candidates`
      totals[field] += 1
      increment(bySupport, candidate.support_classification, 'candidates')
      increment(byWorkflow, item.workflow_id, field)
      increment(bySpecialty, workflow.specialty, field)
      increment(byCategory, item.item_category, field)
      totals[`${candidate.uae_applicability.classification}_candidates`] += 1
      candidateProposals += 1
    }
  }
  totals.candidate_proposals_created = candidateProposals
  return {
    schema_version: '1.0.0',
    pilot_id: PILOT_ID,
    authority: AUTHORITY,
    totals,
    by_workflow: [...byWorkflow.values()].sort((a, b) => a.key.localeCompare(b.key)),
    by_specialty: [...bySpecialty.values()].sort((a, b) => a.key.localeCompare(b.key)),
    by_item_category: [...byCategory.values()].sort((a, b) => a.key.localeCompare(b.key)),
    by_support_classification: [...bySupport.values()].sort((a, b) => a.key.localeCompare(b.key)),
  }
}

function csvCell(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return `"${text.replaceAll('"', '""')}"`
}

function itemsCsv(items) {
  const fields = [
    'workflow_number', 'workflow_id', 'workflow_title', 'specialty', 'item_id', 'item_category', 'item_type',
    'item_text', 'activation_state', 'current_evidence_status', 'currently_associated_source_ids',
    'current_uae_applicability_status', 'safety_classification', 'clinician_review_required',
    'safety_review_required', 'candidate_count', 'candidate_evidence_links',
  ]
  const rows = [fields.map(csvCell).join(',')]
  for (const item of items) rows.push(fields.map((field) => csvCell(field === 'candidate_count' ? item.evidence_candidates.length :
    field === 'candidate_evidence_links' ? item.evidence_candidates : item[field])).join(','))
  return `${rows.join('\n')}\n`
}

function md(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\r', ' ').replaceAll('\n', ' ')
}

function workflowPacket(entry, workflow, research, items, proposals) {
  const unsupported = items.filter((item) => item.evidence_candidates.length === 0)
  const partial = items.filter((item) => item.evidence_candidates.some((candidate) => candidate.support_classification === 'partial_support'))
  const contextual = items.filter((item) => item.evidence_candidates.some((candidate) => candidate.support_classification === 'contextual_support'))
  const medication = items.filter((item) => item.safety_classification === 'medication_related_high_safety')
  const rows = items.map((item) => {
    const candidates = item.evidence_candidates.length
      ? item.evidence_candidates.map((candidate) => `${candidate.source_id} / ${candidate.evidence_location.section_id} (${candidate.support_classification})`).join('; ')
      : 'None — item remains unsupported'
    return `| ${md(item.item_id)} | ${md(item.item_category)} | ${md(item.item_text)} | ${item.activation_state} | ${md(candidates)} | ${item.safety_review_required ? 'yes' : 'no'} |`
  }).join('\n')
  return `# Qualified-clinician review packet: ${entry.workflow_title}\n\n` +
    `- Pilot: \`${PILOT_ID}\`\n- Workflow: \`${entry.workflow_id}\` (programme workflow ${entry.workflow_number}, pilot position ${entry.pilot_position})\n- Specialty: ${entry.specialty}\n- Current source-first status: \`${research.source_status}\`\n- UAE applicability: ${research.UAE_applicability}\n\n` +
    `## Authority boundary\n\nThis packet is generated for qualified-clinician review. It is not approved and is not suitable for production use. It makes no autonomous treatment recommendation, invents no dose or diagnosis, and does not expand beyond cited evidence. No decision is preselected.\n\n` +
    `## Current workflow content and item evidence\n\n| Item ID | Category | Exact current text | Activation | Candidate evidence | Safety review |\n|---|---|---|---|---|---|\n${rows}\n\n` +
    `## Review summary\n\n- Total current items: ${items.length}\n- Unsupported items: ${unsupported.length}\n- Items with partial-support candidates: ${partial.length}\n- Items with contextual-support candidates: ${contextual.length}\n- Candidate proposals: ${proposals.length}\n- Medication-safety items: ${medication.length}\n\n` +
    `## Unresolved questions for the clinician\n\n- Does each cited section support the exact item text for the recorded population and setting?\n- Should any candidate be narrowed from the current legacy wording?\n- Are Dubai/DHA limitations stated clearly enough, and is any broader UAE use unsupported?\n- Do medication-related, red-flag, referral, or safety-net items require escalation to a specialist safety reviewer?\n- Should every item without a candidate remain unsupported?\n\n` +
    `## Explicit decisions required\n\nFor each candidate or unsupported item, select exactly one during the controlled human review: **approve candidate**, **reject candidate**, **request narrower wording**, **request source recheck**, **mark item unsupported**, or **escalate safety review**. Approval is deliberately not preselected and must use the existing separate approval/signing controls.\n`
}

export async function buildPilotArtifacts({ write = false } = {}) {
  const selected = selectPilotWorkflows()
  const manifest = createManifest(selected)
  const sources = registeredSources()
  const relationships = await explicitSupportRelationships(new Set(manifest.workflows.map((entry) => entry.workflow_id)))
  const allItems = []
  const proposalsByWorkflow = new Map()
  const packetInputs = []

  for (const entry of manifest.workflows) {
    const selectedEntry = selected.find(({ workflow }) => workflow.workflow_id === entry.workflow_id)
    const { workflow, research } = selectedEntry
    const itemById = new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))
    const sectionByItemId = new Map()
    for (const [sectionName, items] of Object.entries(workflow.content_sections ?? {})) {
      for (const item of items ?? []) sectionByItemId.set(item.item_id, sectionName)
    }
    const candidateGroups = new Map()
    for (const group of relationships.get(workflow.workflow_id) ?? []) {
      if (!(research.exact_sections_reviewed ?? []).includes(group.source_section_id)) throw new Error(`[clinician-pilot] ${workflow.workflow_id} support section was not completed in research: ${group.source_section_id}`)
      const evidenceItem = (research.evidence_items ?? []).find((entry) => entry.source_id === group.source_id && entry.source_section_id === group.source_section_id)
      if (!evidenceItem) throw new Error(`[clinician-pilot] ${workflow.workflow_id} lacks persisted evidence for ${group.source_id}/${group.source_section_id}`)
      if (!sources.has(group.source_id)) throw new Error(`[clinician-pilot] source is not registered: ${group.source_id}`)
      if (typeof group.relationship !== 'string' || group.relationship.trim() === '') throw new Error(`[clinician-pilot] relationship is not explicit`)
      for (const itemId of group.item_ids ?? []) {
        if (!itemById.has(itemId)) throw new Error(`[clinician-pilot] ${workflow.workflow_id} lacks exact item ${itemId}`)
        const values = candidateGroups.get(itemId) ?? []
        values.push({ group, evidenceItem })
        candidateGroups.set(itemId, values)
      }
    }
    const proposals = []
    const workflowItems = []
    for (const item of listClinicalItems(workflow)) {
      const sectionName = sectionByItemId.get(item.item_id)
      const safety = safetyClassification(sectionName, item)
      const safetyReviewRequired = safety !== 'routine_documentation'
      const evidenceCandidates = (candidateGroups.get(item.item_id) ?? []).map(({ group, evidenceItem }) =>
        makeEvidenceCandidate({ workflow, research, item, group, source: sources.get(group.source_id), evidenceItem, safetyReviewRequired }))
      const record = {
        workflow_number: entry.workflow_number,
        workflow_id: workflow.workflow_id,
        workflow_title: workflow.presentation,
        specialty: workflow.specialty,
        item_id: item.item_id,
        item_category: sectionName,
        item_type: item.item_type,
        item_text: item.text,
        activation_state: activationState(item),
        current_evidence_status: item.clinical_review_status,
        currently_associated_source_ids: [...(item.source_ids ?? [])],
        current_uae_applicability_status: entry.uae_applicability_category,
        safety_classification: safety,
        clinician_review_required: true,
        safety_review_required: safetyReviewRequired,
        evidence_candidates: evidenceCandidates,
      }
      workflowItems.push(record)
      allItems.push(record)
      for (const candidate of evidenceCandidates) proposals.push(proposalFromCandidate(candidate, research))
    }
    if (proposals.length) candidateProposalDocument(workflow.workflow_id, proposals)
    proposalsByWorkflow.set(workflow.workflow_id, proposals)
    packetInputs.push({ entry, workflow, research, items: workflowItems, proposals })
  }

  const result = {
    manifest,
    itemsDocument: {
      schema_version: '1.0.0',
      pilot_id: PILOT_ID,
      authority: AUTHORITY,
      item_count: allItems.length,
      items: allItems,
    },
    accounting: accounting(allItems, manifest),
    proposalsByWorkflow,
    packetInputs,
  }
  if (write) writePilotArtifacts(result)
  return result
}

export function writePilotManifest(manifest) {
  writeJson(PILOT_MANIFEST_PATH, manifest)
}

export function writePilotArtifacts(result) {
  writePilotManifest(result.manifest)
  writeJson(PILOT_ITEMS_JSON_PATH, result.itemsDocument)
  writeTextAtomic(PILOT_ITEMS_CSV_PATH, itemsCsv(result.itemsDocument.items))
  writeJson(PILOT_ACCOUNTING_PATH, result.accounting)
  fs.mkdirSync(PILOT_WORKFLOW_DIRECTORY, { recursive: true })
  for (const { entry, workflow, research, items, proposals } of result.packetInputs) {
    writeTextAtomic(path.join(PILOT_WORKFLOW_DIRECTORY, `${entry.workflow_id}.md`), workflowPacket(entry, workflow, research, items, proposals))
    if (proposals.length) writeCandidateProposalDocument(entry.workflow_id, proposals)
  }
}

export async function main(args = process.argv.slice(2)) {
  const result = await buildPilotArtifacts()
  if (args.includes('--manifest-only')) writePilotManifest(result.manifest)
  else writePilotArtifacts(result)
  console.log(JSON.stringify({
    pilot_id: PILOT_ID,
    manifest_path: path.relative(ROOT_DIR, PILOT_MANIFEST_PATH).replaceAll('\\', '/'),
    item_count: result.itemsDocument.item_count,
    ...result.accounting.totals,
  }, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}

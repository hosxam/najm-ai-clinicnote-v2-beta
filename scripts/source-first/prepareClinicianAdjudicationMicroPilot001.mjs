import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPANSION_DIR, ROOT_DIR, readJson, sha256, writeJson, writeTextAtomic } from './common.mjs'

export const MICRO_PILOT_ID = 'clinician-review-item-mapping-pilot-001'
export const MICRO_REVIEW_ID = 'micro-review-001'
export const MICRO_WORKFLOW_IDS = Object.freeze([
  'gp-chest-pain',
  'gp-shortness-of-breath',
  'gp-fever-urti',
  'peds-fever',
  'peds-poor-feeding',
])
export const MICRO_DIRECTORY = path.join(EXPANSION_DIR, 'clinician-review', 'pilot-001', MICRO_REVIEW_ID)
export const MICRO_MANIFEST_PATH = path.join(MICRO_DIRECTORY, 'MICRO_REVIEW_MANIFEST.json')
export const MICRO_SCHEMA_PATH = path.join(MICRO_DIRECTORY, 'CLINICIAN_DECISION_SCHEMA.json')
export const MICRO_DECISIONS_JSON_PATH = path.join(MICRO_DIRECTORY, 'CLINICIAN_DECISIONS_TEMPLATE.json')
export const MICRO_DECISIONS_CSV_PATH = path.join(MICRO_DIRECTORY, 'CLINICIAN_DECISIONS_TEMPLATE.csv')
export const MICRO_GUIDE_PATH = path.join(MICRO_DIRECTORY, 'CLINICIAN_REVIEW_GUIDE.md')
export const MICRO_WORKFLOWS_DIRECTORY = path.join(MICRO_DIRECTORY, 'workflows')
export const DECISION_SCHEMA_VERSION = '1.0.0'

export const CLINICIAN_DECISIONS = Object.freeze([
  'approve_candidate',
  'reject_candidate',
  'approve_with_narrower_wording',
  'request_source_recheck',
  'mark_item_unsupported',
  'escalate_safety_review',
  'defer_decision',
])

const AUTHORITY = Object.freeze({
  prepared_for: 'qualified_clinician_adjudication',
  clinician_authority_required: true,
  template_initial_state: 'pending_clinician_review',
  supported_mappings_created: 0,
  automatic_import_authorized: false,
  production_use_authorized: false,
})

const CSV_FIELDS = Object.freeze([
  'pilot_id',
  'micro_review_id',
  'workflow_id',
  'item_id',
  'candidate_id',
  'item_category',
  'original_item_text',
  'proposed_source_id',
  'evidence_section_id',
  'evidence_heading',
  'evidence_locator',
  'evidence_summary',
  'support_classification',
  'uae_applicability',
  'safety_review_required',
  'clinician_decision',
  'revised_item_wording',
  'clinician_comment',
  'source_recheck_required',
  'safety_escalation_required',
  'reviewer_name',
  'reviewer_professional_role',
  'reviewer_registration_or_licence_identifier',
  'review_date',
  'decision_status',
  'schema_version',
])

function decisionSchema() {
  const string = { type: 'string' }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://najm-clinicnote.local/schema/clinician-adjudication-decision-1.0.0.json',
    title: 'Qualified-clinician adjudication micro-pilot decision template',
    type: 'object',
    additionalProperties: false,
    required: ['schema_version', 'pilot_id', 'micro_review_id', 'record_count', 'authority', 'records'],
    properties: {
      schema_version: { const: DECISION_SCHEMA_VERSION },
      pilot_id: { const: MICRO_PILOT_ID },
      micro_review_id: { const: MICRO_REVIEW_ID },
      record_count: { type: 'integer', minimum: 0 },
      authority: {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(AUTHORITY),
        properties: Object.fromEntries(Object.entries(AUTHORITY).map(([key, value]) => [key, { const: value }])),
      },
      records: { type: 'array', items: { $ref: '#/$defs/decision' } },
    },
    $defs: {
      decision: {
        type: 'object',
        additionalProperties: false,
        required: [...CSV_FIELDS],
        properties: {
          pilot_id: { const: MICRO_PILOT_ID },
          micro_review_id: { const: MICRO_REVIEW_ID },
          workflow_id: { enum: [...MICRO_WORKFLOW_IDS] },
          item_id: { type: 'string', minLength: 1 },
          candidate_id: string,
          item_category: { type: 'string', minLength: 1 },
          original_item_text: { type: 'string', minLength: 1 },
          proposed_source_id: string,
          evidence_section_id: string,
          evidence_heading: string,
          evidence_locator: string,
          evidence_summary: string,
          support_classification: { enum: ['partial_support', 'contextual_support', 'unsupported'] },
          uae_applicability: { type: 'string', minLength: 1 },
          safety_review_required: { type: 'boolean' },
          clinician_decision: { enum: ['', ...CLINICIAN_DECISIONS] },
          revised_item_wording: string,
          clinician_comment: string,
          source_recheck_required: { type: ['boolean', 'null'] },
          safety_escalation_required: { type: ['boolean', 'null'] },
          reviewer_name: string,
          reviewer_professional_role: string,
          reviewer_registration_or_licence_identifier: string,
          review_date: { anyOf: [{ const: '' }, { type: 'string', format: 'date' }] },
          decision_status: { enum: ['pending_clinician_review', 'clinician_decision_recorded'] },
          schema_version: { const: DECISION_SCHEMA_VERSION },
        },
      },
    },
  }
}

function candidateId(item, candidate) {
  return `cand-${sha256([
    item.workflow_id,
    item.item_id,
    candidate.source_id,
    candidate.evidence_location.section_id,
  ].join('\u0000')).slice(0, 24)}`
}

function decisionRecord(item, candidate) {
  const uae = candidate
    ? `${candidate.uae_applicability.classification}: ${candidate.uae_applicability.research_assessment}`
    : item.current_uae_applicability_status
  return {
    pilot_id: MICRO_PILOT_ID,
    micro_review_id: MICRO_REVIEW_ID,
    workflow_id: item.workflow_id,
    item_id: item.item_id,
    candidate_id: candidate ? candidateId(item, candidate) : '',
    item_category: item.item_category,
    original_item_text: item.item_text,
    proposed_source_id: candidate?.source_id ?? '',
    evidence_section_id: candidate?.evidence_location.section_id ?? '',
    evidence_heading: candidate?.evidence_location.heading ?? '',
    evidence_locator: candidate?.evidence_location.locator ?? '',
    evidence_summary: candidate?.concise_evidence_summary ?? '',
    support_classification: candidate?.support_classification ?? 'unsupported',
    uae_applicability: uae,
    safety_review_required: item.safety_review_required,
    clinician_decision: '',
    revised_item_wording: '',
    clinician_comment: '',
    source_recheck_required: null,
    safety_escalation_required: null,
    reviewer_name: '',
    reviewer_professional_role: '',
    reviewer_registration_or_licence_identifier: '',
    review_date: '',
    decision_status: 'pending_clinician_review',
    schema_version: DECISION_SCHEMA_VERSION,
  }
}

function csvCell(value) {
  const serialized = value === null ? '' : String(value)
  return `"${serialized.replaceAll('"', '""')}"`
}

function csv(records) {
  return `${[
    CSV_FIELDS.map(csvCell).join(','),
    ...records.map((record) => CSV_FIELDS.map((field) => csvCell(record[field])).join(',')),
  ].join('\n')}\n`
}

function markdownCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\r', ' ').replaceAll('\n', ' ')
}

function queueGroup(record) {
  if (record.safety_review_required) return 'safety_critical'
  if (record.support_classification === 'partial_support') return 'partial_support'
  if (record.support_classification === 'contextual_support') return 'contextual_support'
  return 'unsupported'
}

const GROUPS = Object.freeze([
  ['safety_critical', '1. Safety-critical items'],
  ['partial_support', '2. Partial-support candidates'],
  ['contextual_support', '3. Contextual-support candidates'],
  ['unsupported', '4. Unsupported items'],
])

function queueTable(records) {
  if (!records.length) return '_No items in this group._\n'
  const rows = records.map((record) => {
    const source = record.proposed_source_id || 'None'
    const location = record.evidence_section_id
      ? `${record.evidence_section_id}; ${record.evidence_heading}; ${record.evidence_locator}`
      : 'None recorded'
    const summary = record.evidence_summary || 'No candidate evidence; item remains unsupported.'
    return `| ${markdownCell(record.item_id)} | ${markdownCell(record.item_category)} | ${markdownCell(record.original_item_text)} | ${markdownCell(source)} | ${markdownCell(location)} | ${markdownCell(summary)} | ${record.support_classification} | ${markdownCell(record.uae_applicability)} | ${record.safety_review_required ? 'yes' : 'no'} | A / N / R / S / U / E / D |  |  |`
  }).join('\n')
  return `| Item ID | Category | Current wording | Source | Exact evidence location | Evidence summary | Support | UAE applicability | Safety | Decision options | Clinician comment | Revised wording |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${rows}\n`
}

function packet(manifestEntry, records) {
  const groups = GROUPS.map(([key, heading]) => `## ${heading}\n\n${queueTable(records.filter((record) => queueGroup(record) === key))}`).join('\n')
  return `# Clinician adjudication queue: ${manifestEntry.workflow_title}\n\n` +
    `- Workflow: \`${manifestEntry.workflow_id}\`\n- Specialty: ${manifestEntry.specialty}\n- Items: ${manifestEntry.item_count}\n- Candidate proposals: ${manifestEntry.candidate_count}\n- Unsupported items: ${manifestEntry.unsupported_item_count}\n- Safety-review items: ${manifestEntry.safety_review_count}\n\n` +
    `This is a blank qualified-clinician decision queue. Nothing is approved, rejected, signed, promoted, or suitable for production use. Unsupported items are retained visibly. Partial support is not full approval, and contextual support is not direct support.\n\n` +
    `Decision codes: **A** approve candidate; **N** approve with narrower wording; **R** reject candidate; **S** request source recheck; **U** mark unsupported; **E** escalate safety review; **D** defer. No option is preselected.\n\n${groups}`
}

function reviewGuide() {
  return `# Qualified-clinician adjudication guide\n\n` +
    `This micro-review prepares decisions; it does not make them. All template rows begin at \`pending_clinician_review\` with blank decision, identity, date, comment, and revised wording fields.\n\n` +
    `## Approve candidate\n\nUse \`approve_candidate\` only when the cited evidence directly supports the current item wording for the recorded population, setting, and jurisdiction.\n\n` +
    `## Approve with narrower wording\n\nUse \`approve_with_narrower_wording\` when the source supports a narrower statement than the current item. Enter the complete proposed wording in \`revised_item_wording\`.\n\n` +
    `## Reject candidate\n\nUse \`reject_candidate\` when the cited source does not support the item sufficiently. Rejection does not remove or publish content automatically.\n\n` +
    `## Request source recheck\n\nUse \`request_source_recheck\` when the cited location is unclear, incomplete, inaccessible, or possibly misinterpreted. Set \`source_recheck_required\` to true and explain the reason in \`clinician_comment\`.\n\n` +
    `## Mark item unsupported\n\nUse \`mark_item_unsupported\` when no reviewed source supports the item. Unsupported items cannot be promoted.\n\n` +
    `## Escalate safety review\n\nUse \`escalate_safety_review\` for medication, emergency, red-flag, referral, diagnostic, or management content requiring specialist review. The row must already retain its safety-review flag, and \`safety_escalation_required\` must be true.\n\n` +
    `## Defer decision\n\nUse \`defer_decision\` when the reviewer cannot confidently adjudicate the item. State what remains unresolved in \`clinician_comment\`.\n\n` +
    `## Mandatory boundaries\n\n- Partial support is not full approval.\n- Contextual support is not direct support.\n- Clinician review does not automatically publish anything.\n- Recorded approvals still require a separately authorised controlled import, validation, canonical transaction, and signing process.\n- Do not expand dosing, diagnosis, treatment, or other clinical content beyond the cited evidence.\n- Do not enter a signature in these files; no signature field is part of the decision schema.\n`
}

function manifestEntry(workflowManifest, records, position) {
  const candidates = records.filter((record) => record.candidate_id)
  const reasonById = {
    'gp-chest-pain': 'High-risk adult presentation with red-flag and escalation content plus UAE-specific candidate evidence.',
    'gp-shortness-of-breath': 'High-risk adult presentation with a mixed partial/contextual international evidence set requiring applicability adjudication.',
    'gp-fever-urti': 'Mixed-age fever/URTI workflow with safety-critical content and no retained item-level candidates, selected to test unsupported-item review.',
    'peds-fever': 'High-risk pediatric presentation with UAE-specific partial and contextual candidates plus prominent safety review needs.',
    'peds-poor-feeding': 'Pediatric presentation using international-only evidence with substantial unsupported content and safety-review needs.',
  }
  return {
    micro_review_position: position + 1,
    workflow_id: workflowManifest.workflow_id,
    workflow_title: workflowManifest.workflow_title,
    specialty: workflowManifest.specialty,
    item_count: records.length,
    candidate_count: candidates.length,
    unsupported_item_count: records.filter((record) => record.support_classification === 'unsupported').length,
    safety_review_count: records.filter((record) => record.safety_review_required).length,
    uae_candidate_count: candidates.filter((record) => record.uae_applicability.startsWith('uae_specific:')).length,
    reason_included: reasonById[workflowManifest.workflow_id],
  }
}

function accounting(records) {
  const candidates = records.filter((record) => record.candidate_id)
  return {
    workflows: MICRO_WORKFLOW_IDS.length,
    total_items: records.length,
    candidate_proposals: candidates.length,
    partial_support_candidates: candidates.filter((record) => record.support_classification === 'partial_support').length,
    contextual_support_candidates: candidates.filter((record) => record.support_classification === 'contextual_support').length,
    unsupported_items: records.filter((record) => record.support_classification === 'unsupported').length,
    safety_review_required_items: records.filter((record) => record.safety_review_required).length,
    uae_specific_candidates: candidates.filter((record) => record.uae_applicability.startsWith('uae_specific:')).length,
    international_only_candidates: candidates.filter((record) => record.uae_applicability.startsWith('international_only:')).length,
    pending_clinician_decisions: records.filter((record) => record.decision_status === 'pending_clinician_review').length,
    approved_decisions: 0,
    rejected_decisions: 0,
    supported_mappings: 0,
  }
}

export function buildMicroPilot() {
  const pilotManifest = readJson(path.join(EXPANSION_DIR, 'clinician-review', 'pilot-001', 'PILOT_WORKFLOW_MANIFEST.json'))
  const pilotItems = readJson(path.join(EXPANSION_DIR, 'clinician-review', 'pilot-001', 'CLINICIAN_REVIEW_ITEMS.json')).items
  const workflowManifestById = new Map(pilotManifest.workflows.map((entry) => [entry.workflow_id, entry]))
  const records = []
  for (const workflowId of MICRO_WORKFLOW_IDS) {
    const items = pilotItems.filter((item) => item.workflow_id === workflowId)
    if (!items.length) throw new Error(`[adjudication-micro-pilot] missing pilot workflow ${workflowId}`)
    for (const item of items) {
      if (item.evidence_candidates.length > 1) throw new Error(`[adjudication-micro-pilot] ${item.item_id} has multiple candidates; explicit multi-row review design is required`)
      records.push(decisionRecord(item, item.evidence_candidates[0] ?? null))
    }
  }
  const manifestWorkflows = MICRO_WORKFLOW_IDS.map((workflowId, index) => {
    const workflowRecords = records.filter((record) => record.workflow_id === workflowId)
    return manifestEntry(workflowManifestById.get(workflowId), workflowRecords, index)
  })
  const totals = accounting(records)
  return {
    schema: decisionSchema(),
    manifest: {
      schema_version: '1.0.0',
      pilot_id: MICRO_PILOT_ID,
      micro_review_id: MICRO_REVIEW_ID,
      authority: AUTHORITY,
      workflow_count: MICRO_WORKFLOW_IDS.length,
      workflows: manifestWorkflows,
      accounting: totals,
    },
    decisions: {
      schema_version: DECISION_SCHEMA_VERSION,
      pilot_id: MICRO_PILOT_ID,
      micro_review_id: MICRO_REVIEW_ID,
      record_count: records.length,
      authority: AUTHORITY,
      records,
    },
    packets: Object.fromEntries(MICRO_WORKFLOW_IDS.map((workflowId) => {
      const manifest = manifestWorkflows.find((entry) => entry.workflow_id === workflowId)
      return [workflowId, packet(manifest, records.filter((record) => record.workflow_id === workflowId))]
    })),
    guide: reviewGuide(),
  }
}

export function writeMicroPilot(result) {
  writeJson(MICRO_SCHEMA_PATH, result.schema)
  writeJson(MICRO_MANIFEST_PATH, result.manifest)
  writeJson(MICRO_DECISIONS_JSON_PATH, result.decisions)
  writeTextAtomic(MICRO_DECISIONS_CSV_PATH, csv(result.decisions.records))
  writeTextAtomic(MICRO_GUIDE_PATH, result.guide)
  fs.mkdirSync(MICRO_WORKFLOWS_DIRECTORY, { recursive: true })
  for (const [workflowId, contents] of Object.entries(result.packets)) {
    writeTextAtomic(path.join(MICRO_WORKFLOWS_DIRECTORY, `${workflowId}.md`), contents)
  }
}

export function main() {
  const result = buildMicroPilot()
  writeMicroPilot(result)
  console.log(JSON.stringify({
    micro_review_id: MICRO_REVIEW_ID,
    output_directory: path.relative(ROOT_DIR, MICRO_DIRECTORY).replaceAll('\\', '/'),
    ...result.manifest.accounting,
  }, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()

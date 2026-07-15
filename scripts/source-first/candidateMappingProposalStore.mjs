import fs from 'node:fs'
import path from 'node:path'
import {
  CANDIDATE_MAPPING_PROPOSAL_DIRECTORY,
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_RESOURCE_LIMITS,
  canonicalMappingKey,
} from './canonicalMappingContract.mjs'
import { deepFreeze, parseStrictJsonBytes, projectFields } from './canonicalJson.mjs'

export const CANDIDATE_PROPOSAL_SCHEMA_VERSION = '1.0.0'
export const CANDIDATE_PROPOSAL_FIELDS = Object.freeze([
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
  'proposalRationale',
  'populationAssessment',
  'settingAssessment',
  'uaeAssessment',
  'proposalStatus',
])
export const CANDIDATE_PROPOSAL_STATUSES = new Set([
  'candidate_pending_review',
  'clinician_review_required',
  'rejected_candidate',
  'unsupported_pending_review',
])
const ACTIVE_ONLY_FIELDS = new Set([
  ...CANONICAL_MAPPING_FIELDS,
  'canonicalApprovalSequence',
  'canonicalManifestHash',
  'activeMappingSignature',
])
const IDENTIFIER_FIELDS = new Set(['workflowId', 'itemId', 'sourceId', 'sectionId'])
const WORKFLOW_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[candidate-mapping-store] ${label} must be a plain JSON object`)
  }
}

export function validateCandidateMappingProposals(proposals) {
  if (!Array.isArray(proposals) || proposals.length > CANONICAL_RESOURCE_LIMITS.maxMappingsPerWorkflow) {
    throw new Error('[candidate-mapping-store] proposals must be a bounded array')
  }
  const allowed = new Set(CANDIDATE_PROPOSAL_FIELDS)
  const seen = new Set()
  const validated = proposals.map((proposal, index) => {
    plainObject(proposal, `proposals[${index}]`)
    const keys = Object.keys(proposal)
    const forbidden = keys.filter((field) => ACTIVE_ONLY_FIELDS.has(field) && !IDENTIFIER_FIELDS.has(field))
    if (forbidden.length) throw new Error(`[candidate-mapping-store] active-support fields are prohibited: ${forbidden.join(', ')}`)
    const unexpected = keys.filter((field) => !allowed.has(field))
    const missing = CANDIDATE_PROPOSAL_FIELDS.filter((field) => !Object.hasOwn(proposal, field))
    if (unexpected.length || missing.length) throw new Error('[candidate-mapping-store] candidate proposal must use the exact non-active proposal schema')
    for (const field of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(proposal, field)
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) throw new Error('[candidate-mapping-store] accessors are prohibited')
    }
    for (const field of CANDIDATE_PROPOSAL_FIELDS) {
      const value = proposal[field]
      const max = IDENTIFIER_FIELDS.has(field)
        ? CANONICAL_RESOURCE_LIMITS.maxIdentifierLength
        : CANONICAL_RESOURCE_LIMITS.maxApplicabilityLength
      if (typeof value !== 'string' || value.trim() !== value || value.length === 0 || value.length > max) {
        throw new Error(`[candidate-mapping-store] invalid ${field}`)
      }
    }
    if (!WORKFLOW_ID_PATTERN.test(proposal.workflowId)) throw new Error('[candidate-mapping-store] invalid workflowId')
    if (!CANDIDATE_PROPOSAL_STATUSES.has(proposal.proposalStatus)) throw new Error('[candidate-mapping-store] invalid proposalStatus')
    const key = canonicalMappingKey(proposal)
    if (seen.has(key)) throw new Error(`[candidate-mapping-store] duplicate candidate ${key}`)
    seen.add(key)
    return projectFields(proposal, CANDIDATE_PROPOSAL_FIELDS)
  })
  return deepFreeze(validated)
}

export function candidateProposalDocument(workflowId, proposals) {
  const validated = validateCandidateMappingProposals(proposals)
  if (validated.some((proposal) => proposal.workflowId !== workflowId)) {
    throw new Error('[candidate-mapping-store] all proposals must belong to the file workflow')
  }
  return deepFreeze({
    schemaVersion: CANDIDATE_PROPOSAL_SCHEMA_VERSION,
    workflowId,
    proposals: [...validated].sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right))),
  })
}

export function writeCandidateProposalDocument(workflowId, proposals, {
  directory = CANDIDATE_MAPPING_PROPOSAL_DIRECTORY,
} = {}) {
  const document = candidateProposalDocument(workflowId, proposals)
  fs.mkdirSync(directory, { recursive: true })
  const target = path.join(directory, `${workflowId}.candidate.json`)
  const temporary = `${target}.${process.pid}.tmp`
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
    fs.renameSync(temporary, target)
  } finally {
    fs.rmSync(temporary, { force: true })
  }
  return target
}

export function readCandidateProposalDocument(filePath) {
  const parsed = parseStrictJsonBytes(fs.readFileSync(filePath), { fileName: filePath, maxBytes: CANONICAL_RESOURCE_LIMITS.maxCanonicalFileBytes })
  const keys = Object.keys(parsed).sort()
  if (JSON.stringify(keys) !== JSON.stringify(['proposals', 'schemaVersion', 'workflowId'])) {
    throw new Error('[candidate-mapping-store] candidate document has invalid fields')
  }
  if (parsed.schemaVersion !== CANDIDATE_PROPOSAL_SCHEMA_VERSION || path.basename(filePath) !== `${parsed.workflowId}.candidate.json`) {
    throw new Error('[candidate-mapping-store] candidate document identity mismatch')
  }
  return candidateProposalDocument(parsed.workflowId, parsed.proposals)
}

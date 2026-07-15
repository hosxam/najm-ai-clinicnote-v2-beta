const CANDIDATE_STATUSES = new Set([
  'candidate_pending_review',
  'unsupported_pending_review',
  'clinician_review_required',
])
const CANDIDATE_FIELDS = new Set([
  'candidateId',
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
  'candidateStatus',
  'reviewRationale',
])
const SUPPORT_FIELDS = new Set([
  'sourceHash',
  'sectionHash',
  'evidenceRelationship',
  'populationApplicability',
  'settingApplicability',
  'jurisdictionApplicability',
  'uaeApplicability',
  'applicabilityRationale',
  'supportStatus',
  'origin',
  'mappingVersion',
])

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[research-batch-mapping-contract] ${label} must be a plain object`)
  }
}

function nonemptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`[research-batch-mapping-contract] ${label} must be a non-empty string`)
  }
}

export function validateResearchCandidateProposals(proposals = []) {
  if (!Array.isArray(proposals)) throw new Error('[research-batch-mapping-contract] candidate proposals must be an array')
  const seen = new Set()
  const validated = proposals.map((proposal) => {
    plainObject(proposal, 'candidate proposal')
    for (const field of Object.keys(proposal)) {
      if (SUPPORT_FIELDS.has(field)) {
        throw new Error(`[research-batch-mapping-contract] candidate proposal contains support field ${field}`)
      }
      if (!CANDIDATE_FIELDS.has(field)) {
        throw new Error(`[research-batch-mapping-contract] candidate proposal contains unexpected field ${field}`)
      }
    }
    for (const field of CANDIDATE_FIELDS) {
      if (!Object.hasOwn(proposal, field)) throw new Error(`[research-batch-mapping-contract] candidate proposal missing ${field}`)
      nonemptyString(proposal[field], `candidate proposal ${field}`)
    }
    if (!CANDIDATE_STATUSES.has(proposal.candidateStatus)) {
      throw new Error(`[research-batch-mapping-contract] invalid non-support candidate status ${proposal.candidateStatus}`)
    }
    const key = `${proposal.workflowId}\u0000${proposal.itemId}\u0000${proposal.sourceId}\u0000${proposal.sectionId}`
    if (seen.has(key)) throw new Error(`[research-batch-mapping-contract] duplicate candidate proposal ${key}`)
    seen.add(key)
    return Object.freeze(structuredClone(proposal))
  })
  return Object.freeze(validated)
}

export function validateResearchBatchMappingContract(config) {
  plainObject(config, 'workflow batch configuration')
  for (const field of ['mappings', 'legacy_item_support_mappings']) {
    if (Object.hasOwn(config, field)) {
      throw new Error(`[research-batch-mapping-contract] ${field} is prohibited in an executable research batch`)
    }
  }
  if (!Array.isArray(config.support_groups ?? [])) {
    throw new Error('[research-batch-mapping-contract] support_groups must be an array when present')
  }
  if ((config.support_groups ?? []).length > 0) {
    throw new Error('[research-batch-mapping-contract] batch support groups are historical-only and cannot create active support')
  }
  return validateResearchCandidateProposals(config.candidate_item_evidence_proposals ?? [])
}

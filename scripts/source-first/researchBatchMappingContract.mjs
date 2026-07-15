import { validateCandidateMappingProposals } from './candidateMappingProposalStore.mjs'

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`[research-batch-mapping-contract] ${label} must be a plain object`)
  }
}
export function validateResearchCandidateProposals(proposals = []) {
  return validateCandidateMappingProposals(proposals)
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

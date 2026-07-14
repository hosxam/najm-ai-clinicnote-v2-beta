import { sha256 } from '../common.mjs'

export const GP_MAPPING_SUPPORT_STATUSES = new Set(['exact_section_supported'])
export const GP_MAPPING_ORIGINS = new Set(['legacy_exact', 'legacy_cleaned'])

const REQUIRED_FIELDS = [
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
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
]

const FORBIDDEN_TEXT_MAPPING_FIELDS = new Set([
  'text',
  'texts',
  'exactText',
  'exactTexts',
  'exact_texts',
  'label',
  'labels',
  'alias',
  'aliases',
  'position',
  'category',
  'keyword',
  'keywords',
  'substring',
  'fuzzy',
])

function contextLabel(mapping = {}) {
  return `workflow=${mapping.workflowId ?? '<missing>'} item=${mapping.itemId ?? '<missing>'} source=${mapping.sourceId ?? '<missing>'} section=${mapping.sectionId ?? '<missing>'}`
}

function fail(mapping, rule, detail) {
  throw new Error(`[explicit-mapping-contract] ${contextLabel(mapping)} rule=${rule}: ${detail}`)
}

function explicitString(mapping, field) {
  if (!Object.hasOwn(mapping, field)) fail(mapping, `required-${field}`, `${field} must be explicitly supplied`)
  const value = mapping[field]
  if (typeof value !== 'string' || value.trim() === '') fail(mapping, `nonempty-${field}`, `${field} must be a non-empty string`)
  return value.trim()
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function validateRationale(mapping, rationale) {
  const normalized = rationale.toLowerCase()
  if (rationale.length < 40 || !normalized.includes(mapping.workflowId.toLowerCase())) {
    fail(mapping, 'workflow-specific-applicability-rationale', 'applicabilityRationale must name the exact workflow ID and explain applicability in at least 40 characters')
  }
  if (/^(applicable|relevant|supports|same as|workflow specific|workflow-specific)\b/i.test(rationale)) {
    fail(mapping, 'generic-applicability-rationale', 'generic applicability rationale is prohibited')
  }
}

export function sourceObjectHash(source) {
  return sha256(source)
}

export function sectionObjectHash(section) {
  return sha256(section)
}

export function validateExplicitGpMapping(mapping, context) {
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    fail(mapping, 'mapping-object', 'mapping must be an explicit object')
  }

  for (const field of Object.keys(mapping)) {
    if (FORBIDDEN_TEXT_MAPPING_FIELDS.has(field)) {
      fail(mapping, 'text-matching-unavailable', `${field} is prohibited; exact workflow-owned item IDs are required`)
    }
  }
  for (const field of REQUIRED_FIELDS) explicitString(mapping, field)

  if (!context || typeof context !== 'object') fail(mapping, 'validation-context', 'an explicit validation context is required')
  const workflow = context.workflowsById?.get(mapping.workflowId)
  if (!workflow) fail(mapping, 'workflow-exists', 'workflowId does not exist')

  const items = context.itemsByWorkflowId.get(mapping.workflowId)
  const item = items?.get(mapping.itemId)
  if (!item) {
    const owner = [...context.itemsByWorkflowId.entries()].find(([, itemMap]) => itemMap.has(mapping.itemId))?.[0]
    if (owner) fail(mapping, 'item-owned-by-workflow', `itemId belongs to ${owner}, not ${mapping.workflowId}`)
    fail(mapping, 'item-exists', 'itemId does not exist in the exact workflow')
  }

  const source = context.sourcesById?.get(mapping.sourceId)
  if (!source) fail(mapping, 'source-exists', 'sourceId is not registered')
  const section = source.exact_sections?.find((candidate) => candidate.section_id === mapping.sectionId)
  if (!section) fail(mapping, 'section-belongs-to-source', 'sectionId does not exist under the exact sourceId')

  if (!context.reviewedSourceIds?.has(mapping.sourceId)) {
    fail(mapping, 'source-opened', 'sourceId is not present in the caller-supplied opened-source set')
  }
  if (!context.reviewedSectionIds?.has(mapping.sectionId)) {
    fail(mapping, 'section-reviewed', 'sectionId is not present in the caller-supplied reviewed-section set')
  }

  if (!/^[a-f0-9]{64}$/.test(mapping.sourceHash) || mapping.sourceHash !== sourceObjectHash(source)) {
    fail(mapping, 'valid-source-hash', 'sourceHash is absent or does not match the registered source object')
  }
  if (!/^[a-f0-9]{64}$/.test(mapping.sectionHash) || mapping.sectionHash !== sectionObjectHash(section)) {
    fail(mapping, 'valid-section-hash', 'sectionHash is absent or does not match the exact source section')
  }

  validateRationale(mapping, mapping.applicabilityRationale)

  if (!GP_MAPPING_SUPPORT_STATUSES.has(mapping.supportStatus)) {
    fail(mapping, 'permitted-support-status', `supportStatus must be one of ${[...GP_MAPPING_SUPPORT_STATUSES].join(', ')}`)
  }
  if (!GP_MAPPING_ORIGINS.has(mapping.origin)) {
    fail(mapping, 'permitted-origin', `origin must be one of ${[...GP_MAPPING_ORIGINS].join(', ')}`)
  }
  if (mapping.origin === 'source_derived' || item.origin === 'source_derived') {
    fail(mapping, 'legacy-not-source-derived', 'legacy items cannot be relabelled source_derived')
  }
  if (mapping.supportStatus === 'exact_section_supported' && (!mapping.sourceId || !mapping.sectionId)) {
    fail(mapping, 'unsupported-not-promoted-implicitly', 'support requires an explicit source and exact section')
  }

  return deepFreeze(structuredClone(mapping))
}

export function validateExplicitGpMappings(mappings, context) {
  if (!Array.isArray(mappings)) throw new Error('[explicit-mapping-contract] mappings must be an explicit array')
  const seen = new Set()
  const validated = mappings.map((mapping) => {
    const key = `${mapping?.workflowId ?? '<missing>'}\u0000${mapping?.itemId ?? '<missing>'}`
    if (seen.has(key)) fail(mapping, 'unique-item-within-workflow', 'duplicate itemId in workflow mapping set')
    seen.add(key)
    return validateExplicitGpMapping(mapping, context)
  })
  return deepFreeze(validated)
}

export function assertNoTextMappingRequest(value) {
  for (const key of Object.keys(value ?? {})) {
    if (FORBIDDEN_TEXT_MAPPING_FIELDS.has(key)) fail(value, 'text-matching-unavailable', `${key} is prohibited`)
  }
  return true
}

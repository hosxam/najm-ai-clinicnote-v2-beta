import { sha256 } from '../common.mjs'
import {
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_VERSION,
} from '../canonicalMappingLedger.mjs'

export const GP_MAPPING_SUPPORT_STATUSES = new Set(['exact_section_supported'])
export const GP_MAPPING_ORIGINS = new Set(['legacy_exact', 'legacy_cleaned'])

const REQUIRED_FIELDS = CANONICAL_MAPPING_FIELDS

const REQUIRED_FIELD_SET = new Set(REQUIRED_FIELDS)

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

function assertPlainSchemaObject(mapping) {
  if (Object.getPrototypeOf(mapping) !== Object.prototype) {
    fail(mapping, 'plain-schema-owned-object', 'mapping must be a plain object with Object.prototype')
  }
  if (Object.getOwnPropertySymbols(mapping).length > 0) {
    fail(mapping, 'no-symbol-properties', 'mapping must not contain symbol properties')
  }
  for (const field of Object.keys(mapping)) {
    if (!REQUIRED_FIELD_SET.has(field)) {
      fail(mapping, 'no-unexpected-properties', `unexpected mapping property ${field}`)
    }
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

function validateRationale(mapping, rationale) {
  const normalized = rationale.toLowerCase()
  const requiredTokens = [mapping.workflowId, mapping.itemId, mapping.sourceId, mapping.sectionId]
  const substantiveDimensions = [
    /population|adult|child|pregnan|age/i,
    /setting|primary care|outpatient|inpatient|telehealth|emergency/i,
    /UAE|Dubai|United Arab Emirates|jurisdiction|local/i,
    /limit|exclude|scope|not applicable|not transfer/i,
  ]
  if (rationale.length < 160
    || requiredTokens.some((token) => !normalized.includes(token.toLowerCase()))
    || substantiveDimensions.some((pattern) => !pattern.test(rationale))) {
    fail(mapping, 'workflow-specific-applicability-rationale', 'applicabilityRationale must name the exact workflow, item, source, and section IDs and substantively address population, setting, UAE/local transfer, and material limitations in at least 160 characters')
  }
  if (/^(applicable|relevant|supports|same as|workflow specific|workflow-specific)\b/i.test(rationale)
    || /the exact reviewed source section is retained only for this workflow-owned documentation item/i.test(rationale)
    || /\b(?:applicable to this workflow|supports this item|relevant clinical guidance|uae review required|outpatient applicability|applies in primary care)\b/i.test(rationale)) {
    fail(mapping, 'generic-applicability-rationale', 'generic applicability rationale is prohibited')
  }
}

function validateApplicability(mapping, field) {
  const value = mapping[field]
  const normalized = value.toLowerCase()
  const requiredTokens = [mapping.workflowId, mapping.itemId, mapping.sourceId, mapping.sectionId]
  if (value.length < 100 || requiredTokens.some((token) => !normalized.includes(token.toLowerCase()))) {
    fail(mapping, `mapping-specific-${field}`, `${field} must name the exact workflow, item, source, and section IDs and state material limitations`)
  }
  if (/^(applicable|relevant|same as|primary care|outpatient|uae review required)\b/i.test(value)) {
    fail(mapping, `non-generic-${field}`, `${field} cannot use a generic or shared default statement`)
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

  assertPlainSchemaObject(mapping)

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
  for (const field of ['populationApplicability', 'settingApplicability', 'jurisdictionApplicability', 'uaeApplicability']) {
    validateApplicability(mapping, field)
  }

  if (!GP_MAPPING_SUPPORT_STATUSES.has(mapping.supportStatus)) {
    fail(mapping, 'permitted-support-status', `supportStatus must be one of ${[...GP_MAPPING_SUPPORT_STATUSES].join(', ')}`)
  }
  if (!GP_MAPPING_ORIGINS.has(mapping.origin)) {
    fail(mapping, 'permitted-origin', `origin must be one of ${[...GP_MAPPING_ORIGINS].join(', ')}`)
  }
  if (mapping.mappingVersion !== CANONICAL_MAPPING_VERSION) {
    fail(mapping, 'canonical-mapping-version', `mappingVersion must equal ${CANONICAL_MAPPING_VERSION}`)
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
  const sharedSemanticValues = new Map()
  const validated = mappings.map((mapping) => {
    const key = `${mapping?.workflowId ?? '<missing>'}\u0000${mapping?.itemId ?? '<missing>'}`
    if (seen.has(key)) fail(mapping, 'unique-item-within-workflow', 'duplicate itemId in workflow mapping set')
    seen.add(key)
    const result = validateExplicitGpMapping(mapping, context)
    for (const field of [
      'populationApplicability',
      'settingApplicability',
      'jurisdictionApplicability',
      'uaeApplicability',
      'applicabilityRationale',
    ]) {
      const normalized = result[field].replace(/\s+/g, ' ').trim().toLowerCase()
      const previousIdentity = sharedSemanticValues.get(`${field}\u0000${normalized}`)
      const identity = `${result.workflowId}\u0000${result.itemId}`
      if (previousIdentity && previousIdentity !== identity) {
        fail(mapping, 'no-cross-workflow-shared-clinical-prose', `${field} is reused unchanged across unrelated mappings`)
      }
      sharedSemanticValues.set(`${field}\u0000${normalized}`, identity)
    }
    return result
  })
  return deepFreeze(validated)
}

export function assertNoTextMappingRequest(value) {
  for (const key of Object.keys(value ?? {})) {
    if (FORBIDDEN_TEXT_MAPPING_FIELDS.has(key)) fail(value, 'text-matching-unavailable', `${key} is prohibited`)
  }
  return true
}

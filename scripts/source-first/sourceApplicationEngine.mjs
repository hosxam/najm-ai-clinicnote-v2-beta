export const SOURCE_REGISTRY_FILES = Object.freeze([
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
])

export const SOURCE_REGISTRY_SCHEMA_VERSIONS = Object.freeze(Object.fromEntries(
  SOURCE_REGISTRY_FILES.map((registryFile) => [registryFile, '2.0.0']),
))

export const SOURCE_REGISTRY_HEADER_TEMPLATES = Object.freeze({
  'international_clinical_sources.json': Object.freeze({
    schema_version: '2.0.0',
    verified_on: '2026-07-11',
    registry_scope: 'WHO and other authoritative international public-health guidance.',
  }),
  'nonclinical_operational_sources.json': Object.freeze({
    schema_version: '2.0.0',
    verified_on: '2026-07-11',
    registry_scope: 'Administrative, coding, interoperability, and operational documentation only.',
  }),
  'specialty_society_sources.json': Object.freeze({
    schema_version: '2.0.0',
    verified_on: '2026-07-11',
    registry_scope: 'Current official specialty-society guidelines.',
  }),
  'uae_clinical_sources.json': Object.freeze({
    schema_version: '2.0.0',
    verified_on: '2026-07-11',
    jurisdiction: 'United Arab Emirates',
  }),
})

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`[source-application] ${label} must be a plain object`)
  }
}

function sourceIdFromUpdate(sourceUpdate) {
  return sourceUpdate?.source?.source_id ?? sourceUpdate?.source_patch?.source_id ?? null
}

function registrySources(registryState, registryFile) {
  if (!(registryState instanceof Map)) {
    throw new Error('[source-application] registryState must be a Map')
  }
  if (!SOURCE_REGISTRY_FILES.includes(registryFile)) {
    throw new Error(`[source-application] unsupported source registry ${registryFile ?? 'missing'}`)
  }
  const registry = registryState.get(registryFile)
  if (!registry || !Array.isArray(registry.sources)) {
    throw new Error(`[source-application] ${registryFile} is absent from registryState`)
  }
  return registry.sources
}

function countOccurrences(value, search) {
  if (search === '') return 0
  let count = 0
  let offset = 0
  while ((offset = value.indexOf(search, offset)) >= 0) {
    count += 1
    offset += search.length
  }
  return count
}

function applyApplicabilityPatch(source, patch) {
  if (patch === undefined) return
  assertPlainObject(patch, 'source_patch.applicability_note')
  const allowed = new Set(['append', 'total_occurrences'])
  for (const key of Object.keys(patch)) {
    if (!allowed.has(key)) throw new Error(`[source-application] unsupported applicability_note patch field ${key}`)
  }
  if (typeof patch.append !== 'string' || patch.append.trim() === '') {
    throw new Error('[source-application] applicability_note.append must be a non-empty string')
  }
  const desiredOccurrences = patch.total_occurrences ?? 1
  if (!Number.isInteger(desiredOccurrences) || desiredOccurrences < 1) {
    throw new Error('[source-application] applicability_note.total_occurrences must be a positive integer')
  }
  const current = String(source.applicability_note ?? '')
  const occurrences = countOccurrences(current, patch.append)
  if (occurrences > desiredOccurrences) {
    throw new Error(`[source-application] ${source.source_id}: applicability suffix already exceeds its declared occurrence count`)
  }
  source.applicability_note = `${current}${Array.from(
    { length: desiredOccurrences - occurrences },
    () => ` ${patch.append}`,
  ).join('')}`.trim()
}

function applySectionPatch(source, sectionPatch) {
  if (sectionPatch === undefined) return
  assertPlainObject(sectionPatch, 'source_patch.exact_sections')
  if (Object.keys(sectionPatch).some((key) => key !== 'upsert')) {
    throw new Error('[source-application] exact_sections only supports the upsert operation')
  }
  if (!Array.isArray(sectionPatch.upsert)) {
    throw new Error('[source-application] exact_sections.upsert must be an array')
  }
  const additions = sectionPatch.upsert.map((section) => {
    assertPlainObject(section, 'exact section')
    if (typeof section.section_id !== 'string' || section.section_id.trim() === '') {
      throw new Error('[source-application] exact section requires section_id')
    }
    return structuredClone(section)
  })
  const additionIds = new Set(additions.map((section) => section.section_id))
  if (additionIds.size !== additions.length) {
    throw new Error(`[source-application] ${source.source_id}: duplicate exact-section patch identifier`)
  }
  source.exact_sections = [
    ...(source.exact_sections ?? []).filter((section) => !additionIds.has(section.section_id)),
    ...additions,
  ]
}

function deepMerge(target, patch, label) {
  assertPlainObject(patch, label)
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const current = target[key]
      if (current !== undefined && (!current || typeof current !== 'object' || Array.isArray(current))) {
        throw new Error(`[source-application] ${label}.${key} cannot merge into a non-object value`)
      }
      target[key] = deepMerge(structuredClone(current ?? {}), value, `${label}.${key}`)
    } else {
      target[key] = structuredClone(value)
    }
  }
  return target
}

export function createEmptySourceRegistryState({
  schemaVersions = SOURCE_REGISTRY_SCHEMA_VERSIONS,
  verifiedOn,
} = {}) {
  return new Map(SOURCE_REGISTRY_FILES.map((registryFile) => {
    const header = structuredClone(SOURCE_REGISTRY_HEADER_TEMPLATES[registryFile])
    header.schema_version = schemaVersions[registryFile] ?? header.schema_version
    if (verifiedOn) header.verified_on = verifiedOn
    return [registryFile, { ...header, sources: [] }]
  }))
}

export function cloneSourceRegistryState(registryState) {
  return new Map([...registryState].map(([registryFile, registry]) => [
    registryFile,
    structuredClone(registry),
  ]))
}

export function declarativeSourcePatch({
  registryFile,
  sourceId,
  upsertExactSections = [],
  appendApplicabilityNote,
  applicabilityNoteOccurrences = 1,
  merge = {},
}) {
  return {
    registry_file: registryFile,
    source_patch: {
      source_id: sourceId,
      ...(appendApplicabilityNote ? {
        applicability_note: {
          append: appendApplicabilityNote,
          total_occurrences: applicabilityNoteOccurrences,
        },
      } : {}),
      ...(upsertExactSections.length > 0 ? { exact_sections: { upsert: upsertExactSections } } : {}),
      ...(Object.keys(merge).length > 0 ? { merge } : {}),
    },
  }
}

export function resolveSourceUpdateAgainstState({ registryState, sourceUpdate }) {
  assertPlainObject(sourceUpdate, 'source update')
  const registryFile = sourceUpdate.registry_file
  const sources = registrySources(registryState, registryFile)
  const hasFullSource = Object.hasOwn(sourceUpdate, 'source')
  const hasPatch = Object.hasOwn(sourceUpdate, 'source_patch')
  if (hasFullSource === hasPatch) {
    throw new Error('[source-application] source update must contain exactly one of source or source_patch')
  }
  if (hasFullSource) {
    assertPlainObject(sourceUpdate.source, 'source update.source')
    if (!sourceUpdate.source.source_id) throw new Error('[source-application] full source update requires source_id')
    return { registryFile, source: structuredClone(sourceUpdate.source), operation: 'full_source' }
  }

  const patch = sourceUpdate.source_patch
  assertPlainObject(patch, 'source update.source_patch')
  const allowed = new Set(['source_id', 'applicability_note', 'exact_sections', 'merge'])
  for (const key of Object.keys(patch)) {
    if (!allowed.has(key)) throw new Error(`[source-application] unsupported source patch field ${key}`)
  }
  if (typeof patch.source_id !== 'string' || patch.source_id.trim() === '') {
    throw new Error('[source-application] source patch requires source_id')
  }
  const existing = sources.find((source) => source.source_id === patch.source_id)
  if (!existing) throw new Error(`[source-application] ${patch.source_id}: source patch has no prior full source definition`)
  const source = structuredClone(existing)
  applyApplicabilityPatch(source, patch.applicability_note)
  applySectionPatch(source, patch.exact_sections)
  if (patch.merge !== undefined) deepMerge(source, patch.merge, 'source_patch.merge')
  if (source.source_id !== patch.source_id) {
    throw new Error('[source-application] source patch cannot change source_id')
  }
  return { registryFile, source, operation: 'declarative_patch' }
}

export function upsertSourceInRegistryState({ registryState, registryFile, source }) {
  const sources = registrySources(registryState, registryFile)
  const otherRegistry = SOURCE_REGISTRY_FILES.find((candidate) => candidate !== registryFile
    && registryState.get(candidate)?.sources?.some((entry) => entry.source_id === source.source_id))
  if (otherRegistry) {
    throw new Error(`[source-application] ${source.source_id}: source already belongs to ${otherRegistry}`)
  }
  const existingIndex = sources.findIndex((entry) => entry.source_id === source.source_id)
  if (existingIndex >= 0) sources[existingIndex] = structuredClone(source)
  else sources.push(structuredClone(source))
  sources.sort((left, right) => left.source_id.localeCompare(right.source_id))
  return source
}

export function sourceUpdateIdentity(sourceUpdate) {
  return {
    sourceId: sourceIdFromUpdate(sourceUpdate),
    registryFile: sourceUpdate?.registry_file ?? null,
    operation: Object.hasOwn(sourceUpdate ?? {}, 'source_patch') ? 'declarative_patch' : 'full_source',
  }
}

export function sourceRecordsFromRegistryState(registryState) {
  return SOURCE_REGISTRY_FILES.flatMap((registryFile) => {
    const registry = registryState.get(registryFile)
    return (registry?.sources ?? []).map((source) => ({
      registryFile,
      registrySchemaVersion: registry.schema_version,
      source: structuredClone(source),
    }))
  }).sort((left, right) => left.source.source_id.localeCompare(right.source.source_id))
}

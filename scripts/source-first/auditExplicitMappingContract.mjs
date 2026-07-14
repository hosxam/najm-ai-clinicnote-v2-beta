import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  listClinicalItems,
  readJson,
} from './common.mjs'
import { validateExplicitGpMappings } from './batches/gpExplicitMappingContract.mjs'

const batchDirectory = path.join(ROOT_DIR, 'scripts', 'source-first', 'batches')
const forbiddenEmissionKeys = new Set(['text', 'texts', 'exactText', 'exactTexts', 'exact_texts', 'label', 'labels', 'alias', 'aliases', 'fuzzy', 'substring', 'keywords'])
const batchFiles = fs.readdirSync(batchDirectory)
  .filter((name) => /^batch-\d{4}-\d{4}\.mjs$/.test(name))
  .sort()

const sourceRecords = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
  .filter((name) => name.endsWith('.json'))
  .sort()
  .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
const sourcesById = new Map(sourceRecords.map((source) => [source.source_id, source]))
const workflowCache = new Map()

function fail(fileName, workflowId, rule, detail) {
  throw new Error(`[explicit-mapping-audit] file=${fileName} workflow=${workflowId ?? '<unknown>'} rule=${rule}: ${detail}`)
}

function workflowFor(workflowId) {
  if (!workflowCache.has(workflowId)) {
    workflowCache.set(workflowId, readJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`)))
  }
  return workflowCache.get(workflowId)
}

let workflowCount = 0
let emittedMappingCount = 0

for (const fileName of batchFiles) {
  const sourceText = fs.readFileSync(path.join(batchDirectory, fileName), 'utf8')
  if (/gpBatchSupport\.mjs/.test(sourceText) && /\b(?:gpEvidence|gpNoSource|exact_texts|supportTexts)\b/.test(sourceText)) {
    fail(fileName, null, 'retired-gp-text-api', 'GP batch still uses a retired text/default mapping API')
  }

  const batch = (await import(`${pathToFileURL(path.join(batchDirectory, fileName)).href}?explicit-audit=1`)).default
  if (!batch || !Array.isArray(batch.workflows)) fail(fileName, null, 'batch-shape', 'batch must export a workflows array')

  for (const config of batch.workflows) {
    const workflowId = config.workflow_id
    workflowCount += 1
    for (const field of ['population_applicability', 'setting_applicability', 'UAE_applicability']) {
      if (!Object.hasOwn(config, field) || typeof config[field] !== 'string' || config[field].trim() === '') {
        fail(fileName, workflowId, `explicit-${field}`, `${field} must be explicitly emitted and non-empty`)
      }
    }
    if (!Array.isArray(config.support_groups)) fail(fileName, workflowId, 'support-groups-array', 'support_groups must be an explicit array')

    const workflow = workflowFor(workflowId)
    const itemIds = new Set(listClinicalItems(workflow).map((item) => item.item_id))
    const mappedIds = new Set()
    const reviewedSources = new Set(config.exact_documents_opened ?? [])
    const reviewedSections = new Set(config.exact_sections_reviewed ?? [])

    for (const group of config.support_groups) {
      for (const key of Object.keys(group)) {
        if (forbiddenEmissionKeys.has(key)) fail(fileName, workflowId, 'no-text-mapping-emission', `support group emitted forbidden field ${key}`)
      }
      if (typeof group.source_id !== 'string' || group.source_id === '') fail(fileName, workflowId, 'exact-source-id', 'support group lacks exact source_id')
      if (typeof group.source_section_id !== 'string' || group.source_section_id === '') fail(fileName, workflowId, 'exact-section-id', 'support group lacks exact source_section_id')
      if (typeof group.relationship !== 'string' || group.relationship.trim().length < 20) fail(fileName, workflowId, 'direct-relationship', 'support group lacks a specific direct relationship')
      if (!Array.isArray(group.item_ids)) fail(fileName, workflowId, 'exact-item-ids', 'support group item_ids must be an explicit array')
      if (!reviewedSources.has(group.source_id)) fail(fileName, workflowId, 'source-recorded-opened', `${group.source_id} was not recorded as opened`)
      if (!reviewedSections.has(group.source_section_id)) fail(fileName, workflowId, 'section-recorded-reviewed', `${group.source_section_id} was not recorded as reviewed`)
      const source = sourcesById.get(group.source_id)
      if (!source) fail(fileName, workflowId, 'registered-source', `${group.source_id} is not registered`)
      if (!source.exact_sections?.some(({ section_id: sectionId }) => sectionId === group.source_section_id)) {
        fail(fileName, workflowId, 'section-belongs-to-source', `${group.source_section_id} is not registered under ${group.source_id}`)
      }
      if (group.item_ids.length === 0) continue
      for (const itemId of group.item_ids) {
        if (!itemIds.has(itemId)) fail(fileName, workflowId, 'workflow-owned-item-id', `${itemId} is not owned by the exact workflow`)
        if (mappedIds.has(itemId)) fail(fileName, workflowId, 'unique-item-id', `${itemId} is mapped more than once`)
        mappedIds.add(itemId)
        emittedMappingCount += 1
      }
    }
  }
}

const ledger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))
for (const record of ledger.workflows) {
  const workflow = workflowFor(record.workflowId)
  validateExplicitGpMappings(record.mappings, {
    workflowsById: new Map([[record.workflowId, workflow]]),
    itemsByWorkflowId: new Map([[record.workflowId, new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))]]),
    sourcesById,
    reviewedSourceIds: new Set(record.exactDocumentsOpened),
    reviewedSectionIds: new Set(record.exactSectionsReviewed),
  })
}

console.log(JSON.stringify({
  status: 'PASS',
  batchesInspected: batchFiles.length,
  workflowConfigsInspected: workflowCount,
  emittedMappingsInspected: emittedMappingCount,
  gpExplicitMappingsInspected: ledger.mappingCount,
  rules: [
    'No retired GP text/default mapping API',
    'All emitted mappings contain exact workflow-owned item IDs',
    'All emitted mappings contain exact registered source and reviewed section IDs',
    'All workflow configs emit explicit population, setting, and UAE applicability',
    'All GP 0626-0675 mappings satisfy the fail-closed explicit mapping contract',
  ],
}, null, 2))

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  getResearchPaths,
  listClinicalItems,
  readJson,
  readJsonl,
} from './common.mjs'

const SUPPORTED_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const EARLY_GP_WORKFLOWS = new Set(['gp-cough', 'gp-dizziness', 'gp-fever-urti', 'gp-headache', 'gp-sore-throat'])
const MAPPING_FIELDS = new Set(['item_id', 'source_id', 'source_section_id', 'direct_relationship'])
const FORBIDDEN_MAPPING_FIELDS = new Set([
  'text', 'texts', 'exactText', 'exactTexts', 'exact_texts', 'label', 'labels',
  'alias', 'aliases', 'category', 'position', 'keyword', 'keywords', 'substring', 'fuzzy',
])
const ALLOWED_MAPPING_WRITERS = new Set(['applyResearchBatch.mjs', 'correctGpMappings.mjs'])

function recursiveMjsFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name)
    return entry.isDirectory() ? recursiveMjsFiles(filePath) : (entry.name.endsWith('.mjs') ? [filePath] : [])
  })
}

function signature(row) {
  return [row.workflow_id, row.item_id, row.source_id, row.section_id, row.direct_relationship].join('\u0000')
}

function compareLedgers(name, leftRows, rightRows) {
  const left = new Set(leftRows.map(signature))
  const right = new Set(rightRows.map(signature))
  const missing = [...left].filter((key) => !right.has(key))
  const unexpected = [...right].filter((key) => !left.has(key))
  if (missing.length || unexpected.length || left.size !== leftRows.length || right.size !== rightRows.length) {
    throw new Error(`[explicit-mapping-audit] ${name} mismatch: missing=${missing.length} unexpected=${unexpected.length} leftDuplicates=${leftRows.length - left.size} rightDuplicates=${rightRows.length - right.size}`)
  }
}

export function scanStaticClinicalMappingSource(fileName, sourceText, { historicalBatch = false } = {}) {
  const errors = []
  const baseName = path.basename(fileName)
  const normalizedPath = fileName.replaceAll('\\', '/')
  const isRetiredAuthoredHelper = baseName === 'authoredBatchSupport.mjs'
    && /supportTexts is retired/.test(sourceText)
    && !/function normalizeText|function workflowItems/.test(sourceText)
  const isRetiredInitialFinalizer = baseName === 'finalizeInitialResearch.mjs'
    && /is retired/.test(sourceText)
    && !/legacy_item_support_mappings\s*=/.test(sourceText)
  const isRetiredGpBuilder = baseName === 'buildGpExplicitMappingLedger.mjs'
    && /is retired/.test(sourceText)
    && !/legacy_item_support_mappings/.test(sourceText)
  const isRejectingApplyWriter = baseName === 'applyResearchBatch.mjs'
    && /text-to-item mapping field/.test(sourceText)
    && /requires at least one explicit workflow-owned item_id/.test(sourceText)
  const isCorrectionRemovalTool = baseName === 'correctGpMappings.mjs'
    && /final_disposition:\s*'REMOVE_TO_UNSUPPORTED'/.test(sourceText)
    && /retained_mappings:\s*0/.test(sourceText)
  const isContractImplementation = baseName === 'gpExplicitMappingContract.mjs'
    && /FORBIDDEN_TEXT_MAPPING_FIELDS/.test(sourceText)
    && /assertPlainSchemaObject/.test(sourceText)

  if (historicalBatch) {
    if (/legacy_item_support_mappings\s*[:=]|clinical_review_status\s*=/.test(sourceText)) {
      errors.push(`${normalizedPath}: historical text batch contains a direct mapping writer`)
    }
    return errors
  }

  if (/\bsupportTexts\s*\(/.test(sourceText) && !isRetiredAuthoredHelper) {
    errors.push(`${normalizedPath}: text-to-item resolver or wrapper remains executable`)
  }
  if ((/\bexact_texts\b|function\s+normalizeText\s*\(|exact support text not found/i.test(sourceText))
    && !isRetiredAuthoredHelper && !isRejectingApplyWriter && !isCorrectionRemovalTool && !isContractImplementation) {
    errors.push(`${normalizedPath}: text-derived clinical mapping mechanism is prohibited`)
  }
  if (/\[\s*(?:['"](?:itemId|item_id|sourceId|source_id|sectionId|source_section_id)['"]|[A-Za-z_$][\w$]*)\s*\]\s*:/.test(sourceText)) {
    errors.push(`${normalizedPath}: computed clinical mapping property is prohibited`)
  }
  if (/\.\.\.[A-Za-z_$][\w$]*[\s\S]{0,600}(?:populationApplicability|settingApplicability|jurisdictionApplicability|uaeApplicability)/.test(sourceText)
    && !isCorrectionRemovalTool) {
    errors.push(`${normalizedPath}: shared or spread applicability object is prohibited`)
  }
  if (/legacy_item_support_mappings\s*[:=]|clinical_review_status\s*=\s*['"]legacy_exact_source_supported_pending_clinician_review['"]/.test(sourceText)
    && !ALLOWED_MAPPING_WRITERS.has(baseName)) {
    errors.push(`${normalizedPath}: unapproved clinical mapping writer or alternate mapping location`)
  }
  if (baseName === 'authoredBatchSupport.mjs' && !isRetiredAuthoredHelper) errors.push(`${normalizedPath}: authored text helper is not fail-closed retired`)
  if (baseName === 'finalizeInitialResearch.mjs' && !isRetiredInitialFinalizer) errors.push(`${normalizedPath}: initial mapping writer is not fail-closed retired`)
  if (baseName === 'buildGpExplicitMappingLedger.mjs' && !isRetiredGpBuilder) errors.push(`${normalizedPath}: previous-output GP ledger builder is not fail-closed retired`)
  return errors
}

function sourceRegistry() {
  const sources = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
  return new Map(sources.map((source) => [source.source_id, source]))
}

export function runExplicitMappingAudit() {
  const sourcesById = sourceRegistry()
  const persistedRows = []
  const workflowRows = []
  const inspectedWorkflowIds = new Set()

  for (const researchPath of getResearchPaths()) {
    const research = readJson(researchPath)
    const workflowId = research.workflow_id
    inspectedWorkflowIds.add(workflowId)
    const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`))
    const itemById = new Map(listClinicalItems(workflow).map((item) => [item.item_id, item]))
    const openedSources = new Set(research.exact_documents_opened ?? [])
    const reviewedSections = new Set(research.exact_sections_reviewed ?? [])
    const seenItems = new Set()

    for (const mapping of research.legacy_item_support_mappings ?? []) {
      if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping) || Object.getPrototypeOf(mapping) !== Object.prototype) {
        throw new Error(`[explicit-mapping-audit] ${workflowId}: mapping must be a plain object`)
      }
      for (const field of Object.keys(mapping)) {
        if (FORBIDDEN_MAPPING_FIELDS.has(field)) throw new Error(`[explicit-mapping-audit] ${workflowId}: forbidden text mapping field ${field}`)
        if (!MAPPING_FIELDS.has(field)) throw new Error(`[explicit-mapping-audit] ${workflowId}: unexpected persisted mapping field ${field}`)
      }
      for (const field of MAPPING_FIELDS) {
        if (!Object.hasOwn(mapping, field) || typeof mapping[field] !== 'string' || mapping[field].trim() === '') {
          throw new Error(`[explicit-mapping-audit] ${workflowId}: missing explicit ${field}`)
        }
      }
      if (seenItems.has(mapping.item_id)) throw new Error(`[explicit-mapping-audit] ${workflowId}: duplicate or conflicting mapping for ${mapping.item_id}`)
      seenItems.add(mapping.item_id)
      const item = itemById.get(mapping.item_id)
      if (!item) throw new Error(`[explicit-mapping-audit] ${workflowId}: missing workflow-owned item ${mapping.item_id}`)
      const source = sourcesById.get(mapping.source_id)
      const section = source?.exact_sections?.find((candidate) => candidate.section_id === mapping.source_section_id)
      if (!source || !section) throw new Error(`[explicit-mapping-audit] ${workflowId}: invalid source/section ${mapping.source_id}/${mapping.source_section_id}`)
      if (!openedSources.has(mapping.source_id) || !reviewedSections.has(mapping.source_section_id)) {
        throw new Error(`[explicit-mapping-audit] ${workflowId}: source/section was not recorded opened and reviewed`)
      }
      if (item.clinical_review_status !== SUPPORTED_STATUS
        || item.source_ids?.length !== 1 || item.source_ids[0] !== mapping.source_id
        || item.source_section_ids?.length !== 1 || item.source_section_ids[0] !== mapping.source_section_id
        || item.evidence_relationship !== mapping.direct_relationship) {
        throw new Error(`[explicit-mapping-audit] ${workflowId}: persisted mapping and workflow item provenance differ for ${mapping.item_id}`)
      }
      persistedRows.push({
        workflow_id: workflowId,
        item_id: mapping.item_id,
        source_id: mapping.source_id,
        section_id: mapping.source_section_id,
        direct_relationship: mapping.direct_relationship,
      })
    }

    for (const item of itemById.values()) {
      if (item.clinical_review_status !== SUPPORTED_STATUS) continue
      if (item.source_ids?.length !== 1 || item.source_section_ids?.length !== 1 || typeof item.evidence_relationship !== 'string') {
        throw new Error(`[explicit-mapping-audit] ${workflowId}: supported workflow item lacks exact provenance ${item.item_id}`)
      }
      workflowRows.push({
        workflow_id: workflowId,
        item_id: item.item_id,
        source_id: item.source_ids[0],
        section_id: item.source_section_ids[0],
        direct_relationship: item.evidence_relationship,
      })
    }
  }

  const explicitLedgerRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'))
  compareLedgers('persisted research versus workflow item provenance', persistedRows, workflowRows)
  compareLedgers('persisted research versus explicit supported ledger', persistedRows, explicitLedgerRows)

  const gpCorrectionRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl'))
  if (gpCorrectionRows.length !== 1164) throw new Error(`[explicit-mapping-audit] GP correction ledger expected 1164 rows; found ${gpCorrectionRows.length}`)
  if (gpCorrectionRows.some((row) => row.final_disposition !== 'REMOVE_TO_UNSUPPORTED' || row.resulting_support_status !== 'unsupported_pending_review')) {
    throw new Error('[explicit-mapping-audit] GP correction ledger contains an unreviewed retained or inconsistent mapping')
  }
  const removedKeys = new Set(gpCorrectionRows.map((row) => `${row.workflow_id}\u0000${row.original_item_id}`))
  if (persistedRows.some((row) => removedKeys.has(`${row.workflow_id}\u0000${row.item_id}`))) {
    throw new Error('[explicit-mapping-audit] removed GP mapping remains in persisted support records')
  }

  const gpLedger = readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))
  if (gpLedger.mappingCount !== 0 || gpLedger.workflows.some((record) => record.mappings.length !== 0)) {
    throw new Error('[explicit-mapping-audit] stale numbered GP mapping remains in the explicit GP ledger')
  }

  const staticErrors = []
  let historicalTextBatchCount = 0
  const sourceFirstDirectory = path.join(ROOT_DIR, 'scripts', 'source-first')
  for (const filePath of recursiveMjsFiles(sourceFirstDirectory)) {
    const relative = path.relative(sourceFirstDirectory, filePath).replaceAll('\\', '/')
    if (/\.test\.mjs$/.test(relative) || relative === 'auditExplicitMappingContract.mjs' || relative === 'writeGpHelperRemediationReports.mjs') continue
    const sourceText = fs.readFileSync(filePath, 'utf8')
    const historicalBatch = /^batches\/batch-\d{4}-\d{4}\.mjs$/.test(relative)
      && /\bsupportTexts\s*\(|\bexact_texts\b/.test(sourceText)
    if (historicalBatch) historicalTextBatchCount += 1
    staticErrors.push(...scanStaticClinicalMappingSource(relative, sourceText, { historicalBatch }))
  }
  if (staticErrors.length) throw new Error(`[explicit-mapping-audit] static guard failures:\n${staticErrors.join('\n')}`)

  const earlyWorkflowsInspected = [...EARLY_GP_WORKFLOWS].filter((workflowId) => inspectedWorkflowIds.has(workflowId)).length
  if (earlyWorkflowsInspected !== EARLY_GP_WORKFLOWS.size) throw new Error('[explicit-mapping-audit] early GP workflows were not all inspected')

  return {
    status: 'PASS',
    researchRecordsInspected: inspectedWorkflowIds.size,
    earlyGpWorkflowsInspected: earlyWorkflowsInspected,
    persistedSupportedMappings: persistedRows.length,
    workflowSupportedMappings: workflowRows.length,
    guardInspectedSupportedMappings: persistedRows.length,
    explicitMappingLedgerRecords: explicitLedgerRows.length,
    gpCorrectionRecordsInspected: gpCorrectionRows.length,
    numberedGpMappingsRemaining: gpLedger.mappingCount,
    historicalTextBatchSnapshotsRetainedButIncapableOfEmission: historicalTextBatchCount,
    reconciliationEqual: persistedRows.length === workflowRows.length && persistedRows.length === explicitLedgerRows.length,
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    console.log(JSON.stringify(runExplicitMappingAudit(), null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

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
  sha256,
  stableValue,
} from './common.mjs'
import {
  CANONICAL_MAPPING_FIELDS,
  CANONICAL_MAPPING_VERSION,
  canonicalMappingKey,
  emitCanonicalMappings,
  readCanonicalMappings,
} from './canonicalMappingLedger.mjs'
import { validateExplicitGpMappings } from './batches/gpExplicitMappingContract.mjs'

const SUPPORTED_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const EARLY_GP_WORKFLOWS = new Set(['gp-cough', 'gp-dizziness', 'gp-fever-urti', 'gp-headache', 'gp-sore-throat'])
const CANONICAL_FIELD_SET = new Set(CANONICAL_MAPPING_FIELDS)
const FORBIDDEN_MAPPING_FIELDS = new Set([
  'text', 'texts', 'exactText', 'exactTexts', 'exact_texts', 'label', 'labels',
  'alias', 'aliases', 'category', 'position', 'keyword', 'keywords', 'substring', 'fuzzy',
])
const ALLOWED_MAPPING_WRITERS = new Set([
  'applyResearchBatch.mjs',
  'correctGpMappings.mjs',
  'correctGlobalMappingArchitecture.mjs',
])
const SKIPPED_DIRECTORIES = new Set(['.git', '.agents', '.codex', 'dist', 'node_modules', 'public', 'clinical-expansion-v2'])
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'])

function recursiveSourceFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) return []
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return recursiveSourceFiles(filePath)
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [filePath] : []
  })
}

function semanticSignature(mapping) {
  return JSON.stringify(stableValue(Object.fromEntries(CANONICAL_MAPPING_FIELDS.map((field) => [field, mapping[field]]))))
}

export function compareMappingSets(name, leftRows, rightRows) {
  const leftKeys = new Map(leftRows.map((row) => [canonicalMappingKey(row), semanticSignature(row)]))
  const rightKeys = new Map(rightRows.map((row) => [canonicalMappingKey(row), semanticSignature(row)]))
  const missing = [...leftKeys].filter(([key]) => !rightKeys.has(key))
  const unexpected = [...rightKeys].filter(([key]) => !leftKeys.has(key))
  const altered = [...leftKeys].filter(([key, value]) => rightKeys.has(key) && rightKeys.get(key) !== value)
  const leftDuplicates = leftRows.length - leftKeys.size
  const rightDuplicates = rightRows.length - rightKeys.size
  if (missing.length || unexpected.length || altered.length || leftDuplicates || rightDuplicates) {
    throw new Error(`[explicit-mapping-audit] ${name} mismatch: missing=${missing.length} unexpected=${unexpected.length} altered=${altered.length} leftDuplicates=${leftDuplicates} rightDuplicates=${rightDuplicates}`)
  }
  return true
}

export function scanStaticClinicalMappingSource(fileName, sourceText, { historicalBatch = false } = {}) {
  const errors = []
  const baseName = path.basename(fileName)
  const normalizedPath = fileName.replaceAll('\\', '/')
  const approvedWriter = ALLOWED_MAPPING_WRITERS.has(baseName)
  const retiredAuthoredHelper = baseName === 'authoredBatchSupport.mjs'
    && /supportTexts is retired/.test(sourceText)
  const retiredInitialFinalizer = baseName === 'finalizeInitialResearch.mjs'
    && /is retired/.test(sourceText)
  const retiredGpBuilder = baseName === 'buildGpExplicitMappingLedger.mjs'
    && /is retired/.test(sourceText)
  const contractImplementation = baseName === 'gpExplicitMappingContract.mjs'
    && /FORBIDDEN_TEXT_MAPPING_FIELDS/.test(sourceText)

  if (historicalBatch) {
    if (/legacy_item_support_mappings\s*[:=]|clinical_review_status\s*=/.test(sourceText)) {
      errors.push(`${normalizedPath}: historical batch contains a direct supported-mapping writer`)
    }
    return errors
  }
  if (/\bsupportTexts\s*\(/.test(sourceText) && !retiredAuthoredHelper) {
    errors.push(`${normalizedPath}: text-to-item resolver or wrapper remains executable`)
  }
  if ((/\bexact_texts\b|function\s+normalizeText\s*\(|exact support text not found/i.test(sourceText))
    && !retiredAuthoredHelper && !approvedWriter && !contractImplementation) {
    errors.push(`${normalizedPath}: text-derived clinical mapping mechanism is prohibited`)
  }
  if (/\{[\s\S]{0,300}\[[^\]]+\]\s*:[\s\S]{0,300}(?:workflowId|itemId|item_id|sourceId|source_id|sectionId|source_section_id)\s*:/.test(sourceText)
    || /\{[\s\S]{0,300}(?:workflowId|itemId|item_id|sourceId|source_id|sectionId|source_section_id)\s*:[\s\S]{0,300}\[[^\]]+\]\s*:/.test(sourceText)) {
    errors.push(`${normalizedPath}: computed clinical mapping property is prohibited`)
  }
  if ((/\{\s*\.\.\.[A-Za-z_$][\w$]*\s*,[\s\S]{0,500}(?:populationApplicability|settingApplicability|jurisdictionApplicability|uaeApplicability)\s*:/.test(sourceText)
      || /\{\s*\.\.\.[A-Za-z_$][\w$]*\s*,[\s\S]{0,500}workflowId\s*:[\s\S]{0,500}itemId\s*:/.test(sourceText)
      || /\{\s*\.\.\.[A-Za-z_$][\w$]*\s*,[\s\S]{0,500}itemId\s*:[\s\S]{0,500}workflowId\s*:/.test(sourceText))
    && !approvedWriter && !contractImplementation) {
    errors.push(`${normalizedPath}: shared or spread applicability object is prohibited`)
  }
  if (/(?:populationApplicability|settingApplicability|jurisdictionApplicability|uaeApplicability)\s*:\s*[A-Za-z_$][\w$]*/.test(sourceText)
    && !approvedWriter && !contractImplementation) {
    errors.push(`${normalizedPath}: applicability supplied through a default or shared variable is prohibited`)
  }
  if (/Object\.assign\s*\([^)]*(?:mapping|support)[^)]*\)/i.test(sourceText) && !approvedWriter && !contractImplementation) {
    errors.push(`${normalizedPath}: shared object assignment into a clinical mapping is prohibited`)
  }
  if (/applicabilityRationale\s*:\s*['"`](?:applicable|relevant|this exact source|supports this item|uae review required)/i.test(sourceText)
    && !approvedWriter && !contractImplementation) {
    errors.push(`${normalizedPath}: generic applicability rationale is prohibited`)
  }
  if (/\bimport\s*\([^)]*(?:mapping|support|clinical)[^)]*\)/i.test(sourceText) && !approvedWriter) {
    errors.push(`${normalizedPath}: dynamic clinical mapping import is prohibited outside the canonical loader`)
  }
  if (/legacy_item_support_mappings\s*[:=]|clinical_review_status\s*=\s*['"]legacy_exact_source_supported_pending_clinician_review['"]/.test(sourceText)
    && !approvedWriter) {
    errors.push(`${normalizedPath}: unapproved clinical mapping writer or alternate mapping location`)
  }
  if (baseName === 'authoredBatchSupport.mjs' && !retiredAuthoredHelper) errors.push(`${normalizedPath}: authored text helper is not fail-closed retired`)
  if (baseName === 'finalizeInitialResearch.mjs' && !retiredInitialFinalizer) errors.push(`${normalizedPath}: initial mapping writer is not fail-closed retired`)
  if (baseName === 'buildGpExplicitMappingLedger.mjs' && !retiredGpBuilder) errors.push(`${normalizedPath}: previous-output GP ledger builder is not fail-closed retired`)
  return errors
}

export function scanRepositoryForMappingRisks(rootDirectory = ROOT_DIR) {
  const errors = []
  let historicalTextBatchCount = 0
  for (const filePath of recursiveSourceFiles(rootDirectory)) {
    const relative = path.relative(rootDirectory, filePath).replaceAll('\\', '/')
    if (/\.test\.[mc]?[jt]sx?$/.test(relative)
      || relative.endsWith('auditExplicitMappingContract.mjs')
      || relative.endsWith('writeGpHelperRemediationReports.mjs')) continue
    const sourceText = fs.readFileSync(filePath, 'utf8')
    const historicalBatch = /(?:^|\/)batches\/batch-\d{4}-\d{4}\.mjs$/.test(relative)
      && /\bsupportTexts\s*\(|\bexact_texts\b/.test(sourceText)
    if (historicalBatch) historicalTextBatchCount += 1
    errors.push(...scanStaticClinicalMappingSource(relative, sourceText, { historicalBatch }))
  }
  return { errors, historicalTextBatchCount }
}

function sourceRegistry() {
  const sources = fs.readdirSync(path.join(EXPANSION_DIR, 'sources'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? [])
  return new Map(sources.map((source) => [source.source_id, source]))
}

function validateCanonicalRows(rows, sourcesById, workflowById, researchById) {
  const reviewedSourceIds = new Set([...researchById.values()].flatMap((research) => research.exact_documents_opened ?? []))
  const reviewedSectionIds = new Set([...researchById.values()].flatMap((research) => research.exact_sections_reviewed ?? []))
  validateExplicitGpMappings(rows, {
    workflowsById: workflowById,
    itemsByWorkflowId: new Map([...workflowById].map(([workflowId, workflow]) => [
      workflowId,
      new Map(listClinicalItems(workflow).map((item) => [item.item_id, item])),
    ])),
    sourcesById,
    reviewedSourceIds,
    reviewedSectionIds,
  })
  for (const mapping of rows) {
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping) || Object.getPrototypeOf(mapping) !== Object.prototype) {
      throw new Error('[explicit-mapping-audit] canonical mapping must be a plain schema-owned object')
    }
    for (const field of Object.keys(mapping)) {
      if (FORBIDDEN_MAPPING_FIELDS.has(field)) throw new Error(`[explicit-mapping-audit] forbidden text mapping field ${field}`)
      if (!CANONICAL_FIELD_SET.has(field)) throw new Error(`[explicit-mapping-audit] unexpected canonical mapping field ${field}`)
    }
    for (const field of CANONICAL_MAPPING_FIELDS) {
      if (!Object.hasOwn(mapping, field) || typeof mapping[field] !== 'string' || mapping[field].trim() === '') {
        throw new Error(`[explicit-mapping-audit] missing explicit canonical field ${field}`)
      }
    }
    if (mapping.mappingVersion !== CANONICAL_MAPPING_VERSION) throw new Error('[explicit-mapping-audit] invalid canonical mapping version')
    const workflow = workflowById.get(mapping.workflowId)
    const research = researchById.get(mapping.workflowId)
    const item = workflow && listClinicalItems(workflow).find((candidate) => candidate.item_id === mapping.itemId)
    const source = sourcesById.get(mapping.sourceId)
    const section = source?.exact_sections?.find((candidate) => candidate.section_id === mapping.sectionId)
    if (!item || !source || !section) throw new Error(`[explicit-mapping-audit] invalid canonical identity ${canonicalMappingKey(mapping)}`)
    if (!research.exact_documents_opened.includes(mapping.sourceId) || !research.exact_sections_reviewed.includes(mapping.sectionId)) {
      throw new Error(`[explicit-mapping-audit] canonical source/section not opened and reviewed ${canonicalMappingKey(mapping)}`)
    }
    if (mapping.sourceHash !== sha256(source) || mapping.sectionHash !== sha256(section)) {
      throw new Error(`[explicit-mapping-audit] canonical source/section hash mismatch ${canonicalMappingKey(mapping)}`)
    }
  }
}

export function runExplicitMappingAudit() {
  const sourcesById = sourceRegistry()
  const workflowById = new Map()
  const researchById = new Map()
  const persistedRows = []
  const workflowSupportedKeys = []
  for (const researchPath of getResearchPaths()) {
    const research = readJson(researchPath)
    const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${research.workflow_id}.json`))
    researchById.set(research.workflow_id, research)
    workflowById.set(research.workflow_id, workflow)
    persistedRows.push(...(research.legacy_item_support_mappings ?? []))
    for (const item of listClinicalItems(workflow)) {
      if (item.clinical_review_status !== SUPPORTED_STATUS) continue
      if (item.source_ids?.length !== 1 || item.source_section_ids?.length !== 1) {
        throw new Error(`[explicit-mapping-audit] supported workflow item lacks exact provenance ${item.item_id}`)
      }
      workflowSupportedKeys.push([research.workflow_id, item.item_id, item.source_ids[0], item.source_section_ids[0]].join('\u0000'))
    }
  }

  const canonicalRows = readCanonicalMappings()
  const explicitRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'))
  const runtimeRows = [...emitCanonicalMappings()]
  validateCanonicalRows(canonicalRows, sourcesById, workflowById, researchById)
  validateCanonicalRows(persistedRows, sourcesById, workflowById, researchById)
  validateCanonicalRows(explicitRows, sourcesById, workflowById, researchById)
  validateCanonicalRows(runtimeRows, sourcesById, workflowById, researchById)
  compareMappingSets('canonical versus persisted research', canonicalRows, persistedRows)
  compareMappingSets('canonical versus explicit evidence ledger', canonicalRows, explicitRows)
  compareMappingSets('canonical versus runtime emission', canonicalRows, runtimeRows)
  const canonicalKeys = new Set(canonicalRows.map(canonicalMappingKey))
  const workflowUnexpected = workflowSupportedKeys.filter((key) => !canonicalKeys.has(key))
  const workflowMissing = [...canonicalKeys].filter((key) => !workflowSupportedKeys.includes(key))
  if (workflowUnexpected.length || workflowMissing.length || workflowSupportedKeys.length !== new Set(workflowSupportedKeys).size) {
    throw new Error(`[explicit-mapping-audit] canonical versus workflow provenance mismatch: missing=${workflowMissing.length} unexpected=${workflowUnexpected.length}`)
  }

  const unsupported = new Set(readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl'))
    .map((row) => `${row.workflow_id}\u0000${row.item_id}`))
  const overlap = canonicalRows.filter((row) => unsupported.has(`${row.workflowId}\u0000${row.itemId}`))
  if (overlap.length) throw new Error(`[explicit-mapping-audit] ${overlap.length} canonical mapping(s) are also unsupported`)

  const globalCorrectionRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_CORRECTION_LEDGER.jsonl'))
  const inventoryRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GLOBAL_MAPPING_ARCHITECTURE_INVENTORY.jsonl'))
  if (globalCorrectionRows.length !== 17347 || inventoryRows.length !== 17347) {
    throw new Error('[explicit-mapping-audit] global mapping inventory/correction ledger count mismatch')
  }
  if (globalCorrectionRows.some((row) => row.final_disposition !== 'REMOVE_TO_UNSUPPORTED')) {
    throw new Error('[explicit-mapping-audit] noncanonical mapping retained without canonical evidence')
  }

  const gpCorrectionRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'GP_MAPPING_CORRECTION_LEDGER.jsonl'))
  if (gpCorrectionRows.length !== 1164) throw new Error('[explicit-mapping-audit] GP correction ledger count mismatch')
  const { errors: staticErrors, historicalTextBatchCount } = scanRepositoryForMappingRisks(ROOT_DIR)
  if (staticErrors.length) throw new Error(`[explicit-mapping-audit] repository guard failures:\n${staticErrors.join('\n')}`)

  const result = {
    status: 'PASS',
    researchRecordsInspected: researchById.size,
    earlyGpWorkflowsInspected: [...EARLY_GP_WORKFLOWS].filter((workflowId) => researchById.has(workflowId)).length,
    canonicalSupportedMappings: canonicalRows.length,
    persistedSupportedMappings: persistedRows.length,
    workflowSupportedMappings: workflowSupportedKeys.length,
    guardInspectedSupportedMappings: canonicalRows.length,
    explicitMappingLedgerRecords: explicitRows.length,
    runtimeEmittedSupportedMappings: runtimeRows.length,
    globalCorrectionRecordsInspected: globalCorrectionRows.length,
    gpCorrectionRecordsInspected: gpCorrectionRows.length,
    unsupportedItemsInspected: unsupported.size,
    historicalTextBatchSnapshotsRetainedButIncapableOfEmission: historicalTextBatchCount,
    reconciliationEqual: true,
  }
  return result
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

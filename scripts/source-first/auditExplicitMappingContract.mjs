import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import {
  EXPANSION_DIR,
  ROOT_DIR,
  getResearchPaths,
  listClinicalItems,
  readJson,
  readJsonl,
  stableValue,
} from './common.mjs'
import {
  CANONICAL_MAPPING_FIELDS,
  canonicalMappingKey,
} from './canonicalMappingLedger.mjs'
import {
  createCanonicalMappingViews,
  deriveUnsupportedLegacyRows,
  reconcileCanonicalMappingViews,
} from './canonicalMappingReconciliation.mjs'
import { scanComputedMappingDataFlow } from './computedMappingDataFlow.mjs'
import { runNoCodeGeneratedMappingsAudit } from './auditNoCodeGeneratedMappings.mjs'

export { scanComputedMappingDataFlow } from './computedMappingDataFlow.mjs'

const SUPPORTED_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const EARLY_GP_WORKFLOWS = new Set(['gp-cough', 'gp-dizziness', 'gp-fever-urti', 'gp-headache', 'gp-sore-throat'])
const ALLOWED_MAPPING_WRITERS = new Set([
  'writeCanonicalMapping.mjs',
])
const DECLARATIVE_INFRASTRUCTURE = new Set([
  'auditNoCodeGeneratedMappings.mjs',
  'applyResearchBatch.mjs',
  'canonicalMappingContract.mjs',
  'canonicalMappingLedger.mjs',
  'canonicalMappingReconciliation.mjs',
  'canonicalMappingStore.mjs',
  'gpExplicitMappingContract.mjs',
  'writeCanonicalMapping.mjs',
])
const SKIPPED_DIRECTORIES = new Set(['.git', '.agents', '.codex', 'dist', 'node_modules', 'public', 'clinical-expansion-v2'])
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.mts', '.cts'])
const PROTECTED_MAPPING_FIELDS = new Set([
  ...CANONICAL_MAPPING_FIELDS,
  'workflow_id',
  'item_id',
  'source_id',
  'section_id',
  'source_section_id',
])
const MAPPING_IDENTITY_FIELDS = new Set([
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
  'workflow_id',
  'item_id',
  'source_id',
  'section_id',
  'source_section_id',
])
const POTENTIAL_MAPPING_PATH = /mapping|support|evidence|clinical|provenance|identity/i

function recursiveSourceFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) return []
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return recursiveSourceFiles(filePath)
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [filePath] : []
    })
}

function semanticSignature(mapping) {
  return JSON.stringify(stableValue(Object.fromEntries(CANONICAL_MAPPING_FIELDS.map((field) => [field, mapping[field]]))))
}

function scriptKindFor(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  if (extension === '.ts') return ts.ScriptKind.TS
  if (extension === '.tsx') return ts.ScriptKind.TSX
  if (extension === '.jsx') return ts.ScriptKind.JSX
  return ts.ScriptKind.JS
}

function staticPropertyName(name, bindings, seen = new Set()) {
  if (!name) return null
  if (ts.isIdentifier(name)) return name.text
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name)) return staticExpressionValue(name.expression, bindings, seen)
  return null
}

function staticExpressionValue(expression, bindings, seen = new Set()) {
  if (!expression) return null
  if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) return expression.text
  if (ts.isIdentifier(expression)) {
    if (seen.has(expression.text) || !bindings.has(expression.text)) return null
    seen.add(expression.text)
    return staticExpressionValue(bindings.get(expression.text), bindings, seen)
  }
  if (ts.isParenthesizedExpression(expression)) return staticExpressionValue(expression.expression, bindings, seen)
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticExpressionValue(expression.left, bindings, new Set(seen))
    const right = staticExpressionValue(expression.right, bindings, new Set(seen))
    return left === null || right === null ? null : `${left}${right}`
  }
  if (ts.isTemplateExpression(expression)) {
    let value = expression.head.text
    for (const span of expression.templateSpans) {
      const replacement = staticExpressionValue(span.expression, bindings, new Set(seen))
      if (replacement === null) return null
      value += replacement + span.literal.text
    }
    return value
  }
  return null
}

function staticBindings(sourceFile) {
  const bindings = new Map()
  function visit(node) {
    if (ts.isVariableDeclaration(node)
      && ts.isVariableDeclarationList(node.parent)
      && (node.parent.flags & ts.NodeFlags.Const)
      && ts.isIdentifier(node.name)
      && node.initializer) {
      bindings.set(node.name.text, node.initializer)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return bindings
}

function contextName(node) {
  let current = node.parent
  while (current) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) return current.name.text
    if (ts.isPropertyAssignment(current) || ts.isPropertyDeclaration(current)) {
      if (ts.isIdentifier(current.name) || ts.isStringLiteralLike(current.name)) return current.name.text
    }
    if (ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) || ts.isMethodDeclaration(current)) {
      return current.name && (ts.isIdentifier(current.name) || ts.isStringLiteralLike(current.name))
        ? current.name.text
        : ''
    }
    if (ts.isCallExpression(current)) return current.expression.getText()
    if (ts.isSourceFile(current)) break
    current = current.parent
  }
  return ''
}

function objectLiteralShape(node, bindings, seenSpreads = new Set()) {
  const propertyNames = new Set()
  let potentialSpread = false
  for (const property of node.properties) {
    if (ts.isSpreadAssignment(property)) {
      let spreadValue = property.expression
      if (ts.isIdentifier(spreadValue) && bindings.has(spreadValue.text) && !seenSpreads.has(spreadValue.text)) {
        seenSpreads.add(spreadValue.text)
        spreadValue = bindings.get(spreadValue.text)
      }
      if (ts.isObjectLiteralExpression(spreadValue)) {
        const spreadShape = objectLiteralShape(spreadValue, bindings, seenSpreads)
        spreadShape.identityFields.forEach((name) => propertyNames.add(name))
        spreadShape.protectedFields.forEach((name) => propertyNames.add(name))
        potentialSpread ||= spreadShape.potentialSpread
          || spreadShape.identityFields.length > 0
          || spreadShape.protectedFields.length > 0
      } else {
        potentialSpread ||= POTENTIAL_MAPPING_PATH.test(property.expression.getText())
      }
      continue
    }
    if (ts.isShorthandPropertyAssignment(property)) {
      propertyNames.add(property.name.text)
      continue
    }
    if ('name' in property && property.name) {
      const name = staticPropertyName(property.name, bindings)
      if (name !== null) propertyNames.add(name)
    }
  }
  return {
    identityFields: [...propertyNames].filter((name) => MAPPING_IDENTITY_FIELDS.has(name)),
    protectedFields: [...propertyNames].filter((name) => PROTECTED_MAPPING_FIELDS.has(name)),
    potentialSpread,
  }
}

export function scanAstClinicalMappingSource(fileName, sourceText) {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName),
  )
  const bindings = staticBindings(sourceFile)
  const errors = []

  function visit(node, inheritedMappingContext = false) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, (child) => visit(child, inheritedMappingContext))
      return
    }

    const shape = objectLiteralShape(node, bindings)
    const mappingContext = inheritedMappingContext
      || shape.identityFields.length > 0
      || shape.protectedFields.length > 0
      || shape.potentialSpread
      || POTENTIAL_MAPPING_PATH.test(contextName(node))

    for (const property of node.properties) {
      if ('name' in property && property.name && ts.isComputedPropertyName(property.name) && mappingContext) {
        const resolved = staticExpressionValue(property.name.expression, bindings)
        const classification = resolved === null
          ? 'unresolved'
          : PROTECTED_MAPPING_FIELDS.has(resolved)
            ? `protected field ${resolved}`
            : `computed field ${resolved}`
        errors.push(`${fileName.replaceAll('\\', '/')}: mapping-like object contains ${classification}; computed clinical mapping properties are prohibited`)
      }
      ts.forEachChild(property, (child) => visit(child, mappingContext))
    }
  }

  visit(sourceFile)
  return [...new Set(errors)]
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
  const errors = scanAstClinicalMappingSource(fileName, sourceText)
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
  const sourceEntries = []
  let historicalTextBatchCount = 0
  for (const filePath of recursiveSourceFiles(rootDirectory)) {
    const relative = path.relative(rootDirectory, filePath).replaceAll('\\', '/')
    if (/\.test\.[mc]?[jt]sx?$/.test(relative)
      || relative.endsWith('auditExplicitMappingContract.mjs')
      || relative.endsWith('computedMappingDataFlow.mjs')
      || relative.endsWith('writeGpHelperRemediationReports.mjs')
      || DECLARATIVE_INFRASTRUCTURE.has(path.basename(relative))) continue
    const sourceText = fs.readFileSync(filePath, 'utf8')
    sourceEntries.push({ fileName: filePath, sourceText })
    const historicalBatch = /(?:^|\/)batches\/batch-\d{4}-\d{4}\.mjs$/.test(relative)
      && /\bsupportTexts\s*\(|\bexact_texts\b/.test(sourceText)
    if (historicalBatch) historicalTextBatchCount += 1
    errors.push(...scanStaticClinicalMappingSource(relative, sourceText, { historicalBatch }))
  }
  const dataFlow = scanComputedMappingDataFlow(sourceEntries)
  errors.push(...dataFlow.errors)
  return { errors: [...new Set(errors)].sort(), historicalTextBatchCount, dataFlow }
}

export function runExplicitMappingAudit() {
  const researchById = new Map()
  const legacyPersistedRows = []
  const legacyWorkflowSupportedKeys = []
  for (const researchPath of getResearchPaths()) {
    const research = readJson(researchPath)
    const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${research.workflow_id}.json`))
    researchById.set(research.workflow_id, research)
    legacyPersistedRows.push(...(research.legacy_item_support_mappings ?? []))
    for (const item of listClinicalItems(workflow)) {
      if (item.clinical_review_status !== SUPPORTED_STATUS) continue
      if (item.source_ids?.length !== 1 || item.source_section_ids?.length !== 1) {
        throw new Error(`[explicit-mapping-audit] supported workflow item lacks exact provenance ${item.item_id}`)
      }
      legacyWorkflowSupportedKeys.push([research.workflow_id, item.item_id, item.source_ids[0], item.source_section_ids[0]].join('\u0000'))
    }
  }

  const retiredCanonicalRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'CANONICAL_SUPPORTED_MAPPING_LEDGER.jsonl'))
  const retiredExplicitRows = readJsonl(path.join(EXPANSION_DIR, 'progress', 'EXPLICIT_SUPPORTED_MAPPING_LEDGER.jsonl'))
  if (legacyPersistedRows.length || legacyWorkflowSupportedKeys.length || retiredCanonicalRows.length || retiredExplicitRows.length) {
    throw new Error(`[explicit-mapping-audit] alternate active mapping source detected: research=${legacyPersistedRows.length} workflow=${legacyWorkflowSupportedKeys.length} retiredCanonical=${retiredCanonicalRows.length} retiredExplicit=${retiredExplicitRows.length}`)
  }

  const views = createCanonicalMappingViews()
  const reconciliation = reconcileCanonicalMappingViews({ views })
  const canonicalRows = views.canonicalJson
  const unsupported = deriveUnsupportedLegacyRows(
    readJsonl(path.join(EXPANSION_DIR, 'review', 'unsupported_legacy_items.jsonl')),
    canonicalRows,
  )

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
  const architectureGuard = runNoCodeGeneratedMappingsAudit()

  const result = {
    status: 'PASS',
    researchRecordsInspected: researchById.size,
    earlyGpWorkflowsInspected: [...EARLY_GP_WORKFLOWS].filter((workflowId) => researchById.has(workflowId)).length,
    canonicalSupportedMappings: canonicalRows.length,
    persistedSupportedMappings: views.persistedActive.length,
    workflowSupportedMappings: views.persistedActive.length,
    guardInspectedSupportedMappings: views.guardInspected.length,
    explicitMappingLedgerRecords: views.explicitLedger.length,
    runtimeEmittedSupportedMappings: views.runtimeEmitted.length,
    retiredAlternateMappingRecords: 0,
    globalCorrectionRecordsInspected: globalCorrectionRows.length,
    gpCorrectionRecordsInspected: gpCorrectionRows.length,
    unsupportedItemsInspected: unsupported.length,
    historicalTextBatchSnapshotsRetainedButIncapableOfEmission: historicalTextBatchCount,
    codeGeneratedSupportedMappings: architectureGuard.codeGeneratedSupportedMappings,
    reconciliationEqual: reconciliation.reconciliationEqual,
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

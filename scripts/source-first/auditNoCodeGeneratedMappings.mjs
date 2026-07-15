import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { ROOT_DIR } from './common.mjs'

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.mts', '.cts'])
const SKIPPED_DIRECTORIES = new Set(['.git', '.agents', '.codex', 'dist', 'node_modules', 'public', 'clinical-expansion-v2'])
const ALLOWLIST = new Set([
  'scripts/source-first/auditExplicitMappingContract.mjs',
  'scripts/source-first/auditNoCodeGeneratedMappings.mjs',
  'scripts/source-first/canonicalMappingContract.mjs',
  'scripts/source-first/canonicalMappingLedger.mjs',
  'scripts/source-first/canonicalMappingReconciliation.mjs',
  'scripts/source-first/canonicalMappingStore.mjs',
  'scripts/source-first/computedMappingDataFlow.mjs',
  'scripts/source-first/writeCanonicalMapping.mjs',
  'scripts/source-first/batches/gpExplicitMappingContract.mjs',
])
const APPROVED_CANONICAL_READERS = new Set([
  'scripts/source-first/applyResearchBatch.mjs',
  'scripts/source-first/runCheck.mjs',
])
const IDENTITY_GROUPS = [
  new Set(['workflowId', 'workflow_id']),
  new Set(['itemId', 'item_id']),
  new Set(['sourceId', 'source_id']),
  new Set(['sectionId', 'section_id', 'source_section_id']),
]
const SUPPORT_FIELDS = new Set([
  'sourceHash', 'sectionHash', 'evidenceRelationship', 'populationApplicability',
  'settingApplicability', 'jurisdictionApplicability', 'uaeApplicability',
  'applicabilityRationale', 'supportStatus', 'origin', 'mappingVersion',
])
const ACTIVE_STATUS = 'legacy_exact_source_supported_pending_clinician_review'
const RETIRED_LEDGER_NAMES = /CANONICAL_SUPPORTED_MAPPING_LEDGER\.jsonl|EXPLICIT_SUPPORTED_MAPPING_LEDGER\.jsonl/
const SERIALIZER_IMPORT = /(?:^|\/)writeCanonicalMapping\.mjs$/
const ACTIVE_MAPPING_SOURCE_IMPORT = /(?:^|\/)(?:canonicalMappingLedger|canonicalMappingReconciliation|canonicalMappingStore|writeCanonicalMapping)\.mjs$/

function normalizedRelative(fileName, rootDirectory = ROOT_DIR) {
  const absolute = path.isAbsolute(fileName) ? fileName : path.join(rootDirectory, fileName)
  return path.relative(rootDirectory, absolute).replaceAll('\\', '/')
}

function scriptKindFor(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  if (extension === '.ts') return ts.ScriptKind.TS
  if (extension === '.tsx') return ts.ScriptKind.TSX
  if (extension === '.jsx') return ts.ScriptKind.JSX
  return ts.ScriptKind.JS
}

function staticPropertyName(name) {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)) return name.expression.text
  return null
}

function isEmptyArray(expression) {
  return ts.isArrayLiteralExpression(expression) && expression.elements.length === 0
}

function isZero(expression) {
  return ts.isNumericLiteral(expression) && expression.text === '0'
}

function candidateOnlyObject(propertyNames, node) {
  if (!propertyNames.has('candidateStatus')) return false
  const statusProperty = node.properties.find((property) => staticPropertyName(property.name) === 'candidateStatus')
  if (!statusProperty || !ts.isPropertyAssignment(statusProperty) || !ts.isStringLiteralLike(statusProperty.initializer)) return false
  return new Set(['candidate_pending_review', 'unsupported_pending_review', 'clinician_review_required'])
    .has(statusProperty.initializer.text)
}

export function scanNoCodeGeneratedMappingSource(fileName, sourceText, {
  rootDirectory = ROOT_DIR,
  forceProduction = false,
} = {}) {
  const relative = normalizedRelative(fileName, rootDirectory)
  if (!forceProduction && (/\.test\.[mc]?[jt]sx?$/.test(relative) || ALLOWLIST.has(relative))) return []
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, scriptKindFor(fileName))
  const errors = []
  for (const diagnostic of sourceFile.parseDiagnostics ?? []) {
    errors.push(`${relative}: parse failure prevents declarative mapping architecture enforcement: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`)
  }

  function fail(node, message) {
    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile, false))
    errors.push(`${relative}:${location.line + 1}:${location.character + 1}: ${message}`)
  }

  function inspectCanonicalModuleAccess(node, moduleSpecifier) {
    if (!moduleSpecifier || !ACTIVE_MAPPING_SOURCE_IMPORT.test(moduleSpecifier)) return
    if (SERIALIZER_IMPORT.test(moduleSpecifier)) {
      fail(node, 'production code must not import, re-export, or dynamically load the canonical serializer as a mapping factory')
      return
    }
    if (!APPROVED_CANONICAL_READERS.has(relative)) {
      fail(node, 'canonical active-mapping readers are restricted to explicitly allowlisted infrastructure and read-only consumers')
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      inspectCanonicalModuleAccess(node, node.moduleSpecifier.text)
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
      inspectCanonicalModuleAccess(node, node.moduleSpecifier.text)
    }
    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteralLike(node.arguments[0])) {
        inspectCanonicalModuleAccess(node, node.arguments[0].text)
      }
      const callee = node.expression.getText(sourceFile)
      if (/\b(?:write|persist|emit|create|build|assemble|restore)\w*(?:Canonical)?Mappings?\b/i.test(callee)) {
        fail(node, `code-generated mapping call ${callee} is prohibited outside canonical infrastructure`)
      }
      if (/\b(?:writeFileSync|writeFile|writeJson|writeJsonl|writeTextAtomic|renameSync)\b/.test(callee)
        && /canonical-mappings|CANONICAL_MAPPING_DIRECTORY/.test(sourceText)) {
        fail(node, 'canonical mapping directory writes are prohibited outside the approved serializer')
      }
    }
    if (ts.isObjectLiteralExpression(node)) {
      const names = new Set(node.properties.map((property) => staticPropertyName(property.name)).filter(Boolean))
      const identityCount = IDENTITY_GROUPS.filter((group) => [...group].some((name) => names.has(name))).length
      const supportCount = [...SUPPORT_FIELDS].filter((field) => names.has(field)).length
      if (!candidateOnlyObject(names, node) && (identityCount >= 3 || (identityCount >= 1 && supportCount >= 2))) {
        fail(node, 'mapping-shaped production object literal is prohibited; active support must originate in canonical JSON')
      }
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property)) continue
        const name = staticPropertyName(property.name)
        if (name === 'legacy_item_support_mappings' && !isEmptyArray(property.initializer)) {
          fail(property, 'alternate persisted supported-mapping array is prohibited')
        }
        if (name === 'supported_legacy_item_count' && !isZero(property.initializer)) {
          fail(property, 'stored supported-item accounting must not be generated by production code')
        }
        if (name === 'clinical_review_status' && ts.isStringLiteralLike(property.initializer) && property.initializer.text === ACTIVE_STATUS) {
          fail(property, 'production code must not promote workflow items to supported status')
        }
      }
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const target = node.left.getText(sourceFile)
      if (/legacy_item_support_mappings$/.test(target) && !isEmptyArray(node.right)) {
        fail(node, 'alternate persisted supported-mapping assignment is prohibited')
      }
      if (/clinical_review_status$/.test(target) && ts.isStringLiteralLike(node.right) && node.right.text === ACTIVE_STATUS) {
        fail(node, 'production code must not promote workflow items to supported status')
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  if (RETIRED_LEDGER_NAMES.test(sourceText) && !/audit|retired|historical/i.test(relative)) {
    errors.push(`${relative}: retired progress ledgers cannot be active mapping sources`)
  }
  return [...new Set(errors)].sort()
}

function recursiveSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) return []
      const filePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return recursiveSourceFiles(filePath)
      return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [filePath] : []
    })
}

export function runNoCodeGeneratedMappingsAudit({ rootDirectory = ROOT_DIR } = {}) {
  const files = recursiveSourceFiles(rootDirectory)
  const errors = files.flatMap((fileName) => scanNoCodeGeneratedMappingSource(
    fileName,
    fs.readFileSync(fileName, 'utf8'),
    { rootDirectory },
  ))
  if (errors.length) throw new Error(`[no-code-generated-mappings] ${errors.length} failure(s):\n${errors.join('\n')}`)
  return Object.freeze({
    status: 'PASS',
    productionFilesInspected: files.filter((fileName) => {
      const relative = normalizedRelative(fileName, rootDirectory)
      return !/\.test\.[mc]?[jt]sx?$/.test(relative) && !ALLOWLIST.has(relative)
    }).length,
    allowlistedInfrastructureFiles: ALLOWLIST.size,
    codeGeneratedSupportedMappings: 0,
  })
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    console.log(JSON.stringify(runNoCodeGeneratedMappingsAudit(), null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

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
  'scripts/source-first/canonicalMappingEnvironment.mjs',
  'scripts/source-first/canonicalMappingManifest.mjs',
  'scripts/source-first/canonicalMappingTransaction.mjs',
  'scripts/source-first/canonicalJson.mjs',
  'scripts/source-first/candidateMappingProposalStore.mjs',
  'scripts/source-first/canonicalMappingLedger.mjs',
  'scripts/source-first/canonicalMappingReconciliation.mjs',
  'scripts/source-first/canonicalMappingStore.mjs',
  'scripts/source-first/canonicalSupportAccounting.mjs',
  'scripts/source-first/canonicalMappingTestHarness.mjs',
  'scripts/source-first/computedMappingDataFlow.mjs',
  'scripts/source-first/inspectApprovalManifest.mjs',
  'scripts/source-first/inspectCanonicalFiles.mjs',
  'scripts/source-first/inspectPersistedSupport.mjs',
  'scripts/source-first/inspectRuntimeMappings.mjs',
  'scripts/source-first/inspectSupportAccounting.mjs',
  'scripts/source-first/mappingConsumerOutput.mjs',
  'scripts/source-first/removeCanonicalMapping.mjs',
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
const SERIALIZER_IMPORT = /(?:^|\/)(?:writeCanonicalMapping|removeCanonicalMapping|canonicalMappingTransaction)\.mjs$/
const ACTIVE_MAPPING_SOURCE_IMPORT = /(?:^|\/)(?:canonicalMappingLedger|canonicalMappingReconciliation|canonicalMappingStore|canonicalMappingTransaction|writeCanonicalMapping|removeCanonicalMapping)\.mjs$/
const CANONICAL_TARGET_PATTERN = /(?:^|[^a-z0-9])clinical-expansion-v2[\\/](?:canonical-mappings|active-mappings|supported-mappings|mapping-ledger)(?:[\\/]|$)|CANONICAL_MAPPING_DIRECTORY/i
const WRITE_METHODS = new Set([
  'writeFile', 'writeFileSync', 'appendFile', 'appendFileSync', 'createWriteStream',
  'copyFile', 'copyFileSync', 'cp', 'cpSync', 'rename', 'renameSync', 'link', 'linkSync',
  'symlink', 'symlinkSync', 'open', 'openSync', 'rm', 'rmSync', 'unlink', 'unlinkSync',
])
const DESTINATION_ARGUMENT = new Map([
  ['copyFile', 1], ['copyFileSync', 1], ['cp', 1], ['cpSync', 1],
  ['rename', 1], ['renameSync', 1], ['link', 1], ['linkSync', 1],
  ['symlink', 1], ['symlinkSync', 1],
])

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
  if (!propertyNames.has('proposalStatus') || [...SUPPORT_FIELDS].some((field) => propertyNames.has(field))) return false
  const allowedFields = new Set([
    'workflowId', 'itemId', 'sourceId', 'sectionId', 'proposalRationale',
    'populationAssessment', 'settingAssessment', 'uaeAssessment', 'proposalStatus',
  ])
  if ([...propertyNames].some((field) => !allowedFields.has(field))) return false
  const statusProperty = node.properties.find((property) => staticPropertyName(property.name) === 'proposalStatus')
  if (!statusProperty || !ts.isPropertyAssignment(statusProperty) || !ts.isStringLiteralLike(statusProperty.initializer)) return false
  return new Set(['candidate_pending_review', 'unsupported_pending_review', 'clinician_review_required', 'rejected_candidate'])
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
  const constantInitializers = new Map()
  const importedCanonicalConstants = new Set()
  const canonicalHandles = new Set()
  for (const diagnostic of sourceFile.parseDiagnostics ?? []) {
    errors.push(`${relative}: parse failure prevents declarative mapping architecture enforcement: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`)
  }

  function fail(node, message) {
    const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile, false))
    errors.push(`${relative}:${location.line + 1}:${location.character + 1}: ${message}`)
  }

  function inspectCanonicalModuleAccess(node, moduleSpecifier) {
    if (!moduleSpecifier) return
    const unsuffixed = moduleSpecifier.replace(/[?#].*$/, '')
    if (!ACTIVE_MAPPING_SOURCE_IMPORT.test(unsuffixed)) return
    if (/[?#]/.test(moduleSpecifier)) fail(node, 'query/hash suffixes are prohibited for canonical mapping infrastructure imports')
    if (SERIALIZER_IMPORT.test(unsuffixed)) {
      fail(node, 'production code must not import, re-export, or dynamically load the canonical serializer as a mapping factory')
      return
    }
    if (!APPROVED_CANONICAL_READERS.has(relative)) {
      fail(node, 'canonical active-mapping readers are restricted to explicitly allowlisted infrastructure and read-only consumers')
    }
  }

  function unwrap(expression) {
    let current = expression
    while (current && (ts.isParenthesizedExpression(current)
      || ts.isAsExpression(current)
      || ts.isTypeAssertionExpression(current)
      || ts.isNonNullExpression(current)
      || ts.isAwaitExpression(current))) current = current.expression
    return current
  }

  function staticString(expression, seen = new Set()) {
    const node = unwrap(expression)
    if (!node) return null
    if (ts.isStringLiteralLike(node)) return node.text
    if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text
    if (ts.isIdentifier(node)) {
      if (importedCanonicalConstants.has(node.text) || node.text === 'CANONICAL_MAPPING_DIRECTORY') return 'clinical-expansion-v2/canonical-mappings'
      if (seen.has(node.text)) return null
      const initializer = constantInitializers.get(node.text)
      if (!initializer) return null
      seen.add(node.text)
      return staticString(initializer, seen)
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = staticString(node.left, new Set(seen))
      const right = staticString(node.right, new Set(seen))
      return left === null || right === null ? null : `${left}${right}`
    }
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text
      for (const span of node.templateSpans) {
        const replacement = staticString(span.expression, new Set(seen))
        if (replacement === null) return null
        value += replacement + span.literal.text
      }
      return value
    }
    if (ts.isCallExpression(node)) {
      const method = ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : node.expression.getText(sourceFile)
      if (method === 'join' || method === 'resolve') {
        const values = node.arguments.map((argument) => staticString(argument, new Set(seen)))
        return values.some((value) => value === null) ? null : values.join('/')
      }
      if (method === 'fileURLToPath' && node.arguments.length === 1) return staticString(node.arguments[0], seen)
      if (method === 'createWriteStream' && node.arguments.length > 0) return staticString(node.arguments[0], seen)
    }
    if (ts.isNewExpression(node) && node.expression.getText(sourceFile) === 'URL' && node.arguments?.length) {
      return staticString(node.arguments[0], seen)
    }
    return null
  }

  function callMethod(node) {
    if (!ts.isCallExpression(node)) return null
    if (ts.isPropertyAccessExpression(node.expression)) return node.expression.name.text
    if (ts.isIdentifier(node.expression)) return node.expression.text
    return null
  }

  function isCanonicalTarget(expression) {
    const value = staticString(expression)
    return value !== null && CANONICAL_TARGET_PATTERN.test(value.replaceAll('\\', '/'))
  }

  function collect(node) {
    if (ts.isImportDeclaration(node) && node.importClause && ts.isStringLiteralLike(node.moduleSpecifier)) {
      const bindings = node.importClause.namedBindings
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          const imported = element.propertyName?.text ?? element.name.text
          if (/^CANONICAL_(?:MAPPING_DIRECTORY|APPROVAL_MANIFEST_PATH|APPROVAL_SIGNATURE_PATH)$/.test(imported)) {
            importedCanonicalConstants.add(element.name.text)
          }
        }
      }
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const declarationList = node.parent
      if (ts.isVariableDeclarationList(declarationList) && (declarationList.flags & ts.NodeFlags.Const)) {
        constantInitializers.set(node.name.text, node.initializer)
      }
      const initializer = unwrap(node.initializer)
      if (ts.isCallExpression(initializer) && ['open', 'openSync'].includes(callMethod(initializer)) && isCanonicalTarget(initializer.arguments[0])) {
        canonicalHandles.add(node.name.text)
      }
    }
    ts.forEachChild(node, collect)
  }
  collect(sourceFile)

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
      const method = callMethod(node)
      if (/\b(?:write|persist|emit|create|build|assemble|restore)\w*(?:Canonical)?Mappings?\b/i.test(callee)) {
        fail(node, `code-generated mapping call ${callee} is prohibited outside canonical infrastructure`)
      }
      if (WRITE_METHODS.has(method)) {
        const targetIndex = DESTINATION_ARGUMENT.get(method) ?? 0
        const target = node.arguments[targetIndex]
        if (target && isCanonicalTarget(target)) {
          fail(node, `canonical mapping directory mutation through ${method} is prohibited outside the signed transaction authority`)
        } else if (target && staticString(target) === null && /canonical-mappings|CANONICAL_MAPPING_DIRECTORY|supported-mappings|active-mappings/.test(sourceText)) {
          fail(node, `ambiguous ${method} destination in canonical-mapping-aware production code fails closed`)
        }
      }
      if (method === 'pipe' && node.arguments.some(isCanonicalTarget)) {
        fail(node, 'stream piping into the canonical mapping directory is prohibited')
      }
      if (['write', 'writeFile', 'appendFile', 'createWriteStream'].includes(method)
        && ts.isPropertyAccessExpression(node.expression)
        && ts.isIdentifier(node.expression.expression)
        && canonicalHandles.has(node.expression.expression.text)) {
        fail(node, 'file-handle write into the canonical mapping directory is prohibited')
      }
      if (['exec', 'execSync', 'spawn', 'spawnSync'].includes(method)) {
        const command = node.arguments.map((argument) => staticString(argument)).filter((value) => value !== null).join(' ')
        if (/\b(?:cp|copy|move|mv|rename)\b/i.test(command)
          && (CANONICAL_TARGET_PATTERN.test(command.replaceAll('\\', '/'))
            || CANONICAL_TARGET_PATTERN.test(sourceText.replaceAll('\\', '/')))) {
          fail(node, 'statically evident external-process copy/move into canonical storage is prohibited')
        }
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

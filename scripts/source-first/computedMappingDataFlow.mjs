import path from 'node:path'
import ts from 'typescript'

const SOURCE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts']
const MAPPING_IDENTITY_FIELDS = new Set([
  'workflowId',
  'itemId',
  'sourceId',
  'sectionId',
])
const PROTECTED_MAPPING_FIELDS = new Set([
  ...MAPPING_IDENTITY_FIELDS,
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
  'mappingVersion',
])
const POTENTIAL_MAPPING_PATH = /mapping|legacy_item_support|legacyItemSupport|explicit.*support.*ledger|canonical/i
const MAPPING_SINK_PATH = /canonical.*mapping|mapping.*(?:validate|persist|write|emit|ledger)|(?:validate|persist|write|emit).*mapping|legacy_item_support_mappings|legacyItemSupportMappings|explicit.*mapping.*ledger|workflow.*support.*writer/i
const ASSIGNMENT_KINDS = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.BarBarEqualsToken,
  ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ts.SyntaxKind.QuestionQuestionEqualsToken,
])

function scriptKindFor(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  if (extension === '.ts' || extension === '.mts' || extension === '.cts') return ts.ScriptKind.TS
  if (extension === '.tsx') return ts.ScriptKind.TSX
  if (extension === '.jsx') return ts.ScriptKind.JSX
  return ts.ScriptKind.JS
}

function canonicalPath(fileName) {
  return path.resolve(fileName).replaceAll('\\', '/').toLowerCase()
}

function createSourceProgram(sourceEntries) {
  const options = {
    allowJs: true,
    checkJs: false,
    jsx: ts.JsxEmit.Preserve,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noLib: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.Latest,
  }
  const entries = [...sourceEntries]
    .map((entry) => ({
      fileName: path.resolve(entry.fileName),
      sourceText: String(entry.sourceText),
    }))
    .sort((left, right) => left.fileName.replaceAll('\\', '/').localeCompare(right.fileName.replaceAll('\\', '/')))
  const sourceByPath = new Map(entries.map((entry) => [canonicalPath(entry.fileName), entry]))
  const sourceFileCache = new Map()
  const host = ts.createCompilerHost(options, true)
  const originalFileExists = host.fileExists.bind(host)
  const originalReadFile = host.readFile.bind(host)
  const originalGetSourceFile = host.getSourceFile.bind(host)
  host.fileExists = (fileName) => sourceByPath.has(canonicalPath(fileName)) || originalFileExists(fileName)
  host.readFile = (fileName) => sourceByPath.get(canonicalPath(fileName))?.sourceText ?? originalReadFile(fileName)
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    const key = canonicalPath(fileName)
    const entry = sourceByPath.get(key)
    if (!entry) return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
    if (!shouldCreateNewSourceFile && sourceFileCache.has(key)) return sourceFileCache.get(key)
    const sourceFile = ts.createSourceFile(
      entry.fileName,
      entry.sourceText,
      languageVersion,
      true,
      scriptKindFor(entry.fileName),
    )
    sourceFileCache.set(key, sourceFile)
    return sourceFile
  }
  const program = ts.createProgram(entries.map((entry) => entry.fileName), options, host)
  return { entries, host, options, program, sourceByPath }
}

function staticExpressionValue(expression, checker, seen = new Set()) {
  if (!expression) return null
  if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) return expression.text
  if (ts.isParenthesizedExpression(expression)
    || ts.isAsExpression(expression)
    || ts.isTypeAssertionExpression(expression)
    || ts.isNonNullExpression(expression)
    || ts.isSatisfiesExpression(expression)) {
    return staticExpressionValue(expression.expression, checker, seen)
  }
  if (ts.isIdentifier(expression)) {
    let symbol = checker.getSymbolAtLocation(expression)
    if (!symbol || seen.has(symbol)) return null
    seen.add(symbol)
    if (symbol.flags & ts.SymbolFlags.Alias) {
      try {
        symbol = checker.getAliasedSymbol(symbol)
      } catch {
        return null
      }
    }
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
    if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
      const declarationList = declaration.parent
      if (!ts.isVariableDeclarationList(declarationList) || !(declarationList.flags & ts.NodeFlags.Const)) return null
      return staticExpressionValue(declaration.initializer, checker, seen)
    }
    return null
  }
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticExpressionValue(expression.left, checker, new Set(seen))
    const right = staticExpressionValue(expression.right, checker, new Set(seen))
    return left === null || right === null ? null : `${left}${right}`
  }
  if (ts.isTemplateExpression(expression)) {
    let value = expression.head.text
    for (const span of expression.templateSpans) {
      const replacement = staticExpressionValue(span.expression, checker, new Set(seen))
      if (replacement === null) return null
      value += replacement + span.literal.text
    }
    return value
  }
  return null
}

function staticPropertyName(name, checker) {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isComputedPropertyName(name)) return staticExpressionValue(name.expression, checker)
  return null
}

function relativeModuleCandidates(containingFile, specifier) {
  if (!specifier.startsWith('.')) return []
  const base = path.resolve(path.dirname(containingFile), specifier)
  const candidates = [base]
  if (!path.extname(base)) {
    for (const extension of SOURCE_EXTENSIONS) candidates.push(`${base}${extension}`)
    for (const extension of SOURCE_EXTENSIONS) candidates.push(path.join(base, `index${extension}`))
  }
  return candidates.map(canonicalPath)
}

function isFunctionLike(node) {
  return ts.isFunctionDeclaration(node)
    || ts.isFunctionExpression(node)
    || ts.isArrowFunction(node)
    || ts.isMethodDeclaration(node)
}

function nearestFunction(node) {
  let current = node.parent
  while (current) {
    if (isFunctionLike(current)) return current
    current = current.parent
  }
  return null
}

function assignmentTargetBase(expression) {
  let current = expression
  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) current = current.expression
  return current
}

function sortedSet(values) {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function isMappingInfrastructureFile(fileName) {
  const normalized = fileName.replaceAll('\\', '/').toLowerCase()
  return normalized.includes('/scripts/source-first/')
    || normalized.includes('/.virtual-data-flow-fixtures/')
}

export function scanComputedMappingDataFlow(sourceEntries) {
  const { entries, program, sourceByPath } = createSourceProgram(sourceEntries)
  const checker = program.getTypeChecker()
  const edges = new Map()
  const labels = new Map()
  const hazardSeeds = new Map()
  const identitySeeds = new Set()
  const sinkSeeds = new Map()
  const exportValues = new Map()
  const importRecords = []
  const reExportRecords = []
  const dynamicImportRecords = []
  const callRecords = []
  const functionReturnIds = new Map()
  const functionByBindingId = new Map()
  const bindingTargets = new Map()
  const ownerById = new Map()
  const sourceFiles = entries
    .map((entry) => program.getSourceFile(entry.fileName))
    .filter(Boolean)
    .sort((left, right) => left.fileName.replaceAll('\\', '/').localeCompare(right.fileName.replaceAll('\\', '/')))

  function nodeId(node, suffix = '') {
    const sourceFile = node.getSourceFile()
    const id = `${canonicalPath(sourceFile.fileName)}#${node.pos}:${node.end}:${node.kind}${suffix}`
    if (!labels.has(id)) {
      const location = sourceFile.getLineAndCharacterOfPosition(Math.max(node.getStart(sourceFile, false), 0))
      labels.set(id, `${sourceFile.fileName.replaceAll('\\', '/')}:${location.line + 1}:${location.character + 1}`)
    }
    if (!ownerById.has(id)) ownerById.set(id, isFunctionLike(node) ? node : nearestFunction(node))
    return id
  }

  function syntheticId(node, kind) {
    const id = nodeId(node, `:${kind}`)
    labels.set(id, `${labels.get(nodeId(node))} ${kind}`)
    if (isFunctionLike(node)) ownerById.set(id, node)
    return id
  }

  function addEdge(from, to) {
    if (!from || !to || from === to) return false
    if (!edges.has(from)) edges.set(from, new Set())
    if (edges.get(from).has(to)) return false
    edges.get(from).add(to)
    return true
  }

  function addHazard(id, reason) {
    if (!id || hazardSeeds.has(id)) return
    hazardSeeds.set(id, reason)
  }

  function addSink(id, reason) {
    if (!id || sinkSeeds.has(id)) return false
    sinkSeeds.set(id, reason)
    return true
  }

  function resolvedSymbol(symbol) {
    if (!symbol) return null
    if (symbol.flags & ts.SymbolFlags.Alias) {
      try {
        return checker.getAliasedSymbol(symbol)
      } catch {
        return symbol
      }
    }
    return symbol
  }

  function declarationValueId(declaration, seen = new Set()) {
    if (!declaration || seen.has(declaration)) return null
    seen.add(declaration)
    if (ts.isVariableDeclaration(declaration)
      || ts.isParameter(declaration)
      || ts.isBindingElement(declaration)
      || ts.isFunctionDeclaration(declaration)
      || ts.isFunctionExpression(declaration)
      || ts.isMethodDeclaration(declaration)) {
      return declaration.name ? nodeId(declaration.name) : nodeId(declaration)
    }
    if (ts.isExportAssignment(declaration)) return valueId(declaration.expression)
    if (ts.isPropertyAssignment(declaration)) return valueId(declaration.initializer)
    if (ts.isShorthandPropertyAssignment(declaration)) {
      const symbol = checker.getShorthandAssignmentValueSymbol(declaration)
      const target = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
      return target && target !== declaration
        ? declarationValueId(target, seen)
        : nodeId(declaration.name)
    }
    if (ts.isImportSpecifier(declaration)
      || ts.isImportClause(declaration)
      || ts.isNamespaceImport(declaration)
      || ts.isExportSpecifier(declaration)) {
      return nodeId(declaration.name ?? declaration)
    }
    return nodeId(declaration)
  }

  function bindingId(identifier) {
    const directSymbol = checker.getSymbolAtLocation(identifier)
    const symbol = resolvedSymbol(directSymbol)
    const declaration = symbol?.valueDeclaration
      ?? symbol?.declarations?.[0]
      ?? directSymbol?.valueDeclaration
      ?? directSymbol?.declarations?.[0]
    return declaration ? declarationValueId(declaration) : null
  }

  function valueId(expression) {
    if (!expression) return null
    if (ts.isParenthesizedExpression(expression)
      || ts.isAsExpression(expression)
      || ts.isTypeAssertionExpression(expression)
      || ts.isNonNullExpression(expression)
      || ts.isSatisfiesExpression(expression)
      || ts.isAwaitExpression(expression)) return valueId(expression.expression)
    if (ts.isIdentifier(expression)) return bindingId(expression) ?? nodeId(expression)
    if (ts.isPropertyAccessExpression(expression)) {
      const symbol = resolvedSymbol(checker.getSymbolAtLocation(expression.name))
      const declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0]
      if (declaration && !ts.isPropertySignature(declaration)) return declarationValueId(declaration) ?? nodeId(expression)
      const id = nodeId(expression)
      addEdge(valueId(expression.expression), id)
      return id
    }
    if (ts.isElementAccessExpression(expression)) {
      const id = nodeId(expression)
      addEdge(valueId(expression.expression), id)
      return id
    }
    return nodeId(expression)
  }

  function functionReturnId(functionNode) {
    if (!functionReturnIds.has(functionNode)) functionReturnIds.set(functionNode, syntheticId(functionNode, 'return'))
    return functionReturnIds.get(functionNode)
  }

  function functionForCall(call) {
    const target = ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression
    const symbol = resolvedSymbol(checker.getSymbolAtLocation(target))
    for (const declaration of symbol?.declarations ?? []) {
      if (isFunctionLike(declaration)) return declaration
      if (ts.isVariableDeclaration(declaration) && declaration.initializer && isFunctionLike(declaration.initializer)) {
        return declaration.initializer
      }
      if (ts.isPropertyAssignment(declaration) && isFunctionLike(declaration.initializer)) return declaration.initializer
    }
    return null
  }

  function resolvedModulePath(containingFile, specifier) {
    return relativeModuleCandidates(containingFile, specifier).find((candidate) => sourceByPath.has(candidate)) ?? null
  }

  function moduleExports(fileName) {
    if (!exportValues.has(fileName)) exportValues.set(fileName, new Map())
    return exportValues.get(fileName)
  }

  function addExport(fileName, exportName, id) {
    if (!id) return false
    const exports = moduleExports(fileName)
    if (exports.has(exportName)) return false
    exports.set(exportName, id)
    return true
  }

  for (const sourceFile of sourceFiles) {
    const parseDiagnostics = sourceFile.parseDiagnostics ?? []
    for (const diagnostic of parseDiagnostics) {
      const location = diagnostic.start === undefined
        ? `${sourceFile.fileName.replaceAll('\\', '/')}:1:1`
        : (() => {
            const point = sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
            return `${sourceFile.fileName.replaceAll('\\', '/')}:${point.line + 1}:${point.character + 1}`
          })()
      addHazard(syntheticId(sourceFile, `parse-${diagnostic.start ?? 0}`), `${location}: AST parse failure prevents fail-closed mapping analysis`)
      addSink(syntheticId(sourceFile, `parse-${diagnostic.start ?? 0}`), 'unresolved clinical source parse')
    }

    function visit(node) {
      if (ts.isVariableDeclaration(node) && !ts.isIdentifier(node.name) && node.initializer) {
        const initializerId = valueId(node.initializer)
        const bind = (name) => {
          if (ts.isIdentifier(name)) addEdge(initializerId, nodeId(name))
          else for (const element of name.elements) if (ts.isBindingElement(element)) bind(element.name)
        }
        bind(node.name)
      }

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const target = nodeId(node.name)
        const initializerId = valueId(node.initializer)
        addEdge(initializerId, target)
        if (ts.isIdentifier(node.initializer) || ts.isPropertyAccessExpression(node.initializer)) {
          bindingTargets.set(target, initializerId)
        }
        if (POTENTIAL_MAPPING_PATH.test(node.name.text)) addSink(target, `mapping-context variable ${node.name.text}`)
        if (isFunctionLike(node.initializer)) {
          functionReturnId(node.initializer)
          functionByBindingId.set(target, node.initializer)
          functionByBindingId.set(nodeId(node.initializer), node.initializer)
        }
      }

      if (ts.isFunctionDeclaration(node) && node.name) {
        functionReturnId(node)
        functionByBindingId.set(nodeId(node.name), node)
      }
      if (ts.isFunctionDeclaration(node)
        && node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) {
        const id = node.name ? nodeId(node.name) : nodeId(node)
        functionByBindingId.set(id, node)
        addExport(canonicalPath(sourceFile.fileName), 'default', id)
      }
      if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node))) {
        functionReturnId(node)
        functionByBindingId.set(nodeId(node), node)
      }
      if (ts.isMethodDeclaration(node) && node.name) functionByBindingId.set(nodeId(node.name), node)

      if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) addEdge(valueId(node.body), functionReturnId(node))

      if (ts.isReturnStatement(node) && node.expression) {
        const functionNode = nearestFunction(node)
        if (functionNode) addEdge(valueId(node.expression), functionReturnId(functionNode))
      }

      if (ts.isObjectLiteralExpression(node)) {
        const objectId = nodeId(node)
        for (const property of node.properties) {
          if (ts.isSpreadAssignment(property)) {
            addEdge(valueId(property.expression), objectId)
            continue
          }
          if (ts.isShorthandPropertyAssignment(property)) {
            addEdge(valueId(property.name), objectId)
            if (MAPPING_IDENTITY_FIELDS.has(property.name.text)) identitySeeds.add(objectId)
            if (PROTECTED_MAPPING_FIELDS.has(property.name.text)) addSink(objectId, `protected mapping field ${property.name.text}`)
            continue
          }
          if ('name' in property && property.name) {
            const propertyName = staticPropertyName(property.name, checker)
            if (propertyName && MAPPING_IDENTITY_FIELDS.has(propertyName)) identitySeeds.add(objectId)
            if (propertyName && PROTECTED_MAPPING_FIELDS.has(propertyName)) addSink(objectId, `protected mapping field ${propertyName}`)
            if (propertyName && MAPPING_SINK_PATH.test(propertyName)) addSink(objectId, `mapping persistence property ${propertyName}`)
            if (ts.isComputedPropertyName(property.name)) {
              const classification = propertyName && PROTECTED_MAPPING_FIELDS.has(propertyName)
                ? `computed protected field ${propertyName}`
                : propertyName
                  ? `computed field ${propertyName}`
                  : 'unresolved computed field'
              addHazard(objectId, `${labels.get(objectId)}: ${classification}`)
            }
          }
          if (ts.isPropertyAssignment(property)) addEdge(valueId(property.initializer), objectId)
        }
      }

      if (ts.isArrayLiteralExpression(node)) {
        const arrayId = nodeId(node)
        for (const element of node.elements) {
          if (ts.isSpreadElement(element)) addEdge(valueId(element.expression), arrayId)
          else addEdge(valueId(element), arrayId)
        }
      }

      if (ts.isConditionalExpression(node)) {
        addEdge(valueId(node.whenTrue), nodeId(node))
        addEdge(valueId(node.whenFalse), nodeId(node))
      }

      if (ts.isBinaryExpression(node)) {
        const binaryId = nodeId(node)
        addEdge(valueId(node.left), binaryId)
        addEdge(valueId(node.right), binaryId)
        if (ASSIGNMENT_KINDS.has(node.operatorToken.kind)) {
          if (ts.isIdentifier(node.left)) {
            const leftId = valueId(node.left)
            const rightId = valueId(node.right)
            addEdge(rightId, leftId)
            if (ts.isIdentifier(node.right) || ts.isPropertyAccessExpression(node.right)) bindingTargets.set(leftId, rightId)
          }
          if (ts.isPropertyAccessExpression(node.left) || ts.isElementAccessExpression(node.left)) {
            const baseId = valueId(assignmentTargetBase(node.left))
            addEdge(valueId(node.right), baseId)
            const propertyName = ts.isPropertyAccessExpression(node.left)
              ? node.left.name.text
              : staticExpressionValue(node.left.argumentExpression, checker)
            if (propertyName && MAPPING_IDENTITY_FIELDS.has(propertyName)) identitySeeds.add(baseId)
            if (propertyName && PROTECTED_MAPPING_FIELDS.has(propertyName)) addSink(baseId, `later protected mapping assignment ${propertyName}`)
            if (propertyName && MAPPING_SINK_PATH.test(propertyName)) addSink(baseId, `later mapping persistence assignment ${propertyName}`)
            if (ts.isElementAccessExpression(node.left)) {
              const classification = propertyName && PROTECTED_MAPPING_FIELDS.has(propertyName)
                ? `later computed protected assignment ${propertyName}`
                : propertyName
                  ? `later computed assignment ${propertyName}`
                  : 'later unresolved computed assignment'
              addHazard(baseId, `${labels.get(baseId)}: ${classification}`)
            }
          }
        }
      }

      if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) valueId(node)

      if (ts.isCallExpression(node)) {
        const callId = nodeId(node)
        const calleeText = node.expression.getText()
        if (POTENTIAL_MAPPING_PATH.test(calleeText) || MAPPING_SINK_PATH.test(calleeText)) {
          for (const argument of node.arguments) addEdge(valueId(argument), callId)
          addSink(callId, `clinical mapping call ${calleeText}`)
        }
        if (ts.isPropertyAccessExpression(node.expression)
          && node.expression.expression.getText() === 'Object'
          && node.expression.name.text === 'assign') {
          const targetId = valueId(node.arguments[0])
          for (const source of node.arguments.slice(1)) addEdge(valueId(source), targetId)
          addEdge(targetId, callId)
        }
        const calleeTarget = ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression
        callRecords.push({
          call: node,
          callId,
          calleeId: valueId(calleeTarget),
          calleeText,
          argumentIds: node.arguments.map(valueId),
          fallbackFunction: functionForCall(node),
        })
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword
          && node.arguments.length === 1
          && ts.isStringLiteralLike(node.arguments[0])) {
          dynamicImportRecords.push({ callId, sourceFile, specifier: node.arguments[0].text })
        }
      }

      if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
        importRecords.push({ declaration: node, sourceFile, specifier: node.moduleSpecifier.text })
      }

      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        reExportRecords.push({ declaration: node, sourceFile, specifier: node.moduleSpecifier.text })
      }

      if (ts.isExportAssignment(node)) {
        addExport(canonicalPath(sourceFile.fileName), 'default', valueId(node.expression))
      }

      if ((ts.isVariableStatement(node) || ts.isFunctionDeclaration(node))
        && node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isVariableStatement(node)) {
          for (const declaration of node.declarationList.declarations) {
            if (!ts.isIdentifier(declaration.name)) continue
            const id = nodeId(declaration.name)
            addExport(canonicalPath(sourceFile.fileName), declaration.name.text, id)
            if (POTENTIAL_MAPPING_PATH.test(declaration.name.text)) addSink(id, `exported mapping collection ${declaration.name.text}`)
          }
        } else if (node.name) {
          const id = nodeId(node.name)
          const isDefault = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
          addExport(canonicalPath(sourceFile.fileName), isDefault ? 'default' : node.name.text, id)
          if (POTENTIAL_MAPPING_PATH.test(node.name.text)) addSink(id, `exported mapping function ${node.name.text}`)
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
  }

  function resolveImportRecord(record) {
    const targetPath = resolvedModulePath(record.sourceFile.fileName, record.specifier)
    if (!targetPath) {
      if (!record.specifier.startsWith('node:')) {
        const clause = record.declaration.importClause
        if (!clause && isMappingInfrastructureFile(record.sourceFile.fileName)) {
          const importId = syntheticId(record.declaration, `unresolved-side-effect-import-${record.specifier}`)
          addHazard(importId, `${labels.get(importId)}: unresolved side-effect import ${record.specifier}`)
          addSink(importId, 'unresolved mapping-infrastructure side effect')
        }
        if (clause?.name) addHazard(nodeId(clause.name), `${labels.get(nodeId(clause.name))}: unresolved imported value ${record.specifier}`)
        const bindings = clause?.namedBindings
        if (bindings && ts.isNamedImports(bindings)) {
          for (const element of bindings.elements) addHazard(nodeId(element.name), `${labels.get(nodeId(element.name))}: unresolved imported value ${record.specifier}`)
        }
        if (bindings && ts.isNamespaceImport(bindings)) addHazard(nodeId(bindings.name), `${labels.get(nodeId(bindings.name))}: unresolved imported namespace ${record.specifier}`)
      }
      return
    }
    const targetExports = moduleExports(targetPath)
    const clause = record.declaration.importClause
    if (clause?.name && targetExports.has('default')) {
      const localId = nodeId(clause.name)
      const targetId = targetExports.get('default')
      addEdge(targetId, localId)
      bindingTargets.set(localId, targetId)
    }
    const bindings = clause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const importedName = element.propertyName?.text ?? element.name.text
        if (targetExports.has(importedName)) {
          const localId = nodeId(element.name)
          const targetId = targetExports.get(importedName)
          addEdge(targetId, localId)
          bindingTargets.set(localId, targetId)
        }
        else addHazard(nodeId(element.name), `${labels.get(nodeId(element.name))}: unresolved imported binding ${importedName}`)
      }
    }
    if (bindings && ts.isNamespaceImport(bindings)) {
      const localId = nodeId(bindings.name)
      for (const exportedId of targetExports.values()) addEdge(exportedId, localId)
    }
  }

  for (let iteration = 0; iteration <= sourceFiles.length; iteration += 1) {
    let changed = false
    for (const record of reExportRecords) {
      const targetPath = resolvedModulePath(record.sourceFile.fileName, record.specifier)
      if (!targetPath) {
        if (!record.specifier.startsWith('node:') && isMappingInfrastructureFile(record.sourceFile.fileName)) {
          const exportId = syntheticId(record.declaration, `unresolved-reexport-${record.specifier}`)
          addHazard(exportId, `${labels.get(exportId)}: unresolved re-export ${record.specifier}`)
          addSink(exportId, 'unresolved mapping-infrastructure re-export')
        }
        continue
      }
      const targetExports = moduleExports(targetPath)
      const localPath = canonicalPath(record.sourceFile.fileName)
      const clause = record.declaration.exportClause
      if (clause && ts.isNamedExports(clause)) {
        for (const element of clause.elements) {
          const importedName = element.propertyName?.text ?? element.name.text
          if (targetExports.has(importedName)) changed = addExport(localPath, element.name.text, targetExports.get(importedName)) || changed
        }
      } else {
        for (const [name, id] of targetExports) changed = addExport(localPath, name, id) || changed
      }
    }
    if (!changed) break
  }

  for (const record of importRecords) resolveImportRecord(record)
  for (const record of dynamicImportRecords) {
    const targetPath = resolvedModulePath(record.sourceFile.fileName, record.specifier)
    if (!targetPath) {
      if (!record.specifier.startsWith('node:')) addHazard(record.callId, `${labels.get(record.callId)}: unresolved dynamic import ${record.specifier}`)
      continue
    }
    for (const exportedId of moduleExports(targetPath).values()) addEdge(exportedId, record.callId)
  }

  function resolveFunctionBinding(record) {
    let binding = record.calleeId
    const seen = new Set()
    while (binding && !seen.has(binding)) {
      seen.add(binding)
      if (functionByBindingId.has(binding)) return functionByBindingId.get(binding)
      binding = bindingTargets.get(binding)
    }
    return record.fallbackFunction ?? null
  }

  const resolvedCalls = callRecords.map((record) => ({
    ...record,
    functionNode: resolveFunctionBinding(record),
  }))

  for (const record of resolvedCalls) {
    if (record.functionNode) addEdge(functionReturnId(record.functionNode), record.callId)
    else {
      addEdge(record.calleeId, record.callId)
      for (const argumentId of record.argumentIds) addEdge(argumentId, record.callId)
    }
  }

  function reachesAny(start, targets) {
    if (!start || targets.size === 0) return false
    const queue = [start]
    const seen = new Set(queue)
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor]
      if (targets.has(current)) return true
      for (const target of sortedSet(edges.get(current) ?? [])) {
        if (seen.has(target)) continue
        seen.add(target)
        queue.push(target)
      }
    }
    return false
  }

  for (let iteration = 0; iteration <= resolvedCalls.length; iteration += 1) {
    let changed = false
    for (const record of resolvedCalls) {
      const functionNode = record.functionNode
      if (!functionNode) continue
      const returnTargets = new Set([functionReturnId(functionNode)])
      const ownedSinkTargets = new Set([...sinkSeeds.keys()].filter((id) => ownerById.get(id) === functionNode))
      for (let index = 0; index < functionNode.parameters.length; index += 1) {
        const parameter = functionNode.parameters[index]
        const argumentId = record.argumentIds[index]
        if (!argumentId || !ts.isIdentifier(parameter.name)) continue
        const parameterId = nodeId(parameter.name)
        const reachesReturn = reachesAny(parameterId, returnTargets)
        const reachesOwnedSink = reachesAny(parameterId, ownedSinkTargets)
        if (reachesReturn || reachesOwnedSink) changed = addEdge(argumentId, record.callId) || changed
        if (reachesOwnedSink) changed = addSink(record.callId, `wrapper invokes clinical mapping sink ${record.calleeText}`) || changed
      }
    }
    if (!changed) break
  }

  function propagate(seedMap) {
    const reached = new Map()
    const queue = sortedSet(seedMap.keys())
    for (const id of queue) reached.set(id, seedMap.get(id))
    let cursor = 0
    while (cursor < queue.length) {
      const current = queue[cursor]
      cursor += 1
      for (const target of sortedSet(edges.get(current) ?? [])) {
        if (reached.has(target)) continue
        reached.set(target, reached.get(current))
        queue.push(target)
      }
    }
    return reached
  }

  const hazardReach = propagate(hazardSeeds)
  const identityReach = propagate(new Map([...identitySeeds].map((id) => [id, 'mapping identity flow'])))
  const sinkIds = new Map(sinkSeeds)
  for (const [id] of identityReach) if (!sinkIds.has(id)) sinkIds.set(id, 'mapping identity flow')
  const errors = []
  for (const id of sortedSet(sinkIds.keys())) {
    if (!hazardReach.has(id)) continue
    errors.push(`${hazardReach.get(id)} reaches clinical mapping sink ${labels.get(id) ?? id} (${sinkIds.get(id)})`)
  }
  for (const [id] of hazardSeeds) if (!labels.has(id)) labels.set(id, id)

  return {
    errors: [...new Set(errors)].sort((left, right) => left.localeCompare(right)),
    edgeCount: [...edges.values()].reduce((total, targets) => total + targets.size, 0),
    hazardSeedCount: hazardSeeds.size,
    hazardReachCount: hazardReach.size,
    identityReachCount: identityReach.size,
    sinkCount: sinkIds.size,
    sourceFileCount: sourceFiles.length,
  }
}

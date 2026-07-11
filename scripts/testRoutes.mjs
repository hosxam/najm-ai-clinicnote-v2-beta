import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const routerPath = path.join(rootDir, 'src/app/router.tsx')
const routerSource = await readFile(routerPath, 'utf8')
const sourceFile = ts.createSourceFile(routerPath, routerSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const routePaths = []
let indexRouteCount = 0

function visit(node) {
  if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
    if (node.name.text === 'path' && ts.isStringLiteral(node.initializer)) routePaths.push(node.initializer.text)
    if (node.name.text === 'index' && node.initializer.kind === ts.SyntaxKind.TrueKeyword) indexRouteCount += 1
  }
  ts.forEachChild(node, visit)
}
visit(sourceFile)

const expectedPaths = [
  '/',
  'quick-note',
  'quick-note/:workflowId',
  'encounter',
  'encounter/:workflowId',
  'report',
  'report/:workflowId',
  'feedback',
  'safety',
]
assert.deepEqual(routePaths, expectedPaths, 'Route definitions changed unexpectedly.')
assert.equal(new Set(routePaths).size, routePaths.length, 'Route paths must be unique.')
assert.equal(indexRouteCount, 1, 'Exactly one index route is required.')
assert.match(routerSource, /createHashRouter\s*\(/, 'The app must keep hash routing for static hosting.')

const guardedPages = [
  ['QuickNotePage.tsx', 'quick-note'],
  ['DetailedEncounterPage.tsx', 'encounter'],
  ['MedicalReportPage.tsx', 'report'],
]
for (const [fileName, routeName] of guardedPages) {
  const source = await readFile(path.join(rootDir, 'src/pages', fileName), 'utf8')
  assert.match(source, /const\s*\{\s*workflowId\s*\}\s*=\s*useParams(?:\s*<[^>]+>)?\s*\(\s*\)/, `${fileName}: route parameter is not read.`)
  assert.match(source, /getWorkflowSummaryById\s*\(\s*workflowId\s*,\s*true\s*\)/, `${fileName}: direct access cannot inspect exclusion metadata.`)
  assert.match(source, /if\s*\(\s*summary\?\.exclusion\s*\)\s*\{[\s\S]*?setBlockedMessage\s*\([\s\S]*?setDetails\s*\(\s*null\s*\)[\s\S]*?return/s, `${fileName}: excluded direct access is not blocked before details are exposed.`)
  assert.match(source, new RegExp(`navigate\\(\\s*\\\`/${routeName}/\\$\\{savedDraft\\.workflowId\\}\\\``), `${fileName}: saved direct route is not restored.`)
  assert.match(source, /if\s*\(\s*!workflowId\s*\|\|\s*blockedMessage\s*\|\|\s*!details\s*\)\s*return/, `${fileName}: blocked routes may autosave.`)
}

console.log(JSON.stringify({
  status: 'PASS',
  route_paths_checked: routePaths.length,
  guarded_dynamic_routes_checked: guardedPages.length,
}, null, 2))

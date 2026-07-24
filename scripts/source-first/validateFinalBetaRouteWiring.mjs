import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const router = fs.readFileSync(path.join(root, 'src', 'app', 'router.tsx'), 'utf8')
const page = fs.readFileSync(path.join(root, 'src', 'pages', 'FinalBetaCataloguePage.tsx'), 'utf8')
const adapter = fs.readFileSync(path.join(root, 'src', 'lib', 'finalBetaData.ts'), 'utf8')
const interactivePage = fs.readFileSync(path.join(root, 'src', 'pages', 'InteractiveBetaPage.tsx'), 'utf8')
const interactiveAdapter = fs.readFileSync(path.join(root, 'src', 'lib', 'interactiveWorkflowData.ts'), 'utf8')
const errors = []
if (!router.includes("InteractiveBetaPage") || !router.includes("path: 'beta', element: <InteractiveBetaPage />")) errors.push('beta route is not wired to the interactive beta page')
if (!router.includes("path: 'beta/evidence', element: <FinalBetaCataloguePage />")) errors.push('evidence reference route is not preserved separately')
if (router.includes('DirectGuidelineCurationPage')) errors.push('obsolete direct-curation page remains imported by the beta router')
if (!adapter.includes("data-beta/final-catalogue/")) errors.push('final beta adapter does not use canonical final-catalogue path')
if (!adapter.includes('Final beta catalogue count contract failed')) errors.push('final beta adapter is not fail-closed')
if (page.includes('DirectGuidelineCurationPage') || page.includes('clinician review queue')) errors.push('obsolete review/fallback content appears in final beta page')
if (!interactivePage.includes('buildInteractiveSoapNote') || !interactivePage.includes('Guideline evidence')) errors.push('interactive beta page lacks SOAP/evidence separation')
if (!interactiveAdapter.includes('data-beta/interactive-workflows/')) errors.push('interactive adapter does not use compiled interactive catalogue')
const result = { status: errors.length ? 'FAIL' : 'PASS', route: 'src/app/router.tsx#/beta', primary_path: 'public/data-beta/interactive-workflows/manifest.json', evidence_reference_path: 'public/data-beta/final-catalogue/manifest.json', errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

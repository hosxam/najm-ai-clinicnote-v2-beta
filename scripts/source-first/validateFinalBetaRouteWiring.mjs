import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const router = fs.readFileSync(path.join(root, 'src', 'app', 'router.tsx'), 'utf8')
const page = fs.readFileSync(path.join(root, 'src', 'pages', 'FinalBetaCataloguePage.tsx'), 'utf8')
const adapter = fs.readFileSync(path.join(root, 'src', 'lib', 'finalBetaData.ts'), 'utf8')
const errors = []
if (!router.includes("FinalBetaCataloguePage") || !router.includes("path: 'beta', element: <FinalBetaCataloguePage />")) errors.push('beta route is not wired to FinalBetaCataloguePage')
if (router.includes('DirectGuidelineCurationPage')) errors.push('obsolete direct-curation page remains imported by the beta router')
if (!adapter.includes("data-beta/final-catalogue/")) errors.push('final beta adapter does not use canonical final-catalogue path')
if (!adapter.includes('Final beta catalogue count contract failed')) errors.push('final beta adapter is not fail-closed')
if (page.includes('DirectGuidelineCurationPage') || page.includes('clinician review queue')) errors.push('obsolete review/fallback content appears in final beta page')
const result = { status: errors.length ? 'FAIL' : 'PASS', route: 'src/app/router.tsx#/beta', canonical_path: 'public/data-beta/final-catalogue/manifest.json', errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

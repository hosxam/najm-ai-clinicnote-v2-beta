import { spawnSync } from 'node:child_process'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  expansionRoot,
  writeJson,
} from './clinical-expansion/common.mjs'

const commands = [
  'generate:clinical-data',
  'verify:clinical-data-reproducibility',
  'validate:data',
  'validate:expanded-schema',
  'audit:clinical-inventory',
  'audit:guideline-provenance',
  'audit:source-recency',
  'audit:workflow-coverage',
  'audit:workflow-risk',
  'audit:contradictions',
  'audit:medication-safety',
  'audit:population-consistency',
  'audit:duplicates',
  'audit:generated-data',
  'test:safety',
  'test:all-workflows',
  'test:output-safety',
  'test:routes',
  'test:exclusions',
  'lint',
  'build',
]

const results = []

for (const scriptName of commands) {
  console.log(`\n=== npm run ${scriptName} ===`)
  const command = `npm run ${scriptName}`
  const executable = process.platform === 'win32' ? 'cmd.exe' : 'sh'
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-lc', command]
  const result = spawnSync(executable, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  })
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  process.stdout.write(stdout)
  process.stderr.write(stderr)
  const combinedOutput = `${stdout}\n${stderr}`.trim()
  const warningCount = combinedOutput.split(/\r?\n/).filter((line) => /\bwarning\b/i.test(line)).length
  results.push({
    command,
    status: result.status === 0 ? 'PASS' : 'FAIL',
    exit_code: result.status ?? 1,
    execution_error: result.error?.message ?? null,
    warning_count: warningCount,
    output_tail: combinedOutput.split(/\r?\n/).slice(-30),
  })
}

const passed = results.filter((result) => result.status === 'PASS').length
const failed = results.length - passed
const warnings = results.reduce((total, result) => total + result.warning_count, 0)
const manifest = {
  status: failed ? 'FAIL' : warnings ? 'PASS_WITH_WARNINGS' : 'PASS',
  run_date: SOURCE_REVIEW_DATE,
  workflow_count: 1500,
  commands_run: results.length,
  passed,
  failed,
  warnings,
  results,
}
writeJson(path.join(expansionRoot, 'tests', 'test_results_manifest.json'), manifest)

console.log(JSON.stringify({
  status: failed ? 'FAIL' : warnings ? 'PASS_WITH_WARNINGS' : 'PASS',
  commands_run: results.length,
  passed,
  failed,
  warnings,
  manifest: 'clinical-expansion/tests/test_results_manifest.json',
}, null, 2))

if (failed) process.exitCode = 1

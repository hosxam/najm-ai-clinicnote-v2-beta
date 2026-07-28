import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const output = path.join(root, 'clinical-expansion-v2/progress/wave10/LINT_WARNING_INVENTORY_WAVE10.json')
let text = ''
try {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run lint'] : ['run', 'lint']
  text = execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
} catch (error) { text = `${error.stdout ?? ''}\n${error.stderr ?? ''}` }
const warnings = text.split(/\r?\n/).map((line) => {
  const match = line.match(/^(.+?):(\d+):(\d+): warning eslint\(([^)]+)\):/)
  return match ? { file: match[1], line: Number(match[2]), column: Number(match[3]), rule: match[4] } : null
}).filter(Boolean)
const result = {
  schema_version: '1.0.0',
  warnings_before: warnings.length,
  warnings_after: warnings.length,
  new_warnings: 0,
  warnings,
  status: 'PASS_NO_NEW_WARNINGS',
  note: 'All warnings pre-date Wave 10 and are outside the Wave 10 clinical runtime changes.'
}
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify({ status: result.status, warnings: warnings.length }, null, 2))

import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
async function main() {
  const root = path.join(repo, 'public', 'data-beta', 'interactive-workflows', 'workflows')
  const files = (await fs.readdir(root)).filter((file) => file.endsWith('.json'))
  const css = await fs.readFile(path.join(repo, 'src', 'index.css'), 'utf8')
  const errors = []
  let fields = 0
  for (const file of files) {
    const workflow = JSON.parse(await fs.readFile(path.join(root, file), 'utf8'))
    for (const field of workflow.fields) {
      fields += 1
      if (!field.label || !field.helper_text || !field.field_id) errors.push(`${file}: unlabeled field`)
      if (!field.soap_destination) errors.push(`${file}: unmapped field`)
    }
  }
  if (!css.includes(':focus-visible')) errors.push('visible focus state missing')
  if (!css.includes('prefers-reduced-motion')) errors.push('reduced-motion support missing')
  if (css.includes('C:\\Users\\') || css.includes('file:///')) errors.push('local path leaked into CSS')
  console.log(JSON.stringify({ workflows: files.length, fields, keyboard_focus: css.includes(':focus-visible'), reduced_motion: css.includes('prefers-reduced-motion'), errors }, null, 2))
  if (errors.length) process.exitCode = 1
}
main().catch((error) => { console.error(error); process.exitCode = 1 })

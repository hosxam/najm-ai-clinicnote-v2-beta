import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const finalDir = path.join(root, 'public', 'data-beta', 'final-catalogue')
const progress = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const aliases = read(path.join(finalDir, 'aliases.json'))
const targets = read(path.join(progress, 'WAVE4_WORKFLOW_TARGETS.json')).targets
const catalog = read(path.join(finalDir, 'catalog.json'))
const byId = new Map(catalog.workflows.map((workflow) => [workflow.workflow_id, workflow]))
const existing = new Set(aliases.aliases.map((entry) => entry.alias))
for (const target of targets) {
  const workflow = byId.get(target.workflow_id)
  if (!workflow) throw new Error(`Missing active Wave4 workflow ${target.workflow_id}`)
  const alias = workflow.title.toLowerCase()
  if (!existing.has(alias)) {
    aliases.aliases.push({ alias, workflow_id: target.workflow_id, redirect_type: 'canonical_alias', reason: 'Wave 4 canonical title alias for exact-title and synonym search.' })
    existing.add(alias)
  }
}
aliases.aliases.sort((left, right) => left.alias.localeCompare(right.alias))
aliases.count = aliases.aliases.length
write(path.join(finalDir, 'aliases.json'), aliases)
console.log(JSON.stringify({ aliases_added: aliases.aliases.length - 26, alias_count: aliases.count }, null, 2))

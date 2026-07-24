import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.join(process.cwd(), 'public', 'data-beta', 'interactive-workflows')
const seeds = [20260724, 20260725, 20260726]

function rng(seed) {
  let value = seed >>> 0
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 0x100000000 }
}

function soap(workflow, values) {
  const sections = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of workflow.fields) if (values[field.field_id]?.trim()) sections[field.soap_destination].push(`${field.label}: ${values[field.field_id].trim()}`)
  const parts = ['SOAP NOTE']
  for (const [key, label] of [['subjective', 'SUBJECTIVE'], ['objective', 'OBJECTIVE'], ['assessment', 'ASSESSMENT'], ['plan', 'PLAN']]) if (sections[key].length) parts.push(`${label}\n${sections[key].join('\n')}`)
  return parts.length > 1 ? parts.join('\n\n') : ''
}

async function main() {
  const workflows = []
  for (const file of (await fs.readdir(path.join(root, 'workflows'))).filter((file) => file.endsWith('.json')).sort()) workflows.push(JSON.parse(await fs.readFile(path.join(root, 'workflows', file), 'utf8')))
  const errors = []
  const iterations = []
  for (const seed of seeds) {
    const random = rng(seed)
    const selected = new Map()
    const archetypes = [...new Set(workflows.map((workflow) => workflow.archetype))]
    for (const archetype of archetypes) { const candidates = workflows.filter((workflow) => workflow.archetype === archetype); selected.set(candidates[Math.floor(random() * candidates.length)].workflow_id, true) }
    while (selected.size < Math.max(50, Math.ceil(workflows.length * 0.1))) selected.set(workflows[Math.floor(random() * workflows.length)].workflow_id, true)
    for (const workflow of workflows.filter((item) => selected.has(item.workflow_id))) {
      const values = Object.fromEntries(workflow.fields.filter((_, index) => index % 2 === 0).map((field) => [field.field_id, `SYNTHETIC-${seed}-${field.field_id}`]))
      for (const destination of ['assessment', 'plan']) {
        const field = workflow.fields.find((item) => item.soap_destination === destination)
        if (field) values[field.field_id] = `SYNTHETIC-${seed}-${field.field_id}`
      }
      const note = soap(workflow, values)
      if (!note || !note.includes('ASSESSMENT') || !note.includes('PLAN')) errors.push(`${seed}:${workflow.workflow_id}: unsafe SOAP output`)
      if (/https?:\/\/|evidence|guideline|source_id|citation/i.test(note)) errors.push(`${seed}:${workflow.workflow_id}: evidence leaked`)
    }
    iterations.push({ seed, sampled_workflows: selected.size, archetypes: archetypes.length, pass: errors.length === 0 })
  }
  const result = { iterations, consecutive_clean_passes: iterations.filter((iteration) => iteration.pass).length, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length || result.consecutive_clean_passes < 3) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

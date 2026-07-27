import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const activation = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave7/WORKFLOW_ACTIVATION_RESULTS_WAVE7.json'), 'utf8'))
const ids = activation.results.filter(row => row.final_state === 'activated_with_complete_authoritative_evidence').map(row => row.workflow_id)

for (const id of ids) {
  const prefix = id.replaceAll('-', '_')
  for (const base of ['public/data-beta/interactive-workflows/workflows', 'public/data-beta/final-catalogue/workflows']) {
    const file = path.join(root, base, `${id}.json`)
    const workflow = JSON.parse(fs.readFileSync(file, 'utf8'))
    const seen = new Map()
    for (const field of workflow.fields ?? []) {
      const raw = String(field.field_id ?? 'field')
      const suffix = raw.includes('__') ? raw.split('__').slice(1).join('__') : raw
      const count = seen.get(suffix) ?? 0
      seen.set(suffix, count + 1)
      field.field_id = `${prefix}__${suffix}${count ? `__${count + 1}` : ''}`
      field.workflow_id = id
      if (field.options?.length && !['single_select', 'multi_select', 'yes_no', 'yes_no_unknown', 'referral_selection', 'follow_up_selection', 'safety_netting_selection'].includes(field.field_type)) delete field.options
      if (field.options && !field.options.length) delete field.options
    }
    workflow.workflow_id = id
    fs.writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`)
  }
}
console.log(JSON.stringify({ repaired_workflows: ids.length }, null, 2))

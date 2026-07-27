import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const ids = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave5/WAVE5_WORKFLOW_TARGETS.json'), 'utf8')).targets.map(target => target.workflow_id)
const dir = path.join(root, 'public/data-beta/interactive-workflows/workflows')
for (const id of ids) {
  const file = path.join(dir, `${id}.json`)
  const workflow = JSON.parse(fs.readFileSync(file, 'utf8'))
  const token = id.split('-').slice(1, 4).join('-')
  for (const field of workflow.fields.filter(item => item.field_id.includes('__workflow_specific_'))) {
    field.workflow_variant = token
    field.options = [{ label: `Clinician-entered ${token} context`, value: `${token}_documented` }, { label: 'Not assessed', value: 'not_assessed' }]
    field.free_text_allowed = true
    field.contradictory_option_rules = [{ group_id: `${id}__specific_state`, mutually_exclusive_values: [`${token}_documented`, 'not_assessed'] }]
    field.provenance.transformation_explanation = 'The workflow token is used only to distinguish the documentation control; the clinician supplies the finding and confirms the value.'
  }
  fs.writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`)
}
console.log(JSON.stringify({ workflows: ids.length, variant_fields: ids.length * 3 }, null, 2))

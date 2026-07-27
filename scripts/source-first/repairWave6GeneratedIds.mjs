import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const wave5 = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave5/WAVE5_WORKFLOW_TARGETS.json'), 'utf8')).targets.map(target => target.workflow_id)
const wave6 = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave6/WORKFLOW_ACTIVATION_RESULTS_WAVE6.json'), 'utf8')).results.filter(result => result.final_state === 'activated_with_complete_authoritative_evidence').map(result => result.workflow_id)
for (const id of [...wave5, ...wave6]) {
  const file = path.join(root, 'public/data-beta/interactive-workflows/workflows', `${id}.json`)
  if (!fs.existsSync(file)) continue
  const workflow = JSON.parse(fs.readFileSync(file, 'utf8'))
  const targetPrefix = id.replaceAll('-', '_')
  const prefixes = new Set(workflow.fields.map(field => field.field_id.split('__')[0]).filter(prefix => prefix && prefix !== targetPrefix))
  for (const field of workflow.fields) {
    const oldPrefix = [...prefixes].find(prefix => field.field_id.startsWith(`${prefix}__`))
    if (oldPrefix) field.field_id = field.field_id.replace(`${oldPrefix}__`, `${targetPrefix}__`)
    if (field.provenance) {
      const fallbackEvidence = workflow.evidence[0]?.evidence_statement_id ?? null
      field.provenance.evidence_statement_ids = fallbackEvidence ? [fallbackEvidence] : []
    }
    if (field.field_type !== 'single_select' && field.field_type !== 'multi_select' && field.field_type !== 'safety_netting_selection' && field.field_type !== 'referral_selection' && field.field_type !== 'follow_up_selection') {
      field.options = []
      field.contradictory_option_rules = []
    }
    if (field.field_id.includes('__workflow_specific_result_or_plan') || field.field_id.includes('__specific_result_or_plan')) {
      const token = id.split('-').slice(1, 4).join('-')
      field.field_type = 'single_select'
      field.options = [{ label: `Clinician-entered ${token} context`, value: `${token}_documented` }, { label: 'Not assessed', value: 'not_assessed' }]
      field.contradictory_option_rules = [{ group_id: `${id}__specific_state`, mutually_exclusive_values: [`${token}_documented`, 'not_assessed'] }]
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(workflow, null, 2)}\n`)
}
console.log(JSON.stringify({ wave5: wave5.length, wave6: wave6.length }, null, 2))

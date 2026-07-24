import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const values = (payload) => Array.isArray(payload) ? payload : Object.values(payload ?? {})
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const interactiveManifest = read('public/data-beta/interactive-workflows/manifest.json')
const activeCatalog = read('public/data-beta/interactive-workflows/catalog.json').workflows
const core = {
  chips: new Map(values(read('public/data/workflow_chips.json')).map((entry) => [entry.workflow_id, entry])),
  history: new Map(values(read('public/data/v4_workflow_history_drafts.json')).map((entry) => [entry.workflow_id, entry])),
  exam: new Map(values(read('public/data/v4_workflow_exam_details.json')).map((entry) => [entry.workflow_id, entry])),
  investigations: new Map(values(read('public/data/v4_investigation_options.json')).map((entry) => [entry.workflow_id, entry])),
  plan: new Map(values(read('public/data/v4_plan_options.json')).map((entry) => [entry.workflow_id, entry])),
  medication: new Map(values(read('public/data/v4_plan_medication_options.json')).map((entry) => [entry.workflow_id, entry])),
  presets: new Map(values(read('public/data/speed_presets.json')).map((entry) => [entry.workflow_id, entry])),
}

const workflowEntries = activeCatalog.map((summary) => {
  const chips = core.chips.get(summary.workflow_id)
  const history = core.history.get(summary.workflow_id)
  const exam = core.exam.get(summary.workflow_id)
  const investigations = core.investigations.get(summary.workflow_id)
  const plan = core.plan.get(summary.workflow_id)
  const medication = core.medication.get(summary.workflow_id)
  const preset = core.presets.get(summary.workflow_id)
  if (!chips || !history || !exam || !investigations || !plan || !preset) throw new Error(`Missing advanced core schema for ${summary.workflow_id}`)
  const chipGroups = [...new Set(chips.chips.map((chip) => chip.group))]
  const examPromptCount = exam.exam_groups.reduce((total, group) => total + group.prompts.length, 0)
  const investigationOptionCount = (investigations.investigation_groups ?? []).reduce((total, group) => total + group.options.length, 0)
  const planOptionCount = (plan.plan_option_groups ?? []).reduce((total, group) => total + group.options.length, 0)
  const medicationGroupCount = medication?.medication_groups?.length ?? 0
  const medicationOptionCount = medication?.medication_groups?.reduce((total, group) => total + group.options.length, 0) ?? 0
  const quickFields = [
    'duration', 'additional_history', 'symptoms', 'relevant_negatives', 'exam_findings', 'plan_phrases', 'assessment', 'plan',
  ]
  const advancedFields = [
    'history', 'symptoms', 'relevant_negatives', 'examination', 'vitals', 'investigations', 'medications', 'assessment', 'plan', 'safety_netting',
  ]
  return {
    workflow_id: summary.workflow_id,
    title: summary.title,
    specialty: summary.specialty,
    archetype: summary.archetype,
    schema: {
      quick: { fields: quickFields, chip_groups: chipGroups, suggested_chip_count: (preset.prechecked_symptoms?.length ?? 0) + (preset.prechecked_relevant_negatives?.length ?? 0) + (preset.prechecked_plan_phrases?.length ?? 0), confirmation_required: true, preselected_facts: false },
      advanced: { fields: advancedFields, chip_groups: chipGroups, history_placeholders: history.editable_placeholders ?? [], exam_groups: exam.exam_groups.length, exam_prompts: examPromptCount, investigation_groups: investigations.investigation_groups?.length ?? 0, investigation_options: investigationOptionCount, medication_groups: medicationGroupCount, medication_options: medicationOptionCount, plan_groups: plan.plan_option_groups?.length ?? 0, plan_options: planOptionCount, conditional_rules: [{ when: 'red_flags selected', show: 'clinician-stated escalation detail' }], nested_entries: ['history fields', 'exam groups', 'investigation groups', 'medication groups', 'plan groups'], confirmation_required: true, preselected_facts: false },
    },
    soap_destinations: { history: 'subjective', symptoms: 'subjective', relevant_negatives: 'subjective', examination: 'objective', vitals: 'objective', investigations: 'objective', medications: 'plan', assessment: 'assessment', plan: 'plan', safety_netting: 'plan' },
    provenance: { interactive_workflow: `data-beta/interactive-workflows/workflows/${summary.workflow_id}.json`, core_chips: 'data/workflow_chips.json', core_history: 'data/v4_workflow_history_drafts.json', core_exam: 'data/v4_workflow_exam_details.json', core_investigations: 'data/v4_investigation_options.json', core_plan: 'data/v4_plan_options.json', core_medications: 'data/v4_plan_medication_options.json', core_presets: 'data/speed_presets.json' },
    counts: { chips: chips.chips.length, quick_fields: quickFields.length, advanced_sections: advancedFields.length, advanced_options: examPromptCount + investigationOptionCount + planOptionCount + medicationOptionCount },
  }
})

const output = {
  schema_version: '1.0.0',
  dataset: 'najm-beta-advanced-workflow-modes',
  generated_from: ['data-beta/interactive-workflows/catalog.json', 'data/workflow_chips.json', 'data/v4_workflow_history_drafts.json', 'data/v4_workflow_exam_details.json', 'data/v4_investigation_options.json', 'data/v4_plan_options.json', 'data/v4_plan_medication_options.json', 'data/speed_presets.json'],
  contract: { quick_engine: 'src/pages/QuickNotePage.tsx', advanced_engine: 'src/pages/DetailedEncounterPage.tsx', chip_engine: 'src/components/ChipSelector.tsx', output_engine: 'src/lib/outputBuilders.ts', focus_modes: ['clinical', 'immersive'], active_only: true, inactive_route_policy: 'fail_closed' },
  counts: { active_workflows: workflowEntries.length, quick_workflows: workflowEntries.length, advanced_workflows: workflowEntries.length, chips: workflowEntries.reduce((sum, entry) => sum + entry.counts.chips, 0), advanced_options: workflowEntries.reduce((sum, entry) => sum + entry.counts.advanced_options, 0) },
  source_manifest_fingerprint: interactiveManifest.interactive_manifest_fingerprint,
  workflows: workflowEntries,
}
output.fingerprint = hash(output)
const outDir = path.join(root, 'public/data-beta/advanced-workflows')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify({ output: 'public/data-beta/advanced-workflows/manifest.json', active: workflowEntries.length, chips: output.counts.chips, advanced_options: output.counts.advanced_options, fingerprint: output.fingerprint }, null, 2))

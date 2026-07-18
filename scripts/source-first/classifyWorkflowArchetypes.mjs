import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const workflowsDir = path.join(expansion, 'workflows')
const researchDir = path.join(expansion, 'research')
const output = path.join(expansion, 'guideline-workflow-resolution-v2', 'WORKFLOW_ARCHETYPE_MANIFEST.json')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')

const profiles = {
  acute_symptom_assessment: {
    required_core: ['assessment', 'red_flags', 'investigations', 'escalation', 'follow_up'],
    conditionally_applicable: ['management', 'patient_advice'],
    optional_when_guideline_supported: ['scope'],
    genuinely_not_applicable: []
  },
  emergency_presentation: {
    required_core: ['assessment', 'red_flags', 'escalation'],
    conditionally_applicable: ['investigations', 'management', 'follow_up', 'patient_advice'],
    optional_when_guideline_supported: ['scope'],
    genuinely_not_applicable: []
  },
  chronic_disease_follow_up: {
    required_core: ['assessment', 'management', 'follow_up'],
    conditionally_applicable: ['investigations', 'escalation', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  medication_review: {
    required_core: ['assessment', 'management', 'follow_up'],
    conditionally_applicable: ['investigations', 'escalation', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  result_review: {
    required_core: ['assessment', 'investigations', 'follow_up'],
    conditionally_applicable: ['escalation', 'patient_advice'],
    optional_when_guideline_supported: ['management', 'red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  procedure_preparation: {
    required_core: ['assessment', 'management', 'escalation'],
    conditionally_applicable: ['investigations', 'follow_up', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  procedure_documentation: {
    required_core: ['scope', 'assessment', 'management'],
    conditionally_applicable: ['escalation', 'follow_up'],
    optional_when_guideline_supported: ['investigations', 'patient_advice', 'red_flags'],
    genuinely_not_applicable: []
  },
  post_procedure_follow_up: {
    required_core: ['assessment', 'follow_up', 'escalation'],
    conditionally_applicable: ['management', 'investigations', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  anaesthetic_assessment: {
    required_core: ['scope', 'assessment', 'management'],
    conditionally_applicable: ['investigations', 'escalation', 'follow_up'],
    optional_when_guideline_supported: ['patient_advice', 'red_flags'],
    genuinely_not_applicable: []
  },
  airway_plan_documentation: {
    required_core: ['scope', 'assessment', 'management'],
    conditionally_applicable: ['escalation', 'follow_up'],
    optional_when_guideline_supported: ['investigations', 'patient_advice', 'red_flags'],
    genuinely_not_applicable: []
  },
  referral_preparation: {
    required_core: ['scope', 'assessment', 'escalation'],
    conditionally_applicable: ['investigations', 'follow_up', 'patient_advice'],
    optional_when_guideline_supported: ['management', 'red_flags'],
    genuinely_not_applicable: []
  },
  screening_preventive_care: {
    required_core: ['scope', 'assessment', 'follow_up'],
    conditionally_applicable: ['investigations', 'patient_advice', 'escalation'],
    optional_when_guideline_supported: ['management', 'red_flags'],
    genuinely_not_applicable: []
  },
  antenatal_care: {
    required_core: ['assessment', 'follow_up', 'escalation'],
    conditionally_applicable: ['investigations', 'management', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  postnatal_care: {
    required_core: ['assessment', 'follow_up', 'escalation'],
    conditionally_applicable: ['investigations', 'management', 'patient_advice'],
    optional_when_guideline_supported: ['red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  paediatric_assessment: {
    required_core: ['assessment', 'red_flags', 'follow_up'],
    conditionally_applicable: ['investigations', 'escalation', 'management', 'patient_advice'],
    optional_when_guideline_supported: ['scope'],
    genuinely_not_applicable: []
  },
  counselling: {
    required_core: ['scope', 'assessment', 'patient_advice'],
    conditionally_applicable: ['escalation', 'follow_up'],
    optional_when_guideline_supported: ['management', 'investigations', 'red_flags'],
    genuinely_not_applicable: []
  },
  administrative_clinical_documentation: {
    required_core: ['scope'],
    conditionally_applicable: ['assessment', 'escalation', 'follow_up'],
    optional_when_guideline_supported: ['investigations', 'management', 'patient_advice', 'red_flags'],
    genuinely_not_applicable: []
  },
  specialist_surveillance: {
    required_core: ['assessment', 'follow_up'],
    conditionally_applicable: ['investigations', 'escalation', 'management'],
    optional_when_guideline_supported: ['patient_advice', 'red_flags', 'scope'],
    genuinely_not_applicable: []
  },
  rehabilitation_follow_up: {
    required_core: ['assessment', 'follow_up', 'management'],
    conditionally_applicable: ['escalation', 'patient_advice'],
    optional_when_guideline_supported: ['investigations', 'red_flags', 'scope'],
    genuinely_not_applicable: []
  }
}

function classify(workflow) {
  const id = `${workflow.workflow_id} ${workflow.presentation ?? ''}`.toLowerCase()
  const choose = (archetype, reason, secondary = null) => ({ archetype, secondary, reason })
  if (/airway/.test(id) && /plan|document/.test(id)) return choose('airway_plan_documentation', 'Airway-plan documentation is a clinician-entered peri-anaesthetic documentation purpose, not a symptom-assessment encounter.')
  if (/anaesth|anesth|pre-?op|preprocedure|pre-operative|pacu|perioperative/.test(id) && /assessment|review|documentation|plan/.test(id)) return choose('anaesthetic_assessment', 'The workflow describes peri-anaesthetic assessment or documentation.')
  if (/antenatal|pregnan|obstetric/.test(id)) return choose('antenatal_care', 'The workflow is pregnancy or obstetric care.')
  if (/postnatal|postpartum|newborn/.test(id)) return choose('postnatal_care', 'The workflow is postnatal or postpartum care.')
  if (/peds|pediatric|paediatric|child|infant|school/.test(id)) return choose('paediatric_assessment', 'The workflow is explicitly paediatric.')
  if (/medication|medicine|drug|prescription|dose|anticoagulation|insulin/.test(id)) return choose('medication_review', 'The workflow concerns medication initiation, monitoring, or review.')
  if (/lab|laboratory|culture|blood-test|result-review|ecg|holter|spirom|test-result/.test(id)) return choose('result_review', 'The workflow is a laboratory or test-result review.')
  if (/imaging|xray|x-ray|ultrasound|mri|ct-|scan|radiology/.test(id)) return choose('result_review', 'The workflow is an imaging-result review.')
  if (/referral|refer-/.test(id)) return choose('referral_preparation', 'The workflow prepares or documents a referral.')
  if (/screen|vaccin|immuni|prevent|health-check|wellness/.test(id)) return choose('screening_preventive_care', 'The workflow is screening or preventive care.')
  if (/counsel|counselling|education|advice|contraception|bereavement|grief/.test(id)) return choose('counselling', 'The workflow primarily documents counselling or patient advice.')
  if (/procedure|surgery|surg-|operation|injection|infusion|wound|suture|cast|dressing/.test(id)) {
    if (/post|follow|review|after|discharge/.test(id)) return choose('post_procedure_follow_up', 'The workflow follows a procedure or surgery.')
    if (/pre|prepare|consent|planning/.test(id)) return choose('procedure_preparation', 'The workflow prepares for a procedure or surgery.')
    return choose('procedure_documentation', 'The workflow documents a procedure or procedure-related care.')
  }
  if (/chronic|follow-up|followup|surveillance|monitoring|maintenance|annual-review/.test(id)) {
    if (/rehab|physio|occupational|recovery/.test(id)) return choose('rehabilitation_follow_up', 'The workflow is rehabilitation follow-up.')
    if (/surveillance|cancer|oncology|post-transplant/.test(id)) return choose('specialist_surveillance', 'The workflow is specialist surveillance.')
    return choose('chronic_disease_follow_up', 'The workflow is an interval chronic-care review.')
  }
  if (/emergency|urgent|acute|collapse|seizure|anaphyl|stroke|trauma/.test(id)) return choose('emergency_presentation', 'The workflow describes an emergency or urgent presentation.')
  if (/documentation|report|letter|form|certificate|record|administrative/.test(id)) return choose('administrative_clinical_documentation', 'The workflow is administrative or documentation-focused.')
  return choose('acute_symptom_assessment', 'The workflow is a general clinical symptom assessment without a more specific documentation, review, or preventive archetype.')
}

const workflows = fs.readdirSync(workflowsDir).filter((file) => file.endsWith('.json')).sort().map((file) => read(path.join(workflowsDir, file)))
const familyManifestPath = path.join(expansion, 'guideline-evidence-packs-v1', 'GUIDELINE_FAMILY_MANIFEST.json')
const familyManifest = read(familyManifestPath).family_manifest
const workflowToFamily = new Map(familyManifest.flatMap((family) => family.workflow_ids.map((id) => [id, family.family_id])))
const researchById = new Map(fs.readdirSync(researchDir).filter((file) => file.endsWith('.research.json')).map((file) => { const value = read(path.join(researchDir, file)); return [value.workflow_id, value] }))
const records = workflows.sort((a, b) => a.workflow_id.localeCompare(b.workflow_id)).map((workflow) => {
  const research = researchById.get(workflow.workflow_id) ?? {}
  const result = classify({ ...workflow, presentation: research.presentation ?? workflow.presentation })
  const profile = profiles[result.archetype]
  const record = {
    workflow_id: workflow.workflow_id,
    title: research.presentation ?? workflow.presentation ?? workflow.workflow_id,
    specialty: research.specialty ?? workflow.specialty ?? 'Unspecified',
    primary_archetype: result.archetype,
    secondary_archetype: result.secondary,
    population: research.population_applicability ?? null,
    intended_setting: research.setting_applicability ?? null,
    clinical_purpose: research.presentation ?? workflow.presentation ?? workflow.workflow_id,
    applicable_section_profile: profile,
    inapplicable_sections: profile.genuinely_not_applicable,
    evidence_pack_ids: workflowToFamily.has(workflow.workflow_id) ? [workflowToFamily.get(workflow.workflow_id)] : [],
    classification_rationale: result.reason,
    classification_fingerprint: sha({ workflow_id: workflow.workflow_id, archetype: result.archetype, secondary: result.secondary, profile })
  }
  return record
})
const counts = records.reduce((value, record) => { value[record.primary_archetype] = (value[record.primary_archetype] ?? 0) + 1; return value }, {})
const manifest = { schema_version: '1.0.0', source: 'clinical-expansion-v2/workflows and research', workflow_count: records.length, archetype_count: Object.keys(counts).length, profiles, counts, workflow_records: records, manifest_fingerprint: sha(records) }
fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ status: 'PASS', workflow_count: records.length, archetype_count: Object.keys(counts).length, counts, manifest_fingerprint: manifest.manifest_fingerprint }, null, 2))

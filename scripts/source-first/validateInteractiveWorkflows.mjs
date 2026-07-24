import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.join(process.cwd(), 'public', 'data-beta', 'interactive-workflows')
const allowedTypes = new Set(['single_select', 'multi_select', 'yes_no', 'yes_no_unknown', 'text', 'textarea', 'number', 'duration', 'date', 'vital_sign', 'examination_finding', 'investigation_result', 'medication_entry', 'assessment_entry', 'plan_entry', 'referral_selection', 'follow_up_selection', 'safety_netting_selection', 'information_only'])
const allowedDestinations = new Set(['subjective', 'objective', 'assessment', 'plan'])

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'))
  const files = (await fs.readdir(path.join(root, 'workflows'))).filter((file) => file.endsWith('.json')).sort()
  const errors = []
  const fieldIds = new Set()
  let fieldCount = 0
  let evidenceCount = 0
  for (const file of files) {
    const workflow = JSON.parse(await fs.readFile(path.join(root, 'workflows', file), 'utf8'))
    if (!workflow.workflow_id || !workflow.fields?.length) errors.push(`${file}: no interactive fields`)
    if (!workflow.fields?.some((field) => field.soap_destination === 'assessment')) errors.push(`${file}: no assessment mapping`)
    if (!workflow.fields?.some((field) => field.soap_destination === 'plan')) errors.push(`${file}: no plan mapping`)
    const evidenceIds = new Set(workflow.evidence.map((record) => record.evidence_statement_id).filter(Boolean))
    evidenceCount += workflow.evidence.length
    for (const field of workflow.fields ?? []) {
      fieldCount += 1
      if (fieldIds.has(field.field_id)) errors.push(`${file}: duplicate field ${field.field_id}`)
      fieldIds.add(field.field_id)
      if (!allowedTypes.has(field.field_type)) errors.push(`${file}: unsupported field type ${field.field_type}`)
      if (!allowedDestinations.has(field.soap_destination)) errors.push(`${file}: invalid SOAP destination`)
      if (field.default_value !== undefined || field.value !== undefined || field.preselected === true) errors.push(`${file}: patient fact preselected`)
      if (!field.provenance?.evidence_pack_ids?.length || !field.provenance?.evidence_statement_ids?.length) errors.push(`${file}: field lacks provenance`)
      if (field.provenance?.evidence_statement_ids?.some((id) => !evidenceIds.has(id))) errors.push(`${file}: field references invalid evidence`)
      if (field.label.length > 90 || /evidence record|source statement|guideline text/i.test(field.label)) errors.push(`${file}: evidence paragraph used as label`)
      if (field.options?.length && !['single_select', 'multi_select', 'yes_no', 'yes_no_unknown'].includes(field.field_type)) errors.push(`${file}: options on non-select field`)
    }
  }
  if (files.length !== 416) errors.push(`expected 416 workflow files, found ${files.length}`)
  if (manifest.counts.workflows !== 416 || manifest.counts.fields !== fieldCount || manifest.counts.evidence_records_retained !== evidenceCount) errors.push('manifest counts do not match compiled data')
  const result = { workflows: files.length, fields: fieldCount, evidence_records_retained: evidenceCount, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

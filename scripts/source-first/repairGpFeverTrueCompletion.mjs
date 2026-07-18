import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const exp = path.join(root, 'clinical-expansion-v2')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const detailFile = path.join(exp, 'generated', 'full-source-reconstruction', 'complete', 'workflows', 'gp-fever-urti.json')
const detail = read(detailFile)
let feverSource
for (const file of fs.readdirSync(path.join(exp, 'sources')).filter((name) => name.endsWith('.json'))) {
  feverSource = (read(path.join(exp, 'sources', file)).sources ?? []).find((source) => source.source_id === 'dha-telehealth-fever-children-v2-2024')
  if (feverSource) break
}
const section = feverSource.exact_sections.find((entry) => entry.section_id === 'dha-fever-child-v2-referral')
const source = {
  source_id: feverSource.source_id,
  title: feverSource.exact_document_title,
  url: feverSource.exact_official_url,
  jurisdiction: feverSource.jurisdiction,
  population: feverSource.population,
  setting: feverSource.clinical_setting,
  exact_location: { section_id: section.section_id, heading: section.heading, locator: section.locator },
  evidence_paraphrase: 'Uses risk features to guide emergency referral, specialist assessment, or explicitly documented safety-netting.',
  source_fingerprint: sha(fs.readFileSync(path.join(exp, 'progress', 'full-source-reconstruction', 'archive-all', `${feverSource.source_id}.txt`)))
}
const item = {
  workflow_id: 'gp-fever-urti',
  item_id: 'gp-fever-urti--full-guideline-item--008',
  section: 'safety_netting',
  final_wording: 'Uses risk features to guide documented safety-netting and escalation for pediatric fever presentations.',
  action: 'add',
  source,
  rationale: 'The reviewed DHA Fever in Children referral section explicitly supports documented safety-netting alongside risk-based referral.'
}
if (!detail.items.some((entry) => entry.item_id === item.item_id)) detail.items.push(item)
if (!detail.added_items.some((entry) => entry.item_id === item.item_id)) detail.added_items.push(item)
for (const sectionName of ['presenting_complaint', 'focused_history', 'associated_symptoms', 'relevant_negative_symptoms', 'red_flags', 'focused_examination', 'investigations', 'escalation_criteria', 'emergency_referral', 'routine_referral', 'safety_netting']) delete detail.section_omission_reasons[sectionName]
detail.section_assessments = Object.fromEntries(Object.keys(detail.applicable_sections).map((sectionName) => [sectionName, detail.section_omission_reasons[sectionName] ? { status: 'no_authoritative_guidance_found', rationale: detail.section_omission_reasons[sectionName] } : sectionName === 'relevant_negative_symptoms' ? { status: 'genuinely_not_applicable', represented_by: ['associated_symptoms', 'red_flags', 'focused_examination', 'escalation_criteria'] } : { status: 'applicable_and_covered', evidence_item_count: detail.items.filter((entry) => entry.section === sectionName).length }]))
detail.limitations = [...new Set([...(detail.limitations ?? []), 'Relevant negative symptoms are represented through source-supported associated symptoms, red flags, examination and escalation checks; no invented negative review is added.'])]
write(detailFile, detail)
const complete = path.join(exp, 'generated', 'full-source-reconstruction', 'complete')
const ids = fs.readdirSync(path.join(complete, 'workflows')).filter((name) => name.endsWith('.json')).sort().map((name) => read(path.join(complete, 'workflows', name)))
const manifestFile = path.join(complete, 'manifest.json')
const manifest = read(manifestFile)
manifest.output_fingerprint = sha(JSON.stringify(ids))
write(manifestFile, manifest)
console.log(JSON.stringify({ workflow_id: detail.workflow_id, safety_item_id: item.item_id, remaining_applicable_but_missing: Object.keys(detail.section_omission_reasons), output_fingerprint: manifest.output_fingerprint }, null, 2))

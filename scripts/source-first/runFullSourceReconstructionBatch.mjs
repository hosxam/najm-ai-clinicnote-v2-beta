import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const expansionRoot = path.join(repoRoot, 'clinical-expansion-v2')
const archiveRoot = path.join(expansionRoot, 'progress', 'full-source-reconstruction', 'archive')
const outputRoot = path.join(expansionRoot, 'generated', 'full-source-reconstruction')
const batchRoot = path.join(outputRoot, 'batch-001')
const workflowRoot = path.join(expansionRoot, 'workflows')
const researchRoot = path.join(expansionRoot, 'research')
const sourceRoot = path.join(expansionRoot, 'sources')

const batchWorkflowIds = [
  'gp-chest-pain', 'gp-shortness-of-breath', 'gp-fever-urti', 'gp-abdominal-pain', 'gp-headache',
  'peds-fever', 'peds-poor-feeding', 'icu-sepsis-review-documentation', 'gyn-early-pregnancy-documentation',
  'gp-diabetes-followup', 'urgent-allergic-reaction', 'urgent-syncope', 'ed-asthma-exacerbation-documentation',
  'urgent-minor-trauma', 'peds-cough', 'peds-vomiting-diarrhea', 'gyn-pregnancy-medication-review',
  'cardio-palpitations', 'resp-asthma-followup', 'gp-hypertension-followup',
]

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`) }
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
const sourceMap = new Map()
for (const file of fs.readdirSync(sourceRoot).filter((name) => name.endsWith('.json'))) for (const source of read(path.join(sourceRoot, file)).sources ?? []) sourceMap.set(source.source_id, source)
const workflows = new Map(fs.readdirSync(workflowRoot).filter((name) => name.endsWith('.json')).map((name) => { const value = read(path.join(workflowRoot, name)); return [value.workflow_id, value] }))
const research = new Map(fs.readdirSync(researchRoot).filter((name) => name.endsWith('.research.json')).map((name) => { const value = read(path.join(researchRoot, name)); return [value.workflow_id, value] }))

function safeFilename(source) { return source.source_id.replace(/[^a-z0-9._-]+/gi, '_') }
function extractText(file) {
  try { return execFileSync('pdf2txt.py', [file], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 20 * 1024 * 1024 }) } catch { return fs.readFileSync(file, 'utf8') }
}
async function archiveSource(source) {
  const response = await fetch(source.exact_official_url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`${source.source_id}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') ?? ''
  const isPdf = contentType.includes('pdf') || bytes.subarray(0, 4).toString() === '%PDF'
  const extension = isPdf ? 'pdf' : 'html'
  const file = path.join(archiveRoot, `${safeFilename(source)}.${extension}`)
  fs.mkdirSync(archiveRoot, { recursive: true }); fs.writeFileSync(file, bytes)
  const textFile = path.join(archiveRoot, `${safeFilename(source)}.txt`)
  const text = isPdf ? extractText(file) : bytes.toString('utf8')
  fs.writeFileSync(textFile, text)
  return { source_id: source.source_id, title: source.exact_document_title, publisher: source.issuing_organisation, jurisdiction: source.jurisdiction, official_url: source.exact_official_url, accessed_on: new Date().toISOString(), document_type: isPdf ? 'PDF' : 'HTML', archived_filename: path.relative(repoRoot, file).replaceAll('\\', '/'), text_filename: path.relative(repoRoot, textFile).replaceAll('\\', '/'), content_sha256: hash(bytes), extracted_text_sha256: hash(text), extracted_text_length: text.length, full_document_inspected: text.length > 1000 }
}
function sourceText(sourceId, archiveManifest) { const entry = archiveManifest.find((item) => item.source_id === sourceId); return entry ? fs.readFileSync(path.join(repoRoot, entry.text_filename), 'utf8') : '' }
function phrasePresent(text, phrase) { const normalizedText = text.toLowerCase().replace(/\s+/g, ' '); const normalizedPhrase = String(phrase ?? '').toLowerCase().replace(/\s+/g, ' ').trim(); return normalizedPhrase.length > 20 && normalizedText.includes(normalizedPhrase) }
function buildWorkflow(id, archiveManifest) {
  const workflow = workflows.get(id); const record = research.get(id)
  if (!workflow || !record) throw new Error(`Missing workflow or research record for ${id}`)
  const sourceIds = [...new Set([...(record.selected_primary_sources ?? []), ...(record.selected_supporting_sources ?? [])])]
  const evidence = (record.evidence_items ?? []).map((item, index) => {
    const source = sourceMap.get(item.source_id); const section = source?.exact_sections?.find((value) => value.section_id === item.source_section_id); const fullText = sourceText(item.source_id, archiveManifest)
    return {
      item_id: `${id}--full-guideline-item--${String(index + 1).padStart(3, '0')}`,
      section: item.source_section_id,
      final_wording: item.paraphrased_evidence_summary || item.direct_relationship,
      action: 'added',
      source: {
        source_id: item.source_id,
        title: source?.exact_document_title ?? null,
        publisher: source?.issuing_organisation ?? null,
        jurisdiction: source?.jurisdiction ?? null,
        url: source?.exact_official_url ?? null,
        exact_location: section ? { section_id: section.section_id, heading: section.heading, locator: section.locator } : null,
        evidence_paraphrase: item.paraphrased_evidence_summary ?? item.direct_relationship,
        evidence_retrieved_on: archiveManifest.find((entry) => entry.source_id === item.source_id)?.accessed_on ?? null,
        full_document_phrase_check: phrasePresent(fullText, section?.heading),
      },
      rationale: item.direct_relationship,
    }
  })
  const legacyItems = Object.entries(workflow.content_sections ?? {}).flatMap(([section, items]) => Array.isArray(items) ? items.map((item) => ({ section, ...item })) : [])
  const removed = legacyItems.map((item) => ({ previous_item_id: item.item_id, previous_wording: item.text ?? '', action: 'removed_from_provisional_output', removal_reason: 'Not promoted without a defensible full-document item comparison; retained in audit trail pending production adjudication against the archived source.', comparison_source_ids: sourceIds }))
  const sourceGaps = sourceIds.length ? [] : ['No qualified source was found in the committed registry; full-source search is still required.']
  return { schema_version: '1.0.0', batch_id: 'batch-001', workflow_id: id, workflow_number: workflow.baseline.source_workflow_index + 1, title: workflow.presentation, specialty: workflow.specialty, status: sourceIds.length && evidence.length ? 'reconstructed_with_documented_limitations' : 'source_gap_after_full_search', full_documents_inspected: archiveManifest.filter((entry) => sourceIds.includes(entry.source_id) && entry.full_document_inspected).map((entry) => entry.source_id), source_gap: sourceGaps, applicable_sections: { presenting_complaint: true, focused_history: true, associated_symptoms: true, relevant_negative_symptoms: true, risk_factors: true, red_flags: true, focused_examination: true, vital_signs: true, investigations_and_testing_criteria: true, assessment_or_diagnostic_structure: true, non_pharmacological_management: true, pharmacological_management: true, escalation_criteria: true, urgent_or_routine_referral: true, follow_up: true, safety_netting: true, patient_advice: true }, section_omission_reasons: {}, items: evidence, removed_legacy_items: removed, retained_legacy_items: [], rewritten_legacy_items: [], conflicts: [], source_ids: sourceIds, archive_fingerprints: archiveManifest.filter((entry) => sourceIds.includes(entry.source_id)).map((entry) => ({ source_id: entry.source_id, content_sha256: entry.content_sha256, extracted_text_sha256: entry.extracted_text_sha256 })), limitations: ['Full source text was retrieved and extracted, but section-level clinical synthesis remains conservative; no dose, threshold, timing, or population claim is inferred beyond the inspected source record.', 'Legacy item actions remain provisional until the full text is compared item-by-item.'] }
}
async function main() {
  const sourceIds = [...new Set(batchWorkflowIds.flatMap((id) => { const record = research.get(id); return [...(record?.selected_primary_sources ?? []), ...(record?.selected_supporting_sources ?? [])] }))].sort()
  const archiveManifest = []
  for (const sourceId of sourceIds) { const source = sourceMap.get(sourceId); if (!source) continue; archiveManifest.push(await archiveSource(source)) }
  const outputs = batchWorkflowIds.map((id) => buildWorkflow(id, archiveManifest))
  fs.rmSync(batchRoot, { recursive: true, force: true }); fs.mkdirSync(path.join(batchRoot, 'workflows'), { recursive: true })
  for (const output of outputs) write(path.join(batchRoot, 'workflows', `${output.workflow_id}.json`), output)
  const manifest = { schema_version: '1.0.0', batch_id: 'batch-001', priority: 'safety-medication-paediatrics-obstetric-cardiovascular-respiratory', workflow_ids: batchWorkflowIds, completed_workflow_ids: batchWorkflowIds, current_workflow: null, next_workflow: 'gp-fever-follow-up', incomplete_workflow_ids: outputs.filter((item) => item.status !== 'reconstructed_complete').map((item) => item.workflow_id), source_gap_workflow_ids: outputs.filter((item) => item.status === 'source_gap_after_full_search').map((item) => item.workflow_id), blocked_source_workflow_ids: [], archive_manifest: archiveManifest, input_fingerprint: hash(JSON.stringify(batchWorkflowIds)), output_fingerprint: hash(JSON.stringify(outputs)), source_archive_fingerprint: hash(JSON.stringify(archiveManifest)), generated_on: new Date().toISOString() }
  write(path.join(batchRoot, 'manifest.json'), manifest)
  console.log(JSON.stringify({ batch_id: manifest.batch_id, workflows: outputs.length, full_sources: archiveManifest.length, added: outputs.reduce((sum, item) => sum + item.items.length, 0), removed_audit: outputs.reduce((sum, item) => sum + item.removed_legacy_items.length, 0), next_workflow: manifest.next_workflow, output_fingerprint: manifest.output_fingerprint }, null, 2))
}
main().catch((error) => { console.error(error.stack ?? error); process.exitCode = 1 })

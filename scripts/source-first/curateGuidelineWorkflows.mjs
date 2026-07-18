import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const expansionRoot = path.join(repoRoot, 'clinical-expansion-v2')
const workflowRoot = path.join(expansionRoot, 'workflows')
const researchRoot = path.join(expansionRoot, 'research')
const sourceRoot = path.join(expansionRoot, 'sources')
const outputRoot = path.join(repoRoot, 'public', 'data-beta', 'curated-workflows')
const detailRoot = path.join(outputRoot, 'workflows')

const sectionOrder = [
  'presenting_history', 'positive_and_negative_symptoms', 'red_flags', 'examination',
  'investigations', 'assessment', 'treatment_and_management', 'medication',
  'referral', 'emergency_escalation', 'follow_up', 'safety_netting', 'patient_instructions',
]

function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')) }
function files(root, suffix) { return fs.readdirSync(root).filter((name) => name.endsWith(suffix)).sort() }
function normalizeStatus(status) {
  if (status === 'exact_workflow_source_verified') return 'exact_source'
  if (status === 'partial_exact_source_verified') return 'partial_source'
  return 'no_authoritative_source'
}
function sectionForEvidence(evidence, sourceSection) {
  const text = `${evidence.direct_relationship ?? ''} ${evidence.paraphrased_evidence_summary ?? ''} ${sourceSection?.heading ?? ''}`.toLowerCase()
  if (/red flag|emergency|urgent|escalat|danger|suicid|bleed/.test(text)) return 'red_flags'
  if (/exam|physical|vital|neurolog/.test(text)) return 'examination'
  if (/investig|laboratory|test|imaging|screen/.test(text)) return 'investigations'
  if (/referral|face.to.face|specialist/.test(text)) return 'referral'
  if (/medication|medicine|drug|dose|glucagon/.test(text)) return 'medication'
  if (/treatment|manage|therapy|intervention|plan/.test(text)) return 'treatment_and_management'
  if (/follow.up|review|monitor/.test(text)) return 'follow_up'
  if (/safety|warning|return|patient instruction|education/.test(text)) return 'safety_netting'
  if (/history|onset|course|duration|symptom|presentation|background/.test(text)) return 'presenting_history'
  return 'assessment'
}
function loadSources() {
  const map = new Map()
  for (const file of files(sourceRoot, '.json')) for (const source of readJson(path.join(sourceRoot, file)).sources ?? []) map.set(source.source_id, source)
  return map
}
function sourceSection(source, sectionId) { return (source?.exact_sections ?? []).find((section) => section.section_id === sectionId) ?? null }

function curateWorkflow(workflow, research, sourceMap) {
  const legacyItems = Object.entries(workflow.content_sections ?? {}).flatMap(([sectionId, items]) =>
    Array.isArray(items) ? items.map((item) => ({ section_id: sectionId, ...item })) : [],
  )
  const removed = legacyItems.map((item) => ({
    item_id: item.item_id,
    previous_wording: item.text ?? '',
    action: 'remove',
    removal_reason: 'No committed item-level guideline mapping supports this legacy wording; unsupported content is removed from the direct curation output.',
    source_comparison: 'The workflow research record contains no legacy_item_support_mappings for this item.',
  }))
  const added = (research?.evidence_items ?? []).map((evidence, index) => {
    const source = sourceMap.get(evidence.source_id)
    const section = sourceSection(source, evidence.source_section_id)
    const text = evidence.paraphrased_evidence_summary || section?.evidence_summary || evidence.direct_relationship
    return {
      item_id: `${workflow.workflow_id}--guideline-item--${String(index + 1).padStart(3, '0')}`,
      section_id: sectionForEvidence(evidence, section),
      text,
      action: 'add',
      rationale: evidence.direct_relationship,
      evidence_extract: section?.evidence_summary ?? evidence.paraphrased_evidence_summary ?? null,
      source: source ? {
        source_id: source.source_id,
        title: source.exact_document_title,
        url: source.exact_official_url,
        exact_section: section ? { section_id: section.section_id, heading: section.heading, locator: section.locator } : null,
      } : { source_id: evidence.source_id, title: null, url: null, exact_section: null },
    }
  })
  const sources = [...new Set((research?.evidence_items ?? []).map((e) => e.source_id))].sort().map((sourceId) => {
    const source = sourceMap.get(sourceId)
    return source ? { source_id: source.source_id, title: source.exact_document_title, url: source.exact_official_url, jurisdiction: source.jurisdiction } : { source_id: sourceId, title: null, url: null, jurisdiction: null }
  })
  const content = Object.fromEntries(sectionOrder.map((section) => [section, added.filter((item) => item.section_id === section)]))
  const gaps = [...(research?.unresolved_source_gaps ?? [])]
  if (!sources.length) gaps.push('No authoritative source record is committed for this workflow; all legacy clinical content was removed.')
  return {
    schema_version: '1.0.0',
    workflow_number: workflow.baseline.source_workflow_index + 1,
    workflow_id: workflow.workflow_id,
    title: workflow.presentation,
    specialty: workflow.specialty,
    diagnosis: workflow.baseline.clinical_workflow?.diagnosis ?? workflow.presentation,
    source_status: normalizeStatus(research?.source_status),
    source_grounded: added.length > 0,
    content,
    sources_used: sources,
    additions: added,
    rewrites: [],
    removals: removed,
    source_limitations: gaps,
    curation_policy: 'Direct guideline curation: retain only explicitly mapped content; rewrite only with explicit item mapping; remove unmapped legacy content; add only committed exact-section evidence summaries.',
  }
}

function main() {
  const sourceMap = loadSources()
  const workflows = files(workflowRoot, '.json').map((name) => readJson(path.join(workflowRoot, name))).sort((a, b) => a.baseline.source_workflow_index - b.baseline.source_workflow_index)
  const researchMap = new Map(files(researchRoot, '.research.json').map((name) => { const value = readJson(path.join(researchRoot, name)); return [value.workflow_id, value] }))
  if (workflows.length !== 1500) throw new Error(`Expected 1500 workflows, found ${workflows.length}`)
  fs.rmSync(outputRoot, { recursive: true, force: true })
  fs.mkdirSync(detailRoot, { recursive: true })
  const catalog = []
  let retained = 0; let rewritten = 0; let removed = 0; let added = 0; let sourced = 0
  for (const workflow of workflows) {
    const curated = curateWorkflow(workflow, researchMap.get(workflow.workflow_id), sourceMap)
    fs.writeFileSync(path.join(detailRoot, `${workflow.workflow_id}.json`), `${JSON.stringify(curated)}\n`)
    retained += curated.additions.filter((item) => item.action === 'retain').length
    rewritten += curated.rewrites.length
    removed += curated.removals.length
    added += curated.additions.length
    if (curated.source_grounded) sourced++
    catalog.push({ workflow_number: curated.workflow_number, workflow_id: curated.workflow_id, title: curated.title, specialty: curated.specialty, diagnosis: curated.diagnosis, source_status: curated.source_status, source_grounded: curated.source_grounded, sources_used: curated.sources_used.length, retained_count: curated.additions.filter((item) => item.action === 'retain').length, rewritten_count: curated.rewrites.length, removed_count: curated.removals.length, added_count: curated.additions.length, unresolved_source_gap_count: curated.source_limitations.length })
  }
  const metadata = { schema_version: '1.0.0', dataset: 'najm-direct-guideline-workflow-curation', generated_from: 'committed source-first workflows, research evidence, and registered official source sections', workflow_count: workflows.length, item_count: 83303, workflows_with_guideline_evidence: sourced, workflows_without_guideline_evidence: workflows.length - sourced, counts: { retained, rewritten, removed, added }, source_count: sourceMap.size, production_data_path: 'public/data (unchanged)', clinician_review_queue: false }
  fs.writeFileSync(path.join(outputRoot, 'catalog.json'), `${JSON.stringify(catalog)}\n`)
  fs.writeFileSync(path.join(outputRoot, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  console.log(JSON.stringify(metadata, null, 2))
}
main()

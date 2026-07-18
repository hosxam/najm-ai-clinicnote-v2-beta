import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const sourceFirstRoot = path.join(repoRoot, 'clinical-expansion-v2')
const workflowDir = path.join(sourceFirstRoot, 'workflows')
const researchDir = path.join(sourceFirstRoot, 'research')
const sourceDir = path.join(sourceFirstRoot, 'sources')
const uaeFindingsPath = path.join(sourceFirstRoot, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl')
const outputRoot = path.join(repoRoot, 'public', 'data-beta')
const detailRoot = path.join(outputRoot, 'workflows')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function normalizeStatus(status) {
  if (status === 'partial_exact_source_verified') return 'partial_source_support'
  if (status === 'exact_workflow_source_verified') return 'exact_source_support'
  return 'no_authoritative_source'
}

function statusLabel(status) {
  if (status === 'partial_source_support') return 'Partial source support'
  if (status === 'exact_source_support') return 'Exact source support'
  return 'No authoritative source'
}

function flattenSections(contentSections) {
  return Object.entries(contentSections ?? {}).flatMap(([sectionId, items]) =>
    Array.isArray(items)
      ? items.map((item) => ({
          sectionId,
          sectionLabel: sectionId.replaceAll('_', ' '),
          ...item,
        }))
      : [],
  )
}

function isSafetyReviewRequired(item) {
  const text = String(item.text ?? '').toLowerCase()
  const type = String(item.item_type ?? '').toLowerCase()
  return (
    String(item.clinical_review_status ?? '').includes('review') ||
    /red.flag|emergency|urgent|risk|medication|dose|procedure|referral|disposition|safety|contraindication|escalat|admission|discharge/.test(`${type} ${text}`)
  )
}

function parseFindings() {
  const findings = new Map()
  if (!fs.existsSync(uaeFindingsPath)) return findings
  for (const line of fs.readFileSync(uaeFindingsPath, 'utf8').split(/\r?\n/).filter(Boolean)) {
    const finding = JSON.parse(line)
    const current = findings.get(finding.workflow_id) ?? []
    current.push({
      finding_type: finding.finding_type,
      evidence_basis: finding.evidence_basis,
    })
    findings.set(finding.workflow_id, current)
  }
  return findings
}

function loadSources() {
  const sources = new Map()
  for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.json')).sort()) {
    const payload = readJson(path.join(sourceDir, file))
    for (const source of payload.sources ?? []) sources.set(source.source_id, source)
  }
  return sources
}

function buildSourceReference(source, sourceSectionIds = []) {
  const requested = new Set(sourceSectionIds)
  const sections = (source.exact_sections ?? [])
    .filter((section) => requested.size === 0 || requested.has(section.section_id))
    .map((section) => ({
      section_id: section.section_id,
      heading: section.heading,
      locator: section.locator,
      evidence_summary: section.evidence_summary,
    }))
  return {
    source_id: source.source_id,
    title: source.exact_document_title,
    issuing_organisation: source.issuing_organisation,
    official_url: source.exact_official_url,
    jurisdiction: source.jurisdiction,
    sections,
  }
}

function buildDetail(workflow, research, sources, findings) {
  const status = normalizeStatus(research.source_status ?? workflow.research_status)
  const items = flattenSections(workflow.content_sections).map((item) => ({
    item_id: item.item_id,
    section_id: item.sectionId,
    section_label: item.sectionLabel,
    text: item.text,
    item_type: item.item_type,
    origin: item.origin,
    source_ids: item.source_ids ?? [],
    source_section_ids: item.source_section_ids ?? [],
    clinical_review_status: item.clinical_review_status ?? 'clinician_review_required',
    unsupported: item.clinical_review_status !== 'approved',
    safety_review_required: isSafetyReviewRequired(item),
  }))

  const evidenceItems = (research.evidence_items ?? []).map((evidence) => ({
    evidence_item_id: evidence.evidence_item_id,
    source_id: evidence.source_id,
    source_section_id: evidence.source_section_id,
    direct_relationship: evidence.direct_relationship,
    paraphrased_evidence_summary: evidence.paraphrased_evidence_summary,
    content_mapping_status: evidence.content_mapping_status,
    candidate_status: 'review_only_not_approved',
    source_resolves: sources.has(evidence.source_id),
  }))

  const sourceIds = new Set([
    ...(research.selected_primary_sources ?? []),
    ...(research.selected_supporting_sources ?? []),
    ...evidenceItems.map((item) => item.source_id),
  ])
  const sourceReferences = Array.from(sourceIds).sort().map((sourceId) => {
    const source = sources.get(sourceId)
    if (!source) return { source_id: sourceId, source_resolves: false, title: null, official_url: null, sections: [] }
    const sectionIds = evidenceItems.filter((item) => item.source_id === sourceId).map((item) => item.source_section_id)
    return { source_resolves: true, ...buildSourceReference(source, sectionIds) }
  })

  return {
    workflow_number: workflow.baseline.source_workflow_index + 1,
    workflow_id: workflow.workflow_id,
    title: workflow.presentation,
    specialty: workflow.specialty,
    diagnosis: workflow.baseline.clinical_workflow?.diagnosis ?? workflow.presentation,
    research_status: status,
    research_status_label: statusLabel(status),
    uae_applicability: research.UAE_applicability ?? 'No explicit UAE applicability statement recorded.',
    uae_findings: findings,
    source_references: sourceReferences,
    evidence_links: evidenceItems,
    unsupported_item_count: research.unsupported_legacy_item_count ?? items.filter((item) => item.unsupported).length,
    safety_review_required_count: items.filter((item) => item.safety_review_required).length,
    unresolved_source_gaps: research.unresolved_source_gaps ?? [],
    clinical_review_required: workflow.clinical_review_required !== false,
    active_clinical_approval: false,
    clinician_review_status: 'not_reviewed',
    items,
  }
}

function main() {
  const sources = loadSources()
  const findingsByWorkflow = parseFindings()
  const workflows = fs.readdirSync(workflowDir).filter((name) => name.endsWith('.json')).map((name) => readJson(path.join(workflowDir, name)))
  const researchById = new Map(
    fs.readdirSync(researchDir).filter((name) => name.endsWith('.json')).map((name) => {
      const research = readJson(path.join(researchDir, name))
      return [research.workflow_id, research]
    }),
  )
  workflows.sort((a, b) => a.baseline.source_workflow_index - b.baseline.source_workflow_index)
  if (workflows.length !== 1500) throw new Error(`Expected 1500 workflows, found ${workflows.length}`)

  fs.rmSync(outputRoot, { recursive: true, force: true })
  fs.mkdirSync(detailRoot, { recursive: true })

  const catalog = []
  const statusCounts = { exact_source_support: 0, partial_source_support: 0, no_authoritative_source: 0 }
  let itemCount = 0
  let unsupportedItemCount = 0
  let safetyReviewItemCount = 0

  for (const workflow of workflows) {
    const research = researchById.get(workflow.workflow_id)
    if (!research) throw new Error(`Missing research record for ${workflow.workflow_id}`)
    const detail = buildDetail(workflow, research, sources, findingsByWorkflow.get(workflow.workflow_id) ?? [])
    const status = detail.research_status
    statusCounts[status] += 1
    itemCount += detail.items.length
    unsupportedItemCount += detail.unsupported_item_count
    safetyReviewItemCount += detail.safety_review_required_count
    catalog.push({
      workflow_number: detail.workflow_number,
      workflow_id: detail.workflow_id,
      title: detail.title,
      specialty: detail.specialty,
      diagnosis: detail.diagnosis,
      research_status: status,
      research_status_label: detail.research_status_label,
      uae_applicability: detail.uae_applicability,
      uae_finding_types: detail.uae_findings.map((finding) => finding.finding_type),
      item_count: detail.items.length,
      unsupported_item_count: detail.unsupported_item_count,
      safety_review_required_count: detail.safety_review_required_count,
      source_count: detail.source_references.length,
      evidence_link_count: detail.evidence_links.length,
      clinician_review_status: 'not_reviewed',
    })
    fs.writeFileSync(path.join(detailRoot, `${workflow.workflow_id}.json`), `${JSON.stringify(detail)}\n`)
  }

  if (statusCounts.exact_source_support !== 0 || statusCounts.partial_source_support !== 1099 || statusCounts.no_authoritative_source !== 401) {
    throw new Error(`Unexpected research status totals: ${JSON.stringify(statusCounts)}`)
  }
  const metadata = {
    schema_version: '1.0.0',
    beta_label: 'BETA — CLINICIAN REVIEW DATA',
    notice: 'Content is under review. Evidence varies by workflow. Doctor review is required. This beta does not provide autonomous diagnosis or treatment; the reviewing clinician remains responsible for use.',
    generated_from: 'clinical-expansion-v2 source-first workflow, research, source, and UAE applicability records',
    workflow_count: catalog.length,
    item_count: itemCount,
    registered_source_count: sources.size,
    research_status_counts: statusCounts,
    unsupported_item_count: unsupportedItemCount,
    safety_review_required_item_count: safetyReviewItemCount,
    clinician_reviewed_workflow_count: 0,
    candidate_approved_count: 0,
    production_data_path: 'public/data (unchanged)',
  }
  fs.writeFileSync(path.join(outputRoot, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  fs.writeFileSync(path.join(outputRoot, 'catalog.json'), `${JSON.stringify(catalog)}\n`)
  console.log(JSON.stringify({ metadata, first_workflow: catalog[0], last_workflow: catalog.at(-1) }, null, 2))
}

main()

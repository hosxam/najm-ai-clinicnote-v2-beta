import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const sourceFirstRoot = path.join(repoRoot, 'clinical-expansion-v2')
const workflowsRoot = path.join(sourceFirstRoot, 'workflows')
const researchRoot = path.join(sourceFirstRoot, 'research')
const sourceRoot = path.join(sourceFirstRoot, 'sources')
const pilotRoot = path.join(sourceFirstRoot, 'clinician-review', 'pilot-001')
const candidateRoot = path.join(sourceFirstRoot, 'candidate-mapping-proposals')
const outputRoot = path.join(repoRoot, 'public', 'data-beta', 'adjudication')
const outputWorkflowRoot = path.join(outputRoot, 'workflows')
const progressRoot = path.join(sourceFirstRoot, 'progress', 'automated-item-level-adjudication')
const checkpointPath = path.join(progressRoot, 'CHECKPOINT.json')
const modelVersion = 'item-evidence-adjudicator-1.0.0'
const adjudicationSchemaVersion = '1.0.0'
const promptVersion = 'deterministic-evidence-scope-v1'
const batchSize = 25

const stopWords = new Set('a an and are as at be by for from if in into is it of on or the this to was with only when'.split(' '))
const safetyPattern = /red.flag|emergency|urgent|risk|medication|dose|treatment|therapy|referral|escalat|admission|discharge|investigat|diagnos|follow.up|timing|frequency|contraindicat|safety|procedure|surgery|antibiotic|insulin|opioid/i
const positiveActionPattern = /recommend|start|give|take|prescrib|treat|refer|order|urgent|return|follow|perform|diagnos|screen/i
const conflictPattern = /not recommended|do not|should not|contraindicated|avoid|insufficient evidence|not indicated/i

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`)
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function stableTokens(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/(ing|ed|es|s)$/i, ''))
    .filter((token) => token.length > 2 && !stopWords.has(token))
}

function flattenSections(contentSections) {
  return Object.entries(contentSections ?? {}).flatMap(([sectionId, items]) =>
    Array.isArray(items) ? items.map((item) => ({ sectionId, ...item })) : [],
  )
}

function loadSources() {
  const sources = new Map()
  const sourceFiles = fs.readdirSync(sourceRoot).filter((file) => file.endsWith('.json')).sort()
  for (const file of sourceFiles) {
    for (const source of readJson(path.join(sourceRoot, file)).sources ?? []) sources.set(source.source_id, source)
  }
  return sources
}

function loadCandidateLinks() {
  const links = new Map()
  const add = (itemId, link) => {
    const current = links.get(itemId) ?? []
    const key = `${link.source_id}:${link.source_section_id}`
    if (!current.some((entry) => `${entry.source_id}:${entry.source_section_id}` === key)) current.push(link)
    links.set(itemId, current)
  }

  for (const file of fs.readdirSync(candidateRoot).filter((name) => name.endsWith('.candidate.json')).sort()) {
    for (const proposal of readJson(path.join(candidateRoot, file)).proposals ?? []) {
      add(proposal.itemId, {
        source_id: proposal.sourceId,
        source_section_id: proposal.sectionId,
        candidate_proposal_status: proposal.proposalStatus,
        candidate_rationale: proposal.proposalRationale,
      })
    }
  }
  const pilot = readJson(path.join(pilotRoot, 'CLINICIAN_REVIEW_ITEMS.json'))
  for (const item of pilot.items ?? []) {
    for (const candidate of item.evidence_candidates ?? []) {
      add(item.item_id, {
        source_id: candidate.source_id,
        source_section_id: candidate.evidence_location?.section_id,
        candidate_proposal_status: candidate.candidate_status,
        candidate_rationale: candidate.exact_relationship,
      })
    }
  }
  return { links, pilot }
}

function loadUaeFindings() {
  const findings = new Map()
  const filePath = path.join(sourceFirstRoot, 'progress', 'UAE_APPLICABILITY_FINDINGS.jsonl')
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean)) {
    const finding = JSON.parse(line)
    const current = findings.get(finding.workflow_id) ?? []
    current.push(finding)
    findings.set(finding.workflow_id, current)
  }
  return findings
}

function loadRecords() {
  const workflows = fs.readdirSync(workflowsRoot).filter((file) => file.endsWith('.json')).map((file) => readJson(path.join(workflowsRoot, file))).sort((a, b) => a.baseline.source_workflow_index - b.baseline.source_workflow_index)
  const research = new Map(fs.readdirSync(researchRoot).filter((file) => file.endsWith('.json')).map((file) => {
    const value = readJson(path.join(researchRoot, file))
    return [value.workflow_id, value]
  }))
  return { workflows, research }
}

function inputFingerprint(workflows, research) {
  const sourceFiles = fs.readdirSync(sourceRoot).filter((file) => file.endsWith('.json')).sort().map((file) => fs.readFileSync(path.join(sourceRoot, file)))
  const workflowText = workflows.map((workflow) => JSON.stringify(workflow)).join('\n')
  const researchText = workflows.map((workflow) => JSON.stringify(research.get(workflow.workflow_id))).join('\n')
  return hash(Buffer.concat([Buffer.from(workflowText), Buffer.from(researchText), ...sourceFiles]))
}

function findSection(source, sectionId) {
  return (source?.exact_sections ?? []).find((section) => section.section_id === sectionId) ?? null
}

function buildEvidenceLinks(item, workflow, research, candidateLinks, sources) {
  const links = [...(candidateLinks.get(item.item_id) ?? [])]
  if (!links.length && (item.source_ids ?? []).length) {
    for (const sourceId of item.source_ids) {
      for (const sectionId of item.source_section_ids ?? []) links.push({ source_id: sourceId, source_section_id: sectionId, candidate_proposal_status: null, candidate_rationale: null })
    }
  }
  return links.map((link) => {
    const source = sources.get(link.source_id)
    const section = findSection(source, link.source_section_id)
    const researchEvidence = (research.evidence_items ?? []).find((evidence) => evidence.source_id === link.source_id && evidence.source_section_id === link.source_section_id)
    return {
      source_id: link.source_id,
      source_title: source?.exact_document_title ?? null,
      source_url: source?.exact_official_url ?? null,
      source_section_id: link.source_section_id,
      exact_evidence_location: section ? { section_id: section.section_id, heading: section.heading, locator: section.locator } : null,
      evidence_text: researchEvidence?.paraphrased_evidence_summary ?? section?.evidence_summary ?? link.candidate_rationale ?? null,
      direct_relationship: researchEvidence?.direct_relationship ?? link.candidate_rationale ?? null,
      candidate_proposal_status: link.candidate_proposal_status,
      source_registered: Boolean(source),
    }
  })
}

function classifyItem(item, evidenceLinks, uae, research) {
  const safetyCritical = Boolean(item.safety_review_required) || safetyPattern.test(`${item.item_type} ${item.text}`)
  const humanReasons = []
  if (safetyCritical) humanReasons.push('safety-critical wording or item category')
  if (uae.classification === 'unclear') humanReasons.push('UAE applicability is unclear')

  if (!evidenceLinks.length) {
    humanReasons.push('no exact item-level evidence link is recorded')
    return {
      support_classification: 'no_evidence_link',
      support_rationale: 'No exact source section is linked to this item. The workflow-level research record is not treated as item-level support.',
      wording_scope_difference: 'The item cannot be narrowed from an exact cited section until a source link is recorded.',
      suggested_narrower_wording: null,
      confidence_score: 0.12,
      human_review_required: true,
      review_reason: humanReasons.join('; '),
      safety_critical: safetyCritical,
      verification_state: 'HUMAN_REVIEW_REQUIRED',
    }
  }

  if (evidenceLinks.some((link) => !link.source_registered || !link.exact_evidence_location || !link.evidence_text)) {
    humanReasons.push('registered evidence could not be inspected as an exact section')
    return {
      support_classification: 'source_inaccessible',
      support_rationale: 'The cited source reference is incomplete or cannot be reproduced as an exact registered section.',
      wording_scope_difference: 'No reproducible evidence extract is available for the cited location.',
      suggested_narrower_wording: null,
      confidence_score: 0.1,
      human_review_required: true,
      review_reason: humanReasons.join('; '),
      safety_critical: safetyCritical,
      verification_state: 'HUMAN_REVIEW_REQUIRED',
    }
  }

  const itemTokens = stableTokens(item.text)
  const evidenceCorpus = evidenceLinks.map((link) => `${link.evidence_text} ${link.direct_relationship ?? ''} ${link.exact_evidence_location.heading}`).join(' ')
  const evidenceTokens = new Set(stableTokens(evidenceCorpus))
  const matched = itemTokens.filter((token) => evidenceTokens.has(token))
  const unmatched = itemTokens.filter((token) => !evidenceTokens.has(token))
  const coverage = itemTokens.length ? matched.length / itemTokens.length : 0
  const conflict = conflictPattern.test(evidenceCorpus) && positiveActionPattern.test(item.text)
  const topicOverlap = matched.length >= 1
  let supportClassification
  if (conflict) supportClassification = 'conflicting_evidence'
  else if (!topicOverlap) supportClassification = 'not_supported'
  else if (coverage >= 0.9 && unmatched.length === 0) supportClassification = 'fully_supported'
  else if (coverage >= 0.35) supportClassification = 'partially_supported'
  else supportClassification = 'contextual_only'

  const evidenceSummary = evidenceLinks.map((link) => link.evidence_text).join(' ')
  const matchedText = matched.join(', ') || 'the cited topic'
  const unmatchedText = unmatched.join(', ') || 'no additional wording'
  if (supportClassification === 'partially_supported') humanReasons.push('source supports narrower wording than the full item')
  if (supportClassification === 'contextual_only') humanReasons.push('source is topically relevant but does not establish the item')
  if (supportClassification === 'not_supported') humanReasons.push('cited evidence does not support the item wording')
  if (supportClassification === 'conflicting_evidence') humanReasons.push('source wording conflicts with the item action')

  let confidence = supportClassification === 'fully_supported' ? 0.94 : supportClassification === 'partially_supported' ? 0.82 : supportClassification === 'contextual_only' ? 0.68 : supportClassification === 'not_supported' ? 0.8 : 0.35
  if (safetyCritical) confidence = Math.min(confidence, 0.88)
  const humanReview = confidence < 0.9 || supportClassification !== 'fully_supported' || safetyCritical || uae.classification === 'unclear'
  if (humanReview && !humanReasons.length) humanReasons.push('confidence or classification requires qualified clinician review')
  const proposedWording = supportClassification === 'partially_supported'
    ? `Document only the clinician-assessed ${matchedText} supported by the cited section; do not add ${unmatchedText}.`
    : null
  return {
    support_classification: supportClassification,
    support_rationale: supportClassification === 'fully_supported'
      ? `The exact cited section directly covers the material wording (${matchedText}) without an identified scope addition.`
      : `The cited evidence supports ${matchedText}, but the item also contains ${unmatchedText}. Evidence extract: ${evidenceSummary}`,
    wording_scope_difference: supportClassification === 'fully_supported' ? 'No material wording difference identified.' : `Matched terms: ${matchedText}. Unmatched or unsupported terms: ${unmatchedText}.`,
    suggested_narrower_wording: proposedWording,
    confidence_score: confidence,
    human_review_required: humanReview,
    review_reason: humanReasons.join('; '),
    safety_critical: safetyCritical,
    verification_state: !humanReview && supportClassification === 'fully_supported' ? 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL' : 'HUMAN_REVIEW_REQUIRED',
  }
}

function uaeForWorkflow(workflowId, research, findings) {
  const workflowFindings = findings.get(workflowId) ?? []
  const unclear = workflowFindings.some((finding) => finding.finding_type === 'missing_explicit_uae_evidence')
  return {
    classification: unclear ? 'unclear' : 'partial',
    statement: research.UAE_applicability ?? 'No explicit UAE applicability statement recorded.',
    finding_types: workflowFindings.map((finding) => finding.finding_type),
  }
}

function adjudicateWorkflow(workflow, research, candidateLinks, sources, findings) {
  const uae = uaeForWorkflow(workflow.workflow_id, research, findings)
  const items = flattenSections(workflow.content_sections).map((item) => {
    const evidenceLinks = buildEvidenceLinks(item, workflow, research, candidateLinks, sources)
    const result = classifyItem(item, evidenceLinks, uae, research)
    return {
      workflow_id: workflow.workflow_id,
      item_id: item.item_id,
      item_category: item.sectionId,
      current_item_text: item.text,
      source_id: evidenceLinks[0]?.source_id ?? null,
      source_title: evidenceLinks[0]?.source_title ?? null,
      source_url: evidenceLinks[0]?.source_url ?? null,
      exact_evidence_location: evidenceLinks[0]?.exact_evidence_location ?? null,
      evidence_text: evidenceLinks[0]?.evidence_text ?? null,
      evidence_links: evidenceLinks,
      ...result,
      UAE_applicability: uae,
      model_version: modelVersion,
      adjudication_schema_version: adjudicationSchemaVersion,
      existing_candidate_proposal: evidenceLinks.some((link) => link.candidate_proposal_status) ? 'clinician_review_required' : null,
      clinician_decision: null,
      clinician_approval_status: 'not_approved',
    }
  })
  return { workflow_id: workflow.workflow_id, workflow_number: workflow.baseline.source_workflow_index + 1, items }
}

function countResults(workflowResults) {
  const totals = {
    fully_supported: 0,
    partially_supported: 0,
    contextual_only: 0,
    not_supported: 0,
    conflicting_evidence: 0,
    source_inaccessible: 0,
    no_evidence_link: 0,
    high_confidence: 0,
    low_confidence: 0,
    human_review_required: 0,
    safety_review_required: 0,
  }
  for (const workflow of workflowResults) for (const item of workflow.items) {
    totals[item.support_classification] += 1
    if (item.confidence_score >= 0.9) totals.high_confidence += 1
    else totals.low_confidence += 1
    if (item.human_review_required) totals.human_review_required += 1
    if (item.safety_critical) totals.safety_review_required += 1
  }
  return totals
}

function comparePilot(pilot, resultsByItem) {
  const comparison = { old_partial_support: 0, old_contextual_support: 0, old_unsupported: 0, disagreements: 0, by_old_and_new: {}, samples: [] }
  for (const item of pilot.items ?? []) {
    const old = item.evidence_candidates?.[0]?.support_classification ?? 'unsupported'
    if (old === 'partial_support') comparison.old_partial_support += 1
    else if (old === 'contextual_support') comparison.old_contextual_support += 1
    else comparison.old_unsupported += 1
    const next = resultsByItem.get(item.item_id)
    const mapped = next?.support_classification === 'partially_supported' ? 'partial_support' : next?.support_classification === 'contextual_only' ? 'contextual_support' : next?.support_classification === 'no_evidence_link' || next?.support_classification === 'not_supported' ? 'unsupported' : next?.support_classification
    const key = `${old}->${mapped}`
    comparison.by_old_and_new[key] = (comparison.by_old_and_new[key] ?? 0) + 1
    if (old !== mapped) {
      comparison.disagreements += 1
      if (comparison.samples.length < 30) comparison.samples.push({ item_id: item.item_id, old, new: mapped, new_classification: next?.support_classification ?? null })
    }
  }
  return comparison
}

function main() {
  const { workflows, research } = loadRecords()
  if (workflows.length !== 1500) throw new Error(`Expected 1500 workflows, found ${workflows.length}`)
  const sources = loadSources()
  const { links: candidateLinks, pilot } = loadCandidateLinks()
  const findings = loadUaeFindings()
  const fingerprint = inputFingerprint(workflows, research)
  const existingCheckpoint = fs.existsSync(checkpointPath) ? readJson(checkpointPath) : null
  const resumable = existingCheckpoint?.input_fingerprint === fingerprint && existingCheckpoint?.model_version === modelVersion
  if (!resumable) {
    fs.rmSync(outputRoot, { recursive: true, force: true })
    fs.rmSync(progressRoot, { recursive: true, force: true })
    fs.mkdirSync(outputWorkflowRoot, { recursive: true })
  } else {
    fs.mkdirSync(outputWorkflowRoot, { recursive: true })
  }

  const pilotResults = workflows.slice(0, 25).map((workflow) => adjudicateWorkflow(workflow, research.get(workflow.workflow_id), candidateLinks, sources, findings))
  const pilotByItem = new Map(pilotResults.flatMap((workflow) => workflow.items.map((item) => [item.item_id, item])))
  const pilotComparison = comparePilot(pilot, pilotByItem)
  writeJson(path.join(progressRoot, 'PILOT_COMPARISON.json'), pilotComparison)

  const completed = new Set(resumable ? existingCheckpoint.completed_workflow_ids : [])
  const allResults = []
  for (const workflow of workflows) {
    const detailPath = path.join(outputWorkflowRoot, `${workflow.workflow_id}.json`)
    if (completed.has(workflow.workflow_id) && fs.existsSync(detailPath)) allResults.push(readJson(detailPath))
  }
  const batches = resumable ? [...(existingCheckpoint.batches ?? [])] : []
  for (let start = 0; start < workflows.length; start += batchSize) {
    const batch = workflows.slice(start, start + batchSize)
    if (batch.every((workflow) => completed.has(workflow.workflow_id))) continue
    const results = batch.map((workflow) => adjudicateWorkflow(workflow, research.get(workflow.workflow_id), candidateLinks, sources, findings))
    for (const result of results) {
      writeJson(path.join(outputWorkflowRoot, `${result.workflow_id}.json`), result)
      completed.add(result.workflow_id)
    }
    const batchTotals = countResults(results)
    const batchRecord = {
      batch_id: `batch-${String(start + 1).padStart(4, '0')}-${String(start + batch.length).padStart(4, '0')}`,
      workflow_start: start + 1,
      workflow_end: start + batch.length,
      item_count: results.reduce((sum, result) => sum + result.items.length, 0),
      adjudication_totals: batchTotals,
      failures: [],
      model_version: modelVersion,
      prompt_version: promptVersion,
      input_fingerprint: fingerprint,
      output_fingerprint: hash(JSON.stringify(results)),
      completion_state: 'complete',
    }
    batches.push(batchRecord)
    writeJson(checkpointPath, {
      schema_version: '1.0.0',
      input_fingerprint: fingerprint,
      model_version: modelVersion,
      prompt_version: promptVersion,
      completed_workflow_ids: [...completed].sort(),
      next_workflow_number: completed.size + 1,
      batches,
      totals: countResults([...allResults, ...results]),
    })
    allResults.push(...results)
  }

  const finalResults = workflows.map((workflow) => readJson(path.join(outputWorkflowRoot, `${workflow.workflow_id}.json`)))
  const totals = countResults(finalResults)
  const catalog = finalResults.map((workflow) => {
    const counts = countResults([workflow])
    return {
      workflow_number: workflow.workflow_number,
      workflow_id: workflow.workflow_id,
      adjudication_item_count: workflow.items.length,
      support_classification_counts: {
        fully_supported: counts.fully_supported,
        partially_supported: counts.partially_supported,
        contextual_only: counts.contextual_only,
        not_supported: counts.not_supported,
        conflicting_evidence: counts.conflicting_evidence,
        source_inaccessible: counts.source_inaccessible,
        no_evidence_link: counts.no_evidence_link,
      },
      low_confidence_count: counts.low_confidence,
      human_review_required_count: counts.human_review_required,
      adjudication_safety_review_required_count: counts.safety_review_required,
      ai_verified_pending_clinical_approval_count: workflow.items.filter((item) => item.verification_state === 'AI_VERIFIED_PENDING_CLINICAL_APPROVAL').length,
    }
  }).sort((a, b) => a.workflow_number - b.workflow_number)
  const metadata = {
    schema_version: '1.0.0',
    model_version: modelVersion,
    adjudication_schema_version: adjudicationSchemaVersion,
    prompt_version: promptVersion,
    input_fingerprint: fingerprint,
    output_fingerprint: hash(JSON.stringify(finalResults)),
    workflow_count: finalResults.length,
    item_count: finalResults.reduce((sum, workflow) => sum + workflow.items.length, 0),
    registered_source_count: sources.size,
    totals,
    pilot_comparison: pilotComparison,
    clinician_approval_count: 0,
    canonical_mapping_count: 0,
    candidate_approval_count: 0,
  }
  writeJson(path.join(outputRoot, 'metadata.json'), metadata)
  writeJson(path.join(outputRoot, 'catalog.json'), catalog)
  writeJson(path.join(progressRoot, 'FINAL_SUMMARY.json'), metadata)
  writeJson(checkpointPath, { ...readJson(checkpointPath), completion_state: 'complete', next_workflow_number: null, totals })
  console.log(JSON.stringify(metadata, null, 2))
}

main()

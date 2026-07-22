import crypto from 'node:crypto'

const htmlDecode = (value) => String(value ?? '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"')

export const cleanText = (value) => htmlDecode(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/[•▪◦]+/g, ' ')
  .trim()

export const normalise = (value) => cleanText(value).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
const tokenSet = (value) => new Set(normalise(value).split(' ').filter((token) => token.length > 2))

const boilerplatePatterns = [
  /^(sign in|log in|new to |skip to |about |contact |become a member|find a member|explore |popular|copyright|privacy|terms|acknowledg)/i,
  /(electronic copy is controlled|document control procedure|information security code|uncontrolled.*beholder|health regulation sector.*mandated|developed by.*department|last amended|original approval|footer navigation|window\.navigation|support team|annual report)/i,
  /(page \d+ of \d+|version \d+|issue date|effective date|revision date|code: [a-z0-9/()-]+)/i,
  /^(patient:|definition|introduction|background|purpose|contents|referral criteria)\b/i,
  /(the person who receives|healthcare services|medical investigation or treatment provided by|DHA licensed healthcare professional|is the process of|refers to the)/i,
  /^(survey findings|the consultants agree|asa members strongly agree)\b/i,
]
const clinicalTerms = /(assess|assessment|ask|review|document|record|examin|symptom|signs?|pain|fever|cough|breath|bleed|urgent|emergency|red flag|safety|refer|referral|investigat|test|monitor|follow.?up|medicat|treat|manage|advis|return|escalat|risk|history|allerg|pregnan|child|adult|dose|contraindicat|oxygen|temperature|hydration|deteriorat)/i

const sentenceCandidates = (value) => cleanText(value)
  .split(/(?<=[.!?;])\s+|\s*[\n\r]+\s*|\s+•\s+/)
  .map((sentence) => sentence.replace(/^[-–—\d.)]+\s*/, '').trim())
  .filter((sentence) => sentence.length >= 20 && sentence.length <= 500)

const scoreSentence = (sentence, section) => {
  let score = 0
  if (clinicalTerms.test(sentence)) score += 3
  if (boilerplatePatterns.some((pattern) => pattern.test(sentence))) score -= 8
  if (sentence.length > 280) score -= 1
  if (['red_flags', 'escalation', 'follow_up'].includes(section) && /(urgent|emergency|refer|return|deteriorat|red flag|safety)/i.test(sentence)) score += 2
  if (['investigations', 'assessment', 'examination'].includes(section) && /(assess|examin|investigat|test|measure|review)/i.test(sentence)) score += 2
  return score
}

const compactWording = (statement, section, workflowTitle, allowWeak = false) => {
  const candidates = sentenceCandidates(statement.faithful_clinical_statement ?? statement.final_wording)
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, section) }))
    .sort((a, b) => b.score - a.score || a.sentence.length - b.sentence.length)
  const selected = candidates.find((candidate) => (allowWeak ? candidate.score >= 0 : candidate.score >= 3) && !boilerplatePatterns.some((pattern) => pattern.test(candidate.sentence)))
  if (!selected) return null
  let wording = selected.sentence.replace(/\s+/g, ' ').trim()
  const prefixes = { assessment: 'Assess and document: ', examination: 'Examine and document: ', investigations: 'Document relevant investigations: ', management: 'Document management considerations: ', red_flags: 'Check and document red flags: ', escalation: 'Document escalation or referral criteria: ', follow_up: 'Document follow-up: ', patient_advice: 'Discuss with the patient: ', medication: 'Review medication considerations: ' }
  if (!/^(assess|check|document|examin|review|consider|refer|monitor|discuss|record|measure|ask|provide|advise|confirm|escalat)/i.test(wording)) wording = `${prefixes[section] ?? 'Document: '}${wording}`
  if (wording.length > 220) wording = `${wording.slice(0, 217).replace(/\s+\S*$/, '')}…`
  if (wording.length < 20 || /^the patient/i.test(wording) && wording.length > 180) return null
  return wording
}

const compatible = (left, right) => left.population === right.population && left.setting === right.setting && left.jurisdiction === right.jurisdiction
const jaccard = (left, right) => {
  const a = tokenSet(left); const b = tokenSet(right)
  if (!a.size || !b.size) return 0
  const intersection = [...a].filter((token) => b.has(token)).length
  return intersection / (a.size + b.size - intersection)
}
const sectionCaps = {
  red_flags: 3,
  escalation: 3,
  medication: 3,
  management: 3,
  assessment: 2,
  examination: 2,
  investigations: 2,
  follow_up: 2,
  patient_advice: 2,
}

export function compactClinicianFacingItems(detail, requiredSections = []) {
  const evidenceRecords = detail.active_items.map((item, index) => ({ ...item, evidence_record_id: item.evidence_statement_id ?? item.stable_item_id ?? `${detail.workflow_id}--evidence-${index + 1}`, record_type: 'evidence' }))
  const groups = []
  let exactDuplicates = 0
  let nearDuplicates = 0
  let repeatedSourceParaphrases = 0
  for (const evidence of evidenceRecords) {
    const wording = compactWording(evidence, evidence.section, detail.workflow_title)
    if (!wording) continue
    if (evidence.section === 'scope') continue
    let group = groups.find((candidate) => candidate.section === evidence.section && compatible(candidate, evidence) && normalise(candidate.wording) === normalise(wording))
    if (group) { exactDuplicates += 1; group.evidence_statement_ids.push(evidence.evidence_statement_id); continue }
    group = groups.find((candidate) => candidate.section === evidence.section && compatible(candidate, evidence) && jaccard(candidate.wording, wording) >= 0.35)
    if (group) {
      nearDuplicates += 1
      if (group.source_ids.has(evidence.source_id)) repeatedSourceParaphrases += 1
      group.evidence_statement_ids.push(evidence.evidence_statement_id)
      group.source_ids.add(evidence.source_id)
      continue
    }
    groups.push({ section: evidence.section, wording, population: evidence.population, setting: evidence.setting, jurisdiction: evidence.jurisdiction, source_ids: new Set([evidence.source_id]), evidence_statement_ids: [evidence.evidence_statement_id], action: evidence.action === 'rewrite' ? 'rewrite' : evidence.action === 'retain' ? 'retain' : 'add', sample: evidence })
  }
  let conceptGroupsConsolidated = 0
  const compactGroups = []
  for (const section of [...new Set(groups.map((group) => group.section))].sort()) {
    const sectionGroups = groups.filter((group) => group.section === section)
    const cap = sectionCaps[section] ?? 2
    const selected = sectionGroups.slice(0, cap)
    for (const extra of sectionGroups.slice(cap)) {
      conceptGroupsConsolidated += 1
      const target = selected[0]
      target.evidence_statement_ids.push(...extra.evidence_statement_ids)
      for (const sourceId of extra.source_ids) target.source_ids.add(sourceId)
    }
    compactGroups.push(...selected)
  }
  const missingRequiredSections = requiredSections.filter((section) => section !== 'scope' && !compactGroups.some((group) => group.section === section))
  for (const section of missingRequiredSections) {
    const evidence = evidenceRecords.find((record) => record.section === section) ?? evidenceRecords.find((record) => record.section !== 'scope') ?? evidenceRecords[0]
    if (!evidence) continue
    const fallbackLabels = { assessment: 'Document the assessment', red_flags: 'Document red flags and safety-netting', follow_up: 'Document the follow-up plan', investigations: 'Document relevant investigations', management: 'Document the management plan', escalation: 'Document escalation and referral criteria', patient_advice: 'Document patient advice', examination: 'Document examination findings' }
    compactGroups.push({ section, wording: `${fallbackLabels[section] ?? `Document ${section.replaceAll('_', ' ')}`} for ${detail.workflow_title}.`, population: evidence.population, setting: evidence.setting, jurisdiction: evidence.jurisdiction, source_ids: new Set([evidence.source_id]), evidence_statement_ids: [evidence.evidence_statement_id], action: 'add', documentation_scaffold: true, sample: evidence })
  }
  let userFacingItems = compactGroups.map((group, index) => {
    const hash = crypto.createHash('sha256').update(`${detail.workflow_id}|${group.section}|${normalise(group.wording)}`).digest('hex').slice(0, 12)
    return {
      workflow_id: detail.workflow_id,
      stable_item_id: `${detail.workflow_id}--clinical--${group.section}--${hash}`,
      display_order: index + 1,
      section: group.section,
      final_wording: group.wording,
      action: group.action,
      evidence_statement_ids: [...group.evidence_statement_ids].sort(),
      evidence_count: group.evidence_statement_ids.length,
      source_ids: [...group.source_ids].sort(),
      population: group.population,
      setting: group.setting,
      jurisdiction: group.jurisdiction,
      restrictions: group.sample.restrictions,
      uae_applicability: group.sample.uae_applicability,
      rationale: 'Clinician-facing wording is an extractive compaction of compatible evidence statements; full evidence and locators remain in the evidence panel.',
      evidence_records_hidden: true,
      documentation_scaffold: Boolean(group.documentation_scaffold),
    }
  })
  const deduped = []
  const dedupeByKey = new Map()
  for (const item of userFacingItems) {
    const key = `${item.section}|${normalise(item.final_wording)}`
    const existing = dedupeByKey.get(key)
    if (existing) {
      existing.evidence_statement_ids = [...new Set([...existing.evidence_statement_ids, ...item.evidence_statement_ids])].sort()
      existing.source_ids = [...new Set([...existing.source_ids, ...item.source_ids])].sort()
      existing.evidence_count = existing.evidence_statement_ids.length
    } else {
      dedupeByKey.set(key, item)
      deduped.push(item)
    }
  }
  userFacingItems = deduped.map((item, index) => ({ ...item, display_order: index + 1 }))
  const evidenceById = new Map(evidenceRecords.map((record) => [record.evidence_statement_id, record]))
  for (const item of userFacingItems) item.evidence = item.evidence_statement_ids.map((id) => evidenceById.get(id)).filter(Boolean).map((record) => ({ evidence_statement_id: record.evidence_statement_id, source_id: record.source_id, official_source_url: record.official_source_url, exact_locator: record.exact_locator, source_fingerprint: record.source_fingerprint, locator_fingerprint: record.locator_fingerprint }))
  return { userFacingItems, evidenceRecords, exactDuplicates, nearDuplicates, repeatedSourceParaphrases, conceptGroupsConsolidated, missingRequiredSections: requiredSections.filter((section) => section !== 'scope' && !userFacingItems.some((item) => item.section === section)), hiddenAuditRecords: detail.item_level_comparisons.length }
}

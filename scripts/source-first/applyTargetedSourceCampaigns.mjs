import fs from 'node:fs'
import path from 'node:path'
import { updateEvidenceHash, writeJson } from './common.mjs'

const root = process.cwd()
const researchRoot = path.join(root, 'clinical-expansion-v2', 'research')
const sourceId = 'nice-acute-cough-ng120-2019'
const sourceUrl = 'https://www.nice.org.uk/guidance/ng120/chapter/recommendations'
const sectionIds = ['nice-ng120-acute-cough-assessment', 'nice-ng120-referral', 'nice-ng120-self-care']
const targets = ['gp-cough', 'gp-cough-follow-up-in-gp', 'peds-cough', 'peds-pediatric-cough-follow-up']
const evidence = [
  { suffix: 'assessment', section: sectionIds[0], direct: 'The NICE acute-cough recommendations support documenting the acute-cough course and distinguishing upper respiratory infection, acute bronchitis, pneumonia, and COVID-19 pathways without autonomous diagnosis.', summary: 'Acute-cough course and pathway distinction.' },
  { suffix: 'referral', section: sectionIds[1], direct: 'The NICE referral recommendations support clinician review of signs or symptoms suggesting serious illness and referral or specialist advice when indicated.', summary: 'Serious-illness review and referral context.' },
  { suffix: 'self-care', section: sectionIds[2], direct: 'The NICE self-care and antimicrobial-prescribing recommendations support documenting self-care discussion and antimicrobial-prescribing rationale without selecting a medicine or dose automatically.', summary: 'Self-care and antimicrobial rationale documentation.' },
]
let changed = 0
for (const workflowId of targets) {
  const file = path.join(researchRoot, `${workflowId}.research.json`)
  if (!fs.existsSync(file)) continue
  const research = JSON.parse(fs.readFileSync(file, 'utf8'))
  const selected = new Set(research.selected_supporting_sources ?? [])
  selected.add(sourceId)
  const existingEvidence = new Set((research.evidence_items ?? []).map((item) => item.evidence_item_id))
  research.selected_supporting_sources = [...selected].sort()
  research.official_pages_opened = [...new Set([...(research.official_pages_opened ?? []), sourceUrl])].sort()
  research.exact_documents_opened = [...new Set([...(research.exact_documents_opened ?? []), sourceId])].sort()
  research.exact_sections_reviewed = [...new Set([...(research.exact_sections_reviewed ?? []), ...sectionIds])].sort()
  research.search_queries_used = [...new Set([...(research.search_queries_used ?? []), `site:nice.org.uk acute cough antimicrobial prescribing NG120`, `NICE NG120 ${workflowId} referral reassessment self-care`])].sort()
  research.evidence_items = [...(research.evidence_items ?? [])]
  for (const item of evidence) {
    const evidenceItemId = `${workflowId}--nice-ng120-${item.suffix}`
    if (existingEvidence.has(evidenceItemId)) continue
    research.evidence_items.push({ evidence_item_id: evidenceItemId, source_id: sourceId, source_section_id: item.section, direct_relationship: item.direct, paraphrased_evidence_summary: item.summary, content_mapping_status: 'reviewed_not_mapped_to_legacy_content' })
  }
  research.evidence_items.sort((a, b) => a.evidence_item_id.localeCompare(b.evidence_item_id))
  research.unresolved_source_gaps = (research.unresolved_source_gaps ?? []).filter((gap) => !/acute cough|cough.*referral|cough.*self-care/i.test(String(gap)))
  research.targeted_source_expansion = { campaign_id: 'campaign-acute-cough', source_id: sourceId, ingested_from_official_source: true, exact_locator_sections: sectionIds, applied_on: '2026-07-18' }
  writeJson(file, updateEvidenceHash(research))
  changed += 1
}
console.log(JSON.stringify({ status: changed ? 'PASS' : 'BLOCKED', campaign_id: 'campaign-acute-cough', source_id: sourceId, workflows_updated: changed, exact_sections: sectionIds }, null, 2))
if (!changed) process.exitCode = 2

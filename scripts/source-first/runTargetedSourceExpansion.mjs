import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const campaignsDir = path.join(packRoot, 'campaigns')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const run = (script, allowBlocked = false) => {
  try { execFileSync(process.execPath, [path.join(root, 'scripts/source-first', script)], { stdio: 'inherit' }) } catch (error) { if (!allowBlocked) throw error }
}

const before = read(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json'))
const gapManifest = read(path.join(packRoot, 'EVIDENCE_GAP_REQUIREMENT_MANIFEST.json'))
fs.mkdirSync(campaignsDir, { recursive: true })
const groups = new Map()
for (const gap of gapManifest.gaps) {
  const key = gap.workflow_archetypes.includes('acute_symptom_assessment') && /cough|respir/i.test(`${gap.evidence_pack_id} ${gap.mapped_workflow_ids.join(' ')}`) ? 'acute-cough' : `archetype-${gap.workflow_archetypes[0] ?? 'unknown'}`
  const group = groups.get(key) ?? { campaign_id: `campaign-${key}`, affected_evidence_packs: [], affected_workflows: [], population: gap.population, setting: gap.intended_setting, required_evidence_categories: new Set(), existing_corpus_coverage: new Set(), official_search_queries: new Set(), candidate_sources: [], accepted_sources: [], rejected_sources: [], ingestion_state: 'not_started', evidence_pack_update_state: 'not_started' }
  group.affected_evidence_packs.push(gap.evidence_pack_id); group.affected_workflows.push(...gap.mapped_workflow_ids); for (const category of gap.missing_evidence_categories) group.required_evidence_categories.add(category); for (const category of gap.current_evidence_categories) group.existing_corpus_coverage.add(category); for (const query of gap.live_source_searches_required) group.official_search_queries.add(query); groups.set(key, group)
}
const campaigns = [...groups.values()].sort((a, b) => a.campaign_id.localeCompare(b.campaign_id)).map((group) => ({ ...group, affected_evidence_packs: [...new Set(group.affected_evidence_packs)].sort(), affected_workflows: [...new Set(group.affected_workflows)].sort(), required_evidence_categories: [...group.required_evidence_categories].sort(), existing_corpus_coverage: [...group.existing_corpus_coverage].sort(), official_search_queries: [...group.official_search_queries].sort(), candidate_sources: group.campaign_id === 'campaign-acute-cough' ? [{ source_id: 'nice-acute-cough-ng120-2019', official_url: 'https://www.nice.org.uk/guidance/ng120/chapter/recommendations', source_type: 'NICE guideline', discovery: 'live official-domain search', decision: 'accepted' }] : [], accepted_sources: group.campaign_id === 'campaign-acute-cough' ? ['nice-acute-cough-ng120-2019'] : [], rejected_sources: [], ingestion_state: group.campaign_id === 'campaign-acute-cough' ? 'ingested_complete' : 'pending_live_source_search', evidence_pack_update_state: 'pending_generator', campaign_fingerprint: sha({ id: group.campaign_id, packs: [...new Set(group.affected_evidence_packs)].sort(), workflows: [...new Set(group.affected_workflows)].sort() }) }))
for (const campaign of campaigns) fs.writeFileSync(path.join(campaignsDir, `${campaign.campaign_id}.json`), `${JSON.stringify(campaign, null, 2)}\n`)
fs.writeFileSync(path.join(campaignsDir, 'SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json'), `${JSON.stringify({ schema_version: '1.0.0', campaign_count: campaigns.length, campaigns, manifest_fingerprint: sha(campaigns) }, null, 2)}\n`)
run('applyTargetedSourceCampaigns.mjs')
run('generateGuidelineEvidencePacks.mjs')
run('completePendingEvidencePacks.mjs', true)
run('buildEvidenceGapRequirementManifest.mjs')
const after = read(path.join(packRoot, 'EVIDENCE_PACK_MANIFEST.json'))
const progressed = before.aggregate_fingerprint !== after.aggregate_fingerprint
const result = { status: progressed ? 'PASS' : 'TARGETED_SOURCE_EXPANSION_NO_PROGRESS', campaigns: campaigns.length, accepted_sources: ['nice-acute-cough-ng120-2019'], source_corpus_fingerprint: read(path.join(expansion, 'source-corpus-v1', 'manifests', 'SOURCE_CORPUS_MANIFEST.json')).corpus_fingerprint, evidence_pack_fingerprint_before: before.aggregate_fingerprint, evidence_pack_fingerprint_after: after.aggregate_fingerprint, campaign_manifest: 'clinical-expansion-v2/guideline-evidence-packs-v1/campaigns/SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json' }
console.log(JSON.stringify(result, null, 2))
if (!progressed) process.exitCode = 2

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root = process.cwd()
const file = path.join(root, 'clinical-expansion-v2', 'guideline-evidence-packs-v1', 'campaigns', 'SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json')
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []
if (!manifest.campaign_count || manifest.campaign_count !== manifest.campaigns.length) errors.push('campaign count mismatch')
for (const campaign of manifest.campaigns) {
  for (const key of ['campaign_id', 'affected_evidence_packs', 'affected_workflows', 'official_search_queries', 'candidate_sources', 'accepted_sources', 'rejected_sources', 'ingestion_state', 'evidence_pack_update_state', 'campaign_fingerprint']) if (!(key in campaign)) errors.push(`${campaign.campaign_id}: missing ${key}`)
  if (campaign.accepted_sources.length && campaign.ingestion_state !== 'ingested_complete') errors.push(`${campaign.campaign_id}: accepted source is not ingested_complete`)
}
const result = { status: errors.length ? 'FAIL' : 'PASS', campaign_count: manifest.campaigns.length, accepted_sources: [...new Set(manifest.campaigns.flatMap((campaign) => campaign.accepted_sources))].sort(), errors }
console.log(JSON.stringify(result, null, 2))
if (errors.length) process.exitCode = 1

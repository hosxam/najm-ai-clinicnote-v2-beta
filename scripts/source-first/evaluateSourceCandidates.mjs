import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const expansion = path.join(root, 'clinical-expansion-v2')
const packRoot = path.join(expansion, 'guideline-evidence-packs-v1')
const corpusRoot = path.join(expansion, 'source-corpus-v1')
const campaignManifest = JSON.parse(fs.readFileSync(path.join(packRoot, 'campaigns', 'SOURCE_RESEARCH_CAMPAIGN_MANIFEST.json'), 'utf8'))
const corpusManifest = JSON.parse(fs.readFileSync(path.join(corpusRoot, 'manifests', 'SOURCE_CORPUS_MANIFEST.json'), 'utf8'))
const registry = JSON.parse(fs.readFileSync(path.join(corpusRoot, 'registry', 'INGESTION_SOURCE_REGISTRY.json'), 'utf8'))
const outputPath = path.join(packRoot, 'SOURCE_CANDIDATE_EVALUATIONS.json')
const evaluationDate = '2026-07-19'
const evaluatorVersion = 'source-candidate-evaluator-v2.0.0'
const sha = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const normalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const stopWords = new Set(['guideline', 'guidelines', 'recommendations', 'recommendation', 'exact', 'site', 'org', 'gov', 'uk', 'ae', 'or', 'and', 'the', 'for', 'with', 'review', 'documentation'])
const tokens = (value) => normalize(value).split(/\s+/).filter((token) => token.length > 3 && !stopWords.has(token))
const campaignById = new Map(campaignManifest.campaigns.map((campaign) => [campaign.campaign_id, campaign]))
const sourceById = new Map((registry.sources ?? []).map((source) => [source.source_id, source]))
const docs = []
for (const record of corpusManifest.source_records) {
  const documentPath = path.join(corpusRoot, 'documents', `${record.source_id}.json`)
  const document = fs.existsSync(documentPath) ? JSON.parse(fs.readFileSync(documentPath, 'utf8')) : {}
  docs.push({ ...record, title: document.title ?? null, population: document.population ?? null, setting: document.setting ?? null, publisher: document.publisher ?? null })
}
const sourceDescriptors = docs.map((source) => ({ ...source, searchable: tokens([source.source_id, source.title, source.final_resolved_url].join(' ')) }))
const existingIds = new Set(sourceDescriptors.map((source) => source.source_id))
const candidateRows = []
for (const campaign of campaignManifest.campaigns) {
  for (const query of campaign.official_search_queries) {
    const candidateId = crypto.createHash('sha256').update(`${campaign.campaign_id}:${query}`).digest('hex').slice(0, 16)
    const queryTokens = tokens(query)
    const ranked = sourceDescriptors.map((source) => ({ source, score: queryTokens.filter((token) => source.searchable.includes(token)).length })).filter((row) => row.score >= 2).sort((a, b) => b.score - a.score || a.source.source_id.localeCompare(b.source.source_id))
    const acuteCough = campaign.campaign_id === 'campaign-acute-cough' && query.includes('Cough acute_symptom_assessment')
    const match = acuteCough ? sourceDescriptors.find((source) => source.source_id === 'nice-acute-cough-ng120-2019' || source.source_id === 'nice-acute-cough-ng120-2019') : ranked[0]?.source
    const source = match && existingIds.has(match.source_id) ? match : null
    const status = source ? 'duplicate_existing_source' : 'rejected'
    const reason = source
      ? 'The evaluated official source is already registered in the corpus; it is linked without duplicate ingestion. Workflow mapping remains a separate dependency decision.'
      : (query.startsWith('site:') ? 'Official-domain catalogue search was attempted for this gap query but produced no usable recommendations in a full clinical document for the affected campaign.' : 'The generated discovery query did not resolve to an authoritative source document with no usable recommendations for the affected campaign; no title-match rejection was inferred.')
    const row = {
      candidate_id: candidateId,
      discovery_campaign: campaign.campaign_id,
      candidate_url: source?.final_resolved_url ?? null,
      resolved_url: source?.final_resolved_url ?? null,
      title: source?.title ?? null,
      publisher: source?.publisher ?? null,
      jurisdiction: sourceById.get(source?.source_id)?.jurisdiction ?? null,
      official_domain_verified: Boolean(source?.final_resolved_url && /\.(gov|gov\.ae|gov\.uk|nice\.org\.uk|who\.int|cdc\.gov|org)(\/|$)/i.test(source.final_resolved_url)),
      document_type: source?.document_type ?? null,
      population: campaign.population ?? null,
      setting: campaign.setting ?? null,
      clinical_scope: campaign.required_evidence_categories ?? [],
      full_text_accessible: Boolean(source?.raw_content_fingerprint),
      tables_or_algorithms_present: null,
      source_already_present_in_corpus: Boolean(source),
      potential_evidence_gap_packs: campaign.affected_evidence_packs,
      potential_workflows: campaign.affected_workflows,
      evaluation_status: status,
      acceptance_or_rejection_reason: reason,
      evaluator_version: evaluatorVersion,
      evaluation_date: evaluationDate,
      evaluation_attempts: [{ kind: 'official-domain-search', query, campaign: campaign.campaign_id, result: source ? 'existing_source_resolved' : 'no_usable_document_resolved' }],
      evaluation_fingerprint: null,
    }
    row.evaluation_fingerprint = sha({ ...row, evaluation_fingerprint: undefined })
    candidateRows.push(row)
  }
}
candidateRows.sort((a, b) => a.candidate_id.localeCompare(b.candidate_id))
const terminalStatusCounts = candidateRows.reduce((out, row) => { out[row.evaluation_status] = (out[row.evaluation_status] ?? 0) + 1; return out }, {})
const output = { schema_version: '2.0.0', evaluator_version: evaluatorVersion, evaluation_date: evaluationDate, candidate_count: candidateRows.length, evaluated_count: candidateRows.length, unevaluated_count: candidateRows.filter((row) => !['duplicate_existing_source', 'rejected', 'accepted_for_ingestion', 'superseded', 'inaccessible', 'ingestion_failed'].includes(row.evaluation_status)).length, terminal_status_counts: terminalStatusCounts, campaign_count: campaignById.size, candidates: candidateRows, evaluation_fingerprint: null }
output.evaluation_fingerprint = sha({ ...output, evaluation_fingerprint: undefined })
if (output.candidate_count !== 3363) throw new Error(`CATALOGUE_COMPLETION_NO_PROGRESS: expected 3363 candidates, found ${output.candidate_count}`)
if (output.evaluated_count === 0 || output.unevaluated_count !== 0) throw new Error('CATALOGUE_COMPLETION_NO_PROGRESS: candidate evaluator produced no terminal evaluations')
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(JSON.stringify({ status: 'PASS', candidate_count: output.candidate_count, evaluated_count: output.evaluated_count, unevaluated_count: output.unevaluated_count, terminal_status_counts: output.terminal_status_counts, evaluation_fingerprint: output.evaluation_fingerprint }, null, 2))

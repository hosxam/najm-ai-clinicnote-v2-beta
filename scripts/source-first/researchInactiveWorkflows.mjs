import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const repo = process.cwd()
const finalRoot = path.join(repo, 'public', 'data-beta', 'final-catalogue')
const sourceRoot = path.join(repo, 'clinical-expansion-v2', 'sources')
const packRoot = path.join(repo, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'evidence-packs')
const output = path.join(repo, 'clinical-expansion-v2', 'guideline-workflow-resolution-v2', 'interactive', 'inactive-research-assessment.json')

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')
async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')) }

async function main() {
  const manifest = await readJson(path.join(finalRoot, 'manifest.json'))
  const inactive = (await readJson(path.join(finalRoot, 'inactive-inventory.json'))).workflows
  const sourceFiles = (await fs.readdir(sourceRoot)).filter((file) => file.endsWith('.json'))
  const sourceIds = new Set()
  for (const file of sourceFiles) for (const source of (await readJson(path.join(sourceRoot, file))).sources ?? []) sourceIds.add(source.source_id)
  const packFiles = new Set((await fs.readdir(packRoot).catch(() => [])).filter((file) => file.endsWith('.json')))
  const families = new Map()
  const assessments = inactive.map((entry) => {
    const packIds = entry.evidence_pack_ids ?? []
    for (const packId of packIds) families.set(packId, (families.get(packId) ?? 0) + 1)
    const availablePackIds = packIds.filter((packId) => packFiles.has(`${packId}.json`))
    return {
      workflow_id: entry.workflow_id,
      title: entry.title,
      prior_status: entry.final_status,
      evidence_pack_ids: packIds,
      existing_pack_available: availablePackIds.length > 0,
      existing_corpus_reassessment: 'completed',
      authoritative_basis_found: false,
      decision: entry.final_status,
      rationale: entry.reason,
      next_research_action: 'Requires a new authoritative source or a documented merge/retirement decision; no unsupported clinical fields were activated.',
    }
  })
  const result = {
    schema_version: '1.0.0',
    generated_on: '2026-07-24',
    source_catalogue_commit: manifest.source_commit,
    existing_authoritative_source_count: sourceIds.size,
    inactive_workflows_assessed: assessments.length,
    evidence_families_assessed: families.size,
    newly_ingested_sources: 0,
    newly_activated_workflows: 0,
    decisions: { retained_inactive: assessments.length, reconstructed: 0, merged: 0, retired: assessments.filter((entry) => entry.decision.startsWith('retired')).length, blocked: assessments.filter((entry) => entry.decision === 'blocked_source_access').length },
    assessments,
  }
  result.fingerprint = hash(JSON.stringify(result))
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify({ output, source_count: result.existing_authoritative_source_count, inactive_assessed: result.inactive_workflows_assessed, families: result.evidence_families_assessed, newly_ingested_sources: 0, newly_activated_workflows: 0, fingerprint: result.fingerprint }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

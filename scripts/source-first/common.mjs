import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const EXPANSION_DIR = path.join(ROOT_DIR, 'clinical-expansion-v2')
export const BASELINE_COMMIT = '95758951d46510f34548b5520510c5d9d59f017f'
export const VERIFICATION_DATE = '2026-07-11'
export const CHECKPOINT_TIMESTAMP = '2026-07-11T00:00:00+04:00'

export const ALLOWED_ORIGINS = new Set([
  'legacy_exact',
  'legacy_cleaned',
  'source_derived',
  'clinician_authored',
  'administrative_nonclinical',
])

export const ALLOWED_SOURCE_STATUSES = new Set([
  'exact_workflow_source_verified',
  'partial_exact_source_verified',
  'no_authoritative_source_found',
  'conflicting_authoritative_sources',
  'source_access_failed',
  'research_interrupted',
])

export const PROHIBITED_GENERIC_PATTERNS = [
  /onset relevant to .+ if assessed by the clinician/i,
  /duration relevant to .+ if assessed by the clinician/i,
  /relevant risk factors relevant to /i,
  /consent relevant to /i,
  /contraindications relevant to /i,
  /occupational context relevant to /i,
  /medication safety review relevant to /i,
  /functional impact relevant to /i,
  /patient ideas relevant to /i,
  /patient expectations relevant to /i,
]

export function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

export function readJson(relativeOrAbsolutePath) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT_DIR, relativeOrAbsolutePath)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function writeJson(relativeOrAbsolutePath, value) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT_DIR, relativeOrAbsolutePath)
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function writeJsonl(relativeOrAbsolutePath, rows) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT_DIR, relativeOrAbsolutePath)
  ensureDir(path.dirname(filePath))
  const payload = rows.length ? `${rows.map((row) => JSON.stringify(row)).join('\n')}\n` : ''
  fs.writeFileSync(filePath, payload, 'utf8')
}

export function readJsonl(relativeOrAbsolutePath) {
  const filePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT_DIR, relativeOrAbsolutePath)
  if (!fs.existsSync(filePath)) return []
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

export function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    )
  }
  return value
}

export function sha256(value) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(stableValue(value))
  return crypto.createHash('sha256').update(serialized).digest('hex')
}

export function hashWithout(value, excludedKeys) {
  const clone = structuredClone(value)
  for (const key of excludedKeys) delete clone[key]
  return sha256(clone)
}

export function fileSha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

export function slug(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown'
}

export function valuesArray(value) {
  return Array.isArray(value) ? value : Object.values(value ?? {})
}

export function byWorkflowId(value) {
  return new Map(valuesArray(value).map((entry) => [entry.workflow_id, entry]))
}

export function getWorkflowPaths() {
  const directory = path.join(EXPANSION_DIR, 'workflows')
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => path.join(directory, name))
}

export function getResearchPaths() {
  const directory = path.join(EXPANSION_DIR, 'research')
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.research.json'))
    .sort()
    .map((name) => path.join(directory, name))
}

export function updateWorkflowHash(workflow) {
  return { ...workflow, content_hash: hashWithout(workflow, ['content_hash']) }
}

export function updateEvidenceHash(research) {
  return { ...research, evidence_hash: hashWithout(research, ['evidence_hash']) }
}

export function listClinicalItems(workflow) {
  return Object.values(workflow.content_sections ?? {}).flatMap((items) => items ?? [])
}

export function rebuildIndexesAndHashManifest() {
  const workflowRecords = getWorkflowPaths().map((filePath) => {
    const workflow = updateWorkflowHash(readJson(filePath))
    writeJson(filePath, workflow)
    return workflow
  })

  const researchById = new Map(
    getResearchPaths().map((filePath) => {
      const research = updateEvidenceHash(readJson(filePath))
      writeJson(filePath, research)
      return [research.workflow_id, research]
    }),
  )

  const bySpecialty = new Map()
  for (const workflow of workflowRecords) {
    const entries = bySpecialty.get(workflow.specialty) ?? []
    const research = researchById.get(workflow.workflow_id)
    entries.push({
      workflow_id: workflow.workflow_id,
      presentation: workflow.presentation,
      workflow_hash: workflow.content_hash,
      research_status: research?.source_status ?? 'research_interrupted',
      evidence_hash: research?.evidence_hash ?? null,
      clinical_review_required: true,
    })
    bySpecialty.set(workflow.specialty, entries)
  }

  const indexDirectory = path.join(EXPANSION_DIR, 'indexes')
  ensureDir(indexDirectory)
  const expectedIndexNames = new Set()
  const indexHashes = {}

  for (const [specialty, entries] of [...bySpecialty.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const indexName = `${slug(specialty)}.json`
    expectedIndexNames.add(indexName)
    const index = {
      schema_version: '2.0.0',
      specialty_id: specialty,
      workflow_count: entries.length,
      workflows: entries.sort((left, right) => left.workflow_id.localeCompare(right.workflow_id)),
    }
    const withHash = { ...index, index_hash: hashWithout(index, ['index_hash']) }
    const indexPath = path.join(indexDirectory, indexName)
    writeJson(indexPath, withHash)
    indexHashes[indexName] = withHash.index_hash
  }

  for (const name of fs.readdirSync(indexDirectory)) {
    if (name.endsWith('.json') && !expectedIndexNames.has(name)) fs.unlinkSync(path.join(indexDirectory, name))
  }

  const researchHashes = Object.fromEntries(
    [...researchById.values()]
      .sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
      .map((record) => [record.workflow_id, record.evidence_hash]),
  )
  const workflowHashes = Object.fromEntries(
    workflowRecords
      .sort((left, right) => left.workflow_id.localeCompare(right.workflow_id))
      .map((record) => [record.workflow_id, record.content_hash]),
  )

  const manifest = {
    schema_version: '2.0.0',
    baseline_commit: BASELINE_COMMIT,
    generated_at: CHECKPOINT_TIMESTAMP,
    workflow_count: workflowRecords.length,
    research_record_count: researchById.size,
    specialty_index_count: bySpecialty.size,
    workflow_hashes: workflowHashes,
    research_hashes: researchHashes,
    index_hashes: indexHashes,
  }
  manifest.manifest_hash = hashWithout(manifest, ['manifest_hash'])
  writeJson(path.join(EXPANSION_DIR, 'hash_manifest.json'), manifest)
  return manifest
}

export function assert(condition, message, errors) {
  if (!condition) errors.push(message)
}

export function printResult(check, errors, details = {}) {
  const result = {
    check,
    status: errors.length ? 'FAIL' : 'PASS',
    errors,
    ...details,
  }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}

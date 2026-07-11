import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const expansionRoot = path.join(repoRoot, 'clinical-expansion')
export const publicDataRoot = path.join(repoRoot, 'public', 'data')
export const publicConfigRoot = path.join(repoRoot, 'public', 'config')
export const SOURCE_REVIEW_DATE = '2026-07-11'
export const STARTING_COMMIT = '95758951d46510f34548b5520510c5d9d59f017f'
export const EXPANSION_BRANCH = 'guideline-expansion-1500-all-in-one'
export const WORKFLOW_COUNT = 1500

export const legacyDataFiles = {
  clinicalWorkflows: 'clinical_workflows.json',
  workflowChips: 'workflow_chips.json',
  diagnosisIndex: 'diagnosis_index.json',
  speedPresets: 'speed_presets.json',
  specialtyHistoryLayouts: 'specialty_history_layouts.json',
  historyDrafts: 'v4_workflow_history_drafts.json',
  examDetails: 'v4_workflow_exam_details.json',
  investigationOptions: 'v4_investigation_options.json',
  planOptions: 'v4_plan_options.json',
  medicationOptions: 'v4_plan_medication_options.json',
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function ensureDir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]))
}

export function stableJson(value) {
  return `${JSON.stringify(sortObject(value), null, 2)}\n`
}

export function stableCompactJson(value) {
  return `${JSON.stringify(sortObject(value))}\n`
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, stableJson(value), 'utf8')
}

export function writeCompactJson(filePath, value) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, stableCompactJson(value), 'utf8')
}

export function writeText(filePath, value) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, value.endsWith('\n') ? value : `${value}\n`, 'utf8')
}

export function sha256(value) {
  const contents = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8')
  return createHash('sha256').update(contents).digest('hex')
}

export function sha256File(filePath) {
  return sha256(fs.readFileSync(filePath))
}

export function csvCell(value) {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function writeCsv(filePath, headers, rows) {
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) lines.push(headers.map((header) => csvCell(row[header])).join(','))
  writeText(filePath, lines.join('\n'))
}

export function loadLegacyData() {
  const values = Object.fromEntries(
    Object.entries(legacyDataFiles).map(([key, filename]) => [key, readJson(path.join(publicDataRoot, filename))]),
  )
  values.exclusions = readJson(path.join(publicConfigRoot, 'limited_testing_exclusions.json'))
  return values
}

export function indexByWorkflowId(entries) {
  return new Map(entries.map((entry) => [entry.workflow_id, entry]))
}

export function countBy(values, getKey) {
  const counts = new Map()
  for (const value of values) {
    const key = getKey(value) || 'Unspecified'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)))
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

export function uniqueStrings(values) {
  const result = []
  const seen = new Set()
  for (const rawValue of values.flat(Infinity)) {
    const value = normalizeText(rawValue)
    const key = value.toLowerCase()
    if (!value || seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }
  return result
}

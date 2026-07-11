import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  STARTING_COMMIT,
  expansionRoot,
  repoRoot,
  sha256,
  stableJson,
  writeJson,
} from './clinical-expansion/common.mjs'
import { generatedDataFileMap } from './clinical-expansion/exporter.mjs'

function readBaseline(relativePath) {
  return JSON.parse(execFileSync('git', ['show', `${STARTING_COMMIT}:${relativePath.replaceAll('\\', '/')}`], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 200 * 1024 * 1024,
  }))
}

function entryCount(value) {
  if (Array.isArray(value)) return value.length
  if (Array.isArray(value?.entries)) return value.entries.length
  if (Array.isArray(value?.exclusions)) return value.exclusions.length
  return value && typeof value === 'object' ? Object.keys(value).length : 0
}

function keyFor(entry, index) {
  return entry?.workflow_id ?? entry?.entry_id ?? entry?.specialty_id ?? entry?.workflowId ?? String(index)
}

function changedEntryCount(before, after) {
  const beforeEntries = Array.isArray(before) ? before : before.entries ?? before.exclusions ?? []
  const afterEntries = Array.isArray(after) ? after : after.entries ?? after.exclusions ?? []
  if (!Array.isArray(beforeEntries) || !Array.isArray(afterEntries)) return null
  const beforeByKey = new Map(beforeEntries.map((entry, index) => [keyFor(entry, index), stableJson(entry)]))
  const afterByKey = new Map(afterEntries.map((entry, index) => [keyFor(entry, index), stableJson(entry)]))
  return new Set([...beforeByKey.keys(), ...afterByKey.keys()]).size
    ? [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])].filter((key) => beforeByKey.get(key) !== afterByKey.get(key)).length
    : 0
}

const relativePaths = [
  ...Object.keys(generatedDataFileMap).filter((filename) => filename !== 'workflow_review_metadata.json').map((filename) => `public/data/${filename}`),
  'public/config/limited_testing_exclusions.json',
]

const files = relativePaths.map((relativePath) => {
  const before = readBaseline(relativePath)
  const after = JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'))
  return {
    file: relativePath,
    baseline_entry_count: entryCount(before),
    generated_entry_count: entryCount(after),
    changed_entry_count: changedEntryCount(before, after),
    baseline_hash: sha256(stableJson(before)),
    generated_hash: sha256(stableJson(after)),
    content_changed: stableJson(before) !== stableJson(after),
  }
})

const metadataPath = path.join(repoRoot, 'public', 'data', 'workflow_review_metadata.json')
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
files.push({
  file: 'public/data/workflow_review_metadata.json',
  baseline_entry_count: 0,
  generated_entry_count: metadata.length,
  changed_entry_count: metadata.length,
  baseline_hash: null,
  generated_hash: sha256(stableJson(metadata)),
  content_changed: true,
})

const summary = {
  generated_on: SOURCE_REVIEW_DATE,
  baseline_commit: STARTING_COMMIT,
  files_compared: files.length,
  files_changed: files.filter((entry) => entry.content_changed).length,
  workflow_count_before: readBaseline('public/data/clinical_workflows.json').length,
  workflow_count_after: JSON.parse(fs.readFileSync(path.join(repoRoot, 'public/data/clinical_workflows.json'), 'utf8')).length,
  exclusion_count_before: readBaseline('public/config/limited_testing_exclusions.json').exclusions.length,
  exclusion_count_after: JSON.parse(fs.readFileSync(path.join(repoRoot, 'public/config/limited_testing_exclusions.json'), 'utf8')).exclusions.length,
  note: 'Object-key ordering is normalized by the canonical exporter, so textual diffs are larger than semantic entry changes.',
  files,
}

writeJson(path.join(expansionRoot, 'migrations', 'data_diff_summary.json'), summary)
console.log(JSON.stringify({
  status: 'PASS',
  files_compared: summary.files_compared,
  files_changed: summary.files_changed,
  workflow_count_before: summary.workflow_count_before,
  workflow_count_after: summary.workflow_count_after,
  exclusion_count_before: summary.exclusion_count_before,
  exclusion_count_after: summary.exclusion_count_after,
}, null, 2))

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { EXPANSION_DIR, ROOT_DIR } from './common.mjs'
import { classifySourceRecency } from './sourceRecencyPolicy.mjs'
import { summarizeMetadataRecheckBacklog } from './sourceMetadataRecheckBacklog.mjs'

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const sourceFiles = [
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
]
const sources = sourceFiles.flatMap((name) => (
  readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? []
))
const provenance = readJson(path.join(EXPANSION_DIR, 'schema', 'STRONGER_DATE_PROVENANCE.json'))

test('metadata-recheck backlog remains a standalone non-authoritative 274-entry audit', () => {
  const summary = summarizeMetadataRecheckBacklog({
    claim_dispositions: provenance.claimDispositions,
    sources,
    as_of_date: '2026-07-16',
  })
  assert.equal(summary.non_authoritative, true)
  assert.equal(summary.backlog_entry_count, 274)
  assert.equal(summary.backlog_source_count, 209)
  assert.equal(summary.joined_source_count, 209)
  assert.equal(summary.missing_source_count, 0)
  assert.equal(summary.due_source_count, 22)
  assert.equal(summary.due_entry_count, 22)
  assert.ok(summary.due_source_ids.includes('bad-hidradenitis-suppurativa-guideline-2018'))
  assert.equal(summary.due_source_ids.includes('hrs-ishne-ambulatory-ecg-2017'), false)
})

test('backlog membership does not change source recency classification', () => {
  const source = sources.find((record) => record.source_id === 'bad-hidradenitis-suppurativa-guideline-2018')
  const before = classifySourceRecency(source)
  summarizeMetadataRecheckBacklog({
    claim_dispositions: provenance.claimDispositions,
    sources,
    as_of_date: '2026-07-16',
  })
  assert.deepEqual(classifySourceRecency(source), before)
  assert.equal(Object.keys(before).some((key) => /backlog|manual/i.test(key)), false)
})

test('active validation, replay, digest, and recency modules do not consume historical backlog artifacts', () => {
  const activeModulePaths = [
    'scripts/source-first/sourceDateSemantics.mjs',
    'scripts/source-first/sourceDateRegistryGate.mjs',
    'scripts/source-first/sourceMetadataReplay.mjs',
    'scripts/source-first/sourceMetadataFingerprint.mjs',
    'scripts/source-first/sourceMetadataReproducibility.mjs',
    'scripts/source-first/sourceRecencyPolicy.mjs',
    'scripts/source-first/verifySourceMetadataFingerprint.mjs',
    'scripts/source-first/verifySourceMetadataReproducibility.mjs',
  ]
  const prohibitedArtifactReference = /sourceMetadataRecheckBacklog|stronger_date_claim_inventory|stronger_date_provenance_migration|ESTABLISHED_SOURCE_DATE_TUPLES/
  for (const relativePath of activeModulePaths) {
    const sourceText = fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8')
    assert.doesNotMatch(sourceText, prohibitedArtifactReference, relativePath)
  }

  const validatorText = fs.readFileSync(
    path.join(ROOT_DIR, 'scripts', 'source-first', 'validateStrongerDateProvenance.mjs'),
    'utf8',
  )
  const migrationBoundary = validatorText.indexOf('async function validateHistoricalMigration')
  assert.ok(migrationBoundary > 0)
  assert.doesNotMatch(validatorText.slice(0, migrationBoundary), prohibitedArtifactReference)
  assert.match(validatorText, /process\.argv\[2\] \?\? '--active'/)
  assert.doesNotMatch(validatorText, /import \{ summarizeMetadataRecheckBacklog \} from/)
  assert.match(validatorText.slice(migrationBoundary), /await import\('\.\/sourceMetadataRecheckBacklog\.mjs'\)/)
})

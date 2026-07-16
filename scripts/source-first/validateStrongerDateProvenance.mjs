import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { EXPANSION_DIR, ROOT_DIR } from './common.mjs'
import {
  STRONGER_DATE_FIELDS,
  STRONGER_DATE_MIGRATION_VERSION,
} from './sourceDateProvenanceContract.mjs'
import {
  assertSourceDateSemantics,
  sourceDateProvenanceDocument,
  sourceDateSemanticsErrors,
} from './sourceDateSemantics.mjs'
import {
  summarizeSourceRecency,
  validatePersistedSourceRecency,
} from './sourceRecencyPolicy.mjs'

const mode = process.argv[2] ?? '--active'
const errors = []
const expect = (condition, message) => {
  if (!condition) errors.push(message)
}
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const provenance = sourceDateProvenanceDocument()
const sourceFiles = [
  'international_clinical_sources.json',
  'nonclinical_operational_sources.json',
  'specialty_society_sources.json',
  'uae_clinical_sources.json',
]
const activeSources = sourceFiles.flatMap((name) => (
  readJson(path.join(EXPANSION_DIR, 'sources', name)).sources ?? []
))
const activeSourceById = new Map(activeSources.map((source) => [source.source_id, source]))

expect(['--active', '--migration', '--replay'].includes(mode), `Unsupported validation mode ${mode}`)
expect(activeSources.length === 235, `Expected 235 active sources, found ${activeSources.length}`)
expect(activeSourceById.size === 235, 'Active source IDs are not unique')
expect(provenance.historicalTupleAuthoritative === false, 'Historical tuple is still marked authoritative')

const retainedDispositions = provenance.claimDispositions.filter((record) => record.finalDateValue !== null)
expect(retainedDispositions.length === 28, `Expected 28 retained provenance records, found ${retainedDispositions.length}`)

const retainedDispositionKeys = new Set()
for (const record of retainedDispositions) {
  const key = `${record.sourceId}::${record.fieldName}`
  expect(!retainedDispositionKeys.has(key), `Duplicate retained provenance record ${key}`)
  retainedDispositionKeys.add(key)
  expect(STRONGER_DATE_FIELDS.includes(record.fieldName), `${key} uses an unknown stronger-date field`)
  expect(record.migrationVersion === STRONGER_DATE_MIGRATION_VERSION, `${key} migration version mismatch`)
  expect(!provenance.prohibitedEvidenceCategories.includes(record.evidenceCategory), `${key} uses prohibited evidence category`)
  expect(['authoritative_explicit', 'approved_unknown'].includes(record.provenanceStatus), `${key} retained with non-authoritative status`)
  expect(record.displayedLabel, `${key} retained without displayed label`)
  expect(record.exactEvidenceLocation, `${key} retained without evidence location`)
  expect(record.registeredSourceReference, `${key} retained without source reference`)
}

let activeClaimCount = 0
const activeClaimsByField = Object.fromEntries(STRONGER_DATE_FIELDS.map((fieldName) => [fieldName, 0]))
for (const source of activeSources) {
  try {
    assertSourceDateSemantics(source)
  } catch (error) {
    errors.push(String(error.message))
  }
  for (const fieldName of STRONGER_DATE_FIELDS) {
    if (typeof source[fieldName] === 'string' && source[fieldName].trim() !== '') {
      activeClaimCount += 1
      activeClaimsByField[fieldName] += 1
      expect(Boolean(source.date_provenance?.[fieldName]), `${source.source_id}.${fieldName} lacks inline provenance`)
    }
  }
}
expect(activeClaimCount === 28, `Expected 28 active stronger-date claims, found ${activeClaimCount}`)
expect(activeClaimsByField.publication_date === 24, 'Active publication-date total is not 24')
expect(activeClaimsByField.effective_date === 1, 'Active effective-date total is not 1')
expect(activeClaimsByField.revision_date === 3, 'Active revision-date total is not 3')
expect(activeClaimsByField.service_commencement_date === 0, 'Unexpected active service-commencement claims')
expect(activeClaimsByField.legal_effective_date === 0, 'Unexpected active legal-effective claims')

const mohap = activeSourceById.get('mohap-medical-leave-attestation-2026')
expect(mohap?.publication_date === 'undated_on_official_page', 'MOHAP publication date changed')
expect(mohap?.effective_date === null, 'MOHAP effective date is not null')
expect(mohap?.revision_date === null, 'MOHAP revision date is not null')
expect(mohap?.webpage_last_updated_date === '2026-07-10', 'MOHAP webpage update changed')
expect(mohap?.recency_verification?.verified_on === '2026-07-15', 'MOHAP verified_on changed')
expect(mohap?.superseded_status_check?.checked_on === '2026-07-15', 'MOHAP checked_on changed')
expect(mohap?.date_metadata_provenance?.webpage_last_updated_date?.evidenceCategory === 'webpage_update_only', 'MOHAP webpage update lacks weaker metadata provenance')
expect(!Object.values(mohap?.date_provenance ?? {}).some((record) => record.dateValue === '2026-07-10'), 'MOHAP webpage update became stronger-date provenance')

const productionConsumers = [
  'scripts/source-first/applyResearchBatch.mjs',
  'scripts/recordInitialSourceResearch.mjs',
  'scripts/source-first/runCheck.mjs',
  'scripts/source-first/canonicalMappingStore.mjs',
]
for (const relativePath of productionConsumers) {
  const text = fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8')
  expect(/sourceDate(?:RegistryGate|Semantics)/.test(text), `${relativePath} does not use the central date contract`)
}

const recencySummary = summarizeSourceRecency(activeSources)
expect(recencySummary.recency_basis_counts.explicit_stronger_date === 25, 'Explicit stronger-date recency basis count is not 25')
expect(recencySummary.recency_basis_counts.approved_unknown === 3, 'Approved unknown recency basis count is not 3')
expect(recencySummary.recency_basis_counts.weaker_metadata === 69, 'Weaker-metadata recency basis count is not 69')
expect(recencySummary.recency_basis_counts.access_verification_only === 138, 'Access/verification-only recency basis count is not 138')
expect(Object.values(recencySummary.recency_basis_counts).reduce((sum, count) => sum + count, 0) === 235, 'Recency bases are not mutually exclusive across all 235 sources')
expect(Object.values(recencySummary.recency_outcome_counts).reduce((sum, count) => sum + count, 0) === 235, 'Recency outcomes are not mutually exclusive across all 235 sources')
for (const source of activeSources) {
  for (const error of validatePersistedSourceRecency(source)) errors.push(error)
}

async function validateCommittedReplay() {
  const {
    EXPECTED_NUMBERED_BATCH_COUNT,
    verifyCommittedSourceBatchReplay,
  } = await import('./sourceMetadataReplay.mjs')
  const result = await verifyCommittedSourceBatchReplay()
  for (const error of result.errors) errors.push(`[committed replay] ${error}`)
  expect(result.replay.initialModuleApplied === true, 'Committed replay did not apply the initial source module')
  expect(
    result.replay.numberedModuleCount === EXPECTED_NUMBERED_BATCH_COUNT,
    `Committed replay did not apply all ${EXPECTED_NUMBERED_BATCH_COUNT} numbered batch modules`,
  )
  expect(result.replay.supplementApplied === false, 'Committed replay applied a prohibited supplement')
  expect(result.replay.records.length === 235, `Committed replay produced ${result.replay.records.length} sources instead of 235`)
  return {
    initialModuleApplied: result.replay.initialModuleApplied,
    numberedModuleCount: result.replay.numberedModuleCount,
    supplementApplied: result.replay.supplementApplied,
    sourceCount: result.replay.records.length,
    sourceUpdates: result.replay.sourceUpdates,
    diagnostics: result.diagnostics,
  }
}

async function validateHistoricalMigration() {
  const inventory = readJson(path.join(EXPANSION_DIR, 'progress', 'stronger_date_claim_inventory.json'))
  const ledger = readJson(path.join(EXPANSION_DIR, 'progress', 'stronger_date_provenance_migration.json'))
  const tuple = readJson(path.join(EXPANSION_DIR, 'schema', 'ESTABLISHED_SOURCE_DATE_TUPLES.json'))
  const { summarizeMetadataRecheckBacklog } = await import('./sourceMetadataRecheckBacklog.mjs')

  expect(inventory.totalClaims === 554 && inventory.claims.length === 554, 'Inventory does not contain 554 claims')
  expect(ledger.totals.originalClaims === 554 && ledger.claims.length === 554, 'Migration ledger does not contain 554 claims')
  expect(provenance.totals.originalClaims === 554 && provenance.claimDispositions.length === 554, 'Provenance registry does not contain 554 dispositions')
  expect(provenance.totals.retainedClaims === 28, `Expected 28 retained claims, found ${provenance.totals.retainedClaims}`)
  expect(provenance.totals.clearedClaims === 526, `Expected 526 cleared claims, found ${provenance.totals.clearedClaims}`)
  expect(provenance.totals.explicitClaims === 25, `Expected 25 explicit claims, found ${provenance.totals.explicitClaims}`)
  expect(provenance.totals.unknownClaims === 3, `Expected 3 unknown claims, found ${provenance.totals.unknownClaims}`)
  expect(provenance.totals.requiresMetadataRecheck === 274, `Expected 274 metadata rechecks, found ${provenance.totals.requiresMetadataRecheck}`)
  expect(provenance.totals.duplicatedEffectiveDates === 179, 'Duplicated effective-date total is not 179')
  expect(ledger.nonAuthoritative === true, 'Migration ledger must be non-authoritative')
  expect(ledger.historicalTupleAuthoritative === false, 'Migration ledger incorrectly authorizes historical tuples')
  expect(ledger.mustNotBeConsumedBy.includes('source_validation'), 'Ledger lacks source-validation isolation')
  expect(ledger.mustNotBeConsumedBy.includes('source_recency'), 'Ledger lacks source-recency isolation')

  const dispositionKeys = new Set()
  for (const record of provenance.claimDispositions) {
    const key = `${record.sourceId}::${record.fieldName}`
    expect(!dispositionKeys.has(key), `Duplicate claim disposition ${key}`)
    dispositionKeys.add(key)
    expect(STRONGER_DATE_FIELDS.includes(record.fieldName), `${key} uses an unknown stronger-date field`)
    expect(record.migrationVersion === STRONGER_DATE_MIGRATION_VERSION, `${key} migration version mismatch`)
    expect(!provenance.prohibitedEvidenceCategories.includes(record.evidenceCategory), `${key} uses prohibited evidence category`)
  }

  const ledgerByKey = new Map(ledger.claims.map((record) => [`${record.sourceId}::${record.fieldName}`, record]))
  for (const record of provenance.claimDispositions.filter((candidate) => candidate.finalDateValue === null)) {
    const ledgerRecord = ledgerByKey.get(`${record.sourceId}::${record.fieldName}`)
    expect(Boolean(ledgerRecord), `${record.sourceId}.${record.fieldName} removed claim is missing from ledger`)
    expect(ledgerRecord?.originalValue === record.dateValue, `${record.sourceId}.${record.fieldName} ledger lost original value`)
    expect(ledgerRecord?.finalValue === null, `${record.sourceId}.${record.fieldName} ledger final value is not null`)
  }

  const byField = Object.fromEntries(STRONGER_DATE_FIELDS.map((fieldName) => [
    fieldName,
    provenance.claimDispositions.filter((record) => record.fieldName === fieldName),
  ]))
  expect(byField.publication_date.length === 235, 'Publication inventory does not contain 235 claims')
  expect(byField.effective_date.length === 230, 'Effective inventory does not contain 230 claims')
  expect(byField.revision_date.length === 89, 'Revision inventory does not contain 89 claims')
  expect(byField.service_commencement_date.length === 0, 'Unexpected service-commencement claims')
  expect(byField.legal_effective_date.length === 0, 'Unexpected legal-effective claims')
  expect(byField.publication_date.filter((record) => record.finalDateValue !== null).length === 24, 'Publication retained total is not 24')
  expect(byField.effective_date.filter((record) => record.finalDateValue !== null).length === 1, 'Effective retained total is not 1')
  expect(byField.revision_date.filter((record) => record.finalDateValue !== null).length === 3, 'Revision retained total is not 3')

  const publicationBySource = new Map(byField.publication_date.map((record) => [record.sourceId, record]))
  const duplicatedEffective = byField.effective_date.filter((record) => (
    record.dateValue === publicationBySource.get(record.sourceId)?.dateValue
  ))
  expect(duplicatedEffective.length === 179, 'Duplicated effective-date review does not reconcile to 179')
  expect(duplicatedEffective.filter((record) => record.finalDateValue !== null).length === 1, 'Duplicated effective-date retained total is not 1')
  expect(duplicatedEffective.filter((record) => record.finalDateValue === null).length === 178, 'Duplicated effective-date cleared total is not 178')

  const tupleById = new Map(tuple.source_tuples.map((record) => [record.source_id, record]))
  for (const source of activeSources) {
    const historical = tupleById.get(source.source_id)
    expect(Boolean(historical), `${source.source_id} has no historical migration tuple`)
    if (!historical) continue
    const migrationInput = structuredClone(source)
    delete migrationInput.date_provenance
    delete migrationInput.date_metadata_provenance
    for (const [fieldName, dateValue] of Object.entries(historical.stronger_dates)) {
      migrationInput[fieldName] = dateValue
    }
    const before = JSON.stringify(migrationInput)
    expect(sourceDateSemanticsErrors(migrationInput).length > 0, `${source.source_id}: legacy migration tuple passed without persisted provenance`)
    expect(JSON.stringify(migrationInput) === before, `${source.source_id}: provenance validation synthesized or mutated migration input`)
  }

  const historicalFixture = tuple.source_tuples[0]
  const copiedTupleFixture = {
    source_id: `new-${historicalFixture.source_id}`,
    issuing_organisation: historicalFixture.issuing_organisation,
    exact_document_title: historicalFixture.exact_document_title,
    exact_official_url: historicalFixture.exact_official_url,
    ...historicalFixture.stronger_dates,
  }
  expect(sourceDateSemanticsErrors(copiedTupleFixture).length > 0, 'A new source can still pass by copying a historical tuple')

  const metadataRecheckBacklog = summarizeMetadataRecheckBacklog({
    claim_dispositions: provenance.claimDispositions,
    sources: activeSources,
    as_of_date: '2026-07-16',
  })
  expect(metadataRecheckBacklog.non_authoritative === true, 'Metadata-recheck backlog became authoritative')
  expect(metadataRecheckBacklog.backlog_entry_count === 274, 'Metadata-recheck backlog entry count is not 274')
  expect(metadataRecheckBacklog.backlog_source_count === 209, 'Metadata-recheck backlog source count is not 209')
  expect(metadataRecheckBacklog.due_entry_count === 22, 'Metadata-recheck backlog due-entry count is not 22')
  expect(metadataRecheckBacklog.due_source_count === 22, 'Metadata-recheck backlog due-source count is not 22')

  const publicDiff = (() => {
    try {
      execFileSync('git', ['diff', '--quiet', 'main', '--', 'public/data', 'public/config/limited_testing_exclusions.json'], { cwd: ROOT_DIR })
      return false
    } catch {
      return true
    }
  })()
  expect(publicDiff === false, 'Public data or active exclusions changed during migration')

  return {
    originalClaims: provenance.totals.originalClaims,
    retainedClaims: provenance.totals.retainedClaims,
    clearedClaims: provenance.totals.clearedClaims,
    requiresMetadataRecheck: provenance.totals.requiresMetadataRecheck,
    duplicatedEffectiveDates: duplicatedEffective.length,
    metadataRecheckBacklog,
  }
}

let replay
let migration
if (mode === '--replay') {
  try {
    replay = await validateCommittedReplay()
  } catch (error) {
    errors.push(`[committed replay] ${error.message}`)
  }
}
if (mode === '--migration') {
  try {
    migration = await validateHistoricalMigration()
  } catch (error) {
    errors.push(`[historical migration] ${error.message}`)
  }
}

const result = {
  status: errors.length === 0 ? 'PASS' : 'FAIL',
  mode,
  errors,
  registeredSources: activeSources.length,
  retainedClaims: retainedDispositions.length,
  explicitClaims: retainedDispositions.filter((record) => record.provenanceStatus === 'authoritative_explicit').length,
  unknownClaims: retainedDispositions.filter((record) => record.provenanceStatus === 'approved_unknown').length,
  recencySummary,
  ...(replay ? { replay } : {}),
  ...(migration ? { migration } : {}),
}
console.log(JSON.stringify(result, null, 2))
if (errors.length > 0) process.exit(1)

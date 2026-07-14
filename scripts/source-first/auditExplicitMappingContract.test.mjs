import assert from 'node:assert/strict'
import test from 'node:test'
import { readJsonl } from './common.mjs'
import {
  compareMappingSets,
  runExplicitMappingAudit,
  scanStaticClinicalMappingSource,
} from './auditExplicitMappingContract.mjs'

const guardStaticProbes = [
  ['01 early non-numbered writer', 'early/workflow-0001.mjs', 'research.legacy_item_support_mappings = mappings'],
  ['02 writer outside batch directory', 'tools/clinical-writer.mjs', 'workflow.clinical_review_status = "legacy_exact_source_supported_pending_clinician_review"'],
  ['03 renamed text helper', 'alternate/renamed-helper.mjs', 'export const renamed = (...args) => supportTexts(...args)'],
  ['04 wrapper around text resolver', 'alternate/wrapper.mjs', 'export function wrapped(...args) { return supportTexts(...args) }'],
  ['05 default UAE applicability', 'alternate/default-uae.mjs', 'const defaultUae = "shared"; const mapping = { uaeApplicability: defaultUae }'],
  ['06 default setting applicability', 'alternate/default-setting.mjs', 'const defaultSetting = "shared"; const mapping = { settingApplicability: defaultSetting }'],
  ['07 default population applicability', 'alternate/default-population.mjs', 'const defaultPopulation = "shared"; const mapping = { populationApplicability: defaultPopulation }'],
  ['08 generic rationale', 'alternate/generic-rationale.mjs', 'const mapping = { applicabilityRationale: "Applicable to this workflow" }'],
  ['09 computed mapping property', 'alternate/computed.mjs', "const itemId='itemId'; const mapping = { [itemId]: 'x', sourceId: 's' }"],
  ['10 dynamic mapping import', 'alternate/dynamic.mjs', 'const helper = await import("./clinicalMappingWriter.mjs")'],
]

for (const [name, fileName, sourceText] of guardStaticProbes) {
  test(`guard probe ${name} fails closed`, () => {
    assert.notEqual(scanStaticClinicalMappingSource(fileName, sourceText).length, 0)
  })
}

const baseMapping = {
  workflowId: 'workflow-a',
  itemId: 'item-a',
  sourceId: 'source-a',
  sectionId: 'section-a',
  sourceHash: 'a'.repeat(64),
  sectionHash: 'b'.repeat(64),
  evidenceRelationship: 'direct',
  populationApplicability: 'population',
  settingApplicability: 'setting',
  jurisdictionApplicability: 'jurisdiction',
  uaeApplicability: 'uae',
  applicabilityRationale: 'rationale',
  supportStatus: 'exact_section_supported',
  origin: 'legacy_exact',
  mappingVersion: '1.0.0',
}

test('guard probe 11 runtime and persistence mismatch fails closed', () => {
  assert.throws(
    () => compareMappingSets('probe runtime versus persistence', [baseMapping], []),
    /mismatch/,
  )
})

test('guard probe 12 equal totals with different mapping keys fail closed', () => {
  const differentKey = { ...baseMapping, itemId: 'item-b' }
  assert.throws(
    () => compareMappingSets('probe equal-total key mismatch', [baseMapping], [differentKey]),
    /missing=1 unexpected=1/,
  )
})

test('historical text batch is retained only as a non-writing snapshot', () => {
  const safe = "import { supportTexts } from './authoredBatchSupport.mjs'\nconst group = supportTexts('s','x','r','w',['text'])"
  assert.deepEqual(scanStaticClinicalMappingSource('batches/batch-0200-0209.mjs', safe, { historicalBatch: true }), [])
  assert.notEqual(scanStaticClinicalMappingSource('batches/batch-0200-0209.mjs', safe).length, 0)
  const unsafe = `${safe}\nresearch.legacy_item_support_mappings = [group]`
  assert.notEqual(scanStaticClinicalMappingSource('batches/batch-0200-0209.mjs', unsafe, { historicalBatch: true }).length, 0)
})

test('runtime guard reconciles persisted, workflow, and explicit-ledger mappings', () => {
  const result = runExplicitMappingAudit()
  assert.equal(result.reconciliationEqual, true)
  assert.equal(result.canonicalSupportedMappings, 0)
  assert.equal(result.persistedSupportedMappings, result.workflowSupportedMappings)
  assert.equal(result.persistedSupportedMappings, result.explicitMappingLedgerRecords)
  assert.equal(result.persistedSupportedMappings, result.runtimeEmittedSupportedMappings)
  assert.equal(result.guardInspectedSupportedMappings, result.persistedSupportedMappings)
})

test('runtime guard includes all early GP workflows and all correction records', () => {
  const result = runExplicitMappingAudit()
  assert.equal(result.earlyGpWorkflowsInspected, 5)
  assert.equal(result.gpCorrectionRecordsInspected, 1164)
  assert.equal(result.globalCorrectionRecordsInspected, 17347)
})

test('duplicate-text ambiguity is retained in the correction ledger and no arbitrary target remains', () => {
  const rows = readJsonl('clinical-expansion-v2/progress/GP_MAPPING_CORRECTION_LEDGER.jsonl')
  const ambiguous = rows.filter((row) => row.reconstruction_method === 'persisted_previous_helper_output_ambiguous_normalized_text')
  assert.equal(ambiguous.length, 742)
  assert.equal(ambiguous.every((row) => row.candidate_item_ids.length > 1), true)
  assert.equal(ambiguous.every((row) => row.final_item_id === null && row.final_disposition === 'REMOVE_TO_UNSUPPORTED'), true)
})

test('unique text alone was not treated as sufficient support', () => {
  const rows = readJsonl('clinical-expansion-v2/progress/GP_MAPPING_CORRECTION_LEDGER.jsonl')
  const unique = rows.filter((row) => row.reconstruction_method === 'persisted_previous_helper_output_unique_normalized_text')
  assert.equal(unique.length, 290)
  assert.equal(unique.every((row) => row.final_disposition === 'REMOVE_TO_UNSUPPORTED'), true)
})

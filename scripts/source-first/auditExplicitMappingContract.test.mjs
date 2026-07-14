import assert from 'node:assert/strict'
import test from 'node:test'
import { readJsonl } from './common.mjs'
import { runExplicitMappingAudit, scanStaticClinicalMappingSource } from './auditExplicitMappingContract.mjs'

const unsafeStaticFixtures = [
  ['alternate/text-wrapper.mjs', "export const renamed = (...args) => supportTexts(...args)"],
  ['alternate/normalizer.mjs', "function normalizeText(value) { return value.trim() }\nexport function mapItem(text) { return normalizeText(text) }"],
  ['alternate/computed.mjs', "const itemId='itemId'; const mapping = { [itemId]: 'x', sourceId: 's' }"],
  ['alternate/spread.mjs', "const shared = {}; const mapping = { ...shared, populationApplicability: 'x', settingApplicability: 'y' }"],
  ['alternate/writer.mjs', "research.legacy_item_support_mappings = mappings"],
  ['alternate/defaults.mjs', "const exact_texts = ['clinical text']"],
]

for (const [fileName, sourceText] of unsafeStaticFixtures) {
  test(`static guard rejects ${fileName}`, () => {
    assert.notEqual(scanStaticClinicalMappingSource(fileName, sourceText).length, 0)
  })
}

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
  assert.equal(result.persistedSupportedMappings, result.workflowSupportedMappings)
  assert.equal(result.persistedSupportedMappings, result.explicitMappingLedgerRecords)
  assert.equal(result.guardInspectedSupportedMappings, result.persistedSupportedMappings)
})

test('runtime guard includes all early GP workflows and all correction records', () => {
  const result = runExplicitMappingAudit()
  assert.equal(result.earlyGpWorkflowsInspected, 5)
  assert.equal(result.gpCorrectionRecordsInspected, 1164)
  assert.equal(result.numberedGpMappingsRemaining, 0)
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

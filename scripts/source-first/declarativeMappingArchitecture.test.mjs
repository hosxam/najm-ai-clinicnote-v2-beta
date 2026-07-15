import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { scanComputedMappingDataFlow } from './computedMappingDataFlow.mjs'
import { scanNoCodeGeneratedMappingSource } from './auditNoCodeGeneratedMappings.mjs'
import { validateResearchBatchMappingContract } from './researchBatchMappingContract.mjs'
import { verifyCanonicalMappingReconciliation } from './canonicalMappingReconciliation.mjs'

const fixtureRoot = path.resolve('scripts/source-first/.virtual-data-flow-fixtures')
const identity = "workflowId:'workflow-a',itemId:'item-a',sourceId:'source-a',sectionId:'section-a'"
const completeMapping = `{${identity},sourceHash:'${'a'.repeat(64)}',sectionHash:'${'b'.repeat(64)}',evidenceRelationship:'direct',populationApplicability:'population',settingApplicability:'setting',jurisdictionApplicability:'jurisdiction',uaeApplicability:'uae',applicabilityRationale:'rationale',supportStatus:'exact_section_supported',origin:'legacy_exact',mappingVersion:'1.0.0'}`

function entry(fileName, sourceText) {
  return { fileName: path.join(fixtureRoot, fileName), sourceText }
}

function assertGuardRejects(sourceText, message) {
  const errors = scanNoCodeGeneratedMappingSource('scripts/tools/fixture.mjs', sourceText, { forceProduction: true })
  assert.notEqual(errors.length, 0, message)
}

for (const [name, source] of [
  ['mapping literal', `export const mappings=[${completeMapping}]`],
  ['mapping spread', `const base={${identity}}; const mapping={...base,supportStatus:'exact_section_supported',sourceHash:'x'}`],
  ['mapping factory call', 'restoreCanonicalMappings(historical.support_groups)'],
  ['serializer import', "import '../source-first/writeCanonicalMapping.mjs'"],
  ['serializer query import', "import '../source-first/writeCanonicalMapping.mjs?unsafe=1'"],
  ['arbitrary active reader', "import { loadCanonicalMappings } from '../source-first/canonicalMappingStore.mjs'"],
]) {
  test(`${name} is rejected outside signed infrastructure`, () => assertGuardRejects(source))
}

test('candidate exemption requires exact proposal schema and no support fields', () => {
  const safeCandidate = `const proposal={workflowId:'w',itemId:'i',sourceId:'s',sectionId:'x',proposalRationale:'r',populationAssessment:'p',settingAssessment:'s',uaeAssessment:'u',proposalStatus:'candidate_pending_review'}`
  assert.deepEqual(scanNoCodeGeneratedMappingSource('scripts/tools/candidate.mjs', safeCandidate, { forceProduction: true }), [])
  assertGuardRejects(`const proposal={${identity},proposalRationale:'r',populationAssessment:'p',settingAssessment:'s',uaeAssessment:'u',proposalStatus:'candidate_pending_review',supportStatus:'exact_section_supported',origin:'legacy_exact'}`)
})

test('research completion cannot create support and candidate schema remains non-active', () => {
  assert.throws(() => validateResearchBatchMappingContract({ support_groups: [{ item_ids: ['item-a'] }] }), /historical-only/)
  assert.throws(() => validateResearchBatchMappingContract({ mappings: [] }), /mappings is prohibited/)
  const proposals = validateResearchBatchMappingContract({
    support_groups: [],
    candidate_item_evidence_proposals: [{
      workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a',
      proposalRationale: 'Separate synthetic proposal review.',
      populationAssessment: 'Population review required.',
      settingAssessment: 'Setting review required.',
      uaeAssessment: 'UAE review required.',
      proposalStatus: 'candidate_pending_review',
    }],
  })
  assert.equal(proposals.length, 1)
  assert.equal(Object.hasOwn(proposals[0], 'supportStatus'), false)
})

test('all direct filesystem mutation forms and split/imported canonical paths are rejected', () => {
  const cases = [
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; fs.writeFileSync(target,'x')",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; fs.promises.appendFile(target,'x')",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; fs.createWriteStream(target)",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; fs.copyFileSync('x',target)",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; await fs.promises.rename('x',target)",
    "const root='clinical-expansion-v2'; const a='canonical-'; const b='mappings'; fs.writeFileSync(path.join(root,a+b,'x.json'),'x')",
    "import { CANONICAL_MAPPING_DIRECTORY as target } from '../source-first/canonicalMappingContract.mjs'; fs.linkSync('x',path.join(target,'x.json'))",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; const fh=await fs.promises.open(target,'w'); await fh.write('x')",
    "const target='clinical-expansion-v2/canonical-mappings/x.json'; input.pipe(fs.createWriteStream(target))",
    "spawnSync('copy',['x','clinical-expansion-v2/canonical-mappings/x.json'])",
    "fs.writeFileSync('clinical-expansion-v2/supported-mappings/x.json','x')",
  ]
  for (const source of cases) assertGuardRejects(source, source)
})

test('unresolved local/default/named/dynamic/re-export/query/hash and unknown external imports fail closed', () => {
  const cases = [
    entry('unresolved/named.mjs', "import { value } from './missing.mjs'; export const mapping=value"),
    entry('unresolved/default.mjs', "import value from './missing.mjs'; export const mapping=value"),
    entry('unresolved/side-effect.mjs', "import './missing.mjs'; export const mapping={}"),
    entry('unresolved/dynamic.mjs', "export const mapping=await import('./missing.mjs')"),
    entry('unresolved/reexport.mjs', "export * from './missing.mjs'"),
    entry('unresolved/query.mjs', "import { value } from './source.mjs?raw'; export const mapping=value"),
    entry('unresolved/hash.mjs', "import value from './source.mjs#x'; export const mapping=value"),
    entry('unresolved/external.mjs', "import value from 'not-allowlisted'; export const mapping=value"),
    entry('unresolved/fake-node.mjs', "import 'node:not-a-real-builtin'; export const mapping={}"),
  ]
  for (const source of cases) {
    const result = scanComputedMappingDataFlow([source])
    assert.notEqual(result.errors.length, 0, source.fileName)
  }
})

test('export-star cycles terminate deterministically while unresolved members remain fail-closed', () => {
  const entries = [
    entry('cycle/a.mjs', "export * from './b.mjs'"),
    entry('cycle/b.mjs', "export * from './a.mjs'; export * from './missing.mjs'"),
    entry('cycle/use.mjs', "import { missing } from './a.mjs'; export const mapping=missing"),
  ]
  const first = scanComputedMappingDataFlow(entries)
  const second = scanComputedMappingDataFlow([...entries].reverse())
  assert.notEqual(first.errors.length, 0)
  assert.deepEqual(first.errors, second.errors)
})

test('production baseline independently reconciles at signed zero', () => {
  const result = verifyCanonicalMappingReconciliation()
  assert.deepEqual(
    [result.canonicalFiles, result.approvalManifest, result.persistedSupport, result.runtimeEmission, result.supportAccounting],
    [0, 0, 0, 0, 0],
  )
  assert.equal(result.unsupportedLegacyItems, 83303)
})

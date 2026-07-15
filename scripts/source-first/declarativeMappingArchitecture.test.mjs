import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  createCanonicalMappingViews,
  deriveUnsupportedLegacyRows,
  reconcileCanonicalMappingViews,
} from './canonicalMappingReconciliation.mjs'
import { scanComputedMappingDataFlow } from './computedMappingDataFlow.mjs'
import { scanNoCodeGeneratedMappingSource } from './auditNoCodeGeneratedMappings.mjs'
import { validateResearchBatchMappingContract } from './researchBatchMappingContract.mjs'
import {
  removeSyntheticCanonicalMappingFile,
  writeCanonicalMapping,
} from './writeCanonicalMapping.mjs'
import { createSyntheticCanonicalFixture } from './canonicalMappingFixture.test.mjs'

const fixtureRoot = path.resolve('scripts/source-first/.virtual-declarative-fixtures')
const identity = "workflowId:'workflow-a',itemId:'item-a',sourceId:'source-a',sectionId:'section-a'"
const completeMapping = `{${identity},sourceHash:'${'a'.repeat(64)}',sectionHash:'${'b'.repeat(64)}',evidenceRelationship:'direct',populationApplicability:'population',settingApplicability:'setting',jurisdictionApplicability:'jurisdiction',uaeApplicability:'uae',applicabilityRationale:'rationale',supportStatus:'exact_section_supported',origin:'legacy_exact',mappingVersion:'1.0.0'}`

function entry(fileName, sourceText) {
  return { fileName: path.join(fixtureRoot, fileName), sourceText }
}

function rejectedByArchitecture(name, fileName, sourceText) {
  test(`${name} cannot create active support`, () => {
    assert.notEqual(scanNoCodeGeneratedMappingSource(fileName, sourceText, { forceProduction: true }).length, 0)
  })
}

rejectedByArchitecture('mapping literal in a numbered batch', 'scripts/source-first/batches/batch-9990-9999.mjs', `export const mappings=[${completeMapping}]`)
rejectedByArchitecture('mapping literal in a non-numbered file', 'scripts/source-first/batches/custom.mjs', `export const mappings=[${completeMapping}]`)
rejectedByArchitecture('mapping outside batches', 'scripts/tools/mapping.mjs', `const active=${completeMapping}`)
rejectedByArchitecture('mapping returned by wrapper', 'scripts/tools/wrapper.mjs', `function wrap(){return ${completeMapping}}`)
rejectedByArchitecture('mapping assembled with spread', 'scripts/tools/spread.mjs', `const base={${identity}}; const mapping={...base,supportStatus:'exact_section_supported',sourceHash:'x'}`)
rejectedByArchitecture('mapping assembled with Object.assign', 'scripts/tools/assign.mjs', `const mapping=Object.assign({${identity}},{supportStatus:'exact_section_supported',sourceHash:'x'})`)
rejectedByArchitecture('mapping assembled through aliases', 'scripts/tools/alias.mjs', `const base={${identity}}; const alias=base; persistCanonicalMapping(alias)`)
rejectedByArchitecture('mapping created through a conditional', 'scripts/tools/conditional.mjs', `const mapping=condition?${completeMapping}:null`)
rejectedByArchitecture('mapping created through an array', 'scripts/tools/array.mjs', `const mappings=[${completeMapping}]`)
rejectedByArchitecture('mapping created through later property assignment', 'scripts/tools/later.mjs', `const mapping={${identity}}; mapping.supportStatus='exact_section_supported'; persistCanonicalMapping(mapping)`)
rejectedByArchitecture('mapping imported from another module', 'scripts/tools/imported.mjs', `import { mapping } from './source.mjs'; emitCanonicalMappings(mapping)`)
rejectedByArchitecture('mapping loaded through re-export', 'scripts/tools/reexport.mjs', `export { mapping } from './source.mjs'; persistCanonicalMapping(mapping)`)
rejectedByArchitecture('mapping emitted by dynamic import', 'scripts/tools/dynamic.mjs', `const module=await import('./mapping.mjs'); emitCanonicalMappings(module.mapping)`)
rejectedByArchitecture('mapping written directly into canonical directory', 'scripts/tools/direct-write.mjs', `const directory='clinical-expansion-v2/canonical-mappings'; writeFileSync(directory, JSON.stringify(${completeMapping}))`)
rejectedByArchitecture('mapping generated from historical helper output', 'scripts/tools/historical.mjs', 'const rows=historical.support_groups; restoreCanonicalMappings(rows)')
rejectedByArchitecture('mapping stored only in progress metadata', 'scripts/tools/progress.mjs', `const progress={activeMapping:${completeMapping}}`)
rejectedByArchitecture('mapping stored only in runtime cache', 'scripts/tools/cache.mjs', `runtimeCache.set('mapping',${completeMapping})`)
rejectedByArchitecture('canonical active reader imported by an arbitrary production module', 'scripts/tools/reader.mjs', `import { loadCanonicalMappings } from '../source-first/canonicalMappingStore.mjs'`)
rejectedByArchitecture('canonical serializer re-exported by an arbitrary production module', 'scripts/tools/reexport-serializer.mjs', `export { writeCanonicalMapping } from '../source-first/writeCanonicalMapping.mjs'`)
rejectedByArchitecture('canonical serializer dynamically imported by an arbitrary production module', 'scripts/tools/dynamic-serializer.mjs', `const writer=await import('../source-first/writeCanonicalMapping.mjs')`)

test('unavailable bare imported function and value fail closed', () => {
  const functionResult = scanComputedMappingDataFlow([entry('bare/function.mjs', `
    import { loadPart } from 'unavailable-clinical-mapping-package'
    const mapping={${identity},...loadPart()}
  `)])
  const valueResult = scanComputedMappingDataFlow([entry('bare/value.mjs', `
    import { mappingPart } from 'unavailable-clinical-mapping-package'
    const mapping={${identity},...mappingPart}
  `)])
  assert.match(functionResult.errors.join('\n'), /unresolved imported value/)
  assert.match(valueResult.errors.join('\n'), /unresolved imported value/)
})

test('unavailable bare side-effect import fails closed', () => {
  const result = scanComputedMappingDataFlow([entry('bare/side-effect.mjs', `
    import 'unavailable-clinical-mapping-package'
    const mapping={${identity}}
  `)])
  assert.match(result.errors.join('\n'), /unresolved side-effect import/)
})

test('export-star re-export cycle terminates deterministically and rejects the hazard', () => {
  const entries = [
    entry('cycle/hazard.mjs', "const field=getField(); export const fragment={ [field]:'x' }"),
    entry('cycle/a.mjs', "export * from './b.mjs'; export * from './hazard.mjs'"),
    entry('cycle/b.mjs', "export * from './a.mjs'"),
    entry('cycle/use.mjs', `import { fragment } from './a.mjs'; const mapping={${identity},...fragment}`),
  ]
  const first = scanComputedMappingDataFlow(entries)
  const second = scanComputedMappingDataFlow([...entries].reverse())
  assert.match(first.errors.join('\n'), /unresolved computed field/)
  assert.deepEqual(first.errors, second.errors)
})

test('research completion cannot directly create support but non-support candidates remain representable', () => {
  assert.throws(() => validateResearchBatchMappingContract({ support_groups: [{ item_ids: ['item-a'] }] }), /historical-only/)
  assert.throws(() => validateResearchBatchMappingContract({ mappings: [] }), /mappings is prohibited/)
  const proposals = validateResearchBatchMappingContract({
    support_groups: [],
    candidate_item_evidence_proposals: [{
      candidateId: 'candidate-1',
      workflowId: 'workflow-a',
      itemId: 'item-a',
      sourceId: 'source-a',
      sectionId: 'section-a',
      candidateStatus: 'candidate_pending_review',
      reviewRationale: 'Synthetic proposal requiring explicit separate review.',
    }],
  })
  assert.equal(proposals.length, 1)
  assert.equal(Object.hasOwn(proposals[0], 'supportStatus'), false)
})

test('equal totals with unequal keys fail reconciliation', () => {
  const fixture = createSyntheticCanonicalFixture()
  const other = { ...fixture.mapping, itemId: 'different-item' }
  assert.throws(() => reconcileCanonicalMappingViews({
    views: {
      canonicalJson: [fixture.mapping],
      persistedActive: [other],
      explicitLedger: [fixture.mapping],
      guardInspected: [fixture.mapping],
      runtimeEmitted: [fixture.mapping],
    },
  }), /missing=1 unexpected=1/)
})

test('approved serializer produces exact 1/1/1/1/1 reconciliation and cleanup returns 0/0/0/0/0', () => {
  const fixture = createSyntheticCanonicalFixture()
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-declarative-positive-'))
  writeCanonicalMapping(fixture.mapping, { directory, context: fixture.context, allowTestDirectory: true })
  const active = createCanonicalMappingViews({ directory, context: fixture.context })
  const one = reconcileCanonicalMappingViews({ views: active })
  assert.deepEqual(
    [one.canonicalJson, one.persistedActive, one.explicitLedger, one.guardInspected, one.runtimeEmitted],
    [1, 1, 1, 1, 1],
  )
  assert.equal(one.supportedMappings, 1)
  assert.equal(deriveUnsupportedLegacyRows([fixture.unsupportedRow], active.canonicalJson).length, 0)
  removeSyntheticCanonicalMappingFile(fixture.mapping.workflowId, { directory, allowTestDirectory: true })
  const cleaned = reconcileCanonicalMappingViews({
    views: createCanonicalMappingViews({ directory, context: fixture.context }),
  })
  assert.deepEqual(
    [cleaned.canonicalJson, cleaned.persistedActive, cleaned.explicitLedger, cleaned.guardInspected, cleaned.runtimeEmitted],
    [0, 0, 0, 0, 0],
  )
  assert.equal(deriveUnsupportedLegacyRows([fixture.unsupportedRow], []).length, 1)
  assert.deepEqual(fs.readdirSync(directory), [])
  fs.rmSync(directory, { recursive: true, force: true })
})

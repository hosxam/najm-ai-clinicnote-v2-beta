import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { readJsonl } from './common.mjs'
import {
  compareMappingSets,
  runExplicitMappingAudit,
  scanComputedMappingDataFlow,
  scanStaticClinicalMappingSource,
} from './auditExplicitMappingContract.mjs'
import { scanNoCodeGeneratedMappingSource } from './auditNoCodeGeneratedMappings.mjs'

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

const computedPropertyGuardProbes = [
  [
    'shorthand computed applicability variable',
    'alternate/shorthand-computed.mjs',
    'const field = "uaeApplicability"; const mapping = { [field]: value, workflowId, itemId, sourceId, sectionId, evidenceRelationship }',
  ],
  [
    'direct computed protected string without companion identity fields',
    'alternate/direct-computed.mjs',
    'const metadata = { ["uaeApplicability"]: value }',
  ],
  [
    'computed protected variable alias',
    'alternate/alias-computed.mjs',
    'const requiredFieldName = "supportStatus"; const fieldAlias = requiredFieldName; const mapping = { [fieldAlias]: value, workflowId, itemId, sourceId, sectionId }',
  ],
  [
    'unresolved computed key in mapping-like object',
    'alternate/unresolved-computed.mjs',
    'const mapping = { [getClinicalField()]: value, workflowId, itemId, sourceId, sectionId }',
  ],
  [
    'computed mapping identity field',
    'alternate/computed-identity.mjs',
    'const workflowField = "workflowId"; const mapping = { [workflowField]: workflowId, itemId, sourceId, sectionId }',
  ],
  [
    'nested computed applicability field',
    'alternate/nested-computed.mjs',
    'const field = "uaeApplicability"; const mapping = { workflowId, itemId, sourceId, sectionId, applicability: { [field]: value } }',
  ],
  [
    'computed property after statically resolvable identity spread',
    'alternate/spread-computed.mjs',
    'const base = { workflowId, itemId, sourceId, sectionId }; const field = "uaeApplicability"; const record = { ...base, [field]: value }',
  ],
  [
    'computed property in wrapper return',
    'alternate/wrapper-computed.mjs',
    'const field = "uaeApplicability"; function createRecord() { return { [field]: value, workflowId, itemId, sourceId, sectionId }; }',
  ],
  [
    'template-generated computed protected key',
    'alternate/template-computed.mjs',
    'const suffix = "Applicability"; const mapping = { [`uae${suffix}`]: value, workflowId, itemId, sourceId, sectionId }',
  ],
  [
    'computed property in exported array',
    'alternate/exported-array-computed.mjs',
    'const field = "supportStatus"; export const records = [{ [field]: value, workflowId, itemId, sourceId, sectionId }]',
  ],
  [
    'computed property in dynamically imported clinical module',
    'alternate/dynamic-clinical-mapping-module.mjs',
    'export default function loadClinicalMapping() { return { [resolveField()]: value, workflowId, itemId, sourceId, sectionId }; }',
  ],
]

for (const [name, fileName, sourceText] of computedPropertyGuardProbes) {
  test(`computed-property guard ${name} fails closed`, () => {
    assert.match(
      scanStaticClinicalMappingSource(fileName, sourceText).join('\n'),
      /computed clinical mapping propert(?:y|ies) (?:is|are) prohibited/,
    )
  })
}

test('nonclinical computed property outside mapping context is accepted', () => {
  const sourceText = 'const field = "theme"; const metadata = { [field]: "dark", displayName: "Night mode" }'
  assert.deepEqual(scanStaticClinicalMappingSource('ui/theme-metadata.mjs', sourceText), [])
})

const dataFlowFixtureRoot = path.resolve('scripts/source-first/.virtual-data-flow-fixtures')
const mappingIdentityDeclarations = "const workflowId='workflow-a',itemId='item-a',sourceId='source-a',sectionId='section-a';"
const dynamicFieldDeclarations = "const field=getFieldAtRuntime(),value='value';"

function fixtureEntry(fileName, sourceText) {
  return { fileName: path.join(dataFlowFixtureRoot, fileName), sourceText }
}

function rejectsComputedFlow(name, entries, expectedReason = /unresolved computed field reaches clinical mapping sink/) {
  test(`data-flow guard ${name} rejects the intended mapping hazard`, () => {
    const result = scanComputedMappingDataFlow(entries)
    assert.match(result.errors.join('\n'), expectedReason)
  })
}

rejectsComputedFlow('pre-bound object spread', [fixtureEntry('pre-bound-spread.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = { [field]: value }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
`)])

rejectsComputedFlow('pre-bound nested object', [fixtureEntry('pre-bound-nested.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = { [field]: value }
  const mapping = { workflowId, itemId, sourceId, sectionId, applicability: dynamicPart }
`)])

rejectsComputedFlow('mapping-function argument', [fixtureEntry('mapping-argument.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = { [field]: value }
  createCanonicalMapping({ workflowId, itemId, sourceId, sectionId }, dynamicPart)
`)])

rejectsComputedFlow('one-hop alias', [fixtureEntry('one-hop-alias.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const original = { [field]: value }
  const alias = original
  const mapping = { workflowId, itemId, sourceId, sectionId, ...alias }
`)])

rejectsComputedFlow('multi-hop alias', [fixtureEntry('multi-hop-alias.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const original = { [field]: value }
  const aliasOne = original
  const aliasTwo = aliasOne
  const mapping = { workflowId, itemId, sourceId, sectionId, ...aliasTwo }
`)])

rejectsComputedFlow('wrapper return', [fixtureEntry('wrapper-return.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  function buildApplicability() { return { [field]: value } }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...buildApplicability() }
`)])

rejectsComputedFlow('function parameter propagation', [fixtureEntry('function-parameter.mjs', `
  ${dynamicFieldDeclarations}
  function createMapping(extra) {
    return { workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a', ...extra }
  }
  createMapping({ [field]: value })
`)], /(?:wrapper invokes clinical mapping sink|unresolved computed field reaches clinical mapping sink)/)

rejectsComputedFlow('named imported hazard', [
  fixtureEntry('named-import/hazard.mjs', `${dynamicFieldDeclarations} export const dynamicPart = { [field]: value }`),
  fixtureEntry('named-import/mapping.mjs', `
    import { dynamicPart } from './hazard.mjs'
    ${mappingIdentityDeclarations}
    const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
  `),
])

rejectsComputedFlow('default-exported hazard', [
  fixtureEntry('default-import/hazard.mjs', `${dynamicFieldDeclarations} export default { [field]: value }`),
  fixtureEntry('default-import/mapping.mjs', `
    import dynamicPart from './hazard.mjs'
    ${mappingIdentityDeclarations}
    const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
  `),
])

rejectsComputedFlow('Object.assign hazard', [fixtureEntry('object-assign.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = { [field]: value }
  const mapping = Object.assign({ workflowId, itemId, sourceId, sectionId }, dynamicPart)
`)])

rejectsComputedFlow('array-mediated hazard', [fixtureEntry('array-mediated.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const fragments = [{ [field]: value }]
  const mapping = { workflowId, itemId, sourceId, sectionId, ...fragments[0] }
`)])

rejectsComputedFlow('nested alias and spread', [fixtureEntry('nested-alias.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = { [field]: value }
  const container = { applicability: dynamicPart }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...container }
`)])

rejectsComputedFlow('conditional hazard', [fixtureEntry('conditional.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = condition ? { [field]: value } : safeValue
  const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
`)])

rejectsComputedFlow('logical-expression hazard', [fixtureEntry('logical.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = provided || { [field]: value }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
`)])

rejectsComputedFlow('later property-assignment hazard', [fixtureEntry('later-assignment.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const dynamicPart = {}
  dynamicPart[field] = value
  const mapping = { workflowId, itemId, sourceId, sectionId, ...dynamicPart }
`)], /later unresolved computed assignment reaches clinical mapping sink/)

rejectsComputedFlow('dynamically imported hazard', [
  fixtureEntry('dynamic-import/hazard.mjs', `${dynamicFieldDeclarations} export const dynamicPart = { [field]: value }`),
  fixtureEntry('dynamic-import/mapping.mjs', `
    ${mappingIdentityDeclarations}
    const loaded = await import('./hazard.mjs')
    const mapping = { workflowId, itemId, sourceId, sectionId, ...loaded.dynamicPart }
  `),
])

rejectsComputedFlow('renamed imported wrapper', [
  fixtureEntry('renamed-wrapper/factory.mjs', `
    export function build(extra) {
      return { workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a', ...extra }
    }
  `),
  fixtureEntry('renamed-wrapper/use.mjs', `
    import { build as renamedWrapper } from './factory.mjs'
    ${dynamicFieldDeclarations}
    renamedWrapper({ [field]: value })
  `),
], /(?:wrapper invokes clinical mapping sink|unresolved computed field reaches clinical mapping sink)/)

rejectsComputedFlow('locally aliased wrapper', [fixtureEntry('renamed-wrapper/local-alias.mjs', `
  ${dynamicFieldDeclarations}
  function build(extra) {
    return { workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a', ...extra }
  }
  const renamedWrapper = build
  renamedWrapper({ [field]: value })
`)], /(?:wrapper invokes clinical mapping sink|unresolved computed field reaches clinical mapping sink)/)

rejectsComputedFlow('named re-export hazard', [
  fixtureEntry('re-export/hazard.mjs', `${dynamicFieldDeclarations} export const dynamicPart = { [field]: value }`),
  fixtureEntry('re-export/barrel.mjs', `export { dynamicPart as fragment } from './hazard.mjs'`),
  fixtureEntry('re-export/alternate/source-first/mapping.mjs', `
    import { fragment } from '../../barrel.mjs'
    ${mappingIdentityDeclarations}
    const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }
  `),
])

rejectsComputedFlow('alternate-directory hazard', [fixtureEntry('tools/alternate/clinical-mapping-writer.mts', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const fragment = { [field]: value }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }
`)])

rejectsComputedFlow('runtime-only mapping sink', [fixtureEntry('runtime/emitter.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const fragment = { [field]: value }
  emitRuntimeMapping({ workflowId, itemId, sourceId, sectionId }, fragment)
`)])

rejectsComputedFlow('persisted-only mapping sink', [fixtureEntry('persistence/writer.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const fragment = { [field]: value }
  persistCanonicalMapping({ workflowId, itemId, sourceId, sectionId }, fragment)
`)])

rejectsComputedFlow('hazard concealed behind equal mapping totals', [fixtureEntry('equal-totals.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  const fragment = { [field]: value }
  const runtimeMappings = [{ workflowId, itemId, sourceId, sectionId, ...fragment }]
  const persistedMappings = [{ workflowId, itemId, sourceId, sectionId }]
  compareMappingTotals(runtimeMappings.length, persistedMappings.length)
`)])

rejectsComputedFlow('cyclic aliases', [fixtureEntry('cycles/aliases.mjs', `
  ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
  let aliasOne
  let aliasTwo = aliasOne
  aliasOne = aliasTwo
  aliasOne = { [field]: value }
  const mapping = { workflowId, itemId, sourceId, sectionId, ...aliasTwo }
`)])

rejectsComputedFlow('mutually recursive wrappers', [fixtureEntry('cycles/mutual-wrappers.mjs', `
  ${dynamicFieldDeclarations}
  function first(extra) { return second(extra) }
  function second(extra) {
    return condition ? first(extra) : {
      workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a', ...extra,
    }
  }
  first({ [field]: value })
`)], /(?:wrapper invokes clinical mapping sink|unresolved computed field reaches clinical mapping sink)/)

rejectsComputedFlow('circular imports', [
  fixtureEntry('cycles/circular-a.mjs', `
    import { consume } from './circular-b.mjs'
    ${dynamicFieldDeclarations}
    export const dynamicPart = { [field]: value }
    export const run = () => consume(dynamicPart)
  `),
  fixtureEntry('cycles/circular-b.mjs', `
    import { dynamicPart } from './circular-a.mjs'
    export function consume(extra) {
      return { workflowId: 'workflow-a', itemId: 'item-a', sourceId: 'source-a', sectionId: 'section-a', ...extra }
    }
    consume(dynamicPart)
  `),
], /(?:wrapper invokes clinical mapping sink|unresolved computed field reaches clinical mapping sink)/)

test('data-flow guard produces stable diagnostics across repeated execution', () => {
  const entries = [fixtureEntry('determinism/repeated.mjs', `
    ${mappingIdentityDeclarations} ${dynamicFieldDeclarations}
    const fragment = { [field]: value }
    const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }
  `)]
  assert.deepEqual(scanComputedMappingDataFlow(entries), scanComputedMappingDataFlow(entries))
})

test('data-flow guard is independent of file-discovery order', () => {
  const entries = [
    fixtureEntry('determinism/hazard.mjs', `${dynamicFieldDeclarations} export const fragment = { [field]: value }`),
    fixtureEntry('determinism/mapping.mjs', `
      import { fragment } from './hazard.mjs'
      ${mappingIdentityDeclarations}
      const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }
    `),
  ]
  assert.deepEqual(
    scanComputedMappingDataFlow(entries).errors,
    scanComputedMappingDataFlow([...entries].reverse()).errors,
  )
})

test('data-flow guard fails closed on parse failure with a clear diagnostic', () => {
  const result = scanComputedMappingDataFlow([fixtureEntry('parse-failure.mjs', `
    ${mappingIdentityDeclarations}
    const mapping = { workflowId, itemId, sourceId, sectionId, [field]: }
  `)])
  assert.match(result.errors.join('\n'), /AST parse failure prevents fail-closed mapping analysis/)
})

test('data-flow guard accepts a provably disconnected local nonclinical computed object', () => {
  const result = scanComputedMappingDataFlow([fixtureEntry('safe/local-ui.mjs', `
    const key = getDisplayKey()
    const uiConfig = { [key]: 'Example' }
    renderUi(uiConfig)
  `)])
  assert.deepEqual(result.errors, [])
})

test('data-flow guard accepts a provably disconnected imported nonclinical computed object', () => {
  const result = scanComputedMappingDataFlow([
    fixtureEntry('safe/imported-ui.mjs', `const key = getDisplayKey(); export const uiConfig = { [key]: 'Example' }`),
    fixtureEntry('safe/use-ui.mjs', `
      import { uiConfig } from './imported-ui.mjs'
      renderUi(uiConfig)
      ${mappingIdentityDeclarations}
      const mapping = { workflowId, itemId, sourceId, sectionId }
    `),
  ])
  assert.deepEqual(result.errors, [])
})

test('general data-flow analysis is not the authority: a literal mapping is rejected by the declarative architecture guard', () => {
  const sourceText = `
    const mapping = {
      workflowId: 'workflow-a',
      itemId: 'item-a',
      sourceId: 'source-a',
      sectionId: 'section-a',
      sourceHash: '${'a'.repeat(64)}',
      sectionHash: '${'b'.repeat(64)}',
      evidenceRelationship: 'direct',
      populationApplicability: 'population',
      settingApplicability: 'setting',
      uaeApplicability: 'uae',
      applicabilityRationale: 'rationale',
      supportStatus: 'exact_section_supported',
      origin: 'legacy_exact',
      mappingVersion: '1.0.0',
    }
    emitCanonicalMappings([mapping])
  `
  assert.deepEqual(scanComputedMappingDataFlow([fixtureEntry('safe/canonical.mjs', sourceText)]).errors, [])
  assert.notEqual(scanNoCodeGeneratedMappingSource('scripts/tools/canonical.mjs', sourceText, { forceProduction: true }).length, 0)
})

test('data-flow guard rejects unavailable bare imports', () => {
  const result = scanComputedMappingDataFlow([fixtureEntry('bare/unavailable.mjs', `
    import { fragment } from 'unavailable-clinical-mapping-module'
    ${mappingIdentityDeclarations}
    const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }
  `)])
  assert.match(result.errors.join('\n'), /unresolved imported value/)
})

test('data-flow guard terminates safely on export-star cycles', () => {
  const entries = [
    fixtureEntry('export-star/hazard.mjs', `${dynamicFieldDeclarations} export const fragment = { [field]: value }`),
    fixtureEntry('export-star/a.mjs', `export * from './b.mjs'; export * from './hazard.mjs'`),
    fixtureEntry('export-star/b.mjs', `export * from './a.mjs'`),
    fixtureEntry('export-star/use.mjs', `import { fragment } from './a.mjs'; ${mappingIdentityDeclarations} const mapping = { workflowId, itemId, sourceId, sectionId, ...fragment }`),
  ]
  const result = scanComputedMappingDataFlow(entries)
  assert.match(result.errors.join('\n'), /unresolved computed field/)
  assert.deepEqual(result.errors, scanComputedMappingDataFlow([...entries].reverse()).errors)
})

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
  const computedSource = 'const field = "itemId"; const mapping = { [field]: "item-b", workflowId: "workflow-a", sourceId: "source-a", sectionId: "section-a" }'
  assert.notEqual(scanStaticClinicalMappingSource('alternate/equal-total-computed.mjs', computedSource).length, 0)
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

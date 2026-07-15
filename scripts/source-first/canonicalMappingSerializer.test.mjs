import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import {
  approveRawCanonicalMapping,
  removeRawCanonicalMapping,
} from './canonicalMappingTransaction.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'
import {
  createSignedTestHarness,
  exactRemovalBytes,
  rawMappingBytes,
} from './canonicalMappingTestHarness.mjs'
import { sha256 } from './common.mjs'

function storeSnapshot(harness) {
  return Object.fromEntries(fs.readdirSync(harness.directory).sort().map((name) => [name, fs.readFileSync(path.join(harness.directory, name))]))
}

function addSecondSyntheticMapping(harness) {
  const originalItemId = harness.fixture.mapping.itemId
  const itemId = originalItemId.replace(/item-1$/, 'item-2')
  const item = { ...harness.fixture.item, item_id: itemId, text: 'Second synthetic documentation item' }
  harness.fixture.workflow.content_sections.synthetic_history.push(item)
  harness.environment.context.itemsByWorkflowId.get(harness.fixture.mapping.workflowId).set(itemId, item)
  return Object.fromEntries(Object.entries(harness.fixture.mapping).map(([field, value]) => [
    field,
    typeof value === 'string' ? value.replaceAll(originalItemId, itemId) : value,
  ]))
}

test('raw serializer approves one mapping and signed removal returns to empty', (t) => {
  const harness = createSignedTestHarness(t)
  const approved = approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  assert.equal(approved.action, 'approved')
  assert.equal(approved.active.mappings.length, 1)
  assert.equal(loadCanonicalMappings(harness.environment).length, 1)
  const removed = removeRawCanonicalMapping(exactRemovalBytes(harness.fixture.mapping), harness.environment)
  assert.equal(removed.action, 'removed')
  assert.equal(removed.active.mappings.length, 0)
  assert.deepEqual(fs.readdirSync(harness.directory).sort(), ['.gitkeep', 'APPROVED_MANIFEST.json', 'APPROVED_MANIFEST.sig'])
})

test('identical reordered replay is a true no-op', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const before = storeSnapshot(harness)
  const replay = approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping, { reverseFields: true, trailingNewline: false }), harness.environment)
  const after = storeSnapshot(harness)
  assert.equal(replay.noOp, true)
  assert.equal(replay.action, 'identical-replay')
  assert.deepEqual(after, before)
})

test('approval order cannot control canonical mapping-array order', (t) => {
  const forward = createSignedTestHarness(t)
  const forwardSecond = addSecondSyntheticMapping(forward)
  approveRawCanonicalMapping(rawMappingBytes(forward.fixture.mapping), forward.environment)
  approveRawCanonicalMapping(rawMappingBytes(forwardSecond), forward.environment)

  const reverse = createSignedTestHarness(t)
  const reverseSecond = addSecondSyntheticMapping(reverse)
  approveRawCanonicalMapping(rawMappingBytes(reverseSecond), reverse.environment)
  approveRawCanonicalMapping(rawMappingBytes(reverse.fixture.mapping), reverse.environment)

  const fileName = `${forward.fixture.mapping.workflowId}.json`
  assert.deepEqual(
    fs.readFileSync(path.join(forward.directory, fileName)),
    fs.readFileSync(path.join(reverse.directory, fileName)),
  )
})

test('conflicting exact-key replay fails closed without changing signed state', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const before = storeSnapshot(harness)
  const conflict = { ...harness.fixture.mapping, evidenceRelationship: `${harness.fixture.mapping.evidenceRelationship} Conflicting.` }
  assert.throws(() => approveRawCanonicalMapping(rawMappingBytes(conflict), harness.environment), /conflicting mapping replay/)
  assert.deepEqual(storeSnapshot(harness), before)
})

test('conflicting source, section, rationale, and hash requests fail closed', (t) => {
  const harness = createSignedTestHarness(t)
  approveRawCanonicalMapping(rawMappingBytes(harness.fixture.mapping), harness.environment)
  const before = storeSnapshot(harness)
  const section = {
    section_id: 'synthetic-source-two--section-2',
    heading: 'Alternative synthetic section',
    locator: 'synthetic fixture only',
    evidence_summary: 'Alternative synthetic evidence for conflict testing only.',
  }
  const source = {
    source_id: 'synthetic-source-two',
    exact_document_title: 'Alternative synthetic source',
    exact_sections: [section],
  }
  harness.environment.context.sourcesById.set(source.source_id, source)
  harness.environment.context.reviewedSourceIds.add(source.source_id)
  harness.environment.context.reviewedSectionIds.add(section.section_id)
  const research = harness.environment.context.researchByWorkflowId.get(harness.fixture.mapping.workflowId)
  research.exact_documents_opened.push(source.source_id)
  research.exact_sections_reviewed.push(section.section_id)
  const alternate = Object.fromEntries(Object.entries(harness.fixture.mapping).map(([field, value]) => [
    field,
    typeof value === 'string'
      ? value.replaceAll(harness.fixture.mapping.sectionId, section.section_id).replaceAll(harness.fixture.mapping.sourceId, source.source_id)
      : value,
  ]))
  alternate.sourceId = source.source_id
  alternate.sectionId = section.section_id
  alternate.sourceHash = sha256(source)
  alternate.sectionHash = sha256(section)
  const identity = `${alternate.workflowId} ${alternate.itemId} ${alternate.sourceId} ${alternate.sectionId}`
  alternate.populationApplicability = `${identity}: the synthetic adult population remains limited to this test and excludes children, pregnancy, and every real clinical population.`
  alternate.settingApplicability = `${identity}: the synthetic outpatient setting remains test-only and excludes emergency, inpatient, procedural, and remote-care use.`
  alternate.jurisdictionApplicability = `${identity}: the synthetic jurisdiction has no authority; UAE and other local legal, pathway, and scope decisions remain excluded.`
  alternate.uaeApplicability = `${identity}: UAE applicability is absent in this synthetic test; local clinical, legal, prescribing, and service limitations remain excluded.`
  alternate.applicabilityRationale = `${identity}: this alternative synthetic mapping records adult population limits, outpatient setting limits, UAE and local jurisdiction limits, and excludes all real management, investigation, prescribing, referral, and treatment use.`
  assert.throws(() => approveRawCanonicalMapping(rawMappingBytes(alternate), harness.environment), /conflicting mapping already exists/)
  assert.throws(() => approveRawCanonicalMapping(rawMappingBytes({ ...harness.fixture.mapping, sourceHash: '0'.repeat(64) }), harness.environment), /valid-source-hash/)
  assert.deepEqual(storeSnapshot(harness), before)
})

test('approval boundary accepts bytes only and never executes accessors', (t) => {
  const harness = createSignedTestHarness(t)
  let getterExecuted = false
  const value = {}
  Object.defineProperty(value, 'workflowId', { enumerable: true, get() { getterExecuted = true; return 'unsafe' } })
  assert.throws(() => approveRawCanonicalMapping(value, harness.environment), /raw JSON bytes only/)
  assert.equal(getterExecuted, false)
})

test('CLI module exposes no mapping factory exports', async () => {
  const module = await import(`./writeCanonicalMapping.mjs?direct-import-test=${Date.now()}`)
  assert.deepEqual(Object.keys(module), [])
})

test('CLI-only approval and signed removal operate from raw external files', (t) => {
  const harness = createSignedTestHarness(t)
  const approvalInput = path.join(harness.root, 'approval-input.json')
  const removalInput = path.join(harness.root, 'removal-input.json')
  fs.writeFileSync(approvalInput, rawMappingBytes(harness.fixture.mapping, { reverseFields: true }))
  fs.writeFileSync(removalInput, exactRemovalBytes(harness.fixture.mapping))
  const approve = spawnSync(process.execPath, ['scripts/source-first/writeCanonicalMapping.mjs', '--input', approvalInput], {
    cwd: path.resolve('.'), env: harness.processEnvironment, encoding: 'utf8', windowsHide: true,
  })
  assert.equal(approve.status, 0, approve.stderr)
  assert.equal(JSON.parse(approve.stdout).mappingCount, 1)
  const remove = spawnSync(process.execPath, ['scripts/source-first/removeCanonicalMapping.mjs', '--input', removalInput], {
    cwd: path.resolve('.'), env: harness.processEnvironment, encoding: 'utf8', windowsHide: true,
  })
  assert.equal(remove.status, 0, remove.stderr)
  assert.equal(JSON.parse(remove.stdout).mappingCount, 0)
})

test('failed approval leaves no temporary, staging, backup, or lock files', (t) => {
  const harness = createSignedTestHarness(t)
  assert.throws(() => approveRawCanonicalMapping(Buffer.from('{"workflowId":'), harness.environment), /malformed (?:strict JSON|JSON structure)/)
  const parentEntries = fs.readdirSync(harness.root)
  assert.equal(parentEntries.some((name) => /\.stage\.|\.backup\.|\.lock$|\.tmp$/.test(name)), false)
})

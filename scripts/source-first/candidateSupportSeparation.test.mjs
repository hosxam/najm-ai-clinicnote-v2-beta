import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  readCandidateProposalDocument,
  validateCandidateMappingProposals,
  writeCandidateProposalDocument,
} from './candidateMappingProposalStore.mjs'
import { loadCanonicalMappings } from './canonicalMappingStore.mjs'
import { deriveUnsupportedLegacyRows } from './canonicalMappingReconciliation.mjs'
import { createSignedTestHarness } from './canonicalMappingTestHarness.mjs'

function proposal(fixture) {
  return {
    workflowId: fixture.mapping.workflowId,
    itemId: fixture.mapping.itemId,
    sourceId: fixture.mapping.sourceId,
    sectionId: fixture.mapping.sectionId,
    proposalRationale: 'Synthetic candidate rationale only; this does not approve, activate, or establish clinical support.',
    populationAssessment: 'Synthetic population assessment requiring separate clinician and signing review.',
    settingAssessment: 'Synthetic setting assessment requiring separate clinician and signing review.',
    uaeAssessment: 'Synthetic UAE assessment requiring separate clinician and signing review.',
    proposalStatus: 'candidate_pending_review',
  }
}

test('candidate proposal uses a distinct non-active schema and directory', (t) => {
  const harness = createSignedTestHarness(t)
  const directory = path.join(harness.root, 'candidate-mapping-proposals')
  const value = proposal(harness.fixture)
  const filePath = writeCandidateProposalDocument(value.workflowId, [value], { directory })
  const document = readCandidateProposalDocument(filePath)
  assert.equal(document.proposals.length, 1)
  assert.equal(Object.hasOwn(document.proposals[0], 'supportStatus'), false)
  assert.equal(loadCanonicalMappings(harness.environment).length, 0)
  assert.equal(deriveUnsupportedLegacyRows([harness.fixture.unsupportedRow], []).length, 1)
})

test('canonical mapping shape disguised as a candidate fails closed', (t) => {
  const harness = createSignedTestHarness(t)
  assert.throws(() => validateCandidateMappingProposals([{
    ...proposal(harness.fixture),
    ...harness.fixture.mapping,
  }]), /active-support fields are prohibited|exact non-active proposal schema/)
})

test('candidate files are never consumed by the signed canonical loader', (t) => {
  const harness = createSignedTestHarness(t)
  const candidateDirectory = path.join(harness.root, 'candidate-mapping-proposals')
  writeCandidateProposalDocument(harness.fixture.mapping.workflowId, [proposal(harness.fixture)], { directory: candidateDirectory })
  assert.equal(fs.readdirSync(candidateDirectory).length, 1)
  assert.deepEqual(fs.readdirSync(harness.directory).sort(), ['.gitkeep', 'APPROVED_MANIFEST.json', 'APPROVED_MANIFEST.sig'])
  assert.equal(loadCanonicalMappings(harness.environment).length, 0)
})

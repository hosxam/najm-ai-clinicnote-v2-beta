import test from 'node:test'
import assert from 'node:assert/strict'
import { composeEvidenceCoverage } from './sourceAcceptance.mjs'

test('composes complete coverage across multiple official sources', () => {
  const result = composeEvidenceCoverage({
    requiredSections: ['history', 'examination', 'management', 'follow_up'],
    sources: [
      { source_id: 'official-history', official_url: 'https://www.nice.org.uk/guidance/example', accessible_full_content: true, coverage_sections: ['history', 'examination'] },
      { source_id: 'official-management', official_url: 'https://www.gov.uk/example', accessible_full_content: true, coverage_sections: ['management', 'follow_up'] },
    ],
  })
  assert.equal(result.complete, true)
  assert.deepEqual(result.missing_sections, [])
  assert.deepEqual(result.accepted_sources, ['official-history', 'official-management'])
})

test('does not infer a missing section from an accepted source', () => {
  const result = composeEvidenceCoverage({
    requiredSections: ['history', 'assessment'],
    sources: [{ source_id: 'official-history', official_url: 'https://www.nice.org.uk/guidance/example', coverage_sections: ['history'] }],
  })
  assert.equal(result.complete, false)
  assert.deepEqual(result.missing_sections, ['assessment'])
})

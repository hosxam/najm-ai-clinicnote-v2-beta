import test from 'node:test'
import assert from 'node:assert/strict'
import { classifySourceAcceptance } from './sourceAcceptance.mjs'

test('accepts broad official guidance without workflow-title matching', () => {
  const result = classifySourceAcceptance({ official_url: 'https://www.nice.org.uk/guidance/ng120/chapter/recommendations', accessible_full_content: true }, { populationMatch: true, settingMatch: true })
  assert.equal(result.accepted, true)
  assert.equal(result.mapping_required, true)
})

test('rejects commercial or blog content', () => {
  assert.equal(classifySourceAcceptance({ official_url: 'https://example.com/clinical-blog', accessible_full_content: true }).accepted, false)
})

test('rejects inaccessible full content', () => {
  assert.equal(classifySourceAcceptance({ official_url: 'https://www.nice.org.uk/guidance/ng120', accessible_full_content: false }).accepted, false)
})

test('keeps duplicate detection separate from acceptance', () => {
  const result = classifySourceAcceptance({ source_id: 'known', official_url: 'https://www.nice.org.uk/guidance/ng120' }, { existingSourceIds: ['known'] })
  assert.equal(result.accepted, true)
  assert.equal(result.duplicate, true)
})

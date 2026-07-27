import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd(); const progress = path.join(root, 'clinical-expansion-v2/progress/family-wave6'); const targetRows = JSON.parse(fs.readFileSync(path.join(root, 'clinical-expansion-v2/progress/family-wave5/WAVE5_WORKFLOW_TARGETS.json'), 'utf8')).targets
const selected = []; const families = new Set()
for (const target of targetRows) {
  const workflow = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/interactive-workflows/workflows', `${target.workflow_id}.json`), 'utf8'))
  const usable = workflow.fields.some(field => field.field_type === 'vital_sign') && workflow.fields.some(field => field.section === 'examination') && workflow.fields.some(field => field.field_type === 'investigation_result')
  if (!usable) continue
  if (!families.has(target.family_id)) { selected.push(target); families.add(target.family_id) }
  if (selected.length >= 20) break
}
for (const target of targetRows) {
  if (selected.length >= 20) break
  if (selected.some(item => item.workflow_id === target.workflow_id)) continue
  const workflow = JSON.parse(fs.readFileSync(path.join(root, 'public/data-beta/interactive-workflows/workflows', `${target.workflow_id}.json`), 'utf8'))
  if (workflow.fields.some(field => field.field_type === 'vital_sign') && workflow.fields.some(field => field.section === 'examination') && workflow.fields.some(field => field.field_type === 'investigation_result')) selected.push(target)
}
const fixtures = selected.slice(0, 20).map((target, index) => ({ fixture_id: `wave5-adversarial-${String(index + 1).padStart(2, '0')}`, workflow_id: target.workflow_id, family_id: target.family_id, quick_input: { history: `specific history ${target.workflow_id}`, negatives: 'explicitly absent', vitals: { temperature: 37.2, heart_rate: 78 }, examination: `specific examination ${target.workflow_id}`, investigation: `specific result ${target.workflow_id}`, medication: 'none selected', suggestion_confirmation: false }, advanced_input: { workflow_specific_field: `confirmed ${target.workflow_id}`, contradiction_pair: ['absent', 'present'], sibling_field: 'must remain absent' }, assertions: ['workflow-specific history survives', 'workflow-specific red flags survive', 'vital values survive', 'examination findings survive', 'investigation values survive', 'explicit negatives survive', 'unselected fields absent', 'suggestions unconfirmed absent', 'contradictions rejected', 'sibling fields absent', 'outputs differ', 'Quick useful', 'Advanced complete'] }))
fs.writeFileSync(path.join(progress, 'WAVE5_ADVERSARIAL_FIXTURES.json'), `${JSON.stringify({ schema_version: '1.0.0', fixture_count: fixtures.length, fixtures }, null, 2)}\n`)
console.log(JSON.stringify({ fixture_count: fixtures.length, families: [...new Set(fixtures.map(fixture => fixture.family_id))] }, null, 2))

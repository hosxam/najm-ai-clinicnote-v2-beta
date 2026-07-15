import assert from 'node:assert/strict'
import test from 'node:test'
import { scanNoCodeGeneratedMappingSource } from './auditNoCodeGeneratedMappings.mjs'

const attempts = [
  ['writeFile', "writeFile('clinical-expansion-v2/canonical-mappings/x.json','x')"],
  ['appendFileSync', "appendFileSync('clinical-expansion-v2/canonical-mappings/x.json','x')"],
  ['createWriteStream', "createWriteStream('clinical-expansion-v2/canonical-mappings/x.json')"],
  ['copyFile', "copyFile('x','clinical-expansion-v2/canonical-mappings/x.json',callback)"],
  ['cpSync', "cpSync('x','clinical-expansion-v2/canonical-mappings/x.json')"],
  ['rename', "rename('x','clinical-expansion-v2/canonical-mappings/x.json',callback)"],
  ['link', "link('x','clinical-expansion-v2/canonical-mappings/x.json',callback)"],
  ['symlinkSync', "symlinkSync('x','clinical-expansion-v2/canonical-mappings/x.json')"],
  ['split path', "const a='clinical-expansion-v2';const b='canonical-';const c='mappings';writeFileSync(path.join(a,b+c,'x.json'),'x')"],
  ['imported path constant', "import {CANONICAL_MAPPING_DIRECTORY as target} from './canonicalMappingContract.mjs';renameSync('x',path.join(target,'x.json'))"],
]

for (const [name, source] of attempts) {
  test(`${name} cannot bypass signed canonical write authority`, () => {
    const errors = scanNoCodeGeneratedMappingSource('scripts/tools/unauthorized.mjs', source, { forceProduction: true })
    assert.notEqual(errors.length, 0)
  })
}

test('full canonical shape labelled as a candidate is not exempt', () => {
  const source = "const value={workflowId:'w',itemId:'i',sourceId:'s',sectionId:'x',proposalStatus:'candidate_pending_review',sourceHash:'a',sectionHash:'b',supportStatus:'exact_section_supported',origin:'legacy_exact',mappingVersion:'1.0.0'}"
  assert.notEqual(scanNoCodeGeneratedMappingSource('scripts/tools/disguised-candidate.mjs', source, { forceProduction: true }).length, 0)
})

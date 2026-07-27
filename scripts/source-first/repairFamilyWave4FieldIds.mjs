import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const interactiveDir = path.join(root, 'public', 'data-beta', 'interactive-workflows', 'workflows')
const progressDir = path.join(root, 'clinical-expansion-v2', 'progress', 'family-wave4')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const targets = read(path.join(progressDir, 'WAVE4_WORKFLOW_TARGETS.json')).targets
const fields = []
for (const target of targets) {
  const file = path.join(interactiveDir, `${target.workflow_id}.json`)
  const workflow = read(file)
  const targetPrefix = target.workflow_id.replaceAll('-', '_')
  for (const field of workflow.fields ?? []) {
    const suffix = String(field.field_id).includes('__') ? String(field.field_id).split('__').slice(1).join('__') : String(field.field_id)
    field.workflow_id = target.workflow_id
    field.field_id = `${targetPrefix}__${suffix}`
    fields.push({ workflow_id: target.workflow_id, field_id: field.field_id, family_id: target.family_id, evidence_pack_ids: field.provenance?.evidence_pack_ids ?? [], source_ids: field.provenance?.source_ids ?? [], provenance_complete: true })
  }
  write(file, workflow)
}
const fieldProvenance = read(path.join(progressDir, 'FIELD_PROVENANCE.json'))
fieldProvenance.field_count = fields.length
fieldProvenance.fields = fields
fieldProvenance.fingerprint = crypto.createHash('sha256').update(JSON.stringify(fields)).digest('hex')
write(path.join(progressDir, 'FIELD_PROVENANCE.json'), fieldProvenance)
const finalManifestFile = path.join(root, 'public', 'data-beta', 'final-catalogue', 'manifest.json')
const finalManifest = read(finalManifestFile)
finalManifest.source_commit = '58be2e806dd364d571ffe168a9a64f1fc2048141'
write(finalManifestFile, finalManifest)
console.log(JSON.stringify({ repaired_workflows: targets.length, repaired_fields: fields.length, source_commit: finalManifest.source_commit }, null, 2))

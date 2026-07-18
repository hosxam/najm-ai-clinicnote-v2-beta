import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd(); const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const readiness = read('clinical-expansion-v2/guideline-workflow-resolution-v2/WORKFLOW_READINESS.json')
const blocked = new Set(read('clinical-expansion-v2/guideline-evidence-packs-v1/EVIDENCE_PACK_MANIFEST.json').family_manifest.flatMap((family) => family.blocked_sources ?? []))
const errors = readiness.records.filter((r) => r.readiness === 'READY_FOR_RECONSTRUCTION' && r.source_ids.some((id) => blocked.has(id))).map((r) => r.workflow_id)
if (errors.length) { console.error(`blocked sources marked ready: ${errors.join(',')}`); process.exitCode = 1 } else console.log(JSON.stringify({ status: 'PASS', blocked_source_count: blocked.size, blocked_workflows_are_scoped: true }, null, 2))

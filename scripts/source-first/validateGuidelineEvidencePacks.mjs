import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const expansion = path.join(root, 'clinical-expansion-v2')
const output = path.join(expansion, 'guideline-evidence-packs-v1')
const corpus = path.join(expansion, 'source-corpus-v1')
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const errors = []
const manifest = read(path.join(output, 'EVIDENCE_PACK_MANIFEST.json'))
const corpusManifest = read(path.join(corpus, 'manifests', 'SOURCE_CORPUS_MANIFEST.json'))
const corpusDocs = new Map(corpusManifest.source_records.map((record) => [record.source_id, read(path.join(corpus, 'documents', `${record.source_id}.json`))]))
const packs = []
for (const family of manifest.family_manifest) {
  const file = path.join(output, 'packs', `${family.family_id}.json`); if (!fs.existsSync(file)) { errors.push(`${family.family_id}: missing pack`); continue }
  const pack = read(file); packs.push(pack)
  for (const statement of pack.evidence_statements) {
    for (const field of ['evidence_pack_id', 'evidence_statement_id', 'section', 'faithful_clinical_statement', 'source_id', 'source_title', 'official_url', 'exact_locator', 'population', 'setting', 'jurisdiction', 'exclusions', 'recommendation_strength', 'uae_applicability', 'source_fingerprint', 'locator_fingerprint']) if (!(field in statement)) errors.push(`${pack.evidence_pack_id}/${statement.evidence_statement_id}: missing ${field}`)
    const source = corpusDocs.get(statement.source_id); if (!source || !['ingested_complete', 'ingested_with_structural_limitations', 'superseded_source'].includes(source.ingestion_status)) errors.push(`${pack.evidence_pack_id}: blocked/invalid source used ${statement.source_id}`)
    if (source && statement.source_fingerprint !== source.normalized_content_fingerprint) errors.push(`${pack.evidence_pack_id}/${statement.evidence_statement_id}: source fingerprint mismatch`)
    if (!statement.exact_locator?.section_id && statement.exact_locator?.position == null) errors.push(`${pack.evidence_pack_id}/${statement.evidence_statement_id}: locator has no stable position`)
    if (!statement.faithful_clinical_statement.trim()) errors.push(`${pack.evidence_pack_id}/${statement.evidence_statement_id}: empty evidence statement`)
  }
  const replay = sha(JSON.stringify(pack.evidence_statements)); if (replay !== pack.evidence_pack_fingerprint) errors.push(`${pack.evidence_pack_id}: pack fingerprint mismatch`)
}
if (manifest.corpus_fingerprint !== corpusManifest.corpus_fingerprint) errors.push('evidence-pack manifest corpus fingerprint mismatch')
const aggregate = sha(JSON.stringify(packs.map((pack) => [pack.evidence_pack_id, pack.pack_status, pack.evidence_pack_fingerprint])))
if (aggregate !== manifest.aggregate_fingerprint) errors.push('aggregate evidence-pack fingerprint mismatch')
const result = { status: errors.length ? 'FAIL' : 'PASS', families: manifest.guideline_family_count, packs: packs.length, completed: packs.filter((pack) => pack.pack_status === 'completed').length, pending: packs.filter((pack) => pack.pack_status !== 'completed').length, evidence_statements: packs.reduce((total, pack) => total + pack.evidence_statements.length, 0), corpus_fingerprint: manifest.corpus_fingerprint, aggregate_fingerprint: manifest.aggregate_fingerprint, errors }
console.log(JSON.stringify(result, null, 2)); if (errors.length) process.exitCode = 1

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SOURCE_METADATA_FINGERPRINT_PATH,
  loadActiveSourceRecords,
  verifyStoredSourceMetadataFingerprint,
} from './sourceMetadataFingerprint.mjs'

export function verifyActiveSourceMetadataFingerprint() {
  const records = loadActiveSourceRecords()
  const storedRecord = JSON.parse(fs.readFileSync(SOURCE_METADATA_FINGERPRINT_PATH, 'utf8'))
  const verification = verifyStoredSourceMetadataFingerprint(records, storedRecord)
  return {
    status: verification.status,
    errors: verification.errors,
    issues: verification.issues,
    sourceCount: verification.actual.sourceCount,
    fingerprintSchemaVersion: verification.actual.fingerprintSchemaVersion,
    provenanceMigrationVersion: verification.actual.provenanceMigrationVersion,
    schemaBindings: verification.actual.schemaBindings,
    storedFingerprint: storedRecord.fingerprint,
    activeFingerprint: verification.actual.fingerprint,
    fingerprintPath: path.relative(process.cwd(), SOURCE_METADATA_FINGERPRINT_PATH).replaceAll('\\', '/'),
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  const result = verifyActiveSourceMetadataFingerprint()
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'PASS') process.exitCode = 1
}

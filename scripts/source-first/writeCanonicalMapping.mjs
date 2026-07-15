import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeTextAtomic } from './common.mjs'
import {
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_SCHEMA_VERSION,
  canonicalMappingKey,
} from './canonicalMappingContract.mjs'
import {
  createRepositoryCanonicalMappingContext,
  loadCanonicalMappings,
  parseStrictJsonText,
  readCanonicalMappingDocument,
  validateCanonicalMappingDocument,
  validateCanonicalMappingRecords,
} from './canonicalMappingStore.mjs'

function requireControlledDirectory(directory, allowTestDirectory) {
  const requested = path.resolve(directory)
  const canonical = path.resolve(CANONICAL_MAPPING_DIRECTORY)
  if (requested !== canonical && allowTestDirectory !== true) {
    throw new Error('[canonical-mapping-serializer] noncanonical directory is permitted only for explicit synthetic tests')
  }
  return requested
}

export function writeCanonicalMapping(mapping, {
  directory = CANONICAL_MAPPING_DIRECTORY,
  context = createRepositoryCanonicalMappingContext(),
  allowTestDirectory = false,
} = {}) {
  const targetDirectory = requireControlledDirectory(directory, allowTestDirectory)
  const validatedMapping = validateCanonicalMappingRecords([mapping], context)[0]
  fs.mkdirSync(targetDirectory, { recursive: true })
  const filePath = path.join(targetDirectory, `${validatedMapping.workflowId}.json`)
  const previousText = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
  const existingMappings = previousText === null
    ? []
    : readCanonicalMappingDocument(filePath, { context }).mappings
  if (existingMappings.some((row) => row.itemId === validatedMapping.itemId)) {
    throw new Error(`[canonical-mapping-serializer] mapping already exists for ${validatedMapping.workflowId}/${validatedMapping.itemId}`)
  }
  const mappings = [...existingMappings, validatedMapping]
    .sort((left, right) => canonicalMappingKey(left).localeCompare(canonicalMappingKey(right)))
  validateCanonicalMappingRecords(mappings, context)
  const document = validateCanonicalMappingDocument({
    schemaVersion: CANONICAL_MAPPING_SCHEMA_VERSION,
    workflowId: validatedMapping.workflowId,
    mappings,
  }, { fileName: filePath, context })
  const payload = `${JSON.stringify(document, null, 2)}\n`
  try {
    writeTextAtomic(filePath, payload)
    readCanonicalMappingDocument(filePath, { context })
    loadCanonicalMappings({ directory: targetDirectory, context })
  } catch (error) {
    if (previousText === null) fs.rmSync(filePath, { force: true })
    else writeTextAtomic(filePath, previousText)
    throw error
  }
  return Object.freeze({ filePath, mapping: validatedMapping })
}

export function removeSyntheticCanonicalMappingFile(workflowId, {
  directory,
  allowTestDirectory = false,
} = {}) {
  const targetDirectory = requireControlledDirectory(directory, allowTestDirectory)
  if (path.resolve(targetDirectory) === path.resolve(CANONICAL_MAPPING_DIRECTORY)) {
    throw new Error('[canonical-mapping-serializer] production canonical mappings require an explicit review process and cannot use test cleanup')
  }
  const filePath = path.join(targetDirectory, `${workflowId}.json`)
  fs.rmSync(filePath, { force: true })
  return filePath
}

function cliInputPath(argv) {
  const inputIndex = argv.indexOf('--input')
  if (inputIndex < 0 || !argv[inputIndex + 1] || argv[inputIndex + 1].startsWith('--')) {
    throw new Error('Usage: node scripts/source-first/writeCanonicalMapping.mjs --input <complete-mapping.json>')
  }
  return path.resolve(argv[inputIndex + 1])
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    const inputPath = cliInputPath(process.argv.slice(2))
    const mapping = parseStrictJsonText(fs.readFileSync(inputPath, 'utf8'), inputPath)
    const result = writeCanonicalMapping(mapping)
    console.log(JSON.stringify({ status: 'PASS', file: result.filePath, key: canonicalMappingKey(result.mapping) }, null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

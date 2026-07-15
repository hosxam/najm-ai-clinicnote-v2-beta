import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalMappingSigningEnvironment } from './canonicalMappingEnvironment.mjs'
import {
  approveRawCanonicalMapping,
  initializeSignedCanonicalStore,
} from './canonicalMappingTransaction.mjs'

function usage() {
  return 'Usage: node scripts/source-first/writeCanonicalMapping.mjs (--input <raw-mapping.json> | --initialize-empty)'
}

function parseArguments(argv) {
  const initialize = argv.includes('--initialize-empty')
  const inputIndex = argv.indexOf('--input')
  const input = inputIndex >= 0 ? argv[inputIndex + 1] : null
  if ((initialize && input) || (!initialize && !input) || (input && input.startsWith('--'))) throw new Error(usage())
  const known = new Set(initialize ? ['--initialize-empty'] : ['--input', input])
  if (argv.some((value) => !known.has(value))) throw new Error(usage())
  return { initialize, inputPath: input ? path.resolve(input) : null }
}

function assertExternalInputPath(inputPath, canonicalDirectory) {
  const resolvedCanonicalDirectory = fs.realpathSync.native(path.resolve(canonicalDirectory))
  const resolvedInputPath = fs.realpathSync.native(inputPath)
  const relative = path.relative(resolvedCanonicalDirectory, resolvedInputPath)
  if (relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('[canonical-mapping-serializer] raw input must be outside the active canonical directory')
  }
  const stat = fs.lstatSync(inputPath, { bigint: true })
  if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink !== 1n) {
    throw new Error('[canonical-mapping-serializer] raw input must be a normal, non-linked regular file')
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    const args = parseArguments(process.argv.slice(2))
    const environment = canonicalMappingSigningEnvironment()
    const result = args.initialize
      ? initializeSignedCanonicalStore(environment)
      : (() => {
          assertExternalInputPath(args.inputPath, environment.directory)
          return approveRawCanonicalMapping(fs.readFileSync(args.inputPath), environment)
        })()
    console.log(JSON.stringify({
      status: 'PASS',
      action: result.action,
      noOp: result.noOp,
      approvalSequence: result.active.manifest.approvalSequence,
      aggregateHash: result.active.aggregateHash,
      mappingCount: result.active.mappings.length,
    }, null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalMappingSigningEnvironment } from './canonicalMappingEnvironment.mjs'
import { removeRawCanonicalMapping } from './canonicalMappingTransaction.mjs'

function inputPath(argv) {
  if (argv.length !== 2 || argv[0] !== '--input' || !argv[1] || argv[1].startsWith('--')) {
    throw new Error('Usage: node scripts/source-first/removeCanonicalMapping.mjs --input <exact-mapping-key.json>')
  }
  return path.resolve(argv[1])
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    const filePath = inputPath(process.argv.slice(2))
    const stat = fs.lstatSync(filePath, { bigint: true })
    if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink !== 1n) {
      throw new Error('[canonical-mapping-removal] input must be a normal, non-linked regular file')
    }
    const result = removeRawCanonicalMapping(fs.readFileSync(filePath), canonicalMappingSigningEnvironment())
    console.log(JSON.stringify({
      status: 'PASS',
      action: result.action,
      approvalSequence: result.active.manifest.approvalSequence,
      aggregateHash: result.active.aggregateHash,
      mappingCount: result.active.mappings.length,
    }, null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

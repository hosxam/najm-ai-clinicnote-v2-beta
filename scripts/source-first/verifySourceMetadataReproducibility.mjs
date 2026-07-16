import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifySourceMetadataReproducibility } from './sourceMetadataReproducibility.mjs'

export async function runSourceMetadataReproducibilityVerification() {
  return verifySourceMetadataReproducibility()
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    const result = await runSourceMetadataReproducibilityVerification()
    console.log(JSON.stringify(result, null, 2))
    if (result.status !== 'PASS') process.exitCode = 1
  } catch (error) {
    console.error(JSON.stringify({
      status: 'FAIL',
      errors: [error.message],
    }, null, 2))
    process.exitCode = 1
  }
}

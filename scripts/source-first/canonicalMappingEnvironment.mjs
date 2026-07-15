import fs from 'node:fs'
import path from 'node:path'
import {
  ROOT_DIR,
} from './common.mjs'
import {
  CANONICAL_MAPPING_DIRECTORY,
  CANONICAL_MAPPING_PUBLIC_KEY_PATH,
} from './canonicalMappingContract.mjs'
import {
  createCanonicalMappingContextFromDocument,
  createRepositoryCanonicalMappingContext,
} from './canonicalMappingStore.mjs'
import { parseStrictJsonBytes } from './canonicalJson.mjs'

function requiredAbsolutePath(name) {
  const value = process.env[name]
  if (!value || !path.isAbsolute(value)) throw new Error(`[canonical-environment] ${name} must be an absolute path`)
  return path.resolve(value)
}

function optionalAbsolutePath(name) {
  const value = process.env[name]
  if (!value) return null
  if (!path.isAbsolute(value)) throw new Error(`[canonical-environment] ${name} must be an absolute path`)
  return path.resolve(value)
}

function readContext(contextPath) {
  const bytes = fs.readFileSync(contextPath)
  const document = parseStrictJsonBytes(bytes, { fileName: contextPath, maxBytes: 32 * 1024 * 1024 })
  return createCanonicalMappingContextFromDocument(document)
}

export function isCanonicalMappingTestMode() {
  return process.env.NAJM_MAPPING_TEST_MODE === '1'
}

export function canonicalMappingRuntimeEnvironment() {
  if (isCanonicalMappingTestMode()) {
    const directory = requiredAbsolutePath('NAJM_MAPPING_CANONICAL_DIRECTORY')
    const contextPath = requiredAbsolutePath('NAJM_MAPPING_CONTEXT_PATH')
    return Object.freeze({
      testMode: true,
      directory,
      expectedDirectory: directory,
      publicKeyPath: requiredAbsolutePath('NAJM_MAPPING_PUBLIC_KEY_PATH'),
      context: readContext(contextPath),
      contextPath,
      approvalStatePath: optionalAbsolutePath('NAJM_MAPPING_APPROVAL_STATE_PATH'),
      allowTestDirectory: true,
    })
  }
  for (const forbidden of [
    'NAJM_MAPPING_CANONICAL_DIRECTORY',
    'NAJM_MAPPING_PUBLIC_KEY_PATH',
    'NAJM_MAPPING_CONTEXT_PATH',
  ]) {
    if (process.env[forbidden]) throw new Error(`[canonical-environment] ${forbidden} is test-only and cannot override production trust paths`)
  }
  return Object.freeze({
    testMode: false,
    directory: CANONICAL_MAPPING_DIRECTORY,
    expectedDirectory: CANONICAL_MAPPING_DIRECTORY,
    publicKeyPath: CANONICAL_MAPPING_PUBLIC_KEY_PATH,
    context: createRepositoryCanonicalMappingContext(),
    contextPath: null,
    approvalStatePath: optionalAbsolutePath('NAJM_MAPPING_APPROVAL_STATE_PATH'),
    repositoryRoot: ROOT_DIR,
    allowTestDirectory: false,
  })
}

export function canonicalMappingSigningEnvironment() {
  const runtime = canonicalMappingRuntimeEnvironment()
  const signingKeyPath = requiredAbsolutePath('NAJM_MAPPING_SIGNING_KEY_PATH')
  const realRepositoryRoot = fs.realpathSync.native(ROOT_DIR)
  const realSigningKeyPath = fs.realpathSync.native(signingKeyPath)
  const lexicalRelative = path.relative(ROOT_DIR, signingKeyPath)
  const realRelative = path.relative(realRepositoryRoot, realSigningKeyPath)
  const isInsideRepository = (relative) => relative === ''
    || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  if (isInsideRepository(lexicalRelative) || isInsideRepository(realRelative)) {
    throw new Error('[canonical-environment] signing private key must remain outside the repository')
  }
  return Object.freeze({ ...runtime, signingKeyPath: realSigningKeyPath })
}

import { computeMappingKeySetHash } from './canonicalJson.mjs'

export function mappingConsumerOutput(consumer, mappingKeys, extra = {}) {
  const sorted = [...mappingKeys].sort((left, right) => left.localeCompare(right))
  if (new Set(sorted).size !== sorted.length) throw new Error(`[${consumer}] duplicate mapping key emitted`)
  return Object.freeze({
    consumer,
    processId: process.pid,
    count: sorted.length,
    mappingKeys: sorted,
    keySetHash: computeMappingKeySetHash(sorted),
    ...extra,
  })
}

export function printMappingConsumerOutput(output) {
  process.stdout.write(`${JSON.stringify(output)}\n`)
}

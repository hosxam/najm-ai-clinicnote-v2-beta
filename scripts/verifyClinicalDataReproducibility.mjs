import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  publicConfigRoot,
  readJson,
  sha256,
  stableJson,
} from './clinical-expansion/common.mjs'
import {
  buildExclusionConfig,
  buildGeneratedPayloads,
  loadCanonicalDataset,
} from './clinical-expansion/exporter.mjs'

const dataset = loadCanonicalDataset()
const existingExclusionConfig = readJson(path.join(publicConfigRoot, 'limited_testing_exclusions.json'))

function render() {
  const payloads = buildGeneratedPayloads(dataset)
  const exclusions = buildExclusionConfig(dataset, existingExclusionConfig)
  const rendered = Object.fromEntries(Object.entries(payloads).map(([filename, payload]) => [filename, stableJson(payload)]))
  rendered['limited_testing_exclusions.json'] = stableJson(exclusions)
  return rendered
}

const first = render()
const second = render()
const firstHash = sha256(Object.entries(first).map(([filename, value]) => `${filename}\n${value}`).join('\n'))
const secondHash = sha256(Object.entries(second).map(([filename, value]) => `${filename}\n${value}`).join('\n'))
if (firstHash !== secondHash) throw new Error(`Reproducibility mismatch: ${firstHash} != ${secondHash}`)

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-clinical-repro-'))
const resolvedTemp = path.resolve(tempRoot)
const resolvedOsTemp = path.resolve(os.tmpdir())
if (!resolvedTemp.startsWith(`${resolvedOsTemp}${path.sep}`)) throw new Error(`Refusing to use unexpected temp path: ${resolvedTemp}`)
try {
  for (const [filename, contents] of Object.entries(first)) fs.writeFileSync(path.join(tempRoot, filename), contents, 'utf8')
  const diskHash = sha256(fs.readdirSync(tempRoot).sort().map((filename) => `${filename}\n${fs.readFileSync(path.join(tempRoot, filename), 'utf8')}`).join('\n'))
  const expectedDiskHash = sha256(Object.entries(first).sort(([left], [right]) => left.localeCompare(right)).map(([filename, value]) => `${filename}\n${value}`).join('\n'))
  if (diskHash !== expectedDiskHash) throw new Error('Disk-rendered reproducibility hash mismatch.')
} finally {
  fs.rmSync(resolvedTemp, { recursive: true, force: true })
}

console.log(JSON.stringify({ status: 'PASS', workflowCount: dataset.workflows.length, reproducibilityHash: firstHash }, null, 2))

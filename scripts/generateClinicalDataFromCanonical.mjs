import path from 'node:path'
import {
  expansionRoot,
  publicConfigRoot,
  publicDataRoot,
  readJson,
  repoRoot,
  writeJson,
} from './clinical-expansion/common.mjs'
import {
  buildGenerationManifest,
  loadCanonicalDataset,
  writeGeneratedPayloads,
} from './clinical-expansion/exporter.mjs'

const dataset = loadCanonicalDataset()
const existingExclusionConfig = readJson(path.join(publicConfigRoot, 'limited_testing_exclusions.json'))
const { payloads, exclusions } = writeGeneratedPayloads({
  dataset,
  dataDirectory: publicDataRoot,
  configDirectory: publicConfigRoot,
  existingExclusionConfig,
})
const manifest = buildGenerationManifest(dataset, payloads, exclusions)
const manifestPath = path.join(expansionRoot, 'migrations', 'data_generation_manifest.json')
writeJson(manifestPath, manifest)

console.log(JSON.stringify({
  workflowCount: dataset.workflows.length,
  generatedFiles: Object.keys(payloads).length,
  exclusionCount: exclusions.exclusions.length,
  generationManifest: path.relative(repoRoot, manifestPath),
}, null, 2))

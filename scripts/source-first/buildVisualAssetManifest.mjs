import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const repo = process.cwd()
const assetPath = path.join(repo, 'public', 'assets', 'najm-constellation-hero.png')
const manifestPath = path.join(repo, 'public', 'assets', 'visual-manifest.json')

async function main() {
  const image = await fs.readFile(assetPath)
  const manifest = {
    schema_version: '1.0.0',
    generation_tool: 'image_gen',
    generation_result: 'completed',
    assets: [{ path: 'assets/najm-constellation-hero.png', type: 'hero-background', sha256: crypto.createHash('sha256').update(image).digest('hex'), bytes: image.length }],
    constraints: ['no patient-identifiable imagery', 'no clinical claims', 'no UI text', 'no watermark'],
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

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
    model_identifier: null,
    generated_at: '2026-07-24T15:00:57.387Z',
    output_count: 1,
    assets: [{
      path: 'assets/najm-constellation-hero.png',
      type: 'hero-background',
      format: 'png',
      dimensions: { width: 1536, height: 1024 },
      background: 'opaque',
      generation_source: 'available image-generation integration',
      sha256: crypto.createHash('sha256').update(image).digest('hex'),
      bytes: image.length,
      introduced_by_commit: '5080d832bd8bafb07e82b6dd8c07a765c742d34b',
      used_by: ['src/pages/InteractiveBetaPage.tsx', 'beta catalogue hero', 'interactive workflow hero'],
      light_mode_use: true,
      dark_mode_use: true,
      mobile_use: true,
      lazy_loaded: false,
      unused: false,
      accessibility_role: 'decorative background',
      alt_text_required: false,
    }],
    constraints: ['no patient-identifiable imagery', 'no clinical claims', 'no UI text', 'no watermark'],
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
async function main() {
  const dist = path.join(repo, 'dist')
  const files = []
  async function walk(directory) { for (const entry of await fs.readdir(directory, { withFileTypes: true })) { const full = path.join(directory, entry.name); if (entry.isDirectory()) await walk(full); else files.push(full) } }
  await walk(dist)
  const sizes = await Promise.all(files.map(async (file) => ({ file: path.relative(repo, file), bytes: (await fs.stat(file)).size })))
  const largest = [...sizes].sort((left, right) => right.bytes - left.bytes).slice(0, 5)
  const critical = sizes.filter((entry) => entry.file.startsWith('dist\\assets\\') || entry.file.startsWith('dist/assets/'))
  const errors = critical.some((entry) => entry.bytes > 5_000_000) ? ['critical application asset exceeds 5 MB'] : []
  console.log(JSON.stringify({ dist_files: sizes.length, total_bytes: sizes.reduce((total, entry) => total + entry.bytes, 0), largest, critical_asset_count: critical.length, legacy_static_payload_bytes: sizes.filter((entry) => !critical.includes(entry)).reduce((total, entry) => total + entry.bytes, 0), errors }, null, 2))
  if (errors.length) process.exitCode = 1
}
main().catch((error) => { console.error(error); process.exitCode = 1 })

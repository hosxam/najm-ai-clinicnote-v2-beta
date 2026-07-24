import fs from 'node:fs/promises'
import path from 'node:path'

const repo = process.cwd()
const read = (file) => fs.readFile(file, 'utf8').then(JSON.parse)

async function main() {
  const source = await read(path.join(repo, 'public', 'data-beta', 'final-catalogue', 'manifest.json'))
  const interactive = await read(path.join(repo, 'public', 'data-beta', 'interactive-workflows', 'manifest.json'))
  const visual = await read(path.join(repo, 'public', 'assets', 'visual-manifest.json'))
  const router = await fs.readFile(path.join(repo, 'src', 'app', 'router.tsx'), 'utf8')
  const errors = []
  if (source.counts.original_workflows !== 1500 || source.counts.active_workflows !== 416 || source.counts.inactive_workflows !== 1084) errors.push('source catalogue counts failed')
  if (interactive.counts.workflows !== 416 || interactive.counts.fields <= interactive.counts.workflows || interactive.counts.evidence_records_retained !== 75484) errors.push('interactive manifest counts failed')
  if (visual.generation_result !== 'completed' || !visual.assets?.length) errors.push('visual asset manifest failed')
  if (!router.includes('InteractiveBetaPage') || router.includes("path: 'beta', element: <FinalBetaCataloguePage />")) errors.push('interactive beta route is not primary')
  if (router.includes("path: 'beta', element: <DirectGuidelineCurationPage />")) errors.push('obsolete evidence-only route remains primary')
  const result = { source_counts: source.counts, interactive_counts: interactive.counts, visual_assets: visual.assets.length, primary_route_interactive: errors.length === 0, errors }
  console.log(JSON.stringify(result, null, 2))
  if (errors.length) process.exitCode = 1
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

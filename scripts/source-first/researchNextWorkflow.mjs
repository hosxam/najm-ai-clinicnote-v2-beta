import path from 'node:path'
import { EXPANSION_DIR, readJson } from './common.mjs'

const workflowId = process.argv[process.argv.indexOf('--workflow') + 1]
if (!workflowId || workflowId.startsWith('--')) {
  console.error('Usage: node scripts/source-first/researchNextWorkflow.mjs --workflow <workflow_id>')
  process.exit(2)
}

const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`))
const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))

console.log(JSON.stringify({
  workflow_id: workflow.workflow_id,
  presentation: workflow.presentation,
  specialty: workflow.specialty,
  current_source_status: research.source_status,
  required_next_actions: [
    'Search UAE federal and emirate official clinical guidance first.',
    'Open the exact official document, not only a landing page or search result.',
    'Record exact section headings or recommendation numbers and applicability.',
    'Keep source gaps as clinical blockers; do not create generic fallback content.',
    'Update the research record, workflow status, manifest, ledgers, and hashes together.',
  ],
}, null, 2))

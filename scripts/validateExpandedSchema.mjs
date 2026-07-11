import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  WORKFLOW_COUNT,
  expansionRoot,
  readJson,
} from './clinical-expansion/common.mjs'

const schemaPath = path.join(expansionRoot, 'schema', 'expanded_workflow.schema.json')
const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')
const workflowDirectory = path.join(expansionRoot, 'canonical', 'workflows')
const schema = readJson(schemaPath)
const dataset = readJson(canonicalPath)
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

const errors = []
for (const workflow of dataset.workflows) {
  if (validate(workflow)) continue
  errors.push({
    workflow_id: workflow.identity?.workflow_id ?? 'unknown',
    errors: structuredClone(validate.errors ?? []),
  })
}

const individualFiles = fs.readdirSync(workflowDirectory).filter((filename) => filename.endsWith('.json')).sort()
if (dataset.workflow_count !== WORKFLOW_COUNT || dataset.workflows.length !== WORKFLOW_COUNT) {
  errors.push({ workflow_id: '__dataset__', errors: [{ message: `Expected ${WORKFLOW_COUNT} workflows.` }] })
}
if (individualFiles.length !== WORKFLOW_COUNT) {
  errors.push({ workflow_id: '__individual_files__', errors: [{ message: `Expected ${WORKFLOW_COUNT} individual files; found ${individualFiles.length}.` }] })
}

for (const filename of individualFiles) {
  const workflow = readJson(path.join(workflowDirectory, filename))
  if (`${workflow.identity.workflow_id}.json` !== filename) {
    errors.push({ workflow_id: workflow.identity?.workflow_id ?? 'unknown', errors: [{ message: `Filename mismatch: ${filename}.` }] })
  }
}

if (errors.length) {
  console.error(JSON.stringify({ status: 'FAIL', invalidWorkflowCount: errors.length, firstErrors: errors.slice(0, 20) }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({
  status: 'PASS',
  schemaVersion: schema.properties.schema_version.const,
  workflowsValidated: dataset.workflows.length,
  individualFilesValidated: individualFiles.length,
}, null, 2))

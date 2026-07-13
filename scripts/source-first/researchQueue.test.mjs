import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  acquireQueueLock,
  executeSequentialQueue,
  isTerminalWorkflow,
  parseQueueArgs,
  recoverToCheckpoint,
  resolveQueueEntries,
  shouldStopForTimeBudget,
} from './researchQueue.mjs'
import { writeJson } from './common.mjs'

const terminal = (sequence, workflowId) => ({
  sequence,
  workflow_id: workflowId,
  source_status: 'partial_exact_source_verified',
  terminal_research: true,
})
const pending = (sequence, workflowId) => ({
  sequence,
  workflow_id: workflowId,
  source_status: 'research_interrupted',
})

test('parses the documented queue command', () => {
  assert.deepEqual(parseQueueArgs([
    '--start', 'gastro-rectal-bleeding',
    '--max-workflows', '50',
    '--checkpoint-every', '10',
    '--time-budget-minutes', '210',
    '--continue-from-manifest',
    '--dry-run',
  ]), {
    start: 'gastro-rectal-bleeding',
    maxWorkflows: 50,
    checkpointEvery: 10,
    timeBudgetMinutes: 210,
    continueFromManifest: true,
    dryRun: true,
  })
})

test('resumes at the first unfinished workflow and skips terminal entries', () => {
  const manifest = {
    next_workflow_id: 'w3',
    workflows: [terminal(1, 'w1'), terminal(2, 'w2'), pending(3, 'w3'), pending(4, 'w4')],
  }
  assert.equal(isTerminalWorkflow(manifest.workflows[0]), true)
  assert.deepEqual(
    resolveQueueEntries(manifest, { start: 'w3', continueFromManifest: true, maxWorkflows: 10 })
      .map((entry) => entry.workflow_id),
    ['w3', 'w4'],
  )
})

test('checkpoints every ten and continues after the checkpoint', async () => {
  const entries = Array.from({ length: 25 }, (_, index) => pending(index + 1, `w${index + 1}`))
  const processed = []
  const checkpoints = []
  await executeSequentialQueue({
    entries,
    checkpointEvery: 10,
    deadlineMs: Number.POSITIVE_INFINITY,
    processWorkflow: async (entry) => processed.push(entry.workflow_id),
    checkpoint: async (group) => checkpoints.push(group.map((entry) => entry.workflow_id)),
  })
  assert.equal(processed.length, 25)
  assert.deepEqual(checkpoints.map((group) => group.length), [10, 10, 5])
  assert.equal(processed[10], 'w11')
})

test('max-workflow selection stops at the requested limit', () => {
  const manifest = {
    next_workflow_id: 'w1',
    workflows: Array.from({ length: 8 }, (_, index) => pending(index + 1, `w${index + 1}`)),
  }
  assert.equal(resolveQueueEntries(manifest, {
    start: 'w1', continueFromManifest: true, maxWorkflows: 3,
  }).length, 3)
})

test('time budget stops before processing when less than fifteen minutes remain', async () => {
  assert.equal(shouldStopForTimeBudget(14 * 60_000, 0), true)
  const result = await executeSequentialQueue({
    entries: [pending(1, 'w1')],
    checkpointEvery: 10,
    deadlineMs: 14 * 60_000,
    now: () => 0,
    processWorkflow: async () => assert.fail('workflow should not run'),
    checkpoint: async () => assert.fail('checkpoint should not run'),
  })
  assert.equal(result.stopReason, 'time_budget_threshold')
})

test('atomic JSON writes leave complete restart state and no temporary file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-queue-'))
  const filePath = path.join(directory, 'restart_state.json')
  writeJson(filePath, { next_workflow_id: 'w1' })
  writeJson(filePath, { next_workflow_id: 'w2', status: 'INTERRUPTED_RESTARTABLE' })
  assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), {
    next_workflow_id: 'w2', status: 'INTERRUPTED_RESTARTABLE',
  })
  assert.deepEqual(fs.readdirSync(directory), ['restart_state.json'])
  fs.rmSync(directory, { recursive: true, force: true })
})

test('queue lock prevents concurrent manifest writers', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'najm-queue-lock-'))
  const lockPath = path.join(directory, 'queue.lock')
  const release = acquireQueueLock(lockPath)
  assert.throws(() => acquireQueueLock(lockPath), /EEXIST/)
  release()
  assert.equal(fs.existsSync(lockPath), false)
  fs.rmSync(directory, { recursive: true, force: true })
})

test('simulated interruption recovery resets to the last checkpoint and stays clean', () => {
  const events = []
  const next = recoverToCheckpoint({
    resetToCheckpoint: () => events.push('reset'),
    assertClean: () => events.push('clean'),
    nextWorkflowId: 'w11',
  })
  assert.deepEqual(events, ['reset', 'clean'])
  assert.equal(next, 'w11')
})

test('dry orchestration helpers do not mutate frozen application files', () => {
  const hash = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
  const dataPath = path.join(process.cwd(), 'public', 'data', 'clinical_workflows.json')
  const exclusionPath = path.join(process.cwd(), 'public', 'config', 'limited_testing_exclusions.json')
  const before = [hash(dataPath), hash(exclusionPath)]
  resolveQueueEntries({ next_workflow_id: 'w1', workflows: [pending(1, 'w1')] }, {
    start: 'w1', continueFromManifest: true, maxWorkflows: 1,
  })
  assert.deepEqual([hash(dataPath), hash(exclusionPath)], before)
})

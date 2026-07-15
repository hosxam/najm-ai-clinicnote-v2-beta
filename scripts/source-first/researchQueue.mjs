import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { BASELINE_COMMIT, EXPANSION_DIR, ROOT_DIR, readJson, writeJson } from './common.mjs'

export const TERMINAL_SOURCE_STATUSES = new Set([
  'exact_workflow_source_verified',
  'partial_exact_source_verified',
  'no_authoritative_source_found',
  'conflicting_authoritative_sources',
  'source_access_failed',
])

export const LIGHTWEIGHT_VALIDATORS = [
  'validate:source-evidence',
  'validate:item-provenance',
  'audit:no-generic-templates',
  'audit:no-code-generated-mappings',
  'audit:explicit-mapping-contract',
  'verify:canonical-mapping-reconciliation',
  'audit:research-claims',
  'verify:source-evidence-hashes',
]

const MINIMUM_REMAINING_MINUTES = 15
const REQUIRED_BRANCH = 'source-first-guideline-expansion-1500-v2'

export function parseQueueArgs(argv) {
  const options = {
    start: null,
    maxWorkflows: Number.POSITIVE_INFINITY,
    checkpointEvery: 10,
    timeBudgetMinutes: Number.POSITIVE_INFINITY,
    continueFromManifest: false,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const value = argv[index + 1]
    if (argument === '--start') options.start = value, index += 1
    else if (argument === '--max-workflows') options.maxWorkflows = Number(value), index += 1
    else if (argument === '--checkpoint-every') options.checkpointEvery = Number(value), index += 1
    else if (argument === '--time-budget-minutes') options.timeBudgetMinutes = Number(value), index += 1
    else if (argument === '--continue-from-manifest') options.continueFromManifest = true
    else if (argument === '--dry-run') options.dryRun = true
    else throw new Error(`Unknown queue argument: ${argument}`)
  }

  for (const [name, value] of [
    ['max-workflows', options.maxWorkflows],
    ['checkpoint-every', options.checkpointEvery],
    ['time-budget-minutes', options.timeBudgetMinutes],
  ]) {
    if (!(value > 0) || (!Number.isFinite(value) && value !== Number.POSITIVE_INFINITY)) {
      throw new Error(`--${name} must be a positive number`)
    }
  }
  if (!Number.isInteger(options.maxWorkflows) && Number.isFinite(options.maxWorkflows)) {
    throw new Error('--max-workflows must be an integer')
  }
  if (!Number.isInteger(options.checkpointEvery)) throw new Error('--checkpoint-every must be an integer')
  return options
}

export function isTerminalWorkflow(entry) {
  return entry?.terminal_research === true && TERMINAL_SOURCE_STATUSES.has(entry.source_status)
}

export function resolveQueueEntries(manifest, { start, continueFromManifest, maxWorkflows }) {
  const expectedStart = manifest.workflows.find((entry) => !isTerminalWorkflow(entry))?.workflow_id ?? null
  const requestedStart = start ?? (continueFromManifest ? manifest.next_workflow_id : null) ?? expectedStart
  if (!requestedStart) return []

  const startIndex = manifest.workflows.findIndex((entry) => entry.workflow_id === requestedStart)
  if (startIndex < 0) throw new Error(`Unknown start workflow: ${requestedStart}`)
  if (continueFromManifest && expectedStart && requestedStart !== expectedStart) {
    throw new Error(`Resume mismatch: expected ${expectedStart}, received ${requestedStart}`)
  }

  return manifest.workflows
    .slice(startIndex)
    .filter((entry) => !isTerminalWorkflow(entry))
    .slice(0, maxWorkflows)
}

export function shouldStopForTimeBudget(deadlineMs, nowMs) {
  return Number.isFinite(deadlineMs) && deadlineMs - nowMs < MINIMUM_REMAINING_MINUTES * 60_000
}

export async function executeSequentialQueue({
  entries,
  checkpointEvery,
  deadlineMs,
  now = () => Date.now(),
  processWorkflow,
  checkpoint,
}) {
  const processed = []
  let sinceCheckpoint = []
  let stopReason = 'queue_exhausted'

  for (const entry of entries) {
    if (shouldStopForTimeBudget(deadlineMs, now())) {
      stopReason = 'time_budget_threshold'
      break
    }
    await processWorkflow(entry)
    processed.push(entry)
    sinceCheckpoint.push(entry)
    if (sinceCheckpoint.length === checkpointEvery) {
      await checkpoint(sinceCheckpoint)
      sinceCheckpoint = []
    }
  }

  if (sinceCheckpoint.length > 0) await checkpoint(sinceCheckpoint)
  return { processed, stopReason }
}

export function acquireQueueLock(lockPath, metadata = {}) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  const descriptor = fs.openSync(lockPath, 'wx')
  fs.writeFileSync(descriptor, `${JSON.stringify({ pid: process.pid, ...metadata }, null, 2)}\n`, 'utf8')
  fs.closeSync(descriptor)
  return () => {
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath)
  }
}

export function recoverToCheckpoint({ resetToCheckpoint, assertClean, nextWorkflowId }) {
  resetToCheckpoint()
  assertClean()
  return nextWorkflowId
}

function run(command, args, { allowFailure = false, capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0 && !allowFailure) {
    const detail = capture ? `\n${result.stdout ?? ''}${result.stderr ?? ''}` : ''
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}${detail}`)
  }
  return capture ? (result.stdout ?? '').trim() : result
}

function git(args, options) {
  return run('git', args, options)
}

export function resolveNpmInvocation(script, {
  npmExecPath = process.env.npm_execpath,
  nodeExecPath = process.execPath,
  platform = process.platform,
  comSpec = process.env.ComSpec,
} = {}) {
  if (npmExecPath) {
    return { command: nodeExecPath, args: [npmExecPath, 'run', script] }
  }
  if (platform === 'win32') {
    return {
      command: comSpec ?? 'cmd.exe',
      args: ['/d', '/s', '/c', `"npm.cmd run ${script}"`],
    }
  }
  return { command: 'npm', args: ['run', script] }
}

function npmRun(script) {
  const invocation = resolveNpmInvocation(script)
  run(invocation.command, invocation.args)
}

function assertRepositorySafety({ requireClean = false } = {}) {
  const branch = git(['branch', '--show-current'], { capture: true })
  if (branch !== REQUIRED_BRANCH) throw new Error(`Queue must run on ${REQUIRED_BRANCH}; current branch is ${branch}`)
  if (requireClean && git(['status', '--porcelain'], { capture: true })) {
    throw new Error('Queue requires a clean working tree at startup')
  }
  if (git(['diff', '--quiet', BASELINE_COMMIT, '--', 'public/data'], { allowFailure: true }).status !== 0) {
    throw new Error('public/data differs from the stable main baseline')
  }
  if (git([
    'diff', '--quiet', BASELINE_COMMIT, '--', 'public/config/limited_testing_exclusions.json',
  ], { allowFailure: true }).status !== 0) {
    throw new Error('limited-testing exclusions differ from the stable main baseline')
  }
}

export function batchModuleOverlapsEntries(name, entries) {
  const match = /^batch-(\d{4})-(\d{4})\.mjs$/.exec(name)
  if (!match) return false
  const first = Number(match[1])
  const last = Number(match[2])
  return entries.some(({ sequence }) => Number.isInteger(sequence) && sequence >= first && sequence <= last)
}

async function discoverBatchModules(entries) {
  const directory = path.join(ROOT_DIR, 'scripts', 'source-first', 'batches')
  const byWorkflowId = new Map()
  const relevantNames = fs.readdirSync(directory)
    .filter((name) => batchModuleOverlapsEntries(name, entries))
    .sort()
  for (const name of relevantNames) {
    const filePath = path.join(directory, name)
    const { default: batch } = await import(pathToFileURL(filePath).href)
    for (const workflow of batch.workflows ?? []) {
      if (byWorkflowId.has(workflow.workflow_id)) throw new Error(`Duplicate batch workflow: ${workflow.workflow_id}`)
      byWorkflowId.set(workflow.workflow_id, { batch, filePath })
    }
  }
  return byWorkflowId
}

function checkpointCommit(entries) {
  for (const validator of LIGHTWEIGHT_VALIDATORS) npmRun(validator)
  assertRepositorySafety()

  git(['add', '--', 'clinical-expansion-v2'])
  if (git(['diff', '--cached', '--quiet'], { allowFailure: true }).status === 0) {
    throw new Error('Checkpoint produced no staged research changes')
  }
  const first = String(entries[0].sequence).padStart(4, '0')
  const last = String(entries.at(-1).sequence).padStart(4, '0')
  git(['commit', '-m', `chore(source-first): checkpoint workflows ${first}-${last}`])
  return git(['rev-parse', 'HEAD'], { capture: true })
}

function writeQueueState(statePath, value) {
  writeJson(statePath, value)
}

export async function runQueue(options) {
  assertRepositorySafety({ requireClean: !options.dryRun })
  const manifestPath = path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json')
  const manifest = readJson(manifestPath)
  const entries = resolveQueueEntries(manifest, options)
  const batches = await discoverBatchModules(entries)
  const unavailable = entries.find((entry) => !batches.has(entry.workflow_id))
  const runnableEntries = unavailable
    ? entries.slice(0, entries.indexOf(unavailable))
    : entries

  if (options.dryRun) {
    return {
      status: unavailable ? 'DRY_RUN_BLOCKED_MISSING_BATCH' : 'DRY_RUN_READY',
      requested: entries.length,
      runnable: runnableEntries.length,
      start_workflow_id: runnableEntries[0]?.workflow_id ?? null,
      final_runnable_workflow_id: runnableEntries.at(-1)?.workflow_id ?? null,
      first_missing_batch_workflow_id: unavailable?.workflow_id ?? null,
    }
  }
  if (runnableEntries.length === 0) {
    throw new Error(unavailable
      ? `No researched batch module exists for ${unavailable.workflow_id}`
      : 'No unfinished workflows remain in the requested queue range')
  }

  const gitDirectory = git(['rev-parse', '--git-dir'], { capture: true })
  const absoluteGitDirectory = path.resolve(ROOT_DIR, gitDirectory)
  const lockPath = path.join(absoluteGitDirectory, 'source-first-research-queue.lock')
  const statePath = path.join(absoluteGitDirectory, 'source-first-research-queue-state.json')
  const releaseLock = acquireQueueLock(lockPath, { started_at: new Date().toISOString() })
  let checkpointHead = git(['rev-parse', 'HEAD'], { capture: true })
  const checkpointCommits = []
  const startedAt = Date.now()
  const deadlineMs = Number.isFinite(options.timeBudgetMinutes)
    ? startedAt + options.timeBudgetMinutes * 60_000
    : Number.POSITIVE_INFINITY

  try {
    writeQueueState(statePath, {
      status: 'running',
      checkpoint_head: checkpointHead,
      next_workflow_id: runnableEntries[0].workflow_id,
      processed_workflow_ids: [],
    })

    const result = await executeSequentialQueue({
      entries: runnableEntries,
      checkpointEvery: options.checkpointEvery,
      deadlineMs,
      processWorkflow: async (entry) => {
        const batch = batches.get(entry.workflow_id)
        const relativeBatchPath = path.relative(ROOT_DIR, batch.filePath)
        run('node', [
          'scripts/source-first/applyResearchBatch.mjs', relativeBatchPath, '--workflow', entry.workflow_id,
        ])
        const updatedManifest = readJson(manifestPath)
        const updatedEntry = updatedManifest.workflows.find((candidate) => candidate.workflow_id === entry.workflow_id)
        if (!isTerminalWorkflow(updatedEntry)) throw new Error(`${entry.workflow_id}: apply did not reach terminal state`)
        writeQueueState(statePath, {
          status: 'running',
          checkpoint_head: checkpointHead,
          next_workflow_id: updatedManifest.next_workflow_id,
          processed_workflow_ids: [...(readJson(statePath).processed_workflow_ids ?? []), entry.workflow_id],
        })
      },
      checkpoint: async (checkpointEntries) => {
        const commit = checkpointCommit(checkpointEntries)
        checkpointCommits.push(commit)
        checkpointHead = commit
        writeQueueState(statePath, {
          status: 'checkpointed',
          checkpoint_head: checkpointHead,
          next_workflow_id: readJson(manifestPath).next_workflow_id,
          processed_workflow_ids: [],
        })
      },
    })

    const finalManifest = readJson(manifestPath)
    writeQueueState(statePath, {
      status: 'INTERRUPTED_RESTARTABLE',
      checkpoint_head: checkpointHead,
      next_workflow_id: finalManifest.next_workflow_id,
      processed_workflow_ids: result.processed.map((entry) => entry.workflow_id),
      stop_reason: unavailable ? 'missing_researched_batch_module' : result.stopReason,
    })
    assertRepositorySafety({ requireClean: true })
    return {
      status: 'INTERRUPTED_RESTARTABLE',
      processed: result.processed.length,
      checkpoint_commits: checkpointCommits,
      next_workflow_id: finalManifest.next_workflow_id,
      stop_reason: unavailable ? 'missing_researched_batch_module' : result.stopReason,
      first_missing_batch_workflow_id: unavailable?.workflow_id ?? null,
    }
  } catch (error) {
    recoverToCheckpoint({
      resetToCheckpoint: () => git(['reset', '--hard', checkpointHead]),
      assertClean: () => {
        if (git(['status', '--porcelain'], { capture: true })) throw new Error('Recovery did not leave a clean tree')
      },
      nextWorkflowId: readJson(manifestPath).next_workflow_id,
    })
    writeQueueState(statePath, {
      status: 'INTERRUPTED_RESTARTABLE',
      checkpoint_head: checkpointHead,
      next_workflow_id: readJson(manifestPath).next_workflow_id,
      stop_reason: 'technical_failure_recovered_to_checkpoint',
      error: error.message,
    })
    throw error
  } finally {
    releaseLock()
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isMain) {
  try {
    const result = await runQueue(parseQueueArgs(process.argv.slice(2)))
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(error.stack || error.message)
    process.exitCode = 1
  }
}

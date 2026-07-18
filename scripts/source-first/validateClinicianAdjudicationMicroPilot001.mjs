import assert from 'node:assert/strict'
import childProcess from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROOT_DIR, readJson } from './common.mjs'
import { CANDIDATE_MAPPING_PROPOSAL_DIRECTORY, CANONICAL_MAPPING_DIRECTORY } from './canonicalMappingContract.mjs'
import {
  CLINICIAN_DECISIONS,
  DECISION_SCHEMA_VERSION,
  MICRO_DECISIONS_CSV_PATH,
  MICRO_DECISIONS_JSON_PATH,
  MICRO_GUIDE_PATH,
  MICRO_MANIFEST_PATH,
  MICRO_PILOT_ID,
  MICRO_REVIEW_ID,
  MICRO_SCHEMA_PATH,
  MICRO_WORKFLOW_IDS,
  MICRO_WORKFLOWS_DIRECTORY,
  buildMicroPilot,
} from './prepareClinicianAdjudicationMicroPilot001.mjs'

export const MICRO_BASELINE_HEAD = '375da17e905514771022b5d3b2c9bbe2d39877a3'

function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') quoted = false
      else field += character
    } else if (character === '"') quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field.endsWith('\r') ? field.slice(0, -1) : field)
      rows.push(row)
      row = []
      field = ''
    } else field += character
  }
  if (quoted) throw new Error('[adjudication-validator] CSV ends inside a quoted field')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((entry) => entry.some((value) => value !== ''))
}

function csvBoolean(value, { nullable = false } = {}) {
  if (nullable && value === '') return null
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`[adjudication-validator] invalid CSV boolean ${JSON.stringify(value)}`)
}

export function parseDecisionCsv(text, template = buildMicroPilot().decisions) {
  const [header, ...rows] = parseCsvRows(text)
  const fields = Object.keys(template.records[0])
  assert.deepEqual(header, fields, 'CSV header differs from authoritative decision fields')
  const records = rows.map((values, rowIndex) => {
    if (values.length !== fields.length) throw new Error(`[adjudication-validator] CSV row ${rowIndex + 2} has ${values.length} columns; expected ${fields.length}`)
    const record = Object.fromEntries(fields.map((field, index) => [field, values[index]]))
    record.safety_review_required = csvBoolean(record.safety_review_required)
    record.source_recheck_required = csvBoolean(record.source_recheck_required, { nullable: true })
    record.safety_escalation_required = csvBoolean(record.safety_escalation_required, { nullable: true })
    return record
  })
  return { ...template, record_count: records.length, records }
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function recordKey(record) {
  return [record.workflow_id, record.item_id, record.candidate_id].join('\u0000')
}

function immutableFields() {
  return [
    'pilot_id', 'micro_review_id', 'workflow_id', 'item_id', 'candidate_id', 'item_category',
    'original_item_text', 'proposed_source_id', 'evidence_section_id', 'evidence_heading',
    'evidence_locator', 'evidence_summary', 'support_classification', 'uae_applicability',
    'safety_review_required', 'schema_version',
  ]
}

function assertBlankPending(record) {
  assert.equal(record.clinician_decision, '', `${record.item_id}: pending decision must be blank`)
  assert.equal(record.revised_item_wording, '', `${record.item_id}: pending revised wording must be blank`)
  assert.equal(record.clinician_comment, '', `${record.item_id}: pending comment must be blank`)
  assert.equal(record.source_recheck_required, null, `${record.item_id}: pending source-recheck flag must be blank`)
  assert.equal(record.safety_escalation_required, null, `${record.item_id}: pending safety-escalation flag must be blank`)
  assert.equal(record.reviewer_name, '', `${record.item_id}: pending reviewer name must be blank`)
  assert.equal(record.reviewer_professional_role, '', `${record.item_id}: pending reviewer role must be blank`)
  assert.equal(record.reviewer_registration_or_licence_identifier, '', `${record.item_id}: pending reviewer identifier must be blank`)
  assert.equal(record.review_date, '', `${record.item_id}: pending review date must be blank`)
}

export function validateDecisionDocument(document, { expectBlank = false } = {}) {
  const template = buildMicroPilot().decisions
  assert.deepEqual(Object.keys(document).sort(), Object.keys(template).sort(), 'decision document has unexpected top-level fields')
  assert.equal(document.schema_version, DECISION_SCHEMA_VERSION)
  assert.equal(document.pilot_id, MICRO_PILOT_ID)
  assert.equal(document.micro_review_id, MICRO_REVIEW_ID)
  assert.deepEqual(document.authority, template.authority)
  assert.ok(Array.isArray(document.records))
  assert.equal(document.record_count, document.records.length)
  assert.equal(document.records.length, template.records.length, 'completed copy must retain every review row')

  const expectedByKey = new Map(template.records.map((record) => [recordKey(record), record]))
  const seen = new Set()
  const counts = { pending: 0, approved: 0, rejected: 0, recorded: 0 }
  for (const record of document.records) {
    assert.deepEqual(Object.keys(record).sort(), Object.keys(template.records[0]).sort(), `${record.item_id ?? 'unknown'}: unexpected decision fields`)
    assert.ok(MICRO_WORKFLOW_IDS.includes(record.workflow_id), `${record.workflow_id}: workflow is outside micro-review`)
    const key = recordKey(record)
    assert.ok(!seen.has(key), `${record.item_id}: duplicate decision row`)
    seen.add(key)
    const expected = expectedByKey.get(key)
    assert.ok(expected, `${record.item_id}: item or candidate reference does not exist`)
    for (const field of immutableFields()) assert.deepEqual(record[field], expected[field], `${record.item_id}: immutable ${field} changed`)
    assert.ok(['partial_support', 'contextual_support', 'unsupported'].includes(record.support_classification))
    assert.ok(record.clinician_decision === '' || CLINICIAN_DECISIONS.includes(record.clinician_decision), `${record.item_id}: invalid clinician decision`)
    assert.ok([null, true, false].includes(record.source_recheck_required), `${record.item_id}: invalid source-recheck flag`)
    assert.ok([null, true, false].includes(record.safety_escalation_required), `${record.item_id}: invalid safety-escalation flag`)

    if (record.decision_status === 'pending_clinician_review') {
      counts.pending += 1
      assertBlankPending(record)
      continue
    }
    assert.equal(record.decision_status, 'clinician_decision_recorded', `${record.item_id}: invalid decision status`)
    assert.ok(record.clinician_decision, `${record.item_id}: recorded status requires a decision`)
    assert.match(record.reviewer_name, /\S/, `${record.item_id}: reviewer name required`)
    assert.match(record.reviewer_professional_role, /\S/, `${record.item_id}: professional role required`)
    assert.ok(validDate(record.review_date), `${record.item_id}: valid review date required`)
    counts.recorded += 1

    if (['approve_candidate', 'approve_with_narrower_wording', 'reject_candidate', 'request_source_recheck'].includes(record.clinician_decision)) {
      assert.match(record.candidate_id, /^cand-[a-f0-9]{24}$/, `${record.item_id}: decision requires a valid candidate`)
      assert.notEqual(record.support_classification, 'unsupported', `${record.item_id}: unsupported row cannot be treated as a candidate`)
    }
    if (record.clinician_decision === 'approve_candidate') counts.approved += 1
    if (record.clinician_decision === 'approve_with_narrower_wording') {
      counts.approved += 1
      assert.match(record.revised_item_wording, /\S/, `${record.item_id}: narrower wording is required`)
    }
    if (record.clinician_decision === 'reject_candidate') counts.rejected += 1
    if (record.clinician_decision === 'request_source_recheck') {
      assert.equal(record.source_recheck_required, true, `${record.item_id}: source-recheck flag must be true`)
      assert.match(record.clinician_comment, /\S/, `${record.item_id}: source-recheck reason is required`)
    }
    if (record.clinician_decision === 'mark_item_unsupported') {
      assert.equal(record.candidate_id, '', `${record.item_id}: candidate row cannot be marked as having no reviewed support`)
      assert.equal(record.support_classification, 'unsupported', `${record.item_id}: only unsupported rows may use this decision`)
    }
    if (record.clinician_decision === 'escalate_safety_review') {
      assert.equal(record.safety_review_required, true, `${record.item_id}: escalation must retain the safety flag`)
      assert.equal(record.safety_escalation_required, true, `${record.item_id}: safety-escalation flag must be true`)
      assert.match(record.clinician_comment, /\S/, `${record.item_id}: escalation reason is required`)
    }
    if (record.clinician_decision === 'defer_decision') assert.match(record.clinician_comment, /\S/, `${record.item_id}: deferral reason is required`)
  }
  assert.deepEqual([...seen].sort(), [...expectedByKey.keys()].sort(), 'decision rows differ from the authoritative queue')
  if (expectBlank) assert.deepEqual(counts, { pending: template.records.length, approved: 0, rejected: 0, recorded: 0 })
  return counts
}

function gitChangedPaths() {
  return childProcess.execFileSync('git', ['diff', '--name-only', MICRO_BASELINE_HEAD, '--'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean).map((value) => value.replaceAll('\\', '/'))
}

function assertProgrammeBoundaries() {
  const changed = gitChangedPaths()
  const protectedPrefixes = [
    'public/data/',
    'clinical-expansion-v2/workflows/',
    'clinical-expansion-v2/sources/',
    'clinical-expansion-v2/candidate-mapping-proposals/',
    'clinical-expansion-v2/canonical-mappings/',
  ]
  assert.ok(!changed.some((filePath) => protectedPrefixes.some((prefix) => filePath.startsWith(prefix))), `protected path changed: ${changed.join(', ')}`)
  assert.ok(!changed.some((filePath) => /exclusion/i.test(filePath)), 'exclusions changed')

  const approvalManifest = readJson(path.join(CANONICAL_MAPPING_DIRECTORY, 'APPROVED_MANIFEST.json'))
  assert.equal(approvalManifest.files.length, 0)
  assert.equal(approvalManifest.mappingKeys.length, 0)
  assert.deepEqual(fs.readdirSync(CANONICAL_MAPPING_DIRECTORY).sort(), ['.gitkeep', 'APPROVED_MANIFEST.json', 'APPROVED_MANIFEST.sig'])

  const candidateFiles = fs.readdirSync(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY).filter((name) => name.endsWith('.candidate.json')).sort()
  assert.equal(candidateFiles.length, 20)
  const proposalCount = candidateFiles.reduce((total, name) => total + readJson(path.join(CANDIDATE_MAPPING_PROPOSAL_DIRECTORY, name)).proposals.length, 0)
  assert.equal(proposalCount, 823)
}

export function loadDecisionInput(inputPath) {
  const absolute = path.resolve(inputPath)
  const text = fs.readFileSync(absolute, 'utf8')
  if (path.extname(absolute).toLowerCase() === '.csv') return parseDecisionCsv(text)
  return JSON.parse(text)
}

export function validateStoredMicroPilot() {
  const rebuilt = buildMicroPilot()
  assert.deepEqual(readJson(MICRO_SCHEMA_PATH), rebuilt.schema)
  assert.deepEqual(readJson(MICRO_MANIFEST_PATH), rebuilt.manifest)
  const jsonTemplate = readJson(MICRO_DECISIONS_JSON_PATH)
  assert.deepEqual(jsonTemplate, rebuilt.decisions)
  const csvTemplate = parseDecisionCsv(fs.readFileSync(MICRO_DECISIONS_CSV_PATH, 'utf8'), rebuilt.decisions)
  assert.deepEqual(csvTemplate, jsonTemplate, 'CSV and JSON decision templates differ')
  const counts = validateDecisionDocument(jsonTemplate, { expectBlank: true })
  const packetFiles = fs.readdirSync(MICRO_WORKFLOWS_DIRECTORY).filter((name) => name.endsWith('.md')).sort()
  assert.deepEqual(packetFiles, MICRO_WORKFLOW_IDS.map((workflowId) => `${workflowId}.md`).sort())
  assert.ok(fs.readFileSync(MICRO_GUIDE_PATH, 'utf8').includes('Partial support is not full approval.'))
  assertProgrammeBoundaries()
  return {
    status: 'PASS',
    workflow_ids: [...MICRO_WORKFLOW_IDS],
    record_count: jsonTemplate.record_count,
    ...rebuilt.manifest.accounting,
    decision_counts: counts,
    csv_json_equivalent: true,
    candidate_proposals_unchanged: true,
    supported_mappings: 0,
    protected_paths_unchanged: true,
  }
}

export function main(args = process.argv.slice(2)) {
  const inputIndex = args.indexOf('--input')
  const inputPath = inputIndex >= 0 ? args[inputIndex + 1] : args[0]
  if (inputIndex >= 0 && !inputPath) throw new Error('[adjudication-validator] --input requires a JSON or CSV file')
  if (inputPath) {
    const counts = validateDecisionDocument(loadDecisionInput(inputPath))
    console.log(JSON.stringify({ status: 'PASS', input: path.resolve(inputPath), decision_counts: counts }, null, 2))
    return
  }
  console.log(JSON.stringify(validateStoredMicroPilot(), null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()

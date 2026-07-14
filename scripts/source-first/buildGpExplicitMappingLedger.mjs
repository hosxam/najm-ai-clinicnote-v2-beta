import fs from 'node:fs'
import path from 'node:path'
import {
  EXPANSION_DIR,
  listClinicalItems,
  readJson,
  writeJson,
} from './common.mjs'
import {
  sectionObjectHash,
  sourceObjectHash,
  validateExplicitGpMappings,
} from './batches/gpExplicitMappingContract.mjs'

const OUTPUT_PATH = path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json')
const manifest = readJson(path.join(EXPANSION_DIR, 'progress', 'execution_manifest.json'))
const entries = manifest.workflows.filter(({ sequence }) => sequence >= 626 && sequence <= 675)

if (entries.length !== 50 || entries[0]?.sequence !== 626 || entries.at(-1)?.sequence !== 675) {
  throw new Error(`Expected exact workflow range 0626-0675; found ${entries.length} entries`)
}

const sources = []
for (const fileName of fs.readdirSync(path.join(EXPANSION_DIR, 'sources')).filter((name) => name.endsWith('.json')).sort()) {
  sources.push(...(readJson(path.join(EXPANSION_DIR, 'sources', fileName)).sources ?? []))
}
const sourcesById = new Map(sources.map((source) => [source.source_id, source]))

const workflowRecords = entries.map(({ sequence, workflow_id: workflowId }) => {
  const workflow = readJson(path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`))
  const research = readJson(path.join(EXPANSION_DIR, 'research', `${workflowId}.research.json`))
  const items = listClinicalItems(workflow)
  const itemsById = new Map(items.map((item) => [item.item_id, item]))
  const exactDocuments = research.exact_documents_opened ?? []
  const exactSections = research.exact_sections_reviewed ?? []

  const context = {
    workflowsById: new Map([[workflowId, workflow]]),
    itemsByWorkflowId: new Map([[workflowId, itemsById]]),
    sourcesById,
    reviewedSourceIds: new Set(exactDocuments),
    reviewedSectionIds: new Set(exactSections),
  }

  const mappings = (research.legacy_item_support_mappings ?? []).map((mapping) => {
    const source = sourcesById.get(mapping.source_id)
    const section = source?.exact_sections?.find(({ section_id: sectionId }) => sectionId === mapping.source_section_id)
    const item = itemsById.get(mapping.item_id)
    if (!source || !section || !item) {
      throw new Error(`${workflowId}: cannot explicitly reconstruct ${mapping.item_id} from ${mapping.source_id}/${mapping.source_section_id}`)
    }
    if (!exactDocuments.includes(mapping.source_id) || !exactSections.includes(mapping.source_section_id)) {
      throw new Error(`${workflowId}: mapping references a source or section not recorded as opened/reviewed`)
    }

    return {
      workflowId,
      itemId: mapping.item_id,
      sourceId: mapping.source_id,
      sectionId: mapping.source_section_id,
      sourceHash: sourceObjectHash(source),
      sectionHash: sectionObjectHash(section),
      evidenceRelationship: mapping.direct_relationship,
      populationApplicability: research.population_applicability,
      settingApplicability: research.setting_applicability,
      jurisdictionApplicability: source.jurisdiction,
      uaeApplicability: research.UAE_applicability,
      applicabilityRationale: `${workflowId}: the exact reviewed source section is retained only for this workflow-owned documentation item; its recorded population, setting, source jurisdiction, and UAE limitations remain explicit and require clinician review.`,
      supportStatus: 'exact_section_supported',
      origin: item.origin,
      retrospectiveClassification: 'RECONSTRUCT_EXPLICITLY',
    }
  })

  validateExplicitGpMappings(mappings, context)

  return {
    sequence,
    workflowId,
    presentation: research.presentation,
    specialty: research.specialty,
    sourceStatus: research.source_status,
    searchQueriesUsed: research.search_queries_used,
    officialPagesOpened: research.official_pages_opened,
    exactDocumentsOpened: exactDocuments,
    exactSectionsReviewed: exactSections,
    candidateSourcesRejected: research.candidate_sources_rejected,
    rejectionReasons: research.rejection_reasons,
    selectedPrimarySources: research.selected_primary_sources,
    selectedSupportingSources: research.selected_supporting_sources,
    populationApplicability: research.population_applicability,
    settingApplicability: research.setting_applicability,
    uaeApplicability: research.UAE_applicability,
    recencyVerification: research.recency_verification,
    supersededCheck: research.superseded_check,
    unresolvedSourceGaps: research.unresolved_source_gaps,
    mappings,
  }
})

const mappingCount = workflowRecords.reduce((total, record) => total + record.mappings.length, 0)
if (mappingCount !== 1032) throw new Error(`Expected 1,032 affected mappings; found ${mappingCount}`)

writeJson(OUTPUT_PATH, {
  schemaVersion: '1.0.0',
  purpose: 'Explicit retrospective reconstruction of GP helper mappings for workflows 0626-0675; no new clinical research.',
  workflowRange: { first: 626, last: 675 },
  workflowCount: workflowRecords.length,
  mappingCount,
  classificationCounts: {
    RETAIN_EXACTLY: 0,
    RECONSTRUCT_EXPLICITLY: mappingCount,
    REMOVE_TO_UNSUPPORTED: 0,
    MANUAL_REVIEW_BLOCKER: 0,
  },
  workflows: workflowRecords,
})

console.log(JSON.stringify({ status: 'PASS', output: path.relative(process.cwd(), OUTPUT_PATH), workflowCount: workflowRecords.length, mappingCount }, null, 2))

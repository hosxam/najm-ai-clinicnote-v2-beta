import { sha256 } from './common.mjs'

export function createSyntheticCanonicalFixture({
  workflowId = 'synthetic-workflow',
  itemId = 'synthetic-workflow--history--item-1',
  sourceId = 'synthetic-source',
  sectionId = 'synthetic-source--section-1',
} = {}) {
  const item = {
    item_id: itemId,
    text: 'Synthetic documentation item',
    item_type: 'synthetic_test_item',
    origin: 'legacy_exact',
    source_ids: [],
    source_section_ids: [],
    clinician_confirmation_required: true,
    default_selected: false,
    clinical_review_status: 'unsupported_legacy_review_required',
  }
  const workflow = {
    workflow_id: workflowId,
    content_sections: { synthetic_history: [item] },
  }
  const section = {
    section_id: sectionId,
    heading: 'Synthetic reviewed section',
    locator: 'synthetic fixture only',
    evidence_summary: 'Synthetic evidence used only to exercise the canonical mapping architecture.',
  }
  const source = {
    source_id: sourceId,
    exact_document_title: 'Synthetic source document',
    exact_sections: [section],
  }
  const research = {
    workflow_id: workflowId,
    exact_documents_opened: [sourceId],
    exact_sections_reviewed: [sectionId],
  }
  const identity = `${workflowId} ${itemId} ${sourceId} ${sectionId}`
  const mapping = {
    workflowId,
    itemId,
    sourceId,
    sectionId,
    sourceHash: sha256(source),
    sectionHash: sha256(section),
    evidenceRelationship: `The synthetic reviewed section directly corresponds to the synthetic documentation item ${itemId}.`,
    populationApplicability: `${identity}: the synthetic adult population is limited to this test fixture and does not transfer to any real patient population or clinical subgroup.`,
    settingApplicability: `${identity}: the synthetic outpatient setting is limited to this isolated test fixture and excludes emergency, inpatient, procedural, and remote-care use.`,
    jurisdictionApplicability: `${identity}: the synthetic jurisdiction is test-only, has no legal or clinical authority, and cannot be transferred to a real jurisdiction or service pathway.`,
    uaeApplicability: `${identity}: UAE applicability is explicitly absent because this is synthetic test data; local clinical, legal, and service limitations remain outside scope.`,
    applicabilityRationale: `${identity}: this synthetic mapping checks population limits, outpatient setting limits, UAE and local jurisdiction limits, and excludes every real clinical or management use; it exists only to verify exact declarative reconciliation and cleanup.`,
    supportStatus: 'exact_section_supported',
    origin: 'legacy_exact',
    mappingVersion: '1.0.0',
  }
  const context = {
    workflowsById: new Map([[workflowId, workflow]]),
    itemsByWorkflowId: new Map([[workflowId, new Map([[itemId, item]])]]),
    sourcesById: new Map([[sourceId, source]]),
    researchByWorkflowId: new Map([[workflowId, research]]),
    reviewedSourceIds: new Set([sourceId]),
    reviewedSectionIds: new Set([sectionId]),
  }
  const unsupportedRow = {
    workflow_id: workflowId,
    item_id: itemId,
    reason: 'synthetic unsupported fixture',
  }
  return { workflow, item, source, section, research, mapping, context, unsupportedRow }
}

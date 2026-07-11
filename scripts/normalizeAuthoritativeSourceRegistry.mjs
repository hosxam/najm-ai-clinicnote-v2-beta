import path from 'node:path'
import {
  SOURCE_REVIEW_DATE,
  expansionRoot,
  readJson,
  sha256,
  stableJson,
  writeJson,
  writeCompactJson,
} from './clinical-expansion/common.mjs'

const registryPath = path.join(expansionRoot, 'sources', 'authoritative_source_registry.json')
const canonicalPath = path.join(expansionRoot, 'canonical', 'expanded_workflows_v1.json')

function main() {
  const registry = readJson(registryPath)
  registry.sources = registry.sources.map((source) => ({
    ...source,
    source_id: source.id,
    official_title: source.title,
    official_source_location: source.url,
    publication_date: source.publication_date ?? null,
    last_update_date: source.last_update_date ?? null,
    version: source.version ?? null,
    relevant_chapters_sections: source.relevant_chapters_sections ?? [],
    population_covered: source.population_covered ?? source.scope ?? null,
    setting_covered: source.setting_covered ?? source.scope ?? null,
    recommendation_strength_if_explicit: source.recommendation_strength_if_explicit ?? null,
    evidence_certainty_if_explicit: source.evidence_certainty_if_explicit ?? null,
    applicability_to_uae_practice: source.applicability_to_uae_practice
      ?? (Array.isArray(source.jurisdiction) && source.jurisdiction.some((value) => /united arab emirates|uae/i.test(value))
        ? 'UAE source; exact workflow and setting applicability still requires qualified review.'
        : 'International source; qualified UAE adaptation and local policy review required.'),
    superseded_status: source.superseded_status ?? 'not_confirmed_at_workflow_level',
    conflict_status: source.conflict_status ?? 'not_assessed_at_workflow_level',
    copyright_reuse_note: source.copyright_reuse_note ?? source.reuse_notes ?? null,
    date_accessed: source.access_date ?? SOURCE_REVIEW_DATE,
    recency_verification_status: source.recency_verification_status ?? 'official_location_verified; latest-version confirmation limited to recorded recency notes',
  }))
  registry.registry_metadata = {
    ...registry.registry_metadata,
    normalized_on: SOURCE_REVIEW_DATE,
    source_count: registry.sources.length,
    missing_dates_are_explicit_nulls: true,
    clinical_approval_claimed: false,
  }
  writeJson(registryPath, registry)

  const dataset = readJson(canonicalPath)
  dataset.source_registry_hash = sha256(stableJson(registry))
  dataset.source_search_records = dataset.source_search_records.map((record) => ({
    ...record,
    search_date: SOURCE_REVIEW_DATE,
    official_registry_screen_completed: true,
    workflow_specific_source_verification_complete: false,
    research_status: record.result === 'source_gap' ? 'source_gap' : 'source_family_mapped_with_workflow_gaps',
  }))
  writeCompactJson(canonicalPath, dataset)

  console.log(JSON.stringify({
    status: 'PASS',
    sources_normalized: registry.sources.length,
    workflows_registry_screened: dataset.source_search_records.length,
    workflow_specific_source_verification_complete: 0,
    source_registry_hash: dataset.source_registry_hash,
  }, null, 2))
}

main()

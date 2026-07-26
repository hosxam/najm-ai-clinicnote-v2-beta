const OFFICIAL_HOSTS = [
  /.nice\.org\.uk$/i,
  /\.gov\.uk$/i,
  /\.gov$/i,
  /\.gov\.ae$/i,
  /\.who\.int$/i,
  /\.cdc\.gov$/i,
  /\.nih\.gov$/i,
  /\.nhs\.uk$/i,
  /\.org$/i,
]

export function classifySourceAcceptance(candidate, context = {}) {
  const url = String(candidate?.official_url ?? candidate?.url ?? '')
  let host = ''
  try { host = new URL(url).hostname.toLowerCase() } catch {}
  const authority = Boolean(host && OFFICIAL_HOSTS.some((pattern) => pattern.test(host)))
  const accessible = candidate?.accessible_full_content !== false && candidate?.content_available !== false && Boolean(url)
  const populationMatch = context.populationMatch ?? candidate?.population_match !== false
  const settingMatch = context.settingMatch ?? candidate?.setting_match !== false
  const duplicate = Boolean(context.existingSourceIds?.includes(candidate?.source_id))
  const accepted = authority && accessible && populationMatch && settingMatch
  return {
    decision: accepted ? 'accepted_authoritative_source' : 'rejected_authoritative_source',
    accepted,
    authority,
    accessible_full_content: accessible,
    population_match: populationMatch,
    setting_match: settingMatch,
    duplicate,
    mapping_required: accepted,
    reason: accepted
      ? 'Authority, accessible full content, and population/setting relevance passed before workflow mapping; title matching is not required.'
      : !authority ? 'Source host is not an accepted official or professional authority.'
        : !accessible ? 'Accessible full content is required before acceptance.'
          : 'Population or setting relevance did not pass.'
  }
}

export function isAcceptedAuthoritativeSource(candidate, context = {}) {
  return classifySourceAcceptance(candidate, context).accepted
}

/**
 * Evidence acceptance is evaluated before workflow mapping. A workflow family
 * may be supported by several authoritative documents, each contributing a
 * different section. This deliberately does not infer missing sections: the
 * caller must provide explicit section coverage for each accepted source.
 */
export function composeEvidenceCoverage({ sources = [], requiredSections = [], population = null, setting = null, archetype = null } = {}) {
  const accepted = sources.filter((source) => classifySourceAcceptance(source, {
    populationMatch: source.population_match !== false,
    settingMatch: source.setting_match !== false,
  }).accepted)
  const sectionSources = new Map()
  for (const source of accepted) {
    for (const section of source.coverage_sections ?? []) {
      if (!sectionSources.has(section)) sectionSources.set(section, [])
      sectionSources.get(section).push(source.source_id ?? source.official_url ?? null)
    }
  }
  const missingSections = requiredSections.filter((section) => !sectionSources.has(section))
  return {
    accepted_sources: accepted.map((source) => source.source_id ?? source.official_url ?? null).filter(Boolean),
    coverage_by_section: Object.fromEntries([...sectionSources.entries()].map(([section, ids]) => [section, [...new Set(ids)]])),
    missing_sections: missingSections,
    complete: missingSections.length === 0,
    population,
    setting,
    archetype,
    mapping_required: accepted.length > 0,
  }
}

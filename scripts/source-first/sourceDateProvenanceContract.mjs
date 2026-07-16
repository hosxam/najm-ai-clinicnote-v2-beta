export const STRONGER_DATE_MIGRATION_VERSION = '1.0.0'
export const STRONGER_DATE_SOURCE_BASELINE_COMMIT = 'ed71365070027ea64fcaab9c04dfa7e9bca0e1c5'
export const STRONGER_DATE_TUPLE_BASELINE_COMMIT = '0610e1def1b82bb46d9296b91a54f1ab4a80238d'
export const STRONGER_DATE_MIGRATION_REVIEW_DATE = '2026-07-16'

export const SOURCE_DATE_EVIDENCE_CATEGORIES = Object.freeze([
  'explicit_publication_label',
  'explicit_effective_label',
  'explicit_revision_label',
  'explicit_service_commencement_label',
  'explicit_legal_effective_label',
  'official_document_header',
  'official_document_metadata',
  'official_service_metadata',
  'webpage_update_only',
  'access_or_review_date_only',
  'unsupported_legacy_claim',
  'unknown_on_official_source',
])

export const PROHIBITED_SOURCE_DATE_EVIDENCE_CATEGORIES = Object.freeze([
  'generic_provenance',
  'frozen_tuple',
  'legacy_exception',
  'inferred_from_other_date',
  'assumed_same_as_publication',
  'assumed_from_recency',
  'inferred_from_access_date',
  'established_precontract_tuple',
])

export const STRONGER_DATE_FIELD_CONTRACT = Object.freeze({
  publication_date: Object.freeze({
    evidenceCategory: 'publication',
    authoritativeEvidenceCategories: Object.freeze([
      'explicit_publication_label',
      'official_document_header',
      'official_document_metadata',
      'unknown_on_official_source',
    ]),
    acceptedExplicitEvidenceLabels: Object.freeze([
      'publication date',
      'first published',
      'published',
      'issued on',
      'page dated',
      'document dated',
      'produced',
    ]),
    permittedNull: true,
    permittedUnknownValues: Object.freeze(['undated_on_official_page']),
    explicitCategory: 'explicit_publication_label',
  }),
  effective_date: Object.freeze({
    evidenceCategory: 'effective date',
    authoritativeEvidenceCategories: Object.freeze([
      'explicit_effective_label',
      'official_document_header',
      'official_document_metadata',
      'official_service_metadata',
    ]),
    acceptedExplicitEvidenceLabels: Object.freeze([
      'effective date',
      'effective from',
      'takes effect',
      'comes into force',
      'effective',
    ]),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    explicitCategory: 'explicit_effective_label',
  }),
  revision_date: Object.freeze({
    evidenceCategory: 'revision',
    authoritativeEvidenceCategories: Object.freeze([
      'explicit_revision_label',
      'official_document_header',
      'official_document_metadata',
    ]),
    acceptedExplicitEvidenceLabels: Object.freeze([
      'revision effective from',
      'edition revision date',
      'edition revised',
      'revision date',
      'formally revised',
      'revised on',
      'last revised',
      'last amended',
      'revised',
    ]),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    explicitCategory: 'explicit_revision_label',
  }),
  service_commencement_date: Object.freeze({
    evidenceCategory: 'service commencement',
    authoritativeEvidenceCategories: Object.freeze([
      'explicit_service_commencement_label',
      'official_service_metadata',
    ]),
    acceptedExplicitEvidenceLabels: Object.freeze([
      'service commenced',
      'service launched',
      'available from',
      'service start date',
    ]),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    explicitCategory: 'explicit_service_commencement_label',
  }),
  legal_effective_date: Object.freeze({
    evidenceCategory: 'legal commencement',
    authoritativeEvidenceCategories: Object.freeze([
      'explicit_legal_effective_label',
      'official_document_header',
      'official_document_metadata',
    ]),
    acceptedExplicitEvidenceLabels: Object.freeze([
      'law effective from',
      'regulation effective date',
      'entered into force',
      'legal commencement date',
    ]),
    permittedNull: true,
    permittedUnknownValues: Object.freeze([]),
    explicitCategory: 'explicit_legal_effective_label',
  }),
})

export const STRONGER_DATE_FIELDS = Object.freeze(Object.keys(STRONGER_DATE_FIELD_CONTRACT))
export const PAGE_UPDATE_FIELDS = Object.freeze([
  'last_updated_date',
  'webpage_last_updated_date',
  'source_modified_date',
])
export const PAGE_UPDATE_LABELS = Object.freeze([
  'last updated',
  'page updated',
  'content updated',
  'webpage updated',
  'source modified',
  'modified',
  'updated',
])
export const REVIEW_DATE_LABELS = Object.freeze([
  'planned review',
  'revision due',
  'review due',
  'next review',
  'review date',
  'reviewed',
])

const MONTH_NAMES = Object.freeze([
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
])

const ALL_LABELS = Object.freeze([
  ...new Set([
    ...Object.values(STRONGER_DATE_FIELD_CONTRACT).flatMap((rule) => rule.acceptedExplicitEvidenceLabels),
    ...PAGE_UPDATE_LABELS,
    ...REVIEW_DATE_LABELS,
  ]),
].sort((left, right) => right.length - left.length))

export function normalizedDateEvidenceText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function exactDateTextVariants(value) {
  const match = String(value).match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/)
  if (!match) return [String(value)]
  const [, year, month, day] = match
  const variants = [String(value)]
  if (!month) return variants
  const monthName = MONTH_NAMES[Number(month) - 1]
  const shortMonth = monthName?.slice(0, 3)
  if (!monthName) return variants
  if (!day) {
    variants.push(`${monthName} ${year}`, `${shortMonth} ${year}`)
    return [...new Set(variants)]
  }
  const dayNumber = String(Number(day))
  variants.push(
    `${dayNumber} ${monthName} ${year}`,
    `${dayNumber} ${shortMonth} ${year}`,
    `${monthName} ${dayNumber} ${year}`,
    `${shortMonth} ${dayNumber} ${year}`,
    `${monthName} ${dayNumber}, ${year}`,
    `${shortMonth} ${dayNumber}, ${year}`,
  )
  return [...new Set(variants)]
}

function metadataEntries(source) {
  const entries = [
    { location: 'version', value: source?.version, sectionReference: null },
    { location: 'recency_verification.status', value: source?.recency_verification?.status, sectionReference: null },
    { location: 'superseded_status_check.status', value: source?.superseded_status_check?.status, sectionReference: null },
  ]
  for (const [index, section] of (source?.exact_sections ?? []).entries()) {
    entries.push(
      {
        location: `exact_sections[${index}].heading`,
        value: section?.heading,
        sectionReference: section?.section_id ?? null,
      },
      {
        location: `exact_sections[${index}].locator`,
        value: section?.locator,
        sectionReference: section?.section_id ?? null,
      },
      {
        location: `exact_sections[${index}].evidence_summary`,
        value: section?.evidence_summary,
        sectionReference: section?.section_id ?? null,
      },
    )
  }
  return entries.filter((entry) => typeof entry.value === 'string' && entry.value.trim() !== '')
}

function segmentAfterLabel(text, label, startIndex) {
  let endIndex = text.length
  for (const otherLabel of ALL_LABELS) {
    const nextIndex = text.indexOf(otherLabel, startIndex + label.length)
    if (nextIndex >= 0 && nextIndex < endIndex) endIndex = nextIndex
  }
  const delimiterOffset = text.slice(startIndex, endIndex).search(/[;|\n]/)
  if (delimiterOffset >= 0) endIndex = startIndex + delimiterOffset
  return text.slice(startIndex, Math.min(endIndex, startIndex + 180))
}

export function findExactLabeledDateEvidence(source, dateValue, acceptedLabels) {
  const variants = exactDateTextVariants(dateValue).map(normalizedDateEvidenceText)
  for (const entry of metadataEntries(source)) {
    const normalized = normalizedDateEvidenceText(entry.value)
    for (const label of [...acceptedLabels].sort((left, right) => right.length - left.length)) {
      let labelIndex = normalized.indexOf(label)
      while (labelIndex >= 0) {
        const segment = segmentAfterLabel(normalized, label, labelIndex)
        const dateMatches = variants.some((variant) => new RegExp(
          `(^|[^a-z0-9])${escapeRegExp(variant)}(?=$|[^a-z0-9])`,
        ).test(segment))
        if (dateMatches) {
          return {
            displayedLabel: label,
            exactEvidenceLocation: entry.location,
            sectionReference: entry.sectionReference,
            evidenceText: entry.value,
          }
        }
        labelIndex = normalized.indexOf(label, labelIndex + 1)
      }
    }
  }
  return null
}

function unknownPublicationEvidence(source) {
  for (const entry of metadataEntries(source)) {
    const normalized = normalizedDateEvidenceText(entry.value)
    if (/publication(?: and effective)? dates? not stated|publication date not stated/.test(normalized)) {
      return {
        displayedLabel: 'publication date not stated',
        exactEvidenceLocation: entry.location,
        sectionReference: entry.sectionReference,
        evidenceText: entry.value,
      }
    }
  }
  return {
    displayedLabel: 'undated on official page',
    exactEvidenceLocation: 'publication_date',
    sectionReference: null,
    evidenceText: 'undated_on_official_page',
  }
}

export function classifyLegacyStrongerDateClaim(source, fieldName, dateValue, originalStrongerDates) {
  const rule = STRONGER_DATE_FIELD_CONTRACT[fieldName]
  if (!rule) throw new Error(`Unknown stronger-date field ${fieldName}`)

  if (rule.permittedUnknownValues.includes(dateValue)) {
    return {
      migrationClassification: 'E_UNKNOWN_ON_OFFICIAL_SOURCE',
      provenanceStatus: 'approved_unknown',
      evidenceCategory: 'unknown_on_official_source',
      finalValue: dateValue,
      targetMetadataField: null,
      evidence: unknownPublicationEvidence(source),
      migrationAction: 'retain_approved_unknown',
      migrationReason: 'The registered official-source metadata explicitly records that no trustworthy publication date is stated.',
    }
  }

  const explicitEvidence = findExactLabeledDateEvidence(
    source,
    dateValue,
    rule.acceptedExplicitEvidenceLabels,
  )
  if (explicitEvidence) {
    return {
      migrationClassification: 'A_EXPLICITLY_SUPPORTED',
      provenanceStatus: 'authoritative_explicit',
      evidenceCategory: rule.explicitCategory,
      finalValue: dateValue,
      targetMetadataField: null,
      evidence: explicitEvidence,
      migrationAction: 'retain_with_explicit_field_provenance',
      migrationReason: `Stored registered-source metadata explicitly labels ${dateValue} as ${rule.evidenceCategory} metadata.`,
    }
  }

  if (
    fieldName === 'effective_date'
    && originalStrongerDates.publication_date === dateValue
  ) {
    return {
      migrationClassification: 'D_DERIVED_OR_DUPLICATED_CLAIM',
      provenanceStatus: 'cleared_derived_or_duplicated',
      evidenceCategory: 'unsupported_legacy_claim',
      finalValue: null,
      targetMetadataField: null,
      evidence: null,
      migrationAction: 'clear_unsupported_duplicate',
      migrationReason: 'The effective date duplicated publication_date without independent effective-date evidence.',
    }
  }

  const updateEvidence = findExactLabeledDateEvidence(source, dateValue, PAGE_UPDATE_LABELS)
  if (updateEvidence) {
    return {
      migrationClassification: 'B_WEBPAGE_UPDATE_ONLY',
      provenanceStatus: 'weaker_metadata_only',
      evidenceCategory: 'webpage_update_only',
      finalValue: null,
      targetMetadataField: null,
      evidence: updateEvidence,
      migrationAction: 'move_to_weaker_update_metadata',
      migrationReason: 'The stored evidence labels the date only as an update, not as the stronger-date field meaning.',
    }
  }

  const reviewEvidence = findExactLabeledDateEvidence(source, dateValue, REVIEW_DATE_LABELS)
  if (reviewEvidence || (
    fieldName === 'revision_date'
    && source?.recency_verification?.revision_due === dateValue
  )) {
    return {
      migrationClassification: 'C_ACCESS_OR_REVIEW_DATE_ONLY',
      provenanceStatus: 'weaker_metadata_only',
      evidenceCategory: 'access_or_review_date_only',
      finalValue: null,
      targetMetadataField: null,
      evidence: reviewEvidence ?? {
        displayedLabel: 'revision due',
        exactEvidenceLocation: 'recency_verification.revision_due',
        sectionReference: null,
        evidenceText: dateValue,
      },
      migrationAction: 'retain_only_as_review_metadata',
      migrationReason: 'The stored record supports a review or review-due date, not a completed formal revision date.',
    }
  }

  return {
    migrationClassification: 'F_REQUIRES_SOURCE_METADATA_RECHECK',
    provenanceStatus: 'requires_source_metadata_recheck',
    evidenceCategory: 'unsupported_legacy_claim',
    finalValue: null,
    targetMetadataField: null,
    evidence: null,
    migrationAction: 'clear_pending_existing_source_metadata_recheck',
    migrationReason: 'Stored registered-source metadata is insufficient to establish the exact field meaning and date.',
  }
}

export function chooseWeakerMetadataField(source, disposition) {
  if (disposition.evidenceCategory === 'access_or_review_date_only') {
    if (
      disposition.evidence?.displayedLabel?.includes('due')
      || disposition.evidence?.displayedLabel?.includes('planned review')
      || disposition.evidence?.exactEvidenceLocation === 'recency_verification.revision_due'
    ) return 'recency_verification.revision_due'
    return 'source_reviewed_date'
  }
  if (disposition.evidenceCategory !== 'webpage_update_only') return null
  for (const field of PAGE_UPDATE_FIELDS) {
    if (source?.[field] === disposition.originalValue || source?.[field] == null) return field
  }
  return null
}

export function sourceIdentitySnapshot(source) {
  return {
    sourceId: source.source_id,
    issuingOrganisation: source.issuing_organisation,
    exactDocumentTitle: source.exact_document_title,
    exactOfficialUrl: source.exact_official_url,
  }
}

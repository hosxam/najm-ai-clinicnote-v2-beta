import path from 'node:path'
import { EXPANSION_DIR, listClinicalItems, readJson } from '../common.mjs'

export function section(section_id, heading, locator, evidence_summary) {
  return { section_id, heading, locator, evidence_summary }
}

export function workflowRecord(config) {
  return {
    ...config,
    selected_supporting_sources: config.selected_supporting_sources ?? [],
    source_status: config.source_status ?? 'partial_exact_source_verified',
  }
}

const itemCache = new Map()

function workflowItems(workflowId) {
  if (!itemCache.has(workflowId)) {
    const workflowPath = path.join(EXPANSION_DIR, 'workflows', `${workflowId}.json`)
    itemCache.set(workflowId, listClinicalItems(readJson(workflowPath)))
  }
  return itemCache.get(workflowId)
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, ' ').trim()
}

export function supportTexts(source_id, source_section_id, relationship, workflowId, exactTexts) {
  const requested = [...new Set(exactTexts.map(normalizeText))]
  const items = workflowItems(workflowId)
  const itemIds = []
  const missing = []

  for (const text of requested) {
    const matches = items.filter((item) => normalizeText(item.text) === text)
    if (matches.length === 0) missing.push(text)
    else itemIds.push(...matches.map((item) => item.item_id))
  }

  if (missing.length > 0) {
    throw new Error(`${workflowId}: exact support text not found: ${missing.join(' | ')}`)
  }

  return {
    source_id,
    source_section_id,
    relationship,
    item_ids: [...new Set(itemIds)],
  }
}

export const SOURCE_META = {
  'doh-day-surgery-procedure-standard-v1-2024': {
    url: 'https://www.doh.gov.ae/-/media/Feature/Resources/Standards/25--Standard-for-Day-Surgery---Procedure-Service---for-publication.ashx',
  },
  'asa-basic-preanesthesia-care-2020': {
    url: 'https://www.asahq.org/~/media/Sites/ASAHQ/Files/Public/Resources/standards-guidelines/basic-standards-for-preanesthesia-care.pdf',
  },
  'asa-documentation-anesthesia-care-2023': {
    url: 'https://www.asahq.org/standards-and-practice-parameters/statement-on-documentation-of-anesthesia-care',
  },
  'asa-basic-anesthetic-monitoring-2025': {
    url: 'https://www.asahq.org/standards-and-practice-parameters/standards-for-basic-anesthetic-monitoring',
  },
  'asa-postanesthesia-care-2024': {
    url: 'https://www.asahq.org/standards-and-practice-parameters/standards-for-postanesthesia-care',
  },
  'asa-postanesthetic-care-guideline-2013': {
    url: 'https://www.asahq.org/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-postanesthetic-care.pdf',
  },
  'asa-preoperative-fasting-2017': {
    url: 'https://www.asahq.org/sitecore%20modules/web/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-preoperative-fasting.pdf',
  },
  'asa-osa-perioperative-2014': {
    url: 'https://www.asahq.org/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-the-perioperative-management-of-patients-with-obstructive-sleep-apnea.pdf',
  },
  'asa-perioperative-blood-management-2015': {
    url: 'https://www.asahq.org/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-perioperative-blood-management.pdf',
  },
  'asa-neuraxial-opioid-respiratory-depression-2016': {
    url: 'https://www.asahq.org/~/media/sites/asahq/files/public/resources/standards-guidelines/practice-guidelines-for-the-prevention-detection-and-management-of-respiratory-depression.pdf',
  },
  'rcoa-gpas-elective-urgent-perioperative-2025': {
    url: 'https://www.rcoa.ac.uk/gpas/chapter-2',
  },
  'rcoa-gpas-day-surgery-2025': {
    url: 'https://www.rcoa.ac.uk/node/18556',
  },
  'rcoa-gpas-regional-anesthesia-2025': {
    url: 'https://www.rcoa.ac.uk/gpas/chapter-8',
  },
  'who-surgical-safety-checklist-2009': {
    url: 'https://www.who.int/publications/i/item/9789241598590',
  },
  'mhaus-family-history-mh-current': {
    url: 'https://www.mhaus.org/healthcare-professionals/mhaus-recommendations/can-patients-with-a-suspected-personal-or-family-history-of-mh-be-safely-anesthetized-prior-to-diagnostic-testing-for-mh-susceptibility/',
  },
  'cpoc-surgery-opioids-2021': {
    url: 'https://www.cpoc.org.uk/sites/cpoc/files/documents/2021-03/surgery-and-opioids-2021.pdf',
  },
}

const ASA_COMMON_PREOPERATIVE_TEXTS = [
  'clinician-led risk context documented',
  'Pre/perioperative assessment documentation documented only if assessed',
  'Airway assessment documentation if assessed documented only if assessed',
  'Cardiorespiratory assessment documentation documented only if assessed',
  'Risk discussion documentation documented only if assessed',
  'airway, aspiration, allergy, bleeding, or cardiorespiratory risk documented if assessed',
  'consent/risk discussion documented only if completed by clinician',
  'Preoperative assessment results documented if reviewed',
  'Existing investigations documented if reviewed by clinician',
  'Consent/risk discussion documentation reviewed if available',
  'risk/consent discussion documented if clinician completed it',
  'Risk/consent discussion documented if completed by clinician.',
]

const ASA_COMMON_PLAN_TEXTS = [
  'clinician-entered documentation plan recorded',
  'senior/specialist discussion documented if already performed',
  'Clinician-entered documentation plan recorded.',
  'Senior/specialist discussion documented if already performed.',
]

export function anesthesiaWorkflow({
  workflow_id,
  title,
  context_text,
  identity_texts = [title],
  concept_support,
  search_queries_used,
  candidate_sources_rejected = [],
  rejection_reasons = [],
  population_applicability,
  setting_applicability,
  UAE_applicability,
  recency_verification,
  superseded_check,
  unresolved_source_gaps = [],
}) {
  const alignedRejectionReasons = candidate_sources_rejected.map((candidate, index) => (
    rejection_reasons[index]
    ?? `The candidate source category "${candidate}" did not provide exact documentation-only evidence for this workflow and was not mapped.`
  ))
  const conceptGroups = concept_support.map((group) => supportTexts(
    group.source_id,
    group.source_section_id,
    group.relationship,
    workflow_id,
    group.exact_texts,
  ))
  const commonPreoperative = supportTexts(
    'asa-documentation-anesthesia-care-2023',
    'asa-documentation-preanesthesia',
    `The exact ASA preanesthesia documentation section supports risk, airway, cardiorespiratory, reviewed-investigation, consultation, plan, and consent fields for ${title}; each remains clinician-entered and conditional on assessment.`,
    workflow_id,
    ASA_COMMON_PREOPERATIVE_TEXTS,
  )
  const commonPlan = supportTexts(
    'asa-documentation-anesthesia-care-2023',
    'asa-documentation-preanesthesia',
    `The exact ASA documentation section supports recording a clinician-selected anesthesia documentation plan and completed senior or specialist discussion for ${title}; it does not create a plan or recommendation.`,
    workflow_id,
    ASA_COMMON_PLAN_TEXTS,
  )

  const sectionGroups = [
    ...concept_support,
    {
      source_id: 'asa-documentation-anesthesia-care-2023',
      source_section_id: 'asa-documentation-preanesthesia',
      relationship: commonPreoperative.relationship,
    },
  ]
  const exactDocuments = [...new Set(sectionGroups.map((group) => group.source_id))]
  const exactSections = [...new Set(sectionGroups.map((group) => group.source_section_id))]
  const primarySources = [...new Set(concept_support.map((group) => group.source_id))]
  const supportingSources = exactDocuments.filter((sourceId) => !primarySources.includes(sourceId))
  const sectionRelationships = {}
  for (const group of sectionGroups) {
    const current = sectionRelationships[group.source_section_id]
    sectionRelationships[group.source_section_id] = current && current !== group.relationship
      ? `${current} ${group.relationship}`
      : group.relationship
  }

  return workflowRecord({
    workflow_id,
    search_queries_used,
    official_pages_opened: exactDocuments.map((sourceId) => SOURCE_META[sourceId]?.url).filter(Boolean),
    exact_documents_opened: exactDocuments,
    exact_sections_reviewed: exactSections,
    candidate_sources_rejected: [
      ...candidate_sources_rejected,
      `automatic management or dose instructions for ${title}`,
      `generic anesthesia landing pages without an exact section for ${title}`,
    ],
    rejection_reasons: [
      ...alignedRejectionReasons,
      'Autonomous management, medication, dose, procedure, escalation, or discharge instructions were outside the documentation-only scope.',
      'Landing pages and search snippets were not accepted as exact evidence.',
    ],
    selected_primary_sources: primarySources,
    selected_supporting_sources: supportingSources,
    population_applicability,
    setting_applicability,
    UAE_applicability,
    recency_verification,
    superseded_check,
    unresolved_source_gaps: [
      ...unresolved_source_gaps,
      'Legacy duration presets, broad generic interval-history wording, and any content not explicitly mapped to an exact section remain unsupported pending qualified clinician review.',
      'No source mapping authorises an automatic diagnosis, anesthesia plan, investigation, procedure, medication, dose, referral, discharge decision, or urgency conclusion.',
      'UAE facility policy, credentialing, pathway, and qualified anesthesiologist review remain required before use.',
    ],
    section_relationships: sectionRelationships,
    support_groups: [
      ...conceptGroups,
      commonPreoperative,
      commonPlan,
    ],
  })
}

export function anesthesiaIdentityTexts(title, contextText, extras = []) {
  return [title, contextText, 'onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', ...extras]
}

export default {
  batch_id: 'authored-batch-support',
  sources: [],
  workflows: [],
}

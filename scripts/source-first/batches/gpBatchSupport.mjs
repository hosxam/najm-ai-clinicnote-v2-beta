import { evidenceWorkflow, noAuthoritativeWorkflow, section, SOURCE_META } from './authoredBatchSupport.mjs'

export const REVIEW_DATE = '2026-07-14'

export const history = [
  'onset/duration documented if discussed',
  'severity/impact on function documented if discussed',
  'associated symptoms reviewed if relevant',
  'relevant negatives documented if assessed',
]

export const goals = ['patient concerns or goals documented if discussed']
export const followup = [...history, 'change since last review documented']

export const exam = [
  'Vital signs documented only if assessed',
  'General appearance documented only if assessed',
  'Focused system examination documented only if assessed',
  'Relevant negatives if assessed documented only if assessed',
]

export const concern = [
  'severe or rapidly worsening symptoms documented if assessed',
  'abnormal vital signs documented if measured',
  'new neurological, cardiorespiratory, or systemic concern documented if assessed',
  'clinician concern requiring escalation documented if present',
]

export const results = [
  'Relevant observations reviewed if measured',
  'Laboratory results reviewed if already ordered',
  'Existing reports or records reviewed if available',
]

export const plan = [
  'clinician-entered plan documented',
  'safety-netting documented if discussed by clinician',
  'follow-up documented if arranged by clinician',
  'patient questions documented if discussed',
]

export const GP_SOURCES = [
  {
    registry_file: 'international_clinical_sources.json',
    source: {
      source_id: 'who-audit-primary-care-2001',
      issuing_organisation: 'World Health Organization',
      exact_document_title: 'AUDIT: The Alcohol Use Disorders Identification Test — Guidelines for Use in Primary Care, Second Edition',
      exact_official_url: 'https://iris.who.int/bitstream/handle/10665/67205/WHO_MSD_MSB_01.6a-eng.pdf',
      publication_date: '2001-11-18',
      effective_date: '2001-11-18',
      revision_date: null,
      version: 'Second edition; WHO/MSD/MSB/01.6a',
      jurisdiction: 'World Health Organization international guidance requiring UAE service adaptation',
      population: 'Adults in primary and general healthcare settings where alcohol-use screening or brief assessment is clinically appropriate.',
      clinical_setting: 'Primary healthcare and general medical care.',
      applicability_note: 'Supports clinician-entered alcohol frequency, quantity, heavy-use episodes, dependence-related symptoms, alcohol-related harm, and screening context without automatically scoring, diagnosing, or generating intervention advice.',
      recency_verification: { verified_on: REVIEW_DATE, status: 'official_WHO_publication_page_and_exact_manual_reviewed' },
      superseded_status_check: { checked_on: REVIEW_DATE, status: 'official_WHO_AUDIT_second_edition_remains_published_for_primary_care_use' },
      exact_sections: [
        section('who-audit-2001-purpose-context', 'Purpose of the manual and context of alcohol screening', 'manual pages 4–7', 'Supports documenting why alcohol use was reviewed and the primary-care screening context without asserting hazardous use.'),
        section('who-audit-2001-consumption-harm-items', 'AUDIT questions and domains', 'manual pages 15–18 and Appendix B', 'Supports recording alcohol frequency, typical quantity, heavy-use episodes, dependence-related symptoms, harmful consequences, concern from others, and prior injury without automatically scoring or diagnosing.'),
      ],
    },
  },
]

Object.assign(SOURCE_META, {
  'who-audit-primary-care-2001': { url: 'https://iris.who.int/bitstream/handle/10665/67205/WHO_MSD_MSB_01.6a-eng.pdf' },
  'nice-ibs-cg61-2025': { url: 'https://www.nice.org.uk/guidance/cg61/chapter/recommendations' },
  'bsg-abnormal-liver-blood-tests-2018': { url: 'https://www.bsg.org.uk/getmedia/b51bdc64-7145-43ad-828b-21f473b0a918/Guidelines-on-the-management-of-abnormal-liver-blood-tests.pdf' },
  'bsg-iron-deficiency-anaemia-2021': { url: 'https://www.bsg.org.uk/getmedia/3e13dd5c-8e7b-4110-87c5-dcc1feee495d/Iron-Deficiency-Aneamia-in-Adults.pdf' },
  'dha-telehealth-constipation-v2-2024': { url: 'https://dha.gov.ae/uploads/032024/04%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20Of%20Constipation2024324786.pdf' },
  'dha-telehealth-cough-v2-2024': { url: 'https://dha.gov.ae/uploads/032024/46%20-%20DHA%20Telehealth%20Clinical%20Guidelines%20for%20Virtual%20Management%20of%20Cough2024321176.pdf' },
  'bsg-chronic-diarrhoea-2018': { url: 'https://www.bsg.org.uk/clinical-resource/bsg-guidelines-chronic-diarrhoea' },
  'nice-gord-dyspepsia-cg184-2019': { url: 'https://www.nice.org.uk/guidance/cg184/chapter/Recommendations' },
  'nice-suspected-neurological-conditions-ng127-2023': { url: 'https://www.nice.org.uk/guidance/ng127/chapter/recommendations-for-adults-aged-over-16' },
  'nice-headaches-cg150-2025': { url: 'https://www.nice.org.uk/guidance/cg150/chapter/recommendations' },
  'ascrs-hemorrhoids-2024': { url: 'https://fascrs.org/ascrs/media/files/2024-Hemorrhoids-CPG.pdf' },
})

export function gpEvidence(config) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: config.setting_applicability ?? 'Primary-care documentation and follow-up as qualified by the exact source and clinical context.',
    UAE_applicability: config.UAE_applicability ?? 'International evidence requires UAE primary-care, laboratory, prescribing, referral, safeguarding, and local-pathway adaptation.',
    recency_verification: config.recency_verification ?? `Exact official documents and sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited exact source remains current on the issuing organisation website at the review date.',
  })
}

export function gpNoSource(config) {
  return noAuthoritativeWorkflow({
    ...config,
    setting_applicability: config.setting_applicability ?? 'Primary-care documentation; the workflow purpose is too broad or administrative for a single exact clinical guideline.',
    UAE_applicability: config.UAE_applicability ?? 'No exact current UAE or directly applicable authoritative documentation guideline was identified for the unqualified workflow purpose.',
    recency_verification: config.recency_verification ?? `Official UAE and international sources were searched on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'No directly applicable exact guideline was selected.',
  })
}

export default { batch_id: 'gp-batch-support', sources: [], workflows: [] }

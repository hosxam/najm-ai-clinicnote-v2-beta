const recency = {
  schema_version: '1.0.0',
  policy_version: '1.0.0',
  evaluated_on: '2026-07-16',
  recency_basis: 'access_verification_only',
  recency_outcome: 'access_verification_current',
  basis_field: 'recency_verification.verified_on',
  basis_value: '2026-07-16',
  basis_precision: 'day',
  basis_comparison_date: '2026-07-16',
  verification_date: '2026-07-16',
  verification_age_days: 0,
  maximum_verification_age_days: 30,
  routine_recheck_due_on: '2026-08-15',
  recheck_warning_starts_on: '2026-08-08',
  next_required_recheck_date: '2026-08-15',
  remains_available: true,
  appears_superseded: false,
  recorded_recency_gap: false,
}

const sourceMetadataReplayRef = (source_id) => ({
  manifest_path: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json',
  manifest_version: '2.0.0',
  source_id,
  entry_digest: null,
})

const sourceBase = ({
  source_id,
  exact_document_title,
  exact_official_url,
  version,
  population,
  clinical_setting,
  applicability_note,
  exact_sections,
}) => ({
  source_id,
  issuing_organisation: "Royal Children's Hospital Melbourne",
  exact_document_title,
  exact_official_url,
  publication_date: null,
  effective_date: null,
  revision_date: null,
  version,
  jurisdiction: 'Australia; official paediatric guidance requiring UAE adaptation',
  population,
  clinical_setting,
  applicability_note,
  recency_verification: {
    verified_on: '2026-07-16',
    status: 'official_RCH_document_and_exact_sections_reviewed',
    revision_due: null,
  },
  superseded_status_check: {
    checked_on: '2026-07-16',
    status: 'current_official_RCH_page_or_document_reviewed_no_superseding_source_identified',
  },
  exact_sections,
  source_recency: recency,
  source_metadata_replay_ref: sourceMetadataReplayRef(source_id),
})

export const wave11SourceDefinitions = [
  {
    registry_file: 'international_clinical_sources.json',
    source: sourceBase({
      source_id: 'rch-acute-abdominal-pain-guideline-2025',
      exact_document_title: 'Clinical Practice Guideline: Abdominal pain — acute',
      exact_official_url: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/',
      version: 'Royal Children\'s Hospital Melbourne guideline; last updated April 2024; accessed 2026-07-16',
      population: 'Children and young people with acute abdominal pain.',
      clinical_setting: 'Paediatric primary, emergency and hospital assessment of acute abdominal pain.',
      applicability_note: 'Exact for documenting pain characteristics, associated symptoms, vital signs and hydration, focused abdominal examination, targeted investigations, clinician assessment, consultation or transfer consideration, discharge criteria and follow-up advice. It does not generate a diagnosis, treatment, referral or disposition automatically.',
      exact_sections: [
        { section_id: 'rch-abdominal-key-points', heading: 'Key Points', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#key-points', evidence_summary: 'Supports documenting repeated examination, investigation selection and red-flag awareness without autonomous diagnosis.' },
        { section_id: 'rch-abdominal-history', heading: 'History', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#assessment', evidence_summary: 'Supports pain characteristics, associated systemic, stool, vomiting, urinary, menstrual and psychosocial history.' },
        { section_id: 'rch-abdominal-examination', heading: 'Examination', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#assessment', evidence_summary: 'Supports vital signs, hydration, abdominal inspection, palpation, serial examination and focused related examination findings.' },
        { section_id: 'rch-abdominal-investigations', heading: 'Investigations', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#management', evidence_summary: 'Supports clinician-selected investigation documentation and actual result entry without interpreting results automatically.' },
        { section_id: 'rch-abdominal-consultation', heading: 'Consider consultation with local paediatric team when', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#management', evidence_summary: 'Supports clinician-recorded consultation or escalation consideration for serious or surgical features.' },
        { section_id: 'rch-abdominal-discharge', heading: 'Consider discharge when', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Abdominal_pain_-_acute/#management', evidence_summary: 'Supports clinician-entered follow-up and advice-to-seek-care documentation when concerning features are absent.' },
      ],
    }),
  },
  {
    registry_file: 'international_clinical_sources.json',
    source: sourceBase({
      source_id: 'rch-vomiting-guideline-2025',
      exact_document_title: 'Clinical Practice Guideline: Vomiting',
      exact_official_url: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/',
      version: 'Royal Children\'s Hospital Melbourne guideline; last updated September 2025; accessed 2026-07-16',
      population: 'Infants, children and young people presenting with vomiting.',
      clinical_setting: 'Paediatric primary, emergency and hospital assessment of vomiting.',
      applicability_note: 'Exact for documenting vomiting nature, associated symptoms, hydration and neurological or abdominal findings, focused examination, selected investigations, clinician assessment, escalation, discharge and follow-up advice. It does not generate diagnosis, medicine, dose or disposition automatically.',
      exact_sections: [
        { section_id: 'rch-vomiting-key-points', heading: 'Key points', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#key-points', evidence_summary: 'Supports red-flag documentation including bilious vomiting, absence of diarrhoea and possible intracranial causes.' },
        { section_id: 'rch-vomiting-history', heading: 'History', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#assessment', evidence_summary: 'Supports documenting the nature of vomiting and associated symptoms without inferring a diagnosis.' },
        { section_id: 'rch-vomiting-examination', heading: 'Examination', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#assessment', evidence_summary: 'Supports abdominal, neurological, hydration and general examination findings.' },
        { section_id: 'rch-vomiting-investigations', heading: 'Investigations', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#management', evidence_summary: 'Supports clinician-selected investigation documentation and actual values.' },
        { section_id: 'rch-vomiting-escalation', heading: 'Consider consultation with local paediatric team when', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#management', evidence_summary: 'Supports recording escalation consideration for acute illness, metabolic derangement or diagnostic uncertainty.' },
        { section_id: 'rch-vomiting-discharge', heading: 'Consider discharge when', locator: 'https://www.rch.org.au/clinicalguide/guideline_index/Vomiting/#management', evidence_summary: 'Supports clinician-entered follow-up and clear earlier-review instructions.' },
      ],
    }),
  },
  {
    registry_file: 'international_clinical_sources.json',
    source: sourceBase({
      source_id: 'rch-gastroenteritis-kidsinfo-pdf-2025',
      exact_document_title: 'Gastroenteritis (gastro)',
      exact_official_url: 'https://www.rch.org.au/uploadedFiles/Main/Content/kidsinfo/english-gastroenteritis.pdf',
      version: 'Royal Children\'s Hospital Kids Health Information PDF; official document accessed 2026-07-16',
      population: 'Babies, children and young people with gastroenteritis symptoms.',
      clinical_setting: 'Paediatric community, primary and urgent assessment documentation.',
      applicability_note: 'Exact for documenting diarrhoea, vomiting, fever, oral intake, hydration concerns, red flags and clinician-entered review advice. It is patient-facing information and does not generate diagnosis, medicine, dose or disposition automatically.',
      exact_sections: [
        { section_id: 'rch-gastro-page-1', heading: 'Page 1 — signs, symptoms and care context', locator: { url: 'https://www.rch.org.au/uploadedFiles/Main/Content/kidsinfo/english-gastroenteritis.pdf', page: 1 }, evidence_summary: 'Supports recording diarrhoea, vomiting, fever, fluid intake and dehydration-risk context.' },
        { section_id: 'rch-gastro-page-2', heading: 'Page 2 — when to see a doctor', locator: { url: 'https://www.rch.org.au/uploadedFiles/Main/Content/kidsinfo/english-gastroenteritis.pdf', page: 2 }, evidence_summary: 'Supports documenting inability to retain fluids, dehydration signs, blood or green vomit and clinician review advice.' },
      ],
    }),
  },
]

export default wave11SourceDefinitions

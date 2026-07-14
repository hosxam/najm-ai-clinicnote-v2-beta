import {
  SOURCE_META,
  evidenceWorkflow,
  noAuthoritativeWorkflow,
  section,
} from './authoredBatchSupport.mjs'

const REVIEW_DATE = '2026-07-14'

const sources = [{
  registry_file: 'specialty_society_sources.json',
  source: {
    source_id: 'aao-hns-sudden-hearing-loss-2019',
    issuing_organisation: 'American Academy of Otolaryngology–Head and Neck Surgery Foundation',
    exact_document_title: 'Clinical Practice Guideline: Sudden Hearing Loss (Update)',
    exact_official_url: SOURCE_META['aao-hns-sudden-hearing-loss-2019'].url,
    publication_date: '2019-08-01',
    effective_date: '2019-08-01',
    revision_date: null,
    version: '2019 update replacing the 2012 guideline',
    jurisdiction: 'United States specialty guideline; international evidence requiring UAE ENT and audiology adaptation',
    population: 'Adults aged 18 years and older presenting with sudden hearing loss, primarily idiopathic sudden sensorineural hearing loss.',
    clinical_setting: 'Initial and follow-up assessment by clinicians who diagnose or manage adult sudden hearing loss.',
    applicability_note: 'Exact for documenting sudden onset, laterality, associated neurological or otological context, examination, audiometric confirmation, reviewed results, and follow-up. It does not infer sensorineural loss or generate treatment, imaging, referral, timing, or urgency.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_AAO_HNSF_2019_update_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'official_page_identifies_2019_as_current_update' },
    exact_sections: [
      section('aao-shl-2019-initial-assessment', 'Key action statements 1–6 — initial distinction, modifying factors, and audiometric confirmation', 'official guideline page, executive summary, and fact sheet key action statements 1–6', 'Supports documenting sudden onset, bilateral or recurrent episodes, focal neurological findings, clinician-performed ear assessment, and clinician-reviewed audiometry without asserting a diagnosis or ordering a test.'),
      section('aao-shl-2019-followup-outcomes', 'Key action statements 12–13 — education, follow-up, and outcomes', 'official guideline page and fact sheet key action statements 12–13', 'Supports recording clinician-completed information discussion, questions, follow-up assessment, and reviewed hearing outcomes without generating treatment or a follow-up interval.'),
    ],
  },
}]

const commonPlanTexts = ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed']
const commonHistoryTexts = ['onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed']

function entEvidence(config) {
  return evidenceWorkflow({
    ...config,
    search_queries_used: config.search_queries_used,
    candidate_sources_rejected: config.candidate_sources_rejected,
    rejection_reasons: config.rejection_reasons,
    population_applicability: config.population_applicability,
    setting_applicability: 'Primary, urgent, audiology, respiratory, sleep, or ENT assessment as qualified by the reviewed source and workflow purpose.',
    UAE_applicability: 'International evidence requires UAE ENT, audiology, sleep-service, emergency, prescribing, referral, and local pathway adaptation.',
    recency_verification: `Exact official sections and current source pages were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on its issuing organisation website at the review date.',
    unresolved_source_gaps: config.unresolved_source_gaps,
  })
}

const workflows = [
  entEvidence({
    workflow_id: 'ent-sleep-disordered-breathing-ent-documentation',
    evidence_groups: [
      { source_id: 'nice-osahs-ng202-2021', source_section_id: 'nice-ng202-osahs-initial-assessment', relationship: 'The exact adult OSAHS assessment section supports documenting snoring, witnessed pauses, choking, sleep quality, waking symptoms, daytime impact, functional safety context, obesity and comorbidity context without diagnosing sleep apnoea or calculating a score.', exact_texts: commonHistoryTexts },
      { source_id: 'aao-hns-tonsillectomy-children-2019', source_section_id: 'aao-tonsillectomy-2019-sleep-comorbidity', relationship: 'The exact paediatric section supports caregiver-reported sleep-disordered breathing and selected comorbidity context plus clinician-performed ENT assessment; it does not recommend surgery or testing.', exact_texts: ['Ear/nose/throat examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'nice-osahs-ng202-2021', source_section_id: 'nice-ng202-osahs-followup-monitoring', relationship: 'The exact adult follow-up section supports recording a clinician-entered plan, safety discussion, arranged follow-up, and questions only when actually documented.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:nice.org.uk NG202 OSAHS initial assessment symptoms snoring witnessed apnoea adults', 'site:entnet.org tonsillectomy children sleep-disordered breathing comorbid conditions'],
    candidate_sources_rejected: ['adult OSAHS guidance applied automatically to children', 'paediatric tonsillectomy guidance used to recommend surgery'],
    rejection_reasons: ['Adult and paediatric evidence are mapped separately and remain population-qualified.', 'The paediatric source supports documentation domains only; no operation, test, treatment, or referral is generated.'],
    population_applicability: 'Partial age-neutral coverage: NICE applies to people over 16; AAO-HNSF applies to children aged 1 to 18. Infants, pregnancy, craniofacial, neuromuscular, and complex airway contexts require separate assessment.',
    unresolved_source_gaps: ['The workflow does not distinguish adult from paediatric presentation, established OSAHS from undifferentiated symptoms, or device follow-up from initial ENT review.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'ent-smell-loss',
    search_queries_used: ['site:entuk.org loss of smell guideline anosmia', 'site:entnet.org anosmia clinical practice guideline smell loss', 'site:who.int smell loss clinical guideline'],
    official_pages_opened: ['https://www.entnet.org/covid-19/anosmia/', 'https://www.entnet.org/resource/clinical-indicators-laryngoscopy-nasopharyngoscopy/'],
    candidate_sources_rejected: ['AAO-HNS COVID-19 anosmia information page', 'AAO-HNS laryngoscopy clinical indicators'],
    rejection_reasons: ['The page is pandemic-specific and does not provide a current general smell-loss assessment guideline.', 'The indicators list procedure indications and codes rather than a complete smell-loss documentation standard.'],
    population_applicability: 'Age-neutral undifferentiated smell loss, including post-viral, sinonasal, traumatic, medication-related, neurological, and other causes.',
    setting_applicability: 'Primary or ENT assessment.',
    UAE_applicability: 'No exact current UAE or directly applicable authoritative general smell-loss guideline was identified.',
    recency_verification: `Official society pages were searched and reviewed on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable current guideline was found to supersede or validate the retained generic legacy content.',
    unresolved_source_gaps: ['Onset, character, taste distinction, infection, obstruction, trauma, medicine, neurological context, examination, testing, safety, treatment, and follow-up remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-snoring-ent-review',
    evidence_groups: [
      { source_id: 'nice-osahs-ng202-2021', source_section_id: 'nice-ng202-osahs-initial-assessment', relationship: 'The adult exact section supports interval snoring history, witnessed breathing disturbance, sleep quality, daytime impact, functional safety and comorbidity context without asserting OSAHS.', exact_texts: [...commonHistoryTexts, 'change since last review documented'] },
      { source_id: 'aao-hns-tonsillectomy-children-2019', source_section_id: 'aao-tonsillectomy-2019-sleep-comorbidity', relationship: 'The paediatric exact section supports caregiver-reported snoring and sleep-related comorbidity context plus ENT examination without recommending tonsillectomy or polysomnography.', exact_texts: ['Ear/nose/throat examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'nice-osahs-ng202-2021', source_section_id: 'nice-ng202-osahs-followup-monitoring', relationship: 'The exact adult follow-up section supports documenting clinician-entered review plans and follow-up without creating device, testing, or restriction advice.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:nice.org.uk NG202 snoring witnessed apnoea daytime sleepiness assessment', 'site:entnet.org paediatric sleep-disordered breathing tonsillectomy guideline snoring'],
    candidate_sources_rejected: ['snoring treated as confirmed OSAHS', 'adult evidence applied to paediatric snoring without qualification'],
    rejection_reasons: ['Snoring alone does not establish a sleep disorder.', 'The workflow remains partial because age and comorbidity context are not encoded.'],
    population_applicability: 'People with snoring under ENT review; adult and paediatric evidence is kept separate and neither establishes a diagnosis.',
    unresolved_source_gaps: ['Age, caregiver observations, sleep schedule, nasal and tonsillar context, prior tests, established diagnosis, device use, and occupational or driving context remain unsupported unless explicitly documented.'],
  }),
  entEvidence({
    workflow_id: 'ent-sudden-hearing-change-documentation',
    evidence_groups: [
      { source_id: 'aao-hns-sudden-hearing-loss-2019', source_section_id: 'aao-shl-2019-initial-assessment', relationship: 'The exact adult section supports documenting sudden onset, functional impact, associated otological or neurological symptoms, relevant negatives, ear examination and reviewed audiology without inferring sensorineural loss.', exact_texts: [...commonHistoryTexts, 'Ear/nose/throat examination documented only if assessed', 'Audiology or tympanometry results reviewed if available', 'clinician concern requiring escalation documented if present'] },
      { source_id: 'aao-hns-sudden-hearing-loss-2019', source_section_id: 'aao-shl-2019-followup-outcomes', relationship: 'The exact follow-up section supports clinician-entered documentation, risk discussion, follow-up, and specialist discussion only when completed.', exact_texts: ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed'] },
    ],
    search_queries_used: ['site:entnet.org sudden hearing loss update 2019 key action statements', 'site:nice.org.uk NG98 sudden hearing loss adults referral assessment'],
    candidate_sources_rejected: ['automatic sudden sensorineural hearing loss diagnosis', 'automatic steroid, imaging, audiology, referral, or urgency instruction'],
    rejection_reasons: ['Sudden hearing change has conductive, sensorineural, neurological, and other causes requiring direct assessment.', 'The mapping documents only clinician-assessed or reviewed information.'],
    population_applicability: 'Adults aged 18 years or older with sudden hearing change; children require separate evidence.',
    unresolved_source_gaps: ['Paediatric sudden hearing change, exact onset interval, laterality, cause, diagnosis, investigation, treatment, and urgency remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-swallowing-symptom-ent-review',
    evidence_groups: [
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-upper-gi-dysphagia-jaundice', relationship: 'The exact dysphagia section supports documenting swallowing symptoms, duration, impact, associated symptoms, relevant negatives and clinician concern in recommendation-qualified contexts without asserting cancer or referral.', exact_texts: [...commonHistoryTexts, 'change since last review documented', 'clinician concern requiring escalation documented if present'] },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-head-neck-features', relationship: 'The exact head-and-neck section supports clinician-performed ENT and neck assessment and review of voice, oral, or neck features without asserting malignancy.', exact_texts: ['Ear/nose/throat examination documented only if assessed', 'Neck examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-safety-netting-review', relationship: 'The exact safety-net section supports documenting an entered plan, safety net, review, and questions without generating a referral or interval.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:nice.org.uk NG12 dysphagia head neck oral cancer symptoms recommendations', 'site:dha.gov.ae dysphagia ENT guideline UAE'],
    candidate_sources_rejected: ['dysphagia treated as malignancy', 'automatic endoscopy, imaging, swallowing study, diet, referral, or urgency'],
    rejection_reasons: ['The source supplies recognition context only and does not establish a diagnosis.', 'Investigation and management remain clinician-entered.'],
    population_applicability: 'People with swallowing symptoms; age-specific recommendation thresholds and acute airway or neurological presentations require separate pathways.',
    unresolved_source_gaps: ['Oropharyngeal versus oesophageal symptoms, aspiration, neurological disease, nutrition, acute obstruction, investigation, diagnosis, and management remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-throat-clearing',
    evidence_groups: [
      { source_id: 'bts-chronic-cough-adults-2023', source_section_id: 'bts-cc-2023-history-examination', relationship: 'The exact adult chronic-cough section supports duration, throat-clearing or cough context, triggers, smoking, medicine, rhinitis, reflux, functional impact and upper-airway examination without assigning a cause.', exact_texts: [...commonHistoryTexts, 'Ear/nose/throat examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'bts-chronic-cough-adults-2023', source_section_id: 'bts-cc-2023-investigation-referral', relationship: 'The exact investigation context supports recording reviewed specialist information and a clinician-entered plan or follow-up without ordering tests or treatment.', exact_texts: ['Imaging or specialist report reviewed if already available', ...commonPlanTexts] },
    ],
    search_queries_used: ['site:brit-thoracic.org.uk chronic cough adults throat clearing upper airway history', 'site:bsaci.org rhinitis throat clearing postnasal drip guideline'],
    candidate_sources_rejected: ['automatic reflux, allergy, rhinitis, or chronic-cough diagnosis', 'automatic medicine, imaging, endoscopy, or referral'],
    rejection_reasons: ['Throat clearing is nonspecific and requires cause-specific assessment.', 'No autonomous investigation or management was mapped.'],
    population_applicability: 'Adults receive partial chronic-cough support; children and acute symptoms require separate evidence.',
    unresolved_source_gaps: ['Paediatric presentation, exact cause, laryngeal findings, infection, reflux, tic or habit context, diagnosis, and treatment remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-tinnitus-impact-review',
    evidence_groups: [
      { source_id: 'nice-tinnitus-ng155-2020', source_section_id: 'nice-tinnitus-ng155-support-history', relationship: 'The exact section supports interval tinnitus experience, duration, concerns, hearing and noise context, sleep impact, preferences and discussion without asserting a cause.', exact_texts: [...commonHistoryTexts, 'change since last review documented'] },
      { source_id: 'nice-tinnitus-ng155-2020', source_section_id: 'nice-tinnitus-ng155-impact', relationship: 'The exact impact section supports documenting quality-of-life, sleep, concentration, mental-health and school or work impact plus clinician-performed assessment.', exact_texts: ['General appearance documented only if assessed'] },
      { source_id: 'nice-tinnitus-ng155-2020', source_section_id: 'nice-tinnitus-ng155-investigations', relationship: 'The exact investigations section supports reviewing existing audiology, tympanometry, imaging or specialist results without ordering tests.', exact_texts: ['Audiology or tympanometry results reviewed if available', 'Imaging or specialist report reviewed if already available'] },
      { source_id: 'nice-tinnitus-ng155-2020', source_section_id: 'nice-tinnitus-ng155-support-history', relationship: 'The support section allows recording a jointly documented management discussion, follow-up, and questions without creating advice.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:nice.org.uk NG155 tinnitus impact sleep quality life assessment recommendations', 'site:nice.org.uk NG155 tinnitus audiology imaging referral'],
    candidate_sources_rejected: ['automatic tinnitus questionnaire score or interpretation', 'automatic imaging, hearing aid, therapy, referral, or treatment'],
    rejection_reasons: ['Scores and results must be clinician-entered.', 'No autonomous investigation or management is generated.'],
    population_applicability: 'Adults, children and young people with tinnitus, with age-appropriate assessment and communication.',
    unresolved_source_gaps: ['Exact tinnitus type, laterality, pulsatility, mental-health risk, test results, diagnosis, and management remain clinician-entered.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'ent-tmj-related-ear-symptoms',
    search_queries_used: ['site:entnet.org temporomandibular ear symptoms guideline', 'site:nice.org.uk temporomandibular disorder ear pain guideline', 'site:doh.gov.ae temporomandibular disorder guideline'],
    official_pages_opened: ['https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/'],
    candidate_sources_rejected: ['general ENT guideline catalogue', 'non-official dental and private-clinic TMJ summaries'],
    rejection_reasons: ['The catalogue is not an exact clinical evidence section for TMJ-related ear symptoms.', 'Commercial and tertiary summaries were not accepted as primary evidence.'],
    population_applicability: 'People with ear symptoms suspected by a clinician to relate to the temporomandibular joint; otological, dental, neurological, trauma, and inflammatory causes remain possible.',
    setting_applicability: 'Primary, dental, maxillofacial, or ENT assessment.',
    UAE_applicability: 'No exact current UAE or directly applicable authoritative documentation guideline was identified.',
    recency_verification: `Official source catalogues were searched on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable guideline was identified.',
    unresolved_source_gaps: ['Pain pattern, jaw movement, bruxism, dental history, ear findings, joint examination, diagnosis, investigation, treatment, and referral remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-tongue-lesion-documentation',
    evidence_groups: [
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-head-neck-features', relationship: 'The exact oral-cavity section supports duration, symptoms, functional impact, associated features, relevant negatives, patient concern, clinician-performed oral and neck assessment, and concern documentation without asserting malignancy.', exact_texts: [...commonHistoryTexts, 'Ear/nose/throat examination documented only if assessed', 'Neck examination documented only if assessed', 'General appearance documented only if assessed', 'clinician concern requiring escalation documented if present'] },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-safety-netting-review', relationship: 'The exact section supports clinician-entered plan, safety net, follow-up, and questions without generating biopsy, referral, or urgency.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:nice.org.uk NG12 oral ulcer tongue lesion oral cavity lump recommendations', 'site:dha.gov.ae oral lesion referral guideline UAE'],
    candidate_sources_rejected: ['automatic oral cancer diagnosis', 'automatic biopsy, imaging, referral, or urgency'],
    rejection_reasons: ['The section lists recognition features and does not diagnose cancer.', 'Actions remain clinician-entered and recommendation-qualified.'],
    population_applicability: 'People with tongue or oral-cavity lesions; age, duration, trauma, infection, immune status, and specialist examination alter applicability.',
    unresolved_source_gaps: ['Lesion morphology, exact site, trauma, infection, medicine, dental context, pathology, diagnosis, and management remain unsupported.'],
  }),
  entEvidence({
    workflow_id: 'ent-tonsil-size-documentation',
    evidence_groups: [
      { source_id: 'aao-hns-tonsillectomy-children-2019', source_section_id: 'aao-tonsillectomy-2019-sleep-comorbidity', relationship: 'The exact paediatric section supports documenting caregiver-reported sleep symptoms, functional or behavioural impact, relevant negatives, ENT examination and comorbidity context without diagnosing tonsillar hypertrophy or recommending surgery.', exact_texts: [...commonHistoryTexts, 'Ear/nose/throat examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'aao-hns-tonsillectomy-children-2019', source_section_id: 'aao-tonsillectomy-2019-recurrent-assessment', relationship: 'The exact recurrent-infection section supports clinician-entered review documentation without applying a tonsillectomy threshold.', exact_texts: commonPlanTexts },
    ],
    search_queries_used: ['site:entnet.org tonsillectomy children tonsillar hypertrophy sleep-disordered breathing comorbidities', 'site:entnet.org tonsil size documentation guideline'],
    candidate_sources_rejected: ['tonsil size treated as sleep apnoea or surgical indication', 'paediatric evidence applied automatically to adults'],
    rejection_reasons: ['Tonsil appearance alone does not establish diagnosis, severity, or treatment need.', 'Adult applicability remains unsupported.'],
    population_applicability: 'Children aged 1 to 18 with clinician-assessed tonsillar findings; adult tonsil assessment requires separate evidence.',
    unresolved_source_gaps: ['Adult population, grading method, asymmetry, acute infection, airway status, diagnosis, surgery, testing, and follow-up interval remain unsupported.'],
  }),
]

export default {
  batch_id: 'source-first-0526-0535',
  description: 'Workflow-specific ENT sleep, hearing, swallowing, tinnitus, oral, and tonsillar exact-section review.',
  sources,
  workflows,
}

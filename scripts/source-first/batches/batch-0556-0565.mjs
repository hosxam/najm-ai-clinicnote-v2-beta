import { SOURCE_META, evidenceWorkflow, noAuthoritativeWorkflow, section } from './authoredBatchSupport.mjs'

const REVIEW_DATE = '2026-07-14'
const registeredSource = (registry_file, source) => ({ registry_file, source })

const sources = [
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-nutrition-support-cg32-2017',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Nutrition support for adults: oral nutrition support, enteral tube feeding and parenteral nutrition — Recommendations',
    exact_official_url: SOURCE_META['nice-nutrition-support-cg32-2017'].url,
    publication_date: '2006-02-22',
    effective_date: '2006-02-22',
    revision_date: '2017-08-04',
    version: 'NICE clinical guideline CG32, last updated 2017',
    jurisdiction: 'England and Wales; international evidence requiring UAE nutrition, dietetics, consent, capacity, and referral adaptation',
    population: 'Adults in hospital and community settings with clinical concern for malnutrition or impaired intake.',
    clinical_setting: 'General practice, community, hospital, nutrition, and multidisciplinary assessment.',
    applicability_note: 'Exact for documenting unintentional weight loss, poor appetite, altered taste, impaired swallowing, altered bowel habit, reduced intake, BMI and percentage weight loss when measured. It does not calculate risk or generate nutrition support.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_CG32_recommendations_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_CG32_page_last_updated_2017' },
    exact_sections: [
      section('nice-cg32-screening-concern', 'Recommendations 1.2.1–1.2.6 — screening, clinical concern, weight loss, intake, and swallowing', 'official recommendations 1.2.1–1.2.6', 'Supports documenting unintentional weight loss, appetite, taste, swallowing, bowel habit, prolonged illness, BMI, percentage weight loss, reduced intake and future intake risk when actually assessed.'),
      section('nice-cg32-malnutrition-risk-context', 'Recommendations 1.3.1–1.3.4 — malnutrition and consent context', 'official recommendations 1.3.1–1.3.4', 'Supports clinician-recorded malnutrition or risk criteria and consent or best-interest discussion; no diagnosis, calculation, feeding route, or treatment is generated.'),
    ],
  }),
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-older-people-wellbeing-ng32-2015',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Older people: independence and mental wellbeing — Recommendations',
    exact_official_url: SOURCE_META['nice-older-people-wellbeing-ng32-2015'].url,
    publication_date: '2015-12-17',
    effective_date: '2015-12-17',
    revision_date: null,
    version: 'NICE guideline NG32',
    jurisdiction: 'England and Wales public-health guidance; international evidence requiring UAE community and social-care adaptation',
    population: 'People aged 65 or older, with focus on those at risk of decline in independence and mental wellbeing.',
    clinical_setting: 'Community, public health, primary care, and services interacting with older people.',
    applicability_note: 'Exact for documenting social connection, living circumstances, life events, retirement, bereavement, driving cessation, age-related disability, loneliness, interests and support context. It does not generate an activity or service recommendation.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_NG32_recommendations_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_guideline_page' },
    exact_sections: [
      section('nice-ng32-social-connection-activities', 'Recommendations 1.1.1–1.4.4 — social connection, interests, group, one-to-one, and volunteering context', 'official recommendations 1.1.1–1.4.4', 'Supports documenting interests, social connection, purpose, friendship, communication access, activities and volunteering context without auto-prescribing participation.'),
      section('nice-ng32-risk-isolation-decline', 'Recommendations 1.5.1–1.5.4 — identifying risk of decline in independence and wellbeing', 'official recommendations 1.5.1–1.5.4', 'Supports documenting bereavement, living alone, limited social opportunity, separation, retirement, unemployment, low income, recent illness, driving cessation, age-related disability and advanced age as context without asserting loneliness or decline.'),
    ],
  }),
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-depression-ng222-2026',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Depression in adults: treatment and management — Recommendations',
    exact_official_url: SOURCE_META['nice-depression-ng222-2026'].url,
    publication_date: '2022-06-29',
    effective_date: '2022-06-29',
    revision_date: '2026-01-30',
    version: 'NICE guideline NG222; reviewed 30 January 2026',
    jurisdiction: 'England and Wales; international evidence requiring UAE mental-health, crisis, referral, and legal adaptation',
    population: 'Adults with possible or diagnosed depression; communication and carer involvement are qualified.',
    clinical_setting: 'Primary and mental healthcare recognition and assessment.',
    applicability_note: 'Exact for documenting mood and interest screening, duration, course, function, social and interpersonal context, sleep, substances, medicines, loneliness and clinician-completed risk assessment. It does not diagnose depression or generate a referral or treatment.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_NG222_reviewed_2026_01_30' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_guideline_page' },
    exact_sections: [
      section('nice-ng222-recognition-assessment', 'Recommendations 1.2.1–1.2.7 — recognition, comprehensive assessment, function, and context', 'official recommendations 1.2.1–1.2.7', 'Supports documenting low mood, loss of interest, duration, course, functional, interpersonal and social difficulty, previous mood history, physical and mental comorbidity, sleep, stressful events, medicines, substances, loneliness and support.'),
      section('nice-ng222-risk-assessment', 'Recommendations 1.2.8–1.2.12 — clinician-completed risk assessment', 'official recommendations 1.2.8–1.2.12', 'Supports recording that suicidal ideation, intent, support and immediate risk were directly assessed by a competent clinician; it does not populate a negative, assign risk, or generate escalation.'),
    ],
  }),
]

const history = ['onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed']
const followup = [...history, 'change since last review documented']
const exam = ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Medication/support context documented only if assessed']
const records = ['Medication list or reconciliation documentation reviewed if available', 'Falls/cognition/function screen results documented if completed', 'Caregiver or care-home records reviewed if available']
const plan = ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed']

function geri(config) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: 'Primary, community, geriatric, care-home, hospital-follow-up, or multidisciplinary review as qualified by the exact source.',
    UAE_applicability: 'International evidence requires UAE geriatric, primary-care, medicines, mental-health, nutrition, social-care, consent, capacity, referral, and local policy adaptation.',
    recency_verification: `Exact official sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on the issuing organisation website at the review date.',
  })
}

const workflows = [
  geri({
    workflow_id: 'geri-home-safety-discussion-documentation',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-identification', relationship: 'The exact section supports documenting falls history, concerns and functional impact that prompted a home-safety discussion without predicting future falls.', exact_texts: history },
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact assessment section supports clinician-assessed gait, balance, footwear, function, vision, cognition, continence, medicines and support context without auto-generating a home modification.', exact_texts: [...exam, ...records] },
    ],
    search_queries_used: ['site:nice.org.uk NG249 falls home hazards home safety assessment older people', 'site:nice.org.uk NG249 comprehensive falls assessment gait footwear vision medicines'],
    candidate_sources_rejected: ['automatic home modification, equipment, exercise, or referral advice', 'generic home-safety checklist treated as patient-specific assessment'],
    rejection_reasons: ['The workflow records only discussion completed by a clinician.', 'Home context and hazards require direct assessment.'],
    population_applicability: 'Older people and people aged 50 to 64 at higher falls risk as qualified by NG249.',
    unresolved_source_gaps: ['Actual home hazards, occupational therapy assessment, equipment, modifications, funding, referral, and follow-up remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-medication-deprescribing-discussion-documentation',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports documenting treatment burden, benefits, harms, personal goals, values, priorities, function and carer involvement without deciding to stop treatment.', exact_texts: [...history, 'Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-treatment-review', relationship: 'The exact treatment-review section supports recording a clinician-led discussion about reducing or stopping treatment and review planning without generating a medicine change.', exact_texts: ['Medication list or reconciliation documentation reviewed if available', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG56 reducing stopping treatment multimorbidity frailty preferences', 'site:nice.org.uk NG5 medicines decisions values preferences benefits harms'],
    candidate_sources_rejected: ['automatic deprescribing recommendation', 'automatic medicine stop, taper, dose change, or monitoring plan'],
    rejection_reasons: ['Only a clinician-completed discussion is documented.', 'No medication action is generated.'],
    population_applicability: 'Adults with multimorbidity, treatment burden, limited life expectancy or frailty where a clinician is reviewing treatment.',
    unresolved_source_gaps: ['Specific medicines, indications, interactions, withdrawal risk, taper, dose, monitoring, prescriber responsibility, and final decision remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-mobility-limitation-documentation',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact section supports documenting mobility, gait, balance, muscle strength, function, footwear, neurological, vision, hearing, cognition, medicines and support context without assigning cause or recommending equipment.', exact_texts: [...history, ...exam, ...records] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports independence, social participation, carer involvement and clinician-entered planning.', exact_texts: [...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG249 mobility gait balance functional ability assessment', 'site:nice.org.uk NG56 independence personal goals function carers'],
    candidate_sources_rejected: ['automatic mobility diagnosis or dependency grade', 'automatic walking aid, physiotherapy, imaging, exercise, or referral'],
    rejection_reasons: ['Mobility limitation has multiple causes requiring direct assessment.', 'No intervention is generated.'],
    population_applicability: 'Older adults with mobility limitation; acute neurological deficit, injury, severe pain and acute illness require separate pathways.',
    unresolved_source_gaps: ['Cause, onset, neurological findings, pain, environment, aid fit, diagnosis, investigation, treatment, and referral remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-mood-screening',
    evidence_groups: [
      { source_id: 'nice-depression-ng222-2026', source_section_id: 'nice-ng222-recognition-assessment', relationship: 'The exact adult section supports documenting mood, interest, duration, course, function, social and interpersonal context, sleep, substances, medicines, loneliness and support without diagnosing depression.', exact_texts: [...history, 'Functional/cognitive screen documentation documented only if assessed', 'Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-depression-ng222-2026', source_section_id: 'nice-ng222-risk-assessment', relationship: 'The exact risk section supports recording clinician-completed direct assessment and concern only; it does not populate a negative or assign risk.', exact_texts: ['clinician concern requiring escalation documented if present'] },
      { source_id: 'nice-depression-ng222-2026', source_section_id: 'nice-ng222-recognition-assessment', relationship: 'The exact assessment section supports clinician-entered plan, follow-up and questions without generating treatment.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG222 depression recognition assessment function social sleep substances loneliness', 'site:nice.org.uk NG222 suicidal ideation risk assessment recommendations'],
    candidate_sources_rejected: ['automatic depression diagnosis or severity category', 'automatic suicide-risk classification, medication, therapy, or referral'],
    rejection_reasons: ['Screening and assessment do not establish diagnosis.', 'Risk and management require competent clinician judgement.'],
    population_applicability: 'Adults including older adults; delirium, dementia, bereavement, bipolar symptoms, communication needs and acute risk require tailored assessment.',
    unresolved_source_gaps: ['Specific screening tool and score, diagnosis, bipolar context, capacity, risk outcome, treatment, and referral remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-nutrition-risk-review',
    evidence_groups: [
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-screening-concern', relationship: 'The exact section supports interval weight loss, poor appetite, reduced intake, altered taste, swallowing, bowel habit, prolonged illness, BMI and functional impact when assessed without calculating risk.', exact_texts: [...followup, 'Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-malnutrition-risk-context', relationship: 'The exact section supports recording clinician-reviewed criteria, consent or best-interest context, and an entered plan without generating nutrition support.', exact_texts: ['Functional/cognitive screen documentation documented only if assessed', 'Falls/cognition/function screen results documented if completed', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk CG32 nutrition screening weight loss poor appetite swallowing reduced intake BMI', 'site:nice.org.uk CG32 malnutrition risk consent best interest'],
    candidate_sources_rejected: ['automatic malnutrition diagnosis or MUST score', 'automatic supplement, feeding route, diet, referral, or monitoring interval'],
    rejection_reasons: ['Measurements and scores must be clinician-entered.', 'No nutrition intervention is generated.'],
    population_applicability: 'Adults with clinical concern for malnutrition; older age alone does not establish risk.',
    unresolved_source_gaps: ['Measured weight, BMI, percentage loss, intake duration, swallowing safety, diagnosis, consent, treatment, dietetics, and monitoring remain unsupported unless entered.'],
  }),
  geri({
    workflow_id: 'geri-osteoporosis-risk-review',
    evidence_groups: [
      { source_id: 'doh-osteoporosis-screening-v09-2019', source_section_id: 'doh-osteoporosis-2019-risk-factors', relationship: 'The exact Abu Dhabi section supports documenting falls, low weight, smoking or alcohol, medicine, personal or family fracture history and secondary-cause context without assigning osteoporosis.', exact_texts: [...followup, 'Medication/support context documented only if assessed', 'Medication list or reconciliation documentation reviewed if available'] },
      { source_id: 'doh-osteoporosis-screening-v09-2019', source_section_id: 'doh-osteoporosis-2019-fracture-risk', relationship: 'The exact section supports clinician-reviewed fracture-risk, falls and BMD context plus completed functional assessment without auto-calculating FRAX.', exact_texts: ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'doh-osteoporosis-screening-v09-2019', source_section_id: 'doh-osteoporosis-2019-dexa', relationship: 'The exact section supports documenting clinician-reviewed DEXA information and entered follow-up without independently interpreting or diagnosing.', exact_texts: ['clinician-entered plan documented', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed'] },
    ],
    search_queries_used: ['site:doh.gov.ae osteoporosis screening guideline risk factors fracture risk DEXA Abu Dhabi', 'site:doh.gov.ae Guideline for Screening of Osteoporosis 2019'],
    candidate_sources_rejected: ['automatic FRAX or BMD interpretation', 'automatic DEXA, medicine, supplement, referral, or surveillance interval'],
    rejection_reasons: ['Risk calculations and diagnoses must be clinician-entered.', 'No investigation or treatment is generated.'],
    population_applicability: 'Abu Dhabi screening population, primarily adults over 50, with recommendation-specific risk qualifiers.',
    unresolved_source_gaps: ['Exact age and sex threshold, measured risk, fracture details, DEXA result, diagnosis, medicine, dose, and follow-up interval remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-polypharmacy-review',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact section supports documenting multiple regular medicines, adverse-event risk, treatment burden, frailty, falls and function without defining patient-specific polypharmacy risk.', exact_texts: [...followup, ...exam] },
      { source_id: 'nice-medicines-optimisation-ng5-2015', source_section_id: 'nice-ng5-transfer-reconciliation', relationship: 'The exact section supports accurate medication-list and reconciliation review, including prescribed, over-the-counter and complementary medicines, without changing treatment.', exact_texts: ['Medication list or reconciliation documentation reviewed if available', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-treatment-review', relationship: 'The exact section supports clinician-led review of benefit, harm, treatment burden and personal priorities plus documented plan and follow-up without generating a change.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG56 multiple medicines treatment burden frailty falls review', 'site:nice.org.uk NG5 medicines reconciliation prescribed OTC complementary'],
    candidate_sources_rejected: ['automatic inappropriate-medicine flag', 'automatic start, stop, substitute, taper, dose, interaction, or monitoring action'],
    rejection_reasons: ['Medication appropriateness requires indication, history, tests, interactions and patient priorities.', 'No medication decision is generated.'],
    population_applicability: 'Adults with multiple regular medicines, especially multimorbidity, frailty or treatment burden.',
    unresolved_source_gaps: ['Complete medicines, indications, adherence, interactions, renal or hepatic status, prescriber responsibility, changes, doses, and monitoring remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-post-hospital-geriatric-follow-up',
    evidence_groups: [
      { source_id: 'nice-medicines-optimisation-ng5-2015', source_section_id: 'nice-ng5-transfer-reconciliation', relationship: 'The exact transfer section supports interval discharge context, current medicines, documented changes, reconciliation, person or carer involvement and reviewed discharge records without changing treatment.', exact_texts: [...followup, 'Medication/support context documented only if assessed', 'Medication list or reconciliation documentation reviewed if available', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact section supports clinician-assessed function, frailty, falls, gait and support-service burden after discharge.', exact_texts: ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports treatment burden, carer involvement, clinician-entered plan, follow-up and questions.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG5 discharge medicines reconciliation primary care older people', 'site:nice.org.uk NG56 multimorbidity function frailty goals carers transitions'],
    candidate_sources_rejected: ['automatic post-discharge diagnosis or stability conclusion', 'automatic medicine change, investigation, home service, readmission, or referral'],
    rejection_reasons: ['Post-discharge needs depend on the actual admission, discharge summary, and current assessment.', 'All actions remain clinician-entered.'],
    population_applicability: 'Older adults after hospital discharge; acute deterioration and condition-specific follow-up require separate pathways.',
    unresolved_source_gaps: ['Admission diagnosis, procedures, complications, discharge instructions, pending results, current stability, services, and follow-up interval remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-pressure-area-risk-review',
    evidence_groups: [
      { source_id: 'nice-pressure-ulcers-cg179-2014', source_section_id: 'nice-cg179-risk-skin-assessment', relationship: 'The exact adult section supports interval mobility, prior or current pressure injury, nutrition, cognition, sensory impairment, posture, deformity, skin integrity, colour, heat, firmness, moisture and pain when assessed.', exact_texts: [...followup, ...exam, 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-pressure-ulcers-cg179-2014', source_section_id: 'nice-cg179-ulcer-documentation', relationship: 'The exact ulcer documentation section supports clinician-measured area, depth, undermining, photography and category when actually completed; generic plan fields remain clinician-entered.', exact_texts: ['Falls/cognition/function screen results documented if completed', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk CG179 pressure ulcer risk skin assessment mobility nutrition cognition', 'site:nice.org.uk CG179 ulcer measurement categorisation documentation'],
    candidate_sources_rejected: ['automatic pressure-ulcer category or risk score', 'automatic repositioning, mattress, dressing, medicine, referral, or interval'],
    rejection_reasons: ['Findings and categories must be entered by a clinician.', 'No preventive or treatment instruction is generated.'],
    population_applicability: 'Adults at risk of or with pressure ulcers; paediatric and neonatal populations require separate evidence.',
    unresolved_source_gaps: ['Exact skin site and findings, validated risk tool, category, wound measurement, infection, equipment, treatment, and monitoring remain unsupported unless entered.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'geri-referral-documentation',
    search_queries_used: ['site:nice.org.uk geriatric referral documentation guideline', 'site:who.int older people referral documentation integrated care', 'site:doh.gov.ae geriatric referral guideline'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng56/chapter/recommendations'],
    candidate_sources_rejected: ['NICE multimorbidity recommendations', 'generic referral templates and service directories'],
    rejection_reasons: ['NG56 supports person-centred review but not a generic geriatric referral-documentation standard.', 'Templates and directories do not establish clinical content, urgency, destination, or acceptance criteria.'],
    population_applicability: 'Older adults referred for a clinician-defined reason; specialty, urgency, condition, capacity, consent and service criteria are unspecified.',
    setting_applicability: 'Primary, community, hospital, or geriatric referral documentation.',
    UAE_applicability: 'No exact UAE-wide generic geriatric referral-documentation guideline was identified.',
    recency_verification: `Official sources were searched on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable current authoritative source was found.',
    unresolved_source_gaps: ['Referral reason, clinical findings, urgency, destination, consent, capacity, attachments, communication, and follow-up remain unsupported.'],
  }),
]

export default {
  source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0556-0565', description: 'Workflow-specific geriatric safety, medicines, mobility, mood, nutrition, osteoporosis, transition, and pressure-area review.', sources, workflows }

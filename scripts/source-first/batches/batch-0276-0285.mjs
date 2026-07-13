import path from 'node:path'
import { EXPANSION_DIR, readJson } from '../common.mjs'
import {
  SOURCE_META,
  evidenceWorkflow,
  section,
} from './authoredBatchSupport.mjs'

function registeredSource(registry_file, source) {
  return { registry_file, source }
}

function extendRegisteredSource(registryFile, sourceId, additionalSections, applicabilityAddition) {
  const registry = readJson(path.join(EXPANSION_DIR, 'sources', registryFile))
  const existing = registry.sources.find((source) => source.source_id === sourceId)
  if (!existing) throw new Error(`${sourceId}: source to extend is not registered`)
  const addedIds = new Set(additionalSections.map((candidate) => candidate.section_id))
  return {
    ...existing,
    applicability_note: `${existing.applicability_note} ${applicabilityAddition}`,
    recency_verification: { ...existing.recency_verification, verified_on: '2026-07-14' },
    superseded_status_check: { ...existing.superseded_status_check, checked_on: '2026-07-14' },
    exact_sections: [
      ...existing.exact_sections.filter((candidate) => !addedIds.has(candidate.section_id)),
      ...additionalSections,
    ],
  }
}

const sources = [
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-venous-thromboembolic-diseases-ng158-2023',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Venous thromboembolic diseases: diagnosis, management and thrombophilia testing',
    exact_official_url: SOURCE_META['nice-venous-thromboembolic-diseases-ng158-2023'].url,
    publication_date: '2020-03-26',
    effective_date: '2020-03-26',
    revision_date: '2023-08-02',
    version: 'NICE guideline NG158, last updated 2 August 2023',
    jurisdiction: 'England and Wales; international evidence requiring UAE adaptation',
    population: 'People presenting with signs or symptoms of deep vein thrombosis or pulmonary embolism and people receiving related follow-up.',
    clinical_setting: 'Initial medical assessment and clinician-led diagnostic pathways for suspected venous thromboembolic disease.',
    applicability_note: 'Exact for documenting a swollen or painful leg history, physical examination, conditional DVT or PE risk features, and clinician-entered assessment context. It does not calculate Wells or PERC scores, infer DVT or PE, order tests, prescribe anticoagulation, or determine urgency.',
    recency_verification: { verified_on: '2026-07-14', status: 'current_official_NICE_NG158_recommendations_opened_last_updated_2023', revision_due: null },
    superseded_status_check: { checked_on: '2026-07-14', status: 'current_NICE_NG158_no_superseding_guideline_identified' },
    exact_sections: [
      section('nice-ng158-dvt-history-examination', 'Recommendations 1.1.1–1.1.2 and Table 1 — DVT history, examination, and clinician-scored features', 'official recommendations lines 48–110', 'Supports documenting swollen or painful leg context, general medical history, physical examination, laterality and swelling or tenderness findings, immobility, surgery, malignancy, previous DVT, and a clinician-entered score only. No score is calculated.'),
      section('nice-ng158-pe-history-examination', 'Recommendations 1.1.15–1.1.17 and Table 2 — PE history, examination, and clinician-scored features', 'official recommendations lines 219–277', 'Supports documenting chest pain, shortness of breath, haemoptysis, vital-sign and examination context, prior VTE, immobilisation or surgery, malignancy, and a clinician-entered score only. No diagnosis or score is inferred.'),
      section('nice-ng158-outpatient-followup-information', 'Recommendation 1.2.4 — clinician-agreed monitoring and follow-up', 'official recommendations lines 342–365', 'Supports documenting an already agreed monitoring or follow-up plan and information already provided for confirmed or suspected low-risk PE; it does not generate that plan.'),
    ],
  }),
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-medicines-adherence-cg76-2009',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Medicines adherence: involving patients in decisions about prescribed medicines and supporting adherence',
    exact_official_url: SOURCE_META['nice-medicines-adherence-cg76-2009'].url,
    publication_date: '2009-01-28',
    effective_date: '2009-01-28',
    revision_date: null,
    version: 'NICE clinical guideline CG76',
    jurisdiction: 'England and Wales; international evidence requiring UAE adaptation',
    population: 'People prescribed medicines and healthcare professionals who prescribe, dispense, or review medicines.',
    clinical_setting: 'Shared medicine decisions, adherence assessment, support, and periodic medicine review.',
    applicability_note: 'Exact for non-judgemental adherence history, missed-dose or medicine-taking behaviour documentation, beliefs, concerns, practical barriers, preferred support, and periodic review. It does not recommend a medicine, dose, change, or adherence intervention automatically.',
    recency_verification: { verified_on: '2026-07-14', status: 'official_NICE_CG76_recommendations_opened_legacy_guideline_recency_gap', revision_due: null },
    superseded_status_check: { checked_on: '2026-07-14', status: 'CG76_current_with_recommendation_1_4_2_replaced_by_NG5' },
    exact_sections: [
      section('nice-cg76-beliefs-concerns-review', 'Recommendations 1.1.19–1.1.23 — knowledge, beliefs, and concerns about medicines', 'official recommendations lines 120–149', 'Supports documenting the person’s understanding, perceived need, concerns, adverse-effect concerns, daily-routine fit, and questions during medicine review.'),
      section('nice-cg76-adherence-assessment-support', 'Recommendations 1.2.1–1.2.8 — non-judgemental adherence assessment and tailored support', 'official recommendations lines 210–259', 'Supports documenting missed doses, stopping or restarting, intentional or practical barriers, and support preferences without generating an intervention.'),
      section('nice-cg76-periodic-medicine-review', 'Recommendations 1.3.1–1.3.2 — periodic review', 'official recommendations lines 281–287', 'Supports documenting periodic review of knowledge, concerns, need, and clinician prescribing decisions.'),
    ],
  }),
  registeredSource('international_clinical_sources.json', extendRegisteredSource(
    'international_clinical_sources.json',
    'nice-hypertension-ng136-2026',
    [section('nice-ng136-postural-hypotension-measurement', 'Recommendations 1.1.5–1.1.8 — postural hypotension symptoms and standing blood pressure', 'official NICE NG136 recommendations 1.1.5–1.1.8', 'Supports documenting postural dizziness or falls context, lying or seated and standing blood pressure measurements, timing, symptoms, and clinician review without diagnosing orthostatic hypotension or changing treatment.')],
    'The postural-hypotension section additionally supports clinician-entered orthostatic blood-pressure documentation without automatic diagnosis or management.',
  )),
]

const cardioExam = [
  'Vital signs documented only if assessed',
  'Cardiovascular examination documented only if assessed',
  'Respiratory examination documented only if assessed',
  'Peripheral perfusion / edema documented only if assessed',
]

const cardioResults = [
  'ECG reviewed if performed by clinician',
  'Blood pressure or home readings reviewed if available',
  'Cardiac or laboratory results reviewed if already ordered',
]

const clinicianPlan = [
  'clinician-entered plan documented',
  'safety-netting documented if discussed by clinician',
  'follow-up documented if arranged by clinician',
  'patient questions documented if discussed',
]

const workflows = [
  evidenceWorkflow({
    workflow_id: 'cardio-leg-swelling-differential-documentation',
    evidence_groups: [
      {
        source_id: 'nice-venous-thromboembolic-diseases-ng158-2023',
        source_section_id: 'nice-ng158-dvt-history-examination',
        relationship: 'NG158 directly supports clinician documentation of a swollen or painful leg history and physical examination, including conditional thromboembolic risk features, while leaving the broad differential and any score entirely clinician-entered.',
        exact_texts: ['Leg swelling differential documentation', 'Leg swelling differential documentation context documented', 'onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', ...cardioExam],
      },
      {
        source_id: 'nice-venous-thromboembolic-diseases-ng158-2023',
        source_section_id: 'nice-ng158-pe-history-examination',
        relationship: 'The PE section supports documenting associated chest pain, breathlessness, haemoptysis, vital signs, examination, and clinician concern only when assessed; it does not infer PE or urgency.',
        exact_texts: ['severe or rapidly worsening symptoms documented if assessed', 'abnormal vital signs documented if measured', 'new neurological, cardiorespiratory, or systemic concern documented if assessed', 'clinician concern requiring escalation documented if present', 'ECG reviewed if performed by clinician'],
      },
      {
        source_id: 'nice-chronic-heart-failure-ng106-2025',
        source_section_id: 'nice-ng106-diagnosis-assessment-tests',
        relationship: 'NG106 supports documenting edema with cardiorespiratory history, examination, and already reviewed cardiac or laboratory results when heart failure is clinically considered, without concluding a cardiac cause.',
        exact_texts: ['Cardiac or laboratory results reviewed if already ordered'],
      },
    ],
    reviewed_sections: [{ source_id: 'nice-venous-thromboembolic-diseases-ng158-2023', source_section_id: 'nice-ng158-outpatient-followup-information', relationship: 'Follow-up guidance was reviewed but not mapped because the generic swelling workflow does not establish VTE or low-risk outpatient status.' }],
    search_queries_used: ['site:nice.org.uk NG158 swollen painful leg history physical examination DVT', 'site:nice.org.uk NG106 edema breathlessness examination heart failure', 'site:doh.gov.ae leg swelling DVT assessment'],
    candidate_sources_rejected: ['automatic DVT or PE differential and Wells scoring', 'automatic ultrasound, anticoagulation, diuretic, compression, referral, or emergency disposition'],
    rejection_reasons: ['The workflow does not contain enough confirmed findings to calculate a score or infer a diagnosis.', 'Investigation and management decisions require direct clinician assessment and UAE pathway context.'],
    selected_primary_sources: ['nice-venous-thromboembolic-diseases-ng158-2023'],
    selected_supporting_sources: ['nice-chronic-heart-failure-ng106-2025'],
    population_applicability: 'Adults with undifferentiated leg swelling; VTE evidence applies only when DVT or PE is clinically considered, and heart-failure evidence applies only to relevant cardiac context.',
    setting_applicability: 'Primary or outpatient documentation with direct escalation outside this tool when clinically required.',
    UAE_applicability: 'NICE evidence requires UAE emergency, vascular, imaging, laboratory, anticoagulation, maternity, cardiology, renal, hepatic, and facility-policy adaptation.',
    recency_verification: 'Current NICE NG158 and NG106 pages were reviewed on 2026-07-14.',
    superseded_check: 'NG158 and NG106 remain current NICE guidance for their defined scopes.',
    unresolved_source_gaps: ['Laterality, exact distribution, pitting, skin change, pain, warmth, tenderness, travel, immobility, trauma, pregnancy or postpartum status, hormone exposure, malignancy, renal or hepatic context, medicine context, verified test results, clinician differential, diagnosis, urgency, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-lifestyle-counseling-cardiac-documentation',
    evidence_groups: [{
      source_id: 'nice-cvd-lipid-modification-ng238-2023',
      source_section_id: 'nice-ng238-risk-lifestyle-review',
      relationship: 'NG238 supports clinician-led cardiovascular risk and lifestyle discussion, patient preferences, already measured risk factors, and an entered plan without automatically generating advice.',
      exact_texts: ['Lifestyle counseling cardiac documentation', 'Lifestyle counseling cardiac documentation context documented', 'severity/impact on function documented if discussed', 'patient concerns or goals documented if discussed', 'Vital signs documented only if assessed', 'Blood pressure or home readings reviewed if available', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
    }],
    reviewed_sections: [{ source_id: 'mohap-tobacco-dependence-guideline-2024', source_section_id: 'mohap-tobacco-guide-identify-assess', relationship: 'UAE tobacco assessment guidance was independently reviewed for smoking-specific counseling context; no smoking status or advice is inferred.' }],
    search_queries_used: ['site:nice.org.uk NG238 lifestyle cardiovascular risk review preferences', 'site:mohap.gov.ae tobacco dependence guideline 2024 assess smoking', 'site:doh.gov.ae cardiovascular lifestyle counseling'],
    candidate_sources_rejected: ['one-size-fits-all diet, exercise, weight, alcohol, or smoking advice', 'automatic cardiovascular risk score or treatment target'],
    rejection_reasons: ['Lifestyle documentation must reflect the clinician-stated discussion and individual context.', 'No score inputs, calculation, diagnosis, target, or treatment were generated.'],
    population_applicability: 'Adults undergoing clinician-led cardiovascular prevention or follow-up discussion.',
    setting_applicability: 'Primary and outpatient cardiovascular documentation.',
    UAE_applicability: 'NICE risk guidance requires UAE risk-tool, cultural, dietary, exercise, preventive-service, and facility adaptation; the MOHAP tobacco source is UAE-specific for tobacco context only.',
    recency_verification: 'NICE NG238 and the MOHAP 2024 tobacco guideline were reviewed on 2026-07-14.',
    superseded_check: 'Both selected sources remain current for the reviewed scopes.',
    unresolved_source_gaps: ['Actual diet, activity, tobacco, alcohol, sleep, weight, comorbidities, preferences, readiness, goals, counseling content, risk calculation, clinician plan, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-lipid-follow-up',
    evidence_groups: [
      {
        source_id: 'nice-cvd-lipid-modification-ng238-2023',
        source_section_id: 'nice-ng238-lipid-assessment-baseline-tests',
        relationship: 'NG238 supports documenting lipid-review context, already available lipid and baseline laboratory results, risk factors, and patient preferences without interpreting the values.',
        exact_texts: ['Lipid follow-up', 'Lipid follow-up interval history documented', 'change since last review documented', 'patient concerns or goals documented if discussed', 'Cardiac or laboratory results reviewed if already ordered'],
      },
      {
        source_id: 'nice-cvd-lipid-modification-ng238-2023',
        source_section_id: 'nice-ng238-lipid-response-annual-review',
        relationship: 'The annual-review section supports recording clinician review of response, adverse effects, adherence, an entered plan, questions, and arranged follow-up; no lipid target or medicine change is generated.',
        exact_texts: ['associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:nice.org.uk NG238 lipid profile baseline assessment annual review adverse effects adherence', 'site:doh.gov.ae lipid follow-up guideline'],
    candidate_sources_rejected: ['automatic lipid interpretation or cardiovascular risk calculation', 'automatic statin initiation, intensification, dose, or monitoring interval'],
    rejection_reasons: ['Actual values, fasting status, risk context, comorbidities, and clinician interpretation are required.', 'No medicine, dose, target, treatment, or interval was generated.'],
    population_applicability: 'Adults undergoing lipid and cardiovascular-risk follow-up.',
    setting_applicability: 'Primary and outpatient prevention review.',
    UAE_applicability: 'NICE evidence requires UAE laboratory ranges, approved risk tools, formulary, prescribing, monitoring, and facility adaptation.',
    recency_verification: 'Current NICE NG238 was reviewed on 2026-07-14.',
    superseded_check: 'NG238 remains current.',
    unresolved_source_gaps: ['Lipid values and dates, family history, secondary causes, risk score, medicine and dose, adherence details, adverse effects, liver or muscle context, pregnancy potential, clinician interpretation, treatment, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-medication-adherence-hypertension-review',
    evidence_groups: [
      {
        source_id: 'nice-medicines-adherence-cg76-2009',
        source_section_id: 'nice-cg76-adherence-assessment-support',
        relationship: 'CG76 directly supports non-judgemental documentation of recent medicine-taking behaviour, missed doses, intentional or practical barriers, and preferred support without changing treatment.',
        exact_texts: ['Medication adherence hypertension review', 'Medication adherence hypertension review interval history documented', 'change since last review documented', 'patient concerns or goals documented if discussed', 'relevant negatives documented if assessed'],
      },
      {
        source_id: 'nice-hypertension-ng136-2026',
        source_section_id: 'nice-ng136-monitoring-annual-review',
        relationship: 'NG136 supports documenting already measured clinic or home blood pressure, symptoms, annual-review context, and clinician-entered follow-up without inferring control or changing medicines.',
        exact_texts: ['associated symptoms reviewed if relevant', 'Vital signs documented only if assessed', 'Blood pressure or home readings reviewed if available', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
      },
    ],
    reviewed_sections: [{ source_id: 'nice-medicines-adherence-cg76-2009', source_section_id: 'nice-cg76-beliefs-concerns-review', relationship: 'Beliefs and concerns were reviewed for adherence applicability and remain clinician-entered.' }],
    search_queries_used: ['site:nice.org.uk CG76 non-judgemental adherence missed doses medicine review', 'site:nice.org.uk NG136 hypertension annual review home blood pressure', 'site:dha.gov.ae hypertension medication adherence telehealth'],
    candidate_sources_rejected: ['automatic non-adherence label', 'automatic antihypertensive start, stop, switch, dose, or target'],
    rejection_reasons: ['Adherence requires a patient discussion and cannot be inferred from a generic record.', 'No medicine decision, dose, target, or blood-pressure interpretation was generated.'],
    population_applicability: 'Adults prescribed antihypertensive medicines and undergoing adherence review.',
    setting_applicability: 'Primary and outpatient hypertension follow-up.',
    UAE_applicability: 'NICE evidence requires UAE formulary, prescribing, blood-pressure technique, targets, pharmacy, and facility adaptation.',
    recency_verification: 'NICE CG76 and current NG136 were reviewed on 2026-07-14.',
    superseded_check: 'CG76 remains current with one replaced communication recommendation; NG136 remains current.',
    unresolved_source_gaps: ['Medicine names, indications, doses, schedule, actual adherence, reasons, adverse effects, blood-pressure values, home technique, comorbidities, interactions, clinician interpretation, changes, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-medication-review',
    evidence_groups: [
      {
        source_id: 'nice-medicines-optimisation-ng5-2015',
        source_section_id: 'nice-ng5-structured-medication-review',
        relationship: 'NG5 supports a structured clinician-led medication review, documented indications, safety and monitoring context, patient concerns, and an entered plan without recommending changes.',
        exact_texts: ['Cardiology medication review', 'Cardiology medication review interval history documented', 'change since last review documented', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
      },
      {
        source_id: 'nice-medicines-adherence-cg76-2009',
        source_section_id: 'nice-cg76-beliefs-concerns-review',
        relationship: 'CG76 supports documenting medicine understanding, perceived need, and concerns during the cardiology review without implying adherence or changing therapy.',
        exact_texts: ['severity/impact on function documented if discussed'],
      },
    ],
    search_queries_used: ['site:nice.org.uk NG5 structured medication review monitoring patient concerns', 'site:nice.org.uk CG76 medicine beliefs concerns review', 'site:doh.gov.ae cardiology medication review'],
    candidate_sources_rejected: ['automatic cardiovascular medication reconciliation from incomplete data', 'automatic medicine start, stop, substitution, dose, interaction, or monitoring order'],
    rejection_reasons: ['A complete verified medicine list and indication are required for reconciliation.', 'All medication decisions remain clinician-entered and outside this documentation template.'],
    population_applicability: 'Adults undergoing clinician-led review of cardiovascular medicines.',
    setting_applicability: 'Primary, outpatient cardiology, and care-transition documentation.',
    UAE_applicability: 'NICE evidence requires UAE formulary, pharmacy, reconciliation, prescribing, monitoring, and facility-policy adaptation.',
    recency_verification: 'NICE NG5 and CG76 were reviewed on 2026-07-14; both have material age-related recency limitations.',
    superseded_check: 'NG5 remains current; CG76 remains current with recommendation 1.4.2 replaced by NG5.',
    unresolved_source_gaps: ['Verified medicine list, indication, dose, frequency, duration, adherence, allergies, adverse effects, interactions, monitoring values, reconciliation sources, clinician decisions, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-orthostatic-bp-documentation',
    evidence_groups: [{
      source_id: 'nice-hypertension-ng136-2026',
      source_section_id: 'nice-ng136-postural-hypotension-measurement',
      relationship: 'NG136 directly supports clinician documentation of postural symptoms and lying or seated and standing blood-pressure measurements while leaving diagnosis and treatment entirely clinician-entered.',
      exact_texts: ['Orthostatic BP documentation', 'Orthostatic BP documentation context documented', 'onset/duration documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'Vital signs documented only if assessed', 'Blood pressure or home readings reviewed if available', ...clinicianPlan],
    }],
    search_queries_used: ['site:nice.org.uk NG136 postural hypotension standing blood pressure symptoms', 'site:doh.gov.ae orthostatic blood pressure measurement'],
    candidate_sources_rejected: ['automatic orthostatic blood-pressure calculation or diagnosis', 'automatic medicine adjustment, fluid advice, compression, or referral'],
    rejection_reasons: ['Measurement positions, timing, values, symptoms, and clinician interpretation must be explicitly documented.', 'No diagnosis or management was generated.'],
    population_applicability: 'Adults with postural dizziness, falls, or clinician-selected orthostatic blood-pressure assessment.',
    setting_applicability: 'Primary and outpatient blood-pressure assessment.',
    UAE_applicability: 'NICE evidence requires UAE measurement protocol, equipment, prescribing, falls, referral, and facility adaptation.',
    recency_verification: 'Current NICE NG136 was reviewed on 2026-07-14.',
    superseded_check: 'NG136 remains current.',
    unresolved_source_gaps: ['Body position, rest period, exact timing, blood-pressure and pulse values, symptoms during measurement, hydration, medicines, falls, autonomic or neurological context, clinician interpretation, diagnosis, treatment, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-pacemaker-follow-up-documentation',
    evidence_groups: [{
      source_id: 'hrs-remote-device-clinic-2023',
      source_section_id: 'hrs-remote-device-workflow-documentation',
      relationship: 'The multisociety device-clinic statement supports documenting device-follow-up context, transmission or in-clinic data review, qualified sign-off, communication, and arranged follow-up without interpreting device findings.',
      exact_texts: ['Pacemaker follow-up documentation', 'Pacemaker follow-up documentation interval history documented', 'change since last review documented', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', 'ECG reviewed if performed by clinician', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
    }],
    reviewed_sections: [{ source_id: 'hrs-remote-device-clinic-2023', source_section_id: 'hrs-remote-device-alert-review', relationship: 'Alert review was checked for follow-up applicability; no alert, urgency, device event, or treatment is inferred.' }],
    search_queries_used: ['site:hrsonline.org 2023 remote device clinic documentation review transmission follow-up pacemaker', 'site:doh.gov.ae pacemaker follow-up'],
    candidate_sources_rejected: ['automatic pacemaker interrogation interpretation', 'automatic programming, alert priority, medicine, procedure, or emergency action'],
    rejection_reasons: ['Device interrogation requires the actual report, device model, lead and battery data, and qualified interpretation.', 'No device or clinical action was generated.'],
    population_applicability: 'People with a pacemaker undergoing in-clinic or remote device follow-up.',
    setting_applicability: 'Specialist cardiac device clinic and linked outpatient documentation.',
    UAE_applicability: 'International HRS consensus requires UAE device-clinic governance, manufacturer, connectivity, emergency, referral, and facility adaptation.',
    recency_verification: 'The 2023 HRS/EHRA/APHRS/LAHRS consensus was reviewed on 2026-07-14.',
    superseded_check: 'No newer full multisociety remote-device-clinic consensus was identified.',
    unresolved_source_gaps: ['Device model and indication, implant date, leads, battery, sensing, pacing, arrhythmia episodes, alerts, symptoms, wound, connectivity, report date and quality, formal interpretation, programming, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-palpitations-follow-up',
    evidence_groups: [
      {
        source_id: 'hrs-ishne-ambulatory-ecg-2017',
        source_section_id: 'hrs-aecg-syncope-palpitations',
        relationship: 'The HRS consensus supports documenting palpitation recurrence, event frequency, symptom context, change, and symptom-rhythm correlation when an ambulatory record exists; it does not diagnose an arrhythmia.',
        exact_texts: ['Palpitations follow-up', 'Palpitations follow-up interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed'],
      },
      {
        source_id: 'nice-atrial-fibrillation-ng196-2021',
        source_section_id: 'nice-ng196-detection-ecg-ambulatory',
        relationship: 'NG196 supports documenting clinician-assessed pulse or symptoms, an already performed 12-lead or ambulatory ECG, and follow-up context when atrial fibrillation is suspected; it does not infer AF.',
        exact_texts: [...cardioExam, ...cardioResults, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:hrsonline.org ambulatory ECG palpitations symptom rhythm correlation 2017', 'site:nice.org.uk NG196 palpitations ECG ambulatory', 'site:doh.gov.ae palpitations assessment'],
    candidate_sources_rejected: ['automatic arrhythmia or atrial-fibrillation diagnosis', 'automatic ECG order, monitor duration, medicine, referral, or urgency'],
    rejection_reasons: ['Palpitations require event details, examination, tracing, and qualified interpretation.', 'No investigation or management decision was generated.'],
    population_applicability: 'Adults with recurrent palpitations undergoing follow-up; AF guidance applies only when AF is clinically suspected.',
    setting_applicability: 'Primary, outpatient cardiology, and ambulatory rhythm follow-up.',
    UAE_applicability: 'International HRS and NICE evidence requires UAE ECG, device, cardiology, emergency, referral, and facility adaptation.',
    recency_verification: 'NICE NG196 and the 2017 HRS consensus were reviewed on 2026-07-14; the HRS source has an age-related recency gap.',
    superseded_check: 'NG196 remains current; no newer full HRS ambulatory-ECG consensus was identified.',
    unresolved_source_gaps: ['Episode frequency, duration, rhythm quality, triggers, chest pain, breathlessness, syncope, family history, medicines or substances, pulse, ECG findings, monitor report, diagnosis, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-palpitations-review',
    evidence_groups: [
      {
        source_id: 'hrs-ishne-ambulatory-ecg-2017',
        source_section_id: 'hrs-aecg-syncope-palpitations',
        relationship: 'The HRS consensus supports a clinician review of palpitation timing, frequency, associated symptoms, and any recorded symptom-rhythm correlation without attributing causation.',
        exact_texts: ['Palpitations review', 'Palpitations review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed'],
      },
      {
        source_id: 'nice-atrial-fibrillation-ng196-2021',
        source_section_id: 'nice-ng196-detection-ecg-ambulatory',
        relationship: 'NG196 supports recording clinician pulse assessment and already performed ECG or ambulatory ECG when AF is suspected; it does not diagnose AF from unconfirmed information.',
        exact_texts: [...cardioExam, ...cardioResults, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:hrsonline.org palpitations ambulatory ECG symptom frequency correlation', 'site:nice.org.uk NG196 palpitations pulse ECG', 'site:dha.gov.ae palpitations telehealth'],
    candidate_sources_rejected: ['palpitations treated as proof of arrhythmia', 'automatic rhythm monitoring, treatment, referral, or emergency instruction'],
    rejection_reasons: ['Symptoms alone do not establish rhythm or cause.', 'All investigations and actions remain clinician-entered.'],
    population_applicability: 'Adults presenting for clinician review of palpitations; AF evidence is conditional.',
    setting_applicability: 'Primary and outpatient cardiac assessment.',
    UAE_applicability: 'International evidence requires UAE ECG access, cardiology, emergency, referral, and facility adaptation.',
    recency_verification: 'The reviewed HRS consensus and current NICE NG196 were checked on 2026-07-14.',
    superseded_check: 'NG196 remains current; no newer full HRS ambulatory-ECG consensus was identified.',
    unresolved_source_gaps: ['Event chronology, pulse, triggers, associated chest or neurological symptoms, medicines and stimulants, ECG or monitor findings, structural disease, diagnosis, urgency, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-post-cabg-follow-up',
    evidence_groups: [{
      source_id: 'nice-acute-coronary-syndromes-ng185-2020',
      source_section_id: 'nice-ng185-discharge-rehabilitation',
      relationship: 'NG185 supports documenting discharge information, recovery and rehabilitation context, symptom change, patient questions, and arranged follow-up after an acute coronary syndrome; CABG-specific operative and graft details remain outside scope.',
      exact_texts: ['Post-CABG follow-up', 'Post-CABG follow-up interval history documented', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioResults, ...clinicianPlan],
    }],
    reviewed_sections: [{ source_id: 'nice-acute-coronary-syndromes-ng185-2020', source_section_id: 'nice-ng185-post-mi-followup-management', relationship: 'Secondary-prevention follow-up was reviewed only for people whose CABG followed myocardial infarction; it was not used to infer that context.' }],
    search_queries_used: ['site:nice.org.uk NG185 CABG discharge cardiac rehabilitation follow-up', 'site:acc.org CABG follow-up guideline', 'site:doh.gov.ae CABG follow-up'],
    candidate_sources_rejected: ['automatic graft-status or postoperative-complication conclusion', 'automatic rehabilitation, medicine, test, referral, or return-to-activity advice'],
    rejection_reasons: ['CABG follow-up requires operative, discharge, wound, graft, symptom, and cardiac records.', 'No postoperative management was generated.'],
    population_applicability: 'Adults after CABG; NG185 evidence is direct when surgery occurred in an acute-coronary-syndrome or myocardial-infarction pathway.',
    setting_applicability: 'Post-discharge outpatient cardiac and surgical follow-up.',
    UAE_applicability: 'NICE evidence requires UAE cardiac-surgery, rehabilitation, wound, prescribing, emergency, referral, and facility adaptation.',
    recency_verification: 'Current NICE NG185 was reviewed on 2026-07-14.',
    superseded_check: 'NG185 remains current.',
    unresolved_source_gaps: ['Operation date and indication, grafts, sternotomy and wound, complications, discharge medicines, adherence, exercise tolerance, angina, breathlessness, edema, rhythm, rehabilitation, investigations, clinician assessment, treatment, and follow-up remain unsupported.'],
  }),
]

export default {
  batch_id: 'batch-0276-0285',
  sources,
  workflows,
  interruption_reason: 'The exact-source queue is checkpointed after workflows 0276-0285. The next unfinished workflow is determined from the execution manifest.',
}

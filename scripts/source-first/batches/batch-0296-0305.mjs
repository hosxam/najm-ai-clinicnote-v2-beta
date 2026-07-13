import {
  SOURCE_META,
  evidenceWorkflow,
  noAuthoritativeWorkflow,
  section,
} from './authoredBatchSupport.mjs'

function registeredSource(registry_file, source) {
  return { registry_file, source }
}

const sources = [
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-acne-vulgaris-ng198-2026',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Acne vulgaris: management',
    exact_official_url: SOURCE_META['nice-acne-vulgaris-ng198-2026'].url,
    publication_date: '2021-06-25',
    effective_date: '2021-06-25',
    revision_date: '2026-04-30',
    version: 'NICE guideline NG198, last updated 30 April 2026',
    jurisdiction: 'England and Wales; international evidence requiring UAE adaptation',
    population: 'People with acne vulgaris, including people with acne-related scarring.',
    clinical_setting: 'Primary and specialist acne assessment, follow-up, information, and clinician-led management discussion.',
    applicability_note: 'Exact for documenting acne-scar concerns, ongoing acne, change over time, psychological impact, and clinician review. It does not grade scars automatically, recommend a procedure, medicine, or referral, or infer eligibility.',
    recency_verification: { verified_on: '2026-07-14', status: 'current_official_NICE_NG198_recommendations_opened_last_updated_2026', revision_due: null },
    superseded_status_check: { checked_on: '2026-07-14', status: 'current_NICE_NG198' },
    exact_sections: [
      section('nice-ng198-acne-scarring-review', 'Recommendations 1.8.1–1.8.2 — acne-related scarring concerns and specialist review', 'official recommendations lines 508–529', 'Supports documenting scar concerns, possible ongoing acne, time since acne cleared, change over time, psychological distress, severity already assessed by a clinician, and completed specialist discussion without generating treatment or referral.'),
      section('nice-ng198-acne-maintenance-review', 'Recommendations 1.7.1–1.7.5 — maintenance and review', 'official recommendations section 1.7', 'Supports recording ongoing acne or relapse context and a clinician-completed maintenance review; no treatment is generated.'),
    ],
  }),
]

const cardioExam = [
  'Vital signs documented only if assessed',
  'Cardiovascular examination documented only if assessed',
  'Respiratory examination documented only if assessed',
  'Peripheral perfusion / edema documented only if assessed',
]

const cardioConcern = [
  'severe or rapidly worsening symptoms documented if assessed',
  'abnormal vital signs documented if measured',
  'new neurological, cardiorespiratory, or systemic concern documented if assessed',
  'clinician concern requiring escalation documented if present',
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

const dermExam = [
  'Skin inspection documented only if assessed',
  'Lesion/rash distribution documented only if assessed',
  'Mucosal/secondary infection check documented only if assessed',
  'General appearance documented only if assessed',
]

const dermConcern = [
  'rapid spread, mucosal involvement, or systemic symptoms documented if assessed',
  'secondary infection signs documented if assessed',
  'severe pain or immunocompromise documented if relevant',
]

const dermRecords = [
  'Clinical photographs reviewed if available and consented',
  'Previous dermatology records reviewed if available',
  'Laboratory or pathology results reviewed if already available',
]

const workflows = [
  evidenceWorkflow({
    workflow_id: 'cardio-syncope-follow-up',
    evidence_groups: [
      {
        source_id: 'nice-tloc-cg109-2023',
        source_section_id: 'nice-cg109-specialist-cardiovascular-assessment',
        relationship: 'CG109 supports clinician follow-up of blackout or syncope events, recurrent-event history, postural context, cardiovascular assessment, and already selected investigations without assigning a cause.',
        exact_texts: ['Syncope follow-up', 'Syncope follow-up interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioResults],
      },
      {
        source_id: 'nice-tloc-cg109-2023',
        source_section_id: 'nice-cg109-information-safety-recurrence',
        relationship: 'The information and recurrence section supports documenting clinician-provided information, safety discussion, questions, and arranged follow-up without generating driving or recurrence instructions.',
        exact_texts: [...cardioConcern, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:nice.org.uk CG109 syncope specialist cardiovascular assessment recurrence follow-up', 'site:doh.gov.ae syncope follow-up'],
    candidate_sources_rejected: ['automatic cause, risk, or recurrence conclusion', 'automatic driving restriction, ECG interpretation, monitor, referral, treatment, or emergency action'],
    rejection_reasons: ['Syncope follow-up requires event, witness, examination, test, and specialist context.', 'No diagnosis or action was generated.'],
    population_applicability: 'People aged 16 years and over after transient loss of consciousness or clinician-diagnosed syncope.',
    setting_applicability: 'Primary, outpatient, and specialist cardiovascular follow-up.',
    UAE_applicability: 'NICE evidence requires UAE emergency, cardiology, neurology, driving, referral, and facility adaptation.',
    recency_verification: 'Current NICE CG109 was reviewed on 2026-07-14.',
    superseded_check: 'CG109 remains current after its 2023 update.',
    unresolved_source_gaps: ['Event recurrence and chronology, witness account, injuries, prodrome and recovery, posture, triggers, examination, ECG and monitoring, structural disease, diagnosis, driving, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-tachycardia-documentation',
    evidence_groups: [
      {
        source_id: 'hrs-ishne-ambulatory-ecg-2017',
        source_section_id: 'hrs-aecg-syncope-palpitations',
        relationship: 'The HRS consensus supports documenting symptom timing, frequency, associated symptoms, and symptom-rhythm correlation when an ambulatory record is available; it does not classify tachycardia.',
        exact_texts: ['Tachycardia documentation', 'Tachycardia documentation context documented', 'onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed'],
      },
      {
        source_id: 'nice-atrial-fibrillation-ng196-2021',
        source_section_id: 'nice-ng196-detection-ecg-ambulatory',
        relationship: 'NG196 supports clinician pulse assessment and an already performed 12-lead or ambulatory ECG when AF is suspected, without treating all tachycardia as AF.',
        exact_texts: [...cardioExam, ...cardioConcern, ...cardioResults, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:hrsonline.org ambulatory ECG tachycardia symptom rhythm correlation', 'site:nice.org.uk NG196 pulse tachycardia ECG ambulatory', 'site:doh.gov.ae tachycardia assessment'],
    candidate_sources_rejected: ['automatic rhythm diagnosis or hemodynamic-instability conclusion', 'automatic ECG order, medicine, cardioversion, referral, or emergency disposition'],
    rejection_reasons: ['Tachycardia classification requires a measured rate, tracing, symptoms, examination, and clinician interpretation.', 'No diagnostic or management action was generated.'],
    population_applicability: 'Adults with clinician-observed or reported tachycardia; AF evidence is conditional.',
    setting_applicability: 'Primary, outpatient cardiology, and ambulatory rhythm documentation.',
    UAE_applicability: 'International evidence requires UAE ECG, emergency, cardiology, electrophysiology, referral, and facility adaptation.',
    recency_verification: 'Current NICE NG196 and the 2017 HRS consensus were reviewed on 2026-07-14.',
    superseded_check: 'NG196 remains current; no newer full HRS ambulatory-ECG consensus was identified.',
    unresolved_source_gaps: ['Measured rate and rhythm, onset and termination, regularity, triggers, symptoms, blood pressure, ECG, monitor report, laboratory or structural context, diagnosis, stability, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-valvular-disease-follow-up',
    evidence_groups: [{
      source_id: 'nice-heart-valve-disease-ng208-2021',
      source_section_id: 'nice-ng208-valve-monitoring',
      relationship: 'NG208 directly supports clinician monitoring of symptoms and echocardiographic context for known valve disease without current intervention, while leaving severity and interval decisions clinician-entered.',
      exact_texts: ['Valvular disease follow-up', 'Valvular disease follow-up interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, ...cardioResults, ...clinicianPlan],
    }],
    reviewed_sections: [{ source_id: 'nice-heart-valve-disease-ng208-2021', source_section_id: 'nice-ng208-murmur-urgent-referral', relationship: 'Urgent valve-presentation criteria were reviewed as red-flag context only; no urgency or referral is inferred.' }],
    search_queries_used: ['site:nice.org.uk NG208 valve disease monitoring symptoms echocardiography follow-up', 'site:doh.gov.ae valvular disease follow-up'],
    candidate_sources_rejected: ['automatic valve-lesion severity or progression conclusion', 'automatic echocardiogram interval, medicine, intervention, surgery, or referral'],
    rejection_reasons: ['Valve type, severity, ventricular response, symptoms, prior studies, and clinician interpretation are required.', 'No monitoring interval or management was generated.'],
    population_applicability: 'Adults with clinician-established heart valve disease.',
    setting_applicability: 'Primary and specialist valve-disease follow-up.',
    UAE_applicability: 'NICE evidence requires UAE echocardiography, cardiology, cardiac-surgery, referral, emergency, and facility adaptation.',
    recency_verification: 'Current NICE NG208 was reviewed on 2026-07-14.',
    superseded_check: 'NG208 remains current.',
    unresolved_source_gaps: ['Valve and lesion type, severity, symptoms, functional impact, murmur, rhythm, ventricular function, pulmonary pressure, prior intervention, echocardiogram findings, progression, treatment, referral, and follow-up interval remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-warfarin-inr-result-review',
    evidence_groups: [
      {
        source_id: 'nice-atrial-fibrillation-ng196-2021',
        source_section_id: 'nice-ng196-anticoagulation-review',
        relationship: 'NG196 supports clinician review of anticoagulation quality, bleeding or stroke risk context, patient preferences, and an entered anticoagulation decision when warfarin is used for AF; it does not interpret an INR or change a dose.',
        exact_texts: ['Warfarin/INR result review', 'Warfarin/INR result review reason for result review documented', 'result source/date documented if available', 'change since last review documented', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
      },
      {
        source_id: 'nice-medicines-optimisation-ng5-2015',
        source_section_id: 'nice-ng5-structured-medication-review',
        relationship: 'NG5 supports structured clinician review of medicine safety, monitoring, concerns, and documented decisions without producing a dose or adjustment.',
        exact_texts: ['onset/duration documented if discussed', 'severity/impact on function documented if discussed'],
      },
    ],
    search_queries_used: ['site:nice.org.uk NG196 warfarin anticoagulation review INR time therapeutic range', 'site:nice.org.uk NG5 structured medication review monitoring', 'site:doh.gov.ae warfarin INR clinic'],
    candidate_sources_rejected: ['automatic INR interpretation or dose adjustment', 'automatic hold, bridge, vitamin K, repeat interval, referral, or emergency instruction'],
    rejection_reasons: ['INR action depends on indication, target, value, trend, bleeding, medicines, diet, illness, and local anticoagulation protocol.', 'No anticoagulation instruction was generated.'],
    population_applicability: 'Adults taking warfarin; NG196 evidence is direct only when the indication is atrial fibrillation.',
    setting_applicability: 'Anticoagulation, primary, and cardiology result review.',
    UAE_applicability: 'NICE evidence requires UAE anticoagulation protocol, target ranges, laboratory, pharmacy, emergency, and facility adaptation.',
    recency_verification: 'Current NICE NG196 and NG5 were reviewed on 2026-07-14.',
    superseded_check: 'Both selected NICE guidelines remain current for the reviewed scopes.',
    unresolved_source_gaps: ['Warfarin indication, target INR, actual result and date, trend, missed doses, diet, alcohol, interactions, illness, bleeding or thrombosis symptoms, clinician interpretation, dose decision, repeat interval, escalation, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-white-coat-hypertension-documentation',
    evidence_groups: [
      {
        source_id: 'nice-hypertension-ng136-2026',
        source_section_id: 'nice-ng136-abpm-hbpm-diagnosis',
        relationship: 'NG136 directly supports documenting clinic, ambulatory, and home blood-pressure context and a clinician-entered white-coat effect assessment without calculating averages or diagnosing hypertension.',
        exact_texts: ['White coat hypertension documentation', 'White coat hypertension documentation context documented', 'onset/duration documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', 'Vital signs documented only if assessed', 'Blood pressure or home readings reviewed if available'],
      },
      {
        source_id: 'nice-hypertension-ng136-2026',
        source_section_id: 'nice-ng136-monitoring-annual-review',
        relationship: 'The monitoring section supports recording reviewed readings, patient questions, an entered clinician plan, and arranged follow-up without changing treatment.',
        exact_texts: ['Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:nice.org.uk NG136 white-coat effect ABPM HBPM clinic blood pressure', 'site:dha.gov.ae hypertension home blood pressure white coat'],
    candidate_sources_rejected: ['automatic ABPM or HBPM averaging and white-coat diagnosis', 'automatic medicine start, stop, dose, target, or monitoring interval'],
    rejection_reasons: ['The actual validated measurements, schedule, averaging, technique, and clinician interpretation are required.', 'No diagnosis or management was generated.'],
    population_applicability: 'Adults with differing clinic and out-of-clinic blood-pressure readings.',
    setting_applicability: 'Primary and outpatient hypertension assessment.',
    UAE_applicability: 'NICE evidence requires UAE device validation, measurement protocol, diagnostic thresholds, prescribing, and facility adaptation.',
    recency_verification: 'Current NICE NG136 was reviewed on 2026-07-14.',
    superseded_check: 'NG136 remains current.',
    unresolved_source_gaps: ['Clinic and out-of-clinic values, device, technique, dates and schedule, averages, symptoms, comorbidities, clinician interpretation, diagnosis, treatment, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-abscess-wound-check',
    search_queries_used: ['site:nice.org.uk abscess wound check follow-up guideline', 'site:nice.org.uk NG125 wound infection follow-up', 'site:bad.org.uk abscess wound review guideline'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng125/chapter/recommendations', 'https://www.nice.org.uk/guidance/ng141/chapter/recommendations'],
    candidate_sources_rejected: ['NICE NG125 surgical-site-infection recommendations', 'NICE NG141 cellulitis and erysipelas recommendations'],
    rejection_reasons: ['NG125 applies to surgical incisions and does not supply an exact general abscess post-procedure wound-check scaffold.', 'NG141 applies to cellulitis or erysipelas and does not establish abscess drainage, packing, cavity, or wound-healing review requirements.'],
    population_applicability: 'People returning for clinician review of a skin abscess wound, with or without a previous procedure.',
    setting_applicability: 'Primary, urgent-care, surgical, or dermatology wound review.',
    UAE_applicability: 'UAE wound-care, procedure, microbiology, antimicrobial, referral, and facility protocols are required.',
    recency_verification: 'Current NICE NG125 and NG141 official recommendations were reviewed on 2026-07-14.',
    superseded_check: 'No current authoritative exact general abscess wound-check guideline was identified.',
    unresolved_source_gaps: ['Abscess site and size, procedure and date, packing or drain, pain, fever, drainage, erythema, wound dimensions, healing, neurovascular status, microbiology, medicines, clinician assessment, treatment, escalation, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-acne-scar-review',
    evidence_groups: [{
      source_id: 'nice-acne-vulgaris-ng198-2026',
      source_section_id: 'nice-ng198-acne-scarring-review',
      relationship: 'NG198 directly supports documenting acne-scar concerns, ongoing acne, time and change since acne cleared, psychological impact, clinician-assessed severity, discussion, and arranged specialist review without generating a procedure or referral.',
      exact_texts: ['Acne scar review', 'Acne scar review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...dermExam, 'Clinical photographs reviewed if available and consented', 'Previous dermatology records reviewed if available', ...clinicianPlan],
    }],
    search_queries_used: ['site:nice.org.uk NG198 acne-related scarring concerns psychological distress one year', 'site:dha.gov.ae acne scar review'],
    candidate_sources_rejected: ['automatic scar classification or severity grading', 'automatic laser, peel, procedure, medicine, or referral'],
    rejection_reasons: ['Scar morphology and severity require direct examination and clinician assessment.', 'No treatment or referral decision was generated.'],
    population_applicability: 'People with acne-related scarring, with or without ongoing acne.',
    setting_applicability: 'Primary and specialist dermatology scar review.',
    UAE_applicability: 'NICE evidence requires UAE dermatology, cosmetic-procedure governance, consent, referral, and facility adaptation.',
    recency_verification: 'Current NICE NG198 was reviewed on 2026-07-14.',
    superseded_check: 'NG198 remains current after its 2026 update.',
    unresolved_source_gaps: ['Scar type, distribution, depth, colour, ongoing acne, photographs, psychological impact, prior treatment, contraindications, clinician severity, options discussed, consent, treatment, referral, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-actinic-keratosis',
    search_queries_used: ['site:nice.org.uk actinic keratosis assessment management guideline', 'site:bad.org.uk actinic keratosis clinical guideline', 'site:nice.org.uk HTG99 actinic keratosis photodynamic therapy'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/htg99/chapter/1-recommendations', 'https://www.nice.org.uk/guidance/csg8/'],
    candidate_sources_rejected: ['NICE HTG99 photodynamic-therapy procedure guidance', 'NICE CSG8 skin-tumour service guidance'],
    rejection_reasons: ['HTG99 is old procedure-specific evidence and does not provide a current actinic-keratosis assessment or follow-up scaffold.', 'CSG8 concerns service organisation and referral pathways rather than exact lesion history, examination, or outpatient documentation.'],
    population_applicability: 'People with a clinician-suspected or established actinic keratosis.',
    setting_applicability: 'Primary and specialist dermatology assessment.',
    UAE_applicability: 'UAE skin-cancer, pathology, dermatology, procedure, referral, consent, and facility policy are required.',
    recency_verification: 'Official NICE HTG99 and CSG8 pages were reviewed on 2026-07-14; both have major age and scope limitations.',
    superseded_check: 'No current exact authoritative actinic-keratosis assessment guideline suitable for this workflow was identified.',
    unresolved_source_gaps: ['Lesion number, site, morphology, size, thickness, tenderness, bleeding, growth, field damage, sun exposure, immunosuppression, differential, dermoscopy, biopsy, diagnosis, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-alopecia-areata-follow-up',
    evidence_groups: [
      {
        source_id: 'bad-alopecia-areata-living-guideline-2024',
        source_section_id: 'bad-aa-2024-general-assessment',
        relationship: 'The BAD living guideline supports documenting alopecia-areata extent, activity, pattern, symptoms, nail or scalp context, psychosocial impact, and change over time without grading automatically.',
        exact_texts: ['Alopecia areata follow-up', 'Alopecia areata follow-up interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...dermExam, 'Clinical photographs reviewed if available and consented', 'Previous dermatology records reviewed if available'],
      },
      {
        source_id: 'bad-alopecia-areata-living-guideline-2024',
        source_section_id: 'bad-aa-2024-management-context',
        relationship: 'The management context supports recording clinician-completed discussion, questions, an entered plan, and arranged follow-up without generating treatment.',
        exact_texts: clinicianPlan,
      },
    ],
    search_queries_used: ['site:bad.org.uk alopecia areata living guideline 2024 assessment follow-up', 'site:doh.gov.ae alopecia areata'],
    candidate_sources_rejected: ['automatic alopecia-areata severity or activity score', 'automatic topical, systemic, intralesional, or referral plan'],
    rejection_reasons: ['Extent, activity, pattern, age, comorbidities, and patient preference require direct assessment.', 'No treatment or referral was generated.'],
    population_applicability: 'Adults and children with clinician-established alopecia areata; recommendations vary by age and severity.',
    setting_applicability: 'Primary and specialist dermatology follow-up.',
    UAE_applicability: 'BAD evidence requires UAE dermatology, medicine, laboratory, psychological-support, referral, and facility adaptation.',
    recency_verification: 'The BAD 2024 living guideline was reviewed on 2026-07-14.',
    superseded_check: 'The registered 2024 living guideline remains the selected current source.',
    unresolved_source_gaps: ['Pattern, scalp and body sites, extent and activity, nail findings, photographs, diagnosis confirmation, comorbidities, psychological impact, prior and current treatment, monitoring, clinician plan, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-burn-scar-review',
    evidence_groups: [
      {
        source_id: 'dha-burns-issue2-2024',
        source_section_id: 'dha-burns-i2-mechanism-classification',
        relationship: 'The UAE DHA burns guideline supports documenting the original burn mechanism, location, timing, depth or extent already assessed, and relevant history; it does not provide a complete mature-scar follow-up standard.',
        exact_texts: ['Burn scar review', 'Burn scar review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...dermExam],
      },
      {
        source_id: 'dha-burns-issue2-2024',
        source_section_id: 'dha-burns-i2-referral-red-flags',
        relationship: 'The DHA red-flag section supports recording assessed severe pain, infection or systemic concern, and clinician escalation decisions without asserting findings or generating referral.',
        exact_texts: [...dermConcern, ...dermRecords, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:dha.gov.ae telehealth burns 2024 assessment follow-up scar', 'site:bad.org.uk burn scar clinical guideline', 'site:nice.org.uk burn scar follow-up'],
    candidate_sources_rejected: ['acute burn guidance treated as complete scar guidance', 'automatic compression, silicone, massage, injection, laser, surgery, or referral'],
    rejection_reasons: ['The DHA source is exact for original burn assessment but only partially applicable to established scar review.', 'No scar treatment or procedure was generated.'],
    population_applicability: 'People with a scar after a thermal, chemical, electrical, or other burn; paediatric and complex burns need separate specialist context.',
    setting_applicability: 'UAE telehealth or outpatient follow-up with direct examination when required.',
    UAE_applicability: 'The DHA source is UAE-specific but its scope is acute virtual burn management rather than comprehensive scar care.',
    recency_verification: 'DHA Burns Issue 2 (2024) was reviewed on 2026-07-14.',
    superseded_check: 'No newer DHA burns issue or exact UAE burn-scar guideline was identified.',
    unresolved_source_gaps: ['Burn date and mechanism, graft or surgery, scar age, site, size, colour, thickness, pliability, symptoms, contracture, range of motion, function, infection, photographs, prior therapy, treatment, procedure, referral, and follow-up remain unsupported.'],
  }),
]

export default {
  batch_id: 'batch-0296-0305',
  sources,
  workflows,
  interruption_reason: 'The exact-source queue is checkpointed after workflows 0296-0305. The next unfinished workflow is determined from the execution manifest.',
}

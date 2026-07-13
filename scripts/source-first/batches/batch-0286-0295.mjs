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
    source_id: 'nice-stable-angina-cg126-2016',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Stable angina: management',
    exact_official_url: SOURCE_META['nice-stable-angina-cg126-2016'].url,
    publication_date: '2011-07-23',
    effective_date: '2011-07-23',
    revision_date: '2016-08-25',
    version: 'NICE clinical guideline CG126, last updated 25 August 2016',
    jurisdiction: 'England and Wales; international evidence requiring UAE adaptation',
    population: 'Adults with a clinician-established diagnosis of stable angina.',
    clinical_setting: 'Outpatient stable-angina information, treatment-response review, and clinician-led investigation or revascularisation discussion.',
    applicability_note: 'Exact for documenting established stable-angina symptom course, daily impact, concerns, treatment response and adverse effects, and clinician-entered follow-up. It does not diagnose angina, infer stability, recommend a medicine or dose, or determine revascularisation.',
    recency_verification: { verified_on: '2026-07-14', status: 'official_NICE_CG126_recommendations_opened_last_updated_2016_recency_gap', revision_due: null },
    superseded_status_check: { checked_on: '2026-07-14', status: 'current_NICE_CG126_no_superseding_stable_angina_guideline_identified' },
    exact_sections: [
      section('nice-cg126-information-symptom-impact', 'Recommendations 1.2.1–1.2.7 — information, symptom course, daily impact, concerns, and support', 'official recommendations lines 52–82', 'Supports documenting established stable-angina symptom context, provoking factors, daily impact, expectations, sudden worsening already reported, and clinician discussion.'),
      section('nice-cg126-treatment-response-review', 'Recommendations 1.4.3–1.4.5 — medicine information, adverse effects, and response review', 'official recommendations lines 146–167', 'Supports documenting an already prescribed treatment, adherence discussion, adverse effects, and clinician review of response; no medicine or dose is generated.'),
      section('nice-cg126-revascularisation-discussion', 'Recommendations 1.5.6–1.5.12 — clinician-led revascularisation discussion', 'official recommendations section 1.5', 'Supports recording a completed clinician discussion of relative risks, benefits, coronary anatomy, comorbidities, and preferences without recommending CABG or PCI.'),
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

const workflows = [
  evidenceWorkflow({
    workflow_id: 'cardio-post-cardiology-admission-follow-up',
    evidence_groups: [
      {
        source_id: 'nice-acute-coronary-syndromes-ng185-2020',
        source_section_id: 'nice-ng185-discharge-rehabilitation',
        relationship: 'NG185 supports discharge-summary, rehabilitation, symptom-change, question, communication, and follow-up documentation when the cardiology admission involved acute coronary syndrome; it does not generalise that diagnosis to every admission.',
        exact_texts: ['Post-cardiology admission follow-up', 'Post-cardiology admission follow-up interval history documented', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, ...cardioResults, ...clinicianPlan],
      },
    ],
    reviewed_sections: [{ source_id: 'nice-chronic-heart-failure-ng106-2025', source_section_id: 'nice-ng106-primary-care-review-care-plan', relationship: 'Heart-failure care-plan review was checked as a conditional alternative admission context and was not used to infer heart failure.' }],
    search_queries_used: ['site:nice.org.uk NG185 discharge cardiac rehabilitation follow-up admission', 'site:nice.org.uk NG106 discharge primary care review heart failure', 'site:doh.gov.ae cardiology discharge follow-up'],
    candidate_sources_rejected: ['single-diagnosis assumptions for a broad post-cardiology-admission workflow', 'automatic discharge reconciliation, investigation, medicine, referral, rehabilitation, or urgency plan'],
    rejection_reasons: ['The admission diagnosis, procedures, discharge summary, and complications must be explicitly verified.', 'All post-discharge decisions remain clinician-entered.'],
    population_applicability: 'Adults after a cardiology admission; selected evidence is conditional on acute-coronary-syndrome or heart-failure context.',
    setting_applicability: 'Primary and outpatient post-discharge review.',
    UAE_applicability: 'NICE evidence requires UAE discharge, cardiology, rehabilitation, pharmacy, referral, emergency, and facility adaptation.',
    recency_verification: 'Current NICE NG185 and NG106 were reviewed on 2026-07-14.',
    superseded_check: 'Both selected NICE guidelines remain current.',
    unresolved_source_gaps: ['Admission diagnosis and date, procedures, complications, discharge condition, medicine reconciliation, pending results, symptoms, wound, rehabilitation, restrictions, clinician assessment, plan, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-post-pci-follow-up',
    evidence_groups: [
      {
        source_id: 'nice-acute-coronary-syndromes-ng185-2020',
        source_section_id: 'nice-ng185-pci-antithrombotic-risk',
        relationship: 'NG185 supports documenting the PCI and antithrombotic-risk context, already selected treatment, relevant adverse-effect or bleeding discussion, and clinician review without changing therapy.',
        exact_texts: ['Post-PCI follow-up', 'Post-PCI follow-up interval history documented', 'change since last review documented', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, ...cardioResults],
      },
      {
        source_id: 'nice-acute-coronary-syndromes-ng185-2020',
        source_section_id: 'nice-ng185-discharge-rehabilitation',
        relationship: 'The discharge and rehabilitation section supports documenting information already provided, recovery, questions, and clinician-arranged follow-up after PCI without generating instructions.',
        exact_texts: clinicianPlan,
      },
    ],
    search_queries_used: ['site:nice.org.uk NG185 PCI antithrombotic risk discharge follow-up rehabilitation', 'site:doh.gov.ae PCI follow-up'],
    candidate_sources_rejected: ['automatic stent or coronary-status interpretation', 'automatic antiplatelet duration, medicine change, test, rehabilitation, referral, or activity advice'],
    rejection_reasons: ['The PCI report, indication, anatomy, stents, complications, and current medicines are required.', 'No medicine, dose, duration, investigation, or advice was generated.'],
    population_applicability: 'Adults after PCI in an acute-coronary-syndrome pathway.',
    setting_applicability: 'Post-discharge primary and cardiology follow-up.',
    UAE_applicability: 'NICE evidence requires UAE interventional-cardiology, formulary, rehabilitation, emergency, referral, and facility adaptation.',
    recency_verification: 'Current NICE NG185 was reviewed on 2026-07-14.',
    superseded_check: 'NG185 remains current.',
    unresolved_source_gaps: ['Procedure date and indication, coronary anatomy, access site, stent details, complications, antithrombotic regimen, adherence, bleeding, recurrent symptoms, rehabilitation, test results, treatment, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-pre-operative-cardiac-review',
    evidence_groups: [{
      source_id: 'acc-aha-perioperative-cv-key-points-2024',
      source_section_id: 'acc-perioperative-stepwise-cardiac-risk',
      relationship: 'The ACC/AHA key points support a stepwise clinician-led preoperative cardiovascular assessment, selective testing, functional and risk context, and team decisions without calculating risk or granting clearance.',
      exact_texts: ['Pre-operative cardiac review', 'Pre-operative cardiac review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, ...cardioResults, ...clinicianPlan],
    }],
    search_queries_used: ['site:acc.org 2024 perioperative cardiovascular guideline stepwise assessment selective testing team', 'site:doh.gov.ae preoperative cardiac assessment'],
    candidate_sources_rejected: ['automatic surgical clearance or perioperative risk score', 'automatic stress testing, medicine hold, anticoagulation bridge, procedure delay, or referral'],
    rejection_reasons: ['Risk estimation requires the planned procedure, urgency, functional status, comorbidities, actual findings, and clinician judgment.', 'No test, medication, disposition, or clearance decision was generated.'],
    population_applicability: 'Adults being evaluated for noncardiac surgery.',
    setting_applicability: 'Preoperative clinic and outpatient cardiology assessment.',
    UAE_applicability: 'ACC/AHA evidence requires UAE surgical, anesthesia, cardiology, medication, facility, and emergency-pathway adaptation.',
    recency_verification: 'The official ACC 2024 key-points document was reviewed on 2026-07-14.',
    superseded_check: 'It reflects the current 2024 AHA/ACC perioperative guideline.',
    unresolved_source_gaps: ['Procedure and urgency, surgical risk, active cardiac conditions, functional capacity, validated risk estimate, ECG and tests, medicines and anticoagulation, anesthesia context, team decision, clearance, delay, treatment, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'cardio-pregnancy-cardiac-history-documentation',
    search_queries_used: ['site:escardio.org 2025 cardiovascular disease pregnancy guideline history assessment', 'site:nice.org.uk NG201 cardiac disease pregnancy antenatal assessment', 'site:doh.gov.ae pregnancy cardiac disease standard'],
    official_pages_opened: ['https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardiovascular-diseases-during-pregnancy-management-of/', 'https://www.nice.org.uk/guidance/ng201/chapter/recommendations'],
    candidate_sources_rejected: ['2025 ESC cardiovascular disease and pregnancy guideline page', 'NICE NG201 antenatal-care recommendations'],
    rejection_reasons: ['The ESC page identifies a current guideline but expressly requires a formal licence for inclusion, citation, or transformation in software or AI tools; it was not mapped.', 'NG201 is broad routine antenatal guidance and did not provide an exact generic cardiac-history documentation scaffold for this workflow.'],
    population_applicability: 'Pregnant or postpartum people with known, suspected, or historical cardiovascular disease.',
    setting_applicability: 'Antenatal, obstetric medicine, cardiology, and pregnancy-heart-team assessment.',
    UAE_applicability: 'UAE maternity, cardiology, emergency, medicine-safety, fetal, referral, and facility pathways are essential and were not established by an exact reusable source.',
    recency_verification: 'Current ESC 2025 and NICE NG201 official pages were opened on 2026-07-14; neither was accepted for exact software mapping.',
    superseded_check: 'ESC 2025 supersedes its 2018 guideline; NICE NG201 remains current for routine antenatal care.',
    unresolved_source_gaps: ['Cardiac diagnosis and severity, prior events or procedures, symptoms, functional class, pregnancy and gestation, obstetric history, medicines and teratogenic risk, examination, ECG and imaging, pregnancy-heart-team assessment, maternal or fetal risk, plan, escalation, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-presyncope-documentation',
    evidence_groups: [
      {
        source_id: 'nice-tloc-cg109-2023',
        source_section_id: 'nice-cg109-initial-history-examination',
        relationship: 'CG109 supports clinician documentation of event circumstances, prodrome, posture, witness information when relevant, previous events, medicines, family history, vital signs, and cardiovascular or neurological assessment; presyncope is not equated with loss of consciousness.',
        exact_texts: ['Presyncope documentation', 'Presyncope documentation context documented', 'onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam],
      },
      {
        source_id: 'nice-tloc-cg109-2023',
        source_section_id: 'nice-cg109-red-flags-referral',
        relationship: 'The red-flag section supports recording assessed cardiac or neurological concern and clinician escalation decisions without asserting a red flag or generating urgency.',
        exact_texts: [...cardioConcern, ...cardioResults, ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:nice.org.uk CG109 presyncope blackout history examination red flags ECG', 'site:doh.gov.ae presyncope assessment'],
    candidate_sources_rejected: ['automatic syncope cause or hemodynamic-instability conclusion', 'automatic ECG interpretation, driving advice, referral, admission, or treatment'],
    rejection_reasons: ['Presyncope has broad causes and the workflow lacks confirmed findings.', 'All interpretation and actions remain clinician-entered.'],
    population_applicability: 'People aged 16 years and over with presyncope-like symptoms; CG109 is directly about transient loss of consciousness and is only partially applicable when consciousness was not lost.',
    setting_applicability: 'Initial primary, outpatient, or acute assessment.',
    UAE_applicability: 'NICE evidence requires UAE emergency, cardiology, neurology, driving, referral, and facility adaptation.',
    recency_verification: 'Current NICE CG109 was reviewed on 2026-07-14.',
    superseded_check: 'CG109 remains current after its 2023 update.',
    unresolved_source_gaps: ['Exact event chronology, loss of consciousness, posture, triggers, prodrome, witness account, recovery, injury, pulse and blood pressure, ECG, glucose or laboratory context, diagnosis, risk, driving, referral, treatment, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-pvc-symptom-review',
    evidence_groups: [{
      source_id: 'hrs-ishne-ambulatory-ecg-2017',
      source_section_id: 'hrs-aecg-syncope-palpitations',
      relationship: 'The HRS consensus supports symptom frequency, event context, symptom-rhythm correlation, and clinician review of ambulatory ECG data; it does not establish that symptoms are caused by premature ventricular complexes.',
      exact_texts: ['PVC symptom review', 'PVC symptom review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, 'ECG reviewed if performed by clinician', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
    }],
    search_queries_used: ['site:hrsonline.org ambulatory ECG palpitations ventricular ectopy symptom correlation', 'site:acc.org premature ventricular complex evaluation guideline', 'site:doh.gov.ae PVC symptom review'],
    candidate_sources_rejected: ['automatic PVC burden or symptom-causation conclusion', 'automatic monitor, imaging, medicine, ablation, referral, or urgency'],
    rejection_reasons: ['PVC identity and burden require an actual ECG or monitor report and qualified interpretation.', 'No investigation or management decision was generated.'],
    population_applicability: 'People with clinician-documented PVCs or ventricular ectopy undergoing symptom review.',
    setting_applicability: 'Outpatient cardiology and ambulatory rhythm review.',
    UAE_applicability: 'International HRS evidence requires UAE ECG, imaging, electrophysiology, referral, and facility adaptation.',
    recency_verification: 'The 2017 HRS consensus was reviewed on 2026-07-14 and has a material recency gap.',
    superseded_check: 'No newer full HRS ambulatory-ECG consensus was identified.',
    unresolved_source_gaps: ['Actual tracing, morphology, frequency and burden, symptom correlation, structural disease, triggers, medicines or stimulants, electrolytes, imaging, risk, diagnosis, treatment, referral, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'cardio-referral-documentation',
    search_queries_used: ['site:doh.gov.ae cardiology referral standard documentation', 'site:nice.org.uk cardiology referral information minimum dataset', 'site:acc.org cardiology referral documentation'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng208/chapter/recommendations', 'https://www.nice.org.uk/guidance/cg109/chapter/recommendations'],
    candidate_sources_rejected: ['condition-specific valve-disease referral guidance', 'condition-specific transient-loss-of-consciousness referral guidance'],
    rejection_reasons: ['NG208 applies to defined valve presentations and cannot support a generic cardiology-referral template.', 'CG109 applies to defined blackout and syncope presentations and cannot support every cardiology referral.'],
    population_applicability: 'People for whom a clinician is documenting a cardiology referral for an unspecified reason.',
    setting_applicability: 'Primary and outpatient referral documentation.',
    UAE_applicability: 'UAE referral criteria, destination, urgency, insurance, communication, and facility policies are decisive and no exact generic source was identified.',
    recency_verification: 'Current NICE condition-specific referral pages were reviewed on 2026-07-14.',
    superseded_check: 'No current authoritative generic cardiology referral-documentation guideline was identified.',
    unresolved_source_gaps: ['Referral reason, symptoms, findings, diagnosis, urgency, recipient, investigations, treatment, risk, communication, consent, attachments, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-smoking-status-cardiac-review',
    evidence_groups: [
      {
        source_id: 'mohap-tobacco-dependence-guideline-2024',
        source_section_id: 'mohap-tobacco-guide-identify-assess',
        relationship: 'The UAE MOHAP guideline directly supports documenting current or recent tobacco use, product and quantity context, dependence-related questions, prior attempts, and readiness when discussed; it does not assume smoking or generate cessation advice.',
        exact_texts: ['Smoking status cardiac review', 'Smoking status cardiac review interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'patient concerns or goals documented if discussed'],
      },
      {
        source_id: 'nice-cvd-lipid-modification-ng238-2023',
        source_section_id: 'nice-ng238-risk-lifestyle-review',
        relationship: 'NG238 supports recording smoking as one clinician-assessed cardiovascular-risk factor, patient preferences, and an entered plan without calculating risk or prescribing an intervention.',
        exact_texts: ['associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'Vital signs documented only if assessed', 'Blood pressure or home readings reviewed if available', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
      },
    ],
    search_queries_used: ['site:mohap.gov.ae 2024 tobacco dependence identify assess smoking status', 'site:nice.org.uk NG238 smoking cardiovascular risk review'],
    candidate_sources_rejected: ['automatic tobacco-use status from aliases or history gaps', 'automatic cessation medication, quit date, referral, or counseling script'],
    rejection_reasons: ['Tobacco status and product details must be explicitly elicited.', 'No cessation intervention or medicine was generated.'],
    population_applicability: 'Adults undergoing cardiovascular review where tobacco status is clinically discussed.',
    setting_applicability: 'UAE primary and outpatient cardiovascular prevention documentation.',
    UAE_applicability: 'MOHAP evidence is directly UAE-specific; NICE risk guidance still requires UAE adaptation.',
    recency_verification: 'MOHAP 2024 and NICE NG238 were reviewed on 2026-07-14.',
    superseded_check: 'Both selected sources remain current for the reviewed scopes.',
    unresolved_source_gaps: ['Current status, product, amount, duration, dependence, previous attempts, relapse, exposure, preferences, readiness, cardiovascular risk calculation, counseling content, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-stable-angina-follow-up',
    evidence_groups: [
      {
        source_id: 'nice-stable-angina-cg126-2016',
        source_section_id: 'nice-cg126-information-symptom-impact',
        relationship: 'CG126 directly supports documenting symptom frequency and severity change, provoking factors, daily impact, patient concerns, and sudden worsening already reported in a person with established stable angina.',
        exact_texts: ['Stable angina follow-up', 'Stable angina follow-up interval history documented', 'onset/duration documented if discussed', 'change since last review documented', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', ...cardioExam, ...cardioConcern, ...cardioResults],
      },
      {
        source_id: 'nice-stable-angina-cg126-2016',
        source_section_id: 'nice-cg126-treatment-response-review',
        relationship: 'The treatment-response section supports documenting already prescribed treatment, adverse effects, adherence discussion, clinician response assessment, questions, and arranged follow-up without changing medicines.',
        exact_texts: clinicianPlan,
      },
    ],
    search_queries_used: ['site:nice.org.uk CG126 stable angina follow-up symptom worsening treatment response adverse effects', 'site:doh.gov.ae stable angina follow-up'],
    candidate_sources_rejected: ['automatic classification of stable versus unstable angina', 'automatic anti-anginal medicine, dose, test, revascularisation, referral, or emergency action'],
    rejection_reasons: ['Stability requires confirmed symptom pattern, examination, ECG, and clinical judgment.', 'No diagnosis or management action was generated.'],
    population_applicability: 'Adults with clinician-established stable angina.',
    setting_applicability: 'Primary and outpatient cardiology follow-up; acute change requires direct assessment.',
    UAE_applicability: 'NICE evidence requires UAE emergency, cardiology, formulary, investigation, revascularisation, referral, and facility adaptation.',
    recency_verification: 'NICE CG126 was reviewed on 2026-07-14 and has a material recency gap.',
    superseded_check: 'CG126 remains current NICE stable-angina guidance.',
    unresolved_source_gaps: ['Exact pain pattern, frequency, duration, triggers, relief, functional impact, acute change, examination, ECG and tests, medicine and dose, adherence, adverse effects, diagnosis, stability, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'cardio-statin-tolerance-documentation',
    evidence_groups: [{
      source_id: 'nice-cvd-lipid-modification-ng238-2023',
      source_section_id: 'nice-ng238-lipid-response-annual-review',
      relationship: 'NG238 supports clinician review of lipid-lowering treatment response, adherence, adverse effects, laboratory context, preferences, and an entered plan without attributing symptoms or changing a statin.',
      exact_texts: ['Statin tolerance documentation', 'Statin tolerance documentation context documented', 'onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed', 'Vital signs documented only if assessed', 'Cardiac or laboratory results reviewed if already ordered', ...clinicianPlan],
    }],
    search_queries_used: ['site:nice.org.uk NG238 statin adverse effects intolerance review creatine kinase liver', 'site:doh.gov.ae statin intolerance review'],
    candidate_sources_rejected: ['automatic statin intolerance or adverse-reaction diagnosis', 'automatic statin stop, switch, rechallenge, dose, laboratory test, or referral'],
    rejection_reasons: ['Symptom attribution requires chronology, examination, medicine details, laboratory context, and clinician assessment.', 'No medicine or investigation action was generated.'],
    population_applicability: 'Adults taking or recently taking a statin and undergoing clinician tolerance review.',
    setting_applicability: 'Primary and outpatient cardiovascular prevention review.',
    UAE_applicability: 'NICE evidence requires UAE formulary, laboratory, interaction, prescribing, pharmacovigilance, and facility adaptation.',
    recency_verification: 'Current NICE NG238 was reviewed on 2026-07-14.',
    superseded_check: 'NG238 remains current.',
    unresolved_source_gaps: ['Statin name, dose, duration, indication, adherence, symptom description and timing, dechallenge or rechallenge, interactions, thyroid or vitamin context, CK or liver results, causality, clinician decision, and follow-up remain unsupported.'],
  }),
]

export default {
  batch_id: 'batch-0286-0295',
  sources,
  workflows,
  interruption_reason: 'The exact-source queue is checkpointed after workflows 0286-0295. The next unfinished workflow is determined from the execution manifest.',
}

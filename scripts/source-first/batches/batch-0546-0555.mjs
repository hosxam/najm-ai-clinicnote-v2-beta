import { SOURCE_META, evidenceWorkflow, noAuthoritativeWorkflow, section } from './authoredBatchSupport.mjs'

const REVIEW_DATE = '2026-07-14'

const sources = [{
  registry_file: 'international_clinical_sources.json',
  source: {
    source_id: 'nice-medicines-optimisation-ng5-2015',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Medicines optimisation: the safe and effective use of medicines to enable the best possible outcomes — Recommendations',
    exact_official_url: SOURCE_META['nice-medicines-optimisation-ng5-2015'].url,
    publication_date: '2015-03-04',
    effective_date: '2015-03-04',
    revision_date: null,
    version: 'NICE guideline NG5',
    jurisdiction: 'England and Wales; international evidence requiring UAE medicines, prescribing, pharmacy, discharge, and information-governance adaptation',
    population: 'Adults, children, and young people using medicines, with specific transfer, reconciliation, and decision-involvement recommendations.',
    clinical_setting: 'Transfers between care settings and clinician-led medicines consultations.',
    applicability_note: 'Exact for documenting current medicines, changes made during transfer, reconciliation, discrepancies, person or carer involvement, values, preferences, and clinician-led decisions. It does not generate a medicine start, stop, dose, prescription, or deprescribing decision.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_NG5_recommendations_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_guideline_page' },
    exact_sections: [
      section('nice-ng5-medication-communication', 'Medicines-related communication between care settings', 'Recommendations 1.2.1–1.2.6', 'Supports complete and accurate medicine information, prescribed and non-prescribed medicines, allergies, timing, monitoring, and discussion at care transitions.'),
      section('nice-ng5-medicines-reconciliation', 'Medicines reconciliation', 'Section 1.3 and Recommendations 1.3.1–1.3.3', 'Defines reconciliation as identifying an accurate current medicine list, comparing records, recognising discrepancies, documenting changes, and including over-the-counter or complementary medicines.'),
      section('nice-ng5-structured-medication-review', 'Medication review', 'Section 1.4 and Recommendations 1.4.1–1.4.3', 'Supports structured review of all medicines, views, understanding, concerns, questions, adherence context, adverse-reaction or side-effect context, monitoring, and circumstances for seeking professional advice.'),
      section('nice-ng5-transfer-reconciliation', 'Recommendations 1.2.2–1.3.7 — transfer information and medicines reconciliation', 'official recommendations 1.2.2–1.3.7', 'Supports documenting current prescribed, over-the-counter and complementary medicines, changes, discrepancies, discharge information, reconciliation and patient or carer involvement at care transitions.'),
      section('nice-ng5-person-involvement', 'Recommendations 1.6.1–1.6.5 — involvement, values, preferences, benefits, and harms', 'official recommendations 1.6.1–1.6.5', 'Supports documenting the person’s desired involvement, values, preferences, and clinician-completed discussion of treatment options, benefits and harms without generating a medicine decision.'),
    ],
  },
}]

const history = ['onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed']
const followup = [...history, 'change since last review documented']
const exam = ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Medication/support context documented only if assessed']
const records = ['Medication list or reconciliation documentation reviewed if available', 'Falls/cognition/function screen results documented if completed', 'Caregiver or care-home records reviewed if available']
const plan = ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed']

function geri(config) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: 'Primary, community, geriatric, hospital-follow-up, care-home, audiology, or multidisciplinary review as qualified by the exact source.',
    UAE_applicability: 'International evidence requires UAE geriatric, primary-care, medicines, audiology, capacity, consent, social-care, driving, referral, and local legal adaptation.',
    recency_verification: `Exact official sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on the issuing organisation website at the review date.',
  })
}

const workflows = [
  noAuthoritativeWorkflow({
    workflow_id: 'geri-continence-review-in-older-adult',
    search_queries_used: ['site:nice.org.uk urinary incontinence older people assessment guideline geriatric', 'site:who.int ICOPE urinary incontinence older people guidance', 'site:doh.gov.ae urinary incontinence older adults guideline'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng249/chapter/Recommendations'],
    candidate_sources_rejected: ['NICE falls comprehensive assessment continence domain', 'sex-specific urinary incontinence guidelines applied to an age-neutral older-adult workflow'],
    rejection_reasons: ['The falls guideline mentions urinary continence as one assessment domain but is not an exact continence-review standard.', 'The workflow does not identify sex, urinary versus faecal symptoms, acute retention, infection, neurological disease, or care setting.'],
    population_applicability: 'Older adults with urinary or bowel continence concerns; sex, symptom type, acute illness, cognition, mobility, medicines, and neurological context materially change assessment.',
    setting_applicability: 'Primary, community, care-home, or geriatric review.',
    UAE_applicability: 'No exact age-neutral UAE geriatric continence guideline was identified.',
    recency_verification: `Official sources were searched on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable current authoritative source was identified.',
    unresolved_source_gaps: ['Urinary versus bowel symptoms, acute retention, infection, haematuria, examination, testing, diagnosis, treatment, equipment, safeguarding, and referral remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-delirium-follow-up-after-discharge',
    evidence_groups: [
      { source_id: 'nice-delirium-cg103-2023', source_section_id: 'nice-cg103-delirium-risk-indicators', relationship: 'The exact delirium section supports interval changes or fluctuations in cognition, perception, physical function and social behaviour reported by the person or informant without asserting persistent delirium.', exact_texts: followup },
      { source_id: 'nice-delirium-cg103-2023', source_section_id: 'nice-cg103-delirium-document-assess', relationship: 'The exact section supports clinician-completed functional or cognitive assessment and caregiver information without auto-diagnosis.', exact_texts: ['Functional/cognitive screen documentation documented only if assessed', 'Falls/cognition/function screen results documented if completed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-medicines-optimisation-ng5-2015', source_section_id: 'nice-ng5-transfer-reconciliation', relationship: 'The exact transfer section supports reviewing discharge information, medicines and reconciliation after hospital discharge without changing a prescription.', exact_texts: ['Medication/support context documented only if assessed', 'Medication list or reconciliation documentation reviewed if available'] },
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-monitoring-support', relationship: 'The exact support section supports documenting emerging needs, coordination, clinician-entered plans, follow-up and questions.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG103 delirium follow-up fluctuation cognition function informant', 'site:nice.org.uk NG5 discharge medicines reconciliation older people'],
    candidate_sources_rejected: ['persistent delirium inferred after discharge', 'automatic investigation, medication change, referral, or readmission'],
    rejection_reasons: ['Post-discharge symptoms require reassessment for recovery, recurrence, dementia, medicine and medical causes.', 'All actions remain clinician-entered.'],
    population_applicability: 'Adults discharged after clinician-confirmed or suspected delirium; acute deterioration and immediate risk require separate pathways.',
    unresolved_source_gaps: ['Discharge diagnosis, cause, baseline cognition, current medical stability, recurrence, capacity, investigation, medication changes, and escalation remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-dementia-care-planning-documentation',
    evidence_groups: [
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-monitoring-support', relationship: 'The exact monitoring and coordination section supports needs assessment, family or carer involvement, emerging needs, named coordination, support planning and reviewed records without creating a care plan.', exact_texts: [...history, ...exam, ...records] },
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-driving-carer-support', relationship: 'The exact section supports clinician-documented driving and carer-support discussions plus questions without generating legal or service advice.', exact_texts: [...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG97 dementia care coordination emerging needs carer support plan', 'site:nice.org.uk NG97 dementia advance care planning'],
    candidate_sources_rejected: ['dementia diagnosis or capacity inferred', 'automatic services, legal advice, driving restriction, medicine, or placement decision'],
    rejection_reasons: ['The source applies to people living with a clinician-established dementia diagnosis.', 'All decisions and actions remain clinician-entered.'],
    population_applicability: 'People living with clinician-established dementia and their carers; capacity, consent, stage, subtype, and local services require explicit review.',
    unresolved_source_gaps: ['Diagnosis confirmation, subtype, capacity, legal instruments, advance decisions, services, medicines, safeguarding, and placement remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-driving-safety-discussion-documentation',
    evidence_groups: [
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-driving-carer-support', relationship: 'The exact dementia section supports documenting that driving impact, legal information, carer views, concerns and questions were discussed with a person living with dementia; it does not determine fitness to drive.', exact_texts: [...history, 'patient concerns or goals documented if discussed', 'Caregiver or care-home records reviewed if available', ...plan] },
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact falls assessment section supports clinician-assessed cognition, dizziness, vision, hearing, mobility, gait, medicines and function when relevant to a driving discussion.', exact_texts: [...exam, 'Medication list or reconciliation documentation reviewed if available', 'Falls/cognition/function screen results documented if completed'] },
    ],
    search_queries_used: ['site:nice.org.uk NG97 dementia driving information carers recommendations', 'site:nice.org.uk NG249 falls cognition vision hearing medicines gait assessment'],
    candidate_sources_rejected: ['automatic fitness-to-drive or driving restriction decision', 'UK licensing instructions applied as UAE law'],
    rejection_reasons: ['Fitness decisions require clinician assessment and UAE legal standards.', 'UK DVLA-specific duties are not transferred to UAE practice.'],
    population_applicability: 'Partial: people living with dementia and older adults with falls-related functional or sensory concerns; other driving-risk conditions require separate evidence.',
    unresolved_source_gaps: ['UAE licensing law, exact condition, cognition, vision, hearing, medicines, crash history, occupational driving, legal advice, and final decision remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-falls-prevention-counseling-documentation',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-identification', relationship: 'The exact section supports documenting fall details, concerns and functional impact without using a prediction tool or assuming risk.', exact_texts: history },
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact assessment section supports clinician-assessed gait, balance, function, cognition, dizziness, medicines, vision, hearing, continence, nutrition and osteoporosis context plus reviewed records.', exact_texts: [...exam, ...records] },
    ],
    search_queries_used: ['site:nice.org.uk NG249 falls assessment prevention older people comprehensive assessment', 'site:nice.org.uk NG249 falls discussion information preferences'],
    candidate_sources_rejected: ['automatic exercise, equipment, medicine change, home modification, or referral advice', 'fall-risk score auto-calculation'],
    rejection_reasons: ['Counseling content must be entered by the clinician.', 'The source explicitly rejects prediction tools as substitutes for assessment.'],
    population_applicability: 'People aged 65 or older and people aged 50 to 64 at higher risk, as qualified by NG249.',
    unresolved_source_gaps: ['Actual counseling content, intervention eligibility, equipment, medicines, home environment, referral, and follow-up remain unsupported unless entered.'],
  }),
  geri({
    workflow_id: 'geri-falls-review',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-identification', relationship: 'The exact section supports interval fall details, onset, change, functional impact, associated symptoms, relevant negatives and concerns without inferring cause.', exact_texts: followup },
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact comprehensive assessment section supports clinician-assessed cardiovascular, cognitive, dizziness, footwear, functional, gait, hearing, medicines, neurological, osteoporosis, continence, vision and nutrition domains.', exact_texts: [...exam, ...records, 'clinician concern requiring escalation documented if present'] },
    ],
    search_queries_used: ['site:nice.org.uk NG249 falls review details comprehensive assessment older people', 'site:nice.org.uk NG249 gait balance cognition medicines vision hearing continence'],
    candidate_sources_rejected: ['automatic fall cause or future-risk prediction', 'automatic imaging, medicine change, exercise, equipment, referral, or admission'],
    rejection_reasons: ['Falls require person-specific multidisciplinary assessment.', 'No management action is generated.'],
    population_applicability: 'People aged 65 or older and people aged 50 to 64 at higher risk, as qualified by NG249.',
    unresolved_source_gaps: ['Injury, acute illness, syncope, environment, actual examination, diagnosis, investigation, treatment, and follow-up remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-frailty-review-documentation',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact section supports documenting gait, self-reported health, function, falls and clinician-completed frailty assessment while cautioning against performance tools during acute illness.', exact_texts: [...followup, ...exam, 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports treatment burden, carer involvement and reviewed support records.', exact_texts: ['Caregiver or care-home records reviewed if available', 'Medication list or reconciliation documentation reviewed if available'] },
    ],
    search_queries_used: ['site:nice.org.uk NG56 assess frailty gait self reported health acute illness', 'site:nice.org.uk NG56 multimorbidity goals treatment burden carers'],
    candidate_sources_rejected: ['automatic frailty score or category', 'frailty assessment during acute illness treated as valid'],
    rejection_reasons: ['Scores must be entered by a clinician using an appropriate validated tool.', 'The source explicitly cautions against performance assessment during acute illness.'],
    population_applicability: 'Adults with multimorbidity considered for frailty assessment; acutely unwell people require caution.',
    unresolved_source_gaps: ['Specific frailty tool, score, category, acute illness, cognition, nutrition, social care, treatment, and referral remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-functional-status-review',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact section supports interval day-to-day activity difficulty, gait, falls, function and support-service burden without assigning dependency.', exact_texts: [...followup, ...exam, 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports independence, work, social and family participation, carer involvement and clinician-entered review documentation.', exact_texts: ['Caregiver or care-home records reviewed if available', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG56 day to day activities independence function goals carers', 'site:who.int older people functional ability guidance'],
    candidate_sources_rejected: ['automatic functional score or dependency grade', 'automatic equipment, therapy, care package, or referral'],
    rejection_reasons: ['Only clinician-assessed function is documented.', 'No intervention or service recommendation is generated.'],
    population_applicability: 'Adults with multimorbidity and functional difficulty; not a complete validated functional assessment standard.',
    unresolved_source_gaps: ['Specific ADL and IADL domains, environment, cognition, capacity, equipment, services, and management remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-goals-of-care-discussion-documentation',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports documenting personal goals, values, priorities, independence, social activity, treatment burden and carer involvement without inferring a treatment choice.', exact_texts: [...history, 'patient concerns or goals documented if discussed', 'Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-end-of-life-ng142-2019', source_section_id: 'nice-ng142-review-needs-preferences', relationship: 'For adults already established as approaching end of life, the exact section supports documented review of preferences and plans at transitions; it does not extend to all older adults.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG56 personal goals values priorities multimorbidity', 'site:nice.org.uk NG142 review needs preferences advance care plan transitions'],
    candidate_sources_rejected: ['goals of care equated automatically with end-of-life care', 'automatic treatment limitation, resuscitation, capacity, or place-of-care decision'],
    rejection_reasons: ['General goals review and end-of-life planning are distinct and population-qualified.', 'All decisions must be explicitly clinician-documented.'],
    population_applicability: 'Adults with multimorbidity; NG142 applies only where the clinician has established an approaching-end-of-life context.',
    unresolved_source_gaps: ['Capacity, prognosis, legal validity, resuscitation, treatment limitation, substitute decision-maker, and final plan remain unsupported.'],
  }),
  geri({
    workflow_id: 'geri-hearing-impairment-geriatric-review',
    evidence_groups: [
      { source_id: 'nice-hearing-loss-adults-ng98-2023', source_section_id: 'nice-hearing-ng98-audiology-assessment', relationship: 'The exact adult hearing section supports interval hearing and communication needs, psychosocial and activity impact, otoscopy, audiometry, tympanometry, personalised discussion and reviewed outcomes without recommending a device.', exact_texts: [...followup, 'patient concerns or goals documented if discussed', 'Caregiver or care-home records reviewed if available', 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'nice-hearing-loss-adults-ng98-2023', source_section_id: 'nice-hearing-ng98-specific-signs-referral', relationship: 'The exact section supports clinician-performed assessment and concern documentation without generating referral.', exact_texts: [...exam, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'nice-hearing-loss-adults-ng98-2023', source_section_id: 'nice-hearing-ng98-audiology-assessment', relationship: 'The exact assessment section supports clinician-entered plan, follow-up and questions based on reviewed hearing needs and results.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG98 hearing loss adults communication needs psychosocial impact audiology follow up', 'site:entnet.org age related hearing loss 2024 guideline older adults'],
    candidate_sources_rejected: ['automatic age-related hearing-loss diagnosis', 'automatic hearing aid, implant, audiology referral, imaging, or follow-up interval'],
    rejection_reasons: ['Older age does not establish cause or device need.', 'All tests and plans remain clinician-entered.'],
    population_applicability: 'Adults with hearing impairment; sudden loss, neurological features, acute infection and children require separate pathways.',
    unresolved_source_gaps: ['Cause, exact audiology results, cognition, device status, diagnosis, treatment, referral, and interval remain unsupported.'],
  }),
]

export default {
  source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0546-0555', description: 'Workflow-specific geriatric continence, delirium, dementia, falls, frailty, function, goals, and hearing review.', sources, workflows }

import { SOURCE_META, evidenceWorkflow, noAuthoritativeWorkflow, section } from './authoredBatchSupport.mjs'

const REVIEW_DATE = '2026-07-14'
const registeredSource = (registry_file, source) => ({ registry_file, source })

const sources = [
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-multimorbidity-ng56-2016',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'Multimorbidity: clinical assessment and management — Recommendations',
    exact_official_url: SOURCE_META['nice-multimorbidity-ng56-2016'].url,
    publication_date: '2016-09-21',
    effective_date: '2016-09-21',
    revision_date: null,
    version: 'NICE guideline NG56',
    jurisdiction: 'England and Wales; international evidence requiring UAE geriatric and primary-care adaptation',
    population: 'Adults with two or more long-term conditions, including frailty, falls, sensory impairment, chronic pain, mental health conditions, and treatment burden.',
    clinical_setting: 'Primary and community care with person-centred multimorbidity review.',
    applicability_note: 'Exact for documenting day-to-day function, frailty and falls context, treatment burden, multiple medicines, personal goals, values, carer involvement, and clinician-led treatment review. It does not auto-score frailty or recommend starting, stopping, or changing treatment.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_NG56_recommendations_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_guideline_page' },
    exact_sections: [
      section('nice-ng56-identification-function-frailty', 'Recommendations 1.1.1–1.4.4 — multimorbidity, daily activities, falls, medicines, and frailty context', 'official recommendations 1.1.1–1.4.4', 'Supports documenting long-term-condition burden, day-to-day activity difficulty, support from multiple services, frailty or falls context, number of regular medicines, gait and self-reported health assessment when actually completed.'),
      section('nice-ng56-priorities-goals', 'Recommendations 1.6.1–1.6.8 — treatment burden, day-to-day life, carers, goals, values, and priorities', 'official recommendations 1.6.1–1.6.8', 'Supports documenting functional impact, mental and physical health interaction, treatment burden, carer involvement, independence, social activity, personal goals, values, priorities, and medicine concerns.'),
      section('nice-ng56-treatment-review', 'Recommendations 1.6.9–1.6.15 — medicines and treatment review', 'official recommendations 1.6.9–1.6.15', 'Supports clinician-led review of benefits, harms, treatment burden, personal priorities, and a documented discussion about reducing or stopping treatment without generating a medication change.'),
    ],
  }),
  registeredSource('international_clinical_sources.json', {
    source_id: 'nice-end-of-life-ng142-2019',
    issuing_organisation: 'National Institute for Health and Care Excellence',
    exact_document_title: 'End of life care for adults: service delivery — Recommendations',
    exact_official_url: SOURCE_META['nice-end-of-life-ng142-2019'].url,
    publication_date: '2019-10-16',
    effective_date: '2019-10-16',
    revision_date: null,
    version: 'NICE guideline NG142',
    jurisdiction: 'England and Wales; international evidence requiring UAE legal, capacity, consent, and end-of-life adaptation',
    population: 'Adults approaching the end of life and their carers or other important people, with consent and capacity qualifications.',
    clinical_setting: 'Coordinated health and social care, including advance care planning and transitions.',
    applicability_note: 'Exact only when the clinician has established that the adult is approaching end of life. Supports recording advance-care-planning participation, preferences, carers, plan availability, and review at transitions; it does not infer prognosis, capacity, goals, or treatment decisions.',
    recency_verification: { verified_on: REVIEW_DATE, status: 'official_NICE_NG142_recommendations_reviewed' },
    superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_NICE_guideline_page' },
    exact_sections: [
      section('nice-ng142-advance-care-planning', 'Recommendations 1.6.1–1.6.7 — advance care planning and involvement', 'official recommendations 1.6.1–1.6.7', 'Supports documenting that advance care planning was offered or completed, who was involved with consent, the person’s stated preferences, and where the plan is available, with capacity and legal context kept clinician-led.'),
      section('nice-ng142-review-needs-preferences', 'Recommendation 1.7.1 — reviewing needs, preferences, and advance plans', 'official recommendation 1.7.1', 'Supports documenting clinician-completed review of changing health and social needs, preferences, and advance plans at transitions without generating a care decision.'),
    ],
  }),
]

const history = ['onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed']
const followupHistory = [...history, 'change since last review documented']
const entExam = ['Ear/nose/throat examination documented only if assessed', 'Neck examination documented only if assessed', 'General appearance documented only if assessed']
const entPlan = ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed']
const geriHistory = history
const geriExam = ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Medication/support context documented only if assessed']
const geriRecords = ['Medication list or reconciliation documentation reviewed if available', 'Falls/cognition/function screen results documented if completed', 'Caregiver or care-home records reviewed if available']

function evidence(config, domain) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: domain === 'geriatrics' ? 'Primary, community, geriatric, care-home, or multidisciplinary review as qualified by the source.' : 'Primary, urgent, audiology, vestibular, voice, or ENT assessment as qualified by the source.',
    UAE_applicability: domain === 'geriatrics' ? 'International evidence requires UAE geriatric, primary-care, capacity, consent, social-care, medicines, referral, and local legal adaptation.' : 'International evidence requires UAE ENT, audiology, vestibular, cancer-pathway, prescribing, referral, and emergency adaptation.',
    recency_verification: `Exact official sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on the issuing organisation website at the review date.',
  })
}

const workflows = [
  noAuthoritativeWorkflow({
    workflow_id: 'ent-tonsil-stone-symptoms',
    search_queries_used: ['site:entnet.org tonsillolith guideline', 'site:nice.org.uk tonsil stones guideline', 'site:entuk.org tonsillolith'],
    official_pages_opened: ['https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/tonsillectomy-in-children-update/'],
    candidate_sources_rejected: ['AAO-HNSF paediatric tonsillectomy guideline', 'commercial tonsil-stone treatment pages'],
    rejection_reasons: ['The guideline addresses paediatric recurrent infection and sleep-disordered breathing, not an age-neutral tonsillolith workflow.', 'Commercial pages are not authoritative primary evidence.'],
    population_applicability: 'People reporting possible tonsil-stone symptoms; infection, abscess, oral lesion, foreign body, malignancy, and other throat causes remain possible.',
    setting_applicability: 'Primary or ENT assessment.',
    UAE_applicability: 'No exact UAE or directly applicable authoritative tonsillolith guideline was identified.',
    recency_verification: `Official guideline catalogues were searched on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable current guideline was found.',
    unresolved_source_gaps: ['Symptoms, examination, differential context, diagnosis, procedure, medicine, self-care advice, referral, and follow-up remain unsupported.'],
  }),
  evidence({
    workflow_id: 'ent-unilateral-nasal-obstruction-documentation',
    evidence_groups: [
      { source_id: 'bsaci-rhinitis-2017', source_section_id: 'bsaci-rhinitis-2017-history-red-flags', relationship: 'The exact rhinitis history section supports documenting unilateral obstruction, duration, discharge, bleeding, smell, triggers, sleep and impact without assigning rhinitis or structural disease.', exact_texts: history },
      { source_id: 'bsaci-rhinitis-2017', source_section_id: 'bsaci-rhinitis-2017-examination', relationship: 'The exact examination section supports clinician-performed nasal, oral and upper-airway assessment without auto-populating findings.', exact_texts: entExam },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-head-neck-features', relationship: 'The exact head-and-neck section supports clinician concern and reviewed specialist information in qualified contexts without asserting cancer.', exact_texts: ['clinician concern requiring escalation documented if present', 'Imaging or specialist report reviewed if already available'] },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-safety-netting-review', relationship: 'The exact safety-net section supports documenting clinician-entered plans and review only when completed.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:bsaci.org unilateral nasal obstruction red flags history examination', 'site:nice.org.uk NG12 unilateral nasal obstruction head neck cancer'],
    candidate_sources_rejected: ['automatic polyp, septal deviation, sinusitis, or malignancy diagnosis', 'automatic endoscopy, imaging, biopsy, medicine, or referral'],
    rejection_reasons: ['Unilateral obstruction is a symptom requiring direct assessment.', 'No autonomous investigation or management was mapped.'],
    population_applicability: 'Adults and children with unilateral nasal obstruction; age, trauma, foreign body, bleeding, infection, and tumour-risk contexts alter assessment.',
    unresolved_source_gaps: ['Paediatric foreign body, trauma, exact nasal findings, diagnosis, investigation, and management remain unsupported.'],
  }, 'ent'),
  evidence({
    workflow_id: 'ent-vertigo-episode-documentation',
    evidence_groups: [
      { source_id: 'nice-suspected-neurological-conditions-ng127-2023', source_section_id: 'nice-ng127-adult-dizziness-vertigo', relationship: 'The exact adult section supports documenting onset, episode pattern, associated hearing or neurological symptoms, relevant negatives, functional impact and clinician concern without diagnosing a vestibular or neurological cause.', exact_texts: [...history, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'aao-hns-bppv-2017', source_section_id: 'aao-bppv-2017-assessment-modifiers', relationship: 'The exact BPPV section supports positional context, mobility, falls, support, and clinician-performed assessment without asserting BPPV or generating a manoeuvre.', exact_texts: ['Ear/nose/throat examination documented only if assessed', 'General appearance documented only if assessed'] },
      { source_id: 'aao-hns-bppv-2017', source_section_id: 'aao-bppv-2017-reassessment-education', relationship: 'The exact reassessment section supports clinician-entered review, safety discussion, questions, and follow-up without treatment advice.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:nice.org.uk NG127 adult dizziness vertigo focal neurological hearing symptoms', 'site:entnet.org BPPV guideline assessment modifying factors reassessment'],
    candidate_sources_rejected: ['automatic BPPV or stroke diagnosis', 'automatic HINTS, Hallpike, imaging, manoeuvre, medicine, or referral'],
    rejection_reasons: ['Episode documentation alone cannot establish cause.', 'All assessments and actions remain clinician-entered.'],
    population_applicability: 'Adults with vertigo episodes; children, pregnancy, acute neurological deficit, and severe uncontrolled vestibular presentations require separate pathways.',
    unresolved_source_gaps: ['Paediatric episodes, exact examination, diagnosis, investigation, treatment, urgency, and referral remain unsupported.'],
  }, 'ent'),
  evidence({
    workflow_id: 'ent-vocal-cord-lesion-follow-up',
    evidence_groups: [
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-definition-history', relationship: 'The exact dysphonia section supports interval voice quality, duration, vocal demand, tobacco and reflux context, impact, associated symptoms and concerns without characterising the lesion.', exact_texts: followupHistory },
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-escalation-laryngoscopy', relationship: 'The exact section supports clinician-performed ENT and neck assessment, reviewed specialist reports, and concern documentation without ordering laryngoscopy or asserting progression.', exact_texts: [...entExam, 'Imaging or specialist report reviewed if already available', 'clinician concern requiring escalation documented if present'] },
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-education-outcomes', relationship: 'The exact outcomes section supports clinician-entered discussion, follow-up, safety net, and questions without treatment advice.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:entnet.org dysphonia guideline laryngeal lesion follow-up outcomes', 'site:entnet.org hoarseness laryngoscopy modifying factors 2018'],
    candidate_sources_rejected: ['automatic benign or malignant lesion classification', 'automatic laryngoscopy, biopsy, voice therapy, medicine, or surgery'],
    rejection_reasons: ['The workflow title does not identify pathology or prior procedure.', 'No investigation or treatment is generated.'],
    population_applicability: 'People with a clinician-established vocal-cord lesion under follow-up; pathology, age, procedure, airway, and cancer risk require separate evidence.',
    unresolved_source_gaps: ['Lesion type, pathology, procedure, laryngoscopy findings, diagnosis, treatment, and surveillance interval remain unsupported.'],
  }, 'ent'),
  evidence({
    workflow_id: 'ent-voice-strain-documentation',
    evidence_groups: [
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-definition-history', relationship: 'The exact section supports documenting voice quality, onset, duration, vocal demand, functional impact, tobacco, reflux and associated symptoms without diagnosing vocal strain.', exact_texts: history },
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-escalation-laryngoscopy', relationship: 'The exact section supports clinician-performed ENT and neck assessment plus concern and reviewed specialist information without generating laryngoscopy or referral.', exact_texts: [...entExam, 'Imaging or specialist report reviewed if already available', 'clinician concern requiring escalation documented if present'] },
      { source_id: 'aao-hns-dysphonia-cpg-2018', source_section_id: 'aao-dysphonia-2018-education-outcomes', relationship: 'The exact outcomes section supports recording clinician-completed discussion and follow-up.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:entnet.org hoarseness dysphonia vocal demand history guideline 2018', 'site:entnet.org dysphonia outcomes education follow-up'],
    candidate_sources_rejected: ['voice strain treated as a diagnosis', 'automatic voice rest, therapy, reflux treatment, steroid, imaging, or referral'],
    rejection_reasons: ['The phrase is a symptom description and not an established cause.', 'No autonomous advice or treatment is mapped.'],
    population_applicability: 'Adults and children with voice symptoms; age, duration, airway, procedure, tobacco, and professional voice use alter assessment.',
    unresolved_source_gaps: ['Exact laryngeal findings, cause, diagnosis, treatment, and referral remain unsupported.'],
  }, 'ent'),
  evidence({
    workflow_id: 'geri-activities-of-daily-living-documentation',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact section supports documenting difficulty with day-to-day activities, mobility, falls, frailty context and support needs without auto-scoring function or frailty.', exact_texts: [...geriHistory, ...geriExam, 'Falls/cognition/function screen results documented if completed'] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports independence, carer involvement, reviewed support records and clinician-entered planning without generating services or treatment.', exact_texts: ['Caregiver or care-home records reviewed if available', ...entPlan] },
    ],
    search_queries_used: ['site:nice.org.uk NG56 day-to-day activities independence frailty falls multimorbidity', 'site:who.int ICOPE functional ability older people assessment'],
    candidate_sources_rejected: ['automatic ADL score or dependency classification', 'automatic care package, equipment, therapy, or referral'],
    rejection_reasons: ['Only clinician-entered assessment is supported.', 'No service or management recommendation is generated.'],
    population_applicability: 'Adults with multimorbidity, especially frailty, falls, sensory impairment, and treatment burden; not a universal geriatric assessment standard.',
    unresolved_source_gaps: ['Specific ADL domains, collateral reliability, cognition, capacity, environment, equipment, and services remain unsupported.'],
  }, 'geriatrics'),
  evidence({
    workflow_id: 'geri-advance-care-planning-documentation',
    evidence_groups: [
      { source_id: 'nice-end-of-life-ng142-2019', source_section_id: 'nice-ng142-advance-care-planning', relationship: 'The exact section supports documenting that an eligible adult was offered or completed advance care planning, stated preferences, consented involvement, and plan availability without inferring prognosis, capacity, or choices.', exact_texts: [...geriHistory, 'patient concerns or goals documented if discussed', 'Caregiver or care-home records reviewed if available', 'Medication/support context documented only if assessed'] },
      { source_id: 'nice-end-of-life-ng142-2019', source_section_id: 'nice-ng142-review-needs-preferences', relationship: 'The exact review section supports clinician-entered review, safety documentation, follow-up, and questions when actually completed.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:nice.org.uk NG142 advance care planning carers preferences review transition', 'site:nice.org.uk NG108 advance care planning capacity consent'],
    candidate_sources_rejected: ['approaching end of life inferred from age', 'automatic resuscitation, treatment limitation, place-of-care, or capacity decision'],
    rejection_reasons: ['The source applies only after clinician-established eligibility.', 'All decisions and preferences must be explicitly clinician-documented.'],
    population_applicability: 'Adults approaching end of life; age alone does not establish applicability. UAE law, capacity, consent, and policy govern.',
    unresolved_source_gaps: ['Eligibility, prognosis, capacity, legal validity, named decision-makers, resuscitation, treatment limitations, and place preferences remain unsupported unless entered.'],
  }, 'geriatrics'),
  evidence({
    workflow_id: 'geri-caregiver-support-review',
    evidence_groups: [
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-driving-carer-support', relationship: 'The exact dementia carer-support section supports interval caregiver needs, physical and mental wellbeing, education, support access, preferences and carer assessment without assuming dementia or prescribing services.', exact_texts: [...followupHistory, 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-monitoring-support', relationship: 'The exact monitoring section supports documenting emerging support needs, care coordination, clinician-entered plans, follow-up and questions.', exact_texts: [...geriExam, 'Falls/cognition/function screen results documented if completed', ...entPlan] },
    ],
    search_queries_used: ['site:nice.org.uk NG97 carers support needs assessment dementia recommendations', 'site:nice.org.uk supporting adult carers NG150 assessment support'],
    candidate_sources_rejected: ['dementia carer guidance applied to all caregivers', 'automatic respite, therapy, referral, or service allocation'],
    rejection_reasons: ['Evidence is exact only when caring for a person living with dementia.', 'Services and actions remain clinician-entered.'],
    population_applicability: 'Partial: carers of people living with dementia; other caregiver contexts require separate evidence.',
    unresolved_source_gaps: ['Non-dementia caregiving, carer identity, consent, burden tool, safeguarding, service eligibility, and referral remain unsupported.'],
  }, 'geriatrics'),
  evidence({
    workflow_id: 'geri-cognitive-decline-review',
    evidence_groups: [
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-memory-initial-assessment', relationship: 'The exact dementia assessment section supports cognitive, behavioural and psychological history, collateral history, daily-life impact, clinician-performed physical or neurological assessment, validated tools and reviewed investigations without diagnosing dementia.', exact_texts: [...followupHistory, ...geriExam, ...geriRecords] },
      { source_id: 'nice-dementia-ng97-2025', source_section_id: 'nice-ng97-monitoring-support', relationship: 'The exact monitoring section supports review of emerging needs, coordination, clinician-entered plan, safety net, follow-up, and questions.', exact_texts: entPlan },
    ],
    search_queries_used: ['site:nice.org.uk NG97 dementia initial assessment cognitive behavioural daily life collateral history', 'site:nice.org.uk NG97 monitoring emerging dementia needs primary care'],
    candidate_sources_rejected: ['automatic dementia or mild cognitive impairment diagnosis', 'automatic cognitive score, imaging, laboratory test, medicine, or referral'],
    rejection_reasons: ['Cognitive decline has multiple causes requiring competent assessment.', 'No score, diagnosis, investigation, or management is generated.'],
    population_applicability: 'Adults with possible cognitive decline; acute fluctuation, delirium, neurological deficit, sensory impairment, and communication needs require separate assessment.',
    unresolved_source_gaps: ['Acute versus chronic course, specific cognitive domains, capacity, collateral reliability, diagnosis, investigation, and management remain unsupported.'],
  }, 'geriatrics'),
  evidence({
    workflow_id: 'geri-comprehensive-geriatric-review',
    evidence_groups: [
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-identification-function-frailty', relationship: 'The exact multimorbidity section supports documenting function, frailty, falls, sensory impairment, long-term conditions, medicines and service burden without claiming a completed comprehensive geriatric assessment.', exact_texts: [...followupHistory, ...geriExam, ...geriRecords] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact priorities section supports values, independence, social activity, carer involvement, clinician-entered plans and follow-up.', exact_texts: [...entPlan] },
    ],
    search_queries_used: ['site:nice.org.uk NG56 multimorbidity functional frailty medicines goals carers', 'site:who.int comprehensive geriatric assessment older people integrated care'],
    candidate_sources_rejected: ['generic workflow labelled as a completed comprehensive geriatric assessment', 'automatic frailty score, care plan, medicine change, equipment, or referral'],
    rejection_reasons: ['The source supports selected domains, not proof that a formal CGA was completed.', 'All actions remain clinician-entered.'],
    population_applicability: 'Older adults with multimorbidity who may benefit from a person-centred review; acute illness and condition-specific care require separate pathways.',
    unresolved_source_gaps: ['A complete validated CGA domain set, cognition, mood, continence, nutrition, social care, capacity, and multidisciplinary actions remain only partially supported.'],
  }, 'geriatrics'),
]

export default {
  source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0536-0545', description: 'Workflow-specific ENT and initial geriatric exact-section review.', sources, workflows }

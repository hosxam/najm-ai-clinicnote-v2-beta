import { evidenceWorkflow } from './authoredBatchSupport.mjs'

const REVIEW_DATE = '2026-07-14'
const history = ['onset/duration documented if discussed', 'severity/impact on function documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'patient concerns or goals documented if discussed']
const followup = [...history, 'change since last review documented']
const geriExam = ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Medication/support context documented only if assessed']
const geriRecords = ['Medication list or reconciliation documentation reviewed if available', 'Falls/cognition/function screen results documented if completed', 'Caregiver or care-home records reviewed if available']
const giExam = ['Abdominal examination documented only if assessed', 'Hydration/nutrition status documented only if assessed', 'General appearance documented only if assessed']
const giResults = ['Laboratory results reviewed if already ordered', 'Endoscopy or imaging reports reviewed if available', 'Stool or liver-related results reviewed if available']
const plan = ['clinician-entered plan documented', 'safety-netting documented if discussed by clinician', 'follow-up documented if arranged by clinician', 'patient questions documented if discussed']

function reviewed(config, domain) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: domain === 'gi' ? 'Primary, gastroenterology, hepatology, imaging-result, or outpatient follow-up as qualified by the exact source.' : 'Primary, community, geriatric, care-home, sleep, sensory, nutrition, or multidisciplinary review as qualified by the exact source.',
    UAE_applicability: domain === 'gi' ? 'UAE DHA evidence applies where cited; international gastroenterology and hepatology evidence requires UAE laboratory, imaging, referral, alcohol-service, prescribing, and local pathway adaptation.' : 'UAE DHA evidence applies where cited; international evidence requires UAE geriatric, primary-care, social-care, sensory, nutrition, device, referral, and local policy adaptation.',
    recency_verification: `Exact official sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on the issuing organisation website at the review date.',
  })
}

const workflows = [
  reviewed({
    workflow_id: 'geri-sleep-issue-in-older-adult',
    evidence_groups: [
      { source_id: 'dha-insomnia-issue2-2024', source_section_id: 'dha-insomnia-i2-history-daytime-function', relationship: 'The exact UAE section supports documenting sleep initiation, maintenance, early waking, non-restorative sleep, duration, opportunity, daytime fatigue, concentration, mood, irritability and function without diagnosing insomnia.', exact_texts: history },
      { source_id: 'dha-insomnia-issue2-2024', source_section_id: 'dha-insomnia-i2-red-flags-evaluation', relationship: 'The exact section supports clinician-assessed apnoea, sleep attacks, falls or injury, mood, substance and functional concerns plus cognitive or frailty context without populating findings.', exact_texts: [...geriExam, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'dha-insomnia-issue2-2024', source_section_id: 'dha-insomnia-i2-causes-investigations', relationship: 'The exact section supports reviewing medicines, caffeine, nicotine, substances, pain, thyroid, breathing, mood, anxiety, environment and existing records without ordering a test.', exact_texts: geriRecords },
      { source_id: 'dha-insomnia-issue2-2024', source_section_id: 'dha-insomnia-i2-management-referral', relationship: 'The exact section supports recording clinician-completed discussion, plan, monitoring, follow-up and questions without generating sleep-hygiene, medicine or referral advice.', exact_texts: plan },
    ],
    search_queries_used: ['site:dha.gov.ae telehealth insomnia guideline sleep history daytime function red flags 2024', 'site:nice.org.uk older adults insomnia medicines falls guideline'],
    candidate_sources_rejected: ['automatic insomnia diagnosis', 'automatic sleep hygiene, melatonin, sedative, CBT-I, test, or referral advice'],
    rejection_reasons: ['A sleep complaint may arise from medical, psychiatric, respiratory, neurological, medicine, substance, environmental, or circadian causes.', 'No autonomous management is mapped.'],
    population_applicability: 'Adults with sleep difficulty; the DHA guideline is not specific to frail older adults and medicine, cognition, falls, nocturia and sleep-disordered breathing need tailored review.',
    unresolved_source_gaps: ['Older-adult-specific evidence, exact sleep pattern, cognition, falls, nocturia, apnoea, medicines, diagnosis, treatment, and referral remain partially unsupported.'],
  }, 'geri'),
  reviewed({
    workflow_id: 'geri-social-isolation-review',
    evidence_groups: [
      { source_id: 'nice-older-people-wellbeing-ng32-2015', source_section_id: 'nice-ng32-risk-isolation-decline', relationship: 'The exact section supports documenting interval living circumstances, social opportunity, bereavement, separation, retirement, income, recent illness, driving cessation, disability and advanced-age context without asserting isolation.', exact_texts: followup },
      { source_id: 'nice-older-people-wellbeing-ng32-2015', source_section_id: 'nice-ng32-social-connection-activities', relationship: 'The exact section supports documenting interests, social connection, purpose, friendships, communication access, caregiver context and clinician-completed discussion without prescribing an activity.', exact_texts: ['Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG32 older people social isolation living alone bereavement driving disability', 'site:nice.org.uk NG32 social connection friendship activities interests'],
    candidate_sources_rejected: ['automatic loneliness or depression conclusion', 'automatic befriending, volunteering, community programme, therapy, or referral'],
    rejection_reasons: ['Risk circumstances do not prove subjective loneliness or mental illness.', 'Any support discussed must be clinician-entered and locally available.'],
    population_applicability: 'People aged 65 or older at risk of decline in independence or mental wellbeing; care-home populations are not the primary NG32 scope.',
    unresolved_source_gaps: ['Subjective loneliness, safeguarding, cognition, mood, capacity, service availability, referral, and follow-up remain unsupported.'],
  }, 'geri'),
  reviewed({
    workflow_id: 'geri-vision-impairment-geriatric-review',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact section supports interval vision concerns as part of comprehensive falls assessment together with function, gait, cognition, medicines, hearing and support context; it does not diagnose eye disease.', exact_texts: [...followup, ...geriExam, ...geriRecords] },
      { source_id: 'nice-older-people-wellbeing-ng32-2015', source_section_id: 'nice-ng32-risk-isolation-decline', relationship: 'The exact section supports documenting age-related vision impairment, driving cessation, living circumstances and social impact without generating ophthalmic management.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG249 falls comprehensive assessment vision older people', 'site:nice.org.uk NG32 age related disability vision driving social isolation'],
    candidate_sources_rejected: ['automatic cataract, macular degeneration, glaucoma, or refractive diagnosis', 'automatic eye test, imaging, medicine, surgery, referral, driving restriction, or aid'],
    rejection_reasons: ['The reviewed sources support functional and falls context only.', 'Ophthalmic diagnosis and management require eye-specific assessment.'],
    population_applicability: 'Older adults with vision impairment in falls, function, or social-context review; acute pain, red eye, trauma and sudden vision change require separate pathways.',
    unresolved_source_gaps: ['Visual acuity, onset, laterality, ocular symptoms, examination, diagnosis, investigation, treatment, driving decision, and referral remain unsupported.'],
  }, 'geri'),
  reviewed({
    workflow_id: 'geri-walking-aid-review',
    evidence_groups: [
      { source_id: 'nice-falls-ng249-2025', source_section_id: 'nice-ng249-falls-comprehensive-assessment', relationship: 'The exact section supports documenting gait, balance, muscle strength, function, footwear, mobility, neurological, vision, cognition, medicines and support context during review of a walking aid without prescribing or fitting one.', exact_texts: [...followup, ...geriExam, ...geriRecords] },
      { source_id: 'nice-multimorbidity-ng56-2016', source_section_id: 'nice-ng56-priorities-goals', relationship: 'The exact section supports independence, social participation, carer involvement and clinician-entered follow-up documentation.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG249 gait balance mobility walking aid assessment older people', 'site:nice.org.uk NG56 independence function personal goals carers'],
    candidate_sources_rejected: ['automatic walking-aid prescription or fit conclusion', 'automatic physiotherapy, occupational therapy, exercise, or referral'],
    rejection_reasons: ['Device suitability and fit require direct competent assessment.', 'No equipment or service recommendation is generated.'],
    population_applicability: 'Older adults using or discussing a walking aid; acute injury, neurological deficit, severe pain and unsafe mobility require separate assessment.',
    unresolved_source_gaps: ['Aid type, fit, condition, technique, environment, falls, examination, adjustment, replacement, training, and referral remain unsupported.'],
  }, 'geri'),
  reviewed({
    workflow_id: 'geri-weight-loss-in-older-adult',
    evidence_groups: [
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-screening-concern', relationship: 'The exact adult section supports documenting onset, unintentional weight loss, poor appetite, taste, swallowing, bowel habit, reduced intake, prolonged illness, BMI and percentage loss when measured without assigning malnutrition.', exact_texts: [...history, 'Medication/support context documented only if assessed', 'Caregiver or care-home records reviewed if available'] },
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-malnutrition-risk-context', relationship: 'The exact section supports clinician-recorded risk context, functional or cognitive assessment, consent or best-interest discussion, and entered plan without generating nutrition support.', exact_texts: ['Functional/cognitive screen documentation documented only if assessed', 'Falls/frailty observations documented only if assessed', 'Falls/cognition/function screen results documented if completed', ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk CG32 unintentional weight loss poor appetite swallowing BMI reduced intake', 'site:nice.org.uk suspected cancer unexplained weight loss older adult'],
    candidate_sources_rejected: ['automatic malnutrition or cancer diagnosis', 'automatic supplement, feeding, investigation, referral, or urgency'],
    rejection_reasons: ['Unintentional weight loss has broad medical, psychiatric, social and medication causes.', 'No diagnosis or management is generated.'],
    population_applicability: 'Adults with unintentional weight loss; CG32 is not geriatric-specific and acute illness, swallowing safety, cancer, depression, dementia and social causes require tailored review.',
    unresolved_source_gaps: ['Measured weight trajectory, BMI, cause, red flags, examination, investigation, diagnosis, nutrition intervention, and referral remain unsupported.'],
  }, 'geri'),
  reviewed({
    workflow_id: 'gi-abdominal-bloating',
    evidence_groups: [
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-symptom-profile', relationship: 'The exact adult IBS symptom-profile section supports duration, bloating, pain or discomfort, bowel-habit change, relation to defaecation, stool frequency or form, urgency, incomplete evacuation, food association, mucus and impact without diagnosing IBS.', exact_texts: history },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-red-flags', relationship: 'The exact section supports clinician assessment and examination for red-flag context without populating a negative or asserting disease.', exact_texts: [...giExam, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-followup', relationship: 'The exact follow-up section supports clinician-entered follow-up and safety-net documentation when arranged without setting an interval or treatment.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG61 IBS bloating bowel habit abdominal discomfort symptom profile', 'site:dha.gov.ae abdominal pain adults bloating red flags telehealth'],
    candidate_sources_rejected: ['bloating treated automatically as IBS', 'automatic diet, medicine, laboratory test, imaging, endoscopy, or referral'],
    rejection_reasons: ['Bloating has gastrointestinal, gynaecological, urinary, dietary and systemic causes.', 'No autonomous investigation or management is mapped.'],
    population_applicability: 'Adults with chronic bloating in an IBS-symptom context; children, acute distension, pregnancy, obstruction and systemic illness require separate pathways.',
    unresolved_source_gaps: ['Acute versus chronic course, distension, diet, pregnancy, gynaecological and urinary context, cause, diagnosis, investigation, and treatment remain unsupported.'],
  }, 'gi'),
  reviewed({
    workflow_id: 'gi-abdominal-imaging-result-review',
    evidence_groups: [
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-history', relationship: 'The exact UAE adult section supports documenting the symptom context prompting result review, interval course, associated gastrointestinal, urinary or gynaecological symptoms, exposures and functional impact without interpreting the image.', exact_texts: followup },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-red-flags', relationship: 'The exact section supports clinician-assessed severe pain, fever, vomiting, bleeding, weight loss, dysphagia, haematuria, pregnancy and shock context without asserting absence or urgency.', exact_texts: [...giExam, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-investigations', relationship: 'The exact section supports recording that an imaging report or laboratory result was already reviewed by the clinician; it does not interpret the finding or order further tests.', exact_texts: giResults },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-referral', relationship: 'The exact referral context supports documenting a clinician-entered plan, safety net and follow-up without generating referral or urgency.', exact_texts: plan },
    ],
    search_queries_used: ['site:dha.gov.ae abdominal pain adults investigations imaging referral red flags 2024', 'site:rcem.ac.uk investigation result review guideline'],
    candidate_sources_rejected: ['automatic imaging interpretation or diagnosis', 'automatic repeat imaging, laboratory test, referral, treatment, or urgency'],
    rejection_reasons: ['The report and clinician interpretation must be entered explicitly.', 'No action follows solely from the generic workflow title.'],
    population_applicability: 'Adults reviewing abdominal imaging obtained for a clinician-defined indication; modality, finding and clinical context are unspecified.',
    unresolved_source_gaps: ['Result source and date, exact report text, incidental findings, comparison, clinician interpretation, diagnosis, action, and follow-up remain unsupported.'],
  }, 'gi'),
  reviewed({
    workflow_id: 'gi-abdominal-pain-follow-up',
    evidence_groups: [
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-history', relationship: 'The exact UAE section supports interval onset, location, character, severity, change, gastrointestinal, urinary, gynaecological, exposure, travel, trauma and medical history without assigning cause.', exact_texts: followup },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-red-flags', relationship: 'The exact section supports clinician-assessed severe pain, fever, vomiting, rigidity, bleeding, weight loss, dysphagia, haematuria, pregnancy and shock context plus examination without auto-escalation.', exact_texts: [...giExam, 'clinician concern requiring escalation documented if present'] },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-investigations', relationship: 'The exact section supports clinician review of already ordered laboratory, stool, liver, endoscopy or imaging results without ordering or interpreting them automatically.', exact_texts: giResults },
      { source_id: 'dha-telehealth-abdominal-pain-adults-v2-2024', source_section_id: 'dha-abdominal-pain-adults-v2-referral', relationship: 'The exact section supports documenting clinician-entered plan, safety net, follow-up and questions without generating referral or urgency.', exact_texts: plan },
    ],
    search_queries_used: ['site:dha.gov.ae telehealth abdominal pain adults history red flags investigations referral 2024', 'site:dha.gov.ae abdominal pain follow up UAE guideline'],
    candidate_sources_rejected: ['automatic diagnosis from symptom pattern', 'automatic medicine, test, imaging, referral, emergency escalation, or interval'],
    rejection_reasons: ['Abdominal pain requires direct reassessment and context.', 'All actions remain clinician-entered.'],
    population_applicability: 'Adults with abdominal pain follow-up in DHA telehealth scope; emergency, pregnancy, controlled-medication and paediatric contexts require separate pathways.',
    unresolved_source_gaps: ['Current examination, exact result interpretation, diagnosis, treatment response, medicine, pregnancy, referral and interval remain unsupported.'],
  }, 'gi'),
  reviewed({
    workflow_id: 'gi-abnormal-liver-enzyme-review',
    evidence_groups: [
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-context-interpretation', relationship: 'The exact section supports interval context, prior results, current condition, specific abnormal analyte, associated symptoms and relevant negatives without interpreting significance from magnitude alone.', exact_texts: followup },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-clinical-history', relationship: 'The exact clinical-history section supports jaundice, abdominal pain, weight loss, pruritus, comorbidity, prescribed or non-prescribed medicines, travel, exposure and alcohol context plus clinician examination.', exact_texts: giExam },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-standard-panel', relationship: 'The exact section supports clinician review of bilirubin and standard liver blood-test components without interpretation.', exact_texts: ['Laboratory results reviewed if already ordered', 'Stool or liver-related results reviewed if available'] },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-aetiology-screen', relationship: 'The exact section supports recording already available ultrasound, hepatitis and other clinician-selected investigation results without ordering them.', exact_texts: ['Endoscopy or imaging reports reviewed if available'] },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-response-referral', relationship: 'The exact response section supports clinician concern, entered plan, safety net, follow-up and questions without assigning urgency or referral.', exact_texts: ['clinician concern requiring escalation documented if present', ...plan] },
    ],
    search_queries_used: ['site:bsg.org.uk abnormal liver blood tests guideline clinical history context interpretation', 'site:bsg.org.uk abnormal liver enzymes aetiology screen response referral'],
    candidate_sources_rejected: ['automatic liver-disease diagnosis or severity interpretation', 'automatic repeat tests, ultrasound, hepatitis test, medicine change, alcohol advice, or referral'],
    rejection_reasons: ['The guideline requires interpretation in clinical context.', 'No investigation or management is generated.'],
    population_applicability: 'Adults with abnormal liver blood tests; acute liver failure, pregnancy, children and specialist disease contexts require separate pathways.',
    unresolved_source_gaps: ['Exact analytes and values, pattern, trend, synthetic function, cause, diagnosis, medicine, investigation, referral, and interval remain unsupported.'],
  }, 'gi'),
  reviewed({
    workflow_id: 'gi-alcohol-related-liver-risk-documentation',
    evidence_groups: [
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-clinical-history', relationship: 'The exact clinical-history section supports documenting alcohol history, associated liver symptoms, comorbidity, medicines, travel, exposure, weight loss, pruritus and abdominal pain without diagnosing alcohol-related liver disease.', exact_texts: history },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-context-interpretation', relationship: 'The exact section supports review of prior and current laboratory context without interpreting significance solely from values.', exact_texts: ['Laboratory results reviewed if already ordered', 'Stool or liver-related results reviewed if available'] },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-aetiology-screen', relationship: 'The exact section supports recording already available imaging or aetiology-screen results without ordering them.', exact_texts: ['Endoscopy or imaging reports reviewed if available'] },
      { source_id: 'bsg-abnormal-liver-blood-tests-2018', source_section_id: 'bsg-liver-tests-2018-response-referral', relationship: 'The exact section supports clinician concern, entered plan, safety net, follow-up and questions without generating alcohol counseling, treatment, referral, or urgency.', exact_texts: ['clinician concern requiring escalation documented if present', ...plan] },
    ],
    search_queries_used: ['site:bsg.org.uk abnormal liver blood tests alcohol history clinical assessment', 'site:doh.gov.ae alcohol related liver disease guideline UAE'],
    candidate_sources_rejected: ['automatic alcohol-use disorder or liver-disease diagnosis', 'automatic withdrawal advice, abstinence instruction, medicine, test, referral, or urgency'],
    rejection_reasons: ['Alcohol exposure and abnormal liver tests do not by themselves establish diagnosis or severity.', 'No autonomous advice or management is generated.'],
    population_applicability: 'Adults with clinician-identified alcohol-related liver risk or abnormal liver tests; acute withdrawal, intoxication, liver failure and pregnancy require separate pathways.',
    unresolved_source_gaps: ['Amount and pattern, dependence, withdrawal risk, objective results, diagnosis, severity, safeguarding, advice, treatment, and referral remain unsupported.'],
  }, 'gi'),
]

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0566-0575', description: 'Workflow-specific geriatric sleep, social, sensory, mobility, nutrition and GI review.', sources: [], workflows }

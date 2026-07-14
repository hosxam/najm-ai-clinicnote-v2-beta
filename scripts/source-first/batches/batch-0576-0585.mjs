import { GI_SOURCES } from './giAuthoritativeSources.mjs'
import { examAndConcern, followup, giEvidence, giNoSource, history, plan, resultContext, results } from './giBatchSupport.mjs'

const workflows = [
  giEvidence({
    workflow_id: 'gi-anal-fissure-symptoms',
    evidence_groups: [
      { source_id: 'ascrs-anal-fissures-2023', source_section_id: 'ascrs-fissure-2023-presentation', relationship: 'The exact presentation section supports defecation-related pain, post-defecation pain, bright-red bleeding, constipation or diarrhoea context, duration, and impact without diagnosing a fissure.', exact_texts: history },
      { source_id: 'ascrs-anal-fissures-2023', source_section_id: 'ascrs-fissure-2023-atypical-assessment', relationship: 'The exact atypical-context section supports clinician-observed anorectal findings and concern documentation only when assessed; it does not imply an intimate examination occurred.', exact_texts: examAndConcern },
      { source_id: 'ascrs-anal-fissures-2023', source_section_id: 'ascrs-fissure-2023-presentation', relationship: 'The exact section supports recording already reviewed investigation context and clinician-entered follow-up without generating examination, treatment, or referral.', exact_texts: [...results, ...plan] },
    ],
    search_queries_used: ['site:fascrs.org 2023 anal fissure guideline symptoms pain defecation bleeding atypical', 'site:fascrs.org anal fissure guideline examination chronic acute'],
    candidate_sources_rejected: ['haemorrhoid guidance used as proof of fissure', 'patient information used to generate laxative, topical, botulinum, or surgical advice'],
    rejection_reasons: ['Different anorectal causes require separate assessment.', 'The workflow documents clinician-entered actions only.'],
    population_applicability: 'Adults with fissure-like symptoms; paediatric, pregnancy, postpartum, inflammatory, infectious, malignant, and immunocompromised contexts require separate evidence.',
    unresolved_source_gaps: ['Exact bleeding amount, bowel pattern, pregnancy or postpartum status, consent, chaperone, examination findings, diagnosis, medicine, procedure, referral, and urgency remain unsupported unless entered.'],
  }),
  giEvidence({
    workflow_id: 'gi-appetite-loss-gi-review',
    evidence_groups: [
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-screening-concern', relationship: 'The exact screening section supports appetite, reduced intake, duration, weight change, swallowing, illness, and functional-impact documentation without assigning malnutrition.', exact_texts: followup },
      { source_id: 'nice-nutrition-support-cg32-2017', source_section_id: 'nice-cg32-malnutrition-risk-context', relationship: 'The exact section supports clinician-assessed nutrition and general status plus existing results and an entered plan without generating feeding or supplementation advice.', exact_texts: [...examAndConcern, ...results, ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk CG32 appetite loss reduced intake weight loss nutrition screening', 'site:nice.org.uk CG32 malnutrition risk assessment adults'],
    candidate_sources_rejected: ['cancer guidance treated as the cause of appetite loss', 'automatic nutrition support or supplement advice'],
    rejection_reasons: ['Appetite loss is nonspecific and does not establish a diagnosis.', 'Nutrition actions require assessment and clinician decision.'],
    population_applicability: 'Adults with appetite loss or reduced intake; children, pregnancy, eating disorders, dysphagia, cancer, and acute illness require tailored evidence.',
    unresolved_source_gaps: ['Cause, measured intake, weight, BMI, swallowing safety, diagnosis, investigation, dietetic input, nutrition support, and follow-up interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-ascites-follow-up-documentation',
    evidence_groups: [
      { source_id: 'nice-cirrhosis-ng50-2023', source_section_id: 'nice-ng50-ascites-context', relationship: 'The exact ascites section supports interval symptoms, established ascites context, complications, infection concern, bleeding context, and clinician review without inferring severity or cause.', exact_texts: followup },
      { source_id: 'nice-cirrhosis-ng50-2023', source_section_id: 'nice-ng50-monitoring', relationship: 'The exact monitoring section supports clinician-assessed status, already available laboratory, imaging, and endoscopy results, and entered follow-up without calculating scores.', exact_texts: [...examAndConcern, ...results, ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG50 ascites cirrhosis monitoring complications follow-up', 'site:nice.org.uk NG50 varices ultrasound ascites infection'],
    candidate_sources_rejected: ['automatic decompensation or spontaneous bacterial peritonitis diagnosis', 'automatic diuretic, paracentesis, antibiotic, admission, or transplant advice'],
    rejection_reasons: ['Severity and complication status require direct clinical assessment.', 'No treatment, procedure, urgency, or referral is generated.'],
    population_applicability: 'People over 16 with established cirrhosis and ascites; non-cirrhotic, pregnancy, paediatric, malignant, cardiac, and acute unstable contexts need separate evidence.',
    unresolved_source_gaps: ['Aetiology, measured observations, fluid status, encephalopathy, infection, bleeding, renal function, score, procedure, medicine, admission, and referral remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-belching-and-burping-documentation',
    evidence_groups: [
      { source_id: 'nice-gord-dyspepsia-cg184-2019', source_section_id: 'nice-cg184-gord-symptom-profile', relationship: 'The exact adult dyspepsia and reflux symptom section supports documenting upper-GI symptom context, timing, associations, impact, and relevant negatives without assigning a disorder to belching.', exact_texts: history },
      { source_id: 'nice-gord-dyspepsia-cg184-2019', source_section_id: 'nice-cg184-gord-alarm-endoscopy', relationship: 'The exact alarm section supports clinician-assessed concern and already available examination or endoscopy context without ordering a procedure.', exact_texts: [...examAndConcern, ...results] },
      { source_id: 'nice-gord-dyspepsia-cg184-2019', source_section_id: 'nice-cg184-gord-management-referral', relationship: 'The exact management section supports only a clinician-entered plan, safety net, follow-up, and questions.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG184 belching burping dyspepsia reflux symptom assessment', 'site:nice.org.uk CG184 alarm features endoscopy review'],
    candidate_sources_rejected: ['functional belching diagnosis inferred from a symptom label', 'automatic diet, medicine, endoscopy, or referral advice'],
    rejection_reasons: ['The source is broader than isolated belching and only directly supports bounded symptom documentation.', 'All actions remain clinician-entered.'],
    population_applicability: 'Adults with upper-GI symptoms; paediatric, pregnancy, postoperative, acute pain, bleeding, obstruction, and severe systemic contexts require separate assessment.',
    unresolved_source_gaps: ['Belch frequency and phenotype, aerophagia, rumination, cause, diagnosis, tests, medicine, behavioural treatment, and referral remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-biliary-colic-follow-up',
    evidence_groups: [
      { source_id: 'nice-gallstone-cg188-2014', source_section_id: 'nice-cg188-diagnosis-context', relationship: 'The exact gallstone diagnostic-context section supports interval biliary symptoms and clinician review of existing liver tests and ultrasound without diagnosing a new episode.', exact_texts: [...followup, ...examAndConcern, ...results] },
      { source_id: 'nice-gallstone-cg188-2014', source_section_id: 'nice-cg188-followup-information', relationship: 'The exact follow-up information section supports documenting clinician discussion and arranged follow-up without generating surgery or dietary advice.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG188 gallstone biliary colic symptoms follow-up ultrasound liver tests', 'site:nice.org.uk CG188 information after treatment gallstones'],
    candidate_sources_rejected: ['automatic biliary colic diagnosis from pain', 'automatic analgesia, antibiotics, imaging, surgery, admission, or dietary advice'],
    rejection_reasons: ['Pain and test findings require clinician interpretation.', 'No management action is generated.'],
    population_applicability: 'Adults with an established biliary or gallstone follow-up context; pregnancy, children, jaundice, pancreatitis, cholangitis, and acute instability require separate pathways.',
    unresolved_source_gaps: ['Current diagnosis, pain phenotype, jaundice, fever, test interpretation, complication, medicine, surgery, referral, urgency, and interval remain unsupported.'],
  }),
  giNoSource({
    workflow_id: 'gi-bowel-cancer-screening-documentation',
    search_queries_used: ['site:mohap.gov.ae colorectal screening guideline UAE', 'site:doh.gov.ae colorectal cancer screening standard', 'site:nice.org.uk colorectal cancer screening programme documentation'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng151/chapter/Recommendations'],
    candidate_sources_rejected: ['NICE colorectal cancer treatment and follow-up guideline', 'symptomatic suspected-cancer referral guidance', 'screening programme landing pages without a directly applicable UAE documentation standard'],
    rejection_reasons: ['Treatment follow-up does not define population screening documentation.', 'Symptomatic assessment is not screening.', 'Programme eligibility, test, interval, consent, and pathway are jurisdiction-specific.'],
    population_applicability: 'Asymptomatic screening population is unspecified; age, family history, hereditary syndromes, prior polyps, inflammatory bowel disease, symptoms, and local programme eligibility are unresolved.',
    unresolved_source_gaps: ['UAE programme eligibility, test type, interval, consent, prior screening, result, referral pathway, surveillance, and clinician-entered plan remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-celiac-disease-follow-up',
    evidence_groups: [
      { source_id: 'nice-coeliac-ng20-2015', source_section_id: 'nice-ng20-monitoring', relationship: 'The exact annual-review section supports interval symptoms, weight, growth where relevant, adherence discussion, complications, reviewed tests, and follow-up without generating dietary advice.', exact_texts: [...followup, ...examAndConcern, ...results, ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG20 coeliac annual review persistent symptoms monitoring', 'site:nice.org.uk NG20 coeliac disease follow-up serology dietitian'],
    candidate_sources_rejected: ['automatic confirmation of coeliac disease or adherence', 'automatic gluten-free diet, supplements, tests, or referral'],
    rejection_reasons: ['Diagnosis and adherence are clinician-reviewed facts.', 'No diet, test, or management action is generated.'],
    population_applicability: 'Adults, children, and young people with established coeliac disease, preserving age-specific monitoring and growth context.',
    unresolved_source_gaps: ['Diagnostic basis, age, measured growth or weight, symptoms, serology interpretation, dietetic assessment, deficiencies, complications, and interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-celiac-screening-result-review',
    evidence_groups: [
      { source_id: 'nice-coeliac-ng20-2015', source_section_id: 'nice-ng20-recognition-testing', relationship: 'The exact testing section supports symptom and risk context, gluten exposure, IgA or serology status, and clinician review of an existing screening result without interpreting it automatically.', exact_texts: [...resultContext, ...examAndConcern, ...results] },
      { source_id: 'nice-coeliac-ng20-2015', source_section_id: 'nice-ng20-monitoring', relationship: 'The exact monitoring section supports clinician-entered discussion and follow-up when a coeliac diagnosis already exists; it does not convert a screening result into a diagnosis.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG20 coeliac serology result total IgA gluten diet referral', 'site:nice.org.uk NG20 coeliac screening symptoms risk groups'],
    candidate_sources_rejected: ['automatic positive or negative result interpretation', 'automatic diagnosis, biopsy, gluten challenge, diet, or referral'],
    rejection_reasons: ['Result interpretation depends on assay, IgA status, gluten exposure, age, and clinical context.', 'Actions remain clinician-decided.'],
    population_applicability: 'Adults, children, and young people with clinician-ordered coeliac testing; age, IgA deficiency, gluten exposure, and specialist context must be retained.',
    unresolved_source_gaps: ['Exact assay, value, reference range, IgA status, gluten intake, interpretation, diagnosis, biopsy, referral, and follow-up interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-change-in-bowel-habit-documentation',
    evidence_groups: [
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-colorectal-rectal-bleeding', relationship: 'The exact colorectal section supports documenting bowel-habit change, rectal bleeding, abdominal symptoms, weight loss, anaemia context, age qualifiers, and clinician concern without diagnosing cancer or assigning urgency.', exact_texts: history },
      { source_id: 'bsg-chronic-diarrhoea-2018', source_section_id: 'bsg-diarrhoea-2018-history-exam', relationship: 'The exact chronic-diarrhoea assessment section supports clinician-performed abdominal and general assessment plus systemic concern documentation.', exact_texts: examAndConcern },
      { source_id: 'bsg-chronic-diarrhoea-2018', source_section_id: 'bsg-diarrhoea-2018-investigation-context', relationship: 'The exact investigation section supports recording existing laboratory, stool, endoscopy, or imaging results and an entered plan without ordering tests.', exact_texts: [...results, ...plan] },
    ],
    search_queries_used: ['site:nice.org.uk NG12 change in bowel habit colorectal symptoms FIT referral', 'site:bsg.org.uk chronic diarrhoea history examination investigations guideline'],
    candidate_sources_rejected: ['automatic colorectal cancer, IBS, infection, or IBD diagnosis', 'automatic FIT, colonoscopy, imaging, referral, or urgency'],
    rejection_reasons: ['Bowel-habit change is nonspecific.', 'Investigation and referral require clinician judgement and local pathways.'],
    population_applicability: 'Adults with altered bowel habit; paediatric, pregnancy, acute severe illness, known IBD, postoperative, and screening contexts require separate evidence.',
    unresolved_source_gaps: ['Exact bowel pattern, duration, bleeding, anaemia, age, family history, diagnosis, tests, referral, urgency, and follow-up remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-chronic-nausea-documentation',
    evidence_groups: [
      { source_id: 'dha-telehealth-nausea-vomiting-v2-2024', source_section_id: 'dha-nausea-vomiting-v2-assessment', relationship: 'The exact DHA assessment section supports nausea duration, frequency, triggers, intake, associated symptoms, pregnancy and medicine context, and impact without assigning a cause.', exact_texts: history },
      { source_id: 'dha-telehealth-nausea-vomiting-v2-2024', source_section_id: 'dha-nausea-vomiting-v2-red-flags', relationship: 'The exact red-flag section supports clinician-assessed hydration, general status, and escalation concern documentation without asserting a negative.', exact_texts: examAndConcern },
      { source_id: 'dha-telehealth-nausea-vomiting-v2-2024', source_section_id: 'dha-nausea-vomiting-v2-investigations', relationship: 'The exact section supports recording already ordered laboratory or imaging results without generating tests.', exact_texts: results },
      { source_id: 'dha-telehealth-nausea-vomiting-v2-2024', source_section_id: 'dha-nausea-vomiting-v2-referral', relationship: 'The exact section supports clinician-entered safety net, follow-up, and escalation documentation without assigning urgency.', exact_texts: plan },
    ],
    search_queries_used: ['site:dha.gov.ae telehealth nausea vomiting guideline assessment red flags investigations', 'site:dha.gov.ae nausea vomiting adults chronic telehealth'],
    candidate_sources_rejected: ['acute telehealth guidance treated as a complete chronic-nausea diagnostic guideline', 'automatic antiemetic, fluids, test, referral, or admission advice'],
    rejection_reasons: ['Chronic nausea has broader causes than the DHA acute virtual-care scope, so material gaps remain.', 'No management instruction is generated.'],
    population_applicability: 'DHA telehealth patients with nausea or vomiting; chronic, paediatric, pregnancy, postoperative, neurological, metabolic, and severe systemic contexts require tailored assessment.',
    unresolved_source_gaps: ['Chronicity cause, weight trend, pregnancy status, neurological or metabolic assessment, diagnosis, medicine, test, referral, and urgency remain unsupported.'],
  }),
]

export default { batch_id: 'source-first-0576-0585', description: 'Workflow-specific anorectal, nutrition, hepatology, upper-GI, biliary, coeliac, bowel-habit, and nausea evidence review.', sources: GI_SOURCES, workflows }

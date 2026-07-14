import { section, SOURCE_META } from './authoredBatchSupport.mjs'
import { REVIEW_DATE } from './giBatchSupport.mjs'

function sourceRecord(registry_file, config) {
  return {
    registry_file,
    source: {
      source_id: config.source_id,
      issuing_organisation: config.issuing_organisation,
      exact_document_title: config.exact_document_title,
      exact_official_url: config.exact_official_url,
      publication_date: config.publication_date,
      effective_date: config.effective_date ?? config.publication_date,
      revision_date: config.revision_date ?? null,
      version: config.version,
      jurisdiction: config.jurisdiction,
      population: config.population,
      clinical_setting: config.clinical_setting,
      applicability_note: config.applicability_note,
      recency_verification: { verified_on: REVIEW_DATE, status: 'official_document_and_recommendations_reviewed' },
      superseded_status_check: { checked_on: REVIEW_DATE, status: 'current_on_issuing_organisation_site' },
      exact_sections: config.exact_sections,
    },
  }
}

const nice = (config) => sourceRecord('international_clinical_sources.json', {
  issuing_organisation: 'National Institute for Health and Care Excellence',
  jurisdiction: 'England and Wales; international evidence requiring UAE pathway adaptation',
  clinical_setting: 'Primary and specialist care as qualified by the cited recommendations.',
  ...config,
})

const society = (config) => sourceRecord('specialty_society_sources.json', config)

export const GI_SOURCES = [
  society({
    source_id: 'ascrs-anal-fissures-2023',
    issuing_organisation: 'American Society of Colon and Rectal Surgeons',
    exact_document_title: 'The American Society of Colon and Rectal Surgeons Clinical Practice Guidelines for the Management of Anal Fissures',
    exact_official_url: 'https://fascrs.org/ascrs/media/files/Education/2023-Anal-Fissures-CPG.pdf',
    publication_date: '2023-02-01',
    version: 'Diseases of the Colon & Rectum 66(2), 2023',
    jurisdiction: 'United States; international colorectal evidence requiring UAE adaptation',
    population: 'Adults with acute or chronic anal fissure; paediatric, pregnancy, inflammatory, infectious, malignant, and immunocompromised contexts require separate evidence.',
    clinical_setting: 'Primary, gastroenterology, colorectal, and surgical assessment.',
    applicability_note: 'Supports symptom pattern, duration, stool context, bleeding, atypical-location context, and clinician-performed anorectal assessment without diagnosing fissure or generating treatment.',
    exact_sections: [
      section('ascrs-fissure-2023-presentation', 'Statement of the problem — presentation and symptom pattern', 'pages 190–191', 'Supports pain provoked by defecation, pain after defecation, bright-red bleeding, constipation or diarrhoea context, and duration.'),
      section('ascrs-fissure-2023-atypical-assessment', 'Atypical fissure context and chronicity findings', 'pages 190–192', 'Supports documenting clinician-observed location, multiplicity, chronicity features, and context requiring broader assessment without asserting a cause.'),
    ],
  }),
  society({
    source_id: 'ascrs-hemorrhoids-2024',
    issuing_organisation: 'American Society of Colon and Rectal Surgeons',
    exact_document_title: 'The American Society of Colon and Rectal Surgeons Clinical Practice Guidelines for the Management of Hemorrhoids',
    exact_official_url: 'https://fascrs.org/ascrs/media/files/2024-Hemorrhoids-CPG.pdf',
    publication_date: '2024-01-31',
    version: 'Diseases of the Colon & Rectum 67(5), 2024',
    jurisdiction: 'United States; international colorectal evidence requiring UAE adaptation',
    population: 'Adults with haemorrhoidal symptoms; other causes of anorectal bleeding, pain, discharge, or mass require separate assessment.',
    clinical_setting: 'Primary, gastroenterology, colorectal, and surgical assessment or follow-up.',
    applicability_note: 'Supports bowel-habit, bleeding, prolapse, discomfort, hygiene, prior treatment, and clinician-performed examination documentation without diagnosing haemorrhoids or recommending intervention.',
    exact_sections: [
      section('ascrs-hemorrhoids-2024-evaluation', 'Evaluation and diagnosis', 'pages 614–617', 'Supports disease-specific history, bowel habits, bleeding, prolapse, thrombosis, prior interventions, and clinician-performed focused examination.'),
      section('ascrs-hemorrhoids-2024-followup-context', 'Office, operative, and follow-up considerations', 'pages 617–623', 'Supports documentation of clinician-reviewed prior treatment, outcomes, complications, and entered follow-up decisions without creating treatment advice.'),
    ],
  }),
  nice({
    source_id: 'nice-coeliac-ng20-2015',
    exact_document_title: 'Coeliac disease: recognition, assessment and management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng20/chapter/Recommendations',
    publication_date: '2015-09-02',
    version: 'NICE guideline NG20',
    population: 'Adults, young people, and children with suspected or confirmed coeliac disease, with age-specific testing and referral recommendations.',
    applicability_note: 'Supports symptom and risk review, clinician-reviewed serology, annual review domains, persistent-symptom context, and entered follow-up without interpreting results or generating diet, test, or referral actions.',
    exact_sections: [
      section('nice-ng20-recognition-testing', 'Recommendations 1.1.1–1.3.4 — recognition, serology, and referral context', 'recommendations 1.1.1–1.3.4', 'Supports symptoms, risk groups, gluten exposure context, and clinician-reviewed serology without automatic diagnosis.'),
      section('nice-ng20-monitoring', 'Recommendations 1.4.1–1.4.4 — monitoring and annual review', 'recommendations 1.4.1–1.4.4', 'Supports persistent symptoms, weight, height, dietary adherence discussion, complications, reviewed tests, and clinician-entered follow-up.'),
    ],
  }),
  nice({
    source_id: 'nice-crohns-ng129-2019',
    exact_document_title: 'Crohn’s disease: management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng129/chapter/Recommendations',
    publication_date: '2019-05-03',
    version: 'NICE guideline NG129',
    population: 'Adults, children, and young people with established Crohn’s disease.',
    applicability_note: 'Supports symptom, relapse, treatment-monitoring, perianal, nutrition, prior surgery, patient-view, and follow-up documentation without assigning activity or generating treatment.',
    exact_sections: [
      section('nice-ng129-information-monitoring', 'Recommendations 1.1.1–1.2.11 — information, assessment, and monitoring', 'recommendations 1.1.1–1.2.11', 'Supports age-appropriate information, multidisciplinary discussion, symptoms, nutritional status, growth, treatment context, and safety-monitoring records.'),
      section('nice-ng129-remission-followup', 'Recommendations 1.3.1–1.3.3 — remission and follow-up', 'recommendations 1.3.1–1.3.3', 'Supports recording patient views, relapse symptoms, agreed follow-up, access arrangements, and surveillance status.'),
    ],
  }),
  nice({
    source_id: 'nice-ulcerative-colitis-ng130-2019',
    exact_document_title: 'Ulcerative colitis: management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng130/chapter/Recommendations',
    publication_date: '2019-05-03',
    revision_date: '2025-08-01',
    version: 'NICE guideline NG130',
    population: 'Adults, children, and young people with established ulcerative colitis.',
    applicability_note: 'Supports symptom, disease-course, treatment, monitoring, growth, bone-health, patient-view, and clinician-entered follow-up documentation without assigning severity or generating management.',
    exact_sections: [
      section('nice-ng130-assessment-review', 'Recommendations 1.1–1.3 — information, treatment context, and review', 'recommendations 1.1.1–1.3.18', 'Supports documenting current symptoms, previous response, adverse effects, patient preferences, and clinician review context.'),
      section('nice-ng130-monitoring', 'Recommendations 1.6.1–1.6.8 — monitoring', 'recommendations 1.6.1–1.6.8', 'Supports clinician-reviewed monitoring results, growth, bone-health context, and communication across services.'),
    ],
  }),
  nice({
    source_id: 'nice-gallstone-cg188-2014',
    exact_document_title: 'Gallstone disease: diagnosis and management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/cg188/chapter/Recommendations',
    publication_date: '2014-10-29',
    version: 'NICE clinical guideline CG188',
    population: 'Adults with suspected or diagnosed gallstone disease, including after gallbladder or stone treatment.',
    applicability_note: 'Supports symptom context, clinician-reviewed liver tests and imaging, established-diagnosis follow-up, and post-treatment symptom documentation without ordering investigations or recommending surgery.',
    exact_sections: [
      section('nice-cg188-diagnosis-context', 'Recommendations 1.1.1–1.1.4 — diagnostic context', 'recommendations 1.1.1–1.1.4', 'Supports documenting symptoms, liver-test and ultrasound status, and existing investigation context without interpreting results.'),
      section('nice-cg188-followup-information', 'Recommendations 1.4.1–1.4.3 — information after treatment', 'recommendations 1.4.1–1.4.3', 'Supports recording clinician-entered discussion and post-treatment symptom follow-up without creating advice.'),
    ],
  }),
  nice({
    source_id: 'nice-nafld-ng49-2016',
    exact_document_title: 'Non-alcoholic fatty liver disease (NAFLD): assessment and management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng49/chapter/Recommendations',
    publication_date: '2016-07-06',
    version: 'NICE guideline NG49',
    population: 'Adults, young people, and children with suspected or established NAFLD, with age-specific recommendations.',
    applicability_note: 'Supports metabolic and alcohol history, clinician-reviewed ultrasound, liver and fibrosis results, and follow-up context without diagnosing NAFLD or generating tests, referral, or lifestyle advice.',
    exact_sections: [
      section('nice-ng49-assessment', 'Recommendations 1.1.1–1.2.5 — assessment and fibrosis context', 'recommendations 1.1.1–1.2.5', 'Supports diabetes, metabolic, alcohol, liver-test, ultrasound, and clinician-reviewed fibrosis context.'),
      section('nice-ng49-monitoring', 'Recommendations 1.2.6–1.2.11 — monitoring and associated conditions', 'recommendations 1.2.6–1.2.11', 'Supports recording existing monitoring, cirrhosis context, and associated metabolic or cardiovascular conditions.'),
    ],
  }),
  nice({
    source_id: 'nice-cirrhosis-ng50-2023',
    exact_document_title: 'Cirrhosis in over 16s: assessment and management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng50/chapter/Recommendations',
    publication_date: '2016-07-06',
    revision_date: '2023-09-06',
    version: 'NICE guideline NG50',
    population: 'People aged over 16 with suspected or established cirrhosis and its complications.',
    applicability_note: 'Supports clinician-entered cirrhosis, ascites, portal-hypertension, complication, monitoring, endoscopy, ultrasound, and result-review documentation without calculating scores or generating treatment.',
    exact_sections: [
      section('nice-ng50-monitoring', 'Recommendations 1.2.1–1.2.8 — monitoring complications, HCC, and varices', 'recommendations 1.2.1–1.2.8', 'Supports recording complication risk, clinician-entered MELD result, ultrasound, AFP, endoscopy, varices, and specialist status.'),
      section('nice-ng50-ascites-context', 'Recommendations 1.3.6–1.3.11 — ascites and complication context', 'recommendations 1.3.6–1.3.11', 'Supports documenting established ascites, infection-risk context, bleeding, refractory status, and clinician-decided plan without generating antibiotics or procedures.'),
    ],
  }),
  nice({
    source_id: 'nice-pancreatitis-ng104-2020',
    exact_document_title: 'Pancreatitis — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng104/chapter/Recommendations',
    publication_date: '2018-09-05',
    revision_date: '2020-12-16',
    version: 'NICE guideline NG104',
    population: 'Adults, children, and young people with acute, chronic, or hereditary pancreatitis, with age-specific recommendations.',
    applicability_note: 'Supports established-diagnosis follow-up, symptoms, aetiology context, nutrition, exocrine function, diabetes, bone, imaging, complications, and entered follow-up without diagnosing or generating treatment.',
    exact_sections: [
      section('nice-ng104-information-course', 'Recommendations 1.1.1–1.1.7 — information, course, and handover', 'recommendations 1.1.1–1.1.7', 'Supports documenting diagnosis context, long-term effects, quality-of-life impact, procedures already discussed, and information passed between services.'),
      section('nice-ng104-chronic-followup', 'Recommendations 1.3.1–1.3.25 — chronic pancreatitis and follow-up', 'recommendations 1.3.1–1.3.25', 'Supports clinician-reviewed symptoms, causes, complications, nutrition, exocrine status, HbA1c, bone density, imaging, and follow-up status.'),
    ],
  }),
  nice({
    source_id: 'nice-faecal-incontinence-cg49-2007',
    exact_document_title: 'Faecal incontinence in adults: management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/cg49/chapter/Recommendations',
    publication_date: '2007-06-27',
    version: 'NICE clinical guideline CG49',
    population: 'Adults reporting faecal incontinence; neurological, obstetric, postoperative, prolapse, cancer-warning, and acute spinal contexts need tailored assessment.',
    applicability_note: 'Supports physical, emotional, social, bowel, medical, cognitive, and clinician-performed anorectal assessment documentation without defaulting an intimate examination or generating treatment.',
    exact_sections: [
      section('nice-cg49-baseline-assessment', 'Recommendations 1.1.1–1.2.3 — impact and baseline assessment', 'recommendations 1.1.1–1.2.3', 'Supports relevant medical history, contributory factors, physical and emotional impact, general examination, anorectal examination only if performed, cognition, and warning context.'),
      section('nice-cg49-review-specialist-context', 'Recommendations 1.4.1–1.6.1 — review and specialist context', 'recommendations 1.4.1–1.6.1', 'Supports clinician-entered symptom review, prior management, specialist assessment status, preferences, dignity, and follow-up documentation.'),
    ],
  }),
  nice({
    source_id: 'nice-hepatitis-b-cg165-2017',
    exact_document_title: 'Hepatitis B (chronic): diagnosis and management — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/cg165/chapter/Recommendations',
    publication_date: '2013-06-26',
    revision_date: '2017-10-20',
    version: 'NICE clinical guideline CG165',
    population: 'Adults, children, young people, and pregnant people with positive or established chronic hepatitis B, with subgroup-specific recommendations.',
    applicability_note: 'Supports clinician review of hepatitis B results, liver tests, ultrasound, elastography, treatment and monitoring records without interpreting serology or generating referral or treatment.',
    exact_sections: [
      section('nice-cg165-assessment-results', 'Recommendations 1.2.1–1.3.10 — assessment and liver-disease results', 'recommendations 1.2.1–1.3.10', 'Supports clinician-reviewed HBsAg, HBeAg, HBV DNA, coinfection, liver blood tests, ultrasound, AFP, elastography, biopsy, pregnancy, and paediatric context.'),
      section('nice-cg165-monitoring', 'Recommendations 1.6.1–1.7.3 — monitoring and surveillance', 'recommendations 1.6.1–1.7.3', 'Supports recording already established monitoring, treatment adverse-effect records, liver status, ultrasound, and surveillance status.'),
    ],
  }),
  society({
    source_id: 'bsg-chronic-diarrhoea-2018',
    issuing_organisation: 'British Society of Gastroenterology',
    exact_document_title: 'Guidelines for the investigation of chronic diarrhoea in adults: British Society of Gastroenterology, 3rd edition',
    exact_official_url: 'https://www.bsg.org.uk/clinical-resource/bsg-guidelines-chronic-diarrhoea',
    publication_date: '2018-04-13',
    version: 'Gut 2018;67:1380–1399',
    jurisdiction: 'United Kingdom; international gastroenterology evidence requiring UAE adaptation',
    population: 'Adults with chronic diarrhoea; paediatric and acute infectious presentations require separate evidence.',
    clinical_setting: 'Primary and specialist gastroenterology assessment.',
    applicability_note: 'Supports duration, stool characteristics, alarm features, medicine, surgery, diet, travel, family, examination, and clinician-reviewed investigation context without diagnosing a cause or ordering tests.',
    exact_sections: [
      section('bsg-diarrhoea-2018-history-exam', 'Clinical assessment — history and examination', 'sections 3.1–3.2', 'Supports duration, stool pattern, urgency, incontinence, weight loss, nocturnal symptoms, medicines, surgery, travel, family history, diet, and physical examination.'),
      section('bsg-diarrhoea-2018-investigation-context', 'Recommendations for excluding cancer, inflammation, malabsorption, and common disorders', 'sections 3.3–5.4', 'Supports clinician review of existing blood, stool, FIT, endoscopy, imaging, coeliac, bile-acid, microscopic-colitis, and lactose-malabsorption investigations.'),
    ],
  }),
  society({
    source_id: 'bsg-iron-deficiency-anaemia-2021',
    issuing_organisation: 'British Society of Gastroenterology',
    exact_document_title: 'British Society of Gastroenterology guidelines for the management of iron deficiency anaemia in adults',
    exact_official_url: 'https://www.bsg.org.uk/getmedia/3e13dd5c-8e7b-4110-87c5-dcc1feee495d/Iron-Deficiency-Aneamia-in-Adults.pdf',
    publication_date: '2021-09-08',
    version: 'Gut 2021;70:2030–2051',
    jurisdiction: 'United Kingdom; international gastroenterology evidence requiring UAE adaptation',
    population: 'Adults with confirmed or suspected iron deficiency anaemia; pregnancy and paediatric populations require separate evidence.',
    clinical_setting: 'Primary, gastroenterology, haematology, and investigation-result review.',
    applicability_note: 'Supports symptom, bleeding, diet, medicine, donation, surgery, family, laboratory, coeliac, upper/lower GI investigation, and follow-up documentation without diagnosing cause or generating treatment.',
    exact_sections: [
      section('bsg-ida-2021-assessment', 'Initial assessment and risk context', 'recommendations and sections on history and initial assessment', 'Supports clinician review of iron indices, anaemia, GI symptoms, bleeding, diet, medicines, blood donation, surgery, family history, and comorbidity.'),
      section('bsg-ida-2021-gi-investigation-followup', 'GI investigation, response, and follow-up', 'recommendations on GI investigation and follow-up', 'Supports recording completed coeliac testing, endoscopy, imaging, response, recurrence, and clinician-decided follow-up without ordering tests.'),
    ],
  }),
  nice({
    source_id: 'nice-colorectal-cancer-ng151-2021',
    exact_document_title: 'Colorectal cancer — Recommendations',
    exact_official_url: 'https://www.nice.org.uk/guidance/ng151/chapter/Recommendations',
    publication_date: '2020-01-29',
    revision_date: '2021-12-15',
    version: 'NICE guideline NG151',
    population: 'Adults with established colorectal cancer and people receiving colorectal-cancer care; screening and undiagnosed symptoms require separate pathways.',
    applicability_note: 'Supports clinician-entered established-diagnosis, prior treatment, bowel-function impact, result, surveillance, recurrence, and follow-up documentation without interpreting colonoscopy or generating treatment.',
    exact_sections: [
      section('nice-ng151-information-effects', 'Recommendations 1.2.1–1.2.5 — information and treatment effects', 'recommendations 1.2.1–1.2.5', 'Supports documenting treatment history, bowel, urinary, sexual, stoma, bleeding, discharge, functional, and patient-question context.'),
      section('nice-ng151-followup', 'Recommendations 1.6.1–1.6.3 — ongoing care and follow-up', 'recommendations 1.6.1–1.6.3', 'Supports clinician-recorded CEA, CT, recurrence follow-up, stool frequency, urgency, continence, emptying, fragmentation, and functional impact.'),
    ],
  }),
]

Object.assign(SOURCE_META, Object.fromEntries(GI_SOURCES.map(({ source }) => [
  source.source_id,
  { url: source.exact_official_url },
])))

export default {
  batch_id: 'gi-authoritative-sources',
  sources: [],
  workflows: [],
}

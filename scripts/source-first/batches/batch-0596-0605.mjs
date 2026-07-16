import { examAndConcern, followup, giEvidence, giNoSource, history, plan, resultContext, results } from './giBatchSupport.mjs'

const workflows = [
  giEvidence({
    workflow_id: 'gi-fit-result-review',
    evidence_groups: [
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-colorectal-rectal-bleeding', relationship: 'The exact colorectal section supports symptom, age, rectal-bleeding, bowel-habit, weight-loss, anaemia, and existing FIT context without interpreting the result or assigning referral urgency.', exact_texts: [...resultContext, ...examAndConcern, ...results] },
      { source_id: 'nice-suspected-cancer-ng12-2026', source_section_id: 'nice-ng12-safety-netting-review', relationship: 'The exact safety-net section supports clinician-entered discussion, follow-up, and safety net without generating a pathway.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk NG12 FIT result review colorectal symptoms referral threshold', 'site:nice.org.uk NG12 FIT safety net result not returned'],
    candidate_sources_rejected: ['screening FIT result treated as symptomatic FIT', 'automatic positive or negative interpretation or referral'],
    rejection_reasons: ['Screening and symptomatic pathways differ.', 'Threshold, assay, symptoms, age, local pathway, and clinician judgement determine action.'],
    population_applicability: 'Adults with clinician-requested symptomatic FIT under NG12; screening, surveillance, children, known IBD, and hereditary-risk pathways require separate evidence.',
    unresolved_source_gaps: ['Test indication, assay, value, threshold, date, symptoms, anaemia, interpretation, referral, urgency, and follow-up interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-food-intolerance-documentation',
    evidence_groups: [
      { source_id: 'bsg-chronic-diarrhoea-2018', source_section_id: 'bsg-diarrhoea-2018-history-exam', relationship: 'The exact chronic-diarrhoea section supports food association, bowel pattern, duration, weight, nocturnal symptoms, blood, medicine, travel, family history, and clinician assessment without diagnosing intolerance.', exact_texts: [...history, ...examAndConcern] },
      { source_id: 'bsg-chronic-diarrhoea-2018', source_section_id: 'bsg-diarrhoea-2018-investigation-context', relationship: 'The exact section supports existing test, endoscopy, and imaging context plus a clinician-entered plan without ordering elimination diets or tests.', exact_texts: [...results, ...plan] },
    ],
    search_queries_used: ['site:bsg.org.uk chronic diarrhoea food intolerance lactose diet history guideline', 'site:bsg.org.uk chronic diarrhoea malabsorption investigations'],
    candidate_sources_rejected: ['automatic allergy or intolerance diagnosis', 'automatic elimination diet, breath test, coeliac test, endoscopy, or dietitian referral'],
    rejection_reasons: ['Symptoms after food have multiple allergic and non-allergic causes.', 'No test or diet is generated.'],
    population_applicability: 'Adults with bowel symptoms attributed to food; children, immediate allergy, anaphylaxis, coeliac disease, eating disorder, and severe malnutrition require separate evidence.',
    unresolved_source_gaps: ['Specific food, timing, reproducibility, allergy features, nutrition, weight, diagnosis, test, elimination or challenge, and referral remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-functional-abdominal-pain-documentation',
    evidence_groups: [
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-symptom-profile', relationship: 'The exact adult IBS section supports chronic abdominal pain, relation to defaecation, bowel pattern, bloating, food association, urgency, incomplete evacuation, mucus, and impact without diagnosing IBS or functional pain.', exact_texts: history },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-red-flags', relationship: 'The exact red-flag recommendation supports clinician assessment and examination for concerning context without populating negatives.', exact_texts: examAndConcern },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-diagnostic-tests', relationship: 'The exact diagnostic-test section supports recording already reviewed blood or coeliac testing in appropriately assessed adults without ordering tests.', exact_texts: results },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-followup', relationship: 'The exact follow-up section supports clinician-entered review, follow-up, and safety net without generating treatment.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG61 IBS abdominal pain bowel habit red flags follow-up', 'site:nice.org.uk CG61 functional abdominal pain adults tests'],
    candidate_sources_rejected: ['IBS evidence treated as proof of functional abdominal pain', 'automatic diet, antispasmodic, psychological therapy, test, or referral'],
    rejection_reasons: ['Functional abdominal pain is not established by the workflow title or IBS criteria alone.', 'No diagnosis or management is generated.'],
    population_applicability: 'Adults with chronic abdominal pain and possible bowel symptoms; children, pregnancy, acute abdomen, bleeding, weight loss, known disease, and postoperative contexts require separate evidence.',
    unresolved_source_gaps: ['Pain phenotype, duration criteria, bowel association, red flags, diagnosis, tests, treatment, referral, and follow-up remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-gallstone-symptom-documentation',
    evidence_groups: [
      { source_id: 'nice-gallstone-cg188-2014', source_section_id: 'nice-cg188-diagnosis-context', relationship: 'The exact section supports upper-abdominal or biliary symptom context and clinician review of existing liver tests and ultrasound without diagnosing gallstones.', exact_texts: [...history, ...examAndConcern, ...results] },
      { source_id: 'nice-gallstone-cg188-2014', source_section_id: 'nice-cg188-followup-information', relationship: 'The exact information section supports documenting clinician discussion and follow-up when gallstone disease is established without generating surgery or dietary advice.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG188 gallstone symptoms ultrasound liver tests assessment', 'site:nice.org.uk CG188 gallstone information follow-up'],
    candidate_sources_rejected: ['automatic gallstone or biliary-colic diagnosis', 'automatic ultrasound, MRCP, analgesia, antibiotic, surgery, or referral'],
    rejection_reasons: ['Symptoms alone do not establish gallstones or complications.', 'No investigation or management is generated.'],
    population_applicability: 'Adults with possible gallstone symptoms; pregnancy, children, jaundice, pancreatitis, cholangitis, severe illness, and postoperative states require separate pathways.',
    unresolved_source_gaps: ['Pain phenotype, fever, jaundice, examination, test results, diagnosis, complication, treatment, surgery, urgency, and referral remain unsupported.'],
  }),
  giNoSource({
    workflow_id: 'gi-gastroenterology-referral-documentation',
    search_queries_used: ['site:doh.gov.ae gastroenterology referral guideline documentation', 'site:dha.gov.ae gastroenterology referral criteria', 'site:nice.org.uk gastroenterology referral documentation guideline'],
    official_pages_opened: ['https://www.nice.org.uk/guidance/ng12/chapter/recommendations-organised-by-site-of-cancer', 'https://www.nice.org.uk/guidance/cg184/chapter/Recommendations'],
    candidate_sources_rejected: ['condition-specific suspected-cancer referral criteria', 'condition-specific dyspepsia and endoscopy recommendations', 'generic referral templates or service directories'],
    rejection_reasons: ['A generic GI referral can concern many conditions and cannot inherit one disease pathway.', 'Dyspepsia guidance is not a universal referral standard.', 'Templates do not establish reason, urgency, destination, or required attachments.'],
    population_applicability: 'People referred for a clinician-defined gastrointestinal reason; condition, age, urgency, destination, local criteria, and consent are unspecified.',
    unresolved_source_gaps: ['Referral reason, symptoms, findings, diagnosis, urgency, destination, local criteria, consent, attachments, communication, and follow-up remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-h-pylori-result-review',
    evidence_groups: [
      { source_id: 'nice-gord-dyspepsia-cg184-2019', source_section_id: 'nice-cg184-gord-investigation-review', relationship: 'The exact H. pylori section supports test indication and context, medicine or washout context, and clinician review of an existing result without automatic interpretation or treatment.', exact_texts: [...resultContext, ...examAndConcern, ...results] },
      { source_id: 'nice-gord-dyspepsia-cg184-2019', source_section_id: 'nice-cg184-gord-management-referral', relationship: 'The exact management section supports only a clinician-entered plan, discussion, safety net, and follow-up without naming medicines or doses.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG184 H pylori test result review washout treatment', 'site:nice.org.uk CG184 H pylori retest referral dyspepsia'],
    candidate_sources_rejected: ['automatic positive or negative interpretation', 'automatic eradication regimen, antibiotic, dose, retesting interval, or referral'],
    rejection_reasons: ['Interpretation depends on assay, sampling, medicines, prior treatment, and context.', 'No treatment or interval is generated.'],
    population_applicability: 'Adults with clinician-requested H. pylori testing for dyspepsia-related care; children, pregnancy, bleeding, ulcer complications, and specialist contexts need separate evidence.',
    unresolved_source_gaps: ['Test type, value, date, preparation, prior treatment, interpretation, diagnosis, medicine, dose, retest, referral, and interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-hemorrhoid-follow-up',
    evidence_groups: [
      { source_id: 'ascrs-hemorrhoids-2024', source_section_id: 'ascrs-hemorrhoids-2024-evaluation', relationship: 'The exact evaluation section supports interval bleeding, prolapse, discomfort, swelling, hygiene, bowel habits, continence, prior treatment, and clinician-performed focused examination without assuming haemorrhoids cause the symptoms.', exact_texts: [...followup, ...examAndConcern, ...results] },
      { source_id: 'ascrs-hemorrhoids-2024', source_section_id: 'ascrs-hemorrhoids-2024-followup-context', relationship: 'The exact follow-up context supports prior intervention outcomes, complications, and clinician-entered follow-up without generating office or operative treatment.', exact_texts: plan },
    ],
    search_queries_used: ['site:fascrs.org 2024 hemorrhoids guideline evaluation follow-up bleeding prolapse', 'site:fascrs.org hemorrhoids guideline prior treatment examination'],
    candidate_sources_rejected: ['rectal bleeding automatically attributed to haemorrhoids', 'automatic fibre, topical treatment, banding, surgery, colonoscopy, or referral'],
    rejection_reasons: ['Other causes of anorectal bleeding require consideration.', 'No treatment or procedure is generated.'],
    population_applicability: 'Adults with established or suspected haemorrhoidal follow-up; pregnancy, postpartum, children, IBD, anticoagulation, malignancy concern, and acute severe pain need tailored evidence.',
    unresolved_source_gaps: ['Bleeding severity, bowel pattern, prolapse grade, consent, chaperone, examination, diagnosis, medicine, procedure, colon evaluation, referral, and interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-hepatitis-result-review',
    evidence_groups: [
      { source_id: 'nice-hepatitis-b-cg165-2017', source_section_id: 'nice-cg165-assessment-results', relationship: 'The exact chronic hepatitis B section supports clinician review of HBsAg, HBeAg, HBV DNA, coinfection, liver tests, ultrasound, elastography, biopsy, pregnancy, and age context without interpreting an unspecified hepatitis result.', exact_texts: [...resultContext, ...examAndConcern, ...results] },
      { source_id: 'nice-hepatitis-b-cg165-2017', source_section_id: 'nice-cg165-monitoring', relationship: 'The exact monitoring section supports clinician-entered monitoring and follow-up documentation without generating antiviral treatment or surveillance.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG165 hepatitis B result assessment monitoring HBV DNA HBsAg', 'site:nice.org.uk hepatitis result review liver tests ultrasound elastography'],
    candidate_sources_rejected: ['hepatitis B guidance treated as complete evidence for hepatitis A, C, D, or E', 'automatic infection status, chronicity, treatment, surveillance, or referral'],
    rejection_reasons: ['The generic workflow does not specify virus or test, so the mapping is materially partial.', 'Interpretation and management remain clinician-led.'],
    population_applicability: 'People with a hepatitis-related result; the exact source directly applies only to chronic hepatitis B subcontexts and preserves age and pregnancy qualifiers.',
    unresolved_source_gaps: ['Virus, assay, value, timing, exposure, symptoms, immunity, chronicity, coinfection, interpretation, public-health action, treatment, referral, and follow-up remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-ibs-symptom-review',
    evidence_groups: [
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-symptom-profile', relationship: 'The exact adult section supports interval abdominal pain, bloating, relation to defaecation, bowel frequency or form, urgency, incomplete evacuation, food association, mucus, duration, and impact without independently diagnosing IBS.', exact_texts: followup },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-red-flags', relationship: 'The exact red-flag section supports clinician assessment and concern documentation without asserting absence.', exact_texts: examAndConcern },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-diagnostic-tests', relationship: 'The exact test section supports clinician review of already available blood and coeliac results in appropriately assessed adults.', exact_texts: results },
      { source_id: 'nice-ibs-cg61-2025', source_section_id: 'nice-cg61-ibs-followup', relationship: 'The exact section supports clinician-entered symptom review, follow-up, safety net, and questions without creating treatment.', exact_texts: plan },
    ],
    search_queries_used: ['site:nice.org.uk CG61 IBS symptom review follow-up red flags tests', 'site:nice.org.uk CG61 IBS bowel habit abdominal pain monitoring'],
    candidate_sources_rejected: ['automatic IBS diagnosis or subtype', 'automatic diet, medicine, psychological therapy, test, or referral'],
    rejection_reasons: ['The diagnosis and subtype require clinical criteria and exclusion of concerning context.', 'No management is generated.'],
    population_applicability: 'Adults with established or suspected IBS; children, pregnancy, acute illness, bleeding, weight loss, anaemia, and known organic disease need separate evidence.',
    unresolved_source_gaps: ['Diagnostic basis, subtype, symptom values, red flags, tests, medicine, diet, therapy, referral, and interval remain unsupported.'],
  }),
  giEvidence({
    workflow_id: 'gi-inflammatory-bowel-disease-follow-up',
    evidence_groups: [
      { source_id: 'nice-crohns-ng129-2019', source_section_id: 'nice-ng129-information-monitoring', relationship: 'The exact Crohn section supports interval symptoms, nutrition, growth where relevant, treatment context, perianal status, patient priorities, and clinician review for the Crohn subgroup without assigning activity.', exact_texts: [...followup, ...examAndConcern, ...results] },
      { source_id: 'nice-crohns-ng129-2019', source_section_id: 'nice-ng129-remission-followup', relationship: 'The exact Crohn remission section supports clinician-entered follow-up and access arrangements without setting an interval.', exact_texts: plan },
    ],
    reviewed_sections: [
      { source_id: 'nice-ulcerative-colitis-ng130-2019', source_section_id: 'nice-ng130-assessment-review', relationship: 'Reviewed separately for the ulcerative-colitis subgroup; it confirms that diagnosis-specific disease course, treatment response, adverse effects, and patient preferences cannot be collapsed into a generic IBD assumption.' },
      { source_id: 'nice-ulcerative-colitis-ng130-2019', source_section_id: 'nice-ng130-monitoring', relationship: 'Reviewed for UC monitoring context; no additional generic legacy item was mapped because the workflow does not identify the IBD subtype.' },
    ],
    search_queries_used: ['site:nice.org.uk NG129 Crohn follow-up monitoring', 'site:nice.org.uk NG130 ulcerative colitis monitoring follow-up'],
    candidate_sources_rejected: ['one IBD subtype guideline treated as universally interchangeable', 'automatic flare, remission, severity, medicine, endoscopy, surveillance, surgery, or referral'],
    rejection_reasons: ['Crohn disease and ulcerative colitis have distinct monitoring and complication contexts.', 'No disease activity or management action is generated.'],
    selected_primary_sources: ['nice-crohns-ng129-2019'],
    selected_supporting_sources: ['nice-ulcerative-colitis-ng130-2019'],
    population_applicability: 'People with established IBD; subtype, age, growth, pregnancy, perianal disease, surgery, medicine, and surveillance context must be specified.',
    unresolved_source_gaps: ['IBD subtype, extent, activity, complications, growth, medicine, adverse effects, biomarkers, endoscopy, imaging, surveillance, surgery, and interval remain unsupported.'],
  }),
]

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0596-0605', description: 'Workflow-specific FIT, bowel symptom, gallstone, H. pylori, anorectal, hepatitis, IBS, and IBD review.', sources: [], workflows }

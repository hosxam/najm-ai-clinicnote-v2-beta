import { evidenceWorkflow, noAuthoritativeWorkflow } from './authoredBatchSupport.mjs'

const safetyGap = 'All item-level mappings remain unsupported pending separate clinician review and signed approval.'
const reviewed = (source_id, source_section_id, relationship) => ({ source_id, source_section_id, relationship })
const partial = (config) => evidenceWorkflow({
  source_status: 'partial_exact_source_verified',
  recency_verification: 'The cited current official documents and exact sections were opened and reviewed on 2026-07-16.',
  superseded_check: 'The selected official pages remained current; no newer replacement was identified during the targeted review.',
  unresolved_source_gaps: [safetyGap, ...config.unresolved_source_gaps],
  ...config,
})

const workflows = [
  partial({
    workflow_id: 'gyn-perimenopause-review',
    search_queries_used: ['site:nice.org.uk/guidance/ng23 perimenopause identification symptoms review 2026', 'site:dha.gov.ae perimenopause guideline UAE'],
    reviewed_sections: [reviewed('nice-menopause-ng23-2026', 'nice-ng23-identification-tests', 'Supports age- and context-qualified identification discussion without automatically diagnosing perimenopause.'), reviewed('nice-menopause-ng23-2026', 'nice-ng23-menopause-symptoms', 'Supports entered symptom and information needs.'), reviewed('nice-menopause-ng23-2026', 'nice-ng23-review', 'Supports clinician-led treatment review.')],
    candidate_sources_rejected: ['age alone used to assign perimenopause'], rejection_reasons: ['Menstrual history, symptoms and exclusions remain necessary.'],
    population_applicability: 'People with entered menstrual change and possible perimenopausal symptoms, with age, pregnancy and treatment context.', setting_applicability: 'Direct for qualified identification and review; partial without patient facts.', UAE_applicability: 'NICE requires UAE testing, medicine and referral adaptation.',
    unresolved_source_gaps: ['Age, cycles, pregnancy, symptoms, history, tests and treatment are absent.', 'No perimenopause diagnosis, test, hormone therapy or dose is generated.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'gyn-post-procedure-gynecology-follow-up',
    search_queries_used: ['site:dha.gov.ae gynecology post procedure follow up guideline', 'site:doh.gov.ae gynecology procedure follow up standard', 'site:nice.org.uk gynecology post procedure follow up'],
    official_pages_opened: ['https://www.nice.org.uk/guidance'], candidate_sources_rejected: ['procedure-specific postoperative guidance', 'generic surgical aftercare pages'], rejection_reasons: ['The procedure is unspecified, so risks and follow-up requirements cannot be generalized.', 'Patient aftercare pages are not exact clinician workflow guidance.'],
    population_applicability: 'No exact authoritative source was identified for an unspecified gynaecological procedure and follow-up interval.', setting_applicability: 'Procedure-specific pathways were not treated as generic post-procedure evidence.', UAE_applicability: 'No exact UAE generic gynaecology follow-up standard was identified.', recency_verification: 'Official UAE and NICE search results were reviewed on 2026-07-16; no exact generic source was selected.', superseded_check: 'Not applicable because no exact source was selected.',
    unresolved_source_gaps: ['Procedure, date, indication, findings, complications, pathology, medicines and planned follow-up are absent.'],
  }),
  partial({
    workflow_id: 'gyn-postnatal-check',
    search_queries_used: ['site:doh.gov.ae postnatal care program standards maternal check 2025', 'site:dha.gov.ae postnatal care standard UAE'],
    reviewed_sections: [reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-scope-schedule', 'Supports direct Abu Dhabi postnatal programme scope and scheduled checks.'), reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-core-maternal', 'Supports entered maternal physical and emotional health, education, support and continuity.'), reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-high-risk-signs', 'Supports clinician-assessed maternal concern features.'), reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-visit-assessments', 'Supports detailed clinician-performed maternal postnatal assessment documentation.')],
    candidate_sources_rejected: ['newborn findings inferred from a maternal workflow'], rejection_reasons: ['Maternal and newborn assessments must remain separately documented.'],
    population_applicability: 'Postnatal people with delivery, recovery, feeding, physical, emotional, support and risk context entered.', setting_applicability: 'Direct Abu Dhabi postnatal programme evidence; partial outside that programme and without encounter facts.', UAE_applicability: 'The DoH standard is directly applicable in Abu Dhabi; other emirates require local pathway verification.',
    unresolved_source_gaps: ['Delivery, postpartum timing, symptoms, observations, feeding, mood, examination and infant context are absent.', 'No complication, treatment, contraception or discharge decision is generated.'],
  }),
  partial({
    workflow_id: 'gyn-postpartum-mood-screening-documentation',
    search_queries_used: ['site:doh.gov.ae postnatal care emotional health screening 2025', 'site:nice.org.uk/guidance/ng222 depression assessment risk recommendations'],
    reviewed_sections: [reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-core-maternal', 'Supports direct UAE postnatal emotional-health and support assessment.'), reviewed('doh-postnatal-care-program-v1-2025', 'doh-postnatal-v1-visit-assessments', 'Supports maternal mood and wellbeing fields actually assessed.'), reviewed('nice-depression-ng222-2026', 'nice-ng222-recognition-assessment', 'Supports comprehensive clinician assessment when depressive symptoms are entered.'), reviewed('nice-depression-ng222-2026', 'nice-ng222-risk-assessment', 'Supports clinician-completed risk assessment without asserting a risk level.')],
    candidate_sources_rejected: ['screening response interpreted automatically as diagnosis'], rejection_reasons: ['A screening result requires clinical assessment and explicit risk review.'],
    population_applicability: 'Postpartum people with timing, mood, anxiety, sleep, function, support, screening responses and risk assessment entered.', setting_applicability: 'Direct Abu Dhabi postnatal emotional-health evidence plus qualified depression assessment; partial without actual responses.', UAE_applicability: 'DoH evidence is direct for Abu Dhabi; NICE risk assessment requires UAE mental-health and emergency adaptation.',
    unresolved_source_gaps: ['Postpartum timing, screening tool, responses, function, support, mental state and risk are absent.', 'No depression diagnosis, risk score, treatment or referral is generated.'],
  }),
  partial({
    workflow_id: 'gyn-preconception-counseling',
    search_queries_used: ['site:who.int infertility guideline 2025 preconception consultation history', 'site:who.int contraception guideline informed choice pregnancy intentions 2025', 'site:doh.gov.ae preconception care UAE'],
    reviewed_sections: [reviewed('who-infertility-guideline-2025', 'who-infertility-ch3-consultation-history', 'Supports entered reproductive, medical, medicine and partner history in a fertility context.'), reviewed('who-infertility-guideline-2025', 'who-infertility-ch3-person-centred', 'Supports person-centred goals and shared discussion.'), reviewed('who-contraceptive-spr-fourth-2025', 'who-spr4-choice-consent', 'Supports voluntary reproductive choice where contraception discontinuation is relevant.')],
    candidate_sources_rejected: ['infertility inferred from preconception planning'], rejection_reasons: ['Pregnancy planning does not establish infertility.'],
    population_applicability: 'People planning pregnancy with timeline, reproductive history, conditions, medicines, exposures, partner context and goals entered.', setting_applicability: 'Partial: selected WHO sections support reproductive planning domains but not a complete preconception protocol.', UAE_applicability: 'WHO evidence requires UAE immunization, medicine, genetic, fertility and antenatal-service adaptation.',
    unresolved_source_gaps: ['Pregnancy intention, timeline, history, medicines, immunization, exposures, genetics and partner context are absent.', 'No test, supplement, medicine change, fertility diagnosis or referral is generated.'],
  }),
  partial({
    workflow_id: 'gyn-pregnancy-dating-discussion-documentation',
    search_queries_used: ['site:nice.org.uk/guidance/ng126 ultrasound gestational age pregnancy dating recommendations', 'site:doh.gov.ae pregnancy dating ultrasound standard UAE'],
    reviewed_sections: [reviewed('nice-ectopic-miscarriage-ng126-2026', 'nice-ng126-ultrasound', 'Supports clinician-reviewed ultrasound findings for location and viability without independently calculating or asserting gestational age.')],
    candidate_sources_rejected: ['gestational age calculated without scan or menstrual data'], rejection_reasons: ['Dating requires documented source data and obstetric interpretation.'],
    population_applicability: 'Pregnant people with entered last menstrual period, cycle, conception context, ultrasound dates and clinician interpretation.', setting_applicability: 'Only partial: NG126 ultrasound evidence focuses on early-pregnancy complications, not routine dating.', UAE_applicability: 'NICE requires UAE ultrasound and antenatal pathway adaptation.',
    unresolved_source_gaps: ['Menstrual date, cycle, conception, ultrasound measurements, report and clinician dating conclusion are absent.', 'No gestational age, estimated due date, viability or pregnancy location is generated.'],
  }),
  partial({
    workflow_id: 'gyn-pregnancy-medication-review',
    search_queries_used: ['site:nice.org.uk/guidance/ng5 medicines reconciliation medication review pregnancy', 'site:doh.gov.ae medication pregnancy guideline UAE'],
    reviewed_sections: [reviewed('nice-medicines-optimisation-ng5-2015', 'nice-ng5-structured-medication-review', 'Supports a structured clinician-led medication review without pregnancy-specific safety conclusions.'), reviewed('nice-medicines-optimisation-ng5-2015', 'nice-ng5-person-involvement', 'Supports documented preferences, benefits and harms discussion.'), reviewed('nice-medicines-optimisation-ng5-2015', 'nice-ng5-medicines-reconciliation', 'Supports accurate reconciliation of entered medicines.')],
    candidate_sources_rejected: ['medicine safety inferred from drug class or pregnancy alone'], rejection_reasons: ['Product, dose, gestation, indication and patient factors require authoritative product-specific review.'],
    population_applicability: 'Pregnant people with gestation and complete prescribed, non-prescribed, supplement, allergy and indication data entered.', setting_applicability: 'Exact for medication-review process but partial for pregnancy-specific medicine safety.', UAE_applicability: 'NICE process evidence requires UAE formulary, product-information and obstetric adaptation.',
    unresolved_source_gaps: ['Gestation, medicines, doses, indications, allergies, adherence and prescriber decisions are absent.', 'No medicine is started, stopped, continued, switched or declared safe.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'gyn-premenstrual-symptoms',
    search_queries_used: ['site:dha.gov.ae premenstrual syndrome guideline UAE', 'site:doh.gov.ae premenstrual symptoms guideline', 'site:nice.org.uk premenstrual syndrome guideline'], official_pages_opened: ['https://www.nice.org.uk/guidance'],
    candidate_sources_rejected: ['menopause and dysmenorrhoea guidelines', 'patient PMS information pages'], rejection_reasons: ['These do not provide an exact premenstrual-symptom assessment workflow.', 'Patient pages were not accepted as clinician guidance.'],
    population_applicability: 'No exact authoritative registered source was identified for a generic premenstrual-symptom workflow.', setting_applicability: 'Related menstrual guidance was not generalized to PMS.', UAE_applicability: 'No exact UAE PMS guideline was identified.', recency_verification: 'Official UAE and NICE searches were reviewed on 2026-07-16; no exact source was selected.', superseded_check: 'Not applicable because no exact source was selected.',
    unresolved_source_gaps: ['Cycle relationship, prospective symptom record, mood, function, pregnancy, differential and risk remain unsupported.'],
  }),
  partial({
    workflow_id: 'gyn-sexual-health-screening-documentation',
    search_queries_used: ['site:cdc.gov/std treatment guidelines screening sexual history HPV counseling', 'site:dha.gov.ae sexual health screening UAE guideline'],
    reviewed_sections: [reviewed('cdc-sti-treatment-guidelines-2021-genital-hpv', 'cdc-sti-2021-hpv-counseling', 'Supports explicit HPV result and screening-context counselling without inferring infection timing or source.'), reviewed('cdc-sti-treatment-guidelines-2021-genital-hpv', 'cdc-sti-2021-genital-ulcer-evaluation', 'Supports entered lesion and clinician-selected STI evaluation context only.')],
    candidate_sources_rejected: ['screening panel inferred without anatomy, exposure or consent'], rejection_reasons: ['Testing depends on explicit history, anatomy, exposure, symptoms and local pathways.'],
    population_applicability: 'Adolescents or adults with explicit anatomy, exposure, symptoms, consent, pregnancy, vaccination and prior-result context.', setting_applicability: 'Partial: registered CDC sections cover HPV and ulcer contexts, not a complete generic screening protocol.', UAE_applicability: 'CDC evidence requires UAE consent, confidentiality, laboratory, vaccination and reporting adaptation.',
    unresolved_source_gaps: ['Anatomy, exposure, symptoms, consent, pregnancy, vaccination and prior results are absent.', 'No STI risk, test panel, diagnosis, partner action or reporting conclusion is generated.'],
  }),
  partial({
    workflow_id: 'gyn-sti-result-review',
    search_queries_used: ['site:cdc.gov/std treatment guidelines result review genital HPV syphilis herpes', 'site:dha.gov.ae STI result reporting guideline UAE'],
    reviewed_sections: [reviewed('cdc-sti-treatment-guidelines-2021-genital-hpv', 'cdc-sti-2021-genital-ulcer-evaluation', 'Supports clinician-reviewed syphilis, herpes and other evaluation context when an ulcer presentation is entered.'), reviewed('cdc-sti-treatment-guidelines-2021-genital-hpv', 'cdc-sti-2021-hpv-counseling', 'Supports explicit HPV result counselling without inferring timing, source or cancer.')],
    candidate_sources_rejected: ['all STI results treated as equivalent', 'partner notification or reporting inferred'], rejection_reasons: ['Interpretation depends on the organism, test, specimen, timing and clinical context.', 'Local legal and public-health rules require UAE verification.'],
    population_applicability: 'People with an identified STI test, specimen, result, timing, symptoms, treatment and partner context entered.', setting_applicability: 'Partial because registered CDC sections cover only genital-ulcer and HPV contexts.', UAE_applicability: 'CDC evidence requires UAE laboratory, medicine, confidentiality, partner and reporting adaptation.',
    unresolved_source_gaps: ['Test, specimen, result, timing, symptoms, pregnancy, treatment and partner context are absent.', 'No interpretation, diagnosis, treatment, partner action or reporting conclusion is generated.'],
  }),
]

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0786-0795', description: 'Workflow-specific women’s-health research for perimenopause, post-procedure and postnatal review, reproductive planning, pregnancy documentation, premenstrual symptoms and sexual health; research only.', sources: [], workflows, interruption_reason: 'Checkpoint after workflow 0795; the next workflow is gyn-stress-incontinence-womens-health.' }

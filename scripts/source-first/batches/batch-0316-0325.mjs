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
    source_id: 'bad-hidradenitis-suppurativa-guideline-2018',
    issuing_organisation: 'British Association of Dermatologists',
    exact_document_title: 'British Association of Dermatologists guidelines for the management of hidradenitis suppurativa (acne inversa) 2018',
    exact_official_url: SOURCE_META['bad-hidradenitis-suppurativa-guideline-2018'].url,
    publication_date: '2019-03-01',
    effective_date: '2019-03-01',
    revision_date: null,
    version: 'BAD guideline 2018, published in British Journal of Dermatology 2019; DOI 10.1111/bjd.17537',
    jurisdiction: 'United Kingdom; international evidence requiring UAE adaptation',
    population: 'People with suspected or established hidradenitis suppurativa; pediatric and pregnancy-specific decisions require additional evidence.',
    clinical_setting: 'Primary and specialist dermatology recognition, baseline assessment, severity documentation, and longitudinal review.',
    applicability_note: 'Exact for documenting recurrent painful inflammatory lesions in characteristic flexural sites and clinician-assessed baseline stage, severity, pain, and quality-of-life impact. It does not diagnose hidradenitis, calculate a score, or generate treatment or referral.',
    recency_verification: { verified_on: '2026-07-14', status: 'official_publisher_record_and_exact_author_manuscript_reviewed_material_recency_gap', revision_due: null },
    superseded_status_check: { checked_on: '2026-07-14', status: 'BAD_2018_guideline_remains_published_current_guideline_revision_was_proposed_and_recency_gap_requires_review' },
    exact_sections: [
      section('bad-hs-2018-definition-presentation', 'Definition, clinical presentation, and disease course', 'author manuscript pages 8–9', 'Supports documenting recurrent painful inflammatory lesions, nodules, abscesses, draining sinuses or scarring, typical flexural distribution, age at onset, and interval course without inferring the diagnosis.'),
      section('bad-hs-2018-baseline-assessment', 'Audit points and baseline disease assessment', 'author manuscript page 11', 'Supports clinician-entered baseline disease stage, severity, pain, and dermatology quality-of-life impact; no score is calculated automatically.'),
    ],
  }),
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

const clinicianPlan = [
  'clinician-entered plan documented',
  'safety-netting documented if discussed by clinician',
  'follow-up documented if arranged by clinician',
  'patient questions documented if discussed',
]

const reviewHistory = (title) => [
  title,
  `${title} interval history documented`,
  'onset/duration documented if discussed',
  'change since last review documented',
  'severity/impact on function documented if discussed',
  'associated symptoms reviewed if relevant',
  'relevant negatives documented if assessed',
  'patient concerns or goals documented if discussed',
]

const workflows = [
  evidenceWorkflow({
    workflow_id: 'derm-eczema-flare-follow-up',
    evidence_groups: [
      {
        source_id: 'dha-atopic-dermatitis-issue2-2024',
        source_section_id: 'dha-atopic-dermatitis-i2-history',
        relationship: 'The UAE DHA atopic-dermatitis guideline directly supports documenting itch, dryness, flare course, morphology, distribution, atopy, sleep and quality-of-life impact during an eczema review without inferring current severity or cause.',
        exact_texts: [...reviewHistory('Eczema flare follow-up'), ...dermExam, ...dermRecords],
      },
      {
        source_id: 'dha-atopic-dermatitis-issue2-2024',
        source_section_id: 'dha-atopic-dermatitis-i2-red-flags',
        relationship: 'The exact red-flag section supports recording rapid worsening, pain, fever, lethargy, blistering, infection, mucosal or systemic concern only when assessed, not asserting absence or generating escalation.',
        exact_texts: dermConcern,
      },
      {
        source_id: 'dha-atopic-dermatitis-issue2-2024',
        source_section_id: 'dha-atopic-dermatitis-i2-management',
        relationship: 'The management section supports recording a clinician-entered plan, discussion, safety net, and arranged follow-up without generating skin-care, medicine, dose, or referral advice.',
        exact_texts: clinicianPlan,
      },
    ],
    reviewed_sections: [{ source_id: 'dha-atopic-dermatitis-issue2-2024', source_section_id: 'dha-atopic-dermatitis-i2-diagnosis-investigations', relationship: 'Morphology, distribution, differential, and selected investigation context were reviewed; no diagnosis or test is generated.' }],
    search_queries_used: ['site:dha.gov.ae atopic dermatitis issue 2 2024 flare history red flags', 'site:bad.org.uk eczema flare clinical guideline'],
    candidate_sources_rejected: ['automatic flare-severity classification', 'automatic emollient, topical steroid, antimicrobial, dose, duration, referral, or emergency instruction'],
    rejection_reasons: ['Severity requires complete clinician assessment and cannot be inferred from generic selected fields.', 'No treatment, medicine, dose, referral, or urgency conclusion was generated.'],
    population_applicability: 'Adults and children with clinician-established or suspected atopic dermatitis returning with a possible flare; age and pregnancy context remain necessary.',
    setting_applicability: 'UAE telehealth, primary, and dermatology follow-up with direct examination when needed.',
    UAE_applicability: 'The primary source is UAE DHA guidance; medicine, formulary, facility, infection, emergency, and referral decisions remain clinician- and pathway-specific.',
    recency_verification: 'DHA Issue 2 (2024) was reviewed on 2026-07-14.',
    superseded_check: 'No newer DHA atopic-dermatitis issue was identified.',
    unresolved_source_gaps: ['Exact body sites and morphology, trigger and exposure history, treatment and adherence, medicine and dose, response and adverse effects, infection status, diagnosis, severity, investigation, referral, and follow-up interval remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-epidermoid-cyst',
    search_queries_used: ['site:bad.org.uk epidermoid cyst clinical guideline', 'site:nice.org.uk epidermoid cyst guideline', 'site:nhs.uk epidermoid cyst professional guidance'],
    official_pages_opened: ['https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines', 'https://www.nice.org.uk/guidance/ng12/chapter/recommendations-organised-by-site-of-cancer'],
    candidate_sources_rejected: ['BAD clinical-guideline catalogue', 'NICE NG12 suspected-skin-cancer recommendations'],
    rejection_reasons: ['No exact professional epidermoid-cyst assessment guideline was identified in the catalogue.', 'NG12 supports selected cancer-referral features but does not establish epidermoid-cyst identity or routine management.'],
    population_applicability: 'People with a clinician-suspected or established epidermoid cyst.',
    setting_applicability: 'Primary, minor-surgery, and outpatient dermatology assessment.',
    UAE_applicability: 'UAE lesion assessment, infection, procedure, consent, pathology, facility, and referral policy are required.',
    recency_verification: 'Current BAD and NICE official pages were reviewed on 2026-07-14.',
    superseded_check: 'No current exact authoritative epidermoid-cyst guideline was identified.',
    unresolved_source_gaps: ['Site, size, punctum, mobility, inflammation, pain, discharge, recurrence, growth, differential, diagnosis, infection, procedure indication, consent, pathology, referral, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-facial-redness-review',
    search_queries_used: ['site:bad.org.uk rosacea clinical guideline facial redness', 'site:nice.org.uk facial erythema rosacea guideline', 'site:dha.gov.ae rosacea telehealth guideline'],
    official_pages_opened: ['https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines', 'https://www.bad.org.uk/pils/rosacea'],
    candidate_sources_rejected: ['BAD Rosacea patient information leaflet', 'BAD clinical-guideline catalogue'],
    rejection_reasons: ['The leaflet is patient-facing and cannot serve as primary exact professional evidence for broad facial redness.', 'No exact current professional guideline covering the full undifferentiated facial-redness workflow was identified.'],
    population_applicability: 'Adults with persistent or episodic facial redness; children and pregnancy require separate evidence.',
    setting_applicability: 'Primary and outpatient dermatology review.',
    UAE_applicability: 'UAE dermatology, ophthalmology, photosensitivity, medicine, procedure, and referral pathways are required.',
    recency_verification: 'Current BAD official pages were reviewed on 2026-07-14 and rejected for primary mapping.',
    superseded_check: 'No exact professional broad facial-redness guideline was identified.',
    unresolved_source_gaps: ['Pattern, duration, flushing, triggers, papules or pustules, scale, pain, itch, ocular symptoms, photosensitivity, medicines, systemic features, examination, differential, diagnosis, treatment, referral, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-folliculitis',
    search_queries_used: ['site:bad.org.uk folliculitis clinical guideline', 'site:nice.org.uk folliculitis antimicrobial guideline', 'site:cdc.gov folliculitis healthcare provider'],
    official_pages_opened: ['https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines', 'https://www.nice.org.uk/guidance/ng141/chapter/recommendations'],
    candidate_sources_rejected: ['BAD clinical-guideline catalogue', 'NICE NG141 cellulitis and erysipelas guideline'],
    rejection_reasons: ['The catalogue did not provide an exact professional folliculitis guideline.', 'NG141 addresses deeper cellulitis and erysipelas rather than a folliculitis-specific assessment scaffold.'],
    population_applicability: 'People with a clinician-suspected follicular eruption; age, exposure, and immune status matter.',
    setting_applicability: 'Primary and outpatient dermatology assessment.',
    UAE_applicability: 'UAE microbiology, antimicrobial stewardship, dermatology, infection-control, and referral pathways are required.',
    recency_verification: 'Current BAD and NICE official pages were reviewed on 2026-07-14.',
    superseded_check: 'No current exact authoritative folliculitis guideline was identified.',
    unresolved_source_gaps: ['Site and extent, follicular morphology, itch or pain, discharge, shaving or occlusion, water exposure, medicines, immune status, systemic symptoms, examination, culture, differential, diagnosis, treatment, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-fungal-nail-follow-up',
    evidence_groups: [
      {
        source_id: 'cdc-ringworm-clinical-overview-2024',
        source_section_id: 'cdc-ringworm-2024-overview-transmission',
        relationship: 'The CDC healthcare-professional overview identifies onychomycosis as fungal nail infection and supports documenting affected nail site, interval course, foot involvement, contact or exposure context, and diabetes risk without confirming fungal cause.',
        exact_texts: [...reviewHistory('Fungal nail follow-up'), 'Previous dermatology records reviewed if available'],
      },
      {
        source_id: 'cdc-ringworm-clinical-overview-2024',
        source_section_id: 'cdc-ringworm-2024-clinical-features',
        relationship: 'The clinical-features section supports clinician-observed discoloration, thickening, fragility, cracking, nail separation, pain, foot fungal features, secondary infection, and immune or diabetes context; generic examination and concern fields remain conditional on assessment.',
        exact_texts: [...dermExam, ...dermConcern],
      },
      {
        source_id: 'cdc-ringworm-clinical-overview-2024',
        source_section_id: 'cdc-ringworm-2024-testing',
        relationship: 'The testing section supports recording already reviewed diagnostic or laboratory results because nail abnormalities have multiple causes; it does not order testing or treatment.',
        exact_texts: ['Laboratory or pathology results reviewed if already available'],
      },
    ],
    search_queries_used: ['site:cdc.gov ringworm clinical overview fungal nail onychomycosis testing diabetes', 'site:bad.org.uk fungal nail professional guideline'],
    candidate_sources_rejected: ['automatic onychomycosis confirmation', 'automatic nail sampling, liver testing, topical or oral antifungal, dose, duration, procedure, or referral'],
    rejection_reasons: ['Nail dystrophy has multiple infectious and non-infectious causes and requires clinician assessment and often testing.', 'No investigation, medicine, dose, procedure, or referral was generated.'],
    population_applicability: 'Adults with suspected or established fungal nail disease; children and pregnancy need separate evidence.',
    setting_applicability: 'Primary, podiatry, and outpatient dermatology follow-up.',
    UAE_applicability: 'CDC evidence requires UAE laboratory, antifungal stewardship, formulary, liver-risk, diabetes, podiatry, and referral adaptation.',
    recency_verification: 'The CDC Clinical Overview of Ringworm dated 2024-07-15 was re-opened on 2026-07-14.',
    superseded_check: 'The CDC healthcare-professional clinical overview remains current; newer public treatment pages were not used as primary evidence.',
    unresolved_source_gaps: ['Exact nails and percentage involvement, morphology, duration, pain and function, foot disease, diabetes control, immune status, prior testing, organism, medicine and dose, response, adverse effects, laboratory monitoring, diagnosis, treatment, procedure, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-genital-skin-lesion-documentation',
    search_queries_used: ['site:cdc.gov STI treatment guidelines genital lesions diagnosis', 'site:nice.org.uk genital skin lesion suspected cancer guideline', 'site:bad.org.uk genital dermatoses clinical guideline'],
    official_pages_opened: ['https://www.cdc.gov/std/treatment-guidelines/default.htm', 'https://www.nice.org.uk/guidance/ng12/chapter/recommendations-organised-by-site-of-cancer', 'https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines'],
    candidate_sources_rejected: ['CDC Sexually Transmitted Infections Treatment Guidelines', 'NICE NG12 suspected-cancer recommendations', 'BAD clinical-guideline catalogue'],
    rejection_reasons: ['The CDC guideline is condition-specific and does not provide one safe scaffold for every genital skin lesion.', 'NG12 covers selected suspected-cancer referral features but not the full infectious, inflammatory, traumatic, benign, and malignant differential.', 'No exact professional guideline covering the deliberately broad workflow was identified.'],
    population_applicability: 'Adults with an undifferentiated external genital skin lesion; children, pregnancy, safeguarding, and assault contexts require separate pathways.',
    setting_applicability: 'Primary, sexual-health, gynecology, urology, and dermatology assessment with privacy, consent, and chaperone requirements.',
    UAE_applicability: 'UAE consent, chaperone, safeguarding, STI testing, public-health, gynecology, urology, dermatology, oncology, and referral policies are decisive.',
    recency_verification: 'Current CDC, NICE, and BAD official pages were reviewed on 2026-07-14; no single exact source was accepted for this broad workflow.',
    superseded_check: 'No current exact authoritative broad genital-skin-lesion documentation guideline was identified.',
    unresolved_source_gaps: ['Anatomical site, lesion type and morphology, pain, itch, discharge, ulceration, bleeding, sexual and exposure history, pregnancy, safeguarding, consent, chaperone, examination, testing, differential, diagnosis, treatment, referral, notification, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-hair-loss-pattern-review',
    search_queries_used: ['site:bad.org.uk androgenetic alopecia clinical guideline', 'site:bad.org.uk hair loss pattern clinical guideline', 'site:nice.org.uk female pattern hair loss guideline'],
    official_pages_opened: ['https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines', 'https://onlinelibrary.wiley.com/doi/10.1111/bjd.21970'],
    candidate_sources_rejected: ['BAD clinical-guideline catalogue', 'BAD living guideline for alopecia areata'],
    rejection_reasons: ['No exact current professional guideline for undifferentiated patterned hair-loss review was identified.', 'Alopecia areata is a distinct patchy autoimmune alopecia and cannot support a broad patterned-hair-loss workflow.'],
    population_applicability: 'Adults with diffuse or patterned hair loss; children, pregnancy, postpartum, and scarring alopecia need distinct evidence.',
    setting_applicability: 'Primary and outpatient dermatology assessment.',
    UAE_applicability: 'UAE laboratory, endocrine, obstetric, dermatology, medicine, procedure, and referral pathways are required.',
    recency_verification: 'Current BAD official guideline pages were reviewed on 2026-07-14 and mismatched sources were rejected.',
    superseded_check: 'No current exact authoritative patterned-hair-loss workflow source was identified.',
    unresolved_source_gaps: ['Pattern and distribution, shedding, onset and progression, scalp symptoms, scarring, nutrition, illness, stress, endocrine and menstrual context, medicines, family history, examination, pull test, investigations, differential, diagnosis, treatment, procedure, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-hand-dermatitis-occupational-review',
    evidence_groups: [
      {
        source_id: 'dha-allergic-contact-dermatitis-issue2-2024',
        source_section_id: 'dha-contact-dermatitis-i2-history-features',
        relationship: 'The UAE DHA contact-dermatitis guideline supports documenting hand distribution, morphology, itch or burning, occupational products and tasks, glove or wet-work exposure, temporal relationship, recurrence, atopy, and interval change without assigning occupational causation.',
        exact_texts: [...reviewHistory('Hand dermatitis occupational review'), ...dermExam, ...dermRecords],
      },
      {
        source_id: 'dha-allergic-contact-dermatitis-issue2-2024',
        source_section_id: 'dha-contact-dermatitis-i2-red-flags',
        relationship: 'The red-flag section supports recording severe, rapidly worsening, infected, widespread, respiratory, systemic, or pregnancy concern only when assessed and recording clinician decisions without generating workplace action or referral.',
        exact_texts: [...dermConcern, ...clinicianPlan],
      },
    ],
    reviewed_sections: [
      { source_id: 'dha-allergic-contact-dermatitis-issue2-2024', source_section_id: 'dha-contact-dermatitis-i2-investigations', relationship: 'Patch testing, photographs, and selected tests were reviewed for clinician-documented investigation context; no test is generated.' },
      { source_id: 'dha-allergic-contact-dermatitis-issue2-2024', source_section_id: 'dha-contact-dermatitis-i2-management', relationship: 'Avoidance and skin-care sections were reviewed, but no product, medicine, workplace restriction, or treatment instruction is generated.' },
    ],
    search_queries_used: ['site:dha.gov.ae allergic contact dermatitis occupational hand wet work exposure patch testing', 'site:bad.org.uk occupational hand dermatitis guideline'],
    candidate_sources_rejected: ['automatic attribution of dermatitis to work', 'automatic workplace restriction, avoidance instruction, patch test, topical treatment, medicine, dose, occupational referral, or compensation advice'],
    rejection_reasons: ['Occupational causation requires detailed chronology, exposure assessment, examination, and often specialist testing.', 'No investigation, treatment, workplace, legal, or referral decision was generated.'],
    population_applicability: 'Working-age people with hand dermatitis and possible occupational exposure; children and pregnancy require separate evidence.',
    setting_applicability: 'UAE primary, occupational-health, and dermatology review with direct examination and workplace assessment when needed.',
    UAE_applicability: 'The primary source is UAE DHA guidance; employer, occupational-health, compensation, patch-testing, formulary, and referral pathways remain locally dependent.',
    recency_verification: 'DHA Issue 2 (2024) was reviewed on 2026-07-14.',
    superseded_check: 'No newer DHA allergic-contact-dermatitis issue was identified.',
    unresolved_source_gaps: ['Exact work tasks, materials and products, wet work, glove type and duration, timing away from work, non-work exposure, morphology, atopy, infection, photographs, patch testing, confirmed allergen or irritant, diagnosis, treatment, work modification, referral, and follow-up remain unsupported.'],
  }),
  evidenceWorkflow({
    workflow_id: 'derm-hidradenitis-symptoms',
    evidence_groups: [
      {
        source_id: 'bad-hidradenitis-suppurativa-guideline-2018',
        source_section_id: 'bad-hs-2018-definition-presentation',
        relationship: 'The BAD guideline directly supports documenting recurrent painful inflammatory nodules, abscesses, draining sinuses or scarring, typical flexural distribution, age at onset, and symptom course when assessed; it does not infer hidradenitis from generic lesions.',
        exact_texts: ['Hidradenitis symptoms', 'Hidradenitis symptoms context documented', 'onset/duration documented if discussed', 'associated symptoms reviewed if relevant', 'relevant negatives documented if assessed', 'Skin inspection documented only if assessed', 'Lesion/rash distribution documented only if assessed'],
      },
      {
        source_id: 'bad-hidradenitis-suppurativa-guideline-2018',
        source_section_id: 'bad-hs-2018-baseline-assessment',
        relationship: 'The audit points support clinician-entered disease severity, stage, pain, and quality-of-life impact; no score or stage is calculated automatically.',
        exact_texts: ['severity/impact on function documented if discussed', 'patient concerns or goals documented if discussed', 'Previous dermatology records reviewed if available'],
      },
    ],
    official_pages_opened: ['https://orca.cardiff.ac.uk/id/eprint/126744/1/HS%2Bguideline%2BFINAL%2Bfor%2BBJD%2Bas%2Btext%2Bpost-peer-reviews_v2%20%281%29.pdf'],
    search_queries_used: ['site:bad.org.uk hidradenitis suppurativa clinical guideline', 'site:onlinelibrary.wiley.com 10.1111/bjd.17537 hidradenitis guideline', 'site:orca.cardiff.ac.uk bjd.17537 hidradenitis author manuscript'],
    candidate_sources_rejected: ['BAD hidradenitis patient information leaflet', 'automatic Hurley stage, severity score, diagnosis, medicine, procedure, surgery, referral, or lifestyle instruction'],
    rejection_reasons: ['The patient leaflet was not used as primary professional evidence.', 'Scoring, diagnosis, treatment, procedure, and referral require qualified clinician assessment and were not generated.'],
    population_applicability: 'Adolescents and adults with clinician-suspected or established hidradenitis suppurativa; pregnancy and pediatric care need added evidence.',
    setting_applicability: 'Primary and specialist dermatology recognition and review.',
    UAE_applicability: 'BAD evidence requires UAE dermatology, surgery, microbiology, formulary, smoking and weight services, pregnancy, referral, and facility adaptation.',
    recency_verification: 'The official publisher record and exact author manuscript were reviewed on 2026-07-14; the 2018 guideline has a major recency gap.',
    superseded_check: 'The BAD 2018 guideline remains the identified published BAD guideline, but a revision had been proposed and current specialist review is required.',
    unresolved_source_gaps: ['Exact sites and lesion counts, recurrence frequency, drainage, scarring and tunnels, family history, smoking, weight and metabolic context, inflammatory bowel or arthritis symptoms, infection, clinician stage or score, investigations, diagnosis, treatment, procedure, surgery, referral, and follow-up remain unsupported.'],
  }),
  noAuthoritativeWorkflow({
    workflow_id: 'derm-hyperhidrosis',
    search_queries_used: ['site:bad.org.uk hyperhidrosis clinical guideline', 'site:nice.org.uk hyperhidrosis guideline', 'site:bad.org.uk hyperhidrosis referral service guidance'],
    official_pages_opened: ['https://www.bad.org.uk/guidelines-and-standards/clinical-guidelines', 'https://www.bad.org.uk/guidelines-and-standards/service-guidance'],
    candidate_sources_rejected: ['BAD clinical-guideline catalogue', 'BAD acute dermatology service specification'],
    rejection_reasons: ['No exact current professional hyperhidrosis clinical guideline was identified in the catalogue.', 'Service-level referral categories do not provide a workflow-specific history, examination, investigation, or management scaffold.'],
    population_applicability: 'Adults with excessive sweating; children, pregnancy, menopause, and secondary systemic causes require separate evidence.',
    setting_applicability: 'Primary and outpatient dermatology assessment.',
    UAE_applicability: 'UAE endocrine, infection, medicine, dermatology, procedure, device, surgery, and referral pathways are required.',
    recency_verification: 'Current BAD official guideline and service pages were reviewed on 2026-07-14.',
    superseded_check: 'No current exact authoritative hyperhidrosis clinical guideline was identified.',
    unresolved_source_gaps: ['Focal or generalized pattern, sites, onset, duration, nocturnal symptoms, triggers, functional impact, family history, medicines, endocrine, infection, malignancy or neurological context, examination, investigations, diagnosis, treatment, procedure, referral, and follow-up remain unsupported.'],
  }),
]

export default {
  batch_id: 'batch-0316-0325',
  sources,
  workflows,
  interruption_reason: 'The exact-source queue is checkpointed after workflows 0316-0325. The next unfinished workflow is determined from the execution manifest.',
}

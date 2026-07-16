import { evidenceWorkflow, noAuthoritativeWorkflow as baseNoAuthoritativeWorkflow } from './authoredBatchSupport.mjs'

const safetyGap = 'All item-level mappings remain unsupported pending separate clinician review and signed approval.'
const reviewed = (source_id, source_section_id, relationship) => ({ source_id, source_section_id, relationship })
const withUaeFinding = (record, finding_type) => ({ ...record, uae_applicability_findings: [{ workflow_id: record.workflow_id, finding_type, source_status: record.source_status, evidence_basis: record.UAE_applicability }] })
const partialTopic = ({ workflow_id, topic, sections, setting, gap, uae = 'The cited international guidance requires UAE ICU policy, credentialing, pathway and formulary adaptation.' }) => withUaeFinding(evidenceWorkflow({
  workflow_id,
  source_status: 'partial_exact_source_verified',
  search_queries_used: [`official guideline ${topic} critical care documentation`, `site:dha.gov.ae ${topic} ICU guideline`],
  reviewed_sections: sections.map(([source, section, scope]) => reviewed(source, section, `${scope} for ${topic}; it does not generate a clinical decision.`)),
  candidate_sources_rejected: [`adjacent guidance treated as a complete ${topic} protocol`],
  rejection_reasons: [`The selected exact sections support only the stated documentation domains, not every component of ${topic}.`],
  population_applicability: `Critically ill people with the relevant ${topic} facts, observations, results, interventions and decisions entered by the treating team.`,
  setting_applicability: setting,
  UAE_applicability: uae,
  recency_verification: 'The cited current official documents and exact sections were opened and reviewed on 2026-07-16.',
  superseded_check: 'The selected official pages remained current; no newer replacement was identified during the targeted review.',
  unresolved_source_gaps: [safetyGap, gap, `No diagnosis, interpretation, investigation, treatment, medicine, dose, procedure, escalation or disposition is generated for ${topic}.`],
}), uae.startsWith('DHA') ? 'explicit_uae_applicability' : 'partial_applicability')
const noExact = ({ workflow_id, topic, gap }) => withUaeFinding(baseNoAuthoritativeWorkflow({
  workflow_id,
  search_queries_used: [`site:dha.gov.ae ${topic} ICU guideline`, `site:doh.gov.ae ${topic} critical care standard`, `site:who.int ${topic} clinical guideline`],
  official_pages_opened: ['https://www.who.int/publications/i/item/9789241598590'],
  candidate_sources_rejected: ['WHO surgical safety checklist', `unregistered or institution-specific ${topic} protocols`],
  rejection_reasons: [`The checklist does not define ${topic}.`, 'Non-registered local protocols were not accepted as reproducible exact-section evidence.'],
  population_applicability: `No exact authoritative registered source was identified for generic ${topic}.`,
  setting_applicability: 'Device-, diagnosis- and institution-specific practice was not generalized.',
  UAE_applicability: `No exact registered UAE standard was identified for ${topic}.`,
  recency_verification: 'Official UAE, WHO and international searches were reviewed on 2026-07-16; no eligible exact source was selected.',
  superseded_check: 'Not applicable because no exact source was selected.',
  unresolved_source_gaps: [gap],
}), 'missing_explicit_uae_evidence')

const workflows = [
  partialTopic({ workflow_id: 'icu-imaging-result-review', topic: 'ICU imaging-result review', sections: [['nice-suspected-sepsis-ng253-2026', 'nice-ng253-source-investigations', 'Supports clinician-selected chest, abdominal and pelvic imaging for infection-source assessment'], ['nice-pneumonia-ng250-2026', 'nice-ng250-pneumonia-followup-cxr', 'Supports qualified review of follow-up chest radiography']], setting: 'Partial for infection and pneumonia imaging; it is not a generic ICU radiology-interpretation standard.', gap: 'Modality, body site, indication, date, comparison, report findings, critical communication and clinician assessment are absent.' }),
  partialTopic({ workflow_id: 'icu-infection-review-icu-documentation', topic: 'ICU infection review', sections: [['nice-suspected-sepsis-ng253-2026', 'nice-ng253-recognition-scope', 'Supports suspected-infection source and risk context'], ['nice-suspected-sepsis-ng253-2026', 'nice-ng253-source-investigations', 'Supports clinician-selected microbiology and source investigations']], setting: 'Direct for suspected-sepsis recognition and source investigation, but partial for the broader ICU infection review.', gap: 'Syndrome, source, specimens, organisms, susceptibilities, devices, antimicrobials and response are absent.' }),
  partialTopic({ workflow_id: 'icu-lactate-trend-documentation', topic: 'ICU lactate-trend documentation', sections: [['nice-suspected-sepsis-ng253-2026', 'nice-ng253-assessment-observations', 'Supports entered circulation and acute physiological observations'], ['nice-suspected-sepsis-ng253-2026', 'nice-ng253-risk-criteria', 'Supports clinician-assessed acute-risk context']], setting: 'Partial for suspected sepsis; lactate trends have other causes and require local laboratory and critical-care interpretation.', gap: 'Sample time, value, units, collection context, perfusion, organ function, interventions and serial response are absent.' }),
  noExact({ workflow_id: 'icu-lines-tubes-drains-documentation', topic: 'ICU lines, tubes and drains documentation', gap: 'Device type, indication, site, insertion date, position, output, patency, dressing, complications and removal plan remain unsupported.' }),
  partialTopic({ workflow_id: 'icu-mobility-review-documentation', topic: 'ICU mobility review', sections: [['nice-stroke-rehabilitation-ng236-2023', 'nice-ng236-stroke-assessment-rehab-plan', 'Supports multidisciplinary assessment and an entered rehabilitation plan'], ['nice-multimorbidity-ng56-2016', 'nice-ng56-identification-function-frailty', 'Supports documented function, daily activities, falls and frailty context']], setting: 'Partial for function and rehabilitation domains; neither source defines a generic ICU early-mobility protocol.', gap: 'Baseline, current strength, consciousness, haemodynamic tolerance, devices, assistance, barriers and mobility session response are absent.' }),
  partialTopic({ workflow_id: 'icu-neurological-observation-review', topic: 'ICU neurological-observation review', sections: [['nice-suspected-sepsis-ng253-2026', 'nice-ng253-assessment-observations', 'Supports entered consciousness and acute observations'], ['nice-suspected-sepsis-ng253-2026', 'nice-ng253-risk-criteria', 'Supports clinician-assessed confusion and neurological risk context']], setting: 'Partial for acute neurological observations in suspected sepsis, not a complete neurocritical-care observation standard.', gap: 'Baseline, consciousness scale, pupils, motor findings, sedation, seizures, trend, imaging and cause are absent.' }),
  partialTopic({ workflow_id: 'icu-nutrition-review-icu-documentation', topic: 'ICU nutrition review', sections: [['nice-nutrition-support-cg32-2017', 'nice-cg32-screening-concern', 'Supports entered weight loss, intake, swallowing, BMI and illness context'], ['nice-nutrition-support-cg32-2017', 'nice-cg32-malnutrition-risk-context', 'Supports clinician-recorded malnutrition-risk and consent context']], setting: 'Direct for adult nutrition-support assessment domains but partial for ICU route, targets and tolerance decisions.', gap: 'Weight history, intake, route, feed, tolerance, gastrointestinal losses, laboratory context, goals and dietitian plan are absent.' }),
  noExact({ workflow_id: 'icu-obstetric-critical-care-documentation', topic: 'obstetric critical-care documentation', gap: 'Gestation, obstetric diagnosis, maternal physiology, fetal status, haemorrhage, hypertensive features, organ support and multidisciplinary plan remain unsupported.' }),
  noExact({ workflow_id: 'icu-organ-support-documentation', topic: 'multi-organ support documentation', gap: 'Supported organs, device modes, settings, indications, response, complications, ceilings and transition plans remain unsupported.' }),
  partialTopic({ workflow_id: 'icu-pain-review-documentation', topic: 'ICU pain review', sections: [['nice-neuropathic-pain-cg173-2020', 'nice-cg173-neuropathic-pain-review', 'Supports entered pain assessment, impact, treatment context and review'], ['nice-pressure-ulcers-cg179-2014', 'nice-cg179-risk-skin-assessment', 'Supports documenting pressure-related pain when assessed']], setting: 'Partial for neuropathic and pressure-related pain; it is not a universal ICU analgesia or sedation protocol.', gap: 'Pain site, mechanism, severity, behavioural scale, communication ability, medicines, procedures, adverse effects and response are absent.' }),
]

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json', batch_id: 'source-first-0826-0835', description: 'Workflow-specific ICU research for imaging, infection, lactate, devices, mobility, neurology, nutrition, obstetric critical care, organ support and pain; research only.', sources: [], workflows, interruption_reason: 'Checkpoint after workflow 0835; the next workflow is icu-pediatric-handover-documentation.' }

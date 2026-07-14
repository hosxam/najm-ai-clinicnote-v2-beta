import { evidenceWorkflow, noAuthoritativeWorkflow } from './authoredBatchSupport.mjs'

export const REVIEW_DATE = '2026-07-14'

export const history = [
  'onset/duration documented if discussed',
  'severity/impact on function documented if discussed',
  'associated symptoms reviewed if relevant',
  'relevant negatives documented if assessed',
  'patient concerns or goals documented if discussed',
]

export const followup = [...history, 'change since last review documented']
export const resultContext = ['result source/date documented if available', ...history]

export const examAndConcern = [
  'Vital signs documented only if assessed',
  'Abdominal examination documented only if assessed',
  'Hydration/nutrition status documented only if assessed',
  'General appearance documented only if assessed',
  'severe or rapidly worsening symptoms documented if assessed',
  'abnormal vital signs documented if measured',
  'new neurological, cardiorespiratory, or systemic concern documented if assessed',
  'clinician concern requiring escalation documented if present',
]

export const results = [
  'Laboratory results reviewed if already ordered',
  'Endoscopy or imaging reports reviewed if available',
  'Stool or liver-related results reviewed if available',
]

export const plan = [
  'clinician-entered plan documented',
  'safety-netting documented if discussed by clinician',
  'follow-up documented if arranged by clinician',
  'patient questions documented if discussed',
]

export function giEvidence(config) {
  return evidenceWorkflow({
    ...config,
    setting_applicability: config.setting_applicability ?? 'Primary, gastroenterology, hepatology, colorectal, result-review, or outpatient follow-up as qualified by the exact source.',
    UAE_applicability: config.UAE_applicability ?? 'International evidence requires UAE gastroenterology, colorectal, hepatology, laboratory, endoscopy, referral, prescribing, screening, and local-pathway adaptation.',
    recency_verification: `Exact official documents and sections were reviewed on ${REVIEW_DATE}.`,
    superseded_check: config.superseded_check ?? 'The cited official source remains current on the issuing organisation website at the review date.',
  })
}

export function giNoSource(config) {
  return noAuthoritativeWorkflow({
    ...config,
    setting_applicability: config.setting_applicability ?? 'Primary or gastroenterology documentation review; the generic workflow purpose is not sufficiently bounded for exact clinical evidence.',
    UAE_applicability: config.UAE_applicability ?? 'No exact current UAE or directly applicable authoritative documentation guideline was identified for the unqualified workflow purpose.',
    recency_verification: `Official UAE and international sources were searched on ${REVIEW_DATE}.`,
    superseded_check: 'No directly applicable exact guideline was selected.',
  })
}

export default {
  batch_id: 'gi-batch-support',
  sources: [],
  workflows: [],
}

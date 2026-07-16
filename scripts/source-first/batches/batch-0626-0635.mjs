import { EXPANSION_DIR, readJson } from '../common.mjs'
import { gpExplicitWorkflowsForRange } from './gpBatchSupport.mjs'
import path from 'node:path'

const replayDiscovery = process.env.NAJM_SOURCE_METADATA_REPLAY_DISCOVERY === '1'
const ledger = replayDiscovery
  ? null
  : readJson(path.join(EXPANSION_DIR, 'progress', 'gp_explicit_mapping_ledger_0626_0675.json'))

export default { source_metadata_manifest_ref: 'clinical-expansion-v2/schema/SOURCE_METADATA_REPLAY_MANIFEST.json',
  batch_id: 'source-first-0626-0635',
  sources: [
    {
      registry_file: 'international_clinical_sources.json',
      source: {
        source_id: 'who-audit-primary-care-2001',
        issuing_organisation: 'World Health Organization',
        exact_document_title: 'AUDIT: The Alcohol Use Disorders Identification Test — Guidelines for Use in Primary Care, Second Edition',
        exact_official_url: 'https://iris.who.int/bitstream/handle/10665/67205/WHO_MSD_MSB_01.6a-eng.pdf',
        publication_date: null,
        effective_date: null,
        revision_date: null,
        version: 'Second edition; WHO/MSD/MSB/01.6a',
        jurisdiction: 'World Health Organization international guidance requiring UAE service adaptation',
        population: 'Adults in primary and general healthcare settings where alcohol-use screening or brief assessment is clinically appropriate.',
        clinical_setting: 'Primary healthcare and general medical care.',
        applicability_note: 'Supports clinician-entered alcohol frequency, quantity, heavy-use episodes, dependence-related symptoms, alcohol-related harm, and screening context without automatically scoring, diagnosing, or generating intervention advice.',
        recency_verification: {
          verified_on: '2026-07-14',
          status: 'official_WHO_publication_page_and_exact_manual_reviewed',
        },
        superseded_status_check: {
          checked_on: '2026-07-14',
          status: 'official_WHO_AUDIT_second_edition_remains_published_for_primary_care_use',
        },
        exact_sections: [
          {
            section_id: 'who-audit-2001-purpose-context',
            heading: 'Purpose of the manual and context of alcohol screening',
            locator: 'manual pages 4–7',
            evidence_summary: 'Supports documenting why alcohol use was reviewed and the primary-care screening context without asserting hazardous use.',
          },
          {
            section_id: 'who-audit-2001-consumption-harm-items',
            heading: 'AUDIT questions and domains',
            locator: 'manual pages 15–18 and Appendix B',
            evidence_summary: 'Supports recording alcohol frequency, typical quantity, heavy-use episodes, dependence-related symptoms, harmful consequences, concern from others, and prior injury without automatically scoring or diagnosing.',
          },
        ],
      },
    },
  ],
  workflows: replayDiscovery ? [] : gpExplicitWorkflowsForRange(ledger, 626, 635),
}

# Expanded Workflow Schema

`expanded_workflow.schema.json` defines one canonical workflow at schema version `1.0.0`. Each file in `clinical-expansion/canonical/workflows/` must contain one object; every item in `expanded_workflows_v1.json` must validate as the same object.

The schema is for clinician-controlled documentation scaffolding. It does not encode patient-specific recommendations, prescribing, autonomous diagnosis, automatic scoring, clinical approval, testing readiness, or public-release readiness.

## Required shape

Every workflow requires `schema_version` plus these objects: `identity`, `scope`, `presenting_complaint`, `associated_history`, `background_history`, `womens_health`, `paediatrics`, `geriatrics`, `psychiatry`, `ideas_concerns_expectations`, `examination`, `investigations`, `assessment`, `plan`, `safety`, `guideline_provenance`, and `governance`.

Every named field is required so omissions are distinguishable from migration errors. Condition-specific arrays may be `[]` when a concept is not applicable or no authoritative content was verified. Do not fill gaps with cross-specialty boilerplate. Explain material gaps in `scope.workflow_limitations`, `safety.limitations`, and `governance.unresolved_issues` as appropriate.

## Reusable values

### Documentation item

Prompt and option arrays contain:

| Field | Meaning |
|---|---|
| `item_id` | Stable workflow-local identifier. A legacy chip ID may be retained. |
| `text` | Short clinician-facing prompt or documentation option; never an assertion about the patient. |
| `source_ids` | Source-registry IDs supporting the item. May be empty for generic clinician-entry scaffolds or a recorded source gap. |
| `clinician_confirmation_required` | Always `true`. |
| `default_selected` | Always `false`. |
| `legacy_item_ids` | Optional prior IDs used for deterministic export or migration. |
| `tags` | Optional non-clinical indexing labels. |

`documentationGroup[]` adds `group_id`, `label`, and one or more documentation items. Empty group arrays are allowed; an emitted group cannot itself be empty.

### Clinician-entry field

Singular `*_field` properties are arrays with zero or one field definition. An empty array means the field is not applicable or not yet safely mapped.

| Field | Meaning |
|---|---|
| `field_id`, `label` | Stable ID and clinician-facing label. |
| `input_type` | `free_text`, `short_text`, `number`, `date`, `datetime`, `single_select`, `multi_select`, `boolean`, or `score_components`. |
| `source_ids` | Supporting source-registry IDs; may be empty under the same rules as documentation items. |
| `clinician_entry_required` | Always `true`. |
| `auto_populate` | Always `false`. |
| `calculation_mode` | `none` or `clinician_entered_result_only`; schema v1 permits no automatic score result. |
| `helper_text`, `options` | Optional explanatory text and unselected options. No default value is permitted. |

## Canonical fields

### Identity

| Field | Type | Purpose |
|---|---|---|
| `workflow_id` | string | Stable lowercase hyphenated ID; must not change without a migration map. |
| `display_name` | string | Primary workflow title. |
| `specialty_id` | string | Stable specialty key inherited or normalized from the inventory. |
| `specialty_display_name` | string | Clinician-facing specialty label. |
| `presentation` | string | Presentation represented by the workflow. |
| `clinician_diagnosis_label` | string | Label available for clinician-entered assessment; never an inferred diagnosis. |
| `aliases` | string[] | Search aliases; may be empty. |
| `related_workflow_ids` | workflow ID[] | Explicit related variants; may be empty. |
| `duplicate_group_id` | string or null | Overlap-group ID without implying automatic merge. |
| `current_exclusion_status` | enum | Preserves an existing exclusion or records a proposed one. |

### Scope

| Field | Type | Purpose |
|---|---|---|
| `intended_setting` | string[] | Applicable care settings; empty only when not established and recorded as a gap. |
| `target_population` | string | Concise population description. |
| `age_min_months`, `age_max_years` | number or null | Inclusive age bounds; `null` means no verified bound. |
| `sex_applicability` | enum | Population applicability, not a patient inference. |
| `pregnancy_applicability`, `postpartum_applicability`, `immunocompromised_applicability` | enum | Explicit special-population applicability. |
| `inclusion_notes`, `exclusion_notes` | string[] | Scope inclusion and exclusion statements. |
| `workflow_limitations`, `special_population_notes` | string[] | Known coverage limits and population cautions. |

### Presenting complaint

- `chief_complaint` is the concise complaint label.
- `onset_prompts`, `duration_prompts`, `progression_prompts`, `severity_prompts`, `symptom_characterisation_prompts`, `location_prompts`, `radiation_prompts`, `timing_prompts`, `aggravating_factors`, `relieving_factors`, `previous_episode_prompts`, and `impact_on_function_prompts` are unselected `documentationItem[]`.

### Associated history

`associated_symptom_prompts`, `relevant_negative_prompts`, `red_flag_screening_prompts`, `risk_factor_prompts`, `exposure_prompts`, `travel_prompts`, `infectious_contact_prompts`, `trauma_prompts`, `procedure_prompts`, `occupational_prompts`, `sexual_health_prompts`, and `substance_use_prompts` are unselected `documentationItem[]`. Sensitive or condition-specific arrays should remain empty outside their applicable scope.

### Background history

`past_medical_history_prompts`, `past_surgical_history_prompts`, `medication_history_prompts`, `medication_adherence_prompts`, `anticoagulant_or_antiplatelet_prompts`, `allergy_prompts`, `adverse_reaction_prompts`, `vaccination_prompts`, `family_history_prompts`, `social_history_prompts`, `functional_status_prompts`, `frailty_prompts`, and `baseline_cognition_prompts` are unselected `documentationItem[]`.

### Women's health

`last_menstrual_period_prompts`, `pregnancy_possibility_prompts`, `gestational_age_prompts`, `contraception_prompts`, `menstrual_history_prompts`, `obstetric_history_prompts`, `gynaecological_history_prompts`, `fertility_prompts`, `postpartum_prompts`, `breastfeeding_prompts`, `fetal_movement_prompts`, `bleeding_prompts`, `rhesus_status_documentation_prompt`, and `safeguarding_and_consent_prompts` are unselected `documentationItem[]`. Use `[]` when outside scope; do not insert these prompts into unrelated workflows.

### Paediatrics

`age_specific_presentation_prompts`, `birth_history_prompts`, `gestational_age_at_birth_prompts`, `neonatal_history_prompts`, `growth_prompts`, `developmental_prompts`, `feeding_prompts`, `hydration_prompts`, `urine_output_prompts`, `stool_prompts`, `immunisation_prompts`, `school_or_nursery_prompts`, `caregiver_concern_prompts`, `safeguarding_prompts`, `weight_documentation_prompt`, `paediatric_vital_sign_prompts`, and `age_specific_red_flags` are unselected `documentationItem[]`. Use only population-appropriate wording.

### Geriatrics

`baseline_function`, `mobility`, `falls`, `frailty`, `cognition`, `delirium`, `polypharmacy`, `medication_changes`, `living_arrangements`, `caregiver_support`, `advance_care_planning`, `capacity_prompts`, and `goals_of_care` are unselected `documentationItem[]`. `advance_care_planning` and `goals_of_care` are documentation prompts only, never generated decisions.

### Psychiatry

`presenting_symptoms`, `duration`, `functional_effect`, `biological_symptoms`, `substance_use`, `psychotic_symptom_prompts`, `manic_symptom_prompts`, `anxiety_symptom_prompts`, `mood_symptom_prompts`, `trauma_prompts`, `risk_to_self_prompt`, `risk_to_others_prompt`, `vulnerability_prompt`, `safeguarding_prompt`, `capacity_prompt`, and `collateral_history_prompt` are unselected `documentationItem[]`. `mental_state_examination_groups` is `documentationGroup[]`. The brief's clinician-entered-risk-only rule is encoded by `risk_assessment_mode`, whose value is `clinician_entered_only`; no psychiatric risk is assigned automatically.

### Ideas, concerns, and expectations

`patient_ideas`, `patient_concerns`, `patient_expectations`, `understanding`, and `shared_decision_making_documentation` are unselected `documentationItem[]` and may be empty when not appropriate.

### Examination

- `general_appearance_prompts`, `vital_sign_prompts`, `hydration_prompts`, `pain_score_documentation_prompt`, `system_specific_examination_prompts`, `neurovascular_prompts`, `laterality_prompts`, `functional_examination_prompts`, `gait_prompts`, `skin_examination_prompts`, `mental_state_examination_prompts`, `chaperone_prompt`, `consent_prompt`, and `examination_not_performed_reason_prompt` are unselected `documentationItem[]`.
- `focused_examination_groups` is `documentationGroup[]`.
- `examination_limitations` is `string[]`.

No examination finding may be preselected or emitted without clinician confirmation.

### Investigations

- `bedside_test_documentation_options`, `laboratory_test_documentation_options`, `imaging_documentation_options`, `functional_test_documentation_options`, `microbiology_documentation_options`, `pathology_documentation_options`, and `specialist_test_documentation_options` are unselected `documentationItem[]`.
- `result_review_prompts`, `comparison_with_previous_prompt`, and `pending_result_prompt` are unselected `documentationItem[]`; `investigation_limitation_notes` is `string[]`.
- `test_status_terms` contains only `ordered`, `performed`, `reviewed`, or `pending`. These mean “if documented by the clinician,” never an automatic order, performance claim, result, or recommendation.

### Assessment

`clinician_impression_field`, `clinician_differential_field`, `working_diagnosis_field`, `diagnostic_uncertainty_field`, `severity_documentation_field`, `classification_documentation_field`, `clinical_score_documentation_field`, and `risk_documentation_field` are zero-or-one clinician-entry field arrays. `score_components_if_documented` is unselected `documentationItem[]`. Scores, severity, classification, differentials, and risk remain clinician-entered; schema v1 does not calculate them.

### Plan

- `clinician_plan_field`, `medication_name_documentation_field`, `medication_change_documentation_field`, `referral_reason_field`, `referral_destination_field`, and `clinician_entered_patient_instructions` are zero-or-one clinician-entry field arrays.
- `treatment_documentation_categories`, `medication_reconciliation_prompt`, `non_pharmacological_documentation_options`, `procedure_documentation_options`, `investigation_plan_documentation`, `escalation_documentation`, `admission_documentation`, `discharge_documentation`, `follow_up_interval_documentation`, `monitoring_documentation`, `return_precaution_documentation`, `shared_decision_making_documentation`, `patient_preference_documentation`, `work_or_school_note_documentation`, and `fitness_or_restriction_documentation` are unselected `documentationItem[]`.

Plan items mean documented, discussed, or arranged only when the clinician confirms that action. Medication doses, frequencies, and durations are prohibited.

### Safety

`red_flag_prompts`, `time_critical_feature_prompts`, `urgent_assessment_documentation_prompts`, `escalation_documentation_prompts`, `contraindication_prompts`, `medication_safety_prompts`, `allergy_safety_prompts`, `pregnancy_safety_prompts`, `safeguarding_prompts`, `capacity_prompts`, `consent_prompts`, `chaperone_prompts`, and `safety_net_documentation_prompts` are unselected `documentationItem[]`. `high_risk_notes` and `limitations` are `string[]`. Red flags and escalation remain assessment/documentation prompts, not conclusions.

### Guideline provenance

| Field | Type | Purpose |
|---|---|---|
| `primary_source_ids`, `supporting_source_ids` | source ID[] | References into the authoritative source registry; supporting sources do not replace a primary source. |
| `jurisdiction_priority` | enum[] | Ordered source-hierarchy levels considered. |
| `source_mapping_status` | enum | Record-level mapping progress/result. |
| `source_recency_status` | enum | Whether currency was verified, uncertain, stale, or superseded. |
| `conflicting_guidance` | conflict[] | Topic plus at least two source-linked positions; always unresolved pending clinician review in v1. |
| `local_adaptation_notes` | string[] | UAE applicability or local adaptation notes without silently overriding sources. |
| `relevant_guideline_sections` | section[] | Source ID, official section/chapter labels, and applicability note. |
| `evidence_strength_if_explicit`, `evidence_certainty_if_explicit` | statement[] | Source-linked wording only when the source explicitly states it; otherwise `[]`. |
| `source_search_date`, `next_source_review_due` | date or null | Search and scheduled recheck dates. Terminal source states require dates. |

### Governance

| Field | Type | Purpose |
|---|---|---|
| `risk_tier` | enum | Workflow documentation risk tier 1–5. |
| `review_priority` | enum | Operational review queue priority, not patient triage. |
| `expansion_status` | enum | Content expansion/remediation lifecycle. |
| `source_status` | enum | Source-search outcome used by cross-field constraints. |
| `automated_qa_status` | enum | Automated audit outcome only; never clinical approval. |
| `clinical_review_status` | constant | Always `clinical_review_required` in schema v1. |
| `limited_testing_status` | enum | Non-ready or excluded state; no `limited_testing_ready` value exists. |
| `public_release_status` | constant | Always `not_for_public_release` in schema v1. |
| `unresolved_issues` | issue[] | Open schema/source/safety/content/application issues with `ungraded` or P0–P3 severity. |
| `change_log` | change[] | Timestamped inventory, research, expansion, remediation, manual-edit, or migration record. |

## Controlled values

- `current_exclusion_status`: `not_excluded`, `excluded_requires_doctor_review`, `excluded_remove_or_redesign_recommended`, `additional_exclusion_proposed`.
- Special-population applicability: `applicable`, `not_applicable`, `requires_specific_review`, `not_established`.
- `sex_applicability`: `all`, `female_only`, `male_only`, `condition_specific`, `not_established`.
- `risk_tier`: `tier_1` routine documentation; `tier_2` moderate complexity; `tier_3` potentially serious; `tier_4` high-risk specialist/acute review; `tier_5` excluded from limited testing.
- `review_priority`: `standard`, `elevated`, `high`, `highest`. This controls review order only.
- `expansion_status`: `not_started`, `expansion_started`, `expanded`, `remediation_required`, `remediated`.
- `source_status`: `not_started`, `source_search_started`, `source_mapped`, `source_mapped_with_gaps`, `source_gap`, `conflict_requires_clinician_review`.
- `source_mapping_status`: `not_started`, `in_progress`, `mapped`, `mapped_with_gaps`, `source_gap`, `conflict_requires_clinician_review`.
- `source_recency_status`: `not_assessed`, `current_verified`, `uncertain`, `stale`, `superseded`.
- `automated_qa_status`: `not_run`, `in_progress`, `failed`, `passed_with_p2_p3`, `automated_qa_passed`.
- `clinical_review_status`: only `clinical_review_required`.
- `limited_testing_status`: `not_assessed`, `excluded_from_limited_testing`, `excluded_pending_source_review`, `excluded_pending_clinical_review`, `excluded_pending_source_and_clinical_review`.
- `public_release_status`: only `not_for_public_release`.
- Unresolved issue severity: `ungraded`, `p0`, `p1`, `p2`, `p3`; status: `open`, `remediation_required`, `accepted_for_clinician_review`, `excluded_pending_review`.

No enum contains `clinically_approved`, `clinically_validated`, `guideline_compliant`, `safe_for_autonomous_use`, `limited_testing_ready`, or `ready_for_public_clinical_use`.

## Source-gap and conflict rules

- No verified authoritative source: set both source-ID arrays to `[]`, `source_mapping_status` and `source_status` to `source_gap`, record search/review dates, add an unresolved `source_gap` issue, and exclude pending source review.
- Partial mapping: use `source_mapped_with_gaps` / `mapped_with_gaps`, retain at least one primary source, record each gap, and exclude pending source review.
- Conflicting authoritative sources: record each position in `conflicting_guidance`, use `conflict_requires_clinician_review`, add an unresolved `clinical_conflict` issue, and exclude pending clinical review. Do not silently select one position.
- If an existing exclusion also has a gap or conflict, `excluded_from_limited_testing` remains the testing status while source fields retain the additional reason. If a proposed exclusion also needs source review, use `excluded_pending_source_and_clinical_review`.
- Empty condition-specific arrays are valid in all source states. They must never be interpreted as a negative finding, completed assessment, recommendation, or proof of completeness.

## Cross-field constraints

- `source_mapped` requires a primary source, mapped provenance state, recency state, search date, and next review date.
- Expanded/remediated content requires a terminal source state: mapped, mapped with gaps, source gap, or conflict.
- Existing exclusions remain `excluded_from_limited_testing`; proposed exclusions remain excluded pending clinical review.
- `tier_4` and `tier_5` must use an excluded limited-testing state until qualified review.
- A clean `automated_qa_passed` record has no unresolved issues. `passed_with_p2_p3` permits no unresolved P0/P1.
- Clinical review and public-release constants cannot be advanced by automation.

## Dataset-level validation

JSON Schema validates one record. The expansion validators must additionally enforce:

- exactly 1,500 unique workflow IDs, filename/ID agreement, and no lost legacy IDs;
- valid specialty IDs, related workflow IDs, duplicate-group references, and source-registry IDs;
- unique item/group/field/issue IDs within each workflow and deterministic ordering;
- age-bound consistency (`age_min_months <= age_max_years * 12`) when both exist;
- source IDs in item-level provenance also appear in workflow provenance;
- source dates, superseded/conflict flags, official locations, and review dates agree with the source registry;
- condition-, population-, sex-, pregnancy-, age-, and specialty-specific relevance;
- no contradictory prompts, preselected content, invented findings/results, autonomous recommendations, medication dose/frequency/duration text, automatic referrals/escalation, or automatic score conclusions;
- generated application files contain only clinician-confirmed or clinician-entered content in outputs.

Qualified clinical sign-off is intentionally outside schema v1. Adding a reviewed/approved state requires a new schema version with named reviewer, credentials, signed timestamp, reviewed version/hash, scope, and disposition—not a status-string edit.

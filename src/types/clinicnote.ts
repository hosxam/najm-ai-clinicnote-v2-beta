export type ClinicalWorkflow = {
  workflow_id: string
  specialty_id: string
  chief_complaint: string
  chief_complaint_aliases: string[]
  diagnosis: string
  diagnosis_aliases: string[]
  history_layout_id: string
  filters?: {
    age_min_months?: number | null
    age_max_years?: number | null
    sex?: string | null
  }
  chip_groups?: Array<{
    group: string
    order: number
    prompt: string
  }>
  min_sections?: string[]
}

export type DiagnosisIndexEntry = {
  entry_id: string
  type: string
  label: string
  aliases?: string[]
  specialty_ids?: string[]
  workflow_ids?: string[]
}

export type WorkflowChipItem = {
  chip_id: string
  group: string
  chip_text: string
  order: number
  search_terms?: string[]
  tags?: string[]
}

export type WorkflowChipCollection = {
  workflow_id: string
  specialty_id?: string
  chips: WorkflowChipItem[]
}

export type SpeedPreset = {
  workflow_id: string
  preset_name: string
  specialty: string
  default_duration_options?: string[]
  prechecked_symptoms?: string[]
  prechecked_relevant_negatives?: string[]
  prechecked_exam_findings?: string[]
  prechecked_investigations?: string[]
  prechecked_plan_phrases?: string[]
  prechecked_follow_up?: string[]
  collapsed_optional_sections?: string[]
  safety_note?: string
}

export type HistoryDraft = {
  workflow_id: string
  workflow_display_name: string
  default_history_draft: string
  editable_placeholders?: string[]
  linked_autofill_groups?: string[]
  optional_full_history_sections?: string[]
  safety_note?: string
}

export type ExamPrompt = {
  prompt_id: string
  prompt_text: string
  documentation_style?: string
  required_level?: string
  warning?: string
}

export type ExamGroup = {
  group_id: string
  group_label: string
  display_order?: number
  safety_note?: string
  prompts: ExamPrompt[]
}

export type ExamDetails = {
  workflow_id: string
  workflow_display_name: string
  exam_groups: ExamGroup[]
  safety_note?: string
}

export type InvestigationOption = {
  option_id: string
  option_text: string
  required_level?: string
  source_status?: string
  note_text?: string
  safety_note?: string
}

export type InvestigationGroup = {
  group_id: string
  group_label: string
  options: InvestigationOption[]
}

export type InvestigationDetails = {
  workflow_id: string
  workflow_display_name: string
  investigation_groups: InvestigationGroup[]
  safety_note?: string
}

export type PlanOption = {
  option_id: string
  option_text: string
  option_category?: string
  clinician_confirmation_required?: boolean
  safety_note?: string
  note_text?: string
}

export type PlanGroup = {
  group_id: string
  group_label: string
  options: PlanOption[]
}

export type PlanDetails = {
  workflow_id: string
  workflow_display_name: string
  plan_option_groups: PlanGroup[]
  safety_note?: string
}

export type MedicationOption = {
  option_id: string
  label: string
  note_text?: string
  option_type?: string
  warning?: string
}

export type MedicationGroup = {
  group_id: string
  group_label: string
  display_order?: number
  safety_note?: string
  options: MedicationOption[]
}

export type MedicationDetails = {
  workflow_id: string
  workflow_display_name: string
  specialty?: string
  option_groups: MedicationGroup[]
  safety_note?: string
}

export type SpecialtyLayoutField = {
  field_id: string
  prompt: string
  type: string
  placeholder?: string | null
  required?: boolean
  options?: string[]
}

export type SpecialtyLayoutSection = {
  section_id: string
  display_name: string
  order: number
  description?: string
  fields: SpecialtyLayoutField[]
}

export type SpecialtyLayout = {
  specialty_id: string
  display_name: string
  sections: SpecialtyLayoutSection[]
}

export type LimitedTestingExclusion = {
  workflow_id: string
  exclusion_reason: string
  category: 'requires_doctor_review' | 'remove_or_redesign_recommended'
  testing_status: 'excluded_from_limited_testing'
}

export type WorkflowSummary = {
  workflowId: string
  title: string
  specialty: string
  diagnosis: string
  aliases: string[]
  searchText: string
  exclusion?: LimitedTestingExclusion
}

export type WorkflowDetails = {
  summary: WorkflowSummary
  clinical: ClinicalWorkflow
  chips: WorkflowChipCollection | null
  preset: SpeedPreset | null
  historyDraft: HistoryDraft | null
  examDetails: ExamDetails | null
  investigationDetails: InvestigationDetails | null
  planDetails: PlanDetails | null
  medicationDetails: MedicationDetails | null
  specialtyLayout: SpecialtyLayout | null
}

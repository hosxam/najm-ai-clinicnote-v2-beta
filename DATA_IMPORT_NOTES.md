# Data Import Notes

Source repo:

- `C:\Users\ASUS\OpenClaw_Workspaces\active\najm-ai-clinicnote`
- branch: `phase1-staged-import-1500-workflows`

Imported into `public/`:

- `public/data/clinical_workflows.json`
- `public/data/workflow_chips.json`
- `public/data/diagnosis_index.json`
- `public/data/speed_presets.json`
- `public/data/specialty_history_layouts.json`
- `public/data/v4_workflow_history_drafts.json`
- `public/data/v4_workflow_exam_details.json`
- `public/data/v4_investigation_options.json`
- `public/data/v4_plan_options.json`
- `public/data/v4_plan_medication_options.json`
- `public/config/limited_testing_exclusions.json`

Also copied for optional future use:

- `public/exports/najm_scribe_workflows_v1.json`
- `public/exports/najm_scribe_workflows_v1.csv`

## Adapter behavior

- loads workflow catalog from raw source JSON
- builds search aliases from `diagnosis_index.json`
- lazily loads heavier workflow-specific prompt files
- filters excluded workflows by default
- blocks excluded workflows on direct access

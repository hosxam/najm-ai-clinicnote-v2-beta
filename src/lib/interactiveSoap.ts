export type InteractiveField = {
  field_id: string
  label: string
  soap_destination: 'subjective' | 'objective' | 'assessment' | 'plan'
  field_type: string
  required?: boolean
  visibility?: { type: 'always' } | { type: 'equals'; field_id: string; value: string }
}

export type InteractiveWorkflow = {
  workflow_id: string
  title: string
  fields: InteractiveField[]
}

export type InteractiveValues = Record<string, string>

export type InteractiveSoapSections = {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

const footer = 'Clinician-review draft. Generated only from entered or selected facts; review before use.'

function clean(value: string | undefined) {
  return typeof value === 'string' ? value.trim() : ''
}

function visible(field: InteractiveField, values: InteractiveValues) {
  if (!field.visibility || field.visibility.type === 'always') return true
  return clean(values[field.visibility.field_id]) === field.visibility.value
}

function dedupe(lines: string[]) {
  const seen = new Set<string>()
  return lines.filter((line) => {
    const key = line.toLocaleLowerCase()
    if (!line || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function buildInteractiveSoapSections(workflow: InteractiveWorkflow, values: InteractiveValues): InteractiveSoapSections {
  const sections: Record<keyof InteractiveSoapSections, string[]> = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of workflow.fields) {
    const value = clean(values[field.field_id])
    if (!value || !visible(field, values)) continue
    const labelPrefix = `${field.label.trim().toLocaleLowerCase()}:`
    sections[field.soap_destination].push(value.toLocaleLowerCase().startsWith(labelPrefix) ? value : `${field.label}: ${value}`)
  }
  return {
    subjective: dedupe(sections.subjective).join('\n'),
    objective: dedupe(sections.objective).join('\n'),
    assessment: dedupe(sections.assessment).join('\n'),
    plan: dedupe(sections.plan).join('\n'),
  }
}

export function buildInteractiveSoapNote(workflow: InteractiveWorkflow, values: InteractiveValues) {
  const sections = buildInteractiveSoapSections(workflow, values)
  const parts = ['SOAP NOTE']
  if (sections.subjective) parts.push(`SUBJECTIVE\n${sections.subjective}`)
  if (sections.objective) parts.push(`OBJECTIVE\n${sections.objective}`)
  if (sections.assessment) parts.push(`ASSESSMENT\n${sections.assessment}`)
  if (sections.plan) parts.push(`PLAN\n${sections.plan}`)
  if (parts.length === 1) return ''
  parts.push(footer)
  return parts.join('\n\n')
}

export function interactiveSoapFooter() {
  return footer
}

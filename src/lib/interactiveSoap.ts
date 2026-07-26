import type { InteractiveField } from './interactiveWorkflowData'

export type InteractiveWorkflow = {
  workflow_id: string
  title: string
  archetype: string
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

function displayValue(value: string) {
  const trimmed = clean(value)
  if (!trimmed) return []
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
  } catch {
    // Plain text is the normal representation for scalar controls.
  }
  return [trimmed]
}

function structuredValue(field: InteractiveField, value: string) {
  const raw = clean(value)
  if (!raw) return []
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return [raw] }
  const rows = Array.isArray(parsed) ? parsed : [parsed]
  const rendered = rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return [String(row)]
    const record = row as Record<string, unknown>
    const get = (...keys: string[]) => keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && String(item).trim() !== '')
    if (field.value_formatter === 'vital_sign') {
      const name = get('name', 'observation', 'component')
      const valuePart = get('value', 'reading')
      const unit = get('unit')
      const date = get('date', 'time')
      return [`${name ? `${name}: ` : ''}${valuePart ?? ''}${unit ? ` ${unit}` : ''}${date ? ` (${date})` : ''}`.trim()]
    }
    if (field.value_formatter === 'examination') {
      const finding = get('finding', 'site', 'examination')
      const status = get('status', 'result')
      const detail = get('detail', 'description')
      return [`${finding ?? 'Examination'}${status ? `: ${status}` : ''}${detail ? ` — ${detail}` : ''}`]
    }
    if (field.value_formatter === 'investigation') {
      const test = get('test', 'name', 'investigation')
      const result = get('value', 'result', 'finding')
      const unit = get('unit')
      const date = get('date')
      const comparison = get('comparison', 'previous')
      const interpretation = get('interpretation')
      return [`${test ?? 'Investigation'}${result !== undefined ? `: ${result}${unit ? ` ${unit}` : ''}` : ''}${date ? ` (${date})` : ''}${comparison ? `; compared with ${comparison}` : ''}${interpretation ? `; ${interpretation}` : ''}`]
    }
    if (field.value_formatter === 'medication') {
      const name = get('name', 'medicine', 'agent')
      const dose = get('dose')
      const route = get('route')
      const frequency = get('frequency')
      const indication = get('indication')
      return [`${name ?? 'Medication'}${dose ? ` ${dose}` : ''}${route ? ` ${route}` : ''}${frequency ? ` ${frequency}` : ''}${indication ? ` — ${indication}` : ''}`]
    }
    if (field.value_formatter === 'allergy') {
      const allergen = get('allergen', 'name', 'substance')
      const reaction = get('reaction')
      const certainty = get('certainty', 'status')
      return [`${allergen ?? 'Allergy'}${reaction ? `: ${reaction}` : ''}${certainty ? ` (${certainty})` : ''}`]
    }
    return [Object.entries(record).filter(([, item]) => item !== null && item !== undefined && String(item).trim() !== '').map(([key, item]) => `${key}: ${item}`).join('; ')]
  }).map((item) => item.trim()).filter(Boolean)
  return rendered.length ? rendered : [raw]
}

function visible(field: InteractiveField, values: InteractiveValues) {
  if (!field.visibility || field.visibility.type === 'always') return true
  return clean(values[field.visibility.field_id]) === field.visibility.value
}

function documentationStatusOnly(value: string) {
  const normalized = value.toLowerCase().replace(/[.?!]+$/g, '').trim()
  return /\b(documented|reviewed|recorded)\b/.test(normalized)
    && !/\b(value|result|finding|measurement|dose|mg|mmhg|bpm|°c|kg|cm|date|time|normal|abnormal|present|absent)\b/.test(normalized)
    && !/[0-9]/.test(normalized)
}

function dedupe(lines: string[]) {
  const seen = new Set<string>()
  return lines.filter((line) => {
    const normalized = line.trim().toLocaleLowerCase()
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

function labelLine(field: InteractiveField, value: string) {
  const content = clean(value)
  if (!content || documentationStatusOnly(content)) return ''
  const label = field.label.trim()
  const prefix = `${label.toLocaleLowerCase()}:`
  return content.toLocaleLowerCase().startsWith(prefix) ? content : `${label}: ${content}`
}

export function buildInteractiveSoapSections(workflow: InteractiveWorkflow, values: InteractiveValues): InteractiveSoapSections {
  const sections: Record<keyof InteractiveSoapSections, string[]> = { subjective: [], objective: [], assessment: [], plan: [] }
  for (const field of [...workflow.fields].sort((a, b) => a.display_order - b.display_order)) {
    if (!visible(field, values)) continue
    for (const value of (field.value_formatter && field.value_formatter !== 'trimmed_text' && field.value_formatter !== 'option' ? structuredValue(field, values[field.field_id] ?? '') : displayValue(values[field.field_id] ?? ''))) {
      const line = labelLine(field, value)
      if (line) sections[field.soap_destination].push(line)
    }
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

const procedureOrder = [
  ['procedure', 'Procedure'],
  ['indication', 'Indication'],
  ['consent', 'Consent / time-out'],
  ['preparation', 'Preparation / anaesthesia'],
  ['technique', 'Technique'],
  ['finding', 'Findings / specimens'],
  ['blood', 'Blood loss'],
  ['complication', 'Complications'],
  ['tolerance', 'Tolerance'],
  ['post-procedure', 'Post-procedure status'],
  ['follow-up', 'Aftercare / follow-up'],
] as const

export function buildInteractiveProcedureNote(workflow: InteractiveWorkflow, values: InteractiveValues) {
  if (!workflow.archetype.includes('procedure')) return ''
  const lines: string[] = []
  for (const [token, heading] of procedureOrder) {
    const matching = workflow.fields.filter((field) => `${field.label} ${field.section}`.toLocaleLowerCase().includes(token))
    const sectionLines: string[] = []
    for (const field of matching) {
      for (const value of (field.value_formatter && field.value_formatter !== 'trimmed_text' && field.value_formatter !== 'option' ? structuredValue(field, values[field.field_id] ?? '') : displayValue(values[field.field_id] ?? ''))) {
        const line = labelLine(field, value)
        if (line) sectionLines.push(line)
      }
    }
    if (sectionLines.length) lines.push(`${heading}\n${dedupe(sectionLines).join('\n')}`)
  }
  const unique = dedupe(lines)
  return unique.length ? ['PROCEDURE NOTE', ...unique, footer].join('\n\n') : ''
}

export function interactiveSoapFooter() {
  return footer
}

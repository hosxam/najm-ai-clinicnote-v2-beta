const groupLabelMap: Record<string, string> = {
  symptoms: 'Symptoms / History',
  relevant_negatives: 'Important negatives',
  exam_findings: 'Examination',
  red_flags: 'Red flag prompts',
  investigations: 'Investigations',
  plan_phrases: 'Plan',
  follow_up: 'Follow-up',
}

export function displayGroupLabel(group: string) {
  return groupLabelMap[group] ?? group.replace(/_/g, ' ')
}

export function cleanPlaceholderLabel(value: string) {
  return value
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sentenceCase(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function dedupeStrings(values: string[]) {
  return Array.from(
    new Map(
      values
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [value.toLowerCase(), value]),
    ).values(),
  )
}

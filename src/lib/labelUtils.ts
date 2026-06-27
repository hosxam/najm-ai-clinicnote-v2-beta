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

const exactDisplayReplacements: Array<[string | RegExp, string]> = [
  [/Women�s/g, "Women's"],
]

function applyDisplayReplacements(value: string) {
  return exactDisplayReplacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), value)
}

export function normalizeDisplayText(value: string) {
  if (!value) return value

  return applyDisplayReplacements(value)
    .replace(/\s+/g, ' ')
    .replace(/\.\.+/g, '.')
    .trim()
}

const redundantSentences = new Set(['documented', 'reviewed'])

export function normalizeDocumentationText(value: string) {
  const normalized = normalizeDisplayText(value)
  if (!normalized) return normalized

  const sentences = normalized
    .split('.')
    .map((item) => item.trim())
    .filter(Boolean)

  if (sentences.length <= 1) return normalized

  const deduped: string[] = []
  const seen = new Set<string>()

  for (const sentence of sentences) {
    const key = sentence.toLowerCase()
    if (redundantSentences.has(key)) continue
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(sentence)
  }

  if (!deduped.length) return normalized

  return `${deduped.join('. ')}.`
}

export const QUICK_NOTE_CONFIRMATION_MODEL_VERSION = 1 as const

export type ConfirmedQuickNoteSelections = {
  selectedSymptoms: string[]
  selectedNegatives: string[]
  selectedExam: string[]
  selectedPlanItems: string[]
}

export type SuggestedQuickNoteSelections = {
  symptoms: string[]
  relevantNegatives: string[]
  planPhrases: string[]
}

type StoredQuickNoteSelections = Partial<ConfirmedQuickNoteSelections> & {
  confirmationModelVersion?: number
}

const bulkConfirmationConflictGroups = [
  ['dry cough', 'productive cough'],
]

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function dedupe(values: string[]) {
  return Array.from(new Map(values.map((value) => [normalize(value), value])).values())
}

function confirmSuggestedGroup(current: string[], suggested: string[]) {
  const currentNormalized = new Set(current.map(normalize))
  const suggestedNormalized = new Set(suggested.map(normalize))
  const safeSuggestions = suggested.filter((candidate) => {
    const candidateKey = normalize(candidate)
    if (currentNormalized.has(candidateKey)) return false

    const conflictGroup = bulkConfirmationConflictGroups.find((group) => group.includes(candidateKey))
    if (!conflictGroup) return true

    return !conflictGroup.some((other) => {
      if (other === candidateKey) return false
      return currentNormalized.has(other) || suggestedNormalized.has(other)
    })
  })

  return dedupe([...current, ...safeSuggestions])
}

export function createUnconfirmedQuickNoteSelections(): ConfirmedQuickNoteSelections {
  return {
    selectedSymptoms: [],
    selectedNegatives: [],
    selectedExam: [],
    selectedPlanItems: [],
  }
}

export function restoreConfirmedQuickNoteSelections(saved: StoredQuickNoteSelections | null) {
  if (saved?.confirmationModelVersion !== QUICK_NOTE_CONFIRMATION_MODEL_VERSION) {
    return createUnconfirmedQuickNoteSelections()
  }

  return {
    selectedSymptoms: saved.selectedSymptoms ?? [],
    selectedNegatives: saved.selectedNegatives ?? [],
    selectedExam: saved.selectedExam ?? [],
    selectedPlanItems: saved.selectedPlanItems ?? [],
  }
}

export function confirmSuggestedQuickNoteSelections(
  current: ConfirmedQuickNoteSelections,
  suggested: SuggestedQuickNoteSelections,
): ConfirmedQuickNoteSelections {
  return {
    selectedSymptoms: confirmSuggestedGroup(current.selectedSymptoms, suggested.symptoms),
    selectedNegatives: confirmSuggestedGroup(current.selectedNegatives, suggested.relevantNegatives),
    selectedExam: current.selectedExam,
    selectedPlanItems: confirmSuggestedGroup(current.selectedPlanItems, suggested.planPhrases),
  }
}


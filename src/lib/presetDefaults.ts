import { normalizeDisplayText } from './labelUtils'
import type { WorkflowDetails } from '../types/clinicnote'

type QuickNoteSuggestedSelections = {
  symptoms: string[]
  relevantNegatives: string[]
  planPhrases: string[]
}

function normalizeChipValue(value: string) {
  return normalizeDisplayText(value).toLowerCase()
}

function mapPresetValuesToChips(chips: string[], presetValues: string[] | undefined) {
  if (!chips.length || !presetValues?.length) return []

  const chipMap = new Map(chips.map((chip) => [normalizeChipValue(chip), chip]))
  const matched = presetValues
    .map((value) => chipMap.get(normalizeChipValue(value)))
    .filter((value): value is string => Boolean(value))

  return Array.from(new Set(matched))
}

export function getQuickNoteSuggestedSelections(details: WorkflowDetails | null): QuickNoteSuggestedSelections {
  const chips = details?.chips?.chips ?? []
  const preset = details?.preset

  const chipsByGroup = {
    symptoms: chips.filter((chip) => chip.group === 'symptoms').map((chip) => chip.chip_text),
    relevant_negatives: chips
      .filter((chip) => chip.group === 'relevant_negatives')
      .map((chip) => chip.chip_text),
    plan_phrases: chips.filter((chip) => chip.group === 'plan_phrases').map((chip) => chip.chip_text),
  }

  return {
    symptoms: mapPresetValuesToChips(chipsByGroup.symptoms, preset?.prechecked_symptoms),
    relevantNegatives: mapPresetValuesToChips(
      chipsByGroup.relevant_negatives,
      preset?.prechecked_relevant_negatives,
    ),
    planPhrases: mapPresetValuesToChips(chipsByGroup.plan_phrases, preset?.prechecked_plan_phrases),
  }
}

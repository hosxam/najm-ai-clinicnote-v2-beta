type WorkflowWithId = {
  workflowId: string
}

type HomeWorkflowSelectionInput<T extends WorkflowWithId> = {
  hasActiveFilter: boolean
  matchingWorkflows: T[]
  commonWorkflows: T[]
  recentWorkflows: T[]
}

export function selectHomeModeWorkflow<T extends WorkflowWithId>({
  hasActiveFilter,
  matchingWorkflows,
  commonWorkflows,
  recentWorkflows,
}: HomeWorkflowSelectionInput<T>) {
  if (hasActiveFilter) return matchingWorkflows[0] ?? null
  return commonWorkflows[0] ?? recentWorkflows[0] ?? null
}


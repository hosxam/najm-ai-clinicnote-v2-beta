const STORAGE_PREFIX = 'najm-clinicnote-v2'
const RECENT_WORKFLOWS_KEY = `${STORAGE_PREFIX}:recent-workflows`

function storageKey(key: string) {
  return `${STORAGE_PREFIX}:${key}`
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadLocalDraft<T>(key: string): T | null {
  if (!canUseStorage()) return null

  try {
    const raw = window.localStorage.getItem(storageKey(key))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveLocalDraft<T>(key: string, value: T) {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

export function clearLocalDraft(key: string) {
  if (!canUseStorage()) return
  window.localStorage.removeItem(storageKey(key))
}

export function pushRecentWorkflow(workflowId: string) {
  if (!canUseStorage() || !workflowId) return

  try {
    const current = getRecentWorkflowIds()
    const next = [workflowId, ...current.filter((item) => item !== workflowId)].slice(0, 8)
    window.localStorage.setItem(RECENT_WORKFLOWS_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures.
  }
}

export function getRecentWorkflowIds() {
  if (!canUseStorage()) return [] as string[]

  try {
    const raw = window.localStorage.getItem(RECENT_WORKFLOWS_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

export function clearRecentWorkflows() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(RECENT_WORKFLOWS_KEY)
}

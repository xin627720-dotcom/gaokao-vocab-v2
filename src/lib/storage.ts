import type { AttemptLog, UserSenseState } from '@/types/vocab'

const ATTEMPT_LOGS_KEY = 'gaokao_v2_attempt_logs'
const USER_SENSE_STATES_KEY = 'gaokao_v2_user_sense_states'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function loadAttemptLogs(): AttemptLog[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(ATTEMPT_LOGS_KEY)
    return raw ? (JSON.parse(raw) as AttemptLog[]) : []
  } catch {
    return []
  }
}

export function saveAttemptLogs(logs: AttemptLog[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(ATTEMPT_LOGS_KEY, JSON.stringify(logs))
  } catch {
    // storage full or blocked
  }
}

export function appendAttemptLog(log: AttemptLog): void {
  const logs = loadAttemptLogs()
  logs.push(log)
  saveAttemptLogs(logs)
}

export function loadUserSenseStates(): UserSenseState[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(USER_SENSE_STATES_KEY)
    return raw ? (JSON.parse(raw) as UserSenseState[]) : []
  } catch {
    return []
  }
}

export function saveUserSenseStates(states: UserSenseState[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(USER_SENSE_STATES_KEY, JSON.stringify(states))
  } catch {
    // storage full or blocked
  }
}

export function resetLocalProgress(): void {
  if (!isBrowser()) return
  localStorage.removeItem(ATTEMPT_LOGS_KEY)
  localStorage.removeItem(USER_SENSE_STATES_KEY)
}

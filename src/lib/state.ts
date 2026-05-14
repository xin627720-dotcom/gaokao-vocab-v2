import type { AttemptLog, UserSenseState } from '@/types/vocab'
import { senses } from '@/data/seed'
import {
  loadUserSenseStates,
  saveUserSenseStates,
  appendAttemptLog,
} from '@/lib/storage'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function rollingAvg(current: number, count: number, next: number): number {
  return (current * count + next) / (count + 1)
}

export function initUserSenseStates(): UserSenseState[] {
  const existing = loadUserSenseStates()
  if (existing.length > 0) {
    const existingIds = new Set(existing.map((s) => s.senseId))
    const missing = senses
      .filter((s) => !existingIds.has(s.id))
      .map(
        (s): UserSenseState => ({
          senseId: s.id,
          status: 'new',
          dueAt: new Date().toISOString(),
          correctCount: 0,
          wrongCount: 0,
          fuzzyCount: 0,
          avgConfidence: 0,
        })
      )
    if (missing.length > 0) {
      const updated = [...existing, ...missing]
      saveUserSenseStates(updated)
      return updated
    }
    return existing
  }

  const initial: UserSenseState[] = senses.map((s) => ({
    senseId: s.id,
    status: 'new',
    dueAt: new Date().toISOString(),
    correctCount: 0,
    wrongCount: 0,
    fuzzyCount: 0,
    avgConfidence: 0,
  }))
  saveUserSenseStates(initial)
  return initial
}

export function recordAttempt(
  log: Omit<AttemptLog, 'id' | 'createdAt'>
): UserSenseState {
  const full: AttemptLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  appendAttemptLog(full)

  const states = loadUserSenseStates()
  const idx = states.findIndex((s) => s.senseId === log.senseId)
  if (idx === -1) {
    const newState: UserSenseState = {
      senseId: log.senseId,
      status: 'new',
      dueAt: new Date().toISOString(),
      correctCount: 0,
      wrongCount: 0,
      fuzzyCount: 0,
      avgConfidence: 0,
    }
    states.push(newState)
  }

  const state = states[idx === -1 ? states.length - 1 : idx]
  const totalAttempts =
    state.correctCount + state.wrongCount + state.fuzzyCount

  state.lastSeenAt = new Date().toISOString()
  state.avgConfidence = rollingAvg(
    state.avgConfidence,
    totalAttempts,
    log.confidence
  )

  if (!log.correct && log.confidence <= 1) {
    state.status = 'wrong'
    state.wrongCount += 1
    state.dueAt = daysFromNow(1)
  } else if (!log.correct && log.confidence === 2) {
    state.status = 'fuzzy'
    state.fuzzyCount += 1
    state.dueAt = daysFromNow(1)
  } else if (log.correct) {
    state.correctCount += 1
    if (state.correctCount >= 3) {
      state.status = 'stable'
      state.dueAt = daysFromNow(7)
    } else if (state.correctCount >= 1) {
      state.status = state.status === 'stable' ? 'stable' : 'known'
      state.dueAt = daysFromNow(3)
    } else {
      state.status = 'learning'
      state.dueAt = daysFromNow(3)
    }
  }

  saveUserSenseStates(states)
  return state
}

export function getUserSenseState(senseId: string): UserSenseState | undefined {
  return loadUserSenseStates().find((s) => s.senseId === senseId)
}

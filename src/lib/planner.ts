import type { AttemptLog, UserSenseState, DailyPlan } from '@/types/vocab'
import { senses, confusionSets } from '@/data/seed'

const MAX_NEW_DEFAULT = 7
const MAX_NEW_REDUCED = 4

function recentErrorRate(logs: AttemptLog[]): number {
  const recent = logs.slice(-10)
  if (recent.length === 0) return 0
  return recent.filter((l) => !l.correct).length / recent.length
}

export function buildDailyPlan(
  states: UserSenseState[],
  logs: AttemptLog[],
  now: Date = new Date()
): DailyPlan {
  const stateMap = new Map(states.map((s) => [s.senseId, s]))
  const nowIso = now.toISOString()

  // Review: due and not new
  const dueStates = states.filter(
    (s) => s.status !== 'new' && s.dueAt <= nowIso
  )
  dueStates.sort((a, b) => b.wrongCount - a.wrongCount)
  const reviewSenseIds = dueStates.map((s) => s.senseId)

  // New
  const errorRate = recentErrorRate(logs)
  const maxNew = errorRate > 0.4 ? MAX_NEW_REDUCED : MAX_NEW_DEFAULT
  const newSenses = senses.filter((s) => {
    const st = stateMap.get(s.id)
    return !st || st.status === 'new'
  })
  newSenses.sort((a, b) => b.examPriority - a.examPriority)
  const newSenseIds = newSenses.slice(0, maxNew).map((s) => s.id)

  // Sentence: learning / fuzzy / wrong
  const sentenceStates = states.filter(
    (s) => s.status === 'learning' || s.status === 'fuzzy' || s.status === 'wrong'
  )
  sentenceStates.sort((a, b) => b.wrongCount + b.fuzzyCount - (a.wrongCount + a.fuzzyCount))
  const sentenceSenseIds = sentenceStates.slice(0, 8).map((s) => s.senseId)

  // Confusion sets: prefer sets with wrong/fuzzy senses
  const badIds = new Set(
    states
      .filter((s) => s.status === 'wrong' || s.status === 'fuzzy')
      .map((s) => s.senseId)
  )
  const scoredSets = confusionSets.map((cs) => ({
    id: cs.id,
    score: cs.senseIds.filter((sid) => badIds.has(sid)).length,
  }))
  scoredSets.sort((a, b) => b.score - a.score)
  const confusionSetIds = scoredSets.slice(0, 3).map((s) => s.id)

  // Rationale
  let rationale = `今日安排：${newSenseIds.length} 个新义项`
  if (reviewSenseIds.length > 0) {
    rationale += `，${reviewSenseIds.length} 个到期复习`
  }
  if (sentenceSenseIds.length > 0) {
    rationale += `，${sentenceSenseIds.length} 个句中识义练习`
  }
  if (errorRate > 0.4) {
    rationale += '。近期错误率较高，新词已适当减少。'
  } else {
    rationale += '。'
  }
  if (badIds.size > 0) {
    rationale += `有 ${badIds.size} 个义项处于模糊或错误状态，建议优先完成易混词练习。`
  }

  return {
    date: now.toISOString().split('T')[0],
    newSenseIds,
    reviewSenseIds,
    sentenceSenseIds,
    confusionSetIds,
    rationale,
  }
}

export function estimateMinutes(plan: DailyPlan): number {
  return Math.round(
    (plan.newSenseIds.length * 40 +
      plan.reviewSenseIds.length * 20 +
      plan.sentenceSenseIds.length * 35 +
      plan.confusionSetIds.length * 60) /
      60
  )
}

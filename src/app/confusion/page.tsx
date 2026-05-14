'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import OptionButton from '@/components/OptionButton'
import FeedbackPanel from '@/components/FeedbackPanel'
import { initUserSenseStates, recordAttempt } from '@/lib/state'
import { loadAttemptLogs } from '@/lib/storage'
import { buildDailyPlan } from '@/lib/planner'
import { getSenseById, getLemmaForSense, getExampleForSense } from '@/lib/quiz'
import { confusionSets } from '@/data/seed'
import type { ConfusionSet, Sense, AttemptLog } from '@/types/vocab'

type QuizOption = {
  sense: Sense
  isCorrect: boolean
}

type ConfusionQuestion = {
  set: ConfusionSet
  quizSenseId: string
  options: QuizOption[]
}

function buildQuestion(set: ConfusionSet): ConfusionQuestion | null {
  const senses = set.senseIds
    .map((id) => getSenseById(id))
    .filter((s): s is Sense => s !== undefined)

  if (senses.length < 2) return null

  const correct = senses[Math.floor(Math.random() * senses.length)]
  const options: QuizOption[] = senses.map((s) => ({
    sense: s,
    isCorrect: s.id === correct.id,
  }))

  return {
    set,
    quizSenseId: correct.id,
    options: options.sort(() => Math.random() - 0.5),
  }
}

export default function ConfusionPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [question, setQuestion] = useState<ConfusionQuestion | null>(null)
  const [answer, setAnswer] = useState<{ selectedId: string; correct: boolean } | null>(null)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    initUserSenseStates()
    const logs = loadAttemptLogs()
    const states = JSON.parse(
      typeof window !== 'undefined'
        ? localStorage.getItem('gaokao_v2_user_sense_states') ?? '[]'
        : '[]'
    )
    const plan = buildDailyPlan(states, logs)
    setQueue(plan.confusionSetIds)
  }, [])

  useEffect(() => {
    if (queue.length === 0) return
    if (currentIdx >= queue.length) {
      setDone(true)
      return
    }
    loadQuestion(queue[currentIdx])
  }, [queue, currentIdx])

  function loadQuestion(setId: string) {
    const set = confusionSets.find((cs) => cs.id === setId)
    if (!set) return
    const q = buildQuestion(set)
    if (!q) return
    setQuestion(q)
    setAnswer(null)
    startTimeRef.current = Date.now()
  }

  function handleSelect(sense: Sense, isCorrect: boolean) {
    if (answer || !question) return
    const latencyMs = Date.now() - startTimeRef.current
    setAnswer({ selectedId: sense.id, correct: isCorrect })

    const errorType: AttemptLog['errorType'] = !isCorrect ? 'confusion_pair' : 'none'

    // Record attempt for selected sense
    recordAttempt({
      senseId: question.quizSenseId,
      mode: 'confusion',
      correct: isCorrect,
      latencyMs,
      confidence: isCorrect ? 3 : 1,
      errorType,
    })
  }

  function handleNext() {
    setCurrentIdx((i) => i + 1)
  }

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="易混词练习" backHref="/">
        <p className="text-center text-gray-400 mt-20">暂无易混词练习，继续学习后会解锁。</p>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="易混词练习" backHref="/">
        <div className="text-center mt-20 space-y-4">
          <div className="text-4xl">⚡</div>
          <p className="text-gray-700 font-semibold">易混词练习完成</p>
          <a href="/" className="inline-block mt-4 text-indigo-600 text-sm hover:underline">
            返回首页
          </a>
        </div>
      </AppShell>
    )
  }

  const correctSense = question ? getSenseById(question.quizSenseId) : undefined

  return (
    <AppShell title="易混词练习" backHref="/">
      {question && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">{question.set.title}</h2>
            <span className="text-xs text-gray-400">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          {/* Show all senses in the confusion set */}
          <div className="space-y-3">
            {question.set.senseIds.map((sid) => {
              const sense = getSenseById(sid)
              const lemma = getLemmaForSense(sid)
              const example = getExampleForSense(sid)
              if (!sense || !lemma) return null
              return (
                <div key={sid} className="rounded-xl border border-gray-200 bg-white p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{lemma.text}</span>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {sense.pos}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{sense.glossZh}</p>
                  {example && (
                    <p className="text-xs text-gray-400 italic">{example.textEn}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              <span className="font-medium">区别：</span>
              {question.set.distinction}
            </p>
          </div>

          {/* Quiz */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">根据上面的说明，选择正确义项：</p>
            {question.options.map(({ sense, isCorrect }) => {
              const lemma = getLemmaForSense(sense.id)
              let state: 'idle' | 'correct' | 'wrong' | 'disabled' = 'idle'
              if (answer) {
                if (sense.id === answer.selectedId) {
                  state = answer.correct ? 'correct' : 'wrong'
                } else if (isCorrect) {
                  state = 'correct'
                } else {
                  state = 'disabled'
                }
              }
              return (
                <OptionButton
                  key={sense.id}
                  label={`${lemma?.text ?? ''} — ${sense.pos} ${sense.glossZh}`}
                  state={state}
                  onClick={() => handleSelect(sense, isCorrect)}
                />
              )
            })}
          </div>

          {answer && correctSense && (
            <>
              <FeedbackPanel
                correct={answer.correct}
                correctGloss={`${correctSense.pos} ${correctSense.glossZh}`}
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                下一组 →
              </button>
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}

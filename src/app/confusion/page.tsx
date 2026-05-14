'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import OptionButton from '@/components/OptionButton'
import FeedbackPanel from '@/components/FeedbackPanel'
import SectionTitle from '@/components/SectionTitle'
import { initUserSenseStates, recordAttempt } from '@/lib/state'
import { loadAttemptLogs, loadUserSenseStates } from '@/lib/storage'
import { buildDailyPlan } from '@/lib/planner'
import { getSenseById, getLemmaForSense, getExampleForSense } from '@/lib/quiz'
import { confusionSets } from '@/data/seed'
import type { ConfusionSet, Sense, AttemptLog } from '@/types/vocab'

type QuizOption = { sense: Sense; isCorrect: boolean }
type ConfusionQuestion = { set: ConfusionSet; quizSenseId: string; options: QuizOption[] }

function buildQuestion(set: ConfusionSet): ConfusionQuestion | null {
  const senses = set.senseIds.map((id) => getSenseById(id)).filter((s): s is Sense => s !== undefined)
  if (senses.length < 2) return null
  const correct = senses[Math.floor(Math.random() * senses.length)]
  return {
    set,
    quizSenseId: correct.id,
    options: senses.map((s) => ({ sense: s, isCorrect: s.id === correct.id })).sort(() => Math.random() - 0.5),
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
    const states = loadUserSenseStates()
    const logs = loadAttemptLogs()
    const plan = buildDailyPlan(states, logs)
    setQueue(plan.confusionSetIds)
  }, [])

  useEffect(() => {
    if (queue.length === 0) return
    if (currentIdx >= queue.length) { setDone(true); return }
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
    recordAttempt({
      senseId: question.quizSenseId,
      mode: 'confusion',
      correct: isCorrect,
      latencyMs,
      confidence: isCorrect ? 3 : 1,
      errorType,
    })
  }

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="易混辨析" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">⚡</span>
          <p className="text-sm text-gray-500">暂无易混词练习</p>
          <p className="text-xs text-gray-400">继续学习后会解锁</p>
        </div>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="易混辨析" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">✓</span>
          <p className="text-sm font-semibold text-gray-700">易混词练习完成</p>
          <a href="/" className="mt-2 text-sm text-indigo-600 hover:underline">返回首页</a>
        </div>
      </AppShell>
    )
  }

  const correctSense = question ? getSenseById(question.quizSenseId) : undefined

  return (
    <AppShell title="易混辨析" backHref="/">
      {question && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all"
                style={{ width: `${(currentIdx / queue.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          <SectionTitle>词义对比</SectionTitle>

          {/* Confusion word cards */}
          <div className="space-y-2">
            {question.set.senseIds.map((sid) => {
              const sense = getSenseById(sid)
              const lemma = getLemmaForSense(sid)
              const example = getExampleForSense(sid)
              if (!sense || !lemma) return null
              return (
                <div key={sid} className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-gray-900">{lemma.text}</span>
                    <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {sense.pos}
                    </span>
                    {sense.isFamiliarNewMeaning && (
                      <span className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        熟词生义
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">{sense.glossZh}</p>
                  {example && (
                    <p className="text-xs text-gray-400 italic leading-relaxed">{example.textEn}</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Distinction rule */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">辨析规则</p>
            <p className="text-sm text-amber-900 leading-relaxed">{question.set.distinction}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          <SectionTitle>练一练</SectionTitle>

          {/* Quiz options */}
          <div className="space-y-2">
            {question.options.map(({ sense, isCorrect }, i) => {
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
                  index={i}
                  label={`${lemma?.text ?? ''} — ${sense.pos} ${sense.glossZh}`}
                  state={state}
                  onClick={() => handleSelect(sense, isCorrect)}
                />
              )
            })}
          </div>

          {/* Feedback */}
          {answer && correctSense && (
            <>
              <FeedbackPanel
                correct={answer.correct}
                correctGloss={`${correctSense.pos}  ${correctSense.glossZh}`}
              />
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="w-full bg-indigo-600 text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                {currentIdx + 1 < queue.length ? '下一组' : '完成'}
              </button>
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}

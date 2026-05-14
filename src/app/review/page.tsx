'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import WordHeader from '@/components/WordHeader'
import ExampleCard from '@/components/ExampleCard'
import StateBadge from '@/components/StateBadge'
import { initUserSenseStates, recordAttempt, getUserSenseState } from '@/lib/state'
import { loadAttemptLogs } from '@/lib/storage'
import { buildDailyPlan } from '@/lib/planner'
import { getExampleForSense, getLemmaForSense, getSenseById } from '@/lib/quiz'
import { speakSentence, cancelSpeech } from '@/lib/speech'
import { useAudioLifecycle } from '@/lib/useAudioLifecycle'
import type { Sense, ExampleSentence, Lemma, AttemptLog } from '@/types/vocab'

type Card = {
  sense: Sense
  example: ExampleSentence | undefined
  lemma: Lemma | undefined
}

type Choice = 'known' | 'fuzzy' | 'unknown'

const CHOICES: { id: Choice; label: string; sub: string; className: string }[] = [
  {
    id: 'known',
    label: '认识',
    sub: '清楚记得这个义项',
    className: 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
  },
  {
    id: 'fuzzy',
    label: '模糊',
    sub: '有印象但说不准',
    className: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
  },
  {
    id: 'unknown',
    label: '不认识',
    sub: '完全不记得了',
    className: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
  },
]

export default function ReviewPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [card, setCard] = useState<Card | null>(null)
  const [answered, setAnswered] = useState(false)
  const [choiceMade, setChoiceMade] = useState<Choice | null>(null)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  useAudioLifecycle()

  useEffect(() => {
    const states = initUserSenseStates()
    const logs = loadAttemptLogs()
    const plan = buildDailyPlan(states, logs)
    setQueue(plan.reviewSenseIds)
  }, [])

  useEffect(() => {
    if (queue.length === 0) return
    if (currentIdx >= queue.length) {
      setDone(true)
      cancelSpeech()
      return
    }
    loadCard(queue[currentIdx])
  }, [queue, currentIdx])

  function loadCard(senseId: string) {
    cancelSpeech()
    const sense = getSenseById(senseId)
    if (!sense) return
    const example = getExampleForSense(senseId)
    const lemma = getLemmaForSense(senseId)
    setCard({ sense, example, lemma })
    setAnswered(false)
    setChoiceMade(null)
    startTimeRef.current = Date.now()
    if (example) speakSentence(example.textEn)
  }

  function handleChoice(choice: Choice) {
    if (answered || !card) return
    setAnswered(true)
    setChoiceMade(choice)
    const latencyMs = Date.now() - startTimeRef.current

    let correct: boolean
    let confidence: AttemptLog['confidence']
    let errorType: AttemptLog['errorType']
    if (choice === 'known') {
      correct = true; confidence = 4; errorType = 'none'
    } else if (choice === 'fuzzy') {
      correct = false; confidence = 2; errorType = 'none'
    } else {
      correct = false; confidence = 1; errorType = 'unknown_form'
    }
    recordAttempt({ senseId: card.sense.id, mode: 'review_card', correct, latencyMs, confidence, errorType })
  }

  function handleNext() {
    cancelSpeech()
    setCurrentIdx((i) => i + 1)
  }

  const senseState = card ? getUserSenseState(card.sense.id) : undefined

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="状态校准" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">✓</span>
          <p className="text-sm text-gray-500">暂无到期复习</p>
          <p className="text-xs text-gray-400">今日已完成或尚未解锁</p>
        </div>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="状态校准" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">✓</span>
          <p className="text-sm font-semibold text-gray-700">今日复习完成</p>
          <a href="/" className="mt-2 text-sm text-indigo-600 hover:underline">返回首页</a>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="状态校准" backHref="/">
      {card && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${(currentIdx / queue.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          {/* Word card */}
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <WordHeader
                text={card.lemma?.text ?? ''}
                phonetic={card.lemma?.phonetic}
                pos={card.sense.pos}
              />
              {senseState && <StateBadge status={senseState.status} size="md" />}
            </div>

            <div className="rounded-xl bg-gray-50 px-3 py-2.5 mt-1">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">中文义项</p>
              <p className="text-base font-semibold text-gray-800">
                {card.sense.pos} {card.sense.glossZh}
              </p>
            </div>
          </div>

          {/* Example */}
          {card.example && (
            <ExampleCard textEn={card.example.textEn} />
          )}

          {/* Self-assessment */}
          {!answered ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 px-1">你对这个义项的掌握程度？</p>
              {CHOICES.map(({ id, label, sub, className }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleChoice(id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all active:scale-[0.98] ${className}`}
                >
                  <span>{label}</span>
                  <span className="text-xs font-normal opacity-70">{sub}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                choiceMade === 'known'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : choiceMade === 'fuzzy'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                已记录：{choiceMade === 'known' ? '认识' : choiceMade === 'fuzzy' ? '模糊' : '不认识'}
              </div>
              {card.example && (
                <ExampleCard
                  textEn={card.example.textEn}
                  textZh={card.example.textZh}
                  clueText={card.example.clueText}
                  compact
                />
              )}
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                {currentIdx + 1 < queue.length ? '下一张' : '完成'}
              </button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}

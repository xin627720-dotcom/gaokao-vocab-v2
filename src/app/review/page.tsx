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
import type { Sense, ExampleSentence, Lemma, AttemptLog } from '@/types/vocab'

type Card = {
  sense: Sense
  example: ExampleSentence | undefined
  lemma: Lemma | undefined
}

export default function ReviewPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [card, setCard] = useState<Card | null>(null)
  const [answered, setAnswered] = useState(false)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

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
    const sense = getSenseById(senseId)
    if (!sense) return
    const example = getExampleForSense(senseId)
    const lemma = getLemmaForSense(senseId)
    setCard({ sense, example, lemma })
    setAnswered(false)
    startTimeRef.current = Date.now()
    if (example) {
      speakSentence(example.textEn)
    }
  }

  function handleChoice(choice: 'known' | 'fuzzy' | 'unknown') {
    if (answered || !card) return
    setAnswered(true)
    const latencyMs = Date.now() - startTimeRef.current

    let correct: boolean
    let confidence: AttemptLog['confidence']
    let errorType: AttemptLog['errorType']

    if (choice === 'known') {
      correct = true
      confidence = 4
      errorType = 'none'
    } else if (choice === 'fuzzy') {
      correct = false
      confidence = 2
      errorType = 'none'
    } else {
      correct = false
      confidence = 1
      errorType = 'unknown_form'
    }

    recordAttempt({
      senseId: card.sense.id,
      mode: 'review_card',
      correct,
      latencyMs,
      confidence,
      errorType,
    })
  }

  function handleNext() {
    cancelSpeech()
    setCurrentIdx((i) => i + 1)
  }

  const senseState = card ? getUserSenseState(card.sense.id) : undefined

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="测验卡片" backHref="/">
        <p className="text-center text-gray-400 mt-20">暂无到期复习，今日已完成。</p>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="测验卡片" backHref="/">
        <div className="text-center mt-20 space-y-4">
          <div className="text-4xl">🎯</div>
          <p className="text-gray-700 font-semibold">今日复习完成</p>
          <a href="/" className="inline-block mt-4 text-indigo-600 text-sm hover:underline">
            返回首页
          </a>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="测验卡片" backHref="/">
      {card && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <WordHeader
              text={card.lemma?.text ?? ''}
              phonetic={card.lemma?.phonetic}
              pos={card.sense.pos}
            />
            <div className="flex items-center gap-2">
              {senseState && <StateBadge status={senseState.status} />}
              <span className="text-xs text-gray-400">
                {currentIdx + 1} / {queue.length}
              </span>
            </div>
          </div>

          {card.example && (
            <ExampleCard textEn={card.example.textEn} />
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500 mb-1">中文义项</p>
            <p className="text-base font-semibold text-gray-800">
              {card.sense.pos} {card.sense.glossZh}
            </p>
          </div>

          {!answered ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">你对这个义项的掌握程度？</p>
              <button
                type="button"
                onClick={() => handleChoice('known')}
                className="w-full text-left px-4 py-3 rounded-xl border border-green-300 bg-green-50 text-green-800 text-sm font-medium hover:bg-green-100 transition-colors"
              >
                ✓ 认识
              </button>
              <button
                type="button"
                onClick={() => handleChoice('fuzzy')}
                className="w-full text-left px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm font-medium hover:bg-yellow-100 transition-colors"
              >
                ~ 模糊
              </button>
              <button
                type="button"
                onClick={() => handleChoice('unknown')}
                className="w-full text-left px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                ✗ 不认识
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {card.example && (
                <ExampleCard
                  textEn={card.example.textEn}
                  textZh={card.example.textZh}
                  clueText={card.example.clueText}
                />
              )}
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                下一张 →
              </button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}

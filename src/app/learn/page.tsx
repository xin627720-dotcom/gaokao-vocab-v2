'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import WordHeader from '@/components/WordHeader'
import ExampleCard from '@/components/ExampleCard'
import OptionButton from '@/components/OptionButton'
import FeedbackPanel from '@/components/FeedbackPanel'
import { initUserSenseStates, recordAttempt } from '@/lib/state'
import { loadAttemptLogs } from '@/lib/storage'
import { buildDailyPlan } from '@/lib/planner'
import { getOptionsForSense, getExampleForSense, getLemmaForSense, getSenseById } from '@/lib/quiz'
import { speakSentence, cancelSpeech } from '@/lib/speech'
import { useAudioLifecycle } from '@/lib/useAudioLifecycle'
import type { Sense, ExampleSentence, Lemma, AttemptLog } from '@/types/vocab'

type Question = {
  sense: Sense
  example: ExampleSentence | undefined
  lemma: Lemma | undefined
  options: { sense: Sense; isCorrect: boolean }[]
}

type AnswerState = {
  selectedId: string
  correct: boolean
}

export default function LearnPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<AnswerState | null>(null)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  useAudioLifecycle()

  useEffect(() => {
    const states = initUserSenseStates()
    const logs = loadAttemptLogs()
    const plan = buildDailyPlan(states, logs)
    setQueue(plan.newSenseIds)
  }, [])

  useEffect(() => {
    if (queue.length === 0) return
    if (currentIdx >= queue.length) {
      setDone(true)
      cancelSpeech()
      return
    }
    loadQuestion(queue[currentIdx])
  }, [queue, currentIdx])

  function loadQuestion(senseId: string) {
    cancelSpeech()
    const sense = getSenseById(senseId)
    if (!sense) return
    const example = getExampleForSense(senseId)
    const lemma = getLemmaForSense(senseId)
    const options = getOptionsForSense(senseId)
    setQuestion({ sense, example, lemma, options })
    setAnswer(null)
    startTimeRef.current = Date.now()
    if (example) speakSentence(example.textEn)
  }

  function handleSelect(selectedSense: Sense, isCorrect: boolean) {
    if (answer) return
    const latencyMs = Date.now() - startTimeRef.current
    setAnswer({ selectedId: selectedSense.id, correct: isCorrect })
    const errorType: AttemptLog['errorType'] = !isCorrect
      ? question?.sense.isFamiliarNewMeaning ? 'familiar_new_meaning' : 'unknown_form'
      : 'none'
    recordAttempt({
      senseId: question!.sense.id,
      mode: 'new_intro',
      correct: isCorrect,
      latencyMs,
      confidence: isCorrect ? 4 : 1,
      errorType,
    })
  }

  function handleNext() {
    cancelSpeech()
    setCurrentIdx((i) => i + 1)
  }

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="新词学习" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">📭</span>
          <p className="text-sm text-gray-500">暂无新义项</p>
          <p className="text-xs text-gray-400">完成复习后会安排新词</p>
        </div>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="新词学习" backHref="/">
        <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
          <span className="text-3xl">✓</span>
          <p className="text-sm font-semibold text-gray-700">今日新词已学完</p>
          <a href="/" className="mt-2 text-sm text-indigo-600 hover:underline">返回首页</a>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="新词学习" backHref="/">
      {question && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${((currentIdx) / queue.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          {/* Word */}
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <WordHeader
              text={question.lemma?.text ?? ''}
              phonetic={question.lemma?.phonetic}
              pos={question.sense.pos}
            />
            {question.sense.isFamiliarNewMeaning && (
              <span className="inline-block mt-2 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                熟词生义
              </span>
            )}
          </div>

          {/* Example */}
          {question.example && (
            <ExampleCard textEn={question.example.textEn} />
          )}

          {/* Options */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400 px-1">这个词在句中是哪个义项？</p>
            {question.options.map(({ sense, isCorrect }, i) => {
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
                  label={`${sense.pos}  ${sense.glossZh}`}
                  state={state}
                  onClick={() => handleSelect(sense, isCorrect)}
                />
              )
            })}
          </div>

          {/* Feedback */}
          {answer && (
            <>
              <FeedbackPanel
                correct={answer.correct}
                correctGloss={`${question.sense.pos}  ${question.sense.glossZh}`}
                textZh={question.example?.textZh}
                clueText={question.example?.clueText}
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                {currentIdx + 1 < queue.length ? '下一个' : '完成'}
              </button>
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}

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
  startTime: number
}

export default function LearnPage() {
  const [queue, setQueue] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<AnswerState | null>(null)
  const [done, setDone] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

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
    const sense = getSenseById(senseId)
    if (!sense) return
    const example = getExampleForSense(senseId)
    const lemma = getLemmaForSense(senseId)
    const options = getOptionsForSense(senseId)
    setQuestion({ sense, example, lemma, options })
    setAnswer(null)
    startTimeRef.current = Date.now()

    if (example) {
      speakSentence(example.textEn)
    }
  }

  function handleSelect(selectedSense: Sense, isCorrect: boolean) {
    if (answer) return
    const latencyMs = Date.now() - startTimeRef.current
    const correct = isCorrect

    setAnswer({
      selectedId: selectedSense.id,
      correct,
      startTime: startTimeRef.current,
    })

    const errorType: AttemptLog['errorType'] = !correct
      ? question?.sense.isFamiliarNewMeaning
        ? 'familiar_new_meaning'
        : 'unknown_form'
      : 'none'

    recordAttempt({
      senseId: question!.sense.id,
      mode: 'new_intro',
      correct,
      latencyMs,
      confidence: correct ? 4 : 1,
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
        <p className="text-center text-gray-400 mt-20">暂无新义项，请先完成今日复习。</p>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="新词学习" backHref="/">
        <div className="text-center mt-20 space-y-4">
          <div className="text-4xl">🎉</div>
          <p className="text-gray-700 font-semibold">今日新词已学完</p>
          <a href="/" className="inline-block mt-4 text-indigo-600 text-sm hover:underline">
            返回首页
          </a>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="新词学习" backHref="/">
      {question && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <WordHeader
              text={question.lemma?.text ?? ''}
              phonetic={question.lemma?.phonetic}
              pos={question.sense.pos}
            />
            <span className="text-xs text-gray-400">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          {question.example && (
            <ExampleCard
              textEn={question.example.textEn}
            />
          )}

          <div className="space-y-2">
            <p className="text-xs text-gray-500">这个词在句子中是什么意思？</p>
            {question.options.map(({ sense, isCorrect }) => {
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
                  label={`${sense.pos} ${sense.glossZh}`}
                  state={state}
                  onClick={() => handleSelect(sense, isCorrect)}
                />
              )
            })}
          </div>

          {answer && (
            <>
              <FeedbackPanel
                correct={answer.correct}
                correctGloss={`${question.sense.pos} ${question.sense.glossZh}`}
                textZh={question.example?.textZh}
                clueText={question.example?.clueText}
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                下一个 →
              </button>
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/AppShell'
import ExampleCard from '@/components/ExampleCard'
import OptionButton from '@/components/OptionButton'
import FeedbackPanel from '@/components/FeedbackPanel'
import { initUserSenseStates, recordAttempt } from '@/lib/state'
import { loadAttemptLogs } from '@/lib/storage'
import { buildDailyPlan } from '@/lib/planner'
import {
  getOptionsForSense,
  getExampleForSense,
  getLemmaForSense,
  getSenseById,
  highlightTargetWord,
} from '@/lib/quiz'
import { speakSentence, cancelSpeech } from '@/lib/speech'
import type { Sense, ExampleSentence, Lemma, AttemptLog } from '@/types/vocab'

type Question = {
  sense: Sense
  example: ExampleSentence
  lemma: Lemma | undefined
  options: { sense: Sense; isCorrect: boolean }[]
  highlightedHtml: string
}

type AnswerState = {
  selectedId: string
  correct: boolean
}

export default function SentencePage() {
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
    // Filter to only senses that have examples
    const validIds = plan.sentenceSenseIds.filter(
      (id) => getExampleForSense(id) !== undefined
    )
    setQueue(validIds)
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
    if (!example) return
    const lemma = getLemmaForSense(senseId)
    const options = getOptionsForSense(senseId)
    const highlightedHtml = lemma
      ? highlightTargetWord(example.textEn, lemma.text)
      : example.textEn

    setQuestion({ sense, example, lemma, options, highlightedHtml })
    setAnswer(null)
    startTimeRef.current = Date.now()
    speakSentence(example.textEn)
  }

  function handleSelect(selectedSense: Sense, isCorrect: boolean) {
    if (answer || !question) return
    const latencyMs = Date.now() - startTimeRef.current
    setAnswer({ selectedId: selectedSense.id, correct: isCorrect })

    const errorType: AttemptLog['errorType'] = !isCorrect
      ? question.sense.isFamiliarNewMeaning
        ? 'familiar_new_meaning'
        : 'sentence_not_understood'
      : 'none'

    recordAttempt({
      senseId: question.sense.id,
      mode: 'sentence_sense',
      correct: isCorrect,
      latencyMs,
      confidence: isCorrect ? 3 : 2,
      errorType,
    })
  }

  function handleNext() {
    cancelSpeech()
    setCurrentIdx((i) => i + 1)
  }

  if (queue.length === 0 && !done) {
    return (
      <AppShell title="句中识义" backHref="/">
        <p className="text-center text-gray-400 mt-20">暂无句中识义练习，先完成新词学习吧。</p>
      </AppShell>
    )
  }

  if (done) {
    return (
      <AppShell title="句中识义" backHref="/">
        <div className="text-center mt-20 space-y-4">
          <div className="text-4xl">✅</div>
          <p className="text-gray-700 font-semibold">句中识义练习完成</p>
          <a href="/" className="inline-block mt-4 text-indigo-600 text-sm hover:underline">
            返回首页
          </a>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="句中识义" backHref="/">
      {question && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              划线词在句中是什么义项？
            </p>
            <span className="text-xs text-gray-400">
              {currentIdx + 1} / {queue.length}
            </span>
          </div>

          <ExampleCard
            textEn={question.example.textEn}
            highlightedHtml={question.highlightedHtml}
          />

          <div className="space-y-2">
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

          {answer && question && (
            <>
              <FeedbackPanel
                correct={answer.correct}
                correctGloss={`${question.sense.pos} ${question.sense.glossZh}`}
                textZh={question.example.textZh}
                clueText={question.example.clueText}
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                下一题 →
              </button>
            </>
          )}
        </div>
      )}
    </AppShell>
  )
}

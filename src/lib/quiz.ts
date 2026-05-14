import type { Sense, ExampleSentence, Lemma } from '@/types/vocab'
import { senses, examples, lemmas } from '@/data/seed'

export function getLemmaForSense(senseId: string): Lemma | undefined {
  const sense = senses.find((s) => s.id === senseId)
  if (!sense) return undefined
  return lemmas.find((l) => l.id === sense.lemmaId)
}

export function getSenseById(senseId: string): Sense | undefined {
  return senses.find((s) => s.id === senseId)
}

export function getExampleForSense(senseId: string): ExampleSentence | undefined {
  const pool = examples.filter((e) => e.senseId === senseId)
  if (pool.length === 0) return undefined
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getOptionsForSense(
  senseId: string,
  count = 4
): { sense: Sense; isCorrect: boolean }[] {
  const correct = senses.find((s) => s.id === senseId)
  if (!correct) return []

  const distractors = senses
    .filter((s) => s.id !== senseId)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1)

  const options = [
    { sense: correct, isCorrect: true },
    ...distractors.map((s) => ({ sense: s, isCorrect: false })),
  ]

  return options.sort(() => Math.random() - 0.5)
}

export function highlightTargetWord(
  sentence: string,
  lemmaText: string
): string {
  if (!lemmaText) return sentence
  const escaped = lemmaText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b(${escaped}(?:s|ed|ing|d|er|est|ly)?)\\b`, 'gi')
  return sentence.replace(
    regex,
    (match) => `<mark class="bg-yellow-200 rounded px-0.5">${match}</mark>`
  )
}

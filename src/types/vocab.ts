export type Lemma = {
  id: string
  text: string
  phonetic?: string
  level: 'basic' | 'core' | 'extension'
}

export type Sense = {
  id: string
  lemmaId: string
  pos: string
  glossZh: string
  glossEn?: string
  isFamiliarNewMeaning: boolean
  examPriority: number
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
}

export type ExampleSentence = {
  id: string
  senseId: string
  textEn: string
  textZh: string
  clueText: string
  sourceType: 'editorial' | 'ai_generated'
}

export type ConfusionSet = {
  id: string
  title: string
  senseIds: string[]
  distinction: string
}

export type AttemptLog = {
  id: string
  senseId: string
  mode: 'new_intro' | 'sentence_sense' | 'review_card' | 'confusion'
  correct: boolean
  latencyMs: number
  confidence: 1 | 2 | 3 | 4
  errorType:
    | 'unknown_form'
    | 'familiar_new_meaning'
    | 'collocation'
    | 'pos_or_syntax'
    | 'confusion_pair'
    | 'sentence_not_understood'
    | 'careless'
    | 'none'
  createdAt: string
}

export type UserSenseState = {
  senseId: string
  status: 'new' | 'learning' | 'fuzzy' | 'known' | 'stable' | 'wrong'
  dueAt: string
  lastSeenAt?: string
  correctCount: number
  wrongCount: number
  fuzzyCount: number
  avgConfidence: number
}

export type DailyPlan = {
  date: string
  newSenseIds: string[]
  reviewSenseIds: string[]
  sentenceSenseIds: string[]
  confusionSetIds: string[]
  rationale: string
}

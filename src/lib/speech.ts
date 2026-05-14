let currentUtterance: SpeechSynthesisUtterance | null = null

function isSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakText(text: string): void {
  if (!isSupported()) return
  try {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'
    utt.rate = 0.9
    currentUtterance = utt
    window.speechSynthesis.speak(utt)
  } catch {
    // silently ignore
  }
}

export function cancelSpeech(): void {
  if (!isSupported()) return
  try {
    window.speechSynthesis.cancel()
    currentUtterance = null
  } catch {
    // silently ignore
  }
}

export function speakSentence(text: string): void {
  speakText(text)
}

export function speakWord(text: string): void {
  speakText(text)
}

export { currentUtterance }

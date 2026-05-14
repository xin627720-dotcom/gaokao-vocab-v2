'use client'

import { useEffect } from 'react'
import { cancelSpeech } from '@/lib/speech'

export function useAudioLifecycle() {
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) cancelSpeech()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      cancelSpeech()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

const LABELS = ['A', 'B', 'C', 'D', 'E']

type State = 'idle' | 'correct' | 'wrong' | 'disabled'

type Props = {
  label: string
  index?: number
  state?: State
  onClick?: () => void
}

const STATE_CLASS: Record<State, { wrapper: string; badge: string }> = {
  idle:     { wrapper: 'bg-white border-gray-200 text-gray-800 hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.98]', badge: 'bg-gray-100 text-gray-500' },
  correct:  { wrapper: 'bg-green-50 border-green-400 text-green-800', badge: 'bg-green-500 text-white' },
  wrong:    { wrapper: 'bg-red-50 border-red-400 text-red-700', badge: 'bg-red-500 text-white' },
  disabled: { wrapper: 'bg-gray-50 border-gray-150 text-gray-400 cursor-not-allowed', badge: 'bg-gray-200 text-gray-400' },
}

export default function OptionButton({ label, index = 0, state = 'idle', onClick }: Props) {
  const { wrapper, badge } = STATE_CLASS[state]
  const letter = LABELS[index] ?? String(index + 1)
  return (
    <button
      type="button"
      disabled={state === 'disabled' || state === 'correct' || state === 'wrong'}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all duration-100 ${wrapper}`}
    >
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${badge}`}>
        {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : letter}
      </span>
      <span className="text-left leading-snug">{label}</span>
    </button>
  )
}

type State = 'idle' | 'correct' | 'wrong' | 'disabled'

type Props = {
  label: string
  state?: State
  onClick?: () => void
}

const STATE_CLASS: Record<State, string> = {
  idle: 'bg-white border-gray-200 text-gray-800 hover:border-indigo-400 hover:bg-indigo-50',
  correct: 'bg-green-50 border-green-500 text-green-800',
  wrong: 'bg-red-50 border-red-400 text-red-700',
  disabled: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed',
}

export default function OptionButton({ label, state = 'idle', onClick }: Props) {
  return (
    <button
      type="button"
      disabled={state === 'disabled' || state === 'correct' || state === 'wrong'}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${STATE_CLASS[state]}`}
    >
      {label}
    </button>
  )
}

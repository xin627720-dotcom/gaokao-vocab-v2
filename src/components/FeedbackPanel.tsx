type Props = {
  correct: boolean
  correctGloss: string
  textZh?: string
  clueText?: string
}

export default function FeedbackPanel({ correct, correctGloss, textZh, clueText }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 space-y-2 ${
        correct
          ? 'bg-green-50 border-green-300'
          : 'bg-red-50 border-red-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{correct ? '✓' : '✗'}</span>
        <span className={`font-semibold text-sm ${correct ? 'text-green-800' : 'text-red-700'}`}>
          {correct ? '回答正确' : '回答错误'}
        </span>
      </div>
      <p className="text-sm text-gray-700">
        <span className="font-medium">正确义项：</span>
        {correctGloss}
      </p>
      {textZh && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">例句翻译：</span>
          {textZh}
        </p>
      )}
      {clueText && (
        <p className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1">
          💡 {clueText}
        </p>
      )}
    </div>
  )
}

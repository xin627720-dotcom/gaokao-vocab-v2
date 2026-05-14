type Props = {
  correct: boolean
  correctGloss: string
  textZh?: string
  clueText?: string
}

export default function FeedbackPanel({ correct, correctGloss, textZh, clueText }: Props) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${correct ? 'border-green-200' : 'border-red-200'}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white flex-shrink-0 ${correct ? 'bg-green-500' : 'bg-red-500'}`}>
          {correct ? '✓' : '✗'}
        </span>
        <span className={`font-semibold text-sm ${correct ? 'text-green-800' : 'text-red-700'}`}>
          {correct ? '回答正确' : '回答错误'}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-4 py-3 space-y-2.5">
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">正确义项</p>
          <p className="text-sm font-semibold text-gray-800">{correctGloss}</p>
        </div>

        {textZh && (
          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">例句译文</p>
            <p className="text-sm text-gray-600 leading-relaxed">{textZh}</p>
          </div>
        )}

        {clueText && (
          <div className="border-t border-gray-100 pt-2.5">
            <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-wide mb-1">判断线索</p>
            <p className="text-xs text-indigo-700 leading-relaxed">{clueText}</p>
          </div>
        )}
      </div>
    </div>
  )
}

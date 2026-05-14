type Props = {
  textEn: string
  textZh?: string
  clueText?: string
  highlightedHtml?: string
  compact?: boolean
}

export default function ExampleCard({ textEn, textZh, clueText, highlightedHtml, compact }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">例句</p>
        {highlightedHtml ? (
          <p
            className={`text-gray-800 leading-[1.75] ${compact ? 'text-[15px]' : 'text-[16px]'}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <p className={`text-gray-800 leading-[1.75] ${compact ? 'text-[15px]' : 'text-[16px]'}`}>
            {textEn}
          </p>
        )}
      </div>
      {(textZh || clueText) && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          {textZh && (
            <p className="text-sm text-gray-500 leading-relaxed">{textZh}</p>
          )}
          {clueText && (
            <div className="flex gap-2 pt-0.5">
              <span className="text-indigo-400 flex-shrink-0 text-xs mt-0.5">▸</span>
              <p className="text-xs text-indigo-700 leading-relaxed">{clueText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

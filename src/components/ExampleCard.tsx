type Props = {
  textEn: string
  textZh?: string
  clueText?: string
  highlightedHtml?: string
}

export default function ExampleCard({ textEn, textZh, clueText, highlightedHtml }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
      <p
        className="text-base text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={
          highlightedHtml ? { __html: highlightedHtml } : undefined
        }
      >
        {!highlightedHtml ? textEn : undefined}
      </p>
      {textZh && (
        <p className="text-sm text-gray-500">{textZh}</p>
      )}
      {clueText && (
        <p className="text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1">
          💡 {clueText}
        </p>
      )}
    </div>
  )
}

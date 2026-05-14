import SpeakerButton from '@/components/SpeakerButton'

type Props = {
  text: string
  phonetic?: string
  pos?: string
}

export default function WordHeader({ text, phonetic, pos }: Props) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-2xl font-bold text-gray-900">{text}</h2>
      {phonetic && (
        <span className="text-sm text-gray-500">{phonetic}</span>
      )}
      {pos && (
        <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
          {pos}
        </span>
      )}
      <SpeakerButton text={text} />
    </div>
  )
}
